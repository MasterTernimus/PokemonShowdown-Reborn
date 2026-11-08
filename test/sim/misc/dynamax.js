'use strict';
const assert = require('./../../assert');
const common = require('./../../common');
let battle;

// Reborn supports persistent G-Max species, not ordinary three-turn Dynamax.
// Keep the upstream hacked-Max protections below, but exercise legal local forms here.
describe('Reborn G-Max battle flow', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(species = 'Charizard', moves = ['ember', 'watergun', 'splash', 'protect'], item = '') {
		battle = common.createBattle({ formatid: 'gen9mistyfieldadrienn' }, [[
			{ species, ability: 'No Ability', gigantamax: true, item, moves },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		], [
			{ species: 'Mew', ability: 'No Ability', moves: ['splash', 'taunt', 'watergun'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		]]);
		battle.makeChoices('team 12', 'team 12');
		const p = battle.p1.active[0], q = battle.p2.active[0];
		q.hp = q.maxhp = q.baseMaxhp = 5000;
		return [p, q];
	}
	it('does not offer ordinary Dynamax to species without a G-Max form', () => {
		const [p] = setup('Mew');
		assert(!p.canGigantamax);
		assert(!p.getDynamaxRequest());
		assert(!p.getMoveRequestData().canDynamax);
	});
	it('converts only signature-compatible attacks and keeps other moves ordinary', () => {
		const [p] = setup(); const r = p.getDynamaxRequest();
		assert.deepEqual(r.maxMoves.map(m => m.move), ['gmaxwildfire', 'watergun', 'splash', 'protect']);
		assert.equal(r.maxMoves[3].disabled, true);
		battle.makeChoices('move watergun dynamax', 'move splash');
		assert.equal(p.species.id, 'charizardgmax');
		assert(battle.log.some(l => l.startsWith('|move|p1a:') && l.includes('|Water Gun|')));
		assert(!battle.log.some(l => l.includes('|Max Geyser|')));
	});
	it('keeps a signature side effect when the G-Max user has Sheer Force', () => {
		const [p] = setup(); battle.makeChoices('move splash dynamax', 'move splash'); p.setAbility('Sheer Force');
		battle.makeChoices('move ember', 'move splash');
		assert(battle.p2.sideConditions.gmaxwildfire);
	});
	it('starts the signature side effect even when the target faints', () => {
		const [p, q] = setup(); q.hp = 1;
		battle.makeChoices('move ember dynamax', 'move splash');
		assert.equal(q.hp, 0); assert(battle.p2.sideConditions.gmaxwildfire);
	});
	it('retains Sand Spit when an ordinary Water move hits during G-Max', () => {
		const [p, q] = setup(); q.setAbility('Sand Spit');
		battle.makeChoices('move watergun dynamax', 'move splash');
		assert.equal(battle.field.weather, 'sandstorm');
		assert(!battle.log.some(l => l.includes('|Max Geyser|')));
	});
	it('retains Liquid Voice on an ordinary sound move during G-Max', () => {
		const [p, q] = setup('Charizard', ['ember', 'hypervoice', 'splash']);
		battle.makeChoices('move splash dynamax', 'move splash');
		p.setAbility('Liquid Voice');
		q.setAbility('Water Absorb');
		q.hp = 1000;
		battle.makeChoices('move hypervoice', 'move splash');
		assert.equal(q.hp, 2250);
	});
	it('retains the G-Max form after turn three and after switching', () => {
		const [p] = setup(); battle.makeChoices('move splash dynamax', 'move splash');
		for (let i = 0; i < 3; i++)battle.makeChoices('move splash', 'move splash');
		assert.equal(p.species.id, 'charizardgmax'); assert(p.volatiles.dynamax);
		battle.makeChoices('switch 2', 'move splash'); battle.makeChoices('switch 2', 'move splash');
		assert.equal(battle.p1.active[0], p); assert.equal(p.species.id, 'charizardgmax');
	});
	it('orders simultaneous G-Max transformations using Speed after a weather-changing switch', () => {
		const set = (species, ability) => ({ species, ability, gigantamax: true, moves: ['splash'] });
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [[
			set('Blastoise', 'Swift Swim'), set('Mew', 'No Ability'), set('Groudon', 'Drought'),
		], [set('Charizard', 'Drizzle'), set('Mew', 'No Ability')]]);
		battle.makeChoices('team 123', 'team 12');
		assert.equal(battle.field.weather, 'raindance');
		assert(battle.p1.active[0].getStat('spe') > battle.p2.active[0].getStat('spe'));
		battle.makeChoices('move splash dynamax, switch 3', 'move splash dynamax, move splash');
		const first = battle.log.findIndex(l => l.startsWith('|detailschange|p2a:') && l.includes('Charizard-Gmax'));
		const second = battle.log.findIndex(l => l.startsWith('|detailschange|p1a:') && l.includes('Blastoise-Gmax'));
		assert(first >= 0 && second > first, battle.log.join('\n'));
	});
	it('keeps Assault Vest and Protect restrictions on unconverted status moves', () => {
		const [p] = setup('Charizard', ['ember', 'splash', 'protect'], 'Assault Vest');
		const r = p.getDynamaxRequest(); assert(!r.maxMoves[0].disabled);
		assert.equal(r.maxMoves[1].disabled, true); assert.equal(r.maxMoves[2].disabled, true);
	});
	it('rejects an exhausted signature move and uses Struggle when every slot is exhausted', () => {
		const [p] = setup('Charizard', ['ember', 'splash']); battle.makeChoices('move splash dynamax', 'move splash');
		p.moveSlots[0].pp = 0;
		assert.equal(p.getMoveRequestData().maxMoves.maxMoves[0].disabled, true);
		assert.cantMove(() => battle.p1.chooseMove('ember'));
		p.moveSlots[1].pp = 0;
		const r = p.getMoveRequestData();
		assert.equal(r.moves[0].id, 'struggle');
		assert(!r.maxMoves);
	});
	it('uses Struggle when Taunt disables its only remaining ordinary status move', () => {
		const [p, q] = setup('Charizard', ['splash']); battle.makeChoices('move splash dynamax', 'move splash');
		p.addVolatile('taunt', q); const r = p.getMoveRequestData();
		assert.equal(r.moves[0].id, 'struggle'); assert(!r.maxMoves);
	});

	it.skip(`should not remove the variable to Dynamax on forced switches`, function () {
		battle = common.gen(8).createBattle([[
			{species: 'wynaut', item: 'ejectpack', moves: ['ironhead']},
			{species: 'audino', item: 'ejectpack', moves: ['sleeptalk']},
		], [
			{species: 'vikavolt', moves: ['stickyweb']},
			{species: 'incineroar', ability: 'intimidate', moves: ['sleeptalk']},
		]]);
		battle.makeChoices();
		battle.makeChoices('move ironhead dynamax', 'switch 2');
		battle.makeChoices('switch 2'); // Eject Pack to Audino
		battle.makeChoices('switch 2'); // Eject Pack back to Wynaut, to Dynamax
		const wynaut = battle.p1.active[0];
		assert.statStage(wynaut, 'def', 0, 'Wynaut should not have used Max Steelspike this turn.');
		assert(wynaut.volatiles['dynamax'], 'Wynaut should be currently Dynamaxed.');
	});

	describe(`Hacked Max Moves`, function () {
		it(`should not activate Max Move side effects when used without Dynamaxing`, function () {
			battle = common.gen(8).createBattle([[
				{species: 'wynaut', moves: ['maxflare', 'maxairstream']},
			], [
				{species: 'shuckle', moves: ['sleeptalk']},
			]]);
			battle.makeChoices('move maxflare', 'auto');
			assert.equal(battle.field.weather, '');

			battle.makeChoices('move maxairstream', 'auto');
			assert.statStage(battle.p1.active[0], 'spe', 0);
		});

		it(`should treat Max Moves as 0 BP when used without Dynamaxing`, function () {
			battle = common.gen(8).createBattle([[
				{species: 'wynaut', moves: ['maxflare', 'maxairstream']},
			], [
				{species: 'shuckle', ability: 'shellarmor', moves: ['sleeptalk']},
			]]);
			battle.makeChoices('move maxflare', 'auto');
			battle.makeChoices('move maxairstream', 'auto');

			const shuckle = battle.p2.active[0];
			assert.bounded(shuckle.maxhp - shuckle.hp, [2, 4], `0 BP should cause the move's damage to only be 2 after base damage calculation, resulting in 1-2 final damage for each Max Move.`);
		});

		it(`should treat Max Moves as physical moves when used without Dynamaxing`, function () {
			battle = common.gen(8).createBattle([[
				{species: 'wynaut', moves: ['maxflare']},
			], [
				{species: 'shuckle', item: 'keeberry', moves: ['sleeptalk']},
			]]);
			battle.makeChoices();
			assert.statStage(battle.p2.active[0], 'def', 1);
		});

		it(`should prevent effects that affect regular Max Moves, like Sleep Talk and Instruct`, function () {
			battle = common.gen(8).createBattle([[
				{species: 'wynaut', moves: ['maxflare', 'sleeptalk']},
			], [
				{species: 'shuckle', moves: ['instruct', 'spore', 'roost']},
			]]);
			battle.makeChoices();
			const wynaut = battle.p1.active[0];
			const move = wynaut.getMoveData(Dex.moves.get('maxflare'));
			assert.equal(move.pp, move.maxpp - 1, `Max Flare should only have been used once.`);

			battle.makeChoices('auto', 'move roost');
			battle.makeChoices('move sleeptalk', 'move spore');
			battle.makeChoices('move sleeptalk', 'move spore');
			const shuckle = battle.p2.active[0];
			assert.fullHP(shuckle, `Sleep Talk should have failed in calling a move and so not dealt damage.`);
		});
	});
});
