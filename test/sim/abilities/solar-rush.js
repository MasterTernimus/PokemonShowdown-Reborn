'use strict';
const assert = require('./../../assert');
const common = require('./../../common');
let battle;

describe('Solar Rush', function () {
	afterEach(() => battle?.destroy());

	it('gives Cacturne Scarecrow, Solar Rush, and Storm Drain', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		assert.deepEqual(battle.dex.species.get('Cacturne').abilities, {
			0: 'Scarecrow', 1: 'Solar Rush', H: 'Storm Drain',
		});
		assert.deepEqual(battle.dex.species.get('Cacturne-Alt').abilities,
			battle.dex.species.get('Cacturne').abilities);
	});

	it('combines Sand Rush and Chlorophyll', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Cacturne', ability: 'Solar Rush', moves: ['splash']},
		], [{species: 'Magikarp', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		const cacturne = battle.p1.active[0];
		assert(cacturne.hasAbility('sandrush'));
		assert(cacturne.hasAbility('chlorophyll'));
		battle.field.setWeather('sandstorm', cacturne);
		assert.equal(battle.runEvent('ModifySpe', cacturne, null, null, 100), 200);
		assert.equal(battle.runEvent('Immunity', cacturne, null, null, 'sandstorm'), false);
		battle.field.clearWeather();
		battle.field.setWeather('sunnyday', cacturne);
		assert.equal(battle.runEvent('ModifySpe', cacturne, null, null, 100), 200);
	});
});
