'use strict';

const assert = require('../../assert');
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

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
			0: 'Poison Heal', 1: 'Lunar Ward', H: 'Dark Aura', S: 'Eclipse', G: 'Ascendance',
		});
		assert.deepEqual(Dex.species.get('Umbreon-Perfect').abilities, {
			0: 'Poison Heal', 1: 'Moonlight Vigil', H: 'Dark Aura', S: 'Eclipse', G: 'Ascendance',
		});
		assert.deepEqual(Dex.species.get('Glaceon').abilities, {
			0: 'Permafrost', 1: 'Slush Rush', H: 'Technician', S: 'Mind Freeze',
		});
		assert.deepEqual(Dex.species.get('Espeon').abilities, {
			0: 'Trace', 1: 'Remembered Step', H: 'Psychic Surge', S: 'Mind Freeze', E: 'Eclipse',
		});
	});

	it('uses Divineon mechanics with Umbreon-Perfect appearance for Umbreon Ascendance', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Umbreon', ability: 'Ascendance', moves: ['radiantassault', 'tackle'] },
		], [
			{ species: 'Mew', level: 1, moves: ['splash'] },
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

		const evs = { hp: 12, atk: 34, def: 56, spa: 78, spd: 90, spe: 111 };
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Eevee-Starter', ability: 'Z Protean', evs: { ...evs }, moves: ['tackle'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		assert.deepEqual(battle.p1.active[0].set.evs, evs);
		battle.destroy();
		battle = null;

		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Eevee-Starter', ability: 'Ascendance', moves: ['radiantassault'] },
		], [
			{ species: 'Mew', level: 1, moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move radiantassault', 'move splash');
		assert.equal(battle.p1.active[0].species.id, 'divineon');
		assert.equal(battle.p1.active[0].volatiles.mustrecharge, undefined);
		assert.equal(battle.p2.active[0].hp, 0);
	});

	it('Sinister Blaze heals from only one opposing burn per turn in doubles', () => {
		const mon = (species, ability = 'No Ability') => ({ species, ability, moves: ['splash'] });
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[mon('Abysseon', 'Sinister Blaze'), mon('Mew')], [mon('Mew'), mon('Blissey')],
		]);
		battle.makeChoices();
		const holder = battle.p1.active[0];
		const [first, second] = battle.p2.active;
		for (const p of [holder, first, second]) p.hp = p.maxhp = p.baseMaxhp = 320;
		holder.hp = 80;
		first.setStatus('brn');
		second.setStatus('brn');
		const tick = p => battle.singleEvent('Residual', battle.dex.conditions.get('brn'), p.statusState, p);
		tick(holder);
		assert.equal(holder.hp, 100);
		assert.equal(first.hp, 300);
		assert.equal(second.hp, 300);
		tick(first);
		tick(second);
		assert.equal(first.hp, 280);
		assert.equal(second.hp, 280);
		assert.equal(holder.hp, 120);
		battle.turn++;
		tick(second);
		tick(first);
		assert.equal(holder.hp, 140);
	});

	it('Ascendance grants exactly one STAB bonus to matching, off-type and typeless attacks', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Divineon', ability: 'Ascendance', moves: ['splash'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices();
		const p = battle.p1.active[0], q = battle.p2.active[0];
		p.setType('Water');
		q.setType('Normal');
		battle.randomizer = damage => damage;
		for (const type of ['Water', 'Electric', '???']) {
			const m = Object.assign(Dex.getActiveMove('watergun'), { type, willCrit: false });
			const neutral = battle.actions.getDamage(p, q, m);
			battle.runEvent('ModifyMove', p, q, m, m);
			assert(m.ignoreImmunity && m.forceSTAB);
			const actual = battle.actions.getDamage(p, q, m);
			const expected = type === 'Water' ? neutral : battle.modify(neutral, 1.5);
			assert.equal(actual, expected, type);
		}
		p.setType('???');
		const ownTypeMove = Object.assign(Dex.getActiveMove('radiantassault'), { willCrit: false });
		const before = battle.actions.getDamage(p, q, ownTypeMove);
		battle.runEvent('ModifyMove', p, q, ownTypeMove, ownTypeMove);
		assert.equal(battle.actions.getDamage(p, q, ownTypeMove), battle.modify(before, 1.5));
		q.setType('Ghost');
		battle.actions.useMove('tackle', p, { target: q });
		assert(q.hp < q.maxhp, 'Normal attack should hit Ghost');
	});

	for (const [ability, form] of [['Sinister Blaze', 'abysseon'], ['Ascendance', 'divineon']]) {
		it(ability + ' grants Misaligned Stars on evolution and blocks repeat moves', () => {
			battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
				[{ species: 'Eevee-Starter', ability, moves: ['splash'] }],
				[{ species: 'Mew', ability: 'No Ability', moves: ['watergun'] }],
			]);
			battle.makeChoices();
			const p = battle.p1.active[0], q = battle.p2.active[0];
			assert.equal(p.species.id, form);
			assert.deepEqual(p.getPassives(), ['misalignedstars']);
			p.hp = Math.floor(p.maxhp / 2);
			for (let i = 0; i < 4; i++) {
				const before = p.hp;
				battle.actions.useMove('watergun', q, { target: p });
				assert(i % 2 ? p.hp > before : p.hp < before);
			}
		});
	}

	it('keeps Eclipse and Mind Freeze operational as event abilities', () => {
		const cases = [
			['Espeon', 'Eclipse', 'soluneon'],
			['Espeon', 'Mind Freeze', 'auroreon'],
			['Glaceon', 'Mind Freeze', 'auroreon'],
			['Umbreon', 'Eclipse', 'soluneon'],
		];
		for (const [species, ability, expectedForme] of cases) {
			battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
				{ species, ability, moves: ['splash'] },
			], [
				{ species: 'Mew', moves: ['splash'] },
			]]);
			battle.makeChoices('team 1', 'team 1');
			assert.equal(battle.p1.active[0].species.id, expectedForme);
			battle.destroy();
			battle = null;
		}
	});
});
