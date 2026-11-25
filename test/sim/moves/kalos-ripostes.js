'use strict';

const assert = require('assert').strict;
const common = require('../../common');

describe('Kalos Mega Ripostes', () => {
	let battle;
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	function start(species, item, signature, foeAttack = 'tackle', ffa = false) {
		const spare = { species: 'Mew', ability: 'No Ability', moves: ['splash'] };
		const teams = [
			[{ species, item, moves: [signature, 'protect', 'tackle'] }, spare],
			[{ ...spare, moves: [foeAttack, 'splash'] }, spare],
		];
		if (ffa) teams.push([spare, spare], [spare, spare]);
		battle = common.createBattle({ formatid: ffa ? 'gen9freeforall4pmistyfieldadrienn' : 'gen9nofieldsinglesgame' }, teams);
		battle.makeChoices(...teams.map(() => 'team 12'));
		const [user, foe] = [battle.p1.active[0], battle.p2.active[0]];
		assert(battle.actions.runMegaEvo(user));
		battle.randomizer = n => n;
		battle.randomChance = (n, d) => n >= d;
		for (const p of battle.getAllActive()) p.hp = p.baseMaxhp = p.maxhp = 4096;
		return [user, foe];
	}

	for (const [move, loss] of [['tackle', 512], ['rockblast', 256], ['splash', 0]]) {
		it('Bramble Guard retaliates once for ' + move, () => {
			const [user, foe] = start('Chesnaught', 'Chesnaughtite', 'spikyshield', move);
			const hp = foe.hp;
			battle.makeChoices('move spikyshield', 'move ' + move);
			assert(battle.log.some(line => line.includes('|Bramble Guard|')));
			assert.equal(hp - foe.hp, loss);
			assert.equal(!!user.volatiles.guardiancounter, !!loss);
			if (loss) assert(battle.log.some(line => line.includes('|Aegis Charge|')));
		});
	}

	it('treats Bramble Guard chip as indirect damage against Magic Guard', () => {
		const [user, foe] = start('Chesnaught', 'Chesnaughtite', 'spikyshield', 'rockblast');
		foe.setAbility('magicguard');
		battle.makeChoices('move spikyshield', 'move rockblast');
		assert.equal(foe.hp, foe.maxhp);
		assert(user.volatiles.guardiancounter);
	});

	it('snares the first blocked contact attacker on each stay and respects Protective Pads', () => {
		const [user, foe] = start('Chesnaught', 'Chesnaughtite', 'spikyshield', 'tackle');
		const block = () => battle.makeChoices('move spikyshield', 'move tackle');
		const resetStall = () => battle.makeChoices('move tackle', 'move splash');
		foe.setItem('protectivepads');
		block();
		assert.equal(foe.boosts.spe, 0);
		foe.takeItem();
		resetStall();
		block();
		assert.equal(foe.boosts.spe, -1);
		resetStall();
		block();
		assert.equal(foe.boosts.spe, -1);
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(battle.p1.active[0], user);
		block();
		assert.equal(foe.boosts.spe, -2);
	});

	it('Hexfire breaks only the opposing Light Screen after a charged hit', () => {
		const [user, foe] = start('Delphox', 'Delphoxite', 'mysticalfire');
		for (const side of [user.side, foe.side]) side.addSideCondition('lightscreen', side.active[0]);
		foe.side.addSideCondition('reflect', foe);
		battle.makeChoices('move mysticalfire', 'move splash');
		assert(foe.side.sideConditions.lightscreen);
		assert.equal(foe.boosts.spa, -1);
		battle.makeChoices('move protect', 'move tackle');
		assert(user.volatiles.guardiancounter);
		battle.makeChoices('move tackle', 'move splash');
		assert(user.volatiles.guardiancounter);
		const before = battle.log.length;
		battle.makeChoices('move mysticalfire', 'move splash');
		const log = battle.log.slice(before);
		const damage = log.findIndex(line => line.startsWith('|-damage|p2'));
		const screen = log.findIndex(line => line.startsWith('|-sideend|p2') && line.includes('Light Screen'));
		assert(log.some(line => line.includes('|Hexfire|')));
		assert(damage >= 0 && screen > damage);
		assert(!foe.side.sideConditions.lightscreen);
		assert(user.side.sideConditions.lightscreen);
		assert(foe.side.sideConditions.reflect);
		assert.equal(foe.boosts.spa, -2);
		assert(!user.volatiles.guardiancounter);
	});

	it('retains the Mystical Fire power bonus in Bewitched Woods', () => {
		const [user, foe] = start('Delphox', 'Delphoxite', 'mysticalfire');
		const hp = foe.hp;
		battle.makeChoices('move mysticalfire', 'move splash');
		const ordinary = hp - foe.hp;
		assert(battle.field.setTerrain('bewitchedwoodsterrain', user));
		const before = foe.hp;
		battle.makeChoices('move mysticalfire', 'move splash');
		assert(before - foe.hp > ordinary * 1.4);
		assert(battle.log.some(line => line.includes('Mystical aura amplified')));
	});

	it('loses the stored charge when its holder switches', () => {
		const [user] = start('Delphox', 'Delphoxite', 'mysticalfire');
		battle.makeChoices('move protect', 'move tackle');
		assert(user.volatiles.guardiancounter);
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(battle.p1.active[0], user);
		assert(!user.volatiles.guardiancounter);
	});

	it('keeps Light Screen when a Substitute takes the charged hit', () => {
		const [user, foe] = start('Delphox', 'Delphoxite', 'mysticalfire');
		battle.makeChoices('move protect', 'move tackle');
		foe.addVolatile('substitute');
		foe.side.addSideCondition('lightscreen', foe);
		const subHP = foe.volatiles.substitute.hp;
		battle.makeChoices('move mysticalfire', 'move splash');
		assert(foe.volatiles.substitute.hp < subHP);
		assert.equal(foe.hp, foe.maxhp);
		assert(foe.side.sideConditions.lightscreen);
		assert(!user.volatiles.guardiancounter);
	});

	for (const shuriken of ['watershuriken', 'mistshuriken']) it(shuriken + ' preserves the volley and drops Speed once when charged', () => {
		const [user, foe] = start('Greninja', 'Greninjite', shuriken);
		user.storedStats.atk = user.storedStats.spa + 100;
		for (let i = 0; i < 3; i++) user.side.addSideCondition('spikes', foe);
		user.side.addSideCondition('toxicspikes', foe);
		assert.equal(user.ability, 'shadowcurrent');
		const pp = user.moveSlots[0].pp;
		assert.equal(battle.dex.moves.get(shuriken).pp, battle.dex.moves.get('watershuriken').pp);
		battle.makeChoices('move ' + shuriken, 'move splash');
		assert.equal(user.moveSlots[0].pp, pp - 1);
		assert.equal(foe.boosts.spe, 0);
		assert.equal(user.side.sideConditions.spikes.layers, 3);
		battle.makeChoices('move protect', 'move tackle');
		assert(user.volatiles.guardiancounter);
		const original = battle.actions.getDamage;
		const hits = [];
		battle.actions.getDamage = function (attacker, defender, move, ...rest) {
			if (attacker === user && defender === foe && move.id === 'watershuriken') {
				hits.push([move.category, move.willCrit, move.priority, move.basePowerCallback.call(battle, user, foe, move)]);
			}
			return original.call(this, attacker, defender, move, ...rest);
		};
		const before = battle.log.length;
		battle.makeChoices('move ' + shuriken, 'move splash');
		assert(battle.log.some(line => line.includes('|Mist Shuriken|')));
		assert(hits.length >= 2 && hits.length <= 5);
		assert.deepEqual(hits[0], ['Physical', true, 1, 90]);
		assert(hits.slice(1).every(hit => hit[0] === 'Physical' && hit[1] && hit[2] === 1 && hit[3] === 20));
		assert.equal(foe.boosts.spe, -1);
		assert.equal(user.side.sideConditions.spikes.layers, 3);
		assert.equal(user.side.sideConditions.toxicspikes.layers, 1);
		assert.equal(user.moveSlots[0].pp, pp - 2);
		assert(!user.volatiles.guardiancounter);
		const hazards = battle.log.slice(before).filter(line => line.startsWith('|-side') && line.includes('|Spikes'));
		assert.deepEqual(hazards, []);
	});

	it('adds one hit on a KO and slows one surviving foe in an FFA volley', () => {
		const [user, foe] = start('Greninja', 'Greninjite', 'watershuriken', 'tackle', true);
		user.addVolatile('guardiancounter', user, user.getAbility());
		user.side.addSideCondition('spikes', foe);
		foe.hp = 1;
		const random = battle.random.bind(battle);
		battle.random = (min, max) => min === 3 && max === 7 ? 3 : random(min, max);
		const original = battle.actions.getDamage;
		const hits = [];
		battle.actions.getDamage = function (attacker, defender, move, ...rest) {
			if (attacker === user && move.id === 'watershuriken') hits.push(defender);
			return original.call(this, attacker, defender, move, ...rest);
		};
		const before = battle.log.length;
		battle.actions.useMove('watershuriken', user, { target: foe });
		assert.equal(foe.hp, 0);
		assert.equal(hits.length, 4);
		assert.equal(hits[0], foe);
		assert(hits.slice(1).every(target => target !== foe));
		assert.equal(foe.boosts.spe, 0);
		assert.equal(hits[1].boosts.spe, -1);
		assert.equal(user.side.sideConditions.spikes.layers, 1);
		const hazards = battle.log.slice(before).filter(line => line.startsWith('|-side') && line.includes('|Spikes'));
		assert.deepEqual(hazards, []);
	});

	for (const [species, item, signature] of [
		['Delphox', 'Delphoxite', 'mysticalfire'],
		['Greninja', 'Greninjite', 'watershuriken'],
	]) {
		it('spends the ' + species + ' charge on a protected attempt without its bonus effect', () => {
			const [user, foe] = start(species, item, signature, 'protect');
			foe.side.addSideCondition('lightscreen', foe);
			user.addVolatile('guardiancounter', user, user.getAbility());
			battle.makeChoices('move ' + signature, 'move protect');
			assert(!user.volatiles.guardiancounter);
			assert(foe.side.sideConditions.lightscreen);
			assert.equal(foe.boosts.spe, 0);
			assert.equal(foe.hp, foe.maxhp);
		});
	}

	for (const reason of ['miss', 'Substitute', 'Clear Body', 'Water Absorb']) {
		it('respects ' + reason + ' on a charged Mist Shuriken', () => {
			const [user, foe] = start('Greninja', 'Greninjite', 'watershuriken');
			user.addVolatile('guardiancounter', user, user.getAbility());
			if (reason === 'miss') battle.onEvent('Accuracy', battle.format, () => 0);
			else if (reason === 'Substitute') foe.addVolatile('substitute');
			else foe.setAbility(reason);
			battle.makeChoices('move watershuriken', 'move splash');
			assert(!user.volatiles.guardiancounter);
			assert.equal(foe.boosts.spe, 0);
			if (reason === 'Clear Body') assert(foe.hp < foe.maxhp);
			else assert.equal(foe.hp, foe.maxhp);
		});
	}

	it('resolves saved move names to the current signatures', () => {
		const { Dex } = require('../../../dist/sim');
		for (const [before, current] of [
			['Briar Riposte', 'Bramble Guard'], ['Ember Riposte', 'Hexfire'], ['Tide Riposte', 'Mist Shuriken'],
		]) assert.equal(Dex.moves.get(before).name, current);
	});
});
