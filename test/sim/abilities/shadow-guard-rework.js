'use strict';

const assert = require('../../assert');
const common = require('../../common');

let battle;
describe('Voidcraft rework', () => {
	afterEach(() => { battle?.destroy(); battle = null; });

	it('Mega Evolves into the new component ability without trapping or Magic Guard', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Mismagius', ability: 'Void Veil', item: 'Dusk Stone', moves: ['splash'] }],
			[{ species: 'Ho-Oh', ability: 'No Ability', moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		const mega = battle.p1.active[0];
		assert.species(mega, 'Mismagius-Mega');
		assert.deepEqual(mega.getPassives(), ['elevate']);
		assert(mega.hasAbilityOrPassive('elevate'));
		for (const component of ['shadowshield', 'temporalshift']) {
			assert(mega.hasAbility(component), `Missing ${component}`);
		}
		assert(!mega.hasAbility('insomnia'));
		assert(!mega.hasAbility('shadowtag'));
		assert(!mega.hasAbility('magicguard'));
		assert(!mega.isGrounded());
		assert(mega.getAbility().onSourceModifyDamage);
		battle.makeChoices('move splash', 'switch 2');
		assert.species(battle.p2.active[0], 'Mew');
	});

	it('uses ordinary Temporal Shift timing and grants Fairy STAB', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Mismagius', ability: 'Void Veil', item: 'Dusk Stone', moves: ['splash', 'fairywind'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move fairywind mega', 'move splash');
		const holder = battle.p1.active[0], foe = battle.p2.active[0];
		assert(holder.lastMoveUsed.forceSTAB);
		assert(!foe.side.slotConditions[foe.position].futuremove);
		battle.makeChoices('move splash', 'move splash');
		const future = foe.side.slotConditions[foe.position].futuremove;
		assert.equal(future.moveData.type, holder.getTypes()[0]);
		assert.equal(future.moveData.basePower, 100);
	});

	it('keeps Shadow Shield, Temporal Shift stat protection, and permits sleep', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Mismagius-Mega', ability: 'Voidcraft', moves: ['splash'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		const mega = battle.p1.active[0], foe = battle.p2.active[0];
		battle.boost({ spa: -1 }, mega, foe);
		assert.statStage(mega, 'spa', 0);
		assert(mega.trySetStatus('slp', foe));
		const hp = mega.hp;
		battle.damage(mega.baseMaxhp / 8, mega, foe, battle.dex.conditions.get('sandstorm'));
		assert(mega.hp < hp);
	});

	it('also fixes Temporal Shift’s own opposing-stat-drop protection', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Mismagius', ability: 'Temporal Shift', moves: ['splash'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		const mismagius = battle.p1.active[0], foe = battle.p2.active[0];
		battle.boost({ spa: -1 }, mismagius, foe);
		assert.statStage(mismagius, 'spa', 0);
		battle.boost({ spa: -1 }, mismagius, mismagius);
		assert.statStage(mismagius, 'spa', -1);
	});
});
