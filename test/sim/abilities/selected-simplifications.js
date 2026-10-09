/* eslint-disable @stylistic/max-statements-per-line */
'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const approved = require('./selected-simplifications-approved.json');
let battle;
function setup(species = 'Mew', ability = 'No Ability', doubles = false) {
	const set = (species, ability) => ({ species, ability, moves: ['splash', 'tackle', 'protect', 'curse'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' },
		[[set(species, ability), set('Mew', 'No Ability')], [set('Mew', 'No Ability'), set('Mew', 'No Ability')]]);
	battle.makeChoices('team 12', 'team 12');
	const p = battle.p1.active[0], q = battle.p2.active[0];
	if (p.species.id !== Dex.species.get(species).id) p.formeChange(species, null, true);
	p.setAbility(ability);
	battle.field.terrain = ''; battle.field.weather = ''; battle.field.auraField = '';
	for (const side of battle.sides) for (const m of side.pokemon) m.hp = m.maxhp = m.baseMaxhp = 1600;
	return [p, q];
}
const residual = p => battle.singleEvent('Residual', p.getAbility(), p.abilityState, p);
describe('Individually selected Mega simplifications', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('changes exactly six approved passive records and only renames the Void Craft slot', () => {
		const changed = [];
		for (const old of require('./selected-simplifications-before.json')) {
			const s = Dex.species.get(old.id);
			assert.deepEqual(s.abilities, require('./passive-approval-overlays').abilities(old.id, {...old.abilities}), old.id);
			assert.deepEqual(s.passives, require('./passive-approval-overlays').current(old.id, approved.passives[old.id] ? [approved.passives[old.id]] : old.passives), old.id);
			if (approved.passives[old.id]) changed.push(old.id);
		}
		assert.equal(changed.length, 6);
	});
	for (const [id, components] of Object.entries(approved.exact)) it(id + ' has its exact approved component registry', () => {
		assert.deepEqual(require('../../../dist/data/ability-components').AbilityComponents[id], components);
	});
	for (const [id, removed] of Object.entries(approved.removed)) it(id + ' no longer exposes the removed component identities', () => {
		const [p] = setup('Mew', id);
		if (id === 'perfectforesight') delete p.m.perfectForesightAbility;
		for (const component of removed) assert(!p.hasAbility(component), id + ': ' + component);
	});
	for (const [species, ability, move] of [['Charizard', 'Unbound Blaze', 'flamethrower'], ['Venusaur', 'Pollen Bloom', 'energyball'], ['Blastoise', 'Water Barrage', 'surf']]) {
		it(ability + ' loses only its inherited Proficient power', () => {
			const [p, q] = setup(species, ability);
			assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove(move), 100), 100);
			assert(!p.hasAbility('proficient'));
		});
	}
	for (const [species, ability] of [['Venusaur-Mega', 'Toxic Bloom'], ['Charizard-Mega-X', 'Atrocity'], ['Charizard-Mega-Y', 'Sun Sovereign'], ['Blastoise-Mega', 'Siege Launcher']]) {
		it(ability + ' retains Proficient passive but loses independent end-turn healing', () => {
			const [p, q] = setup(species, ability); p.hp = 400; q.hp = 0;
			assert(p.getPassives().includes('proficient')); residual(p); assert.equal(p.hp, 400);
		});
	}
	it('Pollen Bloom chip and its unconfirmed drain remain unchanged', () => {
		const [p, q] = setup('Venusaur-Mega', 'Toxic Bloom'); p.hp = 400; residual(p);
		assert.equal(q.hp, 1500); assert.equal(p.hp, 500);
	});
	it('Siege Launcher delegates one Dual Wield pair at 0.9/0.9 with its separate Proficient passive', () => {
		const [p, q] = setup('Blastoise-Mega', 'Siege Launcher'), move = Dex.getActiveMove('darkpulse');
		battle.runEvent('ModifyMove', p, q, move, move); assert.equal(move.multihit, 2); assert.equal(move.multihitType, 'dualwield');
		for (const hit of [1, 2]) { move.hit = hit; assert.equal(battle.runEvent('BasePower', p, q, move, 100), 90); }
		assert.equal(move.tracksTarget, true);
		p.hp = 400; residual(p); assert.equal(p.hp, 400); assert.equal(q.hp, 1500);
	});
	it('Mega Arbok X gets full Shed Skin and selected Regenerator exactly once', () => {
		const [p] = setup('Arbok-Mega-X', 'Neurotoxin'); p.hp = 400;
		battle.randomChance = () => true; battle.runEvent('Residual', p); assert.equal(p.hp, 800);
		battle.runEvent('SwitchOut', p); assert.equal(p.hp, 1333);
	});
	it('Surge Conduit uses full Lightning Rod absorption and no old damage reduction', () => {
		const [p, q] = setup('Raichu-Mega-X', 'Surge Conduit');
		const atk = p.boosts.atk, spa = p.boosts.spa;
		battle.actions.useMove('thunderbolt', q, { target: p });
		assert.equal(p.hp, 1600); assert.equal(p.boosts.atk, atk + 1); assert.equal(p.boosts.spa, spa + 1);
		assert.equal(battle.runEvent('ModifyDamage', q, p, Dex.getActiveMove('tackle'), 100), 100);
	});
	it('Railgun Circuit keeps local Transistor strength and loses Ground mitigation', () => {
		const [p, q] = setup('Raichu-Mega-Y', 'Railgun Circuit');
		for (const field of ['', 'electricterrain', 'factoryterrain']) {
			battle.field.terrain = field;
			assert.equal(battle.runEvent('ModifySpA', p, q, Dex.getActiveMove('thunderbolt'), 100), field ? 200 : 130);
			assert.equal(battle.runEvent('ModifyAtk', q, p, Dex.getActiveMove('earthquake'), 100), 100);
		}
	});
	it('Lunar Orbit loses Triage and Serene Grace but keeps Gravity and Magic Guard', () => {
		const [p, q] = setup('Clefable-Mega', 'Lunar Orbit'), move = Dex.getActiveMove('flamethrower');
		battle.runEvent('ModifyMove', p, q, move, move); assert.equal(move.secondaries[0].chance, 10);
		assert.equal(battle.runEvent('ModifyPriority', p, q, Dex.getActiveMove('recover'), 0), 0);
		assert(battle.field.getPseudoWeather('gravity'));
		assert.equal(battle.damage(100, p, q, Dex.conditions.get('brn')), false);
	});
	it('Complete Parasitism keeps native Dry Skin once but copied packages do not inherit it', () => {
		const [p, q] = setup('Parasect-Mega', 'Complete Parasitism'); p.hp = 400;
		battle.actions.useMove('watergun', q, { target: p }); assert.equal(p.hp, 800);
		p.formeChange('Mew', null, true); p.setAbility('Complete Parasitism'); p.hp = 400;
		battle.actions.useMove('watergun', q, { target: p }); assert(p.hp < 400);
	});
	it('Parental Bond cannot bypass Ghost immunity and retains ordinary two-hit attacks', () => {
		const [p, q] = setup('Kangaskhan-Mega', 'Parental Bond'); q.setType('Ghost');
		battle.actions.useMove('tackle', p, { target: q }); assert.equal(q.hp, 1600);
		battle.actions.useMove('karatechop', p, { target: q }); assert.equal(q.hp, 1600);
		q.setType('Psychic'); battle.actions.useMove('bite', p, { target: q });
		assert(battle.log.some(line => line.includes('|-hitcount|') && line.endsWith('|2')));
	});
	it('Raging Current no longer raises Defense or heals on being hit', () => {
		const [p, q] = setup('Swampert-Mega', 'Raging Current'); p.hp = 800;
		battle.runEvent('DamagingHit', p, q, Dex.getActiveMove('tackle'), 100);
		assert.equal(p.hp, 800); assert.equal(p.boosts.def, 0);
	});
	it('Corrosive Touch cannot poison Steel and does not apply Corrosion stat drops', () => {
		const [p, q] = setup('Breloom-Mega', 'Corrosive Touch'); q.setType('Steel');
		assert.equal(q.trySetStatus('psn', p, Dex.moves.get('toxic')), false);
		q.setType('Normal'); q.trySetStatus('psn', p, Dex.moves.get('toxic'));
		assert.equal(q.boosts.def, 0); assert.equal(q.boosts.spd, 0);
	});
	it('Pure Power is passive once and Enlightenment retains Inner Focus/Technician', () => {
		const [p, q] = setup('Medicham-Mega', 'Enlightenment');
		assert.equal(battle.runEvent('ModifyAtk', p, q, Dex.getActiveMove('tackle'), 100), 200);
		p.addVolatile('gastroacid'); assert.equal(battle.runEvent('ModifyAtk', p, q, Dex.getActiveMove('tackle'), 100), 200);
	});
	it('Heavenly Chorus permits weather and retains Natural Cure', () => {
		const [p] = setup('Altaria-Mega', 'Heavenly Chorus'); battle.field.setWeather('raindance', p);
		assert.equal(p.effectiveWeather(), 'raindance'); p.setStatus('psn'); p.hp = 400;
		battle.runEvent('SwitchOut', p); assert.equal(p.status, ''); assert.equal(p.hp, 933);
	});
	it('Royal Scales keeps Swift Swim and permits Taunt after losing nested Oblivious', () => {
		const [p, q] = setup('Milotic-Mega', 'Royal Scales');
		// The separate Aroma Veil passive is intentionally still allowed to block Taunt.
		p.formeChange('Mew', null, true); p.setAbility('Royal Scales');
		battle.actions.useMove('taunt', q, { target: p }); assert(p.volatiles.taunt);
		battle.field.weather = 'raindance'; assert.equal(battle.runEvent('ModifySpe', p, null, null, 100), 200);
	});
	it('Unchecked Assault has full Vital Spirit without the old kick multiplier', () => {
		const [p, q] = setup('Lopunny-Mega', 'Unchecked Assault');
		assert.equal(p.trySetStatus('slp', q, Dex.moves.get('spore')), false);
		assert(!p.addVolatile('yawn', q));
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('highjumpkick'), 100), 100);
		assert.equal(battle.runEvent('ModifyAtk', p, q, Dex.getActiveMove('highjumpkick'), 100), 130);
	});
	it('Street Tyrant respects full local Intimidate protections and keeps 1/8 passive recovery', () => {
		const [p, q] = setup('Scrafty-Mega', 'Street Tyrant'); q.setAbility('Inner Focus'); q.boosts.atk = 0;
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p); assert.equal(q.boosts.atk, 0);
		p.hp = 400; battle.randomChance = () => true; battle.runEvent('Residual', p); assert.equal(p.hp, 600);
	});
	it('Phantom Fist keeps Self Sufficient but loses repair, Shadow Shield and status cure', () => {
		const [p, q] = setup('Golurk-Mega', 'Phantom Fist'); p.hp = 400; p.status = 'brn'; residual(p);
		assert.equal(p.hp, 500); assert.equal(p.status, 'brn'); battle.runEvent('SwitchOut', p); assert.equal(p.status, 'brn');
		assert.equal(battle.runEvent('ModifyDamage', q, p, Dex.getActiveMove('tackle'), 100), 100);
	});
	for (const ability of ['No Ability', 'Shadow Current']) it('Water Shuriken alone bypasses Water Absorb with ' + ability, () => {
		const [p, q] = setup('Mew', ability); q.setAbility('Water Absorb');
		battle.actions.useMove('watershuriken', p, { target: q }); assert(q.hp < 1600);
		const hp = q.hp; battle.actions.useMove('watergun', p, { target: q }); assert(q.hp >= hp);
	});
	it('Water Shuriken does not bypass Protect or Substitute', () => {
		const [p, q] = setup(); q.addVolatile('protect'); battle.actions.useMove('watershuriken', p, { target: q }); assert.equal(q.hp, 1600);
		q.removeVolatile('protect'); q.addVolatile('substitute'); q.volatiles.substitute.hp = 1600;
		battle.actions.useMove('watershuriken', p, { target: q }); assert.equal(q.hp, 1600);
	});
	it('Mega Pyroar has passive Flame Body without reactivating Unnerve', () => {
		const [p] = setup('Pyroar-Mega', 'Royal Sun');
		assert.deepEqual(p.getPassives(), ['flamebody']); assert(!p.hasAbility('unnerve')); assert(!p.hasAbility('flamebody'));
	});
	it('Toxic Renewal grants Regenerator once, full Adaptability and no Liquid Ooze', () => {
		const [p, q] = setup('Dragalge-Mega', 'Toxic Renewal'); p.hp = 400; battle.runEvent('SwitchOut', p); assert.equal(p.hp, 933);
		assert(!p.hasAbilityOrPassive('liquidooze'));
		assert.equal(battle.runEvent('ModifySTAB', p, q, Dex.getActiveMove('sludgebomb'), 2), 2.25);
	});
	it('Phalanx Form keeps trap escape without granting Steel STAB to off-type copied holders', () => {
		assert.deepEqual(Dex.species.get('falinksmega').types, ['Fighting', 'Steel']);
		const [p, q] = setup('Mew', 'Phalanx Form'), move = Dex.getActiveMove('flashcannon');
		battle.runEvent('ModifyMove', p, q, move, move); assert(!move.forceSTAB);
		p.trapped = true; battle.runEvent('TrapPokemon', p); assert.equal(p.trapped, false);
	});
	for (const hp of [1600, 200]) it('ordinary Cursed Marionette Ghost Curse pays the local 1/4 cost at HP ' + hp, () => {
		const [p, q] = setup('Banette-Mega', 'Cursed Marionette'); p.hp = hp;
		battle.actions.useMove('curse', p, { target: q }); assert.equal(p.hp, Math.max(0, hp - 400)); assert(q.volatiles.curse);
	});
	it('Magic Guard does not waive the ordinary local Ghost Curse HP cost', () => {
		const [p, q] = setup('Gengar', 'Magic Guard'); battle.actions.useMove('curse', p, { target: q }); assert.equal(p.hp, 1200);
	});
	it('ordinary Blastoise Water Barrage owns one pair, separate accuracy and full FFA hits', () => {
		const [p, q] = setup('Blastoise', 'Water Barrage');
		for (const gameType of ['singles', 'freeforall']) {
			battle.gameType = gameType;
			const move = Dex.getActiveMove('waterpulse');
			battle.runEvent('ModifyMove', p, q, move, move);
			assert.equal(move.multihit, 2); assert.equal(move.multihitType, 'dualwield');
			assert.equal(move.dualWieldAccuracy, 100); assert.equal(move.accuracy, true);
			for (const hit of [1, 2]) { move.hit = hit; assert.equal(battle.runEvent('BasePower', p, q, move, 100), gameType === 'singles' ? 60 : 100); }
		}
		assert(!p.hasAbilityOrPassive('proficient'));
	});
	for (const terrain of ['', 'psychicterrain', 'darkcrystalcavernterrain', 'coldeclipseterrain']) {
		it('native Cold Logic applies strongest reduction once on ' + terrain, () => {
			const [p, q] = setup('Metagross-Mega', 'Cold Logic'); battle.field.terrain = terrain;
			const move = Dex.getActiveMove('watergun'); move.hit = 1; p.getMoveHitData(move).typeMod = 0;
			const reduced = battle.runEvent('ModifyDamage', q, p, move, 100);
			assert.equal(reduced, terrain === 'darkcrystalcavernterrain' ? 60 : 80);
			assert.equal(battle.runEvent('Damage', p, q, move, reduced), reduced);
			const fixed = Dex.getActiveMove('seismictoss');
			assert.equal(battle.runEvent('Damage', p, q, fixed, 100), terrain === 'psychicterrain' ? 80 : 100);
			assert.equal(battle.runEvent('ModifyDef', p, q, move, 300), terrain === 'coldeclipseterrain' ? 600 : terrain === 'darkcrystalcavernterrain' ? 400 : 300);
		});
	}
	it('Ange delegates full Eternal Flower and keeps only the separate Fairy Aura passive', () => {
		const [p, q] = setup('Floette-Mega', 'Ange');
		assert.deepEqual(p.getPassives(), ['fairyaura']); assert(p.hasAbility('eternalflower')); assert(p.hasAbility('moldbreaker'));
		for (const [field, mult] of [['', 1], ['fairytaleterrain', 2], ['coldeclipseterrain', 2], ['starlightarenaterrain', 1.5], ['newworldterrain', 1.5], ['bewitchedwoodsterrain', 1.5]]) {
			battle.field.terrain = field;
			assert.equal(battle.runEvent('ModifySpA', p, q, Dex.getActiveMove('energyball'), 100), 150 * mult);
			const move = Dex.getActiveMove('focusblast'); battle.runEvent('ModifyMove', p, q, move, move);
			assert.equal(move.ignoreAbility, true); const primitive = Dex.getActiveMove('focusblast'); p.setAbility('Eternal Flower'); battle.runEvent('ModifyMove', p, q, primitive, primitive); p.setAbility('Ange'); assert.equal(move.accuracy, primitive.accuracy);
		}
		battle.field.terrain = ''; assert.equal(battle.damage(100, p, q, Dex.conditions.get('brn')), 100);
	});

	it('Mega Sunflora has Solar Bud once through suppression with no Solar Power cost or boost', () => {
		const [p, q] = setup('Sunflora-Mega', 'Solar Hydra'); p.hp = 800; battle.field.weather = 'sunnyday'; p.addVolatile('gastroacid');
		assert.deepEqual(p.getPassives(), ['solarbud']); assert(!p.hasAbilityOrPassive('solarpower'));
		assert.equal(battle.runEvent('ModifySpA', p, q, Dex.getActiveMove('energyball'), 100), 100);
		battle.runEvent('Residual', p); assert.equal(p.hp, 800); assert(p.passiveStates.solarbud.solarBudReady);
		p.status = 'par'; battle.runEvent('DamagingHit', q, p, Dex.getActiveMove('energyball'), 10);
		assert.equal(p.hp, 1000); assert.equal(p.status, ''); assert(p.m.solarBudSpent);
		battle.runEvent('DamagingHit', q, p, Dex.getActiveMove('energyball'), 10); assert.equal(p.hp, 1000);
	});
	for (const id of ['raichumegax', 'manectricmega', 'pyroarmega', 'sunfloramega'])it(id + ' acquires the approved passive on actual Mega evolution', () => {
		const mega = Dex.species.get(id);
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species: mega.baseSpecies, ability: 'No Ability', item: mega.requiredItem, moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('team 1', 'team 1'); battle.makeChoices('move splash mega', 'move splash');
		const p = battle.p1.active[0], q = battle.p2.active[0]; assert.equal(p.species.id, id);
		assert.deepEqual(p.getPassives(), id === 'raichumegax' ? ['electricsurge'] : [approved.passives[id]]);
		if (id === 'raichumegax') { assert(battle.field.isTerrain('electricterrain')); assert.equal(p.boosts.atk, 1); assert.equal(p.boosts.spa, 1); }
		if (id === 'manectricmega')assert.equal(q.boosts.atk, -1);
	});
	it('Perfect Foresight can still copy real Insomnia after losing its built-in copy', () => {
		const [p, q] = setup('Alakazam-Mega', 'Perfect Foresight'); q.setAbility('Insomnia');
		p.m.perfectForesightAbility = 'insomnia'; p.m.perfectForesightAbilityState = battle.initEffectState({ id: 'insomnia', target: p });
		assert(p.hasAbility('insomnia')); assert(!p.trySetStatus('slp', q, Dex.moves.get('spore')));
	});
	it('calculator native Cold Logic equals Prism Armor damage on Psychic Terrain', () => {
		const { calculateScenario } = require('../../../dist/sim/custom-calculator');
		const input = { format: 'gen9psychicfield', move: 'frostbreath', samples: 64, seed: 42, actors: [{ species: 'Mew', ability: 'No Ability' }, { species: 'Metagross-Mega', ability: 'Cold Logic' }, { species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }] };
		const actual = calculateScenario(input).results[1]; input.actors[1].ability = 'Prism Armor'; const expected = calculateScenario(input).results[1];
		assert.equal(actual.min, expected.min); assert.equal(actual.max, expected.max);
	});
});
