'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim/dex');
const { abilityIncludesComponent } = require('../../../dist/data/ability-components');

describe('Approved third roster pass', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function make(ability, species = 'Mew', foeAbility = 'No Ability') {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [[
			{ species, ability, moves: ['splash', 'protect', 'coil', 'psychic'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		], [
			{ species: 'Blissey', ability: foeAbility, moves: ['splash', 'psychic', 'tackle'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1, 2, 3', 'team 1, 2, 3');
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
		const move = battle.dex.getActiveMove(id);
		return battle.runEvent('ModifyMove', source, target, move, move);
	}
	function residual(pokemon) {
		battle.singleEvent('Residual', pokemon.getAbility(), pokemon.abilityState, pokemon);
	}
	it('assigns retained components and removes discarded components without changing Gardevoir', () => {
		for (const [species, ability, component] of [
			['Hariyama', 'Palm Mastery', 'Thick Fat'], ['Electivire', 'Galvanic Spirit', 'Vital Spirit'],
			['Magmortar', 'Blast Chamber', 'Vital Spirit'], ['Galvantula', 'Silk Sights', 'Compound Eyes'],
			['Ferrothorn', 'Barb Harvest', 'Iron Barbs'], ['Eelektross', 'Current Coil', 'Swift Swim'],
			['Goodra', 'Toxic Serenity', 'Poison Heal'], ['Drednaw', 'River Shell', 'Shell Armor'],
			['Mudsdale', 'Mud Temper', 'Battle Armor'], ['Annihilape', 'Beyond Fear', 'Inner Focus'],
		]) {
			assert(Object.values(Dex.species.get(species).abilities).includes(ability));
			assert(abilityIncludesComponent(ability, component));
		}
		assert(abilityIncludesComponent('Storm Circuit', 'Current Coil'));
		assert(abilityIncludesComponent('Storm Circuit', 'Swift Swim'));
		assert(!abilityIncludesComponent('Venom Bastion', 'Merciless'));
		assert(!abilityIncludesComponent('Venom Bastion', 'Self Sufficient'));
		assert(!abilityIncludesComponent('Territorial', 'Unaware'));
		assert.equal(Dex.species.get('Mudsdale').abilities.H, 'Inner Focus');
		assert(!Dex.abilities.get('Royal Voice').desc.includes('Perfect Foresight'));
	});
	it('Mountainbreaker selects a whole Rock/Ground matchup per target while retaining Rock type', () => {
		const [p, , foe] = make('Mountainbreaker', 'Tyranitar');
		foe.setType('Steel');
		const move = modify('rockslide', p, foe);
		assert.equal(move.type, 'Rock'); assert.equal(foe.runEffectiveness(move), 1);
		foe.setType(['Steel', 'Flying']);
		assert.equal(foe.runEffectiveness(move), 0);
		foe.setType(['Fire', 'Steel']);
		assert.equal(foe.runEffectiveness(move), 2);
		assert.equal(modify('crunch', p, foe).type, 'Dark');
	});
	it('Dread Presence punishes successful foe status once per turn, not failed status or allies', () => {
		const [p, ally, foe] = make('Dread Presence');
		const hp = foe.hp;
		hit('splash', foe, foe); hit('splash', foe, foe);
		assert.equal(hp - foe.hp, Math.floor(foe.maxhp / 8));
		hit('splash', ally, ally); assert.equal(ally.hp, ally.maxhp);
		battle.turn++;
		p.setType('Steel'); hit('toxic', foe, p);
		assert.equal(hp - foe.hp, Math.floor(foe.maxhp / 8));
	});
	it('Palm Mastery guarantees primary paralysis but respects type immunity', () => {
		const [p, , foe, other] = make('Palm Mastery', 'Hariyama', 'Shield Dust');
		hit('forcepalm', p, foe); assert.equal(foe.status, 'par');
		other.setType('Electric'); hit('forcepalm', p, other); assert.equal(other.status, '');
	});
	it('Galvanic Spirit keeps Vital Spirit and drops SpD once per turn on Electric contact', () => {
		const [p, , foe] = make('Galvanic Spirit');
		assert(!p.trySetStatus('slp', foe));
		hit('thunderpunch', p, foe); hit('thunderpunch', p, foe);
		assert.equal(foe.boosts.spd, -1);
		assert(p.hasAbility('vitalspirit'));
	});
	it('Blast Chamber alternates accuracy charges and respects Protect', () => {
		const [p, , foe] = make('Blast Chamber');
		hit('ember', p, foe);
		assert.equal(modify('focusblast', p, foe).accuracy, true);
		foe.addVolatile('protect', foe); hit('focusblast', p, foe);
		assert.equal(p.abilityState.nextType, 'Fighting');
		foe.removeVolatile('protect'); hit('focusblast', p, foe);
		assert.equal(modify('fireblast', p, foe).accuracy, true);
	});
	it('Venom Spurs spends its defense-drop charge before a real Bug hit, not Protect or Substitute', () => {
		const [p, , foe] = make('Venom Spurs');
		hit('poisonsting', p, foe); assert(p.abilityState.charged);
		foe.addVolatile('protect', foe); hit('bugbite', p, foe);
		assert(p.abilityState.charged); assert.equal(foe.boosts.def, 0);
		foe.removeVolatile('protect'); foe.addVolatile('substitute', foe); hit('bugbite', p, foe);
		assert(p.abilityState.charged); assert.equal(foe.boosts.def, 0);
		foe.removeVolatile('substitute'); hit('bugbite', p, foe);
		assert(!p.abilityState.charged); assert.equal(foe.boosts.def, -1);
	});
	it('Last Brood creates a free eighth-HP Substitute only once in the battle', () => {
		const [p, , foe] = make('Last Brood');
		p.hp = Math.floor(p.maxhp / 2) + 10;
		const before = p.hp;
		hit('seismictoss', foe, p);
		assert.equal(p.hp, before - 100);
		assert.equal(p.volatiles.substitute.hp, Math.floor(p.maxhp / 8));
		assert(p.m.lastBroodUsed);
		p.removeVolatile('substitute'); p.hp = before;
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		hit('seismictoss', foe, p); assert(!p.volatiles.substitute);
	});
	it('Venom Bastion retains Stamina but removes the old Bug multiplier and critical-hit effect', () => {
		const [p, , foe] = make('Venom Bastion');
		foe.setStatus('psn'); foe.storedStats.atk = 300; foe.storedStats.spa = 100;
		hit('tackle', foe, p); hit('tackle', foe, p);
		assert.equal(p.boosts.def, 1); assert.equal(foe.boosts.atk, -1);
		assert.equal(battle.runEvent('BasePower', p, foe, battle.dex.getActiveMove('bugbuzz'), 100, true), 100);
		assert.equal(battle.runEvent('ModifyCritRatio', p, foe, battle.dex.getActiveMove('bugbuzz'), 1), 1);
	});
	it('Shadow Feint deals one-third damage through Protect without secondaries and respects Max Guard', () => {
		const [p, , foe] = make('Shadow Feint');
		const create = () => {
			const move = battle.dex.getActiveMove('darkpulse');
			move.willCrit = false; move.noDamageVariance = true;
			move.secondaries = [{ chance: 100, boosts: { spd: -1 } }]; return move;
		};
		let hp = foe.hp; hit(create(), p, foe); const damage = hp - foe.hp;
		foe.boosts.spd = 0; foe.hp = foe.maxhp; foe.addVolatile('protect', foe);
		hp = foe.hp; hit(create(), p, foe);
		assert(Math.abs((hp - foe.hp) - damage / 3) <= 1);
		assert.equal(foe.boosts.spd, 0); assert(foe.volatiles.protect);
		foe.removeVolatile('protect'); foe.addVolatile('maxguard', foe);
		hp = foe.hp; hit(create(), p, foe); assert.equal(foe.hp, hp);
	});
	it('Silk Sights retains Compound Eyes and only ignores boosts on slowed targets', () => {
		const [p, , foe] = make('Silk Sights');
		let move = battle.dex.getActiveMove('thunderbolt'); foe.boosts.spe = -1;
		battle.runEvent('BasePower', p, foe, move, 100, true); assert(move.ignorePositiveDefensive);
		move = battle.dex.getActiveMove('thunderbolt'); foe.boosts.spe = 0;
		battle.runEvent('BasePower', p, foe, move, 100, true); assert(!move.ignorePositiveDefensive);
		assert(p.hasAbility('compoundeyes'));
	});
	it('Live Net charges only its own web with an active holder and respects Boots and Electric immunity', () => {
		const [p, , foe] = make('Live Net');
		hit('stickyweb', p, foe);
		const state = foe.side.sideConditions.stickyweb;
		const enter = mon => battle.singleEvent('SwitchIn', battle.dex.conditions.get('stickyweb'), state, mon);
		let hp = foe.hp; enter(foe);
		assert.equal(hp - foe.hp, Math.floor(foe.maxhp / 16));
		foe.setItem('heavydutyboots'); hp = foe.hp; enter(foe);
		assert.equal(foe.hp, hp);
		foe.clearItem(); foe.setType('Ground'); enter(foe);
		assert.equal(foe.hp, hp);
		foe.setType('Normal'); foe.setAbility('Trailbreaker'); enter(foe);
		assert.equal(foe.hp, hp);
		foe.setAbility('No Ability'); p.isActive = false; enter(foe);
		assert.equal(foe.hp, hp);
	});
	it('Barb Harvest counts moves, restores only an eaten Berry, and activates once per battle', () => {
		const [p, , foe] = make('Barb Harvest');
		p.setItem('cheriberry'); p.eatItem();
		hit('doublehit', foe, p); assert.equal(p.m.barbHarvestHits, 1);
		hit('tackle', foe, p); assert(!p.item);
		hit('tackle', foe, p); assert.equal(p.item, 'cheriberry'); assert(p.m.barbHarvestUsed);
		p.eatItem(); hit('tackle', foe, p); assert(!p.item);
	});
	it('Current Coil and Storm Circuit add SpA to Coil without losing rain Speed', () => {
		const [p] = make('Current Coil');
		hit('coil', p, p); assert.equal(p.boosts.spa, 1); assert.equal(p.boosts.atk, 1);
		battle.field.setWeather('raindance');
		assert.equal(battle.runEvent('ModifySpe', p, null, null, 100), 200);
		p.setAbility('Storm Circuit'); hit('coil', p, p); assert.equal(p.boosts.spa, 2);
		assert(p.hasAbility('currentcoil')); assert(p.hasAbility('elevate'));
	});
	it('Soul Pyre heals exactly an eighth after actual foe burn damage, never blocked burn', () => {
		const [p, , foe, other] = make('Soul Pyre'); p.hp -= 150;
		foe.setStatus('brn'); other.setStatus('brn');
		battle.damage(10, foe, foe, battle.dex.conditions.get('brn'));
		battle.damage(10, other, other, battle.dex.conditions.get('brn'));
		const hp = p.hp; residual(p); assert.equal(p.hp - hp, Math.floor(p.maxhp / 8));
		battle.turn++; foe.setAbility('Magic Guard');
		battle.damage(10, foe, foe, battle.dex.conditions.get('brn'));
		const nextHP = p.hp; residual(p); assert.equal(p.hp, nextHP);
		hit('lick', p, other); hit('lick', p, other); assert.equal(other.boosts.spd, -1);
	});
	it('Black Viper keeps Whiplash and only the first landed tail hit inflicts toxic poison', () => {
		const [p, , foe, other] = make('Black Viper');
		assert.equal(p.boosts.accuracy, 1);
		hit('irontail', p, foe); assert.equal(foe.status, 'tox');
		hit('irontail', p, other); assert.equal(other.status, '');
	});
	it('Silk Shuriken has Bug typing, three 20-power hits and the original priority', () => {
		const [p, , foe] = make('Silk Shuriken');
		hit('watershuriken', p, foe);
		assert.equal(battle.activeMove.type, 'Bug'); assert.equal(battle.activeMove.basePower, 20);
		assert.equal(battle.activeMove.multihit, 3); assert.equal(battle.activeMove.priority, 1);
	});
	it('Hidden Scroll checks the second targets protection independently and only echoes once', () => {
		const [p, , foe, other] = make('Hidden Scroll'); other.addVolatile('protect', other);
		hit('toxic', p, foe); assert.equal(foe.status, 'tox'); assert.equal(other.status, '');
		assert(p.abilityState.used);
		other.removeVolatile('protect'); foe.cureStatus(); hit('toxic', p, foe);
		assert.equal(other.status, '');
	});
	it('Hidden Scroll can affect both foes and respects Magic Bounce on the second', () => {
		const [p, , foe, other] = make('Hidden Scroll'); other.setAbility('Magic Bounce');
		hit('toxic', p, foe);
		assert.equal(foe.status, 'tox'); assert.equal(other.status, ''); assert.equal(p.status, 'tox');
	});
	it('Toxic Serenity has Poison Heal and accurate Dragon moves only while poisoned', () => {
		const [p, , foe] = make('Toxic Serenity');
		assert.equal(modify('dracometeor', p, foe).accuracy, 90);
		p.setStatus('psn'); assert.equal(modify('dracometeor', p, foe).accuracy, true);
		p.hp -= 100; const hp = p.hp;
		battle.damage(10, p, p, battle.dex.conditions.get('psn'));
		assert(p.hp > hp);
	});
	it('Mud Temper preserves Battle Armor and grants one SpD boost per turn', () => {
		const [p, , foe] = make('Mud Temper');
		hit('ember', foe, p); hit('watergun', foe, p); assert.equal(p.boosts.spd, 1);
		assert(p.hasAbility('battlearmor'));
	});
	it('Skywarden creates five-turn Mist after Defog clears hazards', () => {
		const [p, , foe] = make('Skywarden'); p.side.addSideCondition('stealthrock', foe);
		hit('defog', p, foe);
		assert(!p.side.sideConditions.stealthrock); assert.equal(p.side.sideConditions.mist.duration, 5);
	});
	it('Lockjaw applies two-turn Torment and River Shell keeps Shell Smash SpD cost', () => {
		const [p, , foe] = make('Lockjaw'); hit('bite', p, foe);
		assert.equal(foe.volatiles.torment.duration, 2); assert(!foe.trapped);
		p.setAbility('River Shell'); hit('shellsmash', p, p);
		assert.equal(p.boosts.def, 0); assert.equal(p.boosts.spd, -1); assert.equal(p.boosts.atk, 2);
	});
	it('Territorial keeps full Stamina without restoring the old outgoing Ground heal', () => {
		const [p, , foe] = make('Territorial'); p.hp -= 100;
		hit('psychic', foe, p); assert.equal(p.boosts.def, 1);
		hit('tackle', foe, p); assert.equal(p.boosts.def, 1);
		hit('tackle', foe, p); assert.equal(p.boosts.def, 1);
		const hp = p.hp; hit('mudslap', p, foe);
		assert.equal(p.hp, hp);
	});
	it('Funeral Choir counts fainted teammates and heals once per turn from sound damage', () => {
		const [p, ally, foe] = make('Funeral Choir'); ally.faint(); battle.faintMessages();
		p.hp -= 100; const hp = p.hp;
		hit('hypervoice', p, foe); hit('hypervoice', p, foe);
		assert.equal(p.hp - hp, Math.floor(p.maxhp / 32));
	});
	it('Festival Step clears negative boosts only after a landed damaging dance', () => {
		const [p, , foe] = make('Festival Step');
		p.boosts.def = -1; p.boosts.spd = -1; p.boosts.atk = 2;
		foe.addVolatile('protect', foe); hit('aquastep', p, foe); assert.equal(p.boosts.def, -1);
		foe.removeVolatile('protect'); hit('aquastep', p, foe);
		assert.equal(p.boosts.def, 0); assert.equal(p.boosts.spd, 0); assert.equal(p.boosts.atk, 2);
	});
	it('Salt Crust protects the item only with positive Defense and preserves Clear Body', () => {
		const [p, , foe] = make('Salt Crust'); p.setItem('leftovers'); p.boosts.def = 1;
		assert.equal(p.takeItem(foe), false); assert.equal(p.item, 'leftovers');
		battle.boost({ atk: -1 }, p, foe); assert.equal(p.boosts.atk, 0);
		p.clearBoosts(); assert(p.takeItem(foe));
	});
	it('Beyond Fear responds to one opposing offensive boost event, preserving Inner Focus', () => {
		const [p, , foe] = make('Beyond Fear');
		hit('workup', foe, foe); assert.equal(p.boosts.def, 1); assert.equal(p.boosts.spd, 1);
		hit('workup', foe, foe); assert.equal(p.boosts.def, 1);
		assert(p.hasAbility('innerfocus'));
	});
	it('Stillwater requires full HP before absorbing and caps the boost once per turn', () => {
		const [p, , foe] = make('Stillwater'); p.hp -= 10;
		hit('watergun', foe, p); assert.equal(p.boosts.spd, 0); assert.equal(p.hp, p.maxhp);
		hit('watergun', foe, p); hit('watergun', foe, p); assert.equal(p.boosts.spd, 1);
	});
	it('Mud Meditation protects only while a status action is queued', () => {
		const [p, , foe] = make('Mud Meditation');
		battle.queue.addChoice({ choice: 'move', pokemon: p, moveid: 'splash', targetLoc: 0 });
		assert.equal(battle.runEvent('ModifyDamage', foe, p, battle.dex.getActiveMove('psychic'), 100), 75);
		battle.queue.cancelMove(p);
		assert.equal(battle.runEvent('ModifyDamage', foe, p, battle.dex.getActiveMove('psychic'), 100), 100);
	});
});
