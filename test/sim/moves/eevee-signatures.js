'use strict';

const assert = require('../../assert');
const common = require('../../common');

let battle;

describe('Eevee signature moves', function () {
	afterEach(function () {
		battle?.destroy();
		battle = null;
	});

	function startBattle(moves, targetSpecies = 'Blissey') {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Eevee-Starter', ability: 'runaway', moves},
		], [
			{species: targetSpecies, ability: 'naturalcure', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
	}

	it('runs every post-hit effect from the Eevee signature moves', function () {
		startBattle(['punchypummel']);
		battle.makeChoices('move punchypummel', 'move splash');
		assert.equal(battle.p2.active[0].boosts.def, -1);
		assert.equal(battle.p2.active[0].boosts.spe, -1);

		battle.destroy();
		startBattle(['rockyrampage']);
		battle.makeChoices('move rockyrampage', 'move splash');
		assert(battle.p2.sideConditions.stealthrock, 'Rocky Rampage should set Stealth Rock after damage');

		battle.destroy();
		startBattle(['dustydrift']);
		battle.makeChoices('move dustydrift', 'move splash');
		assert.equal(battle.field.weather, 'sandstorm');

		battle.destroy();
		startBattle(['ickyinjection']);
		battle.makeChoices('move ickyinjection', 'move splash');
		assert.equal(battle.p2.active[0].status, 'psn');

		battle.destroy();
		startBattle(['spookyspell'], 'Gengar');
		battle.makeChoices('move spookyspell', 'move splash');
		assert(battle.p2.active[0].volatiles.curse, 'Spooky Spell should apply Curse after damage');

		battle.destroy();
		startBattle(['scalyscorn']);
		battle.makeChoices('move scalyscorn', 'move splash');
		assert.equal(battle.p1.active[0].boosts.spa, 1);
	});

	it('clears hazards with Twirly Twister and applies Forest effects for Stabby Swarm', function () {
		startBattle(['rockyrampage', 'twirlytwister']);
		battle.makeChoices('move rockyrampage', 'move splash');
		assert(battle.p2.sideConditions.stealthrock);
		battle.makeChoices('move twirlytwister', 'move splash');
		assert.false(battle.p2.sideConditions.stealthrock);

		battle.destroy();
		battle = common.createBattle({formatid: 'gen9forestfield'}, [[
			{species: 'Eevee-Starter', ability: 'runaway', moves: ['stabbyswarm']},
		], [
			{species: 'Blissey', ability: 'naturalcure', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move stabbyswarm', 'move splash');
		assert(battle.p2.active[0].volatiles.partiallytrapped, 'Stabby Swarm should trap the target');
		assert.equal(battle.p2.active[0].boosts.def, -1);
	});

	it('removes opposing screens with Steely Strike', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Eevee-Starter', ability: 'runaway', moves: ['steelystrike', 'splash']},
		], [
			{species: 'Blissey', ability: 'naturalcure', moves: ['reflect', 'splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash', 'move reflect');
		assert(battle.p2.sideConditions.reflect);
		battle.makeChoices('move steelystrike', 'move splash');
		assert.false(battle.p2.sideConditions.reflect);
	});

	it('creates Glitch Field with Glitchy Graphics', function () {
		startBattle(['glitchygraphics']);
		battle.makeChoices('move glitchygraphics', 'move splash');
		assert.equal(battle.field.terrain, 'glitchterrain');
		assert(battle.field.terrainState.duration > 0);
	});
});
