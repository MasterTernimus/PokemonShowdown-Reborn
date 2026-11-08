'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
describe("Queen's Guard", () => {
	afterEach(() => battle?.destroy());
	it('combines Contrary, Shed Skin and Intimidate without the removed offensive components', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Mew', ability: 'Queens Guard', moves: ['psychic']},
		], [{species: 'Mew', ability: 'No Ability', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		const holder = battle.p1.active[0];
		const foe = battle.p2.active[0];
		for (const id of ['contrary', 'shedskin', 'intimidate']) assert(holder.hasAbility(id));
		assert.equal(foe.boosts.atk, -1);
		const psychic = battle.dex.getActiveMove('psychic');
		battle.runEvent('ModifyMove', holder, foe, psychic, psychic);
		assert(!psychic.infiltrates);
		assert(!holder.hasAbility('infiltrator')); assert(!holder.hasAbility('proficient'));
		assert.equal(battle.runEvent('BasePower', holder, foe, psychic, 100), 100);
		assert.equal(battle.runEvent('BasePower', holder, foe, battle.dex.getActiveMove('tackle'), 100), 100);
		battle.boost({def: 1}, holder);
		assert.equal(holder.boosts.def, -1);
		holder.setStatus('psn');
		battle.randomChance = () => true;
		battle.singleEvent('Residual', holder.getAbility(), holder.abilityState, holder);
		assert.equal(holder.status, '');
	});
});
