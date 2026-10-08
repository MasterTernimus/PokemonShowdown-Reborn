'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
function setup(item = '') {
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
		{ species: 'Mew', ability: 'Neutralization', item, moves: ['tackle', 'confuseray'] },
	], [{ species: 'Mew', ability: 'No Ability', moves: ['gastroacid', 'skillswap', 'splash'] }]]);
	battle.makeChoices('team 1', 'team 1');
	battle.field.terrain = '';
	return [battle.p1.active[0], battle.p2.active[0]];
}
describe('Neutralization approved counterplay', () => {
	afterEach(() => { battle?.destroy(); });
	it('lowers the target by one stage even when that target holds Ability Shield', () => {
		const [p, t] = setup();
		t.setItem('Ability Shield');
		battle.actions.useMove('tackle', p, { target: t });
		assert.equal(t.boosts.atk, -1);
		assert.equal(t.boosts.spa, 0);
		assert.equal(p.boosts.atk, 0);
	});
	it('does not trigger on a successful single-target status hit', () => {
		const [p, t] = setup();
		battle.actions.useMove('confuseray', p, { target: t });
		assert.equal(t.boosts.atk, 0);
	});
	for (const protection of ['protect', 'substitute', 'immunity', 'zero damage']) {
		it('does not lower offense through ' + protection, () => {
			const [p, t] = setup();
			if (protection === 'protect' || protection === 'substitute') t.addVolatile(protection);
			if (protection === 'immunity') t.setType('Ghost');
			if (protection === 'zero damage') battle.onEvent('Damage', battle.format, () => 0);
			battle.actions.useMove('tackle', p, { target: t });
			assert.equal(t.boosts.atk, 0); assert.equal(t.boosts.spa, 0);
		});
	}
	for (const room of ['trickroom', 'magicroom', 'wonderroom']) {
		it(room + ' can be established, cleared by reentry, and established again', () => {
			battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
				{ species: 'Mew', ability: 'Neutralization', moves: ['splash'] },
				{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
			], [{ species: 'Mew', ability: 'No Ability', moves: [room, 'splash'] }]]);
			battle.makeChoices('team 12', 'team 1');
			battle.makeChoices('move splash', 'move ' + room);
			assert(battle.field.pseudoWeather[room]);
			battle.makeChoices('switch 2', 'move splash');
			battle.makeChoices('switch 2', 'move splash');
			assert(!battle.field.pseudoWeather[room]);
			battle.makeChoices('move splash', 'move ' + room);
			assert(battle.field.pseudoWeather[room]);
		});
	}
	for (const shield of [false, true]) {
		it('Gastro Acid and Neutralizing Gas respect Ability Shield = ' + shield, () => {
			const [p, t] = setup(shield ? 'Ability Shield' : '');
			battle.actions.useMove('gastroacid', t, { target: p });
			assert.equal(!!p.volatiles.gastroacid, !shield);
			assert.equal(p.ignoringAbility(), !shield);
			p.removeVolatile('gastroacid');
			t.setAbility('Neutralizing Gas');
			assert.equal(p.ignoringAbility(), !shield);
		});
		it('Skill Swap respects Ability Shield = ' + shield, () => {
			const [p, t] = setup(shield ? 'Ability Shield' : '');
			t.setAbility('Pressure');
			battle.actions.useMove('skillswap', t, { target: p });
			assert.equal(p.ability, shield ? 'neutralization' : 'pressure');
		});
	}
});
