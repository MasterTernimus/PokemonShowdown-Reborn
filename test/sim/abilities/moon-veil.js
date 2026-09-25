'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

describe('Moon Veil', function () {
	let battle;
	afterEach(function () {
		battle.destroy();
	});

	it('replaces Clefable’s first ability and sets Misty Terrain on entry', function () {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species: 'clefable', ability: 'moonveil', moves: ['protect']},
			{species: 'crobat', moves: ['protect']},
		], [
			{species: 'arbok', moves: ['toxic']},
			{species: 'wynaut', moves: ['sleeptalk']},
		]]);
		battle.makeChoices('team 12', 'team 12');
		battle.makeChoices('move protect, move protect', 'move toxic 2, move sleeptalk');
		assert.equal(battle.dex.species.get('clefable').abilities[0], 'Moon Veil');
		assert.equal(battle.field.terrain, 'mistyterrain');
		// Crobat is not protected by Misty Terrain, so this checks Moon Veil's Pastel Veil effect.
		assert.equal(battle.p1.active[1].setStatus('psn'), false);
		assert.equal(battle.p1.active[1].status, '');
		assert.equal(battle.p2.active[0].boosts.atk, -1);
		assert.equal(battle.p2.active[0].boosts.spa, -1);
	});

	it('sets Misty Aura over a compatible existing field', function () {
		battle = common.createBattle({formatid: 'gen9doubleswatersurface'}, [[
			{species: 'clefable', ability: 'moonveil', moves: ['protect']},
			{species: 'crobat', moves: ['protect']},
		], [
			{species: 'arbok', moves: ['protect']},
			{species: 'wynaut', moves: ['sleeptalk']},
		]]);
		battle.makeChoices('team 12', 'team 12');
		assert.equal(battle.field.terrain, 'watersurfaceterrain');
		assert.equal(battle.field.auraField, 'mistyterrain');
	});
});
