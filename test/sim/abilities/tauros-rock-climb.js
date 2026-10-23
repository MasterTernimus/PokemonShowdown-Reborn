'use strict';
const assert = require('assert').strict;
const { Dex, TeamValidator } = require('../../../dist/sim');

const taurosForms = ['tauros', 'taurospaldeaaqua', 'taurospaldeablaze', 'taurospaldeacombat'];

const moves = ['rockclimb', 'horndrill', 'fissure'];

describe('All Tauros approved movepools', () => {
 it('covers every actual Tauros form in the custom Dex', () => {
  assert.deepEqual(Dex.species.all().filter(s => s.baseSpecies === 'Tauros').map(s => s.id).sort(), taurosForms);
 });
 it('adds current-generation sources without inventing historical Paldea sources', () => {
  assert.deepEqual(Dex.species.getLearnsetData('tauros').learnset.rockclimb, ['9M', '5D', '4M']);
  for (const move of ['horndrill', 'fissure']) assert.deepEqual(Dex.species.getLearnsetData('tauros').learnset[move], ['9M', '7V']);
  for (const id of taurosForms.slice(1)) for (const move of moves) assert.deepEqual(Dex.species.getLearnsetData(id).learnset[move], ['9M']);
 });
 for (const format of ['gen9nofieldsinglesgame', 'gen9nofielddoublesbattle', 'gen9cavefield', 'gen9doublesrockyfield']) {
  for (const id of taurosForms) for (const move of moves) it(id + ' can select ' + move + ' in ' + format, () => {
   const species = Dex.species.get(id);
   const set = {species: species.name, ability: species.abilities['0'], moves: [move], nature: 'Hardy', evs: {hp: 1}};
   const validator = TeamValidator.get(format);
   assert.equal(validator.checkCanLearn(Dex.moves.get(move), species, undefined, set), null);
  });
 }
 for (const format of ['gen9nofieldsinglesgame', 'gen9nofielddoublesbattle']) {
  for (const id of taurosForms) for (const move of moves) it(id + ' validates with ' + move + ' in ' + format, () => {
   const species = Dex.species.get(id);
   const team = [{species: species.name, ability: species.abilities['0'], moves: [move], nature: 'Hardy', evs: {hp: 1}}];
   if (format === 'gen9nofielddoublesbattle') team.push({species: 'Mew', ability: Dex.species.get('Mew').abilities['0'], moves: ['Psychic'], nature: 'Hardy', evs: {hp: 1}});
   assert.equal(TeamValidator.get(format).validateTeam(team), null);
  });
 }
});
