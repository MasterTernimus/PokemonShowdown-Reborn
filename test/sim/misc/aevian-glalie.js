'use strict';

const assert = require('../../assert');
const common = require('../../common');
const {Learnsets} = require('../../../dist/data/learnsets');

describe('Aevian Glalie', function () {
	let battle;
	afterEach(() => {
		if (battle && !battle.ended) battle.destroy();
		battle = null;
	});

	it('has its requested profile and a distinct Glalitite Mega Evolution', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame', preview: false}, [[
			{species: 'Glalie-Aevian', ability: 'Grassy Surge', item: 'Glalitite', moves: ['woodhammer']},
		], [
			{species: 'Glalie', ability: 'Inner Focus', item: 'Glalitite', moves: ['icefang']},
		]]);
		if (!battle.p1.active[0] || !battle.p2.active[0]) battle.makeChoices('team 1', 'team 1');
		assert.deepEqual(battle.p1.active[0].species.types, ['Grass', 'Rock']);
		assert.deepEqual(battle.p1.active[0].species.baseStats, {hp: 110, atk: 110, def: 100, spa: 50, spd: 80, spe: 50});
		assert.deepEqual(battle.p1.active[0].species.abilities, {0: 'Grassy Surge', 1: 'Brute Force', H: 'Stamina'});
		assert.equal(battle.actions.canMegaEvo(battle.p1.active[0]), 'Glalie-Aevian-Mega');
		assert.equal(battle.actions.canMegaEvo(battle.p2.active[0]), 'Glalie-Mega');
		const mega = battle.dex.species.get('Glalie-Aevian-Mega');
		assert.deepEqual(mega.baseStats, {hp: 110, atk: 155, def: 115, spa: 50, spd: 90, spe: 85});
		assert.equal(mega.abilities[0], 'Moss Armor');
		battle.makeChoices('move woodhammer mega', 'move icefang mega');
		assert.equal(battle.p1.active[0].species.name, 'Glalie-Aevian-Mega');
		assert.equal(battle.p2.active[0].species.name, 'Glalie-Mega');
	});

	it('has the supplied move profile', function () {
		const learnset = Learnsets.glalieaevian.learnset;
		const moves = [
			'leer', 'absorb', 'rockthrow', 'worryseed', 'doubleedge', 'razorleaf', 'payback', 'leaftornado',
			'headbutt', 'protect', 'camouflage', 'rockslide', 'woodhammer', 'grassyterrain', 'headsmash',
			'grassyglide', 'leechseed', 'bide', 'chipaway', 'disable', 'faketears', 'rollout', 'spikes',
			'switcheroo', 'weatherball', 'wideguard', 'arenitewall', 'bodypress', 'bulletseed', 'earthquake',
			'energyball', 'gigadrain', 'leafstorm', 'meteorbeam', 'mudshot', 'stealthrock',
			'stoneedge', 'synthesis', 'mudslap', 'accelerock',
		];
		for (const move of moves) assert(learnset[move], `Glalie-Aevian should learn ${move}`);
	});
});
