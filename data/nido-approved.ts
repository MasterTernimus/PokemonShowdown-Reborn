import type {AbilityDataTable} from '../sim/dex-abilities';
export const NidoDescriptions = {
 patriarchswrath: {shortDesc: 'Power Drill + Whiplash; adaptive Poison/Ground category; horn/tail +1 critical stage.', desc: 'Full Power Drill boosts drill and horn moves by 1.5x, or 2x with protection bypass on its supported rocky fields. Full Whiplash grants +1 accuracy on entry and 1.5x tail-move power. Poison and Ground attacks use the higher Attack/Defense or Sp. Atk/Sp. Def ratio to choose their damage category. Horn and tail moves gain one critical-hit stage. No blanket power multiplier.'},
 matriarchsvigil: {shortDesc: 'Thick Fat + Aroma Veil + Friend Guard; once/entry, surviving a hit across half HP gives self or an adjacent ally +1 Def/SpD.', desc: 'Full local Thick Fat, Aroma Veil and Friend Guard. Once per genuine entry, after this Pokemon or an adjacent ally survives an opposing whole damaging move that takes it from above half HP to half HP or less, the injured Pokemon gains +1 Defense and +1 Sp. Def after all hits. One shared activation per entry. Residual damage, friendly fire and Substitute-only damage do not qualify. Ability restarts do not reset the budget. Friend Guard reduces damage to other allies by 25%, independently stacking with the separate Rivalry passive. Neither ally reduction protects its own holder.'},
};
export function installNidoApproved(abilities: AbilityDataTable) {
 const original = abilities.sovereignarsenal;
 abilities.patriarchswrath = {...original, id: "patriarchswrath" as ID, name: "Royal Onslaught", num: 11444,
  onStart: abilities.whiplash.onStart,
  onModifyMove(move, source, target) { original.onModifyMove!.call(this, move, source, target); abilities.powerdrill.onModifyMove!.call(this, move, source, target); },
  onBasePowerPriority: 21,
  onBasePower(power, source, target, move) { abilities.powerdrill.onBasePower!.call(this, power, source, target, move); abilities.whiplash.onBasePower!.call(this, power, source, target, move); },
 };
 abilities.matriarchsvigil = {...abilities.thickfat, ...abilities.aromaveil, ...abilities.friendguard, id: "matriarchsvigil" as ID, name: "Royal Aegis", num: 11445,
  onAnyAfterDamageApplied(damage, target, source, effect) {
   const holder = this.effectState.target;
   if (holder.m.matriarchVigilUsed || damage <= 0 || !source || source.isAlly(target) || effect?.effectType !== 'Move' || effect.category === 'Status' || !target.isAlly(holder) || (target !== holder && !holder.isAdjacent(target)) || target.hp > target.maxhp / 2 || target.hp + damage <= target.maxhp / 2) return;
   const pending = holder.m.matriarchVigilPending || (holder.m.matriarchVigilPending = []);
   pending.push({target, source, move: effect});
  },
  onAnyAfterAttackResolved(source, target, move) {
   const holder = this.effectState.target;
   const pending = holder.m.matriarchVigilPending || [];
   holder.m.matriarchVigilPending = pending.filter((p: any) => p.source !== source || p.move !== move);
   if (holder.m.matriarchVigilUsed || !holder.hp) return;
   for (const event of pending) if (event.source === source && event.move === move && event.target.hp && event.target.isActive) {
    holder.m.matriarchVigilUsed = true;
    this.boost({def: 1, spd: 1}, event.target, holder); break;
   }
  },
 };
}
