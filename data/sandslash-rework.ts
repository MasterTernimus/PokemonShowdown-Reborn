import type {AbilityDataTable} from '../sim/dex-abilities';

export const SandslashDescriptions = {
 duneclaws: {name:'Dune Claws',shortDesc:"Tough Claws; STAB HP hits clear own hazards, Leech Seed and binding.",desc:"Tough Claws: contact moves have 1.3x power. After a STAB attack damages opposing HP, clears its side’s entry hazards and its own Leech Seed and partial trapping. Cleanup occurs once after the whole attack and can repeat on later attacks; contact is not required."},
 glacierclaws: {name:'Glacier Claws',shortDesc:"Tough Claws; STAB HP hits clear own hazards, Leech Seed and binding.",desc:"Tough Claws: contact moves have 1.3x power. After a STAB attack damages opposing HP, clears its side’s entry hazards and its own Leech Seed and partial trapping. Cleanup occurs once after the whole attack and can repeat on later attacks; contact is not required."},
};

/** Capture the final actual STAB multiplier used by damage calculation, including Tera and extra STAB, but not Stellar’s non-STAB bonus. */
export function recordClawSTAB(source: Pokemon,target: Pokemon,move: ActiveMove,stab: number | [number,number],isSTAB: boolean) {
 if(!isSTAB||!source.hasAbility(['duneclaws','glacierclaws']) || (Array.isArray(stab)?stab[0]/stab[1]:stab)<=1)return;
 ((move as any).clawsSTABTargets ||= new Set()).add(target);
}
export function installSandslashRework(abilities: AbilityDataTable) {
 const a=abilities as any;
 for(const[id,old]of [['duneclaws','bedrockclaw'],['glacierclaws','rimeclaw']])a[id]={
  ...a.toughclaws,name:SandslashDescriptions[id as keyof typeof SandslashDescriptions].name,num:a[old].num,
  onSourceAfterDamageApplied(this: Battle,damage: number,target: Pokemon,source: Pokemon,move: ActiveMove) {
   if(damage>0&&source&&!source.isAlly(target)&&move?.effectType==='Move'&&move.category!=='Status'&&(move as any).clawsSTABTargets?.has(target))source.m.clawsCleanupMove=move;
  },
  onAfterAttackResolved(this: Battle,source: Pokemon,target: Pokemon,move: ActiveMove) {
   if(source.m.clawsCleanupMove!==move)return;
   delete source.m.clawsCleanupMove;
   if(!source.isActive||!source.hp||!source.hasAbility(id))return;
   let removed=false;
   for(const hazard of ['spikes','toxicspikes','stealthrock','stickyweb','gmaxsteelsurge','dragonrend']) {
    if(source.side.removeSideCondition(hazard)){removed=true;this.add('-sideend',source.side,this.dex.conditions.get(hazard).name,'[from] ability: '+a[id].name,`[of] ${source}`);}
   }
   if(source.removeVolatile('leechseed')){removed=true;this.add('-end',source,'Leech Seed','[from] ability: '+a[id].name);}
   removed=source.removeVolatile('partiallytrapped')||removed;
   if(removed)this.add('-activate',source,'ability: '+a[id].name);
  },
 };
 for(const id of ['bedrockclaw','rimeclaw','dunerunner','frostrunner'])delete a[id];
}
