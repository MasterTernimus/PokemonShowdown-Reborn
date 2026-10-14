import {expectedCategory} from './expected-category';

/** Share the target-specific category between damage and reactive hit events. */
export function beastHunterMoveView(move: ActiveMove, source: Pokemon, target: Pokemon): ActiveMove {
	if (move.id !== 'beasthunter' || (move as any).beastHunterPreview || move.isZ || move.isMax) return move;
	const hit = target.getMoveHitData(move) as ReturnType<Pokemon['getMoveHitData']> & {beastHunterCategory?: 'Physical' | 'Special'};
	if (!hit.beastHunterCategory) {
		const preview = {...move, category: 'Special', target: 'normal', beastHunterPreview: true} as ActiveMove;
		hit.beastHunterCategory = expectedCategory(source.battle, source, target, preview) || 'Special';
	}
	return {...move, category: hit.beastHunterCategory, moveHitData: move.moveHitData};
}
