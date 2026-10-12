import type { AbilityDataTable } from '../sim/dex-abilities';
import { SignaturePassiveSelections } from './signature-passive-data';
import { skipPassiveComponent } from './passive-ability-cleanup';

export function installSignaturePassiveAbilities(abilities: AbilityDataTable) {
	for (const id of new Set(Object.values(SignaturePassiveSelections))) {
		const ability = abilities[id as keyof AbilityDataTable];
		for (const [event, callback] of Object.entries(ability)) {
			if (!event.startsWith('on') || typeof callback !== 'function') continue;
			// A selected/copied signature remains usable elsewhere, but its native passive owns its hooks.
			(ability as any)[event] = function (this: Battle, ...args: any[]) {
				const holder = this.effectState.target as Pokemon | undefined;
				if (!this.effectState.speciesPassive && holder?.getPassives().includes(id)) return;
				return callback.apply(this, args);
			};
		}
	}
	const curiousStart = abilities.curiousmedicine.onStart!;
	abilities.curiousmedicine.onStart = function (pokemon) {
		if (skipPassiveComponent(this, pokemon, 'curiousmedicine')) return;
		return curiousStart.call(this, pokemon);
	};
	// Full Liquid Voice belongs to native Mire Chorus; copied primitive selections cannot double it.
	const voiceType = abilities.liquidvoice.onModifyType!;
	abilities.liquidvoice.onModifyType = function (move, pokemon, target) {
		if (skipPassiveComponent(this, pokemon, 'liquidvoice')) return;
		return voiceType.call(this, move, pokemon, target);
	};
	const voicePower = abilities.liquidvoice.onBasePower!;
	abilities.liquidvoice.onBasePower = function (power, source, target, move) {
		if (skipPassiveComponent(this, source, 'liquidvoice')) return;
		return voicePower.call(this, power, source, target, move);
	};
}
