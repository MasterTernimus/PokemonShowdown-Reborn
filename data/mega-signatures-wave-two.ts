import type { Signature } from './stone-signatures';

function damagedFoe(target: Pokemon, user: Pokemon, move: ActiveMove) {
	return !user.isAlly(target) && (target.getMoveHitData(move).damage || 0) > 0;
}

type HornSalvo = ActiveMove & { breachedSides?: SideID[] };

export const MegaSignaturesWaveTwo: Record<string, Signature> = {
	heatranmega: {
		base: 'magmastorm', name: 'Crucible Coil', num: 32900,
		desc: 'Traps the target for 4–5 turns. Accuracy rises from 75% to 90% while the user’s Defense is raised.',
		changes: { onModifyMove(move, source) {
			if (source.boosts.def > 0) move.accuracy = 90;
		} },
	},
	chimechomega: {
		base: 'extrasensory', name: 'Temple Toll', num: 32901,
		desc: 'A sound wave that blocks healing for 2 turns. Damaging a foe clears confusion from the user and its active allies.',
		changes: {
			flags: { protect: 1, mirror: 1, metronome: 1, sound: 1, bypasssub: 1 },
			secondary: { chance: 100, onHit(target, source, move) {
				if (!target.hp || source.isAlly(target)) return;
				const block = target.volatiles.healblock;
				if (block) {
					block.duration = Math.max(block.duration || 0, 2);
				} else if (target.addVolatile('healblock', source, move)) {
					target.volatiles.healblock.duration = 2;
				}
			} },
			onAfterHit(target, source, move) {
				if (!damagedFoe(target, source, move)) return;
				for (const mon of [source, ...source.allies()]) mon.removeVolatile('confusion');
			},
		},
	},
	arbolivamega: {
		base: 'gigadrain', name: 'Olive Press', num: 32902,
		desc: 'Drains half the damage dealt, or 75% on Grassy Terrain. Recovery goes to the adjacent ally with the lowest HP percentage if it is at half HP or less. Otherwise the user recovers.',
		changes: {
			drainRecipient(source) {
				const allies = source.adjacentAllies().filter(ally => ally.hp > 0 && ally.hp * 2 <= ally.maxhp);
				return allies.sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp)[0] || source;
			},
		},
	},
	golurkmega: {
		base: 'shadowpunch', name: 'Seal Breaker', num: 32903,
		desc: 'A sure-hit punch that grounds a damaged foe until it switches.',
		changes: { onAfterHit(target, source, move) {
			if (target.hp && damagedFoe(target, source, move)) target.addVolatile('smackdown', source, move);
		} },
	},
	belliboltmega: {
		base: 'paraboliccharge', name: 'Pond Circuit', num: 32904,
		desc: 'Hits adjacent foes and drains 25% of the damage dealt, or 75% on Electric Terrain.',
		changes: {
			target: 'allAdjacentFoes', drain: [1, 4],
			onModifyMove(move) {
				if (this.field.isTerrain('electricterrain')) move.drain = [3, 4];
			},
		},
	},
	luxraymega: {
		base: 'wildcharge', name: 'Rail Rush', num: 32905,
		desc: 'Deals 25% recoil. Recoil is waived if the target already lost HP to an opposing attack this turn, or on Electric Terrain.',
		changes: { onModifyMove(move, source, target) {
			if (target?.attackedBy.some(hit => hit.thisTurn && hit.damage > 0 && !target.isAlly(hit.source))) {
				delete move.recoil;
			}
		} },
	},
	aurorusmega: {
		base: 'freezedry', name: 'Polar Prism', num: 32906,
		desc: 'Super effective on Water. The first damaging hit on a Water-type foe each entry sets Mist for 3 turns.',
		changes: { secondary: null, onAfterHit(target, source, move) {
			if (!target.hasType('Water') || !damagedFoe(target, source, move)) return;
			if (source.m.polarPrismEntry === source.previouslySwitchedIn) return;
			source.m.polarPrismEntry = source.previouslySwitchedIn;
			source.side.addSideCondition('mist', source, move);
		} },
	},
	tyrantrummega: {
		base: 'dragonclaw', name: 'Crown Rend', num: 32907,
		desc: 'A slicing Dragon attack. Power rises from 80 to 100 against a target with boosted Defense.',
		changes: { secondary: null, basePowerCallback(source, target, move) {
			return target.boosts.def > 0 ? 100 : move.basePower;
		} },
	},
	heracrossmega: {
		base: 'pinmissile', name: 'Horn Salvo', num: 32908,
		desc: 'Hits 2–5 times. After at least three hits damage the same foe’s HP, the volley breaks Reflect and Light Screen on its side.',
		changes: {
			onAfterHit(target, source, move: HornSalvo) {
				if (!damagedFoe(target, source, move)) return;
				const record = target.getMoveHitData(move) as { hornSalvoHits?: number };
				record.hornSalvoHits = (record.hornSalvoHits || 0) + 1;
				if (record.hornSalvoHits === 3) (move.breachedSides ||= []).push(target.side.id);
			},
			onAfterMoveSecondarySelf(source, target, move: HornSalvo) {
				for (const id of move.breachedSides || []) {
					const side = this.getSide(id);
					side.removeSideCondition('reflect');
					side.removeSideCondition('lightscreen');
				}
			},
		},
	},
	breloommega: {
		base: 'machpunch', name: 'Spore Jab', num: 32909,
		desc: 'A +1 priority punch that ignores positive defensive stages on a poisoned or badly poisoned foe.',
		changes: { onModifyMove(move, source, target) {
			if (target && ['psn', 'tox'].includes(target.status)) move.ignorePositiveDefensive = true;
		} },
	},
};
