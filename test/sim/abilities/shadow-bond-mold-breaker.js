'use strict';

const assert = require('assert').strict;
const common = require('../../common');
let battle;

describe('Shadow Bond Mold Breaker', () => {
	afterEach(() => battle?.destroy());
	function start(ability = 'Water Absorb', item = '') {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Mew', ability: 'Shadow Bond', moves: ['watergun', 'earthquake', 'tackle']},
		], [
			{species: 'Mew', ability, item, moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	for (const [ability, move] of [['Water Absorb', 'watergun'], ['Levitate', 'earthquake'], ['Sturdy', 'tackle']]) {
		it(`respects ${ability}`, () => {
			const [user, target] = start(ability);
			if (ability === 'Sturdy') target.hp = target.maxhp = target.baseMaxhp = 1;
			battle.actions.useMove(move, user, {target});
			assert.equal(target.hp, target.maxhp);
		});
	}
	it('respects Ability Shield and Protect', () => {
		const [user, target] = start('Water Absorb', 'Ability Shield');
		battle.actions.useMove('watergun', user, {target});
		assert.equal(target.hp, target.maxhp);
		target.takeItem();
		target.addVolatile('protect', target);
		battle.actions.useMove('watergun', user, {target});
		assert.equal(target.hp, target.maxhp);
	});
	it('retains Infiltrator and its unsuppressible Bond flags and does not expose Mold Breaker', () => {
		const [user, target] = start();
		assert(!user.hasAbility('moldbreaker'));
		assert(user.hasAbility('infiltrator'));
		battle.actions.useMove('gastroacid', target, {target: user});
		assert(!user.volatiles.gastroacid);
		assert(!user.ignoringAbility());
		const move = battle.dex.getActiveMove('watergun');
		battle.singleEvent('ModifyMove', user.getAbility(), user.abilityState, move, user, target);
		assert(!move.ignoreAbility);
		assert(move.infiltrates);
		assert.doesNotMatch(user.getAbility().desc, /Mold Breaker|bypass breakable abilities/);
		assert(!require('../../../dist/data/ability-display').getAbilityDisplayComponents('shadowbond').includes('moldbreaker'));
		assert(!require('../../../dist/sim/custom-calculator').calculatorMetadata().abilityComponents.shadowbond.includes('Mold Breaker'));
	});
});
