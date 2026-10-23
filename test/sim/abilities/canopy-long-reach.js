'use strict';
const assert = require('assert').strict, { Battle, Dex } = require('../../../dist/sim');
function setup(ability) {
	const b = new Battle({ formatid: 'gen9nofieldsinglesgame', p1: { team: [{ species: 'Mew', ability, moves: ['tackle', 'splash'] }] }, p2: { team: [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }] } });
	if (b.requestState === 'teampreview')b.makeChoices('team 1', 'team 1');
	return b;
}
describe('Contact-only Long Reach and expanded Canopy Archer', () => {
	it('Long Reach has only its ordinary move callback', () => {
		const a = Dex.abilities.get('longreach');
		assert.deepEqual(Object.keys(a).filter(k => k.startsWith('on') && typeof a[k] === 'function'), ['onModifyMove']);
		assert(!a.flags.breakable);
	});
	for (const id of ['longreach', 'canopyarcher'])it(id + ' removes contact and suppression restores it', () => {
		const b = setup(id);
		try {
			const p = b.p1.active[0], q = b.p2.active[0];
			let m = Dex.getActiveMove('tackle');
			b.runEvent('ModifyMove', p, q, m, m);
			assert(!m.flags.contact);
			p.addVolatile('gastroacid');
			m = Dex.getActiveMove('tackle');
			b.runEvent('ModifyMove', p, q, m, m);
			assert(m.flags.contact);
		} finally {
			b.destroy();
		}
	});
	it('Canopy retains arrow accuracy and gains Ghost bypass and Intimidate protection', () => {
		const b = setup('Canopy Archer');
		try {
			const p = b.p1.active[0], q = b.p2.active[0], m = Dex.getActiveMove('triplearrows');
			b.runEvent('ModifyMove', p, q, m, m);
			assert.equal(m.accuracy, true);
			assert(m.ignoreImmunity.Fighting);
			b.boost({ atk: -1 }, p, q, Dex.abilities.get('intimidate'));
			assert.equal(p.boosts.atk, 0);
			b.boost({ atk: -1 }, p, q, Dex.moves.get('growl'));
			assert.equal(p.boosts.atk, -1);
		} finally {
			b.destroy();
		}
	});
	it('only Hisuian selectable Scrappy slot changes', () => { assert.deepEqual(Dex.species.get('decidueyehisui').abilities, { 0: 'Fallen Star', 1: 'Unburden', H: 'Canopy Archer' }); assert.equal(Dex.species.get('decidueye').abilities[1], 'Silent Flight'); });
});
describe('Explicit independent Keen Eye component', () => {
	it('Razor Reach keeps separately declared Keen Eye but not removed Long Reach power or critical bonuses', () => {
		const a = Dex.abilities.get('razorreach');
		assert(a.onStart);
		assert(a.onTryBoost);
		assert.equal(a.onModifyCritRatio, undefined);
		const b = setup('Razor Reach');
		try {
			const p = b.p1.active[0], q = b.p2.active[0];
			assert.equal(p.boosts.accuracy, 0);
			b.field.setTerrain('mountainterrain', p);
			assert.equal(b.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 100), 100);
		} finally {
			b.destroy();
		}
	});
});
