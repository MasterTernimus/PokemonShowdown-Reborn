'use strict';
const assert = require('assert').strict;
const { Dex } = require('../../dist/sim');
const { validateScenario, buildCalculatorBattle, calculateScenario } = require('../../dist/sim/custom-calculator');
function scenario(extra = {}) { return { format: 'gen9nofieldsinglesgame', field: 'bewitchedwoodsterrain', move: 'Vine Whip', samples: 8, seed: 42, actors: Array.from({ length: 4 }, () => ({ species: 'Mew', ability: 'No Ability' })), ...extra }; }
describe('Bewitched Woods Grass power correction', () => {
	for (const [type, power] of [['Grass', 150], ['Fairy', 150], ['Dark', 130], ['Fire', 100], ['Water', 100], ['Normal', 100]])it(type + ' has the intended field multiplier', () => {
		const { battle: b, mons: [p, q] } = buildCalculatorBattle(validateScenario(scenario()), 0);
		try {
			const move = Dex.getActiveMove('tackle');
			move.type = type;
			assert.equal(b.runEvent('BasePower', p, q, move, 100), power);
		} finally {
			b.destroy();
		}
	});
	it('boosts Grass attacks from airborne non-Grass users without granting Grass healing', () => {
		const { battle: b, mons: [p, q] } = buildCalculatorBattle(validateScenario(scenario()), 0);
		try {
			p.setType('Flying');
			assert(!p.isGrounded());
			const move = Dex.getActiveMove('vinewhip');
			assert.equal(b.runEvent('BasePower', p, q, move, 100), 150);
			p.hp -= 50;
			const hp = p.hp;
			b.singleEvent('Residual', b.field.getTerrain(), b.field.terrainState, p);
			assert.equal(p.hp, hp);
		} finally {
			b.destroy();
		}
	});
	it('does not boost a Normal-primary attack merely carrying secondary Grass typing', () => {
		const { battle: b, mons: [p, q] } = buildCalculatorBattle(validateScenario(scenario()), 0);
		try {
			const move = Dex.getActiveMove('tackle');
			move.types = ['Normal', 'Grass'];
			assert.equal(b.runEvent('BasePower', p, q, move, 100), 100);
		} finally {
			b.destroy();
		}
	});
	it('does not grant the bonus without Bewitched Woods', () => {
		const { battle: b, mons: [p, q] } = buildCalculatorBattle(validateScenario(scenario({ field: '' })), 0);
		try {
			assert.equal(b.runEvent('BasePower', p, q, Dex.getActiveMove('vinewhip'), 100), 100);
		} finally {
			b.destroy();
		}
	});
	it('reconciles Grassy Aura with the restored type-wide field bonus', () => {
		const { battle: b, mons: [p, q] } = buildCalculatorBattle(validateScenario(scenario({ aura: 'grassyterrain' })), 0);
		try {
			assert.equal(b.field.auraField, 'grassyterrain');
			const move = Dex.getActiveMove('vinewhip');
			assert.equal(b.runEvent('BasePower', p, q, move, 100), 150);
			assert.equal(b.field.auraPowerMultiplier(p, q, move), 1);
		} finally {
			b.destroy();
		}
	});
	it('keeps calculator damage identical to direct engine samples', () => {
		const raw = scenario(), s = validateScenario(raw), loss = [];
		for (let i = 0;
			i < 8;
			i++) {
			const { battle: b, mons: [p, q] } = buildCalculatorBattle(s, i);
			try {
				const hp = q.hp;
				b.actions.runMove(s.move, p, p.getLocOf(q));
				loss.push(hp - q.hp);
			} finally {
				b.destroy();
			}
		}
		const result = calculateScenario(raw).results[1];
		assert.equal(result.minNetLoss, Math.min(...loss));
		assert.equal(result.maxNetLoss, Math.max(...loss));
		const baseline = calculateScenario(scenario({ field: '' })).results[1];
		assert(result.minNetLoss > baseline.minNetLoss);
		assert(result.maxNetLoss > baseline.maxNetLoss);
	});
});
