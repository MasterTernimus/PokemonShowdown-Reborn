'use strict';
const assert = require('assert').strict, { Dex, TeamValidator } = require('../../../dist/sim');
const { AevianWebMoveSources: sources, AevianWebExclusiveMoves: exclusive, AevianWebOrdinaryMoves: ordinary } = require('../../../dist/data/aevian-web-moves');
const v = TeamValidator.get('gen9nofieldsinglesgame');
function set(move, ability = 'Aevian Web', species = 'Galvantula') {
	return { species, ability, moves: [move], nature: 'Hardy', evs: { hp: 1 }, level: 100 };
}describe('Aevian Web additive event moves', () => {
	for (const move of Object.keys(sources))it('accepts event ' + move, () => assert.equal(v.validateTeam([set(move)]), null));
	for (const move of exclusive)it('rejects ordinary ' + move + ' after ability change', () => {
		const p = set(move, 'Silk Sights');
		assert(v.validateTeam([p])?.some(x => x.includes('requires Aevian Web')));
		assert.deepEqual(p.moves, [move]);
		assert(!Dex.species.getLearnsetData('galvantula').learnset[move]);
	});
	for (const move of ordinary)it('preserves ordinary ' + move, () => assert.equal(v.validateTeam([set(move, 'Silk Sights')]), null));
});
