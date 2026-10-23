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

	it('Mega Gengar traps with Shadow Tag and guards one incoming move with Shadow Double', () => {
		const [gengar, foe] = mega('Gengar', 'Gengarite');
		assert.equal(gengar.ability, 'shadowdouble');
		assert.deepEqual(gengar.getPassives(), ['shadowtag']);
		battle.runEvent('TrapPokemon', foe);
		assert(foe.trapped);
		const incoming = move => battle.runEvent('ModifyDamage', foe, gengar, move, 100);
		assert.equal(incoming(battle.dex.getActiveMove('doublehit')), 80);
		// Blissey's natural Normal typing is immune to Ghost attacks.
		foe.setType('Psychic');
		foe.hp = foe.maxhp = foe.baseMaxhp = 10000;
		battle.actions.useMove('shadowpunch', gengar, {target: foe});
		battle.clearActiveMove();
		assert(foe.hp < 10000);
		assert(gengar.volatiles.shadowdoublespent.armed);
		const guardedMove = battle.dex.getActiveMove('doublehit');
		assert.equal(incoming(guardedMove), 60);
		assert.equal(incoming(guardedMove), 60, 'all hits of the same execution retain the guard');
		assert.equal(incoming(battle.dex.getActiveMove('doublehit')), 80);
		assert.equal(gengar.volatiles.shadowdoublespent.armed, false);
	});

	it('Mega Gengar retains native Shadow Tag while selected Shadow Double is suppressed', () => {
		const [gengar, foe] = mega('Gengar', 'Gengarite');
		foe.setType('Psychic');
		foe.hp = foe.maxhp = foe.baseMaxhp = 10000;
		battle.actions.useMove('shadowpunch', gengar, {target: foe});
		battle.clearActiveMove();
		assert(gengar.volatiles.shadowdoublespent.armed);
		assert(gengar.addVolatile('gastroacid', foe));
		assert.equal(battle.runEvent('ModifyDamage', foe, gengar, battle.dex.getActiveMove('doublehit'), 100), 80);
		assert(gengar.volatiles.shadowdoublespent.armed, 'suppression does not spend the guard');
		gengar.removeVolatile('gastroacid');
		assert.equal(battle.runEvent('ModifyDamage', foe, gengar, battle.dex.getActiveMove('doublehit'), 100), 60);
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

	it('Raging Current retains Swift Swim, Dry Skin and restored Damp without Water Veil', () => {
		const [swampert, foe] = mega('Swampert', 'Swampertite', ['splash', 'explosion']);
		assert.equal(swampert.ability, 'ragingcurrent');
		assert.deepEqual(swampert.getPassives(), ['proficient']);
		for (const component of ['swiftswim', 'dryskin', 'damp']) assert(swampert.hasAbility(component));
		assert(!swampert.hasAbility('waterveil'));
		assert(!swampert.volatiles.aquaring);
		assert.equal(swampert.trySetStatus('brn', foe), true);
		swampert.cureStatus();
		const fire = battle.dex.getActiveMove('flamethrower');
		assert.equal(battle.runEvent('ModifySpA', foe, swampert, fire, 100), 50);
		assert.equal(battle.runEvent('BasePower', foe, swampert, fire, 100), 125);
		const swampertHP = swampert.hp, foeHP = foe.hp;
		battle.makeChoices('move splash', 'move explosion');
		assert.equal(foe.hp, foeHP, 'Damp prevents Explosion and its self-KO');
		assert.equal(swampert.hp, swampertHP);
		assert(battle.log.some(line => line.includes('ability: Damp') && line.includes('Explosion')));
	});

	it('Raging Current Damp protection follows selected-ability suppression', () => {
		const [swampert, foe] = mega('Swampert', 'Swampertite', ['splash', 'explosion']);
		assert(swampert.addVolatile('gastroacid', foe));
		const fire = battle.dex.getActiveMove('flamethrower');
		assert.equal(battle.runEvent('ModifySpA', foe, swampert, fire, 100), 100);
		assert.equal(battle.runEvent('BasePower', foe, swampert, fire, 100), 100);
		const swampertHP = swampert.hp;
		battle.makeChoices('move splash', 'move explosion');
		assert.equal(foe.hp, 0);
		assert(swampert.hp < swampertHP);
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

	it('Mega Slowbro has Slow Clamp with Shell Armor, Own Tempo, and Analytic', () => {
		const [slowbro, foe] = mega('Slowbro', 'Slowbronite');
		assert.equal(slowbro.species.name, 'Slowbro-Mega');
		assert.equal(slowbro.ability, 'slowclamp');
		for (const component of ['shellarmor', 'analytic', 'owntempo']) {
			assert(slowbro.hasAbilityOrPassive(component));
		}
		assert.equal(battle.runEvent('SourceModifyDamage', slowbro, foe, battle.dex.getActiveMove('tackle'), 100), 80);
		assert(slowbro.trySetStatus('slp', foe));
	});

	it('Iron Mountain keeps Heavy Metal physical protection and weight', () => {
		const [aggron, foe] = mega('Aggron', 'Aggronite');
		assert.equal(aggron.ability, 'ironmountain');
		assert.equal(battle.runEvent('Damage', aggron, foe, battle.dex.getActiveMove('tackle'), 100), 100);
		assert.equal(aggron.getWeight(), aggron.species.weightkg * 10);
	});

	it('Joyride retains Aerilate and Violent Rush without sleep protection or generic damage reduction', () => {
		const [pinsir, foe] = mega('Pinsir', 'Pinsirite');
		assert.equal(pinsir.ability, 'joyride');
		assert.deepEqual(pinsir.getPassives(), ['aerilate']);
		assert(!pinsir.hasAbility('vitalspirit'));
		assert.equal(pinsir.trySetStatus('slp', foe), true);
		battle.singleEvent('Update', pinsir.getAbility(), pinsir.abilityState, pinsir);
		assert.equal(pinsir.status, 'slp', 'Joyride does not cure sleep');
		pinsir.cureStatus();
		assert(pinsir.addVolatile('yawn', foe));
		pinsir.removeVolatile('yawn');
		assert.equal(battle.runEvent('ModifyDamage', foe, pinsir, battle.dex.getActiveMove('tackle'), 100), 100);
		pinsir.activeTurns = 0;
		assert.equal(battle.runEvent('ModifySpe', pinsir, null, null, 100), 150);
		assert.equal(battle.runEvent('ModifyAtk', pinsir, foe, battle.dex.getActiveMove('tackle'), 100), 120);
		assert.equal(battle.runEvent('ModifySpA', pinsir, foe, battle.dex.getActiveMove('aurasphere'), 100), 130);
		assert(pinsir.addVolatile('gastroacid', foe));
		assert.equal(battle.runEvent('ModifySpe', pinsir, null, null, 100), 100);
		assert.equal(battle.runEvent('ModifyAtk', pinsir, foe, battle.dex.getActiveMove('tackle'), 100), 100);
		assert.equal(battle.runEvent('ModifySpA', pinsir, foe, battle.dex.getActiveMove('aurasphere'), 100), 100);
		const normal = battle.dex.getActiveMove('tackle');
		battle.runEvent('ModifyType', pinsir, foe, normal, normal);
		assert.equal(normal.type, 'Flying', 'native Aerilate persists under selected suppression');
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
		for (const component of ['sandstream', 'solidrock']) assert(tyranitar.hasAbilityOrPassive(component));
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
