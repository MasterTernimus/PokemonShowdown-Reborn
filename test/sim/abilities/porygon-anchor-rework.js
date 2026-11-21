'use strict';
const assert = require('assert').strict;
const { Dex } = require('../../../dist/sim');

describe('Porygon-Z and Defragment rework', () => {
	it('moves ten Sp. Atk into HP and replaces only Error Handler', () => {
		const p = Dex.species.get('porygonz');
		assert.deepEqual(p.baseStats, { hp: 95, atk: 80, def: 80, spa: 140, spd: 85, spe: 90 });
		assert.equal(p.bst, 570);
		assert.deepEqual(p.abilities, { 0: 'Defragment', 1: 'Adaptability', H: 'Memory Leak' });
		assert.deepEqual(p.passives, ['download']);
	});
});
