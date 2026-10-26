'use strict';
const assert = require('assert').strict, common = require('../../common'), { Dex } = require('../../../dist/sim');
describe('Sharpness asymmetric Dual Wield', () => {
	let b;
	afterEach(() => b?.destroy());
	function powers({ sharp = true, cold = false, ability = 'Sacred Edge', mode = 'singles', move = 'sacredsword' } = {}) {
		b = common.createBattle({}, [[{ species: 'Gallade-Mega', ability, moves: [move] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		b.gameType = mode;
		const [p, q] = [b.p1.active[0], b.p2.active[0]];
		p.getPassives = () => sharp ? ['sharpness'] : [];
		if (cold)b.field.setTerrain('coldeclipseterrain', p);
		const m = Dex.getActiveMove(move);
		b.runEvent('ModifyMove', p, q, m, m);
		return [1, 2].map(hit => {
			m.hit = hit;
			return b.runEvent('BasePower', p, q, m, 100);
		});
	}
	it('boosts the first slicing hit and uses original power for follow-up', () => assert.deepEqual(powers(), [150, 15]));
	it('does not double apply on repeated events', () => {
		assert.deepEqual(powers(), [150, 15]);
		const [p, q] = [b.p1.active[0], b.p2.active[0]], m = Dex.getActiveMove('sacredsword');
		b.runEvent('ModifyMove', p, q, m, m);
		for (let n = 0;
			n < 3;
			n++) {
			m.hit = 1;
			assert.equal(b.runEvent('BasePower', p, q, m, 100), 150);
			m.hit = 2;
			assert.equal(b.runEvent('BasePower', p, q, m, 100), 15);
		}
	});
	it('keeps ordinary Dual Wield unchanged', () => assert.deepEqual(powers({ sharp: false, ability: 'Dual Wield' }), [60, 60]));
	it('keeps Cold Eclipse disabling Sharpness and its separate Fighting penalty', () => assert.deepEqual(powers({ cold: true }), [30, 30]));
	it('keeps Siege Launcher free-for-all full-power hits', () => assert.deepEqual(powers({ ability: 'Siege Launcher', mode: 'freeforall' }), [150, 150]));
	it('keeps native multihit moves untouched', () => {
		powers();
		const [p, q] = [b.p1.active[0], b.p2.active[0]], m = Dex.getActiveMove('bulletseed');
		b.runEvent('ModifyMove', p, q, m, m);
		assert.deepEqual(m.multihit, [2, 5]);
		assert(!m.multihitType);
	});
});
