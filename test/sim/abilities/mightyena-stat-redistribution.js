'use strict';

const assert = require('assert').strict;
const {Dex} = require('../../../dist/sim/dex');

describe('Mightyena ordinary-form stat redistribution', () => {
	for (const id of ['mightyena', 'mightyenadeso', 'mightyenagrim']) {
		it(`${id} trades 15 Speed for Special Attack without changing its other stats`, () => {
			const species = Dex.species.get(id);
			assert.deepEqual(species.baseStats, {hp: 90, atk: 115, def: 80, spa: 75, spd: 80, spe: 110});
			assert.equal(species.bst, 550);
			assert.deepEqual(species.abilities, {0: 'Intimidate', 1: 'Black Fang', H: 'Stakeout'});
			assert.deepEqual(species.passives, ['rivalry']);
		});
	}
	for (const id of ['mightyenamega', 'mightyenamegagrim']) {
		it(`${id} retains its separate Mega stats and ability`, () => {
			const species = Dex.species.get(id);
			assert.deepEqual(species.baseStats, {hp: 90, atk: 140, def: 105, spa: 85, spd: 100, spe: 130});
			assert.equal(species.bst, 650);
			assert.deepEqual(species.abilities, {0: 'Dread Dominion'});
			assert.deepEqual(species.passives, ['darkaura']);
		});
	}
});
