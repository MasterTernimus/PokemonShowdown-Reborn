'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Venom Armor', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('self-poisons on switch-in and exposes Poison Heal and Dual Wield', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Zangoose', ability: 'Venom Armor', moves: ['Metal Claw']}],
			[{species: 'Magikarp', moves: ['Splash']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		const zangoose = battle.p1.active[0];
		assert.equal(zangoose.status, 'psn');
		assert(zangoose.hasAbility('poisonheal'));
		assert(zangoose.hasAbility('dualwield'));
	});

});
