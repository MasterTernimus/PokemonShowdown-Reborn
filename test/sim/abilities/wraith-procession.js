'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex, TeamValidator} = require('../../../dist/sim');

describe('Wraith Procession and Infernal Parade', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(gameType = 'singles', ability = 'Wraith Procession', foeAbility = 'No Ability') {
		const mon = ability => ({species: 'Mew', ability, moves: ['infernalparade', 'flamethrower', 'shadowball', 'splash']});
		const teams = [[mon(ability), mon('No Ability')], [mon(foeAbility), mon('No Ability')]];
		if (gameType === 'freeforall') teams.push([mon('No Ability')], [mon('No Ability')]);
		battle = common.createBattle({gameType}, teams);
		for (const side of battle.sides) for (const p of side.pokemon) {
			p.hp = p.maxhp = p.baseMaxhp = 10000;
			p.getPassives = () => [];
		}
		battle.randomizer = damage => damage;
		battle.randomChance = (n, d) => n >= d;
		battle.random = () => 99;
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	function hit(p, q, id = 'flamethrower', patch = {}) {
		const damage = [];
		const original = battle.actions.getDamage;
		battle.actions.getDamage = function (source, target, move, ...args) {
			const result = original.call(this, source, target, move, ...args);
			if (source === p && typeof result === 'number') damage.push({target, result, hit: move.hit, status: target.status});
			return result;
		};
		try {
			if (!p.hasMove(id)) p.moveSlots.push({id, move: Dex.moves.get(id).name, pp: 10, maxpp: 10, target: 'normal', disabled: false, used: false});
			battle.actions.runMove(Object.assign(Dex.getActiveMove(id), {accuracy: true, willCrit: false}, patch), p, p.getLocOf(q));
		} finally { battle.actions.getDamage = original; }
		return damage;
	}
	it('replaces only Hisuian Typhlosion H and preserves its passive and other choices', () => {
		const s = Dex.species.get('Typhlosion-Hisui');
		assert.deepEqual(s.abilities, {0: 'Blazing Mane', 1: 'Soul Fire', H: 'Wraith Procession'});
		assert.deepEqual(s.passives, ['blaze']);
		assert.equal(Dex.species.get('Typhlosion').abilities.H, 'Sand Rush');
		assert.equal(Dex.abilities.get('wraithprocession').num, 11984);
		assert.deepEqual(new TeamValidator('gen9nofieldsinglesgame').validateSet({species: s.name, ability: 'Wraith Procession', moves: ['infernalparade']}, {}) || [], []);
	});
	for (const mode of ['singles', 'doubles', 'freeforall']) for (const id of ['flamethrower', 'shadowball']) {
		it(`${mode}: ${id} hits the same target twice with a half-damage follow-up`, () => {
			const [p, q] = setup(mode); const hits = hit(p, q, id);
			assert.equal(hits.length, 2); assert(hits.every(h => h.target === q));
			assert(Math.abs(hits[1].result - hits[0].result / 2) <= 2, JSON.stringify(hits.map(h => h.result)));
			for (const other of battle.getAllActive()) if (other !== q) assert.equal(other.hp, other.maxhp);
		});
	}
	it('burning on the first Infernal Parade strike doubles the second strike base power', () => {
		const [p, q] = setup(); battle.random = () => 0;
		const hits = hit(p, q, 'infernalparade');
		assert.equal(hits.length, 2); assert.equal(hits[0].status, ''); assert.equal(hits[1].status, 'brn');
		assert(Math.abs(hits[1].result - hits[0].result) <= 3);
	});
	it('allows target secondary effects on both strikes', () => {
		const [p, q] = setup(); battle.random = () => 0;
		hit(p, q, 'shadowball'); assert.equal(q.boosts.spd, -2);
	});
	it('uses one PP for the pair', () => {
		const [p] = setup(); const before = p.moveSlots[0].pp;
		battle.makeChoices('move infernalparade', 'move splash');
		assert.equal(p.moveSlots[0].pp, before - 1);
		assert(battle.log.some(line => line.startsWith('|-hitcount|') && line.endsWith('|2')));
	});
	it('applies user costs and self secondary effects once while retaining both target strikes', () => {
		const [p, q] = setup(); battle.random = () => 0;
		assert.equal(hit(p, q, 'flamethrower', {self: {boosts: {def: -1}}, secondaries: [{chance: 100, self: {boosts: {spe: 1}}}]}).length, 2);
		assert.equal(p.boosts.def, -1); assert.equal(p.boosts.spe, 1);
	});
	it('Shield Dust blocks both target secondary effects', () => {
		const [p, q] = setup('singles', 'Wraith Procession', 'Shield Dust'); battle.random = () => 0;
		assert.equal(hit(p, q, 'shadowball').length, 2); assert.equal(q.boosts.spd, 0);
	});
	it('does not carry the additional strike into a later use after ability loss', () => {
		const [p, q] = setup(); assert.equal(hit(p, q).length, 2);
		p.setAbility('No Ability'); assert.equal(hit(p, q).length, 1);
		assert(!Dex.moves.get('flamethrower').multihit);
	});
	for (const ability of ['Sturdy', 'No Ability']) it(`finishes a target surviving the first hit with ${ability === 'Sturdy' ? ability : 'Focus Sash'}`, () => {
		const [p, q] = setup('singles', 'Wraith Procession', ability);
		q.hp = q.maxhp = q.baseMaxhp = 100;
		if (ability === 'No Ability') q.setItem('focussash');
		const hits = hit(p, q, 'flamethrower', {basePower: 1000});
		assert.equal(hits.length, 2); assert.equal(q.hp, 0);
	});
	it('breaks Substitute and reaches the original holder on strike two', () => {
		const [p, q] = setup(); q.addVolatile('substitute'); q.volatiles.substitute.hp = 1;
		hit(p, q); assert(!q.volatiles.substitute); assert(q.hp < q.maxhp);
	});
	for (const mode of ['doubles', 'freeforall']) it(`${mode}: a first-strike knockout never spills into another Pokemon`, () => {
		const [p, q] = setup(mode); q.hp = 1;
		const hits = hit(p, q); assert.equal(hits.length, 1);
		for (const other of battle.getAllActive()) if (other !== q) assert.equal(other.hp, other.maxhp);
	});
	it('scales fixed Ghost damage as well', () => {
		const [p, q] = setup(); const hits = hit(p, q, 'nightshade');
		assert.deepEqual(hits.map(h => h.result), [100, 50]);
	});
	it('leaves coverage, spread attacks and existing multi-hit moves unchanged', () => {
		const [p, q] = setup();
		assert.equal(hit(p, q, 'watergun').length, 1);
		assert.equal(hit(p, q, 'eruption').length, 1);
		assert.equal(hit(p, q, 'flamethrower', {multihit: 3}).length, 3);
	});
	it('does not add a strike to status, charging, delayed, OHKO, Z, Max or excluded moves', () => {
		const [p, q] = setup();
		for (const patch of [{category: 'Status'}, {flags: {charge: 1}}, {flags: {futuremove: 1}}, {flags: {noparentalbond: 1}}, {ohko: true}, {isZ: true}, {isMax: true}]) {
			const m = Object.assign(Dex.getActiveMove('flamethrower'), patch);
			battle.singleEvent('PrepareHit', p.getAbility(), p.abilityState, p, q, m);
			assert(!m.multihit); assert(!m.wraithProcession);
		}
	});
	for (const suppression of ['gastroacid', 'neutralizinggas']) it(`respects ${suppression}`, () => {
		const [p, q] = setup('singles', 'Wraith Procession', suppression === 'neutralizinggas' ? 'Neutralizing Gas' : 'No Ability');
		if (suppression === 'gastroacid') p.addVolatile('gastroacid', q);
		assert.equal(hit(p, q).length, 1);
	});
	it('respects Protect, type immunity, ability absorption and misses', () => {
		const [p, q] = setup(); q.addVolatile('protect'); hit(p, q); assert.equal(q.hp, q.maxhp);
		q.removeVolatile('protect'); q.setType('Normal'); hit(p, q, 'shadowball'); assert.equal(q.hp, q.maxhp);
		q.setAbility('Flash Fire'); hit(p, q); assert.equal(q.hp, q.maxhp);
		q.setAbility('No Ability'); hit(p, q, 'flamethrower', {accuracy: 0}); assert.equal(q.hp, q.maxhp);
	});
	it('Soul Fire alone no longer doubles Infernal Parade; status and other existing qualifications remain', () => {
		const [p, q] = setup('singles', 'Soul Fire');
		const m = Dex.getActiveMove('infernalparade');
		const power = () => m.basePowerCallback.call(battle, p, q, m);
		assert.equal(power(), 65);
		q.setStatus('par'); assert.equal(power(), 130); q.cureStatus();
		q.ability = 'comatose'; assert.equal(power(), 130); q.ability = 'noability';
		p.ability = 'sinisterblaze'; assert.equal(power(), 130); p.ability = 'soulfire';
		battle.field.setTerrain('hauntedterrain', p); assert.equal(power(), 130);
	});
});
