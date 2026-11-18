'use strict';
const assert = require('node:assert/strict');
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

describe('Johto tower guardians and Celebi', () => {
	let battle;
	afterEach(() => battle?.destroy());
	const mon = (species, ability, moves = ['splash']) => ({ species, ability, moves });
	function setup(species, ability, move, doubles = false) {
		const neutral = () => mon('Mew', 'No Ability');
		battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [
			[mon(species, ability, ['splash', move]), neutral(), neutral()], [neutral(), neutral(), neutral()],
		]);
		battle.makeChoices('team 123', 'team 123');
		for (const side of battle.sides) for (const p of side.pokemon) {
			p.hp = p.maxhp = p.baseMaxhp = 1600;
		}
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	function hit(id, p, q) {
		const move = Object.assign(Dex.getActiveMove(id), { accuracy: true, damage: 16, willCrit: false, secondaries: null });
		battle.actions.useMove(move, p, { target: q });
		battle.clearActiveMove();
	}
	for (const [species, ability, signature, stat] of [
		['Lugia', 'Silver Wing Canticle', 'aeroblast', 'spd'],
		['Ho-Oh', 'Rainbow Wing Canticle', 'sacredfire', 'def'],
	]) it(ability + ' strengthens only its signature and grants one boost per entry', () => {
		const [p, q] = setup(species, ability, signature);
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove(signature), 100), 120);
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 100), 100);
		q.addVolatile('protect');
		hit(signature, p, q);
		assert.equal(p.boosts[stat], 0);
		q.removeVolatile('protect');
		hit(signature, p, q);
		hit(signature, p, q);
		assert.equal(p.boosts[stat], 1);
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		hit(signature, p, q);
		assert.equal(p.boosts[stat], 1);
	});
	for (const [species, ability, signature] of [
		['Lugia', 'Tidal Bell Echo', 'waterpulse'], ['Ho-Oh', 'Clear Bell Echo', 'sacredfire'],
	]) it(ability + ' heals its group once per turn on opposing HP damage', () => {
		const [p, q] = setup(species, ability, signature, true);
		const ally = p.adjacentAllies()[0];
		p.hp = ally.hp = 800;
		hit('tackle', p, q);
		assert.equal(p.hp, 800);
		hit(signature, p, q);
		assert.equal(p.hp, 900);
		assert.equal(ally.hp, 900);
		hit('airslash', p, q);
		assert.equal(p.hp, 900);
		assert.equal(ally.hp, 900);
	});
	for (const [species, ability, screen] of [
		['Lugia', 'Whirl Islands Oath', 'lightscreen'], ['Ho-Oh', 'Burned Tower Oath', 'reflect'],
	]) it(ability + ' leaves existing screens alone and creates exactly one three-turn screen', () => {
		const [p, q] = setup(species, ability, 'tackle');
		p.hp = 780;
		p.side.addSideCondition(screen, p, Dex.moves.get(screen));
		const duration = p.side.sideConditions[screen].duration;
		hit('tackle', q, p);
		assert.equal(p.side.sideConditions[screen].duration, duration);
		p.side.removeSideCondition(screen);
		hit('tackle', q, p);
		assert.equal(p.side.sideConditions[screen].duration, 3);
		p.side.removeSideCondition(screen);
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		p.hp = 600;
		hit('tackle', q, p);
		assert(!p.side.sideConditions[screen]);
	});
	it('Ilex Shrine cures an ally before the user and honors the once-per-turn limit', () => {
		const [p, q] = setup('Celebi', 'Ilex Shrine', 'magicalleaf', true);
		const ally = p.adjacentAllies()[0];
		ally.setStatus('brn'); p.setStatus('psn');
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('magicalleaf'), 100), 120);
		hit('magicalleaf', p, q);
		assert.equal(ally.status, '');
		assert.equal(p.status, 'psn');
		hit('magicalleaf', p, q);
		assert.equal(p.status, 'psn');
		battle.turn++;
		hit('magicalleaf', p, q);
		assert.equal(p.status, '');
	});
	it('Voice of Tomorrow keeps the increased Future Sight power when Celebi switches out', () => {
		const [p, q] = setup('Celebi', 'Voice of Tomorrow', 'futuresight');
		const impactPowers = [];
		battle.onEvent('BasePower', battle.format, (power, source, target, move) => {
			if (move.id === 'futuresight') impactPowers.push(power);
		});
		battle.makeChoices('move futuresight', 'move splash');
		assert.equal(q.side.slotConditions[q.position].futuremove.moveData.basePower, 150);
		// Attempting Future Sight again on the same occupied slot cannot strengthen the queued hit.
		battle.actions.useMove('futuresight', p, { target: q });
		battle.clearActiveMove();
		assert.equal(q.side.slotConditions[q.position].futuremove.moveData.basePower, 150);
		const hp = q.hp;
		battle.makeChoices('switch 2', 'move splash');
		for (let i = 0; i < 2 && q.side.slotConditions[q.position].futuremove; i++) battle.makeChoices('move splash', 'move splash');
		assert(q.hp < hp);
		assert.deepEqual(impactPowers, [150]);
		assert(!p.isActive);
	});
	it('Time Slip restores HP and only negative stat stages, once per battle', () => {
		const [p, q] = setup('Celebi', 'Time Slip', 'tackle');
		p.hp = 800;
		p.boosts.atk = -2; p.boosts.spa = 2;
		hit('tackle', q, p);
		assert.equal(p.hp, 1184);
		assert.equal(p.boosts.atk, 0);
		assert.equal(p.boosts.spa, 2);
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		p.hp = 800;
		hit('tackle', q, p);
		assert.equal(p.hp, 784);
	});
});
