'use strict';
const assert = require('assert').strict;
const { Learnsets, mergeLearnsetData } = require('../../dist/data/learnsets');
const { Gen8Gen9NatDexLearnsets } = require('../../dist/data/natdex-gen8-gen9-learnsets');

describe('Learnset event references', () => {
	it('resolves every final event source to its own generation and move', () => {
		let checked = 0;
		for (const [id, data] of Object.entries(Learnsets)) for (const [move, sources] of Object.entries(data.learnset || {})) for (const source of sources) {
			if (source[1] !== 'S') continue;
			const event = data.eventData?.[Number(source.slice(2))];
			assert(event, id + '/' + move + '/' + source);
			assert.equal(event.generation, Number(source[0]), id + '/' + move + '/' + source);
			assert(event.moves?.includes(move), id + '/' + move + '/' + source);
			checked++;
		}
		assert(checked > 1000);
	});

	it('keeps Shelter level access without claiming Withdraw-only event distributions', () => {
		for (const species of ['squirtle', 'shellder', 'omanyte', 'shuckle', 'turtwig']) {
			const data = Learnsets[species];
			assert(data.learnset.shelter.some(source => source.startsWith('9L')));
			assert(!data.learnset.shelter.some(source => source[1] === 'S'));
			const events = data.learnset.withdraw.filter(source => source[1] === 'S');
			assert(events.length, species);
			for (const source of events)assert(data.eventData[Number(source.slice(2))].moves.includes('withdraw'));
		}
	});
	it('preserves Torchic Gen5 and Gen6 distributions with their real generation', () => {
		for (const move of ['ember', 'focusenergy', 'growl', 'scratch']) {
			const sources = Learnsets.torchic.learnset[move];
			assert(sources.includes('5S1')); assert(sources.includes('6S2')); assert(!sources.includes('5S2'));
			for (const source of sources.filter(source => source[1] === 'S')) {
				const event = Learnsets.torchic.eventData[Number(source.slice(2))];
				assert.equal(event.generation, Number(source[0])); assert(event.moves.includes(move));
			}
		}
	});

	it('keeps every imported event reference attached to its generation and move', () => {
		let checked = 0;
		for (const [species, data] of Object.entries(Gen8Gen9NatDexLearnsets)) {
			// Force all imported indices to move; source and target numbering differ.
			const target = { learnset: {}, eventData: [{ generation: 3, level: 5, moves: ['splash'] }] };
			mergeLearnsetData(target, data);
			for (const [move, sources] of Object.entries(data.learnset)) {
				for (const source of sources) {
					const match = /^(\d+)S(\d+)$/.exec(source);
					if (!match) continue;
					const event = data.eventData[Number(match[2])];
					assert.equal(event.generation, Number(match[1]), `${species}.${move}`);
					assert(event.moves.includes(move), `${species}.${move}: ${source}`);
					const index = target.eventData.findIndex(e => JSON.stringify(e) === JSON.stringify(event));
					assert(target.learnset[move].includes(`${match[1]}S${index}`), `${species}.${move}`);
					checked++;
				}
			}
		}
		assert.equal(checked, 1125);
	});
	it('deduplicates events and remains stable across repeated merges', () => {
		const event = { generation: 9, level: 50, shiny: true, moves: ['celebrate'] };
		const target = { learnset: { celebrate: ['9M'] }, eventData: [event] };
		const source = { learnset: { celebrate: ['9S0'] }, eventData: [event] };
		mergeLearnsetData(target, source);
		mergeLearnsetData(target, source);
		assert.deepEqual(target, { learnset: { celebrate: ['9M', '9S0'] }, eventData: [event] });
	});
	it('preserves both Articuno Haze events without borrowing BDSP restrictions', () => {
		const data = Learnsets.articuno;
		const events = data.learnset.haze.filter(s => /^\d+S/.test(s)).map(s => data.eventData[Number(s.slice(2))]);
		assert(events.some(e => e.generation === 3 && e.moves.includes('haze')));
		assert(events.some(e => e.generation === 9 && e.moves.includes('haze')));
		assert(events.every(e => e.moves.includes('haze')));
	});
	it('rejects missing event metadata instead of creating a dangling source', () => {
		assert.throws(() => mergeLearnsetData({ learnset: {} }, { learnset: { celebrate: ['9S0'] } }), /Missing event/);
	});
});
