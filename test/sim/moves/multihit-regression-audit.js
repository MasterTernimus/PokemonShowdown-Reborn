'use strict';
const assert = require('../../assert');
const common = require('../../common');
describe('Multi-hit battle regressions', () => {
 let battle;
 afterEach(() => { battle?.destroy(); });
 for (const [move, ability, count] of [
  ['twinbeam', 'No Ability', 2], ['doublehit', 'No Ability', 2],
  ['dualwingbeat', 'No Ability', 2], ['twineedle', 'No Ability', 2],
  ['bonemerang', 'No Ability', 2], ['surgingstrikes', 'No Ability', 3],
  ['tripleaxel', 'Skill Link', 3], ['bulletseed', 'Skill Link', 5],
  ['waterpulse', 'Dual Wield', 2], ['psychocut', 'Dual Wield', 2],
  ['aurasphere', 'Dual Wield', 2], ['shadowball', 'Dual Wield', 2],
  ['psychocut', 'Apex Cleave', 2], ['twinbeam', 'Dual Wield', 2],
  ['doublekick', 'No Ability', 2], ['doubleironbash', 'No Ability', 2],
  ['dualchop', 'No Ability', 2], ['geargrind', 'No Ability', 2],
  ['dragondarts', 'No Ability', 2], ['tachyoncutter', 'No Ability', 2],
  ['triplekick', 'Skill Link', 3], ['tripledive', 'No Ability', 3],
  ['populationbomb', 'Skill Link', 10], ['cometpunch', 'Skill Link', 5],
  ['furyattack', 'Skill Link', 5], ['pinmissile', 'Skill Link', 5],
 ]) {
  it(`${ability}: ${move} deals ${count} separate hits`, () => {
   battle = common.createBattle({formatid: 'gen9customgame', seed: [1, 2, 3, 4]}, [[
    {species: 'Mew', ability, level: 10, moves: [move]},
   ], [{species: 'Blissey', ability: 'No Ability', moves: ['splash']}]]);
   battle.p1.active[0].boosts.accuracy = 6;
   battle.p2.active[0].setType('Water');
   const start = battle.log.length;
   battle.makeChoices('move 1', 'move splash');
   const hits = battle.log.slice(start).filter(line => line.startsWith('|-damage|p2a:') &&
    line.includes('/' + battle.p2.active[0].maxhp) && !line.includes('[from]'));
   assert.equal(hits.length, count, battle.log.slice(start).join('\n'));
   if (ability === 'Dual Wield') assert(battle.log.some(line => line.startsWith('|-hitcount|') && line.endsWith('|2')));
  });
 }
 it('Dual Wield still attempts its second hit when the first accuracy roll misses', () => {
  battle = common.createBattle({formatid: 'gen9customgame'}, [[
   {species: 'Mew', ability: 'Dual Wield', moves: ['waterpulse']},
  ], [{species: 'Blissey', ability: 'No Ability', moves: ['splash']}]]);
  const randomChance = battle.randomChance.bind(battle);
  let accuracyRolls = 0;
  battle.randomChance = (n, d) => n === 100 && d === 100 ? ++accuracyRolls > 1 : randomChance(n, d);
  battle.makeChoices('move waterpulse', 'move splash');
  assert.equal(accuracyRolls, 2);
  assert(battle.log.some(line => line.startsWith('|-miss|')));
  assert(battle.p2.active[0].hp < battle.p2.active[0].maxhp);
  assert(battle.log.some(line => line.startsWith('|-hitcount|') && line.endsWith('|1')));
 });
 for (const move of ['twinbeam', 'doublehit']) {
  it(`${move} damages the opponent after breaking its substitute`, () => {
   battle = common.createBattle({formatid: 'gen9customgame'}, [[
    {species: 'Mew', ability: 'No Ability', moves: [move]},
   ], [{species: 'Blissey', ability: 'No Ability', moves: ['splash']}]]);
   const target = battle.p2.active[0];
   target.addVolatile('substitute');
   target.volatiles.substitute.hp = 1;
   battle.p1.active[0].boosts.accuracy = 6;
   battle.makeChoices('move 1', 'move splash');
   assert(!target.volatiles.substitute);
   assert(target.hp < target.maxhp);
  });
 }
 for (const protection of ['Water Absorb', 'Protect']) {
  it(`Dual Wield respects ${protection} when the second hit selects another foe`, () => {
   battle = common.createBattle({formatid: 'gen9doubleswatersurface'}, [[
    {species: 'Mew', ability: 'Dual Wield', moves: ['waterpulse']},
    {species: 'Blissey', ability: 'No Ability', moves: ['splash']},
   ], [
    {species: 'Blissey', ability: 'No Ability', moves: ['splash']},
    {species: 'Vaporeon', ability: protection === 'Water Absorb' ? 'Water Absorb' : 'No Ability', moves: ['protect', 'splash']},
   ]]);
   if (battle.requestState === 'teampreview') battle.makeChoices();
   const partner = battle.p2.active[1], originalSample = battle.sample.bind(battle);
   battle.sample = values => values.includes(partner) ? partner : originalSample(values);
   battle.makeChoices('move waterpulse 1, move splash', `move splash, move ${protection === 'Protect' ? 'protect' : 'splash'}`);
   assert.equal(partner.hp, partner.maxhp, battle.log.join('\n'));
  });
 }
});
