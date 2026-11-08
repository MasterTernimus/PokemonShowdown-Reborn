'use strict';
const assert = require('assert').strict;
const common = require('../../common');

describe('Legacy War Path resolves to Grand Strategy', () => {
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
	it('resolves the legacy name and preserves move-level Mold Breaker', () => {
		const [holder, foe] = setup();
		assert.equal(holder.ability, 'grandstrategy');
		const move = battle.dex.getActiveMove('tackle');
		battle.singleEvent('ModifyMove', holder.getAbility(), holder.abilityState, move, holder, foe);
		assert.equal(move.ignoreAbility, true);
	});
	it('keeps ordinary accuracy and preserves always-hit moves', () => {
		const [holder, foe] = setup();
		const move = battle.dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('ModifyAccuracy', foe, holder, move, 50), 50);
		assert.equal(battle.runEvent('ModifyAccuracy', holder, foe, move, 50), 50);
		assert.equal(battle.runEvent('ModifyAccuracy', foe, holder, move, true), true);
	});
	for (const weather of ['hail', 'sandstorm']) {
		it(`does not retain the removed ${weather} immunity`, () => {
			const [holder, foe] = setup();
			battle.field.setWeather(weather, foe);
			const before = holder.hp, foeBefore = foe.hp;
			battle.makeChoices('move splash', 'move splash');
			assert(holder.hp < before);
			assert.equal(before - holder.hp, foeBefore - foe.hp);
			assert(foe.hp < foeBefore);
		});
	}
	it('does not retain generic power, damage reduction or status Attack bonuses', () => {
		const [holder, foe] = setup();
		const move = battle.dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('BasePower', holder, foe, move, 100), 100);
		assert.equal(battle.runEvent('ModifyDamage', foe, holder, move, 100), 100);
		holder.status = 'brn';
		assert.equal(battle.runEvent('ModifyAtk', holder, foe, move, 100), 100);
	});
});
