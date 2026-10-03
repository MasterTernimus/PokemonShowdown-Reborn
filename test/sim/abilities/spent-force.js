'use strict';

const assert = require('assert').strict, common = require('../../common');

describe('Spent Force', () => {
	let b;

	afterEach(() => b?.destroy());

	function setup(ffa = false) {
		const p = { species: 'Slaking', ability: 'Spent Force', moves: ['tackle', 'splash', 'protect', 'slackoff'] }, t = { species: 'Mew', ability: 'No Ability', moves: ['splash'] };

		const teams = ffa ? [[p, p], [t, t], [t, t], [t, t]] : [[p, p], [t, t]];

		b = common.createBattle({ formatid: ffa ? 'gen9freeforall4pmistyfieldadrienn' : 'gen9nofieldsinglesgame' }, teams);

		b.makeChoices(...teams.map(() => 'team 12'));

		b.randomChance = (n, d) => n >= d;

		b.randomizer = x => x;

		return [b.p1.active[0], b.p2.active[0]];
	}

	function attack(p, t, extra = {}, name = 'tackle') {
		const m = b.dex.getActiveMove(name);

		if (!p.moveSlots.some(s => s.id === m.id))
			p.moveSlots.push({ move: m.name, id: m.id, pp: 10, maxpp: 10, target: m.target, disabled: false, disabledSource: '', used: false });

		Object.assign(m, { accuracy: true, willCrit: false, basePower: 10, secondaries: undefined }, extra);

		b.actions.runMove(m, p, p.getLocOf(t));
	}

	function damage(p, t, name = 'tackle') {
		const m = b.dex.getActiveMove(name);

		m.willCrit = false;

		return b.actions.getDamage(p, t, m);
	}

	it('preserves Slaking stats and ability slots', () => {
		const [p] = setup();

		assert.deepEqual(p.species.baseStats, { hp: 150, atk: 160, def: 100, spa: 95, spd: 65, spe: 100 });

		assert.deepEqual(p.species.abilities, { 0: 'Truant', 1: 'Slow Start', H: 'Spent Force' });
	});

	it('finishes every hit at full power before halving both damage categories and Speed', () => {
		const [p, t] = setup(), spe = p.getStat('spe'), phys = damage(p, t), special = damage(p, t, 'watergun'), hits = [];

		b.onEvent('DamagingHit', b.format, d => hits.push(d));

		attack(p, t, { multihit: 3 });

		assert.equal(hits.length, 3);

		assert(hits.every(x => x === hits[0]));

		assert.equal(p.getStat('spe'), Math.floor(spe / 2));

		assert(Math.abs(damage(p, t) * 2 - phys) <= 2);

		assert(Math.abs(damage(p, t, 'watergun') * 2 - special) <= 2);
	});

	it('keeps the whole initial FFA spread attack unpenalized', () => {
		const [p, t] = setup(true), during = [];

		b.onEvent('DamagingHit', b.format, () => during.push(p.m.spentForceExhausted));

		attack(p, t, { target: 'allAdjacentFoes' });

		assert.equal(during.length, 3);

		assert(during.every(x => !x));

		assert.equal(p.m.spentForceExhausted, true);
	});

	for (const mode of ['miss', 'protect', 'immune'])
		it('counts executed ' + mode, () => {
			const [p, t] = setup();

			if (mode === 'protect')
				t.addVolatile('protect');

			if (mode === 'immune')
				t.setType('Ghost');

			attack(p, t, mode === 'miss' ? { accuracy: 0 } : {});

			assert.equal(p.m.spentForceExhausted, true);
		});

	it('recovers on turn four despite repeated attacks and starts a new cycle', () => {
		const [p, t] = setup(), spe = p.getStat('spe'), full = damage(p, t);
		const start = b.turn;
		attack(p, t); assert.equal(p.m.spentForceRecoveryTurn, start + 3);
		for (let turn = start + 1; turn <= start + 2; turn++) {
			b.turn = turn; t.hp = t.maxhp;
			assert.equal(p.getStat('spe'), Math.floor(spe / 2));
			assert(Math.abs(damage(p, t) * 2 - full) <= 2);
			attack(p, t, { basePower: 1 }); assert.equal(p.m.spentForceRecoveryTurn, start + 3);
		}
		b.turn = start + 3; assert.equal(p.getStat('spe'), spe); assert.equal(damage(p, t), full);
		attack(p, t); assert.equal(p.m.spentForceRecoveryTurn, start + 6);
	});
	it('uses the same two-turn timer for status, healing, setup, Protect and waiting', () => {
		for (const move of ['splash', 'protect', 'slackoff', 'swordsdance']) {
			const [p, t] = setup(), spe = p.getStat('spe'), start = b.turn;
			attack(p, t);
			for (let turn = start + 1; turn <= start + 2; turn++) {
				b.turn = turn; attack(p, t, {}, move);
				assert.equal(p.getStat('spe'), Math.floor(spe / 2));
			}
			b.turn = start + 3; assert.equal(p.getStat('spe'), spe);
			b.destroy(); b = null;
		}
	});

	for (const interruption of ['slp', 'flinch', 'par'])
		it('does not consume an attack interrupted by ' + interruption, () => {
			const [p, t] = setup();

			if (interruption === 'flinch')
				p.addVolatile('flinch');
			else {
				p.setStatus(interruption);

				p.statusState.time = 4;
			}
			if (interruption === 'par')
				b.randomChance = () => true;

			attack(p, t);

			assert(!p.m.spentForceExhausted);
		});

	it('does not consume charging turns, then exhausts after the attack resolves', () => {
		const [p, t] = setup();

		attack(p, t, {}, 'solarbeam');

		assert(p.volatiles.solarbeam);

		assert(!p.m.spentForceExhausted);

		b.turn++;

		attack(p, t, {}, 'solarbeam');

		assert(!p.volatiles.solarbeam);

		assert(p.m.spentForceExhausted);
	});

	it('preserves exhaustion through suppression and ability replacement', () => {
		const [p, t] = setup(), spe = p.getStat('spe');

		attack(p, t);

		p.addVolatile('gastroacid');

		assert.equal(p.getStat('spe'), spe);

		b.turn++;

		p.removeVolatile('gastroacid');

		assert.equal(p.getStat('spe'), Math.floor(spe / 2));

		p.setAbility('No Ability');

		assert.equal(p.getStat('spe'), spe);

		p.setAbility('Spent Force');

		assert(p.m.spentForceExhausted);

		assert.equal(p.getStat('spe'), Math.floor(spe / 2));
	});

	it('expires on schedule even while suppressed or replaced', () => {
		const [p, t] = setup(), spe = p.getStat('spe');
		attack(p, t); p.addVolatile('gastroacid'); b.turn += 3;
		p.removeVolatile('gastroacid'); assert.equal(p.getStat('spe'), spe);
		attack(p, t); p.setAbility('No Ability'); b.turn += 3;
		p.setAbility('Spent Force'); assert.equal(p.getStat('spe'), spe);
	});
	it('clears immediately when actually leaving, including while the ability is replaced', () => {
		const [p, t] = setup(), spe = p.getStat('spe');

		attack(p, t);

		p.setAbility('No Ability');

		b.makeChoices('switch 2', 'move splash');

		assert(!p.m.spentForceExhausted);

		b.makeChoices('switch 2', 'move splash');

		p.setAbility('Spent Force');

		assert.equal(p.getStat('spe'), spe);
	});

	it('does not activate after a fatal attack', () => {
		const [p, t] = setup();

		p.hp = 1;

		attack(p, t, { selfdestruct: 'always' }, 'explosion');

		assert.equal(p.hp, 0);

		assert(!p.m.spentForceExhausted);
	});

	it('counts Struggle but preserves fixed damage semantics', () => {
		const [p, t] = setup();

		attack(p, t, {}, 'struggle');

		assert(p.m.spentForceExhausted);

		assert.equal(damage(p, t, 'seismictoss'), p.level);
	});
});
