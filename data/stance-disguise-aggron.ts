import type {AbilityDataTable} from '../sim/dex-abilities';
import {skipPassiveComponent} from './passive-ability-cleanup';
export const StanceDisguisePassives: {[id:string]:string}={aggron:'heavymetal',aggronmega:'stamina',mimikyu:'disguise',mimikyubusted:'disguise',mimikyutotem:'disguise',mimikyubustedtotem:'disguise',aegislash:'stancechange',aegislashblade:'stancechange',aegislashgmax:'cursedbody'};
export const StanceDisguiseDescriptions={
 ironmountain:{name:'Iron Mountain',shortDesc:"Hyper Cutter + Brute Force; entry or Mega Evolution clears own Stealth Rock/Spikes.",desc:"Hyper Cutter + Brute Force. Entry clears its side’s Stealth Rock and Spikes after hazards take effect. Mega Evolution also clears them; ability restarts do not."},
 disguise:{name:'Disguise',shortDesc:'Intact disguise blocks one hit, then costs 1/8 HP and curses an opposing attacker.',desc:'An intact Mimikyu or Totem Mimikyu blocks its first damaging hit and changes permanently to its busted form, losing 1/8 maximum HP. An opposing attacker is cursed for 1/8 maximum HP each turn. Confusion can break the disguise. Mold Breaker can bypass it. No priority bonus; Transform does not gain its protection.'},
 stancechange:{name:'Stance Change',shortDesc:"Attacks enter Blade (+20% power); King’s Shield enters Shield (20% less damage).",desc:"Aegislash enters Blade before damaging moves and Shield before King’s Shield. Blade deals 20% more damage; Shield takes 20% less, plus a further 30% reduction after its first damaging hit each turn in Free-for-All. Fairy Tale and Chessboard stance stat changes apply. Transform and Gmax do not gain these stance changes."},
};
function clearIronHazards(this:Battle,pokemon:Pokemon){for(const id of ['stealthrock','spikes'])if(pokemon.side.removeSideCondition(id))this.add('-sideend',pokemon.side,this.dex.conditions.get(id).name,'[from] ability: Iron Mountain','[of] '+pokemon);}
export function installStanceDisguiseAggron(abilities:AbilityDataTable){const a=abilities as any;
 a.ironmountain={...a.hypercutter,...a.bruteforce,name:'Iron Mountain',num:a.ironmountain.num,rating:4,flags:{breakable:1},onSwitchInPriority:-1,onSwitchIn:clearIronHazards,onAfterMega:clearIronHazards};
 for(const[key,callback]of Object.entries(a.heavymetal))if(key.startsWith('on')&&typeof callback==='function')a.heavymetal[key]=function(this:Battle,...args:any[]){if(skipPassiveComponent(this,this.effectState.target,'heavymetal'))return;return callback.apply(this,args);};
 for(const key of ['onModifyPriority','onModifyMove','onDeductPP'])delete a.disguise[key];
 for(const[key,callback]of Object.entries(a.disguise))if(key.startsWith('on')&&typeof callback==='function')a.disguise[key]=function(this:Battle,...args:any[]){if(this.effectState.target?.transformed||skipPassiveComponent(this,this.effectState.target,'disguise'))return;return callback.apply(this,args);};
 delete a.stancechange.onAnyAfterMove;
 a.stancechange.onModifyMove=function(this:Battle,move:ActiveMove,pokemon:Pokemon){
  if(pokemon.transformed||!['aegislash','aegislashblade'].includes(pokemon.species.id)||(move.category==='Status'&&move.id!=='kingsshield'))return;
  const shield=move.id==='kingsshield',form=shield?'Aegislash':'Aegislash-Blade';
  if(pokemon.species.name===form)return;
  if(this.field.isTerrain(['fairytaleterrain','chessboardterrain']))this.boost(shield?{def:1,spd:1,atk:-1,spa:-1}:{def:-1,spd:-1,atk:1,spa:1},pokemon);
  pokemon.formeChange(form);
 };
 a.stancechange.onBasePower=function(this:Battle,power:number,source:Pokemon,target:Pokemon,move:ActiveMove){if(!source.transformed&&source.species.id==='aegislashblade'&&move.category!=='Status')return this.chainModify(1.2);};
 a.stancechange.onSourceModifyDamage=function(this:Battle,damage:number,source:Pokemon,target:Pokemon,move:ActiveMove){if(!target.transformed&&target.species.id==='aegislash'&&move.category!=='Status')return this.chainModify(this.gameType==='freeforall'&&this.effectState.stanceChangeShieldHitTurn===this.turn?0.56:0.8);};
 a.stancechange.onDamagingHit=function(this:Battle,damage:number,target:Pokemon,source:Pokemon,move:ActiveMove){if(!target.transformed&&target.species.id==='aegislash'&&this.gameType==='freeforall'&&move.category!=='Status')this.effectState.stanceChangeShieldHitTurn=this.turn;};
 for(const[key,callback]of Object.entries(a.stancechange))if(key.startsWith('on')&&typeof callback==='function')a.stancechange[key]=function(this:Battle,...args:any[]){if(this.effectState.target?.transformed||skipPassiveComponent(this,this.effectState.target,'stancechange'))return;return callback.apply(this,args);};
}
