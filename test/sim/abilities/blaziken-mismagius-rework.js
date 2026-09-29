'use strict';
const assert = require('../../assert');
const common = require('../../common');

let battle;
describe('Blazing Tempo, Hex Bound, and Shadow Tag rework', () => {
	afterEach(() => battle?.destroy());

	it('gives Mega Blaziken every Blazing Tempo component', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Blaziken-Mega', ability: 'Blazing Tempo', moves: ['highjumpkick', 'splash']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		const mon = battle.p1.active[0], foe = battle.p2.active[0];
		for (const part of ['proficient', 'speedboost', 'striker', 'magmaarmor', 'keeneye']) {
			assert(mon.hasAbility(part), `Missing ${part}`);
		}
		assert.equal(battle.runEvent('BasePower', mon, foe, battle.dex.getActiveMove('highjumpkick'), 100), 182);
		assert.equal(battle.runEvent('SourceModifyAtk', mon, foe, battle.dex.getActiveMove('waterfall'), 100), 50);
		assert.equal(mon.trySetStatus('frz', foe), false);
		const move = battle.dex.getActiveMove('tackle');
		battle.singleEvent('ModifyMove', mon.getAbility(), mon.abilityState, move, mon, foe);
		assert.equal(move.ignoreEvasion, true);
		battle.boost({accuracy: -1}, mon, foe);
		assert.equal(mon.boosts.accuracy, 0);
		battle.makeChoices('move splash', 'move splash');
		assert.equal(mon.boosts.spe, 1);
	});

	it('gives Mismagius Hex Bound trapping and Prankster without summoning Haunted Field', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Mismagius', ability: 'Hex Bound', moves: ['splash']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}, {species: 'Ditto', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		const mon = battle.p1.active[0], foe = battle.p2.active[0];
		assert.equal(mon.species.abilities[0], 'Void Veil');
		assert.equal(mon.species.abilities.H, 'Hex Bound');
		assert(mon.hasAbility('shadowtag'));
		assert(mon.hasAbility('prankster'));
		assert.equal(battle.runEvent('ModifyPriority', mon, foe, battle.dex.getActiveMove('willowisp'), 0), 1);
		assert.equal(battle.runEvent('SourceModifyDamage', mon, foe, battle.dex.getActiveMove('tackle'), 100), 75);
		assert.trapped(() => battle.makeChoices('move splash', 'switch 2'), true);
		mon.faint();
		battle.faintMessages();
		assert.equal(battle.field.terrain, '');
	});

	it('stops standalone Shadow Tag and Cruel Tag from summoning Haunted Field', () => {
		for (const ability of ['Shadow Tag', 'Cruel Tag']) {
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
				[{species: 'Mew', ability, moves: ['splash']}],
				[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
			]);
			battle.makeChoices('team 1', 'team 1');
			battle.p1.active[0].faint();
			battle.faintMessages();
			assert.equal(battle.field.terrain, '', ability);
			battle.destroy();
			battle = null;
		}
	});

	it('replaces Victreebel Accumulation with Arena Trap', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Victreebel', ability: 'Arena Trap', moves: ['splash']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		assert.deepEqual(battle.dex.species.get('Victreebel').abilities, {
			0: 'Chlorophyll', 1: 'Arena Trap', H: 'Gluttony',
		});
	});
});
