/* eslint-disable @stylistic/max-statements-per-line */
'use strict';
const assert = require('assert').strict, common = require('../../common');
const { Dex } = require('../../../dist/sim');
let battle;
function setup(doubles = false) {
	const set = () => ({ species: 'Mew', ability: 'No Ability', moves: ['splash', 'tackle', 'skullbash'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' },
		[[set(), set(), set()], [set(), set(), set()]]);
	battle.makeChoices('team 123', 'team 123'); battle.field.terrain = '';
	for (const side of battle.sides) for (const p of side.pokemon) p.hp = p.maxhp = p.baseMaxhp = 4000;
	return [battle.p1.active[0], battle.p2.active[0]];
}
function entry(p) { battle.singleEvent('Start', p.getAbility(), p.abilityState, p); }
describe('Pressure per-user battle limit and Skull Bash power', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('limits the ordinary drop to each actual opponent once across repeated user entries', () => {
		const [p, q] = setup(); p.setAbility('Pressure'); assert.equal(q.boosts.def, -1); assert.equal(q.boosts.spd, -1);
		battle.makeChoices('switch 2', 'move 1'); battle.makeChoices('switch 2', 'move 1');
		assert.equal(battle.p1.active[0], p); assert.equal(q.boosts.def, -1); assert.equal(q.boosts.spd, -1);
	});
	it('tracks target identity rather than its slot and remembers targets after their return', () => {
		const [p, q] = setup(); p.setAbility('Pressure');
		battle.makeChoices('move 1', 'switch 2'); const other = battle.p2.active[0]; entry(p);
		assert.equal(other.boosts.def, -1); battle.makeChoices('move 1', 'switch 2');
		assert.equal(battle.p2.active[0], q); entry(p); assert.equal(q.boosts.def, 0);
		assert.equal(p.m.pressureTargets.length, 2);
	});
	it('each doubles Pressure user gets its own attempt on both foes', () => {
		const [p, q] = setup(true), ally = battle.p1.active[1], other = battle.p2.active[1];
		p.setAbility('Pressure'); ally.setAbility('Pressure');
		for (const foe of [q, other]) { assert.equal(foe.boosts.def, -2); assert.equal(foe.boosts.spd, -2); }
		entry(p); entry(ally); assert.equal(q.boosts.def, -2);
	});
	it('losing, regaining and copying Pressure do not replenish the same user', () => {
		const [p, q] = setup(); p.setAbility('Pressure'); p.setAbility('No Ability'); p.setAbility('Pressure');
		assert.equal(q.boosts.def, -1); q.setAbility('Pressure'); assert.equal(p.boosts.def, -1);
		p.transformInto(q); entry(p); assert.equal(q.boosts.def, -1);
	});
	it('Skill Swap transfers the ability but does not transfer or reset the users\' histories', () => {
		const [p, q] = setup(); q.setAbility('Run Away'); p.setAbility('Pressure');
		battle.actions.useMove('skillswap', q, { target: p });
		assert.equal(q.ability, 'pressure'); assert.equal(p.boosts.def, -1);
		battle.actions.useMove('skillswap', q, { target: p });
		assert.equal(p.ability, 'pressure'); assert.equal(q.boosts.def, -1);
		assert(p.m.pressureTargets.includes(q)); assert(q.m.pressureTargets.includes(p));
	});
	for (const protection of ['Clear Body', 'Mirror Armor']) it('a ' + protection + ' attempt consumes ordinary eligibility', () => {
		const [p, q] = setup(); q.setAbility(protection); p.setAbility('Pressure'); assert.equal(q.boosts.def, 0);
		assert.equal(p.boosts.def, protection === 'Mirror Armor' ? -1 : 0);
		q.setAbility('No Ability'); entry(p); assert.equal(q.boosts.def, 0); assert(p.m.pressureTargets.includes(q));
	});
	it('suppressed Pressure does not spend an attempt', () => {
		const [p, q] = setup(); q.setAbility('Neutralizing Gas'); p.setAbility('Pressure');
		assert.equal(q.boosts.def, 0); assert.equal(p.m.pressureTargets, undefined);
		q.setAbility('No Ability'); entry(p); assert.equal(q.boosts.def, -1);
	});
	it('Cold Eclipse repeats -2, preserving the ordinary allowance before and after', () => {
		const [p, q] = setup(); battle.field.terrain = 'coldeclipseterrain'; p.setAbility('Pressure');
		assert.equal(q.boosts.def, -2); entry(p); assert.equal(q.boosts.def, -4);
		assert.equal(p.m.pressureTargets, undefined); battle.field.terrain = ''; entry(p); assert.equal(q.boosts.def, -5);
		entry(p); assert.equal(q.boosts.def, -5); q.boosts.def = q.boosts.spd = 0;
		battle.field.terrain = 'coldeclipseterrain'; entry(p); assert.equal(q.boosts.def, -2);
		battle.field.terrain = ''; entry(p); assert.equal(q.boosts.def, -2);
	});
	it('preserves ordinary PP cost, Midnight Zone PP cost and Underwater conversion', () => {
		const [p, q] = setup(); battle.field.terrain = 'underwaterterrain'; p.setAbility('Pressure');
		assert.equal(battle.field.terrain, 'midnightzoneterrain');
		assert.equal(battle.singleEvent('DeductPP', p.getAbility(), p.abilityState, p, q), 2);
		battle.field.terrain = ''; assert.equal(battle.singleEvent('DeductPP', p.getAbility(), p.abilityState, p, q), 1);
		const pp = q.moveSlots[1].pp; battle.makeChoices('move 1', 'move 2'); assert.equal(q.moveSlots[1].pp, pp - 2);
	});
	for (const ability of ['Royal Escort', 'Omen Edge', 'Moonlight Vigil', 'Lunar Dread', 'Iron Dominion']) it(ability + ' shares the same Pressure budget', () => {
		const [p, q] = setup(); p.setAbility(ability); assert.equal(q.boosts.def, -1);
		p.setAbility('Pressure'); assert.equal(q.boosts.def, -1); entry(p); assert.equal(q.boosts.spd, -1);
	});
	it('Skull Bash is 80 BP and retains charging boosts and post-damage healing', () => {
		const [p, q] = setup(); assert.equal(Dex.moves.get('skullbash').basePower, 80); p.hp = 2000;
		battle.makeChoices('move 3', 'move 1'); assert.equal(q.hp, 4000);
		for (const stat of ['atk', 'def', 'spd']) assert.equal(p.boosts[stat], 1);
		assert(p.volatiles.twoturnmove); battle.makeChoices('move 1', 'move 1');
		assert(q.hp < 4000); assert.equal(p.hp, 2600); assert(!p.volatiles.twoturnmove);
	});
});
