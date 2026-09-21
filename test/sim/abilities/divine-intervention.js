'use strict';

const assert = require('assert').strict;
const common = require('../../common');

let battle;

describe('Divine Intervention components', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('combines all effects on Mega Audino', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Audino', item: 'Audinite', moves: ['splash', 'recover'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		const audino = battle.p1.active[0];
		const foe = battle.p2.active[0];
		assert.equal(audino.species.id, 'audinomega');
		for (const component of [
			'swornduty', 'friendguard', 'regenerator', 'fluffy',
		]) {
			assert(audino.hasAbility(component), `Missing ${component}`);
		}
		assert.equal(foe.boosts.atk, 0, 'Divine Intervention must not Intimidate');
		for (const removed of ['triage', 'queensguard', 'contrary', 'shedskin', 'intimidate', 'proficient', 'infiltrator']) assert(!audino.hasAbility(removed), removed);
		assert.equal(battle.runEvent('ModifyPriority', audino, foe, battle.dex.getActiveMove('recover'), 0), 0);
		assert.equal(battle.runEvent('ModifyPriority', audino, foe, battle.dex.getActiveMove('tackle'), 0), 0);
		assert.equal(battle.runEvent('ModifyDamage', foe, audino, battle.dex.getActiveMove('tackle'), 100), 50);
		assert.equal(battle.runEvent('ModifyDamage', foe, audino, battle.dex.getActiveMove('flamethrower'), 100), 200);
		assert.equal(battle.runEvent('ModifyDamage', foe, audino, battle.dex.getActiveMove('firepunch'), 100), 100);
		assert.equal(battle.runEvent('BasePower', audino, foe, battle.dex.getActiveMove('hypervoice'), 100), 100);
		assert.equal(battle.runEvent('BasePower', audino, foe, battle.dex.getActiveMove('psychic'), 100), 100);
		const psychic = battle.dex.getActiveMove('psychic');
		battle.runEvent('ModifyMove', audino, foe, psychic, psychic);
		assert(!psychic.infiltrates, 'Divine Intervention must not grant Infiltrator');
		battle.boost({ def: 1 }, audino);
		assert.equal(audino.boosts.def, 1, 'Divine Intervention must not reverse stat changes');
		audino.setStatus('psn');
		const randomChance = battle.randomChance;
		battle.randomChance = () => true;
		battle.singleEvent('Residual', audino.getAbility(), audino.abilityState, audino);
		battle.randomChance = randomChance;
		assert.equal(audino.status, 'psn', 'Divine Intervention must not grant Shed Skin');
	});
});
