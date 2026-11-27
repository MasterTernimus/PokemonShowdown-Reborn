'use strict';
const assert = require('assert').strict,
	common = require('../../common'),
	{ Dex } = require('../../../dist/sim');
describe('Revised single Memory effects', () => {
	let battle;
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	function setup(item, ability = 'RKS System') {
		battle = common.createBattle({}, [
			[
				{
					species: 'Silvally',
					ability,
					item,
					moves: ['tackle', 'tailwind', 'flamethrower'],
				},
			],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash', 'ember', 'gust', 'earthquake'] }],
		]);
		if (battle.requestState === 'teampreview') battle.makeChoices();
		if (item !== 'Fairy Memory') battle.field.terrain = '';
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	it('only grants a held Memory passive with RKS System and updates it when the item changes', () => {
		const [p, q] = setup('Fire Memory');
		assert.deepEqual(p.getPassives(), ['flashfire']);
		battle.actions.useMove('ember', q, { target: p });
		p.setItem('Fairy Memory');
		assert.deepEqual(p.getPassives(), ['mistysurge']);
		assert(!p.volatiles.flashfire);
		assert.equal(battle.field.terrain, 'mistyterrain');
		p.clearItem();
		assert.deepEqual(p.getPassives(), []);
		assert(p.hasAbility('scrappy'));
	});
	for (const ability of ['Adaptive Arsenal', 'Memory Leak']) it(ability + ' gets no Memory passive', () => {
		const [p] = setup('Fire Memory', ability);
		assert.equal(p.ability, Dex.toID(ability));
		assert.deepEqual(p.getPassives(), []);
	});
	it('Fire absorbs Fire and retains its charged damage boost', () => {
		const [p, q] = setup('Fire Memory');
		const hp = p.hp;
		battle.actions.useMove('ember', q, { target: p });
		assert.equal(p.hp, hp);
		assert(p.volatiles.flashfire);
		assert(p.hasAbility('flashfire'));
		assert(!p.hasAbility('soulfire'));
		assert.equal(battle.runEvent('ModifySpA', p, q, Dex.getActiveMove('flamethrower'), 100), 150);
	});
	it('Ghost bypasses Substitute and screens', () => {
		const [p, q] = setup('Ghost Memory');
		const move = Dex.getActiveMove('tackle');
		battle.runEvent('ModifyMove', p, q, move, move);
		assert(move.infiltrates);
		assert(!p.hasAbility('soulfire'));
	});
	it('Flying blocks wind attacks and responds when Tailwind starts', () => {
		const [p, q] = setup('Flying Memory');
		const hp = p.hp;
		battle.actions.useMove('gust', q, { target: p });
		assert.equal(p.hp, hp);
		assert.equal(p.boosts.atk, 1);
		battle.actions.useMove('tailwind', p);
		assert.equal(p.boosts.atk, 2);
		assert(!p.hasAbility('galewings'));
	});
	it('Ground absorbs Ground attacks to recover HP', () => {
		const [p, q] = setup('Ground Memory');
		p.hp = 100;
		const hp = p.hp;
		battle.actions.useMove('earthquake', q, { target: p });
		assert.equal(p.hp, hp + Math.floor(p.baseMaxhp / 4));
		assert(!p.hasAbility('sandrush'));
	});
	it('Ice gains Attack from Fire hits and cannot be burned', () => {
		const [p, q] = setup('Ice Memory');
		battle.actions.useMove('ember', q, { target: p });
		assert.equal(p.boosts.atk, 1);
		assert.equal(p.trySetStatus('brn', q, Dex.moves.get('willowisp')), false);
		assert(!p.hasAbility('icebody'));
	});
	it('Electric absorbs Electric hits and raises Sp. Atk', () => {
		const [p, q] = setup('Electric Memory');
		const hp = p.hp;
		battle.actions.useMove('thunderbolt', q, { target: p });
		assert.equal(p.hp, hp);
		assert.equal(p.boosts.spa, 1);
		assert(p.hasAbility('lightningrod'));
		assert(!p.hasAbility('transistor'));
	});
	it('Fairy starts Misty Terrain through RKS System', () => {
		const [p] = setup('Fairy Memory');
		assert.deepEqual(p.getPassives(), ['mistysurge']);
		assert.equal(battle.field.terrain, 'mistyterrain');
		assert(p.hasAbility('mistysurge'));
		assert(!p.hasAbility('invigorate'));
	});
});
