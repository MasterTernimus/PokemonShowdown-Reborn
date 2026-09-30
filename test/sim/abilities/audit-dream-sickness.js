'use strict';

const assert = require('assert').strict;
const common = require('../../common');

describe('Dream Sickness ally rescue', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });

	function start(ability = 'Dream Sickness') {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species: 'Gardevoir', ability, moves: ['splash']},
			{species: 'Mew', ability: 'No Ability', moves: ['splash']},
		], [
			{species: 'Blissey', ability: 'No Ability', moves: ['splash']},
			{species: 'Mew', ability: 'No Ability', moves: ['splash']},
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');
		return [battle.p1.active[0], battle.p1.active[1], battle.p2.active[0]];
	}

	it('leaves an ally at 1 HP, costs 1/4 HP, and rescues only once per switch-in', () => {
		const [holder, ally, foe] = start();
		assert(holder.hasAbility('telepathy'));
		const tackle = battle.dex.getActiveMove('tackle');
		ally.hp = 10;
		const before = holder.hp;
		assert.equal(battle.damage(10, ally, foe, tackle), 9);
		assert.equal(ally.hp, 1);
		assert.equal(holder.hp, before - Math.floor(holder.baseMaxhp / 4));
		assert.equal(battle.damage(10, ally, foe, tackle), 1);
		assert.equal(ally.hp, 0);
		assert.equal(battle.log.filter(line => line.includes('|ability: Dream Sickness')).length, 1);
	});

	it('does not rescue when the holder cannot pay its HP cost', () => {
		const [holder, ally, foe] = start();
		holder.hp = Math.floor(holder.baseMaxhp / 4);
		ally.hp = 10;
		assert.equal(battle.damage(10, ally, foe, battle.dex.getActiveMove('tackle')), 10);
		assert.equal(ally.hp, 0);
		assert.equal(holder.hp, Math.floor(holder.baseMaxhp / 4));
	});

	it('Royal Voice inherits the rescue without a stat-drop immunity', () => {
		const [holder, ally, foe] = start('Royal Voice');
		assert(holder.hasAbility('dreamsickness'));
		battle.boost({atk: -1}, holder, foe, battle.dex.getActiveMove('growl'));
		assert.equal(holder.boosts.atk, -1);
		ally.hp = 10;
		assert.equal(battle.damage(10, ally, foe, battle.dex.getActiveMove('tackle')), 9);
		assert.equal(ally.hp, 1);
	});
});
