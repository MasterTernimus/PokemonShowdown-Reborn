'use strict';

const assert = require('./../../assert');
const common = require('./../../common');
const { Dex } = require('./../../../dist/sim');

let battle;

describe('Withering Shell custom effects', () => {
	afterEach(() => {
		battle?.destroy();
	});

	it('should expose the requested Corsola data on both cosmetic variants', () => {
		for (const name of ['Corsola', 'Corsola-Alt']) {
			const species = Dex.species.get(name);
			assert.deepEqual(species.types, ['Water', 'Rock']);
			assert.deepEqual(species.baseStats, {hp: 85, atk: 65, def: 80, spa: 130, spd: 135, spe: 35});
			assert.deepEqual(species.abilities, {0: 'Withering Shell', 1: 'Perish Body', H: 'Lightning Rod'});
		}
	});

	it('should combine Crumbling Shell, Weak Armor, and Self Repair', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame', preview: true}, [[
			{species: 'Corsola-Alt', ability: 'Withering Shell', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'Synchronize', moves: ['tackle', 'splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const corsola = battle.p1.active[0];
		assert(corsola.hasAbility('crumblingshell'));
		assert(corsola.hasAbility('selfrepair'));
		assert(corsola.hasAbility('weakarmor'));

		battle.makeChoices('move splash', 'move tackle');
		assert.equal(corsola.boosts.def, -1);
		assert.equal(corsola.boosts.spe, 2);
		assert(battle.p2.sideConditions.stealthrock);

		corsola.damage(160);
		const damagedHP = corsola.hp;
		battle.makeChoices('move splash', 'move splash');
		assert(corsola.hp > damagedHP);
	});

	it('should keep Weak Armor active when a water field blocks Crumbling Shell', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame', preview: true}, [[
			{species: 'Corsola', ability: 'Withering Shell', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'Synchronize', moves: ['tackle']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const corsola = battle.p1.active[0];
		assert(battle.field.setTerrain('watersurfaceterrain', corsola));

		battle.makeChoices('move splash', 'move tackle');
		assert.equal(corsola.boosts.def, -1);
		assert.equal(corsola.boosts.spe, 2);
		assert.equal(battle.p2.sideConditions.stealthrock, undefined);
	});
});
