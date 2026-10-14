import type {AbilityDataTable} from '../sim/dex-abilities';

export function installFireEmblemSignatures(abilities: AbilityDataTable) {
 abilities.apocalypticflame = {
  ...abilities.owntempo,
  name: 'Apocalyptic Flame', num: 11454, rating: 3.5,
  onSourceDamagingHit(damage, target, source, move) {
   if (damage <= 0 || target.isAlly(source) || move.category !== 'Physical' || source.m.apocalypticFlameTurn === this.turn) return;
   if (this.effectState.strikeMove !== move) {
    this.effectState.strikeMove = move;
    this.effectState.strikeTargets = [];
    this.effectState.targetOrder = source.foes(true).slice();
   }
   if (!this.effectState.strikeTargets.includes(target)) this.effectState.strikeTargets.push(target);
  },
  onAfterMove(source, target, move) {
   if (this.effectState.strikeMove !== move) return;
   const damaged: Pokemon[] = this.effectState.strikeTargets;
   const order: Pokemon[] = this.effectState.targetOrder;
   delete this.effectState.strikeMove;
   delete this.effectState.strikeTargets;
   delete this.effectState.targetOrder;
   if (!source.hp || source.m.apocalypticFlameTurn === this.turn) return;
   source.m.apocalypticFlameTurn = this.turn;
   const foe = order.find(p => damaged.includes(p) && p.hp && p.isActive);
   if (foe) this.boost({atk: -1}, foe, source, this.effect);
  },
 };
 abilities.rupturedheaven = {
  ...abilities.sharpness,
  name: 'Ruptured Heaven', num: 11455, rating: 4,
  onModifyMove(move) { if (move.flags.slicing) delete move.flags.contact; },
 };
 abilities.burningquake = {
  ...abilities.superluck,
  name: 'Burning Quake', num: 11456, rating: 3.5,
  onSourceDamagingHit(damage, target, source, move) {
   if (damage > 0 && !target.isAlly(source) && target.getMoveHitData(move).crit && source.m.burningQuakeTurn !== this.turn) {
    this.effectState.criticalMove = move;
   }
  },
  onAfterMove(source, target, move) {
   if (this.effectState.criticalMove !== move) return;
   delete this.effectState.criticalMove;
   if (!source.hp || source.m.burningQuakeTurn === this.turn) return;
   source.m.burningQuakeTurn = this.turn;
   this.boost({spe: 1}, source, source, this.effect);
  },
 };
}
