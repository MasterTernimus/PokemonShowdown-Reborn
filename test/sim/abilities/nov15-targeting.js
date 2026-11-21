'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
describe('Download and Defragment targeting effects', () => {
	let battle;
	function start(ability, doubles = false, species = 'Mew') {
		const mon = a => ({ species: 'Mew', ability: a, moves: ['splash', 'zapcannon', 'tackle', 'protect'] });
		const team = [mon(ability), mon('No Ability'), mon('No Ability')]; team[0].species = species;
		battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' },
			[team, [mon('No Ability'), mon('No Ability'), mon('No Ability')]]);
		battle.makeChoices('team 123', 'team 123');
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	afterEach(() => { battle?.destroy(); });
	for (const [ability, volatile] of [['Download', 'laserfocus'], ['Defragment', 'lockon']]) {
		it(`${ability} grants its real two-turn effect only once per battle`, () => {
			const [p, foe] = start(ability);
			assert(p.volatiles[volatile]); assert.equal(p.volatiles[volatile].duration, 2);
			const move = Dex.getActiveMove('zapcannon');
			assert.equal(battle.runEvent('Accuracy', foe, p, move, 50), ability === 'Defragment' ? true : 50);
			assert.equal(battle.runEvent('ModifyCritRatio', p, foe, move, 1), ability === 'Download' ? 5 : 1);
			battle.makeChoices('move splash', 'move splash'); assert(p.volatiles[volatile]);
			battle.makeChoices('move splash', 'move splash'); assert(!p.volatiles[volatile]);
			battle.makeChoices('switch 2', 'move splash'); battle.makeChoices('switch 2', 'move splash');
			assert(!p.volatiles[volatile]);
			assert.equal(p.boosts[ability === 'Download' ? 'spa' : 'def'], 1);
			p.setAbility('No Ability'); p.setAbility(ability); assert(!p.volatiles[volatile]);
			assert.equal(battle.runEvent('Accuracy', foe, p, move, 50), 50);
			assert.equal(battle.runEvent('ModifyCritRatio', p, foe, move, 1), 1);
		});
	}
	it('locks onto both current foes, not replacements, and respects Protect and immunity', () => {
		const [p, foe] = start('Defragment', true), other = battle.p2.active[1];
		const move = Dex.getActiveMove('zapcannon');
		for (const target of [foe, other]) assert.equal(battle.runEvent('Accuracy', target, p, move, 50), true);
		assert.equal(battle.runEvent('Accuracy', battle.p2.pokemon[2], p, move, 50), 50);
		foe.addVolatile('protect'); const hp = foe.hp;
		battle.actions.useMove('zapcannon', p, { target: foe }); assert.equal(foe.hp, hp);
		foe.removeVolatile('protect'); foe.setType('Ground');
		battle.actions.useMove('zapcannon', p, { target: foe }); assert.equal(foe.hp, hp);
	});
	it('caps each defensive entry boost at +1 on formerly enhanced fields', () => {
		const [p, foe] = start('Defragment');
		for (const field of ['newworldterrain', 'factoryterrain', 'shortcircuitterrain', 'glitchterrain', 'starlightarenaterrain', 'fairytaleterrain']) {
			battle.field.terrain = field;
			for (const physical of [true, false]) {
				p.clearBoosts(); foe.storedStats.atk = physical ? 400 : 100; foe.storedStats.spa = physical ? 100 : 400;
				battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
				assert.equal(p.boosts.def, physical || field === 'fairytaleterrain' ? 1 : 0, field);
				assert.equal(p.boosts.spd, !physical || field === 'fairytaleterrain' ? 1 : 0, field);
			}
		}
	});
	it('does not refresh nested or passive targeting effects', () => {
		const [p] = start('Adaptive Core', false, 'Porygon-Z');
		assert(p.volatiles.laserfocus); assert(p.volatiles.lockon);
		battle.makeChoices('move splash', 'move splash');
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(p.volatiles.laserfocus.duration, 1); assert.equal(p.volatiles.lockon.duration, 1);
	});
});
