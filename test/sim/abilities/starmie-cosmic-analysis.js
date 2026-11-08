'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

describe('Starmie Cosmic Analysis', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(foe = 'Mew') {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Starmie', ability: 'Cosmic Analysis', moves: ['splash', 'psychic'] }],
			[{ species: foe, ability: 'No Ability', moves: ['splash'] }],
		]);
		if (battle.requestState === 'teampreview') battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	it('changes only ordinary Starmie’s lineup', () => {
		const s = Dex.species.get('starmie');
		assert.deepEqual(Object.values(s.abilities), ['Cosmic Analysis', 'Natural Cure', 'Victory Star']);
		assert.deepEqual(s.passives, ['illuminate']);
		assert.deepEqual(Dex.species.get('starmiemega').passives, ['purepower']);
		assert.equal(Dex.species.get('starmiemega').abilities[0], 'Astral Core');
		assert.equal(Dex.species.get('staryu').abilities.H, 'Analytic');
	});
	for (const [foe, stat] of [['Blissey', 'atk'], ['Steelix', 'spa']]) {
		it(`uses Download to select ${stat} against ${foe}`, () => {
			const [p] = setup(foe);
			assert.equal(p.boosts[stat], 1);
			assert.equal(p.boosts[stat === 'atk' ? 'spa' : 'atk'], 0);
			assert(p.hasAbility('analytic'));
			assert(p.hasAbility('download'));
		});
	}
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
	it('retains local Download’s first damaging move critical hit', () => {
		const [p, q] = setup();
		const modify = name => {
			const move = Dex.getActiveMove(name);
			battle.runEvent('ModifyMove', p, q, move, move);
			return move;
		};
		assert(!modify('splash').willCrit);
		assert.equal(modify('psychic').willCrit, true);
		assert(!modify('psychic').willCrit);
	});
});
