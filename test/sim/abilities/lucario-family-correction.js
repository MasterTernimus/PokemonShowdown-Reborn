'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
let battle;
function start(species = 'Lucario-Mega-Z', doubles = false) {
	const set = (species, ability = 'No Ability') => ({ species, ability, moves: ['tackle', 'splash', 'aurasphere', 'protect'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9doublesrockyfield' : 'gen9nofieldsinglesgame' }, [
		[set(species, Dex.species.get(species).abilities[0]), set('Mew')], [set('Mew'), set('Mew')],
	]);
	battle.makeChoices('team 12', 'team 12');
	const p = battle.p1.active[0], q = battle.p2.active[0];
	if (p.species.id !== Dex.species.get(species).id) p.formeChange(species, null, true);
	battle.field.terrain = '';
	for (const side of battle.sides) for (const mon of side.pokemon) mon.hp = mon.maxhp = mon.baseMaxhp = 1600;
	return [p, q];
}
describe('Corrected Lucario family ability release', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('retains all three base choices and isolated Mega passives', () => {
		assert.deepEqual(Dex.species.get('lucario').abilities, { 0: 'Carry On', 1: 'Convergence', H: 'Armorize' });
		assert.deepEqual(Dex.species.get('lucario').passives, ['mindseye']);
		assert.deepEqual(Dex.species.get('lucariomega').abilities, { 0: 'Insight' });
		assert.deepEqual(Dex.species.get('lucariomega').passives, ['adaptability']);
		assert.deepEqual(Dex.species.get('lucariomegaz').abilities, { 0: 'Aura Precision' });
		assert.deepEqual(Dex.species.get('lucariomegaz').passives, ['auraguard']);
	});
	it('uses all Z components without Technician and respects suppression', () => {
		const [p] = start();
		for (const id of ['ultrainstinct', 'shielddust', 'mindseye']) assert(p.hasAbility(id), id);
		assert(!p.hasAbility('technician'));
		assert(!p.addVolatile('flinch'));
		p.addVolatile('gastroacid');
		assert(!p.hasAbility('mindseye')); assert(!p.hasAbility('shielddust'));
	});
	it('blocks enemy secondaries without deleting attacker self effects', () => {
		const [p, q] = start();
		const secondaries = [{ chance: 100, status: 'par' }, { chance: 100, self: { boosts: { atk: 1 } } }];
		const out = battle.runEvent('ModifySecondaries', p, q, Dex.getActiveMove('thunderbolt'), secondaries);
		assert(out.every(s => s.self));
	});
	it('lets Fighting hit Ghost and reveals opposing Illusions', () => {
		const [p, q] = start(); q.setType('Ghost');
		const move = Dex.getActiveMove('aurasphere'); battle.runEvent('ModifyMove', p, q, move, move);
		assert(move.ignoreImmunity === true || move.ignoreImmunity?.Fighting);
		q.illusion = q.side.pokemon[1];
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(q.illusion, null);
	});
	it('retains Ultra Instinct whole-attack recovery exactly once and no residual Mind Eye heal', () => {
		const [p, q] = start(); p.hp = 800;
		battle.actions.useMove('tackle', p, { target: q });
		assert.equal(p.hp, 900);
		battle.runEvent('Residual', p); assert.equal(p.hp, 900);
	});
	it('gives normal Mega Convergence and Inner Focus with its Adaptability passive', () => {
		const [p] = start('Lucario-Mega', true), ally = battle.p1.active[1];
		assert(!p.hasAbility('ultraego'));
		assert(!p.hasAbility('telepathy'));
		assert(p.hasAbility('convergence'));
		assert(p.hasAbility('keeneye'));
		assert(p.hasAbility('innerfocus'));
		assert(!p.addVolatile('flinch')); battle.boost({ atk: -1 }, p, battle.p2.active[0], battle.dex.abilities.get('intimidate')); assert.equal(p.boosts.atk, 0);
		assert(!p.hasAbility('dualwield')); assert(!p.hasAbility('secondwind'));
		const hp = p.hp; battle.actions.useMove('tackle', ally, { target: p }); assert(p.hp < hp);
		const speed = p.getStat('spe'); battle.field.setTerrain('psychicterrain', p);
		assert.equal(p.getStat('spe'), speed);
	});
	it('reads opposing HP hits by category and opponent', () => {
		const [p,q] = start('Lucario-Mega', true), other = battle.p2.active[1];
		battle.randomizer = damage => damage;
		const damage = (target, id) => battle.actions.getDamage(p,target,Object.assign(Dex.getActiveMove(id),{willCrit:false}));
		const special = damage(q,'swift'), physical = damage(q,'tackle');
		q.boosts.def = q.boosts.spd = other.boosts.spd = 4;
		const hit = (id) => battle.actions.useMove(Object.assign(Dex.getActiveMove(id),{willCrit:false}),p,{target:q});
		assert(damage(q,'swift') < special);
		hit('tackle');
		assert.equal(damage(q,'swift'),special);
		assert(damage(other,'swift') < special);
		assert(damage(q,'tackle') < physical);
		hit('watergun');
		assert.equal(damage(q,'tackle'),physical);
		assert(damage(q,'swift') < special);
	});
	for (const side of ['p1', 'p2']) it('clears Aura Reading when ' + side + ' switches out and returns', () => {
		const [p,q] = start('Lucario-Mega');
		const special = () => battle.actions.getDamage(p,q,Object.assign(Dex.getActiveMove('aurasphere'),{willCrit:false}));
		battle.randomizer = damage => damage;
		q.boosts.spd = 4;
		const guarded = special();
		battle.actions.useMove('tackle',p,{target:q});
		assert(special() > guarded);
		for (let i = 0; i < 2; i++) battle.makeChoices(side === 'p1' ? 'switch 2' : 'move splash', side === 'p2' ? 'switch 2' : 'move splash');
		assert.equal(battle.p1.active[0],p); assert.equal(battle.p2.active[0],q);
		q.boosts.spd = 4;
		assert.equal(special(),guarded);
	});
	for (const species of ['Lucario-Mega', 'Lucario-Mega-Z']) it('uses the corrected ability after real evolution into ' + species, () => {
		const s = Dex.species.get(species);
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species: 'Lucario', ability: 'Carry On', item: s.requiredItem, moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('team 1', 'team 1'); const p = battle.p1.active[0];
		assert(battle.actions.runMegaEvo(p)); assert.equal(p.species.id, s.id);
		assert.equal(p.ability, Dex.abilities.get(s.abilities[0]).id); assert.deepEqual(p.getPassives(), s.passives);
	});
});
