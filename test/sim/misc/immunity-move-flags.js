'use strict';

const assert = require('../../assert');
const common = require('../../common');

describe('Immunity checks without move flags', () => {
	let battle;
	beforeEach(() => {
		battle = common.createBattle([[{ species: 'Pidgey', ability: 'noability', moves: ['splash'] }], [{ species: 'Magikarp', ability: 'noability', moves: ['splash'] }]]);
	});
	afterEach(() => { battle.destroy(); });
	it('accepts a secondary-effect payload with no flags', () => {
		assert.equal(battle.p1.active[0].runImmunity({ type: 'Normal' }), true);
	});
	it('retains Ground immunity when the secondary payload has no bone flag', () => {
		assert.equal(battle.p1.active[0].runImmunity({ type: 'Ground' }), false);
	});
	it('preserves the existing custom bone bypass for full moves', () => {
		assert.equal(battle.p1.active[0].runImmunity({ type: 'Ground', flags: { bone: 1 } }), true);
		assert.equal(battle.p1.active[0].runImmunity({ type: 'Ground', flags: {} }), false);
	});
	it('preserves explicit immunity bypass and string type checks', () => {
		assert.equal(battle.p1.active[0].runImmunity({ type: 'Ground', ignoreImmunity: true }), true);
		assert.equal(battle.p1.active[0].runImmunity('Ground'), false);
	});
});
