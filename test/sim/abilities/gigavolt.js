'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

let battle;
describe('Pikachu-Gmax and Gigavolt', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('keeps a separate Gmax profile and transforms regular Pikachu into it', () => {
		const pikachu = Dex.species.get('Pikachu');
		const gmax = Dex.species.get('Pikachu-Gmax');
		assert(pikachu.otherFormes.includes('Pikachu-Gmax'));
		assert.equal(pikachu.canGigantamax, 'G-Max Volt Crash');
		assert.deepEqual(gmax.baseStats, {hp: 90, atk: 80, def: 50, spa: 75, spd: 60, spe: 120});
		assert.deepEqual(gmax.abilities, {0: 'Gigavolt'});
		battle = common.createBattle({formatid: 'gen9mistyfieldadrienn'}, [[
			{species: 'Pikachu', ability: 'Static', gigantamax: true, moves: ['thundershock', 'splash']},
		], [
			{species: 'Mew', ability: 'noability', moves: ['splash', 'thundershock']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const pokemon = battle.p1.active[0];
		assert.equal(pokemon.canDynamax, 'pikachugmax');
		assert.equal(battle.actions.getMaxMove(battle.dex.moves.get('thundershock'), pokemon).id, 'gmaxvoltcrash');
		battle.makeChoices('move thundershock dynamax', 'move splash');
		assert.equal(pokemon.species.id, 'pikachugmax');
		assert.equal(pokemon.ability, 'gigavolt');
		for (const component of ['moldbreaker', 'lightningrod', 'static']) {
			assert(pokemon.hasAbility(component), component);
		}
	});

	it('blocks Electric damage, raises both attacking stats, and paralyzes contact attackers', () => {
		battle = common.createBattle({formatid: 'gen9mistyfieldadrienn'}, [[
			{species: 'Pikachu', ability: 'Static', gigantamax: true, moves: ['splash']},
		], [
			{species: 'Mew', ability: 'noability', moves: ['thundershock', 'tackle', 'splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash dynamax', 'move splash');
		const pikachu = battle.p1.active[0];
		const foe = battle.p2.active[0];
		const hp = pikachu.hp;
		battle.makeChoices('move splash', 'move thundershock');
		assert.equal(pikachu.hp, hp);
		assert.equal(pikachu.boosts.atk, 1);
		assert.equal(pikachu.boosts.spa, 1);
		battle.field.changeTerrain('electricterrain');
		const randomChance = battle.randomChance;
		battle.randomChance = () => true;
		try {
			battle.makeChoices('move splash', 'move tackle');
		} finally {
			battle.randomChance = randomChance;
		}
		assert.equal(foe.status, 'par');
	});

	it('bypasses Volt Absorb with its G-Max Electric attack', () => {
		battle = common.createBattle({formatid: 'gen9mistyfieldadrienn'}, [[
			{species: 'Pikachu', ability: 'Static', gigantamax: true, moves: ['thundershock']},
		], [
			{species: 'Jolteon', ability: 'Volt Absorb', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const foe = battle.p2.active[0];
		battle.makeChoices('move thundershock dynamax', 'move splash');
		assert.equal(battle.p1.active[0].ability, 'gigavolt');
		assert(foe.hp < foe.maxhp, 'G-Max Volt Crash should ignore Volt Absorb');
	});
});
