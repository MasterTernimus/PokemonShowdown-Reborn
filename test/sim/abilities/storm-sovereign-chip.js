'use strict'; const assert = require('assert').strict, { Dex } = require('../../../dist/sim'); const { buildCalculatorBattle, validateScenario, calculatorFormats } = require('../../../dist/sim/custom-calculator');
describe('Storm Sovereign piercing attacks', () => {
	let b;
	afterEach(() => {
		b?.destroy();
		b = null;
	});
	function setup(ability = 'Storm Sovereign', format = 'gen9nofieldsinglesgame') {
		const c = buildCalculatorBattle(validateScenario({ format, field: '', move: 'splash', actors: [{ species: 'Mew', ability }, { species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }] }), 0);
		b = c.battle;
		for (const m of c.mons)m.hp = m.maxhp = m.baseMaxhp = 1600;
		return c.mons;
	}
	for (const ability of ['Sand Sovereign', 'Frost Sovereign', 'Rain Sovereign'])it(ability + ' has no residual chip', () => {
		const [p, q] = setup(ability);
		b.singleEvent('Residual', p.getAbility(), p.abilityState, p);
		assert.equal(q.hp, 1600);
		assert.equal(p.hp, 1600);
	});
	for (const type of ['Rock', 'Electric', 'Steel', 'Grass', 'Bug', 'Fighting'])it('singles ' + type + ' has no residual chip', () => {
		const [p, q] = setup();
		q.setType(type);
		b.singleEvent('Residual', p.getAbility(), p.abilityState, p);
		assert.equal(q.hp, 1600);
	});
	it('exempts Flying and Magic Guard foes', () => {
		const [p, q] = setup();
		q.setType('Flying');
		b.singleEvent('Residual', p.getAbility(), p.abilityState, p);
		assert.equal(q.hp, 1600);
		q.setType('Normal');
		q.setAbility('Magic Guard');
		b.singleEvent('Residual', p.getAbility(), p.abilityState, p);
		assert.equal(q.hp, 1600);
	});
	it('does not chip any FFA targets', () => {
		const format = calculatorFormats().find(f => f.gameType === 'freeforall').id, [p, a, c, d] = setup('Storm Sovereign', format);
		a.setType('Fighting');
		c.setType('Steel');
		d.setType('Flying');
		b.singleEvent('Residual', p.getAbility(), p.abilityState, p);
		assert.equal(a.hp, 1600);
		assert.equal(c.hp, 1600);
		assert.equal(d.hp, 1600);
		assert.equal(p.hp, 1600);
	});
	it('has no chip with or without weather and suppression', () => {
		const [p, q] = setup();
		b.field.clearWeather();
		b.singleEvent('Residual', p.getAbility(), p.abilityState, p);
		assert.equal(q.hp, 1600);
		q.sethp(1600);
		p.addVolatile('gastroacid');
		b.fieldEvent('Residual');
		assert.equal(q.hp, 1600);
	});
	for (const id of ['airslash', 'wingattack']) it(id + ' bypasses Substitute and triggers Updraft', () => {
		const [p, q] = setup();
		q.addVolatile('substitute');
		const hp = q.hp, sub = q.volatiles.substitute.hp;
		b.actions.useMove(Object.assign(Dex.getActiveMove(id), { accuracy: true, willCrit: false, damage: 100 }), p, { target: q });
		b.clearActiveMove();
		assert.equal(q.hp, hp - 100);
		assert.equal(q.volatiles.substitute.hp, sub);
		assert(p.m.updraftUsed);
	});
	for (const block of ['protect', 'suppression', 'non-Flying']) it('respects ' + block, () => {
		const [p, q] = setup();
		q.addVolatile(block === 'protect' ? 'protect' : 'substitute');
		if (block === 'suppression') p.addVolatile('gastroacid');
		const hp = q.hp;
		b.actions.useMove(Object.assign(Dex.getActiveMove(block === 'non-Flying' ? 'tackle' : 'airslash'),
			{ accuracy: true, willCrit: false, damage: 100 }), p, { target: q });
		b.clearActiveMove();
		assert.equal(q.hp, hp);
		assert(!p.m.updraftUsed);
	});
	for (const [id, screen] of [['wingattack', 'reflect'], ['airslash', 'lightscreen']]) {
		it('preserves ' + screen + ' damage reduction through Substitute', () => {
			function damage(withScreen) {
				const [p, q] = setup();
				q.addVolatile('substitute');
				if (withScreen) q.side.addSideCondition(screen, q);
				const hp = q.hp;
				b.actions.useMove(Object.assign(Dex.getActiveMove(id), { accuracy: true, willCrit: false }), p, { target: q });
				const loss = hp - q.hp;
				b.destroy();
				b = null;
				return loss;
			}
			const normal = damage(false), reduced = damage(true);
			assert(normal > 0 && reduced > 0 && reduced < normal);
		});
	}
	it('does not grant status or screen bypass', () => {
		const [p, q] = setup();
		for (const id of ['featherdance', 'airslash']) {
			const move = Dex.getActiveMove(id);
			b.runEvent('ModifyMove', p, q, move, move);
			assert.equal(!!move.flags.bypasssub, id === 'airslash');
			assert(!move.infiltrates);
		}
	});
	it('preserves Updraft and the native No Guard passive description', () => {
		const a = Dex.abilities.get('stormsovereign');
		assert(a.onAfterEachBoost);
		assert(a.onSourceDamagingHit);
		assert(!a.onTryBoost);
		assert.match(a.desc, /bypass Substitute/);
		assert.match(a.desc, /Updraft/);
		assert.deepEqual(Dex.species.get('Pidgeot-Mega').passives, ['noguard']);
	});
});
