'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim/dex');
let battle;
function setup(move = 'splash', ability = 'No Ability', targetAbility = 'No Ability') {
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
		[{species: 'Mew', ability, moves: [move, 'splash'], evs: {spe: 252}}],
		[{species: 'Mew', ability: targetAbility, moves: ['splash', 'protect']}],
	]);
	battle.makeChoices('team 1', 'team 1');
	return [battle.p1.active[0], battle.p2.active[0]];
}
describe('Field audit regressions', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('charges Rocky missed-contact damage using the move engine result', () => {
		const [source] = setup('tackle');
		battle.field.startTerrain('rockyterrain');
		battle.onEvent('Accuracy', battle.format, () => 0);
		battle.makeChoices();
		assert.equal(source.maxhp - source.hp, Math.floor(source.baseMaxhp / 8));
	});
	for (const ability of ['Rock Head', 'Magic Guard', 'Long Reach']) {
		it(`exempts ${ability} from Rocky missed-contact damage`, () => {
			const [source] = setup('tackle', ability);
			battle.field.startTerrain('rockyterrain');
			battle.onEvent('Accuracy', battle.format, () => 0);
			battle.makeChoices();
			assert.equal(source.hp, source.maxhp);
		});
	}
	it('does not penalize a successful contact attack', () => {
		const [source] = setup('tackle');
		battle.field.startTerrain('rockyterrain');
		battle.makeChoices();
		assert.equal(source.hp, source.maxhp);
	});
	it('preserves existing added types when Rocky Field adds Rock', () => {
		setup(); battle.field.startTerrain('rockyterrain');
		const move = battle.dex.getActiveMove('earthquake');
		move.types = ['Ground', 'Fire'];
		battle.singleEvent('ModifyMove', battle.field.getTerrain(), battle.field.terrainState, move);
		assert.deepEqual(move.types, ['Ground', 'Fire', 'Rock']);
	});
	for (const field of Object.keys(Dex.data.Terrains)) {
		it(`initializes ${field} on a mid-battle field change`, () => {
			setup(); battle.field.startTerrain('rockyterrain');
			if (field === 'rockyterrain') return;
			assert.equal(battle.field.changeTerrain(field), true);
			battle.makeChoices();
			assert(!battle.log.some(line => /\bNaN\b|\bundefined\b/.test(line)));
		});
	}
	it('clears existing weather when changing into Underwater', () => {
		const [source] = setup();
		battle.field.setWeather('raindance', source);
		battle.field.changeTerrain('underwaterterrain', source);
		assert.equal(battle.field.weather, '');
	});
	it('rolls back a rejected Cold Eclipse change without damaging the field stack', () => {
		const [source] = setup();
		battle.field.startTerrain('rockyterrain');
		battle.field.setWeather('desolateland', source);
		const state = battle.field.terrainState;
		assert.equal(battle.field.changeTerrain('coldeclipseterrain', source), false);
		assert.equal(battle.field.terrain, 'rockyterrain');
		assert.equal(battle.field.terrainState, state);
		assert.equal(battle.field.terrainStack[0], state);
	});
	it('exposes the actual condition definitions through the terrain dex', () => {
		for (const id of Object.keys(Dex.data.Terrains)) {
			assert.equal(Dex.terrains.get(id).condition.onFieldStart, Dex.data.Terrains[id].condition.onFieldStart, id);
		}
	});
	it('activates Mirror Armor evasion on Mirror Arena entry', () => {
		const [source] = setup();
		battle.field.startTerrain('mirrorarenaterrain');
		source.setAbility('mirrorarmor');
		assert.equal(source.boosts.evasion, 1);
	});
	it('puts Stealth Rock on both sides when a Telluric Seed activates on Wasteland', () => {
		const [source] = setup();
		battle.field.startTerrain('wastelandterrain');
		source.setItem('telluricseed');
		battle.singleEvent('Start', source.getItem(), source.itemState, source);
		assert(battle.field.terrainState.stealthrock.includes(source.side.id));
		assert(battle.field.terrainState.stealthrock.includes(source.side.foe.id));
	});
	it('melts hail on Cave entry without accidentally clearing other weather', () => {
		const [source] = setup();
		battle.field.setWeather('raindance', source);
		battle.field.startTerrain('caveterrain');
		assert.equal(battle.field.weather, 'raindance');
		battle.field.setWeather('hail', source);
		battle.field.changeTerrain('rockyterrain', source);
		battle.field.changeTerrain('caveterrain', source);
		assert.equal(battle.field.weather, '');
	});
	it('Magma Armor blocks repeated Fire hits in Dragon Den without an unregistered volatile', () => {
		const [, target] = setup('flamethrower', 'No Ability', 'Magma Armor');
		battle.field.startTerrain('dragonsdenterrain');
		battle.makeChoices(); battle.makeChoices();
		assert.equal(target.hp, target.maxhp);
		assert(!target.volatiles.magmaarmor);
		assert(battle.log.some(line => line.includes('[from] ability: Magma Armor')));
	});
	it('Sand Tomb on Ashen Beach uses the registered partial-trapping condition only', () => {
		const [, target] = setup('sandtomb');
		battle.field.startTerrain('ashenbeachterrain');
		battle.onEvent('Accuracy', battle.format, () => true);
		battle.makeChoices();
		assert(target.volatiles.partiallytrapped);
		assert(!target.volatiles.sandtomb);
	});
});
