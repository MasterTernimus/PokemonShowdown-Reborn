import type {AbilityDataTable} from '../sim/dex-abilities';

export function installHoennMastery(abilities: AbilityDataTable) {
	abilities.canopymastery = {
		...abilities.dualwield, name: 'Canopy Mastery', num: 12078,
		shortDesc: 'Dual Wield. Grass attacks are adaptive; Grass/slicing attacks gain 30% power.',
		desc: 'Full local Dual Wield. Grass attacks use the higher staged Attack or Sp. Atk, becoming physical or special (physical on a tie). Grass and slicing attacks gain 30% power, applied once if both qualify. Dual Wield retains its existing boosted first-hit and reduced follow-up rules.',
		onModifyMove(move, source, target) {
			if (move.category !== 'Status' && this.movehasType(move, 'Grass')) {
				const physical = source.getStat('atk', false, true) >= source.getStat('spa', false, true);
				move.category = physical ? 'Physical' : 'Special';
				move.overrideOffensiveStat = physical ? 'atk' : 'spa';
				move.overrideDefensiveStat = physical ? 'def' : 'spd';
			}
			return this.dex.abilities.get('dualwield').onModifyMove?.call(this, move, source, target);
		},
		onBasePower(power, source, target, move) {
			this.dex.abilities.get('dualwield').onBasePower?.call(this, power, source, target, move);
			if (this.movehasType(move, 'Grass') || move.flags.slicing) return this.chainModify(1.3);
		},
	};
	abilities.blazemastery = {
		...abilities.striker, name: 'Blaze Mastery', num: 12079,
		shortDesc: 'Striker + 30% kick power; noncontact kicks clear lowered Attack/Speed on hit once per turn.',
		desc: 'Full Striker plus 30% more kick power, for 1.82x total. Kicking moves do not make contact. Once per turn, after a kick damages a foe or Substitute, clears its negative Attack and Speed stages. Positive stages are preserved; crash damage still applies.',
		onBasePower(power, source, target, move) {
			this.dex.abilities.get('striker').onBasePower?.call(this, power, source, target, move);
			if (move.flags.kick) return this.chainModify(1.3);
		},
		onModifyMove(move) { if (move.flags.kick) delete move.flags.contact; },
		onSourceDamagingHit(damage, target, source, move) {
			if (damage > 0 && !source.isAlly(target) && move.flags.kick) (move as any).blazeMasteryHit = source;
		},
		onSourceAfterSubDamage(damage, target, source, move) {
			if (damage > 0 && !source.isAlly(target) && move.flags.kick) (move as any).blazeMasteryHit = source;
		},
		onAfterMove(source, target, move) {
			if ((move as any).blazeMasteryHit !== source || !source.hp || !source.isActive || source.m.blazeMasteryTurn === this.turn) return;
			source.m.blazeMasteryTurn = this.turn;
			for (const stat of ['atk', 'spe'] as const) if (source.boosts[stat] < 0) {
				source.boosts[stat] = 0;
				this.add('-setboost', source, stat, 0, '[from] ability: Blaze Mastery');
			}
		},
	};
	abilities.tidalmastery = {
		...abilities.damp, name: 'Tidal Mastery', num: 12080,
		shortDesc: 'Damp. Water/Ground attacks punish foes that acted; physical ones ignore Defense boosts.',
		desc: 'Full local Damp. Physical Water and Ground attacks ignore positive Defense stages. Water and Ground attacks gain 30% power against a foe that has already attempted its move this turn. Negative Defense stages still apply; switching alone does not activate the power bonus.',
		onModifyMove(move) {
			if (move.category === 'Physical' && (this.movehasType(move, 'Water') || this.movehasType(move, 'Ground'))) move.ignorePositiveDefensive = true;
		},
		onBasePower(power, source, target, move) {
			if (!source.isAlly(target) && (target.moveThisTurn || target.moveThisTurnResult === false || target.moveThisTurnResult === null) &&
				(this.movehasType(move, 'Water') || this.movehasType(move, 'Ground'))) return this.chainModify(1.3);
		},
	};
}
