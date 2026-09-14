'use strict';

const assert = require('../../assert');
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
const {Learnsets} = require('../../../dist/data/learnsets');

let battle;

describe('Aevian Glacier', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('defines Turtonator-Rejuv and its requested moves', () => {
		assert.equal(Dex.species.get('Turtonator').abilities.S, 'Aevian Glacier');
		const rejuv = Dex.species.get('Turtonator-Rejuv');
		assert.deepEqual(rejuv.types, ['Ice', 'Dragon']);
		assert.deepEqual(rejuv.baseStats, {hp: 80, atk: 115, def: 130, spa: 15, spd: 130, spe: 50});
		assert.equal(rejuv.requiredAbility, 'Aevian Glacier');
		for (const move of ['avalanche', 'dragondance', 'headlongrush', 'mountaingale', 'sheercold', 'wildcharge']) {
			assert(Learnsets.turtonator.learnset[move], `Turtonator should learn ${move}`);
		}
	});

	it('permanently transforms Turtonator and activates all component abilities', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Turtonator', ability: 'Aevian Glacier', moves: ['takedown']},
		], [
			{species: 'Mew', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const turtonator = battle.p1.active[0];
		assert.equal(turtonator.species.id, 'turtonatorrejuv');
		assert(turtonator.hasAbility(['Snow Warning', 'Ice Body', 'Refrigerate']));
		assert(battle.field.isWeather(['hail', 'snow']));
		const move = battle.dex.getActiveMove('takedown');
		battle.runEvent('ModifyType', turtonator, turtonator, move, move);
		assert.equal(move.type, 'Ice');
	});

	it('reverts a directly supplied Rejuv form without Aevian Glacier', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Turtonator-Rejuv', ability: 'Shell Armor', moves: ['takedown']},
		], [
			{species: 'Mew', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		assert.equal(battle.p1.active[0].species.id, 'turtonator');
	});
});
