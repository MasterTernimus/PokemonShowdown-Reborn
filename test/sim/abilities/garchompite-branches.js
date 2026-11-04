'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex, TeamValidator} = require('../../../dist/sim');

describe('Garchompite Mega choice', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const [item, choice, forme] of [
		['Garchompite', 'mega', 'Garchomp-Mega'],
		['Garchompite', 'megax', 'Garchomp-Mega-Z'],
		['Garchompite Z', 'mega', 'Garchomp-Mega-Z'],
	]) it(`${item} supports ${choice} into ${forme}`, () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Garchomp', ability: 'Rough Skin', item, moves: ['splash']},
		], [{species: 'Mew', ability: 'No Ability', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		const p = battle.p1.active[0];
		if (item === 'Garchompite') {
			assert.equal(p.canMegaEvo, 'Garchomp-Mega');
			assert.equal(p.canMegaEvoX, 'Garchomp-Mega-Z');
			assert.equal(p.getMoveRequestData().canMegaEvoX, true);
		}
		battle.makeChoices(`move splash ${choice}`, 'move splash');
		assert.equal(p.species.name, forme);
	});
	it('does not offer the alternate with an unrelated item', () => {
		battle = common.createBattle({}, [[{species: 'Garchomp', item: 'Leftovers', moves: ['splash']}],
			[{species: 'Mew', moves: ['splash']}]]);
		assert.equal(battle.p1.active[0].canMegaEvoX, null);
	});
	for (const item of ['Garchompite', 'Garchompite Z']) it(`accepts a pasted Mega-Z set with ${item}`, () => {
		const set = {species: 'Garchomp-Mega-Z', ability: 'Relentless Hunt', item, moves: ['dragonpulse'], nature: 'Modest', evs: {spa: 252, spe: 252}};
		assert.equal(new TeamValidator('gen9nofieldsinglesgame').validateTeam([set]), null);
		assert(Dex.species.get('Garchomp-Mega-Z').requiredItems.includes(item));
	});
});
