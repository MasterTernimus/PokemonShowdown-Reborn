'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const approved = require('./paldea-mega-approved.json');
let battle;
function setup(id, doubles = false) {
	const s = Dex.species.get(id);
	const mon = (species = 'Mew', ability = 'No Ability', item = '') => ({ species, ability, item, moves: ['splash', 'surf', 'protect', 'tackle'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [[mon(s.battleOnly || s.baseSpecies, 'No Ability', s.requiredItem), mon()], [mon(), mon()]]);
	battle.makeChoices('team 12', 'team 12');
	const p = battle.p1.active[0], q = battle.p2.active[0];
	assert(battle.actions.runMegaEvo(p));
	assert.equal(p.species.id, id);
	for (const side of battle.sides) for (const mon of side.pokemon) mon.hp = mon.maxhp = mon.baseMaxhp = 1200;
	return [p, q];
}
describe('Approved six Paldea Mega passive migrations', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('changes exactly six approved passive records without selected-slot or base-form changes', () => {
		let count = 0;
		for (const old of require('./paldea-mega-before.json')) {
			const s = Dex.species.get(old.id);
			assert.deepEqual(s.abilities, require('./passive-approval-overlays').abilities(old.id, {...old.abilities}), old.id);
			assert.deepEqual(s.passives, require('./passive-approval-overlays').current(old.id, old.passives), old.id);
			if (approved[old.id]) count++;
		}
		assert.equal(count, 6);
		assert.deepEqual(Dex.species.get('Baxcalibur').passives, ['entrenched']);
	});
	for (const [id, passive] of Object.entries(approved)) {
		it(id + ' uses real Mega evolution and Transform, with passives surviving selected suppression', () => {
			const [p, q] = setup(id);
			assert.deepEqual(p.getPassives(), [passive]);
			assert(p.getAbilityComponentExclusions().includes(passive));
			assert(q.transformInto(p));
			assert.deepEqual(q.getPassives(), [passive]);
			p.setAbility('No Ability');
			p.addVolatile('gastroacid');
			assert.deepEqual(p.getPassives(), [passive]);
		});
		it(id + ' calculator damage applies a duplicate selected primitive only once', () => {
			const { calculateScenario } = require('../../../dist/sim/custom-calculator');
			const input = { format: 'gen9nofieldsinglesgame', move: 'Surf', samples: 16, seed: 42,
				actors: [{ species: id, ability: 'No Ability' }, ...Array.from({ length: 3 }, () => ({ species: 'Mew', ability: 'No Ability' }))] };
			const expected = calculateScenario(input).results;
			input.actors[0].ability = Dex.abilities.get(passive).name;
			assert.deepEqual(calculateScenario(input).results, expected);
		});
		it(id + ' leaves the extracted primitive in shared packages on nonrecipients', () => {
			const [p, q] = setup(id);
			q.setAbility(p.ability);
			assert(!q.getAbilityComponentExclusions().includes(passive));
		});
	}
	it('Arboliva starts Grassy Surge once and retains Hospitality without Invigorate', () => {
		const [p, q] = setup('arbolivamega', true), ally = battle.p1.active[1];
		assert(battle.field.isTerrain('grassyterrain'));
		assert(!p.hasAbility('invigorate'));
		assert(p.hasAbility('hospitality'));
		assert(p.hasAbility('friendguard'));
		ally.hp = 300;
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(ally.hp, 600);
		assert.equal(battle.heal(100, ally, ally), 100);
		assert.equal(battle.runEvent('ModifyDamage', q, ally, Dex.getActiveMove('tackle'), 100), 75);
		ally.status = 'par';
		battle.randomChance = () => true;
		battle.singleEvent('Residual', p.getAbility(), p.abilityState, p);
		assert.equal(ally.status, 'par');
		q.setAbility('Verdant Sanctuary');
		assert(!q.hasAbility('invigorate'));
		q.setAbility('Invigorate');
		q.hp = 300;
		assert.equal(battle.heal(100, q, q), 130);
	});
	it('Bellibolt keeps Thick Fat and Dry Skin while Levitate survives suppression and respects grounding', () => {
		const [p, q] = setup('belliboltmega');
		assert(!p.isGrounded());
		assert(p.hasAbility('thickfat'));
		assert(p.hasAbility('dryskin'));
		assert.equal(battle.runEvent('ModifyAtk', q, p, Dex.getActiveMove('firepunch'), 100), 50);
		assert.equal(battle.runEvent('BasePower', q, p, Dex.getActiveMove('firepunch'), 100), 125);
		p.hp = 300;
		assert.equal(battle.runEvent('TryHit', p, q, Dex.getActiveMove('surf')), null);
		assert.equal(p.hp, 600);
		battle.field.setWeather('raindance');
		battle.singleEvent('Weather', p.getAbility(), p.abilityState, p, null, Dex.conditions.get('raindance'));
		assert.equal(p.hp, 750);
		p.addVolatile('gastroacid');
		assert(!p.isGrounded());
		battle.field.addPseudoWeather('gravity', p);
		assert(p.isGrounded());
	});
	for (const id of ['tatsugiricurlymega', 'tatsugiridroopymega', 'tatsugiristretchymega']) {
		it(id + ' reverses boosts once and retains one nonstacking ally critical charge', () => {
			const [p, q] = setup(id, true), ally = battle.p1.active[1], move = Dex.getActiveMove('surf');
			battle.boost({ spa: -1 }, p, p);
			assert.equal(p.boosts.spa, 1);
			battle.runEvent('DamagingHit', q, p, move, 10);
			assert(!ally.volatiles.mastercourse);
			battle.runEvent('AfterMove', p, q, move);
			assert(ally.volatiles.mastercourse);
			battle.runEvent('DamagingHit', q, p, move, 10);
			assert.equal(battle.runEvent('ModifyCritRatio', ally, q, move, 0), 1);
			battle.runEvent('AfterMove', ally, q, Dex.getActiveMove('splash'));
			assert(ally.volatiles.mastercourse);
			battle.runEvent('AfterMove', ally, q, move);
			assert(!ally.volatiles.mastercourse);
			p.setAbility('Contrary');
			battle.boost({ atk: -1 }, p, p);
			assert.equal(p.boosts.atk, 1);
		});
	}
	it('Baxcalibur extracts full Thermal Exchange while retaining Ice Body and Stalwart', () => {
		const [p, q] = setup('baxcaliburmega');
		assert(p.hasAbility('icebody'));
		assert(p.hasAbility('stalwart'));
		const move = Dex.getActiveMove('surf');
		battle.runEvent('ModifyMove', p, q, move, move);
		assert(move.tracksTarget);
		for (const ability of ['Glacial Heart', 'Thermal Exchange', 'No Ability']) {
			p.setAbility(ability);
			p.boosts.atk = 0;
			battle.runEvent('DamagingHit', p, q, Dex.getActiveMove('flamethrower'), 10);
			assert.equal(p.boosts.atk, 1);
			assert(!p.trySetStatus('brn', q, Dex.moves.get('willowisp')));
			p.status = 'brn';
			battle.runEvent('Update', p);
			assert.equal(p.status, '');
		}
		p.setAbility('Glacial Heart');
		p.hp = 600;
		battle.field.terrain = 'icyterrain';
		battle.runEvent('Residual', p);
		assert.equal(p.hp, 675);
		for (const terrain of ['superheatedterrain', 'dragonsdenterrain', 'burningterrain', 'volcanicterrain']) {
			p.boosts.atk = 0;
			battle.field.terrain = terrain;
			battle.runEvent('Residual', p);
			assert.equal(p.boosts.atk, 1, terrain);
		}
	});
	it('Master Course grants a self-charge after the whole multihit move, then can recharge', () => {
		const [p] = setup('tatsugiricurlymega');
		p.moveSlots[1].id = 'watershuriken';
		p.moveSlots[1].move = 'Water Shuriken';
		const seen = [], original = battle.actions.getDamage;
		battle.actions.getDamage = function (source, target, move, ...rest) {
			if (source === p) seen.push(!!p.volatiles.mastercourse);
			return original.call(this, source, target, move, ...rest);
		};
		battle.makeChoices('move 2', 'move 1');
		assert(seen.length >= 2);
		assert(seen.every(x => !x));
		assert(p.volatiles.mastercourse);
		seen.length = 0;
		battle.makeChoices('move 2', 'move 1');
		assert(seen.length >= 2);
		assert(seen.every(Boolean));
		assert(p.volatiles.mastercourse);
		battle.makeChoices('move 1', 'move 1');
		assert(p.volatiles.mastercourse, 'status move preserves charge');
		battle.makeChoices('move 4', 'move 3');
		assert(!p.volatiles.mastercourse, 'protected damaging move consumes charge');
	});
	for (const mode of ['miss', 'immunity', 'substitute', 'ally']) it('Master Course does not charge from ' + mode, () => {
		const [p, q] = setup('tatsugiricurlymega', mode === 'ally');
		if (mode !== 'ally') p.addVolatile('mastercourse');
		if (mode === 'miss') p.boosts.accuracy = -6;
		if (mode === 'immunity') q.setAbility('Water Absorb');
		if (mode === 'substitute') q.addVolatile('substitute');
		if (mode === 'ally') {
			const ally = battle.p1.active[1], move = Dex.getActiveMove('surf');
			battle.runEvent('DamagingHit', ally, p, move, 10);
			battle.runEvent('AfterMove', p, ally, move);
			assert(!p.volatiles.mastercourse && !ally.volatiles.mastercourse);
		} else {
			if (mode === 'miss') battle.randomChance = () => false;
			battle.makeChoices('move 2', 'move 1');
			assert(!p.volatiles.mastercourse);
		}
	});
	it('Master Course chooses the surviving recipient at completion and shares the turn limit', () => {
		const [p, q] = setup('tatsugiridroopymega', true), ally = battle.p1.active[1];
		const move = Dex.getActiveMove('surf');
		battle.runEvent('DamagingHit', q, p, move, 10);
		ally.hp = 0;
		ally.fainted = true;
		battle.runEvent('AfterMove', p, q, move);
		assert(p.volatiles.mastercourse);
		p.removeVolatile('mastercourse');
		battle.runEvent('DamagingHit', q, p, move, 10);
		battle.runEvent('AfterMove', p, q, move);
		assert(!p.volatiles.mastercourse);
		battle.turn++;
		battle.runEvent('DamagingHit', q, p, move, 10);
		battle.runEvent('AfterMove', p, q, move);
		assert(p.volatiles.mastercourse);
		p.clearVolatile();
		assert(!p.volatiles.mastercourse);
	});
});
