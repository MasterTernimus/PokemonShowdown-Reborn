import type {AbilityDataTable} from '../sim/dex-abilities';
import {skipPassiveComponent} from './passive-ability-cleanup';

export const RegiAttackTypes = ['Dragon', 'Electric', 'Ice', 'Rock', 'Steel'];
export const PrimordialComponents = {continentalpull: [], worldforged: [], colossalframe: [], worldbinder: ['moldbreaker'], primordialconstruct: []};
export const PrimordialDescriptions = {
	continentalpull: {name: 'Continental Pull', shortDesc: 'Its contact attacks lower damaged foes\' Speed by 1, once per target each turn.', desc: 'After its damaging contact move, lowers the Speed of each opponent whose HP it damaged by one stage, at most once per target per turn. Multihit moves cause only one drop. Misses, protection, immunity and Substitute-only hits do not qualify.'},
	worldforged: {name: 'Worldforged', shortDesc: 'Dragon, Electric, Ice, Rock and Steel attacks have 1.3x power.', desc: 'Its Dragon, Electric, Ice, Rock and Steel attacks have 1.3x power.'},
	colossalframe: {name: 'Colossal Frame', shortDesc: 'Takes 25% less damage from physical attacks.', desc: 'Damage from physical attacks is multiplied by 0.75.'},
	worldbinder: {name: 'Worldbinder', shortDesc: 'Mold Breaker; damaging HP hits clear positive target stages after the attack.', desc: 'Mold Breaker. After the whole damaging move, clears positive stat stages of opposing targets whose HP it damaged. Negative stages remain. Misses, protection, immunity and Substitute-only hits do not qualify.'},
	primordialconstruct: {name: 'Primordial Construct', shortDesc: 'Above half HP: halves attack damage except Dark, Ghost, Ground and Fighting.', desc: 'Above half HP, halves damage from attacks except Dark, Ghost, Ground and Fighting. Checks HP before each hit. Normal typing, weaknesses, resistances and immunities remain unchanged.'},
};

export function installPrimordialAbilities(abilities: AbilityDataTable) {
	const a = abilities as any;
	a.continentalpull = {name: 'Continental Pull', num: 11751, rating: 3, flags: {},
		onSourceAfterDamageApplied(this: Battle, damage: number, target: Pokemon, source: Pokemon, effect: Effect) {
			if (damage <= 0 || effect.effectType !== 'Move' || source.isAlly(target) || source !== this.activePokemon || effect.id !== this.activeMove?.id) return;
			if (!this.checkMoveMakesContact(this.activeMove!, source, target)) return;
			const targets: Pokemon[] = (this.activeMove as any).continentalPullTargets ||= [];
			if (!targets.includes(target)) targets.push(target);
		},
		onAfterMove(this: Battle, source: Pokemon, target: Pokemon, move: ActiveMove) {
			if (source.m.continentalPullTurn !== this.turn) {
				source.m.continentalPullTurn = this.turn;
				source.m.continentalPullTargets = [];
			}
			const used: Pokemon[] = source.m.continentalPullTargets;
			for (const foe of (move as any).continentalPullTargets || []) {
				if (!foe.hp || used.includes(foe)) continue;
				used.push(foe);
				this.boost({spe: -1}, foe, source, this.effect);
			}
			delete (move as any).continentalPullTargets;
		},
	};
	a.worldforged = {name: 'Worldforged', num: 11752, rating: 3, flags: {},
		onBasePower(this: Battle, power: number, source: Pokemon, target: Pokemon, move: ActiveMove) {
			if (RegiAttackTypes.some(type => this.movehasType(move, type))) return this.chainModify(1.3);
		},
	};
	a.colossalframe = {name: 'Colossal Frame', num: 11753, rating: 3, flags: {breakable: 1},
		onSourceModifyDamage(this: Battle, damage: number, source: Pokemon, target: Pokemon, move: ActiveMove) {
			if (move.category === 'Physical') return this.chainModify(0.75);
		},
	};
	a.worldbinder = {...a.moldbreaker, name: 'Worldbinder', num: 11754,
		onStart(this: Battle, pokemon: Pokemon) { this.add('-ability', pokemon, 'Worldbinder'); },
		onSourceAfterDamageApplied(this: Battle, damage: number, target: Pokemon, source: Pokemon, effect: Effect) {
			if (damage <= 0 || effect.effectType !== 'Move' || source.isAlly(target) || source !== this.activePokemon || effect.id !== this.activeMove?.id) return;
			const targets: Pokemon[] = (this.activeMove as any).worldbinderTargets ||= [];
			if (!targets.includes(target)) targets.push(target);
		},
		onAfterMove(this: Battle, source: Pokemon, target: Pokemon, move: ActiveMove) {
			for (const foe of (move as any).worldbinderTargets || []) {
				if (!foe.hp) continue;
				for (const stat of Object.keys(foe.boosts) as BoostID[]) if (foe.boosts[stat] > 0) foe.boosts[stat] = 0;
				this.add('-clearpositiveboost', foe, source, 'ability: Worldbinder');
			}
			delete (move as any).worldbinderTargets;
		},
	};
	a.primordialconstruct = {name: 'Primordial Construct', num: 11755, rating: 4, flags: {},
		onSourceModifyDamage(this: Battle, damage: number, source: Pokemon, target: Pokemon, move: ActiveMove) {
			if (skipPassiveComponent(this, target, 'primordialconstruct')) return;
			if (target.hp > target.maxhp / 2 && !['Dark', 'Ghost', 'Ground', 'Fighting'].some(type => this.movehasType(move, type))) return this.chainModify(0.5);
		},
	};
}
