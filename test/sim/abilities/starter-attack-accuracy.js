'use strict';
const assert = require('assert').strict;
const { Dex } = require('../../../dist/sim');
const { buildCalculatorBattle, validateScenario, calculatorFormats } = require('../../../dist/sim/custom-calculator');

describe('Starter chip replaced by move accuracy', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(ability, format = 'gen9nofieldsinglesgame') {
		const result = buildCalculatorBattle(validateScenario({ format, field: '', move: 'splash', actors: [
			{ species: 'Mew', ability },
			...Array.from({ length: 3 }, () => ({ species: 'Mew', ability: 'No Ability' })),
		] }), 0);
		battle = result.battle;
		for (const mon of result.mons) mon.hp = mon.maxhp = mon.baseMaxhp = 1600;
		return result.mons;
	}
	const abilities = [
		'Pollen Bloom', 'Virulence', 'Verdant Crown', 'Unbound Blaze', 'Atrocity',
		'Sun Sovereign', 'Blazing Crown', 'Water Barrage', 'Bombardment', 'Tidal Crown',
	];
	for (const ability of abilities) {
		it(ability + ' gives exactly 1.1x accuracy to damaging and status moves', () => {
			const [p, q] = setup(ability);
			for (const id of ['tackle', 'hydropump', 'hypnosis', 'sleeppowder']) {
				const move = Dex.getActiveMove(id);
				assert.equal(battle.runEvent('ModifyAccuracy', q, p, move, 80), 88);
				assert.equal(battle.runEvent('ModifyAccuracy', q, p, move, true), true);
			}
			assert.equal(battle.runEvent('ModifyAccuracy', q, p, Dex.getActiveMove('hypnosis'), 60), 66);
			p.addVolatile('gastroacid');
			assert.equal(battle.runEvent('ModifyAccuracy', q, p, Dex.getActiveMove('tackle'), 80), p.getAbility().flags.cantsuppress ? 88 : 80);
		});
		for (const format of ['gen9nofieldsinglesgame', calculatorFormats().find(f => f.gameType === 'freeforall').id]) {
			it(ability + ' has no chip or chip healing in ' + format, () => {
				const mons = setup(ability, format), p = mons[0];
				p.hp = 800;
				for (let turn = 0; turn < 3; turn++) battle.singleEvent('Residual', p.getAbility(), p.abilityState, p);
				assert.equal(p.hp, 800);
				for (const mon of mons.slice(1)) assert.equal(mon.hp, 1600);
			});
		}
	}
	for (const ability of ['Water Barrage', 'Bombardment']) {
		it(ability + ' boosts both independent Zap Cannon checks once', () => {
			const [p, q] = setup(ability), rolls = [];
			battle.randomChance = (n, d) => { if (d === 100) rolls.push(n); return true; };
			const move = Dex.getActiveMove('zapcannon');
			move.willCrit = false;
			battle.actions.useMove(move, p, { target: q });
			battle.clearActiveMove();
			assert.deepEqual(rolls.filter(n => n !== 100), [55, 55]);
			assert(q.hp < 1600);
		});
	}
	it('retains only Ice Body residual recovery on the revised Sovereigns', () => {
		for (const id of ['rainsovereign', 'sandsovereign']) assert(!Dex.abilities.get(id).onResidual);
		assert(Dex.abilities.get('frostsovereign').onResidual);
	});
});
