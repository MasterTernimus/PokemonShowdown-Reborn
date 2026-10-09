'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const approved = require('./sinnoh-unova-mega-approved.json');
let battle;
function setup(species, ability) {
	const set = (species = 'Mew', ability = 'No Ability') => ({ species, ability, moves: ['splash', 'tackle', 'protect', 'coil'] });
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[set(species, ability || Dex.species.get(species).abilities[0]), set()], [set(), set()]]);
	battle.makeChoices('team 12', 'team 12');
	const p = battle.p1.active[0], q = battle.p2.active[0];
	if (p.species.id !== Dex.species.get(species).id) p.formeChange(species, null, true);
	battle.field.terrain = '';
	for (const side of battle.sides) for (const mon of side.pokemon) mon.hp = mon.maxhp = mon.baseMaxhp = 1200;
	return [p, q];
}
describe('Approved thirteen Sinnoh Unova Mega passive migrations', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	it('matches thirteen approved passive records and the Aura Precision selected replacement', () => {
		let changed = 0;
		for (const old of require('./sinnoh-unova-mega-before.json')) {
			const s = Dex.species.get(old.id);
			assert.deepEqual(s.abilities, require('./passive-approval-overlays').abilities(old.id, {...old.abilities}), old.id);
			assert.deepEqual(s.passives, require('./passive-approval-overlays').current(old.id, old.passives), old.id);
			if (JSON.stringify(s.passives) !== JSON.stringify(old.passives)) changed++;
		}
		assert.equal(changed, 59); // Includes later Mega Pidgeot and 25 explicit Gmax grants.
	});
	for (const [id, passive] of Object.entries(approved)) {
		it(id + ' migrates through real Mega evolution, Transform, suppression and selected-ability replacement', () => {
			const s = Dex.species.get(id);
			battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species: s.baseSpecies, ability: 'No Ability', item: s.requiredItem, moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
			battle.makeChoices('team 1', 'team 1');
			battle.makeChoices('move splash mega', 'move splash');
			const p = battle.p1.active[0], q = battle.p2.active[0];
			assert.equal(p.species.id, id);
			assert.deepEqual(p.getPassives(), [passive]);
			q.transformInto(p);
			assert.deepEqual(q.getPassives(), [passive]);
			p.setAbility('No Ability');
			p.addVolatile('gastroacid');
			assert.deepEqual(p.getPassives(), [passive]);
		});
		it(id + ' excludes only its extracted component from selected identity and preserves copied packages', () => {
			const [p, q] = setup(id);
			if (!['lucariomegaz', 'haxorusmega'].includes(id)) assert(p.getAbilityComponentExclusions().includes(passive));
			const ability = p.ability;
			q.setAbility(ability);
			assert.equal(q.getAbilityComponentExclusions().includes(passive), !!require('./selected-simplifications-approved.json').removed[p.ability]?.includes(passive));
			assert.deepEqual(q.getPassives(), ['synchronize']);
		});
	}
	it('Contrary reverses changes once while Predator retains its power and no Ultra additions', () => {
		const [p, q] = setup('Staraptor-Mega');
		battle.boost({ atk: -1 }, p, p);
		assert.equal(p.boosts.atk, 1);
		q.newlySwitched = true;
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 100), 130);
		battle.field.terrain = 'mountainterrain';
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 100), 200);
		assert(!p.hasAbility('ultraego'));
		assert(!p.hasAbility('ultrainstinct'));
		p.setAbility('Contrary');
		battle.boost({ spa: 1 }, p, p);
		assert.equal(p.boosts.spa, -1);
		p.addVolatile('gastroacid');
		battle.boost({ def: -1 }, p, p);
		assert.equal(p.boosts.def, 1);
	});
	it('Luxray retains entry and Infiltrator effects and applies Strong Jaw once', () => {
		const [p, q] = setup('Luxray-Mega');
		assert(p.hasAbility('intimidate'));
		assert(!p.hasAbility('infiltrator'));
		assert(!p.hasAbility('frisk'));
		assert(p.hasAbility('illuminate'));
		for (const ability of ['Night Hunt', 'Strong Jaw', 'No Ability']) {
			p.setAbility(ability);
			assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('crunch'), 100), 150);
		}
	});
	for (const id of ['mismagiusmega', 'eelektrossmega']) it(id + ' full Elevate supplies one KO boost and obeys grounding while suppressed', () => {
		const [p, q] = setup(id);
		p.addVolatile('gastroacid');
		assert(!p.isGrounded());
		assert(!p.runImmunity('Ground', true));
		assert(battle.log.some(line => line.includes('[from] passive: Elevate')));
		battle.runEvent('AfterFaint', q, p, Dex.getActiveMove('tackle'), 1);
		assert.equal(Object.values(p.boosts).reduce((a, b) => a + b, 0), 1);
		battle.field.addPseudoWeather('gravity', p);
		assert(p.isGrounded());
		battle.field.removePseudoWeather('gravity');
		p.setItem('ironball');
		assert(p.isGrounded());
		p.clearItem();
		p.removeVolatile('gastroacid');
		p.setAbility('Elevate');
		battle.runEvent('AfterFaint', q, p, Dex.getActiveMove('tackle'), 1);
		assert.equal(Object.values(p.boosts).reduce((a, b) => a + b, 0), 2);
	});
	it('Voidcraft retains full Insomnia, Shadow Shield and the recurring Temporal Shift scheduler', () => {
		const [p, q] = setup('Mismagius-Mega');
		assert(p.hasAbility('insomnia'));
		assert(p.hasAbility('shadowshield'));
		assert(p.hasAbility('temporalshift'));
		assert(!p.trySetStatus('slp', q, Dex.moves.get('hypnosis')));
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('shadowball'), 100), 130);
		const scheduled = p.abilityState.temporalShiftLastCastTurn;
		assert.equal(typeof scheduled, 'number');
	});
	it('Mirror Armor supplies reflection, field entry boosts and damage reduction exactly once', () => {
		const [p, q] = setup('Bronzong-Mega');
		assert.equal(battle.field.weather, 'raindance');
		assert(p.hasAbility('elevate'));
		battle.boost({ atk: -2 }, p, q, Dex.moves.get('growl'));
		assert.equal(p.boosts.atk, 0);
		assert.equal(q.boosts.atk, -2);
		assert.equal(battle.runEvent('ModifyDamage', q, p, Dex.getActiveMove('tackle'), 100), 80);
		const { passiveEffect, passiveState } = require('../../../dist/sim/species-passives');
		battle.field.terrain = 'fairytaleterrain';
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		battle.singleEvent('SwitchIn', passiveEffect(battle, 'mirrorarmor'), passiveState(p, 'mirrorarmor'), p);
		assert.equal(p.boosts.def, 1);
		assert.equal(p.boosts.spd, 1);
		p.setAbility('Mirror Armor');
		assert.equal(battle.runEvent('ModifyDamage', q, p, Dex.getActiveMove('tackle'), 100), 80);
	});
	it('Weavile retains Sharpness and Refrigerate while Stakeout doubles only the switched-target attack', () => {
		const [p, q] = setup('Weavile-Mega');
		q.activeTurns = 0;
		assert.equal(battle.runEvent('ModifyAtk', p, q, Dex.getActiveMove('tackle'), 100), 200);
		q.activeTurns = 1;
		assert.equal(battle.runEvent('ModifyAtk', p, q, Dex.getActiveMove('tackle'), 100), 100);
		const move = Dex.getActiveMove('tackle');
		battle.runEvent('ModifyType', p, q, move, move);
		assert.equal(move.type, 'Ice');
		assert(p.hasAbility('sharpness'));
		p.setAbility('Stakeout');
		q.activeTurns = 0;
		assert.equal(battle.runEvent('ModifySpA', p, q, move, 100), 200);
	});
	it('Dusknoir keeps Dark Aura, recovery and Haunted triggers while passive Unaware ignores opposing boosts', () => {
		const [p, q] = setup('Dusknoir-Mega');
		p.hp = 500;
		battle.runEvent('Residual', p);
		assert.equal(p.hp, 575);
		assert(p.hasAbility('darkaura'));
		battle.activePokemon = q;
		battle.activeTarget = p;
		const boosts = battle.runEvent('ModifyBoost', q, null, null, { atk: 6, def: 6, spa: 6, accuracy: 6 });
		assert.deepEqual(boosts, { atk: 0, def: 0, spa: 0, accuracy: 0 });
		battle.clearActiveMove();
		battle.runEvent('DamagingHit', p, q, Dex.getActiveMove('tackle'), 1);
		assert.equal(battle.field.terrain, 'hauntedterrain');
	});
	it('Scrafty preserves one-eighth healing and cleansing after suppression and ability changes', () => {
		const [p] = setup('Scrafty-Mega');
		battle.randomChance = () => true;
		for (const ability of ['Street Tyrant', 'Shed Skin', 'No Ability']) {
			p.setAbility(ability);
			p.hp = 100;
			p.status = 'brn';
			p.boosts.def = -2;
			battle.runEvent('Residual', p);
			assert.equal(p.hp, 250);
			assert.equal(p.status, '');
			assert.equal(p.boosts.def, 0);
		}
		p.addVolatile('gastroacid');
		p.hp = 100;
		battle.field.terrain = 'dragonsdenterrain';
		battle.runEvent('Residual', p);
		assert.equal(p.hp, 250);
		assert.equal(p.boosts.def, -1);
		assert.equal(p.boosts.spd, -1);
	});
	it('Reuniclus retains Huge Power and Magic Guard with one independent Regenerator heal', () => {
		const [p, q] = setup('Reuniclus-Mega');
		assert.equal(battle.runEvent('ModifyAtk', p, q, Dex.getActiveMove('tackle'), 100), 200);
		assert.equal(battle.runEvent('Damage', p, p, Dex.conditions.get('brn'), 50), false);
		p.hp = 100;
		battle.runEvent('SwitchOut', p);
		assert.equal(p.hp, 500);
		p.setAbility('Regenerator');
		p.hp = 100;
		battle.runEvent('SwitchOut', p);
		assert.equal(p.hp, 500);
	});
	it('Eelektross retains rain and water-field Speed and Coil Special Attack', () => {
		const [p, q] = setup('Eelektross-Mega');
		assert(p.hasAbility('electricsurge'));
		battle.field.setWeather('raindance');
		assert.equal(battle.runEvent('ModifySpe', p, null, null, 100), 200);
		battle.field.clearWeather();
		battle.field.terrain = 'watersurfaceterrain';
		assert.equal(battle.runEvent('ModifySpe', p, null, null, 100), 200);
		const move = Dex.getActiveMove('coil');
		battle.runEvent('ModifyMove', p, q, move, move);
		assert.equal(move.boosts.spa, 1);
	});
	it('Chandelure retains Soul Siphon and Malice Well and applies Soul Pyre once even if selected', () => {
		const [p, q] = setup('Chandelure-Mega');
		assert(p.hasAbility('soulsiphon'));
		assert(p.hasAbility('malicewell'));
		q.status = 'brn';
		const move = Dex.getActiveMove('shadowball');
		battle.runEvent('DamagingHit', q, p, move, 50);
		assert.equal(q.boosts.spd, -1);
		battle.runEvent('DamagingHit', q, p, move, 50);
		assert.equal(q.boosts.spd, -1);
		p.setAbility('Soul Pyre');
		p.hp = 100;
		battle.runEvent('AfterDamageApplied', q, q, Dex.conditions.get('brn'), 50);
		battle.runEvent('Residual', p);
		assert.equal(p.hp, 250);
	});
	it('Golurk retains Unseen Fist while full No Guard affects both directions and survives suppression', () => {
		const [p, q] = setup('Golurk-Mega');
		const move = Dex.getActiveMove('dynamicpunch');
		battle.runEvent('ModifyMove', p, q, move, move);
		assert(!move.flags.protect);
		assert.equal(move.accuracy, 50);
		for (const suppressed of [false, true]) {
			if (suppressed) p.addVolatile('gastroacid');
			assert.equal(battle.runEvent('Accuracy', q, p, move, 50), true);
			assert.equal(battle.runEvent('Accuracy', p, q, move, 50), true);
		}
	});
	it('nonrecipient Predator and Phantom Fist retain their original callbacks', () => {
		const [p, q] = setup('Mew', 'Predator');
		battle.boost({ atk: -1 }, p, p);
		assert.equal(p.boosts.atk, 1);
		p.setAbility('Phantom Fist');
		const move = Dex.getActiveMove('dynamicpunch');
		battle.runEvent('ModifyMove', p, q, move, move);
		assert.equal(move.accuracy, 50);
	});
	it('Aura Guard halves physical and special contact damage once but leaves noncontact damage unchanged', () => {
		const [p, q] = setup('Lucario-Mega-Z');
		assert.equal(p.ability, 'auraprecision');
		for (const ability of ['Aura Precision', 'Aura Master', 'Aura Guard', 'No Ability']) {
			p.setAbility(ability);
			for (const category of ['Physical', 'Special']) for (const contact of [0, 1]) {
				const move = Object.assign(Dex.getActiveMove('tackle'), { category, flags: { contact } });
				assert.equal(battle.runEvent('ModifyDamage', q, p, move, 100), contact ? 50 : 100);
			}
		}
		p.addVolatile('gastroacid');
		assert.equal(battle.runEvent('ModifyDamage', q, p, Dex.getActiveMove('tackle'), 100), 50);
	});
	it('copied Aura Master retains its original paired attacks, Technician and Inner Focus', () => {
		const [p, q] = setup('Mew', 'Aura Master');
		assert(p.hasAbility('innerfocus'));
		assert(!p.addVolatile('flinch', q));
		const move = Dex.getActiveMove('aurasphere');
		battle.runEvent('ModifyMove', p, q, move, move);
		assert.equal(move.multihit, 2);
		assert(battle.runEvent('BasePower', p, q, move, 40) > 40);
	});
	it('copied Aura Master retains original contact reduction on a nonrecipient', () => {
		const [p, q] = setup('Mew', 'Aura Master');
		assert.equal(battle.runEvent('ModifyDamage', q, p, Dex.getActiveMove('tackle'), 100), 50);
	});
	it('Illusion uses the disguise passive including Scraftys one-eighth recovery variant', () => {
		const [p, q] = setup('Mew');
		q.formeChange('Scrafty-Mega', null, true);
		p.illusion = q;
		p.hp = 100;
		battle.randomChance = () => true;
		assert.deepEqual(p.getPassives(), ['shedskin']);
		battle.runEvent('Residual', p);
		assert.equal(p.hp, 250);
		p.illusion = null;
		assert.deepEqual(p.getPassives(), ['synchronize']);
	});
});
describe('Sinnoh Unova calculator parity', () => {
	it('matches direct seeded incoming damage for every approved recipient', () => {
		const { calculateScenario, validateScenario, buildCalculatorBattle } = require('../../../dist/sim/custom-calculator');
		for (const [id, passive] of Object.entries(approved)) {
			const species = Dex.species.get(id);
			const input = { format: 'gen9nofieldsinglesgame', move: 'Tackle', samples: 8, seed: 123,
				actors: [{ species: 'Mew', ability: 'No Ability' }, { species: species.name, ability: species.abilities[0] },
					{ species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }] };
			const result = calculateScenario(input), damages = [];
			assert.deepEqual(result.resolved.actors[1].passives, [passive], id);
			for (let sample = 0; sample < input.samples; sample++) {
				const { battle: local, mons } = buildCalculatorBattle(validateScenario(input), sample);
				try {
					const hp = mons[1].hp;
					local.actions.runMove(local.dex.moves.get('tackle'), mons[0], mons[0].getLocOf(mons[1]));
					damages.push(hp - mons[1].hp);
				} finally { local.destroy(); }
			}
			assert.equal(result.results[1].minNetLoss, Math.min(...damages), id);
			assert.equal(result.results[1].maxNetLoss, Math.max(...damages), id);
		}
	});
});
