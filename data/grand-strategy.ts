import type {Battle} from '../sim/battle';
import type {Pokemon} from '../sim/pokemon';
import type {ActiveMove} from '../sim/dex-moves';

export function grandStrategyPrepared(source: Pokemon, target: Pokemon, move: ActiveMove): boolean {
 return move.category === 'Physical' && source.hasAbility('grandstrategy') &&
  !!(move as any).grandStrategyTargets?.includes(target);
}
function removeOwner(battle: Battle, target: Pokemon, owner: Pokemon) {
 const state = target.volatiles.prepared;
 if (!state) return;
 state.owners = (state.owners || []).filter((p: Pokemon) => p !== owner);
 if (!state.owners.length) target.removeVolatile('prepared');
}
export function clearGrandStrategyMarks(battle: Battle, owner: Pokemon) {
 for (const target of battle.getAllActive()) { removeOwner(battle, target, owner); updatePreparedIndicator(battle, target); }
}
export const GrandStrategy: import('../sim/dex-abilities').AbilityData = {
 name: 'Grand Strategy', num: 10125, rating: 4, flags: {},
 onStart(pokemon) { this.dex.abilities.get('moldbreaker').onStart?.call(this, pokemon); if (!pokemon.illusion) pokemon.m.grandStrategyRevealed = true; for (const foe of pokemon.foes()) updatePreparedIndicator(this, foe); },
 onModifyMove(move, source, target) {
  this.dex.abilities.get('moldbreaker').onModifyMove?.call(this, move, source, target);
  if (move.category === 'Physical') {
   (move as any).grandStrategyTargets = source.foes().filter(foe => foe.volatiles.prepared?.owners?.includes(source));
  }
 },
 onResidualOrder: 28,
 onResidual(pokemon) {
  if (!pokemon.status || pokemon.m.grandStrategyRecoveryUsed || !pokemon.cureStatus()) return;
  pokemon.m.grandStrategyRecoveryUsed = true;
  this.add('-activate', pokemon, 'ability: Grand Strategy');
  if (pokemon.boosts.accuracy < 0) {
   pokemon.setBoost({accuracy: 0});
   this.add('-setboost', pokemon, 'accuracy', 0, '[from] ability: Grand Strategy');
  }
  pokemon.addVolatile('laserfocus', pokemon, this.effect);
  // Applied after this turn's duration tick: the standard next-turn window needs one remaining tick.
  if (pokemon.volatiles.laserfocus) pokemon.volatiles.laserfocus.duration = 1;
 },
};
export const GrandStrategyDescription = {
 shortDesc: "Mold Breaker; team hits prepare foes while active; once-battle cure grants Laser Focus.",
 desc: "Mold Breaker. While the holder is active, its team's attacks dealing opposing HP damage prepare that foe for the holder. Its next physical HP-damaging attack consumes the mark after the whole attack, ignoring positive defensive stages and Reflect, Light Screen and Aurora Veil. That attack cannot rearm the mark. Marks do not stack, survive the holder switching out, and clear when the foe switches or faints, or the holder faints or loses this ability. Once per battle, an end-of-turn major-status cure clears negative accuracy stages and grants Laser Focus through the next turn; switching clears Laser Focus. Suppression delays the cure; other cures do not spend it.",
};

export function updatePreparedIndicator(battle: Battle, target: Pokemon) {
 const state = target.volatiles.prepared;
 if (!state) return;
 state.owners = (state.owners || []).filter((p: Pokemon) => p.hp && (p.ability === 'grandstrategy' || p.m.perfectForesightAbility === 'grandstrategy'));
 if (!state.owners.length) { target.removeVolatile('prepared'); return; }
 const visible = state.owners.filter((p: Pokemon) => p.m.grandStrategyRevealed && !p.illusion);
 const key = visible.map((p: Pokemon) => p.side.id + ':' + p.position).join(',');
 if (key === state.visibleKey) return;
 if (state.visibleKey) battle.add('-end', target, 'Prepared');
 state.visibleKey = key;
 for (const owner of visible) battle.add('-start', target, 'Prepared', '[of] ' + owner);
}
export function grandStrategyRecordHit(battle: Battle, source: Pokemon, target: Pokemon, move: ActiveMove, damage: number) {
 if (!(damage > 0) || move.category === 'Status') return;
 const hits: {owner: Pokemon; target: Pokemon; consumed: boolean}[] = (move as any).grandStrategyHits ||= [];
 for (const side of battle.sides) for (const owner of side.pokemon) {
  if (!owner.hp || !owner.isActive || !owner.isAlly(source) || owner.isAlly(target) ||
   !owner.hasAbility('grandstrategy')) continue;
  if (!hits.some(hit => hit.owner === owner && hit.target === target)) {
   hits.push({owner, target, consumed: owner === source && grandStrategyPrepared(source, target, move)});
  }
 }
}
export function grandStrategyAfterMove(battle: Battle, source: Pokemon, move: ActiveMove) {
 const hits: {owner: Pokemon; target: Pokemon; consumed: boolean}[] = (move as any).grandStrategyHits || [];
 for (const hit of hits) {
  const {owner, target} = hit;
  if (hit.consumed) removeOwner(battle, target, owner);
  else if (owner.hp && owner.isActive && target.hp && target.isActive &&
   owner.hasAbility('grandstrategy') && !target.volatiles.prepared?.owners?.includes(owner)) {
   target.addVolatile('prepared', owner, battle.dex.abilities.get('grandstrategy'));
  }
  updatePreparedIndicator(battle, target);
 }
 delete (move as any).grandStrategyHits;
}
