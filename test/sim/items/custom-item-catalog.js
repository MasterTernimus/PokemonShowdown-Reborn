'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

const removedItems = [
	'berserkgene',
	'berry', 'bitterberry', 'burntberry', 'goldberry', 'iceberry',
	'mintberry', 'miracleberry', 'mysteryberry', 'przcureberry', 'psncureberry',
	'belueberry', 'blukberry', 'cornnberry', 'durinberry', 'grepaberry',
	'hondewberry', 'kelpsyberry', 'magostberry', 'nanabberry', 'nomelberry',
	'pamtreberry', 'pinapberry', 'pomegberry', 'qualotberry', 'rabutaberry',
	'razzberry', 'spelonberry', 'tamatoberry', 'watmelberry', 'wepearberry',
];

describe('Custom item catalog', function () {
	let battle;
	afterEach(function () {
		battle?.destroy();
	});

	it('should remove redundant legacy items', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		for (const item of removedItems) assert.false(battle.dex.items.get(item).exists, item);
	});

	it('should rename Star Sweet to Amulet Coin and preserve its field effect', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Mew', ability: 'synchronize', item: 'amuletcoin', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'noguard', moves: ['toxic']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		assert.false(battle.dex.items.get('starsweet').exists);
		assert.equal(battle.dex.items.get('amuletcoin').name, 'Amulet Coin');
		assert(battle.field.setTerrain('dragonsdenterrain', battle.p1.active[0]));
		battle.makeChoices('move splash', 'move toxic');
		assert.equal(battle.p1.active[0].status, '');
	});

	it('should describe Amplifield Rock accurately', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		assert.match(battle.dex.items.get('amplifieldrock').desc, /terrains and room effects/i);
	});
});
