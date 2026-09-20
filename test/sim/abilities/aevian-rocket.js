'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

const requestedMoves = `Aqua Jet|Tackle|Pluck|Flame Charge|Focus Energy|Takedown|Liquidation|Fillet Away|Crunch|Flare Blitz|Wave Crash|Extreme Speed|Explosion|Head Smash|Recover|Agility|Ally Switch|Aqua Tail|Body Slam|Brine|Burning Jealousy|Dive|Double-Edge|Drill Run|Endeavor|Fire Blast|Fire Fang|Fire Spin|Flamethrower|Flash Cannon|Flip Turn|Giga Impact|Gunk Shot|Heat Crash|Heat Wave|Hydro Pump|Hyper Beam|Ice Beam|Ice Fang|Incinerate|Laser Focus|Last Resort|Misty Explosion|Muddy Water|Outrage|Overheat|Pain Split|Payback|Pin Missile|Poison Jab|Psychic Fangs|Rain Dance|Retaliate|Scald|Scale Shot|Self-Destruct|Shadow Ball|Shock Wave|Sucker Punch|Sunny Day|Supercell Slam|Surf|Temper Flare|U-turn|Waterfall|Water Pulse|Whirlpool|Wild Charge|Will-O-Wisp|Work Up|Zen Headbutt`.split('|').map(name => Dex.toID(name));

let battle;
describe('Veluza-Rejuv and Aevian Rocket', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('registers the form, stats, ability, and complete move list', () => {
		const base = Dex.species.get('Veluza');
		const rejuv = Dex.species.get('Veluza-Rejuv');
		assert.deepEqual(rejuv.types, ['Water', 'Fire']);
		assert.deepEqual(rejuv.baseStats, { hp: 90, atk: 102, def: 60, spa: 62, spd: 60, spe: 104 });
		assert.equal(rejuv.bst, 478);
		assert.equal(base.abilities.S, 'Aevian Rocket');
		assert.deepEqual(rejuv.abilities, { 0: 'Aevian Rocket' });
		assert.equal(rejuv.requiredAbility, 'Aevian Rocket');
		assert.equal(new Set(requestedMoves).size, requestedMoves.length);
		for (const species of ['veluza', 'veluzarejuv']) {
			const learnset = Dex.species.getLearnsetData(species).learnset;
			for (const move of requestedMoves) assert(learnset[move]?.length, `${species} lacks ${move}`);
			assert.equal(learnset.terablast, undefined, `${species} should not learn Tera Blast`);
		}
		for (const [species, data] of Object.entries(Dex.data.Learnsets)) {
			assert.equal(data.learnset?.terablast, undefined, `${species} should not learn Tera Blast`);
		}
	});

	it('transforms on entry and applies Brute Force, Mold Breaker, and Swift Swim', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Veluza', ability: 'Aevian Rocket', moves: ['headsmash', 'splash'] },
		], [{ species: 'Mew', moves: ['splash'] }]]);
		battle.makeChoices('team 1', 'team 1');
		const veluza = battle.p1.active[0];
		const foe = battle.p2.active[0];
		assert.equal(veluza.species.id, 'veluzarejuv');
		for (const component of ['bruteforce', 'reckless', 'rockhead', 'regenerator', 'moldbreaker', 'swiftswim']) {
			assert(veluza.hasAbility(component), component);
		}
		assert.equal(battle.runEvent('BasePower', veluza, foe, battle.dex.getActiveMove('headsmash'), 100), 120);
		const move = battle.dex.getActiveMove('aquajet');
		battle.singleEvent('ModifyMove', veluza.getAbility(), veluza.abilityState, move, veluza, foe);
		assert.equal(move.ignoreAbility, true);
		assert.equal(battle.runEvent('ModifySpe', veluza, null, null, 100), 100);
		battle.field.setWeather('raindance');
		assert.equal(battle.runEvent('ModifySpe', veluza, null, null, 100), 200);
	});

	it('prevents recoil and restores HP on switching out', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Veluza', ability: 'Aevian Rocket', moves: ['flareblitz', 'splash'] },
			{ species: 'Mew', moves: ['splash'] },
		], [{ species: 'Toxapex', moves: ['splash'] }]]);
		battle.makeChoices('team 1', 'team 1');
		const veluza = battle.p1.active[0];
		battle.makeChoices('move flareblitz', 'move splash');
		assert.equal(veluza.hp, veluza.maxhp, 'Brute Force did not prevent Flare Blitz recoil');
		veluza.hp = Math.floor(veluza.maxhp / 2);
		const beforeSwitch = veluza.hp;
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(veluza.hp, Math.min(veluza.maxhp, beforeSwitch + Math.floor(veluza.baseMaxhp / 3)));
	});
});
