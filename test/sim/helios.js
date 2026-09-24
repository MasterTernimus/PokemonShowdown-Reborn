'use strict';

const assert = require('../assert');
const common = require('../common');

describe('Helios', function () {
	let battle;
	afterEach(() => battle?.destroy());

	function setup(opponentMoves = ['splash']) {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Gyarados-Aevian', ability: 'multiscale', item: 'Gyaradosite', moves: ['splash', 'earthquake']},
		], [
			{species: 'Eelektross', ability: 'levitate', moves: opponentMoves},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		const gyarados = battle.p1.active[0];
		assert.equal(gyarados.species.name, 'Gyarados-Aevian-Mega');
		assert.equal(gyarados.ability, 'helios');
		return gyarados;
	}

	it('summons sun, ignores Levitate, and doubles Speed in rain', function () {
		const gyarados = setup();
		assert.equal(battle.field.weather, 'sunnyday');
		const foe = battle.p2.active[0];
		battle.makeChoices('move earthquake', 'move splash');
		assert(foe.hp < foe.maxhp);
		const clearSpeed = gyarados.getStat('spe');
		battle.field.setWeather('raindance', gyarados);
		assert.equal(gyarados.getStat('spe'), clearSpeed * 2);
	});

	it('raises Special Attack when damage crosses half HP', function () {
		const gyarados = setup(['splash', 'seismictoss']);
		gyarados.hp = Math.floor(gyarados.maxhp / 2) + 10;
		battle.makeChoices('move splash', 'move seismictoss');
		assert.equal(gyarados.boosts.spa, 1);
	});
});
