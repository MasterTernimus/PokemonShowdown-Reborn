'use strict';

const assert = require('node:assert/strict');
const common = require('../../common');
const { ThematicPassiveIds } = require('../../../dist/data/species-passives');

describe('Ultra Ego combat turns', () => {
	const moves = ['splash', 'protect', 'nightshade', 'doublekick'];
	const partner = { species: 'Mew', ability: 'No Ability', moves };
	let battle;
	afterEach(() => battle.destroy());

	function setup(ability, doubles = false) {
		const user = { ...partner, ability };
		battle = common.createBattle({ gameType: doubles ? 'doubles' : 'singles' }, [
			[user, partner], [partner, partner],
		]);
		for (const side of battle.sides) {
			for (const mon of side.pokemon) mon.hp = mon.maxhp = mon.baseMaxhp = 10000;
		}
		return [battle.p1.active[0], battle.p2.active[0]];
	}

	function stages(mon, expected) {
		assert.equal(mon.boosts.atk, expected);
		assert.equal(mon.boosts.spa, expected);
	}

	for (const ability of ['Ultra Ego', 'Dusk Ego', 'Burning Ego', 'Perfect Ego', 'Terra Ascendant', 'Unleashed Ego']) {
		it(`${ability} advances on the first and every other eligible turn`, () => {
			const [user, foe] = setup(ability);
			battle.actions.useMove('nightshade', user, { target: foe });
			stages(user, 0);
			battle.makeChoices('move doublekick', 'move nightshade');
			stages(user, 1);
			battle.makeChoices('move protect', 'move nightshade');
			stages(user, 1);
			battle.makeChoices('move splash', 'move doublekick');
			stages(user, 1);
			battle.makeChoices('move splash', 'move splash');
			stages(user, 1);
			battle.makeChoices('move nightshade', 'move splash');
			stages(user, 2);
		});
	}

	for (const ability of ['No Ability', 'Ultra Ego']) {
		it(`honors an Ultra Ego passive alongside ${ability} exactly once`, () => {
			const [user] = setup(ability);
			const registered = ThematicPassiveIds.has('ultraego');
			ThematicPassiveIds.add('ultraego');
			try {
				user.getPassives = () => ['ultraego'];
				battle.makeChoices('move nightshade', 'move nightshade');
				stages(user, 1);
				battle.makeChoices('move nightshade', 'move nightshade');
				stages(user, 1);
				battle.makeChoices('move nightshade', 'move nightshade');
				stages(user, 2);
			} finally {
				if (!registered) ThematicPassiveIds.delete('ultraego');
			}
		});
	}

	it('ignores damage to or from allies, substitute damage and indirect HP loss', () => {
		const [user, foe] = setup('Ultra Ego', true);
		battle.makeChoices('move nightshade -2, move nightshade -1', 'move splash, move splash');
		stages(user, 0);
		foe.addVolatile('substitute');
		user.setStatus('psn');
		const hp = user.hp;
		battle.makeChoices('move nightshade 1, move splash', 'move splash, move splash');
		assert(user.hp < hp);
		assert(foe.volatiles.substitute);
		stages(user, 0);
	});

	it('resets cadence on switching and counts a knockout of an opposing Pokémon', () => {
		const [user, foe] = setup('Ultra Ego');
		battle.makeChoices('move nightshade', 'move splash');
		stages(user, 1);
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		stages(user, 0);
		foe.hp = 1;
		battle.makeChoices('move nightshade', 'move splash');
		assert(foe.fainted);
		stages(user, 1);
	});

	it('drops an unsettled turn when its user switches out', () => {
		const [user, foe] = setup('Ultra Ego');
		battle.actions.useMove('nightshade', user, { target: foe });
		battle.makeChoices('switch 2', 'move splash');
		stages(user, 0);
		stages(battle.p1.active[0], 0);
		battle.makeChoices('switch 2', 'move splash');
		stages(user, 0);
		battle.makeChoices('move nightshade', 'move splash');
		stages(user, 1);
	});

	it('does not pay out after the user loses its ability before turn end', () => {
		const [user, foe] = setup('Ultra Ego');
		battle.actions.useMove('nightshade', user, { target: foe });
		user.setAbility('No Ability');
		battle.makeChoices('move splash', 'move splash');
		stages(user, 0);
	});

	for (const field of ['holyterrain', 'hauntedterrain', 'bewitchedwoodsterrain']) {
		it(`damage in ${field} does not advance the cadence`, () => {
			const [user] = setup('Ultra Ego');
			battle.field.terrain = field;
			battle.makeChoices('move nightshade', 'move nightshade');
			stages(user, 0);
			battle.field.terrain = '';
			battle.makeChoices('move nightshade', 'move splash');
			stages(user, 1);
		});
	}
});
