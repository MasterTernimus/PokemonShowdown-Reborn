'use strict';
const assert = require('assert').strict, common = require('../../common'), { Dex } = require('../../../dist/sim');
describe('Last Laugh earned Stall payoff', () => {
	let b;
	afterEach(() => {
		b?.destroy();
		b = null;
	});
	function start(extra = {}) {
		b = common.createBattle(extra, [[{ species: 'Sableye', ability: 'Last Laugh', moves: ['tackle', 'quickattack', 'bulletseed'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash', 'roar'] }]]);
		return [b.p1.active[0], b.p2.active[0]];
	}
	function power(p, q) {
		return b.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 100);
	}
	it('is late within the same priority bracket despite greater Speed', () => {
		const [p, q] = start();
		p.storedStats.spe = 1000;
		q.storedStats.spe = 1;
		b.makeChoices('move tackle', 'move splash');
		const moves = b.log.filter(l => l.startsWith('|move|'));
		assert(moves[0].includes('Splash'));
		assert.equal(q.volatiles.torment, undefined);
	});
	it('does not move Quick Attack behind lower-priority actions', () => {
		start();
		b.makeChoices('move quickattack', 'move splash');
		assert(b.log.filter(l => l.startsWith('|move|'))[0].includes('Quick Attack'));
	});
	it('rewards current-entry completed action but not switching/stale markers or Torment alone', () => {
		const [p, q] = start();
		assert.equal(power(p, q), 100);
		q.addVolatile('torment', p);
		assert.equal(power(p, q), 100);
		q.m.lastCompletedActionTurn = b.turn - 1;
		q.m.lastCompletedActionEntry = q.previouslySwitchedIn;
		assert.equal(power(p, q), 100);
		q.m.lastCompletedActionTurn = b.turn;
		q.m.lastCompletedActionEntry = -1;
		assert.equal(power(p, q), 100);
		q.m.lastCompletedActionEntry = q.previouslySwitchedIn;
		assert.equal(power(p, q), 130);
	});
	it('last action bypasses Substitute and heals just once across three hits', () => {
		const [p, q] = start();
		p.hp = 1;
		q.hp = q.maxhp = 2000;
		q.addVolatile('substitute');
		const sub = q.volatiles.substitute.hp;
		b.actions.useMove({ ...Dex.getActiveMove('bulletseed'), multihit: 3, accuracy: true }, p, q);
		assert.equal(p.hp, 1 + Math.floor(p.baseMaxhp / 8));
		assert.equal(q.volatiles.substitute.hp, sub);
		assert(q.hp < 2000);
	});
	it('a queued lower-priority ally prevents last-action bypass and healing in doubles', () => {
		b = common.createBattle({ gameType: 'doubles' }, [[{ species: 'Sableye', ability: 'Last Laugh', moves: ['tackle'] }, { species: 'Mew', ability: 'No Ability', moves: ['counter'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		const p = b.p1.active[0], q = b.p2.active[0];
		p.hp = 1;
		q.addVolatile('substitute');
		const hp = q.hp;
		b.makeChoices('move tackle 1, move counter', 'move splash, move splash');
		assert.equal(p.hp, 1);
		assert.equal(q.hp, hp);
	});
	it('actual local Stall grants Chessboard entry Defense', () => {
		const [p] = start();
		b.field.setTerrain('chessboardterrain', p);
		p.boosts.def = 0;
		b.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(p.boosts.def, 1);
	});
	it('suppression removes the damage and Substitute benefits', () => {
		const [p, q] = start();
		p.addVolatile('gastroacid', q);
		q.m.lastCompletedActionTurn = b.turn;
		q.m.lastCompletedActionEntry = q.previouslySwitchedIn;
		assert.equal(power(p, q), 100);
		const m = Dex.getActiveMove('tackle');
		b.runEvent('ModifyMove', p, q, m, m);
		assert(!m.flags.bypasssub);
	});
	it('calculator resolves Last Laugh and executes the native package', () => {
		const c = require('../../../dist/sim/custom-calculator'), r = c.calculateScenario({ format: 'gen9nofieldsinglesgame', move: 'Tackle', samples: 8, seed: 1, actors: [{ species: 'Sableye', ability: 'Last Laugh' }, ...Array.from({ length: 3 }, () => ({ species: 'Mew', ability: 'No Ability' }))] });
		assert.equal(r.resolved.actors[0].ability, 'Last Laugh');
		assert(r.results[1].min > 0);
	});
});
