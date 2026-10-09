'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const { SpeciesPassives } = require('../../../dist/data/species-passives');
const before = require('./dancer-passives-before.json');
let battle;
function setup(id, ability = Dex.species.get(id).abilities[0], doubles = false, foe = 'No Ability') {
	const mon = (species = 'Mew', ability = 'No Ability') => ({ species, ability, moves: ['splash', 'dragondance', 'relicsong', 'waterpulse'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [[mon(id, ability), mon(), mon('Blissey')], [mon('Mew', foe), mon(), mon('Chansey')]]);
	battle.makeChoices('team 123', 'team 123');
	battle.field.terrain = '';
	battle.randomChance = (n, d) => n >= d;
	for (const side of battle.sides) for (const p of side.pokemon) p.hp = p.maxhp = p.baseMaxhp = 10000;
	return [battle.p1.active[0], battle.p2.active[0], battle.p1.active[1]];
}
function use(id, source, target, extra = {}) {
	const move = Dex.getActiveMove(id); Object.assign(move, { accuracy: true, willCrit: false }, extra);
	battle.actions.useMove(move, source, { target });
	battle.clearActiveMove();
}
describe('Approved eleven dancer passives and Anchored Battery extension', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('adds Own Tempo to exactly eleven forms, retaining every prior passive, slot, stat, type and move', () => {
		const expected = JSON.parse(JSON.stringify(before.previousPassives));
		for (const id of before.forms) expected[id] = [...(expected[id] || []), 'owntempo'];
		for (const id of require('../../../dist/data/species-passives').RelicArmorPassiveForms) expected[id] = [...(expected[id] || []), 'relicarmor'];
		for (const [passive, ids] of Object.entries(require('./kanto-johto-before.json').groups)) for (const id of ids) expected[id] = [...(expected[id] || []), passive];
		for (const [passive, ids] of Object.entries(require('./regional-passives-approved.json').groups)) for (const id of ids) expected[id] = [...(expected[id] || []), passive];
		require('./passive-approval-overlays').passives(expected);
		assert.deepEqual(SpeciesPassives, expected);
		assert.equal(Object.keys(expected).length, 820);
		for (let old of before.species) {
			const s = Dex.species.get(old.id);
			if (old.id === 'ludicolo') old = { ...old, abilities: { ...old.abilities, H: 'Rain Dish' } }; for (const key of ['abilities', 'baseStats', 'types']) assert.deepEqual(s[key], old[key], old.id + key);
			assert.deepEqual(Dex.species.getLearnsetData(old.id).learnset, old.learnset);
		}
		assert.deepEqual(Dex.species.get('quaquaval').passives, ['torrent']);
		for (const id of ['lotad', 'lombre', 'petilil', 'oddish', 'gloom', 'quaxly', 'quaxwell', 'meloettamega']) assert(!Dex.species.get(id).passives.includes('owntempo'));
	});
	for (const id of before.forms.filter(id => id !== 'quaquaval')) it(id + ' blocks confusion and Intimidate through suppression and copying only the active ability', () => {
		const [p, t] = setup(id);
		for (const state of ['normal', 'gastroacid', 'meridianseal', 'gas', 'replacement']) {
			if (state === 'gas') t.setAbility('Neutralizing Gas'); else if (state === 'replacement') {
				t.setAbility('No Ability');
				p.setAbility('Pressure');
			} else if (state !== 'normal') p.addVolatile(state);
			use('confuseray', t, p);
			assert(!p.volatiles.confusion);
			battle.boost({ atk: -1 }, p, t, Dex.abilities.get('intimidate'));
			assert.equal(p.boosts.atk, 0);
			if (['gastroacid', 'meridianseal'].includes(state)) p.removeVolatile(state);
		}
		t.setAbility('Pressure');
		use('skillswap', p, t);
		assert(p.getPassives().includes('owntempo'));
		assert.deepEqual(t.getPassives(), ['synchronize']);
	});
	for (const shield of [false, true]) it('Own Tempo respects attack-scoped bypass with Ability Shield = ' + shield, () => {
		const [p, t] = setup('Ludicolo', 'Pressure', false, 'Mold Breaker');
		p.addVolatile('gastroacid'); if (shield) p.setItem('Ability Shield');
		use('confuseray', t, p);
		assert.equal(!!p.volatiles.confusion, !shield);
		battle.eachEvent('Update');
		assert(!p.volatiles.confusion);
	});
	it('Transform adopts target passives and switch reversion restores the original form', () => {
		const [p, t] = setup('Meloetta');
		assert(t.transformInto(p));
		assert.deepEqual(t.getPassives(), ['owntempo']);
		assert(p.transformInto(battle.p2.pokemon[1]));
		assert.deepEqual(p.getPassives(), ['synchronize']);
		battle.makeChoices('switch 3', 'move splash');
		battle.makeChoices('switch 3', 'move splash');
		assert.deepEqual(p.getPassives(), ['owntempo']);
	});
	it('Relic Song changes both Meloetta forms while keeping Serene Grace and Own Tempo', () => {
		const [p] = setup('Meloetta');
		battle.makeChoices('move relicsong', 'move splash');
		assert.equal(p.species.id, 'meloettapirouette');
		assert.equal(p.ability, 'serenegrace');
		assert.deepEqual(p.getPassives(), ['owntempo']);
		battle.makeChoices('move relicsong', 'move splash');
		assert.equal(p.species.id, 'meloetta');
		assert.deepEqual(p.getPassives(), ['owntempo']);
	});
	it('Illusion copies the disguise and does not keep actual-species Own Tempo', () => {
		const [p, t] = setup('Ludicolo', 'Pressure');
		p.illusion = battle.p1.pokemon[2];
		const start = battle.log.length;
		use('confuseray', t, p);
		assert(p.volatiles.confusion);
		assert(!battle.log.slice(start).join('\n').includes('Own Tempo'));
	});
	for (const id of ['lilligant', 'lilliganthisui']) it(id + ' keeps Noble Dance Dancer and Hospitality with no borrowed Own Tempo', () => {
		const [p, t, ally] = setup(id, 'Noble Dance', true);
		assert(p.hasAbility('dancer'));
		assert(p.hasAbility('hospitality'));
		assert(!p.hasAbility('owntempo'));
		ally.hp = 5000;
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(ally.hp, 7500);
		battle.makeChoices('move splash, move splash', 'move dragondance, move splash');
		assert.equal(p.boosts.atk, 1);
		assert.equal(p.boosts.spe, 1);
		const a = p.getAbility(); for (const key of ['onUpdate', 'onTryAddVolatile', 'onHit', 'onTryBoost']) assert(!a[key]);
		p.formeChange('Mew', null, true);
		use('confuseray', t, p);
		assert(p.volatiles.confusion);
	});
	it('unapproved ordinary Own Tempo holders retain their active protection', () => {
		const [p, t] = setup('Slowpoke', 'Own Tempo');
		assert.deepEqual(p.getPassives(), []);
		use('confuseray', t, p);
		assert(!p.volatiles.confusion);
	});
	for (const move of ['waterpulse', 'aurasphere', 'bulletseed']) it('Anchored Battery rewards one actual ' + move + ' hit once per entry', () => {
		const [p, t] = setup('Octillery', 'Anchored Battery');
		use(move, p, t, { basePower: 1, ...(move === 'bulletseed' ? { multihit: 5 } : {}) });
		assert.equal(t.boosts.spe, -1);
		assert(p.volatiles.anchoredbatteryspent);
		use(move, p, t, { basePower: 1 });
		assert.equal(t.boosts.spe, -1);
		p.setAbility('Pressure');
		p.setAbility('Anchored Battery');
		use(move, p, t, { basePower: 1 });
		assert.equal(t.boosts.spe, -1);
		battle.makeChoices('switch 3', 'move splash');
		battle.makeChoices('switch 3', 'move splash');
		use(move, p, t, { basePower: 1 });
		assert.equal(t.boosts.spe, -2);
	});
	for (const reason of ['miss', 'protect', 'immunity', 'substitute', 'zero', 'ally', 'nonpulse', 'suppression']) it('Anchored Battery preserves its budget after ' + reason, () => {
		const [p, t, ally] = setup('Octillery', 'Anchored Battery', true);
		const target = reason === 'ally' ? ally : t;
		if (reason === 'protect' || reason === 'substitute') target.addVolatile(reason, target);
		if (reason === 'immunity') t.setAbility('Water Absorb'); if (reason === 'suppression') p.addVolatile('gastroacid');
		if (reason === 'zero') battle.onEvent('Damage', battle.format, (damage, victim) => victim === target ? 0 : damage);
		use(reason === 'nonpulse' ? 'tackle' : 'waterpulse', p, target, { basePower: 1, ...(reason === 'miss' ? { accuracy: 0 } : {}) });
		assert.equal(target.boosts.spe, 0);
		assert(!p.volatiles.anchoredbatteryspent);
	});
	it('Anchored Battery handles spread only once and obeys normal stat-drop protection', () => {
		const [p, t] = setup('Octillery', 'Anchored Battery', true);
		t.setAbility('Clear Body');
		use('waterpulse', p, t, { basePower: 1, target: 'allAdjacentFoes' });
		assert.equal(t.boosts.spe, 0);
		assert.equal(battle.p2.active[1].boosts.spe, 0);
		assert(p.volatiles.anchoredbatteryspent);
	});
	it('calculator publishes all Own Tempo forms and executes the Octillery Speed drop once', () => {
		const { calculatorMetadata, calculateScenario } = require('../../../dist/sim/custom-calculator');
		const metadata = calculatorMetadata();
		for (const id of before.forms) assert.deepEqual(metadata.species.find(s => Dex.species.get(s.name).id === id).passives, SpeciesPassives[id]);
		const input = { format: 'gen9nofieldsinglesgame', move: 'Water Pulse', samples: 8, seed: 42, actors: Array.from({ length: 4 }, () => ({ species: 'Mew', ability: 'No Ability' })) };
		input.actors[0] = { species: 'Octillery', ability: 'Anchored Battery' };
		assert.equal(calculateScenario(input).exampleLog.filter(l => l.startsWith('|-unboost|') && l.includes('|spe|1')).length, 1);
	});
});
