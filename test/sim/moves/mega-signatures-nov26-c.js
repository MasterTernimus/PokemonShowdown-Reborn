'use strict';
const assert = require('node:assert/strict');
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const { MegaSignaturesNov26C } = require('../../../dist/data/mega-signatures-nov26-c');

describe('Mega signature battle effects from Parasect through Zygarde', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function start(form, extra = {}) {
		const mega = Dex.species.get(form);
		const spec = MegaSignaturesNov26C[form];
		const species = [].concat(mega.battleOnly || mega.baseSpecies)[0];
		const foe = { species: 'Mew', ability: 'No Ability', moves: ['splash', 'protect', 'tackle'] };
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species, ability: 'No Ability', moves: [spec?.base || 'poisonfang', 'flamethrower'], ...extra }, foe], [foe, foe],
		]);
		battle.makeChoices('team 12', 'team 12');
		const user = battle.p1.active[0], target = battle.p2.active[0];
		user.formeChange(mega, Dex.items.get(mega.requiredItem || 'absolite'), true);
		user.setAbility('No Ability', null, null, true);
		user.getPassives = target.getPassives = () => [];
		battle.field.clearWeather();
		battle.field.clearTerrain();
		battle.randomizer = n => n;
		battle.randomChance = (n, d) => n >= d;
		for (const mon of [user, target]) mon.hp = mon.baseMaxhp = mon.maxhp = 2000;
		return { user, target };
	}
	function hit(user, target, id) {
		battle.actions.useMove(id, user, { target });
		battle.clearActiveMove();
		return user.lastMoveUsed;
	}
	for (const [form, s] of Object.entries(MegaSignaturesNov26C)) {
		it(form + ' converts its learned slot to ' + s.name + ' and preserves the original move ID and PP', () => {
			const { user, target } = start(form);
			const move = hit(user, target, s.base);
			assert.equal(move.name, s.name);
			assert.equal(move.id, s.base);
			assert.equal(move.flags.megasignature, 1);
			assert.equal(Dex.moves.get(s.name).pp, Dex.moves.get(s.base).pp);
		});
	}
	for (const [form, setup, drain] of [
		['parasectmega', foe => { foe.status = 'par'; }, [2, 3]],
		['roserademega', foe => foe.addVolatile('leechseed', battle.p1.active[0]), [3, 4]],
		['scraftymega', foe => { foe.boosts.atk = -1; }, [2, 3]],
	]) {
		it(form + ' increases draining only against a qualifying target', () => {
			const { user, target } = start(form);
			const id = MegaSignaturesNov26C[form].base;
			target.boosts.atk = 0;
			assert.deepEqual(hit(user, target, id).drain, [1, 2]);
			setup(target);
			assert.deepEqual(hit(user, target, id).drain, drain);
		});
	}
	it('Horn Shears cuts Reflect after passing protection', () => {
		const { user, target } = start('pinsirmega');
		target.side.addSideCondition('reflect', target);
		target.addVolatile('protect', target);
		hit(user, target, 'xscissor');
		assert(target.side.sideConditions.reflect);
		target.removeVolatile('protect');
		hit(user, target, 'xscissor');
		assert(!target.side.sideConditions.reflect);
	});
	it('Skyfall Dive keeps the Sp. Def drop alone on KO', () => {
		const { user, target } = start('rayquazamega');
		hit(user, target, 'dragonascent');
		assert.deepEqual([user.boosts.def, user.boosts.spd], [-1, -1]);
		target.hp = 1;
		hit(user, target, 'dragonascent');
		assert.deepEqual([user.boosts.def, user.boosts.spd], [-1, -2]);
	});
	it('Venom Flash doubles on poison and primes only one Fire attack per turn', () => {
		const { user, target } = start('salazzlemega');
		const before = target.hp;
		hit(user, target, 'flamethrower');
		const plain = before - target.hp;
		target.status = 'psn';
		hit(user, target, 'venoshock');
		assert(user.volatiles.venomflash);
		const hp = target.hp;
		hit(user, target, 'flamethrower');
		const boosted = hp - target.hp;
		assert(boosted > plain && Math.abs(boosted / plain - 1.15) < 0.04);
		assert(!user.volatiles.venomflash);
		hit(user, target, 'venoshock');
		assert(!user.volatiles.venomflash);
	});
	it('Pride Roar drops both damaged foes once in sun', () => {
		const filler = { species: 'Mew', ability: 'No Ability', moves: ['splash'] };
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[{ species: 'Pyroar', moves: ['hypervoice'] }, filler], [filler, filler],
		]);
		battle.makeChoices('team 12', 'team 12');
		const user = battle.p1.active[0], [a, b] = battle.p2.active;
		a.hp = a.maxhp = b.hp = b.maxhp = 2000;
		user.formeChange('Pyroar-Mega', Dex.items.get('pyroarite'), true);
		battle.field.setWeather('sunnyday', user);
		hit(user, a, 'hypervoice');
		hit(user, a, 'hypervoice');
		assert.deepEqual([a.boosts.spa, b.boosts.spa], [-1, -1]);
	});
	it('Sunwheel spends one grassy charge skip; subsequent uses still charge', () => {
		const { user, target } = start('sunfloramega');
		battle.field.setTerrain('grassyterrain', user);
		const hp = target.hp;
		hit(user, target, 'solarbeam');
		assert(target.hp < hp);
		const next = target.hp;
		hit(user, target, 'solarbeam');
		assert.equal(target.hp, next);
		assert(user.volatiles.twoturnmove);
		hit(user, target, 'solarbeam');
		assert(target.hp < next);
	});
	it('Overvolt Fist preserves native aura creation and clears Speed drops only with a preexisting aura', () => {
		const { user, target } = start('zeraoramega');
		battle.field.clearAura();
		user.boosts.spe = -2;
		hit(user, target, 'plasmafists');
		assert(battle.field.isAura('electricterrain'));
		assert.equal(user.boosts.spe, -2);
		hit(user, target, 'plasmafists');
		assert.equal(user.boosts.spe, 0);
		user.boosts.spe = -1;
		hit(user, target, 'plasmafists');
		assert.equal(user.boosts.spe, -1);
	});
	it('Fault Arrows lowers Speed only on the grounding hit', () => {
		const { user, target } = start('zygardemega');
		target.setType('Flying');
		assert(!target.isGrounded());
		hit(user, target, 'thousandarrows');
		assert(target.isGrounded());
		assert.equal(target.boosts.spe, -1);
		hit(user, target, 'thousandarrows');
		assert.equal(target.boosts.spe, -1);
	});
	it('Drake Fang is 100 power, retains its Dragon bite and changes category with offensive stages', () => {
		const { user, target } = start('sevipermega');
		user.storedStats.atk = 200;
		user.storedStats.spa = 180;
		const physical = hit(user, target, 'drakefang');
		assert.equal(physical.category, 'Physical');
		assert.equal(physical.basePower, 100);
		assert.equal(physical.type, 'Dragon');
		assert(physical.flags.contact && physical.flags.bite);
		user.boosts.spa = 1;
		assert.equal(hit(user, target, 'drakefang').category, 'Special');
		assert.equal(Dex.moves.get('poisonfang').basePower, 85);
	});
});
