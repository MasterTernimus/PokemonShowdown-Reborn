'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

describe('Accumulation end-of-turn attacks', function () {
	for (const release of ['belch', 'spitup']) {
		for (const protectedTarget of [true, false]) {
			it(`${release} ${protectedTarget ? 'respects Protect' : 'hits an unprotected target'}`, function () {
				const battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
					{species: 'Muk-Pulse', ability: 'Accumulation', moves: ['splash']},
				], [
					{species: 'Manectric', ability: 'Static', moves: ['splash', 'protect']},
				]]);
				try {
					battle.makeChoices('team 1', 'team 1');
					const originalSample = battle.sample.bind(battle);
					battle.sample = choices => choices.includes('belch') ? release : originalSample(choices);
					for (let turn = 1; turn <= 4; turn++) {
						battle.makeChoices('move splash', turn === 4 && protectedTarget ? 'move protect' : 'move splash');
					}
					const target = battle.p2.active[0];
					if (protectedTarget) {
						assert.equal(target.hp, target.maxhp);
						assert(battle.log.some(line => line.includes('|-activate|p2a: Manectric|move: Protect')));
					} else {
						assert(target.hp < target.maxhp);
					}
					assert(battle.log.some(line => line.includes(`|move|p1a: Muk|${release === 'belch' ? 'Belch' : 'Spit Up'}|`)));
				} finally {
					battle.destroy();
				}
			});
		}
	}
});
