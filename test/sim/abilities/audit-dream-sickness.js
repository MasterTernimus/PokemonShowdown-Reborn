'use strict';

const assert = require('assert').strict;
const common = require('../../common');

describe('Dream Sickness damage transfers', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });

	function start(allies) {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [allies, [
			{ species: 'Gardevoir', ability: 'Dream Sickness', nature: 'Modest', evs: { spa: 252 }, moves: ['splash'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash', 'steelbeam'] },
		]]);
		battle.makeChoices('team 12', 'team 12');
		return battle.p1.active;
	}

	it('transfers a lethal attack once when an ally copied Dream Sickness with Perfect Foresight', () => {
		const [protectedMon, recipient] = start([
			{ species: 'Gardevoir', ability: 'Dream Sickness', moves: ['splash'] },
			{ species: 'Alakazam', ability: 'Magic Guard', item: 'Alakazite', moves: ['splash'] },
		]);
		battle.makeChoices('move splash, move splash mega', 'move splash, move splash');
		assert.equal(recipient.m.perfectForesightAbility, 'dreamsickness');
		battle.p2.active[1].boosts.spa = 6;
		const hp = protectedMon.hp;
		battle.makeChoices('move splash, move splash', 'move splash, move steelbeam 1');
		assert.equal(protectedMon.hp, hp);
		assert(recipient.fainted);
		assert.equal(battle.log.filter(line => line.includes('|ability: Dream Sickness')).length, 1);
		assert.equal(battle.turn, 3);
	});

	it('does not loop between Royal Voice and a Ditto transformed into a Dream Sickness holder', () => {
		const [protectedMon, recipient] = start([
			{ species: 'Gardevoir', ability: 'Trace', item: 'Gardevoirite', moves: ['splash'] },
			{ species: 'Ditto', ability: 'Limber', moves: ['transform'] },
		]);
		battle.makeChoices('move splash mega, move transform 1', 'move splash, move splash');
		assert.equal(protectedMon.ability, 'royalvoice');
		assert.equal(recipient.ability, 'dreamsickness');
		assert(recipient.transformed);
		const hp = protectedMon.hp;
		assert.equal(battle.damage(1000, protectedMon, battle.p2.active[1], battle.dex.getActiveMove('tackle')), false);
		assert.equal(protectedMon.hp, hp);
		assert.equal(recipient.hp, 0);
		assert.equal(battle.log.filter(line => line.includes('|ability: Dream Sickness')).length, 1);
	});

	it('protects an ally on successive separate hits and keeps recipient survival effects', () => {
		const [holder, ally] = start([
			{ species: 'Gardevoir', ability: 'Dream Sickness', item: 'Focus Sash', moves: ['splash'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		]);
		const foe = battle.p2.active[1];
		const move = battle.dex.getActiveMove('tackle');
		ally.hp = 10;
		const hp = holder.hp;
		assert.equal(battle.damage(10, ally, foe, move), false);
		assert.equal(battle.damage(10, ally, foe, move), false);
		assert.equal(ally.hp, 10);
		assert.equal(holder.hp, hp - 20);
		holder.hp = holder.maxhp;
		assert.equal(battle.damage(1000, ally, foe, move), false);
		assert.equal(holder.hp, 1);
		assert.equal(ally.hp, 10);
		assert.equal(holder.item, '');
	});

	for (const preventedDamage of [false, 0]) {
		it(`keeps the original hit if the recipient prevents damage (${preventedDamage})`, () => {
			const [holder, ally] = start([
				{ species: 'Gardevoir', ability: 'Dream Sickness', moves: ['splash'] },
				{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
			]);
			battle.onEvent('Damage', battle.format, (damage, target) => {
				if (target === holder) return preventedDamage;
			});
			ally.hp = 10;
			assert.equal(battle.damage(10, ally, battle.p2.active[1], battle.dex.getActiveMove('tackle')), 10);
			assert.equal(ally.hp, 0);
			assert.equal(holder.hp, holder.maxhp);
		});
	}
});
