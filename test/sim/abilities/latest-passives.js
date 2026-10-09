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
function prime(p, t) {
	hit(t, p);
	assert.equal(p.volatiles.vendetta.mark, t);
}
describe('Latest explicit passive approvals and redesigned abilities', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	it('matches the entire approved 820-holder registry and all selected slots', () => {
		const expected = { ...approved.previousPassives };
		for (const [passive, ids] of Object.entries(approved.groups))
			for (const id of ids)
				expected[id] = [passive];
		require('./passive-approval-overlays').passives(expected);
		assert.deepEqual(require('../../../dist/data/species-passives').SpeciesPassives, expected);
		assert.equal(Object.keys(expected).length, 820);
		for (const [id, slot, , name] of approved.slots)
			assert.equal(Dex.species.get(id).abilities[slot], name, id);
		for (const [id, abilities] of Object.entries(approved.priorAbilities)) {
			const expected = { ...abilities };
			for (const [s, slot, , name] of approved.slots)
				if (s === id)
					expected[slot] = name;
			if (id === 'venusaur')
				expected.S = 'Uproot';
			assert.deepEqual(Dex.species.get(id).abilities, require('./passive-approval-overlays').abilities(id, expected), id);
		}
	});
	for (const [passive, ids] of Object.entries(approved.groups))
		for (const id of ids)
			it(id + ' has exactly ' + passive, () => assert.deepEqual(Dex.species.get(id).passives, require('./passive-approval-overlays').current(id, [passive])));
	it('leaves all held species and excluded related forms untouched', () => {
		for (const id of ['salamence', 'gardevoir', 'rhyperior', 'conkeldurr', 'excadrill', 'excadrillmega', 'meowsticf', 'meowsticfmega', 'kingambit', 'baxcalibur', 'glimmora', 'glimmoramega', 'probopass', 'roserade', 'roserademega', 'gyaradosaevian', 'gyaradosaevianmega', 'miloticaevian', 'miloticterajuma', 'granbullreborn'])
			if (Dex.species.get(id).exists && !Object.values(require('./settled-passives-approved.json').groups).flat().includes(id))
				assert.deepEqual(Dex.species.get(id).passives, require('./passive-approval-overlays').current(id, approved.previousPassives[id] || []), id);
		assert.deepEqual(Dex.species.get('garchompmega').passives, ['sandforce']);
		for (const s of Dex.species.all())
			if (Object.values(s.abilities).includes('Uproot'))
				assert.equal(s.id, 'venusaur');
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
	it('Vendetta marks only after the whole move and retaliates once with normal trapping', () => {
		const [p, t] = setup();
		const m = hit(t, p, 'tackle', { multihit: 3 }, false);
		assert(!p.volatiles.vendetta.mark);
		battle.runEvent('AfterMove', t, p, m);
		assert.equal(p.volatiles.vendetta.mark, t);
		battle.randomChance = () => false;
		hit(p, t, 'crunch', { accuracy: 1 });
		assert.equal(t.hp, 960);
		assert(!p.volatiles.vendetta.mark);
		assert(t.volatiles.vendettatrap);
		assert.equal(t.volatiles.vendettatrap.duration, 2);
		assert.equal(p.boosts.atk, 0);
		assert.equal(p.hp, 880);
		hit(t, p);
		assert(!p.volatiles.vendetta.mark);
	});
	for (const blocked of ['protect', 'substitute', 'immunity', 'semi'])
		it('Vendetta consumes retaliation without bypassing ' + blocked, () => {
			const [p, t] = setup();
			prime(p, t);
			if (blocked === 'protect')
				t.addVolatile('protect', t);
			if (blocked === 'substitute')
				t.addVolatile('substitute', t);
			if (blocked === 'immunity')
				t.setType('Flying');
			if (blocked === 'semi')
				t.addVolatile('fly', t);
			const hp = t.hp;
			hit(p, t, blocked === 'immunity' ? 'stompingtantrum' : 'crunch', { accuracy: 1 });
			assert(!p.volatiles.vendetta.mark);
			assert(!t.volatiles.vendettatrap);
			assert.equal(t.hp, hp);
		});
	it('Vendetta does not spend on an attack of the wrong type or a spread move', () => {
		const [p, t] = setup();
		prime(p, t);
		hit(p, t, 'tackle');
		assert.equal(p.volatiles.vendetta.mark, t);
		hit(p, t, 'earthquake');
		assert.equal(p.volatiles.vendetta.mark, t);
	});
	for (const state of ['gastroacid', 'replacement', 'gas'])
		it('Vendetta clears its mark for ' + state + ' without refreshing its entry allowance', () => {
			const [p, t] = setup();
			prime(p, t);
			if (state === 'replacement')
				p.setAbility('Pressure');
			else if (state === 'gas')
				t.setAbility('Neutralizing Gas');
			else
				p.addVolatile('gastroacid');
			battle.runEvent('Update', p);
			assert(!p.volatiles.vendetta.mark);
			p.removeVolatile('gastroacid');
			t.setAbility('No Ability');
			p.setAbility('Vendetta');
			hit(t, p);
			assert(!p.volatiles.vendetta.mark);
			assert(p.volatiles.vendetta.spent);
		});
	it('Vendetta expires at end of following turn and clears when the marked foe leaves', () => {
		const [p, t] = setup();
		prime(p, t);
		battle.fieldEvent('Residual');
		assert.equal(p.volatiles.vendetta.mark, t);
		battle.turn++;
		battle.fieldEvent('Residual');
		assert(!p.volatiles.vendetta.mark);
		p.clearVolatile();
		p.isActive = true;
		p.setAbility('Vendetta');
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		prime(p, t);
		battle.runEvent('SwitchOut', t);
		assert(!p.volatiles.vendetta.mark);
	});
	it('Vendetta ignores Substitute-only damage, allied damage and fatal hits', () => {
		const [p, t] = setup();
		p.addVolatile('substitute', p);
		hit(t, p);
		assert(!p.volatiles.vendetta.spent);
		p.removeVolatile('substitute');
		hit(p, p);
		assert(!p.volatiles.vendetta.spent);
		hit(t, p, 'tackle', { damage: 10000 });
		assert(!p.volatiles.vendetta?.spent);
	});
	it('Vendetta uses ordinary Ghost escape rules', () => {
		const [p, t] = setup();
		prime(p, t);
		t.setType('Ghost');
		hit(p, t, 'crunch');
		battle.runEvent('TrapPokemon', t);
		assert(!t.trapped);
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
	it('Uproot lowers Sp. Def once per target per turn and only drains already-weakened targets', () => {
		const [p, t] = setup('Venusaur', 'Uproot');
		p.hp = 500;
		hit(p, t, 'vinewhip', { multihit: 3 });
		assert.equal(t.boosts.spd, -2);
		assert.equal(p.hp, 500);
		hit(p, t, 'vinewhip');
		assert.equal(t.boosts.spd, -2);
		assert.equal(p.hp, 510);
		battle.turn++;
		hit(p, t, 'vinewhip');
		assert.equal(t.boosts.spd, -4);
		assert.equal(p.hp, 520);
	});
	it('Uproot caps drain per turn across ability changes and does not add drain to Giga Drain', () => {
		const [p, t] = setup('Venusaur', 'Uproot');
		p.hp = 100;
		t.boosts.spd = -1;
		t.hp = t.maxhp = 10000;
		hit(p, t, 'vinewhip', { damage: 1200 });
		assert.equal(p.hp, 350);
		p.setAbility('Pressure');
		p.setAbility('Uproot');
		hit(p, t, 'vinewhip', { damage: 400 });
		assert.equal(p.hp, 350);
		battle.turn++;
		hit(p, t, 'gigadrain', { damage: 40 });
		assert.equal(p.hp, 370);
	});
	for (const blocked of ['protect', 'substitute', 'Clear Body', 'Water Veil'])
		it('Uproot respects ' + blocked, () => {
			const [p, t] = setup('Venusaur', 'Uproot');
			if (blocked === 'protect' || blocked === 'substitute')
				t.addVolatile(blocked, t);
			else
				t.setAbility(blocked);
			hit(p, t, 'vinewhip');
			assert.equal(t.boosts.spd, blocked === 'Water Veil' ? -2 : 0);
		});
	it('Uproot drain respects Liquid Ooze and Heal Block', () => {
		const [p, t] = setup('Venusaur', 'Uproot');
		p.hp = 500;
		t.boosts.spd = -1;
		t.setAbility('Liquid Ooze');
		hit(p, t, 'vinewhip');
		assert.equal(p.hp, 490);
		t.setAbility('No Ability');
		p.addVolatile('healblock', t);
		hit(p, t, 'vinewhip');
		assert.equal(p.hp, 490);
	});
	it('Uproot is suppressed and introduces no selected components or raw stat modifiers', () => {
		const [p, t] = setup('Venusaur', 'Uproot');
		p.addVolatile('gastroacid');
		hit(p, t, 'vinewhip');
		assert.equal(t.boosts.spd, 0);
		assert(!require('../../../dist/data/ability-components').AbilityComponents.vendetta.length);
		assert(!Dex.abilities.get('vendetta').onResidual);
		assert(!Dex.abilities.get('vendetta').onDamage);
	});
	it('Uproot retains its absolute quarter-HP cap with Big Root', () => {
		const [p, t] = setup('Venusaur', 'Uproot');
		p.hp = 100;
		p.setItem('Big Root');
		t.boosts.spd = -1;
		t.hp = t.maxhp = 10000;
		hit(p, t, 'vinewhip', { damage: 1200 });
		assert.equal(p.hp, 350);
		hit(p, t, 'vinewhip', { damage: 400 });
		assert.equal(p.hp, 350);
	});
});
