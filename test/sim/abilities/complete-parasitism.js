'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
function setup(ability = 'Parasitism') {
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
		[{species: 'Parasect', ability, item: 'Parasectite', moves: ['splash']},
			{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
	]);
	battle.makeChoices('team 12', 'team 1');
	return battle.p1.active[0];
}
function lethal(pokemon) {
	pokemon.sethp(10);
	battle.damage(9999, pokemon, battle.p2.active[0], battle.dex.getActiveMove('psychic'));
	assert(pokemon.volatiles.resuscitationpending);
	battle.makeChoices();
	assert.equal(pokemon.species.id, 'parasectparasite');
	assert.equal(pokemon.ability, 'resuscitation');
	assert.equal(pokemon.hp, pokemon.maxhp);
	assert.equal(pokemon.fainted, false);
}
describe('Mega Parasect and Complete Parasitism', () => {
	afterEach(() => { battle?.destroy(); });
	it('cannot Mega Evolve again after starting directly as Mega and reviving', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Parasect-Mega', ability: 'Complete Parasitism', item: 'Parasectite', moves: ['splash']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		const pokemon = battle.p1.active[0];
		lethal(pokemon);
		assert(!pokemon.canMegaEvo);
	});
	it('revives, Mega Evolves, revives again, and cannot Mega Evolve a second time', () => {
		const pokemon = setup();
		assert.equal(pokemon.species.id, 'parasectrejuv');
		assert.equal(pokemon.canMegaEvo, 'Parasect-Mega');
		lethal(pokemon);
		assert.equal(pokemon.canMegaEvo, 'Parasect-Mega');
		battle.makeChoices('move splash mega', 'move splash');
		assert.equal(pokemon.species.id, 'parasectmega');
		assert.equal(pokemon.ability, 'completeparasitism');
		assert.deepEqual(pokemon.species.baseStats, {hp: 90, atk: 140, def: 130, spa: 30, spd: 130, spe: 60});
		assert.deepEqual(pokemon.getTypes(), ['Ghost', 'Bug']);
		lethal(pokemon);
		assert.deepEqual(pokemon.getTypes(), ['Ghost', 'Grass']);
		assert(!pokemon.canMegaEvo);
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(pokemon.species.id, 'parasectparasite');
		assert(!pokemon.canMegaEvo);
		battle.damage(9999, pokemon, battle.p2.active[0], battle.dex.getActiveMove('psychic'));
		assert(!pokemon.volatiles.resuscitationpending);
		assert.equal(pokemon.hp, 0);
	});
	for (const ability of ['Parasitism', 'Poison Heal']) {
		it(`Mega Evolves directly from ${ability} and revives as Parasite`, () => {
			const pokemon = setup(ability);
			battle.makeChoices('move splash mega', 'move splash');
			assert.equal(pokemon.species.id, 'parasectmega');
			lethal(pokemon);
		});
	}
	it('retains Filter and Self Repair alongside Parasitism', () => {
		const pokemon = setup();
		battle.makeChoices('move splash mega', 'move splash');
		assert(pokemon.hasAbility('parasitism'));
		assert(pokemon.hasAbility('filter'));
		assert(pokemon.hasAbility('selfrepair'));
		pokemon.sethp(100);
		const hp = pokemon.hp;
		battle.makeChoices();
		assert.equal(pokemon.hp - hp, Math.floor(pokemon.baseMaxhp / 16));
		const move = battle.dex.getActiveMove('shadowball');
		pokemon.getMoveHitData(move).typeMod = 1;
		assert.equal(battle.runEvent('ModifyDamage', battle.p2.active[0], pokemon, move, 100), 60);
	});
	it('keeps the old host name as an alias', () => {
		setup();
		assert.equal(battle.dex.species.get('Parasect-Parasitism').name, 'Parasect-Rejuv');
	});
});
