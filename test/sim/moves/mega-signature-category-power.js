'use strict';
const assert = require('node:assert/strict');
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
let battle;

describe('Learned category and Technician for Mega signatures', () => {
	afterEach(() => battle?.destroy());
	function start(form, baseMove) {
		const mega = Dex.species.get(form);
		const species = [].concat(mega.battleOnly || mega.baseSpecies)[0];
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species, ability: 'No Ability', moves: [baseMove] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		const user = battle.p1.active[0], target = battle.p2.active[0];
		user.formeChange(mega, Dex.items.get(mega.requiredItem || 'absolite'), true);
		user.setAbility('No Ability', null, null, true);
		user.getPassives = target.getPassives = () => [];
		target.hp = target.maxhp = target.baseMaxhp = 50000;
		battle.randomizer = n => n;
		battle.randomChance = (n, d) => n >= d;
		function hit() {
			const hp = target.hp;
			battle.actions.useMove(baseMove, user, { target });
			battle.clearActiveMove();
			return hp - target.hp;
		}
		return { user, target, hit };
	}
	for (const [form, base, signature] of [
		['gengarmega', 'shadowball', 'Witching Hex'], ['gardevoirmega', 'hypervoice', 'Guard Song'],
	]) it(signature + ' preserves special-category power bonuses when physically adaptive', () => {
		const { user, hit } = start(form, base);
		user.storedStats.atk = 300;
		user.storedStats.spa = 100;
		const neutral = hit();
		assert.equal(user.lastMoveUsed.category, 'Physical');
		assert.equal(user.lastMoveUsed.signatureLearnedCategory, 'Special');
		user.setItem('wiseglasses');
		assert(hit() > neutral);
	});

	it('a special Fault Arrows qualifies for physical power bonuses, taking only the stronger category total', () => {
		const { user, target, hit } = start('zygardemega', 'thousandarrows');
		const normal = hit();
		assert.equal(user.lastMoveUsed.category, 'Special');
		user.setItem('muscleband');
		const physicalBonus = hit();
		assert(physicalBonus > normal);
		user.setAbility('Battery', null, null, true);
		const both = hit();
		user.takeItem();
		assert.equal(hit(), both);
		assert(both > physicalBonus);
		target.side.addSideCondition('reflect', target);
		assert.equal(hit(), both);
		target.side.addSideCondition('lightscreen', target);
		assert(hit() < both);
	});
	it('selects the stronger combined category even across power and final damage hooks', () => {
		const { user, target, hit } = start('zygardemega', 'thousandarrows');
		target.setType('Dragon');
		user.setItem('wiseglasses');
		const specialBonus = hit();
		user.setAbility('Burning Quake', null, null, true);
		const both = hit();
		user.takeItem();
		const physicalBonus = hit();
		assert(Math.abs(both - physicalBonus) <= 1, [specialBonus, both, physicalBonus].join('/'));
		assert(physicalBonus > specialBonus);
	});
	it('uses learned Water Pulse’s 60 power for Technician when upgraded to Siren Chime', () => {
		const { user, hit } = start('froslassaevianmega', 'waterpulse');
		const normal = hit();
		user.setAbility('Technician', null, null, true);
		const boosted = hit();
		assert(Math.abs(boosted / normal - 1.5) < 0.04);
	});
	it('preserves the Factory 80 threshold and excludes already doubled Venoshock', () => {
		const { user, target, hit } = start('salazzlemega', 'venoshock');
		battle.field.setTerrain('factoryterrain', user);
		const normal = hit();
		user.setAbility('Technician', null, null, true);
		assert(hit() > normal);
		target.status = 'psn';
		const poisoned = hit();
		user.setAbility('No Ability', null, null, true);
		assert.equal(hit(), poisoned);
	});
});
