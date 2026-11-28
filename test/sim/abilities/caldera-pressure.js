'use strict';
const assert = require('node:assert/strict');
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

describe('Caldera Core pressure and Dune Echo', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup() {
		const ally = { species: 'Mew', ability: 'No Ability', moves: ['splash'] };
		battle = common.createBattle({ gameType: 'doubles' }, [
			[{ species: 'Camerupt', item: 'Cameruptite', moves: ['lavaplume', 'earthpower', 'protect'] }, ally],
			[ally, ally],
		]);
		const holder = battle.p1.active[0];
		assert(battle.actions.runMegaEvo(holder));
		assert.equal(holder.getAbility().id, 'calderacore');
		assert.equal(battle.field.weather, 'sunnyday');
		for (const p of [...battle.p1.active, ...battle.p2.active]) p.maxhp = p.baseMaxhp = p.hp = 16000;
		holder.hp = 5000;
		return [holder, ...battle.p2.active];
	}
	function hit(user, target, id, changes = {}) {
		const move = Object.assign(Dex.getActiveMove(id), { accuracy: true, willCrit: false }, changes);
		battle.actions.useMove(move, user, { target });
		battle.clearActiveMove();
		return user.lastMoveUsed;
	}
	it('charges once per opposing attack, caps recovery and releases on Crater Burst', () => {
		const [p, foe, other] = setup();
		hit(foe, p, 'doubleslap', { damage: 20, multihit: 3 });
		assert(p.volatiles.calderacharge);
		assert.equal(p.hp, 5940);
		hit(other, p, 'swift', { damage: 20 });
		assert(p.volatiles.calderaready);
		assert.equal(p.hp, 6920);
		hit(other, p, 'swift', { damage: 20 });
		assert.equal(p.hp, 6900);
		const move = hit(p, foe, 'lavaplume');
		assert.equal(move.name, 'Crater Burst');
		assert.equal(move.calderaRelease, p);
		assert.equal(battle.runEvent('BasePower', p, foe, move, 1000),
			Math.round(1.35 * battle.runEvent('BasePower', p, foe, { ...move, calderaRelease: undefined }, 1000)));
		assert.equal(p.hp, 8900);
		assert(!p.volatiles.calderaready);
	});
	it('requires direct enemy HP damage and spends a charge on a fully blocked counter', () => {
		const [p, foe] = setup();
		hit(battle.p1.active[1], p, 'tackle', { damage: 20 });
		assert(!p.volatiles.calderacharge);
		p.addVolatile('substitute', p);
		p.volatiles.substitute.hp = 500;
		hit(foe, p, 'tackle', { damage: 20 });
		assert(!p.volatiles.calderacharge);
		p.removeVolatile('substitute');
		hit(foe, p, 'tackle', { damage: 20 });
		hit(foe, p, 'tackle', { damage: 20 });
		const before = p.hp;
		foe.addVolatile('protect');
		hit(p, foe, 'earthpower');
		assert.equal(p.hp, before);
		assert(!p.volatiles.calderaready);
		hit(foe, p, 'tackle', { damage: 20 });
		p.setAbility('No Ability');
		assert(!p.volatiles.calderacharge);
	});
	it('gives Mega Flygon-Z 115-power Dune Echo and preserves the base and other Mega moves', () => {
		const move = Dex.moves.get('duneecho');
		assert.equal(move.basePower, 115);
		assert.equal(move.type, 'Ground');
		assert.equal(move.target, 'normal');
		assert(move.flags.sound);
		assert.equal(Dex.moves.get('boomburst').basePower, 140);
		assert.equal(Dex.moves.get('wingecho').basePower, 75);
	});
});
