'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const approved = require('./kalos-alola-mega-approved.json');
approved.pyroarmega = 'flamebody';
let battle;
function setup(id, doubles = false) {
	const set = (species = 'Mew', ability = 'No Ability', item = '') => ({ species, ability, item, moves: ['splash', 'tackle', 'protect', 'moonblast'] });
	const s = Dex.species.get(id);
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [[set(s.baseSpecies, 'No Ability', s.requiredItem || s.requiredItems?.[0]), set()], [set(), set()]]);
	battle.makeChoices('team 12', 'team 12');
	const p = battle.p1.active[0], q = battle.p2.active[0];
	assert(battle.actions.runMegaEvo(p));
	assert.equal(p.species.id, id);
	for (const side of battle.sides) for (const mon of side.pokemon) mon.hp = mon.maxhp = mon.baseMaxhp = 1200;
	return [p, q];
}
describe('Approved Kalos Alola nine Mega migrations and Ultra damage removal', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('changes exactly nine passive records and no selected slots', () => {
		let count = 0;
		for (const old of require('./kalos-alola-mega-before.json')) {
			const s = Dex.species.get(old.id);
			assert.deepEqual(s.abilities, require('./passive-approval-overlays').abilities(old.id, {...old.abilities}), old.id);
			assert.deepEqual(s.passives, require('./passive-approval-overlays').current(old.id, old.passives), old.id);
			if (approved[old.id]) count++;
		}
		assert.equal(count, 9);
	});
	for (const [id, passive] of Object.entries(approved)) {
		it(id + ' calculator damage does not double a duplicate selected passive', () => {
			const { calculateScenario } = require('../../../dist/sim/custom-calculator');
			const input = { format: 'gen9nofieldsinglesgame', move: id === 'floettemega' ? 'Moonblast' : 'Surf', samples: 16, seed: 42,
				actors: [{ species: id, ability: 'No Ability' }, ...Array.from({ length: 3 }, () => ({ species: 'Mew', ability: 'No Ability' }))] };
			const expected = calculateScenario(input).results;
			input.actors[0].ability = Dex.abilities.get(passive).name;
			assert.deepEqual(calculateScenario(input).results, expected);
		});
		it(id + ' acquires its passive through real Mega evolution and Transform', () => {
			const [p, q] = setup(id);
			assert.deepEqual(p.getPassives(), [passive]);
			assert(p.getAbilityComponentExclusions().includes(passive));
			assert(q.transformInto(p));
			assert.deepEqual(q.getPassives(), [passive]);
			p.setAbility('No Ability');
			p.addVolatile('gastroacid');
			assert.deepEqual(p.getPassives(), [passive]);
		});
		it(id + ' does not remove shared components from an unrelated recipient', () => {
			const [p, q] = setup(id);
			q.setAbility(p.ability);
			assert.equal(q.getAbilityComponentExclusions().includes(passive), !!require('./selected-simplifications-approved.json').removed[p.ability]?.includes(passive));
		});
	}
	it('Pyroar starts Unnerve on Mega evolution and keeps it through ability replacement', () => {
		const [p, q] = setup('pyroarmega');
		assert.equal(battle.field.weather, 'sunnyday');
		q.setItem('sitrusberry');
		q.hp = 300;
		assert(q.eatItem()); q.setItem('sitrusberry');
		p.setAbility('No Ability');
		assert(q.eatItem());
		assert.equal(battle.runEvent('UseItem', q, null, null, Dex.items.get('elementalseed')), Dex.items.get('elementalseed'));
	});
	it('Fairy Aura boosts once across passive, active and shared Ange sources', () => {
		const [p, q] = setup('floettemega', true);
		battle.p1.active[1].setAbility('Fairy Aura');
		q.setAbility('Ange');
		for (const ability of ['Ange', 'Fairy Aura', 'No Ability']) {
			p.setAbility(ability);
			assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('moonblast'), 100), 133);
		}
	});
	it('Ange keeps the exact Mega form selector', () => {
		const [p, q] = setup('floettemega');
		for (const [id, expected] of [['charizardmegax', 100], ['charizardmegay', 100]]) {
			q.setSpecies(Dex.species.get(id));
			assert.equal(battle.runEvent('ModifyAtk', q, p, Dex.getActiveMove('tackle'), 100), expected);
		}
		q.setSpecies(Dex.species.get('Blastoise-Mega'));
		assert.equal(battle.runEvent('ModifyAtk', q, p, Dex.getActiveMove('tackle'), 100), 70);
	});
	it('Inversion keeps Inverse Field and Contrary reverses exactly once', () => {
		const [p] = setup('malamarmega');
		assert(battle.field.isTerrain('inverseterrain'));
		for (const ability of ['Inversion', 'Contrary', 'No Ability']) {
			p.setAbility(ability);
			p.boosts.atk = 0;
			battle.boost({ atk: 1 }, p, p);
			assert.equal(p.boosts.atk, -1);
		}
	});
	it('Divine Mockery loses Sniper but retains Hydra Bond and Water STAB', () => {
		const [p, q] = setup('barbaraclemega');
		assert.equal(p.boosts.accuracy, 0);
		assert(!p.hasAbility('sniper'));
		const move = Dex.getActiveMove('waterfall');
		battle.runEvent('ModifyMove', p, q, move, move);
		assert(move.forceSTAB);
		assert(move.ignoreAbility);
		assert.equal(move.multihit, 3);
		q.setAbility('Divine Mockery');
		assert.equal(q.boosts.accuracy, 0);
		assert(!q.hasAbility('sniper'));
		q.setAbility('Sniper');
		assert.equal(q.boosts.accuracy, 1);
	});
	it('Hawlucha passive No Guard works both ways and through semi-invulnerability', () => {
		const [p, q] = setup('hawluchamega');
		p.addVolatile('gastroacid');
		const move = Dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('Accuracy', q, p, move, 1), true);
		assert.equal(battle.runEvent('Accuracy', p, q, move, 1), true);
		assert.equal(battle.runEvent('Invulnerability', q, p, move), 0);
	});
	it('Frisk runs once on Mega evolution and retains the selected Echo Sense components', () => {
		const [p, q] = setup('noivernmega');
		assert(p.hasAbility('echofiend'));
		assert(p.hasAbility('telepathy'));
		assert(p.hasAbility('infiltrator'));
		q.setItem('leftovers');
		p.setAbility('Frisk');
		battle.log.length = 0;
		battle.runEvent('SwitchIn', p);
		assert.equal(battle.log.filter(x => x.includes('|-item|')).length, 1);
	});
	it('Salazzle keeps full Oblivious while selected Corrosion and Venom Ignition remain separate', () => {
		const [p, q] = setup('salazzlemega');
		assert(p.hasAbility('corrosion'));
		assert(p.hasAbility('venomignition'));
		q.status = 'psn';
		assert.equal(battle.runEvent('ModifyDamage', p, q, Dex.getActiveMove('flamethrower'), 100), 120);
		p.setAbility('No Ability');
		assert.equal(battle.runEvent('TryHit', p, q, Dex.getActiveMove('taunt')), null);
		battle.boost({ atk: -1 }, p, q, Dex.abilities.get('intimidate'));
		assert.equal(p.boosts.atk, 0);
	});
	it('Water Veil grants Aqua Ring on Mega evolution and retains status and weather protection', () => {
		const [p, q] = setup('golisopodmega');
		assert(p.volatiles.aquaring);
		assert(p.hasAbility('toughclaws'));
		assert(p.hasAbility('innerfocus'));
		p.setAbility('No Ability');
		assert(!p.trySetStatus('brn', q, Dex.moves.get('willowisp')));
		assert(!p.runStatusImmunity('sandstorm'));
		p.status = 'par';
		battle.field.terrain = 'watersurfaceterrain';
		battle.runEvent('Residual', p);
		assert.equal(p.status, '');
	});
	it('Drizzle owns rain, selected duration is eight and Water chip remains without rain', () => {
		const [p, q] = setup('drampamega');
		assert.equal(battle.field.weather, 'raindance');
		assert.equal(battle.field.weatherState.duration, 8);
		assert.equal(battle.log.filter(x => x.includes('|-weather|RainDance')).length, 1);
		battle.field.clearWeather();
		const hp = q.hp;
		battle.runEvent('Residual', p);
		assert.equal(hp - q.hp, 75);
		for (const id of ['thunderbolt', 'surf', 'airslash']) {
			const move = Dex.getActiveMove(id);
			battle.runEvent('ModifyMove', p, q, move, move);
			assert(move.forceSTAB);
		}
	});
	for (const ability of ['Ultra Ego', 'Perfect Ego', 'Burning Ego', 'Primal Ego', 'Unleashed Ego']) it(ability + ' loses authority damage bonuses but keeps reactive boosts and heals', () => {
		const [p, q] = setup('hawluchamega', true);
		p.setSpecies(Dex.species.get('Mew'));
		p.setAbility(ability);
		battle.p2.active[1].setAbility('Royal Decree');
		q.newlySwitched = true;
		const move = Dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('BasePower', p, q, move, 100), 100);
		const d = battle.runEvent('ModifyDamage', q, p, move, 100);
		assert.equal(d, 100);
		battle.p2.active[1].setAbility('No Ability');
		p.hp = 600;
		battle.runEvent('DamagingHit', p, q, move, 10);
		assert.equal(p.boosts.atk, 1);
		assert.equal(p.boosts.spa, 1);
		assert.equal(p.hp, 675);
		battle.runEvent('DamagingHit', p, q, move, 10);
		assert.equal(p.hp, 735);
		assert.equal(p.boosts.atk, 1);
	});
	it('retains standalone Battle Fervor authority damage effects', () => {
		const [p, q] = setup('hawluchamega', true);
		p.setAbility('Battle Fervor');
		battle.p2.active[1].setAbility('Royal Decree');
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 100), 130);
		assert.equal(battle.runEvent('ModifyDamage', q, p, Dex.getActiveMove('tackle'), 100), 70);
	});
});
