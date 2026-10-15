// Temporary defensive overlay: permanent types, added types and Tera are never mutated.
const overlays = new WeakMap<Pokemon, {move: ActiveMove, type: string}>();
const targets = new WeakMap<ActiveMove, Set<Pokemon>>();
export function arsenalType(pokemon: Pokemon) { return pokemon.terastallized ? undefined : overlays.get(pokemon)?.type; }
export function beginArsenal(battle: Battle, target: Pokemon, move: ActiveMove) {
 if (target.terastallized || overlays.has(target) || move.category === 'Status') return;
 // Alphabetical first genuine chart resistance; no fabricated reduction for ??? or Stellar.
 const type = battle.dex.types.all().filter(t => t.name !== 'Stellar' && battle.dex.getImmunity(move.type, t.name) && battle.dex.getEffectiveness(move.type, t.name) < 0).sort((a,b) => a.name.localeCompare(b.name))[0]?.name;
 if (!type) return;
 const active = battle.activeMove || move;
 overlays.set(target, {move: active, type});
 let set = targets.get(active); if (!set) targets.set(active, set = new Set()); set.add(target);
 battle.add('-start', target, 'typechange', type, '[from] ability: Adaptive Arsenal');
}
export function endArsenal(battle: Battle, move: ActiveMove | null) {
 if (!move) return;
 for (const target of targets.get(move) || []) {
  if (overlays.get(target)?.move !== move) continue;
  overlays.delete(target);
  battle.add('-start', target, 'typechange', target.getTypes().join('/'), '[silent]');
 }
 targets.delete(move);
}
