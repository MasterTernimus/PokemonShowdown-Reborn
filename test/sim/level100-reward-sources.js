'use strict';
const assert = require('assert').strict;
const { Dex } = require('../../dist/sim');
describe('Approved level-100 reward sources', () => {
	it('keeps every level source within the playable range', () => {
		for (const [species, entry] of Object.entries(Dex.data.Learnsets)) {
			for (const [move, sources] of Object.entries(entry.learnset || {})) {
				for (const source of sources) if (source[1] === 'L') assert(Number(source.slice(2)) <= 100, `${species}/${move}: ${source}`);
			}
		}
	});
	it('keeps approved rewards at level 100 and earlier alternatives intact', () => {
		for (const [species, move] of [['charizard', 'sacredfire'], ['charmeleon', 'searingshot'], ['banette', 'shadowforce'], ['raichu', 'boltstrike'], ['lanturnalt', 'boltstrike']]) assert.deepEqual(Dex.species.getLearnsetData(species).learnset[move], ['9L100']);
		assert(Dex.species.getLearnsetData('clefable').learnset.lunarblessing.includes('9L5'));
		assert(Dex.species.getLearnsetData('smeargle').learnset.sketch.includes('7L1'));
		assert(Dex.species.getLearnsetData('screamtail').learnset.hypervoice.includes('9L49'));
	});
});
