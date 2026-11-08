'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
let battle;
function setup(species, doubles = false) {
	const mon = (species = 'Mew', ability = 'No Ability') => ({ species, ability, moves: ['splash', 'quiverdance', 'dragondance'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' },
		[[mon(species, 'Noble Dance'), mon()], [mon(), mon()]]);
	battle.makeChoices('team 12', 'team 12');
	battle.field.terrain = '';
	return [battle.p1.active[0], battle.p2.active[0]];
}
describe('Noble Dance after the approved ward removal', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('keeps the approved Ludicolo Rain Dish slot', () => {
		assert.deepEqual(Dex.species.get('ludicolo').abilities, { 0: 'Swift Swim', 1: 'Liquid Voice', H: 'Rain Dish' });
		assert.deepEqual(Dex.species.get('ludicolo').passives, ['owntempo']);
	});
	for (const species of ['Lilligant', 'Lilligant-Hisui']) {
		it(species + ' retains direct dance boosts without granting damage protection', () => {
			const [p, foe] = setup(species);
			battle.makeChoices('move quiverdance', 'move splash');
			assert(p.boosts.spa > 0 && p.boosts.spd > 0 && p.boosts.spe > 0);
			assert(!p.volatiles.nobledanceward);
			assert(!p.volatiles.nobledancespent);
			assert.equal(battle.runEvent('ModifyDamage', foe, p, Dex.getActiveMove('tackle'), 1000), 1000);
		});
		it(species + ' copies an opposing dance without recursive copies or wards', () => {
			const [p, foe] = setup(species);
			battle.makeChoices('move splash', 'move dragondance');
			assert.equal(p.boosts.atk, 1);
			assert.equal(p.boosts.spe, 1);
			assert.equal(foe.boosts.atk, 1);
			assert(!p.volatiles.nobledanceward);
		});
		it(species + ' does not copy dances while its selected ability is suppressed', () => {
			const [p] = setup(species);
			p.addVolatile('gastroacid');
			battle.makeChoices('move splash', 'move dragondance');
			assert.equal(p.boosts.atk, 0);
			assert.equal(p.boosts.spe, 0);
		});
		it(species + ' retains Hospitality healing for adjacent allies', () => {
			const [p, foe] = setup(species, true);
			const ally = p.allies()[0];
			ally.maxhp = ally.baseMaxhp = foe.maxhp = foe.baseMaxhp = 800;
			ally.hp = foe.hp = 200;
			battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
			assert.equal(ally.hp, 400);
			assert.equal(foe.hp, 200);
		});
	}
});
