'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { State } = require('../../../dist/sim/state');
describe('Yang move snapshot compatibility', () => {
	let battle;
	afterEach(() => battle?.destroy());
	for (const id of ['beatdown', 'gunkrock', 'infernalrage']) it(id + ' preserves hit tracking in snapshots', () => {
		const mon = { species: 'Mew', ability: 'No Ability', moves: ['splash'] };
		battle = common.createBattle({}, [[mon], [mon]]);
		if (battle.requestState === 'teampreview') battle.makeChoices();
		const [source, target] = [battle.p1.active[0], battle.p2.active[0]];
		const move = battle.dex.getActiveMove(id);
		const field = { beatdown: 'rockyterrain', gunkrock: 'wastelandterrain', infernalrage: 'volcanicterrain' }[id];
		battle.field.terrain = field;
		battle.singleEvent('ModifyMove', move, {}, move, source, target);
		move.yang.seen.push(target);
		move.yang.hits.push({ target, count: 2 });
		move.yang.messages.push('Already shown');
		if (move.yangSecondaryTargets) move.yangSecondaryTargets.push(target);
		const restored = State.deserializeActiveMove(JSON.parse(JSON.stringify(State.serializeActiveMove(move, battle))), battle);
		assert.deepEqual(restored.yang, move.yang);
		assert.equal(restored.yang.seen[0], target);
		if (move.yangSecondaryTargets) assert.equal(restored.yangSecondaryTargets[0], target);
	});
});
