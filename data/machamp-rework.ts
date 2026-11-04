import type {AbilityDataTable} from '../sim/dex-abilities';

export function installMachampRework(abilities: AbilityDataTable) {
 abilities.gritandglory = {
  ...abilities.guts, name: 'Grit and Glory', num: 12083,
  shortDesc: 'Guts. Attack KOs against foes restore 1/8 max HP.',
  desc: 'Attack is 1.5x while statused; burn does not weaken physical attacks. Knocking out an opponent with an attack restores 1/8 max HP.',
  onSourceAfterFaint(length, target, source, effect) {
   if (effect?.effectType === 'Move' && !source.isAlly(target) && source.hp) this.heal(source.baseMaxhp / 8 * length, source);
  },
 };
 abilities.fourthholdguard = {
  name: 'Fourthhold Guard', num: 12084, rating: 4, flags: {breakable: 1},
  shortDesc: 'Critical-hit immunity. First foe attack each turn deals 25% less damage.',
  desc: 'Cannot be critically hit. The first opposing attack to damage its HP each turn deals 25% less damage across all hits. Switching or changing abilities does not refresh this protection.',
  onCriticalHit: false,
  onDamagePriority: 0,
  onDamage(damage, target, source, move) {
   if (!source || source.isAlly(target) || move?.effectType !== 'Move' || move.category === 'Status') return;
   const token = this.activePokemon === source && this.activeMove?.id === move.id ? this.activeMove : move;
   if (target.m.fourthholdTurn === this.turn && target.m.fourthholdMove !== token) return;
   return this.modifyAbilityGuard(damage, 0.75);
  },
  onAfterDamageApplied(damage, target, source, move) {
   if (damage <= 0 || !source || source.isAlly(target) || move?.effectType !== 'Move' || move.category === 'Status' || target.m.fourthholdTurn === this.turn) return;
   target.m.fourthholdTurn = this.turn;
   target.m.fourthholdMove = this.activePokemon === source && this.activeMove?.id === move.id ? this.activeMove : move;
  },
 };
 abilities.perfectform = {
  ...abilities.ironfist, name: 'Perfect Form', num: 12085,
  shortDesc: 'Punches have 1.4x power and ignore positive Defense stages.',
  desc: 'Punching attacks gain 40% power and ignore the target’s positive Defense stages. Accuracy checks still apply.',
  onModifyMove(move) { if (move.flags.punch) move.ignorePositiveDefensive = true; },
 };
 abilities.titansknuckles = {
  ...abilities.ironfist, name: "Titan's Knuckles", num: 12086,
  shortDesc: 'Punches: 1.4x power, break screens. Critical hits heal 1/8 HP once per turn.',
  desc: 'Punching attacks gain 40% power and break Reflect, Light Screen and Aurora Veil before damage. A critical hit damaging an opponent or its Substitute restores 1/8 max HP, once per turn.',
  onModifyMove(move) {
   if (!move.flags.punch) return;
   const previous = move.onTryHit;
   move.onTryHit = function (target, source, attack) {
    const result = typeof previous === 'function' ? previous.call(this, target, source, attack) : previous;
    if (result !== undefined && !result) return result;
    for (const id of ['reflect', 'lightscreen', 'auroraveil']) target.side.removeSideCondition(id);
    return result;
   };
  },
  onSourceDamagingHit(damage, target, source, move) {
   if (damage <= 0 || source.isAlly(target) || !source.hp || !target.getMoveHitData(move).crit || source.m.titanHealTurn === this.turn) return;
   source.m.titanHealTurn = this.turn;
   this.heal(source.baseMaxhp / 8, source, source, this.effect);
  },
 };
 abilities.titansknuckles.onSourceAfterSubDamage = abilities.titansknuckles.onSourceDamagingHit;
}
