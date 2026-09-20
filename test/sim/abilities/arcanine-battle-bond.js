'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

describe('Arcanine Battle Bond', () => {
	let battle;
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	for (const species of ['Arcanine', 'Arcanine-Hisui']) {
		it(`${species} gains the shared form after a KO`, () => {
			battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
				{ species, ability: 'Battle Bond', moves: ['flamethrower'] },
			], [
				{ species: 'Mew', level: 1, moves: ['splash'] },
				{ species: 'Pikachu', moves: ['splash'] },
			]]);
			battle.makeChoices('team 1', 'team 1');
			battle.p1.active[0].abilityState.battleBondEndured = true;
			battle.makeChoices('move flamethrower', 'move splash');
			const arcanine = battle.p1.active[0];
			assert.equal(arcanine.species.id, 'arcaninebattlebond', battle.log.join('\n'));
			assert.equal(arcanine.ability, 'sacredbond');
			assert.equal(arcanine.bondTriggered, true);
			assert.equal(arcanine.abilityState.battleBondEndured, true);
			assert.deepEqual(arcanine.species.types, ['Fire']);
			assert.deepEqual(arcanine.species.baseStats, {
				hp: 90, atk: 150, def: 105, spa: 125, spd: 105, spe: 125,
			});
		});
	}

	it('keeps both original ability sets while adding Battle Bond', () => {
		assert.equal(Dex.species.get('Arcanine').abilities.S, 'Battle Bond');
		assert.equal(Dex.species.get('Arcanine-Hisui').abilities.S, 'Battle Bond');
		assert.equal(Dex.species.get('Arcanine').abilities.H, 'Drought');
		assert.equal(Dex.species.get('Arcanine-Hisui').abilities.H, 'Hisuian Resolve');
	});

	it('uses Filter instead of the previous flat damage reduction', () => {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[
				{ species: 'Arcanine', ability: 'Battle Bond', moves: ['splash'] },
				{ species: 'Arcanine', ability: 'No Ability', moves: ['splash'] },
			], [
				{ species: 'Garchomp', level: 50, ability: 'No Ability', moves: ['earthquake'] },
				{ species: 'Magikarp', ability: 'No Ability', moves: ['splash'] },
			],
		]);
		battle.makeChoices('team 12', 'team 12');
		battle.makeChoices('move splash, move splash', 'move earthquake, move splash');
		const [bond, plain] = battle.p1.active;
		const bondDamage = bond.maxhp - bond.hp + Math.floor(bond.baseMaxhp / 16);
		const plainDamage = plain.maxhp - plain.hp;
		assert(bondDamage < plainDamage * 0.75, battle.log.join('\n'));
	});

	it('heals after a later KO in its Battle Bond form', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Arcanine', ability: 'Battle Bond', moves: ['flamethrower'] },
		], [
			{ species: 'Mew', level: 1, moves: ['splash'] },
			{ species: 'Pikachu', level: 1, moves: ['splash'] },
			{ species: 'Eevee', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move flamethrower', 'move splash');
		const arcanine = battle.p1.active[0];
		assert.equal(arcanine.species.id, 'arcaninebattlebond');
		arcanine.hp = Math.floor(arcanine.maxhp / 2);
		const before = arcanine.hp;
		battle.makeChoices('', 'switch 2');
		battle.makeChoices('move flamethrower', 'move splash');
		assert(arcanine.hp > before, battle.log.join('\n'));
	});

	for (const [species, move, ability, forme, hits] of [
		['Arcanine', 'extremespeed', 'sacredbond', 'arcaninebattlebond', 1],
		['Garchomp', 'dualchop', 'apexbond', 'garchompbattlebond', 2],
		['Greninja', 'watershuriken', 'shadowbond', 'greninjaash', 3],
	]) {
		it(`${species} uses ${ability}'s enhanced ${move} after a KO`, () => {
			battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
				{ species, ability: 'Battle Bond', moves: [move] },
			], [
				{ species: 'Mew', level: 1, ability: 'No Ability', moves: ['splash'] },
				{ species: 'Toxapex', ability: 'No Ability', moves: ['splash'] },
			]]);
			battle.makeChoices('team 1', 'team 1');
			battle.makeChoices(`move ${move}`, 'move splash');
			const pokemon = battle.p1.active[0];
			assert.equal(pokemon.species.id, forme, battle.log.join('\n'));
			assert.equal(pokemon.ability, ability);
			for (const component of ['battlebond', 'filter', 'selfsufficient']) {
				assert(pokemon.hasAbility(component), `${ability} is missing ${component}`);
			}
			battle.makeChoices('', 'switch 2');
			if (ability === 'sacredbond') {
				assert.equal(battle.p2.active[0].boosts.atk, -1, battle.log.join('\n'));
			}
			const start = battle.log.length;
			battle.makeChoices(`move ${move}`, 'move splash');
			const attackLog = battle.log.slice(start).join('\n');
			assert.equal((attackLog.match(/\|-crit\|/g) || []).length, hits, attackLog);
		});
	}

	for (const [species, move, forme, ability] of [
		['Garchomp', 'earthquake', 'garchompbattlebond', 'apexbond'],
		['Greninja', 'surf', 'greninjaash', 'shadowbond'],
	]) {
		it(`${species} keeps its endurance use when Battle Bond transforms it`, () => {
			battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
				{ species, ability: 'Battle Bond', moves: [move] },
			], [
				{ species: 'Mew', level: 1, moves: ['splash'] },
				{ species: 'Pikachu', moves: ['splash'] },
			]]);
			battle.makeChoices('team 1', 'team 1');
			battle.p1.active[0].abilityState.battleBondEndured = true;
			battle.makeChoices(`move ${move}`, 'move splash');
			assert.equal(battle.p1.active[0].species.id, forme);
			assert.equal(battle.p1.active[0].ability, ability);
			assert.equal(battle.p1.active[0].abilityState.battleBondEndured, true);
		});
	}

	it('endures one lethal move from above one-third HP in doubles, then is KOed by the next', () => {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[
				{ species: 'Arcanine', ability: 'Battle Bond', moves: ['splash'] },
				{ species: 'Magikarp', ability: 'No Ability', moves: ['splash'] },
			], [
				{ species: 'Mewtwo', ability: 'No Ability', moves: ['earthpower'] },
				{ species: 'Magikarp', ability: 'No Ability', moves: ['splash'] },
			],
		]);
		battle.makeChoices('team 12', 'team 12');
		const arcanine = battle.p1.active[0];
		arcanine.hp = Math.floor(arcanine.maxhp / 3) + 1;
		battle.makeChoices('move splash, move splash', 'move earthpower 1, move splash');
		assert.equal(arcanine.hp, 1 + Math.floor(arcanine.baseMaxhp / 16), battle.log.join('\n'));
		assert.equal(arcanine.abilityState.battleBondEndured, true);
		battle.makeChoices('move splash, move splash', 'move earthpower 1, move splash');
		assert.equal(arcanine.hp, 0, battle.log.join('\n'));
	});

	it('does not endure a lethal move when already at one-third HP', () => {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[
				{ species: 'Arcanine', ability: 'Battle Bond', moves: ['splash'] },
				{ species: 'Magikarp', ability: 'No Ability', moves: ['splash'] },
			], [
				{ species: 'Mewtwo', ability: 'No Ability', moves: ['earthpower'] },
				{ species: 'Magikarp', ability: 'No Ability', moves: ['splash'] },
			],
		]);
		battle.makeChoices('team 12', 'team 12');
		const arcanine = battle.p1.active[0];
		arcanine.hp = Math.floor(arcanine.maxhp / 3);
		battle.makeChoices('move splash, move splash', 'move earthpower 1, move splash');
		assert.equal(arcanine.hp, 0, battle.log.join('\n'));
	});

	it('does not grant the KO protection in singles', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Arcanine', ability: 'Battle Bond', moves: ['splash'] },
		], [
			{ species: 'Mewtwo', ability: 'No Ability', moves: ['earthpower'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		const arcanine = battle.p1.active[0];
		arcanine.hp = Math.floor(arcanine.maxhp / 3) + 1;
		battle.makeChoices('move splash', 'move earthpower');
		assert.equal(arcanine.hp, 0, battle.log.join('\n'));
	});
});
