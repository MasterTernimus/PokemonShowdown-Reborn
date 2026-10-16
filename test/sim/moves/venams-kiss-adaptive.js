'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
describe('Adaptive Venam\'s Kiss', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(set = {}) {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Mew', ability: 'No Ability', moves: ['venamskiss'], ...set}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.makeChoices();
		battle.randomizer = damage => damage;
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	for (const [atk, spa, stages, expected] of [
		[200, 100, {}, 'Physical'], [100, 200, {}, 'Special'], [100, 100, {}, 'Special'],
		[100, 200, {atk: 3}, 'Physical'], [200, 100, {atk: -3}, 'Special'],
	]) it(`uses staged stats ${atk}/${spa} ${JSON.stringify(stages)}: ${expected}`, () => {
		const [p, q] = setup();
		p.storedStats.atk = atk; p.storedStats.spa = spa; Object.assign(p.boosts, stages);
		p.setItem('Choice Band'); p.status = 'brn';
		q.hp = q.maxhp = 10000; q.storedStats.def = 600; q.storedStats.spd = 60;
		const move = Dex.getActiveMove('venamskiss'); move.willCrit = false;
		battle.singleEvent('ModifyMove', move, {}, p, q, move, move);
		assert.equal(move.category, expected);
		const control = Object.assign(Dex.getActiveMove('venamskiss'), {category: expected, willCrit: false});
		assert.equal(battle.actions.getDamage(p, q, move), battle.actions.getDamage(p, q, control));
		battle.actions.useMove(move, p, {target: q});
		assert.equal(battle.activeMove.category, expected); assert(q.hp < q.maxhp);
	});
	it('retains Steel effectiveness, poisoning, bite/tail flags and Protect', () => {
		const [p, q] = setup(); p.storedStats.spa = 500; q.hp = q.maxhp = 10000; q.setType('Steel');
		const move = Dex.getActiveMove('venamskiss'); move.willCrit = false;
		assert(move.flags.bite && move.flags.tail); assert.equal(q.runEffectiveness(move), 1);
		q.addVolatile('protect'); battle.actions.useMove(move, p, {target: q});
		assert.equal(q.hp, 10000); assert.equal(q.status, '');
		q.removeVolatile('protect'); battle.randomChance = () => true;
		battle.actions.useMove(move, p, {target: q}); assert(q.hp < 10000); assert.equal(q.status, 'psn');
	});
	it('supplies exact owner-only Mega stats when Mega changes the stronger offense', () => {
		const [p, q] = setup({species: 'Seviper', item: 'Sevipite', nature: 'Hardy', evs: {spa: 252}});
		const before = p.getSwitchRequestData();
		assert(before.stats.spa > before.stats.atk); assert(before.megaStats.atk > before.megaStats.spa);
		assert.equal(p.getSwitchRequestData(true).megaStats, undefined);
		assert(battle.actions.runMegaEvo(p));
		for (const stat of ['atk', 'def', 'spa', 'spd', 'spe']) assert.equal(p.storedStats[stat], before.megaStats[stat]);
		const move = Dex.getActiveMove('venamskiss'); battle.singleEvent('ModifyMove', move, {}, p, q, move, move);
		assert.equal(move.category, 'Physical');
	});
});
