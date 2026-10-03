'use strict';
const assert = require('assert').strict, common = require('../../common');
const { Dex } = require('../../../dist/sim/dex');
const { calculatorMetadata } = require('../../../dist/sim/custom-calculator');
describe('Limber and Verdant Drake field protection', () => {
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
	for (const ability of ['Limber', 'Verdant Drake', 'Kick Fiend', 'Unchecked Assault']) for (const field of fields) {
		it(ability + ' prevents ' + field + ' Speed reduction', () => {
			const [p] = setup(ability), normal = p.getStat('spe'); battle.field.changeTerrain(field, p);
			assert(p.hasAbility('limber')); assert.equal(p.getStat('spe'), normal);
			p.addVolatile('gastroacid'); assert(p.getStat('spe') < normal);
		});
	}
	for (const ability of ['Limber', 'Verdant Drake', 'Kick Fiend', 'Unchecked Assault']) it(ability + ' blocks Swamp and hostile drops but keeps self costs', () => {
		const [p, foe] = setup(ability); battle.field.changeTerrain('swampterrain', p);
		battle.makeChoices('move splash', 'move splash'); assert.equal(p.boosts.spe, 0);
		battle.boost({ spe: -1 }, p, foe, battle.dex.moves.get('scaryface')); assert.equal(p.boosts.spe, 0);
		battle.boost({ spe: -1 }, p, p, battle.dex.moves.get('hammerarm')); assert.equal(p.boosts.spe, -1);
	});
	it('Verdant Drake blocks paralysis, cures it on acquisition, and retains Regenerator healing once', () => {
		const [p, foe] = setup('Verdant Drake'); assert.equal(p.setStatus('par', foe), false);
		p.setAbility('No Ability'); assert(p.setStatus('par', foe)); p.setAbility('Verdant Drake');
		battle.runEvent('Update', p); assert.equal(p.status, '');
		p.hp = 1; battle.singleEvent('SwitchOut', p.getAbility(), p.abilityState, p); assert.equal(p.hp, 1 + Math.floor(p.baseMaxhp / 3));
		assert(p.hasAbility('regenerator'));
	});
	it('Mold Breaker bypasses hostile Speed-drop protection', () => {
		const [p, foe] = setup('Verdant Drake'); foe.setAbility('Mold Breaker');
		const m = battle.dex.getActiveMove('scaryface'); m.accuracy = true;
		battle.actions.runMove(m, foe, 1); assert.equal(p.boosts.spe, -2);
	});
	it('preserves held-item penalties, Tailwind expiration and Trick Room ordering', () => {
		const [p] = setup('Verdant Drake'), normal = p.getStat('spe'); p.setItem('Iron Ball'); assert(p.getStat('spe') < normal);
		p.clearItem(); p.side.addSideCondition('tailwind', p); assert(p.getStat('spe') > normal);
		p.side.removeSideCondition('tailwind'); assert.equal(p.getStat('spe'), normal);
		battle.field.addPseudoWeather('trickroom', p); assert.equal(p.getActionSpeed(), 10000 - normal);
	});
	it('preserves Sceptile stats and exposes only the approved component replacement', () => {
		const a = Dex.abilities.get('Verdant Drake'); assert(a.desc.includes('Limber')); assert(a.desc.includes('Regenerator'));
		assert.deepEqual(calculatorMetadata().abilityComponents.verdantdrake, ['Proficient', 'Dual Wield', 'Regenerator', 'Lightning Rod', 'Limber']);
		assert.equal(Dex.species.get('sceptilemega').abilities[0], 'Verdant Drake');
	});
});
