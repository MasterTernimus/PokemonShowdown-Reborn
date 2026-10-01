'use strict';
const assert = require('assert').strict;
const { Battle, Dex } = require('../../dist/sim');
const { validateChallengeOptions } = require('../../dist/sim/challenge-options');
const { calculateScenario, validateScenario } = require('../../dist/sim/custom-calculator');

describe('Battle tools audit regressions', () => {
	it('rejects selected weather on every random-field variant while preserving defaults', () => {
		const formats = Dex.formats.all().filter(f => f.terrain === 'randomterrain');
		assert(formats.length);
		for (const format of formats) {
			assert.throws(() => validateChallengeOptions({ weather: 'raindance' }, format), /random field/);
			assert.deepEqual(validateChallengeOptions({}, format), {});
			assert.deepEqual(validateChallengeOptions({ gimmicks: 1 }, format), { gimmicks: 1 });
		}
	});
	it('broadcasts counters before the winning action ends and preserves input-log restoration', async () => {
		const battle = new Battle({
			formatid: 'gen9nofieldsinglesgame', challengeOptions: { gimmicks: 1 }, seed: [1, 2, 3, 4],
			p1: { name: 'Alice', team: [{ species: 'Mew', ability: 'No Ability', moves: ['psychic'] }] },
			p2: { name: 'Bob', team: [{ species: 'Magikarp', level: 1, ability: 'No Ability', moves: ['splash'] }] },
		});
		try {
			battle.makeChoices('team', 'team');
			assert(battle.log.includes('|gimmickcount|p1|0|1'));
			battle.makeChoices('move psychic terastallize', 'move splash');
			assert(battle.ended);
			const counter = battle.log.indexOf('|gimmickcount|p1|1|1');
			assert(counter >= 0 && counter < battle.log.indexOf('|win|Alice'));
			const { BattleStream } = require('../../dist/sim/battle-stream');
			const stream = new BattleStream({ keepAlive: true });
			try {
				await stream.write(battle.inputLog.join('\n'));
				assert.deepEqual(stream.battle.log.filter(l => l.startsWith('|gimmickcount|')),
					battle.log.filter(l => l.startsWith('|gimmickcount|')));
			} finally { stream.destroy(); }
		} finally { battle.destroy(); }
	});
	it('validates genders and uses explicit Rivalry genders in damage', () => {
		const input = {
			format: 'gen9nofieldsinglesgame', move: 'Tackle', samples: 8, seed: 42,
			actors: Array.from({ length: 4 }, () => ({ species: 'Mew', ability: 'No Ability' })),
		};
		input.actors[0] = { species: 'Haxorus', ability: 'Rivalry', gender: 'M', level: 50 };
		input.actors[1] = { species: 'Snorlax', ability: 'No Ability', gender: 'M' };
		const male = calculateScenario(input).results[1];
		input.actors[0].gender = 'F';
		const female = calculateScenario(input).results[1];
		assert(male.min > female.min && male.max > female.max);
		input.actors[0].gender = 'invalid';
		assert.throws(() => validateScenario(input), /Unsupported choice/);
		input.actors[0].gender = 'N';
		assert.throws(() => validateScenario(input), /not supported/);
	});
});
