'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Z-Move power conversion', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('should scale type-compatible signature crystals from the selected base move', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Lycanroc', ability: 'keeneye', item: 'lycaniumz', moves: ['mightycleave']},
		], [
			{species: 'Shuckle', ability: 'sturdy', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const pokemon = battle.p1.active[0];
		const baseMove = battle.dex.moves.get('mightycleave');
		const zMove = battle.actions.getActiveZMove(baseMove, pokemon);

		assert.equal(zMove.name, 'Splintered Stormshards');
		assert.equal(zMove.basePower, 175);
		assert.equal(zMove.baseMove, 'mightycleave');
	});

	it('should use the same multihit conversion represented by move data', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Lycanroc', ability: 'keeneye', item: 'lycaniumz', moves: ['rockblast']},
		], [
			{species: 'Shuckle', ability: 'sturdy', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const pokemon = battle.p1.active[0];
		const baseMove = battle.dex.moves.get('rockblast');
		const zMove = battle.actions.getActiveZMove(baseMove, pokemon);

		assert.equal(zMove.name, 'Splintered Stormshards');
		assert.equal(zMove.basePower, baseMove.zMove.basePower);
	});
});
