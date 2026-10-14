'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
let battle;
const mon=(ability='No Ability')=>({species:'Mew',ability,moves:['splash','tackle','protect','wish']});
function setup(doubles=false,ability='No Ability'){
 battle=common.createBattle({gameType:doubles?'doubles':'singles'},[[mon(ability),mon(),mon()],[mon(),mon(),mon()]]);
 if(battle.requestState==='teampreview')battle.makeChoices();battle.field.terrain='';battle.randomizer=n=>n;
 for(const side of battle.sides)for(const p of side.pokemon)p.hp=p.maxhp=p.baseMaxhp=1000;
 return[battle.p1.active[0],battle.p2.active[0],battle.p1.active[1],battle.p2.active[1]];
}
function use(id,p,q,extra={}){const move=Object.assign(Dex.getActiveMove(id),{willCrit:false},extra);battle.actions.runMove(move,p,p.getLocOf(q),{externalMove:true});return move;}
describe('Yang signature moves 1–14',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('has distinct reserved IDs, credits and exact learnsets',()=>{
  const {YangSignatureMovesA:moves,YangSignatureDescriptionsA:text,YangSignatureLearnsetsA:learnsets}=require('../../../dist/data/yang-signature-moves-a');
  assert.equal(Object.keys(moves).length,14);let num=10435;
  for(const[id,move]of Object.entries(moves)){assert.equal(move.num,num++);assert(Dex.moves.get(id).exists);assert(text[id].desc.includes("'s move.") && !/inspired by|custom implementation/i.test(text[id].desc));for(const species of learnsets[id])assert.deepEqual(Dex.species.getLearnsetData(species).learnset[id],['9L1']);}
 });
 for(const context of ['normal','lightclay','mourning','frost','mirror'])it('Frozen Refractals creates exactly three turns without weather: '+context,()=>{
  const[p,q]=setup();if(context==='lightclay')p.setItem('Light Clay');if(context==='mourning')p.setAbility('Mourning Snow');if(context==='frost')p.setAbility('Frost Sovereign');if(context==='mirror')battle.field.terrain='mirrorarenaterrain';
  battle.field.weather='';use('frozenrefractals',p,q,{damage:50});assert.equal(p.side.sideConditions.auroraveil.duration,3);
 });
 it('Frozen Refractals announces its exact duration only for a newly created Veil',()=>{const[p,q]=setup();use('frozenrefractals',p,q,{damage:20});const announcements=()=>battle.log.filter(line=>line.includes('|-sidestart|')&&line.includes('Aurora Veil')&&line.includes('[turns] 3')&&line.includes('[silent]'));assert.equal(announcements().length,1);p.side.sideConditions.auroraveil.duration=2;use('frozenrefractals',p,q,{damage:20});assert.equal(announcements().length,1);assert.equal(p.side.sideConditions.auroraveil.duration,2);});
 it('Spirit Mend and Nomos Wish keep approved 100 accuracy while Chi Strike always hits',()=>{assert.equal(Dex.moves.get('spiritmend').accuracy,100);assert.equal(Dex.moves.get('nomoswish').accuracy,100);assert.equal(Dex.moves.get('chistrike').accuracy,true);});
 it('Frozen Refractals does not refresh or shorten existing Aurora Veil',()=>{const[p,q]=setup();p.side.addSideCondition('auroraveil',p);p.side.sideConditions.auroraveil.duration=7;use('frozenrefractals',p,q,{damage:50});assert.equal(p.side.sideConditions.auroraveil.duration,7);});
 it('Frozen Refractals honors Royal Decree rejection',()=>{const[p,q]=setup();q.setAbility('Royal Decree');use('frozenrefractals',p,q,{damage:50});assert(!p.side.sideConditions.auroraveil);});
 for(const kind of ['protect','miss','immune'])it('Frozen Refractals needs a damaging hit: '+kind,()=>{const[p,q]=setup();if(kind==='protect')q.addVolatile('protect');if(kind==='immune')q.setAbility('Wonder Guard');use('frozenrefractals',p,q,{accuracy:kind==='miss'?0:100});assert(!p.side.sideConditions.auroraveil);});
 it('Frozen Refractals also creates Veil after damaging a Substitute',()=>{const[p,q]=setup();q.addVolatile('substitute');use('frozenrefractals',p,q,{damage:50});assert.equal(p.side.sideConditions.auroraveil.duration,3);});
 for(const doubles of [false,true])it('Frozen Refractals uses native screen reduction and bypasses in '+(doubles?'doubles':'singles'),()=>{
  const[p,q]=setup(doubles);use('frozenrefractals',p,q,{damage:50});let move=Dex.getActiveMove('tackle');
  assert.equal(battle.runEvent('ModifyDamage',q,p,move,120),doubles?80:60);
  move.infiltrates=true;assert.equal(battle.runEvent('ModifyDamage',q,p,move,120),120);delete move.infiltrates;
  p.getMoveHitData(move).crit=true;assert.equal(battle.runEvent('ModifyDamage',q,p,move,120),120);p.getMoveHitData(move).crit=false;
  p.side.addSideCondition('reflect',p);assert.equal(battle.runEvent('ModifyDamage',q,p,move,120),doubles?80:60);
  use('brickbreak',q,p,{damage:10});assert(!p.side.sideConditions.auroraveil);
 });
 it('Frozen Refractals retains native Light Screen non-stacking and Defog removal',()=>{const[p,q]=setup();use('frozenrefractals',p,q,{damage:20});p.side.addSideCondition('lightscreen',p);const move=Dex.getActiveMove('watergun');assert.equal(battle.runEvent('ModifyDamage',q,p,move,100),50);use('defog',q,p);assert(!p.side.sideConditions.auroraveil);});
 for(const terrain of ['chessboardterrain','glitchterrain','dragonsdenterrain','underwaterterrain'])it('Infernal Rage respects locked '+terrain,()=>{const[p,q]=setup();battle.field.terrain=terrain;use('infernalrage',p,q,{damage:20});assert.equal(battle.field.terrain,terrain);});
 it('Queen’s Gambit uses current staged stats, Special ties and the matching defense',()=>{
  const[p,q]=setup();p.storedStats.atk=100;p.storedStats.spa=100;
  for(const[atk,spa,expected]of [[0,0,'Special'],[1,0,'Physical'],[1,2,'Special']]){p.boosts.atk=atk;p.boosts.spa=spa;const m=Dex.getActiveMove('queensgambit');battle.singleEvent('ModifyMove',m,{},p,q,m,m);assert.equal(m.category,expected);assert(!m.overrideDefensiveStat);}
  p.setAbility('Huge Power');p.boosts.atk=0;p.boosts.spa=0;const move=Dex.getActiveMove('queensgambit');battle.singleEvent('ModifyMove',move,{},p,q,move,move);assert.equal(move.category,'Special');
  use('queensgambit',p,q,{damage:50});assert.equal(p.boosts.def,-1);assert.equal(p.boosts.spd,-1);
 });
 it('Dark Clasp uses Sp. Def, not Sp. Atk',()=>{const[p,q]=setup();p.storedStats.spd=200;p.storedStats.spa=20;const first=battle.actions.getDamage(p,q,Dex.getActiveMove('darkclasp'));p.storedStats.spa=800;const same=battle.actions.getDamage(p,q,Dex.getActiveMove('darkclasp'));assert.equal(same,first);p.storedStats.spd=400;assert(battle.actions.getDamage(p,q,Dex.getActiveMove('darkclasp'))>first);});
 it('Chi Strike resolves the new move instead of the former G-Max alias',()=>{for(const name of ['Chi Strike','chistrike']){const move=Dex.moves.get(name);assert.equal(move.id,'chistrike');assert.equal(move.num,10441);assert.equal(move.basePower,75);assert.equal(move.critModifier,2);assert(!move.isMax);}});
 it('Chi Strike always hits but only enhances actual critical damage',()=>{const[p,q]=setup();const normal=Dex.getActiveMove('chistrike');normal.willCrit=false;const critical=Dex.getActiveMove('chistrike');critical.willCrit=true;const a=battle.actions.getDamage(p,q,normal),b=battle.actions.getDamage(p,q,critical);assert.equal(normal.accuracy,true);assert(!normal.willCrit);assert(Math.abs(b-2*a)<=2);});
 it('KABOOM secondary is removed by Sheer Force while recoil remains',()=>{const[p,q]=setup();use('kaboom',p,q,{damage:100});assert.equal(p.boosts.spa,1);assert.equal(p.hp,975);p.setAbility('Sheer Force');use('kaboom',p,q,{damage:100});assert.equal(p.boosts.spa,1);assert.equal(p.hp,950);});
 it('Cacti Bash has two hits and adds at most one KO hazard layer',()=>{const[p,q]=setup();q.hp=80;use('cactibash',p,q,{damage:50});assert.equal(q.hp,0);assert.equal(q.side.sideConditions.spikes.layers,1);});
 it('Corrosive Strike hits Steel and corrosion is non-stacking residual damage',()=>{const[p,q]=setup();q.setType('Steel');use('corrosivestrike',p,q,{damage:50});assert(q.volatiles.corrosivestrike);const state=q.volatiles.corrosivestrike;use('corrosivestrike',p,q,{damage:50});assert.equal(q.volatiles.corrosivestrike,state);const hp=q.hp;battle.singleEvent('Residual',Dex.conditions.get('corrosivestrike'),state,q);assert.equal(q.hp,hp-62);q.clearVolatile();assert(!q.volatiles.corrosivestrike);});
 it('Toxic Vial respects poison immunity and native stat-drop protection',()=>{const[p,q]=setup();q.setType('Steel');use('toxicvial',p,q,{accuracy:true});assert.equal(q.status,'');q.setType('Normal');q.setBoost({atk:0,spa:0});q.setAbility('Clear Body');use('toxicvial',p,q,{accuracy:true});assert.equal(q.status,'tox');assert.equal(q.boosts.atk,0);assert.equal(q.boosts.spa,0);});
 it('Flutter Scales independently lowers one offensive stat on each damaged foe',()=>{const[p,q,a,b]=setup(true);let calls=0;battle.sample=values=>values[(calls++)%values.length];use('flutterscales',p,q,{damage:20});for(const target of[q,b])assert.equal(target.boosts.atk+target.boosts.spa,-1);assert.equal(a.boosts.atk+a.boosts.spa,0);});
 it('Spirit Mend heals and boosts without bypassing Heal Block',()=>{const[p,q]=setup();p.hp=200;use('spiritmend',p,p);assert.equal(p.hp,700);assert.equal(p.boosts.spd,1);p.addVolatile('healblock',q);use('spiritmend',p,p);assert.equal(p.hp,700);});
 it('Nomos Wish uses native slot Wish and does not heal immediately',()=>{const[p]=setup();p.hp=200;use('nomoswish',p,p);assert.equal(p.hp,200);assert.equal(p.boosts.def,1);assert.equal(p.boosts.spd,1);assert(p.side.slotConditions[p.position].wish);assert.equal(p.side.slotConditions[p.position].wish.duration,2);});
 it('Beatdown lands three hits but applies Taunt only once',()=>{const[p,q]=setup();use('beatdown',p,q,{damage:20,accuracy:true});assert.equal(q.hp,940);assert(q.volatiles.taunt);assert.equal(battle.log.filter(line=>line.includes('|-start|')&&line.includes('Taunt')).length,1);});
 it('Gunk Rock makes one status choice without rerolling immunity',()=>{const[p,q]=setup();q.setType('Fire');let rolls=0;battle.randomChance=()=>true;battle.sample=()=>{rolls++;return'brn';};use('gunkrock',p,q,{damage:20});assert.equal(q.status,'');assert.equal(rolls,1);});
 it('Infernal Rage applies Torment but retains locked New World',()=>{const[p,q]=setup();battle.field.terrain='newworldterrain';use('infernalrage',p,q,{damage:20});assert(q.volatiles.torment);assert.equal(battle.field.terrain,'newworldterrain');});
});

describe('Yang A verified field interactions',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('Electric KABOOM keeps its secondary and eliminates recoil',()=>{const[p,q]=setup();battle.field.terrain='electricterrain';use('kaboom',p,q,{damage:100});assert.equal(p.hp,1000);assert.equal(p.boosts.spa,1);});
 for(const field of ['watersurfaceterrain','murkwatersurfaceterrain','midnightzoneterrain'])it('Cacti Bash cannot place KO Spikes on '+field,()=>{const[p,q]=setup();battle.field.terrain=field;q.hp=40;use('cactibash',p,q,{damage:50});assert(!q.side.sideConditions.spikes);});
 for(const field of ['darkcrystalcavernterrain','shortcircuitterrain','newworldterrain'])it('Spirit Mend heals floor 66 percent on '+field,()=>{const[p]=setup();p.maxhp=p.baseMaxhp=1003;p.hp=1;battle.field.terrain=field;use('spiritmend',p,p);assert.equal(p.hp,663);assert.equal(p.boosts.spd,1);});
 it('Holy rejects Spirit Mend healing and boost',()=>{const[p]=setup();p.hp=100;battle.field.terrain='holyterrain';use('spiritmend',p,p);assert.equal(p.hp,100);assert.equal(p.boosts.spd,0);});
 it('Spirit Mend Factory transition retains starting-field half healing',()=>{const[p]=setup();p.hp=100;battle.field.terrain='factoryterrain';use('spiritmend',p,p);assert.equal(p.hp,600);assert.equal(battle.field.terrain,'shortcircuitterrain');});
 for(const[field,next]of [['caveterrain','darkcrystalcavernterrain'],['crystalcavernterrain','darkcrystalcavernterrain'],['factoryterrain','shortcircuitterrain']])it('Dark Clasp transitions '+field,()=>{const[p,q]=setup();battle.field.terrain=field;use('darkclasp',p,q,{damage:20});assert.equal(battle.field.terrain,next);});
 it('Infernal Rage preserves Cave transition after its own clear',()=>{const[p,q]=setup(true);battle.field.terrain='caveterrain';use('infernalrage',p,q,{damage:20});assert.equal(battle.field.terrain,'volcanicterrain');});
 for(const blocker of ['none','rain','watersport'])it('Infernal Rage garden two-stage loss: '+blocker,()=>{const[p,q]=setup(true);battle.field.terrain='flowergarden5';if(blocker==='rain')battle.field.weather='raindance';if(blocker==='watersport')battle.field.addPseudoWeather('watersport',p);use('infernalrage',p,q,{damage:20});assert.equal(battle.field.terrain,blocker==='none'?'flowergarden3':'flowergarden5');});
 it('Queen role forces critical and Klutz blocks Queen Gambit',()=>{const[p,q]=setup();battle.field.terrain='chessboardterrain';p.Role='Queen';const move=Dex.getActiveMove('queensgambit');battle.singleEvent('ModifyMove',move,{},p,q,move,move);assert.equal(move.willCrit,true);p.setAbility('Klutz');use('queensgambit',p,q,{damage:50});assert.equal(q.hp,1000);assert.equal(p.boosts.def,0);});
 for(const[id,field,mult]of [['cactibash','desertterrain',1.5],['corrosivestrike','corrosiveterrain',1.5],['flutterscales','rainbowterrain',1.5],['chistrike','ashenbeachterrain',1.3],['gunkrock','wastelandterrain',1.5]])it(id+' has its exact bespoke field modifier',()=>{const[p,q]=setup();battle.field.terrain=field;const move=Dex.getActiveMove(id);const context=Object.create(battle);context.chainModify=value=>value;assert.equal(move.onBasePower.call(context,100,p,q,move),mult);});
});

describe('Yang A field transition guard regressions',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('Dark Clasp transitions after damaging a Substitute',()=>{const[p,q]=setup();battle.field.terrain='caveterrain';q.addVolatile('substitute');use('darkclasp',p,q,{damage:20});assert.equal(battle.field.terrain,'darkcrystalcavernterrain');});
 it('Dark Clasp respects Neutralization field lock',()=>{const[p,q]=setup();q.setAbility('Neutralization');battle.field.terrain='factoryterrain';use('darkclasp',p,q,{damage:20});assert.equal(battle.field.terrain,'factoryterrain');});
 it('Infernal Rage preserves native Forest ignition instead of clearing it',()=>{const[p,q]=setup();battle.field.terrain='forestterrain';use('infernalrage',p,q,{damage:20});assert.equal(battle.field.terrain,'burningterrain');assert(!p.volatiles.infernalrage);});
 it('Infernal Rage still clears an ordinary field once',()=>{const[p,q]=setup(true);battle.field.terrain='grassyterrain';use('infernalrage',p,q,{damage:20});assert.equal(battle.field.terrain,'');assert(!p.volatiles.infernalrage);});
 it('Native Nomos Wish Holy healing remains 75 percent, without refreshing Wish',()=>{const[p]=setup();battle.field.terrain='holyterrain';use('nomoswish',p,p);const wish=p.side.slotConditions[p.position].wish;assert.equal(wish.hp,750);wish.duration=1;use('nomoswish',p,p);assert.equal(p.side.slotConditions[p.position].wish,wish);assert.equal(wish.duration,1);});
});

describe('Infernal Rage unsuccessful field transitions',()=>{afterEach(()=>{battle?.destroy();battle=null;});for(const failure of ['protect','miss'])it('does not ignite Forest on '+failure,()=>{const[p,q]=setup();battle.field.terrain='forestterrain';if(failure==='protect')q.addVolatile('protect');use('infernalrage',p,q,{damage:20,accuracy:failure==='miss'?0:100});assert.equal(battle.field.terrain,'forestterrain');});});
