'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim/dex');
const { abilityIncludesComponent } = require('../../../dist/data/ability-components');
describe('Approved roster expansion and component search', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function make(species, ability, foeAbility = 'No Ability') {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [[
			{ species, ability, moves: ['splash', 'tackle', 'protect', 'airslash'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		], [
			{ species: 'Blissey', ability: foeAbility, moves: ['splash', 'seismictoss', 'toxic', 'tackle'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');
		battle.p2.active[0].storedStats.def = 250;
		return [battle.p1.active[0], battle.p1.active[1], battle.p2.active[0]];
	}
	function hit(id, source, target) {
		const move = typeof id === 'string' ? battle.dex.getActiveMove(id) : id;
		move.accuracy = true;
		battle.actions.useMove(move, source, { target });
		battle.runEvent('AfterMove', source, target, battle.activeMove);
	}
	function event(name, holder, ...args) { return battle.singleEvent(name, holder.getAbility(), holder.abilityState, ...args); }
	it('spends Cornered Fang priority in an actual turn and restores normal move order next turn', () => {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [[
			{ species: 'Raticate', ability: 'Cornered Fang', moves: ['bite'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		], [
			{ species: 'Deoxys-Speed', ability: 'No Ability', moves: ['splash'] },
			{ species: 'Blissey', ability: 'No Ability', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');
		const p = battle.p1.active[0];
		p.hp = Math.floor(p.maxhp / 2);
		let start = battle.log.length;
		battle.makeChoices('move 1 2, move 1', 'move 1, move 1');
		assert(battle.log.slice(start).find(line => line.startsWith('|move|')).includes('Raticate'));
		assert(p.abilityState.used);
		start = battle.log.length;
		battle.makeChoices('move 1 2, move 1', 'move 1, move 1');
		assert(battle.log.slice(start).find(line => line.startsWith('|move|')).includes('Deoxys'));
	});
	it('retains other ability options and exposes genuine components, including Tough Claws', () => {
		for (const name of ['Bedrock Claw', 'Rime Claw', 'Pincer Crush', 'Snowpack'])
			assert(abilityIncludesComponent(name, 'Tough Claws'), name);
		assert(!abilityIncludesComponent('Decoy Pincers', 'Tough Claws'));
		assert(abilityIncludesComponent('Broodguard', 'Friend Guard'));
		assert(!abilityIncludesComponent('Abyss Lure', 'Lightning Rod'));
		assert(!abilityIncludesComponent('Terra Resolve', 'Rocky Payload'));
		assert.deepEqual(Dex.species.get('Dustox').abilities, { 0: 'Compound Eyes', 1: 'Unaware', H: 'Toxic Cocoon' });
		assert.deepEqual(Dex.species.get('Dustox').passives, ['shielddust']);
		assert.deepEqual(Dex.species.get('Beautifly').abilities, { 0: 'Windy Surge', 1: 'Pastel Veil', H: 'Gale Bloom' });
		for (const [name, bst] of [['Raticate', 480], ['Raticate-Alola', 480], ['Dustox', 530], ['Beautifly', 530], ['Kricketune', 500]])
			assert.equal(Dex.species.get(name).bst, bst);
		assert.equal(Dex.species.get('Scolipede-Mega').abilities[0], 'Venom Bastion');
		assert.equal(Dex.species.get('Gengar').abilities[0], 'Shadow Shield');
	});
	it('Updraft and Gale Bloom only reward a landed hit once per entry', () => {
		for (const [species, ability, stat] of [['Pidgeot', 'Updraft', 'spe'], ['Beautifly', 'Gale Bloom', 'spa']]) {
			const [p, ally, foe] = make(species, ability);
			hit('gust', p, foe);
			hit('gust', p, foe);
			assert.equal(ally.boosts[stat], 1);
			battle.destroy();
			battle = null;
		}
	});
	it('Cornered Fang keeps Guts and spends priority only on the qualifying attack', () => {
		const [p, , foe] = make('Raticate', 'Cornered Fang');
		p.hp = Math.floor(p.maxhp / 2);
		p.setStatus('brn');
		assert(p.hasAbility('guts'));
		const bite = battle.dex.getActiveMove('bite');
		assert.equal(battle.runEvent('ModifyPriority', p, foe, bite, 0), 1);
		event('AfterMove', p, p, foe, bite);
		assert.equal(battle.runEvent('ModifyPriority', p, foe, bite, 0), 0);
	});
	it('Night Hoard restores HP and preserves its charge through Protect', () => {
		const [p, , foe] = make('Raticate-Alola', 'Night Hoard');
		p.hp -= 100;
		const before = p.hp;
		event('EatItem', p, battle.dex.items.get('oranberry'), p);
		assert.equal(p.hp - before, Math.floor(p.baseMaxhp / 8));
		foe.addVolatile('protect', foe);
		hit('bite', p, foe);
		assert(p.abilityState.primed);
		foe.removeVolatile('protect');
		hit('bite', p, foe);
		assert.equal(foe.volatiles.taunt.duration, 2);
		assert(!p.abilityState.primed);
	});
	it('sand clearance is once per entry and frost hazard immunity needs snow', () => {
		let [p, , foe] = make('Sandslash', 'Dune Runner');
		p.side.addSideCondition('spikes', foe);
		battle.field.setWeather('sandstorm', foe);
		assert(!p.side.sideConditions.spikes);
		p.side.addSideCondition('spikes', foe);
		event('WeatherChange', p, p);
		assert(p.side.sideConditions.spikes);
		battle.destroy();
		battle = null;
		[p, , foe] = make('Sandslash-Alola', 'Frost Runner');
		battle.field.setWeather('snow', foe);
		assert.equal(battle.runEvent('Damage', p, foe, battle.dex.conditions.get('spikes'), 20), false);
		battle.field.clearWeather();
		assert.equal(battle.runEvent('Damage', p, foe, battle.dex.conditions.get('spikes'), 20), 20);
	});
	it('claw abilities retain their contact boost and only spend their screen break once', () => {
		for (const [species, ability, move] of [['Sandslash', 'Bedrock Claw', 'stompingtantrum'], ['Sandslash-Alola', 'Rime Claw', 'icepunch']]) {
			const [p, , foe] = make(species, ability);
			foe.side.addSideCondition('reflect', foe);
			hit(move, p, foe);
			assert(!foe.side.sideConditions.reflect);
			foe.side.addSideCondition('reflect', foe);
			hit(move, p, foe);
			assert(foe.side.sideConditions.reflect);
			assert(p.hasAbility('toughclaws'));
			battle.destroy();
			battle = null;
		}
	});
	it('Broodguard protects the ally and Sun Charm only extends its original sunlight once', () => {
		let [p, ally, foe] = make('Nidoqueen', 'Broodguard');
		assert.equal(battle.runEvent('ModifyDamage', foe, ally, battle.dex.getActiveMove('tackle'), 100), 75);
		assert(p.hasAbility('thickfat'));
		battle.destroy();
		battle = null;
		[p, , foe] = make('Ninetales', 'Sun Charm');
		const duration = battle.field.weatherState.duration;
		hit('ember', p, foe);
		assert.equal(battle.field.weatherState.duration, duration + 1);
		hit('ember', p, foe);
		assert.equal(battle.field.weatherState.duration, duration + 1);
	});
	it('Venomoth alternatives poison contact, accelerate resisted hits, and reward successful powder', () => {
		let [p, , foe] = make('Venomoth', 'Caustic Scales');
		hit('tackle', foe, p);
		assert.equal(foe.status, 'psn');
		battle.destroy();
		battle = null;
		[p, , foe] = make('Venomoth', 'Prism Wings');
		foe.setType(['Steel']);
		hit('strugglebug', p, foe);
		hit('strugglebug', p, foe);
		assert.equal(p.boosts.spe, 1);
		battle.destroy();
		battle = null;
		[p, , foe] = make('Venomoth', 'Oneiric Dust');
		const powder = battle.dex.getActiveMove('stunspore');
		powder.accuracy = true;
		hit(powder, p, foe);
		assert.equal(foe.status, 'par');
		assert.equal(foe.boosts.spd, -1);
	});
	it('Scizor drops Defense once while Decoy Pincers only reduces its first hit', () => {
		let [p, , foe] = make('Scizor', 'Pincer Crush');
		hit('bulletpunch', p, foe);
		hit('bulletpunch', p, foe);
		assert.equal(foe.boosts.def, -1);
		battle.destroy();
		battle = null;
		[p, , foe] = make('Scizor', 'Decoy Pincers');
		const move = battle.dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('ModifyDamage', foe, p, move, 100), 75);
		hit('tackle', foe, p);
		assert.equal(battle.runEvent('ModifyDamage', foe, p, move, 100), 100);
		assert.equal(foe.boosts.atk, -1);
	});
	it('Gem Eye bounces only one directly aimed status move; Last Laugh passes Substitute', () => {
		let [p, , foe] = make('Sableye', 'Gem Eye');
		hit('toxic', foe, p);
		assert.equal(foe.status, 'tox');
		assert.equal(p.status, '');
		hit('toxic', foe, p);
		assert.equal(p.status, 'tox');
		battle.destroy();
		battle = null;
		[p, , foe] = make('Sableye', 'Last Laugh');
		hit('substitute', foe, foe);
		const before = foe.hp;
		hit('nightslash', p, foe);
		assert(foe.volatiles.substitute);
		assert(foe.hp < before);
	});
	it('Kricketune gets exactly three turns of Tailwind and screen bypass does not bypass Substitute', () => {
		let [p, , foe] = make('Kricketune', 'Opening Overture');
		hit('bugbuzz', p, foe);
		assert.equal(p.side.sideConditions.tailwind.duration, 3);
		battle.destroy();
		battle = null;
		[p, , foe] = make('Kricketune', 'Resonant Blade');
		const move = battle.dex.getActiveMove('xscissor');
		event('ModifyMove', p, move, p, foe);
		assert(move.ignoreScreens);
		assert(!move.infiltrates);
		hit('substitute', foe, foe);
		const before = foe.hp;
		hit('xscissor', p, foe);
		assert.equal(foe.hp, before);
	});
	it('Tangrowth applies both components and Root Renewal cures an ally while switching out', () => {
		let [p, , foe] = make('Tangrowth', 'Living Tangle');
		p.hp -= 80;
		hit('tackle', foe, p);
		assert.equal(p.boosts.def, 1);
		assert.equal(foe.boosts.spe, -1);
		battle.destroy();
		battle = null;
		let ally;
		[p, ally, foe] = make('Tangrowth', 'Root Renewal');
		ally.setStatus('brn');
		p.hp -= 100;
		const before = p.hp;
		event('SwitchOut', p, p);
		assert(p.hp > before);
		assert.equal(ally.status, '');
	});
	it('Encore Aria requires an applied secondary; Void Omen wards only one ally drop', () => {
		let [p, , foe] = make('Primarina', 'Encore Aria', 'Shield Dust');
		const acid = battle.dex.getActiveMove('acid');
		acid.target = 'normal';
		acid.secondaries = [{ chance: 100, boosts: { spd: -1 } }];
		hit(acid, p, foe);
		assert(!p.side.sideConditions.safeguard);
		foe.setAbility('No Ability');
		hit(acid, p, foe);
		assert.equal(p.side.sideConditions.safeguard.duration, 5);
		battle.destroy();
		battle = null;
		let ally;
		[p, ally, foe] = make('Togekiss', 'Void Omen');
		hit(acid, p, foe);
		assert.equal(p.side.sideConditions.safeguard.duration, 3);
		// Safeguard independently prevents stat drops; isolate the one-use ward.
		p.side.removeSideCondition('safeguard');
		battle.boost({ atk: -1 }, ally, foe);
		assert.equal(ally.boosts.atk, 0);
		assert.equal(p.abilityState.ward, false);
		battle.boost({ atk: -1 }, ally, foe);
		assert.equal(ally.boosts.atk, -1);
	});
	it('Fortunate Wing creates five-turn Safeguard from a critical hit', () => {
		const [p, , foe] = make('Togekiss', 'Fortunate Wing');
		const frost = battle.dex.getActiveMove('frostbreath');
		frost.accuracy = true;
		hit(frost, p, foe);
		assert.equal(p.side.sideConditions.safeguard.duration, 5);
	});
	it('Snowpack includes the real Thick Fat, Ice Body and Tough Claws components', () => {
		const [p, , foe] = make('Mamoswine', 'Snowpack');
		for (const id of ['thickfat', 'icebody', 'toughclaws'])
			assert(p.hasAbility(id));
		p.hp -= 80;
		const before = p.hp;
		battle.field.setWeather('snow', p);
		event('Weather', p, p, p, battle.dex.conditions.get('snow'));
		assert(p.hp > before);
	});
	it('Froslass spends first-hit protection and arms Ghost priority only once', () => {
		let [p, , foe] = make('Froslass', 'Ice Mirror');
		hit('watergun', foe, p);
		assert.equal(foe.boosts.spe, -1);
		hit('watergun', foe, p);
		assert.equal(foe.boosts.spe, -1);
		battle.destroy();
		battle = null;
		[p, , foe] = make('Froslass', 'Wailing Snow');
		hit('iceshard', p, foe);
		const ghost = battle.dex.getActiveMove('shadowball');
		assert.equal(battle.runEvent('ModifyPriority', p, foe, ghost, 0), 1);
		hit('shadowball', p, foe);
		assert.equal(battle.runEvent('ModifyPriority', p, foe, ghost, 0), 0);
	});
	it('Sturdy-based abilities trigger their correct hazards/screens only on actual survival', () => {
		for (const [species, ability, condition, duration] of [['Crustle', 'Stonewall', 'spikes', 0], ['Garganacl', 'Salt Bastion', 'safeguard', 5], ['Archaludon', 'Anchor Bridge', '', 0]]) {
			const [p, , foe] = make(species, ability);
			p.hp = p.maxhp = 100;
			hit('seismictoss', foe, p);
			assert.equal(p.hp, 1);
			const side = duration ? p.side : foe.side;
			if (condition) assert(side.sideConditions[condition]);
			else assert(!p.side.sideConditions.lightscreen);
			if (duration)
				assert.equal(side.sideConditions[condition].duration, duration);
			battle.destroy();
			battle = null;
		}
	});
	it('Breakaway triggers once and Fossil Ram stops recoil while slowing its target once per turn', () => {
		let [p, , foe] = make('Crustle', 'Breakaway');
		hit('tackle', foe, p);
		hit('tackle', foe, p);
		assert.equal(p.boosts.spe, 2);
		assert.equal(p.boosts.def, -1);
		battle.destroy();
		battle = null;
		[p, , foe] = make('Carracosta', 'Fossil Ram');
		const before = p.hp;
		hit('takedown', p, foe);
		hit('takedown', p, foe);
		assert.equal(p.hp, before);
		assert.equal(foe.boosts.spe, -1);
	});
	it('Rooted Iron distinguishes status turns from attack attempts', () => {
		const [p, , foe] = make('Ferrothorn', 'Rooted Iron');
		p.hp -= 100;
		let before = p.hp;
		event('BeforeMove', p, p, foe, battle.dex.getActiveMove('protect'));
		event('Residual', p, p);
		assert(p.hp > before);
		before = p.hp;
		event('BeforeMove', p, p, foe, battle.dex.getActiveMove('tackle'));
		event('Residual', p, p);
		assert.equal(p.hp, before);
	});
	it('Pepper Sting primes from a Fire move and Sushi Trick uses Hospitality healing', () => {
		let [p, , foe] = make('Scovillain', 'Pepper Sting');
		hit('ember', p, foe);
		hit('absorb', p, foe);
		assert.equal(foe.boosts.spd, -1);
		assert.equal(foe.boosts.spe, -1);
		battle.destroy();
		battle = null;
		let ally;
		[p, ally, foe] = make('Tatsugiri', 'Sushi Trick');
		ally.hp -= 150;
		ally.addVolatile('confusion', foe);
		const before = ally.hp;
		event('Start', p, p);
		assert.equal(ally.hp - before, Math.floor(ally.baseMaxhp / 4));
		assert(!ally.volatiles.confusion);
		assert(battle.log.some(line => line.includes('colorful sushi surprise')));
	});
	it('Master Course has Contrary and grants a nonstacking, single-attack ally critical charge', () => {
		const [p, ally, foe] = make('Tatsugiri', 'Master Course');
		battle.boost({ spa: -2 }, p, p);
		assert.equal(p.boosts.spa, 2);
		hit('watergun', p, foe);
		assert(ally.volatiles.mastercourse);
		assert.equal(battle.runEvent('ModifyCritRatio', ally, foe, battle.dex.getActiveMove('tackle'), 1), 2);
		hit('splash', ally, ally);
		assert(ally.volatiles.mastercourse);
		hit('tackle', ally, foe);
		assert(!ally.volatiles.mastercourse);
	});
	it('Second Brew heals its ally by 1/8 after draining, at most once per turn', () => {
		const [p, ally, foe] = make('Sinistcha', 'Second Brew');
		p.hp -= 100;
		ally.hp -= 150;
		const before = ally.hp;
		hit('gigadrain', p, foe);
		assert.equal(ally.hp - before, Math.floor(ally.baseMaxhp / 8));
		hit('absorb', p, foe);
		assert.equal(ally.hp - before, Math.floor(ally.baseMaxhp / 8));
	});
	it('Rail Sight keeps redirection bypass without bypassing screens', () => {
		const [p, , foe] = make('Archaludon', 'Rail Sight');
		hit('followme', foe, foe);
		const move = battle.dex.getActiveMove('dragonpulse');
		event('ModifyMove', p, move, p, foe);
		assert(move.tracksTarget);
		assert(!move.ignoreScreens);
		assert(!move.infiltrates);
	});
	it('Execution uses the approved 1.3x finisher and marks only a half-HP crossing', () => {
		const [p, , foe] = make('Gardevoir', 'Execution');
		foe.hp = Math.floor(foe.maxhp / 2) + 5;
		hit('watergun', p, foe);
		assert.equal(p.abilityState.mark, foe);
		const move = battle.dex.getActiveMove('darkpulse');
		event('ModifyMove', p, move, p, foe);
		assert(move.ignorePositiveDefensive);
		assert.equal(battle.runEvent('BasePower', p, foe, move, 100), 130);
		hit('darkpulse', p, foe);
		assert.equal(p.abilityState.mark, null);
	});
});


describe('Roster support duration protocol', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(ability) {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Mew', ability, moves: ['hypervoice', 'splash']},
		], [{species: 'Blissey', ability: 'No Ability', moves: ['splash', 'tackle']}]]);
		battle.makeChoices('team 1', 'team 1');
		return battle.p1.active[0];
	}
	it('announces Opening Overture duration and its refresh without shortening longer Tailwind', () => {
		const holder = setup('Opening Overture');
		battle.makeChoices('move hypervoice', 'move splash');
		assert.equal(holder.side.sideConditions.tailwind.duration, 2);
		assert(battle.log.some(line => line.includes('|move: Tailwind|[turns] 3|[silent]')));
		holder.abilityState.used = false;
		holder.side.sideConditions.tailwind.duration = 5;
		battle.makeChoices('move hypervoice', 'move splash');
		assert.equal(holder.side.sideConditions.tailwind.duration, 4);
		assert(battle.log.some(line => line.includes('|move: Tailwind|[turns] 5|[silent]')));
	});
	it('keeps Anchor Bridge Sturdy survival without creating Light Screen', () => {
		const holder = setup('Anchor Bridge');
		const attacker = battle.p2.active[0];
		attacker.storedStats.atk = 9999;
		battle.makeChoices('move splash', 'move tackle');
		assert.equal(holder.hp, 1);
		assert.equal(holder.side.sideConditions.lightscreen, undefined);
		assert(!battle.log.some(line => line.includes('|move: Light Screen|[turns] 3|[silent]')));
	});
});
