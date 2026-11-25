'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex, TeamValidator } = require('../../../dist/sim');

describe('Garchompite Mega choice', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const [item, choice, forme] of [
		['Garchompite', 'mega', 'Garchomp-Mega'],
		['Garchompite', 'megax', 'Garchomp-Mega-Z'],
		['Garchompite Z', 'mega', 'Garchomp-Mega-Z'],
	]) it(`${item} supports ${choice} into ${forme}`, () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Garchomp', ability: 'Rough Skin', item, moves: ['splash'] },
		], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
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
		battle = common.createBattle({}, [[{ species: 'Garchomp', item: 'Leftovers', moves: ['splash'] }],
			[{ species: 'Mew', moves: ['splash'] }]]);
		assert.equal(battle.p1.active[0].canMegaEvoX, null);
	});
	for (const [item, choice, singleTarget] of [
		['Garchompite', 'mega', true],
		['Garchompite', 'megax', false],
		['Garchompite Z', 'mega', false],
	]) it(`${item} uses the selected Mega’s Earthquake target on the turn it evolves (${choice})`, () => {
		const ally = { species: 'Blissey', ability: 'No Ability', moves: ['splash'] };
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[{ species: 'Garchomp', ability: 'Rough Skin', item, moves: ['earthquake'] }, ally],
			[ally, { ...ally, species: 'Chansey' }],
		]);
		battle.makeChoices('team 12', 'team 12');
		const [garchomp, partner] = battle.p1.active;
		const [first, second] = battle.p2.active;
		const slot = garchomp.getMoveRequestData().moves[0];
		assert.equal(slot.target, 'allAdjacent');
		assert.equal(slot.megaTarget, item === 'Garchompite' ? 'normal' : undefined);
		assert.equal(slot.megaXTarget, undefined);
		battle.makeChoices(`move earthquake ${choice}${singleTarget ? ' +2' : ''}, move splash`, 'move splash, move splash');
		assert.equal(garchomp.species.id, singleTarget ? 'garchompmega' : 'garchompmegaz');
		assert.equal(partner.hp === partner.maxhp, singleTarget);
		assert.equal(first.hp === first.maxhp, singleTarget);
		assert(second.hp < second.maxhp);
		assert.equal(garchomp.getMoves()[0].target, singleTarget ? 'normal' : 'allAdjacent');
	});
	for (const item of ['Garchompite', 'Garchompite Z']) it(`accepts a pasted Mega-Z set with ${item}`, () => {
		const set = { species: 'Garchomp-Mega-Z', ability: 'Relentless Hunt', item, moves: ['dragonpulse'], nature: 'Modest', evs: { spa: 252, spe: 252 } };
		assert.equal(new TeamValidator('gen9nofieldsinglesgame').validateTeam([set]), null);
		assert(Dex.species.get('Garchomp-Mega-Z').requiredItems.includes(item));
	});
});
