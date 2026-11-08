'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Illusion', function () {
	afterEach(function () {
		battle.destroy();
	});

	common.itGen(9, `should disguise as the ally with the strongest known pressure`, function () {
		battle = common.gen(9).createBattle([[
			{species: "Zoroark", ability: 'perfectillusion', moves: ['sleeptalk']},
			{species: "Garchomp", moves: ['earthquake']},
			{species: "Blissey", moves: ['softboiled']},
		], [
			{species: "Heatran", moves: ['protect']},
		]]);

		// Opening entry has no opposing active yet; re-entry can evaluate known foes.
		battle.makeChoices('switch 3', 'move protect');
		battle.makeChoices('switch 3', 'move protect');
		assert.equal(battle.p1.active[0].illusion.species.baseSpecies, 'Garchomp');
	});

	common.itGen(8, `should retain Illusion after rejecting an unavailable ordinary Dynamax`, () => {
		battle = common.gen(8).createBattle([[
			{species: "Zoroark", ability: 'illusion', moves: ['sleeptalk']},
			{species: "Diglett", moves: ['sleeptalk']},
		], [
			{species: "Wynaut", moves: ['sleeptalk']},
		]]);

		assert.cantMove(() => battle.choose('p1', 'move sleeptalk dynamax'));
		assert.equal(battle.p1.active[0].illusion.species.id, 'diglett');
		battle.makeChoices('move sleeptalk', 'auto');
		assert(battle.log.every(line => !line.includes('|-end|p1a: Zoroark|Illusion')));
	});

	common.itGen(8, `should prevent the user from Dynamaxed when Illusioning as a Pokemon that cannot Dynamax`, function () {
		battle = common.gen(8).createBattle([[
			{species: "Zoroark", ability: 'illusion', moves: ['sleeptalk']},
			{species: "Eternatus", moves: ['sleeptalk']},
		], [
			{species: "Wynaut", moves: ['sleeptalk']},
		]]);

		assert.cantMove(() => battle.choose('p1', 'move sleeptalk dynamax'));
	});

	common.itGen(8, `should wear off normally after an unavailable Dynamax is rejected`, () => {
		battle = common.gen(8).createBattle([[
			{species: "Zoroark", ability: 'illusion', moves: ['machpunch']},
			{species: "Diglett", moves: ['sleeptalk']},
		], [
			{species: "Wynaut", moves: ['thunderbolt']},
		]]);

		assert.cantMove(() => battle.choose('p1', 'move machpunch dynamax'));
		battle.makeChoices('move machpunch', 'auto');
		assert(battle.log.some(line => line.includes('|-end|p1a: Zoroark|Illusion')));
	});

	common.itGen(9, `should apply direct damage to Zoroark when Illusion breaks`, function () {
		battle = common.gen(9).createBattle({formatid: 'gen9ubers', preview: false}, [[
			{species: "Zoroark", ability: 'illusion', moves: ['tackle']},
			{species: "Garchomp", moves: ['tackle']},
		], [
			{species: "Pikachu", moves: ['tackle']},
		]]);

		const zoroark = battle.p1.active[0];
		const hpBefore = zoroark.hp;
		battle.makeChoices('move tackle', 'move tackle');

		assert(zoroark.hp < hpBefore, 'Zoroark should take the damage that breaks Illusion');
		assert(!zoroark.illusion, 'Illusion should be cleared after direct damage');
		assert(battle.log.some(line => line.includes('|-end|p1a: Zoroark|Illusion')));
	});

	common.itGen(8, `should not gain G-Max eligibility from its disguise`, () => {
		battle = common.gen(8).createBattle([[
			{species: "Zoroark", ability: 'illusion', moves: ['sleeptalk']},
			{species: "Charizard", gigantamax: true, moves: ['ember', 'sleeptalk']},
		], [
			{species: "Wynaut", moves: ['sleeptalk']},
		]]);

		assert.equal(battle.p1.active[0].illusion.species.id, 'charizard');
		assert.false(battle.p1.active[0].getMoveRequestData().canDynamax);
		assert.cantMove(() => battle.choose('p1', 'move sleeptalk dynamax'));
		battle.makeChoices('move sleeptalk', 'auto');
		assert(battle.log.every(line => !line.includes('Gmax')));
	});

	common.itGen(7, `should instantly wear off before using a Z-move`, function () {
		battle = common.gen(7).createBattle([[
			{species: "Zoroark", ability: 'illusion', item: 'fightiniumz', moves: ['machpunch', 'sleeptalk']},
			{species: "Octillery", moves: ['sleeptalk']},
		], [
			{species: "Wynaut", moves: ['sleeptalk']},
		]]);

		battle.makeChoices('move machpunch zmove', 'auto');
		assert(battle.log.some(line => line.includes('|-end|p1a: Zoroark|Illusion')));
	});
});
