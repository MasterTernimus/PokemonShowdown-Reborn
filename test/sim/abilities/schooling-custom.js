'use strict';

const assert = require('./../../assert');
const common = require('./../../common');
const { Dex } = require('./../../../dist/sim');

let battle;

describe('Schooling custom effects', () => {
	afterEach(() => {
		battle?.destroy();
	});

	it('should expose the requested data, stats, and moves', () => {
		assert.deepEqual(Dex.species.get('Wishiwashi-School').baseStats, {
			hp: 80, atk: 135, def: 130, spa: 135, spd: 130, spe: 60,
		});
		assert.equal(Dex.species.get('Wishiwashi').baseStats.hp, 80);
		assert.equal(Dex.species.get('Beartic').abilities['0'], 'Tough Claws');
		const learnset = Dex.species.getLearnsetData('wishiwashi').learnset;
		for (const move of [
			'tripledive', 'wavecrash', 'dive', 'bounce', 'ironhead', 'icefang', 'psychicfangs', 'strength',
		]) {
			assert(learnset[move], `Wishiwashi should learn ${move}`);
		}
	});

	it('should retain normal HP-based form changes', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Wishiwashi', ability: 'Schooling', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		const wishiwashi = battle.p1.active[0];
		assert.species(wishiwashi, 'Wishiwashi-School');
		wishiwashi.hp = Math.floor(wishiwashi.maxhp / 4);
		battle.makeChoices('move splash', 'move splash');
		assert.species(wishiwashi, 'Wishiwashi');
		wishiwashi.hp = wishiwashi.maxhp;
		battle.makeChoices('move splash', 'move splash');
		assert.species(wishiwashi, 'Wishiwashi-School');
	});

	it('should apply Hydra Bond without Swift Swim or Mold Breaker in School Form', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Wishiwashi', ability: 'Schooling', moves: ['raindance', 'tackle', 'earthquake'] },
		], [
			{ species: 'Eelektross', ability: 'Levitate', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		const wishiwashi = battle.p1.active[0];
		const eelektross = battle.p2.active[0];
		battle.makeChoices('move raindance', 'move splash');
		assert(!wishiwashi.hasAbility('swiftswim'));
		assert(!wishiwashi.hasAbility('moldbreaker'));
		battle.makeChoices('move tackle', 'move splash');
		assert(battle.log.some(line => line.startsWith('|-hitcount|') && line.endsWith('|3')));
		const hpBeforeEarthquake = eelektross.hp;
		battle.makeChoices('move earthquake', 'move splash');
		assert.equal(eelektross.hp, hpBeforeEarthquake, 'Levitate should block Earthquake without Mold Breaker');
	});

	it('should apply Self Repair while in School Form', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Wishiwashi', ability: 'Schooling', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		const wishiwashi = battle.p1.active[0];
		wishiwashi.hp -= 100;
		const damagedHP = wishiwashi.hp;
		battle.makeChoices('move splash', 'move splash');
		assert(wishiwashi.hp > damagedHP, 'Self Repair should restore HP at the end of the turn');
	});
});
