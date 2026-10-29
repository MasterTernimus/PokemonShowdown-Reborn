import type { Pokemon } from '../sim/pokemon';

/** One independent check; warning storage and damage protection stay unchanged. */
export function checkWarning(battle: Battle, pokemon: Pokemon, target: Pokemon, ability: 'anticipation' | 'forewarn') {
	if (!pokemon.hp || !target.hp || !target.isActive || pokemon.isAlly(target)) return;
	const effect = battle.dex.abilities.get(ability);
	if (target.illusion) {
		battle.singleEvent('End', battle.dex.abilities.get('illusion'), target.abilityState, target, pokemon, 'ability');
	}
	if (ability === 'anticipation') {
		for (const slot of target.moveSlots) {
			const move = battle.dex.moves.get(slot.move);
			if (move.category === 'Status') continue;
			const type = move.id === 'hiddenpower' ? target.hpType : move.type;
			if ((battle.dex.getImmunity(type, pokemon) && battle.dex.getEffectiveness(type, pokemon) > 0) || move.ohko) {
				battle.add('-activate', pokemon, 'ability: Anticipation', move.name, `[of] ${target}`);
				rememberWarning(pokemon, ability, move);
				battle.add('-message', `${pokemon.name} anticipated ${move.name}!`);
				return;
			}
		}
	} else {
		let power = 1;
		let moves: Move[] = [];
		for (const slot of target.moveSlots) {
			const move = battle.dex.moves.get(slot.move);
			let bp = move.basePower;
			if (move.ohko) bp = 150;
			if (['counter', 'metalburst', 'mirrorcoat'].includes(move.id)) bp = 120;
			if (bp === 1 || (!bp && move.category !== 'Status')) bp = 80;
			if (bp > power) {
				moves = [move];
				power = bp;
			} else if (bp === power) {
				moves.push(move);
			}
		}
		if (!moves.length) return;
		const move = battle.sample(moves);
		rememberWarning(pokemon, ability, move);
		battle.add('-activate', pokemon, 'ability: Forewarn', move, `[of] ${target}`);
		if (pokemon.hasAbilityOrPassive('breakingnews')) {
			battle.add('-message', `Gossip Gardevoir reports: ${target.name} carries ${move.name}!`);
		}
	}
	if (battle.field.isTerrain('psychicterrain')) battle.boost({ spa: 2 }, pokemon, pokemon, effect);
}

/** Incoming holders already checked all foes through their ordinary entry callbacks. */
export function warnIncomingOpponents(battle: Battle, entrants: Pokemon[]) {
	if (battle.gen !== 9) return;
	for (const holder of battle.getAllActive()) {
		if (entrants.includes(holder) || !holder.isStarted || !holder.hp) continue;
		for (const ability of ['anticipation', 'forewarn'] as const) {
			if (!holder.hasAbilityOrPassive(ability)) continue;
			for (const entrant of entrants) checkWarning(battle, holder, entrant, ability);
		}
	}
}

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
