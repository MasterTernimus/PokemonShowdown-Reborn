'use strict';
const assert=require('../../assert'),common=require('../../common');
let battle;
describe('Night Hunt and Self Sufficient Reaper\'s Grip',function(){
 afterEach(()=>battle?.destroy());
 it('Mega Evolves Luxray and applies Strong Jaw, Infiltrator and Intimidate',function(){
  battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Luxray',item:'Luxranite',ability:'Strong Jaw',moves:['splash']}],[{species:'Mew',ability:'Synchronize',moves:['splash']}]]);
  battle.makeChoices('team 1','team 1');const mon=battle.p1.active[0],foe=battle.p2.active[0];
  assert.equal(mon.canMegaEvo,'Luxray-Mega');
  battle.makeChoices('move splash mega','move splash');
  assert.deepEqual(mon.species.baseStats,{hp:85,atk:160,def:91,spa:90,spd:104,spe:105});
  assert.equal(mon.ability,'nighthunt');assert.statStage(foe,'atk',-1);
  const move=battle.dex.getActiveMove('crunch');battle.singleEvent('ModifyMove',mon.getAbility(),mon.abilityState,move,mon);
  assert(move.infiltrates);assert.equal(battle.runEvent('BasePower',mon,foe,move,100),150);
 });
 it('heals Reaper\'s Grip each turn and grants weather immunity',function(){
  battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Dusknoir-Mega',ability:"Reaper's Grip",moves:['splash']}],[{species:'Mew',ability:'Synchronize',moves:['splash']}]]);
  battle.makeChoices('team 1','team 1');const mon=battle.p1.active[0];mon.hp-=80;const hp=mon.hp;
  battle.makeChoices('move splash','move splash');assert.equal(mon.hp-hp,Math.floor(mon.baseMaxhp/16));
  assert(mon.hasAbility('selfsufficient'));for(const type of ['hail','sandstorm'])assert.equal(battle.runEvent('Immunity',mon,null,null,type),false);
 });
});
