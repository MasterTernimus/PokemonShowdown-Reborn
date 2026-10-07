'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
describe('Cactus Chorus Sand Rush component', () => {
 afterEach(() => battle?.destroy());
 function setup() {
  battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
   {species: 'Cacturne', ability: 'Cactus Chorus', moves: ['splash']},
  ], [{species: 'Mew', ability: 'No Ability', moves: ['watergun']}]]);
  battle.makeChoices('team 1', 'team 1');
  return battle.p1.active[0];
 }
 for (const field of ['', 'sandstorm', 'desertterrain', 'ashenbeachterrain']) {
  it('uses the expected Speed modifier in ' + (field || 'neutral conditions'), () => {
   const p = setup();
   if (field === 'sandstorm') battle.field.setWeather(field, p);
   else if (field) battle.field.setTerrain(field, p);
   assert.equal(battle.runEvent('ModifySpe', p, null, null, 100), field ? 200 : 100);
  });
 }
 it('blocks sandstorm damage and still absorbs Water attacks', () => {
  const p = setup(); p.hp = Math.floor(p.maxhp / 2);
  battle.field.setWeather('sandstorm', p);
  const hp = p.hp;
  battle.makeChoices('move splash', 'move watergun');
  assert.equal(p.hp, hp + Math.floor(p.baseMaxhp / 4));
 });
});
