'use strict';
const assert = require('assert').strict;
const common = require('../../common');

describe('Survival checks after late damage modifiers', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(item = 'Focus Sash', ability = 'Void Veil', species = 'Gardevoir') {
		battle = common.createBattle({forceRandomChance: true}, [[
			{species, ability, item, moves: ['splash', 'endure']},
		], [{species: 'Mew', ability: 'No Ability', moves: ['megakick', 'tackle']}]]);
		const p = battle.p1.active[0], q = battle.p2.active[0];
		p.hp = p.maxhp = p.baseMaxhp = 400;
		return [p, q];
	}
	for (const moveName of ['megakick', 'tackle']) {
		for (const protection of ['Focus Sash', 'Focus Band', 'Sturdy', 'Endure']) {
			it(`${protection} uses final ${moveName} damage with Breaking News`, () => {
				const [p, q] = setup(protection === 'Sturdy' || protection === 'Endure' ? '' : protection,
					protection === 'Sturdy' ? 'Sturdy' : 'Void Veil');
				if (protection === 'Endure') p.addVolatile('endure');
				const move = battle.dex.getActiveMove(moveName);
				const before = battle.log.length;
				battle.damage(450, p, q, move);
				assert.equal(p.hp, moveName === 'megakick' ? 63 : 40);
				if (protection === 'Focus Sash') assert.equal(p.item, 'focussash');
				assert(!battle.log.slice(before).some(line => /Focus Sash|Focus Band|Sturdy|Endure/.test(line)));
				p.hp = p.maxhp;
				battle.damage(800, p, q, battle.dex.getActiveMove(moveName));
				assert.equal(p.hp, 1, 'a truly lethal hit stops at exactly 1 HP');
				if (protection === 'Focus Sash') assert.equal(p.item, '');
			});
		}
	}
	for (const [ability, damage, hp] of [['Heavy Metal', 600, 100], ['Fourthhold Guard', 450, 63]]) {
		it(`${ability} reduces damage before Sash and Endure`, () => {
			const [p, q] = setup('Focus Sash', ability, 'Mew');
			p.addVolatile('endure');
			battle.damage(damage, p, q, battle.dex.getActiveMove('tackle'));
			assert.equal(p.hp, hp); assert.equal(p.item, 'focussash');
		});
	}
	for (const [ability, terrain, moveName, confusion] of [
		['No Ability', 'hauntedterrain', 'nightshade', false],
		['Corrosion', 'corrosiveterrain', 'tackle', false],
		['Fossil Frenzy', '', 'tackle', true],
	]) it(`includes late ${ability === 'No Ability' ? moveName : ability} amplification before survival`, () => {
		const [p, q] = setup('Focus Sash', ability, 'Mew');
		battle.field.terrain = terrain;
		// Fossil Frenzy includes Klutz, so exercise Endure instead of a suppressed item.
		if (confusion) { p.addVolatile('confusion'); p.addVolatile('endure'); p.hp = p.maxhp; }
		battle.damage(350, p, q, battle.dex.getActiveMove(moveName));
		assert.equal(p.hp, 1); assert.equal(p.item, confusion ? 'focussash' : '');
	});
	it('does not grant a damaged holder a second-hit Sash rescue', () => {
		const [p, q] = setup();
		battle.damage(450, p, q, battle.dex.getActiveMove('megakick'));
		assert.equal(p.item, 'focussash');
		battle.damage(450, p, q, battle.dex.getActiveMove('megakick'));
		assert.equal(p.hp, 0); assert.equal(p.item, 'focussash');
	});
});
