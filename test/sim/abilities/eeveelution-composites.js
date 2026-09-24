'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

let battle;
describe('Eevee and Eeveelution ability updates', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('sets the requested HP and ability slots', () => {
		assert.equal(Dex.species.get('Eevee-Gmax').baseStats.hp, 150);
		assert.deepEqual(Dex.species.get('Vaporeon').abilities, {0: 'Tidal Wave', 1: 'Marvel Scale', H: 'Drizzle'});
		assert.deepEqual(Dex.species.get('Jolteon').abilities, {0: 'Livewire', 1: 'Battery', H: 'Electric Surge'});
		assert.deepEqual(Dex.species.get('Flareon').abilities, {0: 'Kindled Fury', 1: 'Fire Mane', H: 'Drought'});
	});

	it('lets Tidal Wave absorb Water attacks and retain its component effects', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Vaporeon', ability: 'Tidal Wave', moves: ['splash']},
		], [
			{species: 'Mew', moves: ['watergun']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const vaporeon = battle.p1.active[0];
		for (const component of ['waterabsorb', 'hydration', 'regenerator', 'raindish']) {
			assert(vaporeon.hasAbility(component), component);
		}
		battle.damage(80, vaporeon);
		const hpBefore = vaporeon.hp;
		battle.makeChoices('move splash', 'move watergun');
		assert(vaporeon.hp > hpBefore);
	});

	it('lets Livewire absorb Electric attacks and keep Quick Feet under paralysis', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Jolteon', ability: 'Livewire', moves: ['splash']},
		], [
			{species: 'Mew', moves: ['thunderbolt']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const jolteon = battle.p1.active[0];
		for (const component of ['transistor', 'voltabsorb', 'quickfeet', 'ironbarbs']) {
			assert(jolteon.hasAbility(component), component);
		}
		const normalSpeed = jolteon.getStat('spe');
		jolteon.setStatus('par', null, null, true);
		assert(jolteon.getStat('spe') > normalSpeed);
		battle.damage(60, jolteon);
		const hpBefore = jolteon.hp;
		battle.makeChoices('move splash', 'move thunderbolt');
		assert(jolteon.hp > hpBefore);
	});

	it('lets Kindled Fury absorb Fire attacks and expose every component', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Flareon', ability: 'Kindled Fury', moves: ['splash']},
		], [
			{species: 'Mew', moves: ['flamethrower']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const flareon = battle.p1.active[0];
		for (const component of ['fluffy', 'guts', 'flashfire', 'bruteforce']) {
			assert(flareon.hasAbility(component), component);
		}
		const hpBefore = flareon.hp;
		battle.makeChoices('move splash', 'move flamethrower');
		assert.equal(flareon.hp, hpBefore);
		assert(flareon.volatiles.flashfire);
	});
});
