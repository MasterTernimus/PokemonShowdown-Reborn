import type { AbilityData } from '../sim/dex-abilities';
import type { ConditionDataTable } from '../sim/dex-conditions';
import { AbilityDescriptionOverrides } from './ability-descriptions';

type CalderaMove = ActiveMove & {
	calderaStruck?: Set<Pokemon>,
	calderaRelease?: Pokemon,
	calderaLanded?: boolean,
};

export const calderaSummary = 'Drought + Magma Armor. Two enemy attacks charge a Fire/Ground counterattack.';
export const calderaDescription = AbilityDescriptionOverrides.calderacore.desc +
	' Surviving an opposing attack that damages its HP builds one Pressure and heals 1/16 max HP, once per move. At two charges, its next damaging Fire or Ground move has 1.35× power and heals 1/8 max HP if it damages a foe or its Substitute. Using the move spends both charges. Switching banks the charges. Losing the ability clears active charges.';

function landed(damage: number, target: Pokemon, source: Pokemon, move: CalderaMove) {
	if (damage > 0 && move?.calderaRelease === source && !source.isAlly(target)) move.calderaLanded = true;
}

export function installCalderaPressure(ability: AbilityData) {
	const originalStart = ability.onStart;
	ability.onStart = function (holder) {
		originalStart?.call(this, holder);
		if (holder.m.bankedCaldera) holder.addVolatile(holder.m.bankedCaldera);
		delete holder.m.bankedCaldera;
	};
	ability.shortDesc = calderaSummary;
	ability.desc = calderaDescription;
	ability.onAfterDamageApplied = function (damage, target, source, effect) {
		if (!source || damage <= 0 || effect?.effectType !== 'Move' || target.isAlly(source)) return;
		const move = effect as CalderaMove;
		(move.calderaStruck ||= new Set()).add(target);
	};
	ability.onTryMove = function (source, target, move: CalderaMove) {
		if (move.category === 'Status' || !['Fire', 'Ground'].includes(move.type) || !source.volatiles.calderaready) return;
		source.removeVolatile('calderaready');
		move.calderaRelease = source;
		this.add('-activate', source, 'ability: Caldera Core');
	};
	ability.onBasePower = function (power, source, target, move: CalderaMove) {
		if (move.calderaRelease === source) return this.chainModify(1.35);
	};
	ability.onSourceAfterDamageApplied = landed;
	ability.onSourceAfterSubDamage = landed;
	ability.onAnyAfterAttackResolved = function (source, target, move: CalderaMove) {
		const holder: Pokemon = this.effectState.target;
		if (!holder.hp || !holder.isActive) return;
		if (move.calderaRelease === holder && move.calderaLanded) {
			move.calderaLanded = false;
			this.heal(holder.baseMaxhp / 8, holder, holder, this.effect);
		}
		if (!move.calderaStruck?.delete(holder) || holder.volatiles.calderaready) return;
		const second = holder.removeVolatile('calderacharge');
		holder.addVolatile(second ? 'calderaready' : 'calderacharge');
		this.heal(holder.baseMaxhp / 16, holder, holder, this.effect);
	};
	ability.onEnd = function (holder) {
		if (holder.beingCalledBack && holder.hp) {
			holder.m.bankedCaldera = holder.volatiles.calderaready ? 'calderaready' :
				holder.volatiles.calderacharge ? 'calderacharge' : undefined;
		}
		holder.removeVolatile('calderacharge');
		holder.removeVolatile('calderaready');
	};
}

export const CalderaConditions: ConditionDataTable = {
	calderacharge: {
		name: 'Caldera Charge', noCopy: true,
		onStart(pokemon) { this.add('-start', pokemon, 'Caldera Charge'); },
		onEnd(pokemon) { this.add('-end', pokemon, 'Caldera Charge', '[silent]'); },
	},
	calderaready: {
		name: 'Caldera Ready', noCopy: true,
		onStart(pokemon) { this.add('-start', pokemon, 'Caldera Ready'); },
		onEnd(pokemon) { this.add('-end', pokemon, 'Caldera Ready', '[silent]'); },
	},
};
