'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

let battle;
describe('Eeveelution ability order, Verdant Edge, and Permafrost', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('puts the custom abilities first without changing Espeon or Umbreon', () => {
		assert.deepEqual(Dex.species.get('Flareon').abilities,
			{0: 'Kindled Fury', 1: 'Fire Mane', H: 'Drought'});
		assert.deepEqual(Dex.species.get('Leafeon').abilities,
			{0: 'Verdant Edge', 1: 'Regenerator', H: 'Grassy Surge'});
		assert.deepEqual(Dex.species.get('Glaceon').abilities,
			{0: 'Permafrost', 1: 'Slush Rush', H: 'Snow Warning', S: 'Mind Freeze'});
		assert.equal(Dex.species.get('Vaporeon').abilities[0], 'Tidal Wave');
		assert.equal(Dex.species.get('Jolteon').abilities[0], 'Livewire');
		assert.equal(Dex.species.get('Espeon').abilities[0], 'Trace');
		assert.equal(Dex.species.get('Umbreon').abilities[0], 'Poison Heal');
	});

	it('applies Verdant Edge speed, slicing, Defense, and allied healing effects', () => {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species: 'Leafeon', ability: 'Verdant Edge', moves: ['splash', 'leafblade']},
			{species: 'Mew', moves: ['splash']},
		], [
			{species: 'Mew', moves: ['splash']},
			{species: 'Mew', moves: ['splash']},
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');
		const leafeon = battle.p1.active[0];
		const ally = battle.p1.active[1];
		const foe = battle.p2.active[0];
		for (const component of ['chlorophyll', 'invigorate', 'sharpness', 'grasspelt']) {
			assert(leafeon.hasAbility(component), component);
		}
		assert.equal(battle.runEvent('BasePower', leafeon, foe, battle.dex.getActiveMove('leafblade'), 100), 150);
		assert.equal(battle.runEvent('TryHeal', ally, leafeon, null, 100), 130);
		assert.equal(battle.runEvent('ModifySpe', leafeon, null, null, 100), 100);
		battle.field.setWeather('sunnyday');
		assert.equal(battle.runEvent('ModifySpe', leafeon, null, null, 100), 200);
		battle.field.setTerrain('grassyterrain', leafeon);
		assert.equal(battle.runEvent('ModifyDef', leafeon, null, null, 100), 150);
	});

	it('applies Permafrost special defense, Refrigerate, and Ice Body healing', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Glaceon', ability: 'Permafrost', moves: ['splash']},
		], [
			{species: 'Mew', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const glaceon = battle.p1.active[0];
		const foe = battle.p2.active[0];
		for (const component of ['icebody', 'icescales', 'refrigerate']) {
			assert(glaceon.hasAbility(component), component);
		}
		assert.equal(battle.runEvent('SourceModifyDamage', glaceon, foe,
			battle.dex.getActiveMove('psychic'), 100), 50);
		const tackle = battle.dex.getActiveMove('tackle');
		battle.singleEvent('ModifyType', glaceon.getAbility(), glaceon.abilityState, tackle, glaceon);
		assert.equal(tackle.type, 'Ice');
		assert.equal(battle.runEvent('BasePower', glaceon, foe, tackle, 100), 120);
		battle.field.setWeather('hail');
		battle.damage(64, glaceon);
		const hp = glaceon.hp;
		battle.makeChoices('move splash', 'move splash');
		assert(glaceon.hp > hp);
	});

	it('lets the replacement hidden abilities start Grassy Terrain and snow', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Leafeon', ability: 'Grassy Surge', moves: ['splash']},
		], [
			{species: 'Mew', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		assert(battle.field.isTerrain('grassyterrain'));
		battle.destroy();
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Glaceon', ability: 'Snow Warning', moves: ['splash']},
		], [
			{species: 'Mew', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		assert(battle.field.isWeather('hail'));
	});
});
