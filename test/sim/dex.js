'use strict';

const assert = require('./../assert');
const common = require('../common');

describe('Mod loader', function () {
	common.itGen(2, 'should work fine in any order', () => {
		{
			const Dex = require('./../../dist/sim/dex').Dex;
			assert.equal(Dex.mod('gen2').species.getLearnsetData('nidoking').learnset.bubblebeam.join(','), '1M');
			assert.equal(Dex.mod('gen2').moves.get('crunch').secondaries[0].boosts.def, undefined);
		}
		{
			const Dex = require('./../../dist/sim/dex').Dex;
			Dex.mod('gen2').species.getLearnsetData('nidoking');
			Dex.mod('gen4').moves.get('crunch');
			assert.equal(Dex.mod('gen2').species.getLearnsetData('nidoking').learnset.bubblebeam.join(','), '1M');
			assert.equal(Dex.mod('gen2').moves.get('crunch').secondaries[0].boosts.def, undefined);
		}
	});
});

describe('Dex#getEffect', function () {
	it('returns the same object for the same id', function () {
		assert.equal(Dex.conditions.get('Stealth Rock'), Dex.conditions.get('stealthrock'));
		assert.notEqual(Dex.conditions.get('move: Stealth Rock'), Dex.conditions.get('stealthrock'));
	});

	it('does not return elements from the Object prototype', function () {
		assert.false(Dex.conditions.get('constructor').exists);
	});
});

describe('Dex#getSpecies', function () {
	for (const order of [['Ninetales-Reborn', 'Ninetales-Alt'], ['Ninetales-Alt', 'Ninetales-Reborn']]) {
		it(`preserves the cosmetic base through aliases (${order.join(' then ')})`, () => {
			// Exercise both cold-cache lookup orders, not a previously resolved alias.
			for (const id of ['ninetalesreborn', 'ninetalesalt']) Dex.species.speciesCache.delete(id);
			const first = Dex.species.get(order[0]);
			const second = Dex.species.get(order[1]);
			assert.equal(first, second);
			assert.equal(first.baseSpecies, 'Ninetales');
			assert.equal(first.abilities.S, 'Ashen Seeds');
		});
	}
	it('should handle cosmetic Flabébé formes', function () {
		assert.equal(Dex.species.get('Flabébé-yellow').name, 'Flabébé-Yellow');
	});

	it('should handle Minior-Meteor formes', function () {
		assert(!Dex.species.get('Minior-Meteor').isNonstandard);
		assert(Dex.forGen(8).species.get('Minior-Meteor').isNonstandard);
		assert(!Dex.forGen(7).species.get('Minior-Meteor').isNonstandard);
	});

	it.skip('should handle Rockruff-Dusk', function () {
		assert.equal(Dex.species.get('rockruffdusk').name, 'Rockruff-Dusk');
	});

	common.itGen(6, 'should handle Gen 6 Pikachu forme numbering', () => {
		assert.deepEqual(
			Dex.forGen(6).species.get('Pikachu').formeOrder.slice(0, 7),
			["Pikachu", "Pikachu-Rock-Star", "Pikachu-Belle", "Pikachu-Pop-Star", "Pikachu-PhD", "Pikachu-Libre", "Pikachu-Cosplay"]
		);
	});
	common.itGen(7, 'should handle Gen 7 Pikachu forme numbering', () => {
		assert.deepEqual(
			Dex.forGen(7).species.get('Pikachu').formeOrder.slice(0, 9),
			["Pikachu", "Pikachu-Original", "Pikachu-Hoenn", "Pikachu-Sinnoh", "Pikachu-Unova", "Pikachu-Kalos", "Pikachu-Alola", "Pikachu-Partner", "Pikachu-Starter"]
		);
	});
});

describe('Dex#getItem', function () {
	for (const gen of [5, 6, 7, 8]) common.itGen(gen, 'should correctly mark Gem legality', () => {
		assert.false(Dex.forGen(gen).items.get('Normal Gem').isNonstandard);
		assert.equal(Dex.forGen(gen).items.get('Rock Gem').isNonstandard, gen === 5 ? null : gen === 8 ? 'Past' : 'Unobtainable');
	});
});

describe('Dex#getMove', function () {
	it(`should correctly handle G-Max moves`, function () {
		assert.equal(Dex.forGen(8).moves.get('G-Max Befuddle').name, "G-Max Befuddle");
		assert.equal(Dex.forGen(8).moves.get('G-Max Befuddle').gen, 8);
		assert.equal(Dex.forGen(8).moves.get('G-Max Befuddle').isNonstandard, "Gigantamax");
	});
});
