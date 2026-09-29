'use strict';

const assert = require('../../assert');
const common = require('../../common');

describe('Gimmick follow-up audit regressions', () => {
	let battle;
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	const opponentChoices = 'move amnesia, move amnesia';
	function createDoubles(event, spendFirstGimmick) {
		const charizard = {
			species: 'Charizard', ability: 'Intimidate',
			item: event === 'megay' ? 'Charizardite X' : 'Charizardite Y', moves: ['sunnyday'],
		};
		const magikarp = { species: 'Magikarp', ability: 'Swift Swim', item: 'Normalium Z', moves: ['splash', 'tackle'] };
		const mew = { species: 'Mew', ability: 'Synchronize', moves: ['amnesia'] };
		battle = common.createBattle({ formatid: 'gen9doublesmistyfieldadrienn' }, [
			spendFirstGimmick ? [charizard, { ...mew }, magikarp] : [charizard, magikarp],
			[{ ...mew }, { ...mew }],
		]);
		battle.makeChoices(spendFirstGimmick ? 'team 123' : 'team 12', 'team 12');
		if (spendFirstGimmick) {
			battle.makeChoices('move sunnyday, move amnesia terastallize', opponentChoices);
			battle.makeChoices('move sunnyday, switch 3', opponentChoices);
			assert.equal(battle.p1.gimmickCount, 1);
		}
	}

	for (const event of ['mega', 'megax', 'megay']) {
		it(`reserves the last gimmick for ${event} before accepting a partner's Z move`, () => {
			createDoubles(event, true);
			assert.throws(() => battle.makeChoices(`move sunnyday ${event}, move splash zmove`, opponentChoices),
				/enough gimmick uses/);
			assert.equal(battle.p1.gimmickCount, 1);
			assert.species(battle.p1.active[0], 'Charizard');
			assert.equal(battle.p1.active[1].boosts.atk, 0);
			battle.makeChoices(`move sunnyday ${event}, move splash`, opponentChoices);
			assert(battle.p1.active[0].species.isMega);
			assert.equal(battle.p1.gimmickCount, 2);
			assert.equal(battle.p1.active[1].boosts.atk, 0);
		});

		it(`allows ${event} and a partner's Z move when both gimmicks remain`, () => {
			createDoubles(event, false);
			battle.makeChoices(`move sunnyday ${event}, move splash zmove`, opponentChoices);
			assert(battle.p1.active[0].species.isMega);
			assert.equal(battle.p1.active[1].boosts.atk, 3);
			assert.equal(battle.p1.gimmickCount, 2);
		});
	}

	it('stops both status and damaging Z effects when execution cannot spend a gimmick', () => {
		createDoubles('megax', false);
		battle.makeChoices('move sunnyday megax, move splash zmove', opponentChoices);
		const magikarp = battle.p1.active[1];
		const target = battle.p2.active[0];
		const hp = target.hp;
		// Exercise the execution guard independently of choice validation, after two real gimmicks.
		battle.actions.runMove('splash', magikarp, 0, { zMove: 'Z-Splash' });
		assert.equal(magikarp.boosts.atk, 3);
		assert.equal(magikarp.moveThisTurnResult, false);
		battle.actions.runMove('tackle', magikarp, 1, { zMove: 'Breakneck Blitz' });
		assert.equal(target.hp, hp);
		assert.equal(magikarp.moveThisTurnResult, false);
		assert.equal(battle.p1.gimmickCount, 2);
	});

	it('keeps an exhausted Gmax signature exhausted after switching without altering other PP', () => {
		battle = common.createBattle({ formatid: 'gen9mistyfieldadrienn' }, [[
			{ species: 'Snorlax', ability: 'Gluttony', gigantamax: true, moves: ['tackle', 'amnesia'] },
			{ species: 'Mew', ability: 'Synchronize', moves: ['amnesia'] },
		], [{ species: 'Dusclops', ability: 'Frisk', moves: ['calmmind'] }]]);
		battle.makeChoices('team 12', 'team 1');
		const snorlax = battle.p1.active[0];
		const otherPP = snorlax.moveSlots[1].pp;
		battle.makeChoices('move tackle dynamax', 'move calmmind');
		for (let i = 1; i < 8; i++) battle.makeChoices('move tackle', 'move calmmind');
		assert.equal(snorlax.moveSlots[0].pp, 0);
		battle.makeChoices('switch 2', 'move calmmind');
		battle.makeChoices('switch 2', 'move calmmind');
		assert.species(snorlax, 'Snorlax-Gmax');
		assert.equal(snorlax.moveSlots[0].pp, 0);
		assert.equal(snorlax.moveSlots[0].maxpp, 8);
		assert.equal(snorlax.moveSlots[1].pp, otherPP);
		const signature = snorlax.getMoveRequestData().maxMoves.maxMoves.find(move => move.move === 'gmaxreplenish');
		assert(signature.disabled);
		assert.equal(battle.p1.gimmickCount, 1);
	});

	it('retains spent Gmax PP through a switch and restores the base allowance on Mega Evolution', () => {
		battle = common.createBattle({ formatid: 'gen9mistyfieldadrienn' }, [[
			{ species: 'Charizard', ability: 'Intimidate', item: 'Charizardite X', gigantamax: true, moves: ['ember', 'sunnyday'] },
			{ species: 'Mew', ability: 'Synchronize', moves: ['amnesia'] },
		], [{ species: 'Blissey', ability: 'Natural Cure', moves: ['softboiled'] }]]);
		battle.makeChoices('team 12', 'team 1');
		const charizard = battle.p1.active[0];
		const originalPP = charizard.moveSlots[0].pp;
		const originalMaxPP = charizard.moveSlots[0].maxpp;
		battle.makeChoices('move sunnyday dynamax', 'move softboiled');
		battle.makeChoices('move ember', 'move softboiled');
		assert.equal(charizard.moveSlots[0].pp, 7);
		battle.makeChoices('switch 2', 'move softboiled');
		battle.makeChoices('switch 2', 'move softboiled');
		assert.equal(charizard.moveSlots[0].pp, 7);
		battle.makeChoices('move sunnyday mega', 'move softboiled');
		assert.species(charizard, 'Charizard-Mega-X');
		assert.equal(charizard.moveSlots[0].pp, originalPP - 1);
		assert.equal(charizard.moveSlots[0].maxpp, originalMaxPP);
		assert.false(charizard.gmaxOriginalMoveSlots);
	});

	for (const stellarFirst of [true, false]) {
		it(`${stellarFirst ? 'preserves existing' : 'does not grant'} Stellar healing when Gigantamaxing`, () => {
			battle = common.createBattle({ formatid: 'gen9mistyfieldadrienn' }, [[
				{ species: 'Machamp', ability: 'Guts', gigantamax: true, moves: ['focusenergy', 'brickbreak'] },
				{ species: 'Mew', ability: 'Synchronize', moves: ['amnesia'] },
			], [{ species: 'Mew', ability: 'Synchronize', moves: ['seismictoss', 'amnesia'] }]]);
			battle.makeChoices('team 12', 'team 1');
			const machamp = battle.p1.active[0];
			battle.makeChoices(`move focusenergy${stellarFirst ? ' terastallize' : ''}`, 'move seismictoss');
			assert.equal(!!machamp.volatiles.stellarhealing, stellarFirst);
			battle.makeChoices('move focusenergy dynamax', 'move seismictoss');
			assert.equal(!!machamp.volatiles.stellarhealing, stellarFirst);
			const hp = machamp.hp;
			battle.makeChoices('move focusenergy', 'move amnesia');
			assert.equal(machamp.hp - hp, stellarFirst ? Math.floor(machamp.baseMaxhp / 16) : 0);
			battle.makeChoices('switch 2', 'move amnesia');
			battle.makeChoices('switch 2', 'move amnesia');
			assert.equal(!!machamp.volatiles.stellarhealing, stellarFirst);
		});
	}
});
