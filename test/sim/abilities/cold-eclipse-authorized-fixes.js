/* eslint-disable @stylistic/max-statements-per-line */
'use strict';
const assert = require('assert').strict, common = require('../../common');
const { Dex } = require('../../../dist/sim');
let battle;
function setup(field = 'coldeclipseterrain', doubles = false) {
	const mon = () => ({ species: 'Mew', ability: 'No Ability', moves: ['splash', 'tackle'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [[mon(), mon(), mon()], [mon(), mon(), mon()]]);
	battle.makeChoices('team 123', 'team 123'); battle.field.setTerrain(field || 'electricterrain', battle.p1.active[0]); if (!field)battle.field.clearTerrain();
	return [battle.p1.active[0], battle.p2.active[0]];
}
function entry(p) { battle.singleEvent('Start', p.getAbility(), p.abilityState, p); }
describe('Authorized Cold Eclipse corrections', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const [attack, types, expected] of [
		['Fighting', ['Ice'], 1], ['Fighting', ['Ice', 'Steel'], 2], ['Fighting', ['Ice', 'Fighting'], 1], ['Fighting', ['Ice', 'Dragon'], 1],
		['Fighting', ['Ice', 'Flying'], 0], ['Fighting', ['Normal', 'Ice'], 2], ['Ice', ['Dragon'], -1], ['Ice', ['Dragon', 'Flying'], 0],
		['Ice', ['Dragon', 'Ice'], -2], ['Ice', ['Dragon', 'Steel'], -2], ['Ice', ['Dragon', 'Water'], -2], ['Ice', ['Ice'], -1],
		['Fighting', ['Steel'], 1], ['Ice', ['Flying'], 1],
	])it(attack + ' against ' + types.join('/') + ' changes only the intended defensive type', () => {
		const [,q] = setup(); q.setType(types); const move = Object.assign(Dex.getActiveMove('tackle'), { type: attack }); assert.equal(q.runEffectiveness(move), expected);
	});
	for (const attacks of [['Fighting', 'Fire'], ['Ice', 'Fire'], ['Fighting', 'Ice'], ['Dragon', 'Ice'], ['Normal', 'Ice']])it('preserves other components of multi-type ' + attacks.join('/'), () => {
		const [,q] = setup(); for (const types of [['Ice'], ['Dragon'], ['Ice', 'Dragon'], ['Dragon', 'Flying'], ['Ice', 'Steel']]) {
			q.setType(types); const move = Object.assign(Dex.getActiveMove('tackle'), { type: attacks[0], types: attacks });
			const correction = (types.includes('Dragon') && attacks.includes('Ice') ? 2 : 0);
			assert.equal(q.runEffectiveness(move), Dex.getEffectiveness(move, q) - correction, types.join('/'));
		}
	});
	it('keeps Fighting immunity against Ice/Ghost and restores the ordinary chart when the field ends', () => {
		const [,q] = setup(); q.setType(['Ice', 'Ghost']); const move = Object.assign(Dex.getActiveMove('tackle'), { type: 'Fighting' }); assert.equal(q.runImmunity(move), false);
		battle.field.clearTerrain(); q.setType('Ice'); assert.equal(q.runEffectiveness(move), 1); move.type = 'Ice'; q.setType('Dragon'); assert.equal(q.runEffectiveness(move), 1);
	});
	for (const field of ['', 'coldeclipseterrain'])it('Pressure Substitute blocks drops and reflection on ' + (field || 'ordinary field'), () => {
		const [p, q] = setup(field); q.setAbility('Mirror Armor'); q.addVolatile('substitute'); p.setAbility('Pressure');
		for (const m of [p, q]) { assert.equal(m.boosts.def, 0); assert.equal(m.boosts.spd, 0); }assert(battle.log.some(line => line.startsWith('|-immune|')));
		q.removeVolatile('substitute'); q.setAbility('No Ability'); entry(p); assert.equal(q.boosts.def, field ? -2 : 0); assert.equal(q.boosts.spd, field ? -2 : 0);
		entry(p); assert.equal(q.boosts.def, field ? -4 : 0); assert.equal(!!p.m.pressureTargets, !field);
	});
	it('Cold Eclipse blocked attempts preserve the separate ordinary attempt and each doubles foe is independent', () => {
		const [p, q] = setup('coldeclipseterrain', true), other = battle.p2.active[1]; q.addVolatile('substitute'); p.setAbility('Pressure'); assert.equal(q.boosts.def, 0); assert.equal(other.boosts.def, -2);
		battle.field.clearTerrain(); entry(p); assert.equal(q.boosts.def, 0); assert.equal(other.boosts.def, -3); q.removeVolatile('substitute'); entry(p); assert.equal(q.boosts.def, 0);
		battle.field.setTerrain('coldeclipseterrain', p); entry(p); assert.equal(q.boosts.def, -2); assert.equal(other.boosts.def, -5);
	});
	for (const [field, power, limit] of [['', 100, 60], ['coldeclipseterrain', 100, 0], ['fairytaleterrain', 200, 60], ['forestterrain', 150, 60]])it('Relentless Hunt applies one power/priority benefit on ' + (field || 'ordinary field'), () => {
		const [p, q] = setup(field); p.setAbility('Relentless Hunt');
		for (const bp of [40, 60, 61, 80, 81, 100]) { const move = Object.assign(Dex.getActiveMove('tackle'), { basePower: bp }); assert.equal(battle.runEvent('BasePower', p, q, move, 100), power); assert.equal(battle.runEvent('ModifyPriority', p, q, move, 0), bp <= limit ? 1 : 0); }
		if (field === 'coldeclipseterrain') { p.addVolatile('gastroacid'); const move = Dex.getActiveMove('tackle'); assert.equal(battle.runEvent('BasePower', p, q, move, 100), 100); assert.equal(battle.runEvent('ModifyPriority', p, q, move, 0), 0); }
	});
	it('Relentless Hunt retains independent Ice and Dragon field boosts once each', () => {
		const [p, q] = setup(); p.setAbility('Relentless Hunt'); for (const [type, expected] of [['Ice', 120], ['Dragon', 200], ['Fighting', 100], ['Normal', 100]]) {
			const move = Object.assign(Dex.getActiveMove('tackle'), { type }); assert.equal(battle.runEvent('BasePower', p, q, move, 100), expected, type);
		}
	});
	it('calculator does not retain the removed Relentless Hunt field power bonus', () => {
		const { calculateScenario } = require('../../../dist/sim/custom-calculator');
		const scenario = { format: 'gen9nofieldsinglesgame', field: 'coldeclipseterrain', move: 'Tackle', samples: 16, seed: 42, actors: Array.from({ length: 4 }, () => ({ species: 'Mew', ability: 'No Ability' })) };
		const plain = calculateScenario(scenario).results[1]; scenario.actors[0].ability = 'Relentless Hunt'; const boosted = calculateScenario(scenario).results[1];
		for (const key of ['min', 'max'])assert(Math.abs(boosted[key] - plain[key]) <= 3, key);
	});
	for (const [attack, defender, ratio] of [['Fighting', 'Ice', 1], ['Ice', 'Dragon', 0.25]])it('real damage honors corrected ' + attack + '/' + defender + ' effectiveness', () => {
		const [p, q] = setup(); q.setType(defender); p.setType('Normal'); battle.randomizer = n => n;
		const move = Object.assign(Dex.getActiveMove('tackle'), { type: attack, basePower: 100, willCrit: false });
		const fixed = battle.actions.getDamage(p, q, move);
		const callback = battle.runEvent;
		try { battle.runEvent = function (event, ...args) { return event === 'Effectiveness' ? args[3] : callback.call(this, event, ...args); }; const old = battle.actions.getDamage(p, q, move); assert(Math.abs(fixed - old * ratio) <= 2); } finally { battle.runEvent = callback; }
	});
});
