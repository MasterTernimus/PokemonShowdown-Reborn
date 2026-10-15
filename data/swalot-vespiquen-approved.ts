import type {AbilityDataTable} from '../sim/dex-abilities';
import {skipPassiveComponent} from './passive-ability-cleanup';
import {PressureLimitText} from './pressure-memory';

/** Passive budgets survive active ability replacement; other users retain their existing state. */
export function accumulationState(pokemon: Pokemon): any {
	return pokemon.getPassives().includes('accumulation') ? (pokemon.m.accumulationState ||= {}) : pokemon.abilityState;
}

export const SwalotVespiquenDescriptions = {
	adhesivearmor: {name: 'Adhesive Armor', shortDesc: 'Sticky Hold; cannot be forced to switch.', desc: 'Full local Sticky Hold protects the held item. Opposing moves and effects cannot force this Pokemon to switch. Voluntary switches and its own pivot moves remain available.'},
	causticooze: {name: 'Caustic Ooze', shortDesc: 'Liquid Ooze; Poison attacks have 1.3x power.', desc: 'Full local Liquid Ooze reverses healing from draining moves, Leech Seed and Strength Sap, including doubled damage on Murkwater Surface and Wasteland. Poison attacks have 1.3x power.'},
	royalpresence: {name: 'Royal Presence', shortDesc: 'Full local Pressure + Unnerve.', desc: 'Full local Pressure and Unnerve. Opposing moves targeting it cost extra PP (2 extra in Midnight Zone); entry lowers opposing Defense and Sp. Def, and Underwater becomes Midnight Zone. Unnerve prevents opposing berry use and retains its field effects. ' + PressureLimitText},
	hivesanctuary: {name: 'Hive Sanctuary', shortDesc: 'Sweet Veil + Friend Guard.', desc: 'Full Sweet Veil prevents sleep and Yawn on the holder and its allies, including Rest, without curing existing sleep. Friend Guard reduces attack damage to allies by 25%; it does not reduce damage to the holder.'},
	royalhive: {name: 'Royal Hive', shortDesc: 'Entry raises offenses; alternates attack/defense stances; defensive stance heals 1/16.', desc: 'Genuine entry starts in attack stance with +1 Attack and Sp. Atk. A Status move switches to defensive stance, lowering Attack and Sp. Atk by 1 and raising Defense and Sp. Def by 1. A damaging move switches back with the reverse changes. Repeated moves of the same category do not repeat the changes. Defensive stance heals 1/16 base max HP each turn. Active ability restarts and suppression do not reset the passive stance or grant entry boosts.'},
};

export function installSwalotVespiquen(abilities: AbilityDataTable) {
	abilities.adhesivearmor = {...abilities.stickyhold, name: 'Adhesive Armor', num: 11467, rating: 3,
		onDragOut() { return false; },
	};
	abilities.causticooze = {...abilities.liquidooze, name: 'Caustic Ooze', num: 11468, rating: 3,
		onBasePower(power, source, target, move) { if (move.type === 'Poison') return this.chainModify(1.3); },
	};
	abilities.royalpresence = {...abilities.pressure, ...abilities.unnerve, name: 'Royal Presence', num: abilities.royalescort.num, rating: 4,
		onStart(pokemon) {
			abilities.pressure.onStart!.call(this, pokemon);
			abilities.unnerve.onStart!.call(this, pokemon);
		},
	};
	delete abilities.royalescort;
	abilities.hivesanctuary = {...abilities.sweetveil, ...abilities.friendguard, name: 'Hive Sanctuary', num: 11469, rating: 4};
	const hive = abilities.royalhive;
	hive.onSwitchIn = hive.onStart;
	delete hive.onStart;
	for (const [id, ability] of [['accumulation', abilities.accumulation], ['royalhive', hive]] as const) {
		for (const key of Object.keys(ability)) {
			const callback = (ability as any)[key];
			if (!key.startsWith('on') || typeof callback !== 'function') continue;
			(ability as any)[key] = function (this: Battle, ...args: any[]) {
				if (skipPassiveComponent(this, this.effectState.target, id)) return;
				return callback.apply(this, args);
			};
		}
	}
}
