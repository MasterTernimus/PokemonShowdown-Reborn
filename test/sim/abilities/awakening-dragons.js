'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

describe('Approved Awakening dragon abilities', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(ability = 'Rightful Exalt', species = 'Salamence', mode = 'singles', foeAbility = 'No Ability') {
		const mon = (species = 'Mew', ability = 'No Ability') => ({species, ability, moves: ['tailwind', 'tackle', 'airslash', 'splash']});
		const teams = [[mon(species, ability), mon()], [mon('Mew', foeAbility), mon()]];
		if (mode === 'freeforall') teams.push([mon()], [mon()]);
		battle = common.createBattle({gameType: mode}, teams);
		for (const side of battle.sides) for (const p of side.pokemon) p.hp = p.maxhp = p.baseMaxhp = 1000;
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	it('changes the approved regular Salamence kit while pending designs stay unchanged', () => {
		const s = Dex.species.get('Salamence');
		assert.deepEqual(s.abilities, {0: 'Intimidate', 1: 'Wind Rider', H: 'Rightful Exalt'});
		assert.deepEqual(s.passives, ['freeflight']);
		assert.equal(Dex.species.get('Salamence-Mega').abilities[0], 'Exalted Aether');
		assert.deepEqual(Dex.species.get('Salamence-Mega').passives, ['aerilate']);
		assert.equal(Dex.species.get('Hydreigon').abilities.H, 'False Liberation');
		assert.equal(Dex.species.get('Hydreigon-Mega').abilities[0], 'Expiration');
	});
	it('Rightful Exalt doubles secondary chances once and leaves critical ratios alone', () => {
		const [p, q] = setup();
		const move = Dex.getActiveMove('airslash'), crit = move.critRatio;
		battle.runEvent('ModifyMove', p, q, move, move);
		assert.equal(move.secondaries[0].chance, 60); assert.equal(move.critRatio, crit);
		assert(p.hasAbility('serenegrace')); assert(p.hasAbility('innerfocus'));
	});
	it('prevents flinching and Intimidate but not unrelated Attack drops', () => {
		const [p, q] = setup();
		assert(!p.addVolatile('flinch', q, Dex.moves.get('fakeout')));
		battle.boost({atk: -1}, p, q, Dex.abilities.get('intimidate')); assert.equal(p.boosts.atk, 0);
		battle.boost({atk: -1}, p, q, Dex.moves.get('growl')); assert.equal(p.boosts.atk, -1);
	});
	it('Rightful Exalt is suppressed without suppressing the separate Free Flight passive', () => {
		const [p, q] = setup(); p.addVolatile('gastroacid', q);
		const move = Dex.getActiveMove('airslash'); battle.runEvent('ModifyMove', p, q, move, move);
		assert.equal(move.secondaries[0].chance, 30); assert(p.addVolatile('flinch', q));
		assert(p.hasAbilityOrPassive('windpower')); assert(p.hasAbilityOrPassive('moxie'));
	});
	for (const mode of ['singles', 'doubles', 'freeforall']) it(`${mode}: Free Flight absorbs wind for one Sp. Atk stage`, () => {
		const [p, q] = setup('Rightful Exalt', 'Salamence', mode);
		const move = Object.assign(Dex.getActiveMove('tackle'), {flags: {wind: 1}, accuracy: true, damage: 200});
		battle.actions.runMove(move, q, q.getLocOf(p));
		assert.equal(p.hp, p.maxhp); assert.equal(p.boosts.spa, 1);
	});
	for (const mode of ['singles', 'doubles', 'freeforall']) it(`${mode}: Free Flight gives Moxie once on a direct knockout`, () => {
		const [p, q] = setup('Rightful Exalt', 'Salamence', mode); q.hp = 1;
		battle.actions.runMove(Object.assign(Dex.getActiveMove('tackle'), {accuracy: true, damage: 100}), p, p.getLocOf(q));
		battle.faintMessages(); assert.equal(p.boosts.atk, 1);
	});
	it('retains local Tailwind entry and self-cast recovery effects', () => {
		const [p, q] = setup();
		p.boosts.accuracy = -2;
		battle.actions.runMove('tailwind', p);
		assert.equal(p.boosts.spa, 1); assert.equal(p.boosts.accuracy, 0);
		battle.singleEvent('Start', Dex.abilities.get('freeflight'), {id: 'freeflight', target: p}, p);
		assert.equal(p.boosts.spa, 2);
	});
	it('retains Strong Winds boosts and does not grant residual healing', () => {
		const [p] = setup(); p.hp = 500;
		battle.field.setWeather('deltastream', p); battle.fieldEvent('Residual');
		assert.equal(p.boosts.atk, 1); assert.equal(p.boosts.spa, 1); assert.equal(p.hp, 500);
	});
	it('selected Free Flight is suppressed normally', () => {
		const [p, q] = setup('Free Flight', 'Mew'); p.addVolatile('gastroacid', q);
		battle.actions.runMove(Object.assign(Dex.getActiveMove('tackle'), {flags: {wind: 1}, accuracy: true, damage: 100}), q, q.getLocOf(p));
		assert.equal(p.hp, 900); assert.equal(p.boosts.spa, 0);
	});
});
