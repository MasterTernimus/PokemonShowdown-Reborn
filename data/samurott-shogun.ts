import type { AbilityData } from '../sim/dex-abilities';
import type { MoveDataTable } from '../sim/dex-moves';

const unovan = { base: 'razorshell', name: 'Cresting Cut', ability: 'shogunstance', component: '' } as const;
const hisuian = { ...unovan, name: 'Moonless Cut', component: 'shellarmor' } as const;
export const SamurottSignatures = {
	samurott: unovan, samurottalt: unovan, samurotthisui: hisuian, samurotthisuialt: hisuian,
};
export function getShogunRoute(species: string) {
	return SamurottSignatures[species as keyof typeof SamurottSignatures];
}
export const ShogunStanceText = {
	name: 'Shogun Stance',
	shortDesc: '1.2× Atk, Sp. Atk and Speed; signature Razor Shell. Hisuian Samurott also gains Shell Armor.',
	desc: 'Samurott gains 1.2× Attack, Special Attack and Speed. Its Razor Shell becomes Cresting Cut, or Moonless Cut for Hisuian Samurott. Both are 85-power Water moves that use the higher attacking stat and have a 50% chance to lower Defense. Moonless Cut also has a high critical-hit rate. Hisuian Samurott gains the full effects of Shell Armor.',
};
function stanceArmor(battle: Battle, user: Pokemon) {
	const component = getShogunRoute(user.species.id)?.component;
	if (!component) return;
	const armor = battle.dex.abilities.get(component);
	if (!battle.suppressingAbility(user, armor)) return armor;
}
function stanceStat(this: Battle, stat: number, user: Pokemon) {
	if (user.species.id in SamurottSignatures) return this.chainModify(1.2);
}
export const ShogunStance: AbilityData = {
	...ShogunStanceText, num: 32960, rating: 4, flags: {},
	onStart(user) {
		if (user.species.id in SamurottSignatures) this.add('-ability', user, 'Shogun Stance');
		stanceArmor(this, user)?.onStart?.call(this, user);
	},
	onModifyAtk: stanceStat, onModifySpA: stanceStat, onModifySpe: stanceStat,
	onSourceModifyDamage(damage, source, target, move) {
		return stanceArmor(this, target)?.onSourceModifyDamage?.call(this, damage, source, target, move);
	},
	onAfterEachBoost(boosts, target, source, effect) {
		return stanceArmor(this, target)?.onAfterEachBoost?.call(this, boosts, target, source, effect);
	},
	onCriticalHit(target, source, move) {
		const handler = stanceArmor(this, target)?.onCriticalHit;
		return typeof handler === 'function' ? handler.call(this, target, source, move) : handler;
	},
};

export const ShogunMoveText = {
	crestingcut: {
		shortDesc: '50% chance to lower the target’s Defense.',
		desc: 'Has a 50% chance to lower the target’s Defense by one stage.',
	},
	moonlesscut: {
		shortDesc: 'High critical-hit rate. 50% chance to lower Defense.',
		desc: 'Has a high critical-hit rate and a 50% chance to lower the target’s Defense by one stage.',
	},
};
export function installShogunCuts(moves: MoveDataTable) {
	const original = moves.razorshell;
	const prior = original.onModifyMove;
	function signature(user: Pokemon) {
		const route = getShogunRoute(user.species.id);
		return route && user.hasAbility(route.ability) ? route.name : undefined;
	}
	for (const [id, name, critRatio, num] of [
		['crestingcut', unovan.name, 1, 32961], ['moonlesscut', hisuian.name, 2, 32962],
	] as const) {
		moves[id] = {
			...original, ...ShogunMoveText[id], name, critRatio, num, basePower: 85, isNonstandard: 'Custom',
			onModifyMove(move, user, target) {
				if (signature(user) === name) (move as { id: ID }).id = 'razorshell' as ID;
				prior?.call(this, move, user, target);
			},
		};
	}
	original.onModifyMove = function (move, user, target) {
		prior?.call(this, move, user, target);
		const name = signature(user);
		if (!name) return;
		const cut = this.dex.moves.get(name);
		Object.assign(move, { name, type: cut.type, basePower: cut.basePower, critRatio: cut.critRatio });
	};
}
