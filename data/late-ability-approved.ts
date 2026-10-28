import type {AbilityDataTable} from '../sim/dex-abilities';
import {applySereneGrace} from './ally-serene-grace';
export function installLateAbilityApproved(abilities: AbilityDataTable) {
 const table = abilities as any;
 table.voidomen.onAllyChargeMovePriority = -100;
 table.voidomen.onAllyChargeMove = function (this: Battle, source: Pokemon) {
  const holder = this.effectState.target;
  if (!holder.hp || !holder.isActive || !source.isAlly(holder) || source.volatiles.voidomenchargespent) return;
  source.addVolatile('voidomenchargespent', source, this.effect);
  this.add('-activate', source, 'ability: Void Omen');
  return false;
 };
 table.voidomen.onModifyMove = function (this: Battle, move: ActiveMove) { applySereneGrace(move, 'voidomen'); };
 const reach = table.longreach;
 for (const key of Object.keys(reach).filter(key => key.startsWith('on'))) {
  const addition = reach[key], previous = table.heatcoil[key];
  if (typeof addition !== 'function') { if (previous === undefined) table.heatcoil[key] = addition; continue; }
  table.heatcoil[key] = function (this: Battle, ...args: any[]) {
   const first = typeof previous === 'function' ? previous.apply(this, args) : undefined;
   const second = addition.apply(this, args);
   return second === undefined ? first : second;
  };
 }
 const inversionMove = table.inversion.onModifyMove;
 table.inversion.onModifyMove = function (this: Battle, move: ActiveMove, source: Pokemon, target: Pokemon) {
  inversionMove?.call(this, move, source, target);
  table.infiltrator.onModifyMove.call(this, move, source, target);
  if (move.id === 'hypnosis') move.accuracy = true;
 };
 const mountainBoost = table.ironmountain.onTryBoost;
 table.ironmountain.onTryBoost = function (this: Battle, boosts: SparseBoostsTable, target: Pokemon, source: Pokemon, effect: Effect) {
  mountainBoost?.call(this, boosts, target, source, effect);
  const component = this.dex.abilities.get('hypercutter');
  if (!this.suppressingAbility(target, component)) return table.hypercutter.onTryBoost.call(this, boosts, target, source, effect);
 };
 table.venombastion.onModifyMove = function (this: Battle, move: ActiveMove, source: Pokemon) {
  (move as any).venomBastionPoisonedTargets = source.foes().filter(p => ['psn', 'tox'].includes(p.status));
 };
 table.venombastion.onSourceAfterDamageApplied = function (this: Battle, damage: number, target: Pokemon, source: Pokemon, effect: ActiveMove) {
  if (damage <= 0 || !source || source.m.venomBastionSealUsed || source.isAlly(target) || !target.hp || !['psn', 'tox'].includes(target.status) || !(effect as any)?.venomBastionPoisonedTargets?.includes(target) || effect?.effectType !== 'Move' || effect.category === 'Status' || !(effect.types || [effect.type]).some(type => ['Poison', 'Steel'].includes(type))) return;
  const pending = source.m.venomBastionSealPending || (source.m.venomBastionSealPending = []);
  if (!pending.some((p: any) => p.move === effect && p.target === target)) pending.push({target, move: effect});
 };
 table.venombastion.onAfterAttackResolved = function (this: Battle, source: Pokemon, target: Pokemon, move: ActiveMove) {
  const pending = source.m.venomBastionSealPending || [];
  source.m.venomBastionSealPending = pending.filter((p: any) => p.move !== move);
  if (source.m.venomBastionSealUsed || !source.hp || !source.isActive) return;
  for (const event of pending) {
   if (event.move !== move || !event.target.hp || event.target.volatiles.healblock) continue;
   if (event.target.addVolatile('healblock', source, this.effect)) {
    event.target.volatiles.healblock.duration = 2;
    source.m.venomBastionSealUsed = true; break;
   }
  }
 };
}
