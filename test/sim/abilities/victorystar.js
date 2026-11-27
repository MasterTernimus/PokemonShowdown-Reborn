'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe("Victory Star", () => {
	afterEach(() => {
		battle.destroy();
	});

	it('counts each Reborn holder once for accuracy and field damage, including active/passive overlap', () => {
		const spare = { species: 'Mew', ability: 'No Ability', moves: ['splash'] };
		battle = common.createBattle({ formatid: 'gen9doublesrockyfield' }, [
			[{ species: 'Victini', ability: 'Victory Star', moves: ['hypnosis'] }, spare], [spare, spare],
		]);
		battle.makeChoices('team 12', 'team 12');
		const [user, ally] = battle.p1.active;
		const target = battle.p2.active[0];
		const move = battle.dex.moves.get('hypnosis');
		const accuracy = () => battle.runEvent('ModifyAccuracy', target, user, move, 60);
		const damage = () => battle.runEvent('Damage', target, user, move, 100);
		assert(user.getPassives().includes('victorystar'));
		assert.equal(accuracy(), 66);
		assert.equal(damage(), 100);
		for (const field of ['newworldterrain', 'starlightarenaterrain']) {
			battle.field.startTerrain(field);
			assert.equal(damage(), 150);
			ally.setAbility('Victory Star', null, null, true);
			assert.equal(accuracy(), 73);
			assert.equal(damage(), 225);
			ally.setAbility('No Ability', null, null, true);
		}
		assert(!battle.log.some(line => line.includes('Happened')));
	});

	it(`can boost accuracy twice if both the user and ally have the ability`, () => {
		battle = common.createBattle({ gameType: 'doubles' }, [[
			{ species: 'Victini', ability: 'victorystar', moves: ['hypnosis'] },
			{ species: 'Wynaut', ability: 'victorystar', moves: ['poltergeist'] },
		], [
			{ species: 'Dratini', moves: ['poltergeist'] },
			{ species: 'Avalugg', moves: ['poltergeist'] },
		]]);

		battle.onEvent('Accuracy', battle.format, accuracy => {
			assert.equal(accuracy, 73);
		});

		battle.makeChoices();
	});

	it(`should not boost the accuracy of opponents`, () => {
		battle = common.createBattle({ gameType: 'doubles' }, [[
			{ species: 'Victini', ability: 'victorystar', moves: ['sleeptalk'] },
			{ species: 'Wynaut', ability: 'victorystar', moves: ['sleeptalk'] },
		], [
			{ species: 'Dratini', moves: ['hypnosis'] },
			{ species: 'Avalugg', moves: ['sleeptalk'] },
		]]);

		battle.onEvent('Accuracy', battle.format, accuracy => {
			assert.equal(accuracy, 60);
		});

		battle.makeChoices();
	});

	it(`should boost accuracy even when used against allies`, () => {
		battle = common.createBattle({ gameType: 'doubles' }, [[
			{ species: 'Victini', ability: 'victorystar', moves: ['sleeptalk'] },
			{ species: 'Wynaut', ability: 'victorystar', moves: ['irontail'] },
		], [
			{ species: 'Dratini', moves: ['sleeptalk'] },
			{ species: 'Avalugg', moves: ['sleeptalk'] },
		]]);

		battle.onEvent('Accuracy', battle.format, accuracy => {
			assert.equal(accuracy, 91);
		});

		battle.makeChoices('move sleeptalk, move irontail -1', 'auto');
	});
});
