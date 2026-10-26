'use strict';

const assert = require('assert').strict;

const common = require('../../common');

const { Dex } = require('../../../dist/sim');

const { ThematicPassiveIds } = require('../../../dist/data/species-passives');

const { DualWieldFinalDamageHooks } = require('../../../dist/sim/dual-wield-power');

describe('Dual Wield actual offensive ability boost family', () => {
	let battle;
	const registered = new Set();
	const parts = ['dualwield', 'sharpness', 'powerdrill', 'megalauncher', 'technician', 'toughclaws', 'ironfist', 'strongjaw', 'sheerforce', 'analytic', 'sniper', 'tintedlens', 'neuroforce', 'freshplumage', 'hugepower'];
	before(() => {
		for (const id of parts) {
			if (!ThematicPassiveIds.has(id)) registered.add(id);
			ThematicPassiveIds.add(id);
		}
	});
	after(() => {
		for (const id of registered) ThematicPassiveIds.delete(id);
	});
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	function setup(ability = 'Dual Wield', passives = [], move = 'sacredsword') {
		battle = common.createBattle({}, [[{ species: 'Mew', ability, moves: [move, 'splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		const p = battle.p1.active[0], q = battle.p2.active[0];
		p.getPassives = () => passives;
		return [p, q];
	}
	function powers(p, q, id = 'sacredsword', bp = 100, patch = {}) {
		const move = Object.assign(Dex.getActiveMove(id), patch);
		battle.runEvent('ModifyMove', p, q, move, move);
		const result = [1, 2].map(hit => {
			move.hit = hit;
			return battle.runEvent('BasePower', p, q, move, bp);
		});
		return { result, move };
	}
	const rows = [
		['sharpness', 'sacredsword', 100, 150], ['powerdrill', 'hornattack', 100, 150], ['megalauncher', 'aurasphere', 100, 150],
		['technician', 'metalclaw', 40, 60], ['toughclaws', 'sacredsword', 100, 130], ['ironfist', 'stackingshot', 100, 140],
		['sheerforce', 'airslash', 100, 130], ['analytic', 'sacredsword', 100, 130],
	];
	for (const [part, id, bp, first] of rows) {
		for (const selected of [true, false]) it(part + ' selected=' + selected + ' gives full first power and original-power follow-up', () => {
			const [p, q] = setup(selected ? part : 'Dual Wield', selected ? ['dualwield'] : [part], id);
			const { result, move } = powers(p, q, id, bp);
			assert.equal(move.multihitType, 'dualwield');
			assert.deepEqual(result, [first, battle.modify(bp, 0.15)]);
		});
	}
	it('does not trigger Mega Launcher on a slicing move or Power Drill on a pulse move', () => {
		const [p, q] = setup('Dual Wield', ['megalauncher', 'powerdrill']);
		assert.deepEqual(powers(p, q).result, [60, 60]);
	});
	it('Strong Jaw preserves ordinary bite eligibility and supports qualifying custom bite moves', () => {
		const [p, q] = setup('Dual Wield', ['strongjaw'], 'crunch');
		const regular = powers(p, q, 'crunch');
		assert(!regular.move.multihitType);
		assert.equal(regular.result[0], 150);
		assert.deepEqual(powers(p, q, 'crunch', 100, { flags: { ...Dex.moves.get('crunch').flags, slicing: 1 } }).result, [150, 15]);
	});
	it('stacks distinct components once and does not stack a duplicated selected/passive component', () => {
		const [p, q] = setup('Power Drill', ['dualwield', 'powerdrill', 'sharpness', 'megalauncher']);
		assert.deepEqual(powers(p, q, 'hornattack', 100, { flags: { drill: 1, slicing: 1, pulse: 1 } }).result, [337, 15]);
	});
	it('retains the field-enhanced ability multiplier on first hit', () => {
		const [p, q] = setup('Dual Wield', ['powerdrill']);
		battle.field.setTerrain('rockyterrain', p);
		assert.deepEqual(powers(p, q, 'tackle', 100, { flags: { drill: 1 } }).result, [200, 15]);
	});
	it('does not count items or pure stat multipliers as triggers', () => {
		const [p, q] = setup('Dual Wield', ['hugepower']);
		p.setItem('muscleband');
		assert.deepEqual(powers(p, q).result, [66, 66]);
	});
	it('suppression removes an active booster but preserves an independent Dual Wield passive', () => {
		const [p, q] = setup('Tough Claws', ['dualwield']);
		p.addVolatile('gastroacid', q);
		assert.deepEqual(powers(p, q).result, [60, 60]);
	});
	it('native multihits and non-Dual-Wield controls keep their full ordinary ability boosts', () => {
		const [p, q] = setup('Power Drill', [], 'hornattack');
		assert.deepEqual(powers(p, q, 'hornattack').result, [150, 150]);
		const native = powers(p, q, 'bulletseed');
		assert.deepEqual(native.move.multihit, [2, 5]);
		assert(!native.move.multihitType);
	});
	it('lists every current final-damage ability hook for explicit pure eligibility coverage', () => {
		for (const ability of Dex.abilities.all()) if (ability.onModifyDamage) assert(DualWieldFinalDamageHooks.has(ability.id), ability.id);
	});
	it('Sniper final-damage callback executes once per hit after BasePower, with full first and unboosted follow-up', () => {
		const [p, q] = setup('Sniper', ['dualwield']);
		const original = battle.getCallback;
		const originalRun = battle.runEvent;
		let count = 0;
		const power = [];
		battle.runEvent = function (...args) {
			const value = originalRun.apply(this, args);
			if (args[0] === 'BasePower') power.push(value);
			return value;
		};
		battle.getCallback = function (pokemon, effect, name, ...rest) {
			const callback = original.call(this, pokemon, effect, name, ...rest);
			if (pokemon === p && effect.id === 'sniper' && name === 'onModifyDamage' && typeof callback === 'function') {
				return function (...args) {
					count++;
					assert.equal(this.event.id, 'ModifyDamage');
					assert(power.length >= count);
					return callback.apply(this, args);
				};
			}
			return callback;
		};
		const move = Dex.getActiveMove('sacredsword');
		battle.runEvent('ModifyMove', p, q, move, move);
		move.willCrit = true;
		move.noDamageVariance = true;
		const damage = [1, 2].map(hit => {
			move.hit = hit;
			return battle.actions.getDamage(p, q, move, true);
		});
		assert.equal(count, 2);
		assert.deepEqual(power, [90, battle.modify(90, 0.15)]);
		assert(move.dualWieldBoosted);
		battle.getCallback = original;
		battle.runEvent = originalRun;
		const first = battle.actions.getDamage(p, q, { ...move, multihitType: undefined, hit: 1 }, true);
		p.setAbility('No Ability');
		p.getPassives = () => [];
		const second = battle.actions.getDamage(p, q, { ...move, multihitType: undefined, basePower: battle.modify(90, 0.15), hit: 1 }, true);
		assert.deepEqual(damage, [first, second]);
	});

	it('keeps global terrain boosts separate from the ordinary pair', () => {
		const [p, q] = setup('Dual Wield', [], 'razorleaf');
		battle.field.setTerrain('grassyterrain', p);
		assert.deepEqual(powers(p, q, 'razorleaf').result, [90, 90]);
	});
	it('does not activate Sniper on noncritical hits', () => {
		const [p, q] = setup('Sniper', ['dualwield']);
		const move = Dex.getActiveMove('sacredsword');
		battle.runEvent('ModifyMove', p, q, move, move);
		move.willCrit = false;
		const original = battle.runEvent, bp = [];
		battle.runEvent = function (...args) {
			const out = original.apply(this, args);
			if (args[0] === 'BasePower') bp.push(out);
			return out;
		};
		for (const hit of [1, 2]) {
			move.hit = hit;
			battle.actions.getDamage(p, q, move, true);
		}
		assert.deepEqual(bp, [54, 54]);
	});
	it('preserves Fresh Plumage consumption through Substitute while keeping the follow-up unboosted', () => {
		const [p, q] = setup('Fresh Plumage', ['dualwield'], 'airslash');
		q.hp = q.maxhp = 2000;
		q.addVolatile('substitute');
		const original = battle.runEvent, bp = [];
		battle.runEvent = function (...args) {
			const out = original.apply(this, args);
			if (args[0] === 'BasePower') bp.push(out);
			return out;
		};
		const move = Object.assign(Dex.getActiveMove('airslash'), { willCrit: false, accuracy: true, noDamageVariance: true });
		battle.actions.useMove(move, p, q);
		assert.deepEqual(bp, [75, battle.modify(75, 0.15)]);
		assert(p.m.approvedSignatures.freshPlumageUsed);
	});
	it('stops on a first-hit KO and cleans the per-damage context', () => {
		const [p, q] = setup('Tough Claws', ['dualwield']);
		q.hp = 1;
		battle.actions.useMove(Object.assign(Dex.getActiveMove('sacredsword'), { accuracy: true, willCrit: false }), p, q);
		assert.equal(q.hp, 0);
		assert(battle.log.some(line => line.includes('|-hitcount|') && line.endsWith('|1')));
		assert.equal(require('../../../dist/sim/dual-wield-power').dualWieldContext(battle), undefined);
	});
	it('keeps the boosted follow-up rule across a changed defender without leaking per-target state', () => {
		const [p, q] = setup('Tinted Lens', ['dualwield'], 'darkpulse');
		const move = Object.assign(Dex.getActiveMove('darkpulse'), { willCrit: false });
		battle.runEvent('ModifyMove', p, q, move, move);
		q.setType('Dark');
		move.hit = 1;
		battle.actions.getDamage(p, q, move, true);
		assert(move.dualWieldBoosted);
		q.setType('Normal');
		move.hit = 2;
		const original = battle.runEvent, bp = [];
		battle.runEvent = function (...args) {
			const out = original.apply(this, args);
			if (args[0] === 'BasePower') bp.push(out);
			return out;
		};
		battle.actions.getDamage(p, q, move, true);
		assert.deepEqual(bp, [battle.modify(80, 0.15)]);
		assert.equal(require('../../../dist/sim/dual-wield-power').dualWieldContext(battle), undefined);
	});
	it('does not grant damage or spend a booster through protection or immunity', () => {
		const [p, q] = setup('Fresh Plumage', ['dualwield'], 'airslash');
		q.addVolatile('protect');
		const hp = q.hp;
		battle.actions.useMove(Object.assign(Dex.getActiveMove('airslash'), { accuracy: true }), p, q);
		assert.equal(q.hp, hp);
		assert(!p.m.approvedSignatures?.freshPlumageUsed);
		q.removeVolatile('protect');
		q.setType('Ghost');
		const m = Dex.getActiveMove('eggbomb');
		battle.runEvent('ModifyMove', p, q, m, m);
		m.hit = 1;
		assert.equal(battle.actions.getDamage(p, q, m, true), false);
		assert.equal(require('../../../dist/sim/dual-wield-power').dualWieldContext(battle), undefined);
	});
});
