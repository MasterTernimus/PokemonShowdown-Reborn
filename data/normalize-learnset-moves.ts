import type { LearnsetDataTable, MoveSource } from '../sim/dex-species';

// Canonical move IDs shared by the imported and current-generation learnsets.
const renamedMoves: { [id: string]: string } = {
	mudslap: 'mudbarrage', hijumpkick: 'highjumpkick', vicegrip: 'visegrip',
	esperwings: 'esperwing', sizzleslide: 'sizzlyslide', judgement: 'judgment',
};
export function normalizeLearnsetMoves(table: LearnsetDataTable) {
	const methods = 'MTLREVDSC';
	for (const entry of Object.values(table)) {
		const moves = entry.learnset;
		if (moves) {
			for (const [oldId, newId] of Object.entries(renamedMoves)) {
				if (!moves[oldId]) continue;
				moves[newId] = [...new Set([...(moves[newId] || []), ...moves[oldId]])];
				delete moves[oldId];
			}
			for (const sources of Object.values<MoveSource[]>(moves)) {
				sources.sort((a, b) => Number(b[0]) - Number(a[0]) || methods.indexOf(a[1]) - methods.indexOf(b[1]));
			}
		}
		for (const event of entry.eventData || []) {
			if (event.moves) event.moves = event.moves.map((id: string) => renamedMoves[id] || id);
		}
	}
}
