'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const { getAbilityDisplayComponents } = require('../../../dist/data/ability-display');

describe('Centiskorch approved ability packages', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(species = 'Centiskorch', ability = 'Coil Up') {
		const spare = { species: 'Mew', ability: 'No Ability', moves: ['splash'] };
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species, ability, moves: ['splash', 'substitute'] }, spare,
		], [{ species: 'Mew', ability: 'No Ability', moves: ['tackle', 'watergun', 'doublehit', 'ember'] }]]);
		battle.makeChoices('team 12', 'team 1');
		const p = battle.p1.active[0], q = battle.p2.active[0];
		p.hp = p.maxhp = p.baseMaxhp = 3000;
		return [p, q];
	}
	function hit(p, q, id) {
		const move = Dex.getActiveMove(id); move.accuracy = true; move.willCrit = false;
		battle.actions.useMove(move, q, { target: p });
	}
	it('has Flash Fire on base and keeps the separate Gmax passive', () => {
		assert.deepEqual(Dex.species.get('centiskorch').abilities, { 0: 'Coil Up', 1: 'White Smoke', H: 'Flame Body' });
		assert.deepEqual(Dex.species.get('centiskorch').passives, ['flashfire']);
		assert.deepEqual(Dex.species.get('centiskorchgmax').passives, ['flamebody']);
		assert(getAbilityDisplayComponents('heatcoil', ['flamebody'], 'centiskorchgmax').includes('magmaarmor'));
	});
	it('Coil Up triggers once across multi-hit and repeated contact moves, and resets on switching', () => {
		let [p, q] = setup(); hit(p, q, 'doublehit'); assert.equal(p.boosts.def, 1);
		hit(p, q, 'tackle'); assert.equal(p.boosts.def, 1);
		battle.makeChoices('switch 2', 'move watergun');
		battle.makeChoices('switch 2', 'move watergun');
		p = battle.p1.active[0]; q = battle.p2.active[0];
		assert.equal(p.boosts.def, 0); hit(p, q, 'tackle'); assert.equal(p.boosts.def, 1);
	});
	it('non-contact and Substitute hits leave Coil Up available', () => {
		const [p, q] = setup(); hit(p, q, 'watergun'); assert.equal(p.boosts.def, 0);
		p.addVolatile('substitute'); hit(p, q, 'tackle'); assert.equal(p.boosts.def, 0);
		p.removeVolatile('substitute'); hit(p, q, 'tackle'); assert.equal(p.boosts.def, 1);
	});
	it('does not trigger on fainting, allied hits or contact prevented by Long Reach', () => {
		const [p, q] = setup();
		battle.singleEvent('DamagingHit', p.getAbility(), p.abilityState, p, p, Dex.getActiveMove('tackle'), 10);
		assert.equal(p.boosts.def, 0);
		q.setAbility('Long Reach'); hit(p, q, 'tackle'); assert.equal(p.boosts.def, 0);
		q.setAbility('No Ability'); p.hp = 1;
		hit(p, q, 'tackle'); assert.equal(p.boosts.def, 0);
	});
	it('suppression stops Coil Up but leaves passive Flash Fire active', () => {
		const [p, q] = setup(); p.addVolatile('gastroacid', q);
		hit(p, q, 'tackle'); assert.equal(p.boosts.def, 0);
		const hp = p.hp; hit(p, q, 'ember');
		assert.equal(p.hp, hp); assert(p.volatiles.flashfire);
	});
	for (const field of ['dragonsdenterrain', 'volcanicterrain', 'infernaleclipseterrain']) {
		it(`Heat Coil receives Magma Armor entry defenses in ${field}`, () => {
			const [p] = setup('Mew', 'Heat Coil'); battle.field.terrain = field;
			const before = { ...p.boosts };
			battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
			const boost = field === 'infernaleclipseterrain' ? 2 : 1;
			assert.equal(p.boosts.def, before.def + boost); assert.equal(p.boosts.spd, before.spd + boost);
		});
	}
	it('Heat Coil prevents freeze, cures Cold Eclipse frostbite and halves Water/Ice attack power', () => {
		const [p, q] = setup('Mew', 'Heat Coil'); assert.equal(p.setStatus('frz'), false);
		battle.field.terrain = 'coldeclipseterrain'; assert(p.setStatus('frz'));
		battle.singleEvent('Update', p.getAbility(), p.abilityState, p); assert.equal(p.status, '');
		battle.field.terrain = '';
		for (const id of ['watergun', 'icebeam']) assert.equal(battle.runEvent('SourceModifySpA', p, q, Dex.getActiveMove(id), 100), 50);
		for (const id of ['waterfall', 'icepunch']) assert.equal(battle.runEvent('SourceModifyAtk', p, q, Dex.getActiveMove(id), 100), 50);
	});
	it('Heat Coil blocks Fire on its supported fields but suppression restores damage', () => {
		const [p, q] = setup('Centiskorch-Gmax', 'Heat Coil');
		for (const field of ['dragonsdenterrain', 'infernaleclipseterrain']) {
			battle.field.terrain = field; const hp = p.hp;
			hit(p, q, 'ember'); assert.equal(p.hp, hp);
		}
		p.addVolatile('gastroacid', q); const hp = p.hp;
		hit(p, q, 'ember'); assert(p.hp < hp);
	});
});
