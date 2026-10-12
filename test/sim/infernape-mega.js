'use strict';

const assert = require('assert').strict;
const common = require('../common');
const {Dex} = require('../../dist/sim');
const {TeamValidator} = require('../../dist/sim/team-validator');

describe('Infernape and Infernape-Mega', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });

	it('allows regular Infernape to Mega Evolve with Infernite', () => {
		const validator = TeamValidator.get('gen9nofieldsinglesgame');
		assert.equal(validator.validateTeam([{species: 'Infernape', item: 'Infernite', moves: ['Flamethrower', 'Protect']}]), null);
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Infernape', item: 'Infernite', moves: ['splash']},
		], [{species: 'Mew', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		const infernape = battle.p1.active[0];
		assert.equal(infernape.canMegaEvo, 'Infernape-Mega');
		battle.makeChoices('move splash mega', 'move splash');
		assert.equal(infernape.species.name, 'Infernape-Mega');
		assert.equal(infernape.ability, 'burningspirit');
		for (const component of ['ultrainstinct', 'moldbreaker', 'innerfocus', 'opportunist', 'magmaarmor']) {
			assert(infernape.hasAbility(component), component);
		}
		assert.equal(infernape.hasAbility('filter'), false);
		assert.equal(infernape.hasAbility('selfsufficient'), false);
		assert.equal(infernape.hasAbility('proficient'), false);
		assert(infernape.getPassives().includes('proficient'));
		const fireMove = battle.dex.getActiveMove('flamethrower');
		assert.equal(battle.runEvent('BasePower', infernape, battle.p2.active[0], fireMove, 100), 130);
		infernape.hp = Math.floor(infernape.maxhp / 2);
		const hp = infernape.hp;
		battle.makeChoices('move splash', 'move splash');
		assert.equal(infernape.hp, hp, 'Burning Spirit has no passive end-turn recovery');
	});

	it('retires Infernape-Reborn as a separate species', () => {
		assert.equal(Dex.species.get('Infernape-Reborn').exists, false);
		assert.equal(Dex.species.get('Infernape-Mega').battleOnly, 'Infernape');
	});
});
