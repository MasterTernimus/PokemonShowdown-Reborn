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
	it('gives Cold Eclipse eight turns with hail regardless of which starts first', () => {
		let [source] = setup();
		battle.field.setWeather('hail', source);
		battle.field.setTerrain('coldeclipseterrain', source);
		assert.equal(battle.field.terrainState.duration, 8);
		battle.destroy();
		[source] = setup();
		battle.field.setTerrain('coldeclipseterrain', source);
		assert.equal(battle.field.terrainState.duration, 5);
		battle.field.setWeather('hail', source);
		assert.equal(battle.field.terrainState.duration, 8);
	});
	it('stacks Ice Scales and Cold Eclipse Defense as intended', () => {
		const [source] = setup('splash', 'Ice Scales');
		const normalDefense = source.getStat('def');
		battle.field.setTerrain('coldeclipseterrain', source);
		assert.equal(source.getStat('def'), normalDefense * 4);
	});
	for (const ability of ['Ascendance', 'Illusion']) {
		it(`grants ${ability} both Cold Eclipse defense boosts`, () => {
			const [source] = setup('splash', ability);
			const normalDefense = source.getStat('def');
			const normalSpecialDefense = source.getStat('spd');
			battle.field.setTerrain('coldeclipseterrain', source);
			assert.equal(source.getStat('def'), Math.floor(normalDefense * 1.5));
			assert.equal(source.getStat('spd'), Math.floor(normalSpecialDefense * 1.5));
		});
	}
	it('does not grant Ice Body the Cold Eclipse defense boost', () => {
		const [source] = setup('splash', 'Ice Body');
		const normalDefense = source.getStat('def');
		const normalSpecialDefense = source.getStat('spd');
		battle.field.setTerrain('coldeclipseterrain', source);
		assert.equal(source.getStat('def'), normalDefense);
		assert.equal(source.getStat('spd'), normalSpecialDefense);
	});
	it('keeps Ice Body eligible for Cold Eclipse hail healing', () => {
		const [source] = setup('splash', 'Ice Body');
		battle.field.setWeather('hail', source);
		battle.field.setTerrain('coldeclipseterrain', source);
		source.hp = source.maxhp - 100;
		const previousHP = source.hp;
		battle.singleEvent('Residual', battle.field.getTerrain(), battle.field.terrainState, source);
		assert(source.hp > previousHP);
	});
	it('grants Dragon types both defenses and doubles Dragon move power', () => {
		const [source, target] = setup();
		source.setType('Dragon');
		const normalDefense = source.getStat('def');
		const normalSpecialDefense = source.getStat('spd');
		battle.field.setTerrain('coldeclipseterrain', source);
		assert.equal(source.getStat('def'), Math.floor(normalDefense * 1.5));
		assert.equal(source.getStat('spd'), Math.floor(normalSpecialDefense * 1.5));
		assert.equal(battle.runEvent('BasePower', source, target, battle.dex.getActiveMove('dragonclaw'), 100), 200);
	});
	for (const ability of ['Pollen Bloom', 'Toxic Bloom']) {
		it(`recognizes ${ability}'s Thick Fat component on Cold Eclipse`, () => {
			const [source] = setup('splash', ability);
			const normalDefense = source.getStat('def');
			const normalSpeed = source.getStat('spe');
			assert.equal(source.hasAbility('thickfat'), true);
			battle.field.setTerrain('coldeclipseterrain', source);
			assert.equal(source.getStat('def'), Math.floor(normalDefense * 1.5));
			assert.equal(source.getStat('spe'), normalSpeed);
		});
	}
	for (const ability of [
		'Thick Fat', 'Pollen Bloom', 'Toxic Bloom', 'Ice Body', 'Mind Freeze',
		'Full Metal Body', 'Illusion', 'Prism Armor', 'Shadow Shield', 'Dark Aura', 'Duskilate', 'Armorize',
	]) {
		it(`retains ${ability}'s own hail immunity on Cold Eclipse`, () => {
			const [source] = setup('splash', ability);
			battle.field.setTerrain('coldeclipseterrain', source);
			battle.field.setWeather('hail', source);
			assert.equal(source.runStatusImmunity('hail'), false);
		});
	}
	it('converts rain to hail and leaves a three-turn Water Sport', () => {
		const [source] = setup();
		battle.field.setTerrain('coldeclipseterrain', source);
		battle.field.setWeather('raindance', source);
		assert.equal(battle.field.pseudoWeather.watersport.duration, 3);
		battle.makeChoices('move splash', 'move splash');
		assert.equal(battle.field.weather, 'hail');
		assert(battle.field.pseudoWeather.watersport);
		battle.makeChoices('move splash', 'move splash');
		assert(battle.field.pseudoWeather.watersport);
		battle.makeChoices('move splash', 'move splash');
		assert.equal(battle.field.pseudoWeather.watersport, undefined);
	});
	it('grants three-turn Water Sport when Cold Eclipse begins in existing rain', () => {
		const [source] = setup();
		battle.field.setWeather('raindance', source);
		battle.field.setTerrain('coldeclipseterrain', source);
		assert.equal(battle.field.pseudoWeather.watersport.duration, 3);
	});
	it('does not shorten an existing Water Sport when rain begins', () => {
		const [source] = setup();
		battle.field.setTerrain('coldeclipseterrain', source);
		battle.field.addPseudoWeather('watersport', source, battle.dex.moves.get('watersport'));
		assert.equal(battle.field.pseudoWeather.watersport.duration, 5);
		battle.field.setWeather('raindance', source);
		assert.equal(battle.field.pseudoWeather.watersport.duration, 5);
	});
	it('does not count a missed heat move toward clearing Cold Eclipse', () => {
		const [source] = setup('heatwave');
		battle.field.setTerrain('coldeclipseterrain', source);
		battle.onEvent('Accuracy', battle.format, () => 0);
		battle.makeChoices('move heatwave', 'move splash');
		assert.equal(battle.field.terrain, 'coldeclipseterrain');
		assert.equal(battle.field.terrainState.terrainChanges.get('coldEclipseHeat'), 0);
	});
	it('clears Cold Eclipse after two successful heat moves', () => {
		const [source] = setup('heatwave');
		battle.field.setTerrain('coldeclipseterrain', source);
		battle.makeChoices('move heatwave', 'move splash');
		assert.equal(battle.field.terrainState.terrainChanges.get('coldEclipseHeat'), 1);
		battle.makeChoices('move heatwave', 'move splash');
		assert.notEqual(battle.field.terrain, 'coldeclipseterrain');
	});
	it('changes Cold Eclipse to Starlight only after Geomancy finishes', () => {
		const [source] = setup('geomancy');
		battle.field.setTerrain('coldeclipseterrain', source);
		battle.makeChoices('move geomancy', 'move splash');
		assert.equal(battle.field.terrain, 'coldeclipseterrain');
		battle.makeChoices('move geomancy', 'move splash');
		assert.equal(battle.field.terrain, 'starlightarenaterrain');
	});
	it('keeps Cold Eclipse when Light of Ruin misses', () => {
		const [source] = setup('lightofruin');
		battle.field.setTerrain('coldeclipseterrain', source);
		battle.onEvent('Accuracy', battle.format, () => 0);
		battle.makeChoices('move lightofruin', 'move splash');
		assert.equal(battle.field.terrain, 'coldeclipseterrain');
	});
	it('restarts the sunny turn count when sunlight is interrupted', () => {
		const [source] = setup();
		battle.field.setTerrain('coldeclipseterrain', source);
		battle.field.setWeather('sunnyday', source);
		battle.makeChoices('move splash', 'move splash');
		assert.equal(battle.field.terrain, 'coldeclipseterrain');
		battle.field.setWeather('hail', source);
		battle.field.setWeather('sunnyday', source);
		battle.makeChoices('move splash', 'move splash');
		assert.equal(battle.field.terrain, 'coldeclipseterrain');
		battle.makeChoices('move splash', 'move splash');
		assert.notEqual(battle.field.terrain, 'coldeclipseterrain');
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
