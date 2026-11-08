'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
describe('Dragon Den cooling', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(ability = 'No Ability') {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Mew', ability: 'No Ability', moves: ['surf', 'muddywater', 'glaciate', 'sparklingaria'] }],
			[{ species: 'Mew', ability, moves: ['splash', 'protect'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		for (const p of battle.getAllActive()) p.hp = p.maxhp = p.baseMaxhp = 10000;
		battle.field.setTerrain('dragonsdenterrain', battle.p1.active[0]);
		battle.onEvent('Accuracy', battle.format, () => true);
		return battle.p1.active[0];
	}
	it('needs two successful ordinary cooling moves', () => {
		setup(); battle.makeChoices('move surf', 'move splash');
		assert.equal(battle.field.terrain, 'dragonsdenterrain');
		assert.equal(battle.field.terrainState.terrainChanges.get('caveterrain'), 1);
		battle.makeChoices('move surf', 'move splash');
		assert.equal(battle.field.terrain, 'caveterrain');
		assert(battle.log.some(line => line.includes('dragon fire faded')));
	});
	it('Glaciate changes directly to Cave', () => {
		setup(); battle.makeChoices('move glaciate', 'move splash');
		assert.equal(battle.field.terrain, 'caveterrain');
	});
	it('Sparkling Aria changes directly to Volcanic with its special message', () => {
		setup(); battle.makeChoices('move sparklingaria', 'move splash');
		assert.equal(battle.field.terrain, 'volcanicterrain');
		assert(battle.log.some(line => line.includes('sparkling song stirred')));
	});
	it('fully protected moves do not cool the field', () => {
		setup(); battle.makeChoices('move surf', 'move protect');
		assert.equal(battle.field.terrain, 'dragonsdenterrain');
		assert(!battle.field.terrainState.terrainChanges.get('caveterrain'));
	});
	it('immune targets do not cool the field', () => {
		setup('Water Absorb'); battle.makeChoices('move surf', 'move splash');
		assert.equal(battle.field.terrain, 'dragonsdenterrain');
		assert(!battle.field.terrainState.terrainChanges.get('caveterrain'));
	});
	it('misses do not cool the field', () => {
		setup(); battle.onEvent('Accuracy', battle.format, () => 0);
		battle.makeChoices('move muddywater', 'move splash');
		assert.equal(battle.field.terrain, 'dragonsdenterrain');
		assert(!battle.field.terrainState.terrainChanges.get('caveterrain'));
	});
	it('Chatot receives the modest 511-stat-total nerf', () => {
		assert.deepEqual(Dex.species.get('chatot').baseStats, { hp: 86, atk: 72, def: 65, spa: 107, spd: 65, spe: 116 });
	});

	it('strong cooling moves need one use and heat cannot produce negative progress', () => {
		const p = setup(), q = battle.p2.active[0];
		const after = id => {
			const move = Dex.getActiveMove(id);
			move.totalDamage = 100;
			battle.field.getTerrain().onAfterMove.call(battle, p, q, move);
		};
		after('dracometeor'); assert.equal(battle.field.terrainState.terrainChanges.get('caveterrain'), 0);
		after('surf'); after('dragonenergy'); assert.equal(battle.field.terrainState.terrainChanges.get('caveterrain'), 0);
		for (const id of ['hydrovortex', 'oceanicoperetta', 'subzeroslammer']) {
			battle.field.setTerrain('dragonsdenterrain', p); after(id); assert.equal(battle.field.terrain, 'caveterrain', id);
		}
	});
});
