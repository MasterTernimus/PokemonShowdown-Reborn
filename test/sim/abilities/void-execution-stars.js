'use strict';
const assert = require('node:assert/strict');
const common = require('../../common');

describe('Void Mega Gardevoir and New World', () => {
	let battle;
	afterEach(() => battle?.destroy());
	const spare = { species: 'Mew', ability: 'No Ability', moves: ['splash'] };
	it('grounds an ordinary Duskilate user without applying New World’s Speed penalty', () => {
		battle = common.createBattle({ formatid: 'gen9newworld' }, [
			[{ ...spare, ability: 'Duskilate' }], [spare],
		]);
		battle.makeChoices('team 1', 'team 1');
		const [user, foe] = battle.getAllActive();
		if (!battle.field.isTerrain('newworldterrain')) battle.field.setTerrain('newworldterrain', user);
		assert(user.isGrounded());
		assert.equal(battle.runEvent('ModifySpe', user, null, null, 100), 100);
		assert.equal(battle.runEvent('ModifySpe', foe, null, null, 100), 75);
		user.addVolatile('gastroacid', foe);
		assert.equal(battle.runEvent('ModifySpe', user, null, null, 100), 75);
	});
	it('Execution grants Void Veil and repeatable Misaligned Stars together', () => {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[{ species: 'Gardevoir-Void-Mega', ability: 'Execution', moves: ['splash'] }, spare], [spare, spare],
		]);
		battle.makeChoices('team 12', 'team 12');
		const [holder, ally] = battle.p1.active, foe = battle.p2.active[0];
		for (const id of ['misalignedstars', 'anticipation', 'voidveil', 'levitate', 'telepathy']) assert(holder.hasAbility(id), id);
		for (const id of ['insomnia', 'magicguard']) assert(!holder.hasAbility(id), id);
		battle.field.addPseudoWeather('gravity', foe);
		assert(!holder.isGrounded());
		assert(holder.canBenefitFromTerrain());
		const hit = source => {
			const before = holder.hp;
			const move = Object.assign(battle.dex.getActiveMove('watergun'), { damage: 10, accuracy: true });
			battle.actions.runMove(move, source, source.getLocOf(holder), { externalMove: true });
			return holder.hp - before;
		};
		holder.hp = 40;
		assert.equal(hit(ally), 0);
		assert.equal(hit(foe), -10);
		assert.equal(hit(foe), Math.floor(holder.baseMaxhp / 3));
		assert.equal(hit(foe), -10);
		assert.equal(hit(foe), Math.floor(holder.baseMaxhp / 3));
	});
});
