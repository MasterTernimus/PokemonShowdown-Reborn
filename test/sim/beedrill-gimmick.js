'use strict';

const assert = require('../assert');
const common = require('../common');

describe('Beedrill Mega after a teammate Z-Move', () => {
	it('keeps the second gimmick available in Doubles Water Surface', () => {
		const battle = common.createBattle({formatid: 'gen9doubleswatersurface'}, [[
			{species: 'Crobat', item: 'Poisonium Z', moves: ['crosspoison']},
			{species: 'Magikarp', moves: ['splash']},
			{species: 'Beedrill', item: 'Beedrillite', ability: 'Sniper', moves: ['uturn']},
		], [
			{species: 'Chansey', moves: ['splash']},
			{species: 'Blissey', moves: ['splash']},
		]]);
		try {
			battle.makeChoices('team 123', 'team 12');
			battle.makeChoices('move crosspoison +1 zmove, move splash', 'move splash, move splash');
			assert.equal(battle.p1.gimmickCount, 1);
			battle.makeChoices('switch 3, move splash', 'auto');
			const beedrill = battle.p1.active[0];
			assert.equal(beedrill.canMegaEvo, 'Beedrill-Mega');
			assert.equal(beedrill.getMoveRequestData().canMegaEvo, true);
			battle.makeChoices('move uturn +1 mega, move splash', 'auto');
			assert.species(beedrill, 'Beedrill-Mega');
			assert.equal(battle.p1.gimmickCount, 2);
		} finally {
			battle.destroy();
		}
	});

	it('keeps Mega Evolution after a Z-Move, Murkwater replacement, and Fake Out flinch', () => {
		const battle = common.createBattle({formatid: 'gen9doubleswatersurface'}, [[
			{species: 'Crobat', item: 'Poisonium Z', moves: ['crosspoison', 'splash']},
			{species: 'Magikarp', moves: ['splash']},
			{species: 'Beedrill', item: 'Beedrillite', ability: 'Sniper', moves: ['uturn', 'splash']},
		], [
			{species: 'Mewtwo', moves: ['thunderbolt', 'splash']},
			{species: 'Blissey', moves: ['splash']},
			{species: 'Toxicroak-Deso', ability: 'Neutralization', moves: ['fakeout', 'splash']},
		]]);
		try {
			battle.makeChoices('team 123', 'team 12');
			battle.makeChoices('move crosspoison +2 zmove, move splash', 'move thunderbolt +2, move splash');
			assert.equal(battle.p1.gimmickCount, 1);
			assert.fainted(battle.p1.active[1]);
			battle.field.changeTerrain('murkwatersurfaceterrain', battle.p1.active[0]);
			battle.makeChoices('switch 3', 'switch 3');
			const beedrill = battle.p1.active[1];
			assert.equal(beedrill.canMegaEvo, 'Beedrill-Mega');
			assert.equal(beedrill.getMoveRequestData().canMegaEvo, true);
			battle.makeChoices('move splash, move splash', 'move splash, move fakeout +2');
			assert.equal(beedrill.canMegaEvo, 'Beedrill-Mega', 'Fake Out flinch should not consume Mega Evolution');
			assert.equal(beedrill.getMoveRequestData().canMegaEvo, true);
			battle.makeChoices('move splash, move uturn +1 mega', 'move splash, move splash');
			assert.species(beedrill, 'Beedrill-Mega');
			assert.equal(battle.p1.gimmickCount, 2);
		} finally {
			battle.destroy();
		}
	});
});
