'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex, TeamValidator } = require('../../../dist/sim');
const { CosmeticBattleCounterparts } = require('../../../dist/data/cosmetic-counterparts');

describe('Deso forms are cosmetic counterparts', () => {
	const skins = Dex.species.all().filter(species => species.forme === 'Deso');
	const pool = species => [...new Set(Dex.species.getFullLearnset(species.id).flatMap(row => Object.keys(row.learnset)))].sort();
	for (const skin of skins) it(skin.name + ' keeps its artwork identity and matches its base gameplay', () => {
		const base = Dex.species.get(skin.baseSpecies);
		assert.equal(CosmeticBattleCounterparts[skin.id], base.id);
		assert(skin.isCosmeticForme); assert.notEqual(skin.id, base.id);
		for (const key of ['num', 'types', 'baseStats', 'abilities', 'passives', 'weightkg']) assert.deepEqual(skin[key], base[key], key);
		assert.deepEqual(pool(skin), pool(base));
		const make = species => ({ species: species.name, ability: species.abilities[0], moves: ['protect'] });
		const validator = new TeamValidator('gen9nofieldsinglesgame');
		assert.equal(validator.validateTeam([make(skin)]), null);
		const b = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[make(skin)], [make(base)]]);
		try {
			b.makeChoices('team 1', 'team 1');
			const p = b.p1.active[0], q = b.p2.active[0];
			assert.equal(p.species.id, skin.id);
			assert.deepEqual(p.storedStats, q.storedStats); assert.equal(p.ability, q.ability);
			assert.deepEqual(p.getPassives(), q.getPassives());
			for (const move of ['canMegaEvo', 'canMegaEvoX', 'canMegaEvoY', 'canGigantamax']) assert.equal(p[move], q[move], move);
		} finally { b.destroy(); }
	});
	it('Species Clause counts a Deso form and its base as the same species', () => {
		const validator = new TeamValidator('gen9nofieldsinglesgame@@@Species Clause');
		for (const skin of skins) {
			const base = Dex.species.get(skin.baseSpecies);
			const problems = validator.validateTeam([base, skin].map(s => ({ species: s.name, ability: s.abilities[0], moves: ['protect'] })));
			assert(problems?.some(line => /Species Clause|one of each|same Pok/i.test(line)), skin.name + ': ' + problems);
		}
	});
});
