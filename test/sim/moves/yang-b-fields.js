'use strict';
const assert=require('assert').strict,common=require('../../common');
const {Dex}=require('../../../dist/sim');let battle;
function setup(field=''){
 const mon={species:'Mew',ability:'No Ability',moves:['splash']};battle=common.createBattle({},[[mon],[mon]]);
 if(battle.requestState==='teampreview')battle.makeChoices();battle.field.terrain=field;
 battle.field.terrainState=battle.initEffectState({id:field,terrainChanges:new Map(),prevTerrain:''});
 battle.randomizer=n=>n;const p=battle.p1.active[0],q=battle.p2.active[0];for(const x of[p,q])x.hp=x.maxhp=x.baseMaxhp=10000;return[p,q];
}
function use(id,p,q){battle.actions.useMove(Object.assign(Dex.getActiveMove(id),{willCrit:false}),p,{target:q});}
describe('Yang B approved field additions',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const [move,field,factor]of [['m3g4qu4k3','glitchterrain',1.3],['winddance','bigtopterrain',1.5],['winddance','mountainterrain',1.5],['winddance','snowymountainterrain',1.5],['crestcleave','fairytaleterrain',1.5]])it(move+' has only intended boost in '+field,()=>{
  const[p,q]=setup();let m=Object.assign(Dex.getActiveMove(move),{willCrit:false});const expected=battle.actions.getDamage(p,q,Object.assign(Dex.getActiveMove(m),{basePower:m.basePower*factor}));battle.field.terrain=field;const hp=q.hp;use(move,p,q);assert.equal(hp-q.hp,expected);
 });
 for(const field of ['wastelandterrain','murkwatersurfaceterrain'])it('Crest retains one doubled Liquid Ooze drain: '+field,()=>{const[p,q]=setup(field);q.setAbility('Liquid Ooze');p.hp=5000;battle.actions.useMove(Object.assign(Dex.getActiveMove('crestcleave'),{damage:300,willCrit:false}),p,{target:q});assert.equal(p.hp,4800);});
 it('Siren Veil ignores an inactive Covert Cloak',()=>{const[p,q]=setup('shortcircuitterrain');q.setAbility('Levitate');q.setItem('Covert Cloak');q.addVolatile('embargo');use('sirensveil',p,p);assert(q.volatiles.gastroacid);});
 it('Dragon Rend cannot place a submerged hazard through Substitute',()=>{const[p,q]=setup('underwaterterrain');q.addVolatile('substitute');q.volatiles.substitute.hp=5000;use('dragonrend',p,q);assert(!q.side.sideConditions.dragonrend);});
 it('M3G4 uses native BigTop Striker once',()=>{const[p,q]=setup('bigtopterrain');let calls=0;battle.StrikerBonus=()=>{calls++;return 1;};use('m3g4qu4k3',p,q);assert.equal(calls,1);});
 for(const field of ['holyterrain','newworldterrain','rainbowterrain'])it('Dei inherits Judgment field rules once: '+field,()=>{const[p,q]=setup(field);const common={basePower:80,type:'Normal',category:'Special',willCrit:false};assert.equal(battle.actions.getDamage(p,q,Object.assign(Dex.getActiveMove('deiludicium'),common)),battle.actions.getDamage(p,q,Object.assign(Dex.getActiveMove('judgment'),common)));});
 for(const field of ['shortcircuitterrain',''])it('Siren Veil Covert Cloak on '+field,()=>{const[p,q]=setup(field);q.setAbility('Levitate');q.setItem('Covert Cloak');use('sirensveil',p,p);assert.equal(!!q.volatiles.gastroacid,!field);assert.equal(p.boosts.def,1);});
 for(const history of ['watersurfaceterrain','caveterrain',''])it('Siren Wrath melts only WaterSurface-origin Icy: '+history,()=>{const[p,q]=setup('icyterrain');battle.field.terrainState.underlyingTerrain=history;use('sirenswrath',p,q);assert.equal(battle.field.terrain,history==='watersurfaceterrain'?'watersurfaceterrain':'icyterrain');});
 for(const field of ['underwaterterrain','midnightzoneterrain'])it('Dragon Rend damages but cannot place hazard in '+field,()=>{const[p,q]=setup(field);use('dragonrend',p,q);assert(q.hp<10000);assert(!q.side.sideConditions.dragonrend);assert.equal(battle.field.terrain,field);});
 it('Dragon Rend changes Volcanic to Dragons Den',()=>{const[p,q]=setup('volcanicterrain');use('dragonrend',p,q);assert.equal(battle.field.terrain,'dragonsdenterrain');assert(!q.side.sideConditions.dragonrend);});
 it('RocknRoll cannot place Midnight hazard',()=>{const[p,q]=setup('midnightzoneterrain');use('rocknroll',p,q);assert(!q.side.sideConditions.stealthrock);});
 for(const field of ['mountainterrain','snowymountainterrain'])it('Airstream creates six-turn Tailwind without refreshing: '+field,()=>{const[p,q]=setup(field);use('airstreamassault',p,q);assert.equal(p.side.sideConditions.tailwind.duration,6);assert.equal(battle.field.weather,'deltastream');p.side.sideConditions.tailwind.duration=2;use('airstreamassault',p,q);assert.equal(p.side.sideConditions.tailwind.duration,2);});
 it('Airstream respects primal weather',()=>{const[p,q]=setup('mountainterrain');battle.field.setWeather('primordialsea',q);use('airstreamassault',p,q);assert.equal(battle.field.weather,'primordialsea');});
 it('Wisteria grows FlowerGarden once per multihit use, capped at five',()=>{const[p,q]=setup('flowergarden3');p.setAbility('Ripen');battle.actions.useMove(Object.assign(Dex.getActiveMove('wisteriamaelstrom'),{multihit:2,willCrit:false}),p,{target:q});assert.equal(battle.field.terrain,'flowergarden4');use('wisteriamaelstrom',p,q);assert.equal(battle.field.terrain,'flowergarden5');use('wisteriamaelstrom',p,q);assert.equal(battle.field.terrain,'flowergarden5');});
 for(const move of ['winddance','airstreamassault'])it(move+' uses field Blow clearing without new baseline wind flag',()=>{const[p,q]=setup('burningterrain');use(move,p,q);battle.runEvent('AfterMove',p,q,p.lastMoveUsed);assert.notEqual(battle.field.terrain,'burningterrain');assert(!Dex.moves.get(move).flags.wind);});
});
