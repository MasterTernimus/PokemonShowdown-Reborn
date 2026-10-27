'use strict';
const assert = require('assert').strict, { Battle, Dex, TeamValidator } = require('../../../dist/sim');
function battle(ability = 'Aevian King') {
	const b = new Battle({ formatid: 'gen9nofielddoublesbattle', seed: [1, 2, 3, 4], p1: { name: 'A', team: [{ species: 'Politoed', ability, moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['tackle'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }] }, p2: { name: 'B', team: [{ species: 'Mew', ability: 'No Ability', moves: ['watergun', 'hypervoice', 'splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }] } });
	b.makeChoices('team 123', 'team 12');
	return b;
}
describe('Politoed event Aevian King', () => {
	it('preserves regular slots and uses the existing event slot', () => {
		assert.deepEqual(Dex.species.get('politoed').abilities, { 0: 'Zen', 1: 'Royal Decree', H: 'Storm Song', S: 'Aevian King' });
		const p = Dex.species.get('politoedrejuv');
		assert.deepEqual(p.baseStats, { hp: 110, atk: 70, def: 105, spa: 95, spd: 85, spe: 70 });
		assert.equal(p.bst, 535);
		assert.deepEqual(p.types, ['Normal', 'Dragon']);
		assert.equal(p.battleOnly, 'Politoed');
		assert.equal(p.requiredAbility, 'Aevian King');
	});
	it('transforms only the event option and follows persistent Rejuv switching', () => {
		const b = battle();
		try {
			const p = b.p1.active[0];
			assert.equal(p.species.id, 'politoedrejuv');
			assert.equal(p.ability, 'aevianking');
			assert.deepEqual(p.getPassives(), ['royalremedy']);
			b.makeChoices('switch 3, move 1 1', 'move 3, move 1');
			b.makeChoices('switch 3, move 1 1', 'move 3, move 1');
			assert.equal(b.p1.active[0].species.id, 'politoedrejuv');
		} finally {
			b.destroy();
		} const c = battle('Zen');
		try {
			assert.equal(c.p1.active[0].species.id, 'politoed');
		} finally {
			c.destroy();
		}
	});
	it('blocks sound once and absorbs Water once', () => {
		const b = battle();
		try {
			const p = b.p1.active[0];
			p.hp -= 100;
			let hp = p.hp;
			b.makeChoices('move 1, move 1 1', 'move 2, move 1');
			assert.equal(p.hp, hp);
			assert.equal(b.log.filter(x => x.includes('-immune') && x.includes('Politoed')).length, 1);
			b.makeChoices('move 1, move 1 1', 'move 1 1, move 1');
			assert.equal(p.hp, Math.min(p.maxhp, hp + Math.round(p.baseMaxhp / 4)));
		} finally {
			b.destroy();
		}
	});
	it('uses Guardian Presence callbacks and field-aware Power Spot without self boost', () => {
		const b = battle();
		try {
			const p = b.p1.active[0], ally = b.p1.active[1], foe = b.p2.active[0], m = Dex.getActiveMove('tackle');
			assert.equal(b.runEvent('BasePower', ally, foe, m, 100), 130);
			assert.equal(b.runEvent('BasePower', p, foe, m, 100), 100);
			b.field.setTerrain('hauntedterrain', p);
			assert.equal(b.runEvent('BasePower', ally, foe, m, 100), 150);
			assert.equal(b.runEvent('ModifyDamage', foe, ally, m, 100), 75);
			assert.equal(b.runEvent('ModifyDamage', foe, p, m, 100), 100);
		} finally {
			b.destroy();
		}
	});
	it('suppresses active components and restores them afterwards', () => {
		const b = battle();
		try {
			const p = b.p1.active[0], ally = b.p1.active[1], foe = b.p2.active[0], m = Dex.getActiveMove('tackle');
			p.addVolatile('gastroacid');
			assert.equal(b.runEvent('BasePower', ally, foe, m, 100), 100);
			p.removeVolatile('gastroacid');
			assert.equal(b.runEvent('BasePower', ally, foe, m, 100), 130);
		} finally {
			b.destroy();
		}
	});
});

describe('Politoed event legality and calculator', () => {
	it('accepts the event choice through existing species eligibility', () => { const team = [{ species: 'Politoed', ability: 'Aevian King', moves: ['surf'], nature: 'Hardy', evs: { hp: 1 } }, { species: 'Mew', ability: 'Synchronize', moves: ['psychic'], nature: 'Hardy', evs: { hp: 1 } }]; assert.equal(TeamValidator.get('gen9nofielddoublesbattle').validateTeam(team), null); });
	it('retains Water Absorb field recovery', () => {
		const b = battle();
		try {
			const p = b.p1.active[0];
			p.hp -= 100;
			b.field.setTerrain('underwaterterrain', p);
			const hp = p.hp;
			b.makeChoices('move 1, move 1 1', 'move 3, move 1');
			assert.equal(p.hp - hp, Math.floor(p.baseMaxhp / 16));
		} finally {
			b.destroy();
		}
	});
	it('uses the same transformed form and damage in calculator and direct engine samples', () => {
		const c = require('../../../dist/sim/custom-calculator');
		const input = { format: 'gen9nofieldsinglesgame', move: 'Surf', samples: 8, seed: 42, actors: [{ species: 'Politoed', ability: 'Aevian King' }, ...Array.from({ length: 3 }, () => ({ species: 'Mew', ability: 'No Ability' }))] }, scenario = c.validateScenario(input), damage = [];
		for (let i = 0;
			i < 8;
			i++) {
			const { battle: b, mons } = c.buildCalculatorBattle(scenario, i);
			try {
				assert.equal(mons[0].species.id, 'politoedrejuv');
				const hp = mons[1].hp;
				b.actions.runMove(scenario.move, mons[0], mons[0].getLocOf(mons[1]));
				damage.push(hp - mons[1].hp);
			} finally {
				b.destroy();
			}
		} const result = c.calculateScenario(input).results[1];
		assert.equal(result.minNetLoss, Math.min(...damage));
		assert.equal(result.maxNetLoss, Math.max(...damage));
	});
});
