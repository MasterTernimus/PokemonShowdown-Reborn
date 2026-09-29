'use strict';

const assert = require('assert').strict;
const common = require('../common');
const {Dex} = require('../../dist/sim');
const {TeamValidator} = require('../../dist/sim/team-validator');

describe('Torterra-Mega-X and Primal Ego', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });

	it('uses the requested spread and shares Torterranite with Mega Y', () => {
		const mega = Dex.species.get('Torterra-Mega-X');
		assert.deepEqual(mega.types, ['Grass', 'Ground']);
		assert.deepEqual(mega.baseStats, {hp: 95, atk: 139, def: 135, spa: 75, spd: 105, spe: 86});
		assert.equal(mega.bst, 635);
		assert.equal(mega.abilities[0], 'Primal Ego');
		assert.equal(mega.requiredItem, 'Torterranite');
		assert.equal(Dex.items.get('Torterranite').megaStone.Torterra, mega.name);
		for (const move of ['powergem', 'ancientpower', 'rockwrecker']) {
			assert(Dex.species.getLearnsetData('torterra').learnset[move]?.includes('9M'), move);
		}
	});

	it('offers both Mega choices and activates Ultra Ego, Unaware, and Proficient', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Torterra', item: 'Torterranite', moves: ['splash', 'rockslide', 'energyball']},
		], [{species: 'Mew', moves: ['tackle']}]]);
		battle.makeChoices('team 1', 'team 1');
		assert.equal(battle.p1.active[0].canMegaEvo, 'Torterra-Mega-X');
		assert.equal(battle.p1.active[0].canMegaEvoY, 'Torterra-Mega-Y');
		battle.makeChoices('move splash mega', 'move tackle');
		const torterra = battle.p1.active[0];
		const foe = battle.p2.active[0];
		assert.equal(torterra.species.name, 'Torterra-Mega-X');
		for (const ability of ['unaware', 'proficient', 'ultraego', 'moldbreaker']) {
			assert(torterra.hasAbility(ability), ability);
		}
		assert.equal(torterra.boosts.atk, 1);
		assert.equal(torterra.boosts.spa, 1);
		const rockMove = battle.dex.getActiveMove('rockslide');
		battle.singleEvent('ModifyMove', torterra.getAbility(), torterra.abilityState, rockMove, torterra, foe);
		assert.equal(rockMove.ignoreAbility, true);
		const grassMove = battle.dex.getActiveMove('energyball');
		const withStab = battle.runEvent('BasePower', torterra, foe, grassMove, 100);
		torterra.setType('Water');
		const withoutStab = battle.runEvent('BasePower', torterra, foe, grassMove, 100);
		assert(Math.abs(withStab - withoutStab * 1.3) <= 1, 'Proficient boosts matching-type moves');
	});

	it('lets regular Torterra learn the three Rock moves', () => {
		const validator = TeamValidator.get('gen9nofieldsinglesgame');
		assert.equal(validator.validateTeam([
			{species: 'Torterra', item: 'Torterranite', moves: ['Power Gem', 'Ancient Power', 'Rock Wrecker', 'Rock Slide']},
			{species: 'Mew', moves: ['Splash']},
		]), null);
	});
});
