'use strict';
const assert = require('assert').strict;
const { calculateScenario, calculatorMetadata } = require('../../dist/sim/custom-calculator');
const { Dex } = require('../../dist/sim/dex');
function scenario(ability = 'No Ability', move = 'Tackle') {
	return { format: 'gen9nofieldsinglesgame', move, samples: 8, seed: 42,
		actors: [{ species: 'Mew', ability }, { species: 'Mew', ability: 'No Ability' },
			{ species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }] };
}
describe('Approved signature calculator parity', () => {
	it('exposes complete composite metadata and approved stats', () => {
		const metadata = calculatorMetadata();
		assert.deepEqual(metadata.abilityComponents.duskdrive, ['Battle Fervor', 'Precision', 'Opportunist']);
		assert(metadata.abilityComponents.atrocity.includes('Tough Claws'));
		assert(!metadata.abilityComponents.atrocity.includes('Levitate'));
		assert.deepEqual(metadata.abilityComponents.cinderscales, ['Flame Body', 'Swarm', 'Shield Dust']);
		assert.equal(Dex.species.get('magcargo').bst, 540);
	});
	it('calculates Grounding Tail against Ground without bypassing absorption', () => {
		const s = scenario('No Ability', 'Thunderbolt'); s.actors[1].species = 'Quagsire';
		assert.equal(calculateScenario(s).results[1].max, 0);
		s.actors[0].ability = 'Grounding Tail'; assert(calculateScenario(s).results[1].max > 0);
		s.actors[1].ability = 'Volt Absorb'; assert.equal(calculateScenario(s).results[1].max, 0);
	});
	it('uses Frozen Feast bite power without inventing immediate healing or Speed input', () => {
		const base = calculateScenario(scenario('No Ability', 'Bite')).results[1];
		const boosted = calculateScenario(scenario('Frozen Feast', 'Bite')).results[1];
		assert(boosted.max > base.max * 1.4);
	});
	it('calculates Double Shock through the existing Iron Fist implementation', () => {
		const s = scenario('No Ability', 'Double Shock'); s.actors[0].species = 'Raichu';
		const base = calculateScenario(s).results[1]; s.actors[0].ability = 'Iron Fist';
		const boosted = calculateScenario(s).results[1]; assert(boosted.max > base.max * 1.3);
	});
	it('calculates Atrocity as grounded while preserving other damage effects', () => {
		const s = scenario('No Ability', 'Earthquake');
		s.actors[1] = { species: 'Charizard-Mega-X', ability: 'Atrocity' };
		assert(calculateScenario(s).results[1].max > 0);
	});
});
