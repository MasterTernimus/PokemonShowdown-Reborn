'use strict';

const assert = require('assert').strict;
const common = require('../common');
const {Dex} = require('../../dist/sim');

describe('Torterra and Torterra-Mega-Y', () => {
	let battle;
	afterEach(() => battle?.destroy());

	it('registers the revised base form and a separate Mega Y', () => {
		const base = Dex.species.get('Torterra');
		const mega = Dex.species.get('Torterra-Mega-Y');
		assert.deepEqual(base.baseStats, {hp: 95, atk: 109, def: 105, spa: 75, spd: 85, spe: 66});
		assert.equal(base.bst, 535);
		assert.deepEqual(base.abilities, {'0': 'Stamina', '1': 'Shell Armor', H: 'Terra Gift'});
		assert.deepEqual(base.otherFormes, ['Torterra-Mega-X', 'Torterra-Mega-Y', 'Torterra-Rift', 'Torterra-Rift-Shatter']);
		assert.deepEqual(mega.types, ['Grass', 'Rock']);
		assert.deepEqual(mega.baseStats, {hp: 95, atk: 95, def: 135, spa: 159, spd: 105, spe: 46});
		assert.equal(mega.bst, 635);
		assert.equal(mega.abilities[0], 'Terra Resolve');
		assert.equal(mega.requiredItem, 'Torterranite');
		assert.equal(Dex.items.get('Torterranite').megaStone.Torterra, 'Torterra-Mega-X');
		assert.equal(Dex.items.get('Torterrite Y').id, 'torterranite');
		assert.equal(Dex.species.get('Torterra-Reborn').exists, false);
	});

	it('Mega Evolves with Terra Resolve and gains its four component effects', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Torterra', item: 'Torterranite', moves: ['splash', 'energyball', 'rockslide']},
		], [{species: 'Mew', moves: ['tackle']}]]);
		battle.makeChoices('team 1', 'team 1');
		assert.equal(battle.p1.active[0].canMegaEvo, 'Torterra-Mega-X');
		assert.equal(battle.p1.active[0].canMegaEvoY, 'Torterra-Mega-Y');
		battle.makeChoices('move splash megay', 'move tackle');
		const torterra = battle.p1.active[0];
		assert.equal(torterra.species.name, 'Torterra-Mega-Y');
		for (const ability of ['stamina', 'rockypayload', 'solidrock', 'proficient']) {
			assert(torterra.hasAbility(ability), ability);
		}
		assert(!torterra.hasAbility('selfsufficient'));
		assert.equal(torterra.boosts.def, 1, 'Stamina boosts Defense when damaged');
		const move = battle.dex.getActiveMove('energyball');
		const withStab = battle.runEvent('BasePower', torterra, battle.p2.active[0], move, 100);
		torterra.setType('Water');
		const withoutStab = battle.runEvent('BasePower', torterra, battle.p2.active[0], move, 100);
		assert(Math.abs(withStab - withoutStab * 1.3) <= 1, 'Proficient increases matching-type move power');
		const rockMove = battle.dex.getActiveMove('rockslide');
		assert.equal(battle.runEvent('ModifySpA', torterra, battle.p2.active[0], rockMove, 100), 150);
		assert.equal(battle.runEvent('ModifySpA', torterra, battle.p2.active[0], move, 100), 100);
		const incoming = battle.dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('SourceModifyDamage', torterra, battle.p2.active[0], incoming, 100), 80);
	});

	it('removes Solid Rock from Terra Gift', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Torterra', ability: 'Terra Gift', moves: ['splash']},
		], [{species: 'Mew', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		assert(!battle.p1.active[0].hasAbility('solidrock'));
		assert(battle.p1.active[0].hasAbility('proficient'));
	});
});
