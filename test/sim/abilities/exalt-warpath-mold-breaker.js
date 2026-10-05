'use strict';
const assert = require('assert').strict;
const common = require('../../common');

describe('Exalt and War Path Mold Breaker', () => {
	let battle;
	afterEach(() => { battle?.destroy(); });
	function start(ability, opposingAbility, item) {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Mew', ability, moves: ['earthquake', 'watergun', 'tackle']},
		], [{species: 'Mew', ability: opposingAbility, item, moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	for (const ability of ['Exalt', 'War Path']) {
		for (const [opposingAbility, move] of [['Levitate', 'earthquake'], ['Water Absorb', 'watergun'], ['Sturdy', 'tackle']]) {
			it(`${ability} bypasses ${opposingAbility}`, () => {
				const [holder, foe] = start(ability, opposingAbility);
				assert(holder.hasAbility('moldbreaker'));
				assert.match(holder.getAbility().desc, /Mold Breaker/);
				if (opposingAbility === 'Sturdy') foe.hp = foe.maxhp = foe.baseMaxhp = 1;
				battle.actions.useMove(move, holder, {target: foe});
				assert(foe.hp < foe.maxhp);
			});
		}
		it(`${ability} respects suppression and Ability Shield`, () => {
			const [holder, foe] = start(ability, 'Levitate', 'Ability Shield');
			battle.actions.useMove('earthquake', holder, {target: foe});
			assert.equal(foe.hp, foe.maxhp);
			foe.clearItem(); holder.addVolatile('gastroacid', foe);
			assert(!holder.hasAbility('moldbreaker'));
			battle.actions.useMove('earthquake', holder, {target: foe});
			assert.equal(foe.hp, foe.maxhp);
		});
		it(`${ability} preserves its existing move boosts`, () => {
			const [holder, foe] = start(ability, 'No Ability');
			const move = battle.dex.getActiveMove(ability === 'Exalt' ? 'slash' : 'rockslide');
			battle.singleEvent('ModifyMove', holder.getAbility(), holder.abilityState, move, holder, foe);
			assert(move.ignoreAbility);
			assert.equal(battle.runEvent('BasePower', holder, foe, move, 1000), ability === 'Exalt' ? 1500 : 1300);
			if (ability === 'War Path') { assert(move.infiltrates); assert(move.ignoreDefensive); }
		});
	}
});
