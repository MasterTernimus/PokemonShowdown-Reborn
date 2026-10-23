'use strict';
const assert = require('assert').strict;
const { Dex, TeamValidator } = require('../../../dist/sim');
const recipients = ['ursaring', 'ursaluna', 'ursalunabloodmoon'];

describe('Ursaring and both Ursaluna Fissure movepools', () => {
 it('adds only current-generation sources to each explicitly requested form', () => {
  for (const id of recipients) assert.deepEqual(Dex.species.getLearnsetData(id).learnset.fissure, ['9M']);
  assert.equal(Dex.species.getLearnsetData('teddiursa').learnset.fissure, undefined);
 });
 for (const format of ['gen9nofieldsinglesgame', 'gen9nofielddoublesbattle', 'gen9cavefield', 'gen9doublesrockyfield']) {
  for (const id of recipients) it(id + ' can select Fissure in ' + format, () => {
   const species = Dex.species.get(id);
   const set = {species: species.name, ability: species.abilities['0'], moves: ['Fissure'], nature: 'Hardy', evs: {hp: 1}};
   assert.equal(TeamValidator.get(format).checkCanLearn(Dex.moves.get('fissure'), species, undefined, set), null);
  });
 }
 for (const format of ['gen9nofieldsinglesgame', 'gen9nofielddoublesbattle']) {
  for (const id of recipients) it(id + ' validates with Fissure in ' + format, () => {
   const species = Dex.species.get(id);
   const team = [{species: species.name, ability: species.abilities['0'], moves: ['Fissure'], nature: 'Hardy', evs: {hp: 1}}];
   if (format === 'gen9nofielddoublesbattle') team.push({species: 'Mew', ability: Dex.species.get('Mew').abilities['0'], moves: ['Psychic'], nature: 'Hardy', evs: {hp: 1}});
   assert.equal(TeamValidator.get(format).validateTeam(team), null);
  });
 }
});
