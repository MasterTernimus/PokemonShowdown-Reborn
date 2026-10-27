import type {AbilityDataTable} from '../sim/dex-abilities';
import {skipPassiveComponent} from './passive-ability-cleanup';

export const FamilyReplacementSlots = {
 slowbrogalar: {0: 'Shellder Artillery'},
 sinistcha: {0: 'Tea Ceremony'},
 sinistchamasterpiece: {0: 'Tea Ceremony'},
 kangaskhanmega: {0: 'Family Guardian'},
};
export const FamilyReplacementPassives = {
 slowbrogalar: ['quickdraw'], sinistcha: ['hospitality'],
 sinistchamasterpiece: ['hospitality'], kangaskhanmega: ['parentalbond'],
};
export const FamilyReplacementComponents = {
 shellderartillery: ['megalauncher', 'oblivious'],
 teaceremony: ['stickyhold', 'aromaveil'],
 familyguardian: ['friendguard', 'healer'],
};
export const FamilyReplacementDescriptions = {
 shellderartillery: {
  shortDesc: "Mega Launcher + Oblivious.",
  desc: "Full local Mega Launcher gives pulse and bullet moves 1.5x power. Full local Oblivious prevents infatuation, Captivate, Taunt and Intimidate Attack drops, and cures infatuation and Taunt.",
 },
 teaceremony: {
  shortDesc: "Sticky Hold + Aroma Veil.",
  desc: "Full local Sticky Hold protects the held item from removal. Full local Aroma Veil protects the user and allies from infatuation, Disable, Encore, Heal Block, Taunt and Torment.",
 },
 familyguardian: {
  shortDesc: 'Friend Guard + Healer; once/entry, rescues self or an adjacent ally crossing half HP with 1/4 healing.',
  desc: "Full local Friend Guard reduces damage to other allies by 25%; full local Healer gives each adjacent statused ally a 30% chance to be cured each turn. Once per genuine entry, after the user or an adjacent ally survives an opposing whole damaging attack that takes it from above half HP to half HP or less, it heals 1/4 of its maximum HP after all hits. One shared budget is spent only when healing succeeds. Heal Block prevents healing; residual damage, friendly fire and Substitute-only damage do not qualify. Ability restarts do not refresh the budget.",
 },
};

export function installFamilyReplacements(abilities: AbilityDataTable) {
 abilities.shellderartillery = {
  ...abilities.megalauncher, ...abilities.oblivious,
  name: 'Shellder Artillery', num: 11449, rating: 4,
  onBasePower(power, source, target, move) {
   if (skipPassiveComponent(this, source, 'megalauncher')) return;
   return abilities.megalauncher.onBasePower!.call(this, power, source, target, move);
  },
 };
 abilities.teaceremony = {
  ...abilities.stickyhold, ...abilities.aromaveil,
  name: 'Tea Ceremony', num: 11450, rating: 4,
 };
 abilities.familyguardian = {
  ...abilities.friendguard, ...abilities.healer,
  name: 'Family Guardian', num: 11451, rating: 4, flags: {breakable: 1},
  onAnyAfterDamageApplied(damage, target, source, effect) {
   const holder = this.effectState.target;
   if (holder.m.familyGuardianUsed || !holder.hp || damage <= 0 || !source ||
    source.isAlly(target) || effect?.effectType !== 'Move' || effect.category === 'Status' ||
    !target.isAlly(holder) || (target !== holder && !holder.isAdjacent(target)) ||
    target.hp > target.maxhp / 2 || target.hp + damage <= target.maxhp / 2) return;
   const pending = holder.m.familyGuardianPending || (holder.m.familyGuardianPending = []);
   pending.push({target, source, move: effect});
  },
  onAnyAfterAttackResolved(source, target, move) {
   const holder = this.effectState.target;
   const pending = holder.m.familyGuardianPending || [];
   holder.m.familyGuardianPending = pending.filter((entry: any) => entry.source !== source || entry.move !== move);
   if (holder.m.familyGuardianUsed || !holder.hp || !holder.isActive) return;
   for (const entry of pending) {
    if (entry.source !== source || entry.move !== move || !entry.target.hp || !entry.target.isActive ||
     !entry.target.isAlly(holder) || (entry.target !== holder && !holder.isAdjacent(entry.target))) continue;
    const healed = this.heal(entry.target.baseMaxhp / 4, entry.target, holder, this.effect);
    if (typeof healed === 'number' && healed > 0) {
     holder.m.familyGuardianUsed = true;
     break;
    }
   }
  },
 };
}
