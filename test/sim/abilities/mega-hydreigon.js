'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
const { DisabledSpecies } = require('../../../dist/data/disabled-species');

describe('Mega Hydreigon: Expiration and Hydra Flight', () => {
	let battle;
	// Exercise retained historical mechanics only. Public availability is tested separately.
	let wasDisabled;
	beforeEach(() => { wasDisabled = DisabledSpecies.has('hydreigonmega'); DisabledSpecies.delete('hydreigonmega'); });
	afterEach(() => { battle?.destroy(); battle = null; if (wasDisabled) DisabledSpecies.add('hydreigonmega'); });
	const set = (species = 'Mew', ability = 'No Ability', item = '') =>
		({species, ability, item, moves: ['splash', 'tackle', 'darkpulse', 'outrage', 'gildedhelix', 'earthpower']});
	function setup(gameType = 'singles', foeAbility = 'No Ability') {
		const teams = [[set('Hydreigon', 'Strings of Ruin', 'Hydreigonite'), set()], [set('Mew', foeAbility), set()]];
		if (gameType === 'freeforall') teams.push([set()], [set()]);
		battle = common.createBattle({gameType}, teams);
		const p = battle.p1.active[0], q = battle.p2.active[0];
		assert.equal(battle.actions.canMegaEvo(p), 'Hydreigon-Mega');
		assert(battle.actions.runMegaEvo(p));
		p.maxhp = p.baseMaxhp = 1000; p.hp = 600;
		battle.randomizer = damage => damage;
		return [p, q];
	}
	function use(source, target, patch = {}) {
		const move = Object.assign(Dex.getActiveMove('tackle'), {damage: 150, accuracy: true, willCrit: false}, patch);
		battle.actions.runMove(move, source, source.getLocOf(target));
	}

	it('uses Hydra Flight and Strings of Ruin without Controlled Fury', () => {
		const [p] = setup();
		assert.deepEqual(p.getPassives(), ['hydraflight']);
		assert.equal(p.ability, 'expiration');
		for (const id of ['stringsofruin', 'berserk', 'duskilate', 'hydrabond', 'levitate']) assert(p.hasAbilityOrPassive(id), id);
		for (const id of ['controlledfury', 'angerpoint', 'abyssalrebirth']) assert(!p.hasAbilityOrPassive(id), id);
		assert.equal(p.species.bst, 700);
	});
	for (const mode of ['singles', 'doubles', 'freeforall']) it(mode + ': no healing when crossing half HP', () => {
		const [p, q] = setup(mode); use(q, p); assert.equal(p.hp, 450);
		assert.equal(p.boosts.atk, 1); assert.equal(p.boosts.spa, 1);
		assert(!p.m.abyssalRebirthSpent);
	});
	it('does not heal after multi-hit damage', () => { const [p, q] = setup(); use(q, p, { multihit: 3 }); assert.equal(p.hp, 150); });
	it('Fairy damage is neutral and suppression restores the normal weakness', () => {
		const [p] = setup(); const move = Dex.getActiveMove('moonblast');
		assert.equal(p.runEffectiveness(move), 0);
		p.addVolatile('gastroacid'); assert.equal(p.runEffectiveness(move), 2);
	});
	it('the retired Rebirth package no longer has recovery hooks', () => {
		const a = Dex.abilities.get('abyssalrebirth');
		for (const key of ['onAfterDamageApplied', 'onAnyAfterAttackResolved', 'onAfterMoveSecondary']) assert.equal(a[key], undefined);
	});
	it('calculator metadata uses Hydra Flight', () => {
		const s = require('../../../dist/sim/custom-calculator').calculatorMetadata().species.find(s => s.name === 'Hydreigon-Mega');
		assert.deepEqual(s.passives, ['hydraflight']);
	});
	it('retains passive flight and three hits under Gastro Acid, without duplicate copied Hydra Bond', () => {
		const [p, q] = setup(); p.setAbility('Hydra Bond'); p.addVolatile('gastroacid');
		assert.equal(p.isGrounded(), null);
		use(p, q, {damage: 10});
		assert(battle.log.some(line => line.includes('|-hitcount|') && line.endsWith('|3')));
	});
	it('Mold Breaker bypasses Levitate and gravity grounds the Mega', () => {
		const [p, q] = setup('singles', 'Mold Breaker'); p.hp = 1000;
		use(q, p, {type: 'Ground'}); assert.equal(p.hp, 850);
		battle.field.addPseudoWeather('gravity', q); assert.equal(p.isGrounded(), true);
	});
	it('Expiration keeps independent per-head rolls and Duskilate conversion', () => {
		const [p, q] = setup(); q.hp = q.maxhp = 10000;
		const rolls = [];
		battle.randomChance = (x, y) => { if (x === 3 && y === 10) rolls.push(x); return false; };
		const types = [], original = battle.actions.getDamage;
		battle.actions.getDamage = function (source, target, move, ...args) {
			if (source === p) types.push(move.type);
			return original.call(this, source, target, move, ...args);
		};
		use(p, q, {damage: undefined, basePower: 20});
		assert.deepEqual(rolls, [3, 3, 3]); assert.deepEqual(types, ['Dark', 'Dark', 'Dark']);
	});
});
