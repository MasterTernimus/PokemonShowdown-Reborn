export function isUltraSuppressedTerrain(battle: Battle) {
	return battle.field.isTerrain(['bewitchedwoodsterrain', 'hauntedterrain', 'holyterrain']);
}

export function recordUltraEgoCombat(battle: Battle, holder: Pokemon) {
	if (!holder.volatiles.ultraegocombat) holder.addVolatile('ultraegocombat', holder, battle.effect);
	const state = holder.volatiles.ultraegocombat;
	if (state) state.combatTurn = battle.turn;
}

/** Rivalry is a direct opposing matchup, including effective composite components. */
export function ultraRivalry(battle: Battle, source: Pokemon, target: Pokemon) {
	return !source.isAlly(target) &&
		!isUltraSuppressedTerrain(battle) &&
		source.hasAbility('ultraego') && target.hasAbility('ultrainstinct');
}

export function ultraGuardAvailable(battle: Battle, source: Pokemon, target: Pokemon, move: ActiveMove) {
	const token = battle.activePokemon === source && battle.activeMove?.id === move.id ? battle.activeMove : move;
	return target.m.ultraInstinctGuardTurn !== battle.turn || target.m.ultraInstinctGuardMove === token;
}

/** One pair of announcements per encounter; ability reactivation is not a new entry. */
export function announceUltraRivalry(battle: Battle, instinct: Pokemon) {
	if (!instinct.isActive || !instinct.hp || instinct.fainted) return;
	for (const ego of battle.getAllActive()) {
		if (!ego.hp || ego.fainted || !ultraRivalry(battle, ego, instinct)) continue;
		const token = ego.m.ultraRivalryEntryToken;
		if (!token) continue;
		const announced = instinct.m.ultraRivalryAnnounced ||= {};
		if (announced[token]) continue;
		announced[token] = true;
		const egoName = ego.illusion?.name || ego.name;
		const instinctName = instinct.illusion?.name || instinct.name;
		battle.add('-message', `${egoName}'s Ego flares defiantly before ${instinctName}'s Instinct!`);
		battle.add('-message', `${instinctName}'s Instinct sharpens, reading the surge of ${egoName}'s Ego!`);
	}
}
