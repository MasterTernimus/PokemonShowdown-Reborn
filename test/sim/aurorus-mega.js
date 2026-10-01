'use strict';

const assert = require('../assert');
const common = require('../common');
const {Dex} = require('../../dist/sim/dex');

describe('Aurorus-Mega', function () {
	let battle;
	afterEach(() => battle?.destroy());

	it('has the requested stats, typing, ability, and stone', function () {
		const base = Dex.species.get('Aurorus');
		const mega = Dex.species.get('Aurorus-Mega');
		assert.deepEqual(base.otherFormes, ['Aurorus-Mega']);
		assert.deepEqual(mega.types, ['Fairy', 'Ice']);
		assert.deepEqual(mega.baseStats, {hp: 123, atk: 47, def: 135, spa: 145, spd: 140, spe: 50});
		assert.equal(mega.bst, 640);
		assert.equal(mega.abilities[0], 'Aurora Domain');
		assert.equal(mega.requiredItem, 'Aurorite');
		assert.equal(Dex.items.get('Aurorite').megaStone.Aurorus, mega.name);
	});

	it('starts Snow Warning without entry Veil, then sets five-turn Fairy Tale and Veil on faint', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Aurorus', item: 'Aurorite', ability: 'relicarmor', moves: ['splash', 'tackle']},
		], [{species: 'Magikarp', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		const aurorus = battle.p1.active[0];
		assert.species(aurorus, 'Aurorus-Mega');
		assert(aurorus.hasAbility('relicarmor'));
		assert(aurorus.hasAbility('refrigerate'));
		assert(aurorus.hasAbility('snowwarning'));
		assert.equal(battle.field.weather, 'hail', 'Snow Warning uses the simulator\'s hail weather');
		assert.equal(battle.field.terrain, '', 'entry must not create Fairy Tale');
		assert(!aurorus.side.getSideCondition('auroraveil'));
		assert(aurorus.hasAbility('selfsufficient'));
		const tackle = battle.dex.getActiveMove('tackle');
		battle.singleEvent('ModifyType', aurorus.getAbility(), aurorus.abilityState, tackle, aurorus);
		assert.equal(tackle.type, 'Ice');
		aurorus.faint();
		battle.faintMessages();
		assert.equal(battle.field.terrain, 'fairytaleterrain');
		assert.equal(battle.field.terrainState.duration, 5);
		assert.equal(aurorus.side.sideConditions['auroraveil'].duration, 5);
		assert(battle.log.some(line => line.includes('The Aurora will persist')));
	});

	it('preserves full Relic Armor healing and permits manual Aurora Veil', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Aurorus', item: 'Aurorite', ability: 'Relic Armor', moves: ['splash', 'auroraveil']},
		], [{species: 'Mew', ability: 'No Ability', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		const holder = battle.p1.active[0];
		holder.hp = 100;
		battle.makeChoices('move splash', 'move splash');
		assert.equal(holder.hp, 100 + Math.floor(holder.baseMaxhp / 16), 'ordinary Relic Armor still heals');
		holder.hp = 100;
		battle.makeChoices('move splash mega', 'move splash');
		holder.hp = 100; // Mega evolution itself rescales current HP in this format.
		assert(!holder.side.getSideCondition('auroraveil'));
		battle.makeChoices('move auroraveil', 'move splash');
		assert(holder.side.getSideCondition('auroraveil'), 'manual Veil remains available');
		assert.equal(holder.hp, 100 + Math.floor(holder.baseMaxhp / 16), 'Mega retains full Relic Armor healing');
	});

});
