'use strict';

const assert = require('./../assert');
const common = require('./../common');

let battle;

describe('Feraligatr custom data', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('uses the requested base, Mega, and G-Max stats and learnset cleanup', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Feraligatr', moves: ['splash']},
		], [
			{species: 'Wynaut', moves: ['splash']},
		]]);
		const feraligatr = battle.dex.species.get('Feraligatr');
		const mega = battle.dex.species.get('Feraligatr-Mega');
		const gmax = battle.dex.species.get('Feraligatr-Gmax');
		assert.deepEqual(feraligatr.baseStats, {hp: 100, atk: 109, def: 100, spa: 59, spd: 93, spe: 78});
		assert.deepEqual(mega.baseStats, {hp: 100, atk: 164, def: 125, spa: 59, spd: 108, spe: 83});
		assert.deepEqual(gmax.baseStats, {hp: 150, atk: 109, def: 100, spa: 59, spd: 93, spe: 78});
		assert.equal(feraligatr.canGigantamax, 'G-Max Death Roll');
		assert.equal(gmax.abilities[0], 'Tidal Jaw');

		const learnset = battle.dex.data.Learnsets.feraligatr.learnset;
		for (const move of ['agility', 'chillingwater', 'breakingswipe', 'detect', 'flipturn', 'poisonfang', 'razorshell', 'sludgebomb', 'sludgewave', 'trailblaze']) {
			assert(move in learnset, `Feraligatr should learn ${move}`);
		}
		for (const move of ['firefang', 'thunderfang', 'fishiousrend']) {
			assert(!(move in learnset), `Feraligatr should not learn ${move}`);
		}
		const inheritedLearnset = new Set();
		for (const entry of battle.dex.species.getFullLearnset('feraligatrgmax')) {
			for (const move of Object.keys(entry.learnset || {})) inheritedLearnset.add(move);
		}
		assert(inheritedLearnset.has('flipturn'), 'Feraligatr-Gmax should inherit Feraligatr moves');
		assert(inheritedLearnset.has('trailblaze'), 'Feraligatr-Gmax should inherit custom Feraligatr moves');
		assert(inheritedLearnset.has('poisonfang'), 'Feraligatr-Gmax should inherit Poison Fang');
		assert(inheritedLearnset.has('sludgebomb'), 'Feraligatr-Gmax should inherit Sludge Bomb');
		assert(inheritedLearnset.has('sludgewave'), 'Feraligatr-Gmax should inherit Sludge Wave');
		assert(!inheritedLearnset.has('firefang'), 'Feraligatr-Gmax should inherit fang removals');
		assert(!inheritedLearnset.has('fishiousrend'), 'Feraligatr-Gmax should inherit the Fishious Rend removal');
		assert(!inheritedLearnset.has('gmaxdeathroll'), 'G-Max Death Roll should be a battle-time signature move');
	});

	it('only gives Mighty Jaw priority to biting moves on its first action', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Feraligatr', ability: 'mightyjaw', moves: ['bite', 'surf']},
		], [
			{species: 'Wynaut', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const feraligatr = battle.p1.active[0];
		const ability = battle.dex.abilities.get('mightyjaw');
		const bite = battle.dex.moves.get('bite');
		const surf = battle.dex.moves.get('surf');
		assert.equal(ability.onModifyPriority?.call(battle, 0, feraligatr, null, bite), 2);
		assert.equal(ability.onModifyPriority?.call(battle, 0, feraligatr, null, surf), undefined);
		ability.onAfterMove?.call(battle, feraligatr);
		assert.equal(ability.onModifyPriority?.call(battle, 0, feraligatr, null, bite), undefined);
	});

	it('selects a single-target G-Max Death Roll with a field-wide flinch chance', function () {
		battle = common.createBattle({formatid: 'gen9doublesmistyfieldadrienn'}, [[
			{species: 'Feraligatr', gigantamax: true, moves: ['bite']},
			{species: 'Wynaut', moves: ['splash']},
		], [
			{species: 'Wynaut', moves: ['splash']},
			{species: 'Wynaut', moves: ['splash']},
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');
		const feraligatr = battle.p1.active[0];
		const move = battle.actions.getMaxMove(battle.dex.moves.get('bite'), feraligatr);
		assert.equal(move.id, 'gmaxdeathroll');
		assert.equal(move.basePower, 140);
		assert.equal(move.category, 'Physical');
		assert.equal(move.accuracy, true);
		assert.equal(move.target, 'adjacentFoe');
		assert.equal(move.secondaries, undefined);
		assert(move.self?.onHit);
		battle.makeChoices('move bite dynamax 1, move splash', 'move splash, move splash');
		assert.species(feraligatr, 'Feraligatr-Gmax');
		assert.equal(feraligatr.ability, 'tidaljaw');
		assert(feraligatr.hasAbility('strongjaw'));
		assert(feraligatr.hasAbility('swiftswim'));
		assert(feraligatr.hasAbility('filter'));
		assert(feraligatr.hasAbility('proficient'));
		assert(battle.log.some(line => line.includes('G-Max Death Roll')));
	});

	it('damages only the selected foe but rolls flinch for both foes', function () {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species: 'Feraligatr', gigantamax: true, moves: ['bite']},
			{species: 'Wynaut', moves: ['splash']},
		], [
			{species: 'Umbreon', moves: ['splash']},
			{species: 'Umbreon', moves: ['splash']},
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');
		const flinchRolls = [];
		const randomChance = battle.randomChance;
		battle.randomChance = (numerator, denominator) => {
			if (numerator === 3 && denominator === 10) {
				flinchRolls.push(true);
				return true;
			}
			return randomChance.call(battle, numerator, denominator);
		};
		battle.makeChoices('move bite dynamax 1, move splash', 'move splash, move splash');
		assert(battle.p2.active[0].hp < battle.p2.active[0].maxhp);
		assert.equal(battle.p2.active[1].hp, battle.p2.active[1].maxhp);
		assert.equal(flinchRolls.length, 2);
		assert(battle.log.some(line => line.includes('p2a: Umbreon') && line.includes('flinch')));
		assert(battle.log.some(line => line.includes('p2b: Umbreon') && line.includes('flinch')));
	});

	it('keeps Water Veil Aqua Ring healing through G-Max', function () {
		battle = common.createBattle({formatid: 'gen9doublesmistyfieldadrienn'}, [[
			{species: 'Feraligatr', ability: 'waterveil', gigantamax: true, moves: ['bite', 'splash']},
			{species: 'Wynaut', moves: ['splash']},
		], [
			{species: 'Wynaut', moves: ['splash']},
			{species: 'Wynaut', moves: ['splash']},
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');
		const feraligatr = battle.p1.active[0];
		assert(feraligatr.volatiles['aquaring'], 'Water Veil should grant Aqua Ring before G-Max');
		battle.makeChoices('move splash dynamax, move splash', 'move splash, move splash');
		assert.species(feraligatr, 'Feraligatr-Gmax');
		assert(feraligatr.volatiles['aquaring'], 'Water Veil Aqua Ring should survive G-Max');
		battle.directDamage(100, feraligatr);
		const hpBeforeHealing = feraligatr.hp;
		battle.makeChoices('move splash, move splash', 'move splash, move splash');
		assert(feraligatr.hp > hpBeforeHealing, 'Aqua Ring should heal after G-Max');
	});
});
