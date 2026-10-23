import type {AbilityDataTable} from '../sim/dex-abilities';

export function tidalSoundproofSource(battle: Battle, target: Pokemon): Pokemon | undefined {
	if (!target.hp || !target.isActive) return;
	return target.alliesAndSelf().find(holder => holder.hp && holder.isActive && holder.hasAbility('tidalvoice') &&
		!battle.suppressingAbility(holder, battle.dex.abilities.get('tidalvoice')));
}
const tidalVoiceHits = new WeakMap<object, Map<Pokemon, Map<Pokemon, Set<number>>>>();

export const PrimarinaApprovedDescriptions = {
	encorearia: {
		shortDesc: 'Full Serene Grace; genuine switch-in grants at least 5-turn team Safeguard.',
		desc: 'Full local Serene Grace doubles secondary-effect chances, including chance-based self effects, and removes charge flags. On genuine switch-in, grants the team Safeguard for 5 turns, preserving any longer duration. Ending suppression or restarting/copying the ability does not refresh Safeguard.',
	},
	tidalvoice: {
		shortDesc: 'Liquid Voice; team Soundproof; sound bypasses guards; each foe HP hit: 30% +1 SpA.',
		desc: 'Full Liquid Voice changes sound moves to Water, or Ice on Icy Field, with exactly 1.2x power. While active, protects itself and its active allies from other Pokemon\'s sound moves. Sound moves spare allies. Damaging sound moves bypass ordinary Protect-family moves and Wide Guard for full damage, but not Max Guard. Each successful damaging sound hit against an opponent\'s HP independently has a 30% chance to give the living, active user +1 Special Attack, including each target of a spread attack and each hit of a multi-hit attack. Substitute-only hits, ally damage, misses and immunities do not qualify. Serene Grace and Sheer Force do not modify this ability chance.',
	},
};

export function installPrimarinaApproved(abilities: AbilityDataTable) {
	const encore = abilities.encorearia;
	abilities.encorearia = {
		...abilities.serenegrace, name: encore.name, num: encore.num, rating: encore.rating,
		onSwitchIn(pokemon) {
			const current = pokemon.side.sideConditions.safeguard;
			if (current) {
				if (current.duration !== undefined && current.duration < 5) current.duration = 5;
				return;
			}
			pokemon.side.addSideCondition('safeguard', pokemon, this.effect);
			const state = pokemon.side.sideConditions.safeguard;
			if (state) state.duration = Math.max(state.duration || 0, 5);
		},
	};
	const tidal = abilities.tidalvoice;
	abilities.tidalvoice = {
		...abilities.liquidvoice,
		onAllyTryHit(target, source, move) {
			if (target === source || !move.flags.sound || tidalSoundproofSource(this, target) !== this.effectState.target) return;
			this.add('-immune', target, '[from] ability: Tidal Voice');
			return null;
		},
		name: tidal.name, num: tidal.num, rating: tidal.rating, flags: {breakable: 1},
		onModifyMove(move) {
			if (!move.flags.sound) return;
			if (move.category !== 'Status') delete move.flags.protect;
			if (move.target === 'allAdjacent') move.target = 'allAdjacentFoes';
			const previous = move.onTryHit;
			move.onTryHit = function (target, source, activeMove) {
				if (target !== source && target.isAlly(source)) return null;
				return typeof previous === 'function' ? previous.call(this, target, source, activeMove) : previous;
			};
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (damage <= 0 || !source.hp || !source.isActive || target.isAlly(source) || move.category === 'Status' || !move.flags.sound) return;
			let users = tidalVoiceHits.get(move);
			if (!users) tidalVoiceHits.set(move, users = new Map());
			let targets = users.get(source);
			if (!targets) users.set(source, targets = new Map());
			let hits = targets.get(target);
			if (!hits) targets.set(target, hits = new Set());
			const hit = move.hit || 0;
			if (hits.has(hit)) return;
			hits.add(hit);
			if (this.randomChance(3, 10)) this.boost({ spa: 1 }, source, source, this.effect);
		},
	};
}
