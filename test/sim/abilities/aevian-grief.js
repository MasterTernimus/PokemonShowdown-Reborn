'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

const requestedMoves = `Astonish|Miracle Eye|Hypnosis|Fairy Wind|Tailwind|Whirlwind|Night Shade|Draining Kiss|Lucky Chant|Safeguard|Ominous Wind|Nightmare|Mind Reader|Hex|Dream Eater|Mystical Fire|Cosmic Power|Moonblast|Ancient Power|Curse|Future Sight|Psychic|Psychoshift|Roost|Stored Power|Aerial Ace|Air Slash|Ally Switch|Aura Sphere|Calm Mind|Charge Beam|Dark Pulse|Dazzling Gleam|Defog|Dual Wingbeat|Energy Ball|Fire Spin|Flamethrower|Flash|Fly|Giga Impact|Gravity|Guard Swap|Heat Wave|Hyper Beam|Icy Wind|Incinerate|Light Screen|Magic Coat|Magic Room|Misty Explosion|Misty Terrain|Pain Split|Phantom Force|Poltergeist|Power Swap|Reflect|Shadow Ball|Shadow Claw|Shock Wave|Signal Beam|Skill Swap|Solar Beam|Spite|Steel Wing|Thief|Thunder Wave|Trick|Trick Room|Will-O-Wisp|Wonder Room`.split('|').map(name => Dex.toID(name));

let battle;
describe('Sigilyph-Rejuv and Aevian Grief', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('preserves Sigilyph stats and grants the complete regional move list to both forms', () => {
		const base = Dex.species.get('Sigilyph');
		const rejuv = Dex.species.get('Sigilyph-Rejuv');
		assert.deepEqual(rejuv.types, ['Ghost', 'Fairy']);
		assert.deepEqual(rejuv.baseStats, base.baseStats);
		assert.equal(base.abilities.S, 'Aevian Grief');
		assert.deepEqual(rejuv.abilities, {0: 'Aevian Grief'});
		assert.equal(rejuv.requiredAbility, 'Aevian Grief');
		assert.equal(new Set(requestedMoves).size, requestedMoves.length);
		for (const species of ['sigilyph', 'sigilyphrejuv']) {
			const learnset = Dex.species.getLearnsetData(species).learnset;
			for (const move of requestedMoves) assert(learnset[move]?.length, `${species} lacks ${move}`);
		}
	});

	it('transforms on entry and provides Flare Boost, Wonder Skin, and Levitate', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Sigilyph', ability: 'Aevian Grief', moves: ['splash']},
		], [{species: 'Mew', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		const sigilyph = battle.p1.active[0];
		const foe = battle.p2.active[0];
		assert.equal(sigilyph.species.id, 'sigilyphrejuv');
		for (const component of ['flareboost', 'wonderskin', 'levitate']) {
			assert(sigilyph.hasAbility(component), component);
		}
		assert.equal(sigilyph.runImmunity('Ground'), false);
		assert.equal(battle.runEvent('ModifyAccuracy', sigilyph, foe, battle.dex.getActiveMove('thunderwave'), 90), 50);
		assert.equal(battle.runEvent('BasePower', sigilyph, foe, battle.dex.getActiveMove('flamethrower'), 100), 150);
		sigilyph.setStatus('brn');
		assert.equal(battle.runEvent('BasePower', sigilyph, foe, battle.dex.getActiveMove('shadowball'), 100), 150);
		assert.equal(battle.runEvent('BasePower', sigilyph, foe, battle.dex.getActiveMove('shadowclaw'), 100), 100);
	});
});
