import type {AbilityDataTable} from '../sim/dex-abilities';
import {skipPassiveComponent} from './passive-ability-cleanup';
export const ChampionMeteorDescriptions = {
 championscommand: {name: "Champion's Command", shortDesc: 'Physical STAB Hyper Beam; 25% through Protect; direct opposing KO skips recharge.', desc: "Ordinary Hyper Beam remains Normal, uses Attack against Defense and receives ordinary STAB without stacking with Normal typing. Deals 25% damage through ordinary Protect without removing it; Max Guard blocks. Only a direct opposing KO skips recharge."},
 meteorcore: {name: 'Meteor Core', shortDesc: 'Meteor Mash: +1 Attack after opposing HP damage if its own boost did not trigger.', desc: 'After an ordinary Meteor Mash damages opposing HP, the living active user attempts one +1 Attack boost if that use did not already trigger its Attack boost. Once per entire move, including extra hits. Normal stat-change rules apply. No Iron Fist.'},
};
export function installChampionMeteor(abilities: AbilityDataTable) {
 abilities.championscommand = {
  name: "Champion's Command", num: 11499, rating: 3, flags: {},
  onModifyMove(move, source) {
   if (skipPassiveComponent(this, source, 'championscommand') || move.id !== 'hyperbeam' || move.isZ || move.isMax) return;
   move.type = 'Normal'; move.category = 'Physical'; move.forceSTAB = true;
  },
  onAnyAfterDamageApplied(damage, target, source, move) {
   if (source !== this.effectState.target || !move || move.id !== 'hyperbeam' || (move as ActiveMove).isZ || (move as ActiveMove).isMax || target.isAlly(source) || damage <= 0) return;
   if (!target.hp) (this.activeMove as any).championKO = true;
  },
  onAnyAfterSubDamage(damage, target, source, move) {
   if (source === this.effectState.target && damage > 0 && move.id === 'hyperbeam' && !move.isZ && !move.isMax) (this.activeMove as any).championSubHit = true;
  },
  onAnyAfterAttackResolved(source, target, move) {
   if (source === this.effectState.target && source.hp && (move as any).championSubHit && !(move as any).championKO) source.addVolatile('mustrecharge');
   if (source === this.effectState.target && move.id === 'hyperbeam' && !move.isZ && !move.isMax && (move as any).championKO) source.removeVolatile('mustrecharge');
  },
 };
 abilities.meteorcore = {
  name: 'Meteor Core', num: 11500, rating: 3, flags: {},
  onModifyMove(move, source) {
   if (skipPassiveComponent(this, source, 'meteorcore') || move.id !== 'meteormash' || move.isZ || move.isMax) return;
   move.secondaries = move.secondaries?.map(secondary => {
    if (!secondary.self?.boosts?.atk) return secondary;
    const original = secondary.self.onHit;
    return {...secondary, self: {...secondary.self, onHit(target, attacker, activeMove) {
     (this.activeMove as any).meteorBoostTriggered = true;
     if (typeof original === 'function') return original.call(this, target, attacker, activeMove);
    }}};
   });
  },
  onAnyAfterDamageApplied(damage, target, source, move) {
   if (source === this.effectState.target && move?.id === 'meteormash' && !(move as ActiveMove).isZ && !(move as ActiveMove).isMax && damage > 0 && !target.isAlly(source)) (this.activeMove as any).meteorHPDamage = true;
  },
  onAnyAfterAttackResolved(source, target, move) {
   if (skipPassiveComponent(this, source, 'meteorcore') || source !== this.effectState.target || !source.hp || !source.isActive || move.id !== 'meteormash' || move.isZ || move.isMax || !(move as any).meteorHPDamage || (move as any).meteorSettled) return;
   (move as any).meteorSettled = true;
   if (!(move as any).meteorBoostTriggered) this.boost({atk: 1}, source, source, this.effect);
  },
 };
}
