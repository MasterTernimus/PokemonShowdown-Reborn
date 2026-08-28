'use strict';

const assert = require('./../../assert');
const common = require('./../../common');
const {Dex} = require('./../../../dist/sim');

let battle;

describe('Toxic Sink custom effects', () => {
	afterEach(() => {
		battle?.destroy();
	});

	it('should expose the reworked Vileplume abilities', () => {
		assert.deepEqual(Dex.species.get('Vileplume').abilities, {
			0: 'Chlorophyll', 1: 'Storm Drain', H: 'Toxic Sink',
		});
	});

	it('should absorb Poison moves and raise both offenses', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Vileplume', ability: 'Toxic Sink', moves: ['splash']},
		], [
			{species: 'Mew', moves: ['sludgebomb']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const vileplume = battle.p1.active[0];
		const hpBefore = vileplume.hp;
		battle.makeChoices('move splash', 'move sludgebomb');
		assert.equal(vileplume.hp, hpBefore);
		assert.equal(vileplume.boosts.atk, 1);
		assert.equal(vileplume.boosts.spa, 1);
		assert(vileplume.hasAbility('effectspore'));
		assert(vileplume.hasAbility('invigorate'));
		assert(!vileplume.hasAbility('stormdrain'));
	});

	it('should redirect Poison moves away from its ally', () => {
		battle = common.createBattle({formatid: 'gen964doublesnofield'}, [[
			{species: 'Vileplume', ability: 'Toxic Sink', moves: ['splash']},
			{species: 'Chansey', moves: ['splash']},
			{species: 'Pikachu', moves: ['splash']},
			{species: 'Eevee', moves: ['splash']},
		], [
			{species: 'Mew', moves: ['sludgebomb']},
			{species: 'Mew', moves: ['splash']},
			{species: 'Pikachu', moves: ['splash']},
			{species: 'Eevee', moves: ['splash']},
		]]);
		battle.makeChoices('team 1234', 'team 1234');
		const [vileplume, chansey] = battle.p1.active;
		battle.makeChoices('move splash, move splash', 'move sludgebomb 2, move splash');
		assert.fullHP(chansey);
		assert.statStage(vileplume, 'atk', 1);
		assert.statStage(vileplume, 'spa', 1);
	});

	it('should retain Effect Spore and Invigorate behavior', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Vileplume', ability: 'Toxic Sink', moves: ['recover']},
		], [
			{species: 'Mew', moves: ['tackle']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const vileplume = battle.p1.active[0];
		const mew = battle.p2.active[0];
		vileplume.damage(Math.floor(vileplume.maxhp * 0.8));
		const hpBefore = vileplume.hp;
		battle.random = () => 15;
		battle.makeChoices('move recover', 'move tackle');
		assert.equal(mew.status, 'par');
		assert(vileplume.hp - hpBefore > vileplume.maxhp / 2, 'Invigorate should amplify Recover');
	});
});
