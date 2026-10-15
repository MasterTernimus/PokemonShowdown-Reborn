import type {AbilityDataTable} from '../sim/dex-abilities';
import {beginArsenal} from '../sim/adaptive-arsenal';
export const AdaptiveArsenalDescriptions = {
 adaptivearsenal: {name: 'Adaptive Arsenal', shortDesc: 'Temporary resisting type when attacked; Multi-Attack spreads at 1.2x (??? 1.8x).', desc: 'Before an incoming damaging move, temporarily uses the alphabetically first type with a genuine chart resistance to its type, never a chart immunity. Keeps that type through all hits and restores underlying typing after the whole move, including failure or KO. No change against ??? or Stellar (no chart resistance), or while Terastallized. Ordinary Multi-Attack targets all opposing Pokémon at 1.2x power without a spread penalty; ???-type Multi-Attack receives another 1.5x (1.8x total). RKS System and Memory behavior remain separate.'},
};
export function installAdaptiveArsenal(abilities: AbilityDataTable) {
 abilities.adaptivearsenal = {
  name: 'Adaptive Arsenal', num: 11501, rating: 4, flags: {breakable: 1},
  onTryHitPriority: 1,
  onTryHit(target, source, move) { if (target !== source) beginArsenal(this, target, move); },
  onModifyMove(move) { if (move.id === 'multiattack' && !move.isZ && !move.isMax) { move.target = 'allAdjacentFoes'; (move as any).fullDamageSpread = true; } },
  onBasePower(basePower, source, target, move) { if (move.id === 'multiattack' && !move.isZ && !move.isMax) return this.chainModify(move.type === '???' ? 1.8 : 1.2); },
 };
}
