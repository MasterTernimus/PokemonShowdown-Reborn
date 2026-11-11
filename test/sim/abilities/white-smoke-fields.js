'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { FieldArrivalMessages } = require('../../../dist/data/field-messages');
let battle;
const mon = (species, ability) => ({ species, ability, moves: ['splash'] });
describe('White Smoke field boosts and themed field arrivals', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const formatid of ['gen9volcanic', 'gen9dragonsden']) {
		for (const [species, ability] of [['Mew', 'White Smoke'], ['Torkoal', 'Drought'],
			['Torkoal', 'White Smoke'], ['Torkoal', 'Smoldering Shroud'], ['Mew', 'Constricting Heat']]) {
			it(`${species}/${ability} gets one entry boost in ${formatid}`, () => {
				battle = common.createBattle({ formatid }, [
					[mon(species, ability), mon('Magikarp', 'No Ability')], [mon('Magikarp', 'No Ability')],
				]);
				battle.makeChoices('team 12', 'team 1');
				const p = battle.p1.active[0];
				assert.equal(p.boosts.atk, 1);
				assert.equal(p.boosts.spa, 1);
				assert.equal(battle.log.filter(line => line.includes('charged') && line.includes('white smoke!')).length, 1);
				battle.makeChoices('move splash', 'move splash');
				assert.equal(p.boosts.atk, 1);
				battle.makeChoices('switch 2', 'move splash');
				battle.makeChoices('switch 2', 'move splash');
				assert.equal(p.boosts.atk, 1);
				assert.equal(p.boosts.spa, 1);
			});
		}
	}
	it('keeps stat protection and Shroud retaliation independent from its entry reward', () => {
		battle = common.createBattle({ formatid: 'gen9dragonsden' }, [
			[mon('Torkoal', 'Smoldering Shroud')], [mon('Magikarp', 'No Ability')],
		]);
		battle.makeChoices('team 1', 'team 1');
		const [p, q] = [battle.p1.active[0], battle.p2.active[0]];
		battle.boost({ atk: -1 }, p, q, battle.dex.moves.get('growl'));
		assert.equal(p.boosts.atk, 1);
		assert.equal(p.boosts.spa, 2);
		battle.boost({ atk: -1 }, p, q, battle.dex.moves.get('growl'));
		assert.equal(p.boosts.spa, 2);
	});
	for (const [field, message] of Object.entries(FieldArrivalMessages)) {
		it(field + ' announces a real arrival once, not a rejected repeat', () => {
			battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
				[mon('Mew', 'White Smoke')], [mon('Magikarp', 'No Ability')],
			]);
			battle.makeChoices('team 1', 'team 1');
			const p = battle.p1.active[0];
			assert.equal(p.boosts.atk, 0);
			assert.equal(p.boosts.spa, 0);
			assert(battle.field.setTerrain(field, p));
			battle.field.setTerrain(field, p);
			assert.equal(battle.log.filter(line => line === '|-message|' + message).length, 1);
			assert.equal(p.boosts.atk, 0, 'Field changes alone are not a new ability entry');
		});
	}
});
