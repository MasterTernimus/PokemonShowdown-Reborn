import type {Battle} from './battle';
import type {Pokemon} from './pokemon';

const knockouts = new WeakMap<ActiveMove, Pokemon>();

/** Record opposing HP KOs, excluding Substitute, residual damage and other moves' follow-ups. */
export function recordRechargeKO(battle: Battle, source: Pokemon | null, target: Pokemon, effect: Effect, damage: number) {
	const move = battle.activeMove;
	if (battle.gen >= 9 && damage > 0 && target.hp === 0 && source && !target.isAlly(source) &&
		effect.effectType === 'Move' && move?.flags['recharge'] && !move.isZ && !move.isMax &&
		move.id === effect.id && battle.activePokemon === source) knockouts.set(move, source);
}

export function settleRecharge(source: Pokemon, move: ActiveMove | null) {
	if (move && knockouts.get(move) === source) {
		knockouts.delete(move);
		source.removeVolatile('mustrecharge');
	}
}
