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

	it('starts sand and grants its replacement Attack on fainting without changing the field', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Tyrantrum', item: 'Tyrantrumite', ability: 'relicarmor', moves: ['splash']},
			{ species: 'Mew', moves: ['splash'] },
		], [{ species: 'Magikarp', moves: ['splash', 'tackle'] }]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		const tyrantrum = battle.p1.active[0];
		assert.species(tyrantrum, 'Tyrantrum-Mega');
		assert.deepEqual(tyrantrum.getPassives(), ['relicarmor']);
		assert(tyrantrum.hasAbilityOrPassive('relicarmor'));
		assert(tyrantrum.hasAbility('supremeoverlord'));
		assert(tyrantrum.hasAbility('sandstream'));
		assert.equal(battle.field.weather, 'sandstorm');
		assert.equal(battle.field.terrain, '', 'entry must not create Fairy Tale');
		tyrantrum.hp = 1;
		battle.makeChoices('move splash', 'move tackle');
		assert.fainted(tyrantrum);
		assert.equal(battle.field.terrain, '');
		battle.makeChoices('switch 2');
		assert.species(battle.p1.active[0], 'Mew');
		assert.statStage(battle.p1.active[0], 'atk', 1);
		assert.false(battle.p1.slotConditions[0].tyrantlegacy);
	});
});
