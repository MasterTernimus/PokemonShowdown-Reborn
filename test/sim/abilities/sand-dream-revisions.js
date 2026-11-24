'use strict';
const assert = require('assert').strict;
const common = require('../../common');
describe('Sand, dream and signature move revisions', () => {
	let b;
	const mon = (species, ability, moves = ['splash']) => ({ species, ability, moves });
	function start(holder, ally = mon('Mew', 'No Ability'), enemy = mon('Mew', 'No Ability')) {
		b = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [[holder, ally], [enemy, mon('Mew', 'No Ability')]]);
		b.makeChoices('team 12', 'team 12');
		return [b.p1.active[0], b.p1.active[1], b.p2.active[0]];
	}
	afterEach(() => b?.destroy());
	it('shares Sand Force power with an ally and heals Gigalith in sand', () => {
		const [p, a, t] = start(mon('Gigalith', 'Dune Chorus'));
		b.field.setWeather('sandstorm', p);
		const m = b.dex.getActiveMove('rockslide');
		for (const attacker of [p, a]) assert.equal(b.runEvent('BasePower', attacker, t, m, 100), 130);
		a.setAbility('sandforce');
		assert.equal(b.runEvent('BasePower', a, t, m, 100), 130);
		p.hp = 1; b.fieldEvent('Residual'); assert(p.hp > 1);
	});
	it('lets sleeping Musharna act and Rest makes both foes drowsy', () => {
		const [p,,t] = start(mon('Musharna', 'Dream Refuge', ['rest', 'dreameater']));
		p.hp = 10; b.actions.useMove('rest', p, { target: p });
		assert.equal(p.status, 'slp'); assert(t.volatiles.yawn); assert(b.p2.active[1].volatiles.yawn);
		const hp = t.hp; b.actions.runMove('dreameater', p, p.getLocOf(t)); assert(t.hp < hp);
	});
	it('weakens Octolocked enemy attacks only while the trapper is active', () => {
		const [p,,t] = start(mon('Grapploct', 'Regenerator'));
		t.addVolatile('octolock', p); const m = b.dex.getActiveMove('pound');
		assert.equal(b.runEvent('ModifyDamage', t, p, m, 100), 60);
		t.removeVolatile('octolock'); assert.equal(b.runEvent('ModifyDamage', t, p, m, 100), 100);
		assert(p.hasAbilityOrPassive('infiltrator')); assert(p.hasAbilityOrPassive('suctioncups'));
	});
	it('gives Drampa Friend Guard and Berserk with Dragonize selected', () => {
		const [p, a, t] = start(mon('Drampa', 'Dragonize'));
		assert(p.hasAbilityOrPassive('berserk'));
		assert.equal(b.runEvent('ModifyDamage', t, a, b.dex.getActiveMove('tackle'), 100), 75);
		p.hp = Math.ceil(p.maxhp / 2) + 1; b.actions.useMove('tackle', t, { target: p }); assert.equal(p.boosts.spa, 1);
	});
	it('gives Toucannon defense and Egg Bomb power and protects its queued Beak Blast', () => {
		const [p,,t] = start(mon('Toucannon', 'Skill Link', ['beakblast', 'eggbomb']));
		for (const event of ['ModifyDef', 'ModifySpD']) assert.equal(b.runEvent(event, p, t, null, 100), 125);
		assert.equal(b.runEvent('BasePower', p, t, b.dex.getActiveMove('eggbomb'), 100), 130);
		const m = b.dex.getActiveMove('tackle'); b.queue.addChoice({ choice: 'move', pokemon: p, moveid: 'beakblast' });
		assert.equal(b.runEvent('ModifyDamage', t, p, m, 100), 70);
		p.addVolatile('beakblast'); assert.equal(b.runEvent('ModifyDamage', t, p, m, 100), 50);
	});
	it('gives only Mega Skarmory the 90-power Steel Wing and a single paired 30% roll', () => {
		const [p, a, t] = start(mon('Skarmory', 'Sturdy', ['steelwing']), mon('Skarmory', 'Sturdy', ['steelwing']));
		p.formeChange('Skarmory-Mega', b.dex.items.get('skarmorite'), true);
		for (const user of [p, a]) {
			const m = b.dex.getActiveMove('steelwing');
			b.singleEvent('ModifyMove', m, null, user, t, m, m);
			assert.equal(m.basePower, user === p ? 90 : 80);
			assert.equal(m.secondaries[0].chance, 30);
			assert.deepEqual(m.secondaries[0].self.boosts, user === p ? { def: 1, spd: 1 } : { def: 1 });
		}
	});
	it('takes the lower of two enemy rolls with Fortunate Wing', () => {
		const [p,,t] = start(mon('Mew', 'Fortunate Wing'));
		const m = b.dex.getActiveMove('pound'); let calls = 0;
		b.randomizer = n => (++calls === 1 ? n : Math.floor(n * 0.85));
		const damage = b.actions.modifyDamage(100, t, p, m); assert.equal(calls, 2);
		b.randomizer = n => Math.floor(n * 0.85);
		assert.equal(b.actions.modifyDamage(100, t, p, m), damage);
	});
});
