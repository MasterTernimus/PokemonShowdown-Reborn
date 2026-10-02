'use strict';
const assert = require('assert').strict;
const common = require('../../common');

describe('War Path accuracy and weather fixes', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup() {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Mew', ability: 'War Path', moves: ['splash', 'tackle']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash', 'tackle']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	it('boosts only outgoing accuracy and preserves always-hit moves', () => {
		const [holder, foe] = setup();
		const move = battle.dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('ModifyAccuracy', foe, holder, move, 50), 65);
		assert.equal(battle.runEvent('ModifyAccuracy', holder, foe, move, 50), 50);
		assert.equal(battle.runEvent('ModifyAccuracy', foe, holder, move, true), true);
	});
	for (const weather of ['hail', 'sandstorm']) {
		it(`prevents ${weather} damage even without a naturally immune type`, () => {
			const [holder, foe] = setup();
			battle.field.setWeather(weather, foe);
			const before = holder.hp, foeBefore = foe.hp;
			battle.makeChoices('move splash', 'move splash');
			assert.equal(holder.hp, before);
			assert(foe.hp < foeBefore);
		});
	}
	it('preserves power, status Attack and incoming damage modifiers', () => {
		const [holder, foe] = setup();
		const move = battle.dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('BasePower', holder, foe, move, 100), 130);
		assert.equal(battle.runEvent('ModifyDamage', foe, holder, move, 100), 75);
		holder.status = 'brn';
		assert.equal(battle.runEvent('ModifyAtk', holder, foe, move, 100), 150);
	});
});
