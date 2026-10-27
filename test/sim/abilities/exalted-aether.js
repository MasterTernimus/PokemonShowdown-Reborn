'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

describe('Exalted Aether', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(gameType = 'singles', ability = 'Exalted Aether', foeAbility = 'No Ability') {
		const mon = ability => ({species: 'Mew', ability, moves: ['dragonclaw', 'aerialace', 'tackle', 'splash']});
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
	function hit(p, q, id = 'dragonclaw', patch = {}) {
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
	it('selects Exalted Aether with Aerilate and removes only Salamence lunar moves', () => {
		assert.equal(Dex.species.get('Salamence-Mega').abilities[0], 'Exalted Aether');
		assert.deepEqual(Dex.species.get('Salamence-Mega').passives, ['aerilate']);
		for (const species of ['Salamence', 'Salamence-Mega']) for (const move of ['bloodmoon', 'moongeistbeam']) {
			assert(!Dex.species.getFullLearnset(species).some(s => s.learnset[move]));
		}
		assert(Dex.species.getFullLearnset('Lunala').some(s => s.learnset.moongeistbeam));
		assert(Dex.species.getFullLearnset('Ursaluna-Bloodmoon').some(s => s.learnset.bloodmoon));
	});
	for (const mode of ['singles', 'doubles', 'freeforall']) for (const id of ['dragonclaw', 'aerialace']) {
		it(`${mode}: ${id} hits twice at full/25% and heals only on strike one`, () => {
			const [p, q] = setup(mode); p.hp = 5000;
			const hits = hit(p, q, id);
			assert.equal(hits.length, 2); assert(hits.every(h => h.target === q));
			assert(Math.abs(hits[1].result - hits[0].result * 0.25) <= 2);
			assert.equal(p.hp - 5000, Math.max(1, Math.floor(hits[0].result / 8)));
		});
	}
	for (const mode of ['singles', 'doubles', 'freeforall']) for (const screen of ['reflect', 'auroraveil']) it(`${mode}: ${screen} reduces both strikes while positive Defense affects only strike one`, () => {
		const [p, q] = setup(mode); const plain = hit(p, q);
		q.side.addSideCondition(screen, q);
		const screened = hit(p, q);
		assert(screened[0].result < plain[0].result); assert(screened[1].result < plain[1].result);
		q.boosts.def = 2;
		const guarded = hit(p, q);
		assert(guarded[0].result < screened[0].result);
		assert.equal(guarded[1].result, screened[1].result);
	});
	it('retains negative Defense stages on both strikes', () => {
		const [p, q] = setup(); const plain = hit(p, q); q.boosts.def = -2;
		const lowered = hit(p, q); assert(lowered[0].result > plain[0].result); assert(lowered[1].result > plain[1].result);
	});
	it('applies target secondaries and self effects once', () => {
		const [p, q] = setup(); battle.random = () => 0;
		hit(p, q, 'dragonclaw', {self: {boosts: {def: -1}}, secondaries: [{chance: 100, boosts: {spd: -1}}, {chance: 100, self: {boosts: {spe: 1}}}]});
		assert.equal(q.boosts.spd, -1); assert.equal(p.boosts.def, -1); assert.equal(p.boosts.spe, 1);
	});
	it('Aerilate converts Normal attacks before eligibility and remains active under suppression', () => {
		const [p, q] = setup(); p.formeChange('Salamence-Mega', null, true);
		delete p.getPassives; p.setAbility('Exalted Aether');
		assert.equal(hit(p, q, 'tackle').length, 2);
		p.addVolatile('gastroacid', q); assert.equal(hit(p, q, 'tackle').length, 1);
		assert(p.hasAbilityOrPassive('aerilate'));
	});
	for (const mode of ['doubles', 'freeforall']) it(`${mode}: first-hit KO heals actual damage without spillover`, () => {
		const [p, q] = setup(mode); p.hp = 5000; q.hp = 8;
		assert.equal(hit(p, q).length, 1); assert.equal(p.hp, 5001);
		for (const other of battle.getAllActive()) if (other !== q && other !== p) assert.equal(other.hp, other.maxhp);
	});
	it('Substitute damage does not heal, including a first-hit break', () => {
		const [p, q] = setup(); p.hp = 5000; q.addVolatile('substitute'); q.volatiles.substitute.hp = 1;
		hit(p, q); assert(!q.volatiles.substitute); assert(q.hp < q.maxhp); assert.equal(p.hp, 5000);
	});
	it('Heal Block prevents recovery and allied damage never heals', () => {
		const [p, q] = setup('doubles'); p.hp = 5000; p.addVolatile('healblock', q);
		hit(p, q); assert.equal(p.hp, 5000); p.removeVolatile('healblock');
		hit(p, battle.p1.active[1]); assert.equal(p.hp, 5000);
	});
	it('uses one PP and does not retain follow-ups after ability loss', () => {
		const [p, q] = setup(); const pp = p.moveSlots[0].pp;
		battle.makeChoices('move dragonclaw', 'move splash'); assert.equal(p.moveSlots[0].pp, pp - 1);
		p.setAbility('No Ability'); assert.equal(hit(p, q).length, 1); assert(!Dex.moves.get('dragonclaw').multihit);
	});
	for (const suppression of ['gastroacid', 'neutralizinggas']) it(`respects ${suppression}`, () => {
		const [p, q] = setup('singles', 'Exalted Aether', suppression === 'neutralizinggas' ? 'Neutralizing Gas' : 'No Ability');
		if (suppression === 'gastroacid') p.addVolatile('gastroacid', q);
		p.hp = 5000; assert.equal(hit(p, q).length, 1); assert.equal(p.hp, 5000);
	});
	it('excludes special, coverage, spread and native multihit attacks', () => {
		const [p, q] = setup();
		assert.equal(hit(p, q, 'dragonpulse').length, 1); assert.equal(hit(p, q, 'tackle').length, 1);
		assert.equal(hit(p, q, 'dragonclaw', {target: 'allAdjacentFoes'}).length, 1);
		assert.equal(hit(p, q, 'dragonclaw', {multihit: 3}).length, 3);
	});
	it('excludes charging, delayed, OHKO, Z, Max and bond-excluded moves', () => {
		const [p, q] = setup();
		for (const patch of [{flags: {charge: 1}}, {flags: {futuremove: 1}}, {flags: {noparentalbond: 1}}, {ohko: true}, {isZ: true}, {isMax: true}]) {
			const m = Object.assign(Dex.getActiveMove('dragonclaw'), patch);
			battle.singleEvent('PrepareHit', p.getAbility(), p.abilityState, p, q, m); assert(!m.exaltedAether);
		}
	});
	it('respects Protect, immunity and misses without healing', () => {
		const [p, q] = setup(); p.hp = 5000; q.addVolatile('protect'); hit(p, q); assert.equal(q.hp, q.maxhp);
		q.removeVolatile('protect'); q.setType('Fairy'); hit(p, q); assert.equal(q.hp, q.maxhp);
		q.setType('Psychic'); hit(p, q, 'dragonclaw', {accuracy: 0}); assert.equal(q.hp, q.maxhp); assert.equal(p.hp, 5000);
	});
	it('scales fixed physical Dragon damage and caps first-strike healing correctly', () => {
		const [p, q] = setup(); p.hp = 5000;
		assert.deepEqual(hit(p, q, 'dragonrage', {category: 'Physical'}).map(h => h.result), [40, 10]);
		assert.equal(p.hp, 5005);
	});
	for (const ability of ['Sturdy', 'No Ability']) it(`preserves ${ability === 'Sturdy' ? ability : 'Focus Sash'} on strike one before strike two finishes`, () => {
		const [p, q] = setup('singles', 'Exalted Aether', ability); q.hp = q.maxhp = q.baseMaxhp = 100;
		if (ability === 'No Ability') q.setItem('focussash');
		assert.equal(hit(p, q, 'dragonclaw', {basePower: 1000}).length, 2); assert.equal(q.hp, 0);
	});
	it('retains contact reactions on both hits and does not grant Mold Breaker', () => {
		const [p, q] = setup('singles', 'Exalted Aether', 'Rough Skin'); p.hp = 5000;
		const hits = hit(p, q); assert.equal(hits.length, 2);
		assert.equal(p.hp, 5000 + Math.max(1, Math.floor(hits[0].result / 8)) - 2 * p.baseMaxhp / 8);
		q.setAbility('Wonder Guard'); q.hp = q.maxhp; hit(p, q); assert.equal(q.hp, q.maxhp);
	});
});
