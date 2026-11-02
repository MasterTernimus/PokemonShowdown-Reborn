'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const mon = (species = 'Mew', moves = ['splash'], ability = 'No Ability') => ({species, moves, ability});

describe('Omen Sight', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function start(teams, format = 'gen9nofielddoublesbattle') {
		battle = common.createBattle({formatid: format}, teams);
		battle.makeChoices(...teams.map(team => 'team ' + team.map((_, i) => i + 1).join('')));
		return battle.p1.active[0];
	}
	const reports = (from = 0) => battle.log.slice(from).filter(line => /(?:ability|passive): Omen Sight\|/.test(line));
	const damage = (holder, foe, move) => battle.runEvent('Damage', holder, foe, battle.dex.getActiveMove(move), 1000);
	it('Doom Warning reflects status moves without sensing, while retaining Magic Guard and its faint effect', () => {
		const p = start([[mon('Mew', ['splash'], 'Doom Warning')], [mon('Magikarp', ['toxic', 'shadowball', 'splash']), mon('Magikarp', ['shadowball', 'splash'])]], 'gen9nofieldsinglesgame');
		assert(p.hasAbility('magicbounce'));
		assert(p.hasAbility('magicguard'));
		assert(!p.hasAbility('anticipation'));
		assert(!battle.log.some(line => /(?:Anticipation|Forewarn)\|/.test(line)));
		battle.makeChoices('move splash', 'move toxic');
		assert.equal(p.status, '');
		assert.equal(battle.p2.active[0].status, 'tox');
		const hp = p.hp;
		battle.damage(20, p, battle.p2.active[0], battle.dex.conditions.get('brn'));
		assert.equal(p.hp, hp);
		const mark = battle.log.length;
		battle.makeChoices('move splash', 'switch 2');
		assert(!battle.log.slice(mark).some(line => /(?:Anticipation|Forewarn)\|/.test(line)));
		battle.singleEvent('Faint', p.getAbility(), p.abilityState, p);
		assert.equal(battle.p2.slotConditions[0].futuremove.move, 'doomdesire');
	});
	for (const [species, ability] of [['Absol-Mega', 'Doom Warning'], ['Absol-Mega-Z', 'Omen Edge']]) {
		it(species + ' retains Omen Sight without duplicate composite sensing', () => {
			const p = start([[mon(species, ['splash'], ability)], [mon('Mew', ['moonblast', 'splash'])]], 'gen9nofieldsinglesgame');
			assert.deepEqual(p.getPassives(), ['omensight']);
			assert.equal(reports().length, 1);
			assert(!battle.log.some(line => line.includes('ability: Anticipation|')));
		});
	}
	it('checks each opponent once, deduplicates matching reveals, and remembers each foe separately', () => {
		const p = start([[mon('Absol'), mon()], [mon('Mew', ['moonblast', 'splash']), mon('Mew', ['closecombat', 'splash']), mon('Mew', ['surf', 'splash'])]]);
		assert.deepEqual(p.getPassives(), ['omensight']);
		assert.equal(reports().length, 2);
		const first = battle.p2.active[0], second = battle.p2.active[1];
		assert.equal(damage(p, first, 'moonblast'), 562);
		assert.equal(damage(p, second, 'closecombat'), 750);
		assert.equal(damage(p, second, 'moonblast'), 800);
		for (let i = 0; i < 2; i++) {
			const mark = battle.log.length;
			battle.makeChoices('move splash, move splash', 'switch 3, move splash');
			assert.equal(reports(mark).length, 1);
			assert.equal(damage(p, second, 'closecombat'), 750);
		}
	});
	it('ignores ally switches and clears warning memory when the holder leaves', () => {
		const p = start([[mon('Absol'), mon(), mon()], [mon('Mew', ['moonblast', 'splash']), mon()]]);
		let mark = battle.log.length;
		battle.makeChoices('move splash, switch 3', 'move splash, move splash');
		assert.equal(reports(mark).length, 0);
		battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		assert(!p.volatiles.warnedmoves);
	});
	it('keeps Anticipation coverage and Forewarn power warnings for the same foe', () => {
		const p = start([[mon('Absol')], [mon('Mew', ['drainingkiss', 'hyperbeam', 'splash'])]], 'gen9nofieldsinglesgame');
		assert.equal(reports().length, 2);
		assert.equal(damage(p, battle.p2.active[0], 'drainingkiss'), 600);
		assert.equal(damage(p, battle.p2.active[0], 'hyperbeam'), 750);
		assert.equal(damage(p, battle.p2.active[0], 'tackle'), 800);
	});
	it('selected Forewarn does not duplicate the native passive or stack damage reduction', () => {
		const p = start([[mon('Absol', ['splash'], 'Forewarn')], [mon('Mew', ['moonblast', 'splash'])]], 'gen9nofieldsinglesgame');
		assert.equal(reports().length, 1);
		assert(!battle.log.some(line => line.includes('ability: Forewarn|')));
		assert.equal(damage(p, battle.p2.active[0], 'tackle'), 800);
		assert.equal(damage(p, battle.p2.active[0], 'moonblast'), 562);
	});
	it('retains native passive sensing under suppression; selected Omen Sight is suppressed normally', () => {
		const p = start([[mon('Absol')], [mon('Mew', ['moonblast', 'splash'], 'Neutralizing Gas'), mon('Mew', ['moonblast', 'splash'], 'Neutralizing Gas')]], 'gen9nofieldsinglesgame');
		p.addVolatile('gastroacid');
		const mark = battle.log.length;
		battle.makeChoices('move splash', 'switch 2');
		assert.equal(reports(mark).length, 1);
		assert.equal(damage(p, battle.p2.active[0], 'tackle'), 800);
		battle.destroy(); battle = null;
		start([[mon('Mew', ['splash'], 'Omen Sight')], [mon('Mew', ['moonblast', 'splash'], 'Neutralizing Gas')]], 'gen9nofieldsinglesgame');
		assert.equal(reports().length, 0);
	});
	it('checks all three foes in FFA and rechecks repeat entries', () => {
		start([[mon('Absol')], ...Array.from({length: 3}, () => [mon('Mew', ['moonblast', 'splash']), mon('Mew', ['moonblast', 'splash'])])], 'gen9freeforall4pmistyfieldadrienn');
		assert.equal(reports().length, 3);
		for (let i = 0; i < 2; i++) {
			const mark = battle.log.length;
			battle.makeChoices('move splash', 'switch 2', 'switch 2', 'switch 2');
			assert.equal(reports(mark).length, 3);
		}
	});
	it('preserves both Psychic Terrain bonuses without duplicate announcements', () => {
		const p = start([[mon('Absol', ['splash'], 'Anticipation')], [mon('Mew', ['tackle', 'splash']), mon('Mew', ['moonblast', 'splash'])]], 'gen9nofieldsinglesgame');
		battle.field.terrain = 'psychicterrain';
		const {checkOmenSight} = require('../../../dist/data/warned-moves');
		p.boosts.spa = 0;
		checkOmenSight(battle, p, battle.p2.active[0]);
		assert.equal(p.boosts.spa, 4);
		p.boosts.spa = 0;
		const mark = battle.log.length;
		battle.makeChoices('move splash', 'switch 2');
		assert.equal(p.boosts.spa, 2);
		assert.equal(reports(mark).length, 1);
	});
	it('reveals Illusion and does not give learned-move protection against OHKO moves', () => {
		const p = start([[mon('Absol')], [mon('Zoroark', ['fissure', 'splash'], 'Illusion'), mon('Snorlax')]], 'gen9nofieldsinglesgame');
		assert.equal(battle.p2.active[0].illusion, null);
		const {protectsWarnedMove} = require('../../../dist/data/warned-moves');
		assert.equal(protectsWarnedMove(p, battle.p2.active[0], {...battle.dex.getActiveMove('fissure'), ohko: true}), false);
		assert.equal(reports().length, 1);
	});
});
