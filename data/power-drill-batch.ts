import type {AbilityDataTable} from '../sim/dex-abilities';
export const PowerDrillBatchDescriptions = {
 twindrills: {name:'Twin Drills',shortDesc:'Dual Wield + Power Drill; two 60% hits with normal drill/horn boosts.',desc:'Full local Dual Wield and Power Drill. Eligible single-hit moves hit twice at 60% power each with independent accuracy checks. Drill and horn moves gain 1.5x power, or 2x on Rocky, Mountain, Snowy Mountain, Cave and Volcanic fields, where they bypass protection. Each generated drill/horn hit is therefore 0.9x power normally or 1.2x on those fields, before other modifiers. Native multihit moves retain their normal hit counts and receive only the Power Drill boost. Overlapping active/passive components apply once.'},
 matriarchsvigil: {name:'Royal Aegis',shortDesc:'Thick Fat + Power Drill + Friend Guard; once/entry, crossing half HP grants Def/SpD.',desc:'Full local Thick Fat, Power Drill and Friend Guard. Drill and horn moves have 1.5x power, or 2x on Rocky, Mountain, Snowy Mountain, Cave and Volcanic fields, where they bypass protection. Once per genuine entry, after it or an adjacent ally survives an opposing whole damaging move that takes it from above half HP to half HP or less, the injured Pokemon gains +1 Defense and +1 Sp. Def after all hits. One shared activation per entry. Residual damage, friendly fire and Substitute-only damage do not qualify. Ability restarts do not reset the budget. Friend Guard reduces damage to other allies by 25%, independently stacking with the separate Rivalry passive. Neither ally reduction protects its own holder.'},
};
export function installPowerDrillBatch(abilities: AbilityDataTable) {
 abilities.twindrills = {...abilities.dualwield,name:'Twin Drills',num:11890,rating:4,
  onModifyMove(move,source,target) {
   this.dex.abilities.get('powerdrill').onModifyMove?.call(this,move,source,target);
   this.dex.abilities.get('dualwield').onModifyMove?.call(this,move,source,target);
  },
  onBasePower(power,source,target,move) {
   this.dex.abilities.get('dualwield').onBasePower?.call(this,power,source,target,move);
   this.dex.abilities.get('powerdrill').onBasePower?.call(this,power,source,target,move);
  },
 };
}
