'use strict';
const assert = require('assert').strict, common = require('../../common');
const { Dex } = require('../../../dist/sim/dex');
const { AbilityComponents } = require('../../../dist/data/ability-components');
describe('Toxic Bloom Poison drain', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(ability = 'No Ability', item = '') {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Venusaur-Mega', ability: 'Toxic Bloom', item, moves: ['sludgebomb', 'splash'] }],
			[{ species: 'Mew', ability, moves: ['splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1'); battle.randomChance = () => false; battle.randomizer = x => x;
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	function hit(p, t, extra = {}) {
		const move = battle.dex.getActiveMove('sludgebomb');
		Object.assign(move, { basePower: 30, accuracy: true, willCrit: false, secondaries: undefined }, extra);
		const before = t.hp; battle.actions.runMove(move, p, p.getLocOf(t)); return before - t.hp;
	}
	it('inherits Proficient and Thick Fat once through Pollen Bloom', () => {
		const [p, t] = setup(); assert.deepEqual(AbilityComponents.toxicbloom, ['pollenbloom', 'selfsufficient']);
		const damage = (source, target, id) => {
			const move = battle.dex.getActiveMove(id);
			move.willCrit = false;
			return battle.actions.getDamage(source, target, move);
		};
		const outgoing = damage(p, t, 'tackle'), incoming = damage(t, p, 'flamethrower');
		p.setAbility('Pollen Bloom'); assert.equal(damage(p, t, 'tackle'), outgoing); assert.equal(damage(t, p, 'flamethrower'), incoming);
		assert(p.hasAbility('proficient')); assert(p.hasAbility('thickfat'));
		assert.equal(Dex.species.all().filter(s => Object.values(s.abilities).includes('Toxic Bloom')).map(s => s.id).join(','), 'venusaurmega');
	});
	it('heals 25% actual HP damage with normal rounding and missing-HP cap', () => {
		const [p, t] = setup();
		p.hp = 100;
		const dealt = hit(p, t);
		assert.equal(p.hp, 100 + Math.round(dealt / 4));
		p.hp = p.maxhp - 1;
		t.hp = t.maxhp;
		hit(p, t);
		assert.equal(p.hp, p.maxhp);
		p.hp = 100;
		t.hp = 4;
		hit(p, t);
		assert.equal(p.hp, 101);
	});
	it('uses Heal Block, Liquid Ooze and Big Root', () => {
		for (const mode of ['block', 'ooze', 'root']) {
			const [p, t] = setup(mode === 'ooze' ? 'Liquid Ooze' : 'No Ability', mode === 'root' ? 'Big Root' : '');
			p.hp = 100; if (mode === 'block') p.addVolatile('healblock', t);
			const dealt = hit(p, t), drain = Math.round(dealt / 4);
			if (mode === 'block') assert.equal(p.hp, 100);
			else if (mode === 'ooze') assert.equal(p.hp, 100 - drain);
			else assert(p.hp > 100 + drain);
			battle.destroy(); battle = null;
		}
	});
	it('does not add native drain twice or heal from Substitute-only, miss, Protect, immunity or residual', () => {
		for (const mode of ['native', 'sub', 'miss', 'protect', 'immune', 'residual']) {
			const [p, t] = setup(); p.hp = 100;
			if (mode === 'sub') t.addVolatile('substitute');
			if (mode === 'protect') t.addVolatile('protect');
			if (mode === 'immune') t.setType('Steel');
			const dealt = mode === 'residual' ? battle.damage(20, t, p, battle.dex.conditions.get('psn')) :
				hit(p, t, mode === 'native' ? { drain: [1, 2] } : mode === 'miss' ? { accuracy: 0 } : {});
			assert.equal(p.hp, mode === 'native' ? 100 + Math.round(dealt / 2) : 100, mode);
			battle.destroy(); battle = null;
		}
	});
});
