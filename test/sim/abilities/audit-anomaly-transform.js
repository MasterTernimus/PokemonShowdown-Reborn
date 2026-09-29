'use strict';

const assert = require('assert').strict;
const common = require('../../common');

describe('Anomaly move changes during Transform', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });

	it('keeps Ditto original moves and PP when Rift Eater replaces a transformed slot', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Ditto', ability: 'Limber', moves: ['transform'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		], [
			{ species: 'Hippowdon', ability: 'Ruin Jaw', item: 'Anomaly Core', moves: ['earthquake', 'stockpile', 'slackoff', 'sludgewave'] },
		]]);
		battle.makeChoices('team 12', 'team 1');
		const ditto = battle.p1.active[0];
		const originalMoves = [...ditto.set.moves];
		const originalPPUps = [...ditto.ppUps];
		battle.makeChoices('move transform', 'move slackoff mega');
		assert(ditto.transformed);
		assert.equal(ditto.ability, 'rifteater');
		const originalSlots = ditto.baseMoveSlots.map(slot => ({ ...slot }));
		ditto.deductPP('sludgewave', 2);
		ditto.hp = Math.floor(ditto.maxhp / 2);
		battle.runEvent('Update', ditto);
		assert.equal(ditto.moveSlots[3].id, 'heatwave');
		assert.equal(ditto.moveSlots[3].maxpp, 5);
		assert.equal(ditto.moveSlots[3].pp, 3);
		assert.equal(ditto.moveSlots[3].virtual, true);
		assert.deepEqual(ditto.baseMoveSlots, originalSlots);
		assert.deepEqual(ditto.set.moves, originalMoves);
		assert.deepEqual(ditto.ppUps, originalPPUps);
		battle.makeChoices('switch 2', 'move slackoff');
		battle.makeChoices('switch 2', 'move slackoff');
		assert.equal(battle.p1.active[0], ditto);
		assert.equal(ditto.species.id, 'ditto');
		assert.deepEqual(ditto.moves, ['transform']);
		assert.equal(ditto.moveSlots[0].pp, originalSlots[0].pp);
	});

	it('keeps normal Rift Eater move changes permanent while preserving spent PP', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Hippowdon', ability: 'Ruin Jaw', item: 'Anomaly Core', moves: ['splash', 'stockpile', 'slackoff', 'sludgewave'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('team 12', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		const hippo = battle.p1.active[0];
		hippo.deductPP('sludgewave', 2);
		hippo.hp = Math.floor(hippo.maxhp / 2);
		battle.runEvent('Update', hippo);
		const maxpp = battle.calculatePP(battle.dex.moves.get('heatwave'), 3);
		assert.equal(hippo.moveSlots[3].maxpp, maxpp);
		assert.equal(hippo.moveSlots[3].pp, maxpp - 2);
		assert.equal(hippo.baseMoveSlots[3].id, 'heatwave');
		assert.equal(hippo.set.moves[3], 'Heat Wave');
		assert.equal(hippo.ppUps[3], 3);
		assert(!hippo.moveSlots[3].virtual);
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(hippo.moveSlots[3].id, 'heatwave');
		assert.equal(hippo.moveSlots[3].pp, maxpp - 2);
	});
});
