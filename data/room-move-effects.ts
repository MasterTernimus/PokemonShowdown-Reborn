/** Reset only the stages affected by a successful Wonder Room swap. */
export function clearWonderRoomDrops(battle: Battle, pokemon: Pokemon, stats: readonly BoostID[]) {
	if (!battle.field.getPseudoWeather('wonderroom')) return;
	for (const stat of stats) {
		if (pokemon.boosts[stat] >= 0) continue;
		pokemon.setBoost({ [stat]: 0 });
		battle.add('-setboost', pokemon, stat, 0, '[from] move: Wonder Room');
	}
}

/** These are exchanged stages, not boosts: Contrary and Simple do not modify them. */
export function wonderRoomPowerTrick(battle: Battle, pokemon: Pokemon) {
	if (!battle.field.getPseudoWeather('wonderroom')) return;
	const atk = pokemon.boosts.atk;
	const def = pokemon.boosts.def;
	pokemon.setBoost({ atk: def, def: atk });
	battle.add('-setboost', pokemon, 'atk', def, '[from] move: Power Trick');
	battle.add('-setboost', pokemon, 'def', atk, '[from] move: Power Trick');
	battle.add('-message', 'Wonder Room exchanged Attack and Defense stages!');
}
