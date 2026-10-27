import type {AbilityDataTable} from '../sim/dex-abilities';
import {composeSelectedAbility} from './selected-mega-simplifications';

export const AwakeningDragonDescriptions = {
	exaltedaether: {
		shortDesc: 'Physical Dragon/Flying attacks hit twice: 12.5% healing, then 25% damage ignoring positive Defense stages.',
		desc: "Eligible single-target physical Dragon- and Flying-type attacks strike twice, including Aerilate conversions. The first strike deals normal damage and heals 12.5% of actual opposing HP damage dealt, in addition to any native drain. The second deals 25% of normal damage and ignores positive Defense stages. Defensive screens apply normally to both strikes. Target secondary effects and user effects occur only on the first strike. Uses one PP and the ordinary accuracy check. No extra strike for spread, existing multi-hit, charging, delayed, OHKO, Z, Max or bond-excluded moves. Never transfers to another Pokemon. Substitute damage and allied damage do not heal. Normal healing prevention, contact, recoil, abilities and immunities apply. Suppression disables this ability.",
	},
	rightfulexalt: {
		shortDesc: 'Serene Grace + Inner Focus.',
		desc: "Full local Serene Grace and Inner Focus. Doubles eligible move secondary-effect chances, with Serene Grace's existing exceptions and field interactions. Prevents flinching and Intimidate's Attack drop. Does not increase critical-hit chances.",
	},
};

export function installAwakeningDragons(abilities: AbilityDataTable) {
	abilities.exaltedaether = {
		name: 'Exalted Aether', num: 11986, rating: 4.5, flags: {},
		...AwakeningDragonDescriptions.exaltedaether,
		onPrepareHit(source, target, move) {
			if (move.category !== 'Physical' || !this.movehasType(move, ['Dragon', 'Flying']) ||
				move.multihit || move.spreadHit || move.flags.noparentalbond || move.flags.charge ||
				move.flags.futuremove || move.ohko || move.isZ || move.isMax ||
				!['normal', 'adjacentFoe', 'any', 'randomNormal'].includes(move.target)) return;
			move.multihit = 2;
			(move as any).exaltedAether = true;
		},
		onSourceAfterDamageApplied(damage, target, source, move) {
			if (move?.effectType !== 'Move' || !(move as any).exaltedAether || move.hit !== 1 ||
				damage <= 0 || !source.hp || source.isAlly(target)) return;
			this.heal(damage / 8, source, source, this.effect);
		},
	};
	abilities.rightfulexalt = {
		name: 'Rightful Exalt', num: 11985, rating: 4, flags: {},
		...AwakeningDragonDescriptions.rightfulexalt,
	};
	composeSelectedAbility(abilities, 'rightfulexalt', ['serenegrace', 'innerfocus'], true);
}
