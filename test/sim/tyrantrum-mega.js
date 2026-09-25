'use strict';

const assert = require('../assert');
const common = require('../common');
const {Dex} = require('../../dist/sim/dex');

describe('Tyrantrum-Mega', function () {
	let battle;
	afterEach(() => battle?.destroy());

	it('uses the requested form, stone, and Steel coverage', function () {
		const base = Dex.species.get('Tyrantrum');
		const mega = Dex.species.get('Tyrantrum-Mega');
		assert.deepEqual(base.otherFormes, ['Tyrantrum-Mega']);
		assert.deepEqual(mega.types, ['Steel', 'Dragon']);
		assert.deepEqual(mega.baseStats, {hp: 82, atk: 170, def: 135, spa: 50, spd: 103, spe: 100});
		assert.equal(mega.bst, 640);
		assert.equal(mega.abilities[0], 'Tyrant Domain');
		assert.equal(mega.requiredItem, 'Tyrantrumite');
		assert.equal(Dex.items.get('Tyrantrumite').megaStone.Tyrantrum, mega.name);
		for (const move of ['heavyslam', 'smartstrike']) {
			assert(Dex.species.getLearnsetData('tyrantrum').learnset[move]);
		}
	});

	it('starts Sand Stream without changing the field, then Dragon\'s Den on fainting', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Tyrantrum', item: 'Tyrantrumite', ability: 'relicarmor', moves: ['splash']},
		], [{species: 'Magikarp', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		const tyrantrum = battle.p1.active[0];
		assert.species(tyrantrum, 'Tyrantrum-Mega');
		assert(tyrantrum.hasAbility('relicarmor'));
		assert(tyrantrum.hasAbility('supremeoverlord'));
		assert(tyrantrum.hasAbility('sandstream'));
		assert.equal(battle.field.weather, 'sandstorm');
		assert.equal(battle.field.terrain, '', 'entry must not create Fairy Tale');
		tyrantrum.faint();
		battle.faintMessages();
		assert.equal(battle.field.terrain, 'dragonsdenterrain');
		assert.equal(battle.field.terrainState.duration, 8);
		assert(battle.log.some(line => line.includes("Dragon's Den Terrain") && line.includes('[turns] 8')));
		assert(battle.log.some(line => line.includes('The Tyrant will persist')));
	});
});
