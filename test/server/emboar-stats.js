const assert = require('assert').strict;
const { Dex } = require('../../dist/sim/dex');
describe('Approved base Emboar stats', () => {
	it('mirrors the base stat change in both Megas', () => {
		for (const id of ['emboar', 'emboaralt']) {
			const s = Dex.species.get(id);
			assert.deepEqual(s.baseStats, { "hp": 110, "atk": 123, "def": 75, "spa": 87, "spd": 75, "spe": 65 });
			assert.equal(s.bst, 535);
			assert.deepEqual(s.abilities, { 0: 'Controlled Fury', 1: 'Thick Fat', H: 'Brute Force' });
		}
		for (const id of ['emboarmega', 'emboarmegaalt']) {
			const s = Dex.species.get(id);
			assert.deepEqual(s.baseStats, { hp: 110, atk: 150, def: 93, spa: 92, spd: 115, spe: 75 });
			assert.equal(s.bst, 635);
			assert.deepEqual(s.abilities, { 0: 'Burning Ego' });
		}
	});
});
