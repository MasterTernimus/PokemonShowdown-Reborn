'use strict';

const assert = require('./../assert');
const common = require('./../common');

let battle;

describe('Feraligatr custom data', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('uses the requested base, Mega, and G-Max stats and learnset cleanup', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Feraligatr', moves: ['splash']},
		], [
			{species: 'Wynaut', moves: ['splash']},
		]]);
		const feraligatr = battle.dex.species.get('Feraligatr');
		const mega = battle.dex.species.get('Feraligatr-Mega');
		const gmax = battle.dex.species.get('Feraligatr-Gmax');
		assert.deepEqual(feraligatr.baseStats, {hp: 100, atk: 109, def: 100, spa: 59, spd: 93, spe: 78});
		assert.deepEqual(mega.baseStats, {hp: 100, atk: 164, def: 125, spa: 59, spd: 108, spe: 83});
		assert.deepEqual(gmax.baseStats, {hp: 150, atk: 109, def: 100, spa: 59, spd: 93, spe: 78});
		assert.equal(feraligatr.canGigantamax, 'G-Max Death Roll');
		assert.equal(gmax.abilities[0], 'Tidal Jaw');

		const learnset = battle.dex.data.Learnsets.feraligatr.learnset;
		for (const move of ['agility', 'chillingwater', 'breakingswipe', 'detect', 'flipturn', 'razorshell', 'trailblaze', 'fishiousrend']) {
			assert(move in learnset, `Feraligatr should learn ${move}`);
		}
		for (const move of ['firefang', 'thunderfang', 'poisonfang']) {
			assert(!(move in learnset), `Feraligatr should not learn ${move}`);
		}
		const inheritedLearnset = new Set();
		for (const entry of battle.dex.species.getFullLearnset('feraligatrgmax')) {
			for (const move of Object.keys(entry.learnset || {})) inheritedLearnset.add(move);
		}
		assert(inheritedLearnset.has('flipturn'), 'Feraligatr-Gmax should inherit Feraligatr moves');
		assert(inheritedLearnset.has('trailblaze'), 'Feraligatr-Gmax should inherit custom Feraligatr moves');
		assert(!inheritedLearnset.has('firefang'), 'Feraligatr-Gmax should inherit fang removals');
		assert(!inheritedLearnset.has('gmaxdeathroll'), 'G-Max Death Roll should be a battle-time signature move');
	});

	it('selects the fixed-power physical G-Max Death Roll and keeps its double-battle target', function () {
		battle = common.createBattle({formatid: 'gen9doublesmistyfieldadrienn'}, [[
			{species: 'Feraligatr', gigantamax: true, moves: ['bite']},
			{species: 'Wynaut', moves: ['splash']},
		], [
			{species: 'Wynaut', moves: ['splash']},
			{species: 'Wynaut', moves: ['splash']},
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');
		const feraligatr = battle.p1.active[0];
		const move = battle.actions.getMaxMove(battle.dex.moves.get('bite'), feraligatr);
		assert.equal(move.id, 'gmaxdeathroll');
		assert.equal(move.basePower, 140);
		assert.equal(move.category, 'Physical');
		assert.equal(move.accuracy, true);
		assert.equal(move.target, 'allAdjacentFoes');
		assert.equal(move.secondaries[0].chance, 30);
		battle.makeChoices('move bite dynamax, move splash', 'move splash, move splash');
		assert.species(feraligatr, 'Feraligatr-Gmax');
		assert.equal(feraligatr.ability, 'tidaljaw');
		assert(feraligatr.hasAbility('strongjaw'));
		assert(feraligatr.hasAbility('swiftswim'));
		assert(feraligatr.hasAbility('filter'));
		assert(battle.log.some(line => line.includes('G-Max Death Roll')));
	});
});
