'use strict';

const assert = require('assert').strict;
const common = require('../common');
const {Dex} = require('../../dist/sim/dex');

describe('Claydol-Mega', function () {
	let battle;
	afterEach(() => { if (battle) battle.destroy(); });
	function setup(ability = 'worldaxis', opponent = 'Magikarp', moves = ['splash']) {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Claydol', ability, item: 'Claydolite', moves: ['psychic', 'splash']},
		], [
			{species: opponent, ability: 'runaway', moves},
			{species: 'Magikarp', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		return battle.p1.active[0];
	}
	it('evolves with Claydolite and inherits every requested move', () => {
		const claydol = setup('levitate');
		assert.equal(claydol.canMegaEvo, 'Claydol-Mega');
		battle.makeChoices('move splash mega', 'move splash');
		assert.equal(claydol.species.name, 'Claydol-Mega');
		assert.equal(claydol.ability, 'worldaxis');
		assert(battle.field.getPseudoWeather('wonderroom'));
		assert.deepEqual(claydol.species.types, ['Ground', 'Psychic']);
		assert.deepEqual(claydol.species.baseStats, {hp: 60, atk: 100, def: 135, spa: 100, spd: 150, spe: 55});
		const learnset = Dex.species.getLearnsetData('claydol').learnset;
		for (const move of ['selfdestruct', 'explosion', 'bodypress', 'drillrun', 'eerieimpulse', 'expandingforce',
			'hex', 'nastyplot', 'psychicterrain', 'scorchingsands', 'sandtomb', 'storedpower', 'wonderroom',
			'psybeam', 'earthpower', 'psychic', 'psyshock', 'trickroom', 'gravity', 'stealthrock']) {
			assert(learnset[move]?.length, move);
		}
	});
});
