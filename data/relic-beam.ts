/** Named moves are shared by the ability and its public reference command. */
export const RelicBeamMoves = new Set([
	'aurorabeam', 'bubblebeam', 'chargebeam', 'dynamaxcannon', 'eternabeam',
	'flashcannon', 'fleurcannon', 'icebeam', 'lusterpurge', 'meteorbeam',
	'moongeistbeam', 'psybeam', 'signalbeam', 'solarbeam', 'steelbeam',
	'hydropump', 'thunderbolt', 'powergem', 'dazzlinggleam',
]);

export function qualifiesForRelicBeam(move: Pick<ActiveMove, 'id' | 'flags'>) {
	return RelicBeamMoves.has(move.id) || !!move.flags.pulse || !!move.flags.bullet;
}
