'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
function start(ability, item = '') {
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
		{species: 'Mew', ability, item, moves: ['splash', 'tackle']},
	], [{species: 'Mew', ability: 'No Ability', moves: ['splash']}]]);
	battle.makeChoices('team 1', 'team 1');
	const holder = battle.p1.active[0];
	holder.hp = Math.floor(holder.maxhp / 2);
	return holder;
}
describe('Relic Armor residual recovery removal and Mind\'s Eye no-healing boundary', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const ability of ['Relic Armor', "Mind's Eye", 'Aevian Ascendance']) {
		it(`${ability} does not heal merely at turn end`, () => {
			const holder = start(ability), before = holder.hp;
			battle.makeChoices('move splash', 'move splash');
			assert.equal(holder.hp, before);
		});
		it(`${ability} preserves independent Leftovers recovery`, () => {
			const holder = start(ability, 'Leftovers'), before = holder.hp;
			battle.makeChoices('move splash', 'move splash');
			assert.equal(holder.hp, before + Math.floor(holder.maxhp / 16));
		});
	}
	it('keeps standalone Self Sufficient healing', () => {
		const holder = start('Self Sufficient'), before = holder.hp;
		battle.makeChoices('move splash', 'move splash');
		assert.equal(holder.hp, before + Math.floor(holder.maxhp / 16));
	});
	it('removes Mind\'s Eye recovery from Bloodmoon\'s passive too', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Ursaluna-Bloodmoon', ability: 'No Ability', moves: ['splash', 'tackle']},
		], [{species: 'Mew', ability: 'No Ability', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		const holder = battle.p1.active[0];
		holder.hp = Math.floor(holder.maxhp / 2);
		const before = holder.hp;
		assert(holder.getPassives().includes('mindseye'));
		battle.makeChoices('move tackle', 'move splash');
		assert.equal(holder.hp, before);
	});
	it('removes Mind\'s Eye attack-triggered healing', () => {
		const holder = start("Mind's Eye"), before = holder.hp;
		battle.makeChoices('move tackle', 'move splash');
		assert.equal(holder.hp, before);
	});
	it('keeps Aevian Ascendance Water Absorb field healing separately', () => {
		const holder = start('Aevian Ascendance');
		battle.field.setTerrain('underwaterterrain', holder);
		const before = holder.hp;
		battle.makeChoices('move splash', 'move splash');
		assert.equal(holder.hp, before + Math.floor(holder.maxhp / 16));
	});
	it('keeps Relic Armor damage reduction and field defense boost', () => {
		const holder = start('Relic Armor');
		const ability = battle.dex.abilities.get('relicarmor');
		const attacker = battle.p2.active[0];
		battle.randomizer = damage => damage;
		const hit = battle.dex.getActiveMove('tackle');
		hit.willCrit = false;
		const reduced = battle.actions.getDamage(attacker, holder, hit, true);
		holder.setAbility('No Ability');
		const ordinary = battle.actions.getDamage(attacker, holder, hit, true);
		assert(reduced < ordinary, 'Relic Armor still reduces actual attack damage');
		assert(Math.abs(reduced - ordinary * 0.9) <= 1);
		holder.setAbility('Relic Armor');
		battle.field.setTerrain('desertterrain', holder);
		battle.singleEvent('Start', ability, holder.abilityState, holder);
		assert.equal(holder.boosts.def, 1);
		assert.equal(holder.boosts.spd, 1);
		assert.equal(typeof ability.onImmunity, 'function');
	});
});
