'use strict';
const assert = require('assert').strict, { Battle, Dex } = require('../../../dist/sim');
function setup() {
	const b = new Battle({ formatid: 'gen9nofieldsinglesgame', p1: { team: [{ species: 'Mew', ability: 'No Ability', moves: ['doublehit', 'tackle', 'splash'] }] }, p2: { team: [{ species: 'Decidueye', ability: 'Silent Flight', moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }] } });
	if (b.requestState === 'teampreview')b.makeChoices('team 1', 'team 12');
	return b;
}
function check(fn) {
	const b = setup();
	try {
		fn(b, b.p1.active[0], b.p2.active[0]);
	} finally {
		b.destroy();
	}
}
describe('Silent Flight', () => {
	it('only replaces regular Decidueye slot and exposes Levitate', () => { assert.deepEqual(Dex.species.get('decidueye').abilities, { 0: 'Fallen Star', 1: 'Silent Flight', H: 'Canopy Archer' }); assert.equal(Dex.species.get('decidueyehisui').abilities.H, 'Canopy Archer'); });
	for (const id of ['stealthrock', 'spikes', 'toxicspikes', 'stickyweb', 'gmaxsteelsurge'])it('blocks ' + id + ' even grounded', () => check((b, p, q) => {
		q.setItem('ironball');
		q.side.addSideCondition(id, p);
		const hp = q.hp;
		b.singleEvent('SwitchIn', Dex.conditions.get(id), q.side.sideConditions[id], q);
		assert.equal(q.hp, hp);
		assert.equal(q.status, '');
		assert.equal(q.boosts.spe, 0);
	}));
	it('airborne until Gravity, Smack Down, Iron Ball, suppression or ability bypass', () => check((b, p, q) => {
		assert.equal(q.isGrounded(), null);
		q.setItem('ironball');
		assert.equal(q.isGrounded(), true);
		q.setItem('');
		q.addVolatile('smackdown', p);
		assert.equal(q.isGrounded(), true);
		q.removeVolatile('smackdown');
		b.field.addPseudoWeather('gravity', p);
		assert.equal(q.isGrounded(), true);
		b.field.removePseudoWeather('gravity');
		q.addVolatile('gastroacid');
		assert.equal(q.isGrounded(), true);
	}));
	it('spends only the first HP hit of a multi-hit attack', () => check((b, p, q) => {
		q.setType('Normal');
		const move = Dex.getActiveMove('doublehit');
		assert.equal(b.runEvent('ModifyDamage', p, q, move, 100), 75);
		b.actions.useMove('doublehit', p, q);
		assert(q.volatiles.silentflight.spent);
		assert.equal(b.runEvent('ModifyDamage', p, q, move, 100), 100);
	}));
	it('status, immunity and indirect damage do not spend protection', () => check((b, p, q) => {
		b.actions.useMove('tackle', p, q);
		assert(!q.volatiles.silentflight.spent);
		b.actions.useMove('splash', p, q);
		b.damage(10, q, p, Dex.conditions.get('psn'));
		assert(!q.volatiles.silentflight.spent);
	}));
	it('Substitute damage does not spend HP-hit protection', () => check((b, p, q) => {
		q.setType('Normal');
		q.addVolatile('substitute');
		b.actions.useMove('tackle', p, q);
		assert(!q.volatiles.silentflight.spent);
	}));
	it('suppression disables reduction without replenishing it; reentry resets it', () => check((b, p, q) => {
		q.volatiles.silentflight.spent = true;
		q.addVolatile('gastroacid');
		q.removeVolatile('gastroacid');
		b.singleEvent('Start', q.getAbility(), q.abilityState, q);
		assert(q.volatiles.silentflight.spent);
		b.actions.switchIn(b.p2.pokemon[1], 0);
		b.actions.switchIn(q, 0);
		b.singleEvent('Start', q.getAbility(), q.abilityState, q);
		assert(!q.volatiles.silentflight.spent);
	}));
	it('copying ability initializes one guard and repeated Start does not refresh it', () => check((b, p, q) => {
		p.setAbility('silentflight');
		assert(p.volatiles.silentflight);
		p.volatiles.silentflight.spent = true;
		b.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert(p.volatiles.silentflight.spent);
	}));
});

describe('Silent Flight calculator state', () => {
	it('fresh and spent states use different actual engine damage', () => {
		const { calculateScenario } = require('../../../dist/sim/custom-calculator');
		const scenario = { format: 'gen9nofieldsinglesgame', move: 'watergun', samples: 8, actors: [{ species: 'Mew', ability: 'No Ability' }, { species: 'Decidueye', ability: 'Silent Flight' }, ...Array.from({ length: 2 }, () => ({ species: 'Mew', ability: 'No Ability' }))] };
		const fresh = calculateScenario(scenario);
		scenario.actors[1].silentFlightSpent = true;
		const spent = calculateScenario(scenario);
		assert(fresh.results[1].max < spent.results[1].max);
	});
});

describe('Silent Flight direct damage boundaries', () => {
	it('reduces fixed move damage once but not indirect damage', () => check((b, p, q) => {
		q.setType('Normal');
		const hp = q.hp;
		b.actions.useMove('seismictoss', p, q);
		assert.equal(hp - q.hp, 75);
		assert(q.volatiles.silentflight.spent);
	}));
	it('Mold Breaker bypasses mitigation and Ground immunity', () => check((b, p, q) => {
		p.setAbility('moldbreaker');
		const hp = q.hp;
		b.actions.useMove('earthquake', p, q);
		assert(q.hp < hp);
		assert(!q.volatiles.silentflight.spent);
	}));
	it('Protect and missed moves preserve the guard', () => check((b, p, q) => {
		q.setType('Normal');
		q.addVolatile('protect');
		b.actions.useMove('tackle', p, q);
		assert(!q.volatiles.silentflight.spent);
		q.removeVolatile('protect');
		const move = Dex.getActiveMove('tackle');
		move.accuracy = 0;
		b.actions.useMove(move, p, q);
		assert(!q.volatiles.silentflight.spent);
	}));
});

describe('Silent Flight species legality', () => {
	it('accepts regular Decidueye and rejects the replaced Long Reach slot', () => {
		const { TeamValidator } = require('../../../dist/sim'), v = new TeamValidator('gen9nofieldsinglesgame@@@Obtainable Abilities'), set = { species: 'Decidueye', ability: 'Silent Flight', moves: ['leafblade'], nature: 'Hardy', evs: { hp: 1 }, level: 100 };
		assert.equal(v.validateTeam([set]), null);
		assert(v.validateTeam([{ ...set, ability: 'Long Reach' }]));
	});
});
