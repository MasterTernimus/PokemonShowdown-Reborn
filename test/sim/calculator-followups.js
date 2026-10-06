'use strict';

const assert = require('assert').strict;

const { calculateScenario, validateScenario, buildCalculatorBattle, calculatorMetadata } = require('../../dist/sim/custom-calculator');

function scenario() {
	return { format: 'gen9nofieldsinglesgame', move: 'Tackle', samples: 8, seed: 42, actors: Array.from({ length: 4 }, () => ({ species: 'Mew', ability: 'No Ability' })) };
}

describe('Approved calculator ability followups', () => {
	for (const hp of [100, 50])
		for (const move of ['Tackle', 'Shadow Ball'])
			it(`uses Shadow Shield at ${hp}% against ${move}`, () => {
				const s = scenario();
				s.move = move;
				s.actors[1].hpPercent = hp;
				const base = calculateScenario(s).results[1];
				s.actors[1].ability = 'Shadow Shield';
				const reduced = calculateScenario(s).results[1];
				const mult = move === 'Shadow Ball' ? 0.6 : 0.8;
				assert(Math.abs(reduced.min - base.min * mult) < 2);
				assert(Math.abs(reduced.max - base.max * mult) < 2);
			});

	it('resolves Voidcraft and exposes new Exalt components', () => {
		const s = scenario();
		s.actors[1].ability = 'Shadow Guard';
		assert.equal(calculateScenario(s).resolved.actors[1].ability, 'Voidcraft');

		const m = calculatorMetadata();
		assert.deepEqual(m.abilityComponents.exalt, ['Defiant', 'Sharpness', 'Mold Breaker']);
		assert(m.abilityComponents.voidcraft.includes('Shadow Shield'));
		assert(!m.abilityComponents.shadowguard);
	});

	it('Exalt boosts Steel Wing without globally changing it', () => {
		const s = scenario();
		s.move = 'Steel Wing';
		const base = calculateScenario(s).results[1];
		s.actors[0].ability = 'Exalt';
		const boosted = calculateScenario(s).results[1];
		assert(boosted.max > base.max * 1.4);
	});

	it('retains fresh-entry calculator semantics for Spent Force', () => {
		const s = scenario();
		s.actors[0].species = 'Slaking';
		const base = calculateScenario(s);
		s.actors[0].ability = 'Spent Force';
		const full = calculateScenario(s);
		assert.deepEqual(full.results, base.results);
		assert(full.assumptions.some(a => a.includes('fresh-entry')));
	});

	for (const species of ['Mr. Mime', 'Mr. Mime-Galar'])
		it(`calculates ${species} Core transformation`, () => {
			const s = scenario();
			Object.assign(s.actors[0], { species, ability: '', item: 'Anomaly Core', gimmick: 'mega' });
			assert.equal(calculateScenario(s).resolved.actors[0].species, 'Mr. Mime-Pulse');
		});

	for (const species of ['Muk', 'Swalot'])
		it(`calculates ${species} Pulse entry field`, () => {
			const s = scenario();
			Object.assign(s.actors[0], { species, ability: '', item: 'Anomaly Core', gimmick: 'mega' });
			const { battle } = buildCalculatorBattle(validateScenario(s), 0);
			try {
				assert.equal(battle.field.terrain, species === 'Muk' ? 'swampterrain' : 'murkwatersurfaceterrain');
				assert.equal(battle.field.terrainState.duration, 5);
			} finally {
				battle.destroy();
			}
		});
});
