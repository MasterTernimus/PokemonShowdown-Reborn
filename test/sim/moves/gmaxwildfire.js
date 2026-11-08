'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('G-Max Wildfire', function () {
	afterEach(function () {
		battle.destroy();
	});

	it('should not damage Fire-types', function () {
		battle = common.gen(8).createBattle({gameType: 'doubles'});
		battle.setPlayer('p1', {team: [
			{species: 'Charizard', moves: ['ember'], gigantamax: true},
			{species: 'Wynaut', moves: ['sleeptalk']},
		]});
		battle.setPlayer('p2', {team: [
			{species: 'Wynaut', moves: ['sleeptalk']},
			{species: 'Flareon', moves: ['sleeptalk']},
		]});
		battle.makeChoices('move ember 1 dynamax, move sleeptalk', 'move sleeptalk, move sleeptalk');
		assert.fullHP(battle.p2.active[1]);
		assert(battle.p2.sideConditions.gmaxwildfire);
	});

	it('should deal damage for four turns, including the fourth turn', function () {
		// Burning Crown has separate chip, and a Fire-immune target prevents move setup.
		// Exercise Wildfire duration independently of those integration effects.
		battle = common.gen(8).createBattle([[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		const target = battle.p2.active[0]; target.hp = target.maxhp = target.baseMaxhp = 1200;
		assert(target.side.addSideCondition('gmaxwildfire', battle.p1.active[0], battle.dex.moves.get('gmaxwildfire')));
		for (let turn = 1; turn <= 4; turn++) { battle.makeChoices(); assert.equal(target.hp, 1200 - 200 * turn); }
		assert(!target.side.sideConditions.gmaxwildfire); battle.makeChoices(); assert.equal(target.hp, 400);
	});
});
