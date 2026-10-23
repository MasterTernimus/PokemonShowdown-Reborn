'use strict'; const assert = require('assert').strict, { Dex } = require('../../../dist/sim'); const { buildCalculatorBattle, validateScenario, calculatorFormats } = require('../../../dist/sim/custom-calculator');
describe('Storm Sovereign shared typed chip', () => {
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
	for (const ability of ['Storm Sovereign', 'Sand Sovereign', 'Frost Sovereign', 'Rain Sovereign'])it(ability + ' uses the same neutral 1/16 residual convention', () => {
		const [p, q] = setup(ability);
		b.singleEvent('Residual', p.getAbility(), p.abilityState, p);
		assert.equal(q.hp, 1500);
		assert.equal(p.hp, 1600);
	});
	for (const type of ['Rock', 'Electric', 'Steel', 'Grass', 'Bug', 'Fighting'])it('singles ' + type + ' does not scale chip with resistance or weakness', () => {
		const [p, q] = setup();
		q.setType(type);
		b.singleEvent('Residual', p.getAbility(), p.abilityState, p);
		assert.equal(q.hp, 1500);
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
	it('scales all opposing FFA targets but not its holder', () => {
		const format = calculatorFormats().find(f => f.gameType === 'freeforall').id, [p, a, c, d] = setup('Storm Sovereign', format);
		a.setType('Fighting');
		c.setType('Steel');
		d.setType('Flying');
		b.singleEvent('Residual', p.getAbility(), p.abilityState, p);
		assert.equal(a.hp, 1400);
		assert.equal(c.hp, 1550);
		assert.equal(d.hp, 1600);
		assert.equal(p.hp, 1600);
	});
	it('does not require Strong Winds and is disabled by Gastro Acid', () => {
		const [p, q] = setup();
		b.field.clearWeather();
		b.singleEvent('Residual', p.getAbility(), p.abilityState, p);
		assert.equal(q.hp, 1500);
		q.sethp(1600);
		p.addVolatile('gastroacid');
		b.fieldEvent('Residual');
		assert.equal(q.hp, 1600);
	});
	it('preserves Updraft and the native No Guard passive description', () => {
		const a = Dex.abilities.get('stormsovereign');
		assert(a.onAfterEachBoost);
		assert(a.onSourceDamagingHit);
		assert(!a.onTryBoost);
		assert.match(a.desc, /Flying damage/);
		assert.match(a.desc, /Updraft/);
		assert.deepEqual(Dex.species.get('Pidgeot-Mega').passives, ['noguard']);
	});
});
