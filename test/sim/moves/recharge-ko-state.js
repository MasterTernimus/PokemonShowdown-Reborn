'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

describe('Recharge KO state and protocol', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(id, doubles = false) {
		const mon = () => ({species: 'Mew', ability: 'No Ability', moves: [id, 'splash']});
		battle = common.createBattle({formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame'},
			[[mon(), mon(), mon()], [mon(), mon(), mon()]]);
		battle.makeChoices();
		for (const p of battle.getAllActive()) {
			p.getPassives = () => [];
			p.hp = p.maxhp = p.baseMaxhp = 10000;
			p.setType('Normal');
		}
		battle.randomChance = (n, d) => n >= d;
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	function hit(p, q, id, extra = {}) {
		battle.actions.runMove(Object.assign(Dex.getActiveMove(id), {accuracy: true, willCrit: false, secondaries: []}, extra), p, p.getLocOf(q));
	}
	function assertDisplay(p, expected) {
		let shown = false;
		for (const line of battle.log) {
			if (line === `|-mustrecharge|${p}`) shown = true;
			if (line === `|-end|${p}|mustrecharge|[silent]`) shown = false;
		}
		assert.equal(shown, expected, battle.log.join('\n'));
		assert.equal(!!p.volatiles.mustrecharge, expected);
	}
	for (const move of Dex.moves.all().filter(m => m.flags.recharge)) {
		for (const ko of [false, true]) it(`${move.name}: ${ko ? 'KO clears' : 'surviving hit retains'} recharge and its display`, () => {
			const [p, q] = setup(move.id);
			if (ko) q.hp = 1;
			hit(p, q, move.id);
			assert.equal(q.hp === 0, ko);
			assertDisplay(p, !ko);
			assert.equal(p.getMoves(p.getLockedMove()).some(m => m.id === 'recharge'), !ko);
		});
	}
	it('Radiant Assault clears recharge when only the second spread target is KOed', () => {
		const [p, q] = setup('radiantassault', true);
		battle.p2.active[1].hp = 1;
		hit(p, q, 'radiantassault');
		assert(q.hp > 0);
		assert.equal(battle.p2.active[1].hp, 0);
		assertDisplay(p, false);
	});
	for (const defense of ['protect', 'immune', 'miss', 'substitute']) it(`Giga Impact respects ${defense}`, () => {
		const [p, q] = setup('gigaimpact');
		if (defense === 'immune') q.setType('Ghost');
		if (defense === 'protect' || defense === 'substitute') q.addVolatile(defense);
		hit(p, q, 'gigaimpact', defense === 'miss' ? {accuracy: 0} : {});
		assert(q.hp > 0);
		assertDisplay(p, defense === 'substitute');
	});
	it('a generated recharge move receives the same KO waiver', () => {
		const [p, q] = setup('gigaimpact'); q.hp = 1;
		battle.actions.useMove(Object.assign(Dex.getActiveMove('gigaimpact'), {accuracy: true}), p,
			{target: q, sourceEffect: Dex.moves.get('sleeptalk')});
		assert.equal(q.hp, 0); assertDisplay(p, false);
	});
	it('removes the indicator after the actual recharge turn', () => {
		const [p, q] = setup('gigaimpact'); hit(p, q, 'gigaimpact');
		assertDisplay(p, true);
		battle.actions.runMove('recharge', p, 0);
		assertDisplay(p, false);
		assert(battle.log.some(line => line === `|cant|${p}|recharge`));
	});
});
