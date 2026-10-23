'use strict';
const assert = require('assert').strict, common = require('../../common');
const { Dex } = require('../../../dist/sim/dex');
const { calculatorMetadata } = require('../../../dist/sim/custom-calculator');
describe('Limber composition and Raging Thicket field behavior', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(ability = 'Limber') {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Mew', ability, moves: ['splash', 'hammerarm', 'tackle'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash', 'scaryface', 'thunderwave'] }],
		]); battle.makeChoices('team 1', 'team 1'); battle.randomChance = () => false;
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	const fields = ['watersurfaceterrain', 'murkwatersurfaceterrain', 'newworldterrain', 'coldeclipseterrain', 'icyterrain', 'snowyterrain', 'underwaterterrain', 'midnightzoneterrain'];
	for (const field of fields) it('Raging Thicket retains the ordinary ' + field + ' Speed penalty', () => {
		const [p] = setup('Raging Thicket'), normal = p.getStat('spe');
		battle.field.changeTerrain(field, p); assert(!p.hasAbility('limber')); assert(p.getStat('spe') < normal);
	});
	it('Raging Thicket allows Swamp and hostile Speed drops', () => {
		const [p, foe] = setup('Raging Thicket'); battle.field.changeTerrain('swampterrain', p);
		battle.makeChoices('move splash', 'move splash'); assert.equal(p.boosts.spe, -1);
		battle.boost({ spe: -1 }, p, foe, battle.dex.moves.get('scaryface')); assert.equal(p.boosts.spe, -2);
	});
	for (const ability of ['Limber', 'Kick Fiend', 'Unchecked Assault']) for (const field of fields) {
		it(ability + ' prevents ' + field + ' Speed reduction', () => {
			const [p] = setup(ability), normal = p.getStat('spe'); battle.field.changeTerrain(field, p);
			assert(p.hasAbility('limber')); assert.equal(p.getStat('spe'), normal);
			p.addVolatile('gastroacid'); assert(p.getStat('spe') < normal);
		});
	}
	for (const ability of ['Limber', 'Kick Fiend', 'Unchecked Assault']) it(ability + ' blocks Swamp and hostile drops but keeps self costs', () => {
		const [p, foe] = setup(ability); battle.field.changeTerrain('swampterrain', p);
		battle.makeChoices('move splash', 'move splash'); assert.equal(p.boosts.spe, 0);
		battle.boost({ spe: -1 }, p, foe, battle.dex.moves.get('scaryface')); assert.equal(p.boosts.spe, 0);
		battle.boost({ spe: -1 }, p, p, battle.dex.moves.get('hammerarm')); assert.equal(p.boosts.spe, -1);
	});
	it('Unchecked Assault blocks paralysis and cures it on acquisition', () => {
		const [p, foe] = setup('Unchecked Assault'); assert.equal(p.setStatus('par', foe), false);
		p.setAbility('No Ability'); assert(p.setStatus('par', foe)); p.setAbility('Unchecked Assault');
		battle.runEvent('Update', p); assert.equal(p.status, '');
		p.addVolatile('gastroacid'); assert(p.setStatus('par', foe));
		p.removeVolatile('gastroacid'); battle.runEvent('Update', p); assert.equal(p.status, '');
		assert.equal(p.addVolatile('confusion', foe), null);
	});
	it('Mold Breaker bypasses hostile Speed-drop protection', () => {
		const [p, foe] = setup('Unchecked Assault'); foe.setAbility('Mold Breaker');
		const m = battle.dex.getActiveMove('scaryface'); m.accuracy = true;
		battle.actions.runMove(m, foe, 1); assert.equal(p.boosts.spe, -2);
	});
	it('preserves held-item penalties, Tailwind expiration and Trick Room ordering', () => {
		const [p] = setup('Unchecked Assault'), normal = p.getStat('spe'); p.setItem('Iron Ball'); assert(p.getStat('spe') < normal);
		p.clearItem(); p.side.addSideCondition('tailwind', p); assert(p.getStat('spe') > normal);
		p.side.removeSideCondition('tailwind'); assert.equal(p.getStat('spe'), normal);
		battle.field.addPseudoWeather('trickroom', p); assert.equal(p.getActionSpeed(), 10000 - normal);
	});
	it('uses the approved Raging Thicket kit without obsolete Limber expectations', () => {
		const a = Dex.abilities.get('Raging Thicket'); assert(!a.desc.includes('Limber')); assert(a.shortDesc.includes('Regenerator'));
		assert.deepEqual(calculatorMetadata().abilityComponents.verdantdrake, ['Lightning Rod', 'Regenerator', 'Infiltrator']);
		assert.equal(Dex.species.get('sceptilemega').abilities[0], 'Raging Thicket');
		const [p, foe] = setup('Raging Thicket'); assert(!p.hasAbility('limber')); assert(p.setStatus('par', foe));
		p.hp = 1; battle.singleEvent('SwitchOut', p.getAbility(), p.abilityState, p); assert.equal(p.hp, 1 + Math.floor(p.baseMaxhp / 3));
	});
});
