'use strict';

const assert = require('./../assert');
const {CustomLearnsetRemovals, Learnsets} = require('./../../dist/data/learnsets');
const {Gen8Gen9NatDexLearnsets} = require('./../../dist/data/natdex-gen8-gen9-learnsets');

function intentionallyRemoved(species, move) {
	return move === 'terablast' || (move === 'decorate' && species !== 'alcremie') ||
		(['corsola', 'corsolaalt'].includes(species) && ['hex', 'nightshade', 'willowisp', 'trickroom', 'shadowball'].includes(move)) ||
		(CustomLearnsetRemovals[species] || []).includes(move);
}
function hasImportedSource(localData, officialData, move, source) {
	const sources = localData.learnset?.[move === 'mudslap' ? 'mudbarrage' : move] || [];
	const event = /^(\d+)S(\d+)$/.exec(source);
	if (!event) return sources.includes(source);
	const expected = officialData.eventData?.[Number(event[2])];
	assert(expected, `Missing imported event ${source}`);
	return sources.some(candidate => {
		const match = /^(\d+)S(\d+)$/.exec(candidate);
		return match && match[1] === event[1] &&
			JSON.stringify(localData.eventData?.[Number(match[2])]) === JSON.stringify(expected);
	});
}

describe('Generation 8/9 NatDex learnset merge', function () {
	it('should preserve every official source unless the move was intentionally removed', function () {
		let checkedSources = 0;
		const missing = [];
		for (const [species, officialData] of Object.entries(Gen8Gen9NatDexLearnsets)) {
			if (['flox', 'obliteryx'].includes(species)) {
				assert(!Dex.species.get(species).exists, 'Only absent upstream CAP entries are omitted');
				assert.equal(Learnsets[species], undefined);
				continue;
			}
			const localData = Learnsets[species];
			assert(localData, `${species} should have local learnset data`);
			for (const [move, officialSources] of Object.entries(officialData.learnset || {})) {
				if (intentionallyRemoved(species, move)) continue;
				for (const source of officialSources) {
					if (!hasImportedSource(localData, officialData, move, source)) missing.push(`${species}.${move}:${source}`);
					checkedSources++;
				}
			}
		}
		assert.deepEqual(missing, [], 'Official move sources lost outside approved removals');
		assert(checkedSources > 30_000, `expected a complete merge, checked only ${checkedSources} sources`);
	});

	it('should preserve official event and encounter metadata', function () {
		for (const [species, officialData] of Object.entries(Gen8Gen9NatDexLearnsets)) {
			if (['flox', 'obliteryx'].includes(species)) {
				assert(!Dex.species.get(species).exists, 'Only absent upstream CAP entries are omitted');
				assert.equal(Learnsets[species], undefined);
				continue;
			}
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

	it('fills regional placeholders from the imported base roster without assuming later base-only additions', () => {
		for (const [baseSpecies, regionalSpecies] of [
			['arcanine', 'arcaninehisui'],
			['goodra', 'goodrahisui'],
			['samurott', 'samurotthisui'],
		]) {
			const imported = Gen8Gen9NatDexLearnsets[baseSpecies];
			for (const [move, sources] of Object.entries(imported.learnset || {})) {
				if (intentionallyRemoved(regionalSpecies, move)) continue;
				for (const source of sources) {
					assert(hasImportedSource(Learnsets[regionalSpecies], imported, move, source), `${regionalSpecies}.${move} should inherit ${source}`);
				}
			}
		}
	});
});
