'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const approved = require('./mega-approved-choices.json');
const before = require('./mega-approved-before.json');
const variants = require('./mega-approved-variants.json');
const paused = require('./mega-paused-explicit.json');
let battle;
function setup(species, ability, doubles = false) {
	const set = (species, ability = 'No Ability') => ({ species, ability, moves: ['tackle', 'crunch', 'protect', 'psychocut'] });
	battle = common.createBattle(doubles ? { gameType: 'doubles' } : { formatid: 'gen9nofieldsinglesgame' },
		[[set(species, ability), set('Chansey')], [set('Chansey'), set('Blissey')]]);
	if (battle.requestState === 'teampreview') battle.makeChoices('team 12', 'team 12');
	const p = battle.p1.active[0], q = battle.p2.active[0];
	if (p.species.id !== Dex.species.get(species).id) p.formeChange(species, null, true);
	battle.field.terrain = '';
	return [p, q];
}
describe('Approved Mega component/passive splits', () => {
	afterEach(() => {
		if (battle) battle.destroy();
		battle = null;
	});
	it('matches every independently approved recipient and leaves rejected/different branches unchanged', () => {
		const expected = Object.fromEntries(before.map(s => [s.id, s.passives]));
		Object.assign(expected, paused);
		for (const [id, p] of Object.entries(approved)) expected[id] = [p];
		for (const [id, normal] of Object.entries(variants)) if (expected[normal]?.length) expected[id] = expected[normal];
		for (const [id, p] of Object.entries(require('./gmax-approved.json').passives)) expected[id] = [p];
		for (const [id, p] of Object.entries(expected)) assert.deepEqual(Dex.species.get(id).passives, p, id);
		for (const id of ['beedrillmega', 'gyaradosmega', 'houndoommega', 'aggronmega', 'alakazammega', 'excadrillmega', 'sharpedomegay'])
			assert.deepEqual(Dex.species.get(id).passives, before.find(s => s.id === id).passives, id);
	});
	for (const [id, passive] of Object.entries(approved)) it(id + ' retains its approved passive under suppression and Transform', () => {
		const [p, q] = setup(id, Dex.species.get(id).abilities[0]);
		assert.deepEqual(p.getPassives(), [passive]);
		p.addVolatile('gastroacid'); assert.deepEqual(p.getPassives(), [passive]);
		q.transformInto(p); assert.deepEqual(q.getPassives(), [passive]);
	});
	it('doubles Mawile Attack once, adds Strong Jaw, and preserves nonrecipient Dread Maw', () => {
		const [p, q] = setup('Mawile-Mega', 'Dread Maw');
		const move = Dex.getActiveMove('crunch');
		assert.equal(battle.runEvent('ModifyAtk', p, q, move, 100), 200);
		assert.equal(battle.runEvent('BasePower', p, q, move, 100), 150);
		p.addVolatile('gastroacid');
		assert.equal(battle.runEvent('ModifyAtk', p, q, move, 100), 200);
		assert.equal(battle.runEvent('BasePower', p, q, move, 100), 100);
	});
	it('uses full local Pure Power once, moving its boost to Special Attack on Psychic Terrain', () => {
		const [p, q] = setup('Starmie-Mega', 'Astral Core'), move = Dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('ModifyAtk', p, q, move, 100), 200);
		battle.field.terrain = 'psychicterrain';
		assert.equal(battle.runEvent('ModifyAtk', p, q, move, 100), 100);
		assert.equal(battle.runEvent('ModifySpA', p, q, move, 100), 200);
	});
	for (const [species, ability, type, field, boost] of [
		['Gardevoir-Mega', 'Void Voice', 'Fairy', 'mistyterrain', 225],
		['Altaria-Mega', 'Heavenly Chorus', 'Fairy', '', 120],
		['Glalie-Mega', 'Freezer Burn', 'Ice', 'icyterrain', 225],
		['Pinsir-Mega', 'Joyride', 'Flying', '', 120],
	]) it(species + ' converts Normal type once and retains field power under suppression', () => {
		const [p, q] = setup(species, ability); p.addVolatile('gastroacid'); battle.field.terrain = field;
		const move = Dex.getActiveMove('tackle'); battle.runEvent('ModifyType', p, q, move, move);
		assert.equal(move.type, type);
		assert.equal(battle.runEvent('BasePower', p, q, move, 100), boost);
	});
	it('keeps eight-turn Sand Sovereign weather and its Defense bonus', () => {
		const [p] = setup('Tyranitar-Mega', 'Sand Sovereign');
		assert.equal(battle.field.weather, 'sandstorm'); assert.equal(battle.field.weatherState.duration, 8);
		assert.equal(p.boosts.def, 0);
	});
	it('keeps eight-turn Frost Sovereign hail', () => {
		setup('Abomasnow-Mega', 'Frost Sovereign');
		assert.equal(battle.field.weather, 'hail'); assert.equal(battle.field.weatherState.duration, 8);
	});
	it('runs Intimidate once for Scizor', () => {
		const [,q] = setup('Scizor-Mega', 'Iron Vise'); assert.equal(q.boosts.atk, -1);
	});
	it('replaces Gale Wings with passive No Guard and removes selected accuracy', () => {
		const [p, q] = setup('Pidgeot-Mega', 'Storm Sovereign'), move = Dex.getActiveMove('airslash');
		assert.equal(battle.runEvent('ModifyPriority', p, q, move, 0), 0);
		battle.runEvent('ModifyMove', p, q, move, move); assert.equal(move.accuracy, 95);
		assert.equal(battle.runEvent('Accuracy', q, p, move, 1), true);
	});
	it('exposes passive Sharpness once alongside the selected Dual Wield modifier', () => {
		const [p, q] = setup('Gallade-Mega', 'Sacred Edge'), move = Dex.getActiveMove('psychocut');
		// No ModifyMove here: isolate the slicing bonus from the independent multi-hit modifier.
		assert.equal(battle.runEvent('BasePower', p, q, move, 100), 150);
		battle.field.terrain = 'coldeclipseterrain';
		assert.equal(battle.runEvent('BasePower', p, q, move, 100), 100);
	});
	it('retains selected Limber while Scrappy is passive', () => {
		const [p] = setup('Lopunny-Mega', 'Unchecked Assault');
		assert.equal(p.trySetStatus('par'), false);
		assert(p.hasAbility('limber')); assert(!p.hasAbility('scrappy'));
	});
	it('keeps local Invigorate healing to one 1.3 multiplier through nested Vital Signs', () => {
		const [p] = setup('Audino-Mega', 'Divine Intervention');
		p.hp = 100; p.maxhp = p.baseMaxhp = 1000;
		assert.equal(battle.heal(100, p, p, Dex.moves.get('recover')), 130);
		p.addVolatile('gastroacid');
		assert.equal(battle.heal(100, p, p, Dex.moves.get('recover')), 130);
	});
	it('keeps Invigorate Safeguard at five turns even while the selected package is suppressed', () => {
		const [p] = setup('Audino-Mega', 'Divine Intervention'); p.addVolatile('gastroacid');
		p.side.addSideCondition('safeguard', p, Dex.moves.get('safeguard'));
		assert.equal(p.side.sideConditions.safeguard.duration, 5);
	});
	it('performs one independent adjacent-ally cure roll and no Invigorate self-cure', () => {
		const [p] = setup('Audino-Mega', 'Divine Intervention', true), ally = battle.p1.active[1];
		p.setStatus('par'); ally.setStatus('par'); let rolls = 0;
		battle.randomChance = () => { rolls++; return false; };
		battle.fieldEvent('Residual');
		assert.equal(rolls, 1); assert.equal(p.status, 'par'); assert.equal(ally.status, 'par');
	});
	it('preserves selected Natural Cure and Levitate after their swaps', () => {
		const [p] = setup('Altaria-Mega', 'Heavenly Chorus'); p.setStatus('par');
		battle.runEvent('SwitchOut', p);
		assert.equal(p.status, ''); battle.destroy(); battle = null;
		const [g] = setup('Glalie-Mega', 'Freezer Burn'); assert.equal(g.isGrounded(), null);
	});
	it('keeps Sheer Force secondary removal and Life Orb recoil suppression as passive mechanics', () => {
		const [p, q] = setup('Camerupt-Mega', 'Caldera Core'); p.setItem('lifeorb'); p.addVolatile('gastroacid');
		p.hp = p.maxhp = p.baseMaxhp = 10000; q.hp = q.maxhp = q.baseMaxhp = 10000;
		const move = Dex.getActiveMove('flamethrower'); battle.runEvent('ModifyMove', p, q, move, move);
		assert.equal(move.secondaries, undefined); assert(move.hasSheerForce);
		battle.actions.useMove('flamethrower', p, { target: q }); assert.equal(p.hp, 10000);
	});
	it('keeps Sharpedo base and Mega-Y unchanged while the standard Mega gets one biting multiplier', () => {
		const [p, q] = setup('Sharpedo-Mega', 'Razor Current'); const m = Dex.getActiveMove('crunch');
		assert.equal(battle.runEvent('BasePower', p, q, m, 100), 150);
		assert.deepEqual(Dex.species.get('sharpedo').passives, ['roughskin']); assert.deepEqual(Dex.species.get('sharpedomegay').passives, ['roughskin']);
	});
	it('has correct calculator metadata for all approved forms and their equivalents', () => {
		const { calculatorMetadata } = require('../../../dist/sim/custom-calculator'); const m = calculatorMetadata();
		for (const id of [...Object.keys(approved), ...Object.keys(paused), ...Object.keys(variants)]) {
			const species = Dex.species.get(id), row = m.species.find(row => row.name === species.name);
			if (species.isCosmeticForme && !species.passives.length) { assert.equal(row, undefined, id); continue; }
			assert.deepEqual(row.passives, species.passives, id);
		}
	});
	for (const [species, ability, move] of [
		['Mawile-Mega', 'Huge Power', 'Crunch'], ['Starmie-Mega', 'Pure Power', 'Tackle'],
		['Sharpedo-Mega', 'Strong Jaw', 'Crunch'], ['Camerupt-Mega', 'Sheer Force', 'Flamethrower'],
		['Gallade-Mega', 'Sharpness', 'Psycho Cut'], ['Pinsir-Mega', 'Aerilate', 'Tackle'],
		['Altaria-Mega', 'Pixilate', 'Tackle'], ['Glalie-Mega', 'Refrigerate', 'Tackle'],
		['Lucario-Mega', 'Adaptability', 'Aura Sphere'], ['Metagross-Mega', 'Tough Claws', 'Tackle'],
	]) it(species + ' calculator damage matches passive-only damage with a duplicate selected primitive', () => {
		const { calculateScenario } = require('../../../dist/sim/custom-calculator');
		const input = { format: 'gen9nofieldsinglesgame', move, samples: 16, seed: 42, actors: [{ species, ability: 'No Ability' }, ...Array.from({ length: 3 }, () => ({ species: 'Mew', ability: 'No Ability' }))] };
		const expected = calculateScenario(input).results;
		input.actors[0].ability = ability;
		assert.deepEqual(calculateScenario(input).results, expected);
	});
	it('keeps Friend Guard once for Mega Kangaskhan and removes only Iron Will Second Wind', () => {
		const [p, q] = setup('Kangaskhan-Mega', 'Parental Bond', true), ally = battle.p1.active[1];
		assert.equal(battle.runEvent('ModifyDamage', q, ally, Dex.getActiveMove('tackle'), 100), 75);
		assert.equal(Dex.abilities.get('ironwill').onDamage, undefined);
		assert(Dex.abilities.get('ironwill').onResidual);
		assert.equal(Dex.species.get('kangaskhan').abilities[1], 'Healer');
	});
	it('retains full local Cursed Body and Infiltrator in Haunting Veil', () => {
		const [p, q] = setup('Froslass', 'Haunting Veil');
		assert.deepEqual(p.getPassives(), ['levitate']);
		const move = Dex.getActiveMove('tackle'); battle.runEvent('ModifyMove', p, q, move, move);
		assert(move.infiltrates); assert(Dex.abilities.get('hauntingveil').onFaint);
	});
	for (const species of ['Eevee-Starter', 'Eevee-Starter-Alt']) it(species + ' has Adaptability only until Unstable Evo changes its actual species', () => {
		const [p, q] = setup(species, 'Unstable Evo'); assert.deepEqual(p.getPassives(), ['adaptability']);
		const normal = Dex.getActiveMove('tackle'); assert.equal(battle.runEvent('ModifySTAB', p, q, normal, 1.5), 2);
		battle.runEvent('ModifyPriority', p, q, Dex.getActiveMove('bouncybubble'), 0);
		assert.equal(p.species.id, 'vaporeon'); assert.deepEqual(p.getPassives(), Dex.species.get('vaporeon').passives);
		assert(!p.getPassives().includes('adaptability'));
	});
});
