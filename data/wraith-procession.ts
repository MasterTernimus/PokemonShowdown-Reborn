import type {AbilityDataTable} from '../sim/dex-abilities';

export const WraithProcessionDescriptions = {
	wraithprocession: {
		shortDesc: 'Single-target Fire/Ghost attacks hit twice; second strike deals 50% damage.',
		desc: 'Eligible single-target Fire- and Ghost-type attacks strike the same target twice, with the second strike dealing 50% of its normal damage. Each strike can apply target secondary effects. Infernal Parade checks status for each strike, so a first-strike burn powers up the second. Uses one PP and the ordinary move accuracy check. The follow-up never transfers to another Pokemon. Spread, existing multi-hit, charging, delayed, OHKO, Z, Max and other moves excluded from bond follow-ups do not gain a strike. Does not bypass abilities or type immunities. Suppression prevents the additional strike.',
	},
};

export function installWraithProcession(abilities: AbilityDataTable) {
	abilities.wraithprocession = {
		name: 'Wraith Procession', num: 11984, rating: 4, flags: {},
		...WraithProcessionDescriptions.wraithprocession,
		onPrepareHit(source, target, move) {
			if (move.category === 'Status' || !this.movehasType(move, ['Fire', 'Ghost']) ||
				move.multihit || move.spreadHit || move.flags.noparentalbond || move.flags.charge ||
				move.flags.futuremove || move.ohko || move.isZ || move.isMax ||
				!['normal', 'adjacentFoe', 'any', 'randomNormal'].includes(move.target)) return;
			move.multihit = 2;
			(move as any).wraithProcession = true;
		},
	};
}
