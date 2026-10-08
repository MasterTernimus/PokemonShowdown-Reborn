'use strict';

const assert = require('assert').strict;
const common = require('../../common');

describe('Battle Bond Water Shuriken restart', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(format = 'doubles', ability = 'Battle Bond') {
		const user = {species: 'Greninja', ability, moves: ['watershuriken']};
		const foe = {species: 'Mew', ability: 'No Ability', moves: ['splash']};
		const formats = {
			doubles: 'gen9nofielddoublesbattle', singles: 'gen9nofieldsinglesgame',
			multi: 'gen9multimistyfieldadrienn', ffa: 'gen9freeforall4pmistyfieldadrienn',
		};
		const teams = ['multi', 'ffa'].includes(format) ? [[user, foe], [foe, foe], [foe, foe], [foe, foe]] :
			[[user, foe], [foe, foe, foe]];
		battle = common.createBattle({formatid: formats[format]}, teams);
		battle.makeChoices(...teams.map(team => `team ${team.map((_, i) => i + 1).join('')}`));
		battle.randomChance = (n, d) => n >= d;
		battle.randomizer = n => n;
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	function capture(user, target, hits = 2) {
		const events = [];
		const original = battle.actions.getDamage;
		battle.actions.getDamage = function (source, defender, move, ...rest) {
			const damage = original.call(this, source, defender, move, ...rest);
			if (source === user && move.id === 'watershuriken') {
				events.push({target: defender, hit: move.hit, species: source.species.id, ability: source.ability,
					power: move.basePower, crit: move.willCrit, infiltrates: move.infiltrates,
					modifier: move.spilloverDamageModifier, damage, passives: [...source.getPassives()]});
			}
			return damage;
		};
		const move = battle.dex.getActiveMove('watershuriken');
		move.multihit = hits;
		battle.actions.useMove(move, user, {target});
		battle.actions.getDamage = original;
		return events;
	}
	for (const format of ['doubles', 'multi', 'ffa']) {
		for (const koHit of [1, 2]) {
			it(`restarts a full Ash volley after hit ${koHit} in ${format}`, () => {
				const [user, target] = setup(format);
				for (const foe of user.foes()) foe.hp = foe.maxhp = 10000;
				// A high first-target Sp. Def keeps both base hits deterministic and survivable.
				target.storedStats.spd = 10000;
				target.hp = koHit === 1 ? 1 : 4;
				const events = capture(user, target);
				assert.equal(events.filter(e => e.species === 'greninja').length, koHit);
				const ash = events.filter(e => e.species === 'greninjaash');
				assert.deepEqual(ash.map(e => e.hit), [1, 2, 3]);
				assert(ash.every(e => e.ability === 'shadowbond' && e.power === 30 && e.crit));
				assert(ash.every(e => e.modifier === undefined && !e.target.isAlly(user) && e.target !== target));
				assert(ash.every(e => e.passives.includes('proficient')));
				if (format === 'multi') assert(ash.every(e => e.target === battle.p4.active[0]));
				if (format === 'doubles') assert(ash.every(e => e.target === battle.p2.active[1]));
			});
		}
	}
	it('does not strike a reserve in singles', () => {
		const [user, target] = setup('singles');
		target.hp = 1;
		const reserve = target.side.pokemon[1], hp = reserve.hp;
		assert.equal(capture(user, target).length, 1);
		assert.equal(user.species.id, 'greninjaash');
		assert.equal(reserve.hp, hp);
	});
	it('uses the new ability to bypass a remaining foe Substitute', () => {
		const [user, target] = setup();
		target.hp = 1;
		const remaining = battle.p2.active[1];
		remaining.hp = remaining.maxhp = 10000;
		remaining.addVolatile('substitute');
		const subHP = remaining.volatiles.substitute.hp, hp = remaining.hp;
		const events = capture(user, target);
		assert.equal(events.length, 4);
		assert.equal(remaining.volatiles.substitute.hp, subHP);
		assert(remaining.hp < hp);
	});
	it('does not restart without Battle Bond', () => {
		const [user, target] = setup('doubles', 'No Ability');
		target.hp = 1;
		assert.equal(capture(user, target).length, 2);
		assert.equal(user.species.id, 'greninja');
	});
	it('does not restart without a KO', () => {
		const [user, target] = setup();
		target.hp = target.maxhp = 10000;
		assert.equal(capture(user, target).length, 2);
		assert.equal(user.species.id, 'greninja');
	});
	it('respects Protect and Water Absorb on remaining foes', () => {
		const [user, target] = setup('ffa');
		target.hp = 1;
		battle.p3.active[0].addVolatile('protect');
		battle.p4.active[0].setAbility('Water Absorb');
		assert.equal(capture(user, target).length, 1);
		assert.equal(user.species.id, 'greninjaash');
	});
	it('spends only one PP for the whole action', () => {
		const [user, target] = setup();
		target.hp = 1;
		battle.p2.active[1].hp = battle.p2.active[1].maxhp = 10000;
		const pp = user.moveSlots[0].pp;
		battle.makeChoices('move watershuriken 1, move splash', 'move splash, move splash');
		assert.equal(user.moveSlots[0].pp, pp - 1);
		assert.equal(user.species.id, 'greninjaash');
	});
	it('matches a native Ash volley damage without a spillover penalty', () => {
		const [user, target] = setup();
		target.hp = 1;
		const remaining = battle.p2.active[1];
		remaining.hp = remaining.maxhp = 10000;
		const restarted = capture(user, target).slice(1);
		const native = capture(user, remaining);
		assert.deepEqual(restarted.map(e => e.damage), native.map(e => e.damage));
		assert.deepEqual(native.map(e => e.hit), [1, 2, 3]);
	});
	it('does not grant another fresh volley when Ash gets a second KO', () => {
		const [user, target] = setup('ffa');
		for (const foe of user.foes()) foe.hp = 1;
		const events = capture(user, target);
		assert.deepEqual(events.map(e => e.hit), [1, 1, 2]);
		assert.equal(new Set(events.map(e => e.target)).size, 3);
	});
	it('stops if Destiny Bond faints Greninja during the KO', () => {
		const [user, target] = setup();
		target.hp = 1;
		target.addVolatile('destinybond');
		assert.equal(capture(user, target).length, 1);
		assert.equal(user.hp, 0);
	});
});
