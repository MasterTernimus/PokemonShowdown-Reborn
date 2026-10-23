'use strict';
const assert = require('assert').strict, common = require('../../common');
describe('Drapion approved composites', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(ability = 'Withering Touch', species = 'Mew') {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species: 'Drapion', ability, moves: ['poisonjab', 'toxic', 'tackle'] }], [{ species, ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('team 1', 'team 1'); battle.randomChance = () => true; battle.randomizer = x => x;
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	function hit(p, t, id = 'poisonjab', extra = {}) {
		const move = battle.dex.getActiveMove(id); Object.assign(move, { basePower: 1, accuracy: true, willCrit: false, secondaries: undefined }, extra);
		battle.actions.runMove(move, p, p.getLocOf(t));
	}
	it('retains Poison Touch and Corrosion without the removed extra Attack drop', () => {
		const [p, t] = setup(); hit(p, t);
		assert.equal(t.status, 'psn'); assert.equal(t.boosts.atk, 0);
		assert.equal(t.boosts.def, -1); assert.equal(t.boosts.spd, -1);
		hit(p, t);
		assert.equal(t.boosts.atk, 0);
		hit(p, t);
		assert.equal(t.boosts.atk, 0);
		battle.turn++; hit(p, t); assert.equal(t.boosts.atk, 0);
	});
	it('inherits full Corrosion status bypass and its custom Poison attack immunity bypass', () => {
		for (const species of ['Registeel', 'Muk']) {
			const [p, t] = setup('Withering Touch', species); hit(p, t, 'toxic'); assert.equal(t.status, 'tox');
			assert.equal(t.boosts.def, -1); assert.equal(t.boosts.spd, -1);
			const hp = t.hp;
			hit(p, t);
			assert(t.hp < hp);
			battle.destroy();
			battle = null;
		}
	});
	it('suppression removes Corrosion, Poison Touch and the custom Attack drop', () => {
		const [p, t] = setup('Withering Touch', 'Registeel'); p.addVolatile('gastroacid');
		hit(p, t, 'toxic');
		assert.equal(t.status, '');
		const hp = t.hp;
		hit(p, t);
		assert.equal(t.hp, hp);
	});
	it('Razor Reach uses Sharpness, contact-only Long Reach and independent Keen Eye', () => {
		const [p, t] = setup('Razor Reach'); assert.equal(p.boosts.accuracy, 0);
		for (const id of ['tackle', 'poisonjab']) {
			const move = battle.dex.getActiveMove(id);
			battle.runEvent('ModifyMove', p, t, move, move);
			assert(!move.flags.contact);
		}
		const move = battle.dex.getActiveMove('nightslash'); assert.equal(battle.runEvent('BasePower', p, t, move, 100), 150);
		battle.field.changeTerrain('coldeclipseterrain', p);
		const coldPower = battle.runEvent('BasePower', p, t, move, 100);
		p.setAbility('No Ability'); assert.equal(battle.runEvent('BasePower', p, t, move, 100), coldPower);
		p.setAbility('Razor Reach');
		battle.field.changeTerrain('mountainterrain', p); assert.equal(battle.runEvent('BasePower', p, t, move, 100), 150);
		p.addVolatile('gastroacid'); assert.equal(battle.runEvent('BasePower', p, t, move, 100), 100);
	});
});
