'use strict';
const assert = require('assert').strict, { Dex, TeamValidator } = require('../../../dist/sim');
describe('Scizor and Kleavor explicit chain moves', () => {
	for (const species of ['scizor', 'kleavor']) for (const move of ['furycutter', 'stackingshot'])it(species + ' explicitly learns ' + move + ' in current generation', () => { assert(Dex.species.getLearnsetData(species).learnset[move].some(s => s.startsWith('9'))); assert.equal(new TeamValidator('gen9nofieldsinglesgame').checkCanLearn(Dex.moves.get(move), Dex.species.get(species)), null); });
	it('preserves distinct ability/passive kits', () => {
		assert.deepEqual(Dex.species.get('scizor').abilities, { 0: 'Pincer Crush', 1: 'Technician', H: 'Decoy Pincers' });
		assert.deepEqual(Dex.species.get('kleavor').abilities, { 0: 'Flint Fracture', 1: 'Sheer Force', H: 'Sharpness' });
		for (const id of ['scizor', 'kleavor'])assert.deepEqual(Dex.species.get(id).passives, ['hypercutter']);
	});
});
