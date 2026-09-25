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

	it('starts Snow Warning and a five-turn Veil on entry, then sets Fairy Tale and refreshes Veil on faint', function () {
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
		assert(aurorus.side.getSideCondition('auroraveil'));
		assert.equal(aurorus.side.sideConditions['auroraveil'].duration, 4, 'the five-turn Veil has spent its first turn');
		const tackle = battle.dex.getActiveMove('tackle');
		battle.singleEvent('ModifyType', aurorus.getAbility(), aurorus.abilityState, tackle, aurorus);
		assert.equal(tackle.type, 'Ice');
		aurorus.faint();
		battle.faintMessages();
		assert.equal(battle.field.terrain, 'fairytaleterrain');
		assert.equal(battle.field.terrainState.duration, 8);
		assert.equal(aurorus.side.sideConditions['auroraveil'].duration, 8);
		assert(battle.log.some(line => line.includes('Fairy Tale Terrain') && line.includes('[turns] 8')));
		assert(battle.log.some(line => line.includes('The Aurora will persist')));
	});
});
