'use strict';

const assert = require('./../assert');
const {CustomLearnsetRemovals, Learnsets} = require('./../../dist/data/learnsets');
const {Gen8Gen9NatDexLearnsets} = require('./../../dist/data/natdex-gen8-gen9-learnsets');

describe('Generation 8/9 NatDex learnset merge', function () {
	it('should preserve every official source unless the move was intentionally removed', function () {
		let checkedSources = 0;
		for (const [species, officialData] of Object.entries(Gen8Gen9NatDexLearnsets)) {
			const localData = Learnsets[species];
			assert(localData, `${species} should have local learnset data`);
			const removedMoves = new Set(CustomLearnsetRemovals[species] || []);
			for (const [move, officialSources] of Object.entries(officialData.learnset || {})) {
				if (removedMoves.has(move)) continue;
				const localSources = localData.learnset?.[move] || [];
				for (const source of officialSources) {
					assert(localSources.includes(source), `${species}.${move} should preserve ${source}`);
					checkedSources++;
				}
			}
		}
		assert(checkedSources > 30_000, `expected a complete merge, checked only ${checkedSources} sources`);
	});

	it('should preserve official event and encounter metadata', function () {
		for (const [species, officialData] of Object.entries(Gen8Gen9NatDexLearnsets)) {
			const localData = Learnsets[species];
			for (const key of ['eventData', 'encounters']) {
				for (const event of officialData[key] || []) {
					assert(
						(localData[key] || []).some(localEvent => JSON.stringify(localEvent) === JSON.stringify(event)),
						`${species} should preserve ${key} entry ${JSON.stringify(event)}`
					);
				}
			}
		}
	});

	it('should fill empty regional source placeholders and keep inherited moves', function () {
		for (const [baseSpecies, regionalSpecies] of [
			['arcanine', 'arcaninehisui'],
			['goodra', 'goodrahisui'],
			['samurott', 'samurotthisui'],
		]) {
			const removedMoves = new Set(CustomLearnsetRemovals[regionalSpecies] || []);
			for (const [move, sources] of Object.entries(Learnsets[baseSpecies].learnset || {})) {
				if (removedMoves.has(move)) continue;
				const regionalSources = Learnsets[regionalSpecies].learnset?.[move] || [];
				for (const source of sources) {
					assert(regionalSources.includes(source), `${regionalSpecies}.${move} should inherit ${source}`);
				}
			}
		}
	});
});
