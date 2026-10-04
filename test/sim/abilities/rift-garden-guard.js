'use strict';
const assert=require('assert').strict, common=require('../../common');
describe('Rift guards and growing gardens',()=>{
 let b;afterEach(()=>{b?.destroy();b=null;});
 function setup(ability){b=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Mew',ability,moves:['splash','protect','tackle','sludgewave']}],[{species:'Mew',ability:'No Ability',moves:['splash']}]]);b.makeChoices('team 1','team 1');return b.p1.active[0];}
 for(const ability of ['Rift Eater','Rift Dancer'])it(ability+' guards once, heals immediately, and survives lethal damage',()=>{
  const p=setup(ability),foe=b.p2.active[0],move=b.dex.getActiveMove('tackle');
  b.damage(1,p,foe,move);assert(!p.m.riftHalfGuardUsed);
  b.damage(p.maxhp*4,p,foe,move);
  assert.equal(p.hp,Math.floor(p.maxhp/2)+Math.round(p.maxhp/4));
  assert(p.m.riftHalfGuardUsed);
  if(ability==='Rift Eater'){assert(p.m.riftEaterAwakened);assert.deepEqual(p.types,['Ground','Fire']);}
  b.damage(p.maxhp*4,p,foe,move);assert.equal(p.hp,0);
 });
 for(const weather of ['sunnyday','raindance'])it('grows when created under existing '+weather,()=>{
  const p=setup('No Ability');b.field.setWeather(weather,p);b.field.setTerrain('flowergarden1',p);
  b.makeChoices('move splash','move splash');assert.equal(b.field.flowerGardenStage(),2);
 });
 it('Rift garden grows each turn without weather, even after its creator loses the ability',()=>{
  const p=setup('Rift Dancer');assert.equal(b.field.flowerGardenStage(),1);p.setAbility('No Ability');
  for(let stage=2;stage<=5;stage++){b.makeChoices('move splash','move splash');assert.equal(b.field.flowerGardenStage(),stage);}
 });
 it('Overgrow boosts Grass attacks at low HP',()=>{
  const p=setup('Rift Dancer');b.field.clearTerrain();p.hp=Math.floor(p.maxhp/3);
  assert.equal(b.runEvent('ModifyAtk',p,b.p2.active[0],b.dex.getActiveMove('razorleaf'),100),150);
 });
});
