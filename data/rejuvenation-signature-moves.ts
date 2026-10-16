import type {MoveDataTable} from '../sim/dex-moves';
import {expectedCategory} from '../sim/expected-category';
import {signatureMoveText} from './signature-move-summaries';
const flags = {protect: 1, mirror: 1} as const;
export const adaptive = function (this: Battle, move: ActiveMove, source: Pokemon) {
 move.category = source.getStat('atk', false, true) > source.getStat('spa', false, true) ? 'Physical' : 'Special';
};
function bind(this: Battle, target: Pokemon, source: Pokemon, move: ActiveMove) {
 if (target.addVolatile('partiallytrapped', source, move)) target.volatiles.partiallytrapped.duration = 4;
}
function prepareHP(this: Battle, target: Pokemon, source: Pokemon, move: ActiveMove) { (move as any).signatureTargetHP = target.hp; }
function opposingHP(target: Pokemon, source: Pokemon, move: ActiveMove) { return !target.isAlly(source) && target.hp < (move as any).signatureTargetHP; }
function raidAnimation(this: Battle, target: Pokemon, source: Pokemon, move: ActiveMove) { if(move.hit>1)this.add('-anim',source,'Thunder Raid',target); }
export const RejuvenationSignatureMoves: MoveDataTable = {
 multipulse: {num:10419,name:'Multipulse',type:'Normal',category:'Special',basePower:80,accuracy:100,pp:15,priority:0,target:'adjacentFoe',flags:{...flags,pulse:1},onModifyType(move,source){const item=source.getItem();if(!source.ignoringItem()&&item.id.endsWith('plate')&&item.onPlate)move.type=item.onPlate;}},
 aquabatics: {num:10420,name:'Aquabatics',type:'Water',category:'Status',basePower:0,accuracy:100,pp:10,priority:0,target:'self',flags:{snatch:1,dance:1},boosts:{spa:1,spe:1},onModifyMove(move){if(this.field.isTerrain('bigtopterrain'))move.boosts={spa:2,spe:2};}},
 feverpitch: {num:10421,name:'Fever Pitch',type:'Fire',category:'Special',basePower:80,accuracy:100,pp:10,priority:0,target:'adjacentFoe',flags:{...flags,sound:1},sleepUsable:true,onTryMove(source){if(source.status==='slp')source.cureStatus();},onModifyMove(move){move.basePower=this.sample([60,80,100]);}},
 thunderraid: {num:10422,name:'Thunder Raid',type:'Electric',category:'Physical',basePower:20,accuracy:90,pp:10,priority:0,target:'adjacentFoe',flags,multihit:3,multiaccuracy:true,onHit:raidAnimation,onAfterSubDamage(damage,target,source,move){if(damage>0)raidAnimation.call(this,target,source,move);},basePowerCallback(source,target,move){return 20*move.hit;}},
 desertsmark: {num:10423,name:"Desert's Mark",type:'Ground',category:'Status',basePower:0,accuracy:90,pp:10,priority:0,target:'adjacentFoe',flags:{...flags,reflectable:1},onHit(target,source,move){if(target.setType('Ground'))this.add('-start',target,'typechange','Ground');bind.call(this,target,source,move);}},
 superumdmove: {num:10424,name:'Super U.M.D. Move',type:'Steel',category:'Special',basePower:80,accuracy:100,pp:10,priority:0,target:'adjacentFoe',flags,onModifyMove(move,source,target){if(target)move.category=expectedCategory(this,source,target,move)||move.category;(move as any).umdStartingField=this.field.terrain;}},
 galestrike: {num:10425,name:'Gale Strike',type:'Fighting',category:'Physical',basePower:70,accuracy:100,pp:15,priority:0,target:'adjacentFoe',flags,critRatio:2,onPrepareHit:prepareHP,onHit(target,source,move){if(opposingHP(target,source,move)&&target.getMoveHitData(move).crit&&!(move as any).galeStrikeBoosted){(move as any).galeStrikeBoosted=true;this.boost({spe:1},source,source,move);}}},
 spectralscream: {num:10426,name:'Spectral Scream',type:'Ghost',category:'Special',basePower:85,accuracy:100,pp:10,priority:0,target:'adjacentFoe',flags:{...flags,sound:1},drain:[1,4],onModifyMove:adaptive},
 barbedweb: {num:10427,name:'Barbed Web',type:'Bug',category:'Special',basePower:50,accuracy:100,pp:15,priority:0,target:'adjacentFoe',flags,onModifyMove:adaptive,onHit:bind,secondary:{chance:30,status:'psn'}},
 coldtruth: {num:10428,name:'Cold Truth',type:'Ice',category:'Special',basePower:70,accuracy:100,pp:10,priority:0,target:'adjacentFoe',flags,onPrepareHit:prepareHP,onHit(target,source,move){if(opposingHP(target,source,move))target.addVolatile('torment',source,move);}},
 bunrakubeatdown: {num:10429,name:'Bunraku Beatdown',type:'Psychic',category:'Special',basePower:80,accuracy:100,pp:10,priority:0,target:'adjacentFoe',flags,onModifyMove(move,source){adaptive.call(this,move,source);move.basePower=Math.min(140,80+15*source.side.pokemon.filter(p=>p!==source&&p.fainted).length);move.flags={...move.flags,bypasssub:1};}},
 matrixshot: {num:10430,name:'Matrix Shot',type:'Rock',category:'Physical',basePower:80,accuracy:100,pp:10,priority:0,target:'adjacentFoe',flags,overrideDefensiveStat:'spd'},
 pyrokinesis: {num:10431,name:'Pyrokinesis',type:'Psychic',category:'Special',basePower:80,accuracy:100,pp:10,priority:0,target:'adjacentFoe',flags,secondary:{chance:30,status:'brn'}},
 venamskiss: {num:10432,name:"Venam's Kiss",type:'Poison',category:'Special',basePower:60,accuracy:100,pp:10,priority:0,target:'adjacentFoe',flags:{...flags,bite:1,tail:1},onModifyMove:adaptive,ignoreImmunity:{Poison:true},onEffectiveness(typeMod,target,type){if(type==='Steel')return 1;},secondary:{chance:30,onHit(target,source,move){if(!target.status){const bypassType=target.hasType(['Steel','Poison']);if(!bypassType||this.runEvent('Immunity',target,null,null,'psn'))target.setStatus('psn',source,move,bypassType);}}}},
 heavenlywing: {num:10433,name:'Heavenly Wing',type:'Flying',category:'Special',basePower:70,accuracy:100,pp:10,priority:0,target:'adjacentFoe',flags,onPrepareHit:prepareHP,onHit(target,source,move){if(!opposingHP(target,source,move))return;const boost:SparseBoostsTable={};for(const stat of Object.keys(target.boosts) as BoostID[])if(target.boosts[stat]>0)boost[stat]=0;if(Object.keys(boost).length){target.setBoost(boost);this.add('-clearpositiveboost',target,source,'move: Heavenly Wing');}}},
 uproot: {num:10434,name:'Uproot',type:'Grass',category:'Special',basePower:40,accuracy:100,pp:20,priority:0,target:'adjacentFoe',flags,boosts:{spd:-2}},
};
export const RejuvenationSignatureLearnsets: {[id:string]: string[]} = {
 multipulse: ["bewear","porygonz","silvally","delcatty","indeedeef","cyclizar","chatot","wyrdeer"],
 aquabatics: ["primarina","floatzel","lumineon","lanturn","octillery"],
 feverpitch: ["toxtricityaevian","exploud","skeledirge","camerupt","blaziken","gyaradosaevian","scovillain"],
 thunderraid: ["electivire","luxray","zebstrika","togedemaru","electrodehisui","eelektross","toxtricity","toxtricitylowkey"],
 desertsmark: ["torterra","sandaconda","palossand","gliscor","dugtrioalola","runerigus"],
 superumdmove: ["metagross","duraludon","magnezone","archaludon","tinkaton","bastiodon","durant","bronzong","klinklang"],
 galestrike: ["lucario","gallade","hawlucha","scrafty","sirfetchd","machamp","pawmot","darmanitan","emboar","blaziken"],
 spectralscream: ["dusclops","dusknoir","mismagius","chandelure","drifblim","sinistcha","mismagiusaevian","gengar","sinistchamasterpiece"],
 barbedweb: ["araquanid","ariados","galvantula","escavalier"],
 coldtruth: ["walrein","froslass","cryogonal","ninetalesalola","glaceon","jynx","rotomfrost","beartic","kyurem","kyuremwhite"],
 bunrakubeatdown: ["medicham","meowsticf","mrmime","beheeyem","hatterene","delphox","musharna","gardevoir","claydol","xatu","rabsca","mrrime","slowking","oranguru"],
 matrixshot: ["aerodactyl","gigalith","minior","tyranitar","rampardos","kleavor","kabutops","coalossal","crustle","golemalola"],
 pyrokinesis: ["alakazam","delphox","armarouge","espeon","exeggutor","slowbrogalar"],
 venamskiss: ["seviper","arbok","salazzle","garbodor","toxicroak","toxtricity","toxtricitylowkey","scolipede","venusaur"],
 heavenlywing: ["pidgeot","togekiss","swanna","skarmory","unfezant","volcaronaaevian","dragonite"],
 uproot: ["venusaur","vileplume","cradily","ludicolo","shiinotic","rotommow","froslassaevian","whimsicott"],
};
export const RejuvenationSignatureDescriptions: {[id:string]: {shortDesc:string,desc:string}} = {};
const summaries: {[id:string]:string} = {
 multipulse:'80 power; type follows the held Plate. Pulse move.',aquabatics:'Raises Sp. Atk and Speed by 1 stage.',feverpitch:'Random 60/80/100 power. Usable asleep; wakes user. Sound move.',thunderraid:'Three hits at 20/40/60 power; each checks 90% accuracy and stops on a miss.',desertsmark:'Makes the target pure Ground-type and binds it for four turns.',superumdmove:'Uses the Physical or Special category that deals greater calculated damage.',galestrike:'High critical-hit ratio; a critical hit damaging opposing HP raises Speed once per use.',spectralscream:'85 base power; uses the higher staged Attack or Special Attack, Special on ties. Sound move; heals 25% of damage dealt. Existing field effects apply.',barbedweb:'Uses higher Attack or Sp. Atk; binds for four turns; 30% poison.',coldtruth:'Applies Torment after damaging opposing HP.',bunrakubeatdown:'Uses higher Attack or Sp. Atk. 80 power +15 per currently fainted teammate, capped at 140; bypasses Substitute.',matrixshot:'Uses Attack against the target Sp. Def.',pyrokinesis:'30% chance to burn.',venamskiss:'Uses the higher staged Attack or Special Attack, Special on ties. Super effective on Steel; 30% poison, including Steel and Poison types; other protections remain.',heavenlywing:'Clears positive stat stages after damaging opposing HP.',uproot:'Lowers the target Sp. Def by 2 stages.',
};
export const RejuvenationSignatureCredits: {[id: string]: string} = {
 multipulse: 'Marianette', aquabatics: 'Valarie', feverpitch: 'Amber', thunderraid: 'Erick',
 desertsmark: 'Ryland', superumdmove: 'Saki', galestrike: 'Keta (also Aelita and Texen)',
 spectralscream: 'Narcissa (also Spector)', barbedweb: 'Crawli', coldtruth: 'Angie',
 bunrakubeatdown: 'the Puppet Master (through proxies Magenta and Neon)', matrixshot: 'Adam',
 pyrokinesis: 'Lavender', venamskiss: 'Venam', heavenlywing: 'Souta', uproot: 'Flora and Florin',
};
for (const [id, summary] of Object.entries(summaries)) {
 const fieldNotes: {[id:string]:string} = {"multipulse":" Holy Field adds a 1.3x named boost regardless of Plate type.","aquabatics":" Big Top raises both stats by 2 stages instead.","feverpitch":" Cave gains shared volcanic heat; the second heating use changes it to Volcanic with the existing transition boost.","desertsmark":" Desert binding damage is 1/6 max HP; Ashen Field lowers trapped targets' accuracy each turn.","superumdmove":" Factory and Short Circuit boost power 1.5x; Physical changes Factory to Short Circuit, Special reverses it, with a 1.3x transition boost.","galestrike":" Forest boosts power 1.5x and adds Grass typing.","matrixshot":" Dragon's Den adds a 1.5x named boost alongside its Rock boost."};
 const fieldSummary = summary + (fieldNotes[id] || '');
 let desc = fieldSummary;
 if (['barbedweb', 'bunrakubeatdown'].includes(id)) desc += ' Adaptive damage uses the higher Attack or Sp. Atk including stat stages, with the matching defense and Special winning ties. Items, burn, screens and opposing defenses do not change this comparison.';
 if (id === 'superumdmove') desc += ' Category compares calculated damage, including offensive and defensive modifiers, items, burn, screens and Wonder Room; ties retain Special.';
 RejuvenationSignatureDescriptions[id] = signatureMoveText(id, RejuvenationSignatureCredits[id], desc);
}
