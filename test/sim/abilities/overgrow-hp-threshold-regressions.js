'use strict';

const assert = require('assert').strict;
const common = require('../../common');

describe('Overgrow and per-target HP threshold regressions', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });

	for (const [species, ability] of [['Mew', 'Overgrow'], ['Venusaur', 'No Ability']]) {
		for (const field of ['', 'grassyterrain']) {
			for (const lowHP of [false, true]) {
				it(`${species}: Overgrow only boosts Grass moves (field=${field}, lowHP=${lowHP})`, () => {
					battle = common.createBattle({}, [[{species, ability, moves: ['splash']}],
						[{species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
					const [holder, foe] = battle.getAllActive();
					battle.field.terrain = field;
					if (lowHP) holder.hp = 1;
					for (const [move, event, grass] of [
						['tackle', 'ModifyAtk', false], ['flamethrower', 'ModifySpA', false],
						['leafblade', 'ModifyAtk', true], ['energyball', 'ModifySpA', true],
					]) {
						assert.equal(battle.runEvent(event, holder, foe, battle.dex.getActiveMove(move), 100),
							grass && (field || lowHP) ? 150 : 100, move);
					}
				});
			}
		}
	}

	for (const [species, ability, level] of [['Hydreigon', 'Worldbreaker', 100], ['Klawf', 'Anger Shell', 50]]) {
		for (const fraction of [0.49, 0.5, 0.6]) {
			it(`${species}: FFA multihit Surf only triggers on its own HP crossing (${fraction})`, () => {
				battle = common.createBattle({formatid: 'gen9freeforall4pmistyfieldadrienn'}, [
					[{species: 'Hydreigon', level, ability: 'Worldbreaker', moves: ['surf']}],
					[{species, ability, moves: ['splash']}],
					[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
					[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
				]);
				battle.makeChoices('team 1', 'team 1', 'team 1', 'team 1');
				battle.field.terrain = '';
				battle.randomizer = n => n;
				battle.randomChance = (n, d) => n >= d;
				const [source, holder] = battle.getAllActive();
				holder.hp = Math.floor(holder.maxhp * fraction);
				const move = Object.assign(battle.dex.getActiveMove('surf'), {accuracy: true, willCrit: false});
				battle.actions.useMove(move, source, {target: holder});
				assert(holder.hp > 0 && holder.hp <= holder.maxhp / 2);
				const expected = fraction > 0.5 ? 1 : 0;
				assert.equal(holder.boosts.atk, expected);
				assert.equal(holder.boosts.spa, expected);
				if (species === 'Klawf') {
					assert.equal(holder.boosts.spe, expected);
					assert.equal(holder.boosts.def, expected ? -1 : 0);
					assert.equal(holder.boosts.spd, expected ? -1 : 0);
				}
			});
		}
	}

	for (const [species, ability] of [['Drampa', 'Berserk'], ['Klawf', 'Anger Shell']]) {
		it(`${ability}: does not reuse a previous move's HP crossing`, () => {
			battle = common.createBattle({}, [[{species, ability, moves: ['splash']}],
				[{species: 'Mew', ability: 'No Ability', moves: ['tackle']}]]);
			const [holder, source] = battle.getAllActive();
			holder.maxhp = holder.baseMaxhp = 1000;
			holder.hp = 600;
			for (let hit = 0; hit < 2; hit++) {
				const move = Object.assign(battle.dex.getActiveMove('tackle'), {damage: 150, accuracy: true});
				battle.actions.runMove(move, source, source.getLocOf(holder));
				assert.equal(holder.boosts.atk, 1);
				assert.equal(holder.boosts.spa, 1);
			}
		});
		for (const [hp, hits, item, expectedHP, expectedBoost] of [
			[600, 1, 'Sitrus Berry', 750, 1],
			[600, 2, '', 400, 1],
			[600, 2, 'Sitrus Berry', 650, 0],
			[400, 2, 'Sitrus Berry', 450, 1],
		]) {
			it(`${ability}: preserves ${hits}-hit and berry timing from ${hp} HP (${item})`, () => {
				battle = common.createBattle({}, [[{species, ability, item, moves: ['splash']}],
					[{species: 'Mew', ability: 'No Ability', moves: ['tackle']}]]);
				const [holder, source] = battle.getAllActive();
				holder.maxhp = holder.baseMaxhp = 1000;
				holder.hp = hp;
				const move = Object.assign(battle.dex.getActiveMove('tackle'), {
					damage: 100, accuracy: true, willCrit: false, multihit: hits === 1 ? undefined : hits,
				});
				battle.actions.runMove(move, source, source.getLocOf(holder));
				battle.eachEvent('Update');
				assert.equal(holder.hp, expectedHP);
				assert.equal(holder.boosts.atk, expectedBoost);
				assert.equal(holder.boosts.spa, expectedBoost);
			});
		}
	}
});
