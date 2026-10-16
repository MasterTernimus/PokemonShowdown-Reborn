/** These existing field-clearing moves use Ice Spinner's Aura-first behavior. */
export const auraClearingMoves = new Set(['infernalrage', 'winddance', 'airstreamassault']);

export function clearMoveAura(this: Battle, source: Pokemon, move: ActiveMove): boolean {
 const state = move as ActiveMove & {loreFieldHit?: boolean; loreAuraChecked?: boolean; loreAuraConsumed?: boolean};
 if (!source.hp) return false;
 state.loreFieldHit = true;
 if (!state.loreAuraChecked) {
  state.loreAuraChecked = true;
  if (this.field.auraField) {
   state.loreAuraConsumed = true;
   this.field.clearTerrain('mid');
  }
 }
 return !!state.loreAuraConsumed;
}

export function skipClearingField(source: Pokemon, move: ActiveMove): boolean {
 const state = move as ActiveMove & {loreFieldHit?: boolean; loreAuraConsumed?: boolean};
 return auraClearingMoves.has(move.id) && (!source.hp || !state.loreFieldHit || !!state.loreAuraConsumed);
}
