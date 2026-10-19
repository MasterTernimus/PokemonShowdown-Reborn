import type {AbilityDataTable} from '../sim/dex-abilities';
import {skipPassiveComponent} from './passive-ability-cleanup';
/** Independent of secondary-effect multipliers; either support sets the final chance. */
export function allOutChance(move:ActiveMove){return (move as any).sereneGraceProviders?.some((id:string)=>id==='voidomen'||id==='lunarorbit')?5:3;}
export const HydreigonDescriptions={
 hydraflight:{name:'Hydra Flight',shortDesc:'Levitate + Hydra Bond.',desc:'Full local Levitate and Hydra Bond. Ground immunity can be bypassed normally; Hydra Bond remains active. Eligible attacks retain three hits, 30% follow-ups, spread and Free-for-All rules, the full-power Gilded Helix exception and Dragon Den power boost. No Berserk boosts.'},
 worldbreaker:{name:'Worldbreaker',shortDesc:'Berserk + Duskilate; 30% double power per hit, except Fickle Beam.',desc:'Full local Berserk and Duskilate. Surviving a move crossing half HP grants +1 Attack and Sp. Atk; Dragon Den entry grants +2 to both. Each damaging hit independently has a 30% chance to double base power, except Fickle Beam uses only its own all-out roll. No Merciless critical-hit bonus.'},
 falseliberation:{name:'False Liberation',shortDesc:"Mold Breaker; once per entry, a Dark HP hit inflicts Torment.",desc:"Mold Breaker. Once per entry, Dark damage to a foe’s HP inflicts Torment. Only a newly applied Torment spends the use; existing Torment is not refreshed."},
};
export function installHydreigon(abilities:AbilityDataTable){const a=abilities as any;
 for(const id of ['hydrabond','berserk'])for(const[key,callback]of Object.entries(a[id]))if(key.startsWith('on')&&typeof callback==='function')a[id][key]=function(this:Battle,...args:any[]){if(skipPassiveComponent(this,this.effectState.target,id))return;return callback.apply(this,args);};
 a.hydraflight={...a.hydrabond,name:'Hydra Flight',num:11721,flags:{},rating:5};
 a.worldbreaker={...a.berserk,...a.duskilate,name:'Worldbreaker',num:11722,rating:5,
  onBasePower(this:Battle,power:number,source:Pokemon,target:Pokemon,move:ActiveMove){a.duskilate.onBasePower?.call(this,power,source,target,move);if(move.category!=='Status'&&move.id!=='ficklebeam'&&this.randomChance(allOutChance(move),10))this.chainModify(2);},
 };
 a.falseliberation={...a.moldbreaker,name:'False Liberation',num:11723,rating:5,
  onStart(this:Battle,pokemon:Pokemon){a.moldbreaker.onStart?.call(this,pokemon);},
  onSourceAfterDamageApplied(this:Battle,damage:number,target:Pokemon,source:Pokemon,move:ActiveMove){
   if(damage<=0||!source||source.m.falseLiberationUsed||source.isAlly(target)||!target.hp||move.effectType!=='Move'||move.category==='Status'||!this.movehasType(move,'Dark')||target.volatiles.torment)return;
   if(target.addVolatile('torment',source,this.effect))source.m.falseLiberationUsed=true;
  },
 };
}
