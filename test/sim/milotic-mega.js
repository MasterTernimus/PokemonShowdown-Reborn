'use strict';

const assert = require('../assert');
const common = require('../common');
const {Dex} = require('../../dist/sim/dex');

describe('Milotic-Mega', function () {
	let battle;
	afterEach(() => battle?.destroy());

	it('rearranges Mega Gyarados stats and replaces Milotic-Reborn', function () {
		const gyarados = Dex.species.get('Gyarados-Mega');
		const milotic = Dex.species.get('Milotic-Mega');
		assert.deepEqual(milotic.baseStats, {
			hp: gyarados.baseStats.hp, atk: gyarados.baseStats.spa, def: gyarados.baseStats.def,
			spa: gyarados.baseStats.spd, spd: gyarados.baseStats.atk, spe: gyarados.baseStats.spe,
		});
		assert.equal(milotic.bst, 670);
		assert.deepEqual(milotic.types, ['Water', 'Dragon']);
		assert.equal(milotic.abilities[0], 'Royal Scales');
		assert.equal(milotic.requiredItem, 'Miloticide');
		assert.deepEqual(Dex.species.get('Milotic').otherFormes, ['Milotic-Mega', 'Milotic-Terajuma']);
		assert.false(Dex.species.get('Milotic-Reborn').exists);
		assert.equal(Dex.items.get('Miloticide').megaStone.Milotic, milotic.name);
	});

	it('Mega Evolves regular Milotic and applies Royal Scales components', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Milotic', item: 'Miloticide', ability: 'competitive', moves: ['splash', 'tackle']},
		], [{species: 'Magikarp', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		const milotic = battle.p1.active[0];
		const foe = battle.p2.active[0];
		assert.species(milotic, 'Milotic-Mega');
		for (const component of ['marvelscale', 'filter', 'dragonize', 'selfsufficient']) {
			assert(milotic.hasAbility(component));
		}
		const tackle = battle.dex.getActiveMove('tackle');
		battle.singleEvent('ModifyType', milotic.getAbility(), milotic.abilityState, tackle, milotic);
		assert.equal(tackle.type, 'Dragon');
		assert.equal(battle.runEvent('BasePower', milotic, foe, tackle, 100), 120);
		const neutral = battle.dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('SourceModifyDamage', milotic, foe, neutral, 100), 80);
		const defense = milotic.getStat('def');
		milotic.setStatus('par', foe);
		assert(milotic.getStat('def') >= Math.floor(defense * 1.49));
		milotic.hp = 100;
		battle.makeChoices('move splash', 'move splash');
		assert.equal(milotic.hp, 100 + Math.floor(milotic.baseMaxhp / 16));
	});

	it('does not Mega Evolve Milotic-Terajuma with the regular stone', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Milotic-Terajuma', item: 'Miloticide', moves: ['splash']},
		], [{species: 'Magikarp', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		assert.equal(battle.p1.active[0].canMegaEvo, null);
	});
});
