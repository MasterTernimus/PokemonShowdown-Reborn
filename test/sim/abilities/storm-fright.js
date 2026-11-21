'use strict';

const assert = require('assert').strict;
const common = require('../../common');

let battle;
describe('Storm Fright', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	for (const ability of ['Storm Power', 'Storm Fright', 'Aevian Bolt']) {
		it(ability + ' boosts both offenses only in effective rain', () => {
			battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species: 'Mew', ability, moves: ['splash'] }], [{ species: 'Mew', moves: ['splash'] }]]);
			battle.makeChoices('team 1', 'team 1');
			const p = battle.p1.active[0], foe = battle.p2.active[0];
			for (const [weather, expected] of [['', 100], ['raindance', 150], ['primordialsea', 150], ['sunnyday', 100]]) {
				battle.field.weather = weather;
				for (const event of ['ModifyAtk', 'ModifySpA']) {
					assert.equal(battle.runEvent(event, p, foe, battle.dex.getActiveMove('tackle'), 100), expected);
				}
			}
		});
	}
	it('gives Mega Manectric passive Intimidate alongside Storm Power and Lightning Rod', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Manectric', item: 'Manectite', moves: ['splash', 'bite'] },
		], [
			{ species: 'Mew', moves: ['splash', 'thunderbolt'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		const manectric = battle.p1.active[0];
		const foe = battle.p2.active[0];
		assert.equal(manectric.species.id, 'manectricmega');
		assert.equal(manectric.ability, 'stormfright');
		assert.deepEqual(manectric.getPassives(), ['intimidate']);
		assert(manectric.hasAbilityOrPassive('intimidate'));
		for (const component of ['stormpower', 'lightningrod']) {
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
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Manectric', item: 'Manectite', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
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
