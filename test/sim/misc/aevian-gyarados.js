'use strict';

const assert = require('../../assert');
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
const {Learnsets} = require('../../../dist/data/learnsets');

describe('Gyarados-Aevian', function () {
	let battle;
	afterEach(() => battle?.destroy());

	it('has the requested independent regional profile', function () {
		const species = Dex.species.get('Gyarados-Aevian');
		assert.deepEqual(species.types, ['Fire', 'Dragon']);
		assert.deepEqual(species.baseStats, { hp: 95, atk: 80, def: 84, spa: 125, spd: 105, spe: 81 });
		assert.deepEqual(species.abilities, {0: 'Multiscale', 1: 'Competitive', H: 'Intimidate'});
	});

	it('uses only its regional learnset instead of inheriting Gyarados moves', function () {
		const learnset = Learnsets.gyaradosaevian.learnset;
		for (const move of ['snarl', 'morningsun', 'fierydance', 'dracometeor', 'powerwhip', 'willowisp']) {
			assert(learnset[move], `${move} should be in Gyarados-Aevian's learnset`);
		}
		for (const move of ['splash', 'waterfall', 'icefang']) {
			assert(!learnset[move], `${move} should not be inherited from Gyarados`);
		}
	});

	it('uses Gyaradosite without crossing over with regular Gyarados', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame', preview: false}, [[
			{species: 'Gyarados-Aevian', ability: 'Multiscale', item: 'Gyaradosite', moves: ['earthquake']},
		], [
			{species: 'Gyarados', ability: 'Intimidate', item: 'Gyaradosite', moves: ['splash']},
		]]);
		if (!battle.p1.active[0] || !battle.p2.active[0]) battle.makeChoices('team 1', 'team 1');
		assert.equal(battle.actions.canMegaEvo(battle.p1.active[0]), 'Gyarados-Aevian-Mega');
		assert.equal(battle.actions.canMegaEvo(battle.p2.active[0]), 'Gyarados-Mega');
		battle.makeChoices('move earthquake mega', 'move splash mega');
		assert.equal(battle.p1.active[0].species.name, 'Gyarados-Aevian-Mega');
		assert.equal(battle.p2.active[0].species.name, 'Gyarados-Mega');
		assert.equal(battle.field.weather, 'sunnyday');
	});

	it('gives Helios Drought, Mold Breaker, Berserk and Swift Swim', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame', preview: false}, [[
			{species: 'Gyarados-Aevian', ability: 'Multiscale', item: 'Gyaradosite', moves: ['snarl']},
		], [
			{species: 'Mew', ability: 'Levitate', moves: ['dragonclaw']},
		]]);
		if (!battle.p1.active[0] || !battle.p2.active[0]) battle.makeChoices('team 1', 'team 1');
		const gyarados = battle.p1.active[0];
		battle.makeChoices('move snarl mega', 'move dragonclaw');
		for (const component of ['drought', 'moldbreaker', 'berserk', 'swiftswim']) {
			assert(gyarados.hasAbility(component), `Helios should expose ${component}`);
		}
		assert.false(gyarados.hasAbility('multiscale'));
		assert.equal(battle.field.weather, 'sunnyday');

		battle.destroy();
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame', preview: false}, [[
			{species: 'Gyarados-Aevian', ability: 'Multiscale', item: 'Gyaradosite', moves: ['earthquake']},
		], [
			{species: 'Rotom', ability: 'Levitate', moves: ['splash']},
		]]);
		if (!battle.p1.active[0] || !battle.p2.active[0]) battle.makeChoices('team 1', 'team 1');
		const rotom = battle.p2.active[0];
		battle.makeChoices('move earthquake mega', 'move splash');
		assert(rotom.hp < rotom.maxhp, 'Mold Breaker should let Earthquake hit Levitate');
	});
});
