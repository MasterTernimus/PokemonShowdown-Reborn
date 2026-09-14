'use strict';
const assert = require('../../assert');
const {Dex} = require('../../../dist/sim');
describe('Rejuv battle profile isolation', () => {
	for (const [name, ability] of [
		['Donphan-Rejuv', 'Aevian Frost'],
		['Druddigon-Rejuv', 'Aevian Bolt'],
		['Turtonator-Rejuv', 'Aevian Glacier'],
	]) {
		it(`${name} only exposes its transformation ability`, () => {
			const species = Dex.species.get(name);
			assert.deepEqual(species.abilities, {0: ability});
			assert.equal(species.requiredAbility, ability);
			assert.false(!!species.isCosmeticForme);
		});
	}
});
