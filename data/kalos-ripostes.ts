import type { Signature } from './stone-signatures';

type RiposteMove = ActiveMove & { guardianCounterUser?: Pokemon, mistShurikenSpent?: boolean };

function chargedHit(target: Pokemon, source: Pokemon, move: RiposteMove) {
	return move.guardianCounterUser === source && !source.isAlly(target) && (target.getMoveHitData(move).damage || 0) > 0;
}

export const KalosRipostes: Record<string, Signature> = {
	chesnaughtmega: {
		base: 'spikyshield', name: 'Bramble Guard', num: 32829,
		shortDesc: 'Blocks attacks and chips foes. The first contact attack blocked each entry lowers its user’s Speed.',
		desc: 'Protects the user. A blocked contact move costs the attacker 1/8 max HP. The first fully blocked contact attack from a foe each entry also lowers that foe’s Speed by one stage. A fully blocked non-contact attack from a foe costs it 1/16 max HP once per move. With Aegis Shield, fully blocking a foe’s damaging move with Bramble Guard or Protect stores one charge. Your next Grass attack spends it for 1.2× power, even if it misses. Switching clears the charge.',
		changes: {},
	},
	delphoxmega: {
		base: 'mysticalfire', name: 'Hexfire', num: 32830,
		shortDesc: 'Lowers Sp. Atk by 1. A charged hit then removes the foe’s Light Screen.',
		desc: 'Lowers the target’s Sp. Atk by 1. Fully blocking a foe’s damaging move with Protect or Spiky Shield stores one Aegis Flame charge. Your next Fire attack spends it for 1.2× power, even if it misses. If Hexfire spends it and damages a foe, that side’s Light Screen breaks after the damage. Switching clears the charge.',
		changes: {
			onAfterHit(target, source, move) {
				if (chargedHit(target, source, move)) target.side.removeSideCondition('lightscreen');
			},
		},
	},
	greninjamega: {
		base: 'watershuriken', name: 'Mist Shuriken', num: 32831,
		shortDesc: 'Priority volley. A charged volley lowers the first surviving foe’s Speed by 1.',
		desc: 'Uses the higher attacking stat. Aegis Tide grants guaranteed critical hits, 90 power on hit one and 20 thereafter, 2–5 hits (3–6 in free-for-all), and one extra hit on a KO. Fully blocking a foe’s damaging move with Protect or Spiky Shield stores a charge. Your next Water attack spends it for 1.2× power, even on a miss. A charged Mist Shuriken lowers the Speed of the first foe that takes damage and survives by 1 stage, once per volley. Switching clears the charge.',
		changes: {
			onAfterHit(target, source, move: RiposteMove) {
				if (!target.hp || move.mistShurikenSpent || !chargedHit(target, source, move)) return;
				move.mistShurikenSpent = true;
				this.boost({ spe: -1 }, target, source, move);
			},
		},
	},
};
