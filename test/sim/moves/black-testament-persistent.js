'use strict';

const assert = require('node:assert/strict');
const common = require('../../common');

describe('Black Testament with Persistent', () => {
	let battle;
	afterEach(() => battle.destroy());

	for (const [move, field, duration] of [
		['blacktestament', '', 2],
		['blacktestament', 'corrosiveterrain', 3],
		['blacktestament', 'wastelandterrain', 3],
		['psychicnoise', '', 2],
		['healblock', '', 7],
	]) {
		it(`${move} applies ${duration} turns on ${field || 'neutral ground'} and reports Persistent accurately`, () => {
			battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
				[{ species: 'Mew', ability: 'Persistent', moves: [move] }],
				[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
			]);
			battle.makeChoices('team 1', 'team 1');
			battle.field.terrain = field;
			const user = battle.p1.active[0];
			const target = battle.p2.active[0];
			battle.actions.useMove(move, user, { target });

			assert.equal(target.volatiles.healblock.duration, duration);
			assert.equal(battle.log.some(line => line.includes('|ability: Persistent|[move] Heal Block')), duration === 7);
		});
	}
});
