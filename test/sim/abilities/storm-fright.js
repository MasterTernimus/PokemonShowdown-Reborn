'use strict';

const assert = require('assert').strict;
const common = require('../../common');

let battle;
describe('Storm Fright', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('gives Mega Manectric Intimidate, Storm Power, and Lightning Rod only', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Manectric', item: 'Manectite', moves: ['splash', 'bite']},
		], [
			{species: 'Mew', moves: ['splash', 'thunderbolt']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		const manectric = battle.p1.active[0];
		const foe = battle.p2.active[0];
		assert.equal(manectric.species.id, 'manectricmega');
		assert.equal(manectric.ability, 'stormfright');
		for (const component of ['intimidate', 'stormpower', 'lightningrod']) {
			assert(manectric.hasAbility(component), component);
		}
		assert.equal(manectric.hasAbility('teravolt'), false);
		assert.equal(manectric.hasAbility('strongjaw'), false);
		assert.equal(foe.boosts.atk, -1);
		assert.equal(battle.runEvent('BasePower', manectric, foe,
			battle.dex.getActiveMove('bite'), 100), 100);
		const hp = manectric.hp;
		battle.makeChoices('move splash', 'move thunderbolt');
		assert.equal(manectric.hp, hp);
		assert.equal(manectric.boosts.atk, 1);
		assert.equal(manectric.boosts.spa, 1);
	});

	it('boosts Special Attack in rain and takes Storm Power recoil', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Manectric', item: 'Manectite', moves: ['splash']},
		], [
			{species: 'Mew', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		const manectric = battle.p1.active[0];
		const drySpA = manectric.getStat('spa');
		battle.field.setWeather('raindance');
		assert.equal(manectric.getStat('spa'), Math.floor(drySpA * 1.5));
		const hp = manectric.hp;
		battle.makeChoices('move splash', 'move splash');
		assert.equal(hp - manectric.hp, Math.floor(manectric.baseMaxhp / 8));
	});
});
