'use strict';

const assert = require('assert').strict, common = require('../../common');

describe('Pulse entry fields', () => {
	let b;

	afterEach(() => b?.destroy());

	function setup(species, ability, blocker = 'No Ability') {
		b = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species, ability, item: 'Anomaly Core', moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }], [{ species: 'Mew', ability: blocker, moves: ['splash'] }]]);

		b.makeChoices('team 12', 'team 1');

		return [b.p1.active[0], b.p2.active[0]];
	}

	for (const [species, ability, formAbility] of [['Muk', 'Poison Touch', 'Pulse Waste'], ['Swalot', 'Liquid Ooze', 'Pulse Filtration']]) {
		it(`${species} transforms, creates five turns, expires, and stays expired on reentry`, () => {
			const [p] = setup(species, ability);
			b.p2.active[0].hp = b.p2.active[0].maxhp = 9999;
			b.field.setTerrain('factoryterrain', p);
			assert(b.actions.runMegaEvo(p));
			assert.equal(p.getAbility().name, formAbility);

			assert.equal(b.field.terrain, species === 'Muk' ? 'swampterrain' : 'murkwatersurfaceterrain');
			assert.equal(b.field.terrainState.duration, 5);

			for (let i = 0; i < 4; i++) {
				b.makeChoices('move 1', 'move splash');
				assert.equal(b.field.terrain, species === 'Muk' ? 'swampterrain' : 'murkwatersurfaceterrain');
			}

			b.makeChoices('move 1', 'move splash');
			assert.equal(b.field.terrain, 'factoryterrain');

			b.makeChoices('switch 2', 'move splash');
			b.makeChoices('switch 2', 'move splash');
			assert.equal(b.field.terrain, 'factoryterrain');
		});

		for (const blocker of ['Pulse Blockade', 'Neutralization'])
			it(`${species} respects ${blocker}`, () => {
				const [p, t] = setup(species, ability);
				b.field.setTerrain('factoryterrain', p);
				t.setAbility(blocker);
				assert(b.actions.runMegaEvo(p));
				assert.notEqual(b.field.terrain, species === 'Muk' ? 'swampterrain' : 'murkwatersurfaceterrain');
			});

		for (const field of ['newworldterrain', 'underwaterterrain', 'chessboardterrain', 'glitchterrain'])
			it(`${species} respects ${field}`, () => {
				const [p] = setup(species, ability);
				b.field.setTerrain(field, p);
				assert.equal(b.field.terrain, field);
				b.actions.runMegaEvo(p);
				assert.equal(b.field.terrain, species === 'Swalot' && field === 'underwaterterrain' ? 'murkwatersurfaceterrain' : field);
			});

		it(`${species} does not clear Auras, and a suppressed blockade does not block`, () => {
			const [p, t] = setup(species, ability);
			b.field.setTerrain('factoryterrain', p);
			b.field.setAura('electricterrain', 5, p, p.getAbility());
			const aura = b.field.auraField;

			t.setAbility('Pulse Blockade');
			t.addVolatile('gastroacid');
			b.actions.runMegaEvo(p);
			assert.equal(b.field.terrain, species === 'Muk' ? 'swampterrain' : 'murkwatersurfaceterrain');
			assert.equal(b.field.auraField, aura);
		});

		it(`${species} suppression prevents its field on ability start`, () => {
			const [p, t] = setup(species, ability, 'Neutralizing Gas');
			b.actions.runMegaEvo(p);
			assert.notEqual(b.field.terrain, species === 'Muk' ? 'swampterrain' : 'murkwatersurfaceterrain');
		});
	}
});
