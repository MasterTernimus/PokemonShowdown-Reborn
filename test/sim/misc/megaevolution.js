'use strict';

const assert = require('./../../assert');
const common = require('./../../common');
const { Format } = require('../../../dist/sim/dex-formats');
const { Dex } = require('../../../dist/sim');

let battle;

describe('Mega Evolution', function () {
	afterEach(function () {
		battle.destroy();
	});

	it('should overwrite normally immutable abilities', function () {
		battle = common.createBattle();
		battle.setPlayer('p1', {team: [
			{species: "Metagross", ability: 'comatose', item: 'metagrossite', moves: ['metalclaw']},
		]});
		battle.setPlayer('p2', {team: [
			{species: "Wishiwashi", ability: 'schooling', moves: ['uturn']},
		]});
		const megaMon = battle.p1.active[0];
		battle.makeChoices('move metalclaw mega', 'move uturn');
		assert.equal(megaMon.ability, 'coldlogic');
		assert.deepEqual(megaMon.getPassives(), ['toughclaws']);
	});

	it('[Hackmons] should be able to override different formes but not same forme', function () {
		battle = common.createBattle([[
			{species: "Charizard-Mega-Y", item: 'charizarditex', moves: ['protect']},
		], [
			{species: "Kangaskhan-Mega", item: 'kangaskhanite', moves: ['protect']},
		]]);
		assert.equal(battle.p1.active[0].species.name, 'Charizard-Mega-Y');
		assert.throws(() => {
			battle.makeChoices('move protect mega', 'move protect mega');
		});
		battle.makeChoices('move protect mega', 'move protect');
		assert.equal(battle.p1.active[0].species.name, 'Charizard-Mega-X');
	});

	it('should happen once', function () {
		battle = common.gen(7).createBattle([[
			{species: "Rayquaza", moves: ['dragondance', 'dragonascent']},
		], [
			{species: "Steelix", moves: ['splash']},
		]]);
		battle.makeChoices('move dragondance mega', 'move splash');
		assert.throws(() => {
			battle.makeChoices('move dragondance mega', 'move splash');
		});
	});

	common.itGen(6, 'should modify speed/priority in gen 7+', () => {
		battle = common.createBattle([[
			{species: 'Metagross', ability: 'prankster', item: 'metagrossite', moves: ['taunt']},
		], [
			{species: 'Wishiwashi', ability: 'prankster', moves: ['glare']},
		]]);

		battle.makeChoices('move taunt mega', 'auto');
		let megaMon = battle.p1.active[0];
		assert.equal(megaMon.status, 'par');

		battle = common.createBattle([[
			{species: 'Garchomp', item: 'garchompite', moves: ['taunt']},
		], [
			{species: 'Jirachi', moves: ['glare']},
		]]);

		battle.makeChoices('move taunt mega', 'auto');
		megaMon = battle.p1.active[0];
		assert.equal(megaMon.status, 'par');

		battle = common.createBattle([[
			{species: 'Metagross', item: 'metagrossite', moves: ['taunt']},
		], [
			{species: 'Jirachi', moves: ['glare']},
		]]);

		battle.makeChoices('move taunt mega', 'auto');
		megaMon = battle.p1.active[0];
		assert.equal(megaMon.status, '');

		battle = common.gen(6).createBattle([[
			{species: 'Metagross', ability: 'prankster', item: 'metagrossite', moves: ['taunt']},
		], [
			{species: 'Wishiwashi', ability: 'prankster', moves: ['glare']},
		]]);

		battle.makeChoices('move taunt mega', 'auto');
		megaMon = battle.p1.active[0];
		assert.equal(megaMon.status, '');

		battle = common.gen(6).createBattle([[
			{species: 'Garchomp', item: 'garchompite', moves: ['taunt']},
		], [
			{species: 'Jirachi', moves: ['glare']},
		]]);

		battle.makeChoices('move taunt mega', 'auto');
		megaMon = battle.p1.active[0];
		assert.equal(megaMon.status, '');
	});

	it('should not break priority', function () {
		battle = common.createBattle();
		battle.setPlayer('p1', {team: [
			{species: "Metagross", ability: 'quickfeet', item: 'metagrossite', moves: ['protect']},
		]});
		battle.setPlayer('p2', {team: [
			{species: "Ninjask", ability: 'quickfeet', moves: ['thunderwave']},
		]});
		const megaMon = battle.p1.active[0];
		battle.makeChoices('move protect mega', 'auto');
		assert.equal(megaMon.status, '');
	});

	describe('Mega Rayquaza', () => {
		const TEAMS = [[{ species: 'Rayquaza', ability: 'Air Lock', moves: ['Dragon Ascent'], evs: { hp: 1 } }],
			[{ species: 'Rayquaza', ability: 'Air Lock', moves: ['Protect'], evs: { hp: 1 } }]];
		function format(mod = 'gen9', extra = []) {
			return new Format({ name: 'Rayquaza clause regression', effectType: 'Format', mod, ruleset: ['Obtainable', 'Team Preview', '+Past', ...extra] });
		}
		for (const gen of [6, 7, 8, 9])common.itGen(gen, 'Mega evolution requires Dragon Ascent', () => {
			battle = common.createBattle({ formatid: format('gen' + gen) }, TEAMS);
			battle.makeChoices();
			assert.equal(battle.p1.active[0].canMegaEvo, 'Rayquaza-Mega');
			assert.false(battle.p2.active[0].canMegaEvo);
			battle.makeChoices('move 1 mega', 'move 1');
			assert.equal(battle.p1.active[0].species.name, 'Rayquaza-Mega');
		});
		for (const rule of ['Mega Rayquaza Clause', '-Rayquaza-Mega', '-Mega'])it('blocks Mega evolution with ' + rule, () => {
			const f = format('gen9', [rule]); assert.legalTeam(TEAMS[0], f);
			assert(Dex.formats.getRuleTable(f).has('megarayquazaclause'));
			battle = common.createBattle({ formatid: f }, TEAMS); battle.makeChoices();
			assert.false(battle.p1.active[0].canMegaEvo);
			assert.throws(() => battle.choose('p1', 'move 1 mega'));
		});
	});
});
