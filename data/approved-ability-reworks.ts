import type {AbilityDataTable} from '../sim/dex-abilities';

export const ApprovedReworkDescriptions = {
 venombastion: {name:'Venom Bastion',shortDesc:"Stamina + Bug STAB; once per entry, Poison/Steel hits block a poisoned foe’s healing for 2 turns.",desc:"Stamina: each opposing HP hit heals 1/16 max HP; the first each turn also gives +1 Defense. Bug moves receive STAB, without changing typing or stacking with Bug STAB. Once per entry, Poison/Steel HP damage to an already-poisoned surviving foe blocks healing through the next turn. Only a newly applied Heal Block spends the use."},
 rollingfortress: {name:'Rolling Fortress',shortDesc:'Rock Head; own damaging moves cannot lower Defense or Sp. Def.',desc:'Full Rock Head prevents move recoil except Struggle. Its own damaging moves cannot lower its Defense or Sp. Def. Crash damage and other costs remain.'},
 siegetusks: {name:'Siege Tusks',shortDesc:'Mold Breaker; immune to entry hazards.',desc:'Full Mold Breaker ignores bypassable opposing abilities. Prevents entry-hazard damage, Toxic Spikes poison and Sticky Web Speed drops.'},
 floehunter: {name:'Floe Hunter',shortDesc:'Slush Rush; physical Ice attacks ignore Water’s Ice resistance.',desc:'Full local Slush Rush doubles Speed in hail or snow and on Icy, Snowy Mountain and Cold Eclipse fields. Physical Ice attacks ignore only the Water type’s Ice resistance; the target’s other defensive types still apply.'},
 headlongresolve: {name:'Headlong Resolve',shortDesc:'Reckless; recoil moves ignore positive defensive stages.',desc:"Full local Reckless boosts recoil, crash and listed explosive moves and has its Chessboard effects. Recoil-listed moves ignore positive defensive stages; negative stages still apply."},
 scorchsweep: {name:'Scorch Sweep',shortDesc:'Rock Head; once per entry, a recoil move’s HP hit clears own hazards.',desc:'Full Rock Head prevents move recoil except Struggle. Once per genuine entry, a recoil-listed move that damages an opposing Pokemon’s HP removes entry hazards from its own side. Only removing a hazard spends the use. Ability restarts do not reset it.'},
 keenhunt: {name:'Keen Hunt',shortDesc:'Keen Eye; Rock attacks ignore positive Defense against foes at half HP or less.',desc:'Full local Keen Eye prevents opposing accuracy drops, ignores evasion boosts and reveals opposing Illusions; Mirror Arena entry grants +1 accuracy and Laser Focus. Rock attacks ignore positive Defense stages against opponents at half HP or less. Negative Defense stages remain.'},
 hyperdrill: {name:'Hyper Drill',shortDesc:'Power Drill; drill/horn moves ignore positive defensive stages.',desc:"Full Power Drill boosts drill and horn moves by 1.5x, or 2x on Rocky, Mountain, Snowy Mountain, Cave and Volcanic fields, where they also bypass protection. Drill and horn moves ignore positive defensive stages. Native Power Drill applies once."},
 dreadmaw: {name:'Dread Maw',shortDesc:"Strong Jaw + Invigorate; once per entry, a bite blocks foe healing for 2 turns.",desc:"Strong Jaw + Invigorate: biting moves have 1.5x power; it and its allies receive 1.3x healing; each adjacent statused ally has a 50% cure chance at turn end. Once per entry, a bite damaging a surviving foe’s HP blocks healing through the next turn. Only a new Heal Block spends the use; blocks are not refreshed."},
};

/** Final approved replacements, after component/passive installation. */
export function installApprovedReworks(abilities: AbilityDataTable) {
 const a = abilities as any;
 a.rollingfortress = {...a.rockhead, name:'Rolling Fortress',num:a.armoredadvance.num,
  onTryBoost(boost: SparseBoostsTable,target: Pokemon,source: Pokemon,effect: ActiveMove) {
   if(target!==source || effect?.effectType!=='Move' || effect.category==='Status')return;
   if((boost.def||0)<0)delete boost.def;
   if((boost.spd||0)<0)delete boost.spd;
  },
 };
 a.siegetusks = {...a.trailbreaker,...a.moldbreaker,name:'Siege Tusks',num:a.trailbreaker.num};
 delete a.armoredadvance; delete a.trailbreaker;
 a.floehunter = {...a.slushrush,name:'Floe Hunter',num:a.floehunter.num,
  onModifyMove(move: ActiveMove) {
   if(move.type!=='Ice'||move.category!=='Physical')return;
   const previous=move.onEffectiveness;
   move.onEffectiveness=function(modifier,target,type,activeMove) {
    const result=previous?.call(this,modifier,target,type,activeMove);
    return type==='Water' && (result ?? modifier)<0 ? 0 : result;
   };
  },
 };
 a.headlongresolve = {...a.reckless,name:'Headlong Resolve',num:a.headlongresolve.num,
  onModifyMove(move: ActiveMove) {if(move.recoil)move.ignorePositiveDefensive=true;},
 };
 a.scorchsweep = {...a.rockhead,name:'Scorch Sweep',num:a.scorchsweep.num,
  onSourceDamagingHit(this: Battle,damage: number,target: Pokemon,source: Pokemon,move: ActiveMove) {
   if(damage<=0||source.isAlly(target)||!move.recoil||source.m.scorchSweepUsed)return;
   let removed=false;
   for(const id of ['spikes','toxicspikes','stealthrock','stickyweb','gmaxsteelsurge'])removed=source.side.removeSideCondition(id)||removed;
   if(removed){source.m.scorchSweepUsed=true;this.add('-activate',source,'ability: Scorch Sweep');}
  },
 };
 a.keenhunt={...a.keeneye,name:'Keen Hunt',num:a.keenhunt.num};
 a.hyperdrill={...a.powerdrill,name:'Hyper Drill',num:a.hyperdrill.num,
  onModifyMove(this: Battle,move: ActiveMove,source: Pokemon,target: Pokemon) {
   a.powerdrill.onModifyMove.call(this,move,source,target);
   if(move.flags.drill||move.flags.horn)move.ignorePositiveDefensive=true;
  },
 };
 a.venombastion.onDamagingHit=a.stamina.onDamagingHit;
 const oldVenomMove=a.venombastion.onModifyMove;
 a.venombastion.onModifyMove=function(this: Battle,move: ActiveMove,source: Pokemon) {
  oldVenomMove.call(this,move,source);
  if(move.type==='Bug')move.forceSTAB=true;
 };
 // Both seals settle after the whole attack, so a later multi-hit KO cannot spend them.
 for(const [id,key]of [['venombastion','venomBastionSeal'],['dreadmaw','dreadMawSeal']]) {
  if(id==='dreadmaw')a[id].onSourceAfterDamageApplied=function(this: Battle,damage: number,target: Pokemon,source: Pokemon,move: ActiveMove) {
   if(damage<=0||!source||source.m[key+'Used']||source.isAlly(target)||!target.hp||move?.effectType!=='Move'||move.category==='Status'||!move.flags.bite)return;
   const pending=source.m[key+'Pending'] ||= [];
   if(!pending.some((p:any)=>p.move===move&&p.target===target))pending.push({move,target});
  };
  a[id].onAfterAttackResolved=function(this: Battle,source: Pokemon,target: Pokemon,move: ActiveMove) {
   const pending=source.m[key+'Pending']||[];
   source.m[key+'Pending']=pending.filter((p:any)=>p.move!==move);
   if(source.m[key+'Used']||!source.hp||!source.isActive||!source.hasAbility(id))return;
   for(const event of pending) {
    if(event.move!==move||!event.target.hp||!event.target.isActive||event.target.volatiles.healblock)continue;
    if(event.target.addVolatile('healblock',source,this.effect)) {
     event.target.volatiles.healblock.duration=2;
     source.m[key+'Used']=true;
     this.add('-activate',source,'ability: '+a[id].name);
     break;
    }
   }
  };
 }
}
