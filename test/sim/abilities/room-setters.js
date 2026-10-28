'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

describe('Dedicated room setters', () => {
	let battle;
	afterEach(() => battle?.destroy());
	const set = (species, ability = 'No Ability', item = '') => ({species, ability, item, moves: ['splash', 'tackle', 'trickroom', 'skillswap']});
	function setup(species = 'Unown', ability = 'No Ability', item = '') {
		battle = common.createBattle({}, [[set(species, ability, item), set('Magikarp')], [set('Mew')]]);
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	it('assigns the chosen slots and gives Lost Epoch to Unown alone', () => {
		for (const [id, slot, name] of [['lunatone', '1', 'Gravity Well'], ['solrock', '1', 'Gravity Well'],
			['carbink', '0', 'Arcane Chamber'], ['beheeyem', '0', 'Mirror Chamber'], ['unown', '0', 'Lost Epoch']]) {
			assert.equal(Dex.species.get(id).abilities[slot], name);
		}
		assert.deepEqual(Dex.species.all().filter(s => Object.values(s.abilities).includes('Lost Epoch')).map(s => s.name), ['Unown']);
		assert.equal(Object.values(Dex.species.get('Unown').baseStats).reduce((a, b) => a + b), 336);
		assert.equal(Dex.species.get('claydolmega').abilities[0], 'World Axis');
	});
	for (const [species, ability, room] of [['Lunatone', 'gravitywell', 'gravity'], ['Solrock', 'gravitywell', 'gravity'],
		['Carbink', 'arcanechamber', 'magicroom'], ['Beheeyem', 'mirrorchamber', 'wonderroom']]) {
		it(`${species} starts ${room} on entry and preserves an active timer on reactivation`, () => {
			const [p] = setup(species, ability);
			assert.equal(battle.field.pseudoWeather[room].duration, 5);
			assert(battle.log.some(l => l.includes('|-fieldstart|') && l.includes('[turns] 5')));
			battle.field.pseudoWeather[room].duration = 2;
			p.setAbility('No Ability'); p.setAbility(ability);
			assert.equal(battle.field.pseudoWeather[room].duration, 2);
		});
		it(`${species} uses normal duration extensions and can restart after expiry`, () => {
			const [p] = setup(species, 'No Ability', 'Amplifield Rock'); p.setAbility(ability); p.baseAbility = p.ability;
			assert.equal(battle.field.pseudoWeather[room].duration, 8);
			assert(battle.log.some(l => l.includes('|-fieldstart|') && l.includes('[turns] 8')));
			battle.field.removePseudoWeather(room);
			battle.makeChoices('switch 2', 'move splash'); battle.makeChoices('switch 2', 'move splash');
			assert(battle.field.getPseudoWeather(room));
		});
	}
	it('Gravity Well grounds its own Levitate user and performs the field transition only once', () => {
		const [p] = setup('Lunatone'); battle.field.setTerrain('watersurfaceterrain', p);
		p.setAbility('Gravity Well'); assert.equal(p.isGrounded(), true);
		assert.equal(battle.field.terrain, 'underwaterterrain');
		p.setAbility('No Ability'); p.setAbility('Gravity Well');
		assert.equal(battle.field.terrain, 'underwaterterrain');
	});
	for (const terrain of ['', 'psychicterrain', 'chessboardterrain', 'newworldterrain']) {
		it(`Lost Epoch lasts exactly five turns with Amplifield Rock on ${terrain || 'no terrain'}`, () => {
			const [p] = setup('Unown', 'No Ability', 'Amplifield Rock');
			if (terrain) battle.field.setTerrain(terrain, p);
			p.setAbility('Lost Epoch');
			assert.equal(battle.field.pseudoWeather.trickroom.duration, 5);
			assert(p.m.lostEpochSpent);
			assert(battle.log.some(l => l.includes('|-fieldstart|move: Trick Room|') && l.includes('[turns] 5')));
		});
	}
	it('Lost Epoch works only once despite switching, ability replacement, and suppression recovery', () => {
		const [p] = setup('Unown', 'Lost Epoch'); battle.field.removePseudoWeather('trickroom');
		battle.makeChoices('switch 2', 'move splash'); battle.makeChoices('switch 2', 'move splash');
		assert(!battle.field.getPseudoWeather('trickroom'));
		p.setAbility('No Ability'); p.setAbility('Lost Epoch'); assert(!battle.field.getPseudoWeather('trickroom'));
		p.addVolatile('gastroacid'); p.removeVolatile('gastroacid');
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert(!battle.field.getPseudoWeather('trickroom'));
	});
	it('an existing Trick Room is preserved without spending the one activation', () => {
		const [p, q] = setup(); battle.field.addPseudoWeather('trickroom', q);
		battle.field.pseudoWeather.trickroom.duration = 2; p.setAbility('Lost Epoch'); p.baseAbility = p.ability;
		assert.equal(battle.field.pseudoWeather.trickroom.duration, 2); assert(!p.m.lostEpochSpent);
		battle.field.removePseudoWeather('trickroom');
		battle.makeChoices('switch 2', 'move splash'); battle.makeChoices('switch 2', 'move splash');
		assert(battle.field.getPseudoWeather('trickroom')); assert(p.m.lostEpochSpent);
	});
	it('ordinary Trick Room can still remove Lost Epoch without granting another activation', () => {
		const [p, q] = setup('Unown', 'Lost Epoch'); battle.actions.useMove('trickroom', q);
		assert(!battle.field.getPseudoWeather('trickroom'));
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert(!battle.field.getPseudoWeather('trickroom'));
	});
	it('suppression prevents entry activation without spending it', () => {
		battle = common.createBattle({}, [[set('Unown', 'Lost Epoch')], [set('Mew', 'Neutralizing Gas')]]);
		const p = battle.p1.active[0], q = battle.p2.active[0];
		assert(!battle.field.getPseudoWeather('trickroom')); assert(!p.m.lostEpochSpent);
		q.setAbility('No Ability');
		assert(battle.field.getPseudoWeather('trickroom')); assert(p.m.lostEpochSpent);
	});
	it('rejects Role Play, Skill Swap, and Entrainment transfer', () => {
		const [p, q] = setup('Unown', 'Lost Epoch');
		for (const id of ['roleplay', 'skillswap']) battle.actions.useMove(id, q, {target: p});
		battle.actions.useMove('entrainment', p, {target: q});
		assert.equal(p.ability, 'lostepoch'); assert.equal(q.ability, 'noability');
	});
	it('Trace cannot copy Lost Epoch', () => {
		battle = common.createBattle({}, [[set('Unown', 'Lost Epoch')], [set('Mew', 'Trace')]]);
		assert.equal(battle.p2.active[0].ability, 'trace');
	});
	it('Transform and direct assignment to another species cannot start Trick Room', () => {
		const [p, q] = setup('Unown', 'Lost Epoch'); battle.field.removePseudoWeather('trickroom');
		battle.actions.useMove('transform', q, {target: p}); assert(!battle.field.getPseudoWeather('trickroom'));
		q.transformed = false; q.setAbility('Lost Epoch');
		assert(!battle.field.getPseudoWeather('trickroom'));
	});
	it('all four setters can coexist in free-for-all', () => {
		battle = common.createBattle({gameType: 'freeforall'}, [[set('Unown', 'Lost Epoch')],
			[set('Lunatone', 'Gravity Well')], [set('Carbink', 'Arcane Chamber')], [set('Beheeyem', 'Mirror Chamber')]]);
		for (const room of ['gravity', 'magicroom', 'wonderroom', 'trickroom']) assert(battle.field.getPseudoWeather(room));
	});
});
