'use strict';

const assert = require('assert').strict;
const common = require('../../common');

describe('Approved Conkeldurr, Seismitoad, and Frosmoth abilities', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });

	function singles(species, ability) {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species, ability, moves: ['splash', 'firepunch']},
		], [{species: 'Blissey', ability: 'No Ability', moves: ['splash', 'tackle']}]]);
		battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}

	it('exposes the approved slots and Frosmoth stats', () => {
		const [holder] = singles('Conkeldurr', 'Void Reprisal');
		assert.deepEqual(holder.species.abilities,
			{0: 'Void Reprisal', 1: 'Stamina', H: 'Wrecking Crew'});
		assert.equal(holder.hasAbility('guts'), true);
		assert.equal(battle.dex.species.get('Frosmoth').abilities[1], 'Silk Ward');
		assert.deepEqual(battle.dex.species.get('Frosmoth').baseStats,
			{hp: 75, atk: 55, def: 65, spa: 130, spd: 100, spe: 75});
	});

	it('Forge Grit keeps Guts and raises Defense only on the first foe hit while statused', () => {
		const [holder, foe] = singles('Conkeldurr', 'Forge Grit');
		assert(holder.trySetStatus('brn', foe));
		assert(battle.runEvent('ModifyAtk', holder, foe, battle.dex.getActiveMove('tackle'), 100) > 100);
		const tackle = battle.dex.getActiveMove('tackle');
		battle.singleEvent('DamagingHit', holder.getAbility(), holder.abilityState, holder, foe, tackle, 10);
		battle.singleEvent('DamagingHit', holder.getAbility(), holder.abilityState, holder, foe, tackle, 10);
		assert.equal(holder.boosts.def, 1);
	});

	it("Mason's Fist keeps Iron Fist and breaks opposing screens on a landed punch", () => {
		const [holder, foe] = singles('Conkeldurr', "Mason's Fist");
		const punch = battle.dex.getActiveMove('firepunch');
		assert.equal(holder.hasAbility('ironfist'), true);
		assert(battle.runEvent('BasePower', holder, foe, punch, 100) > 100);
		assert(foe.side.addSideCondition('reflect', foe));
		assert(foe.side.addSideCondition('lightscreen', foe));
		battle.singleEvent('SourceDamagingHit', holder.getAbility(), holder.abilityState, foe, holder, punch, 10);
		assert.equal(foe.side.getSideCondition('reflect'), null);
		assert.equal(foe.side.getSideCondition('lightscreen'), null);
	});

	it('Marsh Conduit absorbs Water and drops both foe Speeds only once per switch-in', () => {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species: 'Seismitoad', ability: 'Marsh Conduit', moves: ['splash']},
			{species: 'Mew', ability: 'No Ability', moves: ['splash']},
		], [
			{species: 'Blissey', ability: 'No Ability', moves: ['splash']},
			{species: 'Mew', ability: 'No Ability', moves: ['splash']},
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');
		const holder = battle.p1.active[0];
		const ally = battle.p1.active[1];
		const foes = battle.p2.active;
		assert(holder.hasAbility('waterabsorb'));
		holder.hp -= 30;
		const firstHp = holder.hp;
		const water = battle.dex.getActiveMove('surf');
		assert.equal(battle.singleEvent('TryHit', holder.getAbility(), holder.abilityState, holder, ally, water), null);
		assert(holder.hp > firstHp);
		assert.deepEqual(foes.map(foe => foe.boosts.spe), [-1, -1]);
		battle.singleEvent('TryHit', holder.getAbility(), holder.abilityState, holder, ally, water);
		assert.deepEqual(foes.map(foe => foe.boosts.spe), [-1, -1]);
	});

	it('Silk Ward halves the first super-effective hit, then wears off until switching', () => {
		const [holder, foe] = singles('Frosmoth', 'Silk Ward');
		const rock = battle.dex.getActiveMove('rockslide');
		holder.getMoveHitData(rock).typeMod = 2;
		const reduced = battle.runEvent('ModifyDamage', foe, holder, rock, 100);
		assert.equal(reduced, 50, JSON.stringify({used: holder.abilityState.used,
			typeMod: holder.getMoveHitData(rock).typeMod, log: battle.log.slice(-4)}));
		assert.equal(battle.runEvent('ModifyDamage', foe, holder, rock, 100), 100);
	});

	it('Swarm Drive rewards a non-pivot Bug KO while Lokix stays below 98 Speed', () => {
		const [holder, foe] = singles('Lokix', 'Swarm Drive');
		assert.deepEqual(holder.species.baseStats, {hp: 71, atk: 115, def: 78, spa: 52, spd: 67, spe: 97});
		assert.deepEqual(holder.species.abilities, {0: 'Swarm Drive', 1: 'Stakeout', H: 'Tinted Lens'});
		assert(holder.hasAbility('swarm'));
		battle.singleEvent('SourceAfterFaint', holder.getAbility(), holder.abilityState,
			foe, holder, battle.dex.getActiveMove('uturn'), 1);
		assert.equal(holder.boosts.spe, 0);
		battle.singleEvent('SourceAfterFaint', holder.getAbility(), holder.abilityState,
			foe, holder, battle.dex.getActiveMove('xscissor'), 1);
		assert.equal(holder.boosts.spe, 1);
		battle.singleEvent('SourceAfterFaint', holder.getAbility(), holder.abilityState,
			foe, holder, battle.dex.getActiveMove('xscissor'), 1);
		assert.equal(holder.boosts.spe, 1);
	});

	it('Mire Chorus converts sound moves and can poison on a noncontact sound hit', () => {
		const [holder, foe] = singles('Seismitoad', 'Mire Chorus');
		assert(holder.hasAbility('liquidvoice'));
		assert(holder.hasAbility('poisontouch'));
		const voice = battle.dex.getActiveMove('hypervoice');
		battle.singleEvent('ModifyType', holder.getAbility(), holder.abilityState, voice, holder);
		assert.equal(voice.type, 'Water');
		assert(battle.runEvent('BasePower', holder, foe, voice, 100) > 100);
		const oldRandomChance = battle.randomChance;
		battle.randomChance = () => true;
		battle.singleEvent('SourceDamagingHit', holder.getAbility(), holder.abilityState, foe, holder, voice, 10);
		battle.randomChance = oldRandomChance;
		assert.equal(foe.status, 'psn');
	});

	it('Bore Tunnel preserves Earth Eater and clears hazards once per switch-in', () => {
		const [holder, foe] = singles('Diggersby', 'Bore Tunnel');
		assert.deepEqual(holder.species.baseStats, {hp: 95, atk: 56, def: 98, spa: 50, spd: 98, spe: 83});
		assert.deepEqual(holder.species.abilities, {0: 'Huge Power', 1: 'Bore Tunnel', H: 'Fur Coat'});
		assert(holder.hasAbility('eartheater'));
		assert(holder.side.addSideCondition('stealthrock', foe));
		holder.hp -= 30;
		const previousHp = holder.hp;
		const quake = battle.dex.getActiveMove('earthquake');
		assert.equal(battle.singleEvent('TryHit', holder.getAbility(), holder.abilityState, holder, foe, quake), null);
		assert(holder.hp > previousHp);
		assert.equal(holder.side.getSideCondition('stealthrock'), null);
		assert(holder.side.addSideCondition('stealthrock', foe));
		battle.singleEvent('TryHit', holder.getAbility(), holder.abilityState, holder, foe, quake);
		assert(holder.side.getSideCondition('stealthrock'));
	});

	it('Cloyster redistributes bulk and gains Pearl Current as its hidden ability', () => {
		const [holder] = singles('Cloyster', 'Skill Link');
		assert.deepEqual(holder.species.baseStats, {hp: 50, atk: 95, def: 160, spa: 85, spd: 90, spe: 70});
		assert.deepEqual(holder.species.abilities,
			{0: 'Frozen Fortress', 1: 'Skill Link', H: 'Pearl Current'});
	});
});
