'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Flash Fire', () => {
	it('Elemental Seed grants Fire power while Drifblim keeps Unburden', () => {
		battle = common.createBattle({ formatid: 'gen9dragonsden' }, [
			[{ species: 'Drifblim', ability: 'Unburden', item: 'Elemental Seed', moves: ['ember'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		const [holder, target] = [battle.p1.active[0], battle.p2.active[0]];
		assert.equal(holder.ability, 'unburden');
		assert(holder.volatiles.unburden);
		assert(holder.volatiles.flashfire);
		assert(battle.log.some(line => line.endsWith('|Flash Fire|[from] item: Elemental Seed')));
		assert.equal(battle.runEvent('ModifySpA', holder, target, battle.dex.getActiveMove('ember'), 100), 150);
	});
	afterEach(() => {
		battle.destroy();
	});

	it('should grant immunity to Fire-type moves and increase Fire-type attacks by 50% once activated', () => {
		battle = common.createBattle([[
			{ species: 'Heatran', ability: 'flashfire', moves: ['incinerate'] },
		], [
			{ species: 'Talonflame', ability: 'galewings', moves: ['flareblitz'] },
		]]);
		const [flashMon, foePokemon] = [battle.p1.active[0], battle.p2.active[0]];
		battle.makeChoices('move incinerate', 'move flareblitz');
		assert.fullHP(flashMon);
		const damage = foePokemon.maxhp - foePokemon.hp;
		assert.bounded(damage, [82, 97]);
	});

	it('should grant Fire-type immunity even if the user is frozen', () => {
		battle = common.createBattle([[
			{ species: 'Heatran', ability: 'flashfire', moves: ['sleeptalk'] },
		], [
			{ species: 'Talonflame', ability: 'galewings', moves: ['flareblitz'] },
		]]);
		const flashMon = battle.p1.active[0];
		flashMon.setStatus('frz');
		assert.hurtsBy(flashMon, Math.floor(flashMon.maxhp / 16), () => battle.makeChoices('move sleeptalk', 'move flareblitz'));
		assert.equal(flashMon.status, 'frz');
		assert(flashMon.volatiles.flashfire); // Only custom frostbite residual damage applied.
	});

	it('should have its Fire-type immunity suppressed by Mold Breaker', () => {
		battle = common.createBattle([[
			{ species: 'Heatran', ability: 'flashfire', moves: ['incinerate'] },
		], [
			{ species: 'Haxorus', ability: 'moldbreaker', moves: ['firepunch'] },
		]]);
		assert.hurts(battle.p1.active[0], () => battle.makeChoices('move incinerate', 'move firepunch'));
	});

	it(`should lose the Flash Fire boost if its ability is changed`, () => {
		battle = common.createBattle([[
			{ species: 'Lampent', ability: 'flashfire', moves: ['sleeptalk', 'incinerate'] },
		], [
			{ species: 'Talonflame', ability: 'shellarmor', moves: ['flamethrower', 'worryseed'] },
		]]);
		battle.randomizer = damage => damage;
		battle.onEvent('CriticalHit', battle.format, () => false);
		const unboosted = battle.actions.getDamage(battle.p1.active[0], battle.p2.active[0], 'incinerate');
		battle.makeChoices('move sleeptalk', 'move flamethrower');
		assert(battle.p1.active[0].volatiles.flashfire);
		battle.makeChoices('move incinerate', 'move worryseed');
		const talonflame = battle.p2.active[0];
		const damage = talonflame.maxhp - talonflame.hp;
		assert.equal(damage, unboosted);
		assert.equal(battle.p1.active[0].ability, 'insomnia');
		assert(!battle.p1.active[0].volatiles.flashfire);
	});
});

describe('Flash Fire [Gen 3-4]', () => {
	afterEach(() => {
		battle.destroy();
	});

	common.itGen(3, 'should activate and grant Fire-type immunity even if the user is frozen in Gen 3', () => {
		battle = common.gen(3).createBattle([[
			{ species: 'Arcanine', ability: 'flashfire', moves: ['sleeptalk'] },
		], [
			{ species: 'Charizard', ability: 'blaze', moves: ['flamethrower'] },
		]]);
		const flashFireMon = battle.p1.active[0];
		flashFireMon.setStatus('frz');
		battle.makeChoices();
		assert.notEqual(flashFireMon.hp, flashFireMon.maxhp);
	});

	common.itGen(4, 'should activate and grant Fire-type immunity even if the user is frozen in Gen 4', () => {
		battle = common.gen(4).createBattle([[
			{ species: 'Heatran', ability: 'flashfire', moves: ['sleeptalk'] },
		], [
			{ species: 'Charizard', ability: 'blaze', moves: ['flamethrower'] },
		]]);
		const flashFireMon = battle.p1.active[0];
		flashFireMon.setStatus('frz');
		battle.makeChoices();
		assert.false.fullHP(flashFireMon);
	});
});
