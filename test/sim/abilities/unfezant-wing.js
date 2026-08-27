'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Unfezant Wing abilities', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('transforms Aevian Wing once and keeps the Rejuv form after a reset', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Unfezant', ability: 'aevianwing', moves: ['rockslide']},
			{species: 'Pidgeot', ability: 'keeneye', moves: ['splash']},
		], [
			{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');

		const unfezant = battle.p1.active[0];
		assert.species(unfezant, 'Unfezant-Rejuv');
		assert.deepEqual(unfezant.getTypes(), ['Rock', 'Fighting']);
		assert.equal(unfezant.baseSpecies.id, 'unfezantrejuv');
		assert.equal(unfezant.baseAbility, 'aevianwing');
		assert(unfezant.hasAbility(['scrappy', 'rockhead', 'defiant']));

		unfezant.clearVolatile();
		assert.species(unfezant, 'Unfezant-Rejuv');
		assert.equal(unfezant.baseSpecies.id, 'unfezantrejuv');
	});

	it('keeps direct Rejuv only with Aevian Wing and reverts invalid direct inputs', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Unfezant-Rejuv', ability: 'aevianwing', moves: ['rockslide']},
		], [
			{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		assert.species(battle.p1.active[0], 'Unfezant-Rejuv');
		battle.destroy();
		battle = null;

		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Unfezant-Rejuv', ability: 'unovawing', moves: ['rockslide']},
		], [
			{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		assert.species(battle.p1.active[0], 'Unfezant');
		assert.deepEqual(battle.p1.active[0].getTypes(), ['Normal', 'Flying']);
	});

	it('exposes Unova Wing components and the requested added learnset', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const dex = battle.dex;
		const unovaWing = dex.abilities.get('unovawing');
		assert.equal(unovaWing.name, 'Unova Wing');
		assert(unovaWing.onModifyCritRatio);
		assert(unovaWing.onAfterEachBoost);
		assert(unovaWing.condition?.onModifySpe);

		const unfezant = dex.species.get('Unfezant');
		assert.deepEqual(unfezant.baseStats, {hp: 90, atk: 40, def: 105, spa: 125, spd: 80, spe: 107});
		const learnset = dex.species.getLearnsetData('unfezant').learnset;
		for (const move of [
			'focusblast', 'calmmind', 'hypervoice', 'extrasensory', 'rockthrow', 'harden',
				'rockslide', 'brickbreak', 'stealthrock', 'closecombat', 'rockblast', 'blazekick', 'stoneedge',
			'bulkup', 'rocktomb', 'knockoff', 'sandstorm', 'smackdown', 'dig', 'payback',
			'rockpolish', 'mudslap', 'rockclimb', 'retaliate', 'lowkick', 'batonpass',
			'endeavor', 'stompingtantrum', 'superpower', 'ironhead', 'mudshot', 'megakick',
			'honeclaws', 'arenitewall', 'lowsweep', 'tripleaxel',
		]) {
			assert(learnset[move], `Unfezant should learn ${move}`);
		}
	});
});
