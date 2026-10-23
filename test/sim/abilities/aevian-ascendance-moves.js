'use strict';
const assert = require('assert').strict, { Dex, TeamValidator, Teams } = require('../../../dist/sim');
const { AevianAscendanceMoveSources: sources, AevianAscendanceExclusiveMoves: exclusive, AevianAscendanceOrdinaryMoves: ordinary } = require('../../../dist/data/aevian-ascendance-moves');
const v = TeamValidator.get('gen9nofieldsinglesgame');
function set(move, ability = 'Aevian Ascendance', species = 'Poliwrath') {
	return { species, ability, moves: [move], nature: 'Hardy', evs: { hp: 1 }, level: 100 };
}describe('Aevian Ascendance additive event moves', () => {
	for (const move of Object.keys(sources))it('accepts event ' + move, () => assert.equal(v.validateTeam([set(move)]), null));
	for (const move of exclusive)it('rejects ordinary ' + move + ' after ability change', () => {
		const p = set(move, 'Reservoir');
		assert(v.validateTeam([p])?.some(x => x.includes('requires Aevian Ascendance')));
		assert.deepEqual(p.moves, [move]);
		assert(!Dex.species.getLearnsetData('poliwrath').learnset[move]);
	});
	for (const move of ordinary)it('preserves ordinary ' + move, () => assert.equal(v.validateTeam([set(move, 'Reservoir')]), null));
	it('preserves normal and event text import/export eligibility', () => {
		for (const a of ['Reservoir', 'Aevian Ascendance']) {
			const input = set(a === 'Reservoir' ? 'Surf' : 'Dragon Cheer', a);
			const output = Teams.import(Teams.export([input]));
			assert.equal(output[0].ability, a);
			assert.equal(v.validateTeam(output), null);
		} const illegal = Teams.import("Poliwrath\nAbility: Reservoir\n- Dragon Cheer");
		assert(v.validateTeam(illegal)?.some(x => x.includes('requires Aevian Ascendance')));
	});
	it('retains declared evolution/level and TM sources without changing normal sources', () => {
		assert.deepEqual(sources.purify, ['9L1']);
		assert.deepEqual(sources.recover, ['9L46']);
		assert.deepEqual(sources.aurasphere, ['9L1']);
		assert.equal(exclusive.length, 13);
		assert(Dex.moves.get('scentedgeyser').exists);
		assert.deepEqual(sources.scentedgeyser, ['9L0']);
	});
});
