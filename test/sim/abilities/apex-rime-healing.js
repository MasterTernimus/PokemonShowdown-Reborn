'use strict';
const assert=require('../../assert'),common=require('../../common');
let battle;
describe('Apex Armor and Rime Knuckle additions',function(){
 afterEach(()=>battle?.destroy());
 function setup(ability){
  battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Mew',ability,moves:['splash']}],[{species:'Mew',ability:'No Ability',moves:['splash']}]]);
  battle.makeChoices('team 1','team 1');return battle.p1.active[0];
 }
 it('adds Self Sufficient healing and weather immunity',function(){
  const mon=setup('Apex Armor');mon.hp-=100;const hp=mon.hp;
  battle.makeChoices('move splash','move splash');
  assert.equal(mon.hp-hp,Math.floor(mon.baseMaxhp/16));
  assert(mon.hasAbility('selfsufficient'));
  for(const weather of ['hail','sandstorm'])assert.equal(battle.runEvent('Immunity',mon,null,null,weather),false);
 });
 it('adds Ice Body contact frostbite and healing without stacking field and weather recovery',function(){
  const mon=setup('Rime Knuckle'),foe=battle.p2.active[0];
  assert(mon.hasAbility('icebody'));
  battle.randomChance=()=>true;
  battle.singleEvent('DamagingHit',mon.getAbility(),mon.abilityState,mon,foe,battle.dex.getActiveMove('tackle'),1);
  assert.equal(foe.status,'frz');
  mon.hp-=100;let hp=mon.hp;
  battle.field.setTerrain('icyterrain',mon);
  battle.singleEvent('Residual',mon.getAbility(),mon.abilityState,mon);
  assert.equal(mon.hp-hp,Math.floor(mon.baseMaxhp/16));
  battle.field.setWeather('hail',mon);hp=mon.hp;
  battle.singleEvent('Residual',mon.getAbility(),mon.abilityState,mon);
  assert.equal(mon.hp,hp);
  battle.singleEvent('Weather',mon.getAbility(),mon.abilityState,mon,mon,battle.dex.conditions.get('hail'));
  assert.equal(mon.hp-hp,Math.floor(mon.baseMaxhp/16));
 });
});
