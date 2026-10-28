'use strict';

const assert = require('assert').strict;
const common = require('../../common');

describe('Room splits, swaps and support', () => {
	let battle;
	afterEach(() => battle?.destroy());
	const set = (ability = 'No Ability', species = 'Mew') => ({ species, ability,
		moves: ['powershift', 'powertrick', 'batonpass', 'splash'] });
	function setup(ability = 'No Ability', other = 'No Ability') {
		battle = common.createBattle({}, [[set(ability), set('No Ability', 'Blissey')], [set(other)]]);
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	const use = (id, p, q = p) => battle.actions.useMove(id, p, { target: q });
	const room = (id, p) => battle.field.addPseudoWeather(id, p);
	const raw = p => ({ ...p.storedStats });
	const asymmetric = p => Object.assign(p.storedStats, { atk: 100, def: 200, spa: 300, spd: 400, spe: 150 });

	for (const ability of ['No Ability', 'Mega Launcher']) {
		it(`Heal Pulse heals 75% in Magic Room without stacking (${ability})`, () => {
			const [p, q] = setup(ability);
			q.hp = 1; q.baseMaxhp = q.maxhp = 400;
			room('magicroom', p);
			use('healpulse', p, q);
			assert.equal(q.hp, 301);
			battle.field.removePseudoWeather('magicroom'); q.hp = 1;
			use('healpulse', p, q);
			assert.equal(q.hp, ability === 'Mega Launcher' ? 301 : 201);
		});
	}
	it('Heal Pulse still respects Heal Block and full HP', () => {
		const [p, q] = setup(); room('magicroom', p);
		q.hp = 1; q.addVolatile('healblock', p);
		use('healpulse', p, q); assert.equal(q.hp, 1);
		q.removeVolatile('healblock'); q.hp = q.maxhp;
		use('healpulse', p, q); assert.equal(q.hp, q.maxhp);
	});
	for (const magic of [false, true]) {
		it(`Magic Coat protects active allies only in Magic Room (${magic})`, () => {
			battle = common.createBattle({ gameType: 'doubles' }, [[set(), set()], [set(), set()]]);
			const [p, ally] = battle.p1.active, q = battle.p2.active[0];
			if (magic) room('magicroom', p);
			use('magiccoat', p);
			assert.equal(!!ally.volatiles.magiccoat, magic);
			use('taunt', q, ally);
			assert.equal(!!ally.volatiles.taunt, !magic);
			assert.equal(!!q.volatiles.taunt, magic);
		});
	}
	it('Magic Coat does not bounce twice and still reflects hazards once', () => {
		battle = common.createBattle({ gameType: 'doubles' }, [[set(), set()], [set(), set()]]);
		const p = battle.p1.active[0], ally = battle.p1.active[1], q = battle.p2.active[0];
		room('magicroom', p); use('magiccoat', p); use('magiccoat', q);
		use('taunt', q, ally);
		assert(q.volatiles.taunt); assert(!ally.volatiles.taunt);
		use('spikes', q, p);
		assert(!p.side.sideConditions.spikes);
		assert.equal(q.side.sideConditions.spikes.layers, 1);
	});
	it('Magic Coat persists for the turn after Magic Room ends, then expires', () => {
		battle = common.createBattle({ gameType: 'doubles' }, [[set(), set()], [set(), set()]]);
		const [p, ally] = battle.p1.active, q = battle.p2.active[0];
		room('magicroom', p); use('magiccoat', p); battle.field.removePseudoWeather('magicroom');
		use('taunt', q, ally); assert(!ally.volatiles.taunt); assert(q.volatiles.taunt);
		battle.makeChoices();
		assert(!p.volatiles.magiccoat && !ally.volatiles.magiccoat);
	});
	it('Magic Coat does not protect opposing players in free-for-all', () => {
		battle = common.createBattle({ gameType: 'freeforall' }, [[set()], [set()], [set()], [set()]]);
		const p = battle.p1.active[0]; room('magicroom', p); use('magiccoat', p);
		assert(p.volatiles.magiccoat);
		for (const side of battle.sides.slice(1)) assert(!side.active[0].volatiles.magiccoat);
	});
	for (const [id, stats, change] of [['guardsplit', ['def', 'spd'], 1], ['powersplit', ['atk', 'spa'], -1]]) {
		for (const ability of ['No Ability', 'Contrary', 'Simple']) {
			it(`${id} averages raw stats then applies normal stages (${ability})`, () => {
				const [p, q] = setup(ability, ability); room('wonderroom', p);
				for (const stat of stats) { p.storedStats[stat] = 101; q.storedStats[stat] = 200; }
				use(id, p, q);
				for (const mon of [p, q]) for (const stat of stats) {
					assert.equal(mon.storedStats[stat], 150);
					assert.equal(mon.boosts[stat], change * (ability === 'Contrary' ? -1 : ability === 'Simple' ? 2 : 1));
				}
			});
		}
		it(`${id} has no added stages outside Wonder Room`, () => {
			const [p, q] = setup(); use(id, p, q);
			for (const mon of [p, q]) for (const stat of stats) assert.equal(mon.boosts[stat], 0);
		});
		for (const protection of ['protect', 'substitute']) {
			it(`${id} blocked by ${protection} does not change raw stats or stages`, () => {
				const [p, q] = setup(); asymmetric(p); room('wonderroom', p);
				if (protection === 'protect') q.addVolatile('protect');
				else use(protection, q);
				const before = [raw(p), raw(q)];
				use(id, p, q);
				assert.deepEqual([raw(p), raw(q)], before);
				for (const mon of [p, q]) for (const stat of stats) assert.equal(mon.boosts[stat], 0);
			});
		}
	}
	it('Power Split respects opposing Clear Body while still averaging stats', () => {
		const [p, q] = setup('No Ability', 'Clear Body'); room('wonderroom', p);
		p.storedStats.atk = 100; q.storedStats.atk = 200; use('powersplit', p, q);
		assert.equal(q.storedStats.atk, 150); assert.equal(q.boosts.atk, 0); assert.equal(p.boosts.atk, -1);
	});
	for (const [id, stats] of [['powerswap', ['atk', 'spa']], ['heartswap', ['atk', 'def', 'spa', 'spd', 'spe', 'accuracy', 'evasion']]]) {
		it(`${id} clears only the user's received negative stages after swapping`, () => {
			const [p, q] = setup('Contrary'); room('wonderroom', p);
			for (const stat of stats) { p.boosts[stat] = -3; q.boosts[stat] = -2; }
			q.boosts.atk = 4; use(id, p, q);
			for (const stat of stats) { assert.equal(p.boosts[stat], stat === 'atk' ? 4 : 0); assert.equal(q.boosts[stat], -3); }
		});
		it(`${id} blocked by Protect performs no cleanup`, () => {
			const [p, q] = setup(); room('wonderroom', p); p.setBoost({ atk: -3, spa: -2 });
			q.addVolatile('protect'); use(id, p, q);
			assert.equal(p.boosts.atk, -3); assert.equal(p.boosts.spa, -2);
		});
	}
	it('Speed Swap exchanges raw Speed and Speed stages, then cleanses only the user', () => {
		const [p, q] = setup(); room('wonderroom', p);
		p.storedStats.spe = 100;
		q.storedStats.spe = 200;
		p.boosts.spe = -3;
		q.boosts.spe = -2;
		use('speedswap', p, q);
		assert.equal(p.storedStats.spe, 200); assert.equal(q.storedStats.spe, 100);
		assert.equal(p.boosts.spe, 0); assert.equal(q.boosts.spe, -3);
	});
	it('Speed Swap leaves stages unchanged outside the room or when blocked', () => {
		const [p, q] = setup(); p.boosts.spe = -3; q.boosts.spe = 2;
		use('speedswap', p, q); assert.equal(p.boosts.spe, -3); assert.equal(q.boosts.spe, 2);
		room('wonderroom', p); q.addVolatile('protect'); use('speedswap', p, q);
		assert.equal(p.boosts.spe, -3); assert.equal(q.boosts.spe, 2);
	});
	it('successful Pain Split clears both participants confusion after averaging HP', () => {
		const [p, q] = setup(); room('wonderroom', p);
		p.hp = 100;
		q.hp = 200;
		p.addVolatile('confusion');
		q.addVolatile('confusion');
		use('painsplit', p, q);
		assert.equal(p.hp, 150); assert.equal(q.hp, 150);
		assert(!p.volatiles.confusion && !q.volatiles.confusion);
	});
	it('Pain Split cannot cleanse through Protect or outside Wonder Room', () => {
		const [p, q] = setup(); p.addVolatile('confusion'); q.addVolatile('confusion');
		use('painsplit', p, q); assert(p.volatiles.confusion && q.volatiles.confusion);
		room('wonderroom', p); q.addVolatile('protect'); use('painsplit', p, q);
		assert(p.volatiles.confusion && q.volatiles.confusion);
	});
	it('Power Trick exchanges current stages on each toggle in Wonder Room, without Contrary inversion', () => {
		const [p] = setup('Contrary'); asymmetric(p); room('wonderroom', p);
		p.setBoost({ atk: -2, def: 3 }); use('powertrick', p);
		assert.equal(p.storedStats.atk, 200); assert.equal(p.storedStats.def, 100);
		assert.equal(p.boosts.atk, 3); assert.equal(p.boosts.def, -2);
		p.setBoost({ atk: 4 }); use('powertrick', p);
		assert.equal(p.storedStats.atk, 100); assert.equal(p.storedStats.def, 200);
		assert.equal(p.boosts.atk, -2); assert.equal(p.boosts.def, 4);
		assert(!p.volatiles.powertrick);
	});
	it('Power Trick stage changes persist after room expiry and do not swap on an outside-room toggle', () => {
		const [p] = setup();
		p.setBoost({ atk: 1, def: 3 });
		room('wonderroom', p);
		use('powertrick', p);
		battle.field.removePseudoWeather('wonderroom'); use('powertrick', p);
		assert.equal(p.boosts.atk, 3); assert.equal(p.boosts.def, 1);
	});
	for (const active of [false, true]) {
		it(`Power Shift remembers which pairs it swapped and reverses them outside the room (${active})`, () => {
			const [p] = setup();
			asymmetric(p);
			const before = raw(p);
			p.setBoost({ atk: 2, spa: -1 });
			if (active) room('wonderroom', p); use('powershift', p);
			assert.equal(p.storedStats.atk, 200); assert.equal(p.storedStats.def, 100);
			assert.equal(p.storedStats.spa, active ? 400 : 300); assert.equal(p.storedStats.spd, active ? 300 : 400);
			assert.equal(p.boosts.atk, 2); assert.equal(p.boosts.spa, -1);
			assert.equal(battle.log.some(l => l.includes('|Power Shift|[fullshift]')), active);
			if (active) battle.field.removePseudoWeather('wonderroom'); else room('wonderroom', p);
			use('powershift', p); assert.deepEqual(raw(p), before); assert(!p.volatiles.powershift);
		});
	}
	it('Power Shift and Power Trick compose and reverse without corrupting either stat pair', () => {
		const [p] = setup();
		asymmetric(p);
		const before = raw(p);
		room('wonderroom', p);
		use('powershift', p); use('powertrick', p);
		assert.equal(p.storedStats.atk, 100); assert.equal(p.storedStats.spa, 400);
		use('powershift', p); use('powertrick', p); assert.deepEqual(raw(p), before);
	});
	for (const move of ['powershift', 'powertrick']) {
		it(`${move} survives Baton Pass with no duplicate stage swap and resets on ordinary switch`, () => {
			const [p] = setup(); const recipient = battle.p1.pokemon[1], base = raw(recipient);
			room('wonderroom', p); p.setBoost({ atk: -1, def: 3 }); use(move, p);
			const stages = { ...p.boosts }; battle.field.removePseudoWeather('wonderroom');
			battle.makeChoices('move batonpass', 'move splash'); battle.makeChoices('switch 2');
			assert.equal(battle.p1.active[0], recipient); assert(recipient.volatiles[move]);
			assert.deepEqual(recipient.boosts, stages);
			assert.equal(recipient.storedStats.atk, base.def); assert.equal(recipient.storedStats.def, base.atk);
			assert.equal(recipient.storedStats.spa, move === 'powershift' ? base.spd : base.spa);
			use(move, recipient); assert.deepEqual(raw(recipient), base);
			room('wonderroom', recipient); use(move, recipient);
			battle.makeChoices('switch 2', 'move splash');
			assert(!recipient.volatiles[move]); assert.deepEqual(raw(recipient), base);
		});
	}
});
