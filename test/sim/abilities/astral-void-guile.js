'use strict';const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
describe('Aegis Flame Serene Grace replacement', () => {
	let battle;
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	function setup() {
		const m = { species: 'Mew', ability: 'No Ability', moves: ['splash', 'tackle', 'thunderwave', 'spikes', 'earthquake'] };
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ ...m, species: 'Delphox-Mega', ability: 'Aegis Flame' }, m], [m, m]]);
		battle.makeChoices('team 12', 'team 12');
		for (const s of battle.sides) for (const p of s.pokemon)p.hp = p.maxhp = p.baseMaxhp = 4800;
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	it('has only Mega Delphox holder and preserves its passive and other components', () => {
		const [p] = setup();
		for (const id of ['levitate', 'magicguard', 'serenegrace'])assert(p.hasAbility(id));
		for (const id of ['magicbounce', 'voidguile', 'magician', 'infiltrator']) assert(!p.hasAbility(id));
		assert.deepEqual(p.getPassives(), ['proficient']);
		assert.deepEqual(Dex.species.all().filter(s => Object.values(s.abilities).includes('Aegis Flame')).map(s => s.id), ['delphoxmega']);
	});
it('does not reflect direct status or hazards',()=>{const[p,q]=setup();battle.actions.runMove('thunderwave',q,q.getLocOf(p));assert.equal(p.status,'par');assert.equal(q.status,'');battle.actions.runMove('spikes',q,q.getLocOf(p));assert(p.side.sideConditions.spikes);assert(!q.side.sideConditions.spikes);});
	it('respects Substitute and does not steal items', () => {
		const [p, q] = setup();
		q.setItem('Leftovers');
		q.addVolatile('substitute');
		const hp = q.hp, sub = q.volatiles.substitute.hp;
		battle.actions.runMove('tackle', p, p.getLocOf(q));
		assert.equal(q.hp, hp);
		assert(q.volatiles.substitute.hp < sub);
		assert.equal(p.item, '');
		assert.equal(q.item, 'leftovers');
	});
it('respects normal theft eligibility',()=>{const[p,q]=setup();p.setItem('Sitrus Berry');q.setItem('Leftovers');battle.actions.runMove('tackle',p,p.getLocOf(q));assert.equal(q.item,'leftovers');assert.equal(p.item,'sitrusberry');});
	it('uses only Magic Guard entry bonuses', () => {
		const [p] = setup();
		for (const [terrain, spa, spd] of [['fairytaleterrain', 0, 1], ['newworldterrain', 0, 0], ['hauntedterrain', 0, 0], ['mirrorarenaterrain', 0, 0]]) {
			p.clearBoosts();
			battle.field.terrain = terrain;
			battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
			assert.equal(p.boosts.spa, spa);
			assert.equal(p.boosts.spd, spd);
			assert.equal(p.boosts.evasion, 0);
		}
	});
	it('does not retain Void Guile accuracy effects', () => {
		const [p, q] = setup();
		battle.field.terrain = 'psychicterrain';
		assert.equal(battle.runEvent('ModifyAccuracy', p, q, Dex.getActiveMove('thunderwave'), 90), 90);
	});
	it('doubles secondary chances exactly once and blocks indirect damage', () => {
		const [p, q] = setup();
		const move = Dex.getActiveMove('flamethrower');
		const base = move.secondaries[0].chance;
		battle.runEvent('ModifyMove', p, q, move, move);
		assert.equal(move.secondaries[0].chance, base * 2);
		const hp = p.hp;
		assert(!battle.damage(100, p, q, 'brn'));
		assert.equal(p.hp, hp);
	});
it('suppression removes new mechanics and Mold Breaker bypasses retained Levitate',()=>{const[p,q]=setup();p.addVolatile('gastroacid');const m=Dex.getActiveMove('tackle');battle.runEvent('ModifyMove',p,q,m,m);assert(!m.infiltrates);p.removeVolatile('gastroacid');const hp=p.hp;battle.actions.runMove('earthquake',q,q.getLocOf(p));assert.equal(p.hp,hp);q.setAbility('Mold Breaker');battle.actions.runMove('earthquake',q,q.getLocOf(p));assert(p.hp<hp);});
});
