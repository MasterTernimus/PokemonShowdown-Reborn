'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const { Dex, TeamValidator } = require('../../../dist/sim');

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

	it('sets both base forms to 535 BST and Mega Typhlosion to 635 BST', () => {
		for (const name of ['Typhlosion', 'Typhlosion-Alt', 'Typhlosion-Hisui']) {
			const stats = Dex.species.get(name).baseStats;
			assert.equal(Object.values(stats).reduce((sum, stat) => sum + stat, 0), 535, name);
		}
		assert.deepEqual(Dex.species.get('Typhlosion').baseStats,
			{ hp: 78, atk: 84, def: 78, spa: 110, spd: 85, spe: 100 });
		assert.deepEqual(Dex.species.get('Typhlosion-Alt').baseStats,
			Dex.species.get('Typhlosion').baseStats);
		assert.deepEqual(Dex.species.get('Typhlosion-Hisui').baseStats,
			{ hp: 73, atk: 84, def: 78, spa: 120, spd: 85, spe: 95 });
		for (const id of ['typhlosion', 'typhlosionalt', 'typhlosionmega']) {
			assert.deepEqual(Dex.species.get(id).types, ['Fire', 'Electric']);
			const moves = Dex.species.getFullLearnset(id).flatMap(data => Object.keys(data.learnset));
			assert(!moves.includes('earthpower'));
			for (const move of ['earthquake', 'bulldoze', 'dig', 'scorchingsands', 'stompingtantrum', 'mudbarrage']) {
				assert(moves.includes(move), id + ' should retain ' + move);
			}
		}
		assert.deepEqual(Dex.species.get('typhlosionhisui').types, ['Fire', 'Ghost']);
		const mega = Dex.species.get('Typhlosion-Mega');
		assert.deepEqual(mega.types, ['Fire', 'Electric']);
		assert.deepEqual(mega.baseStats, { hp: 78, atk: 127, def: 78, spa: 137, spd: 85, spe: 130 });
		assert.equal(Object.values(mega.baseStats).reduce((sum, stat) => sum + stat, 0), 635);
		assert.equal(mega.abilities[0], 'Plasma Eruption');
		assert.equal(mega.requiredItem, 'Typhlosionite');
		for (const name of ['Typhlosion', 'Typhlosion-Alt', 'Typhlosion-Hisui']) {
			const [holder] = start(name);
			assert.equal(holder.species.id, 'typhlosionmega');
			assert.equal(holder.ability, 'plasmaeruption');
			battle.destroy();
			battle = null;
		}
	});

	it('rejects Earth Power on imported teams and keeps Earthquake legal', () => {
		for (const format of ['gen9dragonsden', 'gen9doublesrockyfield']) {
			const validator = TeamValidator.get(format);
			for (const species of ['Typhlosion', 'Typhlosion-Alt', 'Typhlosion-Hisui']) {
				const set = { species, item: 'Typhlosionite', ability: Dex.species.get(species).abilities[0] };
				assert(validator.validateSet({ ...set, moves: ['Earth Power'] })?.some(message => message.includes("can't learn Earth Power")));
				assert.equal(validator.validateSet({ ...set, moves: ['Earthquake'], evs: { spa: 252, spe: 252, hp: 4 } }), null);
			}
		}
	});

	it('keeps withdrawn Electric moves excluded while granting the three approved attacks', () => {
		for (const name of ['Typhlosion', 'Typhlosion-Hisui']) {
			const learnset = Dex.species.getLearnsetData(name.toLowerCase().replace(/[^a-z0-9]/g, '')).learnset;
			for (const move of ['thunderbolt', 'doubleshock', 'risingvoltage',
				'chargebeam', 'electroball', 'thunderfang']) {
				assert(!learnset[move], `${name} still has ${move}`);
			}
			assert(learnset.thunderpunch?.length); assert(learnset.wildcharge?.length);
			for (const move of ['zapcannon', 'shockwave', 'thunder']) assert(learnset[move].includes('9M'));
		}
	});
});
