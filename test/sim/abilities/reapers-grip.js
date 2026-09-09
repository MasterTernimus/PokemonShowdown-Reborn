'use strict';
const assert=require('../../assert');
const common=require('../../common');
let battle;
describe('Mega Dusknoir and Reaper\'s Grip',function(){
 afterEach(()=>battle?.destroy());
 function setup(){
  battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Dusknoir',item:'Dusknoirite',ability:'Pressure',moves:['splash']}],[{species:'Mew',ability:'Synchronize',moves:['splash','tackle']}]]);
  battle.makeChoices('team 1','team 1');
  const mon=battle.p1.active[0];
  assert.deepEqual(mon.species.baseStats,{hp:65,atk:120,def:135,spa:70,spd:135,spe:45});
  assert.deepEqual(mon.species.abilities,{0:'Requiem',1:'Pressure',H:'Shadow Tag'});
  assert.equal(mon.canMegaEvo,'Dusknoir-Mega');
  battle.makeChoices('move splash mega','move splash');
  return mon;
 }
 it('Mega Evolves and combines punches with Dark Aura on both sides',function(){
  const mon=setup(),foe=battle.p2.active[0];
  assert.equal(mon.ability,'reapersgrip');
  assert.deepEqual(mon.species.baseStats,{hp:65,atk:180,def:155,spa:70,spd:155,spe:45});
  assert(mon.hasAbility('unaware'));assert(mon.hasAbility('ironfist'));assert(mon.hasAbility('darkaura'));assert(!mon.hasAbility('pressure'));
  assert.equal(battle.runEvent('BasePower',mon,foe,battle.dex.getActiveMove('firepunch'),100),140);
  assert.equal(battle.runEvent('BasePower',mon,foe,battle.dex.getActiveMove('darkpulse'),100),133);
  assert.equal(battle.runEvent('BasePower',foe,mon,battle.dex.getActiveMove('darkpulse'),100),133);
  battle.activePokemon=mon;battle.activeTarget=foe;
  let boosts=battle.runEvent('ModifyBoost',foe,null,null,{atk:6,def:6,spa:6,spd:6,evasion:6});
  assert.equal(boosts.def,0);assert.equal(boosts.spd,0);assert.equal(boosts.evasion,0);assert.equal(boosts.atk,6);
  battle.activePokemon=foe;battle.activeTarget=mon;
  boosts=battle.runEvent('ModifyBoost',foe,null,null,{atk:6,def:6,spa:6,spd:6,accuracy:6});
  assert.equal(boosts.atk,0);assert.equal(boosts.spa,0);assert.equal(boosts.accuracy,0);assert.equal(boosts.spd,6);
 });
 it('creates Haunted Field once at half HP and extends it by five on faint',function(){
  const mon=setup(),foe=battle.p2.active[0];
  mon.hp=Math.floor(mon.maxhp/2);
  battle.singleEvent('DamagingHit',mon.getAbility(),mon.abilityState,mon,foe,battle.dex.getActiveMove('tackle'),1);
  assert.equal(battle.field.terrain,'hauntedterrain');assert.equal(battle.field.terrainState.duration,3);
  battle.field.terrainState.duration=1;
  battle.singleEvent('DamagingHit',mon.getAbility(),mon.abilityState,mon,foe,battle.dex.getActiveMove('tackle'),1);
  assert.equal(battle.field.terrainState.duration,1);
  mon.faint();battle.faintMessages();
  assert.equal(battle.field.terrainState.duration,6);
 });
 it('creates five turns of Haunted Field when fainting without an existing field',function(){
  const mon=setup();mon.faint();battle.faintMessages();
  assert.equal(battle.field.terrain,'hauntedterrain');assert.equal(battle.field.terrainState.duration,5);
 });
});
