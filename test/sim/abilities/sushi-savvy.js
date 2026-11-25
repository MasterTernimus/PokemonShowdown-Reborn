'use strict';

const assert = require('assert').strict;
const common = require('../../common');

describe('Sushi Savvy', () => {
	let battle;
	const spare = { species: 'Magikarp', ability: 'Swift Swim', moves: ['splash'] };

	function start(species, ability, item, moves = ['splash']) {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species, ability, item, moves }, spare],
			[spare],
		]);
		battle.makeChoices('team 12', 'team 1');
		return battle.p1.active[0];
	}

	afterEach(() => battle?.destroy());

	for (const [species, ability] of [
		['Tatsugiri', 'Commander'],
		['Tatsugiri-Droopy', 'Sushi Trick'],
		['Tatsugiri-Stretchy', 'Storm Drain'],
	]) {
		it(species + ' gets exactly one Sp. Atk stage on the lead and on re-entry', () => {
			const tatsugiri = start(species, ability);
			assert.deepEqual(tatsugiri.getPassives(), ['sushisavvy']);
			assert.equal(tatsugiri.boosts.spa, 1);
			battle.makeChoices('move splash', 'move splash');
			assert.equal(tatsugiri.boosts.spa, 1);
			battle.makeChoices('switch 2', 'move splash');
			assert.equal(tatsugiri.boosts.spa, 0);
			battle.makeChoices('switch 2', 'move splash');
			assert.equal(battle.p1.active[0], tatsugiri);
			assert.equal(tatsugiri.boosts.spa, 1);
			assert.equal(battle.log.filter(line => line.includes('[from] passive: Sushi Savvy')).length, 2);
		});
	}

	it('only boosts once if the selected ability is also Sushi Savvy', () => {
		assert.equal(start('Tatsugiri', 'Sushi Savvy').boosts.spa, 1);
	});

	for (const [species, mega] of [
		['Tatsugiri', 'tatsugiricurlymega'],
		['Tatsugiri-Droopy', 'tatsugiridroopymega'],
		['Tatsugiri-Stretchy', 'tatsugiristretchymega'],
	]) {
		it(mega + ' gains +1 on each re-entry and keeps the normal direction of stat changes', () => {
			const tatsugiri = start(species, 'Storm Drain', 'Tatsugirinite', ['splash', 'dracometeor', 'nastyplot']);
			const foe = battle.p2.active[0];
			foe.maxhp = foe.baseMaxhp = foe.hp = 5000;
			battle.makeChoices('move splash mega', 'move splash');
			assert.equal(tatsugiri.species.id, mega);
			assert.deepEqual(tatsugiri.getPassives(), ['sushisavvy']);
			assert.equal(tatsugiri.getAbility().id, 'mastercourse');
			assert(!tatsugiri.hasAbilityOrPassive('contrary'));
			assert.equal(tatsugiri.boosts.spa, 1, 'Mega Evolution keeps the existing entry boost');
			for (let i = 0; i < 2; i++) {
				battle.makeChoices('switch 2', 'move splash');
				battle.makeChoices('switch 2', 'move splash');
				assert.equal(tatsugiri.boosts.spa, 1);
				tatsugiri.boosts.accuracy = 6;
				battle.makeChoices('move dracometeor', 'move splash');
				assert.equal(tatsugiri.boosts.spa, -1);
				battle.makeChoices('move nastyplot', 'move splash');
				assert.equal(tatsugiri.boosts.spa, 1);
			}
			assert.equal(battle.log.filter(line => line.includes('[from] passive: Sushi Savvy')).length, 3);
		});
	}
});
