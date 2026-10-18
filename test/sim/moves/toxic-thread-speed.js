'use strict';
const assert = require('assert').strict;
const common = require('../../common');

describe('Toxic Thread Speed reduction', () => {
	let battle;
	afterEach(() => battle?.destroy());
	for (const protect of [false, true]) it(`lowers each unprotected foe by one stage; Protect=${protect}`, () => {
		const mon = moves => ({species: 'Mew', ability: 'No Ability', moves});
		battle = common.createBattle({gameType: 'doubles'}, [
			[mon(['toxicthread']), mon(['splash'])],
			[mon(['splash']), mon([protect ? 'protect' : 'splash'])],
		]);
		battle.makeChoices('move toxicthread, move splash', `move splash, move ${protect ? 'protect' : 'splash'}`);
		assert.equal(battle.p2.active[0].boosts.spe, -1);
		assert.equal(battle.p2.active[0].status, 'tox');
		assert.equal(battle.p2.active[1].boosts.spe, protect ? 0 : -1);
		assert.equal(battle.p2.active[1].status, protect ? '' : 'tox');
		for (const ally of battle.p1.active) assert.equal(ally.boosts.spe, 0);
	});
});
