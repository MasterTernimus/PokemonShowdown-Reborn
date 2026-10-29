'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
function setup(field = 'infernaleclipseterrain', duration = 5) {
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
		[{species: 'Mew', ability: 'noability', moves: ['eruption', 'glaciate', 'infernalparade', 'splash']}],
		[{species: 'Mew', ability: 'noability', moves: ['splash', 'protect', 'raindance', 'hail']}],
	]);
	battle.makeChoices('team 1', 'team 1');
	const p = battle.p1.active[0], q = battle.p2.active[0];
	for (const mon of [p, q]) mon.hp = mon.maxhp = mon.baseMaxhp = 10000;
	if (field) assert(battle.field.setFieldOrAura(field, duration, p, battle.dex.moves.get('splash'), true));
	return [p, q];
}
function use(p, q, id, props = {}) {
	const move = Object.assign(battle.dex.getActiveMove(id), {accuracy: true, willCrit: false}, props);
	if (!p.getMoveData(id)) p.moveSlots.push({id: move.id, move: move.name, pp: 20, maxpp: 20, target: move.target, disabled: false, used: false});
	battle.actions.runMove(move, p, p.getLocOf(q));
}
function modify(id, p, q) {
	const move = battle.dex.getActiveMove(id);
	battle.singleEvent('ModifyMove', battle.field.getTerrain(), battle.field.terrainState, move, p, q);
	return move;
}
describe('Infernal Eclipse expanded field', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const [types, multiplier] of [[['Fire'], 1.2], [['Ghost'], 1.2], [['Fire', 'Ghost'], 1.44], [['Ice'], 0.8], [['Ice', 'Ghost'], 0.96], [['Dragon'], 1]]) {
		it(`applies independent defensive components to ${types.join('/')}`, () => {
			const [p] = setup(''); p.setType(types);
			const def = p.getStat('def'), spd = p.getStat('spd');
			assert(battle.field.setFieldOrAura('infernaleclipseterrain', 5, p, battle.dex.moves.get('splash'), true));
			assert(Math.abs(p.getStat('def') - def * multiplier) <= 1);
			assert(Math.abs(p.getStat('spd') - spd * multiplier) <= 1);
		});
	}
	for (const [id, types, multiplier] of [
		['earthquake', ['Ground', 'Fire'], 1.5], ['ironhead', ['Steel', 'Fire'], 1.5],
		['stoneedge', ['Rock', 'Fire'], 1.5], ['icebeam', ['Ice', 'Fire'], 0.75],
		['surf', undefined, 0.5], ['moonblast', undefined, 0.5],
		['spiritbreak', ['Fairy', 'Dark'], 1.5], ['aurasphere', ['Fighting', 'Dark'], 1.5],
		['frustration', ['Normal', 'Dark'], 1.5], ['earthpower', ['Ground', 'Fire'], 2.25],
		['inferno', undefined, 2.25], ['smog', undefined, 2], ['punishment', undefined, 3],
	]) {
		it(`combines ${id} subtyping and independent power modifiers`, () => {
			const [p, q] = setup(), move = modify(id, p, q);
			assert.deepEqual(move.types, types);
			assert.equal(battle.runEvent('BasePower', p, q, move, 100), 100 * multiplier);
		});
	}
	it('keeps bone and Armorize Steel exceptions without excluding other Steel users', () => {
		const [p, q] = setup();
		assert(!modify('bonemerang', p, q).types?.includes('Fire'));
		p.setAbility('armorize');
		assert(!modify('ironhead', p, q).types?.includes('Fire'));
		assert(modify('earthquake', p, q).types.includes('Fire'));
	});
	for (const weather of ['raindance', 'primordialsea', 'hail']) {
		it(`clears existing ${weather} and rejects new weather from both APIs`, () => {
			const [p] = setup(''); assert(battle.field.setWeather(weather, p));
			assert(battle.field.setFieldOrAura('infernaleclipseterrain', 5, p, battle.dex.moves.get('splash'), true));
			assert.equal(battle.field.weather, '');
			assert.equal(battle.field.setWeather(weather, p), false);
			assert.equal(battle.field.changeWeather(weather, p), false);
			assert.equal(battle.field.weather, '');
		});
	}
	for (const weather of ['sunnyday', 'sandstorm']) {
		it(`preserves ${weather} and does not invent weather`, () => {
			const [p] = setup(); assert.equal(battle.field.weather, '');
			assert(battle.field.setWeather(weather, p));
			battle.makeChoices('move splash', 'move splash');
			assert.equal(battle.field.weather, weather);
		});
	}
	it('clears rain when Infernal resumes underneath an expired field', () => {
		const [p] = setup();
		assert(battle.field.setFieldOrAura('grassyterrain', 2, p, battle.dex.moves.get('splash'), true));
		assert(battle.field.setWeather('raindance', p));
		assert(battle.field.clearTerrain());
		assert.equal(battle.field.terrain, 'infernaleclipseterrain');
		assert.equal(battle.field.weather, '');
	});
});

describe('Prepared Eclipse direct swaps', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const [start, aura, attack, end, seed, lock] of [
		['coldeclipseterrain', 'ashenaura', 'eruption', 'infernaleclipseterrain', 'ashenseeds', 'badseeds'],
		['infernaleclipseterrain', 'frozenaura', 'glaciate', 'coldeclipseterrain', 'badseeds', 'ashenseeds'],
		['infernaleclipseterrain', 'frozenaura', 'sheercold', 'coldeclipseterrain', 'badseeds', 'ashenseeds'],
	]) {
		for (const ability of ['noability', seed]) {
			it(`${start} skips Rift with the prepared Aura and ${ability}, retaining the field clock`, () => {
				const [p, q] = setup(start, 3);
				assert(battle.field.setAura(aura, 7, p, battle.dex.moves.get('splash')));
				p.setAbility(ability);
				const layers = battle.field.terrainStack.length;
				use(p, q, attack);
				assert.equal(battle.field.terrain, end);
				assert.equal(battle.field.auraField, '');
				assert.equal(battle.field.terrainState.duration, 3);
				assert.equal(battle.field.terrainStack.length, layers);
				assert(!battle.log.some(line => line.includes('|-fieldstart|Rift Eclipse')));
			});
		}
		it(`${attack} takes the ordinary cooling/heating route without its opposing Aura`, () => {
			const [p, q] = setup(start); use(p, q, attack);
			assert.equal(battle.field.terrain, attack === 'sheercold' ? 'infernaleclipseterrain' : 'rifteclipseterrain');
			if (attack === 'sheercold') assert.equal(battle.field.terrainState.terrainChanges.get('eclipseCooling'), 1);
		});
		for (const failure of ['protect', 'miss', 'neutralization', 'pulseblockade', lock]) {
			it(`${attack} does not consume its Aura or bypass ${failure}`, () => {
				const [p, q] = setup(start);
				assert(battle.field.setAura(aura, 7, p, battle.dex.moves.get('splash')));
				if (failure === 'protect') q.addVolatile('protect');
				// Isolate the lock from Pulse Blockade's separate entry field setter.
				if (failure === 'pulseblockade') q.ability = failure;
				else if (!['protect', 'miss'].includes(failure)) q.setAbility(failure);
				use(p, q, attack, failure === 'miss' ? {accuracy: 0} : {});
				assert.equal(battle.field.terrain, start);
				assert.equal(battle.field.auraField, aura);
				assert.equal(battle.field.auraTurns, 7);
			});
		}
	}
	it('a lesser heating move still thaws Cold to Rift despite Ashen Aura', () => {
		const [p, q] = setup('coldeclipseterrain');
		assert(battle.field.setAura('ashenaura', 7, p, battle.dex.moves.get('splash')));
		use(p, q, 'infernalparade');
		assert.equal(battle.field.terrain, 'rifteclipseterrain');
		assert.equal(battle.field.auraField, 'ashenaura');
	});
});
