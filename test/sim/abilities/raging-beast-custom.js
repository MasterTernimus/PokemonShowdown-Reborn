'use strict';

const assert = require('./../../assert');
const common = require('./../../common');
const {Dex} = require('./../../../dist/sim');

let battle;

describe('Raging Beast and related species updates', () => {
	afterEach(() => {
		battle?.destroy();
	});

	it('should expose the requested species data on server', () => {
		assert.deepEqual(Dex.species.get('Zangoose').types, ['Normal', 'Fighting']);
		assert.deepEqual(Dex.species.get('Beartic').abilities, {0: 'Raging Beast', 1: 'Floe Hunter', H: 'Swift Swim'});
		assert.deepEqual(Dex.species.get('Beartic').baseStats, {
			hp: 110, atk: 130, def: 90, spa: 55, spd: 85, spe: 75,
		});
		assert.deepEqual(Dex.species.get('Pangoro').baseStats, {
			hp: 105, atk: 126, def: 76, spa: 69, spd: 69, spe: 70,
		});
		assert.equal(Object.values(Dex.species.get('Pangoro').baseStats).reduce((sum, stat) => sum + stat, 0), 515);
		assert.deepEqual(Dex.species.get('Ursaring').baseStats, {
			hp: 100, atk: 130, def: 80, spa: 40, spd: 80, spe: 70,
		});
		assert.equal(Dex.species.get('Ursaring').abilities[0], 'Savage Resolve');
	});

	it('should provide both Guts and Mold Breaker behavior', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Pangoro', ability: 'Raging Beast', moves: ['earthquake']},
		], [
			{species: 'Gengar', ability: 'Levitate', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const pangoro = battle.p1.active[0];
		const gengar = battle.p2.active[0];
		assert(pangoro.hasAbility('guts'));
		assert(pangoro.hasAbility('moldbreaker'));
		const attackBeforeBurn = pangoro.getStat('atk');
		pangoro.setStatus('brn');
		assert(pangoro.getStat('atk') > attackBeforeBurn);
		battle.makeChoices('move earthquake', 'move splash');
		assert(gengar.hp < gengar.maxhp, 'Mold Breaker should let Earthquake hit Levitate');
	});

	it('should remove Intimidate from Lunar Dread', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Ursaluna-Bloodmoon', ability: 'Lunar Dread', moves: ['splash']},
		], [
			{species: 'Mew', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const lunarDread = battle.p1.active[0];
		const foe = battle.p2.active[0];
		assert.equal(foe.boosts.atk, 0);
		assert(!lunarDread.hasAbility('magicguard'));
		assert(!lunarDread.hasAbility('pressure'));
		assert(!lunarDread.hasAbility('unaware'));
		assert(!lunarDread.hasAbility('intimidate'));
	});

	it('should not retain Territorial’s removed Unnerve, Unaware or Tough Claws effects', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Ursaluna', ability: 'Territorial', moves: ['splash']},
		], [
			{species: 'Mew', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const territorial = battle.p1.active[0];
		const foe = battle.p2.active[0];
		assert.equal(foe.boosts.atk, 0);
		assert(!territorial.hasAbility('unnerve'));
		assert(!territorial.hasAbility('unaware'));
		assert(!territorial.hasAbility('toughclaws'));
		assert(!territorial.hasAbility('intimidate'));
	});

	it('should give Relentless Link Skill Link, Mold Breaker and Power Drill without Guts', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Heracross-Mega', ability: 'Relentless Link', moves: ['splash']},
		], [
			{species: 'Mew', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const heracross = battle.p1.active[0];
		for (const id of ['skilllink', 'moldbreaker', 'powerdrill']) assert(heracross.hasAbility(id));
		assert(!heracross.hasAbility('guts'));
		const attackBeforeBurn = heracross.getStat('atk');
		heracross.setStatus('brn');
		assert.equal(heracross.getStat('atk'), attackBeforeBurn);
	});
});
