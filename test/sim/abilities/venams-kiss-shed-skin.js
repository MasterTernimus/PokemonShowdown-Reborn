'use strict';
const assert = require('assert').strict;
const { Battle, Dex } = require('../../../dist/sim');
const { AbilityComponents } = require('../../../dist/data/ability-components');

describe('Venams Kiss full local Shed Skin', () => {
	let battle;
	function setup(ability = "Venam's Kiss") {
		battle = new Battle({ formatid: 'gen9nofieldsinglesgame', seed: [1, 2, 3, 4],
			p1: { team: [{ species: 'Mew', ability, moves: ['splash', 'sludgebomb'] }] },
			p2: { team: [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }] },
		});
		if (battle.requestState === 'teampreview') battle.makeChoices('team 1', 'team 1');
		for (const p of battle.getAllActive()) p.hp = p.maxhp = p.baseMaxhp = 1000;
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const status of ['brn', 'psn', 'tox', 'par', 'slp', 'frz']) {
		it('cures ' + status + ' at the native residual timing before status damage', () => {
			const [p] = setup();
			assert(p.setStatus(status));
			p.hp = 500;
			const rolls = [];
			battle.randomChance = (n, d) => { rolls.push([n, d]); return true; };
			battle.fieldEvent('Residual');
			assert.equal(p.status, '');
			assert.equal(p.hp, 750);
			assert.deepEqual(rolls, [[1, 2]]);
			assert.equal(p.getAbility().onResidualOrder, Dex.abilities.get('shedskin').onResidualOrder);
			assert.equal(p.getAbility().onResidualSubOrder, Dex.abilities.get('shedskin').onResidualSubOrder);
		});
	}
	it('retains status and HP when the 50% roll fails', () => {
		const [p] = setup();
		p.setStatus('par'); p.hp = 500;
		battle.randomChance = (n, d) => { assert.equal(n, 1); assert.equal(d, 2); return false; };
		battle.singleEvent('Residual', p.getAbility(), p.abilityState, p);
		assert.equal(p.status, 'par'); assert.equal(p.hp, 500);
	});
	it('does not roll or activate without an eligible condition', () => {
		const [p] = setup(); p.hp = 750;
		battle.randomChance = () => { throw new Error('ineligible Shed Skin must not roll'); };
		battle.fieldEvent('Residual');
		assert.equal(p.hp, 750);
		assert(!battle.log.some(line => line.includes('ability: Shed Skin')));
	});
	it('heals a status-free holder at half HP and clears negative stages and listed ailments', () => {
		const [p, q] = setup(); p.hp = 500;
		p.addVolatile('confusion', q); p.boosts.atk = -2; p.boosts.spa = 2;
		battle.randomChance = () => true;
		battle.singleEvent('Residual', p.getAbility(), p.abilityState, p);
		assert.equal(p.hp, 750); assert.equal(p.boosts.atk, 0); assert.equal(p.boosts.spa, 2);
		assert(!p.volatiles.confusion);
	});
	it('does not cure, reset or heal while the selected ability is suppressed', () => {
		const [p, q] = setup(); p.setStatus('par'); p.hp = 500; p.boosts.atk = -1;
		p.addVolatile('gastroacid', q);
		battle.randomChance = () => { throw new Error('suppressed Shed Skin must not roll'); };
		battle.fieldEvent('Residual');
		assert.equal(p.status, 'par'); assert.equal(p.hp, 500); assert.equal(p.boosts.atk, -1);
	});
	for (const special of [false, true]) it('retains the guaranteed Dragon Den alternate effect: special=' + special, () => {
		const [p, q] = setup();
		battle.field.setTerrain('dragonsdenterrain', p);
		p.setStatus('par'); p.hp = 500; p.boosts.atk = special ? -1 : 1;
		p.addVolatile('confusion', q); p.boosts.accuracy = -1;
		battle.randomChance = () => { throw new Error('Dragon Den must not roll'); };
		battle.singleEvent('Residual', p.getAbility(), p.abilityState, p);
		assert.equal(p.status, ''); assert.equal(p.hp, 750);
		assert.equal(p.boosts.atk, special ? -1 : 2); assert.equal(p.boosts.spa, special ? 1 : 0);
		assert.equal(p.boosts.def, -1); assert.equal(p.boosts.spd, -1);
		assert.equal(p.boosts.accuracy, -1); assert(p.volatiles.confusion);
	});
	it('preserves Steel poison bypass, drain, pre-poison Heal Block and Speed effects', () => {
		const [p, q] = setup(); p.hp = 500; q.setType(['Steel', 'Grass']);
		const move = Object.assign(Dex.getActiveMove('sludgebomb'), { accuracy: true, willCrit: false, damage: 90, secondaries: null });
		battle.actions.useMove(move, p, { target: q });
		assert.equal(q.status, 'psn'); assert.equal(p.hp, 530);
		const baseSpeed = q.getStat('spe', false, true);
		assert.equal(q.getStat('spe'), Math.floor(baseSpeed * 0.75));
		battle.actions.useMove(Object.assign(Dex.getActiveMove('sludgebomb'), { accuracy: true, willCrit: false, damage: 90 }), p, { target: q });
		assert(q.volatiles.healblock); assert.equal(q.volatiles.healblock.duration, 2);
		assert.equal(p.hp, 560);
	});
	it('keeps Sirius at one Shed Skin residual activation', () => {
		const [p] = setup('Sirius'); p.hp = 250;
		let rolls = 0; battle.randomChance = (n, d) => { assert.equal(n, 1); assert.equal(d, 2); rolls++; return true; };
		battle.fieldEvent('Residual');
		assert.equal(rolls, 1); assert.equal(p.hp, 500);
		assert.equal(battle.log.filter(line => line.includes('|-activate|') && line.includes('ability: Sirius')).length, 1);
	});
	it('publishes the component and complete descriptions without altering the move', () => {
		assert.deepEqual(AbilityComponents.venamskiss, ['shedskin']);
		assert(publishedDescription().includes('frostbite'));
		assert(Dex.abilities.get('venamskiss').shortDesc.includes('Shed Skin'));
		assert.equal(Dex.moves.get('venamskiss').basePower, 60);
	});
});
function publishedDescription() {
	return Dex.abilities.get('venamskiss').desc;
}
