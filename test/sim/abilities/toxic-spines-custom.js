'use strict';

const assert = require('./../../assert');
const common = require('./../../common');
const {Dex} = require('./../../../dist/sim');

let battle;

describe('Toxic Spines custom effects', () => {
	afterEach(() => {
		battle?.destroy();
	});

	it('should expose Toxapex stats and abilities', () => {
		const toxapex = Dex.species.get('Toxapex');
		assert.deepEqual(toxapex.baseStats, {hp: 85, atk: 73, def: 152, spa: 63, spd: 142, spe: 35});
		assert.equal(Object.values(toxapex.baseStats).reduce((sum, stat) => sum + stat, 0), 550);
		assert.deepEqual(toxapex.abilities, {0: 'Battle Armor', 1: 'Toxic Spines', H: 'Regenerator'});
	});

	it('should retain Toxic Debris, Corrosion, and Merciless behavior', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Toxapex', ability: 'Toxic Spines', moves: ['toxic', 'surf']},
		], [
			{species: 'Registeel', ability: 'Clear Body', moves: ['tackle']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const toxapex = battle.p1.active[0];
		const registeel = battle.p2.active[0];
		assert(toxapex.hasAbility('toxicdebris'));
		assert(toxapex.hasAbility('corrosion'));
		assert(toxapex.hasAbility('merciless'));

		battle.makeChoices('move toxic', 'move tackle');
		assert.equal(registeel.status, 'tox', 'Corrosion should let Toxic affect Steel types');
		assert(registeel.side.getSideCondition('toxicspikes'), 'A physical hit should set Toxic Spikes');

		battle.makeChoices('move surf', 'move tackle');
		assert(battle.log.some(line => line.includes('|-crit|')), 'Merciless should guarantee a critical hit');
	});
});
