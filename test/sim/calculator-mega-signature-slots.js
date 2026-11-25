'use strict';

const assert = require('assert').strict;
const { calculateScenario, validateScenario } = require('../../dist/sim/custom-calculator');

describe('Mega signature moves on imported calculator sets', () => {
	function scenario(species, item, move, slot, field) {
		const foe = { species: 'Mew', ability: 'No Ability' };
		return { format: 'gen9nofieldsinglesgame', field, move, samples: 8, seed: 42,
			actors: [{ species, item, gimmick: 'mega', moves: [slot, 'Protect', 'Tackle', 'Splash'] }, foe, foe, foe] };
	}

	for (const [species, stone, learned, signature, field, log] of [
		['Latias', 'Latiasite', 'Mist Ball', 'Mist Glide', 'dragonsdenterrain', 'Fairy Tale Terrain'],
		['Delphox', 'Delphoxite', 'Mystical Fire', 'Hexfire', 'bewitchedwoodsterrain', 'Mystical aura amplified'],
	]) {
		it(signature + ' uses the learned slot and retains the field interaction', () => {
			const learnedInput = scenario(species, stone, learned, learned, field);
			const namedInput = scenario(species, stone, signature, learned, field);
			const exportedName = scenario(species, stone, learned, signature, field);
			const slotIDs = input => validateScenario(input).actors[0].set.moves.map(s => s.toLowerCase().replace(/ /g, ''));
			assert.deepEqual(slotIDs(namedInput), slotIDs(learnedInput));
			assert.deepEqual(slotIDs(exportedName), slotIDs(learnedInput));
			const a = calculateScenario(learnedInput), b = calculateScenario(namedInput), c = calculateScenario(exportedName);
			assert.deepEqual(b.results, a.results);
			assert.deepEqual(c.results, a.results);
			assert.deepEqual(b.exampleLog, a.exampleLog);
			assert(b.exampleLog.some(line => line.includes('|' + signature + '|')));
			assert(b.exampleLog.some(line => line.includes(log)));
			assert.equal(b.move, signature);
		});
	}

	it('requires the matching Mega form before treating names as the same slot', () => {
		for (const [item, gimmick] of [['Latiasite', ''], ['Latiosite', 'mega']]) {
			const input = scenario('Latias', item, 'Mist Glide', 'Mist Ball', 'dragonsdenterrain');
			input.actors[0].gimmick = gimmick;
			assert.throws(() => validateScenario(input), /selected attack must be in the attacker moveset/);
		}
	});
});
