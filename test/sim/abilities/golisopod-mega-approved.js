'use strict'; const assert = require('assert').strict, common = require('../../common'), { Dex } = require('../../../dist/sim'); describe('Mega Golisopod passive and Heatproof plus Steadfast', () => {
	let b;
	afterEach(() => {
		b?.destroy();
		b = null;
	});
	function setup() {
		const m = { species: 'Mew', ability: 'No Ability', moves: ['tackle', 'flamethrower', 'growl', 'sandattack'] };
		b = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ ...m, species: 'Golisopod-Mega', ability: 'Aqua Shell' }], [m]]);
		b.makeChoices('team 1', 'team 1');
		return [b.p1.active[0], b.p2.active[0]];
	}it('Tough Claws contact boost once; active suppression leaves passive', () => {
		const [p, q] = setup();
		assert.deepEqual(p.getPassives(), ['toughclaws']);
		for (const suppressed of [false, true]) {
			if (suppressed)p.addVolatile('gastroacid');
			assert.equal(b.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 100), 130);
			assert.equal(b.runEvent('BasePower', p, q, Dex.getActiveMove('surf'), 100), 100);
		}
	});
	it('Heatproof halves Fire offensive stats and burn damage only', () => {
		const [p, q] = setup();
		for (const move of ['firepunch', 'flamethrower'])assert.equal(b.runEvent(move === 'firepunch' ? 'ModifyAtk' : 'ModifySpA', q, p, Dex.getActiveMove(move), 100), 50);
		assert.equal(b.runEvent('ModifySpA', q, p, Dex.getActiveMove('surf'), 100), 100);
		assert(p.setStatus('brn'));
		assert.equal(b.runEvent('Damage', p, q, Dex.conditions.get('brn'), 100), 50);
		p.addVolatile('gastroacid');
		assert.equal(b.runEvent('ModifySpA', q, p, Dex.getActiveMove('flamethrower'), 100), 100);
	});
	it('no Hyper Cutter, Inner Focus, Water Veil or Attack-drop protection', () => {
		const [p, q] = setup();
		assert(!p.volatiles.aquaring);
		for (const id of ['hypercutter', 'innerfocus', 'waterveil'])assert(!p.hasAbilityOrPassive(id));
		b.boost({ atk: -1 }, p, q, Dex.getActiveMove('growl'));
		assert.equal(p.boosts.atk, -1);
		assert(p.addVolatile('flinch', q));
	});
	it('real flinch consumes the action and grants Speed; Intimidate lowers Attack', () => {
		const [p, q] = setup();
		q.setAbility('Intimidate');
		assert.equal(p.boosts.atk, -1);
		const hp = q.hp;
		p.addVolatile('flinch', q);
		b.makeChoices('move tackle', 'move sandattack');
		assert.equal(q.hp, hp);
		assert.equal(p.boosts.spe, 1);
		assert(b.log.some(l => l.includes('|cant|p1a:') && l.includes('|flinch')));
	});
	it('Electric entry, Ashen Beach accuracy and Rocky flinch damage retain local behavior', () => {
		const [p, q] = setup();
		assert(p.hasAbilityOrPassive('steadfast'));
		b.field.setTerrain('electricterrain', p);
		p.boosts.spe = 0;
		b.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(p.boosts.spe, 1);
		b.field.setTerrain('ashenbeachterrain', p);
		assert.equal(b.runEvent('Accuracy', q, p, Dex.getActiveMove('tackle'), 1), true);
		q.setAbility('Unnerve');
		assert.equal(b.runEvent('Accuracy', q, p, Dex.getActiveMove('tackle'), 1), 1);
		b.field.setTerrain('rockyterrain', p);
		const hp = p.hp;
		b.runEvent('Flinch', p);
		assert.equal(p.hp, hp);
		p.addVolatile('gastroacid');
		b.runEvent('Flinch', p);
		assert(p.hp < hp);
	});
});
