'use strict';
const assert = require('assert').strict, common = require('../../common');
describe('Shed Skin condition cleanup protocol', () => {
	let battle; afterEach(() => battle?.destroy());
	function setup(ability = 'Shed Skin', species = 'Mew') {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species, ability, moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('team 1', 'team 1'); battle.randomChance = () => true; return [battle.p1.active[0], battle.p2.active[0]];
	}
	for (const [species, ability] of [['Mew', 'Shed Skin'], ['Mew', "Venam's Kiss"], ['Scrafty-Mega', 'No Ability']]) for (const id of ['curse', 'leechseed', 'nightmare', 'perishsong', 'yawn'])it(ability + '/' + species + ' cleanly removes ' + id, () => {
		const [p, q] = setup(ability, species); if (id === 'nightmare')p.setStatus('slp', q);
		assert(p.addVolatile(id, q, battle.dex.moves.get(id))); const index = battle.log.length;
		battle.makeChoices('move splash', 'move splash');
		assert(!p.volatiles[id]);
		assert(p.hp > 0);
		assert(!p.fainted);
		assert.equal(p.status, '');
		assert(!battle.faintQueue.some(f => f.target === p));
		const lines = battle.log.slice(index).filter(l => l.startsWith('|-end|') && l.toLowerCase().replace(/[^a-z]/g, '').includes(id));
		assert.equal(lines.length, 1, battle.log.slice(index).join('\n'));
		assert(!battle.log.slice(index).some(l => l.includes('|perish0')));
	});
	it('ordinary Yawn still causes sleep when not cleansed', () => {
		const [p, q] = setup('No Ability');
		p.addVolatile('yawn', q);
		battle.makeChoices('move splash', 'move splash');
		battle.makeChoices('move splash', 'move splash');
		assert.equal(p.status, 'slp');
	});
	it('ordinary Perish Song still faints its target when not cleansed', () => {
		const [p, q] = setup('No Ability');
		p.addVolatile('perishsong', q);
		for (let i = 0; i < 4 && !battle.ended; i++)battle.makeChoices('move splash', 'move splash');
		assert.equal(p.hp, 0);
	});
	it('preserves conditions when the activation roll fails', () => {
		const [p, q] = setup();
		p.addVolatile('leechseed', q);
		battle.randomChance = () => false;
		const index = battle.log.length;
		battle.makeChoices('move splash', 'move splash');
		assert(p.volatiles.leechseed);
		assert(!battle.log.slice(index).some(l => l.startsWith('|-end|')));
	});
	it('retains the special Dragon Den behavior instead of claiming to clear volatiles', () => {
		const [p, q] = setup();
		p.addVolatile('leechseed', q);
		battle.field.terrain = 'dragonsdenterrain';
		const index = battle.log.length;
		battle.makeChoices('move splash', 'move splash');
		assert(p.volatiles.leechseed);
		assert(!battle.log.slice(index).some(l => l.startsWith('|-end|')));
	});
});
