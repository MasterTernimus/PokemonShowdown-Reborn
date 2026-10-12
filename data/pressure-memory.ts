/** Persistent Pokemon identities: switching, Transform and ability changes do not reset this budget. */
export function pressureAttempt(battle: Battle, source: Pokemon, target: Pokemon): boolean {
	// Cold Eclipse retains its repeatable -2 entry effect and does not spend the ordinary allowance.
	if (battle.field.isTerrain('coldeclipseterrain')) return true;
	const targets: Pokemon[] = source.m.pressureTargets ||= [];
	if (targets.includes(target)) return false;
	// An eligible attempt is spent even when stat-drop protection or reflection blocks the drop.
	targets.push(target);
	return true;
}

export const PressureLimitText = 'Outside Cold Eclipse, its Defense and Sp. Def drop is attempted only once per opposing Pokemon per battle for each Pressure user. Switching, Transform and ability loss or regain do not reset that allowance; a blocked or reflected attempt spends it. Cold Eclipse retains repeatable -2 drops on entry and neither spends nor resets the ordinary allowance.';
