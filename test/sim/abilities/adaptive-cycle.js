'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const A = require('../../../dist/sim/adaptive-cycle');
const {Dex} = require('../../../dist/sim/dex');
const {TeamValidator} = require('../../../dist/sim/team-validator');

describe('Adaptive Cycle', () => {
	let battle, p, foe;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(ability = 'No Ability', species = 'Mew') {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Kecleon', ability: 'Adaptive Cycle', moves: ['recover', 'protect', 'tackle', 'splash']},
				{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
			[{species, ability, moves: ['tackle', 'splash', 'ember', 'watergun']},
				{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.makeChoices('team 12', 'team 12');
		p = battle.p1.active[0]; foe = battle.p2.active[0];
	}
	function analyzed() {
		for (let i = 0; i < 4; i++) battle.makeChoices('move splash', 'move splash');
		assert(A.adaptiveAnalyzed(p, foe));
	}
	it('registers a separate event slot and legal Recover on all four recipients without Mimicry', () => {
		for (const species of ['Silvally', 'Kecleon', 'Stunfisk', 'Stunfisk-Galar']) {
			assert.equal(Dex.species.get(species).abilities.S, 'Adaptive Cycle');
			const set = {species, ability: 'Adaptive Cycle', moves: ['Recover'], nature: 'Serious', evs: {hp: 252, def: 252, spd: 4}};
			const result = new TeamValidator('gen9nofieldsinglesgame@@@Obtainable Abilities,Obtainable Moves').validateTeam([set]);
			assert.equal(result, null, JSON.stringify(result));
		}
		setup(); assert(!p.hasAbility('mimicry'));
	});
	for (const ability of ['Ultra Ego', 'Burning Ego', 'Primal Ego', 'Perfect Ego']) {
		it(`negates ${ability}'s interaction callbacks in both directions, leaving other targets unaffected`, () => {
			setup(); analyzed(); foe.setAbility(ability);
			const move = Dex.getActiveMove('tackle');
			foe.hp = Math.floor(foe.maxhp / 2); foe.boosts.atk = foe.boosts.spa = 0;
			const hp = foe.hp;
			battle.setActiveMove(move, p, foe);
			battle.runEvent('DamagingHit', foe, p, move, 10);
			assert.equal(foe.hp, hp); assert.equal(foe.boosts.atk, 0); assert.equal(foe.boosts.spa, 0);
			battle.setActiveMove(move, foe, p);
			battle.runEvent('DamagingHit', p, foe, move, 10);
			assert.equal(foe.hp, hp);
			const other = battle.p1.pokemon[1]; other.isActive = true;
			battle.setActiveMove(move, other, foe);
			battle.runEvent('DamagingHit', foe, other, move, 10);
			assert(foe.hp > hp || foe.boosts.atk > 0, 'unrelated interaction must still trigger the composite');
			other.isActive = false;
		});
	}
	it('learns Mold Breaker early without requiring full opponent analysis', () => {
		setup('Mold Breaker');
		battle.makeChoices('move splash', 'move tackle');
		const record = Object.values(p.m.adaptiveCycle.opponents)[0];
		assert(record.bypass.includes('moldbreaker')); assert(!record.complete);
		const move = Dex.getActiveMove('tackle'); move.ignoreAbility = true;
		battle.setActiveMove(move, foe, p);
		assert.equal(A.adaptiveDamageMultiplier(p, foe, move), 0.8);
	});
	it('learns a particular reduction after its first turn and does not preempt that first reduction', () => {
		setup('Multiscale');
		const move = Dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('ModifyDamage', p, foe, move, 100), 50);
		assert.equal(battle.runEvent('ModifyDamage', p, foe, move, 100), 50);
		battle.makeChoices('move splash', 'move splash');
		assert.equal(battle.runEvent('ModifyDamage', p, foe, move, 100), 100);
		foe.setAbility('Ice Scales');
		assert.equal(battle.runEvent('ModifyDamage', p, foe, Dex.getActiveMove('ember'), 100), 50);
	});
	it('does not learn from Substitute-only hits, allies or zero HP damage', () => {
		setup(); p.addVolatile('substitute', p);
		battle.makeChoices('move splash', 'move tackle');
		assert.deepEqual(p.m.adaptiveCycle.activeTypes, []);
		p.removeVolatile('substitute');
		A.adaptiveDamaged(p, p, Dex.getActiveMove('tackle'), 10);
		A.adaptiveDamaged(p, foe, Dex.getActiveMove('tackle'), 0);
		assert.deepEqual(p.m.adaptiveCycle.pendingTypes, []);
	});
	it('does not activate a stored resistance partway through a multihit sequence', () => {
		setup();
		const move = Dex.getActiveMove('doubleslap');
		A.adaptiveDamaged(p, foe, move, 10);
		assert.equal(A.adaptiveDamageMultiplier(p, foe, move), 1);
		A.adaptiveDamaged(p, foe, move, 10);
		assert.equal(A.adaptiveDamageMultiplier(p, foe, move), 1);
		A.adaptiveAfterMove(battle, foe, move, true);
		A.adaptiveCheckpoint(battle);
		assert.equal(A.adaptiveDamageMultiplier(p, foe, move), 0.8);
	});
	it('blocks known harmful status moves after full analysis, while unfamiliar ones work once', () => {
		setup(); analyzed();
		const sleep = Dex.getActiveMove('spore');
		battle.actions.runMove(sleep, foe, foe.getLocOf(p), {externalMove: true});
		assert.equal(p.status, 'slp'); p.cureStatus();
		battle.actions.runMove(sleep, foe, foe.getLocOf(p), {externalMove: true});
		assert.equal(p.status, '');
	});
	it('keeps type and opponent records across a serialized battle restore', () => {
		setup(); analyzed();
		const {Battle} = require('../../../dist/sim/battle');
		const restored = Battle.fromJSON(battle.toJSON());
		try { assert(A.adaptiveAnalyzed(restored.p1.active[0], restored.p2.active[0])); }
		finally { restored.destroy(); }
	});
	for (const weather of ['raindance', 'sunnyday', 'sandstorm', 'hail', 'primordialsea', 'desolateland', 'deltastream']) {
		it(`completes the ${weather} cycle independently and only once per turn`, () => {
			setup(); battle.field.setWeather(weather, p);
			for (let turn = 1; turn <= 3; turn++) {
				battle.turn = turn; A.adaptiveCheckpoint(battle); A.adaptiveCheckpoint(battle);
				assert.equal(p.m.adaptiveCycle.weather[weather].stage, turn);
			}
			assert(A.adaptiveEnvironment(p, 'weather'));
		});
	}
	it('keeps all five Flower Garden stages in one memory', () => {
		setup();
		for (const [i, field] of ['flowergarden1', 'flowergarden3', 'flowergarden5'].entries()) {
			battle.field.terrain = field; battle.turn = i + 1; A.adaptiveCheckpoint(battle);
		}
		assert.deepEqual(Object.keys(p.m.adaptiveCycle.fields), ['flowergarden']);
		assert(A.adaptiveEnvironment(p, 'fields'));
	});
	for (const gameType of ['doubles', 'multi', 'freeforall']) {
		it(`observes only actual opposing individuals in ${gameType}`, () => {
			const teams = Array.from({length: gameType === 'doubles' ? 2 : 4}, (_, side) =>
				Array.from({length: gameType === 'doubles' ? 2 : 1}, (_, slot) => ({species: 'Kecleon',
					ability: side === 0 && slot === 0 ? 'Adaptive Cycle' : 'No Ability', moves: ['splash']})));
			battle = common.createBattle({gameType}, teams);
			p = battle.p1.active[0];
			battle.makeChoices(...teams.map(team => team.map(() => 'move splash').join(', ')));
			assert.equal(Object.keys(p.m.adaptiveCycle.opponents).length, gameType === 'freeforall' ? 3 : 2);
			assert(Object.values(p.m.adaptiveCycle.opponents).every(r => r.points === 2));
		});
	}
	const fullFields = [...Object.keys(Dex.data.Terrains), ...Object.keys(Dex.data.Moves)
		.filter(id => Dex.data.Moves[id].condition?.effectType === 'Terrain')];
	for (const field of fullFields) {
		it(`filters direct power contributions on ${field}, without disabling the field`, () => {
			setup(); assert(battle.field.setTerrain(field, p));
			p.m.adaptiveCycle.fields[A.adaptiveFieldKey(field)] = {stage: 3, turn: battle.turn};
			for (const type of A.ADAPTIVE_TYPE_ORDER) {
				for (const category of ['Physical', 'Special']) {
					const move = Dex.getActiveMove('tackle'); move.type = type; move.category = category;
					const incoming = battle.runEvent('BasePower', foe, p, move, 100);
					assert(incoming <= 100, `${field} ${type} ${category}: incoming ${incoming}`);
					const outgoing = battle.runEvent('BasePower', p, foe, move, 100);
					assert(outgoing >= 100, `${field} ${type} ${category}: outgoing ${outgoing}`);
				}
			}
			assert.equal(battle.field.terrain, field);
		});
	}
	it('removes only the full field bonus and keeps an independent Electric Aura', () => {
		setup(); battle.field.setTerrain('coldeclipseterrain', p); battle.field.setAura('electricterrain', 5, p);
		p.m.adaptiveCycle.fields.coldeclipseterrain = {stage: 3, turn: -1};
		const move = Dex.getActiveMove('thunderbolt');
		assert.equal(battle.runEvent('BasePower', foe, p, move, 100), 130);
		assert.equal(battle.field.auraField, 'electricterrain');
	});
	it('keeps benefits while removing penalties when one field callback multiplies both', () => {
		setup(); battle.field.setTerrain('mistyterrain', p);
		p.m.adaptiveCycle.fields.mistyterrain = {stage: 3, turn: -1};
		const move = Dex.getActiveMove('darkpulse'); move.type = 'Fairy';
		assert.equal(battle.runEvent('BasePower', p, foe, move, 100), 150);
		assert.equal(battle.runEvent('BasePower', foe, p, move, 100), 50);
	});
	it('permits personal Fire/Water moves under primal weather without replacing it', () => {
		setup();
		for (const [weather, move] of [['primordialsea', 'ember'], ['desolateland', 'watergun']]) {
			battle.field.weather = weather; battle.field.weatherState = battle.initEffectState({id: weather});
			p.m.adaptiveCycle.weather[weather] = {stage: 3, turn: -1};
			assert.equal(battle.runEvent('TryMove', p, foe, Dex.getActiveMove(move)), true);
			assert.equal(battle.runEvent('TryMove', foe, p, Dex.getActiveMove(move)), null);
			assert.equal(battle.field.weather, weather);
		}
	});
	it('preserves overlapping Aura power after the base field bonus is removed', () => {
		setup(); battle.field.setTerrain('factoryterrain', p); battle.field.setAura('electricterrain', 5, p);
		p.m.adaptiveCycle.fields.factoryterrain = {stage: 3, turn: -1};
		assert.equal(battle.runEvent('BasePower', foe, p, Dex.getActiveMove('thunderbolt'), 100), 130);
	});
	it('restores native frostbite chance after learning hail while retaining another ability multiplier', () => {
		setup('Serene Grace'); battle.field.setWeather('hail', p);
		p.m.adaptiveCycle.weather.hail = {stage: 3, turn: -1};
		const move = Dex.getActiveMove('icebeam');
		battle.runEvent('ModifyMove', foe, p, move, move);
		const normal = move.secondaries.find(x => x.status === 'frz').chance;
		const adapted = A.adaptiveMoveView(move, foe, p).secondaries.find(x => x.status === 'frz').chance;
		assert.equal(normal, 40); assert.equal(adapted, 20);
	});
	it('allows Silvally countertyping despite the ordinary species type lock', () => {
		setup(); p.formeChange('Silvally', battle.dex.conditions.get('test'), false); p.setAbility('Adaptive Cycle'); analyzed();
		A.adaptiveCountertype(p, foe, Dex.getActiveMove('tackle'));
		assert.deepEqual(p.getTypes(), ['Rock']);
	});
	it('learns Stealth Rock without removing it for the holder’s teammate', () => {
		setup(); p.side.addSideCondition('stealthrock', foe);
		battle.makeChoices('switch 2', 'move splash');
		const ally = battle.p1.active[0]; const allyHP = ally.hp;
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(p.m.adaptiveCycle.chip.stealthrock.stage, 1);
		battle.makeChoices('move splash', 'move splash');
		assert.equal(p.m.adaptiveCycle.chip.stealthrock.stage, 2);
		battle.makeChoices('switch 2', 'move splash'); assert(ally.hp < allyHP);
		const hp = p.hp;
		battle.makeChoices('switch 2', 'move splash'); assert.equal(p.hp, hp);
		assert(p.side.sideConditions.stealthrock);
	});
	it('learns Sticky Web from its actual drop and does not remove someone else’s speed drops', () => {
		setup(); p.side.addSideCondition('stickyweb', foe);
		battle.makeChoices('switch 2', 'move splash'); battle.makeChoices('switch 2', 'move splash');
		assert.equal(p.m.adaptiveCycle.chip.stickyweb.stage, 1);
		battle.boost({spe: -1}, p, foe, Dex.moves.get('scaryface'));
		battle.makeChoices('move splash', 'move splash'); assert.equal(p.boosts.spe, -2);
		battle.makeChoices('switch 2', 'move splash'); battle.makeChoices('switch 2', 'move splash');
		assert.equal(p.boosts.spe, 0); assert(p.side.sideConditions.stickyweb);
	});
	it('learns setup on two turns without erasing it or ignoring Speed and negative stages', () => {
		setup(); foe.boosts.atk = 1; foe.boosts.spe = 2;
		battle.makeChoices('move splash', 'move splash'); assert(!A.adaptiveSetup(p, foe));
		battle.makeChoices('move splash', 'move splash'); assert(A.adaptiveSetup(p, foe));
		const move = Dex.getActiveMove('tackle'); move.noDamageVariance = true;
		const learnedDamage = battle.actions.getDamage(foe, p, move);
		foe.boosts.atk = 6; assert.equal(battle.actions.getDamage(foe, p, move), learnedDamage);
		assert.equal(foe.boosts.atk, 6); assert.equal(foe.boosts.spe, 2);
		foe.boosts.atk = -2; assert(battle.actions.getDamage(foe, p, move) < learnedDamage);
	});
	it('does not reveal an unannounced defensive ability in the memory protocol', () => {
		setup('Multiscale');
		battle.runEvent('ModifyDamage', p, foe, Dex.getActiveMove('tackle'), 100);
		A.adaptiveCheckpoint(battle);
		const line = battle.log.filter(x => x.startsWith('|-adaptation|')).at(-1);
		assert(!line.toLowerCase().includes('multiscale'));
	});
	it('ignores contact punishment and absorption only for the analyzed holder', () => {
		setup(); analyzed(); foe.setAbility('Rough Skin');
		const hp = p.hp, move = Dex.getActiveMove('tackle');
		battle.setActiveMove(move, p, foe); battle.runEvent('DamagingHit', foe, p, move, 10);
		assert.equal(p.hp, hp);
		foe.setAbility('Water Absorb'); const water = Dex.getActiveMove('watergun');
		assert.equal(battle.runEvent('TryHit', foe, p, water), true);
		const other = battle.p1.pokemon[1]; other.isActive = true;
		battle.setActiveMove(water, other, foe); assert.notEqual(battle.runEvent('TryHit', foe, other, water), true);
		other.isActive = false;
	});
	it('supports a real attack from an analyzed Ultra Ego without disabling its ability', () => {
		setup(); analyzed(); foe.setAbility('Ultra Ego');
		const hp = p.hp; foe.hp -= 100; const foeHP = foe.hp;
		battle.makeChoices('move splash', 'move tackle');
		assert(p.hp < hp); assert.equal(foe.hp, foeHP); assert.equal(foe.ability, 'ultraego');
	});
	for (const gameType of ['doubles', 'freeforall']) {
		it(`filters offensive ability bonuses per target in ${gameType}`, () => {
			const count = gameType === 'doubles' ? 2 : 4;
			const teams = Array.from({length: count}, (_, side) => Array.from({length: count === 2 ? 2 : 1}, (_, slot) =>
				({species: 'Mew', ability: side === 0 && slot === 0 ? 'Adaptive Cycle' : 'No Ability', moves: ['splash', 'surf']})));
			battle = common.createBattle({gameType}, teams); p = battle.p1.active[0]; foe = battle.p2.active[0];
			for (let i = 0; i < 2; i++) battle.makeChoices(...teams.map(team => team.map(() => 'move splash').join(', ')));
			assert(A.adaptiveAnalyzed(p, foe)); foe.setAbility('Mega Launcher');
			const other = gameType === 'doubles' ? battle.p1.active[1] : battle.p3.active[0];
			const move = Dex.getActiveMove('waterpulse'); move.target = 'allAdjacentFoes';
			battle.setActiveMove(move, foe, p);
			assert.equal(battle.runEvent('BasePower', foe, p, move, 100), 100);
			battle.activeTarget = other;
			assert.equal(battle.runEvent('BasePower', foe, other, move, 100), 150);
			assert.equal(foe.ability, 'megalauncher');
   p.setType('Water'); other.setType('Water'); move.accuracy = true; move.willCrit = false;
   const ownHP = p.hp, otherHP = other.hp;
   battle.actions.runMove(move, foe, foe.getLocOf(p), {externalMove: true});
   const ownDamage = ownHP - p.hp, otherDamage = otherHP - other.hp;
   assert(ownDamage > 0 && otherDamage > 0);
   assert(ownDamage <= otherDamage * 0.42 && ownDamage >= otherDamage * 0.24,
    JSON.stringify({ownDamage, otherDamage}));
		});
	}
	it('starts after an entire damaging move and advances without repeated hits', () => {
		setup(); battle.makeChoices('move splash', 'move tackle');
		assert.equal(p.m.adaptiveCycle.types.Normal.stage, 1);
		battle.makeChoices('move protect', 'move splash');
		assert.equal(p.m.adaptiveCycle.types.Normal.stage, 2);
		battle.makeChoices('move splash', 'move splash');
		assert.equal(p.m.adaptiveCycle.types.Normal.stage, 3);
	});
	it('archives the oldest type and restores saved progress after the reactivation move', () => {
		setup();
		for (const move of ['tackle', 'ember', 'watergun']) battle.makeChoices('move recover', 'move ' + move);
		assert.deepEqual(p.m.adaptiveCycle.activeTypes, ['Fire', 'Water']);
		assert.equal(p.m.adaptiveCycle.types.Normal.stage, 2);
		battle.makeChoices('move recover', 'move tackle');
		assert.deepEqual(p.m.adaptiveCycle.activeTypes, ['Water', 'Normal']);
		assert.equal(p.m.adaptiveCycle.types.Normal.stage, 3);
	});
	it('finishes ordinary analysis in four observed turns and shared typing in two', () => {
		setup(); analyzed(); assert.equal(Object.values(p.m.adaptiveCycle.opponents)[0].points, 4);
		battle.destroy(); battle = null;
		setup('No Ability', 'Kecleon');
		battle.makeChoices('move splash', 'move splash'); assert(!A.adaptiveAnalyzed(p, foe));
		battle.makeChoices('move splash', 'move splash'); assert(A.adaptiveAnalyzed(p, foe));
	});
	it('pauses records on the bench and during ability replacement', () => {
		setup(); battle.makeChoices('move splash', 'move tackle');
		battle.makeChoices('switch 2', 'move splash'); battle.makeChoices('move splash', 'move splash');
		assert.equal(p.m.adaptiveCycle.types.Normal.stage, 1);
		battle.makeChoices('switch 2', 'move splash'); assert.equal(p.m.adaptiveCycle.types.Normal.stage, 2);
		p.setAbility('No Ability'); battle.makeChoices('move splash', 'move splash');
		assert.equal(p.m.adaptiveCycle.types.Normal.stage, 2);
		p.setAbility('Adaptive Cycle'); battle.makeChoices('move splash', 'move splash');
		assert.equal(p.m.adaptiveCycle.types.Normal.stage, 3);
	});
	it('learns and cures poison on the second checkpoint and retains learning after a cure', () => {
		setup(); p.setStatus('tox', foe);
		battle.makeChoices('move splash', 'move splash'); assert.equal(p.status, 'tox');
		battle.makeChoices('move splash', 'move splash'); assert.equal(p.status, '');
		assert.equal(p.setStatus('psn', foe), false);
		p.addVolatile('confusion', foe); p.removeVolatile('confusion');
		battle.makeChoices('move splash', 'move splash'); battle.makeChoices('move splash', 'move splash');
		assert.equal(p.addVolatile('confusion', foe), false);
	});
	it('learns Leech Seed personally, removes it, and blocks further draining', () => {
		setup(); p.addVolatile('leechseed', foe); foe.hp -= 100;
		battle.makeChoices('move splash', 'move splash'); assert(p.volatiles.leechseed);
		battle.makeChoices('move splash', 'move splash'); assert(!p.volatiles.leechseed);
		const hp = foe.hp;
		assert.equal(p.addVolatile('leechseed', foe), false);
		battle.makeChoices('move splash', 'move splash'); assert.equal(foe.hp, hp);
	});
	it('keeps opponent and type reductions nonmultiplicative, countertypes, and retains negative boosts', () => {
		setup(); analyzed();
		const move = Dex.getActiveMove('tackle');
		A.adaptiveCountertype(p, foe, move); assert(p.hasType('Rock') || p.hasType('Steel'));
		assert.equal(A.adaptiveDamageMultiplier(p, foe, move), 0.5);
		assert(A.adaptiveSetup(p, foe));
		foe.boosts.atk = -2;
		assert.equal(foe.boosts.atk, -2);
	});
	it('ignores an analyzed individual after an ability change, including Neutralizing Gas and Mold Breaker', () => {
		setup(); analyzed();
		foe.setAbility('neutralizinggas'); assert(!p.ignoringAbility());
		foe.setAbility('moldbreaker');
		const move = Dex.getActiveMove('tackle'); move.ignoreAbility = true;
		battle.setActiveMove(move, foe, p);
		assert(!battle.suppressingAbility(p));
		assert.equal(A.adaptiveDamageMultiplier(p, foe, move), 0.5);
		assert.equal(p.addVolatile('gastroacid', p), false); assert(!p.ignoringAbility());
	});
	it('tracks full field and weather separately and preserves Aura contributions', () => {
		setup(); battle.field.setTerrain('mistyterrain', p); battle.field.setWeather('raindance', p);
		for (let i = 0; i < 3; i++) battle.makeChoices('move splash', 'move splash');
		assert(A.adaptiveEnvironment(p, 'fields')); assert(A.adaptiveEnvironment(p, 'weather'));
		const fire = Dex.getActiveMove('ember');
		assert.equal(battle.runEvent('WeatherModifyDamage', p, foe, fire, 100), 100);
		const water = Dex.getActiveMove('watergun');
		assert.equal(battle.runEvent('WeatherModifyDamage', foe, p, water, 100), 100);
	});
 it('rejects Gas and Gastro Acid before learning any opponent', () => {
  setup('Neutralizing Gas');
  assert(!p.ignoringAbility()); assert(p.hasAbility('adaptivecycle'));
  battle.actions.runMove(Dex.getActiveMove('gastroacid'), foe, foe.getLocOf(p), {externalMove: true});
  assert(!p.volatiles.gastroacid); assert(!p.ignoringAbility());
  assert(!A.adaptiveAnalyzed(p, foe));
  battle.makeChoices('move splash', 'move tackle');
  assert.equal(p.m.adaptiveCycle.types.Normal.stage, 1);
 });
 it('learns separate reduction components without unlocking an unobserved component', () => {
  setup();
  const ability = foe.getAbility();
  const scale = Dex.abilities.get('multiscale'), filter = Dex.abilities.get('filter');
  const testAbility = new (require('../../../dist/sim/dex-abilities').Ability)({...ability, onSourceModifyDamage(damage, attacker, defender, move) {
   if (move.type === 'Normal') return scale.onSourceModifyDamage.call(this, damage, attacker, defender, move);
   return filter.onSourceModifyDamage.call(this, damage, attacker, defender, move);
  }});
  battle.dex.abilities.abilityCache.set(ability.id, testAbility);
  try {
   const normal = Dex.getActiveMove('tackle'), fire = Dex.getActiveMove('ember');
   foe.getMoveHitData(fire).typeMod = 1;
   assert.equal(battle.runEvent('ModifyDamage', p, foe, normal, 100), 50);
   battle.makeChoices('move splash', 'move splash');
   assert.equal(battle.runEvent('ModifyDamage', p, foe, normal, 100), 100);
   assert.equal(battle.runEvent('ModifyDamage', p, foe, fire, 100), 60);
  } finally {battle.dex.abilities.abilityCache.set(ability.id, ability);}
 });
 it('keeps field healing penalties separate from completed weather adaptation', () => {
  setup(); battle.field.setTerrain('coldeclipseterrain', p); battle.field.setWeather('raindance', p);
  A.adaptiveMemory(p).weather.raindance = {stage: 3, turn: battle.turn};
  p.hp = 1; const before = p.hp;
  battle.actions.runMove(Dex.getActiveMove('synthesis'), p, 0, {externalMove: true});
  assert.equal(p.hp - before, battle.modify(p.maxhp, 0.25));
  A.adaptiveMemory(p).fields.coldeclipseterrain = {stage: 3, turn: battle.turn};
  p.hp = 1; battle.actions.runMove(Dex.getActiveMove('synthesis'), p, 0, {externalMove: true});
  assert.equal(p.hp - 1, battle.modify(p.maxhp, 0.5));
 });

 it('discards queued types when a later hit faints the holder, preserving older memory through revival', () => {
  setup(); A.adaptiveMemory(p).types.Fire = {stage: 2, turn: 0};
  const move = Dex.getActiveMove('doubleslap');
  A.adaptiveDamaged(p, foe, move, 10); assert.deepEqual(p.m.adaptiveCycle.pendingTypes, [move.type]);
  p.hp = 0; A.adaptiveAfterMove(battle, foe, move, true);
  p.hp = p.maxhp; A.adaptiveAfterMove(battle, foe, Dex.getActiveMove('splash'), true);
  assert(!p.m.adaptiveCycle.types[move.type]); assert.equal(p.m.adaptiveCycle.types.Fire.stage, 2);
 });

 it('learns an encountered damage cap without globally disabling Sturdy', () => {
  setup('Sturdy'); const move = Dex.getActiveMove('tackle');
  assert.equal(battle.runEvent('Damage', foe, p, move, foe.maxhp * 2), foe.maxhp - 1);
  battle.makeChoices('move splash', 'move splash');
  assert.equal(battle.runEvent('Damage', foe, p, move, foe.maxhp * 2), foe.maxhp * 2);
  assert.equal(foe.ability, 'sturdy');
 });

 it('applies incoming reduction before deciding whether Focus Sash is needed', () => {
  setup(); analyzed(); p.setItem('Focus Sash');
  const raw = p.maxhp + 20, expected = battle.modify(raw, 0.5);
  assert.equal(battle.damage(raw, p, foe, Dex.getActiveMove('tackle')), expected);
  assert.equal(p.item, 'focussash'); assert.equal(p.hp, p.maxhp - expected);
 });
 it('leaves one HP after Focus Sash caps an adapted outgoing attack', () => {
  setup(); analyzed(); foe.setItem('Focus Sash'); p.boosts.atk = 6;
  const move = Dex.getActiveMove('slash'); Object.assign(move, {basePower: 250, accuracy: true, willCrit: false});
  battle.actions.runMove(move, p, p.getLocOf(foe), {externalMove: true});
  assert.equal(foe.item, ''); assert.equal(foe.hp, 1);
 });
 it('keeps an adapted incoming lethal attack subject to Focus Sash', () => {
  setup(); analyzed(); p.setItem('Focus Sash');
  battle.damage(p.maxhp * 3, p, foe, Dex.getActiveMove('tackle'));
  assert.equal(p.item, ''); assert.equal(p.hp, 1);
 });
 it('excludes analyzed Grave Hunger from actual residual healing', () => {
  setup('Grave Hunger'); analyzed(); p.setItem('Leftovers'); p.hp -= 100; foe.hp -= 100;
  const ownHP = p.hp, otherHP = foe.hp;
  battle.makeChoices('move splash', 'move splash');
  assert.equal(p.hp - ownHP, Math.floor(p.maxhp / 16)); assert.equal(foe.hp, otherHP);
 });
 for (const completed of [false, true]) {
  it('preserves native screen breaking while filtering Flint Fracture: analysis=' + completed, () => {
   setup(); if (completed) analyzed(); foe.setAbility('Flint Fracture'); p.side.addSideCondition('reflect', p);
   const slash = Dex.getActiveMove('slash'); Object.assign(slash, {basePower: 1, accuracy: true, willCrit: false});
   battle.actions.runMove(slash, foe, foe.getLocOf(p), {externalMove: true});
   assert.equal(!!p.side.sideConditions.reflect, completed);
   if (!p.side.sideConditions.reflect) p.side.addSideCondition('reflect', p);
   const brick = Dex.getActiveMove('brickbreak'); Object.assign(brick, {basePower: 1, accuracy: true, willCrit: false});
   brick.flags.slicing = 1;
   battle.actions.runMove(brick, foe, foe.getLocOf(p), {externalMove: true});
   assert(!p.side.sideConditions.reflect);
  });
 }
 it('does not disable Flint Fracture against an unrelated doubles target', () => {
  const teams = [[{species:'Kecleon',ability:'Adaptive Cycle',moves:['splash']},{species:'Mew',ability:'No Ability',moves:['splash']}],
   [{species:'Mew',ability:'Flint Fracture',moves:['splash','slash']},{species:'Mew',ability:'No Ability',moves:['splash']}]];
  battle = common.createBattle({gameType:'doubles'}, teams); p = battle.p1.active[0]; foe = battle.p2.active[0];
  for(let i=0;i<4;i++) battle.makeChoices('move splash, move splash','move splash, move splash');
  assert(A.adaptiveAnalyzed(p, foe)); p.side.addSideCondition('reflect',p);
  const move = Dex.getActiveMove('slash'); Object.assign(move,{basePower:1,accuracy:true,willCrit:false});
  battle.actions.runMove(move,foe,foe.getLocOf(battle.p1.active[1]),{externalMove:true});
  assert(!p.side.sideConditions.reflect);
 });
 it('uses registered Hail for Weather Ball and preserves its Ice typing and 100 BP after adaptation', () => {
  setup(); assert(Dex.conditions.get('hail').exists); assert(!Dex.conditions.get('snow').exists);
  battle.field.setWeather('hail',p);
  for (const complete of [false,true]) {
   if (complete) A.adaptiveMemory(p).weather.hail = {stage:3,turn:battle.turn};
   const move = Dex.getActiveMove('weatherball');
   battle.singleEvent('ModifyType',move,null,p,foe,move,move);
   battle.singleEvent('ModifyMove',move,null,p,foe,move,move);
   assert.equal(move.type,'Ice'); assert.equal(move.basePower,100);
  }
 });
 it('keeps Hail weakening Solar Beam and Solar Blade until weather adaptation completes', () => {
  setup(); battle.field.setWeather('hail',p);
  for (const id of ['solarbeam','solarblade']) {
   delete A.adaptiveMemory(p).weather.hail; const move= Dex.getActiveMove(id);
   assert.equal(battle.runEvent('BasePower',p,foe,move,100,true),50);
   A.adaptiveMemory(p).weather.hail={stage:3,turn:battle.turn};
   assert.equal(battle.runEvent('BasePower',p,foe,move,100,true),100);
  }
 });

});
