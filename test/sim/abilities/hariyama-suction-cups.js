'use strict'; const assert = require('assert').strict, common = require('../../common'), { Dex } = require('../../../dist/sim');
describe('Hariyama Thick Fat passive and balanced choices', () => {
	let b;
	afterEach(() => {
		b?.destroy();
		b = null;
	});
	function setup(ability = 'Grit Grappler') {
		b = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species: 'Hariyama', ability, moves: ['splash', 'forcepalm'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['flamethrower', 'icebeam', 'roar'] }]]);
		b.makeChoices('team 1', 'team 1');
		return [b.p1.active[0], b.p2.active[0]];
	}
	for (const ability of ['Grit Grappler', 'Sheer Force', 'Stamina'])it(ability + ' coexists with exactly Thick Fat', () => {
		const [p] = setup(ability);
		assert.equal(p.ability, Dex.toID(ability));
		assert.deepEqual(p.getPassives(), ['thickfat']);
		for (const id of ['palmmastery', 'suctioncups'])assert(!p.hasAbilityOrPassive(id));
	});
	for (const move of ['flamethrower', 'icebeam'])it(move + ' is halved once, including suppression and copied Thick Fat', () => {
		const [p, q] = setup();
		const m = Dex.getActiveMove(move);
		assert.equal(b.runEvent('ModifySpA', q, p, m, 100), 50);
		p.addVolatile('gastroacid');
		assert.equal(b.runEvent('ModifySpA', q, p, m, 100), 50);
		p.removeVolatile('gastroacid');
		p.setAbility('thickfat');
		assert.equal(b.runEvent('ModifySpA', q, p, m, 100), 50);
	});
	it('suppresses selected Grit Grappler, not passive hail immunity', () => {
		const [p, q] = setup();
		p.setStatus('brn');
		let m = Dex.getActiveMove('tackle');
		assert.equal(b.runEvent('ModifyAtk', p, q, m, 100), 150);
		p.addVolatile('gastroacid');
		assert.equal(b.runEvent('ModifyAtk', p, q, m, 100), 100);
		assert.equal(p.runStatusImmunity('hail'), false);
	});
	it('Force Palm has ordinary 30% secondary under Grit Grappler and no Palm Mastery primary status', () => {
		const [p, q] = setup();
		let m = Dex.getActiveMove('forcepalm');
		m = b.runEvent('ModifyMove', p, q, m, m);
		assert(!m.status);
		assert.deepEqual(m.secondaries, [{ chance: 30, status: 'par' }]);
	});
	it('does not grant unselected Stamina healing or forced-switch protection', () => {
		const [p, q] = setup();
		p.sethp(p.maxhp - 80);
		const hp = p.hp;
		b.runEvent('DamagingHit', p, q, Dex.getActiveMove('tackle'), 20);
		assert.equal(p.hp, hp);
		assert.equal(p.boosts.def, 0);
		assert.notEqual(b.runEvent('DragOut', p, q, Dex.getActiveMove('roar')), false);
	});
	it('keeps shared former abilities available for other holders', () => { assert.deepEqual(Dex.species.get('hariyama').abilities, { 0: 'Grit Grappler', 1: 'Sheer Force', H: 'Stamina' }); for (const id of ['palmmastery', 'suctioncups', 'stamina', 'gritgrappler'])assert(Dex.abilities.get(id).exists); });
});
