/** Generated psychic adaptations are independent of the ordinary Future Sight slot. */
interface ForesightMemory {
	owner: Pokemon;
	slot: ReturnType<Pokemon['getSlot']>;
	opponent: number;
	turn: number;
	type: string;
	set: PokemonSet;
	spa: number;
	boost: number;
	types: string[];
	baseTypes: string[];
	tera: Pokemon['terastallized'];
	stellar: string[];
	position: number;
}

function directMove(move: ActiveMove) {
	return move.category !== 'Status' && !move.flags['futuremove'] && !move.callsMove &&
		!move.sourceEffect && !(move as any).foresightStored && !(move as any).isExternal &&
		move.id !== 'confused';
}

export function prepareForesight(battle: Battle, source: Pokemon, target: Pokemon, move: ActiveMove) {
	if (!target || source.isAlly(target) || !directMove(move) ||
		!['normal', 'adjacentFoe', 'any'].includes(move.target) || !battle.movehasType(move, 'Psychic')) return;
	target.addVolatile('miracleeye', source, source.getAbility());
}

export function recordForesight(
	battle: Battle, holder: Pokemon, damage: number, target: Pokemon, source: Pokemon, effect: Effect,
	mode: 'grandmaster' | 'perfectforesight'
) {
	if (!holder || holder.fainted || !holder.isActive || damage <= 0 || !source || effect?.effectType !== 'Move') return;
	const move = effect as ActiveMove;
	if (!directMove(move) || source.isAlly(target)) return;
	const proactive = source === holder && ['normal', 'adjacentFoe', 'any'].includes(move.target);
	const reactive = target === holder && move.category === 'Special';
	if (!proactive && !reactive) return;
	const opponent = proactive ? target : source;
	const seen: Pokemon[] = (move as any).foresightSeen || ((move as any).foresightSeen = []);
	if (seen.includes(holder)) return;
	seen.push(holder);
	if (!battle.field.pseudoWeather['foresightmemory']) battle.field.addPseudoWeather('foresightmemory', holder);
	const state = battle.field.pseudoWeather['foresightmemory'];
	const entries: ForesightMemory[] = state.entries || (state.entries = []);
	const owned = entries.filter(entry => entry.owner === holder);
	if (mode === 'grandmaster' ? owned.length > 0 :
		owned.some(entry => entry.opponent === opponent.side.n) || owned.length >= (battle.gameType === 'freeforall' ? 3 : 1)) return;
	const turn = Math.max(battle.turn + (mode === 'grandmaster' ? 2 : 1), ...owned.map(entry => entry.turn + 1));
	entries.push({
		owner: holder, slot: opponent.getSlot(), opponent: opponent.side.n, turn,
		type: proactive ? 'Psychic' : move.type,
		set: {...holder.set, species: holder.species.name, name: holder.name, level: holder.level,
			ability: 'No Ability', item: '', moves: ['psychic']},
		spa: holder.storedStats.spa, boost: holder.boosts.spa, types: holder.getTypes().slice(),
		baseTypes: holder.getTypes(false, true).slice(), tera: holder.terastallized,
		stellar: holder.stellarBoostedTypes.slice(), position: holder.position,
	});
	battle.add('-message', `${holder.name} stored a ${proactive ? 'Psychic' : move.type} attack against ${opponent.side.name} for turn ${turn}.`);
}

export function startForesightScreens(battle: Battle, pokemon: Pokemon) {
	if (pokemon.baseSpecies.baseSpecies !== 'Alakazam' || !pokemon.species.isMega || pokemon.m.foresightScreensUsed) return;
	pokemon.m.foresightScreensUsed = true;
	for (const id of ['reflect', 'lightscreen']) {
		const existing = pokemon.side.sideConditions[id];
		if (existing) {
			if (existing.duration !== undefined) existing.duration = Math.max(existing.duration, 5);
		} else if (pokemon.side.addSideCondition(id, pokemon, pokemon.getAbility())) {
			pokemon.side.sideConditions[id].duration = 5;
		}
	}
}

export function resolveForesight(battle: Battle) {
	const state = battle.field.pseudoWeather['foresightmemory'];
	const entries: ForesightMemory[] = state?.entries || [];
	const released = new Set<Pokemon>();
	for (const entry of [...entries].sort((a, b) => a.turn - b.turn)) {
		if (entry.turn > battle.turn || released.has(entry.owner)) continue;
		if (!battle.sides[entry.opponent].pokemonLeft) {
			entries.splice(entries.indexOf(entry), 1);
			continue;
		}
		released.add(entry.owner);
		const target = battle.getAtSlot(entry.slot);
		if (!target?.hp || target.fainted) continue;
		entries.splice(entries.indexOf(entry), 1);
		// The snapshot is a calculation context only: never use it for hits, retaliation or faint bookkeeping.
		// The real owner remains the source, as for ordinary delayed attacks.
		const offense: Pokemon = new (entry.owner.constructor as any)({...entry.set}, entry.owner.side);
		offense.storedStats.spa = entry.spa;
		offense.boosts.spa = entry.boost;
		offense.types = entry.baseTypes.slice();
		offense.getTypes = (excludeAdded, preterastallized) => (preterastallized ? entry.baseTypes : entry.types).slice();
		offense.baseSpecies = {...offense.baseSpecies, types: entry.baseTypes.slice()} as typeof offense.baseSpecies;
		offense.terastallized = entry.tera;
		offense.stellarBoostedTypes = entry.stellar.slice();
		offense.position = entry.position;
		offense.isActive = true;
		const move = battle.dex.getActiveMove('psychic');
		Object.assign(move, {id: 'foresightmemory', name: 'Stored Foresight', type: entry.type,
			basePower: 90, category: 'Special', accuracy: 100, priority: 0, flags: {protect: 1, futuremove: 1},
			secondaries: undefined, secondary: undefined, foresightStored: true});
		// A separate move object avoids recursing through damageCallback. Sharing hitData
		// retains the resolved effectiveness/crit metadata for normal target reactions.
		move.moveHitData = {};
		const calculationMove = {...move};
		move.damageCallback = function (source, defender) {
			Object.assign(calculationMove, move, {damageCallback: undefined});
			return this.actions.getDamage(offense, defender, calculationMove) ?? false;
		};
		const source = entry.owner;
		const active = [battle.activeMove, battle.activePokemon, battle.activeTarget] as const;
		battle.add('-message', `${entry.owner.name}'s stored ${entry.type} attack arrived!`);
		battle.addMove('move', source, move.name, target);
		try {
			battle.actions.trySpreadMoveHit([target], source, move, true);
		} finally {
			battle.setActiveMove(...active);
		}
		// The hit pipeline defers the win check while a surviving source finishes its attack.
		if (battle.checkWin()) break;
	}
	if (!entries.length) battle.field.removePseudoWeather('foresightmemory');
}
