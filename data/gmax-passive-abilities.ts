import type { AbilityDataTable } from '../sim/dex-abilities';
import { GmaxPassiveSelections } from './gmax-passive-data';

/** Skip only an already-present species passive; shared nonrecipients retain their package. */
export function installGmaxPassiveAbilities(abilities: AbilityDataTable) {
	const table = abilities as any;
	for (const id of new Set(Object.values(GmaxPassiveSelections))) {
		for (const key of Object.keys(table[id])) {
			const callback = table[id][key];
			if (!key.startsWith('on') || typeof callback !== 'function') continue;
			table[id][key] = function (this: Battle, ...args: any[]) {
				if (this.effectState.speciesPassive !== id && this.effectState.target?.getPassives().includes(id)) return;
				return callback.apply(this, args);
			};
		}
	}
	const manual: Record<string, [string, string[]]> = {
		fluffyevo: ['overcoat', ['onImmunity', 'onTryHit']],
		astralwatcher: ['frisk', ['onStart']],
		sweetsanctuary: ['friendguard', ['onAnyModifyDamage']],
		phantombarrage: ['levitate', ['onImmunity']],
	};
	for (const [id, [passive, keys]] of Object.entries(manual)) {
		for (const key of keys) {
			const callback = table[id][key];
			if (typeof callback !== 'function') continue;
			table[id][key] = function (this: Battle, ...args: any[]) {
				if (this.effectState.target?.getPassives().includes(passive)) return;
				return callback.apply(this, args);
			};
		}
	}
	const furnaceEntry = abilities.furnaceengine.onStart!;
	abilities.furnaceengine.onStart = function (pokemon) {
		// Steam Engine's only Cold Eclipse entry effect is the same +1 Def/SpD
		// now supplied by full passive Flame Body. Other fields retain their entry.
		if (pokemon.getPassives().includes('flamebody') && this.field.isTerrain('coldeclipseterrain')) return;
		return furnaceEntry.call(this, pokemon);
	};
}
