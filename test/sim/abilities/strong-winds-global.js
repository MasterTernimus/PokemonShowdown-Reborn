'use strict';
const assert = require('assert').strict;
const { Dex } = require('../../../dist/sim');
const { validateScenario, buildCalculatorBattle, calculateScenario } = require('../../../dist/sim/custom-calculator');
function setup(field = '', ability = 'No Ability', weather = 'deltastream') { return buildCalculatorBattle(validateScenario({ format: 'gen9nofieldsinglesgame', field, weather, move: 'Gust', samples: 8, actors: [{ species: 'Mew', ability }, { species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }] }), 0); }
describe('Global Strong Winds bonuses', () => {
	for (const field of ['', 'mountainterrain', 'snowymountainterrain', 'coldeclipseterrain']) {
		it('applies exactly one global named and special Flying factor on ' + field, () => {
			const { battle: b, mons: [p, q] } = setup(field);
			try {
				for (const [id, factor] of [['gust', 2.25], ['heavenlywing', 2.25], ['airstreamassault', 2.25], ['fairywind', 1.5], ['hurricane', 1.5], ['tackle', 1]]) {
					const m = Dex.getActiveMove(id);
					const wind = b.field.getWeather();
					const ctx = Object.create(b);
					ctx.chainModify = x => x;
					const value = wind.onBasePower.call(ctx, m.basePower, p, q, m);
					assert.equal(value || 1, factor);
				}
			} finally {
				b.destroy();
			}
		});
		for (const ability of ['Wind Power', 'Wind Rider'])it(ability + ' gains both stats once on ' + field, () => {
			const { battle: b, mons: [p] } = setup(field, ability);
			try {
				b.fieldEvent('Residual');
				assert.equal(p.boosts.atk, 1);
				assert.equal(p.boosts.spa, 1);
			} finally {
				b.destroy();
			}
		});
		it('Gale Wings gives all moves priority even at low HP on ' + field, () => {
			const { battle: b, mons: [p, q] } = setup(field, 'Gale Wings');
			try {
				p.hp = 1;
				assert.equal(b.runEvent('ModifyPriority', p, q, Dex.getActiveMove('tackle'), 0), 1);
			} finally {
				b.destroy();
			}
		});
	}
	it('weather suppression disables damage and priority bonuses', () => {
		const { battle: b, mons: [p, q] } = setup('', 'Gale Wings');
		try {
			q.setAbility('Cloud Nine');
			p.hp = 1;
			assert.equal(b.field.isWeather('deltastream'), false);
			assert.equal(b.runEvent('ModifyPriority', p, q, Dex.getActiveMove('tackle'), 0), 0);
			const ctx = Object.create(b);
			ctx.chainModify = x => x;
			assert.equal(b.field.getWeather().onBasePower.call(ctx, 40, p, q, Dex.getActiveMove('gust')), undefined);
		} finally {
			b.destroy();
		}
	});
	it('ordinary and primal replacement disable wind bonuses', () => {
		for (const weather of ['raindance', 'desolateland', 'primordialsea']) {
			const { battle: b, mons: [p, q] } = setup('', 'Gale Wings');
			try {
				b.field.setWeather(weather, p, Dex.moves.get('raindance'));
				p.hp = 1;
				assert.equal(b.field.isWeather('deltastream'), false);
				assert.equal(b.runEvent('ModifyPriority', p, q, Dex.getActiveMove('tackle'), 0), 0);
			} finally {
				b.destroy();
			}
		}
	});
	it('Cold Eclipse retains unconditional wind x2 without weather', () => {
		const { battle: b, mons: [p, q] } = setup('coldeclipseterrain', 'No Ability', '');
		try {
			const ctx = Object.create(b);
			ctx.chainModify = x => x;
			const m = Dex.getActiveMove('gust');
			assert.equal(b.field.getTerrain().onBasePower.call(ctx, 40, p, q, m), 2);
		} finally {
			b.destroy();
		}
	});
});

describe('Strong Winds damage and availability parity', () => {
	for (const field of ['', 'mountainterrain', 'snowymountainterrain', 'coldeclipseterrain']) for (const move of ['Gust', 'Heavenly Wing', 'Airstream Assault'])it(field + ' ' + move + ' calculator matches battle samples', () => {
		const input = { format: 'gen9nofieldsinglesgame', field, weather: 'deltastream', move, samples: 8, seed: 42, actors: [{ species: 'Pidgeot', ability: 'No Ability' }, ...Array.from({ length: 3 }, () => ({ species: 'Mew', ability: 'No Ability' }))] }, scenario = validateScenario(input), loss = [];
		for (let i = 0;
			i < 8;
			i++) {
			const { battle: b, mons: [p, q] } = buildCalculatorBattle(scenario, i);
			try {
				const hp = q.hp;
				b.actions.runMove(scenario.move, p, p.getLocOf(q));
				loss.push(hp - q.hp);
			} finally {
				b.destroy();
			}
		}
		const result = calculateScenario(input); assert.equal(result.results[1].minNetLoss, Math.min(...loss)); assert.equal(result.results[1].maxNetLoss, Math.max(...loss));
	});
	it('does not retain weather-based stat gains under Cloud Nine or suppressed ability', () => {
		for (const suppression of ['cloudnine', 'gastroacid']) {
			const { battle: b, mons: [p, q] } = setup('', 'Wind Power');
			try {
				if (suppression === 'cloudnine')q.setAbility('Cloud Nine');
				else p.addVolatile('gastroacid');
				b.fieldEvent('Residual');
				assert.equal(p.boosts.atk, 0);
				assert.equal(p.boosts.spa, 0);
			} finally {
				b.destroy();
			}
		}
	});
	it('makes Airstream Assault legal for Pidgeot and its Mega form', () => {
		const { TeamValidator } = require('../../../dist/sim');
		const v = new TeamValidator('gen9nofieldsinglesgame@@@Obtainable Moves');
		for (const species of ['Pidgeot', 'Pidgeot-Mega']) {
			const set = { species, ability: 'No Ability', item: species.endsWith('Mega') ? 'Pidgeotite' : '', moves: ['Airstream Assault'], level: 100 };
			const errors = v.validateSet(set);
			assert(!errors?.length, JSON.stringify(errors));
		}
	});
	it('keeps Mountain free of duplicate wind hooks and Snowy storm exceptions local', () => {
		for (const field of ['mountainterrain', 'snowymountainterrain']) {
			const { battle: b, mons: [p, q] } = setup(field);
			try {
				const m = Dex.getActiveMove('gust'), ctx = Object.create(b);
				ctx.chainModify = x => x;
				assert.equal(b.field.getTerrain().onBasePower.call(ctx, 40, p, q, m), 1.5);
			} finally {
				b.destroy();
			}
		}
	});
});
