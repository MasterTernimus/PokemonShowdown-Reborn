import type {AbilityDataTable} from '../sim/dex-abilities';

export const PrimarinaApprovedDescriptions = {
	encorearia: {
		shortDesc: 'Full Serene Grace; genuine switch-in grants at least 5-turn team Safeguard.',
		desc: 'Full local Serene Grace doubles secondary-effect chances, including chance-based self effects, and removes charge flags. On genuine switch-in, grants the team Safeguard for 5 turns, preserving any longer duration. Ending suppression or restarting/copying the ability does not refresh Safeguard.',
	},
	tidalvoice: {
		shortDesc: 'Liquid Voice + Soundproof; sound bypasses ordinary guards; 30% +1 SpA after foe HP damage.',
		desc: 'Full Liquid Voice changes sound moves to Water, or Ice on Icy Field, with exactly 1.2x power. Soundproof blocks other Pokemon\'s sound moves. Sound moves spare allies. Damaging sound moves bypass ordinary Protect-family moves and Wide Guard for full damage, but not Max Guard. After a complete sound attack deals opposing HP damage, the living, active user has one 30% chance to gain 1 Special Attack. Spread and multiple hits roll only once; Substitute-only hits, ally damage, misses and immunities do not qualify. This ability chance is unaffected by Serene Grace or Sheer Force. No negative-stat reset or Sparkling Aria ally healing.',
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
		onTryHit: abilities.soundproof.onTryHit,
		onAllyTryHitSide: abilities.soundproof.onAllyTryHitSide,
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
			if (damage > 0 && !target.isAlly(source) && move.category !== 'Status' && move.flags.sound) {
				(move as any).tidalVoiceSource = source;
			}
		},
		onAfterMove(source, target, move) {
			if ((move as any).tidalVoiceSource !== source) return;
			delete (move as any).tidalVoiceSource;
			if (source.hp && source.isActive && this.randomChance(3, 10)) this.boost({spa: 1}, source, source, this.effect);
		},
	};
}
