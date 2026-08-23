'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Multi-hit spillover', () => {
	afterEach(() => {
		battle?.destroy();
	});

	it('should continue Bone Rush onto the opposing partner after a KO', () => {
		battle = common.createBattle({ formatid: 'gen9multimistyfieldadrienn' }, [[
			{ species: 'Marowak', ability: 'bonewarrior', item: 'thickclub', moves: ['bonerush'] },
		], [
			{ species: 'Glalie', moves: ['splash'] },
		], [
			{ species: 'Wynaut', moves: ['splash'] },
		], [
			{ species: 'Drifblim', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1', 'team 1', 'team 1');

		const firstTarget = battle.p2.active[0];
		const opposingPartner = battle.p4.active[0];
		firstTarget.hp = 1;
		battle.makeChoices('move bonerush', 'auto', 'auto', 'auto');

		assert.equal(firstTarget.hp, 0, `Bone Rush should KO its first target`);
		assert(opposingPartner.hp < opposingPartner.maxhp, `Bone Rush should chain to the opposing partner`);
	});
});
