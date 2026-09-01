'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Apex Venom', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('combines Strong Jaw and Shed Skin without changing move typing', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Seviper', ability: 'Apex Venom', moves: ['Poison Fang']}],
			[{species: 'Magikarp', moves: ['Splash']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		const seviper = battle.p1.active[0];
		assert(seviper.hasAbility('strongjaw'));
		assert(seviper.hasAbility('shedskin'));
		const poisonFang = battle.dex.getActiveMove('poisonfang');
		battle.singleEvent('ModifyMove', seviper.getAbility(), seviper.abilityState, poisonFang, seviper, battle.p2.active[0]);
		assert.equal(poisonFang.type, 'Poison');
		assert.equal(poisonFang.breaksProtect, true);
		assert.equal(poisonFang.secondaries?.at(-1)?.chance, 30);
	});

	it('lets biting moves hit through protection', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Seviper', ability: 'Apex Venom', moves: ['Crunch']}],
			[{species: 'Magikarp', moves: ['Protect']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		const target = battle.p2.active[0];
		const startingHP = target.hp;
		battle.makeChoices('move crunch', 'move protect');
		assert(target.hp < startingHP, 'Crunch should bypass Protect under Apex Venom');
	});
});
