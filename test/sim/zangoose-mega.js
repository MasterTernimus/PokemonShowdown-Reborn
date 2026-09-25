'use strict';
const assert = require('./../assert');
const common = require('./../common');
let battle;

describe('Zangoose-Mega', function () {
	afterEach(() => battle?.destroy());
	for (const ability of ['Violent Rush', 'Scrappy']) {
		it(`self-poisons on Mega Evolution from an unpoisoned ${ability} base and heals`, function () {
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
				{species: 'Zangoose', ability, item: 'Zangoosite', moves: ['splash']},
			], [{species: 'Magikarp', ability: 'No Ability', moves: ['splash']}]]);
			battle.makeChoices('team 1', 'team 1');
			const zangoose = battle.p1.active[0];
			assert.equal(zangoose.status, '');
			zangoose.hp = Math.floor(zangoose.maxhp / 2);
			const before = zangoose.hp;
			battle.makeChoices('move splash mega', 'move splash');
			assert.species(zangoose, 'Zangoose-Mega');
			assert(zangoose.hasType('Steel'));
			assert.equal(zangoose.status, 'psn');
			assert(zangoose.hp > before, 'Poison Heal should heal rather than deal poison damage');
			assert(battle.log.some(line => line.includes('|-status|p1a: Zangoose|psn') && line.includes('Toxic Armor')));
		});
	}

	it('defines the base and Mega as separate battle forms', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const base = battle.dex.species.get('Zangoose');
		const mega = battle.dex.species.get('Zangoose-Mega');
		assert.deepEqual(base.types, ['Normal', 'Fighting']);
		assert.deepEqual(base.otherFormes, ['Zangoose-Mega']);
		assert.false(battle.dex.species.get('Zangoose-Reborn').exists);
		assert.deepEqual(mega.types, ['Normal', 'Steel']);
		assert.deepEqual(mega.baseStats, {hp: 75, atk: 155, def: 125, spa: 70, spd: 90, spe: 95});
		assert.equal(mega.bst, 610);
		assert.equal(mega.abilities[0], 'Toxic Armor');
		assert.equal(mega.requiredItem, 'Zangoosite');
		assert.equal(mega.battleOnly, 'Zangoose');
		assert.equal(battle.dex.items.get('Zangoosite').megaStone.Zangoose, 'Zangoose-Mega');
	});

	it('Mega Evolves with Zangoosite and activates every Toxic Armor component', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Zangoose', item: 'Zangoosite', moves: ['bodyslam']},
		], [{species: 'Mimikyu', ability: 'disguise', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move bodyslam mega', 'move splash');
		const zangoose = battle.p1.active[0];
		assert.species(zangoose, 'Zangoose-Mega');
		assert.equal(zangoose.ability, 'toxicarmor');
		for (const component of ['venomarmor', 'violentrush']) assert(zangoose.hasAbility(component));
		assert.false(zangoose.hasAbility('scrappy'));
		assert.equal(zangoose.status, 'psn', 'Venom Armor should self-poison the Mega');
		battle.boost({atk: -1}, zangoose, battle.p2.active[0], battle.dex.abilities.get('intimidate'));
		assert.equal(zangoose.boosts.atk, -1, 'Intimidate should lower Attack without Scrappy');
		const bodySlam = battle.dex.getActiveMove('bodyslam');
		battle.singleEvent('ModifyMove', zangoose.getAbility(), zangoose.abilityState, bodySlam, zangoose, battle.p2.active[0]);
		assert.equal(bodySlam.ignoreImmunity?.Normal, undefined, 'Toxic Armor should not bypass Ghost immunity');
		zangoose.activeTurns = 1;
		assert.equal(battle.runEvent('ModifySpe', zangoose, null, null, 100), 150);
		assert.equal(battle.runEvent('ModifyAtk', zangoose, null, null, 100), 120);
	});
});
