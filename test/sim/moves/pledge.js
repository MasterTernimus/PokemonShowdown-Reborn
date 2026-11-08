'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Pledge moves', function () {
	afterEach(function () {
		battle.destroy();
	});

	it(`should execute independently and combine their field effects in move order`, () => {
		battle = common.createBattle({gameType: 'doubles'});
		battle.setPlayer('p1', {team: [
			{species: 'Ninjask', ability: 'noability', moves: ['waterpledge']},
			{species: 'Incineroar', ability: 'noability', moves: ['grasspledge']},
		]});
		battle.setPlayer('p2', {team: [
			{species: 'Garchomp', ability: 'noability', moves: ['waterpledge']},
			{species: 'Mew', ability: 'noability', moves: ['firepledge']},
		]});
		battle.onEvent('CriticalHit', battle.format, false);
		battle.makeChoices('move 1 1, move 1 1', 'move 1 1, move 1 2');

		assert.deepEqual(battle.log.filter(line => line.startsWith('|move|')).map(line => line.split('|')[3]), [
			'Water Pledge', 'Water Pledge', 'Fire Pledge', 'Grass Pledge',
		]);
		assert.deepEqual(battle.log.filter(line => line.startsWith('|-fieldstart|')).map(line => line.split('|')[2]), [
			'Rainbow Terrain', 'Burning Terrain',
		]);
		assert.equal(battle.field.terrain, 'burningterrain');
		assert.false(battle.p2.sideConditions['waterpledge']);
		assert.false(battle.p2.sideConditions['grasspledge']);
	});
});
