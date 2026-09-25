'use strict';

const assert = require('../../assert');
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
const {Learnsets} = require('../../../dist/data/learnsets');

let battle;

describe('Aevian Bolt', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('defines Druddigon-Rejuv and its requested moves', () => {
		assert.equal(Dex.species.get('Druddigon').abilities.S, 'Aevian Bolt');
		const rejuv = Dex.species.get('Druddigon-Rejuv');
		assert.deepEqual(rejuv.types, ['Dragon', 'Electric']);
		assert.deepEqual(rejuv.baseStats, {hp: 107, atk: 60, def: 88, spa: 120, spd: 100, spe: 80});
		assert.equal(rejuv.requiredAbility, 'Aevian Bolt');
		for (const move of ['agility', 'airslash', 'bravebird', 'discharge', 'hurricane', 'risingvoltage', 'voltswitch', 'zapcannon']) {
			assert(Learnsets.druddigon.learnset[move], `Druddigon should learn ${move}`);
		}
	});

	it('permanently transforms Druddigon and exposes all component abilities', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Druddigon', ability: 'Aevian Bolt', moves: ['thunderbolt']},
		], [
			{species: 'Mew', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const druddigon = battle.p1.active[0];
		assert.equal(druddigon.species.id, 'druddigonrejuv');
		assert(druddigon.hasAbility(['Storm Power', 'Static', 'Volt Absorb']));
		assert(!druddigon.hasAbility('Surge Surfer'));
	});

	it('paralyzes a contact attacker through its Static component', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Druddigon', ability: 'Aevian Bolt', moves: ['splash']},
		], [
			{species: 'Mew', moves: ['tackle']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.randomChance = () => true;
		battle.makeChoices('move splash', 'move tackle');
		assert.equal(battle.p2.active[0].status, 'par');
	});

	it('reverts a directly supplied Rejuv form without Aevian Bolt', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Druddigon-Rejuv', ability: 'Rough Scale', moves: ['thunderbolt']},
		], [
			{species: 'Mew', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		assert.equal(battle.p1.active[0].species.id, 'druddigon');
	});
});
