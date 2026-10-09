'use strict';
const assert = require('assert').strict;
const common = require('../common');
const {PULSE_FIXED_MOVES} = require('../../dist/data/pulse-fixed-moves');

describe('Pulse evolution move selection', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function start(species) {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species, ability: 'No Ability', item: 'Anomaly Core', moves: ['splash', 'tackle', 'protect', 'toxic']},
		], [{species: 'Blissey', ability: 'No Ability', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		return battle.p1.active[0];
	}
	for (const species of ['Muk', 'Swalot', 'Avalugg', 'Avalugg-Hisui']) {
		it(species + ' previews and executes the new move on its evolution turn', () => {
			const p = start(species), oldMoves = p.moves.slice(), oldPP = p.moveSlots.map(m => m.pp);
			const form = species.startsWith('Avalugg') ? 'avaluggpulse' : species.toLowerCase() + 'pulse';
			const request = p.getMoveRequestData();
			assert.deepEqual(request.pulseMoves.map(m => m.id), PULSE_FIXED_MOVES[form]);
			assert.deepEqual(p.moves, oldMoves);
			assert.deepEqual(p.moveSlots.map(m => m.pp), oldPP);
			assert(!p.m.pulseFixedMoveSlots);
			battle.makeChoices('move 1 mega', 'move splash');
			assert.equal(p.species.id, form);
			assert.equal(p.lastMove.id, PULSE_FIXED_MOVES[form][0]);
			assert.equal(p.moveSlots[0].pp, request.pulseMoves[0].pp - 1);
			assert(!battle.log.some(l => l.includes('|nopp|')));
		});
	}
	it('accepts a new move by name only when evolution is selected', () => {
		start('Muk');
		assert.throws(() => battle.choose('p1', 'move earthpower'), /doesn't have a move/);
		assert.equal(battle.choose('p1', 'move earthpower mega'), true);
		battle.choose('p2', 'move splash');
		assert.equal(battle.p1.active[0].lastMove.id, 'earthpower');
	});
	it('keeps the normal move when the evolution box is not selected', () => {
		const p = start('Muk');
		battle.makeChoices('move 1', 'move splash');
		assert.equal(p.species.id, 'muk');
		assert.equal(p.lastMove.id, 'splash');
	});
	it('carries PP debt into the preview and preserves disabled status moves', () => {
		const p = start('Swalot');
		p.moveSlots[1].pp -= 3;
		p.addVolatile('taunt');
		const request = p.getMoveRequestData();
		assert.equal(request.pulseMoves[1].id, 'recover');
		assert.equal(request.pulseMoves[1].pp, request.pulseMoves[1].maxpp - 3);
		assert.equal(request.pulseMoves[1].disabled, true);
		assert.throws(() => battle.choose('p1', 'move recover mega'), /Recover is disabled/);
	});
});
