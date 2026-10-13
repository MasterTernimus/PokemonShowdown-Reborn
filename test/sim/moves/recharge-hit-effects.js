'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
function setup(species = 'Mew', foeAbility = 'No Ability', item = '') {
	const mon = (species, ability, item = '') => ({species, ability, item, moves: ['splash', 'protect', 'rockwrecker']});
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[mon(species, 'No Ability'), mon('Mew', 'No Ability')], [mon('Mew', foeAbility, item), mon('Mew', 'No Ability')]]);
	battle.makeChoices('team 12', 'team 12');
	for (const p of battle.getAllActive()) {p.getPassives = () => []; p.hp = p.maxhp = p.baseMaxhp = 10000;}
	battle.randomChance = n => n > 0;
	return [battle.p1.active[0], battle.p2.active[0]];
}
function hit(p, q, id, extra = {}) {
	const move = Object.assign(battle.dex.getActiveMove(id), {accuracy: true, willCrit: false}, extra);
	battle.actions.useMove(move, p, {target: q});
	battle.singleEvent('AfterMove', battle.activeMove, null, p, q, battle.activeMove);
}
describe('Recharge move hit effects', () => {
	afterEach(() => battle?.destroy());
	for (const id of ['rockwrecker', 'blastburn', 'frenzyplant', 'hydrocannon', 'meteorassault', 'prismaticlaser']) {
		for (const defense of ['protect', 'miss', 'substitute', 'shielddust', 'covertcloak', 'immune']) {
			it(id + ' cannot apply status through ' + defense, () => {
				const [p, q] = setup('Mew', defense === 'shielddust' ? 'Shield Dust' : defense === 'immune' ? 'Wonder Guard' : 'No Ability', defense === 'covertcloak' ? 'Covert Cloak' : '');
				q.setType('???');
				if (defense === 'protect' || defense === 'substitute') q.addVolatile(defense, q);
				hit(p, q, id, defense === 'miss' ? {accuracy: 0} : {});
				assert.equal(q.status, '');
			});
		}
	}
	it('Rock Wrecker paralyzes a surviving HP hit and requires recharge', () => {
		const [p, q] = setup(); hit(p, q, 'rockwrecker'); assert.equal(q.status, 'par'); assert(p.volatiles.mustrecharge);
	});
	it('Rock Wrecker KO removes recharge', () => {
		const [p, q] = setup(); q.hp = 1; hit(p, q, 'rockwrecker'); assert.equal(q.hp, 0); assert(!p.volatiles.mustrecharge);
	});
	for (const success of [false, true]) it('Roar of Time clears field effects only on a successful hit: ' + success, () => {
		const [p, q] = setup('Dialga');
		battle.field.setTerrain('rockyterrain', p); battle.field.addPseudoWeather('trickroom', p); q.side.addSideCondition('tailwind', q);
		hit(p, q, 'roaroftime', success ? {} : {accuracy: 0});
		assert.equal(!!q.side.sideConditions.tailwind, !success);
		assert.equal(!!battle.field.pseudoWeather.trickroom, !success);
		assert.equal(!!battle.field.terrain, !success);
	});
});
