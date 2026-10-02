'use strict';

const assert = require('assert').strict;
const common = require('../../common');

let battle;
function mega(species, item, foeMoves = ['splash']) {
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
		{ species, item, moves: ['splash', 'shadowpunch'] },
	], [{ species: 'Blissey', ability: 'No Ability', moves: foeMoves }]]);
	battle.makeChoices('team 1', 'team 1');
	battle.makeChoices('move splash mega', 'move 1');
	return [battle.p1.active[0], battle.p2.active[0]];
}

describe('Mega composite ability components', () => {
	afterEach(() => { battle?.destroy(); battle = null; });

	it('Cruel Tag traps opposing Pokemon as Shadow Tag does', () => {
		const [gengar, foe] = mega('Gengar', 'Gengarite');
		assert.equal(gengar.ability, 'crueltag');
		battle.runEvent('TrapPokemon', foe);
		assert(foe.trapped);
		assert.equal(battle.runEvent('SourceModifyDamage', gengar, foe, battle.dex.getActiveMove('tackle'), 100), 75);
	});

	it('Heavy Artillery and Toxic Bloom ignore enemy boosts through Unaware', () => {
		for (const [species, item, ability] of [
			['Clawitzer', 'Clawitzerite', 'heavyartillery'],
			['Venusaur', 'Venusaurite', 'toxicbloom'],
		]) {
			if (battle) { battle.destroy(); battle = null; }
			const [holder, foe] = mega(species, item);
			assert.equal(holder.ability, ability);
			battle.activePokemon = foe;
			battle.activeTarget = holder;
			const boosts = battle.runEvent('ModifyBoost', foe, null, null, { atk: 6, spa: 3, def: 2 });
			assert.equal(boosts.atk, 0);
			assert.equal(boosts.spa, 0);
		}
	});

	it('Raging Current removes Water Veil while retaining Dry Skin and Damp', () => {
		const [swampert, foe] = mega('Swampert', 'Swampertite', ['splash', 'explosion']);
		assert.equal(swampert.ability, 'ragingcurrent');
		assert(!swampert.volatiles.aquaring);
		assert.equal(swampert.trySetStatus('brn', foe), true);
		swampert.cureStatus();
		assert.equal(battle.runEvent('SourceModifySpA', swampert, foe, battle.dex.getActiveMove('flamethrower'), 100), 50);
		const foeHP = foe.hp;
		battle.makeChoices('move splash', 'move explosion');
		assert.equal(foe.hp, foeHP);
	});

	it('Phantom Fist boosts punches through its Unseen Fist component', () => {
		const [golurk, foe] = mega('Golurk', 'Golurkite');
		assert.equal(golurk.ability, 'phantomfist');
		assert.equal(battle.runEvent('BasePower', golurk, foe, battle.dex.getActiveMove('shadowpunch'), 100), 140);
	});

	it('Phalanx Form gets Battle Armor damage reduction', () => {
		const [falinks, foe] = mega('Falinks', 'Falinksite');
		assert.equal(falinks.ability, 'phalanxform');
		assert.equal(battle.runEvent('SourceModifyDamage', falinks, foe, battle.dex.getActiveMove('tackle'), 100), 80);
	});

	it('Mega Slowbro has Slow Clamp with Shell Armor, Own Tempo, Analytic, and Sweet Veil', () => {
		const [slowbro, foe] = mega('Slowbro', 'Slowbronite');
		assert.equal(slowbro.species.name, 'Slowbro-Mega');
		assert.equal(slowbro.ability, 'slowclamp');
		for (const component of ['shellarmor', 'owntempo', 'analytic', 'sweetveil']) {
			assert(slowbro.hasAbility(component));
		}
		assert.equal(battle.runEvent('SourceModifyDamage', slowbro, foe, battle.dex.getActiveMove('tackle'), 100), 80);
		assert(!slowbro.trySetStatus('slp', foe));
	});

	it('Iron Mountain keeps Heavy Metal physical protection and weight', () => {
		const [aggron, foe] = mega('Aggron', 'Aggronite');
		assert.equal(aggron.ability, 'ironmountain');
		assert.equal(battle.runEvent('Damage', aggron, foe, battle.dex.getActiveMove('tackle'), 100), 50);
		assert.equal(aggron.getWeight(), aggron.species.weightkg * 20);
	});

	it('Joyride prevents sleep and preserves Vital Spirit protection', () => {
		const [pinsir, foe] = mega('Pinsir', 'Pinsirite');
		assert.equal(pinsir.ability, 'joyride');
		assert.equal(pinsir.trySetStatus('slp', foe), false);
		assert.equal(battle.runEvent('SourceModifyDamage', pinsir, foe, battle.dex.getActiveMove('tackle'), 100), 80);
	});

	it('Relentless Link retains Skill Link power and replaces Battle Armor with Power Drill', () => {
		const [heracross, foe] = mega('Heracross', 'Heracronite');
		assert.equal(heracross.ability, 'relentlesslink');
		assert.equal(battle.runEvent('BasePower', heracross, foe, battle.dex.getActiveMove('bulletseed'), 100), 150);
		assert.equal(battle.runEvent('SourceModifyDamage', heracross, foe, battle.dex.getActiveMove('tackle'), 100), 100);
		assert(heracross.hasAbility('powerdrill'));
		assert(!heracross.hasAbility('battlearmor'));
	});

	it('Sand Sovereign only advertises its implemented components', () => {
		const [tyranitar] = mega('Tyranitar', 'Tyranitarite');
		assert.equal(tyranitar.ability, 'sandsovereign');
		for (const component of ['sandstream', 'solidrock', 'dauntlessshield']) assert(tyranitar.hasAbility(component));
		assert.equal(tyranitar.hasAbility('battlearmor'), false);
	});

	it('Solar Trap no longer retaliates when Mega Victreebel faints', () => {
		const [victreebel, foe] = mega('Victreebel', 'Victreebelite', ['splash', 'tackle']);
		assert.equal(victreebel.ability, 'solartrap');
		victreebel.hp = 1;
		const before = foe.hp;
		battle.makeChoices('move splash', 'move tackle');
		assert.equal(foe.hp, before);
	});
});
