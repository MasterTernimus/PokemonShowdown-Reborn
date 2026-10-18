'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

describe('Hydreigon passive Berserk', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(ability, species = 'Hydreigon') {
		battle = common.createBattle({}, [
			[{species, ability, moves: ['splash']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['tackle']}],
		]);
		const p = battle.p1.active[0], q = battle.p2.active[0];
		p.hp = 600; p.maxhp = p.baseMaxhp = 1000;
		return [p, q];
	}
	function hit(p, q) {
		const move = Object.assign(Dex.getActiveMove('tackle'), {damage: 150, accuracy: true, willCrit: false});
		battle.actions.runMove(move, q, q.getLocOf(p));
	}
	for (const ability of ['Dark Aura', 'Worldbreaker', 'False Liberation', 'Berserk']) {
		for (const suppressed of [false, true]) {
			it(`${ability}, suppressed=${suppressed}: boosts once through Hydra Flight`, () => {
				const [p, q] = setup(ability);
				if (suppressed) p.addVolatile('gastroacid', q);
				assert.deepEqual(p.getPassives(), ['hydraflight']);
				assert(p.hasAbilityOrPassive('berserk'));
				hit(p, q);
				assert.equal(p.hp, 450);
				assert.equal(p.boosts.atk, 1);
				assert.equal(p.boosts.spa, 1);
				hit(p, q);
				assert.equal(p.boosts.atk, 1);
				assert.equal(p.boosts.spa, 1);
			});
		}
	}
	for (const ability of ['Worldbreaker', 'False Liberation']) {
		it(`${ability} no longer grants Berserk to another species`, () => {
			const [p, q] = setup(ability, 'Mew');
			assert(!p.hasAbilityOrPassive('berserk'));
			hit(p, q);
			assert.equal(p.boosts.atk, 0);
			assert.equal(p.boosts.spa, 0);
		});
	}
});
