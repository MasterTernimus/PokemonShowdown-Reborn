'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
describe('Gardevoir abilities and cosmetic Mega branches', () => {
	afterEach(() => battle?.destroy());
	for (const species of ['Gardevoir', 'Gardevoir-Void']) {
		for (const [choice, expected] of [['mega', species === 'Gardevoir' ? 'Gardevoir-Mega' : 'Gardevoir-Mega-Alt'], ['megax', 'Gardevoir-Mega-Z'], ['megay', 'Gardevoir-Void-Mega']]) {
			it(`${species} uses Gardevoirite for ${expected}`, () => {
				battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
					[{species, ability: 'Void Veil', item: 'Gardevoirite', moves: ['splash']}],
					[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
				]);
				battle.makeChoices('team 1', 'team 1');
				const mon = battle.p1.active[0];
				assert(mon.canMegaEvo && mon.canMegaEvoX && mon.canMegaEvoY);
				battle.makeChoices(`move splash ${choice}`, 'move splash');
				assert.equal(mon.species.name, expected);
				if (choice === 'mega') {
					assert.equal(mon.ability, 'royalvoice');
					assert.deepEqual(mon.species.baseStats, battle.dex.species.get('gardevoirmega').baseStats);
					assert.equal(mon.canMegaEvoX, 'Gardevoir-Mega-Z');
					assert.equal(mon.canMegaEvoY, 'Gardevoir-Void-Mega');
				}
			});
		}
	}
	function doubles(ability) {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [
			[{species: 'Gardevoir', ability, moves: ['splash']}, {species: 'Mew', ability: 'No Ability', moves: ['splash']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['quickattack', 'splash']}, {species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.makeChoices('team 12', 'team 12');
		return battle.p1.active;
	}
	it('Void Veil provides Levitate, Insomnia, Friend Guard, and Dream Sickness healing', () => {
		const [mon, ally] = doubles('Void Veil'), foe = battle.p2.active[0];
		assert(!mon.runImmunity('Ground'));
		assert(!mon.trySetStatus('slp', foe)); assert(!mon.addVolatile('yawn', foe));
		assert(!mon.hasAbility('costar'));
		assert.equal(battle.runEvent('ModifyDamage', foe, ally, battle.dex.getActiveMove('tackle'), 100), 75);
		mon.hp = 100; ally.hp = 10; ally.status = 'brn';
		battle.singleEvent('Residual', mon.getAbility(), mon.abilityState, mon);
		assert.equal(mon.hp, 100 + Math.floor(mon.baseMaxhp / 16));
		assert.equal(ally.hp, 10 + Math.floor(ally.baseMaxhp / 16) + Math.floor(ally.baseMaxhp / 4));
		assert.equal(ally.status, ''); assert(ally.volatiles.dreamsickness);
		ally.hp = 10;
		battle.singleEvent('Residual', mon.getAbility(), mon.abilityState, mon);
		assert.equal(ally.hp, 10 + Math.floor(ally.baseMaxhp / 16));
	});
	it('Royal Voice has exact Pixilate conversion and Queenly Majesty protection', () => {
		const [mon, ally] = doubles('Royal Voice'), foe = battle.p2.active[0];
		const move = battle.dex.getActiveMove('hypervoice');
		battle.singleEvent('ModifyType', mon.getAbility(), mon.abilityState, move, mon);
		assert.equal(move.type, 'Fairy');
		assert.equal(battle.runEvent('BasePower', mon, foe, move, 100), 120);
		assert.equal(battle.runEvent('BasePower', mon, foe, battle.dex.getActiveMove('psychic'), 100), 100);
		const hp = ally.hp;
		battle.makeChoices('move splash, move splash', 'move quickattack 2, move splash');
		assert.equal(ally.hp, hp);
	});
	it('Royal Voice copies an opposing Ability and runs its effects without Future Sight', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Gardevoir', ability: 'Royal Voice', moves: ['hypervoice'] }],
			[{ species: 'Lapras', ability: 'Water Absorb', moves: ['surf'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		const mon = battle.p1.active[0];
		assert.equal(mon.m.perfectForesightAbility, 'waterabsorb');
		assert(mon.hasAbility('waterabsorb'));
		assert(!mon.hasAbility('insomnia'));
		mon.hp = Math.floor(mon.maxhp / 2);
		const hp = mon.hp;
		battle.makeChoices('move hypervoice', 'move surf');
		assert(mon.hp > hp);
		assert(!battle.p2.slotConditions[0].futuremove);
	});
	it('Royal Voice prioritizes an active Speed Ability when choosing a foe', () => {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[{ species: 'Gardevoir', ability: 'Royal Voice', moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Magikarp', ability: 'Speed Boost', moves: ['splash'] }, { species: 'Mewtwo', ability: 'Pressure', moves: ['splash'] }],
		]);
		battle.makeChoices('team 12', 'team 12');
		const mon = battle.p1.active[0];
		assert.equal(mon.m.perfectForesightAbility, 'speedboost');
		battle.makeChoices('move splash, move splash', 'move splash, move splash');
		assert.equal(mon.boosts.spe, 1);
	});
	it('Mega Gardevoir copies on Mega Evolution and removes the copy with Royal Voice', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Gardevoir', ability: 'Trace', item: 'Gardevoirite', moves: ['splash'] }],
			[{ species: 'Lapras', ability: 'Water Absorb', moves: ['splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		const mon = battle.p1.active[0];
		battle.makeChoices('move splash mega', 'move splash');
		assert.equal(mon.ability, 'royalvoice');
		assert.equal(mon.m.perfectForesightAbility, 'waterabsorb');
		assert(mon.hasAbility('waterabsorb'));
		mon.setAbility('No Ability');
		assert(!mon.m.perfectForesightAbility);
		assert(!mon.hasAbility('waterabsorb'));
	});
});
