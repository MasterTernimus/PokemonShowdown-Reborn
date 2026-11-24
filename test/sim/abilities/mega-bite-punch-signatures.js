'use strict';
const assert = require('assert').strict;
const common = require('../../common');
describe('Mega bite and punch conversions', () => {
	let battle;
	afterEach(() => battle?.destroy());
	for (const [species, item, move, name] of [
		['Feraligatr', 'Feraligite', 'riptidefang', 'Crush Bite'],
		['Sharpedo', 'Sharpedonite', 'riptidefang', 'Razor Bite'],
		['Ledian', 'Ledianite', 'carapacejab', 'Comet Jab'],
	]) it(species + ' converts its original move on the Mega Evolution turn', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species, item, moves: [move] }], [{ species: 'Blissey', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		const p = battle.p1.active[0], foe = battle.p2.active[0];
		foe.maxhp = foe.baseMaxhp = foe.hp = 4000;
		const pp = p.moveSlots[0].pp;
		assert.notEqual(p.getMoves()[0].move, name);
		if (species === 'Sharpedo') {
			foe.addVolatile('substitute', foe);
			foe.volatiles.substitute.hp = 1000;
		}
		battle.makeChoices('move 1 mega', 'move 1');
		const m = p.lastMoveUsed;
		assert.equal(m.name, name); assert.equal(p.getMoves()[0].move, name);
		assert.equal(p.moveSlots[0].id, move); assert.equal(p.moveSlots[0].pp, pp - 1);
		if (species === 'Sharpedo') {
			assert(m.flags.bite); assert(foe.hp < 4000); assert.equal(foe.volatiles.substitute.hp, 1000);
		} else if (species === 'Feraligatr') {
			assert.equal(m.basePower, 75); assert(m.flags.bite); assert(m.ignorePositiveDefensive);
		} else {
			assert.equal(m.category, 'Special'); assert(m.flags.punch);
			assert.equal(m.multihit, 4);
			p.boosts.atk = 6; battle.makeChoices('move 1', 'move 1'); assert.equal(p.lastMoveUsed.category, 'Physical');
		}
	});
});
