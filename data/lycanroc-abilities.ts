import type { AbilityDataTable } from '../sim/dex-abilities';
import { clearEntryHazards } from './dune-carver';

function daybreakHit(this: Battle, damage: number, target: Pokemon, source: Pokemon, move: ActiveMove) {
	if (damage <= 0 || !source.hp || target.isAlly(source) || move.type !== 'Rock' || this.effectState.cleared) return;
	if (clearEntryHazards(this, source, 'ability: Daybreak Rush')) this.effectState.cleared = true;
}

function isReprisal(source: Pokemon, target: Pokemon, move: ActiveMove) {
	return move.category !== 'Status' && move.type === 'Rock' && !source.isAlly(target) &&
		source.attackedBy.some(hit => hit.thisTurn && hit.source === target && hit.damage > 0);
}

export const LycanrocAbilities: AbilityDataTable = {
	daybreakrush: {
		name: 'Daybreak Rush', num: 33860, rating: 3.5, flags: {},
		shortDesc: 'A damaging Rock hit clears entry hazards from its side once per entry.',
		desc: 'Once per entry, hitting a foe or its Substitute with a damaging Rock move clears all entry hazards from the user’s side. A hit when there are no hazards saves the effect for later.',
		onSourceDamagingHit: daybreakHit,
		onSourceAfterSubDamage: daybreakHit,
	},
	moonlitreprisal: {
		name: 'Moonlit Reprisal', num: 33861, rating: 3.5, flags: {},
		shortDesc: 'Rock attacks have 30% more power against a foe that damaged it this turn. A counterhit heals 1/8 HP.',
		desc: 'Rock attacks have 30% more power against a foe that dealt direct damage to the user’s HP earlier that turn. Damaging that foe’s HP with a Rock attack also heals 1/8 of the user’s max HP once per turn.',
		onBasePower(power, source, target, move) {
			if (isReprisal(source, target, move)) return this.chainModify(1.3);
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (damage <= 0 || !source.hp || this.effectState.healedTurn === this.turn || !isReprisal(source, target, move)) return;
			this.effectState.healedTurn = this.turn;
			this.heal(source.baseMaxhp / 8, source, source, this.effect);
		},
	},
};
