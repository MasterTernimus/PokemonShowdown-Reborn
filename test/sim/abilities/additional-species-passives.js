'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const { SpeciesPassives } = require('../../../dist/data/species-passives');
const before = require('./additional-passives-before.json');
let battle;
function setup(species, ability = Dex.species.get(species).abilities[0], foeAbility = 'No Ability', doubles = false) {
	const mon = (species = 'Mew', ability = 'No Ability') => ({ species, ability, item: 'Leftovers', moves: ['splash', 'tackle', 'roar', 'hypervoice'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [[mon(species, ability), mon(), mon('Blissey')], [mon('Mew', foeAbility), mon(), mon('Chansey')]]);
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
function states(p, t, check) {
	check();
	p.addVolatile('gastroacid'); check();
	p.removeVolatile('gastroacid');
	p.addVolatile('meridianseal'); check();
	p.removeVolatile('meridianseal');
	t.setAbility('Neutralizing Gas'); check();
	t.setAbility('No Ability');
	p.setAbility('Pressure'); check();
}
describe('Additional exact Sticky Hold, Soundproof and Suction Cups passives', () => {
	it('keeps at most one passive per species and Liquid Ooze on ordinary Grimer and Muk', () => {
		for (const species of Dex.species.all()) assert(species.passives.length <= 1, species.name);
		for (const id of ['grimer', 'muk']) {
			assert.deepEqual(Dex.species.get(id).passives, ['liquidooze']);
			const [p, t] = setup(id, 'Pressure');
			use('knockoff', t, p, {basePower: 1}); assert.equal(p.item, '');
			battle.destroy(); battle = null;
		}
	});
	afterEach(() => { battle?.destroy(); battle = null; });
	it('adds only the thirteen approved recipients and four approved ordinary slot changes', () => {
		const expected = JSON.parse(JSON.stringify(before.previousPassives));
		for (const [passive, ids] of Object.entries(before.groups)) for (const id of ids) expected[id] = [...(expected[id] || []), passive];
		for (const id of require('./dancer-passives-before.json').forms) expected[id] = [...(expected[id] || []), 'owntempo'];
		for (const id of require('../../../dist/data/species-passives').RelicArmorPassiveForms) expected[id] = [...(expected[id] || []), 'relicarmor'];
		for (const [passive, ids] of Object.entries(require('./kanto-johto-before.json').groups)) for (const id of ids) expected[id] = [...(expected[id] || []), passive];
		for (const [passive, ids] of Object.entries(require('./regional-passives-approved.json').groups)) for (const id of ids) expected[id] = [...(expected[id] || []), passive];
		require('./passive-approval-overlays').passives(expected);
		assert.deepEqual(SpeciesPassives, expected);
		assert.equal(Object.keys(SpeciesPassives).length, 820);
		for (const old of before.species) {
			const s = Dex.species.get(old.id), abilities = { ...old.abilities };
			for (const [id, slot, name] of before.replacement) if (id === old.id) abilities[slot] = name;
			assert.deepEqual(s.abilities, abilities, old.id);
			for (const k of ['baseStats', 'types', 'weightkg']) assert.deepEqual(s[k], old[k], old.id + '/' + k);
			assert.deepEqual(Dex.species.getLearnsetData(old.id).learnset, old.learnset);
		}
		for (const id of ['mukpulse', 'garbodorgmax', 'clobbopus', 'remoraid', 'lileep']) assert.deepEqual(Dex.species.get(id).passives, require('./passive-approval-overlays').current(id, before.previousPassives[id] || []));
	});
	for (const id of before.groups.stickyhold.filter(id => !['grimer', 'muk'].includes(id))) it(id + ' keeps its item against Knock Off through suppression and replacement', () => {
		const [p, t] = setup(id); states(p, t, () => {
			use('knockoff', t, p, { basePower: 1 });
			assert.equal(p.item, 'leftovers');
		});
		assert.equal(battle.log.filter(l => l.includes('|-activate|') && l.includes('passive: Sticky Hold')).length, 5);
		assert(!battle.log.some(l => l.includes('ability: Sticky Hold')));
	});
	for (const move of ['trick', 'switcheroo', 'thief', 'covet', 'corrosivegas']) it('Sticky Hold handles actual ' + move + ' item removal', () => {
		const [p, t] = setup('Trubbish');
		t.clearItem();
		p.addVolatile('gastroacid');
		use(move, t, p, { basePower: 1 });
		assert.equal(p.item, 'leftovers');
	});
	it('Sticky Hold keeps its local self-removal, Berry and Sticky Barb exceptions', () => {
		const [p, t] = setup('Grimer');
		p.setItem('Sitrus Berry');
		p.hp = 2000;
		assert(p.eatItem());
		assert.equal(p.item, '');
		p.setItem('Iron Ball');
		use('fling', p, t);
		assert.equal(p.item, '');
		p.setItem('Sticky Barb');
		t.clearItem();
		use('tackle', t, p, { basePower: 1 });
		assert.equal(p.item, '');
		assert.equal(t.item, 'stickybarb');
	});
	for (const id of before.groups.soundproof) it(id + ' blocks attacks, status sound and Perish Song through suppression', () => {
		const [p, t] = setup(id); states(p, t, () => {
			const hp = p.hp;
			use('hypervoice', t, p);
			assert.equal(p.hp, hp);
			use('sing', t, p);
			assert.equal(p.status, '');
			use('perishsong', t, p);
			assert(!p.volatiles.perishsong);
		});
		use('perishsong', p, t);
		assert(p.volatiles.perishsong, 'preserve local self-sound behavior');
	});
	it('Soundproof applies to teammate and bench Heal Bell without suppressing its own cure', () => {
		const [p, t, ally] = setup('Whismur', 'Scrappy', 'No Ability', true);
		p.setStatus('par', p);
		ally.setStatus('par', ally);
		p.addVolatile('gastroacid');
		use('healbell', ally, ally);
		assert.equal(p.status, 'par');
		assert.equal(ally.status, '');
		use('healbell', p, p);
		assert.equal(p.status, '');
	});
	for (const id of before.groups.suctioncups) it(id + ' blocks forced moves through suppression but permits voluntary switching', () => {
		const [p, t] = setup(id); states(p, t, () => {
			use('roar', t, p);
			assert.equal(battle.p1.active[0], p);
			assert(!p.forceSwitchFlag);
		});
		use('dragontail', t, p, { basePower: 1 });
		assert(!p.forceSwitchFlag);
		battle.makeChoices('switch 3', 'move splash');
		assert.notEqual(battle.p1.active[0], p);
	});
	for (const [species, move] of [['Grimer-Alola', 'knockoff'], ['Whismur', 'hypervoice'], ['Octillery', 'roar']]) for (const shield of [false, true]) it(species + ' defensive bypass and Ability Shield = ' + shield, () => {
		const [p, t] = setup(species, 'Pressure', 'Mold Breaker'); if (shield) p.setItem('Ability Shield');
		p.addVolatile('gastroacid');
		const hp = p.hp;
		use(move, t, p, { basePower: move === 'roar' ? 0 : 1 });
		if (move === 'knockoff') assert.equal(!!p.item, shield);
		if (move === 'hypervoice') assert.equal(p.hp < hp, !shield);
		if (move === 'roar') assert.equal(!!p.forceSwitchFlag, !shield);
	});
	for (const [species, passive] of [['Muk-Alola', 'stickyhold'], ['Exploud', 'soundproof'], ['Malamar', 'suctioncups']]) it(species + ' follows Transform and real forms without disclosing Illusion', () => {
		const [p, t] = setup(species, 'Pressure');
		assert(t.transformInto(p));
		assert.deepEqual(t.getPassives(), [passive]);
		t.formeChange('Mew', null, true);
		t.setAbility('No Ability');
		assert.deepEqual(t.getPassives(), ['synchronize']);
		p.illusion = battle.p1.pokemon[2];
		const start = battle.log.length;
		use(passive === 'stickyhold' ? 'knockoff' : passive === 'soundproof' ? 'hypervoice' : 'roar', t, p, { basePower: passive === 'suctioncups' ? 0 : 1 });
		assert(!battle.log.slice(start).join('\n').includes('passive:'));
		assert.deepEqual(p.getPassives(), ['healer']);
	});
	it('Conductivity retains Electric vs Steel and copied packages lose only the removed component', () => {
		const [p, t] = setup('Mew', 'Conductivity');
		assert(!p.hasAbility('soundproof'));
		const hp = p.hp;
		use('hypervoice', t, p);
		assert(p.hp < hp);
		const a = p.getAbility();
		assert.equal(a.onEffectiveness.call(battle, 0, t, 'Steel', Dex.getActiveMove('thunderbolt')), 1);
		p.setAbility('Anchored Battery');
		assert(!p.hasAbility('suctioncups'));
		use('roar', t, p);
		assert(p.forceSwitchFlag);
	});
	it('Anchored Battery keeps Mega Launcher and Punk Rock keeps offensive field multipliers', () => {
		const [p, t] = setup('Octillery', 'Anchored Battery');
		const pulse = Dex.getActiveMove('waterpulse');
		assert.equal(battle.runEvent('BasePower', p, t, pulse, 100), 150);
		p.formeChange('Loudred', null, true);
		p.setAbility('Punk Rock');
		const sound = Dex.getActiveMove('hypervoice');
		assert.equal(battle.runEvent('BasePower', p, t, sound, 100), 130);
		for (const field of ['bigtopterrain', 'caveterrain']) {
			battle.field.terrain = field;
			assert.equal(battle.runEvent('BasePower', p, t, sound, 100), 225);
		}
	});
	for (const [species, ability, move] of [['Shellos', 'Sticky Hold', 'knockoff'], ['Voltorb', 'Soundproof', 'hypervoice'], ['Lileep', 'Suction Cups', 'roar']]) it('preserves shared nonrecipient ' + species + ' ' + ability, () => {
		const [p, t] = setup(species, ability);
		assert(!p.getPassives().includes(Dex.abilities.get(ability).id));
		const hp = p.hp;
		use(move, t, p, { basePower: move === 'roar' ? 0 : 1 }); if (move === 'knockoff') assert.equal(p.item, 'leftovers');
		if (move === 'hypervoice') assert.equal(p.hp, hp);
		if (move === 'roar') assert(!p.forceSwitchFlag);
	});
	it('calculator metadata publishes every new recipient and damage matches sound immunity', () => {
		const { calculatorMetadata, calculateScenario } = require('../../../dist/sim/custom-calculator');
		const metadata = calculatorMetadata();
		for (const id of Object.values(before.groups).flat()) assert.deepEqual(metadata.species.find(s => Dex.species.get(s.name).id === id).passives, Dex.species.get(id).passives);
		const input = { format: 'gen9nofieldsinglesgame', move: 'Hyper Voice', samples: 8, seed: 42, actors: Array.from({ length: 4 }, () => ({ species: 'Mew', ability: 'No Ability' })) };
		input.actors[1] = { species: 'Exploud', ability: 'No Ability' };
		assert.equal(calculateScenario(input).results[1].max, 0);
		input.actors[0].ability = 'Mold Breaker';
		assert(calculateScenario(input).results[1].min > 0);
	});
});
