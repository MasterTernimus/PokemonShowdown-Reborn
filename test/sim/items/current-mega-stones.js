'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex, TeamValidator} = require('../../../dist/sim');
describe('Current Hydreigon and Lucario Mega stones', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const [species, ability, item, mega, selected] of [
		['Lucario', 'Carry On', 'Lucarionite', 'Lucario-Mega', 'insight'],
		['Lucario', 'Carry On', 'Lucarionite Z', 'Lucario-Mega-Z', 'auraprecision'],
	]) {
		it(`${item} validates and evolves ${species} into ${mega} through the battle choice`, () => {
			const set = {species, ability, item, moves: [species === 'Hydreigon' ? 'darkpulse' : 'aurasphere']};
			assert.deepEqual(new TeamValidator('gen9nofieldsinglesgame').validateSet({...set}, {}) || [], []);
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[set], [{species: 'Blissey', ability: 'No Ability', moves: ['splash']}]]);
			if (battle.requestState === 'teampreview') battle.makeChoices('team 1', 'team 1');
			const p = battle.p1.active[0];
			assert.equal(p.getMoveRequestData().canMegaEvo, true);
			assert.equal(battle.actions.canMegaEvo(p), mega);
			battle.makeChoices('move 1 mega', 'move splash');
			assert.equal(p.species.name, mega); assert.equal(p.ability, selected);
			assert.equal(battle.actions.canMegaEvo(p), null);
		});
	}
	it('keeps Mega Hydreigon X absent and out of every stone mapping', () => {
		assert(!Dex.species.get('Hydreigon-Mega-X').exists);
		assert.deepEqual(Dex.species.get('Hydreigon').otherFormes, ['Hydreigon-Mega']);
		for (const item of Dex.items.all()) assert(!Object.values(item.megaStone || {}).includes('Hydreigon-Mega-X'));
		assert.equal(Dex.species.get('Hydreigon').abilities.H, 'False Liberation');
		assert.equal(Dex.items.get('Lucarionite Z').isNonstandard, 'Custom');
	});
});
