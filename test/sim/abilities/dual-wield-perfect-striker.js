'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

describe('Dual Wield and Perfect Striker balance', function () {
	it('uses two 60% hits and a 15% second hit when paired with a component boost', function () {
		const dex = common.gen(9).dex;
		const context = {
			gameType: 'singles',
			field: {isTerrain: () => false},
			chainModify: modifier => modifier,
		};
		const move = {...dex.moves.get('psychocut'), flags: {...dex.moves.get('psychocut').flags}};
		dex.abilities.get('dualwield').onModifyMove.call(context, move, {});
		assert.equal(move.multihit, 2);
		assert.equal(move.multihitType, 'dualwield');

		move.hit = 1;
		assert.equal(dex.abilities.get('dualwield').onBasePower.call(context, 100, {}, {}, move), 0.6);
		move.hit = 2;
		assert.equal(dex.abilities.get('dualwield').onBasePower.call(context, 100, {}, {}, move), 0.6);
		move.hit = 1;
		assert.equal(dex.abilities.get('apexcleave').onBasePower.call(context, 100, {}, {}, move), 1.5);
		move.hit = 2;
		assert.equal(dex.abilities.get('apexcleave').onBasePower.call(context, 100, {}, {}, move), 0.15);
	});

	it('combines Proficient and Striker inside Perfect Striker', function () {
		const battle = common.createBattle({formatid: 'gen9customgame'}, [[
			{species: 'Machamp', ability: 'Perfect Striker', moves: ['lowkick']},
		], [{species: 'Mew', ability: 'No Ability', moves: ['splash']}]]);
		try {
			const attacker = battle.p1.active[0], defender = battle.p2.active[0];
			for (const [kick, expected] of [[true, 182], [false, 130]]) {
				const move = battle.dex.getActiveMove('lowkick');
				move.basePower = 100;
				move.flags = kick ? {kick: 1} : {};
				assert.equal(battle.runEvent('BasePower', attacker, defender, move, 100, true), expected);
			}
		} finally { battle.destroy(); }
	});
});
