'use strict';

const assert = require('./../assert');
const common = require('./../common');

let battle;

describe('Custom battle data updates', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('should let Gardevoir shift between Mega forms while a gimmick remains', function () {
		const gardevoir = Dex.species.get('Gardevoir');
		assert.deepEqual(gardevoir.formeOrder, [
			'Gardevoir', 'Gardevoir-Mega', 'Gardevoir-Void-Mega', 'Gardevoir-Mega-Z',
		]);
		assert.false(Dex.species.get('Gardevoir-Void').exists);

		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Gardevoir', ability: 'trace', item: 'gardevoirite', moves: ['splash']},
		], [
			{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');

		const activeGardevoir = battle.p1.active[0];
		assert.equal(activeGardevoir.canMegaEvoX, 'Gardevoir-Mega-Z');
		battle.makeChoices('move splash megax', 'move splash');
		assert.species(activeGardevoir, 'Gardevoir-Mega-Z');
		assert.equal(activeGardevoir.side.gimmickCount, 1);
		assert.equal(activeGardevoir.canMegaEvoY, 'Gardevoir-Void-Mega');

		battle.makeChoices('move splash megay', 'move splash');
		assert.species(activeGardevoir, 'Gardevoir-Void-Mega');
		assert.equal(activeGardevoir.side.gimmickCount, 2);
		assert.false(activeGardevoir.canMegaEvo);
		assert.false(activeGardevoir.canMegaEvoX);
		assert.false(activeGardevoir.canMegaEvoY);
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

	it('should let Perfect Foresight retain arbitrary copied ability effects', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Alakazam-Mega', ability: 'perfectforesight', moves: ['protect']},
		], [
			{species: 'Blaziken', ability: 'speedboost', moves: ['protect']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const alakazam = battle.p1.active[0];
		assert.equal(alakazam.m.perfectForesightAbility, 'speedboost');

		battle.makeChoices('move protect', 'move protect');
		assert.equal(alakazam.boosts.spe, 1);
		battle.destroy();

		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Alakazam-Mega', ability: 'perfectforesight', moves: ['splash']},
		], [
			{species: 'Lapras', ability: 'waterabsorb', moves: ['surf']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const absorber = battle.p1.active[0];
		const startingHP = absorber.hp;
		assert.equal(absorber.m.perfectForesightAbility, 'waterabsorb');

		battle.makeChoices('move splash', 'move surf');
		assert.equal(absorber.hp, startingHP);
		battle.destroy();

		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Alakazam-Mega', ability: 'perfectforesight', nature: 'Relaxed', ivs: {spe: 0}, moves: ['icywind']},
		], [
			{species: 'Garchomp-Mega-Z', ability: 'relentlesshunt', nature: 'Jolly', evs: {spe: 252}, moves: ['dragonpulse']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move icywind', 'move dragonpulse');
		const usedMoves = battle.log.filter(line => line.startsWith('|move|'));
		assert.match(usedMoves[0], /Alakazam.*Icy Wind/);
	});

	it('should make Void Veil and every Gardevoir Mega ability immune to Gravity', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Gardevoir', ability: 'voidveil', moves: ['splash']},
		], [
			{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const gardevoir = battle.p1.active[0];
		battle.field.addPseudoWeather('gravity', gardevoir, battle.dex.moves.get('gravity'));

		for (const ability of ['voidveil', 'royalvoice', 'argentdevotion', 'execution']) {
			gardevoir.setAbility(ability);
			assert.equal(gardevoir.isGrounded(), null, `${ability} should ignore Gravity`);
		}
	});

	it('should reduce status recovery moves to 0.75x healing during Gravity', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Blissey', ability: 'naturalcure', moves: ['recover']},
		], [
			{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const blissey = battle.p1.active[0];
		blissey.hp = Math.floor(blissey.maxhp / 4);
		const startingHP = blissey.hp;
		battle.field.addPseudoWeather('gravity', blissey, battle.dex.moves.get('gravity'));

		battle.makeChoices('move recover', 'move splash');
		assert.equal(blissey.hp - startingHP, Math.floor(blissey.maxhp * 3 / 8));
	});

	it('should grant Ghost resistance after Foresight, Miracle Eye, or Odor Sleuth', function () {
		for (const [move, target] of [
			['foresight', 'Gengar'],
			['miracleeye', 'Umbreon'],
			['odorsleuth', 'Gengar'],
		]) {
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
				{species: 'Alakazam', ability: 'synchronize', moves: [move]},
			], [
				{species: target, ability: 'synchronize', moves: ['splash']},
			]]);
			battle.makeChoices('team 1', 'team 1');
			battle.makeChoices(`move ${move}`, 'move splash');
			const user = battle.p1.active[0];
			const foe = battle.p2.active[0];
			assert(user.volatiles.ghostresistance, `${move} should grant Ghost resistance`);

			const shadowBall = battle.dex.getActiveMove('shadowball');
			assert.equal(battle.runEvent('ModifyDamage', foe, user, shadowBall, 100), 50);
			battle.destroy();
			battle = null;
		}
	});
});
