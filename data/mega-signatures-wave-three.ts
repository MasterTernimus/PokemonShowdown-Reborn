import type { MoveData } from '../sim/dex-moves';
import type { Signature } from './stone-signatures';

function minimumPower(base: string, minimum: number): NonNullable<MoveData['basePowerCallback']> {
	return function (user, target, move) {
		const power = this.dex.moves.get(base).basePowerCallback!.call(this, user, target, move);
		return typeof power === 'number' ? Math.max(power, minimum) : power;
	};
}

function damagesFoe(target: Pokemon, source: Pokemon, move: ActiveMove) {
	return !source.isAlly(target) && (target.getMoveHitData(move).damage || 0) > 0;
}

const furnaceCrash: Signature = {
	base: 'heatcrash', name: 'Furnace Crash', num: 32934,
	desc: 'Power scales with the user’s weight relative to its target, with a minimum of 70 power.',
	changes: { basePowerCallback: minimumPower('heatcrash', 70) },
};

export const MegaSignaturesWaveThree: Record<string, Signature> = {
	meganiummega: {
		base: 'solarbeam', name: 'Mega Sol Cannon', num: 32935,
		desc: 'A 140-power Grass beam. Fires immediately in sunlight; otherwise charges like Solar Beam.',
		changes: { basePower: 140 },
	},
	meganiummegay: {
		base: 'solarbeam', name: 'Flare Cannon', num: 32936, baseType: 'Fire',
		desc: 'A 130-power Fire beam. Fires immediately in sunlight; otherwise charges like Solar Beam.',
		changes: { basePower: 130 },
	},
	typhlosionmega: {
		base: 'eruption', name: 'Flashpoint Burst', num: 32922,
		desc: 'Hits adjacent foes. Power falls with the user’s HP, from 150 down to a minimum of 90.',
		changes: { basePowerCallback: minimumPower('eruption', 90) },
	},
	torterramegax: {
		base: 'headlongrush', name: 'Fault Rush', num: 32937,
		desc: 'A 120-power Ground attack. Lowers the user’s Sp. Def by 1 stage.',
		changes: { self: { boosts: { spd: -1 } } },
	},
	torterramegay: {
		base: 'powergem', name: 'Strata Cannon', num: 32924,
		desc: '80 power, rising to 100 while the user has a positive Defense stage.',
		changes: { onModifyMove(move, source) {
			if (source.boosts.def > 0) move.basePower = 100;
		} },
	},
	infernapemega: {
		base: 'ragingfury', name: 'Blazing Fury', num: 32938,
		shortDesc: '30% burn. No rampage after a Fighting hit or on Dragon’s Den, Volcanic or Burning Field.',
		desc: '140 power with a 30% burn chance. Usually locks the user in for two turns, then confuses it. Attacks freely after its last damaging hit this entry was Fighting-type, or on Dragon’s Den, Volcanic or Burning Field. Volcanic also raises Attack by 1.',
		changes: { onModifyMove(move, source) {
			if (source.m.blazingFuryComboEntry && source.m.blazingFuryComboEntry === source.m.ultraRivalryEntryToken) {
				delete move.self;
			}
		} },
	},
	hydreigonmega: {
		base: 'heavenfall', name: 'Voidfall', num: 32926,
		desc: 'Bypasses Substitute. Lowers the user’s Sp. Atk by 2. On New World, gains Heavenfall’s power boost, never misses, and lowers Sp. Atk by only 1.',
		changes: { flags: { protect: 1, mirror: 1, bypasssub: 1 } },
	},
	salamencemega: {
		base: 'dragonclaw', name: 'Sky Rake', num: 32927,
		desc: '85 power. High critical-hit rate against Flying-type foes. Has a 30% chance to lower Defense.',
		changes: { basePower: 85, onPrepareHit(target, source, move) {
			if (!source.isAlly(target) && target.hasType('Flying')) move.critRatio = (move.critRatio ?? 1) + 1;
		} },
	},
	dragonitemega: {
		base: 'hurricane', name: 'Rescue Gale', num: 32928, baseAccuracy: 85,
		desc: '85% accuracy in ordinary weather. Keeps Hurricane’s weather effects and confusion chance. Once per turn after damaging a foe, heals the adjacent ally with the lowest HP percentage by 1/16 max HP, or the user if no adjacent ally is hurt.',
		changes: {
			onAfterHit(target, source, move) {
				if (!source.hp || !damagesFoe(target, source, move) || source.m.rescueGaleTurn === this.turn) return;
				const injured = source.adjacentAllies().filter(ally => ally.hp && ally.hp < ally.maxhp);
				const recipient = injured.sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp)[0] || source;
				if (this.heal(recipient.baseMaxhp / 16, recipient, source, move)) source.m.rescueGaleTurn = this.turn;
			},
		},
	},
	baxcaliburmega: {
		base: 'glaiverush', name: 'Glacier Glaive', num: 32929,
		desc: 'Until the user next moves, incoming attacks cannot miss and deal 1.5× their usual damage.',
		changes: {},
	},
	gengarmega: {
		base: 'shadowball', name: 'Witching Hex', num: 32930,
		desc: '90 power. Has a 20% chance to lower Sp. Def by 1. Ignores positive Defense and Sp. Def stages on foes with a major status condition.',
		changes: { basePower: 90, onPrepareHit(target, source, move) {
			if (target.status && !source.isAlly(target)) move.ignorePositiveDefensive = true;
		} },
	},
	absolmega: {
		base: 'darkpulse', name: 'Omen Pulse', num: 32970,
		desc: '85 power, with a 20% chance to flinch. Reveals the held item of a foe it damages.',
		changes: { basePower: 85, onAfterHit(target, source, move) {
			if (target.item && damagesFoe(target, source, move)) {
				this.add('-item', target, target.getItem().name, '[from] move: Omen Pulse', `[of] ${source}`);
			}
		} },
	},
	absolmegaz: {
		base: 'nightslash', name: 'Dread Crescent', num: 32971,
		shortDesc: 'High crit rate. A damaging critical hit breaks screens.',
		desc: 'High critical-hit rate. A damaging critical hit shatters Reflect, Light Screen and Aurora Veil on the target’s side.',
		changes: { onAfterHit(target, source, move) {
			if (!damagesFoe(target, source, move)) return;
			if (target.getMoveHitData(move).crit) {
				for (const screen of ['reflect', 'lightscreen', 'auroraveil']) target.side.removeSideCondition(screen);
			}
		} },
	},
	clawitzermega: {
		base: 'waterpulse', name: 'Tide Mortar', num: 32972,
		desc: 'A 70-power pulse that ignores redirection. Has a 20% chance to confuse.',
		changes: { basePower: 70, tracksTarget: true },
	},
	raichumegax: {
		base: 'volttackle', name: 'Surge Ram', num: 32931,
		desc: '140 power with a 20% chance to paralyze. Keeps Volt Tackle’s recoil and Electric Terrain interaction.',
		changes: { secondary: { chance: 20, status: 'par' } },
	},
	raichumegay: {
		base: 'thunderbolt', name: 'Surge Rail', num: 32932,
		desc: 'A 95-power Electric attack that bypasses Substitute, with a 10% chance to paralyze.',
		changes: { basePower: 95, flags: { protect: 1, mirror: 1, metronome: 1, bypasssub: 1 } },
	},
	serperiormega: {
		base: 'leafstorm', name: 'Laurel Storm', num: 32933,
		desc: '100% accuracy. Lowers the user’s Sp. Atk by 2. Removes Safeguard from a foe’s side after damaging it.',
		changes: { accuracy: 100, onAfterHit(target, source, move) {
			if (damagesFoe(target, source, move)) target.side.removeSideCondition('safeguard');
		} },
	},
	emboarmega: furnaceCrash,
	emboarmegareborn: furnaceCrash,
	emboarmegaego: furnaceCrash,
};
