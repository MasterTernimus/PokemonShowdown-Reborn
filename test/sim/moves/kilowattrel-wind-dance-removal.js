'use strict';
const assert = require('assert').strict;
const {Dex, TeamValidator} = require('../../../dist/sim');
describe('Kilowattrel Wind Dance movepool removal', () => {
 it('has no direct or inherited Wind Dance source and fails strict learnset validation', () => {
  const validator = new TeamValidator('gen9doublesrockyfield');
  for (const name of ['Kilowattrel', 'Wattrel']) {
   const species = Dex.species.get(name);
   assert(!Dex.species.getFullLearnset(species.id).some(data => data.learnset.winddance), name);
   assert(validator.checkCanLearn(Dex.moves.get('Wind Dance'), species), name);
  }
 });
 it('preserves every other non-cosmetic Wind Dance recipient', () => {
  const expected = ['altaria', 'altariamega', 'honchkrow', 'togekiss', 'braviaryhisui', 'noivern', 'noivernmega', 'oricorio', 'oricoriopompom', 'oricoriopau', 'oricoriosensu'];
  const actual = [];
  for (const species of Dex.species.all()) {
   if (species.isCosmeticForme) continue;
   let data;
   try { data = Dex.species.getFullLearnset(species.id); } catch { continue; }
   if (data.some(row => row.learnset.winddance)) actual.push(species.id);
  }
  assert.deepEqual(actual.sort(), expected.sort());
 });
});
