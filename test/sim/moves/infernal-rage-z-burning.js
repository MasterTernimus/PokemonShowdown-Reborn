'use strict';
const assert = require('assert').strict;
const {Battle, Dex} = require('../../../dist/sim');

describe('Infernal Rage and Z-Move Burning Field ownership', () => {
 let battle, p, q;
 function setup() {
  const mon = {species:'Mew',ability:'No Ability',item:'Firium Z',moves:['flamethrower','infernalrage','splash','surf','earthpower']};
  battle = new Battle({formatid:'gen9nofieldsinglesgame',seed:[1,2,3,4],p1:{team:[mon,mon]},p2:{team:[mon,mon]}});
  if (battle.requestState === 'teampreview') battle.makeChoices('team 12','team 12');
  p=battle.p1.active[0]; q=battle.p2.active[0];
  for (const side of battle.sides) for (const pokemon of side.pokemon) {pokemon.hp=pokemon.maxhp=pokemon.baseMaxhp=9999;pokemon.setType('Fire');}
  battle.field.startTerrain('factoryterrain');
 }
 function use(id, source=p, target=q, options={}) {
  battle.turn++;
  const move=Dex.getActiveMove(id);move.willCrit=false;
  battle.actions.runMove(move,source,source.getLocOf(target),options);
 }
 function ignite(source=p,target=q) {
  use('flamethrower',source,target,{zMove:'Inferno Overdrive'});
  assert.equal(battle.field.terrain,'burningterrain');
  assert.equal(battle.field.terrainState.zMoveTerrain,true);
 }
 afterEach(()=>{battle?.destroy();battle=null;});
 it('preserves actual Inferno Overdrive Burning Field, its state and duration while applying damage and Torment',()=>{
  setup();ignite();const state=battle.field.terrainState,hp=q.hp;
  assert.equal(state.duration,3);assert.equal(state.origin.id,'infernooverdrive');
  use('infernalrage');assert(q.hp<hp);assert(q.volatiles.torment);
  assert.equal(battle.field.terrain,'burningterrain');assert(battle.field.terrainState===state);assert.equal(state.duration,3);
  assert(!p.volatiles.infernalrage);
 });
 it('preserves Z-Move Burning Field created by the other side',()=>{
  setup();ignite(q,p);const state=battle.field.terrainState;use('infernalrage');
  assert(battle.field.terrainState===state);assert.equal(battle.field.terrain,'burningterrain');
 });
 it('retains existing same-field Z reapplication ownership and does not refresh duration',()=>{
  setup();ignite();const state=battle.field.terrainState;state.duration=2;ignite(q,p);use('infernalrage');
  assert(battle.field.terrainState===state);assert.equal(state.duration,2);
 });
 it('still clears ordinary Burning Field',()=>{
  setup();battle.field.setTerrain('burningterrain',p,Dex.moves.get('willowisp'));
  assert(!battle.field.terrainState.zMoveTerrain);use('infernalrage');assert.equal(battle.field.terrain,'factoryterrain');
 });
 it('does not promote an unchanged ordinary Burning Field to Z ownership',()=>{
  setup();battle.field.setTerrain('burningterrain',p,Dex.moves.get('willowisp'));const state=battle.field.terrainState;
  use('flamethrower',p,q,{zMove:'Inferno Overdrive'});assert(battle.field.terrainState===state);assert(!state.zMoveTerrain);
  use('infernalrage');assert.equal(battle.field.terrain,'factoryterrain');
 });
 it('does not carry protection to a fresh ordinary replacement with the same name',()=>{
  setup();ignite();const old=battle.field.terrainState;battle.field.clearTerrain();
  battle.field.setTerrain('burningterrain',p,Dex.moves.get('willowisp'));
  assert(battle.field.terrainState!==old);assert(!battle.field.terrainState.zMoveTerrain);
  use('infernalrage');assert.equal(battle.field.terrain,'factoryterrain');
 });
 it('does not exempt another Z-owned field from normal Infernal Rage clearing',()=>{
  setup();p.setItem('Groundium Z');use('earthpower',p,q,{zMove:'Tectonic Rage'});
  assert.equal(battle.field.terrain,'desertterrain');assert(battle.field.terrainState.zMoveTerrain);
  use('infernalrage');assert.equal(battle.field.terrain,'factoryterrain');
 });
 it('preserves natural expiry and restoration of the underlying field',()=>{
  setup();battle.makeChoices('move flamethrower zmove','move splash');
  assert.equal(battle.field.terrain,'burningterrain');assert.equal(battle.field.terrainState.duration,2);
  battle.makeChoices('move infernalrage','move flamethrower');
  assert.equal(battle.field.terrain,'burningterrain');assert.equal(battle.field.terrainState.duration,1);
  battle.makeChoices('move splash','move splash');
  assert.equal(battle.field.terrain,'factoryterrain');assert(!battle.field.terrainState.zMoveTerrain);
 });
 it('retains Aura-first removal without touching the Z-owned field',()=>{
  setup();ignite();const state=battle.field.terrainState;battle.field.setAura('grassyterrain',5,p);use('infernalrage');
  assert.equal(battle.field.auraField,'');assert(battle.field.terrainState===state);assert.equal(state.duration,3);
 });
 it('still allows native Surf to extinguish Z-owned Burning Field',()=>{
  setup();ignite();use('surf');assert.equal(battle.field.terrain,'factoryterrain');
 });
});
