'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
function setup(transformed) {
	battle = common.createBattle({ formatid: 'gen9mistyfieldadrienn' }, [[
		{ species: 'Charizard', ability: 'No Ability', gigantamax: true, moves: ['ember', 'watergun', 'splash', 'protect'] },
	], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
	battle.makeChoices('team 1', 'team 1');
	if (transformed) battle.makeChoices('move splash dynamax', 'move splash');
	return battle.p1.active[0];
}
describe('G-Max request availability', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const transformed of [false, true]) {
		const phase = transformed ? 'while G-Max' : 'before G-Max';
		it('disables an exhausted regular move ' + phase, () => {
			const p = setup(transformed);
			p.moveSlots[1].pp = 0;
			const req = p.getMoveRequestData();
			assert.equal(req.moves[1].disabled, true);
			assert.equal(req.maxMoves.maxMoves[1].move, 'watergun');
			assert.equal(req.maxMoves.maxMoves[1].disabled, true);
			assert.throws(() => battle.p1.chooseMove('watergun'), /Water Gun is disabled/);
		});
		it('preserves known disabling effects for regular moves ' + phase, () => {
			const p = setup(transformed);
			p.disableMove('watergun', false, battle.dex.moves.get('disable'));
			const req = p.getMoveRequestData();
			assert.equal(req.moves[1].disabled, true);
			assert.equal(req.maxMoves.maxMoves[1].disabled, true);
		});
		it('keeps enabled moves selectable and Protect unavailable ' + phase, () => {
			const p = setup(transformed), req = p.getMoveRequestData();
			assert(!req.maxMoves.maxMoves[1].disabled);
			assert(!req.maxMoves.maxMoves[2].disabled);
			assert.equal(req.maxMoves.maxMoves[3].disabled, true);
		});
		it('does not expose hidden move restrictions earlier than the ordinary request ' + phase, () => {
			const p = setup(transformed);
			p.disableMove('watergun', true, battle.dex.moves.get('disable'));
			const req = p.getMoveRequestData();
			if (!transformed) assert.equal(req.moves[1].disabled, false);
			assert.equal(!!req.maxMoves.maxMoves[1].disabled, !!req.moves[1].disabled);
		});
	}
	it('disables an exhausted signature without disabling other moves', () => {
		const p = setup(true); p.moveSlots[0].pp = 0;
		const req = p.getMoveRequestData();
		assert.equal(req.maxMoves.maxMoves[0].move, 'gmaxwildfire');
		assert.equal(req.maxMoves.maxMoves[0].disabled, true);
		assert(!req.maxMoves.maxMoves[1].disabled);
	});
	it('offers Struggle rather than regular or G-Max moves when every slot is exhausted', () => {
		const p = setup(true); for (const slot of p.moveSlots) slot.pp = 0;
		const req = p.getMoveRequestData();
		assert.deepEqual(req.moves.map(move => move.id), ['struggle']);
		assert.equal(req.maxMoves, undefined);
		assert.equal(p.getDynamaxRequest(true), undefined);
	});
	it('rejects a second transformation after the side has used G-Max', () => {
		const p = setup(false);
		battle.p1.dynamaxUsed = true;
		battle.makeRequest('move');
		assert.equal(p.getMoveRequestData().canDynamax, undefined);
		assert.throws(() => battle.choose('p1', 'move splash dynamax'), /can't Dynamax now/);
		assert.equal(battle.p1.choice.dynamax, false);
		assert.equal(p.species.id, 'charizard');
		battle.makeChoices('move splash', 'move splash');
		assert.equal(p.species.id, 'charizard');
	});
	it('rejects a G-Max-capable user disguised as a species that cannot Dynamax', () => {
		battle = common.createBattle({ formatid: 'gen9mistyfieldadrienn' }, [[
			{ species: 'Charizard', ability: 'Illusion', gigantamax: true, moves: ['splash'] },
			{ species: 'Eternatus', ability: 'No Ability', moves: ['splash'] },
		], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('team 12', 'team 1');
		const p = battle.p1.active[0];
		assert.equal(battle.p1.canDynamaxNow(), true);
		assert(p.canGigantamax);
		assert.equal(p.illusion.species.id, 'eternatus');
		assert.equal(p.getMoveRequestData().canDynamax, undefined);
		assert.throws(() => battle.choose('p1', 'move splash dynamax'), /can't Dynamax now/);
		assert.equal(battle.p1.choice.dynamax, false);
		assert.equal(p.illusion.species.id, 'eternatus');
	});
});
