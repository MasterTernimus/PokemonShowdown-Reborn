'use strict';

const assert = require('../../assert');
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

let battle;
describe('Requested ability changes', () => {
	afterEach(() => battle?.destroy());

	it('updates the affected roster slots and ability names', () => {
		for (const [species, slot, expected] of [
			['Blastoise', 'H', 'Stamina'],
			['Butterfree-Gmax', '0', 'Mythic Scale'],
			['Golem', '0', 'Wrecking Ball'],
			['Weezing', 'H', 'Flare Boost'],
			['Seaking', '1', 'Swift Drill'],
			['Tauros', 'H', 'Brute Force'],
			['Tauros-Paldea-Combat', 'H', 'Ultra Ego'],
			['Tauros-Paldea-Blaze', 'H', 'Fire Mane'],
			['Typhlosion-Hisui', 'H', 'Supreme Overlord'],
			['Politoed', '0', 'Zen'],
			['Politoed', 'H', 'Storm Song'],
			['Espeon', '1', 'Astral Ward'],
			['Espeon', 'H', 'Psychic Surge'],
			['Umbreon', '1', 'Moonlight Vigil'],
			['Umbreon', 'H', 'Dark Aura'],
			['Octillery', '0', 'Mega Launcher'],
			['Scizor-Mega', '0', 'Iron Vise'],
			['Floatzel', '1', 'Life Guard'],
		]) {
			assert.equal(Dex.species.get(species).abilities[slot], expected, `${species} ${slot}`);
		}
	});

	it('keeps regional ability transformations while changing their components', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Breloom', ability: 'Aevian Spark', moves: ['splash']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		const mon = battle.p1.active[0];
		assert.equal(mon.species.id, 'breloomrejuv');
		assert(mon.hasAbility('earlybird'));
		assert(!mon.hasAbility('toughclaws'));
	});

	it('lets Safe Harbor absorb Water but not Ice', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Mew', ability: 'Safe Harbor', moves: ['splash']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['watergun', 'icebeam']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		const mon = battle.p1.active[0];
		battle.makeChoices('move splash', 'move watergun');
		assert.equal(mon.hp, mon.maxhp);
		battle.makeChoices('move splash', 'move icebeam');
		assert(mon.hp < mon.maxhp);
	});

	it('lets Astral Ward protect Espeon from an ally spread attack', () => {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [
			[{species: 'Espeon', ability: 'Astral Ward', moves: ['splash']}, {species: 'Mew', ability: 'No Ability', moves: ['surf']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}, {species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.makeChoices('team 12', 'team 12');
		const holder = battle.p1.active[0];
		battle.makeChoices('move splash, move surf', 'move splash, move splash');
		assert.equal(holder.hp, holder.maxhp);
		assert(battle.p2.active.some(foe => foe.hp < foe.maxhp));
	});

	it('redirects Electric moves with Railgun Circuit’s Lightning Rod', () => {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [
			[{species: 'Mew', ability: 'Railgun Circuit', moves: ['splash']}, {species: 'Mew', ability: 'No Ability', moves: ['splash']}],
			[{species: 'Pikachu', ability: 'No Ability', moves: ['thunderbolt']}, {species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.makeChoices('team 12', 'team 12');
		const holder = battle.p1.active[0], ally = battle.p1.active[1];
		battle.makeChoices('move splash, move splash', 'move thunderbolt 2, move splash');
		assert.equal(ally.hp, ally.maxhp);
		assert.equal(holder.boosts.atk, 1);
		assert.equal(holder.boosts.spa, 1);
	});

	it('gives Mythic Scale Ground immunity without poison confusion', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Mew', ability: 'Mythic Scale', moves: ['toxic']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		const holder = battle.p1.active[0], foe = battle.p2.active[0];
		assert.equal(holder.runImmunity('Ground'), false);
		battle.makeChoices('move toxic', 'move splash');
		assert.equal(foe.status, 'tox');
		assert(!foe.volatiles.confusion);
	});

	it('adds the requested move power components', () => {
		for (const [ability, moveId, expected] of [
			['High Noon', 'waterpulse', 180],
			['Freezer Burn', 'icefang', 150],
			['Paradox Engine', 'brickbreak', 130],
		]) {
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
				[{species: 'Mew', ability, moves: [moveId]}],
				[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
			]);
			battle.makeChoices('team 1', 'team 1');
			const holder = battle.p1.active[0], foe = battle.p2.active[0];
			assert.equal(battle.runEvent('BasePower', holder, foe, battle.dex.getActiveMove(moveId), 100), expected, ability);
			battle.destroy();
			battle = null;
		}
	});

	it('sets changeable Strong Winds without Windy Surge', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Mew', ability: 'Storm Sovereign', moves: ['splash']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['raindance']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		assert.equal(battle.field.weather, 'deltastream');
		assert(!battle.p1.getSideCondition('tailwind'));
		battle.makeChoices('move splash', 'move raindance');
		assert.equal(battle.field.weather, 'raindance');
	});

	it('gives Wrecking Ball Sturdy and Crumbling Shell', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Golem', ability: 'Wrecking Ball', moves: ['splash']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['closecombat']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		const mon = battle.p1.active[0];
		assert(mon.hasAbility('sturdy'));
		assert(mon.hasAbility('selfsufficient'));
		assert(mon.hasAbility('crumblingshell'));
		battle.makeChoices('move splash', 'move closecombat');
		assert(mon.hp > 0);
		assert(battle.p2.getSideCondition('stealthrock'));
	});

	it('does not save Battle Bond users from lethal damage', () => {
		battle = common.createBattle({formatid: 'gen9doublescustomgame'}, [
			[{species: 'Greninja', ability: 'Battle Bond', moves: ['splash']}, {species: 'Mew', ability: 'No Ability', moves: ['splash']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}, {species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		const mon = battle.p1.active[0];
		assert.equal(battle.runEvent('Damage', mon, battle.p2.active[0], battle.dex.getActiveMove('tackle'), mon.hp), mon.hp);
	});

	it('reduces damage to an Arena Trap holder from a trapped grounded foe', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Victreebel', ability: 'Arena Trap', moves: ['splash']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['tackle']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		const holder = battle.p1.active[0], attacker = battle.p2.active[0];
		assert(attacker.trapped, 'Arena Trap should actually trap this grounded foe');
		const tackle = battle.dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('ModifyDamage', attacker, holder, tackle, 100), 80,
			JSON.stringify({trapped: attacker.trapped, grounded: attacker.isGrounded(), adjacent: attacker.isAdjacent(holder), ability: holder.ability}));
		attacker.trapped = false;
		assert.equal(battle.runEvent('ModifyDamage', attacker, holder, tackle, 100), 100);
	});

	it('makes Long Reach use Super Luck without tripling critical damage', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Decidueye', ability: 'Long Reach', moves: ['tackle']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		const holder = battle.p1.active[0], foe = battle.p2.active[0];
		const tackle = battle.dex.getActiveMove('tackle');
		battle.singleEvent('ModifyMove', holder.getAbility(), holder.abilityState, tackle, holder, foe);
		assert(!tackle.flags.contact);
		assert.equal(tackle.critModifier, undefined);
		assert.equal(battle.runEvent('ModifyCritRatio', holder, foe, tackle, 0), 1);
	});

	it('uses five turns for both Mega domain faint effects', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Tyrantrum-Mega', ability: 'Tyrant Domain', moves: ['splash']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		battle.p1.active[0].faint();
		battle.faintMessages();
		assert.equal(battle.field.terrain, 'dragonsdenterrain');
		assert.equal(battle.field.terrainState.duration, 5);
		battle.destroy();
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Aurorus-Mega', ability: 'Aurora Domain', moves: ['splash']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		const aurorus = battle.p1.active[0];
		assert.equal(aurorus.side.sideConditions.auroraveil, undefined);
		aurorus.faint();
		battle.faintMessages();
		assert.equal(battle.field.terrain, 'fairytaleterrain');
		assert.equal(battle.field.terrainState.duration, 5);
		assert.equal(aurorus.side.sideConditions.auroraveil.duration, 5);
	});
});
