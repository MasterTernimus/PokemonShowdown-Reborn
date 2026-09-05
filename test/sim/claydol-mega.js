'use strict';

const assert = require('assert').strict;
const common = require('../common');
const {Dex} = require('../../dist/sim/dex');

describe('Claydol-Mega', function () {
	let battle;
	afterEach(() => { if (battle) battle.destroy(); });
	function setup(ability = 'astralengine', opponent = 'Magikarp', moves = ['splash']) {
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
		assert.equal(claydol.ability, 'astralengine');
		assert.deepEqual(claydol.species.types, ['Ground', 'Psychic']);
		assert.deepEqual(claydol.species.baseStats, {hp: 60, atk: 70, def: 135, spa: 130, spd: 150, spe: 55});
		const learnset = Dex.species.getLearnsetData('claydol').learnset;
		for (const move of ['selfdestruct', 'explosion', 'bodypress', 'drillrun', 'eerieimpulse', 'expandingforce',
			'hex', 'nastyplot', 'psychicterrain', 'scorchingsands', 'sandtomb', 'storedpower', 'wonderroom',
			'psybeam', 'earthpower', 'psychic', 'psyshock', 'trickroom', 'gravity', 'stealthrock']) {
			assert(learnset[move]?.length, move);
		}
	});
	it('grants Ground immunity, respects Gravity, and boosts the highest stat after a KO', () => {
		const claydol = setup('astralengine', 'Garchomp', ['earthquake']);
		battle.makeChoices('move splash mega', 'move earthquake');
		assert.equal(claydol.hp, claydol.maxhp);
		assert.equal(claydol.isGrounded(), null);
		battle.field.addPseudoWeather('gravity', claydol);
		assert.equal(claydol.isGrounded(), true);
		battle.p2.active[0].hp = 1;
		battle.makeChoices('move psychic', 'move earthquake');
		assert(claydol.hp < claydol.maxhp);
		assert.equal(claydol.boosts.spd, 1);
	});
	it('matches Filter damage reduction for neutral and super-effective hits', () => {
		for (const move of ['tackle', 'surf']) {
			const damages = [];
			for (const ability of ['runaway', 'filter', 'astralengine']) {
				const claydol = setup(ability, 'Blastoise', [move]);
				battle.makeChoices('move splash', `move ${move}`);
				damages.push(claydol.maxhp - claydol.hp);
				battle.destroy(); battle = null;
			}
			assert.equal(damages[1], damages[2]);
			assert(damages[2] < damages[0]);
		}
	});
	it('matches Analytic when moving last and does not boost when moving first', () => {
		for (const opponent of ['Blastoise', 'Slowpoke']) {
			const damages = [];
			for (const ability of ['runaway', 'analytic', 'astralengine']) {
				setup(ability, opponent);
				battle.makeChoices('move psychic', 'move splash');
				const target = battle.p2.active[0];
				damages.push(target.maxhp - target.hp);
				battle.destroy(); battle = null;
			}
			assert.equal(damages[1], damages[2]);
			if (opponent === 'Blastoise') assert(damages[2] > damages[0]);
			else assert.equal(damages[2], damages[0]);
		}
	});
});
