'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

describe('Elemental Fangs and Punches', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(ability = 'No Ability', targetAbility = 'No Ability') {
		battle = common.createBattle({}, [[{species: 'Mew', ability, moves: ['splash']}], [{species: 'Mew', ability: targetAbility, moves: ['splash']}]]);
		const [p, q] = [battle.p1.active[0], battle.p2.active[0]];
		for (const mon of [p, q]) { mon.getPassives = () => []; mon.hp = mon.maxhp = mon.baseMaxhp = 10000; }
		battle.random = () => 0;
		return [p, q];
	}
	for (const [id, status, chance] of [['firefang', 'brn', 20], ['icefang', 'frz', 10], ['thunderfang', 'par', 20]]) {
		it(id + ' keeps separate status/flinch rolls and Strong Jaw support', () => {
			const [p, q] = setup('Strong Jaw'); const move = Dex.getActiveMove(id);
			assert.equal(move.basePower, 75); assert.equal(move.accuracy, 100);
			assert.deepEqual(move.secondaries, [{chance, status}, {chance: 10, volatileStatus: 'flinch'}]);
			assert.equal(battle.runEvent('BasePower', p, q, move, 1000), 1500);
			battle.actions.useMove(Object.assign(move, {willCrit: false}), p, {target: q});
			assert.equal(q.status, status); assert(q.volatiles.flinch);
		});
	}
	for (const id of ['firepunch', 'icepunch', 'thunderpunch']) {
		it(id + ' lowers Defense instead of inflicting status and retains Iron Fist support', () => {
			const [p, q] = setup('Iron Fist'); const move = Dex.getActiveMove(id);
			assert.equal(move.basePower, 85); assert.equal(move.accuracy, 100);
			assert.deepEqual(move.secondaries, [{chance: 20, boosts: {def: -1}}]);
			assert.equal(battle.runEvent('BasePower', p, q, move, 1000), 1400);
			battle.actions.useMove(Object.assign(move, {willCrit: false}), p, {target: q});
			assert.equal(q.boosts.def, -1); assert.equal(q.status, '');
		});
	}
	for (const protection of ['shielddust', 'clearbody', 'substitute', 'protect']) {
		it('the Punch Defense drop respects ' + protection, () => {
			const [p, q] = setup('No Ability', ['shielddust', 'clearbody'].includes(protection) ? protection : 'No Ability');
			if (protection === 'substitute' || protection === 'protect') q.addVolatile(protection);
			battle.actions.useMove(Object.assign(Dex.getActiveMove('firepunch'), {willCrit: false}), p, {target: q});
			assert.equal(q.boosts.def, 0); assert.equal(q.status, '');
		});
	}
	it('Plasma Eruption adds its cross-status alongside the Punch Defense drop', () => {
		const [p, q] = setup('Plasma Eruption'); battle.randomChance = () => false;
		battle.actions.useMove(Object.assign(Dex.getActiveMove('firepunch'), {willCrit: false, accuracy: true}), p, {target: q});
		assert.equal(q.boosts.def, -1); assert.equal(q.status, 'par');
		assert.equal(p.volatiles.plasmacore.pressure, 1);
	});
});
