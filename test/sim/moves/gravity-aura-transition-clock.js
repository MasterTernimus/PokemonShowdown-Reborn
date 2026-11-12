'use strict';
const assert=require('assert').strict,common=require('../../common');let battle;
function setup(species='Mew',ability='No Ability'){
 battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species,ability,moves:['splash']}],[{species:'Mew',ability:'No Ability',moves:['splash']}]]);
 battle.makeChoices('team 1','team 1');return battle.p1.active[0];
}
describe('Gravity Auras and temporary transition clocks',()=>{
 afterEach(()=>battle?.destroy());
 for(const [aura,field] of [['grassyterrain','grassyterrain'],['hauntedaura','hauntedterrain'],['bewitchedaura','bewitchedwoodsterrain']])it('active Gravity immediately develops '+aura,()=>{
  const p=setup();battle.field.startTerrain('rockyterrain');battle.field.addPseudoWeather('gravity',p);
  assert(battle.field.setAura(aura,5,p,battle.dex.moves.get('splash')));
  assert.equal(battle.field.terrain,field);assert.equal(battle.field.auraField,'');
 });
 for(const aura of ['frozenaura','ashenaura','riftaura'])it('active Gravity leaves '+aura+' alone',()=>{
  const p=setup();battle.field.startTerrain('rockyterrain');battle.field.addPseudoWeather('gravity',p);
  battle.field.setAura(aura,5,p,battle.dex.moves.get('splash'));
  assert.equal(battle.field.terrain,'rockyterrain');assert.equal(battle.field.auraField,aura);
 });
 for(const move of ['plasmafists','iondeluge'])it(move+' keeps its Electric Aura exception under Gravity',()=>{
  const p=setup();battle.field.startTerrain('rockyterrain');battle.field.addPseudoWeather('gravity',p);
  battle.field.setAura('electricterrain',5,p,battle.dex.moves.get(move));
  assert.equal(battle.field.terrain,'rockyterrain');assert.equal(battle.field.auraField,'electricterrain');
 });
 it('adds one turn only to a successful temporary transformation',()=>{
  const p=setup();battle.field.setTerrain('caveterrain',p);battle.field.setTerrainDuration(3,false);
  assert(battle.field.changeTerrain('crystalcavernterrain',p));assert.equal(battle.field.terrainState.duration,4);
  assert.equal(battle.field.changeTerrain('crystalcavernterrain',p),false);assert.equal(battle.field.terrainState.duration,4);
  battle.field.clearTerrain();assert.equal(battle.field.terrain,'caveterrain');assert.equal(battle.field.terrainState.duration,3);
 });
 it('keeps permanent transformations permanent',()=>{
  const p=setup();battle.field.startTerrain('caveterrain');const duration=battle.field.terrainState.duration;
  battle.field.changeTerrain('crystalcavernterrain',p);assert.equal(battle.field.terrainState.duration,duration);assert(battle.field.terrainState.permanent);
 });
 it('Mega Aevian Froslass keeps Storm Calling and uses Hydration instead of Water Veil',()=>{
  const p=setup('Froslass-Aevian-Mega','Storm Calling');assert.deepEqual(p.getPassives(),['hydration']);
  assert.equal(p.ability,'stormcalling');assert.equal(battle.field.weather,'raindance');
  assert(p.trySetStatus('brn'));battle.makeChoices('move splash','move splash');assert.equal(p.status,'');
 });
});
