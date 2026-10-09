'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const approved = {...require('./hoenn-mega-approved.json'), ...require('./sinnoh-unova-mega-approved.json')};
let battle;
function setup(species, ability, doubles = false) {
	const set = (species = 'Mew', ability = 'No Ability') => ({ species, ability, moves: ['splash', 'tackle', 'protect', 'poisonfang'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [[set(species, ability || Dex.species.get(species).abilities[0]), set()], [set(), set()]]);
	battle.makeChoices('team 12', 'team 12');
	const p = battle.p1.active[0], q = battle.p2.active[0];
	if (p.species.id !== Dex.species.get(species).id) p.formeChange(species, null, true);
	battle.field.terrain = '';
	for (const side of battle.sides) for (const m of side.pokemon) m.hp = m.maxhp = m.baseMaxhp = 1200;
	return [p, q];
}
describe('Approved nine Hoenn Mega passive migrations', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	it('preserves the approved Hoenn splits alongside later migrations without changing selected slots', () => {
		for (const old of require('./hoenn-mega-before.json')) {
			const now = Dex.species.get(old.id);
			assert.deepEqual(now.passives, require('./passive-approval-overlays').current(old.id, old.passives), old.id);
			assert.deepEqual(now.abilities, require('./passive-approval-overlays').abilities(old.id, {...old.abilities}), old.id);
		}
	});
	for (const [id, passive] of Object.entries(approved)) it(id + ' gains its passive through real Mega evolution and Transform', () => {
		const s = Dex.species.get(id), choice = id === 'flygonmegaz' ? 'megax' : ['gardevoirvoidmega', 'chimechomegay'].includes(id) ? 'megay' : 'mega';
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species: s.baseSpecies, ability: 'No Ability', item: s.requiredItem, moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash ' + choice, 'move splash');
		const p = battle.p1.active[0], q = battle.p2.active[0];
		assert.equal(p.species.id, id);
		assert.deepEqual(p.getPassives(), [passive]);
		q.transformInto(p);
		assert.deepEqual(q.getPassives(), [passive]);
		p.addVolatile('gastroacid');
		assert.deepEqual(p.getPassives(), [passive]);
	});
	for (const id of ['flygonmega', 'flygonmegaz', 'claydolmega', 'chimechomega', 'chimechomegay']) it(id + ' keeps Levitate while suppressed but obeys Gravity and Iron Ball', () => {
		const [p] = setup(id);
		for (const suppressed of [false, true]) {
			if (suppressed) p.addVolatile('gastroacid');
			assert(!p.isGrounded());
			assert(!p.runImmunity('Ground'));
			battle.field.addPseudoWeather('gravity', p);
			assert(p.isGrounded());
			assert(p.runImmunity('Ground'));
			battle.field.removePseudoWeather('gravity');
			p.setItem('ironball');
			assert(p.isGrounded());
			assert(p.runImmunity('Ground'));
			p.clearItem();
		}
	});
	for (const [species, ability, passive, type, base, field] of [
		['Gardevoir-Mega-Z', 'Argent Devotion', 'armorize', 'Steel', 120, 'factoryterrain'],
		['Gardevoir-Void-Mega', 'Execution', 'duskilate', 'Dark', 130, 'starlightarenaterrain'],
	]) it(ability + ' converts and boosts once through its passive, including field power', () => {
		const [p, q] = setup(species);
		for (const suppressed of [false, true]) {
			if (suppressed) p.addVolatile('gastroacid');
			for (const terrain of ['', field]) {
				battle.field.terrain = terrain;
				const move = Dex.getActiveMove('tackle');
				battle.runEvent('ModifyType', p, q, move, move);
				assert.equal(move.type, type);
				assert.equal(battle.runEvent('BasePower', p, q, move, 100), terrain ? (passive === 'duskilate' ? 225 : 150) : base);
			}
		}
	});
	it('Execution retains its independent finisher, drop protection and KO recovery', () => {
		const [p, q] = setup('Gardevoir-Void-Mega');
		q.hp = 600;
		const move = Dex.getActiveMove('tackle');
		battle.runEvent('ModifyType', p, q, move, move);
		assert.equal(battle.runEvent('BasePower', p, q, move, 100), 260);
		battle.boost({ atk: -3, spa: -3 }, p, q);
		assert.equal(p.boosts.atk, -1);
		assert.equal(p.boosts.spa, -1);
		battle.field.terrain = 'factoryterrain';
		battle.boost({ spe: -2 }, p, q);
		assert.equal(p.boosts.spe, 0);
		p.hp = 100;
		battle.runEvent('AfterFaint', q, p, move, 1);
		assert.equal(p.hp, 250);
	});
	it('Argent Devotion retains Sworn Duty, Serene Grace and Mold Breaker', () => {
		const [p, q] = setup('Gardevoir-Mega-Z', undefined, true), ally = battle.p1.active[1];
		ally.hp = 100;
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(ally.hp, 400);
		const move = Dex.getActiveMove('bodyslam');
		battle.runEvent('ModifyMove', p, q, move, move);
		assert.equal(move.secondaries[0].chance, 60);
		assert(move.ignoreAbility);
	});
	it('Breloom uses Technician once with the local Factory threshold and retains Grass STAB', () => {
		const [p, q] = setup('Breloom-Mega');
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 40), 60);
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 70), 70);
		battle.field.terrain = 'factoryterrain';
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 70), 105);
		assert.equal(battle.runEvent('ModifySTAB', p, q, Dex.getActiveMove('leafblade'), 1), 1.5);
		assert(p.hasAbility('poisontouch'));
		assert(!p.hasAbility('corrosion'));
	});
	it('Desert Spirit retains one sandstorm, Tinted Lens and extra Ground STAB', () => {
		const [p, q] = setup('Flygon-Mega');
		assert.equal(battle.field.weather, 'sandstorm');
		const move = Dex.getActiveMove('earthquake');
		battle.runEvent('ModifyMove', p, q, move, move);
		assert(move.forceSTAB);
		q.getMoveHitData(move).typeMod = -1;
		assert.equal(battle.runEvent('ModifyDamage', p, q, move, 100), 200);
	});
	it('Tremor retains higher-stat sound attacks without category changes or Soundproof bypass', () => {
		const [p, q] = setup('Flygon-Mega-Z');
		p.storedStats.atk = 400;
		p.storedStats.spa = 100;
		const move = Dex.getActiveMove('hypervoice');
		battle.runEvent('ModifyMove', p, q, move, move);
		assert.equal(move.overrideOffensiveStat, 'atk');
		assert.equal(move.category, 'Special');
		assert(!move.ignoreAbility);
		assert.equal(battle.runEvent('BasePower', p, q, move, 100), 150);
		battle.field.terrain = 'desertterrain';
		move.type = 'Ground';
		assert.equal(battle.runEvent('BasePower', p, q, move, 100), 195);
		assert.equal(battle.runEvent('ModifySTAB', p, q, Dex.getActiveMove('bugbuzz'), 1), 1.5);
		battle.field.terrain = '';
		q.setAbility('Soundproof');
		battle.actions.useMove('hypervoice', p, { target: q });
		assert.equal(q.hp, 1200);
	});
	it('Tremor retains allied sound power and friendly sound protection', () => {
		const [p, q] = setup('Flygon-Mega-Z', undefined, true), ally = battle.p1.active[1];
		assert.equal(battle.runEvent('BasePower', ally, q, Dex.getActiveMove('hypervoice'), 100), 150);
		battle.actions.useMove('boomburst', p);
		assert.equal(ally.hp, 1200);
		assert(q.hp < 1200);
	});
	it('Sirius keeps Poison Fang at one 1.5x multiplier with its Dragon and custom matchup effects', () => {
		const [p, q] = setup('Seviper-Mega');
		const move = Dex.getActiveMove('poisonfang');
		battle.runEvent('ModifyMove', p, q, move, move);
		assert.equal(move.type, 'Dragon');
		assert(move.breaksProtect);
		assert.equal(battle.runEvent('BasePower', p, q, move, 100), 150);
		for (const type of ['Poison', 'Steel']) assert.equal(move.onEffectiveness.call(battle, -1, q, type, move), 1);
		assert(move.secondaries.some(s => s.chance === 30 && s.status === 'tox'));
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('crunch'), 100), 150);
	});
	it('Sirius preserves Wasteland replacement order and does not acquire full Corrosion', () => {
		const [p, q] = setup('Seviper-Mega');
		battle.field.terrain = 'wastelandterrain';
		const move = Dex.getActiveMove('poisonfang');
		battle.runEvent('ModifyMove', p, q, move, move);
		assert.deepEqual(move.secondaries.map(s => [s.chance, s.status]), [[2.5, 'frz'], [2.5, 'brn'], [2.5, 'par'], [2.5, 'psn'], [30, 'tox']]);
		assert(!p.hasAbility('corrosion'));
		q.setType('Steel');
		assert(!q.trySetStatus('tox', p, Dex.moves.get('toxic')));
	});
	it('Sirius retains full Shed Skin, entry accuracy and independent tail effects', () => {
		const [p, q] = setup('Seviper-Mega');
		assert.equal(p.boosts.accuracy, 1);
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('irontail'), 100), 150);
		p.hp = 100;
		battle.field.terrain = 'dragonsdenterrain';
		battle.runEvent('Residual', p);
		assert.equal(p.hp, 400);
		battle.field.terrain = '';
		battle.actions.useMove(Object.assign(Dex.getActiveMove('irontail'), { accuracy: true }), p, { target: q });
		assert.equal(q.status, 'tox');
	});
	for (const id of ['claydolmega', 'chimechomegay']) it(id + ' deliberately retains full Elevate beside passive Levitate with only one KO boost', () => {
		const [p, q] = setup(id);
		assert.equal(p.hasAbility('elevate'), id === 'claydolmega');
		assert(p.hasAbilityOrPassive('levitate'));
		assert(!p.getAbilityComponentExclusions().includes('levitate'));
		battle.runEvent('AfterFaint', q, p, Dex.getActiveMove('tackle'), 1);
		assert.equal(Object.values(p.boosts).reduce((a, b) => a + b, 0), id === 'claydolmega' ? 1 : 0);
	});
	it('Wind Chime retains Armorize and Punk Rock, while Haunted Chime keeps Wind Power and Cursed Body', () => {
		const [p, q] = setup('Chimecho-Mega');
		const move = Dex.getActiveMove('hypervoice');
		battle.runEvent('ModifyType', p, q, move, move);
		assert.equal(move.type, 'Steel');
		assert.equal(battle.runEvent('BasePower', p, q, move, 100), 156);
		p.formeChange('Chimecho-Mega-Y', null, true);
		assert(p.hasAbility('windpower'));
		assert(p.hasAbility('cursedbody'));
		assert(!p.hasAbility('elevate'));
		assert.deepEqual(p.getPassives(), ['levitate']);
	});
	it('nonrecipient Sirius and direct Ground-immunity packages preserve their original behavior', () => {
		const [p, q] = setup('Mew', 'Sirius');
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('poisonfang'), 100), 150);
		for (const ability of ['Tremor', 'Wind Chime']) {
			p.setAbility(ability);
			assert(!p.runImmunity('Ground'));
		}
	});
	it('calculator resolves the approved Seviper passive without replacing Sirius', () => {
		const { calculateScenario } = require('../../../dist/sim/custom-calculator');
		const input = { format: 'gen9nofieldsinglesgame', move: 'Poison Fang', samples: 16, seed: 42, actors: [{ species: 'Seviper-Mega', ability: 'Sirius' }, { species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }] };
		const result = calculateScenario(input);
		assert.deepEqual(result.resolved.actors[0].passives, ['venamskiss']);
		assert(result.results[1].max > 0);
	});
	it('Venams Kiss passive poisons Steel and Poison foes once, drains only pre-poisoned HP hits and slows them', () => {
		const [p, q] = setup('Seviper-Mega');
		p.hp = 100;
		q.setType(['Steel', 'Poison']);
		const hit = () => {
			battle.actions.useMove(Object.assign(Dex.getActiveMove('sludgebomb'), { damage: 60, accuracy: true, secondaries: undefined }), p, { target: q });
			battle.clearActiveMove();
		};
		hit();
		assert.equal(q.status, 'psn');
		assert.equal(p.hp, 100);
		assert.equal(battle.runEvent('ModifySpe', q, null, null, 100), 75);
		hit();
		assert.equal(p.hp, 120);
		assert.equal(q.volatiles.healblock.duration, 2);
		p.addVolatile('gastroacid');
		hit();
		assert.equal(p.hp, 140);
		assert.equal(battle.runEvent('ModifySpe', q, null, null, 100), 75);
	});
	it('Venams Kiss Steel matchup overlaps Apex Venom once and preserves other type contributions', () => {
		const [p, q] = setup('Seviper-Mega');
		battle.randomizer = n => n;
		const hit = types => {
			q.setType(types);
			q.hp = 1200;
			q.cureStatus();
			battle.actions.useMove(Object.assign(Dex.getActiveMove('sludgebomb'), { accuracy: true, willCrit: false, secondaries: undefined }), p, { target: q });
			return 1200 - q.hp;
		};
		const normal = hit(['Normal']), steel = hit(['Steel']), both = hit(['Steel', 'Poison']);
		assert(steel >= normal * 1.95 && steel <= normal * 2.05);
		assert(both >= steel * 1.95 && both <= steel * 2.05);
	});
	it('Sirius first Poison Tail retains toxic instead of being preempted by passive regular poison', () => {
		const [p, q] = setup('Seviper-Mega');
		battle.actions.useMove(Object.assign(Dex.getActiveMove('poisontail'), { damage: 60, accuracy: true, secondaries: undefined }), p, { target: q });
		assert.equal(q.status, 'tox');
		assert(p.abilityState.used);
	});
	it('Dragon Poison Fang keeps Sirius power but does not trigger Poison-only passive drain or poison', () => {
		const [p, q] = setup('Seviper-Mega');
		p.hp = 100;
		q.status = 'psn';
		battle.actions.useMove(Object.assign(Dex.getActiveMove('poisonfang'), { damage: 60, accuracy: true, secondaries: undefined }), p, { target: q });
		assert.equal(p.hp, 100);
		assert(!q.volatiles.healblock);
		assert.equal(p.ability, 'sirius');
		assert(p.hasAbility('strongjaw'));
	});
	it('Venams Kiss drain caps across hits and is not added to native drain', () => {
		const [p, q] = setup('Seviper-Mega');
		p.hp = 100;
		q.hp = q.maxhp = q.baseMaxhp = 10000;
		q.status = 'psn';
		battle.actions.useMove(Object.assign(Dex.getActiveMove('sludgebomb'), { damage: 600, multihit: 3, accuracy: true, secondaries: undefined }), p, { target: q });
		assert.equal(p.hp, 400);
		p.removeVolatile('venamskissturn');
		p.hp = 100;
		battle.actions.useMove(Object.assign(Dex.getActiveMove('sludgebomb'), { damage: 60, drain: [1, 2], accuracy: true, secondaries: undefined }), p, { target: q });
		assert.equal(p.hp, 130);
	});
	it('Venams Kiss passive respects Liquid Ooze, Heal Block, Immunity, protection and Substitute', () => {
		const [p, q] = setup('Seviper-Mega');
		p.hp = 100;
		q.status = 'psn';
		q.setAbility('Liquid Ooze');
		const hit = () => {
			battle.actions.useMove(Object.assign(Dex.getActiveMove('sludgebomb'), { damage: 60, accuracy: true, secondaries: undefined }), p, { target: q });
			battle.clearActiveMove();
		};
		hit();
		assert.equal(p.hp, 80);
		q.setAbility('No Ability');
		p.addVolatile('healblock', q);
		hit();
		assert.equal(p.hp, 80);
		q.cureStatus();
		q.setAbility('Immunity');
		hit();
		assert.equal(q.status, '');
		q.setAbility('No Ability');
		q.addVolatile('protect');
		const hp = q.hp;
		hit();
		assert.equal(q.hp, hp);
		assert.equal(q.status, '');
		q.removeVolatile('protect');
		q.addVolatile('substitute');
		hit();
		assert.equal(q.hp, hp);
		assert.equal(q.status, '');
	});
	it('multiple active/passive Venams Kiss holders do not stack the Speed reduction', () => {
		const [p, q] = setup('Seviper-Mega', undefined, true), ally = battle.p1.active[1];
		ally.setAbility("Venam's Kiss");
		q.status = 'psn';
		assert.equal(battle.runEvent('ModifySpe', q, null, null, 100), 75);
		p.setAbility("Venam's Kiss");
		assert.equal(battle.runEvent('ModifySpe', q, null, null, 100), 75);
		p.addVolatile('gastroacid');
		ally.addVolatile('gastroacid');
		assert.equal(battle.runEvent('ModifySpe', q, null, null, 100), 75);
	});
	it('redundant selected Venams Kiss triggers only one poison attempt and one drain', () => {
		const [p, q] = setup('Seviper-Mega', "Venam's Kiss");
		p.hp = 100;
		q.status = 'psn';
		let attempts = 0;
		const original = q.trySetStatus;
		q.trySetStatus = function (...args) {
			attempts++;
			return original.apply(this, args);
		};
		battle.actions.useMove(Object.assign(Dex.getActiveMove('sludgebomb'), { damage: 60, accuracy: true, secondaries: undefined }), p, { target: q });
		assert.equal(attempts, 1);
		assert.equal(p.hp, 120);
	});
	it('Venams Kiss follows Illusion disguise passives and restores actual passives on reveal', () => {
		const [p, q] = setup('Mew');
		q.formeChange('Seviper-Mega', null, true);
		p.illusion = q;
		assert.deepEqual(p.getPassives(), ['venamskiss']);
		assert.deepEqual(p.getSwitchRequestData().passives, ['venamskiss']);
		q.status = 'psn';
		assert.equal(battle.runEvent('ModifySpe', q, null, null, 100), 75);
		p.illusion = null;
		assert.deepEqual(p.getPassives(), ['synchronize']);
		assert.equal(battle.runEvent('ModifySpe', q, null, null, 100), 100);
	});
	for (const move of ['Poison Fang', 'Sludge Bomb']) it(move + ' calculator damage matches direct seeded battle execution', () => {
		const { calculateScenario, validateScenario, buildCalculatorBattle } = require('../../../dist/sim/custom-calculator');
		const input = { format: 'gen9nofieldsinglesgame', move, samples: 16, seed: 42, actors: [{ species: 'Seviper-Mega', ability: 'Sirius' }, { species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }] };
		const result = calculateScenario(input), damage = [];
		for (let sample = 0;
			sample < input.samples;
			sample++) {
			const { battle: local, mons } = buildCalculatorBattle(validateScenario(input), sample);
			try {
				const before = mons[1].hp;
				local.actions.runMove(local.dex.moves.get(move), mons[0], mons[0].getLocOf(mons[1]));
				damage.push(before - mons[1].hp);
			} finally {
				local.destroy();
			}
		}
		assert.equal(result.results[1].min, Math.min(...damage));
		assert.equal(result.results[1].max, Math.max(...damage));
	});
});
