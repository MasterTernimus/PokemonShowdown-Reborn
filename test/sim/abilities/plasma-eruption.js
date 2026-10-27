'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

let battle;

function start(species = 'Typhlosion', moves = ['splash', 'flamethrower', 'thunderbolt'], foeSpecies = 'Mew') {
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
		{ species, item: 'Typhlosionite', moves },
	], [
		{ species: foeSpecies, moves: ['splash'] },
	]]);
	battle.makeChoices('team 1', 'team 1');
	assert.equal(battle.p1.active[0].canMegaEvo, 'Typhlosion-Mega');
	battle.makeChoices('move splash mega', 'move splash');
	const holder = battle.p1.active[0];
	return [holder, battle.p2.active[0]];
}

describe('Current Typhlosionite forms', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('sets both base forms to 545 BST and Mega Typhlosion to 645 BST', () => {
		for (const name of ['Typhlosion', 'Typhlosion-Alt', 'Typhlosion-Hisui']) {
			const stats = Dex.species.get(name).baseStats;
			assert.equal(Object.values(stats).reduce((sum, stat) => sum + stat, 0), 545, name);
		}
		assert.deepEqual(Dex.species.get('Typhlosion').baseStats,
			{ hp: 83, atk: 95, def: 85, spa: 112, spd: 70, spe: 100 });
		assert.deepEqual(Dex.species.get('Typhlosion-Alt').baseStats,
			Dex.species.get('Typhlosion').baseStats);
		assert.deepEqual(Dex.species.get('Typhlosion-Hisui').baseStats,
			{ hp: 83, atk: 95, def: 80, spa: 127, spd: 65, spe: 95 });
		const mega = Dex.species.get('Typhlosion-Mega');
		assert.deepEqual(mega.types, ['Fire', 'Psychic']);
		assert.deepEqual(mega.baseStats, { hp: 83, atk: 138, def: 85, spa: 139, spd: 70, spe: 130 });
		assert.equal(Object.values(mega.baseStats).reduce((sum, stat) => sum + stat, 0), 645);
		assert.equal(mega.abilities[0], 'Corona Furnace');
		assert.equal(mega.requiredItem, 'Typhlosionite');
		for (const name of ['Typhlosion', 'Typhlosion-Alt', 'Typhlosion-Hisui']) {
			const [holder] = start(name);
			assert.equal(holder.species.id, 'typhlosionmega');
			assert.equal(holder.ability, 'coronafurnace');
			battle.destroy();
			battle = null;
		}
	});

	it('removes the withdrawn Electric pack while preserving existing Electric coverage', () => {
		for (const name of ['Typhlosion', 'Typhlosion-Hisui']) {
			const learnset = Dex.species.getLearnsetData(name.toLowerCase().replace(/[^a-z0-9]/g, '')).learnset;
			for (const move of ['thunderbolt', 'doubleshock', 'thunder', 'risingvoltage',
				'chargebeam', 'electroball', 'shockwave', 'thunderfang']) {
				assert(!learnset[move], `${name} still has ${move}`);
			}
			assert(learnset.thunderpunch?.length); assert(learnset.wildcharge?.length);
		}
	});








});
