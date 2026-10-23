'use strict';
const assert = require('assert').strict;
const {Battle} = require('../../../dist/sim');
function setup(ability = 'Windy Surge') {
 const battle = new Battle({formatid: 'gen9nofieldsinglesgame', seed: [1, 2, 3, 4], p1: {team: [
  {species: 'Mew', ability, moves: ['tailwind', 'splash']},
  {species: 'Mew', ability: 'Windy Surge', moves: ['splash']},
 ]}, p2: {team: [{species: 'Mew', ability: 'No Ability', moves: ['splash']}]}});
 if (battle.requestState === 'teampreview') battle.makeChoices('team 12', 'team 1');
 return battle;
}
describe('Windy Surge Tailwind duration protocol', () => {
 it('announces two turns and expires after two turn ends', () => {
  const battle = setup();
  try {
   assert.equal(battle.p1.sideConditions.tailwind.duration, 2);
   assert(battle.log.some(line => line.includes('|-sidestart|p1:') && line.includes('Tailwind|[turns] 2')));
   battle.makeChoices('move splash', 'move splash');
   assert.equal(battle.p1.sideConditions.tailwind.duration, 1);
   battle.makeChoices('move splash', 'move splash');
   assert.equal(battle.p1.sideConditions.tailwind, undefined);
  } finally { battle.destroy(); }
 });
 it('announces a two-turn reset when entering under existing ordinary Tailwind', () => {
  const battle = setup('No Ability');
  try {
   battle.makeChoices('move tailwind', 'move splash');
   assert.equal(battle.p1.sideConditions.tailwind.duration, 3);
   battle.makeChoices('switch 2', 'move splash');
   assert.equal(battle.p1.sideConditions.tailwind.duration, 1);
   const starts = battle.log.filter(line => line.includes('|-sidestart|p1:') && line.includes('Tailwind'));
   assert(starts[0].includes('[turns] 4'));
   assert(starts[starts.length - 1].includes('[turns] 2'));
   battle.makeChoices('move splash', 'move splash');
   assert.equal(battle.p1.sideConditions.tailwind, undefined);
  } finally { battle.destroy(); }
 });
 for (const [ability, field, duration] of [['No Ability', '', 4], ['Persistent', '', 6], ['No Ability', 'mountainterrain', 6]]) {
  it('preserves ordinary Tailwind duration ' + duration + ' with ' + ability + '/' + field, () => {
   const battle = setup(ability);
   try {
    const source = battle.p1.active[0];
    if (field) battle.field.setTerrain(field, source);
    battle.actions.runMove('tailwind', source);
    assert.equal(battle.p1.sideConditions.tailwind.duration, duration);
    assert(battle.log.some(line => line.includes('Tailwind') && line.includes('[turns] ' + duration)));
   } finally { battle.destroy(); }
  });
 }
 it('keeps Windy Surge at two turns on Mountain rather than announcing an extension', () => {
  const battle = setup('No Ability');
  try {
   const source = battle.p1.active[0];
   battle.field.setTerrain('mountainterrain', source);
   source.setAbility('windysurge');
   assert.equal(battle.p1.sideConditions.tailwind.duration, 2);
   assert(battle.log.some(line => line.includes('Tailwind|[turns] 2')));
  } finally { battle.destroy(); }
 });
});
