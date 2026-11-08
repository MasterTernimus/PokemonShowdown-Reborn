'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Relic Mishap', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('should be assigned to every Galar fossil in place of Water Absorb or Volt Absorb', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		for (const species of ['Dracozolt', 'Arctozolt', 'Dracovish', 'Arctovish']) {
			assert.equal(battle.dex.species.get(species).abilities[0], 'Relic Mishap');
		}
	});

	it('should absorb both Water- and Electric-type attacks', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Arctovish', ability: 'relicmishap', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'noguard', moves: ['watergun', 'thundershock']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const arctovish = battle.p1.active[0];
		battle.directDamage(100, arctovish);
		const damagedHP = arctovish.hp;
		battle.makeChoices('move splash', 'move watergun');
		assert(arctovish.hp > damagedHP);
		const afterWater = arctovish.hp;
		battle.directDamage(100, arctovish);
		battle.makeChoices('move splash', 'move thundershock');
		assert(arctovish.hp > afterWater - 100);
	});

	for (const species of ['Dracozolt', 'Arctozolt', 'Dracovish', 'Arctovish']) {
		for (const move of ['watergun', 'thundershock']) {
			for (const mode of ['normal', 'suppressed', 'moldbreaker']) {
				it(species + ' ' + move + ' absorption with ' + mode, () => {
					battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
						{ species, ability: 'Relic Mishap', moves: ['splash'] },
					], [{ species: 'Mew', ability: mode === 'moldbreaker' ? 'Mold Breaker' : 'No Ability', moves: [move] }]]);
					battle.makeChoices('team 1', 'team 1');
					const p = battle.p1.active[0], q = battle.p2.active[0];
					p.hp = 100; p.maxhp = p.baseMaxhp = 1000;
					if (mode === 'suppressed') p.addVolatile('gastroacid');
					const attack = Object.assign(battle.dex.getActiveMove(move), { damage: 40, accuracy: true, willCrit: false });
					battle.actions.useMove(attack, q, { target: p });
					assert.equal(p.hp, mode === 'normal' ? 350 : 60);
					assert.equal(p.ability, 'relicmishap');
				});
			}
		}
	}

	it('should boost Sp. Def in Sand and Defense in Hail', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Dracovish', ability: 'relicmishap', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'noguard', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const dracovish = battle.p1.active[0];
		const baseDef = dracovish.getStat('def');
		const baseSpD = dracovish.getStat('spd');

		battle.field.setWeather('sandstorm');
		assert.equal(dracovish.getStat('def'), baseDef);
		assert.equal(dracovish.getStat('spd'), battle.modify(baseSpD, 1.5));

		battle.field.setWeather('hail');
		assert.equal(dracovish.getStat('def'), battle.modify(baseDef, 1.5));
		assert.equal(dracovish.getStat('spd'), baseSpD);
	});

	it('should heal 1/16 and ignore both Sandstorm and Hail damage', function () {
		for (const weather of ['sandstorm', 'hail']) {
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
				{species: 'Dracovish', ability: 'relicmishap', moves: ['splash']},
			], [
				{species: 'Mew', ability: 'noguard', moves: ['splash']},
			]]);
			battle.makeChoices('team 1', 'team 1');
			const dracovish = battle.p1.active[0];
			battle.directDamage(100, dracovish);
			const hp = dracovish.hp;
			battle.field.setWeather(weather);
			battle.makeChoices('move splash', 'move splash');
			assert.equal(dracovish.hp - hp, Math.floor(dracovish.baseMaxhp / 16));
			battle.destroy();
			battle = null;
		}
	});

	it('should reduce damage from attacks by 10%', function () {
		const damageTaken = ability => {
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
				{species: 'Dracovish', ability, moves: ['splash']},
			], [
				{species: 'Mew', ability: 'noguard', moves: ['pound']},
			]]);
			battle.makeChoices('team 1', 'team 1');
			const dracovish = battle.p1.active[0];
			battle.makeChoices('move splash', 'move pound');
			const healing = ability === 'relicmishap' ? Math.floor(dracovish.baseMaxhp / 16) : 0;
			return dracovish.maxhp - dracovish.hp + healing;
		};

		const relicDamage = damageTaken('relicmishap');
		battle.destroy();
		const controlDamage = damageTaken('pressure');
		assert(relicDamage < controlDamage);
	});
});
