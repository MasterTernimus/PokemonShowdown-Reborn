'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

describe('Serene Grace and Togekiss support', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(ability = 'Fortunate Wing', partner = 'No Ability', gameType = 'doubles') {
		const mon = ability => ({species: 'Mew', ability, moves: ['skullbash', 'airslash', 'confuseray', 'splash']});
		const teams = [[mon(ability), mon(partner)], [mon('No Ability'), mon('No Ability')]];
		if (gameType === 'freeforall') teams.push([mon('No Ability')], [mon('No Ability')]);
		battle = common.createBattle({gameType}, teams);
		for (const side of battle.sides) for (const p of side.pokemon) p.getPassives = () => [];
		return [battle.p1.active[0], battle.p1.active[1], battle.p2.active[0]];
	}
	function chance(source, target, chance = 30) {
		const move = Dex.getActiveMove('airslash');
		move.secondaries = [{chance, volatileStatus: 'flinch'}];
		battle.runEvent('ModifyMove', source, target, move, move);
		return move.secondaries[0].chance;
	}
	it('doubles secondaries up to 100% without the old 60% cap', () => {
		const [p, , q] = setup('Serene Grace');
		for (const [base, result] of [[10, 20], [30, 60], [40, 80], [60, 100], [100, 100]]) {
			assert.equal(chance(p, q, base), result);
		}
	});
	for (const ability of ['Serene Grace', 'Punch Fiend', 'Encore Aria']) {
		it(ability + ' preserves the charging turn', () => {
			const [p, , q] = setup(ability);
			battle.actions.runMove('skullbash', p, p.getLocOf(q));
			assert(p.volatiles.twoturnmove);
		});
	}
	it('passive Serene Grace preserves the charging turn', () => {
		const [p, , q] = setup('No Ability'); p.getPassives = () => ['serenegrace'];
		battle.actions.runMove('skullbash', p, p.getLocOf(q));
		assert(p.volatiles.twoturnmove);
	});
	it('Fortunate Wing shares only with allies, without giving itself Serene Grace', () => {
		const [p, ally, q] = setup();
		assert.equal(chance(p, q), 30); assert.equal(chance(ally, q), 60); assert.equal(chance(q, p), 30);
	});
	it('Void Omen keeps its own Serene Grace without sharing it', () => {
		const [p, ally, q] = setup('Void Omen');
		assert.equal(chance(p, q), 60);
		assert.equal(chance(ally, q), 30);
		assert.equal(chance(q, p), 30);
		const move = Dex.getActiveMove('airslash');
		battle.runEvent('ModifyMove', ally, q, move, move);
		assert(!(move.sereneGraceProviders || []).includes('voidomen'));
		p.addVolatile('gastroacid');
		assert.equal(chance(p, q), 30);
	});
	it('Fortunate Wing boosts the ally while Void Omen remains self-only', () => {
		const [p, ally, q] = setup('Fortunate Wing', 'Void Omen');
		assert.equal(chance(p, q), 30);
		assert.equal(chance(ally, q), 60);
	});
	for (const partner of ['Serene Grace', 'Fortunate Wing', 'Void Omen', 'Lunar Orbit']) {
		it('does not stack Fortunate Wing with ' + partner, () => {
			const [, ally, q] = setup('Fortunate Wing', partner);
			assert.equal(chance(ally, q, 20), 40);
		});
	}
	it('Fortunate Wing does not skip an ally charging turn', () => {
		const [, ally, q] = setup(); battle.actions.runMove('skullbash', ally, ally.getLocOf(q));
		assert(ally.volatiles.twoturnmove);
	});
	it('Fortunate Wing stops sharing while suppressed or inactive', () => {
		const [p, ally, q] = setup(); p.addVolatile('gastroacid'); assert.equal(chance(ally, q), 30);
		p.removeVolatile('gastroacid'); assert.equal(chance(ally, q), 60);
		p.hp = 0; assert.equal(chance(ally, q), 30);
	});
	it('Fortunate Wing does not help FFA opponents', () => {
		const [p, , q] = setup('Fortunate Wing', 'No Ability', 'freeforall'); assert.equal(chance(q, p), 30);
	});
	it('Void Omen prevents holder and ally confusion, including self-inflicted confusion', () => {
		const [p, ally, q] = setup('Void Omen');
		assert.equal(p.addVolatile('confusion', q), null);
		assert.equal(ally.addVolatile('confusion', q), null);
		assert.equal(ally.addVolatile('confusion', ally), null);
		assert(q.addVolatile('confusion', p));
	});
	it('Void Omen confusion protection stops under suppression', () => {
		const [p, ally, q] = setup('Void Omen'); p.addVolatile('gastroacid');
		assert(p.addVolatile('confusion', q)); assert(ally.addVolatile('confusion', q));
	});
	it('Void Omen does not protect FFA opponents', () => {
		const [p, , q] = setup('Void Omen', 'No Ability', 'freeforall');
		assert(q.addVolatile('confusion', p)); assert.equal(p.addVolatile('confusion', q), null);
	});
	it('Void Omen protects its holder in singles', () => {
		const [p, , q] = setup('Void Omen', 'No Ability', 'singles');
		assert.equal(p.addVolatile('confusion', q), null);
	});
	it('Fortunate Wing retains its critical-hit safeguard and confusion cure', () => {
		const [p, ally, q] = setup(); ally.addVolatile('confusion', q);
		const move = Dex.getActiveMove('airslash'); move.willCrit = true; move.accuracy = true;
		battle.actions.useMove(move, p, {target:q});
		assert(battle.p1.sideConditions.safeguard); assert(!ally.volatiles.confusion);
	});
	it('Void Omen keeps its independent one-use charge skip', () => {
		const [p, ally, q] = setup('Void Omen');
		battle.actions.runMove('skullbash', ally, ally.getLocOf(q));
		assert(!ally.volatiles.twoturnmove); assert(ally.volatiles.voidomenchargespent);
		battle.actions.runMove('skullbash', ally, ally.getLocOf(q)); assert(ally.volatiles.twoturnmove);
	});
});
