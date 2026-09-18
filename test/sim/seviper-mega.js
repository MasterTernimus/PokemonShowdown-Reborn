'use strict';
const assert = require('./../assert');
const common = require('./../common');
let battle;

describe('Seviper-Mega', function () {
	afterEach(() => battle?.destroy());

	it('defines Seviper and its Mega as separate battle forms', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const base = battle.dex.species.get('Seviper');
		const mega = battle.dex.species.get('Seviper-Mega');
		assert.deepEqual(base.types, ['Poison', 'Dark']);
		assert.deepEqual(base.otherFormes, ['Seviper-Mega']);
		assert.false(battle.dex.species.get('Seviper-Reborn').exists);
		assert.deepEqual(mega.types, ['Poison', 'Dragon']);
		assert.deepEqual(mega.baseStats, {hp: 75, atk: 140, def: 115, spa: 70, spd: 115, spe: 95});
		assert.equal(mega.bst, 610);
		assert.equal(mega.abilities[0], 'Sirius');
		assert.equal(mega.requiredItem, 'Sevipite');
		assert.equal(mega.battleOnly, 'Seviper');
		assert.equal(battle.dex.items.get('Sevipite').megaStone.Seviper, 'Seviper-Mega');
	});

	it('Mega Evolves with Sevipite and activates every Sirius component', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Seviper', item: 'Sevipite', moves: ['poisonfang', 'dragontail']},
		], [{species: 'Magikarp', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move poisonfang mega', 'move splash');
		const seviper = battle.p1.active[0];
		assert.species(seviper, 'Seviper-Mega');
		assert.equal(seviper.ability, 'sirius');
		for (const component of ['apexvenom', 'whiplash', 'accumulation']) assert(seviper.hasAbility(component));
		const poisonFang = battle.dex.getActiveMove('poisonfang');
		battle.singleEvent('ModifyMove', seviper.getAbility(), seviper.abilityState, poisonFang, seviper, battle.p2.active[0]);
		assert.equal(poisonFang.type, 'Dragon');
		assert.equal(poisonFang.breaksProtect, true);
		assert.equal(poisonFang.secondaries?.at(-1)?.status, 'tox');
		const dragonTail = battle.dex.getActiveMove('dragontail');
		const boosted = battle.runEvent('BasePower', seviper, battle.p2.active[0], dragonTail, 60);
		assert.equal(boosted, 90, 'Whiplash should boost Tail moves by 1.5x');
		assert.equal(battle.runEvent('SourceModifyAtk', seviper, battle.p2.active[0], battle.dex.moves.get('icepunch'), 100), 50);
	});
});
