'use strict';

const assert = require('../../assert');
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

let battle;

describe('Aevian Dream', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('defines Musharna and its Rejuv profile', () => {
		assert.deepEqual(Dex.species.get('Musharna').abilities, {
			0: 'Neutralization', 1: 'Telepathy', H: 'Aevian Dream',
		});
		const rejuv = Dex.species.get('Musharna-Rejuv');
		assert.deepEqual(rejuv.types, ['Dark', 'Fairy']);
		assert.deepEqual(rejuv.baseStats, {hp: 120, atk: 110, def: 105, spa: 45, spd: 95, spe: 25});
		assert.equal(rejuv.requiredAbility, 'Aevian Dream');
	});

	it('combines the requested ability effects and transforms Musharna', () => {
		assert(Dex.abilities.get('Aevian Dream').onStart);
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Musharna', ability: 'Aevian Dream', moves: ['splash']},
		], [
			{species: 'Mew', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const musharna = battle.p1.active[0];
		assert.equal(musharna.species.id, 'musharnarejuv');
		assert(musharna.hasAbility(['Bad Dreams', 'Shed Skin', 'Tough Claws']));
	});

	it('reverts a directly supplied Rejuv without Aevian Dream', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Musharna-Rejuv', ability: 'Telepathy', moves: ['splash']},
		], [
			{species: 'Mew', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		assert.equal(battle.p1.active[0].species.id, 'musharna');
	});
});
