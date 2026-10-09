import type { AbilityDataTable } from '../sim/dex-abilities';
import { skipPassiveComponent } from './passive-ability-cleanup';
import { predatorUltraMatch } from '../sim/predator';

/** Approved Mega splits: delegate original primitives, with recipient-specific deduplication. */
export function installMegaPassiveAbilities(abilities: AbilityDataTable) {
	const table = abilities as any;
	if (table.unleashedego.onBasePower === table.ultraego.onBasePower) delete table.unleashedego.onBasePower;
	// Approved removal is damage modifiers only; all combat state/healing callbacks remain.
	for (const id of ['ultraego', 'perfectego']) {
		delete table[id].onBasePower;
		delete table[id].onSourceModifyDamage;
	}
	const predatorPower = abilities.predator.onBasePower!;
	abilities.predator.onBasePower = function (power, source, target, move) {
		if (move.category !== 'Status' && predatorUltraMatch(this, source, target)) return this.chainModify(2);
		return predatorPower.call(this, power, source, target, move);
	};
	// Perfect Ego hand-codes Ultra Ego's reduction; other composites delegate the primitive.
	// Only this contribution is skipped, leaving other component defenses and after-hit effects intact.
	for (const id of ['ultraego', 'ultrainstinct', 'perfectego']) {
		const original = table[id].onSourceModifyDamage;
		if (typeof original !== 'function') continue;
		table[id].onSourceModifyDamage = function (
			this: Battle, damage: number, source: Pokemon, target: Pokemon, move: ActiveMove
		) {
			if (move.category !== 'Status' && predatorUltraMatch(this, source, target)) return;
			return original.call(this, damage, source, target, move);
		};
	}
	const primitives = ['shellarmor', 'shadowtag', 'aerilate', 'galewings', 'magicbounce', 'purepower',
		'moldbreaker', 'skilllink', 'sandstream', 'intimidate', 'pixilate', 'hugepower', 'prankster',
		'refrigerate', 'toughclaws', 'scrappy', 'adaptability', 'snowwarning', 'sharpness', 'invigorate', 'spicyspray'];
	for (const id of primitives) {
		for (const key of Object.keys(table[id])) {
			const original = table[id][key];
			if (!key.startsWith('on') || typeof original !== 'function') continue;
			table[id][key] = function (this: Battle, ...args: any[]) {
				if (skipPassiveComponent(this, this.effectState.target, id)) return;
				return original.apply(this, args);
			};
		}
	}
	// These newly extracted primitives have unrelated legacy exclusions. Deduplicate only
	// against an actual species passive, preserving every nonrecipient's delegated callback.
	for (const id of ['regenerator', 'shedskin', 'insomnia', 'selfsufficient', 'solarpower', 'stalwart',
		'armorize', 'duskilate', 'technician', 'venamskiss', 'contrary', 'strongjaw', 'elevate',
		'mirrorarmor', 'stakeout', 'unaware', 'soulpyre', 'noguard', 'auraguard', 'fairyaura', 'drizzle',
		'grassysurge', 'thermalexchange']) {
		for (const key of Object.keys(table[id])) {
			const original = table[id][key];
			if (!key.startsWith('on') || typeof original !== 'function') continue;
			table[id][key] = function (this: Battle, ...args: any[]) {
				if (this.effectState.speciesPassive !== id && this.effectState.target?.getPassives().includes(id)) return;
				return original.apply(this, args);
			};
		}
	}
	// These package callbacks hand-code the extracted primitive rather than delegating it.
	const manual: { [id: string]: [string, string[]] } = {
		mastercourse: ['contrary', ['onChangeBoost']],
		inversion: ['contrary', ['onChangeBoost']],
		ange: ['fairyaura', ['onAnyBasePower']],
		perfectego: ['noguard', ['onAnyAccuracy', 'onAnyInvulnerability']],
		auramaster: ['auraguard', ['onSourceModifyDamage']],
		predator: ['contrary', ['onChangeBoost']],
		argentdevotion: ['armorize', ['onBasePower', 'onImmunity']],
		execution: ['duskilate', ['onImmunity']],
		windchime: ['levitate', ['onImmunity']],
		surgeconduit: ['electricsurge', ['onStart']],
		railguncircuit: ['noguard', ['onAnyInvulnerability', 'onAnyAccuracy', 'onModifyMove']],
		slowclamp: ['shellarmor', ['onCriticalHit']],
		mirrorgreed: ['magicbounce', ['onTryHit']],
		lunarorbit: ['magicbounce', ['onTryHit', 'onAllyTryHitSide']],
		dreadmaw: ['hugepower', ['onModifyAtk']],
		cursedmarionette: ['prankster', ['onModifyPriority']],
		voidvoice: ['pixilate', ['onModifyType']],
		heavenlychorus: ['pixilate', ['onModifyType', 'onBasePower']],
		freezerburn: ['refrigerate', ['onModifyType']],
		uncheckedassault: ['scrappy', ['onModifyMove']],
	};
	for (const [id, [component, keys]] of Object.entries(manual)) {
		for (const key of keys) {
			const original = table[id][key];
			table[id][key] = function (this: Battle, ...args: any[]) {
				if (this.effectState.target.getPassives().includes(component)) return;
				return typeof original === 'function' ? original.apply(this, args) : original;
			};
		}
	}
	const tremorImmunity = abilities.tremor.onImmunity!;
	const phantomMove = abilities.phantomfist.onModifyMove!;
	abilities.phantomfist.onModifyMove = function (move, pokemon, target) {
		if (!pokemon.getPassives().includes('noguard')) return phantomMove.call(this, move, pokemon, target);
		return abilities.unseenfist.onModifyMove?.call(this, move, pokemon, target);
	};
	abilities.tremor.onImmunity = function (type, pokemon) {
		if (!pokemon.getPassives().includes('levitate')) return tremorImmunity.call(this, type, pokemon);
		return abilities.sandforce.onImmunity?.call(this, type, pokemon);
	};
	// The converted move now belongs to the passive; keep Execution's independent finisher.
	const executionPower = abilities.execution.onBasePower!;
	abilities.execution.onBasePower = function (power, source, target, move) {
		if (!source.getPassives().includes('duskilate')) return executionPower.call(this, power, source, target, move);
		if (target && target.hp > 0 && target.hp <= target.maxhp / 2) return this.chainModify(2);
	};
	const freezerPower = abilities.freezerburn.onBasePower!;
	abilities.freezerburn.onBasePower = function (power, source, target, move) {
		if (!source.getPassives().includes('refrigerate')) return freezerPower.call(this, power, source, target, move);
		return abilities.strongjaw.onBasePower?.call(this, power, source, target, move);
	};
	// Dual Wield computes its own non-stacking modifier; only the Sharpness factor moves.
	const sacredPower = abilities.sacrededge.onBasePower!;
	abilities.sacrededge.onBasePower = function (power, source, target, move) {
		if (!source.getPassives().includes('sharpness')) return sacredPower.call(this, power, source, target, move);
		return abilities.dualwield.onBasePower?.call(this, power, source, target, move);
	};
	// Keep the package's eight-turn weather enhancement; the passive alone supplies weather.
	const rainStart = abilities.rainsovereign.onStart!;
	abilities.rainsovereign.onStart = function (pokemon) {
		if (!pokemon.getPassives().includes('drizzle')) return rainStart.call(this, pokemon);
		if (this.field.isWeather('raindance')) this.field.weatherState.duration = 8;
	};
	const frostStart = abilities.frostsovereign.onStart!;
	abilities.frostsovereign.onStart = function (pokemon) {
		if (!pokemon.getPassives().includes('snowwarning')) return frostStart.call(this, pokemon);
		if (this.field.isWeather(['hail', 'snow'])) this.field.weatherState.duration = 8;
	};
	for (const [id, packageId, weather] of [
		['sandstream', 'sandsovereign', 'sandstorm'], ['snowwarning', 'frostsovereign', 'hail'],
		['drizzle', 'rainsovereign', 'raindance'],
	]) {
		const original = table[id].onStart;
		table[id].onStart = function (this: Battle, pokemon: Pokemon) {
			const result = original.call(this, pokemon);
			if (this.effectState.speciesPassive === id && pokemon.hasAbility(packageId) &&
				this.field.isWeather(weather === 'hail' ? ['hail', 'snow'] : weather)) this.field.weatherState.duration = 8;
			return result;
		};
	}
	// Restore full local components explicitly swapped into the selected package.
	const additions: [string, string, string, string[]][] = [
		['dreadmaw', 'hugepower', 'strongjaw', ['onBasePower']],
		['heavenlychorus', 'pixilate', 'naturalcure', ['onCheckShow', 'onSwitchOut', 'onResidual']],
		['doomwarning', 'magicbounce', 'anticipation', ['onStart']],
		['uncheckedassault', 'scrappy', 'limber', ['onUpdate', 'onSetStatus', 'onTryBoost', 'onModifySpe']],
	];
	for (const [id, passive, component, keys] of additions) {
		for (const key of keys) {
			const original = table[id][key], addition = table[component][key];
			if (typeof addition !== 'function') continue;
			table[id][key] = function (this: Battle, ...args: any[]) {
				const first = typeof original === 'function' ? original.apply(this, args) : undefined;
				if (!this.effectState.target.getPassives().includes(passive)) return first;
				const second = addition.apply(this, args);
				return second === undefined ? first : second;
			};
		}
	}
	// Frisk was previously excluded globally; its existing onStart now runs for Prankster holders.
	// Levitate is already in Freezer Burn; removal of the old passive makes its selected copy active.
}
