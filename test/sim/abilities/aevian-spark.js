'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

const requestedMoves = `Thunder Punch|Absorb|Tackle|Stun Spore|Leech Seed|Bullet Seed|Headbutt|Sucker Punch|Mirror Coat|Fake Out|Spotlight|Wake-Up Shock|Seed Bomb|Zing Zap|Aerial Ace|Assurance|Brick Break|Brutal Swing|Bulk Up|Charm|Cut|Drain Punch|Dream Eater|Eerie Impulse|Electric Terrain|Electro Ball|Electroweb|Endeavor|Energy Ball|Flash|Fling|Focus Energy|Giga Drain|Giga Impact|Grass Knot|Grassy Glide|Grassy Terrain|Hone Claws|Hyper Beam|Infestation|Iron Head|Knock Off|Laser Focus|Magical Leaf|Magnet Rise|Mega Punch|Metronome|Nature Power|Payback|Poison Jab|Pollen Puff|Power Whip|Power-Up Punch|Rain Dance|Reversal|Rock Slide|Rock Smash|Rock Tomb|Shadow Claw|Shock Wave|Skitter Smack|Smack Down|Solar Beam|Solar Blade|Strength|Sunny Day|Swords Dance|Synthesis|Taunt|Thief|Throat Chop|Thunder|Thunder Wave|Thunderbolt|Volt Switch|Wild Charge|Work Up|Worry Seed|Zap Cannon|Zen Headbutt`.split('|').map(name => Dex.toID(name));

let battle;
describe('Breloom-Rejuv, Aevian Spark, and Wake-Up Shock', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('keeps Breloom stats, gives both forms each requested move once, and uses the same stone', () => {
		const base = Dex.species.get('Breloom');
		const rejuv = Dex.species.get('Breloom-Rejuv');
		assert.deepEqual(rejuv.types, ['Grass', 'Electric']);
		assert.deepEqual(rejuv.baseStats, base.baseStats);
		assert.equal(base.abilities.S, 'Aevian Spark');
		assert.deepEqual(rejuv.abilities, {0: 'Aevian Spark'});
		assert.equal(rejuv.requiredAbility, 'Aevian Spark');
		assert.equal(Dex.items.get('Breloomite').megaStone['Breloom-Rejuv'], 'Breloom-Mega');
		assert.equal(new Set(requestedMoves).size, requestedMoves.length, 'Requested list contains duplicate IDs');
		for (const species of ['breloom', 'breloomrejuv']) {
			const learnset = Dex.species.getLearnsetData(species).learnset;
			for (const move of requestedMoves) assert(learnset[move]?.length, `${species} lacks ${move}`);
		}
	});

	it('transforms on entry and can Mega Evolve with Breloomite', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Breloom', ability: 'Aevian Spark', item: 'Breloomite', moves: ['splash']},
		], [{species: 'Mew', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		const breloom = battle.p1.active[0];
		assert.equal(breloom.species.id, 'breloomrejuv');
		assert.equal(breloom.canMegaEvo, 'Breloom-Mega');
		for (const component of ['toughclaws', 'technician', 'static']) assert(breloom.hasAbility(component));
		battle.makeChoices('move splash mega', 'move splash');
		assert.equal(breloom.species.id, 'breloommega');
	});

	it('applies Tough Claws, Technician, and Static', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Breloom', ability: 'Aevian Spark', moves: ['splash']},
		], [{species: 'Mew', moves: ['tackle']}]]);
		battle.makeChoices('team 1', 'team 1');
		const breloom = battle.p1.active[0];
		const foe = battle.p2.active[0];
		assert.equal(battle.runEvent('BasePower', breloom, foe, battle.dex.getActiveMove('tackle'), 40), 78);
		assert.equal(battle.runEvent('BasePower', breloom, foe, battle.dex.getActiveMove('absorb'), 20), 30);
		battle.randomChance = () => true;
		battle.makeChoices('move splash', 'move tackle');
		assert.equal(foe.status, 'par');
	});

	it('doubles Wake-Up Shock against sleep and wakes the target without paralysis', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Breloom', ability: 'Aevian Spark', moves: ['wakeupshock']},
		], [{species: 'Aggron', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		const user = battle.p1.active[0];
		const target = battle.p2.active[0];
		const move = battle.dex.moves.get('wakeupshock');
		assert.equal(move.target, 'adjacentFoe');
		assert.equal(move.basePower, 80);
		assert.equal(move.pp, 10);
		assert.equal(move.accuracy, 100);
		assert.equal(move.basePowerCallback.call(battle, user, target, move), 80);
		target.setStatus('slp');
		assert.equal(move.basePowerCallback.call(battle, user, target, move), 160);
		battle.makeChoices('move wakeupshock', 'move splash');
		assert.equal(target.status, '', battle.log.join('\n'));
	});

	it('can paralyze an awake target on a successful hit', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Breloom', ability: 'Aevian Spark', moves: ['wakeupshock']},
		], [{species: 'Aggron', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		battle.randomChance = () => true;
		battle.makeChoices('move wakeupshock', 'move splash');
		assert.equal(battle.p2.active[0].status, 'par');
	});
});
