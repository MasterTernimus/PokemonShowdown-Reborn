'use strict';

const assert = require('./../assert');
const common = require('./../common');

let battle;

describe('Custom battle data updates', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('should let Gardevoir shift between Mega forms while a gimmick remains', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Gardevoir', ability: 'trace', item: 'gardevoirite', moves: ['splash']},
		], [
			{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');

		const gardevoir = battle.p1.active[0];
		assert.equal(gardevoir.canMegaEvoX, 'Gardevoir-Mega-Z');
		battle.makeChoices('move splash megax', 'move splash');
		assert.species(gardevoir, 'Gardevoir-Mega-Z');
		assert.equal(gardevoir.side.gimmickCount, 1);
		assert.equal(gardevoir.canMegaEvoY, 'Gardevoir-Void-Mega');

		battle.makeChoices('move splash megay', 'move splash');
		assert.species(gardevoir, 'Gardevoir-Void-Mega');
		assert.equal(gardevoir.side.gimmickCount, 2);
		assert.false(gardevoir.canMegaEvo);
		assert.false(gardevoir.canMegaEvoX);
		assert.false(gardevoir.canMegaEvoY);
	});

	it('should keep Rapid Response and Violent Rush for the entire first active turn only', function () {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species: 'Rapidash', ability: 'rapidresponse', moves: ['protect']},
			{species: 'Bouffalant', ability: 'violentrush', moves: ['protect']},
		], [
			{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
			{species: 'Feebas', ability: 'swiftswim', moves: ['splash']},
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');

		const rapidash = battle.p1.active[0];
		const bouffalant = battle.p1.active[1];
		const firstTurnSpA = rapidash.getStat('spa');
		const firstTurnAtk = bouffalant.getStat('atk');
		rapidash.activeTurns = 2;
		bouffalant.activeTurns = 2;
		assert(firstTurnSpA > rapidash.getStat('spa'));
		assert(firstTurnAtk > bouffalant.getStat('atk'));
	});

	it('should expose the requested stats, abilities, moves, and removed Splinter condition', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const dex = battle.dex;
		assert.deepEqual(dex.species.get('Kingler').baseStats, {hp: 80, atk: 140, def: 125, spa: 60, spd: 60, spe: 85});
		assert.deepEqual(dex.species.get('Kingler-Gmax').baseStats, {hp: 120, atk: 140, def: 125, spa: 60, spd: 60, spe: 85});
		assert.equal(dex.species.get('Yanmega').abilities.H, 'Compound Eyes');
		assert.equal(dex.species.get('Starmie-Mega').baseStats.atk, 100);
		assert.equal(dex.moves.get('Needle Arm').basePower, 100);
		assert.equal(dex.moves.get('Meteor Mash').basePower, 100);
		assert.equal(dex.moves.get('Meteor Mash').secondary.chance, 30);
		assert.false(dex.conditions.get('splinter').exists);

		const kinglerMoves = dex.species.getLearnsetData('kingler').learnset;
		for (const move of ['bodypress', 'clamp', 'flipturn', 'quickguard', 'tripledive']) {
			assert(kinglerMoves[move], `Kingler should learn ${move}`);
		}
		assert.false(dex.species.getLearnsetData('noivern').learnset.torchsong);
		assert.false(dex.species.getLearnsetData('decidueye').learnset.ceaselessedge);
		assert.false(dex.species.getLearnsetData('decidueyehisui').learnset.ceaselessedge);
	});
});
