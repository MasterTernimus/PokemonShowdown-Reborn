'use strict';
const assert = require('assert').strict;
const { Battle, Dex } = require('../../../dist/sim');

describe('Clearing moves preserve naturally transitioned base fields', () => {
	let battle, p, q;
	beforeEach(() => {
		const mon = { species: 'Mew', ability: 'No Ability',
			moves: ['splash', 'mistball', 'surf', 'infernalrage', 'icespinner', 'steelroller', 'roaroftime'] };
		battle = new Battle({ formatid: 'gen9nofieldsinglesgame', seed: [1, 2, 3, 4],
			p1: { team: [mon] }, p2: { team: [mon] } });
		if (battle.requestState === 'teampreview') battle.makeChoices('team 1', 'team 1');
		[p, q] = [battle.p1.active[0], battle.p2.active[0]];
		for (const pokemon of [p, q]) pokemon.hp = pokemon.maxhp = pokemon.baseMaxhp = 9999;
		battle.field.startTerrain('dragonsdenterrain');
	});
	afterEach(() => battle.destroy());
	function use(id) {
		battle.turn++;
		const move = Dex.getActiveMove(id); move.accuracy = true; move.willCrit = false;
		battle.actions.runMove(move, p, p.getLocOf(q));
	}
	for (const move of ['infernalrage', 'icespinner', 'steelroller', 'roaroftime']) {
		it(`${move} leaves Mist Ball's Fairy Tale transition active`, () => {
			use('mistball'); assert.equal(battle.field.terrain, 'fairytaleterrain');
			const state = battle.field.terrainState;
			use(move);
			assert.equal(battle.field.terrainState, state);
			assert.equal(state.duration, 5);
			assert(!p.volatiles.infernalrage);
		});
	}
	it('preserves natural expiry of the timed Fairy Tale transition', () => {
		use('mistball'); battle.field.terrainState.duration = 0;
		assert(battle.field.clearTerrain());
		assert.equal(battle.field.terrain, 'dragonsdenterrain');
	});
	it('retains the cooled base field through Ice Spinner', () => {
		use('surf'); use('surf'); assert.equal(battle.field.terrain, 'volcanicterrain');
		use('surf'); assert.equal(battle.field.terrain, 'caveterrain');
		use('icespinner'); assert.equal(battle.field.terrain, 'caveterrain');
	});
	it('retains Infernal Rage\'s natural Cave-to-Volcanic transition', () => {
		use('surf'); use('surf'); use('surf');
		use('infernalrage'); assert.equal(battle.field.terrain, 'volcanicterrain');
	});
	for (const move of ['infernalrage', 'icespinner']) {
		it(`${move} still removes an independently placed field`, () => {
			use('mistball');
			assert(battle.field.setTerrain('factoryterrain', p, Dex.moves.get('conversion')));
			battle.field.setTerrainDuration(5);
			use(move); assert.equal(battle.field.terrain, 'fairytaleterrain');
		});
		it(`${move} removes an aura without reverting the base transition`, () => {
			use('mistball'); const state = battle.field.terrainState;
			battle.field.setAura('electricterrain', 5, p);
			use(move); assert.equal(battle.field.auraField, '');
			assert.equal(battle.field.terrainState, state);
		});
	}
});
