'use strict';

const assert = require('./../assert');
const common = require('./../common');
const {Dex} = require('./../../dist/sim/dex');

let battle;

describe('Arbok custom data', function () {
	afterEach(function () {
		battle?.destroy();
		battle = undefined;
	});

	const requestedMoves = [
		'nastyplot', 'psychicfangs', 'scaleshot', 'lashout', 'trailblaze', 'skittersmack',
		'throatchop', 'stompingtantrum', 'mudbomb', 'earthpower', 'flamethrower', 'fireblast',
		'overheat', 'heatwave', 'flameburst', 'fierydance', 'burningjealousy', 'firespin', 'firelash',
	];

	function canLearn(species, move) {
		return Dex.species.getFullLearnset(species).some(data => data.learnset[move]?.length);
	}

	it('uses the requested typing, stats, abilities, and moves', function () {
		const arbok = Dex.species.get('Arbok');
		assert.deepEqual(arbok.types, ['Poison']);
		assert.deepEqual(arbok.baseStats, {hp: 80, atk: 95, def: 90, spa: 65, spd: 90, spe: 80});
		assert.deepEqual(arbok.abilities, {0: 'Intimidate', 1: 'Shed Skin', H: 'Accumulation'});
		for (const move of requestedMoves) assert(canLearn('Arbok', move), `Arbok should learn ${move}`);
	});

	it('adds Arbok-Mega-X and Arbokite with the requested composite ability', function () {
		const arbok = Dex.species.get('Arbok');
		const mega = Dex.species.get('Arbok-Mega-X');
		const arbokite = Dex.items.get('Arbokite');
		assert.deepEqual(arbok.otherFormes, ['Arbok-Mega-X', 'Arbok-Mega-Y']);
		assert.deepEqual(mega.types, ['Poison', 'Dark']);
		assert.deepEqual(mega.baseStats, {hp: 80, atk: 130, def: 100, spa: 60, spd: 140, spe: 90});
		assert.equal(mega.bst, 600);
		assert.deepEqual(mega.abilities, {0: 'Neurotoxin'});
		assert.equal(mega.requiredItem, 'Arbokite');
		assert.deepEqual(arbokite.megaStone, {Arbok: 'Arbok-Mega-X'});
		assert.equal(Dex.abilities.get('Neurotoxin').name, 'Neurotoxin');
		assert(!Dex.abilities.get('Neurotoxin').onStart, 'Neurotoxin should not retain Intimidate');
		const megaY = Dex.species.get('Arbok-Mega-Y');
		assert.deepEqual(megaY.types, ['Poison', 'Fire']);
		assert.deepEqual(megaY.baseStats, {hp: 80, atk: 65, def: 110, spa: 135, spd: 90, spe: 120});
		assert.equal(megaY.bst, 600);
		assert.deepEqual(megaY.abilities, {0: 'Pattern Shift'});
		assert.equal(megaY.requiredItem, 'Arbokite');
	});

	it('Mega Evolves with Arbokite and applies Hydra Bond and Regenerator', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Arbok', item: 'Arbokite', moves: ['tackle']},
		], [
			{species: 'Mew', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const arbok = battle.p1.active[0];
		assert.equal(arbok.canMegaEvo, 'Arbok-Mega-X');
		battle.makeChoices('move tackle mega', 'move splash');
		assert.species(arbok, 'Arbok-Mega-X');
		assert.equal(arbok.ability, 'neurotoxin');
		assert(arbok.hasAbility('strongjaw'));
		assert(arbok.hasAbility('shedskin'));
		assert(arbok.hasAbility('hydrabond'));
		assert(arbok.hasAbility('regenerator'));
		assert(battle.log.some(line => line.startsWith('|-hitcount|') && line.endsWith('|3')));
	});

	it('exposes Mega Arbok Y through the shared Arbokite selector', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Arbok', item: 'Arbokite', moves: ['tackle']},
		], [
			{species: 'Mew', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const arbok = battle.p1.active[0];
		assert.equal(arbok.canMegaEvoY, 'Arbok-Mega-Y');
		battle.makeChoices('move tackle megay', 'move splash');
		assert.species(arbok, 'Arbok-Mega-Y');
		assert.equal(arbok.ability, 'patternshift');
		assert(arbok.hasAbility('protean'));
		assert(arbok.hasAbility('shedskin'));
		assert(arbok.hasAbility('unaware'));
	});

	it('makes Mud Bomb legal for existing learnset users', function () {
		assert(!Dex.moves.get('Mud Bomb').isNonstandard);
		assert.legalTeam([{name: 'Arbok', species: 'Arbok', ability: 'Accumulation', moves: ['Mud Bomb']}], 'gen9randomfield');
		assert.legalTeam([{name: 'Quagsire', species: 'Quagsire', ability: 'Water Absorb', moves: ['Mud Bomb']}], 'gen9randomfield');
	});
});
