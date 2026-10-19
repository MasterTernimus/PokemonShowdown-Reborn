import type {AbilityDataTable} from '../sim/dex-abilities';
function mark(this:Battle,damage:number,target:Pokemon,source:Pokemon,move:ActiveMove){
 if(damage<=0||target.isAlly(source))return;
 const id=this.effect.id;
 if(id==='pearlsiphon'&&move.drain)return;
 if(id==='pearltide'&&!this.movehasType(move,'Water'))return;
 if(id==='abyssalfang'&&!move.flags.bite)return;
 if(id==='abyssalcurrent'&&!this.movehasType(move,'Dark'))return;
 const records=(move as any).pearlHydraulicHits||=(([] as any[]));
 records.push({id,source,target,damage});
}
function resolve(this:Battle,source:Pokemon,target:Pokemon,move:ActiveMove){
 if(source!==this.effectState.target||!source.hp||!source.isActive)return;
 const id=this.effect.id,records=((move as any).pearlHydraulicHits||[]).filter((r:any)=>r.id===id&&r.source===source);
 if(!records.length)return;
 (move as any).pearlHydraulicHits=((move as any).pearlHydraulicHits||[]).filter((r:any)=>r.id!==id||r.source!==source);
 const rewards=source.m.pearlHydraulicRewards||={};
 if(rewards[id]?.turn!==this.turn)rewards[id]={turn:this.turn,used:0};
 const reward=rewards[id];
 if(id==='pearlsiphon'){
  const amount=Math.min(Math.floor(records.reduce((sum:number,r:any)=>sum+r.damage,0)/8),Math.floor(source.maxhp/8)-reward.used);
  if(amount>0){reward.used+=amount;this.heal(amount,source,source,this.effect);}return;
 }
 if(reward.used)return;reward.used=1;
 if(id==='pearltide'){
  this.heal(source.maxhp/16,source,source,this.effect);
  const ally=source.adjacentAllies().filter(p=>p.hp&&p.isActive).sort((a,b)=>a.hp/a.maxhp-b.hp/b.maxhp)[0];
  if(source.hp&&source.isActive&&ally)this.heal(ally.maxhp/16,ally,source,this.effect);
 }else{
  const foe=source.foes().find(p=>p.hp&&p.isActive&&records.some((r:any)=>r.target===p));
  if(foe)this.boost(id==='abyssalfang'?{spd:-1}:{atk:-1},foe,source,this.effect);
 }
}
export function installPearlHydraulic(a:AbilityDataTable){
 for(const [id,name,base,num]of [['pearlsiphon','Pearl Siphon','competitive',11487],['pearltide','Pearl Tide','hydration',11488],['abyssalfang','Abyssal Fang','strongjaw',11489],['abyssalcurrent','Abyssal Current','waterabsorb',11490]] as const){
  a[id]={...a[base],name,num,rating:4,onSourceDamagingHit:mark,onAnyAfterAttackResolved:resolve};
 }
 const old=a.hydraulicarmor;
 a.hydraulicarmor={...old,
  onModifyMove(move,pokemon,target){
   old.onModifyMove?.call(this,move,pokemon,target);
  },
  onSourceDamagingHit(damage,target,source,move){if(damage>0&&!target.isAlly(source)&&move.id==='skullbash'&&!move.isZ&&!move.isMax)(move as any).hydraulicPulse={source,target};},
  onAnyAfterAttackResolved(source,target,move){
   const pending=(move as any).hydraulicPulse;if(source!==this.effectState.target||pending?.source!==source)return;delete (move as any).hydraulicPulse;
   if(!source.hp||!source.isActive||!pending.target.hp||!pending.target.isActive)return;
   const saved={move:this.activeMove,pokemon:this.activePokemon,target:this.activeTarget,event:this.event,effect:this.effect,state:this.effectState,result:source.moveThisTurnResult};
   try{this.actions.useMove('hydropump',source,{target:pending.target,sourceEffect:this.dex.abilities.get('hydraulicarmor')});}
   finally{this.activeMove=saved.move;this.activePokemon=saved.pokemon;this.activeTarget=saved.target;this.event=saved.event;this.effect=saved.effect;this.effectState=saved.state;source.moveThisTurnResult=saved.result;}
  },
 };
}
export const PearlHydraulicDescriptions={
 pearlsiphon:{name:'Pearl Siphon',shortDesc:'Competitive; non-draining attacks restore 1/8 opposing HP damage, capped each turn.',desc:'Full Competitive. After an attack without existing drain deals opposing HP damage, restores 1/8 actual damage, capped at 1/8 max HP per turn. Resolves after the whole attack; excludes ally and Substitute-only damage. Ordinary ability-healing restrictions apply.'},
 pearltide:{name:'Pearl Tide',shortDesc:'Hydration; Water HP hit heals self and weakest adjacent ally 1/16 once per turn.',desc:'Full Hydration. Once per turn after a Water attack damages opposing HP, restores 1/16 max HP to this living active Pokemon and its lowest-HP-percentage adjacent living ally. Resolves after the whole attack; ordinary healing restrictions apply.'},
 abyssalfang:{name:'Abyssal Fang',shortDesc:'Strong Jaw; bite HP attack lowers one foe’s Sp. Def once per turn.',desc:'Full Strong Jaw. Once per turn after a biting attack damages opposing HP, attempts to lower one damaged surviving opponent’s Special Defense by one stage after the whole attack. No ally or Substitute-only trigger; normal stat-drop protection applies.'},
 abyssalcurrent:{name:'Abyssal Current',shortDesc:'Water Absorb; Dark HP attack lowers one foe’s Attack once per turn.',desc:'Full Water Absorb. Once per turn after a Dark attack damages opposing HP, attempts to lower one damaged surviving opponent’s Attack by one stage after the whole attack. No ally or Substitute-only trigger; normal stat-drop protection applies.'},
 hydraulicarmor:{name:'Hydraulic Armor',shortDesc:'Stamina; Skull Bash strike follows with Hydro Pump.',desc:'Full local Stamina. Water Pulse and Hydro Pump retain the higher boosted Defense-or-Sp. Atk offensive stat, remaining Special and targeting Sp. Def. After a Skull Bash strike damages opposing HP, the living active user uses one free ordinary Hydro Pump against the same surviving active target after the whole attack. No follow-up on preparation, miss, protection, immunity, Substitute-only damage or a KO. Hydro Pump costs no PP and retains ordinary accuracy, protection, abilities, secondary effects, Hydraulic Armor offense and Torrent.'},
};
