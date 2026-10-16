import type {MoveDataTable} from '../sim/dex-moves';
export function installLoreScreenRules(moves: MoveDataTable) {
 for (const id of ['reflect', 'lightscreen'] as const) {
  const original = moves[id].condition!.onAnyModifyDamage!;
  moves[id].condition!.onAnyModifyDamage = function (damage, source, target, move) {
   if (this.movehasType(move, 'Ghost') && source.hasAbility('unboundspirit')) return;
   return original.call(this, damage, source, target, move);
  };
 }
}
