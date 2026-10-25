'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
let battle;
function start(species = 'Gardevoir') {
	battle = common.createBattle({ formatid: 'gen9doublesrockyfield' }, [[{ species, ability: 'Void Veil', moves: ['psychic', 'splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
	battle.makeChoices('team 12', 'team 12');
	return [battle.p1.active[0], battle.p2.active[0]];
}
describe('Void Veil selective airborne terrain benefits', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	it('gains Psychic power and priority protection without being grounded', () => {
		const [p, q] = start();
		battle.field.setTerrain('psychicterrain', p, null, false, true);
		assert(!p.isGrounded());
		assert(p.canBenefitFromTerrain());
		assert(!p.runImmunity('Ground'));
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('psychic'), 100), 150);
		assert.equal(battle.runEvent('TryHit', p, q, Dex.getActiveMove('quickattack')), null);
	});
	it('receives Misty status protection and existing Fairy SpDef bonus, not invented SpA', () => {
		const [p] = start(), spd = p.getStat('spd'), spa = p.getStat('spa');
		battle.field.setTerrain('mistyterrain', p);
		assert.equal(p.getStat('spd'), Math.floor(spd * 1.5));
		assert.equal(p.getStat('spa'), spa);
		assert(!p.setStatus('par'));
		assert(!p.isGrounded());
	});
	it('heals on Grassy without acquiring its grounded incoming Fire weakness', () => {
		const [p, q] = start();
		battle.field.setTerrain('grassyterrain', p);
		p.hp = p.maxhp - 100;
		const hp = p.hp;
		battle.runEvent('Residual', p);
		assert.equal(p.hp, hp + Math.floor(p.baseMaxhp / 16));
		assert.equal(battle.runEvent('BasePower', q, p, Dex.getActiveMove('flamethrower'), 100), 100);
		battle.field.addPseudoWeather('gravity', q);
		assert(!p.isGrounded());
	});
	it('gains Psychic Aura power/protection and Grassy Aura recovery while airborne', () => {
		const [p, q] = start();
		battle.field.aurasEnabled = true;
		assert(battle.field.setAura('psychicterrain', 5, p));
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('psychic'), 100), 130);
		assert.equal(battle.runEvent('TryHit', p, q, Dex.getActiveMove('quickattack')), null);
		battle.field.clearAura();
		assert(battle.field.setAura('grassyterrain', 5, p));
		p.hp = p.maxhp - 100;
		const hp = p.hp;
		battle.runEvent('Residual', p);
		assert.equal(p.hp, hp + Math.floor(p.baseMaxhp / 16));
	});
	it('retains other grounding sources and keeps regional forms out of this change', () => {
		const [p] = start();
		p.addVolatile('smackdown');
		assert(p.isGrounded());
		p.removeVolatile('smackdown');
		p.formeChange('Gardevoir-Void', null, true);
		assert(!p.hasGravityExemption());
		assert.equal(p.canBenefitFromTerrain(), !!p.isGrounded());
	});
	it('loses airborne eligibility when Void Veil is suppressed', () => {
		const [p] = start();
		p.addVolatile('gastroacid');
		assert(!p.hasGravityExemption());
		assert(p.isGrounded());
	});
});
