/* eslint-disable @stylistic/max-statements-per-line */
'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
let battle;
function setup() {
	const set = (species, ability) => ({ species, ability, moves: ['shadowball', 'ironhead', 'tackle', 'splash'] });
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[set('Banette-Mega-Z', 'Cursed Armament'), set('Mew', 'No Ability')], [set('Mew', 'No Ability'), set('Mew', 'No Ability')]]);
	battle.makeChoices('team 12', 'team 12');
	const p = battle.p1.active[0], q = battle.p2.active[0]; p.formeChange('Banette-Mega-Z', null, true); p.setAbility('Cursed Armament');
	battle.field.terrain = ''; battle.field.auraField = ''; battle.field.weather = '';
	for (const m of [p, q]) { m.hp = m.maxhp = m.baseMaxhp = 3000; m.activeTurns = 2; for (const slot of m.moveSlots)slot.pp = 10; }
	return [p, q];
}
const queued = q => battle.queue.list.push({ choice: 'move', pokemon: q, move: Dex.getActiveMove('tackle'), targetLoc: 1 });
const attack = (p, q, id = 'shadowball') => battle.actions.runMove(id, p, 1);
describe('Approved mixed Cursed Armament', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const id of ['shadowball', 'ironhead'])it(id + ' retains category and uses 1.2 / 1.4 instead of stacking', () => {
		const [p, q] = setup(), move = Dex.getActiveMove(id), category = move.category;
		battle.runEvent('ModifyMove', p, q, move, move); assert.equal(move.category, category);
		battle.runEvent('TryMove', p, q, move); assert.equal(battle.runEvent('BasePower', p, q, move, 100), 120);
		p.abilityState.charged = true; battle.runEvent('TryMove', p, q, move); assert.equal(battle.runEvent('BasePower', p, q, move, 100), 140); assert(!p.abilityState.charged);
	});
	it('ordinary HP hit drains queued PP and stores exactly one charge without healing', () => {
		const [p, q] = setup(); queued(q); p.hp = 1000; attack(p, q);
		assert.equal(q.moveSlots[2].pp, 8); assert.equal(p.hp, 1000); assert(p.abilityState.charged);
		assert(!battle.log.some(l => l.includes('Cursed Armament') && l.includes('Tackle')));
	});
	it('charged hit drains last attempted move plus every other move and cannot recharge', () => {
		const [p, q] = setup(); p.abilityState.charged = true; q.lastMove = Dex.getActiveMove('ironhead'); queued(q); attack(p, q);
		assert.deepEqual(q.moveSlots.map(s => s.pp), [9, 7, 9, 9]); assert(!p.abilityState.charged);
	});
	it('returning new entry uses random damaging primary despite prior history', () => {
		const [p, q] = setup(); p.abilityState.charged = true; q.activeTurns = 0; q.m.cursedArmamentEntryTurn = battle.turn; q.lastMove = Dex.getActiveMove('splash');
		battle.sample = values => values[0]; attack(p, q);
		assert.deepEqual(q.moveSlots.map(s => s.pp), [7, 9, 9, 9]);
	});
	it('zero-PP historical primary remains primary while other slots lose one', () => {
		const [p, q] = setup(); p.abilityState.charged = true; q.lastMove = Dex.getActiveMove('ironhead'); q.moveSlots[1].pp = 0; attack(p, q);
		assert.deepEqual(q.moveSlots.map(s => s.pp), [9, 0, 9, 9]);
	});
	for (const gate of ['protect', 'substitute', 'immune', 'ko'])it(gate + ' spends charge without PP drain or recharge', () => {
		const [p, q] = setup(); p.abilityState.charged = true; queued(q);
		if (gate === 'protect')q.addVolatile('protect'); if (gate === 'substitute') { q.addVolatile('substitute'); q.volatiles.substitute.hp = 3000; } if (gate === 'immune')q.setType('Normal'); if (gate === 'ko')q.hp = 1;
		attack(p, q); assert.deepEqual(q.moveSlots.map(s => s.pp), [10, 10, 10, 10]); assert(!p.abilityState.charged);
	});
	it('coverage/status preserves charge and normal Curse is not converted', () => {
		const [p, q] = setup(); p.abilityState.charged = true; attack(p, q, 'tackle'); assert(p.abilityState.charged);
		attack(p, q, 'splash'); assert(p.abilityState.charged); const move = Dex.getActiveMove('curse'); battle.runEvent('ModifyMove', p, q, move, move); assert.equal(move.category, 'Status');
	});
	it('suppression and replacement clear charge, while copying does not transfer it', () => {
		const [p, q] = setup(); p.abilityState.charged = true; p.addVolatile('gastroacid'); p.ignoringAbility(); assert(!p.abilityState.charged);
		p.removeVolatile('gastroacid'); p.abilityState.charged = true; q.transformInto(p); assert(!q.abilityState.charged);
		p.setAbility('No Ability'); assert(!p.abilityState.charged);
	});
	it('an already-acted foe without a queued move gives no ordinary drain or charge', () => {
		const [p, q] = setup(); q.lastMove = Dex.getActiveMove('tackle'); attack(p, q); assert.deepEqual(q.moveSlots.map(s => s.pp), [10, 10, 10, 10]); assert(!p.abilityState.charged);
	});
	it('ordinary queue naturally fails after its selected move loses its last PP', () => {
		const [p, q] = setup(); p.storedStats.spe = 1000; q.storedStats.spe = 1; q.moveSlots[2].pp = 2;
		battle.makeChoices('move shadowball', 'move tackle'); assert(battle.log.some(l => l.includes('|cant|') && l.includes('|nopp|Tackle'))); assert(p.abilityState.charged);
	});
	it('ability replacement cannot refresh the per-Pokemon PP drain allowance', () => {
		const [p, q] = setup(); queued(q); attack(p, q); assert.equal(q.moveSlots[2].pp, 8);
		p.setAbility('No Ability'); p.setAbility('Cursed Armament'); attack(p, q); assert.equal(q.moveSlots[2].pp, 8); assert(!p.abilityState.charged);
	});
	it('last-turn entry does not trigger this-turn random drain even with activeTurns zero', () => {
		const [p, q] = setup(); q.activeTurns = 0; q.m.cursedArmamentEntryTurn = battle.turn - 1;
		attack(p, q); assert.deepEqual(q.moveSlots.map(s => s.pp), [10, 10, 10, 10]);
	});
	it('called attacks preserve charge and receive no weapon power or PP drain', () => {
		const [p, q] = setup(); p.abilityState.charged = true;
		const move = Dex.getActiveMove('shadowball'); move.sourceEffect = 'sleeptalk';
		battle.runEvent('TryMove', p, q, move); assert.equal(battle.runEvent('BasePower', p, q, move, 100), 100); assert(p.abilityState.charged);
	});
	it('unmapped charged history conservatively drains one from each current slot without redirecting the three', () => {
		const [p, q] = setup(); p.abilityState.charged = true; q.lastMove = Dex.getActiveMove('recover'); queued(q); attack(p, q);
		assert.deepEqual(q.moveSlots.map(s => s.pp), [9, 9, 9, 9]); assert(!p.abilityState.charged);
	});
	it('a real switch-in triggers charged random-primary drain only after the attack', () => {
		const [p] = setup(); p.abilityState.charged = true; const reserve = battle.p2.pokemon[1];
		const before = reserve.moveSlots.map(s => s.pp); battle.sample = values => values[0];
		battle.makeChoices('move shadowball', 'switch 2');
		assert.equal(reserve.m.cursedArmamentEntryTurn, battle.turn - 1);
		assert.deepEqual(reserve.moveSlots.map((s, i) => before[i] - s.pp), [3, 1, 1, 1]); assert(!p.abilityState.charged);
	});
	it('a multihit weapon drains once after all hits and cannot repeatedly charge', () => {
		const [p, q] = setup(); queued(q); const move = Dex.getActiveMove('shadowball'); move.multihit = 3; move.accuracy = true;
		battle.actions.runMove(move, p, 1); assert.equal(q.moveSlots[2].pp, 8); assert(p.abilityState.charged);
	});
});
