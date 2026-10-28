'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

describe('World Axis', () => {
	let battle;
	afterEach(() => battle?.destroy());
	const set = (species = 'Claydol-Mega', ability = 'World Axis', moves = ['guardswap', 'tackle', 'splash', 'batonpass']) => ({species, ability, moves});
	function setup(ability = 'World Axis') {
		battle = common.createBattle({}, [[set('Claydol-Mega', ability), set('Magikarp', 'No Ability')], [set('Mew', 'No Ability')]]);
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	const use = (id, p, q = p) => battle.actions.useMove(id, p, {target: q});
	const charged = p => !!p.volatiles.worldaxis;
	it('starts Wonder Room on entry and keeps passive Levitate with the 600 BST spread', () => {
		const [p] = setup();
		assert.equal(battle.field.pseudoWeather.wonderroom.duration, 5);
		assert.deepEqual(p.species.baseStats, {hp: 60, atk: 100, def: 135, spa: 100, spd: 150, spe: 55});
		assert.deepEqual(p.getPassives(), ['levitate']);
		assert.equal(p.isGrounded(), null);
		p.addVolatile('gastroacid'); assert.equal(p.isGrounded(), null);
		battle.field.addPseudoWeather('gravity', p); assert.equal(p.isGrounded(), true);
		assert(!p.hasAbility('powerspot')); assert(!p.hasAbility('elevate'));
	});
	it('does not toggle or refresh an existing Wonder Room', () => {
		const [p] = setup('No Ability'); battle.field.addPseudoWeather('wonderroom', p);
		battle.field.pseudoWeather.wonderroom.duration = 2;
		p.setAbility('worldaxis'); assert.equal(battle.field.pseudoWeather.wonderroom.duration, 2);
	});
	for (const id of ['guardsplit', 'powersplit', 'guardswap', 'powerswap', 'heartswap', 'speedswap', 'painsplit', 'powertrick', 'powershift']) {
		it(`charges after successful ${id}, without stacking`, () => {
			const [p, q] = setup();
			use(id, p, ['powertrick', 'powershift'].includes(id) ? p : q);
			assert(charged(p));
			use(id, p, ['powertrick', 'powershift'].includes(id) ? p : q);
			assert(charged(p));
			assert.equal(battle.log.filter(l => l.includes('|-start|') && l.includes('ability: World Axis')).length, 1);
		});
	}
	for (const id of ['guardsplit', 'powersplit', 'guardswap', 'powerswap', 'heartswap', 'speedswap', 'painsplit']) {
		it(`does not charge when Protect blocks ${id}`, () => {
			const [p, q] = setup(); q.addVolatile('protect'); use(id, p, q); assert(!charged(p));
		});
	}
	it('does not charge from blocked splits, unrelated setup, recovery or ability suppression', () => {
		const [p, q] = setup(); use('substitute', q); use('powersplit', p, q); assert(!charged(p));
		for (const id of ['recover', 'cosmicpower', 'wonderroom']) { use(id, p); assert(!charged(p)); }
		p.addVolatile('gastroacid'); use('guardswap', p, q); assert(!charged(p));
	});
	it('boosts exactly the next attack, leaving subsequent attacks unboosted', () => {
		const [p, q] = setup(); q.hp = q.maxhp = 10000;
		use('guardswap', p, q); use('tackle', p, q);
		const boosted = p.lastMoveUsed;
		assert(boosted.worldAxisCharged); assert(!charged(p));
		assert.equal(battle.runEvent('BasePower', p, q, boosted, 100), 150);
		use('tackle', p, q); assert(!p.lastMoveUsed.worldAxisCharged);
		assert.equal(battle.runEvent('BasePower', p, q, p.lastMoveUsed, 100), 100);
	});
	it('consumes a charge on Protect, immunity, and misses', () => {
		const [p, q] = setup(); use('guardswap', p, q); q.addVolatile('protect'); use('tackle', p, q);
		assert(!charged(p)); q.removeVolatile('protect'); use('guardswap', p, q);
		q.setType('Ghost'); use('tackle', p, q); assert(!charged(p));
		q.setType('Normal'); use('guardswap', p, q);
		use(Object.assign(Dex.getActiveMove('tackle'), {accuracy: 0}), p, q); assert(!charged(p));
	});
	it('keeps a charge through non-attacking moves and being unable to move', () => {
		const [p, q] = setup(); use('guardswap', p, q); use('recover', p); assert(charged(p));
		p.addVolatile('flinch'); battle.makeChoices('move tackle', 'move splash'); assert(charged(p));
	});
	it('does not transfer charges with Baton Pass or retain them after switching', () => {
		const [p, q] = setup(); use('guardswap', p, q);
		battle.makeChoices('move batonpass', 'move splash'); battle.makeChoices('switch 2');
		assert(!charged(p)); assert(!charged(battle.p1.active[0]));
		battle.makeChoices('switch 2', 'move splash'); assert.equal(battle.p1.active[0], p); assert(!charged(p));
	});
	it('clears a stored charge when losing the ability and does not charge while suppressed', () => {
		const [p, q] = setup(); use('guardswap', p, q); p.setAbility('No Ability'); assert(!charged(p));
		p.setAbility('World Axis'); p.addVolatile('gastroacid'); use('guardswap', p, q); assert(!charged(p));
	});
	it('applies the charge to every hit and target in a spread attack without spending it repeatedly', () => {
		battle = common.createBattle({gameType: 'doubles'}, [[set(), set('Magikarp', 'No Ability')], [set('Mew', 'No Ability'), set('Mew', 'No Ability')]]);
		const p = battle.p1.active[0], q = battle.p2.active[0]; use('guardswap', p, q);
		use('rockslide', p, q); assert(p.lastMoveUsed.worldAxisCharged); assert(!charged(p));
		for (const target of battle.p2.active) assert.equal(battle.runEvent('BasePower', p, target, p.lastMoveUsed, 100), 150);
		use('guardswap', p, q); q.hp = q.maxhp = 10000; use('doublehit', p, q);
		assert(p.lastMoveUsed.worldAxisCharged); assert(!charged(p));
		assert(battle.log.some(l => l.includes('|-hitcount|') && l.endsWith('|2')));
	});
	it('retains a charge on a charging turn and consumes it on the attack turn', () => {
		const [p, q] = setup(); use('guardswap', p, q); use('dig', p, q); assert(charged(p));
		use('dig', p, q); assert(!charged(p)); assert(p.lastMoveUsed.worldAxisCharged);
	});
	it('stores Future Sight power in its delayed packet without modifying a previously queued attack', () => {
		const [p, q] = setup(); use('guardswap', p, q); use('futuresight', p, q);
		assert(!charged(p)); assert.equal(q.side.slotConditions[q.position].futuremove.moveData.basePower, 180);
		use('guardswap', p, q); use('futuresight', p, q);
		assert.equal(q.side.slotConditions[q.position].futuremove.moveData.basePower, 180);
		assert(!charged(p));
	});
});
