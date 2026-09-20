'use strict';

const assert = require('assert').strict;
const common = require('../common');
const {Dex} = require('../../dist/sim');

let battle;
describe('Golisopod-Aevian', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('is a separate regional choice with the requested data and exact move list', () => {
		const regional = Dex.species.get('Golisopod-Aevian');
		const standard = Dex.species.get('Golisopod');
		assert(regional.exists && regional.standalone);
		assert.equal(regional.baseSpecies, 'Golisopod-Aevian');
		assert.deepEqual(regional.types, ['Bug', 'Ground']);
		assert.deepEqual(regional.baseStats, {hp: 75, atk: 125, def: 130, spa: 50, spd: 100, spe: 50});
		assert.equal(regional.bst, 530);
		assert.deepEqual(regional.abilities, {'0': 'Battle Armor', '1': 'Skill Link', H: 'Sand Stream'});
		assert.equal(regional.tier, 'OU');
		assert.deepEqual(standard.types, ['Bug', 'Water']);
		assert(standard.otherFormes.includes('Golisopod-Mega'));
		assert(!standard.otherFormes.includes('Golisopod-Aevian'));

		const moves = Dex.data.Learnsets.golisopodaevian.learnset;
		assert.equal(Object.keys(moves).length, 78);
		assert.equal(Dex.species.getFullLearnset(regional.id).length, 1);
		for (const moveid of ['arenitewall', 'bonemerang', 'headlongrush', 'pinmissile', 'xscissor']) {
			assert.deepEqual(moves[moveid], ['9M']);
		}
		for (const moveid of Object.keys(moves)) assert(Dex.moves.get(moveid).exists, moveid);
		assert(!moves.liquidation);
	});

	it('sets sand on entry and uses Skill Link for five Pin Missile hits', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Golisopod-Aevian', ability: 'Sand Stream', moves: ['pinmissile']},
		], [{species: 'Regirock', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		assert.equal(battle.p1.active[0].species.id, 'golisopodaevian');
		assert(battle.field.isWeather('sandstorm'));
		battle.destroy();
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Golisopod-Aevian', ability: 'Skill Link', moves: ['pinmissile']},
		], [{species: 'Regirock', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move pinmissile', 'move splash');
		assert(battle.log.some(line => line.startsWith('|-hitcount|') && line.endsWith('|5')), battle.log.join('\n'));
	});
});
