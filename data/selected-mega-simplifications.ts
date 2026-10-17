import type { AbilityDataTable } from '../sim/dex-abilities';
import { installCursedArmament } from './cursed-armament';

/** Only the individually selected component changes; no broad audit cuts. */
export function installSelectedMegaSimplifications(abilities: AbilityDataTable) {
	installCursedArmament(abilities);
	const table = abilities as any;
	// Compose existing primitives once, retaining package identity and suppression flags.
	const compose = (id: string, parts: string[]) => {
		const previous = table[id];
		const result: any = Object.fromEntries(Object.entries(previous).filter(([key]) => !key.startsWith('on')));
		const keys = new Set(parts.flatMap(part => Object.keys(table[part]).filter(key => key.startsWith('on'))));
		for (const key of keys) {
			const handlers = parts.map(part => table[part][key]).filter(value => value !== undefined);
			if (!handlers.some(value => typeof value === 'function')) {
				result[key] = handlers[0];
				continue;
			}
			result[key] = function (this: Battle, ...args: any[]) {
				let returned;
				for (const part of parts) {
					const handler = (this.dex.abilities.get(part) as any)[key];
					if (handler === undefined) continue;
					const value = typeof handler === 'function' ? handler.apply(this, args) : handler;
					if (value === false || value === null || value === 0) return value;
					if (value !== undefined) returned = value;
				}
				return returned;
			};
		}
		table[id] = result;
	};
	// Water Barrage owns Stalwart; dispatch that component exactly once.
	compose('siegelauncher', ['megalauncher', 'waterbarrage']);
	compose('neurotoxin', ['hydrabond', 'regenerator']);
	compose('surgeconduit', ['lightningrod', 'rockhead']);
	compose('railguncircuit', ['lightningrod', 'transistor']);
	// The explicit defensive cut also covers Transistor's local terrain mitigation.
	delete abilities.railguncircuit.onSourceModifyAtk;
	delete abilities.railguncircuit.onSourceModifySpA;
	compose('enlightenment', ['innerfocus', 'technician']);
	compose('stormfright', ['stormpower', 'lightningrod']);
	compose('apexcleave', ['dualwield', 'moxie']);
	compose('streettyrant', ['intimidate', 'moldbreaker']);
	compose('adaptivepower', ['magicguard', 'hugepower']);
	compose('phantomfist', ['unseenfist', 'aftermath', 'selfsufficient']);
	compose('toxicrenewal', ['adaptability', 'poisontouch']);
	compose('freezerburn', ['slushrush', 'levitate']);
	compose('solarhydra', ['hydrabond', 'grassysurge']);
	compose('royalsun', ['supremeoverlord', 'drought']);
	// Eternal Flower already supplies move-level Mold Breaker; only its entry is additional.
	compose('ange', ['eternalflower']);
	abilities.ange.onStart = abilities.moldbreaker.onStart;

	// A later installation used to restore Shield Dust to both evolution packages.
	delete abilities.spiralevolution.onModifySecondaries;
	// The later explicit selection also removes Parental Bond's Ghost-immunity bypass.
	delete abilities.parentalbond.onModifyMove;
	// Keep the already-approved confusion protection and Opportunist state machine.
	delete abilities.uncheckedassault.onBasePower;
	const uncheckedUpdate = abilities.uncheckedassault.onUpdate;
	const uncheckedStatus = abilities.uncheckedassault.onSetStatus;
	const uncheckedVolatile = abilities.uncheckedassault.onTryAddVolatile;
	abilities.uncheckedassault.onUpdate = function (pokemon) {
		uncheckedUpdate?.call(this, pokemon);
		this.dex.abilities.get('vitalspirit').onUpdate?.call(this, pokemon);
	};
	abilities.uncheckedassault.onSetStatus = function (status, target, source, effect) {
		const result = uncheckedStatus?.call(this, status, target, source, effect);
		if (result !== undefined) return result;
		return this.dex.abilities.get('vitalspirit').onSetStatus?.call(this, status, target, source, effect);
	};
	abilities.uncheckedassault.onTryAddVolatile = function (status, target, source, effect) {
		const result = uncheckedVolatile?.call(this, status, target, source, effect);
		if (result !== undefined) return result;
		return this.dex.abilities.get('vitalspirit').onTryAddVolatile?.call(this, status, target, source, effect);
	};
	abilities.uncheckedassault.onModifyAtkPriority = 5;
	abilities.uncheckedassault.onModifySpAPriority = 5;
	abilities.uncheckedassault.onModifyAtk = abilities.vitalspirit.onModifyAtk;
	abilities.uncheckedassault.onModifySpA = abilities.vitalspirit.onModifySpA;
	abilities.nighthunt.onStart = function (pokemon) {
		this.dex.abilities.get('intimidate').onStart?.call(this, pokemon);
		this.dex.abilities.get('illuminate').onStart?.call(this, pokemon);
	};
	abilities.nighthunt.onModifyMove = abilities.illuminate.onModifyMove;

}
