'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

let battle;

describe('Flygonite and Desert Spirit', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('gives Flygon two Mega forms with one stone and removes Leaf Stone Mega Evolution', () => {
		const mega = Dex.species.get('Flygon-Mega');
		assert.deepEqual(mega.types, ['Dragon', 'Bug']);
		assert.deepEqual(mega.baseStats, { hp: 80, atk: 100, def: 85, spa: 135, spd: 85, spe: 135 });
		assert.equal(Object.values(mega.baseStats).reduce((sum, stat) => sum + stat, 0), 620);
		assert.equal(mega.abilities[0], 'Desert Spirit');
		assert.equal(mega.requiredItem, 'Flygonite');
		assert.equal(Dex.species.get('Flygon-Mega-Z').requiredItem, 'Flygonite');
		assert.equal(Dex.items.get('Flygonite').megaStone.Flygon, 'Flygon-Mega');
		assert.equal(Dex.items.get('Leaf Stone').megaStone, undefined);
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Flygon', item: 'Leaf Stone', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		assert.equal(battle.p1.active[0].canMegaEvo, null);
		assert.equal(battle.p1.active[0].canMegaEvoX, null);
		battle.destroy();
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Flygon', item: 'Flygonite', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		assert.equal(battle.p1.active[0].canMegaEvo, 'Flygon-Mega');
		assert.equal(battle.p1.active[0].canMegaEvoX, 'Flygon-Mega-Z');
		battle.makeChoices('move splash mega', 'move splash');
		assert.equal(battle.p1.active[0].species.id, 'flygonmega');
		assert(battle.field.isWeather('sandstorm'));
	});

	it('uses the alternate Mega control for Flygon-Mega-Z', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Flygon', item: 'Flygonite', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash megax', 'move splash');
		assert.equal(battle.p1.active[0].species.id, 'flygonmegaz');
		assert.equal(battle.p1.active[0].ability, 'tremor');
		assert.equal(battle.field.weather, '');
		const flygon = battle.p1.active[0];
		const foe = battle.p2.active[0];
		for (const component of ['levitate', 'resonanceforce', 'sandforce']) {
			assert(flygon.hasAbility(component), `Missing ${component}`);
		}
		assert.equal(flygon.isGrounded(), null);
		assert.equal(flygon.runImmunity('Ground'), false);
		assert.equal(flygon.runStatusImmunity('sandstorm'), false);
		assert.equal(battle.runEvent('ModifySTAB', flygon, foe, battle.dex.getActiveMove('bugbuzz'), 1), 1.5);
		const soundMove = battle.dex.getActiveMove('bugbuzz');
		battle.singleEvent('ModifyMove', flygon.getAbility(), flygon.abilityState, soundMove, flygon, foe);
		assert.equal(soundMove.category, 'Special');
		assert.equal(soundMove.ignoreAbility, false);
		assert.equal(soundMove.overrideOffensiveStat,
			flygon.getStat('atk') >= flygon.getStat('spa') ? 'atk' : 'spa');
		assert.equal(battle.runEvent('BasePower', flygon, foe, soundMove, 100), 150);
		assert.equal(battle.runEvent('BasePower', flygon, foe, battle.dex.getActiveMove('earthquake'), 100), 100);
		battle.field.setWeather('sandstorm');
		assert.equal(battle.runEvent('BasePower', flygon, foe, battle.dex.getActiveMove('earthquake'), 100), 130);
		assert.equal(battle.runEvent('BasePower', flygon, foe, battle.dex.getActiveMove('hypervoice'), 100), 150);
	});

	it('boosts allied sound moves without doubling the holder\'s boost', () => {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [[
			{ species: 'Flygon', item: 'Flygonite', moves: ['splash'] },
			{ species: 'Mew', moves: ['hypervoice'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');
		battle.makeChoices('move splash megax, move hypervoice', 'move splash, move splash');
		const flygon = battle.p1.active[0];
		const ally = battle.p1.active[1];
		const foe = battle.p2.active[0];
		assert.equal(flygon.ability, 'tremor');
		assert.equal(battle.runEvent('BasePower', ally, foe, battle.dex.getActiveMove('hypervoice'), 100), 150);
		assert.equal(battle.runEvent('BasePower', flygon, foe, battle.dex.getActiveMove('hypervoice'), 100), 150);
		assert.equal(battle.singleEvent('AnyTryHit', flygon.getAbility(), flygon.abilityState,
			ally, flygon, battle.dex.getActiveMove('hypervoice')), null);
	});

	it('grants Levitate, Ground STAB, and Tinted Lens', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Flygon', item: 'Flygonite', moves: ['splash', 'earthquake'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		const flygon = battle.p1.active[0];
		const foe = battle.p2.active[0];
		for (const component of ['levitate', 'sandstream', 'tintedlens']) {
			assert(flygon.hasAbility(component), `Missing ${component}`);
		}
		assert.equal(flygon.isGrounded(), null);
		assert.equal(flygon.runImmunity('Ground'), false);
		const groundMove = battle.dex.getActiveMove('earthquake');
		battle.singleEvent('ModifyMove', flygon.getAbility(), flygon.abilityState, groundMove, flygon, foe);
		assert.equal(groundMove.forceSTAB, true);
		foe.getMoveHitData(groundMove).typeMod = -1;
		assert.equal(battle.runEvent('ModifyDamage', flygon, foe, groundMove, 100), 200);
	});
});
