'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim/dex');
describe('Approved Corsola and Octillery refinements', () => {
 let battle;
 afterEach(() => {battle?.destroy();});
 function setup(species='Corsola',ability='Withering Shell',foeAbility='No Ability',foeItem='') {
  battle=common.createBattle({formatid: 'gen9nofieldsinglesgame', forceRandomChance:true},[[
   {species,ability,moves:['waterpulse','splash']},
   {species:'Mew',ability:'No Ability',moves:['splash']},
  ],[{species:'Blissey',ability:foeAbility,item:foeItem,moves:['splash','roar','dragontail']}]]);
  battle.makeChoices('team 1, 2', 'team 1');
  return battle.p1.active[0];
 }
 it('loads exact stats and moves while preserving Galarian Corsola',()=>{
  for(const id of ['corsola','corsolaalt']){
   assert.deepEqual(Dex.species.get(id).baseStats,{hp:95,atk:55,def:100,spa:120,spd:130,spe:30});
   assert.deepEqual(Dex.species.get(id).abilities,{0:'Withering Shell',1:'Perish Body',H:'Lightning Rod'});
  }
  assert.deepEqual(Dex.species.get('corsolagalar').baseStats,{hp:60,atk:55,def:100,spa:65,spd:100,spe:30});
  assert.deepEqual(Dex.species.get('octillery').baseStats,{hp:100,atk:60,def:110,spa:125,spd:105,spe:40});
  assert.deepEqual(Dex.species.get('octillery').abilities,{0:'Anchored Battery',1:'Sniper',H:'No Guard'});
  assert(Dex.species.getLearnsetData('corsola').learnset.flipturn.length);
  assert(Dex.species.getLearnsetData('octillery').learnset.trickroom.length);
 });
 for(const status of ['', 'brn','tox'])it('heals one third on actual switch with status '+(status||'none'),()=>{
  const p=setup();p.hp=1;if(status)p.setStatus(status);
  battle.makeChoices('switch 2','move splash');
  assert.equal(p.hp,1+Math.floor(p.baseMaxhp/3));assert.equal(p.status,'');
 });
 it('does not change separate Natural Recovery status-dependent healing',()=>{
  const p=setup('Mew','Natural Recovery');p.hp=1;p.setStatus('brn');
  battle.makeChoices('switch 2','move splash');
  assert.equal(p.hp,1+2*Math.floor(p.baseMaxhp/3));assert.equal(p.status,'');
 });
 it('boosts pulse and bullet moves only and exposes both components',()=>{
  const p=setup('Octillery','Anchored Battery');const foe=battle.p2.active[0];
  assert(p.hasAbility('Mega Launcher'));assert(p.hasAbility('Suction Cups'));
  for(const [id,expected] of [['waterpulse',150],['octazooka',150],['armorcannon',150],['surf',100]]){
   const m=battle.dex.getActiveMove(id);assert.equal(battle.runEvent('BasePower',p,foe,m,100),expected);
  }
 });
 it('blocks Red Card and move phazing but allows voluntary switching',()=>{
  const p=setup('Octillery','Anchored Battery','No Ability','Red Card');
  battle.makeChoices('move waterpulse','move splash');
  assert.equal(battle.p1.active[0],p);assert.equal(battle.p2.active[0].item,'');
  battle.makeChoices('move splash','move roar');assert.equal(battle.p1.active[0],p);
  battle.makeChoices('move splash','move dragontail');assert.equal(battle.p1.active[0],p);
  battle.makeChoices('switch 2','move splash');assert.equal(battle.p1.active[0].species.id,'mew');
 });
 it('allows Mold Breaker to bypass its Suction Cups component',()=>{
  setup('Octillery','Anchored Battery','Mold Breaker');
  battle.makeChoices('move splash','move roar');assert.equal(battle.p1.active[0].species.id,'mew');
 });
});
