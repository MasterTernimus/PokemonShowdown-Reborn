'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

describe('KABOOM matching offensive boost', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(atk, spa, ability = 'No Ability') {
		const set = ability => ({species: 'Mew', ability, moves: ['kaboom', 'splash']});
		battle = common.createBattle({}, [[set(ability)], [set('No Ability')]]);
		const p = battle.p1.active[0], q = battle.p2.active[0];
		for (const mon of [p, q]) mon.hp = mon.maxhp = mon.baseMaxhp = 1000;
		p.storedStats.atk = atk; p.storedStats.spa = spa;
		return [p, q];
	}
	function use(p, q, patch = {}) {
		const move = Object.assign(Dex.getActiveMove('kaboom'), {damage: 100, accuracy: true, willCrit: false}, patch);
		battle.actions.runMove(move, p, p.getLocOf(q));
	}
	for (const [atk, spa, stat] of [[200,100,'atk'], [100,200,'spa'], [100,100,'spa']]) {
		it(`${atk}/${spa}: boosts ${stat} and retains normal recoil`, () => {
			const [p,q] = setup(atk,spa); use(p,q);
			assert.equal(p.boosts[stat],1); assert.equal(p.boosts[stat==='atk'?'spa':'atk'],0);
			assert.equal(p.hp,975); assert.equal(q.hp,900);
		});
		it(`${atk}/${spa}: Sheer Force removes the chosen boost`, () => {
			const [p,q] = setup(atk,spa,'Sheer Force'); use(p,q);
			assert.equal(p.boosts.atk,0); assert.equal(p.boosts.spa,0); assert.equal(p.hp,975);
		});
		it(`${atk}/${spa}: Electric Terrain keeps the chosen boost and removes recoil`, () => {
			const [p,q] = setup(atk,spa); battle.field.setTerrain('electricterrain',p); use(p,q);
			assert.equal(p.boosts[stat],1); assert.equal(p.hp,1000);
		});
	}
	it('uses staged stats when choosing both category and boost', () => {
		const [p,q] = setup(200,150); p.boosts.spa=1; use(p,q);
		assert.equal(p.boosts.atk,0); assert.equal(p.boosts.spa,2);
	});
	it('reselects on each use without mutating shared move data', () => {
		const [p,q] = setup(200,100); use(p,q); assert.equal(p.boosts.atk,1);
		p.storedStats.spa=500; use(p,q); assert.equal(p.boosts.spa,1); assert.equal(p.boosts.atk,1);
		assert.deepEqual(Dex.moves.get('kaboom').secondary.self.boosts,{spa:1});
	});
	for (const blocked of ['protect','immune','miss']) it(`${blocked}: grants no offensive boost`, () => {
		const [p,q] = setup(200,100);
		if(blocked==='protect')q.addVolatile('protect');
		if(blocked==='immune')q.setType('Ground');
		use(p,q,blocked==='miss'?{accuracy:0}:{});
		assert.equal(p.boosts.atk,0); assert.equal(p.boosts.spa,0);
	});
});
