import type {Pokemon} from '../sim/pokemon';

export function rememberWarning(pokemon: Pokemon, ability: 'forewarn' | 'anticipation', move: Move) {
	// Percentage damage reduction is not protection against an OHKO move.
	if (move.ohko || move.category === 'Status') return;
	if (!pokemon.volatiles.warnedmoves) pokemon.addVolatile('warnedmoves', pokemon);
	if (pokemon.volatiles.warnedmoves) pokemon.volatiles.warnedmoves[ability] = move.id;
}

export function protectsWarnedMove(pokemon: Pokemon, source: Pokemon | null, effect: Effect | null) {
	if (!source || pokemon.isAlly(source) || effect?.effectType !== 'Move' || effect.ohko) return false;
	const memory = pokemon.volatiles.warnedmoves;
	return !!memory && (['forewarn', 'anticipation'] as const).some(id =>
		memory[id] === effect.id && pokemon.hasAbilityOrPassive(id));
}
