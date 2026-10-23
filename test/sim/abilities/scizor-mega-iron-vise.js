'use strict'; const assert = require('assert').strict, common = require('../../common'), { Dex } = require('../../../dist/sim');
describe('Mega Scizor Iron Vise rework', () => {
	let b;
	afterEach(() => {
		b?.destroy();
		b = null;
	});
	function setup() {
		const mon = { species: 'Mew', ability: 'No Ability', moves: ['splash', 'doublehit', 'tackle'] };
		b = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ ...mon, species: 'Scizor-Mega', ability: 'Iron Vise' }, mon], [mon]]);
		b.makeChoices('team 1', 'team 1');
		return [b.p1.active[0], b.p2.active[0]];
	}
	it('keeps passive Intimidate exactly once and the two approved active components', () => {
		const [p, q] = setup();
		assert.deepEqual(p.getPassives(), ['intimidate']);
		assert.equal(q.boosts.atk, -1);
		for (const id of ['toughclaws', 'decoypincers'])assert(p.hasAbilityOrPassive(id));
		for (const id of ['technician', 'lightmetal', 'battlearmor'])assert(!p.hasAbilityOrPassive(id));
		assert.deepEqual(require('../../../dist/data/ability-display').getAbilityDisplayComponents('ironvise'), ['toughclaws', 'decoypincers']);
	});
	it('boosts contact once and leaves non-contact power unchanged', () => {
		const [p, q] = setup();
		assert.equal(b.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 100), 130);
		assert.equal(b.runEvent('BasePower', p, q, Dex.getActiveMove('surf'), 100), 100);
	});
	it('consumes Decoy Pincers on the first real multihit strike only', () => {
		const [p, q] = setup();
		q.boosts.atk = 0;
		const damage = [], base = b.spreadDamage;
		b.spreadDamage = function (n, targets, source, effect, ...rest) {
			const out = base.call(this, n, targets, source, effect, ...rest);
			if (effect?.effectType === 'Move')targets.forEach((target, i) => {
				if (target === p && out[i] > 0)damage.push(out[i]);
			});
			return out;
		};
		const move = Dex.getActiveMove('doublehit');
		Object.assign(move, { category: 'Special', accuracy: true, willCrit: false, basePower: 40 });
		b.actions.useMove(move, q, { target: p });
		assert.equal(damage.length, 2);
		assert(damage[1] > damage[0], JSON.stringify(damage));
		assert.equal(q.boosts.atk, -1);
		assert.equal(b.runEvent('ModifyDamage', q, p, Dex.getActiveMove('tackle'), 100), 100);
	});
	it('resets protection after switching out and back in', () => {
		const [p, q] = setup();
		assert.equal(b.runEvent('ModifyDamage', q, p, Dex.getActiveMove('tackle'), 100), 75);
		b.actions.runMove('tackle', q, q.getLocOf(p));
		assert.equal(b.runEvent('ModifyDamage', q, p, Dex.getActiveMove('tackle'), 100), 100);
		b.makeChoices('switch 2', 'move splash');
		b.makeChoices('switch 2', 'move splash');
		assert.equal(b.p1.active[0], p);
		assert.equal(b.runEvent('ModifyDamage', q, p, Dex.getActiveMove('tackle'), 100), 75);
	});
	it('has no Light Metal weight, speed or Factory entry effects', () => {
		const [p] = setup();
		assert.equal(p.getWeight(), p.species.weighthg);
		assert.equal(b.runEvent('ModifySpe', p, null, null, 100), 100);
		b.field.setTerrain('factoryterrain', p);
		b.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(p.boosts.spe, 0);
		assert.equal(p.getWeight(), p.species.weighthg);
	});
	it('suppression removes both active effects but leaves Intimidate passive', () => {
		const [p, q] = setup();
		p.addVolatile('gastroacid');
		assert.equal(b.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 100), 100);
		assert.equal(b.runEvent('ModifyDamage', q, p, Dex.getActiveMove('tackle'), 100), 100);
		q.boosts.atk = 0;
		delete p.abilityState.intimidateActivated;
		const { passiveEffect, passiveState } = require('../../../dist/sim/species-passives');
		b.singleEvent('SwitchIn', passiveEffect(b, 'intimidate'), passiveState(p, 'intimidate'), p);
		assert.equal(q.boosts.atk, -1);
		b.actions.runMove('tackle', q, q.getLocOf(p));
		assert.equal(q.boosts.atk, -1);
	});
	it('preserves base Scizor kit', () => { assert.deepEqual(Dex.species.get('scizor').abilities, { 0: 'Pincer Crush', 1: 'Technician', H: 'Decoy Pincers' }); assert.deepEqual(Dex.species.get('scizor').passives, ['hypercutter']); });
});
