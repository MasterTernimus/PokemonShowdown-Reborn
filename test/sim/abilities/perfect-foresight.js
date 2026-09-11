'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
function start(ability = 'Pressure') {
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
		[{species: 'Alakazam', ability: 'Perfect Foresight', moves: ['splash']}],
		[{species: 'Mew', ability, moves: ['splash']}],
	]);
	battle.makeChoices('team 1', 'team 1');
	return battle.p1.active[0];
}
describe('Perfect Foresight Insomnia', () => {
	afterEach(() => battle?.destroy());
	for (const sand of [false, true]) {
		it(`selects ${sand ? 'active Sand Rush' : 'the strongest attacker without sand'} and applies actual Speed`, () => {
			battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [
				[{species: 'Alakazam', ability: 'No Ability', moves: ['splash']}, {species: 'Mew', ability: 'No Ability', moves: ['splash']}],
				[{species: 'Magikarp', ability: 'Sand Rush', moves: ['splash']}, {species: 'Mewtwo', ability: 'Pressure', moves: ['splash']}],
			]);
			battle.makeChoices('team 12', 'team 12');
			const mon = battle.p1.active[0];
			if (sand) battle.field.setWeather('sandstorm', mon);
			const speed = mon.getStat('spe');
			mon.setAbility('perfectforesight');
			assert.equal(mon.m.perfectForesightAbility, sand ? 'sandrush' : 'pressure');
			assert.equal(mon.getStat('spe'), speed * (sand ? 2 : 1));
			if (sand) {
				battle.field.clearWeather();
				assert.equal(mon.getStat('spe'), speed);
				assert.equal(mon.m.perfectForesightAbility, 'sandrush');
			}
		});
	}
	for (const trigger of ['DamagingHit', 'AfterMove', 'Future Sight']) {
		it(`queues 90 BP Future Sight via ${trigger}`, () => {
			const mon = start(), foe = battle.p2.active[0];
			const move = battle.dex.getActiveMove('tackle');
			if (trigger === 'DamagingHit') battle.singleEvent(trigger, mon.getAbility(), mon.abilityState, mon, foe, move, 10);
			else if (trigger === 'AfterMove') battle.singleEvent(trigger, mon.getAbility(), mon.abilityState, mon, foe, move);
			else battle.actions.useMove('futuresight', mon, foe);
			assert.equal(foe.side.slotConditions[foe.position].futuremove.moveData.basePower, 90);
		});
	}
	it('retains its copied ability while preventing sleep and Yawn and curing existing sleep', () => {
		const mon = start();
		assert.equal(mon.m.perfectForesightAbility, 'pressure');
		assert(mon.hasAbility('insomnia'));
		assert(mon.hasAbility('pressure'));
		assert.equal(mon.trySetStatus('slp', battle.p2.active[0]), false);
		assert(!mon.addVolatile('yawn', battle.p2.active[0]));
		mon.status = 'slp';
		battle.eachEvent('Update');
		assert.equal(mon.status, '');
	});
	for (const copied of ['Pressure', 'Insomnia']) {
		it(`applies one Insomnia power boost when copying ${copied}`, () => {
			const mon = start(copied), target = battle.p2.active[0];
			for (const id of ['darkpulse', 'shadowball']) {
				assert.equal(battle.runEvent('BasePower', mon, target, battle.dex.getActiveMove(id), 100), 130);
			}
			assert.equal(battle.runEvent('BasePower', mon, target, battle.dex.getActiveMove('psychic'), 100), 100);
		});
	}
});
