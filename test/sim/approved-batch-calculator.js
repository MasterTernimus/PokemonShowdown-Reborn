'use strict';
const assert = require('assert').strict;
const { calculateScenario, calculatorMetadata } = require('../../dist/sim/custom-calculator');
const { Dex } = require('../../dist/sim');
function scenario(move, item = '', field = '') {
	return { format: 'gen9nofieldsinglesgame', move, samples: 8, seed: 42, field,
		actors: Array.from({ length: 4 }, (_, i) => ({ species: 'Mew', ability: 'No Ability', item: i ? '' : item })) };
}
describe('Approved field/passive batch calculator parity', () => {
	for (const move of ['Ion Deluge', 'Plasma Fists']) for (const [item, turns] of [['', 3], ['Amplifield Rock', 5]]) {
		it(move + ' reports Aura-only creation for ' + turns + ' turns', () => {
			const result = calculateScenario(scenario(move, item));
			assert(result.exampleLog.some(line => line.includes('Electric Aura|[aura] ' + turns)));
			assert(!result.exampleLog.some(line => line.includes('|-fieldstart|') && /Electric Terrain|electricterrain/.test(line)));
		});
	}
	it('Neutralization ignores status hits but keeps its one-stage damaging-hit drop', () => {
		const input = scenario('Confuse Ray'); input.actors[0].ability = 'Neutralization';
		assert(!calculateScenario(input).exampleLog.some(line => line.startsWith('|-unboost|')));
		input.move = 'Tackle';
		assert(calculateScenario(input).exampleLog.some(line => line.includes('|-unboost|') && line.endsWith('|atk|1')));
	});
	it('publishes every approved replacement with its unchanged passive', () => {
		const metadata = calculatorMetadata();
		for (const r of require('./abilities/approved-passive-replacements.json')) {
			const row = metadata.species.find(s => Dex.species.get(s.name).id === r.id);
			assert.equal(row.abilities[r.slot], r.after, r.id);
			assert.deepEqual(row.passives, Dex.species.get(r.id).passives);
		}
	});
	it('runs the newly selected Tinted Lens through actual damage calculation', () => {
		const input = scenario('Flamethrower');
		input.actors[0] = { species: 'Butterfree', ability: 'No Ability' };
		input.actors[1] = { species: 'Vaporeon', ability: 'No Ability' };
		const plain = calculateScenario(input).results[1]; input.actors[0].ability = 'Tinted Lens';
		const boosted = calculateScenario(input).results[1];
		assert(boosted.min >= plain.min * 1.9); assert(boosted.max >= plain.max * 1.9);
	});
});
