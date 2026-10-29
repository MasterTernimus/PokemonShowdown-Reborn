import {adaptive} from './rejuvenation-signature-moves';
import type {MoveDataTable} from '../sim/dex-moves';

const cost = ' After the whole attempted move resolves, the user pays 1/4 max HP unless this move directly knocked out an opponent. Misses, protection, immunity and Substitute-only damage still cost HP. This is an HP cost, not recoil.';
export const FinisherMoveDescriptions = {
 lastrespects: {name: 'Last Respects', shortDesc: 'Adaptive; 50 +20 per fainted teammate (max 140).', desc: 'Uses the higher staged Attack or Sp. Atk (Special on ties), against Defense or Sp. Def respectively. Ghost attack with 100% accuracy and 10 PP. Power is 50 plus 20 per currently fainted teammate, capped at 140. Revival removes that teammate from the count; repeated fainting does not accumulate power.'},
	guillotine: {name: 'Guillotine', shortDesc: '120 BP Steel slicing attack; no opposing KO costs 1/4 HP.', desc: '120-power physical Steel slicing contact attack with 100% accuracy.' + cost},
	horndrill: {name: 'Horn Drill', shortDesc: '130 BP Rock drill; high crit; no opposing KO costs 1/4 HP.', desc: '130-power physical Rock drill contact attack with 90% accuracy and a high critical-hit ratio.' + cost},
	fissure: {name: 'Fissure', shortDesc: '110 BP; 1.5x damage vs half-HP targets; no KO costs 1/4 HP.', desc: '110-power physical Ground attack with 100% accuracy. Deals 1.5x damage when the target is at half maximum HP or less. Existing field effects, including failure on New World, remain.' + cost},
	sheercold: {name: 'Sheer Cold', shortDesc: 'Adaptive; 130 BP; 30% frostbite; no KO costs 1/4 HP.', desc: '130-power Ice attack with 90% accuracy and a 30% chance to inflict frostbite. Uses the higher staged Attack or Sp. Atk (Special on ties), against Defense or Sp. Def respectively. Items, burn, screens and opposing defenses do not affect this category comparison.' + cost},
};

export function installFinisherMoves(moves: MoveDataTable) {
 moves.lastrespects.onModifyMove = adaptive;
 moves.lastrespects.category = 'Special';
 moves.lastrespects.basePowerCallback = function(source) { return Math.min(140, 50 + 20 * source.side.pokemon.filter(p => p !== source && p.fainted).length); };
	for (const id of Object.keys(FinisherMoveDescriptions)) delete moves[id as ID].ohko;
	Object.assign(moves.guillotine, {type: 'Steel', category: 'Physical', basePower: 120, accuracy: 100,
		flags: {...moves.guillotine.flags, slicing: 1}});
	Object.assign(moves.horndrill, {type: 'Rock', category: 'Physical', basePower: 130, accuracy: 90, critRatio: 2,
		flags: {...moves.horndrill.flags, drill: 1}});
	Object.assign(moves.fissure, {type: 'Ground', category: 'Physical', basePower: 110, accuracy: 100});
	Object.assign(moves.sheercold, {type: 'Ice', category: 'Special', basePower: 130, accuracy: 90, onModifyMove: adaptive,
		secondary: {chance: 30, status: 'frz'}});
}
