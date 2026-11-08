'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

describe('Ange flower strike and Eternal Floette', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(ability = 'Ange') {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Mew', ability, moves: ['moonblast', 'dazzlinggleam', 'tackle', 'drainingkiss'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		], [{ species: 'Blissey', ability: 'No Ability', moves: ['protect', 'substitute', 'splash'] }]]);
		battle.makeChoices('team 12', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	function attack(p, q, move = 'moonblast', patch = {}) {
		const start = battle.log.length;
		const active = battle.dex.getActiveMove(move);
		Object.assign(active, { accuracy: true, willCrit: false }, patch);
		battle.actions.useMove(active, p, { target: q });
		return battle.log.slice(start);
	}
	const damages = log => log.filter(line => line.startsWith('|-damage|p2a:'));
	it('replaces base Magic Guard while keeping the shared Eternal Flower passive', () => {
		assert.equal(Dex.species.get('floetteeternal').abilities[1], 'Natural Cure');
		for (const id of ['floetteeternal', 'floettemega']) {
			assert(!Object.values(Dex.species.get(id).abilities).includes('Magic Guard'));
			assert.deepEqual(Dex.species.get(id).passives, ['eternalflower']);
		}
		assert.match(Dex.abilities.get('ange').desc, /25%/);
	});
	it('adds one quarter-damage hit, rolls secondaries once, and refreshes only next turn', () => {
		const [p, q] = setup();
		battle.randomizer = damage => damage;
		const hp = q.hp;
		const log = attack(p, q, 'moonblast', { secondaries: [{ chance: 100, boosts: { spd: -1 } }] });
		assert.equal(damages(log).length, 4); // Exact and public packets for each hit.
		assert.equal(q.boosts.spd, -1);
		assert.equal(p.m.angeFlowerTurn, battle.turn);
		assert(q.hp < hp);
		assert.equal(damages(attack(p, q)).length, 2);
		battle.turn++;
		assert.equal(damages(attack(p, q)).length, 4);
	});
	it('uses quarter damage on the second hit with the same defenses', () => {
		const [p, q] = setup();
		battle.randomizer = damage => damage;
		const log = damages(attack(p, q, 'moonblast', { secondaries: [] }));
		const remaining = log.filter((_, i) => i % 2 === 0).map(line => Number(line.split('|')[3].split('/')[0]));
		const first = q.maxhp - remaining[0], second = remaining[0] - remaining[1];
		assert(Math.abs(second - first / 4) <= 2, `${first}, ${second}`);
	});
	for (const [label, move, patch] of [
		['non-Fairy', 'tackle', {}], ['spread', 'dazzlinggleam', {}],
		['existing multi-hit', 'moonblast', { multihit: 2 }], ['Z', 'moonblast', { isZ: true }],
		['Max', 'moonblast', { isMax: true }],
	]) it(`does not add a flower strike to ${label} moves`, () => {
		const [p, q] = setup();
		const m = battle.dex.getActiveMove(move); Object.assign(m, patch);
		battle.singleEvent('PrepareHit', p.getAbility(), p.abilityState, p, q, m);
		assert(!m.angeFlower);
	});
	it('Protect and a miss do not spend the use', () => {
		const [p, q] = setup();
		q.addVolatile('protect');
		assert.equal(damages(attack(p, q)).length, 0);
		assert.equal(p.m.angeFlowerTurn, undefined);
		q.removeVolatile('protect');
		assert.equal(damages(attack(p, q, 'moonblast', { accuracy: 0 })).length, 0);
		assert.equal(p.m.angeFlowerTurn, undefined);
		assert.equal(damages(attack(p, q)).length, 4);
	});
	it('Substitute-only damage does not trigger or spend the flower strike', () => {
		const [p, q] = setup();
		q.addVolatile('substitute');
		const log = attack(p, q);
		assert.equal(damages(log).length, 0);
		assert.equal(p.m.angeFlowerTurn, undefined);
	});
	it('an immune target does not trigger or spend the use', () => {
		const [p, q] = setup(); q.setAbility('Wonder Guard');
		assert.equal(damages(attack(p, q)).length, 0);
		assert.equal(p.m.angeFlowerTurn, undefined);
		q.setAbility('No Ability');
		assert.equal(damages(attack(p, q)).length, 4);
	});
	it('a KO never transfers the flower strike to another opponent', () => {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [[
			{ species: 'Mew', ability: 'Ange', moves: ['moonblast'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		], [
			{ species: 'Blissey', ability: 'No Ability', moves: ['splash'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		]]);
		battle.makeChoices('team 12', 'team 12');
		const p = battle.p1.active[0], q = battle.p2.active[0], other = battle.p2.active[1];
		q.hp = 1; const hp = other.hp;
		assert.equal(damages(attack(p, q)).length, 2);
		assert.equal(other.hp, hp);
	});
	it('suppression disables the extra strike', () => {
		const [p, q] = setup(); p.addVolatile('gastroacid');
		assert.equal(damages(attack(p, q)).length, 2);
	});
	it('losing and regaining Ange cannot refresh its use in the same turn', () => {
		const [p, q] = setup(); attack(p, q);
		p.setAbility('No Ability'); p.setAbility('Ange');
		assert.equal(damages(attack(p, q)).length, 2);
	});
	it('keeps Fairy Aura and charges ordinary recoil on Mega Floette', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Floette-Eternal', ability: 'Natural Cure', item: 'Floettite', moves: ['lightofruin'] },
		], [{ species: 'Blissey', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('team 1', 'team 1');
		const p = battle.p1.active[0], q = battle.p2.active[0];
		assert(battle.actions.runMegaEvo(p));
		assert.equal(p.ability, 'ange');
		assert.deepEqual(p.getPassives(), ['eternalflower']);
		const hp = p.hp;
		assert.equal(damages(attack(p, q, 'lightofruin')).length, 4);
		assert(p.hp < hp, 'Magic Guard must not block recoil');
		const m = battle.dex.getActiveMove('moonblast');
		assert(battle.runEvent('BasePower', p, q, m, 100) > 100, 'Fairy Aura remains active');
	});
	it('Natural Cure cures and heals on switching, while status can hurt the active base form', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Floette-Eternal', ability: 'Natural Cure', moves: ['splash'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('team 12', 'team 1');
		const p = battle.p1.active[0];
		p.hp = 100; p.setStatus('tox');
		battle.damage(10, p, p, battle.dex.conditions.get('tox'));
		assert.equal(p.hp, 90);
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(p.status, '');
		assert.equal(p.hp, 90 + Math.floor(p.baseMaxhp / 8));
	});
});
