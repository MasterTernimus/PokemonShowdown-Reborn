'use strict';

const assert = require('assert').strict;
const common = require('../../common');

describe('Room move interactions', function () {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(move, item = '', ability = 'No Ability') {
		battle = common.createBattle({}, [
			[{species: 'Mew', ability, item, moves: [move, 'growl']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['growl', 'protect']}],
		]);
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	for (const move of ['dig', 'dive']) {
		it(`${move} hits immediately in Gravity without consuming Power Herb`, () => {
			const [p, q] = setup(move, 'Power Herb');
			battle.field.addPseudoWeather('gravity', p);
			battle.makeChoices(`move ${move}`, 'move growl');
			assert(q.hp < q.maxhp);
			assert.equal(p.item, 'powerherb');
			assert(!p.volatiles.twoturnmove && !p.volatiles[move]);
		});
		it(`${move} still charges outside Gravity and hits on its second turn`, () => {
			const [p, q] = setup(move);
			battle.makeChoices(`move ${move}`, 'move growl');
			assert.equal(q.hp, q.maxhp);
			assert(p.volatiles.twoturnmove);
			battle.makeChoices(`move ${move}`, 'move growl');
			assert(q.hp < q.maxhp);
			assert(!p.volatiles.twoturnmove && !p.volatiles[move]);
		});
		it(`${move} respects Protect in Gravity without leaving a charge or consuming Power Herb`, () => {
			const [p, q] = setup(move, 'Power Herb');
			battle.field.addPseudoWeather('gravity', p);
			battle.makeChoices(`move ${move}`, 'move protect');
			assert.equal(q.hp, q.maxhp);
			assert.equal(p.item, 'powerherb');
			assert(!p.volatiles.twoturnmove && !p.volatiles[move]);
		});
	}
	for (const [move, duration] of [['mist', 5], ['safeguard', 3]]) {
		it(`${move} extends only on creation and reports the exact duration`, () => {
			const [p] = setup(move);
			battle.actions.useMove(move, p);
			assert.equal(p.side.sideConditions[move].duration, duration);
			battle.field.addPseudoWeather('magicroom', p);
			battle.actions.useMove(move, p);
			assert.equal(p.side.sideConditions[move].duration, duration);
			assert(!battle.log.some(l => l.includes('Magic Room wove')));
			p.side.removeSideCondition(move);
			battle.actions.useMove(move, p);
			assert.equal(p.side.sideConditions[move].duration, 8);
			assert.equal(battle.log.filter(l => l.includes('|-sidestart|') && l.includes('[turns] 8')).length, 1);
			assert.equal(battle.log.filter(l => l.includes('Magic Room wove')).length, 1);
			battle.field.removePseudoWeather('magicroom');
			assert.equal(p.side.sideConditions[move].duration, 8);
		});
	}
	for (const ability of ['No Ability', 'Contrary']) {
		it(`Guard Swap cleanses only the user's received negative defensive stages (${ability})`, () => {
			const [p, q] = setup('guardswap', '', ability);
			p.setBoost({def: -3, spd: 2, atk: -2});
			q.setBoost({def: 4, spd: -2, spa: -1});
			battle.field.addPseudoWeather('wonderroom', p);
			battle.actions.useMove('guardswap', p, {target: q});
			assert.equal(p.boosts.def, 4);
			assert.equal(p.boosts.spd, 0);
			assert.equal(p.boosts.atk, -2);
			assert.equal(q.boosts.def, -3);
			assert.equal(q.boosts.spd, 2);
			assert.equal(q.boosts.spa, -1);
			assert.equal(battle.log.filter(l => l.includes('|-setboost|') && l.includes('Wonder Room')).length, 1);
		});
	}
	it('Guard Swap clears both negative defenses after a successful swap', () => {
		const [p, q] = setup('guardswap');
		q.setBoost({def: -2, spd: -4});
		battle.field.addPseudoWeather('wonderroom', p);
		battle.actions.useMove('guardswap', p, {target: q});
		assert.equal(p.boosts.def, 0);
		assert.equal(p.boosts.spd, 0);
	});
	it('Guard Swap transfers negative defenses normally outside Wonder Room', () => {
		const [p, q] = setup('guardswap');
		q.setBoost({def: -2, spd: -4});
		battle.actions.useMove('guardswap', p, {target: q});
		assert.equal(p.boosts.def, -2);
		assert.equal(p.boosts.spd, -4);
	});
	it('a protected Guard Swap does not cleanse the user', () => {
		const [p, q] = setup('guardswap');
		p.setBoost({def: -3, spd: -2});
		battle.field.addPseudoWeather('wonderroom', p);
		battle.makeChoices('move guardswap', 'move protect');
		assert.equal(p.boosts.def, -3);
		assert.equal(p.boosts.spd, -2);
		assert.equal(q.boosts.def, 0);
		assert(!battle.log.some(l => l.includes('|-setboost|') && l.includes('Wonder Room')));
	});
});
