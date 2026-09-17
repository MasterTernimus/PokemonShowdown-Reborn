'use strict';

const assert = require('../../assert');
const common = require('../../common');

let battle;

describe('Lunar Orbit', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('sinks Water Surface when Clefable Mega Evolves and starts Gravity', function () {
		battle = common.createBattle({formatid: 'gen9watersurface'}, [[
			{species: 'Clefable', item: 'clefablite', moves: ['splash']},
		], [
			{species: 'Wynaut', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		assert(battle.field.isTerrain('watersurfaceterrain'));

		battle.makeChoices('move splash mega', 'move splash');

		assert.species(battle.p1.active[0], 'Clefable-Mega');
		assert(battle.field.getPseudoWeather('gravity'));
		assert(battle.field.isTerrain('underwaterterrain'));
	});
});
