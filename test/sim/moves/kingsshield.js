'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe(`King's Shield`, function () {
	afterEach(() => battle?.destroy());
	it('describes its two-stage contact penalty', () => {
		assert(Dex.moves.get('kingsshield').desc.includes('Attack lowered by 2 stages'));
		assert(Dex.moves.get('kingsshield').shortDesc.includes('-2 Atk'));
	});

	it(`should lower the Atk of a contactor by 2 in Gen 7`, function () {
		battle = common.gen(7).createBattle([
			[{species: "Gallade", ability: 'justified', moves: ['zenheadbutt']}],
			[{species: "Aegislash", ability: 'stancechange', moves: ['kingsshield']}],
		]);
		battle.makeChoices('move zenheadbutt', 'move kingsshield');
		assert.statStage(battle.p1.active[0], 'atk', -2);
	});

	it(`should lower the Atk of a contactor by 2 in Reborn`, () => {
		battle = common.createBattle([
			[{species: "Gallade", ability: 'justified', moves: ['zenheadbutt']}],
			[{species: "Aegislash", ability: 'stancechange', moves: ['kingsshield']}],
		]);
		battle.makeChoices('move zenheadbutt', 'move kingsshield');
		assert.statStage(battle.p1.active[0], 'atk', -2);
	});

	it(`should lower the Atk of a contact-move attacker in 2 levels even if immune`, function () {
		battle = common.createBattle([
			[{species: "Gallade", ability: 'justified', moves: ['drainpunch']}],
			[{species: "Aegislash", ability: 'stancechange', moves: ['kingsshield']}],
		]);
		battle.makeChoices('move drainpunch', 'move kingsshield');
		assert.statStage(battle.p1.active[0], 'atk', -2);
	});
});

describe(`King's Shield [Gen 6]`, function () {
	afterEach(() => battle.destroy());

	common.itGen(6, `should not lower the Atk of a contact-move attacker if immune`, () => {
		battle = common.gen(6).createBattle([
			[{species: "Gallade", ability: 'justified', moves: ['drainpunch']}],
			[{species: "Aegislash", ability: 'stancechange', moves: ['kingsshield']}],
		]);
		battle.makeChoices('move drainpunch', 'move kingsshield');
		assert.statStage(battle.p1.active[0], 'atk', 0);
	});
});
