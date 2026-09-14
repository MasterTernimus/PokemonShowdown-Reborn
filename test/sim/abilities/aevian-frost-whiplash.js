'use strict';

const assert = require('../../assert');
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
const {Learnsets} = require('../../../dist/data/learnsets');

let battle;

describe('Aevian Frost and Whiplash', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('defines Donphan-Rejuv and the requested learnsets', () => {
		assert.equal(Dex.species.get('Donphan').abilities[0], 'Aevian Frost');
		const rejuv = Dex.species.get('Donphan-Rejuv');
		assert.deepEqual(rejuv.types, ['Ice', 'Ground']);
		assert.deepEqual(rejuv.baseStats, {hp: 120, atk: 120, def: 115, spa: 50, spd: 60, spe: 45});
		for (const move of ['avalanche', 'drillpeck', 'iciclecrash', 'mountaingale', 'sheercold']) {
			assert(Learnsets.donphan.learnset[move], `Donphan should learn ${move}`);
		}
		for (const species of ['ambipom', 'cinccino']) {
			for (const move of ['tailslap', 'aquatail', 'poisontail', 'breakingswipe', 'dragontail']) {
				assert(Learnsets[species].learnset[move], `${species} should learn ${move}`);
			}
		}
	});

	it('transforms Donphan and exposes all component abilities', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Donphan', ability: 'Aevian Frost', moves: ['bodyslam']},
		], [{species: 'Mew', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		const donphan = battle.p1.active[0];
		assert.equal(donphan.species.id, 'donphanrejuv');
		assert(donphan.hasAbility(['Ice Body', 'Guts', 'Filter']));
	});

	it('reverts an invalid direct Rejuv form', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Donphan-Rejuv', ability: 'Stamina', moves: ['bodyslam']},
		], [{species: 'Mew', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		assert.equal(battle.p1.active[0].species.id, 'donphan');
	});

	it('boosts every Tail move by 1.5x', () => {
		for (const id of ['doublehit', 'poisontail', 'dragontail', 'irontail', 'aquatail', 'breakingswipe',
			'tailslap', 'slam', 'bodyslam', 'heavyslam', 'flipturn', 'brutalswing']) {
			assert(Dex.moves.get(id).flags.tail, `${id} should be a Tail move`);
		}
		battle = common.createBattle({formatid: 'gen9customgame'}, [[
			{species: 'Mew', ability: 'Whiplash', moves: ['bodyslam']},
		], [{species: 'Mew', ability: 'No Ability', moves: ['splash']}]]);
		const user = battle.p1.active[0];
		const target = battle.p2.active[0];
		assert.equal(battle.runEvent('BasePower', user, target, battle.dex.getActiveMove('bodyslam'), 100), 150);
	});
});
