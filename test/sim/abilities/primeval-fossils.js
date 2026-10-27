'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex, TeamValidator} = require('../../../dist/sim');

describe('Primeval fossil pair', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	const set = (ability = 'No Ability', species = 'Mew') => ({species, ability, moves: ['tackle', 'splash', 'doubleedge', 'payback']});
	function setup(ability, foeAbility = 'No Ability', gameType = 'singles') {
		const teams = [[set(ability), set()], [set(foeAbility), set()]];
		if (gameType === 'freeforall') teams.push([set()], [set()]);
		battle = common.createBattle({gameType}, teams);
		for (const side of battle.sides) for (const p of side.pokemon) p.hp = p.maxhp = p.baseMaxhp = 1000;
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	function hit(source, target, damage = 200, patch = {}) {
		const move = Object.assign(Dex.getActiveMove('tackle'), {damage, accuracy: true, willCrit: false}, patch);
		battle.actions.runMove(move, source, source.getLocOf(target));
	}
	it('updates only the intended evolved species slots, stats and typing', () => {
		const rampardos = Dex.species.get('Rampardos'), bastiodon = Dex.species.get('Bastiodon');
		assert.deepEqual(rampardos.types, ['Rock', 'Steel']);
		assert.deepEqual(rampardos.abilities, {0: 'Intrepid Sword', 1: 'Mold Breaker', H: 'Primeval Skull'});
		assert.deepEqual(bastiodon.abilities, {0: 'Dauntless Shield', 1: 'Stalwart', H: 'Primeval Shield'});
		assert.deepEqual(bastiodon.baseStats, {hp: 80, atk: 65, def: 168, spa: 49, spd: 138, spe: 30});
		assert.equal(rampardos.bst, 530); assert.equal(bastiodon.bst, 530);
		assert.deepEqual(rampardos.passives, ['relicarmor']); assert.deepEqual(bastiodon.passives, ['relicarmor']);
		for (const name of ['Cranidos', 'Shieldon']) assert(!Object.values(Dex.species.get(name).abilities).some(a => a.startsWith('Primeval')));
		const validator = new TeamValidator('gen9nofieldsinglesgame');
		for (const [species, ability] of [['Rampardos', 'Primeval Skull'], ['Bastiodon', 'Primeval Shield']]) {
			assert.deepEqual(validator.validateSet({...set(ability, species), moves: ['tackle']}, {}) || [], []);
		}
	});
	for (const hp of [1000, 333, 1]) it(`Primeval Skull guarantees one survival from ${hp} HP`, () => {
		const [p, q] = setup('Primeval Skull'); p.hp = hp;
		hit(q, p, 1000); assert.equal(p.hp, 1); assert(p.m.primevalSkullSpent);
		hit(q, p, 1); assert.equal(p.hp, 0);
	});
	it('Skull does not spend survival on nonlethal hits, residual damage or ordinary recoil', () => {
		const [p, q] = setup('Primeval Skull');
		hit(q, p, 100); assert(!p.m.primevalSkullSpent);
		battle.damage(100, p, q, Dex.conditions.get('brn')); assert.equal(p.hp, 800);
		hit(p, q, 100, {recoil: [1, 2]}); assert.equal(p.hp, 800); assert(!p.m.primevalSkullSpent);
		assert(p.hasAbility('rockhead'));
	});
	it('Skull has no second survival for later hits in the same move', () => {
		const [p, q] = setup('Primeval Skull'); p.hp = 100;
		hit(q, p, 100, {multihit: 2}); assert.equal(p.hp, 0);
	});
	it('Skull survival is not reset by switching or ability replacement', () => {
		const [p, q] = setup('Primeval Skull'); hit(q, p, 1000);
		battle.makeChoices('switch 2', 'move splash'); battle.makeChoices('switch 2', 'move splash');
		p.setAbility('No Ability'); p.setAbility('Primeval Skull'); p.hp = 300;
		hit(q, p, 300); assert.equal(p.hp, 0);
	});
	for (const suppression of ['gastroacid', 'neutralizinggas']) it(`Skull is suppressed by ${suppression} without spending its survival`, () => {
		const [p, q] = setup('Primeval Skull', suppression === 'neutralizinggas' ? 'Neutralizing Gas' : 'No Ability');
		if (suppression === 'gastroacid') p.addVolatile('gastroacid', q);
		hit(q, p, 1000); assert.equal(p.hp, 0); assert(!p.m.primevalSkullSpent);
	});
	for (const category of ['Physical', 'Special']) it(`Shield reflects and heals half of ${category} HP damage without a contact requirement`, () => {
		const [p, q] = setup('Primeval Shield');
		hit(q, p, 200, {category, flags: {protect: 1}});
		assert.equal(p.hp, 900); assert.equal(q.hp, 900);
	});
	it('Shield processes each hit without recursively reflecting recoil', () => {
		const [p, q] = setup('Primeval Shield', 'Primeval Shield');
		hit(q, p, 200, {multihit: 3}); assert.equal(p.hp, 700); assert.equal(q.hp, 700);
	});
	it('Shield stops the remaining hits if recoil knocks out the attacker', () => {
		const [p, q] = setup('Primeval Shield'); q.hp = 100;
		hit(q, p, 200, {multihit: 3}); assert.equal(p.hp, 900); assert.equal(q.hp, 0);
	});
	it('Shield reflects actual damage from a lethal hit but cannot revive its holder', () => {
		const [p, q] = setup('Primeval Shield'); p.hp = 100;
		hit(q, p, 500); assert.equal(p.hp, 0); assert.equal(q.hp, 950);
	});
	it('Shield ignores Substitute-only damage and protected hits', () => {
		const [p, q] = setup('Primeval Shield'); p.addVolatile('substitute'); p.hp = 1000;
		hit(q, p, 100); assert.equal(p.hp, 1000); assert.equal(q.hp, 1000);
		p.removeVolatile('substitute'); p.addVolatile('protect'); hit(q, p);
		assert.equal(p.hp, 1000); assert.equal(q.hp, 1000);
	});
	for (const effect of ['brn', 'sandstorm', 'recoil']) it(`Shield ignores ${effect} damage`, () => {
		const [p, q] = setup('Primeval Shield');
		battle.damage(200, p, q, Dex.conditions.get(effect)); assert.equal(p.hp, 800); assert.equal(q.hp, 1000);
	});
	for (const ability of ['Rock Head', 'Primeval Skull', 'Magic Guard']) it(`${ability} blocks Shield recoil while recovery remains independent`, () => {
		const [p, q] = setup('Primeval Shield', ability);
		hit(q, p); assert.equal(p.hp, 900); assert.equal(q.hp, 1000);
	});
	it('Heal Block stops Shield healing without stopping its recoil', () => {
		const [p, q] = setup('Primeval Shield'); p.addVolatile('healblock', q);
		hit(q, p); assert.equal(p.hp, 800); assert.equal(q.hp, 900);
	});
	for (const suppression of ['gastroacid', 'neutralizinggas']) it(`${suppression} stops both Shield effects`, () => {
		const [p, q] = setup('Primeval Shield', suppression === 'neutralizinggas' ? 'Neutralizing Gas' : 'No Ability');
		if (suppression === 'gastroacid') p.addVolatile('gastroacid', q);
		hit(q, p); assert.equal(p.hp, 800); assert.equal(q.hp, 1000);
	});
	it('Shield applies to allied hits in doubles', () => {
		const [p] = setup('Primeval Shield', 'No Ability', 'doubles'); const ally = battle.p1.active[1];
		hit(ally, p); assert.equal(p.hp, 900); assert.equal(ally.hp, 900);
	});
	it('Shield recognizes every attacker in Free-for-All', () => {
		const [p] = setup('Primeval Shield', 'No Ability', 'freeforall');
		for (const side of [battle.p2, battle.p3, battle.p4]) { hit(side.active[0], p); assert.equal(side.active[0].hp, 900); }
		assert.equal(p.hp, 700);
	});
	it('Shield rounds odd damage down and retains a minimum of one', () => {
		const [p, q] = setup('Primeval Shield');
		hit(q, p, 3); assert.equal(p.hp, 998); assert.equal(q.hp, 999);
		hit(q, p, 1); assert.equal(p.hp, 998); assert.equal(q.hp, 998);
	});
});
