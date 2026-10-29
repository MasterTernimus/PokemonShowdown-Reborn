'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim/dex');
const { SpeciesPassives } = require('../../../dist/data/species-passives');
let battle;

function start(mode = 'singles', ability = 'Cloud Nine', foeAbility = 'No Ability') {
	const holder = { species: 'Chatot', ability, moves: ['hypervoice', 'splash', 'tackle', 'sing'] };
	const other = { species: 'Mew', ability: foeAbility, moves: ['splash', 'tackle', 'protect', 'meanlook'] };
	const team = [holder, { ...other, ability: 'No Ability' }, { ...other, ability: 'No Ability' }];
	const foes = [other, { ...other }, { ...other }];
	battle = common.createBattle({ formatid: mode === 'ffa' ? 'gen9freeforall4pmistyfieldadrienn' :
		mode === 'doubles' ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' },
	mode === 'ffa' ? [team, foes, foes, foes] : [team, foes]);
	battle.makeChoices(...battle.sides.map(() => 'team 123'));
	battle.field.terrain = '';
	battle.randomizer = damage => damage;
	for (const side of battle.sides) for (const p of side.active) {
		p.hp = p.maxhp = p.baseMaxhp = 1600;
		p.activeTurns = 1;
	}
	return [battle.p1.active[0], battle.p2.active[0]];
}

function hit(source, target, id = 'hypervoice', extra = {}) {
	battle.clearActiveMove();
	const move = battle.dex.getActiveMove(id);
	Object.assign(move, { accuracy: true, willCrit: false, basePower: 1 }, extra);
	battle.actions.useMove(move, source, { target });
	battle.runEvent('AfterMove', source, target, battle.activeMove);
	battle.clearActiveMove();
}

describe('Chatot Open Cage passive', () => {
	afterEach(() => { battle?.destroy(); battle = null; });

	it('replaces only Chatot\'s passive and preserves all three selected abilities', () => {
		assert.deepEqual(SpeciesPassives.chatot, ['opencage']);
		assert.deepEqual(Dex.species.get('chatot').abilities, { 0: 'Echo Fiend', 1: 'Cloud Nine', H: 'Opportunist' });
		assert(Dex.abilities.get('opencage').desc.includes('following turn'));
	});

	it('clears binding and move restrictions after one completed sound attack', () => {
		const [p, t] = start('doubles');
		const ally = p.allies()[0];
		for (const recipient of [p, ally]) {
			recipient.addVolatile('taunt', t);
			recipient.addVolatile('torment', t);
			recipient.addVolatile('partiallytrapped', t, battle.dex.getActiveMove('wrap'));
		}
		ally.lastMove = battle.dex.getActiveMove('splash');
		ally.addVolatile('encore', t);
		ally.addVolatile('disable', t);
		assert(ally.volatiles.encore && ally.volatiles.disable);
		hit(p, t);
		for (const recipient of [p, ally]) {
			for (const id of ['taunt', 'torment', 'partiallytrapped', 'encore', 'disable']) assert(!recipient.volatiles[id]);
			assert(recipient.volatiles.opencage);
		}
		assert.equal(battle.log.filter(line => line.includes('|-activate|') && line.includes('Open Cage')).length, 1);
	});

	it('lets a trapped Chatot switch through the normal turn-choice path', () => {
		const [p, t] = start();
		p.addVolatile('trapped', t, battle.dex.getActiveMove('meanlook'));
		battle.makeChoices('move hypervoice', 'move splash');
		assert(p.volatiles.opencage);
		assert(!p.trapped);
		battle.makeChoices('switch 2', 'move splash');
		assert.notEqual(battle.p1.active[0], p);
		assert(!p.volatiles.opencage);
		assert(!battle.p1.active[0].volatiles.opencage);
	});

	it('escape expires at the end of the following turn and trapping resumes', () => {
		const [p, t] = start('singles', 'Cloud Nine', 'Shadow Tag');
		battle.makeChoices('move hypervoice', 'move splash');
		assert(!p.trapped);
		assert.equal(p.volatiles.opencage.duration, 1);
		battle.makeChoices('move splash', 'move splash');
		assert(!p.volatiles.opencage);
		assert(p.trapped);
	});

	it('refreshes the escape window without stacking it', () => {
		const [p, t] = start();
		hit(p, t);
		battle.fieldEvent('Residual');
		assert.equal(p.volatiles.opencage.duration, 1);
		hit(p, t);
		assert.equal(p.volatiles.opencage.duration, 2);
	});

	for (const mode of ['protect', 'miss', 'soundproof', 'type immunity', 'status', 'non-sound', 'throat chop']) {
		it(`does not activate on ${mode}`, () => {
			const [p, t] = start('singles', 'Cloud Nine', mode === 'soundproof' ? 'Soundproof' : 'No Ability');
			if (mode === 'protect') t.addVolatile('protect', t);
			if (mode === 'type immunity') t.setType('Ghost');
			if (mode === 'throat chop') p.addVolatile('throatchop', t);
			hit(p, t, mode === 'status' ? 'sing' : mode === 'non-sound' ? 'tackle' : 'hypervoice',
				mode === 'miss' ? { accuracy: 0 } : {});
			assert(!p.volatiles.opencage);
		});
	}

	it('activates once for a spread multi-hit move and never benefits the bench or opponents', () => {
		const [p, t] = start('doubles');
		hit(p, t, 'hypervoice', { multihit: 2 });
		assert(p.allies()[0].volatiles.opencage);
		assert(!p.side.pokemon[2].volatiles.opencage);
		for (const foe of t.side.pokemon) assert(!foe.volatiles.opencage);
		assert.equal(battle.log.filter(line => line.includes('|-activate|') && line.includes('Open Cage')).length, 1);
	});

	it('never cleans opponents in FFA', () => {
		const [p, t] = start('ffa');
		for (const side of battle.sides) side.active[0].addVolatile('taunt', t);
		hit(p, t);
		assert(!p.volatiles.taunt);
		for (const side of battle.sides.slice(1)) {
			assert(side.active[0].volatiles.taunt);
			assert(!side.active[0].volatiles.opencage);
		}
	});

	it('works alongside Echo Fiend and remains active when the selected ability is suppressed', () => {
		const [p, t] = start('singles', 'Echo Fiend');
		p.addVolatile('gastroacid', t);
		assert(p.getPassives().includes('opencage'));
		assert(!p.getPassives().includes('earlybird'));
		hit(p, t);
		assert(p.volatiles.opencage);
	});

	it('preserves Choice locks, major status and unrelated move restrictions', () => {
		const [p, t] = start();
		p.setItem('choicespecs');
		p.lastMove = battle.dex.getActiveMove('hypervoice');
		battle.setActiveMove(p.lastMove, p, t);
		p.addVolatile('choicelock', p);
		p.addVolatile('healblock', t);
		p.setStatus('psn', t);
		hit(p, t);
		assert(p.volatiles.choicelock);
		assert(p.volatiles.healblock);
		assert.equal(p.status, 'psn');
	});

	it('does not undo Commander\'s battle-state restriction', () => {
		const [p, t] = start();
		hit(p, t);
		p.addVolatile('commanded', p);
		p.trapped = false;
		battle.runEvent('TrapPokemon', p);
		assert(p.trapped);
	});

	it('does not activate by damaging only an ally', () => {
		const [p] = start('doubles');
		const ally = p.allies()[0];
		hit(p, ally, 'snarl', { target: 'normal' });
		assert(!p.volatiles.opencage);
		assert(!ally.volatiles.opencage);
	});

	it('limits support to adjacent allies in triples', () => {
		const unit = { species: 'Mew', ability: 'No Ability', moves: ['splash'] };
		battle = common.createBattle({ gameType: 'triples' }, [
			[{ species: 'Chatot', ability: 'Open Cage', moves: ['hypervoice'] }, { ...unit }, { ...unit }],
			[{ ...unit }, { ...unit }, { ...unit }],
		]);
		const p = battle.p1.active[0];
		hit(p, battle.p2.active[0]);
		assert(p.volatiles.opencage);
		assert(battle.p1.active[1].volatiles.opencage);
		assert(!battle.p1.active[2].volatiles.opencage);
	});
});
