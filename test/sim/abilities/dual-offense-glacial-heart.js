'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

let battle;
describe('Dual offensive boosts and Glacial Heart', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	for (const [ability, species, move] of [
		['Lightning Rod', 'Manectric', 'thundershock'],
		['Storm Drain', 'Gastrodon', 'watergun'],
		['Sap Sipper', 'Bouffalant', 'vinewhip'],
	]) {
		it(`${ability} raises Attack and Special Attack when absorbing ${move}`, () => {
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
				{species, ability, moves: ['splash']},
			], [
				{species: 'Mew', moves: [move]},
			]]);
			battle.makeChoices('team 1', 'team 1');
			const holder = battle.p1.active[0];
			const hp = holder.hp;
			battle.makeChoices('move splash', `move ${move}`);
			assert.equal(holder.hp, hp);
			assert.equal(holder.boosts.atk, 1);
			assert.equal(holder.boosts.spa, 1);
		});
	}

	it('raises both stats when Berserk crosses half HP', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Drampa', ability: 'Berserk', moves: ['splash']},
		], [
			{species: 'Mew', moves: ['superfang']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const drampa = battle.p1.active[0];
		battle.damage(2, drampa);
		battle.makeChoices('move splash', 'move superfang');
		assert.equal(drampa.boosts.atk, 1);
		assert.equal(drampa.boosts.spa, 1);
	});

	it('raises both stats for Berserk and Lightning Rod field entry boosts', () => {
		for (const [formatid, species, ability, stages] of [
			['gen9dragonsden', 'Drampa', 'Berserk', 2],
			['gen9electricfield', 'Manectric', 'Lightning Rod', 1],
		]) {
			battle = common.createBattle({formatid}, [[
				{species, ability, moves: ['splash']},
			], [
				{species: 'Mew', moves: ['splash']},
			]]);
			battle.makeChoices('team 1', 'team 1');
			const holder = battle.p1.active[0];
			assert.equal(holder.boosts.atk, stages, `${ability} Attack on ${formatid}`);
			assert.equal(holder.boosts.spa, stages, `${ability} Special Attack on ${formatid}`);
			battle.destroy();
			battle = null;
		}
	});

	it('raises both Sap Sipper stats for an allied Grass move', () => {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species: 'Comfey', moves: ['aromatherapy']},
			{species: 'Bouffalant', ability: 'Sap Sipper', moves: ['splash']},
		], [
			{species: 'Mew', moves: ['splash']},
			{species: 'Mew', moves: ['splash']},
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');
		battle.makeChoices('move aromatherapy, move splash', 'move splash, move splash');
		const bouffalant = battle.p1.active[1];
		assert.equal(bouffalant.boosts.atk, 1);
		assert.equal(bouffalant.boosts.spa, 1);
	});

	it('gives Mega Baxcalibur all four Glacial Heart effects', () => {
		assert.equal(Dex.species.get('Baxcalibur-Mega').abilities[0], 'Glacial Heart');
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Baxcalibur', item: 'Baxcalibrite', moves: ['splash', 'dragonclaw']},
		], [
			{species: 'Mew', moves: ['splash', 'ember']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		const baxcalibur = battle.p1.active[0];
		const foe = battle.p2.active[0];
		assert.equal(baxcalibur.species.id, 'baxcaliburmega');
		assert.equal(baxcalibur.ability, 'glacialheart');
		for (const component of ['thermalexchange', 'icebody', 'toughclaws', 'stalwart']) {
			assert(baxcalibur.hasAbility(component), component);
		}
		assert.equal(baxcalibur.setStatus('brn', foe), false);
		assert.equal(battle.runEvent('BasePower', baxcalibur, foe,
			battle.dex.getActiveMove('dragonclaw'), 100), 130);
		const trackedMove = battle.dex.getActiveMove('watergun');
		battle.singleEvent('ModifyMove', baxcalibur.getAbility(), baxcalibur.abilityState, trackedMove, baxcalibur, foe);
		assert.equal(trackedMove.tracksTarget, true);
		battle.makeChoices('move splash', 'move ember');
		assert.equal(baxcalibur.boosts.atk, 1);
		battle.field.setWeather('hail');
		battle.damage(64, baxcalibur);
		const hp = baxcalibur.hp;
		battle.makeChoices('move splash', 'move splash');
		assert(baxcalibur.hp > hp);
	});

	it('retains the Stalwart entry boost on Fairy Tale Field', () => {
		battle = common.createBattle({formatid: 'gen9fairytalefield'}, [[
			{species: 'Baxcalibur', item: 'Baxcalibrite', moves: ['splash']},
		], [
			{species: 'Mew', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		const baxcalibur = battle.p1.active[0];
		assert.equal(baxcalibur.ability, 'glacialheart');
		assert.equal(baxcalibur.boosts.spa, 1);
	});
});
