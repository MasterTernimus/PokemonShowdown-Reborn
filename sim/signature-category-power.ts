/** Collect category-only power bonuses once per hit. Shared and defensive effects use their ordinary phases. */
export function categoryPower(move: ActiveMove, category: 'Physical' | 'Special', multiplier: number): number {
	if (!move.signatureLearnedCategory || move.signatureLearnedCategory === move.category || move.category === 'Status') {
		return move.category === category ? multiplier : 1;
	}
	const totals = move.signaturePowerTotals ||= { Physical: 1, Special: 1 };
	const before = Math.max(totals.Physical, totals.Special);
	totals[category] *= multiplier;
	// Delay rounding until both categories' offensive power and damage hooks finish.
	if (totals.defer) return 1;
	return Math.max(totals.Physical, totals.Special) / before;
}
