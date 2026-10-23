'use strict';
const assert = require('assert').strict, c = require('../../../dist/sim/custom-calculator');
function input(extra = {}) { return { format: 'gen9nofieldsinglesgame', evaluationMode: 'public-state', weather: 'none', move: 'Tackle', samples: 8, seed: 42, actors: Array.from({ length: 4 }, () => ({ species: 'Mew', ability: 'No Ability' })), ...extra }; }
function withBattle(x, fn) {
	const { battle, mons } = c.buildCalculatorBattle(c.validateScenario(x), 0);
	try {
		fn(battle, mons);
	} finally {
		battle.destroy();
	}
}
describe('Bounded calculator public-state mode', () => {
	it('does not replay Intimidate entry effects or requested boosts', () => {
		const x = input();
		x.actors[0].ability = 'Intimidate';
		x.actors[1].boosts = { atk: 2 };
		withBattle(x, (b, m) => {
			assert.equal(m[1].boosts.atk, 2);
			assert(!b.log.some(l => l.includes('Intimidate')));
		});
	});
	for (const [ability, stat] of [['Wind Rider', 'atk'], ['Wind Power', 'spa']]) {
		it(`preserves public-state ${ability} stages with existing Tailwind`, () => {
			const x = input({ sideConditions: [['tailwind'], []] });
			x.actors[0].ability = ability;
			x.actors[0].boosts = { [stat]: 2 };
			withBattle(x, (b, m) => {
				assert.equal(m[0].boosts[stat], 2);
				assert(m[0].side.getSideCondition('tailwind'));
				assert.equal(m[0].getStat('spe'), m[0].storedStats.spe * 2);
				assert(!b.log.some(line => line.startsWith('|-boost|')));
			});
		});
		it(`still activates ${ability} when a new Tailwind is used`, () => {
			const x = input({ move: 'Tailwind' });
			x.actors[0].ability = ability;
			x.actors[0].boosts = { [stat]: 2 };
			const result = c.calculateScenario(x);
			assert.equal(result.actionOutcomes[0].before.actors[0].boosts[stat], 2);
			assert.equal(result.actionOutcomes[0].after.actors[0].boosts[stat], 3);
		});
	}
	it('does not replay existing screen start boosts on Mirror Arena', () => {
		const x = input({ field: 'mirrorarenaterrain', sideConditions: [['reflect'], ['lightscreen']] });
		withBattle(x, (b, m) => {
			assert.equal(m[0].boosts.evasion, 0);
			assert.equal(m[1].boosts.evasion, 0);
		});
	});
	it('does not replay Drizzle; explicit none clears entry weather in legacy mode too', () => {
		for (const evaluationMode of ['public-state', 'fresh-entry']) {
			const x = input({ evaluationMode });
			x.actors[0].ability = 'Drizzle';
			withBattle(x, b => assert.equal(b.field.weather, ''));
		}
	});
	it('keeps default fresh-entry weather behavior', () => {
		const x = input({ evaluationMode: 'fresh-entry', weather: '' });
		x.actors[0].ability = 'Drizzle';
		withBattle(x, b => assert.equal(b.field.weather, 'raindance'));
	});
	it('uses known Protect through the actual hit pipeline', () => {
		const x = input();
		x.actors[1].protect = true;
		const r = c.calculateScenario(x);
		assert.equal(r.results[1].max, 0);
		assert(r.exampleLog.some(l => l.includes('Protect')));
	});
	it('models Substitute HP without charging creation HP', () => {
		const x = input();
		x.actors[1].substituteHP = 80;
		const r = c.calculateScenario(x);
		assert.equal(r.results[1].max, 0);
		assert.equal(r.actionOutcomes[0].before.actors[1].hp, r.actionOutcomes[0].before.actors[1].maxhp);
		assert(r.actionOutcomes[0].after.actors[1].substituteHP < 80);
	});
	for (const ability of ['Decoy Pincers', 'Iron Vise'])it('respects consumed guard ' + ability, () => {
		const x = input();
		x.actors[1].ability = ability;
		const fresh = c.calculateScenario(x);
		x.actors[1].decoyPincersSpent = true;
		const spent = c.calculateScenario(x);
		assert(spent.results[1].max > fresh.results[1].max);
		assert.equal(spent.actionOutcomes[0].after.actors[0].boosts.atk, 0);
		assert.equal(fresh.actionOutcomes[0].after.actors[0].boosts.atk, -1);
	});
	it('rejects unknown initialization instead of treating it as stateless', () => {
		const x = input();
		x.actors[0].ability = 'Aevian King';
		assert.throws(() => c.calculateScenario(x), /Unsupported public-state/);
	});
	it('returns independent per-sample public outcome snapshots', () => {
		const r = c.calculateScenario(input({ move: 'Swords Dance' }));
		assert.equal(r.actionOutcomes.length, 8);
		assert.equal(r.actionOutcomes[0].before.actors[0].boosts.atk, 0);
		assert.equal(r.actionOutcomes[0].after.actors[0].boosts.atk, 2);
	});
	it('matches manually initialized engine damage for Protect and Substitute', () => {
		for (const state of ['protect', 'substitute']) {
			const x = input();
			if (state === 'protect')x.actors[1].protect = true;
			else x.actors[1].substituteHP = 10;
			const losses = [];
			for (let i = 0;
				i < 8;
				i++) {
				const { battle: b, mons: [p, q] } = c.buildCalculatorBattle(c.validateScenario(x), i);
				try {
					const hp = q.hp;
					b.actions.runMove('tackle', p, p.getLocOf(q));
					losses.push(hp - q.hp);
				} finally {
					b.destroy();
				}
			} const r = c.calculateScenario(x);
			assert.equal(r.results[1].minNetLoss, Math.min(...losses));
			assert.equal(r.results[1].maxNetLoss, Math.max(...losses));
		}
	});
});
