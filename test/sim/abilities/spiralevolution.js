'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Spiral Evolution', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('ignores every custom field Speed penalty', function () {
		const fields = [
			'coldeclipseterrain', 'icyterrain', 'murkwatersurfaceterrain', 'newworldterrain',
			'snowyterrain', 'underwaterterrain', 'watersurfaceterrain',
		];
		for (const field of fields) {
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
				[{species: 'Eevee', ability: 'Spiral Evolution', moves: ['Splash']}],
				[{species: 'Magikarp', moves: ['Splash']}],
			]);
			battle.makeChoices('team 1', 'team 1');
			const eevee = battle.p1.active[0];
			battle.field.changeTerrain(field, eevee);
			assert.equal(eevee.getStat('spe'), eevee.getStat('spe', false, true), `${field} applied a Speed penalty`);
			battle.destroy();
			battle = null;
		}
	});

	it('has Shield Dust built in', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Eevee', ability: 'Spiral Evolution', moves: ['Splash']}],
			[{species: 'Magikarp', moves: ['Splash']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		const eevee = battle.p1.active[0];
		const flamethrower = battle.dex.getActiveMove('flamethrower');
		const secondaries = [{chance: 100, status: 'brn'}];
		assert(eevee.hasAbility('Shield Dust'));
		assert.deepEqual(battle.runEvent('ModifySecondaries', eevee, battle.p2.active[0], flamethrower, secondaries), []);
	});
});
