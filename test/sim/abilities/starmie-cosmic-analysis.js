'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

describe('Starmie Cosmic Analysis', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(foe = 'Mew') {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Starmie', ability: 'Cosmic Analysis', moves: ['splash', 'psychic'] }, { species: 'Magikarp', moves: ['splash'] }],
			[{ species: foe, ability: 'No Ability', moves: ['splash'] }],
		]);
		if (battle.requestState === 'teampreview') battle.makeChoices('team 12', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	it('changes only ordinary Starmie’s lineup', () => {
		const s = Dex.species.get('starmie');
		assert.deepEqual(Object.values(s.abilities), ['Cosmic Analysis', 'Misaligned Stars', 'Victory Star']);
		assert.deepEqual(s.passives, ['starlens']);
		assert.deepEqual(Dex.species.get('starmiemega').passives, ['purepower']);
		assert.equal(Dex.species.get('starmiemega').abilities[0], 'Astral Core');
		assert.equal(Dex.species.get('staryu').abilities.H, 'Analytic');
	});
	it('keeps a recorded attack through Mega Evolution from the selectable Stars slot', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Starmie', ability: 'Misaligned Stars', item: 'Starminite', moves: ['splash'] }],
			[{ species: 'Magikarp', ability: 'No Ability', moves: ['watergun'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		const p = battle.p1.active[0];
		p.hp = Math.floor(p.maxhp / 2);
		battle.makeChoices('move splash', 'move watergun');
		const healing = [];
		const heal = p.heal.bind(p);
		p.heal = (...args) => {
			const amount = heal(...args);
			if (battle.activeMove?.id === 'watergun') healing.push(amount);
			return amount;
		};
		battle.makeChoices('move splash mega', 'move watergun');
		assert.equal(p.ability, 'astralcore');
		assert.deepEqual(p.getPassives(), ['purepower']);
		assert.deepEqual(healing, [Math.floor(p.baseMaxhp / 3)]);
		assert.equal(battle.log.filter(line => line.includes('The stars were bad')).length, 1);
		assert.equal(battle.log.filter(line => line.includes('the stars traced')).length, 1);
	});
	it('applies Analytic once and only after other active Pokémon have acted', () => {
		const [p, q] = setup();
		const move = Dex.getActiveMove('psychic');
		battle.queue.willMove = target => target === q;
		assert.equal(battle.runEvent('BasePower', p, q, move, 100), 100);
		battle.queue.willMove = () => false;
		assert.equal(battle.runEvent('BasePower', p, q, move, 100), 130);
		p.addVolatile('gastroacid', q);
		assert.equal(battle.runEvent('BasePower', p, q, move, 100), 100);
		assert(p.hasAbilityOrPassive('illuminate'));
	});
	it('cures status and heals one eighth on a normal switch without a Download boost', () => {
		const [p] = setup();
		assert(!p.volatiles.laserfocus);
		assert.equal(p.boosts.atk + p.boosts.spa, 0);
		p.hp = 10;
		p.setStatus('par');
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(p.status, '');
		assert.equal(p.hp, 10 + Math.floor(p.baseMaxhp / 8));
	});
	it('cures status on Bewitched Woods at turn end', () => {
		const [p] = setup();
		battle.field.terrain = 'bewitchedwoodsterrain';
		p.setStatus('par');
		battle.makeChoices('move splash', 'move splash');
		assert.equal(p.status, '');
	});
});
