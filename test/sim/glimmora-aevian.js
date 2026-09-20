'use strict';

const assert = require('assert').strict;
const common = require('../common');
const { Dex } = require('../../dist/sim');
const { TeamValidator } = require('../../dist/sim/team-validator');

const requestedMoves = [
	'injection curse ancientpower harden tackle magnetbomb gust twister autotomize wonderroom magicroom mirrorshot trickroom',
	'paraboliccharge airslash discharge flashcannon disable conversion2 charge workup psyshock toxic lightscreen taunt',
	'safeguard hyperbeam smackdown thunderbolt thunder psychic shadowball reflect sludgebomb aerialace overheat',
	'energyball chargebeam acrobatics explosion embargo rockpolish flash voltswitch thunderwave psychup zapcannon',
	'triattack selfdestruct screech weatherball mudshot electricterrain ironhead bugbuzz powergem metalsound psybeam',
	'stealthrock gravity magiccoat recycle shockwave waterpulse roleplay electroweb focusenergy signalbeam laserfocus',
	'electroball allyswitch trick helpinghand magnetrise terrainpulse defog hurricane gigadrain earthpower',
	'psychicnoise snowscape nastyplot',
].join(' ').split(' ');

let battle;
describe('Glimmora-Aevian, Adaptive Core, and Injection', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('registers both standalone Aevian forms and their exact learnset', () => {
		const regional = Dex.species.get('Glimmora-Aevian');
		const mega = Dex.species.get('Glimmora-Aevian-Mega');
		assert(regional.exists && regional.standalone);
		assert.equal(regional.baseSpecies, 'Glimmora-Aevian');
		assert.deepEqual(regional.types, ['Steel', 'Flying']);
		assert.deepEqual(regional.baseStats, { hp: 83, atk: 55, def: 90, spa: 130, spd: 81, spe: 86 });
		assert.equal(regional.bst, 525);
		assert.deepEqual(regional.abilities, { '0': 'Memory Leak', '1': 'Download', H: 'Filter' });
		assert.deepEqual(mega.types, ['Steel', 'Flying']);
		assert.deepEqual(mega.baseStats, { hp: 83, atk: 65, def: 110, spa: 160, spd: 111, spe: 96 });
		assert.equal(mega.bst, 625);
		assert.equal(mega.abilities[0], 'Adaptive Core');
		assert.equal(mega.requiredItem, 'Glimmoranite');
		assert.equal(new Set(requestedMoves).size, requestedMoves.length, 'Duplicate requested moves');
		for (const species of ['glimmoraaevian', 'glimmoraaevianmega']) {
			const learnset = Dex.species.getLearnsetData(species).learnset;
			assert.deepEqual(Object.keys(learnset).sort(), [...requestedMoves].sort());
			for (const move of requestedMoves) assert(Dex.moves.get(move).exists, move);
			assert.equal(learnset.terablast, undefined);
		}
		assert(Dex.species.getLearnsetData('glimmora').learnset.injection?.length);
		assert(!Dex.species.getLearnsetData('glimmora').learnset.terablast);
	});

	it('routes Glimmoranite to the matching Mega for each Glimmora line', () => {
		const stone = Dex.items.get('Glimmoranite');
		assert.equal(stone.megaStone.Glimmora, 'Glimmora-Mega');
		assert.equal(stone.megaStone['Glimmora-Aevian'], 'Glimmora-Aevian-Mega');
		for (const [species, expected] of [
			['Glimmora', 'Glimmora-Mega'],
			['Glimmora-Aevian', 'Glimmora-Aevian-Mega'],
		]) {
			battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
				{ species, item: 'Glimmoranite', moves: ['splash'] },
			], [{ species: 'Mew', moves: ['splash'] }]]);
			battle.makeChoices('team 1', 'team 1');
			assert.equal(battle.p1.active[0].canMegaEvo, expected);
			battle.makeChoices('move splash mega', 'move splash');
			assert.equal(battle.p1.active[0].species.name, expected);
			battle.destroy();
			battle = null;
		}
	});

	it('accepts each Aevian ability slot and Injection in a normal team', () => {
		const validator = TeamValidator.get('gen9nofieldsinglesgame');
		for (const ability of Object.values(Dex.species.get('Glimmora-Aevian').abilities)) {
			assert.equal(validator.validateTeam([
				{ species: 'Glimmora-Aevian', ability, item: 'Glimmoranite',
					moves: ['Injection', 'Hurricane', 'Flash Cannon', 'Psychic Noise'] },
				{ species: 'Mew', moves: ['Splash'] },
			]), null, ability);
		}
		assert.equal(validator.validateTeam([
			{ species: 'Glimmora', item: 'Glimmoranite', moves: ['Injection', 'Flash Cannon'] },
			{ species: 'Mew', moves: ['Splash'] },
		]), null);
	});

	it('applies all three Adaptive Core components', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Glimmora-Aevian', ability: 'Filter', item: 'Glimmoranite', moves: ['splash'] },
			{ species: 'Mew', moves: ['splash'] },
		], [{ species: 'Snorlax', moves: ['splash'] }]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		const glimmora = battle.p1.active[0];
		assert.equal(glimmora.ability, 'adaptivecore');
		for (const component of ['download', 'defragment', 'selfrepair', 'selfsufficient', 'naturalcure']) {
			assert(glimmora.hasAbility(component), component);
		}
		assert.equal(glimmora.boosts.atk, 1, 'Download did not boost Attack');
		assert.equal(glimmora.boosts.def, 1, 'Defragment did not boost Defense');
		const first = battle.dex.getActiveMove('injection');
		battle.singleEvent('ModifyMove', glimmora.getAbility(), glimmora.abilityState, first, glimmora);
		assert.equal(first.willCrit, true, 'Download did not grant its first-hit critical');
		const second = battle.dex.getActiveMove('injection');
		battle.singleEvent('ModifyMove', glimmora.getAbility(), glimmora.abilityState, second, glimmora);
		assert.notEqual(second.willCrit, true, 'Download granted a second critical');
		assert.equal(battle.singleEvent('AnyAccuracy', glimmora.getAbility(), glimmora.abilityState,
			battle.p2.active[0], glimmora, second, 50), true);
		glimmora.hp = Math.floor(glimmora.maxhp / 2);
		const beforeTurn = glimmora.hp;
		battle.makeChoices('move splash', 'move splash');
		assert(glimmora.hp > beforeTurn, 'Self Repair did not heal at turn end');
		glimmora.setStatus('par');
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(glimmora.status, '', 'Self Repair did not cure status on switch-out');
	});

	it('makes Injection a contact Steel special move that heals half of successful damage', () => {
		const move = Dex.moves.get('Injection');
		assert.equal(move.type, 'Steel');
		assert.equal(move.category, 'Special');
		assert.equal(move.basePower, 75);
		assert.equal(move.accuracy, 100);
		assert.equal(move.pp, 10);
		assert.equal(move.target, 'adjacentFoe');
		assert.equal(move.flags.contact, 1);
		assert.deepEqual(move.drain, [1, 2]);
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Glimmora', moves: ['injection'] },
		], [{ species: 'Snorlax', moves: ['splash'] }]]);
		battle.makeChoices('team 1', 'team 1');
		const glimmora = battle.p1.active[0];
		const foe = battle.p2.active[0];
		glimmora.hp = Math.floor(glimmora.maxhp / 2);
		const beforeHP = glimmora.hp;
		const beforeFoeHP = foe.hp;
		battle.makeChoices('move injection', 'move splash');
		const damage = beforeFoeHP - foe.hp;
		assert(damage > 0, 'Injection did not damage the target');
		assert.equal(glimmora.hp - beforeHP, Math.round(damage / 2));
	});
});
