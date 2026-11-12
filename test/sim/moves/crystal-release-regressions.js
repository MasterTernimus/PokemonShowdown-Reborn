'use strict';
const assert=require('assert/strict');
const common=require('../../common');
const {Dex}=require('../../../dist/sim');
describe('Crystal Cavern release regressions',()=>{
 let battle;
 beforeEach(()=>{battle=common.createBattle({gameType:'singles'},[[{species:'Mew',ability:'No Ability',moves:['judgment','rockthrow']}],[{species:'Mew',ability:'No Ability',moves:['splash']}]]);battle.field.setTerrain('crystalcavernterrain',battle.p1.active[0]);});
 afterEach(()=>battle.destroy());
 it('announces the starting crystal and each advancement',()=>{
  assert(battle.log.some(l=>l.includes('[crystal] Fire')));
  const p=battle.p1.active[0],q=battle.p2.active[0];
  const move=Dex.getActiveMove('rockthrow');battle.damage(1,q,p,move);
  assert.equal(battle.CrystalCavernCounter,1);
  assert(battle.log.some(l=>l.includes('|-fieldactivate|Crystal Cavern Terrain|[crystal] Water')));
 });
 it('Judgment receives the specified crystal typing',()=>{
  const move=Dex.getActiveMove('judgment');
  battle.field.getTerrain().onModifyMove.call(battle,move);
  assert.deepEqual(move.types,['Rock','Fire']);
 });
 it('the darkness transition attacks receive their 30% boost outside sun',()=>{
  const move=Dex.getActiveMove('darkpulse'),p=battle.p1.active[0],q=battle.p2.active[0];
  assert.equal(battle.runEvent('BasePower',p,q,move,100),130);
  battle.field.setWeather('sunnyday',p);
  assert.equal(battle.runEvent('BasePower',p,q,move,100),100);
 });
});
