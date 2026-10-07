'use strict';
const assert = require('assert').strict;
const common = require('../../common');

describe('Underwater independent Zap Cannon accuracy', () => {
 let battle;
 afterEach(() => { battle?.destroy(); });
 function setup(ability, field) {
  battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
   [{species: 'Mew', ability, moves: ['zapcannon']}],
   [{species: 'Blissey', ability: 'No Ability', moves: ['protect']}],
  ]);
  battle.makeChoices('team 1', 'team 1');
  battle.field.startTerrain(field);
  const checks = [];
  const runEvent = battle.runEvent;
  battle.runEvent = function (...args) {
   const result = runEvent.apply(this, args);
   if (args[0] === 'Accuracy' && args[3]?.id === 'zapcannon' && args[4] === 50) checks.push(result);
   return result;
  };
  const chance = battle.randomChance;
  // Force a miss if either independent hit incorrectly retains 50% accuracy.
  battle.randomChance = function (n, d) { return n === 50 && d === 100 ? false : chance.call(this, n, d); };
  return {source: battle.p1.active[0], target: battle.p2.active[0], checks};
 }
 for (const ability of ['Dual Wield', 'Water Barrage']) {
  it(ability + ': both hits bypass their accuracy rolls Underwater', () => {
   const {source, target, checks} = setup(ability, 'underwaterterrain');
   battle.actions.useMove('zapcannon', source, {target});
   assert.deepEqual(checks, [true, true]);
   assert(battle.log.some(line => line.startsWith('|-hitcount|') && line.endsWith('|2')));
   assert(!battle.log.some(line => line.startsWith('|-miss|')));
  });
  it(ability + ': Water Surface keeps two independent 50% rolls', () => {
   const {source, target, checks} = setup(ability, 'watersurfaceterrain');
   const before = target.hp;
   battle.actions.useMove('zapcannon', source, {target});
   assert.deepEqual(checks, [50, 50]);
   assert.equal(target.hp, before);
   assert.equal(battle.log.filter(line => line.startsWith('|-miss|')).length, 2);
  });
  for (const protection of ['Protect', 'Ground immunity']) it(ability + ': still respects ' + protection, () => {
   const {source, target, checks} = setup(ability, 'underwaterterrain');
   if (protection === 'Protect') {
    target.addVolatile('protect');
    assert(target.volatiles.protect);
   }
   else target.setType('Ground');
   const before = target.hp;
   battle.actions.useMove('zapcannon', source, {target});
   assert.equal(target.hp, before);
   if (protection === 'Ground immunity') assert.deepEqual(checks, []);
   assert(!battle.log.some(line => line.startsWith('|-hitcount|')));
  });
 }
});
