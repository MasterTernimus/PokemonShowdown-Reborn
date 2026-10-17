import {expectedCategory} from './expected-category';

/** Category and flags belong to each target, and remain fixed through that target's hit callbacks. */
export function encoreAriaView(move: ActiveMove, source: Pokemon, target: Pokemon): ActiveMove {
	if (!(move as any).encoreAdaptive || (move as any).encorePreview) return move;
	const hit = target.getMoveHitData(move) as ReturnType<Pokemon['getMoveHitData']> & {encoreCategory?: 'Physical' | 'Special'};
	if (!hit.encoreCategory) {
		const preview = {...move, category: 'Special', target: 'normal', encorePreview: true} as ActiveMove;
		hit.encoreCategory = expectedCategory(source.battle, source, target, preview, true) || 'Special';
	}
	const flags = {...move.flags};
	delete flags.sound;
	delete flags.dance;
	flags[hit.encoreCategory === 'Physical' ? 'dance' : 'sound'] = 1;
	return {...move, category: hit.encoreCategory, flags, moveHitData: move.moveHitData};
}

/** Post-move consumers may qualify through either successful branch, but no hit has both flags. */
export function encoreAriaAfterHits(move: ActiveMove) {
	if (!(move as any).encoreAdaptive) return;
	const categories = (move.hitTargets || []).map(target => (target.getMoveHitData(move) as any).encoreCategory);
	(move as any).encoreDance = categories.includes('Physical');
	(move as any).encoreSound = categories.includes('Special');
	delete move.flags.sound;
	delete move.flags.dance;
	if ((move as any).encoreSound) move.flags.sound = 1;
	else if ((move as any).encoreDance) move.flags.dance = 1;
}
