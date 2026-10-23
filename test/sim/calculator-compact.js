'use strict';
const assert = require('assert').strict;
const { calculatorMetadata, validateScenario, buildCalculatorBattle, calculateScenario } = require('../../dist/sim/custom-calculator');
const { Terrains } = require('../../dist/data/terrains');
function input(extra = {}) { return { format: 'gen9nofieldsinglesgame', move: 'Thunderbolt', samples: 8, seed: 42, actors: Array.from({ length: 4 }, () => ({ species: 'Mew', ability: 'No Ability' })), ...extra }; }
describe('Compact calculator engine state', function () {
	this.timeout(30000);
	it('selects every registered field and passes it to the simulator', () => {
		const meta = calculatorMetadata();
		for (const id of Object.keys(Terrains))assert(meta.fields.some(f => f.id === id));
		for (const field of meta.fields) {
			const { battle } = buildCalculatorBattle(validateScenario(input({ field: field.id })), 0);
			try {
				assert.equal(battle.field.terrain, field.id === 'adriennterrain' ? 'mistyterrain' : field.id);
				if (field.id === 'adriennterrain')assert(battle.field.terrainStack.some(s => s.id === 'fairytaleterrain'));
			} finally {
				battle.destroy();
			}
		}
	});
	for (const [field, key, max] of [['shortcircuitterrain', 'shortCircuit', 4], ['crystalcavernterrain', 'crystalCavern', 3]])it('uses every ' + field + ' cycle position', () => {
		for (let i = 0;
			i <= max;
			i++) {
			const result = calculateScenario(input({ field, fieldState: { [key]: i }, move: key === 'shortCircuit' ? 'Thunderbolt' : 'Power Gem' }));
			assert.equal(result.resolved.fieldState[key], i);
			assert(result.results[1].max > 0);
		}assert.throws(() => validateScenario(input({ fieldState: { [key]: max + 1 } })), /integer/);
	});
	it('applies independent sides and room conditions without duplicating legacy screens', () => {
		const { battle } = buildCalculatorBattle(validateScenario(input({ screens: ['reflect'], sideConditions: [['lightscreen', 'tailwind'], ['auroraveil']], rooms: ['gravity', 'magicroom', 'wonderroom', 'trickroom'] })), 0);
		try {
			assert(battle.p1.sideConditions.lightscreen);
			assert(battle.p1.sideConditions.tailwind);
			assert(battle.p2.sideConditions.auroraveil);
			assert(!battle.p2.sideConditions.reflect);
			for (const room of ['gravity', 'magicroom', 'wonderroom', 'trickroom'])assert(battle.field.pseudoWeather[room]);
		} finally {
			battle.destroy();
		}
	});
	for (const aura of calculatorMetadata().auras)it('applies ' + aura.name + ' separately from its base field', () => {
		const r = calculateScenario(input({ field: 'forestterrain', aura: aura.id }));
		assert.equal(r.resolved.field, 'forestterrain');
		assert.equal(r.resolved.aura, aura.id);
	});
	it('round trips legacy defender screens', () => {
		const { battle } = buildCalculatorBattle(validateScenario(input({ screens: ['reflect'] })), 0);
		try {
			assert(battle.p2.sideConditions.reflect);
		} finally {
			battle.destroy();
		}
	});
	it('rejects fabricated state and side conditions', () => {
		assert.throws(() => validateScenario(input({ rooms: ['invented'] })));
		assert.throws(() => validateScenario(input({ sideConditions: [[], ['protect']] })));
		assert.throws(() => validateScenario(input({ fieldState: { unrestricted: 9 } })));
	});
	for (const field of ['forestterrain', 'underwaterterrain', 'newworldterrain', 'shortcircuitterrain', 'crystalcavernterrain', 'flowergarden5', 'coldeclipseterrain', 'midnightzoneterrain', 'bewitchedwoodsterrain', 'volcanicterrain'].filter(f => Object.keys(Terrains).includes(f)))it('matches direct engine damage on ' + field, () => {
		const raw = input({ field }), scenario = validateScenario(raw), expected = [];
		for (let i = 0;
			i < 8;
			i++) {
			const { battle, mons } = buildCalculatorBattle(scenario, i);
			try {
				const hp = mons[1].hp;
				battle.actions.runMove(scenario.move, mons[0], mons[0].getLocOf(mons[1]));
				expected.push(hp - mons[1].hp);
			} finally {
				battle.destroy();
			}
		} const r = calculateScenario(raw).results[1];
		assert.equal(r.minNetLoss, Math.min(...expected));
		assert.equal(r.maxNetLoss, Math.max(...expected));
	});
});
