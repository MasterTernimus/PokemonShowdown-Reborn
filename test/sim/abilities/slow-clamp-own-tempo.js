'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

describe('Slow Clamp Own Tempo replacement', () => {
	let battle;
	afterEach(() => { battle?.destroy(); });
	function setup(allyAbility = 'No Ability', selected = 'Slow Clamp') {
		const mon = { species: 'Mew', ability: 'No Ability', moves: ['splash', 'confuseray', 'yawn', 'spore'] };
		battle = common.createBattle({ gameType: 'doubles' }, [[{ ...mon, ability: selected }, { ...mon, ability: allyAbility }], [{ ...mon }, { ...mon }]]);
		return [battle.p1.active[0], battle.p1.active[1], battle.p2.active[0]];
	}
	it('has Own Tempo and Analytic without advertising Sweet Veil', () => {
		const [p] = setup();
		assert(p.hasAbilityOrPassive('owntempo'));
		assert(p.hasAbilityOrPassive('analytic'));
		assert(!p.hasAbilityOrPassive('sweetveil'));
		assert.equal(p.getAbility().flags.breakable, 1);
	});
	it('prevents confusion only for its holder', () => {
		const [p, ally, foe] = setup();
		assert(!p.addVolatile('confusion', foe));
		assert(ally.addVolatile('confusion', foe));
	});
	it('cures pre-existing confusion after acquiring the ability', () => {
		const [p, , foe] = setup('No Ability', 'No Ability');
		assert(p.addVolatile('confusion', foe));
		p.setAbility('Slow Clamp');
		battle.eachEvent('Update');
		assert(!p.volatiles.confusion);
	});
	it('blocks Intimidate Attack loss while retaining ordinary drops', () => {
		const [p, , foe] = setup();
		battle.boost({ atk: -1 }, p, foe, Dex.abilities.get('intimidate'));
		assert.equal(p.boosts.atk, 0);
		battle.boost({ atk: -1 }, p, foe, Dex.getActiveMove('growl'));
		assert.equal(p.boosts.atk, -1);
	});
	it('allows sleep for its holder and ally', () => {
		const [p, ally, foe] = setup();
		assert(p.trySetStatus('slp', foe));
		assert(ally.trySetStatus('slp', foe));
	});
	it('allows Yawn for its holder and ally', () => {
		const [p, ally, foe] = setup();
		assert(p.addVolatile('yawn', foe));
		assert(ally.addVolatile('yawn', foe));
	});
	it('retains sleep protection independently supplied by an ally Sweet Veil', () => {
		const [p, ally, foe] = setup('Sweet Veil');
		assert(!p.trySetStatus('slp', foe));
		assert(!ally.trySetStatus('slp', foe));
		assert(!p.addVolatile('yawn', foe));
	});
	it('loses selected Own Tempo under suppression and cures confusion when restored', () => {
		const [p, , foe] = setup();
		p.addVolatile('gastroacid');
		assert(p.addVolatile('confusion', foe));
		battle.boost({ atk: -1 }, p, foe, Dex.abilities.get('intimidate'));
		assert.equal(p.boosts.atk, -1);
		p.removeVolatile('gastroacid');
		battle.eachEvent('Update');
		assert(!p.volatiles.confusion);
	});
	it('permits Mold Breaker to bypass confusion prevention', () => {
		const [p, , foe] = setup();
		foe.setAbility('Mold Breaker');
		battle.actions.useMove(Object.assign(Dex.getActiveMove('confuseray'), { accuracy: true }), foe, { target: p });
		assert(p.volatiles.confusion);
	});
	it('retains the existing Shell Armor damage reduction exactly once with the species passive', () => {
		const [p, , foe] = setup();
		p.formeChange('Slowbro-Mega', null, true);
		assert.equal(battle.runEvent('SourceModifyDamage', p, foe, Dex.getActiveMove('tackle'), 100), 80);
	});
});
