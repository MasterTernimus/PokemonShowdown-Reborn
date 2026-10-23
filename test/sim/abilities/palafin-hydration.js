'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
describe('Palafin Hydration replacement', () => {
	let b;
	afterEach(() => { b?.destroy(); b = null; });
	for (const species of ['Palafin', 'Palafin-Hero']) {
		it(species + ' has the approved slots and accepts Intimidate and flinch', () => {
			assert.deepEqual(Dex.species.get(species).abilities, { 0: 'Sworn Duty', 1: 'Friend Guard', H: 'Hydration' });
			const m = { species: 'Mew', ability: 'No Ability', moves: ['splash'] };
			b = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ ...m, species, ability: 'Hydration' }], [m]]);
			b.makeChoices('team 1', 'team 1');
			const p = b.p1.active[0], q = b.p2.active[0];
			assert.deepEqual(p.getPassives(), ['zerotohero']);
			q.setAbility('Intimidate');
			assert.equal(p.boosts.atk, -1);
			assert(p.addVolatile('flinch', q));
			for (const field of ['watersurfaceterrain', 'underwaterterrain', 'midnightzoneterrain', 'murkwatersurfaceterrain', 'swampterrain']) {
				b.field.terrain = field;
				p.status = 'brn';
				b.singleEvent('Residual', p.getAbility(), p.abilityState, p);
				assert.equal(p.status, ['murkwatersurfaceterrain', 'swampterrain'].includes(field) ? 'brn' : '');
			}
			b.field.terrain = '';
			b.field.setWeather('raindance', p);
			p.status = 'brn';
			b.makeChoices('move splash', 'move splash');
			assert.equal(p.status, '');
			p.addVolatile('gastroacid');
			p.status = 'brn';
			b.makeChoices('move splash', 'move splash');
			assert.equal(p.status, 'brn');
			b.runEvent('SwitchOut', p);
			assert.equal(p.species.id, 'palafinhero');
			assert.equal(p.ability, 'hydration');
		});
	}
});
