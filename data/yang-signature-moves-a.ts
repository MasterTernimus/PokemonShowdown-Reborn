import {adaptiveFieldMultiplier} from '../sim/adaptive-cycle';
import type {MoveDataTable} from '../sim/dex-moves';
import {signatureMoveText} from './signature-move-summaries';

const flags = {protect: 1, mirror: 1, metronome: 1} as const;
const contact = {...flags, contact: 1} as const;
function veil(this: Battle, target: Pokemon, source: Pokemon, move: ActiveMove) {
 if (source.side.getSideCondition('auroraveil')) return;
 if (source.side.addSideCondition('auroraveil', source, move)) {
  source.side.sideConditions.auroraveil.duration = 3;
  this.add('-sidestart', source.side, 'move: Aurora Veil', '[turns] 3', '[silent]');
 }
}
function clearField(this: Battle, target: Pokemon, source: Pokemon, move: ActiveMove) {
 const state = move as ActiveMove & {infernalFieldCleared?: boolean};
 if (state.infernalFieldCleared) return;
 state.infernalFieldCleared = true;
 const garden = this.field.flowerGardenStage();
 if (garden) {
  if (garden >= 3 && !this.field.isWeather(['raindance', 'primordialsea']) && !this.field.getPseudoWeather('watersport') && !this.getAllActive().some(p => p.volatiles.watersport)) this.field.changeTerrain('flowergarden' + (garden - 2), source, move, true);
  return;
 }
 if (this.field.isTerrain('caveterrain')) {
  this.field.changeTerrain('volcanicterrain', source, move);
  return;
 }
 if (source.addVolatile('infernalrage', source, move)) source.volatiles.infernalrage.startingField = this.field.terrain;
}
function finishInfernalField(this: Battle, source: Pokemon, move: ActiveMove) {
 const original = source.volatiles.infernalrage?.startingField;
 source.removeVolatile('infernalrage');
 if (original !== this.field.terrain) return;
 // Use ordinary replacement eligibility before the native clear path (which also checks Neutralization).
 if (!this.field.canSetTerrain('', source, move) || this.field.isTerrain(['chessboardterrain', 'glitchterrain'])) return;
 this.field.clearTerrain();
}
export const YangSignatureMovesA: MoveDataTable = {
 kaboom: {num:10435,name:'KABOOM!!',type:'Electric',category:'Special',basePower:90,accuracy:100,pp:10,priority:0,target:'normal',flags,recoil:[1,4],onModifyMove(move,source){move.category=source.getStat('atk',false,true)>source.getStat('spa',false,true)?'Physical':'Special';if(this.field.isTerrainOrAura('electricterrain'))delete move.recoil;},secondary:{chance:100,self:{boosts:{spa:1}}}},
 cactibash: {num:10436,name:'Cacti Bash',type:'Grass',category:'Physical',basePower:50,accuracy:100,pp:10,priority:0,target:'normal',flags:contact,multihit:2,onBasePower(bp,source,target){if(this.field.isTerrain('desertterrain'))return this.chainModify(adaptiveFieldMultiplier(this,source,target,1.5));},
  onAfterHit(target,source,move){const state=move as ActiveMove & {cactiSpikesSet?:boolean};if(target.hp||target.isAlly(source)||state.cactiSpikesSet||this.field.isTerrain(['watersurfaceterrain','murkwatersurfaceterrain','midnightzoneterrain']))return;state.cactiSpikesSet=true;target.side.addSideCondition('spikes',source,move);}},
 corrosivestrike: {num:10437,name:'Corrosive Strike',type:'Poison',category:'Physical',basePower:70,accuracy:100,pp:15,priority:0,target:'normal',flags:contact,ignoreImmunity:{Poison:true},onEffectiveness(typeMod,target,type){if(type==='Steel')return 1;},volatileStatus:'corrosivestrike',onBasePower(bp,source,target){if(this.field.isTerrain('corrosiveterrain'))return this.chainModify(adaptiveFieldMultiplier(this,source,target,1.5));},
  condition:{noCopy:true,onStart(target){this.add('-start',target,'Corrosion');},onResidualOrder:9,onResidual(pokemon){this.damage(pokemon.baseMaxhp/16,pokemon,this.effectState.source);},onEnd(target){this.add('-end',target,'Corrosion');}}},
 toxicvial: {num:10438,name:'Toxic Vial',type:'Poison',category:'Status',basePower:0,accuracy:90,pp:10,priority:0,target:'normal',flags:{...flags,reflectable:1},status:'tox',boosts:{atk:-1,spa:-1}},
 flutterscales: {num:10439,name:'Flutter Scales',type:'Bug',category:'Special',basePower:75,accuracy:100,pp:10,priority:0,target:'allAdjacentFoes',flags,
  onBasePower(bp,source,target){if(this.field.isTerrainOrAura('rainbowterrain'))return this.chainModify(adaptiveFieldMultiplier(this,source,target,1.5));},
  onHit(target,source,move){if((target.getMoveHitData(move).damage||0)>0)this.boost({[this.sample(['atk','spa'])]:-1},target,source,move);}},
 spiritmend: {num:10440,name:'Spirit Mend',type:'Ghost',category:'Status',basePower:0,accuracy:100,pp:5,priority:0,target:'self',flags:{snatch:1,heal:1,metronome:1},heal:[1,2],boosts:{spd:1},onTry(source){if(this.field.isTerrain('holyterrain'))return false;},onModifyMove(move){if(this.field.isTerrain(['darkcrystalcavernterrain','shortcircuitterrain','newworldterrain']))move.heal=[66,100];},onHit(target,source,move){if(this.field.isTerrain('factoryterrain'))this.field.changeTerrain('shortcircuitterrain',source,move);}},
 chistrike: {num:10441,name:'Chi Strike',type:'Fighting',category:'Physical',basePower:75,accuracy:true,pp:15,priority:0,target:'normal',flags:contact,critModifier:2,onBasePower(bp,source,target){if(this.field.isTerrain('ashenbeachterrain'))return this.chainModify(adaptiveFieldMultiplier(this,source,target,1.3));}},
 gunkrock: {num:10442,name:'Gunk Rock',type:'Poison',category:'Special',basePower:80,accuracy:100,pp:10,priority:0,target:'allAdjacentFoes',flags:{...flags,sound:1},onBasePower(bp,source,target){if(this.field.isTerrain('wastelandterrain'))return this.chainModify(adaptiveFieldMultiplier(this,source,target,1.5));},secondary:{chance:30,onHit(target,source,move){target.trySetStatus(this.sample(['brn','psn','par']),source,move);}}},
 frozenrefractals: {num:10443,name:'Frozen Refractals',type:'Ice',category:'Special',basePower:75,accuracy:100,pp:10,priority:0,target:'normal',flags,
  onAfterHit(target,source,move){if((target.getMoveHitData(move).damage||0)>0)veil.call(this,target,source,move);},onAfterSubDamage(damage,target,source,move){if(damage>0)veil.call(this,target,source,move);}},
 nomoswish: {num:10444,name:"Nomos' Wish",type:'Normal',category:'Status',basePower:0,accuracy:100,pp:5,priority:0,target:'self',flags:{snatch:1,heal:1,metronome:1},boosts:{def:1,spd:1},slotCondition:'wish'},
 queensgambit: {num:10445,name:"Queen's Gambit",type:'Psychic',category:'Special',basePower:110,accuracy:100,pp:5,priority:0,target:'normal',flags,
  onTry(source){if(this.field.isTerrain('chessboardterrain')&&source.hasAbilityOrPassive('klutz'))return false;},onModifyMove(move,source){if(this.field.isTerrain('chessboardterrain')&&source.Role==='Queen')move.willCrit=true;move.category=source.getStat('atk',false,true)>source.getStat('spa',false,true)?'Physical':'Special';},self:{boosts:{def:-1,spd:-1}}},
 darkclasp: {num:10446,name:'Dark Clasp',type:'Dark',category:'Special',basePower:85,accuracy:100,pp:10,priority:0,target:'normal',flags,overrideOffensiveStat:'spd',onAfterHit(target,source,move){if((target.getMoveHitData(move).damage||0)<=0)return;const next=this.field.isTerrain(['caveterrain','crystalcavernterrain'])?'darkcrystalcavernterrain':this.field.isTerrain('factoryterrain')?'shortcircuitterrain':'';if(next)this.field.changeTerrain(next,source,move);},onAfterSubDamage(damage,target,source,move){if(damage<=0)return;const next=this.field.isTerrain(['caveterrain','crystalcavernterrain'])?'darkcrystalcavernterrain':this.field.isTerrain('factoryterrain')?'shortcircuitterrain':'';if(next)this.field.changeTerrain(next,source,move);}},
 beatdown: {num:10447,name:'Beatdown',type:'Fighting',category:'Physical',basePower:30,accuracy:95,pp:10,priority:0,target:'normal',flags:contact,multihit:3,multiaccuracy:true,
  onHit(target,source,move){const state=move as ActiveMove & {beatdownTaunted?:boolean};if(state.beatdownTaunted||(target.getMoveHitData(move).damage||0)<=0)return;state.beatdownTaunted=true;target.addVolatile('taunt',source,move);}},
 infernalrage: {num:10448,name:'Infernal Rage',type:'Fire',category:'Special',basePower:90,accuracy:100,pp:10,priority:0,target:'allAdjacentFoes',flags,
  condition:{noCopy:true,onAfterMovePriority:-1000,onAfterMove(source,target,move){finishInfernalField.call(this,source,move);}},onHit(target,source,move){if((target.getMoveHitData(move).damage||0)>0)target.addVolatile('torment',source,move);},
  onAfterHit(target,source,move){if((target.getMoveHitData(move).damage||0)>0)clearField.call(this,target,source,move);},onAfterSubDamage(damage,target,source,move){if(damage>0)clearField.call(this,target,source,move);}},
};
export const YangSignatureLearnsetsA: {[id:string]:string[]} = {
 kaboom:['electrode','electrodehisui','golem','golemalola','bronzong','magnezone','forretress','rotom','rotomheat','rotomwash','rotomfrost','rotomfan','rotommow'],
 cactibash:['cacturne','maractus','chesnaught'],
 corrosivestrike:['seviper','muk','mukalola','crobat','skuntank','grafaiai','sneasler','glimmora','toxapex'],
 toxicvial:['weezing','garbodor','toxapex','nidoqueen','toxicroak'],
 flutterscales:['butterfree','vivillon','araquanid','volbeat','leavanny'],
 spiritmend:['dusknoir','cursola','gengar'],
 chistrike:['medicham','hariyama','machamp','lucario','hitmonlee','hitmonchan','hitmontop'],
 gunkrock:['toxtricity','skuntank'],
 frozenrefractals:['froslass','jynx','ninetalesalola'],nomoswish:['audino','wigglytuff'],
 queensgambit:['metagross','slowking','gardevoir','gallade'],darkclasp:['umbreon','spiritomb'],
 beatdown:['conkeldurr','pangoro'],infernalrage:['chandelure','delphox','typhlosion','typhlosionhisui','ninetales'],
};
export const YangSignatureDescriptionsA: {[id:string]:{shortDesc:string,desc:string}} = {};
const descriptions: {[id:string]:[string,string]} = {
 kaboom:['Julia','Uses the higher staged Attack or Sp. Atk (Special on ties), against the corresponding defense. Raises Sp. Atk by 1 as a guaranteed secondary effect; recoil is 1/4 damage dealt.'],
 cactibash:['Florinia','Hits twice. Knocking out the target adds one layer of Spikes to its side, at most once per use.'],
 corrosivestrike:['Corey','Super effective against Steel. Inflicts non-stacking corrosion dealing 1/16 maximum HP each turn until the target switches.'],
 toxicvial:['Corey','Badly poisons the target and lowers its Attack and Sp. Atk by 1. Normal status and stat-drop protections apply.'],
 flutterscales:['Shelly','Hits opposing Pokemon. Each damaged target has either Attack or Sp. Atk lowered by 1, chosen equally.'],
 spiritmend:['Shade','Heals half maximum HP and raises Sp. Def by 1.'],
 chistrike:['Kiki','Always hits. Critical hits deal 2x damage; does not raise critical-hit chance.'],
 gunkrock:['Aya','Sound move hitting opposing Pokemon. 30% chance of a status: burn, poison or paralysis, equally likely. A blocked status is not rerolled.'],
 frozenrefractals:['Serra','A damaging hit creates Aurora Veil for exactly 3 turns without requiring weather. Does not refresh existing Veil; no duration extensions.'],
 nomoswish:['Noel','Raises Defense and Sp. Def by 1 and sets native Wish in the user’s position, healing at the end of the following turn.'],
 queensgambit:['Radomus','Uses the higher current Attack or Sp. Atk and corresponding defense; ties use Special. Lowers the user’s Defense and Sp. Def by 1 afterward.'],
 darkclasp:['Luna','Uses the user’s Sp. Def instead of Sp. Atk against the target’s Sp. Def.'],
 beatdown:['Samson','Hits three times with a separate 95% accuracy check per hit, stopping on a miss. A successful hit applies Taunt once per use.'],
 infernalrage:['Charlotte','Hits opposing Pokemon and applies Torment to damaged targets. Clears a replaceable field after a hit, respecting field locks.'],
};
for (const [id, [credit, summary]] of Object.entries(descriptions)) {
 YangSignatureDescriptionsA[id] = signatureMoveText(id, credit, summary);
}

export const YangSignatureFieldNotesA: {[id: string]: string | null} = {
  "kaboom": "Electric Terrain or Electric Aura removes recoil.",
  "cactibash": "Desert: 1.5× power. Uses Big Top striker rules. Cannot add KO Spikes on Water Surface, Murkwater Surface or Midnight Zone.",
  "corrosivestrike": "Corrosive Terrain: 1.5× power.",
  "toxicvial": null,
  "flutterscales": "Rainbow: 1.5× power.",
  "spiritmend": "Dark Crystal Cavern, Short Circuit and New World restore 66% maximum HP, rounded down. Fails on Holy. Changes Factory to Short Circuit after healing.",
  "chistrike": "Ashen Beach: 1.3× power.",
  "gunkrock": "Wasteland: 1.5× power. Uses normal sound-move field effects.",
  "frozenrefractals": null,
  "nomoswish": "Misty, Rainbow, Fairy Tale, Holy and Starlight Arena: native Wish restores 75% maximum HP. Misty Aura and Rainbow Aura also grant this healing snapshot.",
  "queensgambit": "Uses Chess move and piece rules. A Queen always lands a critical hit. Target Opportunist halves and Gorilla Tactics doubles the matchup modifier; user Klutz makes the move fail.",
  "darkclasp": "Changes Cave or Crystal Cavern to Dark Crystal Cavern, and Factory to Short Circuit, after damage. Field locks apply.",
  "beatdown": null,
  "infernalrage": "Changes Cave to Volcanic. Flower Garden stage 3 or higher loses two stages unless rain or Water Sport prevents it. Uses native Ignite transformations before clearing other replaceable fields."
};
for (const [id, note] of Object.entries(YangSignatureFieldNotesA)) {
 if (note) YangSignatureDescriptionsA[id].desc += ' Field effects: ' + note;
}

export const YangSignatureCreditsA: {[id:string]:string} = Object.fromEntries(
 Object.entries(descriptions).map(([id,[credit]]) => [id,credit])
);
