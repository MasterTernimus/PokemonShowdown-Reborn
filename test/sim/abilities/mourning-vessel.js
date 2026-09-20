'use strict';

const assert = require('../../assert');
const common = require('../../common');

const FORMATS = [
	['singles', 'gen9midnightzone'],
	['doubles', 'gen9doublesmidnightzone'],
	['multi', 'gen9multimidnightzone'],
	['FFA 4P', 'gen9freeforall4pmidnightzone'],
	['FFA 3P', 'gen9freeforall3pmidnightzone'],
	['Multi 1v2', 'gen9multi1v2midnightzone'],
];

describe('Mourning Vessel in Midnight Zone', () => {
	let battle;
	afterEach(() => battle?.destroy());

	for (const [name, formatid] of FORMATS) {
		it(`heals after a real opposing KO in ${name}`, () => {
			const user = { species: 'Spiritomb', ability: 'Mourning Vessel', moves: ['shadowball', 'splash'] };
			const foe = { species: 'Mew', moves: ['splash'] };
			const teams = name === 'doubles' ? [[user, foe], [foe, foe, foe]] : [
				[user], [foe, foe],
				...(name === 'multi' || name === 'FFA 4P' || name === 'Multi 1v2' ? [[foe], [foe]] :
				name === 'FFA 3P' ? [[foe]] : []),
			];
			battle = common.createBattle({ formatid }, teams);
			if (battle.turn === 0) battle.makeChoices();
			const vessel = battle.p1.active[0];
			vessel.hp -= 100;
			battle.p2.active[0].hp = 1;
			const hp = vessel.hp;
			const choices = name === 'doubles' ? ['move shadowball 1, move splash', 'move splash, move splash'] :
				name === 'multi' || name === 'FFA 4P' || name === 'Multi 1v2' ?
					['move shadowball +1', 'move splash', 'move splash', 'move splash'] :
					name === 'FFA 3P' ? ['move shadowball +1', 'move splash', 'move splash'] :
					['move shadowball', 'move splash'];
			battle.makeChoices(...choices);
			assert.equal(battle.p2.totalFainted, 1);
			assert.equal(vessel.hp - hp, Math.floor(vessel.baseMaxhp / 20));
			assert(battle.log.some(line => line.includes('[from] ability: Mourning Vessel')));
		});
	}

	it('heals after Midnight Zone pressure itself knocks out a foe', () => {
		const user = { species: 'Spiritomb', ability: 'Mourning Vessel', moves: ['splash'] };
		const foe = { species: 'Mew', moves: ['splash'] };
		battle = common.createBattle({ formatid: 'gen9freeforall4pmidnightzone' }, [
			[user], [foe, foe], [foe], [foe],
		]);
		if (battle.turn === 0) battle.makeChoices();
		const vessel = battle.p1.active[0];
		vessel.hp -= 100;
		battle.p2.active[0].hp = 1;
		const hp = vessel.hp;
		battle.makeChoices('move splash', 'move splash', 'move splash', 'move splash');
		assert.equal(battle.p2.totalFainted, 1);
		assert.equal(vessel.hp - hp, Math.floor(vessel.baseMaxhp / 20));
	});

	it('counts a Multi teammate’s faint for damage, and opposing faints for healing', () => {
		const user = { species: 'Spiritomb', ability: 'Mourning Vessel', moves: ['shadowball', 'splash'] };
		const foe = { species: 'Mew', moves: ['splash'] };
		battle = common.createBattle({ formatid: 'gen9multimidnightzone' }, [
			[user], [foe], [foe], [foe],
		]);
		if (battle.turn === 0) battle.makeChoices();
		const vessel = battle.p1.active[0];
		const move = battle.dex.getActiveMove('shadowball');
		const power = () => battle.runEvent('BasePower', vessel, battle.p2.active[0], move, 100);
		assert.equal(power(), 120); // Midnight Zone boosts Shadow Ball by 20%.
		battle.p3.totalFainted = 1;
		assert.equal(power(), 144);
		battle.p3.totalFainted = 5;
		assert.equal(power(), 240); // Mourning Vessel caps at 2x.
		battle.p3.totalFainted = 0;
		vessel.hp -= 100;
		const hp = vessel.hp;
		battle.makeChoices('move splash', 'move splash', 'move splash', 'move splash');
		assert.equal(vessel.hp, hp, 'A fainted teammate alone does not trigger healing');
	});
});
