'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

describe('Shellcracker with Mold Breaker', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(ability = 'Water Absorb', item = '', gameType = 'singles') {
		const set = ability => ({species: 'Mew', ability, moves: ['crabhammer', 'earthquake', 'tackle', 'splash']});
		const teams = [[set('Shellcracker'), set('No Ability')], [{...set(ability), item}, set('No Ability')]];
		if (gameType === 'freeforall') teams.push([set('Water Absorb')], [set('Water Absorb')]);
		battle = common.createBattle({gameType}, teams);
		for (const side of battle.sides) for (const p of side.pokemon) p.hp = p.maxhp = p.baseMaxhp = 10000;
		battle.randomChance = (numerator, denominator) => numerator >= denominator;
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	function hit(p, q, id = 'crabhammer') {
		const move = Object.assign(Dex.getActiveMove(id), {accuracy: true});
		battle.actions.runMove(move, p, p.getLocOf(q));
		return move;
	}
	it('exposes Mold Breaker without changing the existing Crabhammer modifiers', () => {
		const [p, q] = setup();
		assert(p.hasAbility('moldbreaker'));
		const crab = Dex.getActiveMove('crabhammer');
		battle.runEvent('ModifyMove', p, q, crab, crab);
		assert.equal(crab.accuracy, 100); assert.equal(crab.willCrit, true); assert.equal(crab.ignoreAbility, true);
		const tackle = Dex.getActiveMove('tackle');
		battle.runEvent('ModifyMove', p, q, tackle, tackle);
		assert(tackle.ignoreAbility); assert(!tackle.willCrit);
		assert(/Mold Breaker/.test(Dex.abilities.get('shellcracker').desc));
	});
	for (const mode of ['singles', 'doubles', 'freeforall']) it(`${mode}: Crabhammer bypasses Water Absorb`, () => {
		const [p, q] = setup('Water Absorb', '', mode); hit(p, q); assert(q.hp < q.maxhp);
		if (mode === 'freeforall') for (const side of [battle.p3, battle.p4]) {
			const foe = side.active[0]; hit(p, foe); assert(foe.hp < foe.maxhp);
		}
	});
	it('other moves also bypass abilities, including Levitate', () => {
		const [p, q] = setup('Levitate'); hit(p, q, 'earthquake'); assert(q.hp < q.maxhp);
	});
	it('bypasses Shell Armor critical protection with Crabhammer', () => {
		const [p, q] = setup('Shell Armor'); hit(p, q);
		assert(battle.log.some(line => line.startsWith('|-crit|')));
	});
	it('Ability Shield preserves Water Absorb', () => {
		const [p, q] = setup('Water Absorb', 'Ability Shield'); hit(p, q); assert.equal(q.hp, q.maxhp);
	});
	it('Ability Shield preserves Shell Armor critical protection', () => {
		const [p, q] = setup('Shell Armor', 'Ability Shield'); hit(p, q);
		assert(q.hp < q.maxhp); assert(!battle.log.some(line => line.startsWith('|-crit|')));
	});
	it('Gastro Acid suppresses bypass and Crabhammer modifications', () => {
		const [p, q] = setup(); p.addVolatile('gastroacid', q);
		const move = Dex.getActiveMove('crabhammer'); battle.runEvent('ModifyMove', p, q, move, move);
		assert.equal(move.accuracy, Dex.moves.get('crabhammer').accuracy); assert(!move.willCrit); assert(!move.ignoreAbility);
		hit(p, q); assert.equal(q.hp, q.maxhp);
	});
	it('Neutralizing Gas suppresses both components', () => {
		const [p, q] = setup('Neutralizing Gas');
		const move = Dex.getActiveMove('crabhammer'); battle.runEvent('ModifyMove', p, q, move, move);
		assert.equal(move.accuracy, Dex.moves.get('crabhammer').accuracy); assert(!move.willCrit); assert(!move.ignoreAbility);
	});
	it('does not bypass Protect or type immunity', () => {
		const [p, q] = setup('No Ability'); q.addVolatile('protect'); hit(p, q); assert.equal(q.hp, q.maxhp);
		q.removeVolatile('protect'); q.setType('Ghost'); hit(p, q, 'tackle'); assert.equal(q.hp, q.maxhp);
	});
});
