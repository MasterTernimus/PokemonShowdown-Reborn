'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

const mixAndMegaAvailable = Dex.formats.get('gen9mixandmega').effectType === 'Format' && !!Dex.dexes.mixandmega;
(mixAndMegaAvailable ? describe : describe.skip)('Mix and Mega' + (mixAndMegaAvailable ? '' : ' [format and mod unavailable]'), () => {
	beforeEach(function () {
		battle = common.createBattle({formatid: 'gen9mixandmega'});
	});
	afterEach(() => battle.destroy());

	it('should overwrite forme-change abilities on Mega Evolution', function () {
		battle.setPlayer('p1', {team: [{species: "Mimikyu", ability: 'disguise', item: 'metagrossite', moves: ['shadowclaw']}]});
		battle.setPlayer('p2', {team: [{species: "Palafin", ability: 'zerotohero', item: 'leftovers', moves: ['jetpunch']}]});
		battle.makeChoices('default', 'default'); // Switch in
		battle.makeChoices('move shadowclaw mega', 'move jetpunch');
		assert.equal(battle.p1.active[0].ability, 'toughclaws');
	});
});

// The Reborn roster must not acquire the unavailable mod's arbitrary Mega Stone behavior.
describe('Reborn Mega Stone species restriction', () => {
	afterEach(() => battle?.destroy());
	it('rejects Metagrossite on Mimikyu', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Mimikyu', ability: 'Disguise', item: 'Metagrossite', moves: ['shadowclaw'] },
		], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('team 1', 'team 1');
		assert.cantMove(() => battle.choose('p1', 'move shadowclaw mega'));
		assert.species(battle.p1.active[0], 'Mimikyu');
	});
});
