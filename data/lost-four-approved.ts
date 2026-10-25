import type {AbilityDataTable} from '../sim/dex-abilities';
import type {ConditionDataTable} from '../sim/dex-conditions';
import {skipPassiveComponent} from './passive-ability-cleanup';
export const CanopyArrowMoves = ['spiritshackle','thousandarrows','triplearrows','snipeshot','razorleaf','magicalleaf','spikecannon','pinmissile','iciclespear','rockblast','bulletseed','scaleshot','psychocut','ceaselessedge'];
export const LostFourDescriptions = {
 beguilingbouquet:{name:'Beguiling Bouquet',shortDesc:'Aroma Veil; Grass attacks have a 30% poison chance.',desc:'Aroma Veil. Damaging Grass moves gain a 30% poison secondary; Serene Grace doubles it to 60%.'},
 venomspurs:{name:'Venom Spurs',shortDesc:'Corrosion; Bug attacks have a 30% poison chance.',desc:'Corrosion. Damaging Bug moves gain a 30% poison secondary.'},
 lastbrood:{name:'Last Brood',shortDesc:'Swarm; once/entry, surviving a hit at half HP creates a free Substitute.',desc:"Swarm. Once per entry after surviving a whole opposing attack that deals HP damage, creates a free Substitute with floor(max HP/4) HP if at half HP or below. An existing Substitute preserves the allowance."},
 polarrest: {name:'Polar Rest',shortDesc:'Early Bird + Ice Body.',desc:'Full local Early Bird + Ice Body: wakes twice as fast; heals in hail, snow and icy fields, resists weather chip, and may frostbite contact attackers.'},
 glacierbreaker: {name:'Glacier Breaker',shortDesc:'Mold Breaker; damaging Ice moves break screens.',desc:'Full Mold Breaker. Damaging Ice moves remove Reflect, Light Screen and Aurora Veil before damage, following Brick Break rules.'},
 deepchill: {name:'Deep Chill',shortDesc:'Oblivious + Intimidate; surviving a hit lowers attacker Speed once/turn.',desc:'Full Oblivious + Intimidate. After surviving a whole opposing damaging move that deals HP damage, lowers the attacker’s Speed by 1 once per turn.'},
 reinflate: {name:'Reinflate',shortDesc:'Punk Rock; sound HP damage heals 1/4 max HP once per turn.',desc:'Full local Punk Rock: sound moves gain 1.3x power (1.5x on Big Top/Cave), and incoming sound damage is halved. Once per turn after a whole damaging sound move deals opposing HP damage, heals 1/4 maximum HP if alive and active. No reward for ally, residual, delayed, status or Substitute-only damage. Heal Block and selected-ability suppression apply; ability restarts do not refresh the allowance.'},
 cushionchorus: {name:'Cushion Chorus',shortDesc:'Full Friend Guard + Aroma Veil.',desc:'Full local Friend Guard and Aroma Veil. Allies take 25% less attack damage; protects the holder and allies from the mental effects covered by Aroma Veil. Fluffy is supplied separately as the species passive.'},
 perfectapple: {name:'Perfect Apple',shortDesc:'Full Pure Power + Self Sufficient + Anger Shell.',desc:'Full local Pure Power, Self Sufficient and Anger Shell: doubles Attack (Sp. Atk instead on Psychic Terrain), heals 1/16 maximum HP per turn and prevents sand/hail damage. Crossing from above half HP to half HP or below through qualifying attack damage triggers normal Anger Shell: +1 Attack, Sp. Atk and Speed; -1 Defense and Sp. Def.'},
 solarmimicry: {name:'Solar Mimicry',shortDesc:'Bug STAB/resistances; personal sun; Solar Blade lowers own Speed.',desc:"Bug attacks receive ordinary STAB without doubling Bug STAB. Gains Bug resistances to Fighting, Grass and Ground without Bug weaknesses. Personally treats weather as sunny without changing the field or other Pokémon; normal weather suppression and Utility Umbrella apply. After using ordinary Solar Blade, lowers its own Speed by 1 stage once after the whole use; Contrary and normal stat-change rules apply."},
	canopyarcher: { name: 'Canopy Archer', shortDesc: 'Flying STAB/resistances; accurate arrows; Scrappy + Long Reach.', desc: "Flying attacks receive ordinary STAB without doubling Flying STAB. Gains Flying resistances to Bug, Fighting and Grass, without Flying weaknesses or Ground immunity. The established arrow-classified moves bypass accuracy/evasion checks; ordinary protection and ability immunities remain. Normal and Fighting moves can hit Ghost types, Intimidate cannot lower Attack, and moves do not make contact." },
 mourningvessel: {name:'Mourning Vessel',shortDesc:'+20% power per allied faint, up to 2x; heals 5% HP per opposing faint.',desc:"Damaging moves gain 20% power per recorded allied faint, including the allied side in multi battles, capped at double power. At turn end, heals 5% maximum HP per recorded opposing faint, counting all opposing sides in Free-for-All. Preserves the cumulative faint counters. No Prankster or Magic Guard; these belong to the selected Bound Spirits ability."},
 boundspirits: {name:'Bound Spirits',shortDesc:'Full Prankster + Magic Guard.',desc:'Full local Prankster and Magic Guard: status moves gain +1 priority under normal Prankster rules, and indirect damage is prevented. Normal HP costs, Pain Split, confusion and Struggle recoil remain. Mourning Vessel is a separate species passive.'},
 keystoneseal: {name:'Keystone Seal',shortDesc:'Cursed Body; continuous Imprison; blocks opposing forced switches.',desc:'Full local Cursed Body. While active, continuously prevents opponents from using moves shared with its current moveset, following ordinary Imprison rules. Blocks opposing forced switches, but not voluntary switches or self-pivots. Suppression disables the seal. The public Sealing indicator never discloses unrevealed moves. No first-hit shield.'},
};
export function installLostFour(abilities: AbilityDataTable) {
 const poisonSecondary=function(this:Battle,move:ActiveMove,type:string){
  if(move.category==='Status'||!this.movehasType(move,type))return;
  move.secondaries ||= [];
  move.secondaries.push({chance:30,status:'psn'});
 };
 abilities.beguilingbouquet={...abilities.aromaveil,name:'Beguiling Bouquet',num:11516,rating:4,onModifyMovePriority:1,
  onModifyMove(move,pokemon){if(skipPassiveComponent(this,pokemon,'beguilingbouquet'))return;poisonSecondary.call(this,move,'Grass');},
 };
 abilities.venomspurs={...abilities.corrosion,name:'Venom Spurs',num:11517,rating:4,onModifyMovePriority:1,
  onModifyMove(move,pokemon,target){abilities.corrosion.onModifyMove?.call(this,move,pokemon,target);poisonSecondary.call(this,move,'Bug');},
 };
 abilities.lastbrood={...abilities.swarm,name:'Last Brood',num:11518,rating:4,
  onSwitchIn(pokemon){delete pokemon.m.lastBroodSpent;},
  onDamagingHit(damage,pokemon,source,move){if(damage>0&&!pokemon.isAlly(source)){this.effectState.pendingMove=move;this.effectState.pendingSource=source;}},
  onAnyAfterAttackResolved(source,target,move){
   const p=this.effectState.target as Pokemon;
   if(this.effectState.pendingMove!==move||this.effectState.pendingSource!==source)return;
   delete this.effectState.pendingMove;delete this.effectState.pendingSource;
   if(!p.hp||!p.isActive||p.hp*2>p.maxhp||(p.m.lastBroodSpent&&p.m.lastBroodEntry===p.previouslySwitchedIn)||p.volatiles.substitute)return;
   if(p.addVolatile('substitute',p,this.effect)){p.volatiles['substitute' as ID].hp=Math.floor(p.maxhp/4);p.m.lastBroodSpent=true;p.m.lastBroodEntry=p.previouslySwitchedIn;}
  },
 };
 abilities.polarrest={...abilities.earlybird,...abilities.icebody,name:'Polar Rest',num:11514,rating:4};
 abilities.glacierbreaker={...abilities.moldbreaker,name:'Glacier Breaker',num:11515,rating:4,
  onModifyMove(move,pokemon){
   if(skipPassiveComponent(this,pokemon,'glacierbreaker'))return;
   move.ignoreAbility=true;
   if(move.category==='Status'||!this.movehasType(move,'Ice'))return;
   const original=move.onTryHit;
   move.onTryHit=function(target,source,activeMove){
    const result=typeof original === 'function' ? original.call(this,target,source,activeMove) : original;
    if(result===false||result===null)return result;
    for(const id of ['reflect','lightscreen','auroraveil'])target.side.removeSideCondition(id);
    return result;
   };
  },
 };
 abilities.deepchill={...abilities.intimidate,...abilities.deepchill,
  onStart:abilities.intimidate.onStart,
  onDamagingHit(damage,target,source,move){
   if(damage<=0||source.isAlly(target)||target.volatiles.deepchillturnspent)return;
   this.effectState.pendingMove=move;this.effectState.pendingAttacker=source;
  },
 };
 const reinflate = abilities.reinflate;
 abilities.reinflate = {...abilities.punkrock,...reinflate,
  onAfterMove(pokemon,target,move) { const pending=this.effectState.reinflateMove;delete this.effectState.reinflateMove;if(pending!==move||!pokemon.hp||!pokemon.isActive||pokemon.m.reinflateTurn===this.turn)return;pokemon.m.reinflateTurn=this.turn;this.heal(pokemon.maxhp/4,pokemon,pokemon,this.effect); },
 };
 abilities.cushionchorus = {...abilities.friendguard,...abilities.aromaveil,name:'Cushion Chorus',num:11508,rating:4};
 abilities.perfectapple = {...abilities.purepower,...abilities.selfsufficient,...abilities.angershell,name:'Perfect Apple',num:11509,rating:5};
 abilities.solarmimicry = {name:'Solar Mimicry',num:11510,rating:4,flags:{},
  onImmunity(type,pokemon){if(pokemon.effectiveWeather()==='sunnyday'&&['frz','hail','sandstorm'].includes(type))return false;},
  onModifyMove(move,pokemon) { if(skipPassiveComponent(this,pokemon,'solarmimicry'))return;if(this.movehasType(move,'Bug'))move.forceSTAB=true; },
  onAnyAfterAttackResolved(pokemon,target,move) {if(pokemon!==this.effectState.target||skipPassiveComponent(this,pokemon,'solarmimicry')||!pokemon.hp||!pokemon.isActive||move.id!=='solarblade'||move.isZ||move.isMax||(move as any).solarMimicrySpent)return;(move as any).solarMimicrySpent=true;this.boost({spe:-1},pokemon,pokemon,this.effect);},
 };
 abilities.canopyarcher = {name:'Canopy Archer',num:11511,rating:4,flags:{breakable:1},
		onModifyMovePriority: -5,
		onModifyMove(move, pokemon, target) {
			if (this.movehasType(move, 'Flying'))move.forceSTAB = true;
			if (CanopyArrowMoves.includes(move.id) && !move.isZ && !move.isMax)move.accuracy = true;
			abilities.scrappy.onModifyMove?.call(this, move, pokemon, target);
			abilities.longreach.onModifyMove?.call(this, move, pokemon, target);
		},
		onTryBoost: abilities.scrappy.onTryBoost,
 };
 const mourning=abilities.mourningvessel;
 abilities.mourningvessel={...mourning};delete abilities.mourningvessel.onDamage;delete abilities.mourningvessel.onModifyPriority;
 for(const event of ['onStart','onBasePower','onResidual'] as const){const original=mourning[event] as Function; (abilities.mourningvessel as any)[event]=function(this:Battle,...args:any[]){if(skipPassiveComponent(this,this.effectState.target,'mourningvessel'))return;return original.apply(this,args);};}
 abilities.boundspirits={...abilities.prankster,...abilities.magicguard,name:'Bound Spirits',num:11512,rating:4};
 abilities.keystoneseal={...abilities.cursedbody,name:'Keystone Seal',num:11513,rating:4,
  onStart(pokemon){pokemon.addVolatile('keystoneseal');},
  onUpdate(pokemon){pokemon.addVolatile('keystoneseal');},
  onEnd(pokemon){pokemon.removeVolatile('keystoneseal');},
  onFoeDisableMove(pokemon){const holder=this.effectState.target as Pokemon;for(const slot of holder.moveSlots)if(slot.id!=='struggle')pokemon.disableMove(slot.id,true);pokemon.maybeDisabled=true;},
  onFoeBeforeMovePriority:4,
  onFoeBeforeMove(pokemon,target,move){const holder=this.effectState.target as Pokemon;if(move.id!=='struggle'&&holder.hasMove(move.id)&&!move.isZOrMaxPowered){this.add('cant',pokemon,'move: Imprison',move);return false;}},
  onDragOut(pokemon,source){if(source&&pokemon.isAlly(source))return;this.add('-activate',pokemon,'ability: Keystone Seal');return null;},
 };
}
export function installLostFourConditions(conditions: ConditionDataTable){conditions.keystoneseal={name:'Keystone Seal',noCopy:true,
 onStart(pokemon){this.add('-start',pokemon,'Sealing');},
 onUpdate(pokemon){if(!pokemon.hasAbility('keystoneseal'))pokemon.removeVolatile('keystoneseal');},
 onEnd(pokemon){this.add('-end',pokemon,'Sealing');},
};}
