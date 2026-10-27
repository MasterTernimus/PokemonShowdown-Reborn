import type {AbilityDataTable} from '../sim/dex-abilities';
import {skipPassiveComponent} from './passive-ability-cleanup';
export const EeveeCloysterPassives: {[id:string]:string} = {jolteon:'voltabsorb',flareon:'flashfire',vaporeon:'waterabsorb',glaceon:'icebody',leafeon:'chlorophyll',espeon:'magicbounce',umbreon:'innerfocus',sylveon:'pixilate',cloyster:'waterabsorb'};
export const EeveeCloysterComponents: {[id:string]:string[]} = {livewire:['transistor','quickfeet','ironbarbs'],kindledfury:['fluffy','guts'],tidalwave:['hydration','raindish'],permafrost:['icescales','refrigerate'],verdantedge:['sharpness','grasspelt'],astralward:[],lunarward:['pressure','illuminate'],frozenfortress:['icebody','crumblingshell']};
export const EeveeCloysterDescriptions = {
 livewire:{name:'Livewire',shortDesc:'Transistor + Quick Feet + Iron Barbs.',desc:"Full local Transistor, Quick Feet and Iron Barbs."},
 kindledfury:{name:'Kindled Fury',shortDesc:'Fluffy + Guts.',desc:"Full local Fluffy and Guts."},
 tidalwave:{name:'Tidal Wave',shortDesc:'Hydration + Rain Dish.',desc:"Full local Hydration and Rain Dish."},
 permafrost:{name:'Permafrost',shortDesc:'Ice Scales + Refrigerate.',desc:"Full local Ice Scales and Refrigerate, including their field effects."},
 verdantedge:{name:'Verdant Edge',shortDesc:'Sharpness + Grass Pelt.',desc:"Full local Sharpness and Grass Pelt, including their field effects."},
 astralward:{name:'Astral Ward',shortDesc:"Prevents opposing accuracy drops; ignores opposing evasion boosts.",desc:"Opponents cannot lower its accuracy. Its moves ignore opposing positive evasion stages."},
 lunarward:{name:'Lunar Ward',shortDesc:'Pressure + Illuminate.',desc:"Full local Pressure and Illuminate, including field effects. Pressure has its once-per-opponent battle memory."},
 frozenfortress:{name:'Frozen Fortress',shortDesc:'Ice Body. Physical hits scatter Stealth Rock on the attacker’s side.',desc:"Full local Ice Body heals in hail, snow and icy fields, prevents hail damage and may inflict frostbite on contact attackers. Crumbling Shell sets Stealth Rock after physical hits if that side has none, except on Water Surface, Underwater, Murkwater Surface and Swamp fields. Allied hits place it on the opposing side."},
};
export function installEeveeCloyster(abilities:AbilityDataTable) {
 const a=abilities as any;
 for(const [id,keys]of Object.entries({livewire:['onTryHit','onResidual'],kindledfury:['onStart','onTryHit','onResidual','onEnd'],permafrost:['onDamagingHit','onWeather','onResidual','onImmunity'],verdantedge:['onModifySpe'],tidalwave:['onTryHit']}))for(const key of keys)delete a[id][key];
 a.tidalwave.onResidual=function(this:Battle,pokemon:Pokemon){return a.hydration.onResidual?.call(this,pokemon);};
 a.astralward={name:'Astral Ward',num:a.astralward.num,rating:3,flags:{breakable:1},
  onTryBoost(boost:SparseBoostsTable,target:Pokemon,source:Pokemon){if(source&&!source.isAlly(target)&&(boost.accuracy||0)<0)delete boost.accuracy;},
  onModifyMove(move:ActiveMove){move.ignoreEvasion=true;},
 };
 a.lunarward={...a.moonlightvigil,name:'Lunar Ward'};;
 delete a.lunarward.onTryAddVolatile;
 a.lunarward.onStart=function(this:Battle,pokemon:Pokemon){a.pressure.onStart?.call(this,pokemon);a.illuminate.onStart?.call(this,pokemon);};
 a.lunarward.onTryBoost=a.illuminate.onTryBoost;
 // Delegate every Ice Body callback; Crumbling Shell shares its contact event.
 a.frozenfortress={...a.icebody,name:'Frozen Fortress',num:a.frozenfortress.num,rating:4,
  onDamagingHit(this:Battle,damage:number,target:Pokemon,source:Pokemon,move:ActiveMove){a.icebody.onDamagingHit?.call(this,damage,target,source,move);a.crumblingshell.onDamagingHit?.call(this,damage,target,source,move);},
 };
 for(const key of ['onWeather','onResidual','onImmunity']){
  const callback=a.mindfreeze[key];
  a.mindfreeze[key]=function(this:Battle,...args:any[]){if(skipPassiveComponent(this,this.effectState.target,'icebody'))return;return callback.apply(this,args);};
 }
 // Primitive delegates, including copied composites, must not repeat an innate copy.
 for(const id of Object.values(EeveeCloysterPassives))for(const [key,callback]of Object.entries(a[id])){
  if(!key.startsWith('on')||typeof callback!=='function')continue;
  a[id][key]=function(this:Battle,...args:any[]){if(skipPassiveComponent(this,this.effectState.target,id))return;return callback.apply(this,args);};
 }
 for(const [key,callback]of Object.entries(a.icebody))if(key.startsWith('on')&&key!=='onDamagingHit'&&typeof callback==='function')a.frozenfortress[key]=function(this:Battle,...args:any[]){return a.icebody[key].apply(this,args);};
 // The volatile belongs to the native Flash Fire even after selected-ability loss/suppression.
 for(const key of ['onModifyAtk','onModifySpA'])a.flashfire.condition[key]=function(this:Battle,stat:number,attacker:Pokemon,defender:Pokemon,move:ActiveMove){if(move&&this.movehasType(move,'Fire')&&attacker.hasAbilityOrPassive('flashfire'))return this.chainModify(1.5);};
}
