'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Silken Decoy', function () {
	afterEach(() => battle?.destroy());

	for (const move of ['Nuzzle', 'Acid Spray', 'Fake Out']) {
		it(`blocks ${move}'s secondary effect with the absorbed hit`, function () {
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
				{species: 'Ariados', ability: 'Insomnia', item: 'Aridiate', moves: ['Splash']},
			], [{species: 'Mew', moves: [move, 'Splash']}]]);
			battle.makeChoices('team 1', 'team 1');
			const mon = battle.p1.active[0];
			assert.false.hurts(mon, () => battle.makeChoices('move splash mega', 'move 1'));
			assert.equal(mon.status, '');
			assert.equal(mon.boosts.spd, 0);
			assert.false(battle.log.some(line => line.includes('|cant|') && line.includes('flinch')));
			if (move === 'Nuzzle') {
				battle.makeChoices('move splash', 'move 1');
				assert.equal(mon.status, 'par');
			}
		});
	}

	it('blocks status moves without spending the cocoon and includes Swarm', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Ariados', ability: 'Insomnia', item: 'Aridiate', moves: ['Splash']},
		], [{species: 'Mew', moves: ['Will-O-Wisp', 'Thunder Wave']}]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move 1');
		const mon = battle.p1.active[0];
		battle.makeChoices('move splash', 'move 2');
		assert.equal(mon.status, '');
		assert(mon.m.silkenDecoyCocoon);
		assert(mon.hasAbility('swarm'));
		assert.equal(battle.dex.species.get('Ariados').baseStats.hp, 80);
		const move = battle.dex.getActiveMove('bugbuzz');
		mon.hp = 1;
		assert.equal(battle.runEvent('ModifySpA', mon, battle.p2.active[0], move, 100), 150);
	});

	it('Mega Ariados starts with a cocoon and blocks the rest of a multi-hit move', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Ariados', ability: 'Neutralization', item: 'Aridiate', moves: ['Splash']},
		], [
			{species: 'Cloyster', moves: ['Icicle Spear']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const ariados = battle.p1.active[0];

		assert.false.hurts(ariados, () => battle.makeChoices('move splash mega', 'move iciclespear'));
		assert.species(ariados, 'Ariados-Mega');
		assert.equal(ariados.ability, 'silkendecoy');
		assert.false(ariados.m.silkenDecoyCocoon);
		assert.false(ariados.abilityState.silkenDecoyCocoon);
		assert(battle.log.some(line => line.includes("Silken Decoy spun a protective cocoon")));
		assert(battle.log.some(line => line.includes("protective cocoon blocked the hit")));
	});

	it('remembers an unused cocoon through switching', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Ariados', ability: 'Neutralization', item: 'Aridiate', moves: ['Splash']},
			{species: 'Magikarp', moves: ['Splash']},
		], [
			{species: 'Magikarp', moves: ['Splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');

		const ariados = battle.p1.active[0];
		assert.species(ariados, 'Ariados-Mega');
		assert(ariados.m.silkenDecoyCocoon);
		assert.equal(battle.log.filter(line => line.includes("Silken Decoy spun a protective cocoon")).length, 1);
	});

	it('does not restore a spent cocoon after switching', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Ariados', ability: 'Neutralization', item: 'Aridiate', moves: ['Splash']},
			{species: 'Magikarp', moves: ['Splash']},
		], [
			{species: 'Cloyster', moves: ['Icicle Spear', 'Splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move iciclespear');
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');

		const ariados = battle.p1.active[0];
		assert.species(ariados, 'Ariados-Mega');
		assert.false(ariados.m.silkenDecoyCocoon);
		assert.false(ariados.abilityState.silkenDecoyCocoon);
		assert.equal(battle.log.filter(line => line.includes("Silken Decoy spun a protective cocoon")).length, 1);
	});
});
