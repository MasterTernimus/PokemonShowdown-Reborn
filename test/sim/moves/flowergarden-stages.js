'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
function setup(stage, move = 'splash', ability = 'No Ability', foe = 'Mew') {
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
		[{species: 'Mew', ability, moves: [move, 'splash'], evs: {spe: 252}}],
		[{species: foe, ability: 'No Ability', moves: ['splash'], evs: {hp: 252, spd: 252}}],
	]);
	battle.makeChoices('team 1', 'team 1');
	battle.field.startTerrain(`flowergarden${stage}`);
	return [battle.p1.active[0], battle.p2.active[0]];
}
function stage(n) { battle.field.changeTerrain(`flowergarden${n}`, null, null, true); }
describe('Flower Garden stage effects and transitions', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const ability of ['Pollen Bloom', 'Ancient Bloom', 'Toxic Bloom']) {
		it(`${ability} grows once per entry even when it delegates to Pollen Bloom`, () => {
			battle = common.createBattle({formatid: 'gen9flowergarden'}, [
				[{species: 'Mew', ability, moves: ['splash']},
					{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
				[{species: 'Blissey', ability: 'No Ability', moves: ['splash']}],
			]);
			battle.makeChoices('team 12', 'team 1');
			const growthCount = () => battle.log.filter(line => line === '|-message|The garden grew a little!').length;
			assert.equal(battle.field.flowerGardenStage(), 2);
			assert.equal(growthCount(), 1);
			battle.makeChoices('switch 2', 'move splash');
			assert.equal(growthCount(), 1);
			battle.makeChoices('switch 2', 'move splash');
			assert.equal(battle.field.flowerGardenStage(), 3);
			assert.equal(growthCount(), 2);
		});
	}
	function doubles(n, move, ability = 'No Ability') {
		const mon = (moves = ['splash']) => ({species: 'Mew', ability: 'No Ability', moves, evs: {hp: 252}});
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [
			[{...mon([move, 'splash']), ability}, mon()], [mon(), mon()],
		]);
		battle.makeChoices('team 12', 'team 12');
		battle.field.startTerrain(`flowergarden${n}`);
		return battle.p1.active;
	}
	for (const move of ['petalblizzard', 'petaldance', 'secretpower', 'naturepower', 'poisonpowder']) {
		it(`Stage 5 ${move} hits both foes, not the ally`, () => {
			const [user, ally] = doubles(5, move);
			battle.onEvent('Accuracy', battle.format, () => true);
			battle.makeChoices(`move 1${['petalblizzard', 'petaldance'].includes(move) ? '' : ' 1'}, move splash`, 'move splash, move splash');
			assert.equal(ally.hp, ally.maxhp);
			for (const foe of battle.p2.active) {
				assert(move === 'poisonpowder' ? foe.status === 'psn' : foe.hp < foe.maxhp, battle.log.join('\n'));
			}
			if (move === 'secretpower') {
				assert(user.volatiles.lockedmove);
				const pp = user.moveSlots[0].pp;
				battle.makeChoices('move 1, move splash', 'move splash, move splash');
				assert.equal(user.moveSlots[0].pp, pp);
				assert(battle.log.filter(line => line.includes('|move|') && line.includes('|Petal Dance|')).length >= 2);
			}
		});
	}
	for (const n of [2, 3]) {
		it(`Stage ${n} Flower Shield boosts all allies regardless of type`, () => {
			const allies = doubles(n, 'flowershield');
			battle.makeChoices('move 1, move splash', 'move splash, move splash');
			for (const ally of allies) {
				assert.equal(ally.boosts.def, n - 1);
				assert.equal(ally.boosts.spd, n - 1);
			}
			assert.equal(battle.p2.active[0].boosts.def, 0);
		});
	}
	it('Flower Veil protects its holder and every ally only in Stage 3', () => {
		const allies = doubles(3, 'splash', 'Flower Veil');
		const foe = battle.p2.active[0];
		for (const ally of allies) assert.equal(battle.runEvent('ModifyDamage', foe, ally, battle.dex.getActiveMove('tackle'), 100), 75);
		stage(4);
		assert.equal(battle.runEvent('ModifyDamage', foe, allies[0], battle.dex.getActiveMove('tackle'), 100), 100);
	});
	for (const [n, divisor] of [[2, 8], [3, 16], [4, 4], [5, 16]]) {
		it(`Ingrain uses the active Stage ${n} healing immediately`, () => {
			const [user] = setup(n);
			user.addVolatile('ingrain');
			user.hp = 1;
			battle.makeChoices();
			assert.equal(user.hp, 1 + Math.floor(user.baseMaxhp / divisor));
		});
	}
	for (const [n, divisor] of [[3, 6], [4, 4], [5, 3]]) {
		it(`Infestation uses Stage ${n} residual damage`, () => {
			const [user, foe] = setup(n);
			user.activeTurns = 1;
			foe.addVolatile('partiallytrapped', user, battle.dex.getActiveMove('infestation'));
			battle.makeChoices();
			assert.equal(foe.maxhp - foe.hp, Math.floor(foe.baseMaxhp / divisor));
		});
	}
	it('Stage 3 Floral Healing restores the full HP bar', () => {
		const [, foe] = setup(3, 'floralhealing');
		foe.hp = 1;
		battle.makeChoices();
		assert.equal(foe.hp, foe.maxhp);
	});
	it('a failed attack does not cut the garden', () => {
		setup(4, 'cut');
		battle.onEvent('Accuracy', battle.format, () => 0);
		battle.makeChoices();
		assert.equal(battle.field.flowerGardenStage(), 4);
	});
	it('Drizzle entry extinguishes and grows the remaining garden exactly once', () => {
		battle = common.createBattle({formatid: 'gen9flowergarden'}, [
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']},
				{species: 'Mew', ability: 'Drizzle', moves: ['splash']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.makeChoices('team 12', 'team 1');
		assert.equal(battle.field.terrainStack.length, 1);
		stage(4);
		battle.field.flowerGardenAfterMove(battle.p1.active[0], battle.dex.getActiveMove('incinerate'));
		battle.field.terrainState.gardenBurnTurns = 1;
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(battle.field.terrain, 'flowergarden4');
		assert.equal(battle.field.terrainStack.length, 1);
	});
	it('Rage Powder retains its existing targeting and redirection behavior', () => {
		const [user, foe] = setup(5);
		const move = battle.dex.getActiveMove('ragepowder');
		const originalTarget = move.target;
		battle.runEvent('ModifyMove', user, foe, move, move);
		assert.equal(move.target, originalTarget);
	});
	for (const n of [1, 2, 3, 4, 5]) {
		it(`uses explicit damage multipliers at Stage ${n}`, () => {
			const [user, foe] = setup(n);
			for (const [move, factor] of [['energyball', [1, 1.1, 1.3, 1.5, 2][n - 1]],
				['bugbuzz', [1, 1, 1.5, 2, 2][n - 1]], ['flamethrower', n >= 3 ? 1.5 : 1],
				['fleurcannon', n >= 4 ? 1.5 : n === 3 ? 1.2 : 1]]) {
				assert.equal(battle.runEvent('BasePower', user, foe, battle.dex.getActiveMove(move), 1000), Math.round(1000 * factor));
			}
		});
		it(`Cut lowers Stage ${n} once and uses the replacement Grass modifier`, () => {
			const [user, foe] = setup(n, 'cut', 'No Ability', 'Tangrowth');
			assert.equal(battle.runEvent('BasePower', user, foe, battle.dex.getActiveMove('cut'), 100), n === 1 ? 100 : 200);
			battle.onEvent('Accuracy', battle.format, () => true);
			battle.makeChoices();
			assert.equal(battle.field.flowerGardenStage(), Math.max(1, n - 1));
		});
	}
	for (const move of ['growth', 'flowershield', 'raindance', 'sunnyday', 'rototiller', 'ingrain', 'grassyterrain', 'watersport']) {
		it(`${move} grows exactly one stage after succeeding`, () => {
			setup(2, move, 'No Ability', 'Tangrowth');
			battle.makeChoices();
			assert.equal(battle.field.flowerGardenStage(), 3);
		});
	}
	it('Ripen doubles only the triggering Pokemon growth at Stages 1-3 and caps at 5', () => {
		const [user, foe] = setup(3, 'growth', 'Ripen');
		battle.field.growFlowerGarden(foe, foe.getAbility());
		assert.equal(battle.field.flowerGardenStage(), 4);
		stage(3);
		battle.makeChoices();
		assert.equal(battle.field.flowerGardenStage(), 5);
	});
	it('X-Scissor cuts, Breaking Swipe does not, Acid Downpour resets', () => {
		const [user] = setup(5, 'xscissor');
		battle.makeChoices();
		assert.equal(battle.field.flowerGardenStage(), 4);
		battle.field.flowerGardenAfterMove(user, battle.dex.getActiveMove('breakingswipe'));
		assert.equal(battle.field.flowerGardenStage(), 4);
		battle.field.flowerGardenAfterMove(user, battle.dex.getActiveMove('aciddownpour'));
		assert.equal(battle.field.flowerGardenStage(), 1);
	});
	for (const ability of ['Drizzle', 'Drought', 'Flower Gift', 'Flower Veil', 'Orichalcum Pulse', 'Mega Sol',
		'Grassy Surge', 'Forest Surge', 'Seed Sower', 'Pollen Bloom', 'Toxic Bloom', 'Ancient Bloom']) {
		it(`${ability} grows on entry without replacing the field`, () => {
			battle = common.createBattle({formatid: 'gen9flowergarden'}, [
				[{species: 'Mew', ability, moves: ['splash']}],
				[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
			]);
			battle.makeChoices('team 1', 'team 1');
			assert.equal(battle.field.terrain, 'flowergarden2');
		});
	}
	it('Stage 2 Leaf Guard blocks status, and Harvest always restores a berry', () => {
		const [user] = setup(2, 'splash', 'Leaf Guard');
		assert.equal(user.trySetStatus('psn'), false);
		user.setAbility('harvest');
		user.lastItem = 'oranberry';
		battle.randomChance = () => false;
		battle.makeChoices();
		assert.equal(user.item, 'oranberry');
	});
	it('Overgrow thresholds and multipliers change with the stage', () => {
		const [user, foe] = setup(2, 'splash', 'Overgrow');
		const move = battle.dex.getActiveMove('energyball');
		const boost = () => battle.runEvent('ModifySpA', user, foe, move, 1000);
		assert.equal(boost(), 1000);
		user.hp = Math.floor(user.maxhp * 2 / 3);
		assert.equal(boost(), 1500);
		user.hp = user.maxhp;
		stage(4); assert.equal(boost(), 1800);
		stage(5); assert.equal(boost(), 2000);
		stage(3); assert.equal(boost(), 1000);
	});
	it('Grass weakness cancellation leaves the other type intact', () => {
		const [user, foe] = setup(4, 'splash', 'No Ability', 'Ferrothorn');
		assert.equal(foe.runEffectiveness(battle.dex.getActiveMove('flamethrower')), 1);
		stage(3);
		assert.equal(foe.runEffectiveness(battle.dex.getActiveMove('flamethrower')), 2);
	});
	it('Chlorophyll is Stage 4 only and Glide priority is Stage 4-5', () => {
		const [user, foe] = setup(4, 'splash', 'Chlorophyll');
		assert.equal(user.getStat('spe'), user.storedStats.spe * 2);
		assert.equal(battle.runEvent('ModifyPriority', user, foe, battle.dex.getActiveMove('grassyglide'), 0), 1);
		stage(5);
		assert.equal(user.getStat('spe'), user.storedStats.spe);
	});
	it('Sweet Scent lowers all three stats by one at Stage 3', () => {
		const [, foe] = setup(3, 'sweetscent');
		battle.makeChoices();
		assert.equal(foe.boosts.evasion, -1);
		assert.equal(foe.boosts.def, -1);
		assert.equal(foe.boosts.spd, -1);
	});
	for (const n of [3, 4, 5]) {
		it(`Lingering Aroma and Syrup use the Stage ${n} effects`, () => {
			const [user, foe] = setup(n, 'splash', 'Lingering Aroma');
			battle.makeChoices();
			assert.equal(foe.boosts.def + foe.boosts.spd + foe.boosts.spe, -1);
			foe.clearBoosts();
			user.setAbility('supersweetsyrup');
			assert.equal(foe.boosts.evasion, -1);
			assert.equal(foe.boosts.def, -1);
			assert.equal(foe.boosts.spa, n >= 4 ? -1 : 0);
			assert.equal(foe.boosts.accuracy, n === 5 ? -1 : 0);
		});
	}
	it('burns for completed turns, remains locked, and returns to Stage 1 as ash', () => {
		const [user] = setup(3, 'incinerate');
		battle.makeChoices();
		assert.equal(battle.field.terrain, 'burningterrain');
		assert.equal(battle.field.terrainState.gardenBurnTurns, 1);
		assert.equal(battle.field.setTerrain('electricterrain', user), false);
		assert.equal(battle.field.changeTerrain('forestterrain', user), false);
		battle.makeChoices('move splash', 'move splash');
		assert.equal(battle.field.terrain, 'flowergarden1');
		assert(battle.log.includes('|-message|The garden was burned to ash'));
	});
	it('same-turn dousing restores the original stage and Water Spout also grows it', () => {
		const [user] = setup(3);
		battle.field.flowerGardenAfterMove(user, battle.dex.getActiveMove('incinerate'));
		battle.field.douseFlowerGarden(user);
		assert.equal(battle.field.terrain, 'flowergarden3');
		battle.field.flowerGardenAfterMove(user, battle.dex.getActiveMove('incinerate'));
		battle.field.flowerGardenAfterMove(user, battle.dex.getActiveMove('waterspout'));
		assert.equal(battle.field.terrain, 'flowergarden4');
	});
	for (const blocker of ['rain', 'watersport', 'stage2']) {
		it(`does not ignite through ${blocker}`, () => {
			const [user] = setup(blocker === 'stage2' ? 2 : 3, 'incinerate');
			if (blocker === 'rain') battle.field.setWeather('raindance', user);
			if (blocker === 'watersport') battle.field.addPseudoWeather('watersport', user);
			battle.makeChoices();
			assert.notEqual(battle.field.terrain, 'burningterrain');
		});
	}
	it('Rain Dance extinguishes and grows the remaining garden', () => {
		const [user] = setup(4, 'raindance');
		battle.field.flowerGardenAfterMove(user, battle.dex.getActiveMove('incinerate'));
		battle.field.terrainState.gardenBurnTurns = 1;
		battle.makeChoices();
		assert.equal(battle.field.terrain, 'flowergarden4');
	});
	for (const [move, item, expected] of [['energyball', 'grassiumz', 'flowergarden4'],
		['sludgebomb', 'poisoniumz', 'flowergarden1'], ['flamethrower', 'firiumz', 'burningterrain']]) {
		it(`handles the actual ${item} Z-Move without generating another terrain`, () => {
			const [user] = setup(3, move);
			user.setItem(item);
			battle.makeChoices('move 1 zmove', 'move splash');
			assert.equal(battle.field.terrain, expected);
		});
	}
});
