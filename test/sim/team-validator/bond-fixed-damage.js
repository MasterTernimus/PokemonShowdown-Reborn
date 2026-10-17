'use strict';
const assert = require('assert').strict;
const {Format} = require('../../../dist/sim/dex-formats');
const {TeamValidator} = require('../../../dist/sim/team-validator');
function errors(set) {
 return new TeamValidator(new Format({name: 'Bond validation test', effectType: 'Format', mod: 'gen9', ruleset: []})).validateTeam([{species: 'Mew', ability: 'Synchronize', moves: ['Night Shade'], ...set}]) || [];
}
function banned(set, move, bond) {
 assert(errors(set).some(error => error.includes(`can't use ${move} with ${bond}`)), JSON.stringify(errors(set)));
}
describe('Fixed-level moves with multi-strike Bond abilities', () => {
 it('checks a selected species passive even with an unrelated selected ability', () => banned({species: 'Kangaskhan-Mega', ability: 'Scrappy', moves: ['Seismic Toss']}, 'Seismic Toss', 'Parental Bond'));
 for (const format of ['gen9nofieldsinglesgame', 'gen9watersurface', 'gen9doubleswatersurface']) it('enforces the ban in ' + format, () => {
  const result = TeamValidator.get(format).validateTeam([
   {species: 'Kangaskhan', ability: 'Scrappy', item: 'Kangaskhanite', moves: ['Seismic Toss']},
   {species: 'Mew', ability: 'Synchronize', moves: ['Protect']},
  ]) || [];
  assert(result.some(error => error.includes("can't use Seismic Toss with Parental Bond")), JSON.stringify(result));
 });
 for (const move of ['Night Shade', 'Seismic Toss']) {
  for (const ability of ['Hydra Bond', 'Parental Bond']) it(`rejects ${move} with ${ability}`, () => banned({ability, moves: [move]}, move, ability));
  for (const ability of ['Dread Dominion', 'Pulse Triad', 'Sevii Schooling']) it(`rejects ${move} through ${ability}`, () => banned({ability, moves: [move]}, move, 'Hydra Bond'));
  it(`rejects ${move} through Mega Evolution`, () => banned({species: 'Kangaskhan', ability: 'Scrappy', item: 'Kangaskhanite', moves: [move]}, move, 'Parental Bond'));
  it(`rejects ${move} through custom Mega Evolution`, () => banned({species: 'Mightyena-Grim', ability: 'Intimidate', item: 'Grimyinite', moves: [move]}, move, 'Hydra Bond'));
  it(`rejects ${move} through Anomaly Core`, () => banned({species: 'Magnezone', ability: 'Sturdy', item: 'Anomaly Core', moves: [move]}, move, 'Hydra Bond'));
  it(`allows ${move} without Bond`, () => assert.deepEqual(errors({moves: [move]}), []));
 }
 it('does not ban the moves simply because the species has an unused Bond option', () => assert.deepEqual(errors({species: 'Kangaskhan', ability: 'Scrappy', moves: ['Seismic Toss']}), []));
 it('does not ban other attacks with Bond', () => assert.deepEqual(errors({ability: 'Hydra Bond', moves: ['Tackle']}), []));
 it('reports both restricted moves', () => {
  const result = errors({ability: 'Hydra Bond', moves: ['Night Shade', 'Seismic Toss']});
  assert.equal(result.filter(e => e.includes("can't use")).length, 2);
 });
});
