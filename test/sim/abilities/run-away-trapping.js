'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
describe('Run Away trapping protection', () => {
 afterEach(() => battle?.destroy());
 function setup(species, ability, foeAbility = 'No Ability', move = 'splash') {
  battle = common.createBattle({formatid:'gen9nofieldsinglesgame'}, [[
   {species, ability, moves:['splash']}, {species:'Mew',ability:'No Ability',moves:['splash']},
  ], [{species:'Mew',ability:foeAbility,moves:[move]}]]);
  battle.makeChoices('team 12','team 1');
  return battle.p1.active[0];
 }
 for (const [species, ability] of [['Snorlax','Run Away'],['Eevee','No Ability']]) {
  for (const foeAbility of ['Shadow Tag','Arena Trap','Magnet Pull']) {
   it(species+' escapes '+foeAbility, () => {
    const p=setup(species,ability,foeAbility); p.setType('Steel');
    battle.makeChoices('move splash','move splash');
    assert(!p.trapped); assert(!p.maybeTrapped);
    battle.makeChoices('switch 2','move splash');
    assert.notEqual(battle.p1.active[0],p);
   });
  }
  for (const move of ['meanlook','infestation','jawlock']) {
   it(species+' escapes '+move, () => {
    const p=setup(species,ability,'No Ability',move);
    battle.makeChoices('move splash','move '+move);
    assert(!p.trapped);
    battle.makeChoices('switch 2','move '+move);
    assert.notEqual(battle.p1.active[0],p);
   });
  }
 }
 it('allows trapping when the active ability is suppressed', () => {
  const p=setup('Snorlax','Run Away','Shadow Tag');
  p.addVolatile('gastroacid');
  battle.makeChoices('move splash','move splash');
  assert(p.trapped);
 });
});
