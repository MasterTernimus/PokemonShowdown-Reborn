import type {Battle} from './battle';
import type {Pokemon} from './pokemon';

const finishers = new Set(['guillotine', 'horndrill', 'fissure', 'sheercold']);
const knockouts = new WeakSet<object>();
const settled = new WeakSet<object>();

export function recordFinisherKO(battle: Battle, source: Pokemon | null, target: Pokemon, effect: Effect, damage: number) {
	const move = battle.activeMove;
	if (damage > 0 && target.hp === 0 && source && !target.isAlly(source) && effect.effectType === 'Move' &&
		move && move.id === effect.id && battle.activePokemon === source && finishers.has(move.id)) knockouts.add(move);
}

export function settleFinisherCost(battle: Battle, source: Pokemon, move: ActiveMove | null) {
	if (!move || !finishers.has(move.id) || move.isZ || move.isMax || settled.has(move)) return;
	settled.add(move);
	if (source.hp && !knockouts.has(move)) {
		battle.directDamage(Math.max(1, Math.floor(source.maxhp / 4)), source, source, move);
	}
}
