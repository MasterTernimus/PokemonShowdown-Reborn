/** Named moves are shared by the ability and its public reference command. */
export const RelicBeamMoves = new Set([
	'aurorabeam', 'bubblebeam', 'chargebeam', 'dynamaxcannon', 'eternabeam',
	'flashcannon', 'fleurcannon', 'icebeam', 'lusterpurge', 'meteorbeam',
	'moongeistbeam', 'psybeam', 'signalbeam', 'solarbeam', 'steelbeam',
	'beaconbeam', 'hydropump', 'thunderbolt', 'powergem', 'dazzlinggleam',
]);

export const StarLensExtras = new Set(['photongeyser', 'luminacrash']);

export function qualifiesForStarLens(move: Pick<ActiveMove, 'id' | 'flags'>) {
	return StarLensExtras.has(move.id) || qualifiesForRelicBeam(move);
}

export function qualifiesForRelicBeam(move: Pick<ActiveMove, 'id' | 'flags'>) {
	return (move as Partial<ActiveMove>).name === 'Beacon Beam' ||
		RelicBeamMoves.has(move.id) || !!move.flags.pulse || !!move.flags.bullet;
}
