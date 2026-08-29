'use strict';

const assert = require('../../assert');
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

let battle;

describe('Eeveelution event abilities', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('sets the requested regular and Special Event ability slots', () => {
		assert.deepEqual(Dex.species.get('Eevee-Starter').abilities, {
			0: 'Z Protean', 1: 'Opportunist', H: 'Unstable Evo', S: 'Mind Freeze', E: 'Sinister Blaze', F: 'Eclipse', G: 'Ascendance',
		});
		assert.deepEqual(Dex.species.get('Umbreon').abilities, {
			0: 'Poison Heal', 1: 'Inner Focus', H: 'Pressure', S: 'Eclipse', G: 'Ascendance',
		});
		assert.deepEqual(Dex.species.get('Umbreon-Perfect').abilities, {
			0: 'Poison Heal', 1: 'Inner Focus', H: 'Pressure', S: 'Eclipse', G: 'Ascendance',
		});
		assert.deepEqual(Dex.species.get('Glaceon').abilities, {
			0: 'Ice Scales', 1: 'Slush Rush', H: 'Ice Body', S: 'Mind Freeze',
		});
		assert.deepEqual(Dex.species.get('Espeon').abilities, {
			0: 'Trace', 1: 'Magic Bounce', H: 'Telepathy', S: 'Mind Freeze', E: 'Eclipse',
		});
	});

	it('uses Divineon mechanics with Umbreon-Perfect appearance for Umbreon Ascendance', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Umbreon', ability: 'Ascendance', moves: ['radiantassault', 'tackle']},
		], [
			{species: 'Mew', level: 1, moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const umbreon = battle.p1.active[0];
		assert.equal(umbreon.species.id, 'divineon');
		assert.deepEqual(umbreon.species.baseStats, {
			hp: 65, atk: 110, def: 65, spa: 110, spd: 65, spe: 130,
		});
		assert(battle.log.some(line => line.includes('|-formechange|p1a: Umbreon|Umbreon-Perfect|') &&
			line.includes('[from] ability: Ascendance')));
		assert.equal(umbreon.ability, 'ascendance');
		assert(umbreon.hasMove('tackle'));
	});

	it('defines Divineon and preserves Eevee-Starter EVs with Z Protean', () => {
		assert.deepEqual(Dex.species.get('Divineon').types, ['???']);
		assert.deepEqual(Dex.species.get('Divineon').baseStats, {
			hp: 65, atk: 110, def: 65, spa: 110, spd: 65, spe: 130,
		});
		assert.equal(Dex.species.get('Divineon').abilities[0], 'Ascendance');
		assert.equal(Dex.moves.get('Radiant Assault').target, 'allAdjacentFoes');
		assert.equal(Dex.moves.get('Radiant Assault').type, '???');

		const evs = {hp: 12, atk: 34, def: 56, spa: 78, spd: 90, spe: 111};
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Eevee-Starter', ability: 'Z Protean', evs: {...evs}, moves: ['tackle']},
		], [
			{species: 'Mew', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		assert.deepEqual(battle.p1.active[0].set.evs, evs);
		battle.destroy();
		battle = null;

		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Eevee-Starter', ability: 'Ascendance', moves: ['radiantassault']},
		], [
			{species: 'Mew', level: 1, moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move radiantassault', 'move splash');
		assert.equal(battle.p1.active[0].species.id, 'divineon');
		assert.equal(battle.p1.active[0].volatiles.mustrecharge, undefined);
		assert.equal(battle.p2.active[0].hp, 0);
	});

	it('keeps Eclipse and Mind Freeze operational as event abilities', () => {
		const cases = [
			['Espeon', 'Eclipse', 'soluneon'],
			['Espeon', 'Mind Freeze', 'auroreon'],
			['Glaceon', 'Mind Freeze', 'auroreon'],
			['Umbreon', 'Eclipse', 'soluneon'],
		];
		for (const [species, ability, expectedForme] of cases) {
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
				{species, ability, moves: ['splash']},
			], [
				{species: 'Mew', moves: ['splash']},
			]]);
			battle.makeChoices('team 1', 'team 1');
			assert.equal(battle.p1.active[0].species.id, expectedForme);
			battle.destroy();
			battle = null;
		}
	});
});
