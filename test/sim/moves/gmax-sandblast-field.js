'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
describe('G-Max Sandblast field behavior', () => {
	afterEach(() => { battle?.destroy(); });
	for (const terrain of ['', 'grassyterrain', 'desertterrain', 'flowergarden3']) {
		it(`preserves ${terrain || 'no field'} while damaging and trapping both foes`, () => {
			battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [
				[{species: 'Sandaconda-Gmax', ability: 'No Ability', moves: ['gmaxsandblast']},
					{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
				[{species: 'Mew', ability: 'No Ability', moves: ['splash']},
					{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
			]);
			battle.makeChoices('team 12', 'team 12');
			if (terrain) battle.field.startTerrain(terrain);
			const before = battle.field.terrain;
			battle.makeChoices('move 1 1, move splash', 'move splash, move splash');
			assert(battle.log.some(line => line.includes('|G-Max Sandblast|')));
			assert.equal(battle.field.terrain, before);
			for (const foe of battle.p2.active) {
				assert(foe.volatiles.partiallytrapped);
				assert(foe.hp < foe.maxhp);
			}
		});
	}
});
