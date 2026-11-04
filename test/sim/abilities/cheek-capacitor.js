'use strict';
const assert = require('assert').strict;
const common = require('../../common');

describe('Cheek Capacitor', () => {
	it('spends the boost on the first damaging Electric hit and refreshes on switching', () => {
		const pikachu = {species: 'Pikachu', ability: 'Static', moves: ['nuzzle', 'quickattack']};
		const mew = {species: 'Mew', ability: 'No Ability', moves: ['splash']};
		const battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[pikachu, mew], [mew]]);
		try {
			battle.makeChoices('team 12', 'team 1');
			const holder = battle.p1.active[0], foe = battle.p2.active[0];
			assert.deepEqual(holder.getPassives(), ['cheekcapacitor']);
			foe.maxhp = foe.baseMaxhp = foe.hp = 2000;
			battle.makeChoices('move quickattack', 'move splash');
			assert.equal(holder.boosts.spe, 0);
			battle.makeChoices('move nuzzle', 'move splash');
			battle.makeChoices('move nuzzle', 'move splash');
			assert.equal(holder.boosts.spe, 1);
			battle.makeChoices('switch 2', 'move splash');
			battle.makeChoices('switch 2', 'move splash');
			battle.makeChoices('move nuzzle', 'move splash');
			assert.equal(holder.boosts.spe, 1);
		} finally {
			battle.destroy();
		}
	});
});
