'use strict';

const assert = require('./../assert');
const common = require('./../common');

let battle;

describe('Clawitzer custom data', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('defines Clawitzer-Mega and removes Origin Pulse from the shared learnset', function () {
		battle = common.createBattle({formatid: 'gen9doublesmistyfieldadrienn'}, [[
			{species: 'Clawitzer', moves: ['splash']},
		], [
			{species: 'Wynaut', moves: ['splash']},
		]]);
		const clawitzer = battle.dex.species.get('Clawitzer');
		const mega = battle.dex.species.get('Clawitzer-Mega');
		assert.deepEqual(mega.types, ['Water', 'Dragon']);
		assert.deepEqual(mega.baseStats, {hp: 71, atk: 93, def: 108, spa: 160, spd: 109, spe: 59});
		assert.equal(mega.abilities[0], 'Heavy Artillery');
		assert.equal(mega.requiredItem, 'Clawitzerite');
		assert.equal(mega.battleOnly, 'Clawitzer');
		assert.deepEqual(clawitzer.otherFormes, ['Clawitzer-Mega']);

		const learnset = new Set();
		for (const entry of battle.dex.species.getFullLearnset('clawitzer')) {
			for (const move of Object.keys(entry.learnset || {})) learnset.add(move);
		}
		for (const move of ['waterpulse', 'darkpulse', 'dragonpulse', 'aurasphere', 'healpulse', 'flipturn', 'liquidation', 'sludgewave', 'pounce', 'uturn', 'venoshock', 'swordsdance', 'honeclaws']) {
			assert(learnset.has(move), `Clawitzer should learn ${move}`);
		}
		assert(!learnset.has('originpulse'), 'Clawitzer should not learn Origin Pulse');
	});

	it('Mega Evolves and applies Heavy Artillery once per damaging move', function () {
		battle = common.createBattle({formatid: 'gen9doublesmistyfieldadrienn'}, [[
			{species: 'Clawitzer', item: 'Clawitzerite', moves: ['waterpulse']},
			{species: 'Wynaut', moves: ['splash']},
		], [
			{species: 'Wynaut', moves: ['splash']},
			{species: 'Wynaut', moves: ['splash']},
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');
		battle.makeChoices('move waterpulse 1 mega, move splash', 'move splash, move splash');
		const clawitzer = battle.p1.active[0];
		assert.species(clawitzer, 'Clawitzer-Mega');
		assert.equal(clawitzer.ability, 'heavyartillery');
		assert(clawitzer.hasAbility('unaware'));
		assert(!clawitzer.hasAbility('moldbreaker'));
		assert(!clawitzer.hasAbility('swiftswim'));
		assert(clawitzer.hasAbility('shellarmor'));
		assert.equal(clawitzer.boosts.def, -1);
		assert.equal(clawitzer.boosts.spd, -1);
		assert(battle.p2.active[0].hp < battle.p2.active[0].maxhp, 'Heavy Artillery should hit the first opposing slot');
		assert(battle.p2.active[1].hp < battle.p2.active[1].maxhp, 'Heavy Artillery should hit the second opposing slot');
	});

	it('hits every Free-for-All opponent at full spread power', function () {
		battle = common.createBattle({formatid: 'gen9freeforall3pwatersurface'}, [[
			{species: 'Clawitzer', item: 'Clawitzerite', moves: ['waterpulse']},
		], [
			{species: 'Wynaut', moves: ['splash']},
		], [
			{species: 'Wynaut', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1', 'team 1');
		battle.makeChoices('move waterpulse 1 mega', 'move splash', 'move splash');
		assert(battle.p2.active[0].hp < battle.p2.active[0].maxhp, 'Heavy Artillery should hit the second side');
		assert(battle.p3.active[0].hp < battle.p3.active[0].maxhp, 'Heavy Artillery should hit the third side');
	});
});
