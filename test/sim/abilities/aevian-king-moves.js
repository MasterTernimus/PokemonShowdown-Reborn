'use strict';
const assert = require('assert').strict, { Dex, TeamValidator, Teams } = require('../../../dist/sim');
const { AevianKingMoveSources: sources, AevianKingExclusiveMoves: exclusive, AevianKingOrdinaryMoves: ordinary } = require('../../../dist/data/aevian-king-moves');
const v = TeamValidator.get('gen9nofieldsinglesgame');
function set(move, ability = 'Aevian King', species = 'Politoed') {
	return { species, ability, moves: [move], nature: 'Hardy', evs: { hp: 1 }, level: 100 };
}describe('Aevian King additive event moves', () => {
	for (const move of Object.keys(sources))it('accepts event ' + move, () => assert.equal(v.validateTeam([set(move)]), null));
	for (const move of exclusive)it('rejects ordinary ' + move + ' after ability change', () => {
		const p = set(move, 'Zen');
		assert(v.validateTeam([p])?.some(x => x.includes('requires Aevian King')));
		assert.deepEqual(p.moves, [move]);
		assert(!Dex.species.getLearnsetData('politoed').learnset[move]);
	});
	for (const move of ordinary)it('preserves ordinary ' + move, () => assert.equal(v.validateTeam([set(move, 'Zen')]), null));
	it('preserves normal and event text import/export eligibility', () => {
		for (const a of ['Zen', 'Aevian King']) {
			const input = set(a === 'Zen' ? 'Surf' : 'Dragon Cheer', a);
			const output = Teams.import(Teams.export([input]));
			assert.equal(output[0].ability, a);
			assert.equal(v.validateTeam(output), null);
		} const illegal = Teams.import("Politoed\nAbility: Zen\n- Dragon Cheer");
		assert(v.validateTeam(illegal)?.some(x => x.includes('requires Aevian King')));
	});
	it('retains declared evolution/level and TM sources without changing normal sources', () => {
		assert.deepEqual(sources.dragoncheer, ['9L0']);
		assert.deepEqual(sources.recover, ['9L65']);
		assert.deepEqual(sources.aurasphere, ['9M']);
		assert.equal(exclusive.length, 19);
		assert.deepEqual(Dex.species.getLearnsetData('politoed').learnset.uproar, ['8M']);
	});
});
