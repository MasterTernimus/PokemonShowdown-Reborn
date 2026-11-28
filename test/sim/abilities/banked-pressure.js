'use strict';

const assert = require('node:assert/strict');
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

describe('Pressure across switches', () => {
	let battle;
	afterEach(() => battle?.destroy());
	const partner = { species: 'Mew', ability: 'No Ability', moves: ['splash'] };
	function setup(species, item) {
		battle = common.createBattle({ gameType: 'doubles' }, [
			[{ species, item, moves: ['splash'] }, partner, partner], [partner, partner],
		]);
		const user = battle.p1.active[0];
		assert(battle.actions.runMegaEvo(user));
		for (const side of battle.sides) {
			for (const p of side.pokemon) {
				p.hp = p.baseMaxhp = p.maxhp = 16000;
			}
		}
		return [user, battle.p2.active[0], battle.p1.active[1]];
	}
	function attack(source, target, id) {
		const move = Object.assign(Dex.getActiveMove(id), { accuracy: true, willCrit: false });
		battle.actions.useMove(move, source, { target });
		battle.clearActiveMove();
		return source.lastMoveUsed;
	}
	function swapAndReturn(holder, phase) {
		battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		assert.notEqual(battle.p1.active[0], holder);
		assert.equal(holder.getSwitchRequestData().bankedPressure, phase.endsWith('ready') ? 2 : 1);
		assert(!('bankedPressure' in holder.getSwitchRequestData(true)));
		assert(!battle.p1.active[0].volatiles[phase]);
		battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		assert.equal(battle.p1.active[0], holder);
		assert(!('bankedPressure' in holder.getSwitchRequestData()));
		assert(holder.volatiles[phase], phase);
	}
	it('Camerupt banks both stages and cannot farm charge healing by re-entering', () => {
		const [p, foe] = setup('Camerupt', 'Cameruptite');
		p.hp = 5000;
		attack(foe, p, 'tackle');
		const before = p.hp;
		swapAndReturn(p, 'calderacharge');
		assert.equal(p.hp, before);
		attack(foe, p, 'tackle');
		swapAndReturn(p, 'calderaready');
		assert.equal(attack(p, foe, 'earthpower').calderaRelease, p);
	});
	it('Sharpedo banks partial and ready charges, then spends them once on a bite', () => {
		const [p, foe] = setup('Sharpedo', 'Sharpedonite');
		attack(p, foe, 'waterpulse');
		swapAndReturn(p, 'undertowcharge');
		attack(p, foe, 'darkpulse');
		swapAndReturn(p, 'undertowready');
		attack(p, foe, 'waterpulse');
		assert(p.volatiles.undertowready);
		const move = attack(p, foe, 'crunch');
		assert.equal(move.pressureRelease, p);
		assert.equal(battle.runEvent('BasePower', p, foe, move, 1000),
			Math.round(1.3 * battle.runEvent('BasePower', p, foe, { ...move, pressureRelease: undefined }, 1000)));
		assert(!p.volatiles.undertowcharge && !p.volatiles.undertowready);
	});
	it('a blocked sound attack cannot build Pressure, and a blocked release spends it without healing', () => {
		const [p, foe, ally] = setup('Altaria', 'Altarianite');
		foe.addVolatile('protect');
		attack(p, foe, 'disarmingvoice');
		// Disarming Voice also reaches the second opponent, so that successful hit earns one charge.
		assert(p.volatiles.choruscharge);
		for (const opponent of battle.p2.active) opponent.addVolatile('protect');
		attack(p, foe, 'hypervoice');
		assert(p.volatiles.choruscharge);
		for (const opponent of battle.p2.active) opponent.removeVolatile('protect');
		attack(p, foe, 'hypervoice');
		assert(p.volatiles.chorusready);
		for (const opponent of battle.p2.active) opponent.addVolatile('protect');
		p.hp = ally.hp = 5000;
		attack(p, foe, 'hypervoice');
		assert(!p.volatiles.chorusready && !p.volatiles.choruscharge);
		assert.equal(p.hp, 5000);
		assert.equal(ally.hp, 5000);
	});
	it('Altaria banks once per spread sound attack and heals each active ally once on release', () => {
		const [p, foe, ally] = setup('Altaria', 'Altarianite');
		attack(p, foe, 'hypervoice');
		swapAndReturn(p, 'choruscharge');
		attack(p, foe, 'hypervoice');
		swapAndReturn(p, 'chorusready');
		ally.hp = p.hp = 5000;
		const move = attack(p, foe, 'hypervoice');
		assert.equal(move.pressureRelease, p);
		const base = battle.runEvent('BasePower', p, foe, { ...move, pressureRelease: undefined }, 1000);
		assert(Math.abs(battle.runEvent('BasePower', p, foe, move, 1000) - base * 1.25) <= 1);
		assert.equal(ally.hp, 7000);
		assert.equal(p.hp, 7000);
		assert(!p.volatiles.choruscharge && !p.volatiles.chorusready);
	});
});
