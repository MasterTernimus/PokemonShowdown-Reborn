'use strict';

const assert = require('./../../assert');
const common = require('./../../common');
let battle;

describe('Eviolite', function () {
	afterEach(() => { battle.destroy(); });
	for (const [species, multiplier] of [['Omanyte', 1.5], ['Omastar', 1], ['Geodude', 1.5]]) {
		it(`should apply the correct defense multiplier for ${species}`, () => {
			battle = common.createBattle([[
				{ species, ability: 'noability', item: 'eviolite', moves: ['sleeptalk'] },
			], [
				{ species: 'Mew', ability: 'noability', moves: ['sleeptalk'] },
			]]);
			const holder = battle.p1.active[0];
			for (const event of ['ModifyDef', 'ModifySpD']) {
				assert.equal(battle.runEvent(event, holder, null, null, 200), 200 * multiplier, event);
			}
			holder.takeItem();
			for (const event of ['ModifyDef', 'ModifySpD']) {
				assert.equal(battle.runEvent(event, holder, null, null, 200), 200, event + ' without Eviolite');
			}
		});
	}
});
