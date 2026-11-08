'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Max Guard', function () {
	afterEach(function () {
		battle.destroy();
	});

	it('should be disallowed by Taunt', function () {
		battle = common.createBattle([[
			{ species: "Feebas", moves: ['maxguard', 'tackle'] },
		], [
			{species: "Wynaut", moves: ['taunt', 'splash']},
		]]);
		assert.false(battle.p1.active[0].getMoves().find(move => move.id === 'maxguard').disabled);
		battle.makeChoices('move tackle', 'auto');
		assert.cantMove(() => battle.choose('p1', 'move maxguard'), 'Feebas', 'Max Guard', true);
	});

	it('should allow Feint to damage the user, but not break the protection effect', function () {
		battle = common.createBattle({ gameType: 'doubles' }, [[
			{ species: 'minun', moves: ['maxguard'] },
			{species: 'plusle', moves: ['sleeptalk']},
		], [
			{species: 'wynaut', ability: 'noguard', moves: ['fissure']},
			{species: 'wynaut', moves: ['feint']},
		]]);
		// Test the protection effect directly; persistent G-Max disables protection moves.
		battle.makeChoices('move maxguard, move sleeptalk', 'move fissure 1, move feint 1');

		const minun = battle.p1.active[0];
		assert.false.fainted(minun);
		assert(minun.hp < minun.maxhp, 'Feint should damage the protected target');
		assert(battle.log.some(line => line.includes('|-activate|p1a: Minun|move: Max Guard')));
	});

	it('should block certain moves that bypass Protect', function () {
		battle = common.createBattle({ gameType: 'doubles' }, [[
			{ species: 'sunflora', item: 'sitrusberry', ability: 'minus', moves: ['maxguard'] },
			{species: 'plusle', ability: 'plus', moves: ['magneticflux', 'gearup']},
		], [
			{species: 'ferrothorn', item: 'sitrusberry', moves: ['flowershield', 'teatime']},
			{species: 'tsareena', ability: 'intrepidsword', moves: ['psychup', 'sleeptalk']},
		]]);

		battle.makeChoices('move maxguard, move magneticflux', 'move flowershield, move psychup 1');
		const sunflora = battle.p1.active[0];
		const tsareena = battle.p2.active[1];
		assert.statStage(sunflora, 'def', 0, 'should block magneticflux and flowershield');
		assert.statStage(sunflora, 'spd', 0, 'should block magneticflux');
		assert.statStage(tsareena, 'atk', 1, 'should not have changed from +1 (intrepidsword) to 0 (psychup)');

		sunflora.volatiles.stall.counter = 1;
		battle.makeChoices('move maxguard, move gearup', 'move teatime, move sleeptalk');
		assert.statStage(sunflora, 'atk', 0, 'should block gearup');
		assert.statStage(sunflora, 'spa', 0, 'should block gearup');
		assert.equal(sunflora.item, 'sitrusberry', 'should block teatime');
		assert.statStage(tsareena, 'atk', 1);
	});
});
