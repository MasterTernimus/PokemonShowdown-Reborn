'use strict';

const assert = require('./../../assert');
const common = require('./../../common');
const { Dex } = require('./../../../dist/sim');

let battle;

describe('Reflector custom effects', () => {
	afterEach(() => {
		battle?.destroy();
	});

	it('should make Bronzong-Rejuv pure Steel before adding reflected types', () => {
		assert.deepEqual(Dex.species.get('Bronzong-Rejuv').types, ['Steel']);
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Bronzong', ability: 'Reflector', moves: ['splash'] },
		], [
			{ species: 'Charizard', ability: 'Blaze', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		const bronzong = battle.p1.active[0];
		assert.species(bronzong, 'Bronzong-Rejuv');
		assert.deepEqual(bronzong.getTypes(), ['Steel', 'Fire', 'Flying']);
	});
});
