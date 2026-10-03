'use strict';
const assert = require('assert').strict, common = require('../../common');
describe('Ability boost attribution', () => {
	let battle;
	afterEach(() => battle?.destroy());
	it('reveals Memory Leak on Beheeyem without assigning it to the recipient', () => {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[{ species: 'Beheeyem', ability: 'Memory Leak', moves: ['nastyplot'] }, { species: 'Toxicroak', ability: 'Dry Skin', moves: ['splash'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 12', 'team 12');
		battle.makeChoices('move nastyplot, move splash', 'move splash, move splash');
		const [holder, recipient] = battle.p1.active;
		assert.equal(holder.ability, 'memoryleak'); assert.equal(recipient.ability, 'dryskin');
		assert.equal(holder.boosts.spa, 0); assert.equal(recipient.boosts.spa, 2);
		assert(battle.log.some(line => line.includes('|-ability|p1a: Beheeyem|Memory Leak')));
		assert(!battle.log.some(line => line.includes('|-ability|p1b: Toxicroak|Memory Leak')));
	});
	it('attributes external drops to their source and reveals its composite rather than its component', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Mew', ability: 'Lunar Dread', moves: ['splash'] }],
			[{ species: 'Mew', ability: 'Synchronize', moves: ['splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1'); const [source, target] = [battle.p1.active[0], battle.p2.active[0]];
		const start = battle.log.length; battle.boost({ atk: -1 }, target, source, battle.dex.abilities.get('pressure'));
		const log = battle.log.slice(start); assert(log.some(line => line.includes('|-ability|p1a: Mew|Lunar Dread')));
		assert(!log.some(line => line.includes('|-ability|p2a:'))); assert.equal(target.ability, 'synchronize');
	});
});
