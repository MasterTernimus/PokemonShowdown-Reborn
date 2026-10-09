'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
let battle;
function setup(species = 'Pidgeot-Mega', ability = 'Storm Sovereign') {
	const set = (species, ability) => ({ species, ability, moves: ['airslash', 'splash', 'fly', 'protect'] });
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[set(species, ability)], [set('Mew', 'No Ability')]]);
	battle.makeChoices('team 1', 'team 1');
	const p = battle.p1.active[0], q = battle.p2.active[0];
	if (p.species.id !== Dex.species.get(species).id) p.formeChange(species, null, true);
	battle.field.terrain = '';
	for (const m of [p, q]) m.hp = m.maxhp = m.baseMaxhp = 2000;
	return [p, q];
}
describe('Mega Pidgeot No Guard replacement', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('changes only the approved passive and no selected slot or base form', () => {
		for (const old of require('./pidgeot-no-guard-before.json')) {
			const s = Dex.species.get(old.id);
			assert.deepEqual(s.abilities, require('./passive-approval-overlays').abilities(old.id, {...old.abilities}), old.id);
			assert.deepEqual(s.passives, require('./passive-approval-overlays').current(old.id, old.passives), old.id);
		}
	});
	it('acquires No Guard through actual Mega evolution', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species: 'Pidgeot', ability: 'Keen Eye', item: 'Pidgeotite', moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		const p = battle.p1.active[0];
		assert.equal(p.species.id, 'pidgeotmega');
		assert.equal(p.ability, 'stormsovereign');
		assert.deepEqual(p.getPassives(), ['noguard']);
		assert(!p.hasAbilityOrPassive('galewings'));
	});
	for (const state of ['normal', 'gastroacid', 'neutralizinggas', 'abilityswap']) {
		it('No Guard controls both directions under ' + state, () => {
			const [p, q] = setup();
			if (state === 'gastroacid') p.addVolatile('gastroacid');
			if (state === 'neutralizinggas') q.setAbility('Neutralizing Gas');
			if (state === 'abilityswap') p.setAbility('No Ability');
			const move = Dex.getActiveMove('zapcannon');
			for (const [source, target] of [[p, q], [q, p]]) {
				assert.equal(battle.runEvent('Accuracy', target, source, move, 1), true);
				target.addVolatile('fly');
				assert.equal(battle.runEvent('Invulnerability', target, source, move), 0);
				const hp = target.hp;
				battle.actions.useMove('swift', source, { target });
				assert(target.hp < hp, 'actual attack hits through Fly');
				target.removeVolatile('fly');
			}
		});
	}
	for (const terrain of ['', 'mountainterrain', 'snowymountainterrain', 'coldeclipseterrain', 'mirrorarenaterrain']) {
		it('has no hidden Gale Wings priority on ' + (terrain || 'no field'), () => {
			const [p, q] = setup();
			battle.field.terrain = terrain;
			for (const hp of [2000, 1000]) {
				p.hp = hp;
				for (const id of ['airslash', 'swift']) assert.equal(battle.runEvent('ModifyPriority', p, q, Dex.getActiveMove(id), 0), 0);
			}
		});
	}
	it('selected callbacks retain Keen Eye but do not force accuracy or invulnerability', () => {
		const [p, q] = setup(), move = Dex.getActiveMove('airslash');
		battle.singleEvent('ModifyMove', p.getAbility(), p.abilityState, move, p, q);
		assert.equal(move.accuracy, 95);
		assert.equal(move.ignoreEvasion, true);
		assert.equal(p.getAbility().onAnyAccuracy, undefined);
		assert.equal(p.getAbility().onAnyInvulnerability, undefined);
		battle.boost({ accuracy: -1 }, p, q);
		assert.equal(p.boosts.accuracy, 0);
	});
	it('retains replaceable eight-turn Strong Winds and Mirror Arena Keen Eye entry', () => {
		const [p] = setup();
		battle.field.terrain = 'mirrorarenaterrain';
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(battle.field.weather, 'deltastream');
		assert.equal(battle.field.weatherState.duration, 8);
		assert.equal(p.boosts.accuracy, 1);
		assert(p.volatiles.laserfocus);
		assert(battle.field.setWeather('raindance', p));
	});
	it('copied Storm Sovereign retains outgoing accuracy and Gale Wings, without incoming No Guard', () => {
		const [p, q] = setup('Mew');
		assert.deepEqual(p.getPassives(), ['synchronize']);
		const move = Dex.getActiveMove('airslash');
		battle.runEvent('ModifyMove', p, q, move, move);
		assert.equal(move.accuracy, true);
		assert.equal(battle.runEvent('ModifyPriority', p, q, move, 0), 1);
		assert.equal(battle.runEvent('Accuracy', p, q, move, 1), 1);
		q.addVolatile('fly');
		assert.equal(battle.runEvent('Invulnerability', q, p, Dex.getActiveMove('swift')), false);
		p.addVolatile('gastroacid');
		const suppressed = Dex.getActiveMove('airslash');
		battle.runEvent('ModifyMove', p, q, suppressed, suppressed);
		assert.equal(suppressed.accuracy, 95);
		assert.equal(battle.runEvent('ModifyPriority', p, q, suppressed, 0), 0);
	});
	it('Transform acquires No Guard while copying just the selected ability does not', () => {
		const [p, q] = setup();
		q.setAbility(p.ability);
		assert.deepEqual(q.getPassives(), ['synchronize']);
		q.transformInto(p);
		assert.deepEqual(q.getPassives(), ['noguard']);
		assert.equal(battle.runEvent('ModifyPriority', q, p, Dex.getActiveMove('airslash'), 0), 0);
	});
	it('other No Guard species retain copied Gale Wings priority and component identity', () => {
		const [p, q] = setup('Raichu-Mega-Y');
		p.setAbility('Storm Sovereign');
		assert.deepEqual(p.getPassives(), ['noguard']);
		assert.equal(battle.runEvent('ModifyPriority', p, q, Dex.getActiveMove('airslash'), 0), 1);
		assert(p.hasAbility('galewings'));
		const { getAbilityDisplayComponents } = require('../../../dist/data/ability-display');
		assert.deepEqual(getAbilityDisplayComponents('stormsovereign', ['noguard'], 'pidgeotmega'), ['keeneye']);
		assert(getAbilityDisplayComponents('stormsovereign', ['noguard'], 'raichumegay').includes('galewings'));
	});
	it('calculator metadata and resolved damage remain unchanged by accuracy-only extraction', () => {
		const { calculateScenario, calculatorMetadata } = require('../../../dist/sim/custom-calculator');
		assert.deepEqual(calculatorMetadata().species.find(s => s.name === 'Pidgeot-Mega').passives, ['noguard']);
		const actors = [{ species: 'Pidgeot-Mega', ability: 'Storm Sovereign' }, { species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }];
		const input = { format: 'gen9nofieldsinglesgame', move: 'Air Slash', samples: 16, seed: 42, actors };
		const selected = calculateScenario(input);
		actors[0].ability = 'No Ability';
		const passiveOnly = calculateScenario(input);
		assert.deepEqual(selected.resolved.actors[0].passives, ['noguard']);
		assert.deepEqual(selected.results, passiveOnly.results);
	});
});
