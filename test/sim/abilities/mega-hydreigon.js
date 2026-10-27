'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex, TeamValidator} = require('../../../dist/sim');
const {DisabledSpecies} = require('../../../dist/data/disabled-species');

describe('Mega Hydreigon: Expiration and Abyssal Rebirth', () => {
	let battle;
	// Exercise retained historical mechanics only. Public availability is tested separately.
	beforeEach(() => DisabledSpecies.delete('hydreigonmega'));
	afterEach(() => { battle?.destroy(); battle = null; DisabledSpecies.add('hydreigonmega'); });
	const set = (species = 'Mew', ability = 'No Ability', item = '') =>
		({species, ability, item, moves: ['splash', 'tackle', 'darkpulse', 'outrage', 'gildedhelix', 'earthpower']});
	function setup(gameType = 'singles', foeAbility = 'No Ability') {
		const teams = [[set('Hydreigon', 'Worldbreaker', 'Hydreigonite'), set()], [set('Mew', foeAbility), set()]];
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
	it('evolves through the real stone route with the approved stats, ability and passive', () => {
		const [p] = setup();
		assert.equal(p.species.name, 'Hydreigon-Mega');
		assert.deepEqual(p.species.baseStats, {hp: 92, atk: 110, def: 125, spa: 130, spd: 125, spe: 118});
		assert.equal(p.species.bst, 700);
		assert.equal(p.ability, 'expiration');
		assert.deepEqual(p.getPassives(), ['abyssalrebirth']);
		for (const id of ['worldbreaker', 'controlledfury', 'berserk', 'duskilate', 'angerpoint', 'hydrabond', 'levitate']) {
			assert(p.hasAbilityOrPassive(id), id);
		}
		assert.equal(p.isGrounded(), null);
		const imported = {...set('Hydreigon', 'Worldbreaker', 'Hydreigonite'), moves: ['darkpulse', 'earthpower', 'outrage', 'gildedhelix']};
		const errors = new TeamValidator('gen9nofieldsinglesgame').validateSet(imported, {}) || [];
		assert.deepEqual(errors, []);
	});
	for (const gameType of ['singles', 'doubles', 'freeforall']) {
		it(`${gameType}: heals once after opposing damage, with independent Berserk and Anger Point boosts`, () => {
			const [p, q] = setup(gameType);
			use(q, p);
			assert.equal(p.hp, 700);
			assert.equal(p.boosts.atk, 2);
			assert.equal(p.boosts.spa, 1);
			assert(p.m.abyssalRebirthSpent);
			p.hp = 600;
			use(q, p);
			assert.equal(p.hp, 450);
			assert.equal(p.boosts.atk, 3);
			assert.equal(p.boosts.spa, 2);
		});
	}
	it('waits for all hits, then heals only once', () => {
		const [p, q] = setup();
		const seen = [], original = battle.actions.getDamage;
		battle.actions.getDamage = function (source, target, ...args) {
			if (target === p) seen.push(p.hp);
			return original.call(this, source, target, ...args);
		};
		use(q, p, {multihit: 3});
		assert.deepEqual(seen, [600, 450, 300]);
		assert.equal(p.hp, 400);
		assert.equal(p.boosts.spa, 1);
	});
	it('does not rescue a holder KOed by a later hit', () => {
		const [p, q] = setup();
		use(q, p, {multihit: 3, damage: 250});
		assert.equal(p.hp, 0);
		assert(!p.m.abyssalRebirthSpent);
	});
	it('triggers at exactly half HP but not when starting at or below half', () => {
		const [p, q] = setup();
		p.hp = 500; use(q, p, {damage: 50});
		assert.equal(p.hp, 450); assert(!p.m.abyssalRebirthSpent);
		p.hp = 600; use(q, p, {damage: 100});
		assert.equal(p.hp, 750);
	});
	it('survives switching and ability/passive restarts without replenishing recovery', () => {
		const [p, q] = setup(); use(q, p);
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		p.hp = 600; use(q, p);
		assert.equal(p.hp, 450);
	});
	it('ignores allied damage', () => {
		const [p] = setup('doubles');
		use(battle.p1.active[1], p);
		assert.equal(p.hp, 450); assert(!p.m.abyssalRebirthSpent);
	});
	for (const condition of ['brn', 'psn', 'sandstorm', 'stealthrock', 'recoil']) {
		it(`does not arm from ${condition}`, () => {
			const [p, q] = setup();
			battle.damage(150, p, q, Dex.conditions.get(condition));
			use(q, p, {damage: 10});
			assert.equal(p.hp, 440); assert(!p.m.abyssalRebirthSpent);
		});
	}
	for (const suppression of ['gastroacid', 'neutralizinggas']) {
		it(`${suppression} prevents recovery and does not queue a later heal`, () => {
			const [p, q] = setup('singles', suppression === 'neutralizinggas' ? 'Neutralizing Gas' : 'No Ability');
			if (suppression === 'gastroacid') p.addVolatile('gastroacid', q);
			use(q, p);
			assert.equal(p.hp, 450); assert(!p.m.abyssalRebirthSpent);
			if (suppression === 'gastroacid') p.removeVolatile('gastroacid');
			else q.setAbility('No Ability');
			use(q, p, {damage: 10});
			assert.equal(p.hp, 440);
			p.hp = 600; use(q, p);
			assert.equal(p.hp, 700);
		});
	}
	it('still resolves after a Sheer Force move, without depending on secondary-effect events', () => {
		const [p, q] = setup('singles', 'Sheer Force');
		use(q, p, {hasSheerForce: true});
		assert.equal(p.hp, 700);
	});
	it('heals after called attacks even when Sheer Force skips secondary events', () => {
		const [p, q] = setup('singles', 'Sheer Force');
		const move = Object.assign(Dex.getActiveMove('tackle'), {damage: 150, accuracy: true, hasSheerForce: true});
		battle.actions.useMove(move, q, {target: p, sourceEffect: Dex.moves.get('sleeptalk')});
		assert.equal(p.hp, 700);
	});
	it('heals after a delayed attack, after its independent Berserk boost', () => {
		const [p, q] = setup();
		const move = Object.assign(Dex.getActiveMove('doomdesire'), {damage: 150, accuracy: true, willCrit: false, onTry: undefined});
		battle.setActiveMove(move, q, p);
		battle.actions.trySpreadMoveHit([p], q, move, true);
		assert.equal(p.hp, 700);
		assert.equal(p.boosts.spa, 1);
	});
	for (const side of ['p3', 'p4']) it(`recognizes ${side} as an opponent in Free-for-All`, () => {
		const [p] = setup('freeforall');
		use(battle[side].active[0], p);
		assert.equal(p.hp, 700);
	});
	it('does not arm from Substitute damage or a protected attack', () => {
		const [p, q] = setup();
		p.addVolatile('substitute'); p.hp = 600;
		use(q, p); assert.equal(p.hp, 600); assert(!p.m.abyssalRebirthSpent);
		p.removeVolatile('substitute'); p.addVolatile('protect');
		use(q, p); assert.equal(p.hp, 600); assert(!p.m.abyssalRebirthSpent);
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
	it('Expiration permits repeated manual rampages without lock or confusion', () => {
		const [p, q] = setup(); q.hp = q.maxhp = 10000;
		for (let i = 0; i < 4; i++) {
			battle.actions.runMove('outrage', p, p.getLocOf(q));
			assert(!p.volatiles.lockedmove); assert(!p.volatiles.confusion);
		}
	});
	it('Expiration surviving a critical hit maximizes Attack and still heals', () => {
		const [p, q] = setup();
		const original = battle.actions.getDamage;
		battle.actions.getDamage = function (...args) { original.apply(this, args); return 150; };
		use(q, p, {damage: undefined, willCrit: true});
		assert.equal(p.boosts.atk, 6); assert.equal(p.hp, 700);
	});
	it('exports the same Mega, passive and ability in rules and calculator data', () => {
		const metadata = require('../../../dist/sim/custom-calculator').calculatorMetadata();
		const species = metadata.species.find(s => s.name === 'Hydreigon-Mega');
		assert(species);
		assert.equal(species.abilities[0], 'Expiration');
		assert.deepEqual(species.passives, ['abyssalrebirth']);
		const detail = require('../../../dist/server/rules-encyclopedia').rulesDetail('species', 'Hydreigon-Mega');
		assert.equal(detail.abilities[0].name, 'Expiration');
		assert.equal(detail.passives[0].name, 'Abyssal Rebirth');
		assert(detail.forms.includes('Hydreigon-Mega'));
		assert(!detail.forms.includes('Hydreigon-Mega-X'));
	});
});
