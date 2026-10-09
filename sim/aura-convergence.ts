type AuraMove = ActiveMove & {
	auraCategories?: { [target: string]: 'Physical' | 'Special' },
	auraOriginalCategory?: 'Physical' | 'Special',
};

/** One staged-stat comparison per target and execution; damage modifiers run normally afterwards. */
export function auraConvergenceView(move: ActiveMove, source: Pokemon, target: Pokemon, execution = move): ActiveMove {
	if (!target || !source.hasAbility('auraconvergence') || move.category === 'Status' ||
		!['Fighting', 'Steel'].includes(move.type) || move.damage !== undefined ||
		move.damageCallback || move.ohko) return move;
	const attack = execution as AuraMove;
	attack.auraOriginalCategory ||= move.category;
	const categories = attack.auraCategories ||= {};
	const key = `${target.side.n}:${target.side.pokemon.indexOf(target)}`;
	if (!categories[key]) {
		const physical = source.getStat('atk', false, true) * target.getStat('spd', false, true);
		const special = source.getStat('spa', false, true) * target.getStat('def', false, true);
		categories[key] = physical === special ? attack.auraOriginalCategory : physical > special ? 'Physical' : 'Special';
	}
	execution.moveHitData ||= {};
	return { ...move, category: categories[key], moveHitData: execution.moveHitData };
}
