'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Pain Split', function () {
	afterEach(function () {
		battle.destroy();
	});

	it('should reduce the HP of the target to the average of the user and target', function () {
		battle = common.createBattle();
		battle.setPlayer('p1', {team: [{species: 'Shedinja', ability: 'wonderguard', moves: ['painsplit']}]});
		battle.setPlayer('p2', {team: [{species: 'Arceus', ability: 'multitype', moves: ['judgment']}]});
		battle.makeChoices('move painsplit', 'move judgment');
		assert.equal(battle.p2.active[0].hp, (battle.p2.active[0].maxhp + 1) / 2);
	});

	it('should average actual HP against persistent G-Max without doubling its HP', () => {
		battle = common.createBattle({ formatid: 'gen9factoryfield' });
		battle.setPlayer('p1', {team: [{species: 'Drifblim', ability: 'unburden', moves: ['painsplit']}]});
		battle.setPlayer('p2', { team: [{ species: 'Snorlax', ability: 'serenegrace', moves: ['sleeptalk'], gigantamax: true }] });

		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move painsplit', 'move sleeptalk dynamax');
		assert(battle.p2.active[0].volatiles.dynamax);
		assert.equal(battle.p2.active[0].maxhp, battle.p2.active[0].baseMaxhp);

		battle.p1.active[0].sethp(160); // non-dynamaxed
		battle.p2.active[0].sethp(174); // dynamaxed
		battle.makeChoices('move painsplit', 'move sleeptalk');
		assert.equal(battle.p1.active[0].hp, 167, 'ordinary form');
		assert.equal(battle.p2.active[0].hp, 167, 'G-Max form');
	});
});
