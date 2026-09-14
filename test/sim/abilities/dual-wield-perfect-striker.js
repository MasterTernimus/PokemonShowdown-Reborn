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
		const ability = common.gen(9).dex.abilities.get('perfectstriker');
		const context = {chainModify: modifier => modifier};
		const attacker = {hasType: type => type === 'Fighting'};
		assert.equal(ability.onBasePower.call(context, 100, attacker, {},
			{category: 'Physical', type: 'Fighting', flags: {kick: 1}}), 1.4 * 1.3);
		assert.equal(ability.onBasePower.call(context, 100, attacker, {},
			{category: 'Special', type: 'Fighting', flags: {}}), 1.3);
	});
});
