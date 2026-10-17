import type {AbilityDataTable} from '../sim/dex-abilities';
import {skipPassiveComponent} from './passive-ability-cleanup';
/** Independent of secondary-effect multipliers; either support sets the final chance. */
export function allOutChance(move:ActiveMove){return (move as any).sereneGraceProviders?.some((id:string)=>id==='voidomen'||id==='lunarorbit')?5:3;}
export const HydreigonDescriptions={
 hydraflight:{name:'Hydra Flight',shortDesc:'Levitate + Hydra Bond.',desc:'Full local Levitate and Hydra Bond. Ground immunity can be bypassed normally; Hydra Bond remains active. Eligible attacks hit three times with the existing later-hit, spread, Free-for-All and Gilded Helix rules. Retains Dragon’s Den power boost.'},
 worldbreaker:{name:'Worldbreaker',shortDesc:"Berserk + Merciless + Duskilate; each damaging hit has a 30% chance of double power.",desc:"Berserk + Merciless + Duskilate. Each damaging hit independently has a 30% chance to double its base power."},
 falseliberation:{name:'False Liberation',shortDesc:"Mold Breaker + Berserk; once per entry, a Dark HP hit inflicts Torment.",desc:"Mold Breaker + Berserk. Once per entry, Dark damage to a foe’s HP inflicts Torment. Only a newly applied Torment spends the use; existing Torment is not refreshed."},
};
export function installHydreigon(abilities:AbilityDataTable){const a=abilities as any;
 for(const[key,callback]of Object.entries(a.hydrabond))if(key.startsWith('on')&&typeof callback==='function')a.hydrabond[key]=function(this:Battle,...args:any[]){if(skipPassiveComponent(this,this.effectState.target,'hydrabond'))return;return callback.apply(this,args);};
 a.hydraflight={...a.hydrabond,name:'Hydra Flight',num:11721,flags:{},rating:5};
 a.worldbreaker={...a.berserk,...a.merciless,...a.duskilate,name:'Worldbreaker',num:11722,rating:5,
  onBasePower(this:Battle,power:number,source:Pokemon,target:Pokemon,move:ActiveMove){a.duskilate.onBasePower?.call(this,power,source,target,move);if(move.category!=='Status'&&this.randomChance(allOutChance(move),10))this.chainModify(2);},
 };
 a.falseliberation={...a.moldbreaker,...a.berserk,name:'False Liberation',num:11723,rating:5,
  onStart(this:Battle,pokemon:Pokemon){a.moldbreaker.onStart?.call(this,pokemon);a.berserk.onStart?.call(this,pokemon);},
  onSourceAfterDamageApplied(this:Battle,damage:number,target:Pokemon,source:Pokemon,move:ActiveMove){
   if(damage<=0||!source||source.m.falseLiberationUsed||source.isAlly(target)||!target.hp||move.effectType!=='Move'||move.category==='Status'||!this.movehasType(move,'Dark')||target.volatiles.torment)return;
   if(target.addVolatile('torment',source,this.effect))source.m.falseLiberationUsed=true;
  },
 };
}
