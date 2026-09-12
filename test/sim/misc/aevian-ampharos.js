'use strict';

const assert = require('../../assert');
const common = require('../../common');
const {Learnsets} = require('../../../dist/data/learnsets');

describe('Aevian Ampharos', function () {
	let battle;
	afterEach(() => battle?.destroy());

	it('has its requested profile and a distinct Ampharosite Mega Evolution', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame', preview: false}, [[
			{species: 'Ampharos-Aevian', ability: 'Ice Scales', item: 'Ampharosite', moves: ['blizzard']},
		], [
			{species: 'Ampharos', ability: 'Static', item: 'Ampharosite', moves: ['thunderbolt']},
		]]);
		const aevian = battle.p1.active[0];
		const regular = battle.p2.active[0];
		if (!aevian || !regular) battle.makeChoices('team 1', 'team 1');
		const activeAevian = battle.p1.active[0];
		const activeRegular = battle.p2.active[0];
		assert.deepEqual(activeAevian.species.types, ['Ice', 'Electric']);
		assert.deepEqual(activeAevian.species.baseStats, {hp: 110, atk: 75, def: 90, spa: 115, spd: 85, spe: 55});
		assert.deepEqual(activeAevian.species.abilities, {0: 'Ice Scales', 1: 'Fluffy', H: 'Filter'});
		assert.equal(battle.actions.canMegaEvo(activeAevian), 'Ampharos-Aevian-Mega');
		assert.equal(battle.actions.canMegaEvo(activeRegular), 'Ampharos-Mega');
		const mega = battle.dex.species.get('Ampharos-Aevian-Mega');
		assert.deepEqual(mega.types, ['Ice', 'Electric']);
		assert.deepEqual(mega.baseStats, {hp: 110, atk: 95, def: 110, spa: 165, spd: 105, spe: 45});
		assert.equal(mega.abilities[0], 'Wooly Conductor');
		battle.makeChoices('move blizzard mega', 'move thunderbolt mega');
		assert.equal(battle.p1.active[0].species.name, 'Ampharos-Aevian-Mega');
	});

	it('has the supplied move profile', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const learnset = Learnsets.ampharosaevian.learnset;
		for (const move of ['tackle', 'snowscape', 'thunderwave', 'thundershock', 'thunderpunch',
			'icywind', 'iceball', 'blizzard', 'haze', 'auroraveil', 'iciclespear', 'voltswitch']) {
			assert(learnset[move], `Ampharos-Aevian should learn ${move}`);
		}
	});
});
