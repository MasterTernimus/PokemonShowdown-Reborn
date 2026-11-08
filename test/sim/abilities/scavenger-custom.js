'use strict';

const assert = require('./../../assert');
const common = require('./../../common');
const {Dex} = require('./../../../dist/sim');

let battle;

describe('Scavenger custom effects', () => {
	afterEach(() => {
		battle?.destroy();
	});

	it('should expose Mandibuzz stats, abilities, and requested moves', () => {
		const mandibuzz = Dex.species.get('Mandibuzz');
		assert.deepEqual(mandibuzz.baseStats, {hp: 115, atk: 65, def: 115, spa: 65, spd: 100, spe: 80});
		assert.equal(Object.values(mandibuzz.baseStats).reduce((sum, stat) => sum + stat, 0), 540);
		assert.deepEqual(mandibuzz.abilities, { 0: 'Scavenger', 1: 'Stamina', H: 'Carrion Watch' });
		const learnset = Dex.species.getLearnsetData('mandibuzz').learnset;
		for (const move of ['bulkup', 'spikes', 'taunt', 'thief', 'toxic', 'whirlwind', 'icywind']) {
			assert(learnset[move], `Mandibuzz should learn ${move}`);
		}
	});

	it('should no longer have Overcoat, Big Pecks, or Regenerator behavior', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Mandibuzz', ability: 'Scavenger', moves: ['splash']},
			{species: 'Chansey', moves: ['splash']},
		], [
			{species: 'Tyranitar', ability: 'Sand Stream', moves: ['screech']},
		]]);
		battle.makeChoices('team 12', 'team 1');
		const mandibuzz = battle.p1.active[0];
		assert(!mandibuzz.hasAbility('overcoat'));
		assert(!mandibuzz.hasAbility('bigpecks'));
		assert(!mandibuzz.hasAbility('regenerator'));
		const fullHP = mandibuzz.hp;
		battle.makeChoices('move splash', 'move screech');
		assert.equal(mandibuzz.boosts.def, -2);
		assert(mandibuzz.hp < fullHP, 'Scavenger no longer blocks Sandstorm damage');
		mandibuzz.damage(Math.floor(mandibuzz.maxhp / 2));
		const hpBeforeSwitch = mandibuzz.hp;
		battle.makeChoices('switch 2', 'move screech');
		assert.equal(mandibuzz.hp, hpBeforeSwitch, 'Scavenger does not heal on switch-out');
	});
});
