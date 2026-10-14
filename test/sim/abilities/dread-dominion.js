'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim/dex');
const {TeamValidator} = require('../../../dist/sim/team-validator');

describe('Mega Mightyena and Dread Dominion', () => {
	let battle;
	afterEach(() => { if (battle) battle.destroy(); battle = null; });
	for (const species of ['Mightyena', 'Mightyena-Grim', 'Mightyena-Deso']) {
		it(`Mega Evolves ${species} with Grimyinite and swaps its passive`, () => {
			const set = {species, ability: 'Intimidate', item: 'Grimyinite', moves: ['Protect']};
			assert.equal(TeamValidator.get('gen9nofieldsinglesgame').validateTeam([set]), null);
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[set], [
				{species: 'Mew', ability: 'Synchronize', moves: ['Splash']},
			]]);
			battle.makeChoices('team 1', 'team 1');
			assert.equal(battle.p1.active[0].canMegaEvo, species === 'Mightyena-Grim' ? 'Mightyena-Mega-Grim' : 'Mightyena-Mega');
			battle.makeChoices('move 1 mega', 'move 1');
			const mon = battle.p1.active[0];
			assert.equal(mon.species.name, species === 'Mightyena-Grim' ? 'Mightyena-Mega-Grim' : 'Mightyena-Mega');
			assert.deepEqual(mon.species.baseStats, {hp: 90, atk: 150, def: 115, spa: 85, spd: 100, spe: 130});
			assert.equal(mon.species.bst, Dex.species.get('Mightyena').bst + 100);
			assert.equal(mon.ability, 'dreaddominion');
			assert.deepEqual(mon.species.passives, ['darkaura']);
			assert(mon.hasAbilityOrPassive('darkaura'));
			assert(!mon.hasAbilityOrPassive('infiltrator'));
			const foe = battle.p2.active[0];
			const move = battle.dex.getActiveMove('darkpulse');
			assert.equal(battle.runEvent('BasePower', mon, foe, move, 80, true), 106);
			assert(battle.log.some(line => line.includes('Dark Aura')), battle.log.join('\n'));
		});
	}
	function setup() {
		battle = common.createBattle({gameType: 'doubles'}, [[
			{species: 'Mew', ability: 'Dread Dominion', moves: ['Tackle']},
			{species: 'Clefairy', ability: 'No Ability', moves: ['Splash']},
			{species: 'Mew', ability: 'No Ability', moves: ['Splash']},
		], [
			{species: 'Clefairy', ability: 'No Ability', moves: ['Splash']},
			{species: 'Umbreon', ability: 'No Ability', moves: ['Splash']},
		]]);
		return battle.p1.active[0];
	}
	function effectiveness(mon, type) { return mon.runEffectiveness(battle.dex.getActiveMove(type === 'Dark' ? 'darkpulse' : 'moonblast')); }
	it('preserves normal Dark/Fairy matchups on both sides and with multiple holders', () => {
		setup();
		assert.equal(effectiveness(battle.p1.active[1], 'Dark'), -1);
		assert.equal(effectiveness(battle.p2.active[0], 'Dark'), -1);
		assert.equal(effectiveness(battle.p2.active[1], 'Fairy'), 1);
		battle.p2.active[0].setType(['Fairy', 'Psychic']);
		assert.equal(effectiveness(battle.p2.active[0], 'Dark'), 0);
		battle.p2.active[1].setType(['Dark', 'Dragon']);
		assert.equal(effectiveness(battle.p2.active[1], 'Fairy'), 2);
		battle.p1.active[1].setAbility('dreaddominion');
		assert.equal(effectiveness(battle.p2.active[1], 'Fairy'), 2);
	});
	it('keeps normal matchups through suppression', () => {
		const holder = setup();
		holder.addVolatile('gastroacid');
		assert.equal(effectiveness(battle.p2.active[0], 'Dark'), -1);
		assert.equal(effectiveness(battle.p2.active[1], 'Fairy'), 1);
		holder.removeVolatile('gastroacid');
		assert.equal(effectiveness(battle.p2.active[0], 'Dark'), -1);
	});
	it('keeps normal matchups after switching', () => {
		setup();
		battle.makeChoices('switch 3, move 1', 'move 1, move 1');
		assert.equal(effectiveness(battle.p2.active[0], 'Dark'), -1);
		assert.equal(effectiveness(battle.p2.active[1], 'Fairy'), 1);
	});
	it('keeps normal matchups after fainting', () => {
		const holder = setup();
		holder.faint();
		battle.faintMessages();
		assert.equal(effectiveness(battle.p2.active[0], 'Dark'), -1);
		assert.equal(effectiveness(battle.p2.active[1], 'Fairy'), 1);
	});
	it('does not stack Dark Aura passives and still supports Aura Break', () => {
		battle = common.createBattle({gameType: 'doubles'}, [[
			{species: 'Mightyena-Mega', ability: 'Dread Dominion', moves: ['Splash']},
			{species: 'Mightyena-Mega', ability: 'Dread Dominion', moves: ['Splash']},
		], [
			{species: 'Mew', ability: 'No Ability', moves: ['Splash']},
			{species: 'Mew', ability: 'No Ability', moves: ['Splash']},
		]]);
		const source = battle.p2.active[0], target = battle.p1.active[0];
		assert.equal(battle.runEvent('BasePower', source, target, battle.dex.getActiveMove('darkpulse'), 80, true), 106);
		battle.p2.active[1].setAbility('aurabreak');
		const move = battle.dex.getActiveMove('darkpulse');
		battle.runEvent('TryPrimaryHit', target, source, move);
		assert.equal(battle.runEvent('BasePower', source, target, move, 80, true), 60);
	});
	it('uses the existing Hydra Bond hits and Moxie knockout boost', () => {
		battle = common.createBattle({}, [[{species: 'Mew', ability: 'Dread Dominion', moves: ['Tackle']}], [
			{species: 'Blissey', ability: 'No Ability', moves: ['Splash']},
			{species: 'Mew', ability: 'No Ability', moves: ['Splash']},
		]]);
		const holder = battle.p1.active[0];
		assert(holder.hasAbility('hydrabond'));
		assert(holder.hasAbility('moxie'));
		battle.makeChoices();
		assert(battle.log.some(line => line.startsWith('|-hitcount|') && line.endsWith('|3')));
		battle.p2.active[0].hp = 1;
		battle.makeChoices();
		assert.equal(holder.boosts.atk, 1);
	});
});
