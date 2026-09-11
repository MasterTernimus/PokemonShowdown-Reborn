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
});
