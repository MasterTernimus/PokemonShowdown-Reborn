'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
describe('Field restoration history', () => {
 afterEach(() => battle?.destroy());
 function setup() {
  battle = common.createBattle({formatid:'gen9nofieldsinglesgame'}, [[{species:'Mew',ability:'No Ability',moves:['splash']}],[{species:'Mew',ability:'No Ability',moves:['splash']}]]);
  battle.makeChoices('team 1','team 1');
  return battle.p1.active[0];
 }
 function after(move,p) {const field=battle.field.getTerrain();battle.singleEvent('AfterMove',field,battle.field.terrainState,p,battle.p2.active[0],Object.assign(battle.dex.getActiveMove(move), {totalDamage: 1}));}
 for(const id of ['dragonsdenterrain','fairytaleterrain','crystalcavernterrain','darkcrystalcavernterrain']) {
  for(const base of [false,true]) it(id+' restores exact prior state, base='+base,()=>{
   const p=setup();battle.field.changeTerrain('rockyterrain',p);
   const previous=battle.field.terrainState;previous.terrainChanges.set('test',2);
   if(base)previous.terrain_type='Base';
   battle.field.changeTerrain(id,p);
   assert(battle.field.clearTerrain());
   assert.equal(battle.field.terrain,'rockyterrain');assert.equal(battle.field.terrainState,previous);
   assert.equal(previous.terrainChanges.get('test'),2);
  });
 }
 for(const id of ['crystalcavernterrain','darkcrystalcavernterrain']) it(id+' breaking restores its predecessor',()=>{
  const p=setup();battle.field.changeTerrain('rockyterrain',p);battle.field.terrainState.terrain_type='Base';
  battle.field.changeTerrain(id,p);after('earthquake',p);after('earthquake',p);
  assert.equal(battle.field.terrain,'rockyterrain');
 });
 it('Dragon Den cooling restores its predecessor',()=>{
  const p=setup();battle.field.changeTerrain('caveterrain',p);battle.field.terrainState.terrain_type='Base';
  battle.field.changeTerrain('dragonsdenterrain',p);after('glaciate',p);
  assert.equal(battle.field.terrain,'caveterrain');
 });
 it('Mist Ball expires back to the exact Dragon Den',()=>{
  const p=setup();battle.field.changeTerrain('caveterrain',p);battle.field.terrainState.terrain_type='Base';
  battle.field.changeTerrain('dragonsdenterrain',p);const den=battle.field.terrainState;
  after('mistball',p);assert.equal(battle.field.terrainState.duration,5);
  for(let i=0;i<5;i++)battle.makeChoices('move splash','move splash');
  assert.equal(battle.field.terrain,'dragonsdenterrain');assert.equal(battle.field.terrainState,den);
  after('glaciate',p);assert.equal(battle.field.terrain,'caveterrain');
 });
 it('nested crystal swaps unwind without toggling back into the removed field',()=>{
  const p=setup();battle.field.changeTerrain('caveterrain',p);battle.field.terrainState.terrain_type='Base';
  battle.field.changeTerrain('crystalcavernterrain',p);battle.field.changeTerrain('darkcrystalcavernterrain',p);
  after('earthquake',p);after('earthquake',p);assert.equal(battle.field.terrain,'crystalcavernterrain');
  after('earthquake',p);after('earthquake',p);assert.equal(battle.field.terrain,'caveterrain');
 });

 it('sunlight ending restores the saved dark cavern state',()=>{
  const p=setup();battle.field.changeTerrain('caveterrain',p);battle.field.terrainState.terrain_type='Base';
  battle.field.changeTerrain('darkcrystalcavernterrain',p);const dark=battle.field.terrainState;
  battle.field.setWeather('sunnyday',p);assert.equal(battle.field.terrain,'crystalcavernterrain');
  battle.field.clearWeather();assert.equal(battle.field.terrain,'darkcrystalcavernterrain');
  assert.equal(battle.field.terrainState,dark);
 });
 for(const id of ['crystalcavernterrain','darkcrystalcavernterrain']) it(id+' with no predecessor still breaks into Cave',()=>{
  const p=setup();battle.field.changeTerrain(id,p);after('earthquake',p);after('earthquake',p);
  assert.equal(battle.field.terrain,'caveterrain');
 });

 for(const id of ['burningterrain','swampterrain']) for(const base of [true,false]) it(id+' restores counters without accumulating history, base='+base,()=>{
  const p=setup();battle.field.changeTerrain('forestterrain',p);if(base)battle.field.terrainState.terrain_type='Base';
  const forest=battle.field.terrainState;forest.terrainChanges.set('swampterrain',1);
  const count=battle.field.terrainStack.length;
  for(let cycle=0;cycle<3;cycle++){
   battle.field.changeTerrain(id,p);
   if(id==='burningterrain')after('surf',p);else for(let n=0;n<3;n++)after('heatwave',p);
   assert.equal(battle.field.terrainState,forest);assert.equal(forest.terrainChanges.get('swampterrain'),1);
   assert.equal(battle.field.terrainStack.length,count);
  }
 });
 it('Snowy Mountain melts after sustained sun instead of trying to set itself',()=>{
  const p=setup();battle.field.changeTerrain('snowymountainterrain',p);battle.field.setWeather('sunnyday',p);
  for(let n=0;n<3;n++)battle.makeChoices('move splash','move splash');
  assert.equal(battle.field.terrain,'mountainterrain');
 });
 for(const base of [true,false]) it('saved field history survives serialization, base='+base,()=>{
  const p=setup();battle.field.changeTerrain('forestterrain',p);if(base)battle.field.terrainState.terrain_type='Base';
  battle.field.terrainState.terrainChanges.set('swampterrain',1);battle.field.changeTerrain('burningterrain',p);
  const {Battle}=require('../../../dist/sim');const restored=Battle.fromJSON(JSON.stringify(battle));
  try {
   assert(restored.field.clearTerrain());assert.equal(restored.field.terrain,'forestterrain');
   assert.equal(restored.field.terrainState.terrainChanges.get('swampterrain'),1);
   assert.equal(restored.field.terrainStack.length,1);
  }finally{restored.destroy();}
 });

 it('placing a temporary field preserves the underlying counters and ages its remaining turns',()=>{
  const p=setup();battle.field.setTerrain('forestterrain',p);battle.field.setTerrainDuration(5,false);
  const forest=battle.field.terrainState;forest.terrainChanges.set('swampterrain',1);
  battle.field.setTerrain('burningterrain',p);battle.field.setTerrainDuration(2,false);
  battle.makeChoices('move splash','move splash');battle.makeChoices('move splash','move splash');
  assert.equal(battle.field.terrainState,forest);assert.equal(forest.terrainChanges.get('swampterrain'),1);
  assert.equal(forest.duration,3);
 });
});
