'use strict';

const assert = require('./../assert');
const {Dex} = require('./../../dist/sim/dex');

describe('Arbok custom data', function () {
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
		assert.deepEqual(arbok.abilities, {0: 'Neurotoxin', 1: 'Pattern Shift', H: 'Accumulation'});
		for (const move of requestedMoves) assert(canLearn('Arbok', move), `Arbok should learn ${move}`);
	});

	it('makes Mud Bomb legal for existing learnset users', function () {
		assert(!Dex.moves.get('Mud Bomb').isNonstandard);
		assert.legalTeam([{name: 'Arbok', species: 'Arbok', ability: 'Accumulation', moves: ['Mud Bomb']}], 'gen9randomfield');
		assert.legalTeam([{name: 'Quagsire', species: 'Quagsire', ability: 'Water Absorb', moves: ['Mud Bomb']}], 'gen9randomfield');
	});
});
