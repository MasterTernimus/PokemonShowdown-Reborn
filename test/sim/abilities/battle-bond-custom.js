'use strict';

const assert = require('../../assert');
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

let battle;

describe('Battle Bond custom Greninja behavior', function () {
	afterEach(function () {
		battle?.destroy();
		battle = null;
	});

	it('gives regular Greninja only the requested normal ability slots', function () {
		assert.deepEqual(Dex.species.get('Greninja').abilities, {
			0: 'Technician', 1: 'Protean', H: 'Battle Bond',
		});
	});

	it('transforms regular Greninja into Ash-Greninja after its own KO without stat boosts', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Greninja', ability: 'Battle Bond', moves: ['surf']},
		], [
			{species: 'Mew', level: 1, moves: ['splash']},
			{species: 'Pikachu', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		assert.equal(battle.p1.active[0].species.id, 'greninja');
		battle.makeChoices('move surf', 'move splash');

		const greninja = battle.p1.active[0];
		assert.equal(greninja.species.id, 'greninjaash');
		assert.deepEqual(greninja.boosts, {
			atk: 0, def: 0, spa: 0, spd: 0, spe: 0, accuracy: 0, evasion: 0,
		});
		assert.equal(greninja.bondTriggered, true);
		assert(battle.log.some(line => line.includes('ability: Battle Bond')));
	});
});
