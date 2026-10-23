'use strict';
const assert = require('assert').strict, { Battle, Dex } = require('../../../dist/sim');
function setup(ability = 'No Ability', foeAbility = 'No Ability') {
	const b = new Battle({ formatid: 'gen9nofieldsinglesgame', seed: [1, 2, 3, 4], p1: { name: 'A', team: [{ species: 'Garchomp', ability, moves: ['splash'] }] }, p2: { name: 'B', team: [{ species: 'Mew', ability: foeAbility, moves: ['doublehit', 'glare', 'splash'] }] } });
	if (b.requestState === 'teampreview')b.makeChoices('team 1', 'team 1');
	return b;
}describe('Serrated Scales base Garchomp passive', () => {
	it('changes only base Garchomp and preserves selectable abilities', () => {
		assert.deepEqual(Dex.species.get('garchomp').passives, ['serratedscales']);
		assert.deepEqual(Dex.species.get('garchompmega').passives, ['sandforce']);
		assert.deepEqual(Dex.species.get('garchompbattlebond').passives, ['roughskin']);
		assert.deepEqual(Dex.species.get('garchomp').abilities, { 0: 'Grounded Instinct', 1: 'Supreme Overlord', H: 'Void Wrath', S: 'Battle Bond' });
	});
	for (const ability of ['No Ability', 'Rough Skin', 'Serrated Scales'])it('retaliates exactly once per contact hit with selected ' + ability, () => {
		const b = setup(ability);
		try {
			const p = b.p1.active[0], q = b.p2.active[0], hp = q.hp;
			const m = Dex.getActiveMove('doublehit');
			m.accuracy = true;
			b.actions.useMove(m, q, p);
			assert.equal(hp - q.hp, 2 * Math.floor(q.baseMaxhp / 8));
		} finally {
			b.destroy();
		}
	});
	it('respects Thorn Tempered contact exemption', () => {
		const b = setup('No Ability', 'Thorn Tempered');
		try {
			const p = b.p1.active[0], q = b.p2.active[0], hp = q.hp;
			const m = Dex.getActiveMove('doublehit');
			m.accuracy = true;
			b.actions.useMove(m, q, p);
			assert.equal(q.hp, hp);
		} finally {
			b.destroy();
		}
	});
	it('prevents and cures paralysis while the selected ability is suppressed', () => {
		const b = setup();
		try {
			const p = b.p1.active[0], q = b.p2.active[0];
			p.addVolatile('gastroacid');
			assert.equal(p.trySetStatus('par', q, Dex.moves.get('glare')), false);
			p.status = 'par';
			p.statusState = b.initEffectState({ id: 'par', target: p });
			b.eachEvent('Update');
			assert.equal(p.status, '');
		} finally {
			b.destroy();
		}
	});
	it('blocks opposing Speed drops but retains self drops and item slowdowns', () => {
		const b = setup();
		try {
			const p = b.p1.active[0], q = b.p2.active[0];
			b.boost({ spe: -1 }, p, q, Dex.moves.get('scaryface'));
			assert.equal(p.boosts.spe, 0);
			b.boost({ spe: -1 }, p, p, Dex.moves.get('curse'));
			assert.equal(p.boosts.spe, -1);
			p.boosts.spe = 0;
			const speed = p.getStat('spe');
			p.setItem('ironball');
			assert.equal(p.getStat('spe'), Math.floor(speed / 2));
		} finally {
			b.destroy();
		}
	});
	it('retains field slowdown immunity via the Limber component', () => {
		const b = setup();
		try {
			const p = b.p1.active[0];
			assert(p.hasAbilityOrPassive('limber'));
			const speed = p.getStat('spe');
			b.field.setTerrain('icyterrain', p);
			assert.equal(p.getStat('spe'), speed);
		} finally {
			b.destroy();
		}
	});
	it('lets ability bypass reach Limber without bypassing Rough Skin', () => {
		const b = setup('No Ability', 'Mold Breaker');
		try {
			const p = b.p1.active[0], q = b.p2.active[0];
			const m = Dex.getActiveMove('glare');
			m.ignoreAbility = true;
			b.setActiveMove(m, q, p);
			assert(!p.hasAbilityOrPassive('limber'));
			assert(p.trySetStatus('par', q, m));
			b.clearActiveMove();
			b.eachEvent('Update');
			assert.equal(p.status, '');
			const hp = q.hp, hit = Dex.getActiveMove('doublehit');
			hit.accuracy = true;
			hit.ignoreAbility = true;
			b.actions.useMove(hit, q, p);
			assert.equal(hp - q.hp, 2 * Math.floor(q.baseMaxhp / 8));
		} finally {
			b.destroy();
		}
	});
});

describe('Serrated Scales calculator parity', () => {
	it('matches contact recoil and target damage across eight simulator samples', () => {
		const c = require('../../../dist/sim/custom-calculator'), input = { format: 'gen9nofieldsinglesgame', move: 'Double Hit', samples: 8, seed: 42, actors: [{ species: 'Mew', ability: 'No Ability' }, { species: 'Garchomp', ability: 'Void Wrath' }, ...Array.from({ length: 2 }, () => ({ species: 'Mew', ability: 'No Ability' }))] }, scenario = c.validateScenario(input), loss = [[], []];
		for (let i = 0;
			i < 8;
			i++) {
			const { battle: b, mons } = c.buildCalculatorBattle(scenario, i);
			try {
				assert.deepEqual(mons[1].getPassives(), ['serratedscales']);
				const hp = mons.slice(0, 2).map(p => p.hp);
				b.actions.runMove(scenario.move, mons[0], mons[0].getLocOf(mons[1]));
				for (let n = 0;
					n < 2;
					n++)loss[n].push(hp[n] - mons[n].hp);
			} finally {
				b.destroy();
			}
		} const r = c.calculateScenario(input);
		for (let n = 0;
			n < 2;
			n++) {
			assert.equal(r.results[n].minNetLoss, Math.min(...loss[n]));
			assert.equal(r.results[n].maxNetLoss, Math.max(...loss[n]));
		}
	});
});
