'use strict';
const assert = require('assert').strict;
const common = require('../../common');

describe('Chained hit immunities', () => {
	let battle;
	afterEach(() => battle?.destroy());

	for (const ability of ['Water Absorb', 'Storm Drain']) {
		it(`Water Shuriken skips ${ability} and chains to a hittable foe after a KO`, () => {
			battle = common.createBattle({ formatid: 'gen9freeforall4pmistyfieldadrienn' }, [
				[{ species: 'Greninja', ability: 'Stalwart', moves: ['watershuriken'] }],
				[{ species: 'Magikarp', ability: 'No Ability', moves: ['splash'] }],
				[{ species: 'Vaporeon', ability, moves: ['splash'] }],
				[{ species: 'Blissey', ability: 'No Ability', moves: ['splash'] }],
			]);
			battle.makeChoices('team 1', 'team 1', 'team 1', 'team 1');
			const firstTarget = battle.p2.active[0];
			const immune = battle.p3.active[0];
			const hittable = battle.p4.active[0];
			firstTarget.hp = 1;
			const originalSample = battle.sample.bind(battle);
			battle.sample = values => values.includes(immune) ? immune : originalSample(values);
			battle.makeChoices('move watershuriken +1', 'move splash', 'move splash', 'move splash');
			assert.equal(firstTarget.hp, 0);
			assert.equal(immune.hp, immune.maxhp, battle.log.join('\n'));
			if (ability === 'Storm Drain') assert.equal(immune.boosts.spa, 0);
			assert(hittable.hp < hittable.maxhp, battle.log.join('\n'));
			assert(!battle.log.some(line => line.includes('absorbed some of the water')));
		});
	}

	for (const ability of ['Water Absorb', 'Storm Drain']) {
		it(`Water Shuriken stops when the only remaining foe has ${ability}`, () => {
			battle = common.createBattle({ formatid: 'gen9multimistyfieldadrienn' }, [
				[{ species: 'Greninja', ability: 'Stalwart', moves: ['watershuriken'] }],
				[{ species: 'Magikarp', ability: 'No Ability', moves: ['splash'] }],
				[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
				[{ species: 'Vaporeon', ability, moves: ['splash'] }],
			]);
			battle.makeChoices('team 1', 'team 1', 'team 1', 'team 1');
			const firstTarget = battle.p2.active[0];
			const immune = battle.p4.active[0];
			firstTarget.hp = 1;
			battle.makeChoices('move watershuriken +1', 'move splash', 'move splash', 'move splash');
			assert.equal(firstTarget.hp, 0);
			assert.equal(immune.hp, immune.maxhp);
			if (ability === 'Storm Drain') assert.equal(immune.boosts.spa, 0);
			assert(!battle.log.some(line => line.includes('absorbed some of the water')));
		});
	}

	it('Population Bomb stops instead of chaining into a Ghost-type immunity', () => {
		battle = common.createBattle({ formatid: 'gen9multimistyfieldadrienn' }, [
			[{ species: 'Mew', ability: 'Skill Link', moves: ['populationbomb'] }],
			[{ species: 'Magikarp', ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Gengar', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1', 'team 1', 'team 1');
		const firstTarget = battle.p2.active[0];
		const immune = battle.p4.active[0];
		battle.p1.active[0].boosts.accuracy = 6;
		firstTarget.hp = 1;
		battle.makeChoices('move populationbomb +1', 'move splash', 'move splash', 'move splash');
		assert.equal(firstTarget.hp, 0);
		assert.equal(immune.hp, immune.maxhp);
		assert(!battle.log.some(line => line.includes(`|-immune|${immune.getSlot()}`)));
	});

	it('Dual Wield chooses a hittable foe for its chained Water hit', () => {
		battle = common.createBattle({ formatid: 'gen9freeforall4pmistyfieldadrienn' }, [
			[{ species: 'Mew', ability: 'Dual Wield', moves: ['waterpulse'] }],
			[{ species: 'Magikarp', ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Vaporeon', ability: 'Water Absorb', moves: ['splash'] }],
			[{ species: 'Blissey', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1', 'team 1', 'team 1');
		const firstTarget = battle.p2.active[0];
		const immune = battle.p3.active[0];
		const hittable = battle.p4.active[0];
		firstTarget.hp = 1;
		const originalSample = battle.sample.bind(battle);
		battle.sample = values => values.includes(immune) ? immune : originalSample(values);
		battle.makeChoices('move waterpulse +1', 'move splash', 'move splash', 'move splash');
		assert.equal(firstTarget.hp, 0);
		assert.equal(immune.hp, immune.maxhp, battle.log.join('\n'));
		assert(hittable.hp < hittable.maxhp, battle.log.join('\n'));
	});

	it('still chains into Water Absorb when Mold Breaker bypasses the ability', () => {
		battle = common.createBattle({ formatid: 'gen9multimistyfieldadrienn' }, [
			[{ species: 'Greninja', ability: 'Mold Breaker', moves: ['watershuriken'] }],
			[{ species: 'Magikarp', ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Vaporeon', ability: 'Water Absorb', moves: ['splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1', 'team 1', 'team 1');
		const firstTarget = battle.p2.active[0];
		const absorber = battle.p4.active[0];
		firstTarget.hp = 1;
		battle.makeChoices('move watershuriken +1', 'move splash', 'move splash', 'move splash');
		assert.equal(firstTarget.hp, 0);
		assert(absorber.hp < absorber.maxhp, battle.log.join('\n'));
	});
});
