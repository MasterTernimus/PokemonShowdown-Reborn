import type {AbilityDataTable} from '../sim/dex-abilities';
import {skipPassiveComponent} from './passive-ability-cleanup';
const ordinary=(m:ActiveMove)=>!m.sourceEffect&&!m.isZ&&!m.isMax;
export function installMimeAim(a:AbilityDataTable) {
 a.aimassist={name:'Aim Assist',num:11482,rating:4,flags:{},
  onSwitchIn(p){delete p.m.aimLock;delete p.m.aimStatusTurn;delete p.m.aimAttackTurn;delete p.m.aimTarget;},
  onTryMove(p,target,move){if(!ordinary(move))return;if(target&&!target.isAlly(p))p.m.aimTarget={target,turn:this.turn};if(move.category!=='Status'){p.m.aimAttackTurn=this.turn;if((move as any).aimAssistTarget)delete p.m.aimLock;}},
  onAfterMove(p,target,move){if(ordinary(move)&&move.category==='Status'&&p.moveThisTurnResult===true)p.m.aimStatusTurn=this.turn;},
  onResidual(p){
   if(p.m.aimLock?.expires<=this.turn)delete p.m.aimLock;
   if(p.m.aimStatusTurn!==this.turn||p.m.aimAttackTurn===this.turn)return;
   const last=p.m.aimTarget?.turn===this.turn?p.m.aimTarget.target:null;
   const target=last?.hp&&last.isActive?last:p.foes().find(q=>q.position===p.position)||p.foes()[0];
   if(target){p.m.aimLock={target,expires:this.turn+1};this.add('-activate',p,'ability: Aim Assist',`[of] ${target}`);}
  },
  onModifyMove(move,p,target){if(ordinary(move)&&move.category!=='Status'&&!move.ohko&&p.m.aimLock?.expires>=this.turn&&p.m.aimLock.target===target&&target?.hp&&target.isActive){(move as any).aimAssistTarget=target;move.ignorePositiveDefensive=true;}},
  onSourceAccuracy(accuracy,target,source,move){if((move as any).aimAssistTarget===target)return true;},
  onSourceInvulnerabilityPriority:1,
  onSourceInvulnerability(target,source,move){if((move as any).aimAssistTarget===target)return 0;},
  onAnySwitchOut(p){const holder=this.effectState.target as Pokemon;if(p===holder||holder.m.aimLock?.target===p)delete holder.m.aimLock;},
 };
 a.silentact={...a.soundproof,name:'Silent Act',num:11483,rating:4,
  onAfterMove(p,target,move){if(move.category==='Status'&&p.moveThisTurnResult===true)p.addVolatile('silentactready');},
  onTryMove(p,target,move){if(move.category!=='Status'&&['Psychic','Fairy'].includes(move.type)&&p.volatiles.silentactready){p.removeVolatile('silentactready');(move as any).silentActBoost=true;}},
  onBasePower(power,p,target,move){if((move as any).silentActBoost)return this.chainModify(1.3);},
 };
 a.curtaincall={...a.icebody,...a.filter,name:'Curtain Call',num:11484,rating:4};
 a.stagesweep={...a.screencleaner,name:'Stage Sweep',num:a.stagesweep.num,rating:5,
  onSwitchIn(p){delete p.m.stageSweepReward;},
  onAnyModifyMove(move,source){const holder=this.effectState.target as Pokemon;if(holder.hp&&holder.isActive&&(holder===source||source.adjacentAllies().includes(holder)))move.infiltrates=true;},
  onModifyMove(move){
   if(move.id!=='rapidspin')return;
   for(const key of ['onAfterHit','onAfterSubDamage'] as const){
    const old=move[key] as Function|undefined;
    (move as any)[key]=function(this:Battle,...args:any[]){
     const source:Pokemon=args[key==='onAfterHit'?1:2],attack:ActiveMove=args[key==='onAfterHit'?2:3];
     const before=Object.keys(source.side.sideConditions),result=old?.apply(this,args);
     (attack as any).stageSweepSuccess=source;
     if(source.hp&&!source.m.stageSweepReward&&before.some(id=>!source.side.sideConditions[id])){
      source.m.stageSweepReward=true;
      for(const stat of Object.keys(source.boosts) as BoostID[])if(source.boosts[stat]<0)source.boosts[stat]=0;
      this.add('-clearnegativeboost',source,'[from] ability: Stage Sweep');this.heal(source.baseMaxhp/8,source,source,this.dex.abilities.get('stagesweep'));
     }
     return result;
    };
   }
  },
  onAnyAfterAttackResolved(source,target,move){
   if(this.effectState.target!==source||(move as any).stageSweepSuccess!==source)return;
   delete (move as any).stageSweepSuccess;
   if(!source.hp||!source.isActive)return;
   const ally=source.adjacentAllies().find(p=>p.hp&&p.isActive&&(p.newlySwitched||this.queue.willMove(p)));
   if(ally){const helping=this.dex.getActiveMove('helpinghand');if(this.singleEvent('TryHit',helping,null,ally,source,helping)!==false)ally.addVolatile('helpinghand',source,helping);}
   if(!source.switchFlag&&this.canSwitch(source.side))source.switchFlag=true;
  },
 };
 for(const key of Object.keys(a.aimassist)){const fn=(a.aimassist as any)[key];if(!key.startsWith('on')||typeof fn!=='function')continue;(a.aimassist as any)[key]=function(this:Battle,...args:any[]){if(!skipPassiveComponent(this,this.effectState.target,'aimassist'))return fn.apply(this,args);};}
}
