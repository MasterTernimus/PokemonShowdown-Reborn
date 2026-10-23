'use strict';
const assert = require('assert').strict;
const common = require('../../common');
describe('Living Legend approved components', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup() {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Arcanine', ability: 'Living Legend', moves: ['splash', 'flamethrower', 'extremespeed'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash', 'flamethrower'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	it('retains Flash Fire and Download identities but no Sheer Force identity', () => {
		const [p] = setup();
		assert(p.hasAbility('flashfire')); assert(p.hasAbility('download')); assert(!p.hasAbility('sheerforce'));
		assert.equal(p.boosts.atk + p.boosts.spa, 1);
	});
	it('retains secondary effects and ordinary move power, including marked moves', () => {
		const [p, q] = setup(), m = battle.dex.getActiveMove('flamethrower');
		const secondaries = JSON.stringify(m.secondaries);
		battle.runEvent('ModifyMove', p, q, m, m);
		assert.equal(JSON.stringify(m.secondaries), secondaries);
		assert(!m.hasSheerForce); assert(!m.hasSheerForceBoost);
		assert.equal(battle.runEvent('BasePower', p, q, m, 100), 100);
		m.hasSheerForce = true; m.hasSheerForceBoost = true;
		assert.equal(battle.runEvent('BasePower', p, q, m, 100), 100);
	});
	it('retains Extreme Speed power and critical-stage enhancement', () => {
		const [p, q] = setup(), m = battle.dex.getActiveMove('extremespeed');
		battle.runEvent('ModifyMove', p, q, m, m);
		assert.equal(m.critRatio, 3);
		assert.equal(battle.runEvent('BasePower', p, q, m, 100), 150);
	});
	it('absorbs Fire and applies the existing Flash Fire boost', () => {
		const [p, q] = setup(), hp = p.hp;
		battle.actions.useMove('flamethrower', q, { target: p });
		assert.equal(p.hp, hp); assert(p.volatiles.flashfire);
		const m = battle.dex.getActiveMove('flamethrower');
		assert.equal(battle.runEvent('ModifySpA', p, q, m, 100), 150);
	});
	it('uses concise requested text without advertising Vanguard Final Stand', () => {
		const dex = common.dex;
		assert.equal(dex.abilities.get('livinglegend').shortDesc, 'Flash Fire + Download; stronger Extreme Speed.');
		for (const key of ['desc', 'shortDesc']) assert(!/final stand|once.per.battle/i.test(dex.abilities.get('vanguard')[key]));
	});
});
