'use strict';
const assert = require('assert').strict;
const { calculateScenario, calculatorFormats, validateScenario, buildCalculatorBattle } = require('../../dist/sim/custom-calculator');
function scenario(overrides = {}) {
	return { format: 'gen9nofieldsinglesgame', move: 'Flamethrower', samples: 8, seed: 42, actors: Array.from({ length: 4 }, () => ({ species: 'Mew', ability: 'No Ability', ivs: {}, evs: {} })), ...overrides };
}
function format(mode, field = '') { return calculatorFormats().find(f => f.gameType === mode && (f.terrain || '') === field).id; }
describe('Custom engine calculator', () => {
	it('exposes the complete field and authoritative species/component inventory', () => {
		const {calculatorMetadata} = require('../../dist/sim/custom-calculator');
		const {Terrains} = require('../../dist/data/terrains');
		const {AbilityComponents} = require('../../dist/data/ability-components');
		const {Dex} = require('../../dist/sim/dex');
		const metadata = calculatorMetadata();
		assert.deepEqual(metadata.fields.map(f => f.id).sort(), ['', ...Object.keys(Terrains)].sort());
		assert.deepEqual(metadata.species.find(p => p.name === 'Sylveon').abilities, Dex.species.get('Sylveon').abilities);
		assert.deepEqual(metadata.abilityComponents.soothingpresence, AbilityComponents.soothingpresence.map(id => Dex.abilities.get(id).name));
		assert.throws(() => validateScenario(scenario({field: 'inventedfield'})), /Unsupported choice/);
		for (const mode of ['singles', 'doubles', 'freeforall']) {
			const base = calculatorFormats().find(f => f.gameType === mode);
			for (const field of Object.keys(Terrains)) {
				const {battle} = buildCalculatorBattle(validateScenario(scenario({format: base.id, field})), 0);
				assert.equal(battle.field.terrain, field, mode + ': ' + field);
				battle.destroy();
			}
		}
	});
	it('activates engine Mega, Z and supported G-Max mechanics', () => {
		const input = scenario();
		Object.assign(input.actors[0], { species: 'Charizard', item: 'Charizardite X', gimmick: 'mega' });
		assert.equal(calculateScenario(input).resolved.actors[0].species, 'Charizard-Mega-X');
		Object.assign(input.actors[0], { species: 'Mew', item: 'Firium Z', gimmick: '' });
		input.attackMode = 'z';
		assert(calculateScenario(input).exampleLog.some(line => line.includes('Inferno Overdrive')));
		Object.assign(input.actors[0], { species: 'Charizard', item: '', gimmick: 'gmax' });
		input.attackMode = 'max';
		assert.throws(() => calculateScenario(input), /unavailable/);
		input.format = 'gen9factoryfield';
		assert(calculateScenario(input).exampleLog.some(line => line.includes('G-Max Wildfire')));
		input.move = 'Dragon Pulse';
		assert.throws(() => calculateScenario(input), /signature G-Max/);
	});
	it('is reproducible and does not mutate the input', () => {
		const input = scenario(), before = JSON.stringify(input);
		const a = calculateScenario(input), b = calculateScenario(input);
		assert.deepEqual(a, b);
		assert.equal(JSON.stringify(input), before);
		assert.equal(a.kind, 'sampled');
		assert(a.results[1].min > 0);
	});
	it('rejects unbounded, malformed and arbitrary state inputs', () => {
		for (const bad of [{ samples: 100000 }, { seed: 0 }, { format: 'gen9anythinggoes' }, { evil: 'code' }, { weather: 'snow' }, { screens: ['arbitrary'] }]) assert.throws(() => validateScenario(scenario(bad)));
		const input = scenario();
		input.actors[0].m = { counter: 999 };
		assert.throws(() => validateScenario(input));
	});
	it('uses actual immunity and fixed-damage behavior', () => {
		const input = scenario({ move: 'Thunderbolt' });
		input.actors[1].species = 'Golem';
		assert.equal(calculateScenario(input).results[1].max, 0);
		input.move = 'Seismic Toss';
		input.actors[1].species = 'Mew';
		const result = calculateScenario(input);
		assert.equal(result.results[1].min, 100);
		assert.equal(result.results[1].max, 100);
	});
	it('does not invent immediate damage for status or delayed attacks', () => {
		for (const move of ['Splash', 'Future Sight']) assert.equal(calculateScenario(scenario({ move })).results[1].max, 0);
	});
	it('uses screen and weather multipliers from the engine', () => {
		const base = calculateScenario(scenario()).results[1];
		const screen = calculateScenario(scenario({ screens: ['lightscreen'] })).results[1];
		const sun = calculateScenario(scenario({ weather: 'sunnyday' })).results[1];
		assert(screen.max < base.max);
		assert(sun.min > base.min);
	});
	it('keeps full field and aura distinct and rejects forbidden combinations', () => {
		const input = scenario({ format: format('singles', 'factoryterrain'), aura: 'psychicterrain', move: 'Thunderbolt' });
		const { battle } = buildCalculatorBattle(validateScenario(input), 0);
		try {
			assert.equal(battle.field.terrain, 'factoryterrain');
			assert.equal(battle.field.auraField, 'psychicterrain');
		} finally { battle.destroy(); }
		assert.throws(() => calculateScenario(scenario({ aura: 'electricterrain' })), /cannot support/);
	});
	it('executes Twin Cannons second hit against Defense and redirects it in FFA', () => {
		const input = scenario();
		input.actors[0].ability = 'Twin Cannons';
		input.actors[1].boosts = { def: 6, spd: 0 };
		const highDef = calculateScenario(input);
		input.actors[1].boosts = { def: 0, spd: 0 };
		const lowDef = calculateScenario(input);
		assert(lowDef.results[1].max > highDef.results[1].max);
		assert(lowDef.exampleLog.some(l => l.includes('|-hitcount|') && l.endsWith('|2')));
		input.format = format('freeforall', 'mountainterrain');
		const ffa = calculateScenario(input);
		assert(ffa.results[2].max > 0 || ffa.results[3].max > 0);
		assert.equal(ffa.results.length, 4);
	});
	it('uses actual spread targeting in Doubles and FFA', () => {
		for (const mode of ['doubles', 'freeforall']) {
			const result = calculateScenario(scenario({ format: format(mode, mode === 'freeforall' ? 'mountainterrain' : ''), move: 'Surf' }));
			assert.equal(result.results.length, 4);
			assert(result.results[1].max > 0);
			assert(result.results[2].max > 0);
			assert(result.results[3].max > 0);
		}
	});
	it('shows engine-resolved Tera rules and observed KO counts', () => {
		const input = scenario();
		input.actors[0].gimmick = 'tera';
		input.actors[0].teraType = 'Fire';
		input.actors[1].hpPercent = 1;
		const result = calculateScenario(input);
		assert.equal(result.resolved.actors[0].tera, 'Stellar');
		assert.equal(result.results[1].kos, 8);
	});
});
