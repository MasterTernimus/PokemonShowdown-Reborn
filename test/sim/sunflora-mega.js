'use strict';

const assert = require('../assert');
const common = require('../common');
const {Dex} = require('../../dist/sim/dex');

describe('Sunflora-Mega', function () {
	let battle;
	afterEach(() => { if (battle) battle.destroy(); });
	function setup() {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Sunflora', ability: 'flashfire', item: 'Sunflorite', moves: ['splash', 'energyball']},
			{species: 'Magikarp', moves: ['splash']},
		], [
			{species: 'Blissey', ability: 'runaway', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		return battle.p1.active[0];
	}
	it('lowers base defenses and Mega Evolves with the requested profile and Grassy Surge', () => {
		assert.deepEqual(Dex.species.get('Sunflora').baseStats, {hp: 95, atk: 55, def: 75, spa: 125, spd: 90, spe: 30});
		const sunflora = setup();
		assert.equal(sunflora.species.name, 'Sunflora-Mega');
		assert.deepEqual(sunflora.species.baseStats, {hp: 95, atk: 70, def: 105, spa: 155, spd: 115, spe: 30});
		assert.deepEqual(sunflora.species.types, ['Grass', 'Fire']);
		assert.equal(sunflora.ability, 'solarhydra');
		assert.equal(battle.field.terrain, 'grassyterrain');
	});
	it('uses Hydra Bond three-hit attacks with a separate Solar Bud passive', () => {
		const sunflora = setup();
		assert.deepEqual(sunflora.getPassives(), ['solarbud']);
		const spa = sunflora.getStat('spa');
		battle.field.setWeather('sunnyday', sunflora);
		assert.equal(sunflora.getStat('spa'), spa);
		battle.makeChoices('move energyball', 'move splash');
		assert(battle.log.some(line => line.includes('|-hitcount|p2a: Blissey|3')));
	});
	it('charges Solar Bud in sun, then cures and heals once after a damaging Grass hit', () => {
		const sunflora = setup();
		battle.field.clearTerrain();
		sunflora.hp = 100;
		battle.makeChoices('move splash', 'move splash');
		assert.equal(sunflora.hp, 100);
		battle.field.setWeather('sunnyday', sunflora);
		battle.makeChoices('move splash', 'move splash');
		assert.equal(sunflora.hp, 100);
		sunflora.setStatus('par', sunflora);
		battle.randomChance = () => false;
		battle.onEvent('Accuracy', battle.format, true);
		battle.makeChoices('move energyball', 'move splash');
		assert.equal(sunflora.status, '');
		assert.equal(sunflora.hp, 100 + Math.floor(sunflora.baseMaxhp / 8));
		assert.equal(sunflora.m.solarBudSpent, true);
		const healed = sunflora.hp;
		battle.makeChoices('move energyball', 'move splash');
		assert.equal(sunflora.hp, healed);
	});
	it('takes ordinary sandstorm damage and retains status on switch-out', () => {
		const sunflora = setup();
		battle.field.clearTerrain();
		battle.field.setWeather('sandstorm', sunflora);
		battle.makeChoices('move splash', 'move splash');
		assert.equal(sunflora.hp, sunflora.maxhp - Math.floor(sunflora.maxhp / 16));
		sunflora.setStatus('par', sunflora);
		assert.equal(sunflora.status, 'par');
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(sunflora.status, 'par');
	});
});
