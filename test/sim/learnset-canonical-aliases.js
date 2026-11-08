'use strict';
const assert = require('assert').strict;
const { Dex, TeamValidator } = require('../../dist/sim');
const { normalizeLearnsetMoves } = require('../../dist/data/normalize-learnset-moves');
describe('Canonical learnset move IDs', () => {
	it('uses the existing Esper Wing, Sizzly Slide and Judgment moves', () => {
		for (const [id, move] of [['venomoth', 'esperwing'], ['flareon', 'sizzlyslide'], ['maractus', 'sizzlyslide'], ['miltank', 'judgment']]) {
			assert(Dex.moves.get(move).exists); assert(Dex.species.getLearnsetData(id).learnset[move].includes('9M'));
		}
	});
	it('removes approved nonexistent entries without inventing replacement moves', () => {
		assert.equal(Dex.species.getLearnsetData('unown').learnset.unownpower, undefined);
		assert.equal(Dex.species.getLearnsetData('skuntank').learnset.fireflash, undefined);
		for (const entry of Object.values(Dex.data.Learnsets))assert.equal(entry.learnset?.quicksilverspear, undefined);
	});

	it('unions renamed sources, orders them, and updates event move references', () => {
		const table = { test: { learnset: { mudslap: ['8E', '9M'], mudbarrage: ['9M', '8L1'], hijumpkick: ['9L58'], vicegrip: ['7S0'] }, eventData: [{ generation: 7, moves: ['vicegrip'] }] } };
		normalizeLearnsetMoves(table);
		assert.deepEqual(table.test.learnset, { mudbarrage: ['9M', '8L1', '8E'], highjumpkick: ['9L58'], visegrip: ['7S0'] });
		assert.deepEqual(table.test.eventData[0].moves, ['visegrip']);
		const before = JSON.stringify(table); normalizeLearnsetMoves(table); assert.equal(JSON.stringify(table), before);
	});
	it('preserves Mankey High Jump Kick and Paras Vise Grip access', () => {
		const validator = TeamValidator.get('gen9nofieldsinglesgame');
		for (const [species, move] of [['mankey', 'highjumpkick'], ['paras', 'visegrip']]) {
			assert(Dex.species.getLearnsetData(species).learnset[move].length);
			assert.equal(validator.checkCanLearn(Dex.moves.get(move), Dex.species.get(species)), null);
		}
	});
	it('keeps BDSP Sandshrew egg access under the renamed Mud Barrage ID', () => {
		const entry = Dex.mod('gen8bdsp').species.getLearnsetData('sandshrew');
		assert.deepEqual(entry.learnset.mudbarrage, ['8E']);
		assert.equal(entry.learnset.mudslap, undefined);
	});
	it('links native BDSP event sources to matching generation and moves', () => {
		const species = ['articuno', 'zapdos', 'moltres', 'mewtwo', 'mew', 'raikou', 'entei', 'lugia', 'hooh', 'latias', 'latios', 'kyogre', 'groudon', 'rayquaza', 'jirachi', 'dialga', 'palkia', 'darkrai'];
		const dex = Dex.mod('gen8bdsp');
		for (const id of species) {
			const data = dex.species.getLearnsetData(id);
			const events = dex.species.getLearnsetData(id).eventData;
			for (const [move, sources] of Object.entries(data.learnset || {})) for (const source of sources) {
				if (source[1] !== 'S') continue;
				const event = events[Number(source.slice(2))];
				assert(event, id + '/' + source);
				assert.equal(event.generation, Number(source[0]), id + '/' + source);
				assert(event.moves.includes(move), id + '/' + move + '/' + source);
			}
		}
	});
});
