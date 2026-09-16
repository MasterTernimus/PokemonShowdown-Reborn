'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;

function setup(move = 'splash', ability = 'No Ability', species = 'Mew', item = '') {
	battle = common.createBattle({formatid: 'gen9flowergarden'}, [
		[{species, ability, item, moves: [move, 'splash'], evs: {spe: 252}}],
		[{species: 'Tangrowth', ability: 'No Ability', moves: ['splash']}],
	]);
	battle.makeChoices('team 1', 'team 1');
	return [battle.p1.active[0], battle.p2.active[0]];
}

describe('Flower Garden Stage 1', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('starts at Stage 1 with the requested message and no weather', () => {
		setup();
		assert.equal(battle.field.terrain, 'flowergarden1');
		assert.equal(battle.field.weather, '');
		assert(battle.log.includes('|-message|Seeds line the field.'));
	});
	for (const move of ['growth', 'naturepower', 'rototiller']) {
		it(`${move} gives its non-Grass user +2 Attack and Sp. Atk`, () => {
			const [user, target] = setup(move);
			battle.makeChoices();
			assert.equal(user.boosts.atk, 2);
			assert.equal(user.boosts.spa, 2);
			assert.equal(target.boosts.atk, move === 'rototiller' ? 2 : 0);
		});
	}
	it('Secret Power becomes Sweet Scent, deals no damage, and spends its own PP', () => {
		const [user, target] = setup('secretpower');
		const pp = user.moveSlots[0].pp;
		battle.makeChoices();
		assert.equal(target.hp, target.maxhp);
		assert.equal(target.boosts.evasion, -2);
		assert.equal(target.status, '');
		assert.equal(user.moveSlots[0].pp, pp - 1);
	});
	it('activates Flower Gift without sun', () => {
		const [user] = setup('splash', 'Flower Gift', 'Cherrim');
		assert.equal(battle.field.terrain, 'flowergarden2');
		battle.field.changeTerrain('flowergarden1', user, null, true);
		assert.equal(user.species.id, 'cherrimsunshine');
		assert.equal(user.getStat('atk'), Math.floor(user.storedStats.atk * 1.5));
		assert.equal(user.getStat('spd'), Math.floor(user.storedStats.spd * 1.5));
	});
	it('activates Mimicry as Grass', () => {
		const [user] = setup('splash', 'Mimicry');
		assert.deepEqual(user.getTypes(), ['Grass']);
	});
	for (const stat of ['ModifyAtk', 'ModifySpA']) {
		it(`activates Swarm at full HP for Bug moves only (${stat})`, () => {
			const [user, target] = setup('splash', 'Swarm');
			assert.equal(battle.runEvent(stat, user, target, battle.dex.getActiveMove('bugbuzz'), 100), 150);
			assert.equal(battle.runEvent(stat, user, target, battle.dex.getActiveMove('tackle'), 100), 100);
		});
	}
	it('does not boost Grass damage', () => {
		const [user, target] = setup();
		assert.equal(battle.runEvent('BasePower', user, target, battle.dex.getActiveMove('energyball'), 90), 90);
	});
	it('consumes Synthetic Seed, grants SpD and Ingrain, and grows once', () => {
		const [user] = setup('splash', 'No Ability', 'Mew', 'Synthetic Seed');
		assert.equal(user.item, '');
		assert.equal(user.boosts.spd, 1);
		assert(user.volatiles.ingrain);
		assert.equal(battle.field.terrain, 'flowergarden2');
		battle.makeChoices();
		assert.equal(battle.field.terrain, 'flowergarden2');
	});
	it('blocks terrain generation, replacement and clearing without mutating the stack', () => {
		const [user] = setup();
		const state = battle.field.terrainState;
		const stack = [...battle.field.terrainStack];
		assert.equal(battle.field.canSetTerrain('electricterrain', user), false);
		assert.equal(battle.field.setTerrain('electricterrain', user), false);
		assert.equal(battle.field.setTerrain('electricterrain', user, null, true), false);
		assert.equal(battle.field.changeTerrain('forestterrain', user), false);
		for (const mode of [null, '9001', 'mid', 'terraform', 'neutralization']) {
			assert.equal(battle.field.clearTerrain(mode), false);
		}
		battle.field.startTerrain('electricterrain');
		assert.equal(battle.field.terrainState, state);
		assert.deepEqual(battle.field.terrainStack, stack);
	});
	it('blocks an actual terrain move', () => {
		setup('electricterrain');
		battle.makeChoices();
		assert.equal(battle.field.terrain, 'flowergarden1');
	});
	it('blocks an entry terrain ability', () => {
		setup('splash', 'Electric Surge');
		assert.equal(battle.field.terrain, 'flowergarden1');
	});
	it('permits sequential growth only, caps at Stage 5, and retains the base lock', () => {
		const [user] = setup();
		assert.equal(battle.field.changeTerrain('flowergarden3', user), false);
		for (let stage = 2; stage <= 5; stage++) {
			assert.equal(battle.field.growFlowerGarden(user, user.getItem()), true);
			assert.equal(battle.field.terrain, `flowergarden${stage}`);
			assert.equal(battle.field.setTerrain('electricterrain', user), false);
		}
		assert.equal(battle.field.growFlowerGarden(user, user.getItem()), false);
	});
});
