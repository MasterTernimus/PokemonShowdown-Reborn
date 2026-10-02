'use strict';

const assert = require('assert').strict;
const {Dex, toID} = require('../../../dist/sim/dex');
const {Formats} = require('../../../dist/config/formats');

describe('Configured format identities', () => {
	it('keeps every display name uniquely addressable with valid rules and fields', () => {
		const seen = new Set();
		for (const entry of Formats) {
			if (!entry.name) continue;
			const id = toID(entry.name);
			assert(!seen.has(id), `Duplicate format ID: ${id}`);
			seen.add(id);
			const format = Dex.formats.get(id);
			assert(format.exists, id);
			assert.equal(format.name, entry.name);
			assert.equal(toID(Dex.formats.get(entry.name).name), id);
			assert.doesNotThrow(() => Dex.formats.getRuleTable(format), id);
			// These starting-field presets are resolved by Battle.turnLoop.
			if (entry.terrain && entry.terrain !== 'randomterrain') {
				const terrain = entry.terrain === 'adriennterrain' ? 'mistyterrain' : entry.terrain;
				assert(Dex.conditions.get(terrain).exists, `${id}: ${entry.terrain}`);
			}
			if (entry.playerCount) assert([2, 3, 4].includes(entry.playerCount), id);
		}
	});
});
