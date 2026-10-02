'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const rooms = ['trickroom', 'magicroom', 'wonderroom'];
const routes = [
 ['watersurfaceterrain', 'underwaterterrain'],
 ['watersurfaceterrain', 'murkwatersurfaceterrain'],
 ['murkwatersurfaceterrain', 'underwaterterrain'],
 ['underwaterterrain', 'watersurfaceterrain'],
 ['underwaterterrain', 'murkwatersurfaceterrain'],
 ['underwaterterrain', 'midnightzoneterrain'],
 ['midnightzoneterrain', 'underwaterterrain'],
];
describe('Aquatic transition state restoration', () => {
 let battle;
 afterEach(() => battle?.destroy());
 function start(from) {
  const teams = [0,1,2,3].map(() => [{species:'Mew', ability:'No Ability', item:'Leftovers', moves:['splash']}]);
  battle = common.createBattle({formatid:'gen9freeforall4pmistyfieldadrienn'}, teams);
  battle.makeChoices('team 1','team 1','team 1','team 1');
  const p = battle.p1.active[0];
  assert(battle.field.changeTerrain(from,p));
  p.storedStats.def=100; p.storedStats.spd=200; p.storedStats.spe=100;
  battle.p2.active[0].storedStats.spe=200;
  for (const side of battle.sides) assert(side.addSideCondition('tailwind',side.active[0]));
  for (const room of rooms) assert(battle.field.addPseudoWeather(room,p));
  assert(p.ignoringItem()); assert.equal(p.calculateStat('def',0),200);
  assert.equal(p.getStat('spe'),({watersurfaceterrain:75,murkwatersurfaceterrain:75,underwaterterrain:50,midnightzoneterrain:25})[from]*2);
  assert(p.getActionSpeed()>battle.p2.active[0].getActionSpeed());
  return p;
 }
 for (const [from,to] of routes) it(`${from} -> ${to} restores all four trainers and Room mechanics`, () => {
  const p=start(from), duration=battle.field.terrainState.duration;
  const stackLength=battle.field.terrainStack.length;
  assert(battle.field.changeTerrain(to,p));
  for (const side of battle.sides) {
   assert(!side.getSideCondition('tailwind'));
   assert.equal(battle.log.filter(x=>x.startsWith(`|-sideend|${side.id}:`)&&x.includes('Tailwind')).length,1);
  }
  for (const room of rooms) assert(!battle.field.getPseudoWeather(room));
  for (const name of ['Trick Room','Magic Room','Wonder Room']) assert.equal(battle.log.filter(x=>x.includes(`|-fieldend|move: ${name}`)).length,1);
  assert(!p.ignoringItem()); assert.equal(p.calculateStat('def',0),100); assert.equal(p.calculateStat('spd',0),200);
  assert.equal(p.getStat('spe'),({watersurfaceterrain:75,murkwatersurfaceterrain:75,underwaterterrain:50,midnightzoneterrain:25})[to]); assert(p.getActionSpeed()<battle.p2.active[0].getActionSpeed());
  assert.equal(battle.field.terrainState.duration,duration);
  assert.equal(battle.field.terrainStack.length,stackLength);
  p.hp=p.maxhp-50; const hp=p.hp;
  battle.singleEvent('Residual',p.getItem(),p.itemState,p);
  assert(p.hp>hp,'Leftovers must resume after Magic Room ends');
 });
 it('keeps newly reapplied effects on the same field and rejects unrelated Midnight transitions',()=>{
  const p=start('midnightzoneterrain'); const before=battle.log.length;
  assert.equal(battle.field.changeTerrain('midnightzoneterrain',p),false);
  assert.equal(battle.field.changeTerrain('murkwatersurfaceterrain',p),false);
  for(const side of battle.sides) assert(side.getSideCondition('tailwind'));
  for(const room of rooms) assert(battle.field.getPseudoWeather(room));
  assert(!battle.log.slice(before).some(x=>x.includes('-fieldend')||x.includes('-sideend')));
 });
});
