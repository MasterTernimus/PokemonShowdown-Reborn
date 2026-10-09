'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
let battle;
function setup(species) {
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
		[{ species, ability: Dex.species.get(species).abilities[0], moves: ['shadowball', 'flamethrower', 'gigadrain', 'protect'] }, { species: 'Mew', ability: 'No Ability', moves: ['tackle'] }],
		[{ species: 'Mew', ability: 'No Ability', moves: ['doublehit', 'seismictoss', 'protect', 'substitute'] }, { species: 'Mew', ability: 'No Ability', moves: ['tackle'] }],
	]);
	if (battle.requestState === 'teampreview')battle.makeChoices('team 12', 'team 12');
	const p = battle.p1.active[0], q = battle.p2.active[0];
	if (p.species.id !== Dex.species.get(species).id)p.formeChange(species, null, true);
	battle.field.terrain = ''; p.hp = p.maxhp = p.baseMaxhp = 10000; q.hp = q.maxhp = q.baseMaxhp = 10000;
	return [p, q];
}
function move(p, q, id) { battle.actions.useMove(id, p, { target: q }); battle.clearActiveMove(); }
describe('Approved Shadow Double and Crossfire', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('replaces only the approved selected slots and passives', () => {
		assert.equal(Dex.species.get('gengarmega').abilities[0], 'Shadow Double');
		assert.equal(Dex.species.get('scovillainmega').abilities[0], 'Crossfire');
		assert.deepEqual(Dex.species.get('gengarmega').passives, ['shadowtag']);
		assert.deepEqual(Dex.species.get('scovillainmega').passives, ['spicyspray']);
	});
	for (const species of ['Gengar-Mega', 'Scovillain-Mega', 'Lucario-Mega', 'Eevee-Starter']) {
		it('Illusion copies ' + species + ' selected ability and passive, then restores on reveal', () => {
			const set = (species, ability = 'No Ability') => ({ species, ability, moves: ['splash'] });
			battle = common.createBattle({ gameType: 'singles' }, [
				[set('Mew'), set('Zoroark', 'Illusion'), set(species, Dex.species.get(species).abilities[0])],
				[set('Mew')],
			]);
			const disguise = battle.p1.pokemon[2];
			if (disguise.species.id !== Dex.species.get(species).id) disguise.formeChange(species, null, true);
			battle.makeChoices('switch 2', 'move 1');
			const p = battle.p1.active[0], q = battle.p2.active[0];
			assert(p.illusion); assert.equal(p.ability, disguise.ability);
			assert.deepEqual(p.getPassives(), disguise.getPassives());
			move(q, p, 'watergun');
			assert(!p.illusion); assert.equal(p.ability, 'illusion');
			assert.deepEqual(p.getPassives(), Dex.species.get('zoroark').passives);
		});
	}
	it('arms only on opposing HP damage and survives ability swaps without refreshing', () => {
		const [p, q] = setup('Gengar-Mega'); q.addVolatile('substitute'); move(p, q, 'shadowball');
		assert(!p.volatiles.shadowdoublespent); q.removeVolatile('substitute'); move(p, q, 'shadowball');
		assert(p.volatiles.shadowdoublespent.armed);
		const m = Dex.getActiveMove('doublehit');
		assert.equal(battle.runEvent('ModifyDamage', q, p, m, 100), 56);
		assert.equal(battle.runEvent('ModifyDamage', q, p, m, 100), 56);
		assert.equal(battle.runEvent('ModifyDamage', q, p, Dex.getActiveMove('doublehit'), 100), 75);
		p.setAbility('No Ability'); p.setAbility('Shadow Double'); move(p, q, 'shadowball');
		assert.equal(p.volatiles.shadowdoublespent.armed, false);
	});
	it('does not spend its shield on fixed or residual damage', () => {
		const [p, q] = setup('Gengar-Mega'); move(p, q, 'shadowball');
		move(q, p, 'nightshade'); battle.damage(10, p, q, Dex.conditions.get('brn'));
		assert(p.volatiles.shadowdoublespent.armed);
	});
	it('suppresses only Shadow Double while Shadow Tag retains its reduction', () => {
		const [p, q] = setup('Gengar-Mega'); p.addVolatile('gastroacid'); move(p, q, 'shadowball');
		assert(!p.volatiles.shadowdoublespent);
		assert.equal(battle.runEvent('ModifyDamage', q, p, Dex.getActiveMove('doublehit'), 100), 75);
		assert(q.transformInto(p)); assert.deepEqual(q.getPassives(), ['shadowtag']);
	});
	it('alternates charges, repeats without a bonus, and never primes from a Substitute-only hit', () => {
		const [p, q] = setup('Scovillain-Mega'); q.addVolatile('substitute'); move(p, q, 'gigadrain');
		assert(!p.volatiles.crossfirecharge); q.removeVolatile('substitute'); move(p, q, 'gigadrain');
		assert.equal(p.volatiles.crossfirecharge.primedType, 'Fire');
		const repeat = Dex.getActiveMove('gigadrain'); battle.runEvent('ModifyMove', p, q, repeat, repeat);
		assert.equal(battle.runEvent('BasePower', p, q, repeat, 100), 100);
		const fire = Dex.getActiveMove('flamethrower'); battle.runEvent('ModifyMove', p, q, fire, fire);
		assert.equal(p.volatiles.crossfirecharge.primedType, '');
		assert.equal(battle.runEvent('BasePower', p, q, fire, 100), 120);
		assert.equal(battle.runEvent('BasePower', p, q, fire, 100), 120);
		battle.runEvent('DamagingHit', q, p, fire, 10);
		assert.equal(p.volatiles.crossfirecharge.primedType, 'Grass');
	});
	it('spends the primed attack on Protect without recharging', () => {
		const [p, q] = setup('Scovillain-Mega'); move(p, q, 'gigadrain'); q.addVolatile('protect');
		move(p, q, 'flamethrower');
		assert.equal(p.volatiles.crossfirecharge.primedType, '');
	});
	it('preserves Spicy Spray burn and one 1/16 heal under suppression without weather immunity', () => {
		const [p, q] = setup('Scovillain-Mega'); p.addVolatile('gastroacid'); p.hp = 5000;
		battle.runEvent('DamagingHit', p, q, Dex.getActiveMove('tackle'), 10); assert.equal(q.status, 'brn');
		battle.fieldEvent('Residual'); assert.equal(p.hp, 5625);
		assert.equal(battle.runEvent('Immunity', p, null, null, 'sandstorm'), 'sandstorm');
		assert(q.transformInto(p)); assert.deepEqual(q.getPassives(), ['spicyspray']);
	});
	it('applies Shadow Double to every hit of a real multihit move, then spends it', () => {
		const [p, q] = setup('Gengar-Mega'); p.setType(['Normal']); battle.randomizer = n => n;
		const attack = () => move(q, p, Object.assign(Dex.getActiveMove('doublehit'), { accuracy: true, willCrit: false }));
		let hp = p.hp; attack(); const ordinary = hp - p.hp;
		move(p, q, 'shadowball'); hp = p.hp; attack();
		const guarded = hp - p.hp;
		assert(guarded >= ordinary * 0.70 && guarded <= ordinary * 0.80, `${guarded}/${ordinary}`);
		hp = p.hp; attack(); assert.equal(hp - p.hp, ordinary);
	});
	it('clears once-entry shield and Crossfire charges on actual switching', () => {
		const [p, q] = setup('Scovillain-Mega'); move(p, q, 'gigadrain');
		assert(p.volatiles.crossfirecharge); battle.makeChoices('switch 2', 'move 3');
		assert(!p.volatiles.crossfirecharge);
		battle.destroy();
		battle = null;
		const [g, t] = setup('Gengar-Mega'); move(g, t, 'shadowball');
		battle.makeChoices('switch 2', 'move 3'); assert(!g.volatiles.shadowdoublespent);
	});
});
