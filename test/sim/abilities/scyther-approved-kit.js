'use strict';
const assert = require('assert').strict, common = require('../../common'), { Dex, TeamValidator } = require('../../../dist/sim');
describe('Scyther approved kit', () => {
	let b;
	afterEach(() => b?.destroy());
	function setup(ability = 'Technician') {
		b = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species: 'Scyther', ability, moves: ['furycutter', 'stackingshot', 'tackle'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		b.makeChoices('team 1', 'team 1');
		return [b.p1.active[0], b.p2.active[0]];
	}
	for (const ability of ['Technician', 'Sharpness', 'Swarm'])it(ability + ' is selectable with Steadfast passive', () => {
		const [p] = setup(ability);
		assert.equal(p.ability, Dex.toID(ability));
		assert.deepEqual(p.getPassives(), ['steadfast']);
		const errors = new TeamValidator('gen9nofieldsinglesgame').validateSet({ species: 'Scyther', ability, moves: ['furycutter', 'stackingshot'] }) || [];
		assert(!errors.some(e => /ability/i.test(e)), errors.join('\n'));
	});
	it('Technician uses effective 60 threshold and Factory 80 threshold', () => {
		const [p, q] = setup();
		for (const [power, expected] of [[40, 60], [60, 90], [80, 80], [160, 160]])assert.equal(b.runEvent('BasePower', p, q, Dex.getActiveMove('stackingshot'), power), expected);
		b.field.setTerrain('factoryterrain', p);
		assert.equal(b.runEvent('BasePower', p, q, Dex.getActiveMove('stackingshot'), 80), 120);
		p.addVolatile('gastroacid');
		assert.equal(b.runEvent('BasePower', p, q, Dex.getActiveMove('stackingshot'), 40), 40);
	});
	it('Sharpness boosts slicing only and switches off on Cold Eclipse', () => {
		const [p, q] = setup('Sharpness');
		assert.equal(b.runEvent('BasePower', p, q, Dex.getActiveMove('furycutter'), 40), 60);
		assert.equal(b.runEvent('BasePower', p, q, Dex.getActiveMove('stackingshot'), 40), 40);
		b.field.setTerrain('coldeclipseterrain', p);
		assert.equal(b.runEvent('BasePower', p, q, Dex.getActiveMove('furycutter'), 40), 40);
	});
	it('Swarm retains low-HP Bug and broad Grassy/Forest field boosts', () => {
		const [p, q] = setup('Swarm');
		assert.equal(b.runEvent('ModifyAtk', p, q, Dex.getActiveMove('furycutter'), 100), 100);
		p.hp = 1;
		assert.equal(b.runEvent('ModifyAtk', p, q, Dex.getActiveMove('furycutter'), 100), 150);
		p.hp = p.maxhp;
		for (const field of ['grassyterrain', 'forestterrain']) {
			b.field.setTerrain(field, p);
			assert.equal(b.runEvent('ModifyAtk', p, q, Dex.getActiveMove('tackle'), 100), 150);
		}b.field.setTerrain('flowergarden1', p);
		assert.equal(b.runEvent('ModifyAtk', p, q, Dex.getActiveMove('furycutter'), 100), 150);
	});
	it('suppressed active ability still loses its flinched action and gains one Speed', () => {
		const [p, q] = setup();
		p.addVolatile('gastroacid');
		const hp = q.hp;
		p.addVolatile('flinch', q);
		b.makeChoices('move tackle', 'move splash');
		assert.equal(q.hp, hp);
		assert.equal(p.boosts.spe, 1);
	});
	it('copied active Steadfast does not duplicate the passive', () => {
		const [p] = setup();
		p.setAbility('Steadfast');
		b.runEvent('Flinch', p);
		assert.equal(p.boosts.spe, 1);
	});
	it('retains Electric entry, Ashen Beach accuracy and Rocky protection under suppression', () => {
		const [p, q] = setup();
		p.addVolatile('gastroacid');
		b.field.setTerrain('electricterrain', p);
		p.boosts.spe = 0;
		const { passiveEffect, passiveState } = require('../../../dist/sim/species-passives');
		b.singleEvent('SwitchIn', passiveEffect(b, 'steadfast'), passiveState(p, 'steadfast'), p);
		assert.equal(p.boosts.spe, 1);
		b.field.setTerrain('ashenbeachterrain', p);
		assert.equal(b.runEvent('Accuracy', q, p, Dex.getActiveMove('tackle'), 1), true);
		q.setAbility('Unnerve');
		assert.equal(b.runEvent('Accuracy', q, p, Dex.getActiveMove('tackle'), 1), 1);
		b.field.setTerrain('rockyterrain', p);
		const hp = p.hp;
		b.runEvent('Flinch', p);
		assert.equal(p.hp, hp);
	});
});
