'use strict';

const assert = require('assert').strict;
const common = require('../../common');

let battle;

function transform(species, knockoutMove, otherMoves, foeMoves = ['splash']) {
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
		{ species, ability: 'Battle Bond', moves: [knockoutMove, ...otherMoves] },
	], [
		{ species: 'Mew', level: 1, ability: 'No Ability', moves: ['splash'] },
		{ species: 'Toxapex', ability: 'No Ability', moves: foeMoves },
	]]);
	battle.makeChoices('team 1', 'team 1');
	battle.makeChoices(`move ${knockoutMove}`, 'move splash');
	const user = battle.p1.active[0];
	assert(user.bondTriggered, battle.log.join('\n'));
	battle.makeChoices('', 'switch 2');
	return [user, battle.p2.active[0]];
}

describe('Bond ability component audit', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('Shadow Bond applies Proficient once and Water Shuriken bypasses Substitute', () => {
		const [greninja, foe] = transform('Greninja', 'watershuriken', ['splash']);
		assert.equal(greninja.ability, 'shadowbond');
		const move = battle.dex.getActiveMove('watershuriken');
		assert.equal(battle.runEvent('BasePower', greninja, foe, move, 100), 130);
		greninja.setType('Normal');
		assert.equal(battle.runEvent('BasePower', greninja, foe, move, 100), 100);
		greninja.setType(['Water', 'Dark']);
		foe.addVolatile('substitute');
		const before = foe.hp;
		battle.makeChoices('move watershuriken', 'move splash');
		assert(foe.hp < before, 'Infiltrator should bypass the target\'s Substitute');
	});

	it('Apex Bond scales with fallen allies and Rough Skin punishes contact', () => {
		const [garchomp, foe] = transform('Garchomp', 'earthquake', ['splash'], ['tackle']);
		assert.equal(garchomp.ability, 'apexbond');
		const move = battle.dex.getActiveMove('dragonclaw');
		assert.equal(battle.runEvent('BasePower', garchomp, foe, move, 100), 100);
		garchomp.side.totalFainted = 2;
		assert.equal(battle.runEvent('BasePower', garchomp, foe, move, 100), 120);
		const before = foe.hp;
		battle.makeChoices('move splash', 'move tackle');
		assert.equal(before - foe.hp, Math.floor(foe.baseMaxhp / 8), battle.log.join('\n'));
	});

	it('Apex Bond retains Supreme Overlord\'s staged protections', () => {
		const [garchomp, foe] = transform('Garchomp', 'earthquake', ['splash']);
		const ability = garchomp.getAbility();
		garchomp.side.totalFainted = 1;
		const drop = { atk: -1 };
		battle.singleEvent('TryBoost', ability, garchomp.abilityState, garchomp, foe,
			battle.dex.abilities.get('intimidate'), drop);
		assert.equal(drop.atk, undefined, 'one fallen ally should block opposing stat drops');
		garchomp.side.totalFainted = 2;
		const move = battle.dex.getActiveMove('dragonclaw');
		battle.singleEvent('ModifyMove', ability, garchomp.abilityState, move, garchomp, foe);
		assert.equal(move.infiltrates, true, 'two fallen allies should grant Infiltrator');
		garchomp.side.totalFainted = 4;
		assert.equal(battle.singleEvent('TryAddVolatile', ability, garchomp.abilityState,
			garchomp, null, null, battle.dex.conditions.get('flinch')), null);
		garchomp.side.totalFainted = 5;
		battle.singleEvent('Start', ability, garchomp.abilityState, garchomp);
		assert.equal(garchomp.boosts.atk, 1);
		assert.equal(garchomp.boosts.spa, 1);
		assert.equal(battle.singleEvent('Damage', ability, garchomp.abilityState,
			garchomp, foe, battle.dex.conditions.get('brn'), 20), false,
		'Magic Guard should block indirect damage at five fallen allies');
	});

	it('Sacred Bond applies Magma Armor and enhances Extreme Speed without extra STAB', () => {
		const [arcanine, foe] = transform('Arcanine', 'flamethrower', ['extremespeed']);
		assert.equal(arcanine.ability, 'sacredbond');
		assert.equal(foe.boosts.atk, -1, 'Intimidate should affect the replacement foe');
		assert.equal(battle.runEvent('Immunity', arcanine, null, null, 'frz'), false);
		assert.equal(battle.runEvent('SourceModifySpA', arcanine, foe,
			battle.dex.getActiveMove('icebeam'), 100), 50);
		assert.equal(battle.runEvent('BasePower', arcanine, foe,
			battle.dex.getActiveMove('extremespeed'), 100), 150);
	});

	it('Enhanced attacks require the matching transformed ability', () => {
		const [greninja, foe] = transform('Greninja', 'watershuriken', ['splash']);
		const shuriken = battle.dex.getActiveMove('watershuriken');
		battle.dex.moves.get('watershuriken').onModifyMove.call(battle, shuriken, greninja);
		assert.equal(shuriken.multihit, 3);
		assert.equal(shuriken.willCrit, true);
		assert.equal(battle.dex.moves.get('watershuriken').basePowerCallback.call(battle, greninja, foe, shuriken), 30);
		greninja.setAbility('No Ability', null, null, true);
		const ordinary = battle.dex.getActiveMove('watershuriken');
		assert.equal(battle.dex.moves.get('watershuriken').basePowerCallback.call(battle, greninja, foe, ordinary), 20);
	});

	it('Apex Bond alone grants Dual Chop perfect accuracy and guaranteed critical hits', () => {
		const [garchomp, foe] = transform('Garchomp', 'earthquake', ['dualchop']);
		const chop = battle.dex.getActiveMove('dualchop');
		battle.dex.moves.get('dualchop').onModifyMove.call(battle, chop, garchomp, foe);
		assert.equal(chop.accuracy, true);
		assert.equal(chop.willCrit, true);
		garchomp.setAbility('No Ability', null, null, true);
		const ordinary = battle.dex.getActiveMove('dualchop');
		battle.dex.moves.get('dualchop').onModifyMove.call(battle, ordinary, garchomp, foe);
		assert.equal(ordinary.accuracy, 90);
		assert.notEqual(ordinary.willCrit, true);
	});

	it('KO survival is consumed for the battle even after switching out and back', () => {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[
				{ species: 'Arcanine', ability: 'Battle Bond', moves: ['splash'] },
				{ species: 'Magikarp', ability: 'No Ability', moves: ['splash'] },
				{ species: 'Eevee', ability: 'No Ability', moves: ['splash'] },
			], [
				{ species: 'Mewtwo', ability: 'No Ability', moves: ['earthpower', 'splash'] },
				{ species: 'Magikarp', ability: 'No Ability', moves: ['splash'] },
			],
		]);
		battle.makeChoices('team 12', 'team 12');
		const arcanine = battle.p1.active[0];
		arcanine.hp = Math.floor(arcanine.maxhp / 3) + 1;
		battle.makeChoices('move splash, move splash', 'move earthpower 1, move splash');
		assert.equal(arcanine.abilityState.battleBondEndured, true);
		battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		assert.equal(battle.p1.active[0], arcanine);
		arcanine.hp = Math.floor(arcanine.maxhp / 3) + 1;
		battle.makeChoices('move splash, move splash', 'move earthpower 1, move splash');
		assert.equal(arcanine.hp, 0, battle.log.join('\n'));
	});

	it('a lethal hit survived before transformation remains spent afterward', () => {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[
				{ species: 'Arcanine', ability: 'Battle Bond', moves: ['flamethrower', 'splash'] },
				{ species: 'Magikarp', ability: 'No Ability', moves: ['splash'] },
			], [
				{ species: 'Mewtwo', ability: 'No Ability', moves: ['earthpower'] },
				{ species: 'Mew', level: 1, ability: 'No Ability', moves: ['splash'] },
				{ species: 'Magikarp', ability: 'No Ability', moves: ['splash'] },
			],
		]);
		battle.makeChoices('team 12', 'team 12');
		const arcanine = battle.p1.active[0];
		arcanine.hp = Math.floor(arcanine.maxhp / 3) + 1;
		battle.makeChoices('move flamethrower 2, move splash', 'move earthpower 1, move splash');
		assert.equal(arcanine.species.id, 'arcaninebattlebond', battle.log.join('\n'));
		assert.equal(arcanine.ability, 'sacredbond');
		assert.equal(arcanine.battleBondEndured, true);
		battle.makeChoices('', 'switch 3');
		arcanine.hp = Math.floor(arcanine.maxhp / 3) + 1;
		battle.makeChoices('move splash, move splash', 'move earthpower 1, move splash');
		assert.equal(arcanine.hp, 0, battle.log.join('\n'));
	});

	it('Battle Bond transforms and Sacred Bond activates in Free-for-All', () => {
		battle = common.createBattle({ formatid: 'gen9freeforall4pfactoryfield' }, [
			[{ species: 'Arcanine', ability: 'Battle Bond', moves: ['flamethrower'] }],
			[{ species: 'Mew', level: 1, ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Magikarp', ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Magikarp', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1', 'team 1', 'team 1');
		battle.makeChoices('move flamethrower +1', 'move splash', 'move splash', 'move splash');
		assert.equal(battle.p1.active[0].species.id, 'arcaninebattlebond', battle.log.join('\n'));
		assert.equal(battle.p1.active[0].ability, 'sacredbond');
		assert.equal(battle.p3.active[0].boosts.atk, -1);
		assert.equal(battle.p4.active[0].boosts.atk, -1);
	});

	for (const [label, formatid] of [
		['Free-for-All', 'gen9freeforall4pfactoryfield'],
		['Multi', 'gen9multifactoryfield'],
	]) {
		it(`Battle Bond survives one lethal move in ${label}`, () => {
			battle = common.createBattle({ formatid }, [
				[{ species: 'Arcanine', ability: 'Battle Bond', moves: ['splash'] }],
				[{ species: 'Mewtwo', ability: 'No Ability', moves: ['earthpower'] }],
				[{ species: 'Magikarp', ability: 'No Ability', moves: ['splash'] }],
				[{ species: 'Magikarp', ability: 'No Ability', moves: ['splash'] }],
			]);
			battle.makeChoices('team 1', 'team 1', 'team 1', 'team 1');
			const arcanine = battle.p1.active[0];
			arcanine.hp = Math.floor(arcanine.maxhp / 3) + 1;
			battle.makeChoices('move splash', `move earthpower ${battle.p2.active[0].getLocOf(arcanine)}`,
				'move splash', 'move splash');
			assert.equal(arcanine.battleBondEndured, true, battle.log.join('\n'));
			assert(arcanine.hp > 0, battle.log.join('\n'));
		});
	}
});
