'use strict';

const assert = require('../assert');
const common = require('../common');

describe('G-Max Spirit Volley', function () {
	let battle;
	afterEach(() => battle?.destroy());

	it('Phantom Barrage adds Hydra Bond power to Dragon Darts and Spirit Volley without extra hits', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Dragapult-Gmax', ability: 'Phantom Barrage', moves: ['dragondarts', 'shadowball']},
		], [
			{species: 'Umbreon', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const dragapult = battle.p1.active[0];
		const foe = battle.p2.active[0];
		const darts = battle.dex.getActiveMove('dragondarts');
		const volley = battle.dex.getActiveMove('gmaxspiritvolley');
		const shadowBall = battle.dex.getActiveMove('shadowball');
		assert.equal(battle.runEvent('BasePower', dragapult, foe, darts, 50), 60);
		assert.equal(battle.runEvent('BasePower', dragapult, foe, volley, 100), 120);
		assert.equal(battle.runEvent('BasePower', dragapult, foe, volley, 50), 60,
			'the weaker Spirit Volley follow-up receives the same ability bonus');
		assert.equal(battle.runEvent('BasePower', dragapult, foe, shadowBall, 80), 80);
		battle.makeChoices('move dragondarts', 'move splash');
		assert.equal(battle.log.filter(line => line.startsWith('|-damage|p2a: Umbreon|') &&
			line.endsWith(`/${foe.maxhp}`)).length, 2);
	});

	it('hits the selected foe at full power and the other foe once at lower power', function () {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species: 'Dragapult', gigantamax: true, moves: ['shadowball']},
			{species: 'Wynaut', moves: ['splash']},
		], [
			{species: 'Umbreon', moves: ['splash']},
			{species: 'Umbreon', moves: ['splash']},
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');
		const dragapult = battle.p1.active[0];
		const move = battle.actions.getMaxMove(battle.dex.moves.get('shadowball'), dragapult);
		assert.equal(move.id, 'gmaxspiritvolley');
		assert.equal(move.basePower, 100);
		assert.equal(move.target, 'adjacentFoe');
		battle.makeChoices('move shadowball dynamax 1, move splash', 'move splash, move splash');
		assert.species(dragapult, 'Dragapult-Gmax');
		const [selected, other] = battle.p2.active;
		const selectedDamage = selected.maxhp - selected.hp;
		const otherDamage = other.maxhp - other.hp;
		assert(selectedDamage > otherDamage, `selected: ${selectedDamage}; other: ${otherDamage}`);
		assert(otherDamage > 0);
		const damageLines = battle.log.filter(line =>
			(line.startsWith('|-damage|p2a: Umbreon|') || line.startsWith('|-damage|p2b: Umbreon|')) &&
			line.endsWith(`/${selected.maxhp}`));
		assert.equal(damageLines.length, 2, 'each foe should take exactly one hit');
		assert.equal(battle.p1.active[1].hp, battle.p1.active[1].maxhp);
	});

	it('hits a surviving lone foe a second time at 50 power', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Dragapult', gigantamax: true, moves: ['shadowball']},
		], [
			{species: 'Umbreon', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move shadowball dynamax', 'move splash');
		const foe = battle.p2.active[0];
		assert.equal(battle.log.filter(line =>
			line.startsWith('|-damage|p2a: Umbreon|') && line.endsWith(`/${foe.maxhp}`)).length, 2);
	});

	it('repeats on the survivor when its partner is knocked out before the attack', function () {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species: 'Dragapult', gigantamax: true, moves: ['shadowball']},
			{species: 'Arceus', moves: ['extremespeed']},
		], [
			{species: 'Umbreon', moves: ['splash']},
			{species: 'Magikarp', level: 1, moves: ['splash']},
		]]);
		battle.makeChoices('team 12', 'team 12');
		battle.makeChoices('move shadowball dynamax 1, move extremespeed 2', 'move splash, move splash');
		assert.equal(battle.p2.pokemon[1].hp, 0);
		assert.equal(battle.log.filter(line => line.startsWith('|-damage|p2a: Umbreon|') &&
			line.endsWith(`/${battle.p2.active[0].maxhp}`)).length, 2);
	});

	it('does not follow up on a target knocked out by the first hit', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Dragapult', gigantamax: true, moves: ['shadowball']},
		], [
			{species: 'Umbreon', level: 1, moves: ['splash']},
			{species: 'Mew', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.p2.active[0].hp = 1;
		battle.makeChoices('move shadowball dynamax', 'move splash');
		assert.equal(battle.p2.pokemon[0].hp, 0);
		assert.equal(battle.log.filter(line => line.startsWith('|-anim|')).length, 0);
	});

	for (const protection of ['immunity', 'protect', 'maxguard']) {
		it(`preserves ${protection} against the single-target fallback`, function () {
			const species = protection === 'immunity' ? 'Snorlax' : 'Umbreon';
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
				{species: 'Dragapult', gigantamax: true, moves: ['shadowball']},
			], [{species, moves: [protection === 'immunity' ? 'splash' : protection]}]]);
			battle.makeChoices('team 1', 'team 1');
			battle.makeChoices('move shadowball dynamax', 'move 1');
			const foe = battle.p2.active[0];
			const damageLines = battle.log.filter(line => line.startsWith(`|-damage|p2a: ${species}|`) &&
				line.endsWith(`/${foe.maxhp}`));
			if (protection === 'protect') {
				assert.equal(damageLines.length, 2);
				assert(battle.log.some(line => line.includes('|-zbroken|')));
			} else {
				assert.equal(foe.hp, foe.maxhp);
				assert.equal(damageLines.length, 0);
			}
		});
	}

	it('checks Ghost immunity on the second foe', function () {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species: 'Dragapult', gigantamax: true, moves: ['shadowball']},
			{species: 'Wynaut', moves: ['splash']},
		], [
			{species: 'Umbreon', moves: ['splash']},
			{species: 'Snorlax', moves: ['splash']},
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');
		battle.makeChoices('move shadowball dynamax 1, move splash', 'move splash, move splash');
		assert.equal(battle.p2.active[1].hp, battle.p2.active[1].maxhp);
		assert(battle.log.some(line => line.includes('|-immune|p2b: Snorlax')));
	});

	it('reduces the follow-up damage through Protect', function () {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species: 'Dragapult', gigantamax: true, moves: ['shadowball']},
			{species: 'Wynaut', moves: ['splash']},
		], [
			{species: 'Umbreon', moves: ['splash']},
			{species: 'Umbreon', moves: ['protect']},
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');
		battle.makeChoices('move shadowball dynamax 1, move splash', 'move splash, move protect');
		const [selected, protectedFoe] = battle.p2.active;
		assert(protectedFoe.hp < protectedFoe.maxhp);
		assert(protectedFoe.maxhp - protectedFoe.hp < (selected.maxhp - selected.hp) / 2);
		assert(battle.log.some(line => line.includes('|-zbroken|p2b: Umbreon')));
	});
});
