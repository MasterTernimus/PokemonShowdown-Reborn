'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim/dex');
const { abilityIncludesComponent } = require('../../../dist/data/ability-components');

describe('Approved roster follow-up', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function make(ability, species = 'Mew', foeAbility = 'No Ability', reserve = false) {
		const team = [{ species, ability, moves: ['splash', 'protect', 'voltswitch', 'counter'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }];
		if (reserve) team.push({ species: 'Blissey', ability: 'No Ability', moves: ['splash'] });
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [team, [
			{ species: 'Blissey', ability: foeAbility, moves: ['splash', 'tackle', 'psychic'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1, 2, 3'.slice(0, reserve ? 12 : 9), 'team 1, 2, 3');
		battle.p2.active[0].storedStats.def = 250;
		return [battle.p1.active[0], battle.p1.active[1], battle.p2.active[0], battle.p2.active[1]];
	}
	function hit(id, source, target) {
		const move = typeof id === 'string' ? battle.dex.getActiveMove(id) : id;
		move.accuracy = true;
		battle.actions.useMove(move, source, { target });
		battle.runEvent('AfterMove', source, target, battle.activeMove);
		return battle.activeMove;
	}
	function modify(id, source, target) {
		return battle.runEvent('ModifyMove', source, target, battle.dex.getActiveMove(id), battle.dex.getActiveMove(id));
	}
	it('assigns approved slots and searchable retained components', () => {
		for (const [species, slot, ability, component] of [
			['Nidoking', 'H', 'Sovereign Arsenal', 'Sovereign Arsenal'],
			['Kingler', '1', 'Titan Pincer', 'Hyper Cutter'], ['Steelix', '1', 'Iron Lash', 'Whiplash'],
			['Hariyama', 'H', 'Grit Grappler', 'Guts'], ['Krookodile', '1', 'Dread Jaw', 'Moxie'],
			['Beartic', '1', 'Floe Hunter', 'Slush Rush'], ['Escavalier', 'H', 'Lanceguard', 'Shell Armor'],
			['Primarina', 'H', 'Tidal Voice', 'Liquid Voice'], ['Vikavolt', '0', 'Hover Cannon', 'Levitate'],
			['Vikavolt', 'H', 'Recharge Relay', 'Battery'], ['Houndstone', 'H', 'Mourning Coat', 'Fluffy'],
			['Dondozo', '1', 'Dozing Giant', 'Oblivious'], ['Clodsire', '1', 'Quill Reservoir', 'Water Absorb'],
		]) {
			assert.equal(Dex.species.get(species).abilities[slot], ability);
			assert(abilityIncludesComponent(ability, component));
		}
		assert.equal(Dex.species.get('Dustox').abilities.H, 'Toxic Cocoon');
		assert.equal(Dex.species.get('Beautifly').abilities.H, 'Gale Bloom');
		assert(!abilityIncludesComponent('Twin Blades', 'Dual Wield'));
	});
	it('boosts already-Water Sparkling Aria exactly 1.3x and spares allies', () => {
		const [p, ally, foe] = make('Tidal Voice', 'Primarina');
		const move = battle.dex.getActiveMove('sparklingaria');
		assert.equal(battle.runEvent('BasePower', p, foe, move, 100, true), 130);
		assert.equal(battle.runEvent('BasePower', p, foe, battle.dex.getActiveMove('surf'), 100, true), 100);
		assert.equal(modify('sparklingaria', p, foe).target, 'allAdjacentFoes');
		p.boosts.spe = -2;
		const allyHP = ally.hp;
		hit(move, p, foe);
		assert.equal(ally.hp, allyHP);
		assert.equal(p.boosts.spe, 0);
		p.boosts.spe = -1;
		hit(move, p, foe);
		assert.equal(p.boosts.spe, -1);
	});
	it('Sovereign Arsenal chooses both categories and keeps horn/tail crit bonus', () => {
		const [p, , foe] = make('Sovereign Arsenal');
		p.storedStats.atk = 400; p.storedStats.spa = 50;
		assert.equal(modify('sludgebomb', p, foe).category, 'Physical');
		p.storedStats.atk = 40; p.storedStats.spa = 500;
		assert.equal(modify('earthquake', p, foe).category, 'Special');
		assert.equal(battle.runEvent('ModifyCritRatio', p, foe, battle.dex.getActiveMove('irontail'), 1), 2);
	});
	it('Broodguard rallies on an ally crossing half HP, once per entry', () => {
		const [p, ally, foe] = make('Broodguard');
		ally.hp = Math.floor(ally.maxhp / 2) + 10;
		hit('seismictoss', foe, ally);
		assert.equal(p.boosts.def, 1);
		hit('seismictoss', foe, ally);
		assert.equal(p.boosts.def, 1);
	});
	it('Sun Charm curses the first foe it burns, without costing HP', () => {
		const [p, , foe, second] = make('Sun Charm');
		const hp = p.hp;
		hit('willowisp', p, foe);
		assert(foe.volatiles.curse);
		assert.equal(p.hp, hp);
		hit('willowisp', p, second);
		assert(!second.volatiles.curse);
		const before = foe.hp;
		battle.singleEvent('Residual', battle.dex.conditions.get('curse'), foe.volatiles.curse, foe);
		assert.equal(before - foe.hp, Math.floor(foe.baseMaxhp / 8));
	});
	it('Pollen Engine heals both allies once per turn and doubles healing in sun', () => {
		const [p, ally, foe] = make('Pollen Engine');
		p.hp -= 150; ally.hp -= 150;
		let hp = ally.hp;
		hit('absorb', p, foe);
		assert.equal(ally.hp - hp, Math.floor(ally.maxhp / 16));
		hit('absorb', p, foe);
		assert.equal(ally.hp - hp, Math.floor(ally.maxhp / 16));
		battle.turn++;
		battle.field.setWeather('sunnyday');
		hp = ally.hp;
		hit('absorb', p, foe);
		assert.equal(ally.hp - hp, Math.floor(ally.maxhp / 8));
	});
	it('Kingler alternatives change Crabhammer independently', () => {
		const [p, , foe] = make('Titan Pincer');
		p.storedStats.def = 500; p.storedStats.atk = 50;
		assert.equal(modify('crabhammer', p, foe).overrideOffensiveStat, 'def');
		p.setAbility('Shellcracker');
		const move = modify('crabhammer', p, foe);
		assert.equal(move.accuracy, 100); assert(move.willCrit);
		assert(!modify('waterfall', p, foe).willCrit);
	});
	it('Tidal Dominion blocks slowed foes priority against either ally', () => {
		const [p, ally, foe] = make('Tidal Dominion');
		foe.boosts.spe = -1;
		const hp = ally.hp;
		hit('quickattack', foe, ally);
		assert.equal(ally.hp, hp);
		hit('quickattack', foe, p);
		assert.equal(p.hp, p.maxhp);
		foe.boosts.spe = 0;
		hit('quickattack', foe, ally);
		assert(ally.hp < hp);
	});
	it('Tempest Fury keeps its charge through Protect and spends it on a hit', () => {
		const [p, , foe] = make('Tempest Fury');
		hit('tackle', foe, p);
		assert(modify('watergun', p, foe).willCrit);
		foe.addVolatile('protect', foe);
		hit('watergun', p, foe);
		assert(p.abilityState.charged);
		foe.removeVolatile('protect');
		hit('watergun', p, foe);
		assert(!p.abilityState.charged);
	});
	it('Iron Lash preserves Whiplash and adds one SpD stage per turn', () => {
		const [p, , foe] = make('Iron Lash');
		assert.equal(p.boosts.accuracy, 1);
		hit('irontail', p, foe); hit('irontail', p, foe);
		assert.equal(p.boosts.spd, 1);
	});
	it('Armored Advance blocks damaging self drops but still permits Shell Smash costs', () => {
		const [p, , foe] = make('Armored Advance');
		hit('closecombat', p, foe);
		assert.equal(p.boosts.def, 0); assert.equal(p.boosts.spd, 0);
		hit('shellsmash', p, p);
		assert.equal(p.boosts.def, -1);
	});
	it('Trailbreaker spins against Ghosts and blocks hazard effects', () => {
		const [p, , foe] = make('Trailbreaker');
		foe.setType('Ghost');
		p.side.addSideCondition('spikes', foe);
		hit('rapidspin', p, foe);
		assert(foe.hp < foe.maxhp); assert(!p.side.sideConditions.spikes);
		const hp = p.hp;
		battle.damage(20, p, foe, battle.dex.conditions.get('stealthrock'));
		assert.equal(p.hp, hp);
	});
	it('Grit Grappler heals on Fighting damage once per turn while statused', () => {
		const [p, , foe] = make('Grit Grappler');
		p.setStatus('brn'); p.hp -= 100;
		const hp = p.hp;
		hit('karatechop', p, foe); hit('karatechop', p, foe);
		assert.equal(p.hp - hp, Math.floor(p.maxhp / 16));
	});
	it('Dread Jaw has Moxie and debuffs the next foe entering in singles-compatible logic', () => {
		const [p, , foe] = make('Dread Jaw');
		foe.hp = 1;
		hit('tackle', p, foe);
		battle.faintMessages();
		assert.equal(p.boosts.atk, 1); assert(p.abilityState.charged);
		const reserve = battle.p2.pokemon[2];
		battle.actions.switchIn(reserve, 0); battle.actions.runSwitch(reserve);
		assert.equal(reserve.boosts.atk, -1); assert(!p.abilityState.charged);
	});
	it('Floe Hunter crits only slower targets with bites in snow', () => {
		const [p, , foe] = make('Floe Hunter');
		battle.field.setWeather('snow'); p.storedStats.spe = 400;
		assert(modify('icefang', p, foe).willCrit);
		assert(!modify('iciclecrash', p, foe).willCrit);
		battle.field.clearWeather(); assert(!modify('icefang', p, foe).willCrit);
	});
	it('Lanceguard punishes blocked contact without receiving damage', () => {
		const [p, , foe] = make('Lanceguard');
		p.addVolatile('protect', p);
		hit('tackle', foe, p);
		assert.equal(p.hp, p.maxhp); assert.equal(foe.boosts.def, -1);
	});
	it('Headlong Resolve gains Defense from recoil and Herd Shelter protects an ally', () => {
		const [p, ally, foe] = make('Headlong Resolve');
		hit('takedown', p, foe);
		assert.equal(p.boosts.def, 1); assert(p.hp < p.maxhp);
		p.setAbility('Herd Shelter');
		hit('hypervoice', foe, ally);
		assert.equal(ally.hp, ally.maxhp);
	});
	it('Scorch Sweep clears hazards with recoil and Open Sky preserves itemless contact immunity', () => {
		const [p, , foe] = make('Scorch Sweep');
		p.side.addSideCondition('stealthrock', foe);
		hit('bravebird', p, foe);
		assert(!p.side.sideConditions.stealthrock); assert(p.hp < p.maxhp);
		p.setAbility('Open Sky');
		assert(!modify('acrobatics', p, foe).flags.contact);
		p.setItem('leftovers');
		assert(modify('acrobatics', p, foe).flags.contact);
	});
	it('Recharge Relay heals the teammate replacing Volt Switch, not a manual switch', () => {
		const [p, , foe] = make('Recharge Relay', 'Vikavolt', 'No Ability', true);
		const reserve = battle.p1.pokemon[2]; reserve.hp -= 200;
		const hp = reserve.hp;
		hit('voltswitch', p, foe);
		battle.actions.switchIn(reserve, 0); battle.actions.runSwitch(reserve);
		assert.equal(reserve.hp - hp, Math.floor(reserve.maxhp / 8));
		assert(!battle.p1.slotConditions[0].rechargerelay);
	});
	it('Hover Cannon bypasses redirection above half HP and retains target immunities', () => {
		const [p, , foe, other] = make('Hover Cannon', 'Vikavolt');
		other.setAbility('Lightning Rod');
		hit('thunderbolt', p, foe);
		assert(foe.hp < foe.maxhp); assert.equal(other.boosts.spa, 0);
		p.hp = Math.floor(p.maxhp / 2);
		const hp = foe.hp;
		hit('thunderbolt', p, foe);
		assert.equal(foe.hp, hp); assert.equal(other.boosts.spa, 1);
		assert(!p.isGrounded());
	});
	it('Keen Hunt and Twilight Instinct retain Keen Hunt accuracy without the retired Twilight critical chain', () => {
		const [p, , foe, other] = make('Keen Hunt');
		foe.hp = Math.floor(foe.maxhp / 2);
		assert.equal(modify('stoneedge', p, foe).accuracy, true);
		battle.boost({ spe: -1 }, p, foe); assert.equal(p.boosts.spe, 0);
		p.setAbility('Twilight Instinct');
		hit('tackle', p, foe);
		assert.equal(battle.runEvent('ModifyCritRatio', p, foe, battle.dex.getActiveMove('tackle'), 1), 1);
		assert.equal(battle.runEvent('ModifyCritRatio', p, other, battle.dex.getActiveMove('tackle'), 1), 1);
		hit('tackle', p, foe);
		assert.equal(battle.runEvent('ModifyCritRatio', p, foe, battle.dex.getActiveMove('tackle'), 1), 1);
	});
	it('Blood Challenge Counter retaliates against special damage', () => {
		const [p, , foe] = make('Blood Challenge');
		p.addVolatile('counter');
		hit('psychic', foe, p);
		assert(p.volatiles.counter.damage > 0);
		const hp = foe.hp;
		hit('counter', p, foe);
		assert(foe.hp < hp);
	});
	it('Twin Cannons and Twin Blades split damage and roll secondaries once', () => {
		const [p, , foe] = make('Twin Cannons');
		const move = battle.dex.getActiveMove('psychic');
		move.secondaries = [{ chance: 100, boosts: { spd: -1 } }];
		hit(move, p, foe);
		assert.equal(foe.boosts.spd, -1);
		assert(battle.log.some(line => line.includes('|-hitcount|') && line.endsWith('|2')));
		assert.equal(battle.activeMove.overrideDefensiveStat, 'def');
		hit('armorcannon', p, foe);
		assert.equal(p.boosts.def, -1);
		assert.equal(p.boosts.spd, -1);
		p.setAbility('Twin Blades');
		hit('bitterblade', p, foe);
		assert.equal(battle.activeMove.multihitType, 'twinblades');
		assert(battle.activeMove.ignorePositiveDefensive);
		assert(!modify('flamethrower', p, foe).multihit);
	});
	it('Heat Reservoir spends a Flash Fire charge after Armor Cannon and blocks both self drops', () => {
		const [p, , foe] = make('Heat Reservoir');
		hit('ember', foe, p);
		assert(p.volatiles.flashfire);
		hit('armorcannon', p, foe);
		assert(!p.volatiles.flashfire); assert.equal(p.boosts.def, 0); assert.equal(p.boosts.spd, 0);
		hit('armorcannon', p, foe);
		assert.equal(p.boosts.def, -1);
	});
	it('Mourning Coat permanently loses Fire weakness after a teammate faints', () => {
		const [p, ally, foe] = make('Mourning Coat');
		const fire = battle.dex.getActiveMove('ember');
		assert.equal(battle.runEvent('ModifyDamage', foe, p, fire, 100), 200);
		ally.faint(); battle.faintMessages();
		assert(ally.previouslyFainted);
		assert.equal(battle.runEvent('ModifyDamage', foe, p, fire, 100), 100);
	});
	it('Gravewind only summons three-turn sand when replacing a fainted slot', () => {
		const [p] = make('No Ability', 'Mew', 'No Ability', true);
		const reserve = battle.p1.pokemon[2]; reserve.setAbility('Gravewind');
		p.faint(); battle.faintMessages();
		battle.actions.switchIn(reserve, 0); battle.actions.runSwitch(reserve);
		assert(reserve.replacedFainted); assert.equal(battle.field.weather, 'sandstorm');
		assert.equal(battle.field.weatherState.duration, 3);
	});
	it('Dozing Giant reduces sleeping special damage and Sleep Talk excludes Rest', () => {
		const [p, , foe] = make('Dozing Giant');
		p.setStatus('slp');
		assert.equal(battle.runEvent('ModifyDamage', foe, p, battle.dex.getActiveMove('psychic'), 100), 75);
		p.moveSlots = ['rest', 'sleeptalk', 'splash'].map(id => ({ id, move: Dex.moves.get(id).name, pp: 10, maxpp: 10, target: 'self', disabled: false, used: false }));
		for (let i = 0; i < 6; i++) hit('sleeptalk', p, p);
		assert(!battle.log.some(line => line.includes('|Rest|')));
		assert(battle.log.some(line => line.includes('|Splash|')));
	});
	it('Quill Reservoir retains absorb and charge through Protect; Raised Quills arms after status success', () => {
		const [p, , foe] = make('Quill Reservoir');
		p.hp -= 100;
		hit('watergun', foe, p);
		assert(p.abilityState.charged);
		foe.addVolatile('protect', foe);
		hit('poisontail', p, foe); assert(p.abilityState.charged);
		foe.removeVolatile('protect');
		hit('poisontail', p, foe); assert.equal(foe.status, 'psn'); assert(!p.abilityState.charged);
		foe.cureStatus(); p.setAbility('Raised Quills');
		hit('splash', p, p);
		assert(p.abilityState.charged);
		hit('tackle', foe, p); assert.equal(foe.status, 'psn');
	});
});
