'use strict';

const assert = require('assert').strict;
const common = require('../common');
const {Dex} = require('../../dist/sim');
const {TeamValidator} = require('../../dist/sim/team-validator');

describe('Empoleon and Empoleon-Mega', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });

	it('uses Empoleonite to Mega Evolve regular Empoleon', () => {
		assert.deepEqual(Dex.species.get('Empoleon-Mega').baseStats,
			{hp: 84, atk: 86, def: 118, spa: 151, spd: 131, spe: 60});
		assert.equal(Dex.species.get('Empoleon-Mega').bst, 630);
		const validator = TeamValidator.get('gen9nofieldsinglesgame');
		assert.equal(validator.validateTeam([{species: 'Empoleon', item: 'Empoleonite', moves: ['Surf', 'Protect']}]), null);
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Empoleon', item: 'Empoleonite', moves: ['splash']},
		], [{species: 'Mew', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		const empoleon = battle.p1.active[0];
		assert.equal(empoleon.canMegaEvo, 'Empoleon-Mega');
		battle.makeChoices('move splash mega', 'move splash');
		assert.equal(empoleon.species.name, 'Empoleon-Mega');
		assert.equal(empoleon.ability, 'emperorsresolve');
		for (const component of ['competitive', 'slushrush', 'swiftswim', 'proficient']) {
			assert(empoleon.hasAbility(component), component);
		}
		const waterMove = battle.dex.getActiveMove('surf');
		assert.equal(battle.runEvent('BasePower', empoleon, battle.p2.active[0], waterMove, 100), 130);
		assert.equal(battle.runEvent('ModifySpe', empoleon, null, null, 100), 100);
		battle.field.setWeather('raindance');
		assert.equal(battle.runEvent('ModifySpe', empoleon, null, null, 100), 200);
		battle.field.clearWeather();
		battle.field.setTerrain('icyterrain', empoleon);
		assert.equal(battle.runEvent('ModifySpe', empoleon, null, null, 100), 200);
	});

	it('gives Exalt Ice and Flying STAB without a rain Speed boost', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Empoleon', ability: 'Exalt', moves: ['icebeam', 'aerialace']},
		], [{species: 'Mew', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		const empoleon = battle.p1.active[0];
		for (const moveId of ['icebeam', 'aerialace']) {
			const move = battle.dex.getActiveMove(moveId);
			battle.singleEvent('ModifyMove', empoleon.getAbility(), empoleon.abilityState, move, empoleon, battle.p2.active[0]);
			assert.equal(move.forceSTAB, true, moveId);
		}
		battle.field.setWeather('raindance');
		assert.equal(battle.runEvent('ModifySpe', empoleon, null, null, 100), 100);
	});

	it('does not expose Empoleon-Reborn as a separate species', () => {
		assert.equal(Dex.species.get('Empoleon-Reborn').exists, false);
		assert.equal(Dex.species.get('Empoleon-Mega').battleOnly, 'Empoleon');
	});
});
