'use strict';
const assert = require('assert').strict, common = require('../../common'), { Dex } = require('../../../dist/sim');
const approved = require('./latest-passives-approved.json');
let battle;
function setup(species = 'Krookodile', ability = 'Vendetta') {
	const mon = (species = 'Chansey', ability = 'No Ability') => ({ species, ability, moves: ['tackle', 'splash', 'protect', 'bugbite'] });
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[mon(species, ability), mon()], [mon(), mon()]]);
	battle.makeChoices('team 12', 'team 12');
	battle.field.terrain = '';
	battle.randomizer = n => n;
	for (const side of battle.sides)
		for (const p of side.pokemon)
			p.hp = p.maxhp = p.baseMaxhp = 1000;
	return [battle.p1.active[0], battle.p2.active[0]];
}
function hit(p, t, id = 'tackle', extra = {}, finish = true) {
	const m = Object.assign(Dex.getActiveMove(id), { accuracy: true, willCrit: false, damage: 40 }, extra);
	battle.actions.useMove(m, p, { target: t });
	if (finish)
		battle.runEvent('AfterMove', p, t, m);
	battle.clearActiveMove();
	return m;
}
describe('Latest explicit passive approvals and redesigned abilities', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	it('matches the reviewed 963-holder registry and all selected slots', () => {
		const expected = { ...approved.previousPassives };
		for (const [passive, ids] of Object.entries(approved.groups))
			for (const id of ids)
				expected[id] = [passive];
		require('./passive-approval-overlays').passives(expected);
		assert.deepEqual(require('../../../dist/data/species-passives').SpeciesPassives, expected);
		assert.equal(Object.keys(expected).length, 963);
		for (const [id, slot, , name] of approved.slots)
			assert.equal(Dex.species.get(id).abilities[slot], require('./passive-approval-overlays').abilities(id, { [slot]: name })[slot], id);
		for (const [id, abilities] of Object.entries(approved.priorAbilities)) {
			const expected = { ...abilities };
			for (const [s, slot, , name] of approved.slots)
				if (s === id)
					expected[slot] = name;
			assert.deepEqual(Dex.species.get(id).abilities, require('./passive-approval-overlays').abilities(id, expected), id);
		}
	});
	for (const [passive, ids] of Object.entries(approved.groups))
		for (const id of ids)
			it(id + ' has exactly ' + passive, () => assert.deepEqual(Dex.species.get(id).passives, require('./passive-approval-overlays').current(id, [passive])));
	it('preserves the reviewed later approvals for held species and related forms', () => {
		for (const id of ['salamence', 'gardevoir', 'rhyperior', 'conkeldurr', 'excadrill', 'excadrillmega', 'meowsticf', 'meowsticfmega', 'kingambit', 'baxcalibur', 'glimmora', 'glimmoramega', 'probopass', 'roserade', 'roserademega', 'gyaradosaevian', 'gyaradosaevianmega', 'miloticaevian', 'miloticterajuma', 'granbullreborn'])
			if (Dex.species.get(id).exists && !Object.values(require('./settled-passives-approved.json').groups).flat().includes(id))
				assert.deepEqual(Dex.species.get(id).passives, require('./passive-approval-overlays').current(id, approved.previousPassives[id] || []), id);
		assert.deepEqual(Dex.species.get('garchompmega').passives, ['sharpness']);
		for (const s of Dex.species.all()) assert(!Object.values(s.abilities).includes('Uproot'), s.id);
	});
	it('Steady Aim blocks only external accuracy drops under suppression', () => {
		const [p, t] = setup('Clawitzer');
		p.addVolatile('gastroacid');
		battle.boost({ accuracy: -1 }, p, t, Dex.moves.get('sandattack'));
		assert.equal(p.boosts.accuracy, 0);
		battle.boost({ accuracy: -1 }, p, null, Dex.conditions.get('gravity'));
		assert.equal(p.boosts.accuracy, 0);
		battle.boost({ accuracy: -1 }, p, p, Dex.moves.get('splash'));
		assert.equal(p.boosts.accuracy, -1);
		const m = Dex.getActiveMove('tackle');
		battle.runEvent('ModifyMove', p, t, m, m);
		assert(!m.ignoreEvasion);
		assert.equal(m.accuracy, 100);
	});
	it('Vendetta Taunts a surviving attacker once per entry, including multihit attacks', () => {
		const [p, t] = setup(); hit(t, p, 'tackle', { multihit: 3 });
		assert(p.volatiles.vendettaspent); assert(t.volatiles.taunt); assert.equal(p.hp, 880);
		assert(!p.volatiles.vendetta); assert(!t.volatiles.vendettatrap);
		t.removeVolatile('taunt'); hit(t, p); assert(!t.volatiles.taunt);
	});
	for (const protection of ['Aroma Veil', 'Oblivious'])it('Vendetta spends its attempt against ' + protection, () => {
		const [p, t] = setup();
		t.setAbility(protection);
		hit(t, p);
		assert(p.volatiles.vendettaspent);
		assert(!t.volatiles.taunt);
		t.setAbility('No Ability'); hit(t, p); assert(!t.volatiles.taunt);
	});
	for (const state of ['gastroacid', 'replacement', 'gas'])it('Vendetta does not refresh its allowance after ' + state, () => {
		const [p, t] = setup();
		hit(t, p);
		assert(t.volatiles.taunt);
		t.removeVolatile('taunt');
		if (state === 'replacement')p.setAbility('Pressure'); else if (state === 'gas')t.setAbility('Neutralizing Gas'); else p.addVolatile('gastroacid');
		hit(t, p); assert(!t.volatiles.taunt);
		p.removeVolatile('gastroacid');
		t.setAbility('No Ability');
		p.setAbility('Vendetta');
		hit(t, p);
		assert(p.volatiles.vendettaspent); assert(!t.volatiles.taunt);
	});
	it('Vendetta resets its allowance on a real switch', () => {
		const [p, t] = setup();
		hit(t, p);
		assert(t.volatiles.taunt);
		t.removeVolatile('taunt');
		battle.makeChoices('switch 2', 'move splash'); battle.makeChoices('switch 2', 'move splash');
		assert(!p.volatiles.vendettaspent); hit(t, p); assert(t.volatiles.taunt);
	});
	it('Vendetta ignores Substitute-only damage, allied damage and fatal hits', () => {
		const [p, t] = setup();
		p.addVolatile('substitute', p);
		hit(t, p);
		assert(!p.volatiles.vendettaspent);
		p.removeVolatile('substitute'); hit(p, p); assert(!p.volatiles.vendettaspent);
		hit(t, p, 'tackle', { damage: 10000 }); assert(!p.volatiles.vendettaspent); assert(!t.volatiles.taunt);
	});
	it('Vendetta does not trap Ghosts or grant a retaliation damage multiplier', () => {
		const [p, t] = setup();
		t.setType('Ghost');
		hit(t, p);
		hit(p, t, 'crunch');
		assert.equal(t.hp, 960);
		battle.runEvent('TrapPokemon', t); assert(!t.trapped);
	});
	it('Silk Sights Disables a previously slowed foe only once per entry and only on success', () => {
		const [p, t] = setup('Galvantula', 'Silk Sights');
		t.lastMove = Dex.getActiveMove('tackle');
		hit(p, t, 'bugbite');
		assert(!t.volatiles.disable);
		t.boosts.spe = -1;
		t.setAbility('Aroma Veil');
		hit(p, t, 'bugbite');
		assert(!p.volatiles.silksightsspent);
		t.setAbility('No Ability');
		hit(p, t, 'bugbite');
		assert(t.volatiles.disable);
		assert.equal(t.volatiles.disable.duration, 2);
		assert(p.volatiles.silksightsspent);
		t.removeVolatile('disable');
		p.setAbility('Pressure');
		p.setAbility('Silk Sights');
		hit(p, t, 'bugbite');
		assert(!t.volatiles.disable);
	});
	it('Silk Sights does not trigger from Substitute or Speed lowered by the same attack', () => {
		const [p, t] = setup('Galvantula', 'Silk Sights');
		t.lastMove = Dex.getActiveMove('tackle');
		hit(p, t, 'strugglebug', { secondaries: [{ chance: 100, boosts: { spe: -1 } }] });
		assert(!t.volatiles.disable);
		t.boosts.spe = -1;
		t.addVolatile('substitute', t);
		hit(p, t, 'bugbite');
		assert(!t.volatiles.disable);
	});
	// Uproot's former ability mechanics are superseded by the approved signature-move tests.
 it('Uproot is a move rather than a selectable ability', () => {
  assert(!Dex.abilities.get('uproot').exists);
  assert(Dex.moves.get('uproot').exists);
  assert(!Object.values(Dex.species.get('venusaur').abilities).includes('Uproot'));
 });
 it('preserves Vendetta without unrelated components, residuals or damage modifiers', () => {
		assert.deepEqual(require('../../../dist/data/ability-components').AbilityComponents.vendetta, ['innerfocus']);
  assert(!Dex.abilities.get('vendetta').onResidual);
  assert(!Dex.abilities.get('vendetta').onDamage);
 });
});
