import type {AbilityDataTable} from '../sim/dex-abilities';

export const FossilDescriptions = {
 bloodsickle: {shortDesc:'Hyper Cutter; slicing hits drain 25%, capped at 1/8 HP per move.', desc:'Full local Hyper Cutter. Slicing attacks heal 25% of actual opposing HP damage, capped at 1/8 max HP across the whole move and all targets. Native draining moves do not gain extra drain. Substitute-only, allied and delayed damage do not qualify. Normal healing modifiers, Heal Block and Liquid Ooze apply.'},
 graspingcurrent: {shortDesc:'Suction Cups; Water attacks lower damaged foes’ Speed once per move.', desc:'Full local Suction Cups. After a damaging Water move, each surviving opposing target that lost HP has its Speed lowered by 1 once per whole move. Substitute-only damage does not qualify. Normal stat-drop protections apply; this is not a chance secondary.'},
};

export function installFossilDrain(abilities: AbilityDataTable) {
 abilities.bloodsickle = {...abilities.hypercutter, name:'Blood Sickle', num:11524, rating:4,
  onAnyAfterDamageApplied(damage,target,source,effect) {
   const holder=this.effectState.target as Pokemon;
   if(source!==holder || damage<=0 || !holder.hp || source.isAlly(target) || effect?.effectType!=='Move') return;
   const move=effect as ActiveMove;
   if(move.category==='Status' || !move.flags.slicing || move.flags.futuremove || move.drain) return;
   if(this.effectState.sickleMove!==move) {this.effectState.sickleMove=move;this.effectState.sickleDamage=0;this.effectState.sickleSpent=0;}
   const before=Math.floor(this.effectState.sickleDamage/4);
   this.effectState.sickleDamage+=damage;
   const amount=Math.min(Math.floor(this.effectState.sickleDamage/4)-before,Math.floor(holder.maxhp/8)-this.effectState.sickleSpent);
   if(amount<=0)return;
   // Count both recovery and Liquid Ooze damage against the per-move drain budget.
   this.effectState.sickleSpent+=amount;
   holder.m.bloodSickleHealing=true;
   try { this.heal(amount,holder,target,'drain'); } finally {delete holder.m.bloodSickleHealing;}
  },
  onTryHealPriority:-100,
  onTryHeal(amount,target,source,effect) {
   if(target.m.bloodSickleHealing && effect?.id==='drain') {
    const modified=this.modify(amount,this.event.modifier);this.event.modifier=1;
    const prior=this.effectState.sickleSpent-amount;
    const capped=Math.min(modified,Math.max(0,Math.floor(target.maxhp/8)-prior));
    this.effectState.sickleSpent=prior+capped;return capped;
   }
  },
 };
 abilities.graspingcurrent={...abilities.suctioncups,name:'Grasping Current',num:11525,rating:4,
  onAnyAfterDamageApplied(damage,target,source,effect) {
   if(source!==this.effectState.target || damage<=0 || source.isAlly(target) || effect?.effectType!=='Move')return;
   const move=effect as ActiveMove;
   if(move.category==='Status'||!this.movehasType(move,'Water')||move.flags.futuremove)return;
   if(this.effectState.currentMove!==move){this.effectState.currentMove=move;this.effectState.currentTargets=new Set<Pokemon>();}
   this.effectState.currentTargets.add(target);
  },
  onAnyAfterAttackResolved(source,target,move) {
   if(source!==this.effectState.target||this.effectState.currentMove!==move)return;
   const targets:Set<Pokemon>=this.effectState.currentTargets;
   delete this.effectState.currentMove;delete this.effectState.currentTargets;
   for(const foe of targets)if(foe.hp&&foe.isActive)this.boost({spe:-1},foe,source,this.effect);
  },
 };
}
