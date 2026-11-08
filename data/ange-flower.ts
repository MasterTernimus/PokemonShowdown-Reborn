import type { AbilityDataTable } from '../sim/dex-abilities';

export const AngeDescription = {
	shortDesc: 'Fairy Aura. Once per turn, single-target Fairy attacks gain a 25%-power flower strike.',
	desc: 'Full local Fairy Aura. Once per turn, after its single-target Fairy attack damages an opposing Pokemon\'s HP, its flower strikes the same target at 25% damage. The extra hit does not repeat move secondary effects or user effects. Uses the original accuracy check and one PP. No follow-up for misses, immunity, fully blocked attacks, Substitute-only damage, spread moves, existing multi-hit moves, charging or delayed attacks, OHKO moves, Z/Max moves or moves barred from extra hits. Never transfers to another target. Switching or regaining the ability does not refresh its use within the same turn. Normal recoil, drain and defensive reactions still apply.',
};

export function installAngeFlower(abilities: AbilityDataTable) {
	Object.assign(abilities.ange, AngeDescription, {
		onPrepareHit(this: Battle, source: Pokemon, target: Pokemon, move: ActiveMove) {
			if (source.m.angeFlowerTurn === this.turn || source.isAlly(target) ||
				move.category === 'Status' || !this.movehasType(move, 'Fairy') || move.multihit || move.spreadHit ||
				move.flags.noparentalbond || move.flags.charge || move.flags.futuremove || move.ohko || move.isZ || move.isMax ||
				!['normal', 'adjacentFoe', 'any', 'randomNormal'].includes(move.target)) return;
			move.multihit = 2;
			move.multiaccuracy = false;
			move.angeFlower = true;
		},
		onSourceAfterDamageApplied(this: Battle, damage: number, target: Pokemon, source: Pokemon, move: ActiveMove) {
			if (!move?.angeFlower || move.hit !== 1 || damage <= 0 || source.isAlly(target)) return;
			move.angeFlowerReady = true;
			source.m.angeFlowerTurn = this.turn;
		},
	});
}
