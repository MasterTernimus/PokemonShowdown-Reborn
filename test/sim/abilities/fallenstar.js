'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Fallen Star', function () {
	afterEach(function () {
		battle.destroy();
	});

	it('hits every foe twice at full power in Free-for-All battles', function () {
		battle = common.createBattle({formatid: 'gen9freeforall4pmistyfieldadrienn'}, [[
			{species: 'decidueye', ability: 'fallenstar', moves: ['bulletseed']},
		], [
			{species: 'blissey', moves: ['splash']},
		], [
			{species: 'blissey', moves: ['splash']},
		], [
			{species: 'blissey', moves: ['splash']},
		]]);

		battle.makeChoices('team 1', 'team 1', 'team 1', 'team 1');
		battle.makeChoices('move bulletseed 1', 'move splash', 'move splash', 'move splash');

		for (const side of battle.sides.slice(1)) {
			const slot = side.active[0].getSlot();
			const damageLines = battle.log.filter(line => line.includes(`|-damage|${slot}: Blissey|`) && /\|\d+\/100$/.test(line));
			assert.equal(damageLines.length, 2, `${side.id} should be hit twice`);
			assert(side.pokemon[0].hp < side.pokemon[0].maxhp, `${side.id} should take damage`);
		}
	});
});
