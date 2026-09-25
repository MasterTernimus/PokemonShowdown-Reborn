'use strict';
const assert = require('assert').strict;
const common = require('../../common');

describe('Evil Santa cosmetic appearance', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function start(ability = 'Evil Santa') {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Delibird', ability, moves: ['splash']},
			{species: 'Mew', ability: 'No Ability', moves: ['splash']},
		], [{species: 'Mew', ability: 'No Ability', moves: ['splash']}]]);
		battle.makeChoices('team 12', 'team 1');
		return battle.p1.active[0];
	}
	it('advertises the artwork in preview and switch messages without changing the species', () => {
		const p = start();
		assert.equal(p.species.id, 'delibird');
		assert.deepEqual(p.getTypes(), ['Ice', 'Flying']);
		assert(battle.log.some(line => line.startsWith('|poke|p1|Delibird-EvilSanta')));
		assert(battle.log.some(line => line.startsWith('|switch|p1a: Delibird|Delibird-EvilSanta')));
		assert.equal(battle.runEvent('ModifySTAB', p, battle.p2.active[0], battle.dex.getActiveMove('darkpulse'), 1), 1.5);
	});
	it('updates after ability replacement and restores the original appearance on switching back', () => {
		const p = start();
		p.setType('Water');
		p.boosts.def = 2;
		p.setAbility('Insomnia');
		assert(!p.details.includes('EvilSanta'));
		assert(battle.log.some(line => line.includes('|detailschange|p1a: Delibird|Delibird,') && line.includes('[cosmetic]')));
		assert.deepEqual(p.getTypes(), ['Water']);
		assert.equal(p.boosts.def, 2);
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(p.ability, 'evilsanta');
		assert(p.details.includes('Delibird-EvilSanta'));
	});
	it('keeps ordinary Delibird unchanged and updates it if it gains Evil Santa', () => {
		const p = start('Insomnia');
		assert(!p.details.includes('EvilSanta'));
		p.setAbility('Evil Santa');
		assert(p.details.includes('EvilSanta'));
		const foe = battle.p2.active[0];
		foe.setAbility('Evil Santa');
		assert(!foe.getUpdatedDetails().includes('EvilSanta'));
	});
	it('refreshes both sides of Skill Swap without resetting battle state', () => {
		const p = start();
		const foe = battle.p2.active[0];
		p.setType('Water');
		p.boosts.def = 2;
		battle.actions.useMove('skillswap', foe, p);
		assert.equal(p.ability, 'noability');
		assert(!p.details.includes('EvilSanta'));
		assert.equal(p.boosts.def, 2);
		assert.deepEqual(p.getTypes(), ['Water']);
		battle.actions.useMove('skillswap', p, foe);
		assert.equal(p.ability, 'evilsanta');
		assert(p.details.includes('EvilSanta'));
		const changes = battle.log.filter(line => line.startsWith('|detailschange|p1a: Delibird|') && line.includes('[cosmetic]'));
		assert.equal(changes.length, 2);
	});
});
