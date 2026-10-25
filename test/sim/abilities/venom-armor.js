'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Venom Armor', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('self-poisons and keeps passive poison recovery alongside Dual Wield and Run Away', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Zangoose', ability: 'Venom Armor', moves: ['Metal Claw']}],
			[{species: 'Magikarp', moves: ['Splash']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		const zangoose = battle.p1.active[0];
		assert.equal(zangoose.status, 'psn');
		assert(zangoose.getPassives().includes('rivalresolve'));
		assert(zangoose.hasAbility('runaway'));
		zangoose.hp = Math.floor(zangoose.maxhp / 2);
		const before = zangoose.hp;
		battle.makeChoices('move metalclaw', 'move splash');
		assert.equal(zangoose.hp, before + Math.floor(zangoose.maxhp / 8));
		assert(zangoose.hasAbility('dualwield'));
	});

});
