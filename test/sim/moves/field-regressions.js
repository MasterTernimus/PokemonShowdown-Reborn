'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim/dex');
let battle;
function setup(move = 'splash', ability = 'No Ability', targetAbility = 'No Ability', guard = 'protect') {
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
		[{species: 'Mew', ability, moves: [move, 'splash'], evs: {spe: 252}}],
		[{species: 'Mew', ability: targetAbility, moves: ['splash', guard]}],
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
	it('charges Rocky crash damage when Protect blocks a contact move', () => {
		const [source, target] = setup('tackle');
		battle.field.startTerrain('rockyterrain');
		battle.makeChoices('move tackle', 'move protect');
		assert.equal(source.maxhp - source.hp, Math.floor(source.baseMaxhp / 8));
		assert.equal(target.hp, target.maxhp);
		assert.equal(battle.log.filter(line => line.includes('crashed into the rocks')).length, 1);
		const hp = source.hp;
		battle.makeChoices('move tackle', 'move splash');
		assert.equal(source.hp, hp, 'A previous Protect block must not affect the next attack');
	});
	for (const guard of ['detect', 'kingsshield', 'spikyshield']) {
		it(`charges Rocky crash damage when ${guard} blocks contact`, () => {
			const [source] = setup('tackle', 'No Ability', 'No Ability', guard);
			battle.field.startTerrain('rockyterrain');
			battle.makeChoices('move tackle', `move ${guard}`);
			const damage = Math.floor(source.baseMaxhp / 8);
			assert.equal(source.maxhp - source.hp, guard === 'spikyshield' ? damage * 2 : damage);
			assert.equal(battle.log.filter(line => line.includes('crashed into the rocks')).length, 1);
		});
	}
	for (const ability of ['Rock Head', 'Magic Guard', 'Long Reach', 'Unseen Fist']) {
		it(`exempts ${ability} from Rocky Protect crash damage`, () => {
			const [source, target] = setup('tackle', ability);
			battle.field.startTerrain('rockyterrain');
			battle.makeChoices('move tackle', 'move protect');
			assert.equal(source.hp, source.maxhp);
			assert.equal(target.hp === target.maxhp, ability !== 'Unseen Fist');
		});
	}
	for (const [move, field] of [['swift', 'rockyterrain'], ['rockslide', 'rockyterrain'], ['tackle', 'grassyterrain'], ['feint', 'rockyterrain']]) {
		it(`does not charge a Rocky Protect crash for ${move} on ${field}`, () => {
			const [source] = setup(move);
			battle.field.startTerrain(field);
			battle.makeChoices(`move ${move}`, 'move protect');
			assert.equal(source.hp, source.maxhp);
		});
	}
	for (const bothProtected of [false, true]) {
		it(`charges a Rocky spread contact move once when ${bothProtected ? 'both foes' : 'one foe'} Protect`, () => {
			battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [
				[{species: 'Mew', ability: 'No Ability', moves: ['breakingswipe']}, {species: 'Mew', ability: 'No Ability', moves: ['splash']}],
				[{species: 'Mew', ability: 'No Ability', moves: ['protect', 'splash']}, {species: 'Mew', ability: 'No Ability', moves: ['protect', 'splash']}],
			]);
			battle.makeChoices('team 12', 'team 12');
			battle.field.startTerrain('rockyterrain');
			const source = battle.p1.active[0];
			battle.makeChoices('move breakingswipe, move splash', `move protect, move ${bothProtected ? 'protect' : 'splash'}`);
			assert.equal(source.maxhp - source.hp, Math.floor(source.baseMaxhp / 8));
			assert.equal(battle.log.filter(line => line.includes('crashed into the rocks')).length, 1);
		});
	}
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

	it('allows Cold Eclipse during harsh sun and keeps it during ordinary sun', () => {
		const [source] = setup(); battle.field.startTerrain('rockyterrain');
		battle.field.setWeather('desolateland', source);
		assert(battle.field.changeTerrain('coldeclipseterrain', source));
		battle.field.clearWeather(); battle.field.setWeather('sunnyday', source);
		battle.makeChoices(); battle.makeChoices();
		assert.equal(battle.field.terrain, 'coldeclipseterrain');
	});
	it('extends new hail to eight turns without refreshing the Eclipse timer', () => {
		const [source] = setup(); battle.field.setTerrain('coldeclipseterrain', source);
		assert.equal(battle.field.terrainState.duration, 5);
		battle.field.setWeather('hail', source);
		assert.equal(battle.field.weatherState.duration, 8);
		assert.equal(battle.field.terrainState.duration, 5);
	});
	it('doubles Ice Scales Defense once on Cold Eclipse', () => {
		const [source] = setup('splash', 'Ice Scales'); const def = source.getStat('def');
		battle.field.setTerrain('coldeclipseterrain', source); assert.equal(source.getStat('def'), def * 2);
	});
	for (const ability of ['Ascendance', 'Illusion', 'Ice Body', 'Pollen Bloom', 'Toxic Bloom'])it(ability + ' does not gain removed Cold Eclipse defenses', () => {
		const [source] = setup('splash', ability); const stats = ['def', 'spd', 'spe'].map(s => source.getStat(s));
		battle.field.setTerrain('coldeclipseterrain', source);
		assert.deepEqual(['def', 'spd', 'spe'].map(s => source.getStat(s)), stats);
	});
	for (const types of [['Ice'], ['Ghost'], ['Ice', 'Ghost'], ['Fire']])it(types.join('/') + ' receives the current Cold Eclipse type defenses', () => {
		const [source] = setup(); source.setType(types); const base = source.getStat('def');
		battle.field.setTerrain('coldeclipseterrain', source);
		const multiplier = types.length === 2 ? 1.44 : types[0] === 'Fire' ? 0.8 : 1.2;
		assert(Math.abs(source.getStat('def') - base * multiplier) <= 1);
		assert.equal(source.getStat('def'), source.getStat('spd'));
	});
	it('heals Ice Body once for one eighth in Cold Eclipse hail during a real turn', () => {
		const [source] = setup('splash', 'Ice Body'); battle.field.setWeather('hail', source);
		battle.field.setTerrain('coldeclipseterrain', source); source.hp = 100;
		battle.makeChoices(); assert.equal(source.hp, 100 + Math.floor(source.baseMaxhp / 8));
	});
	it('doubles Dragon move power without adding Dragon defenses', () => {
		const [source, target] = setup(); source.setType('Dragon'); const def = source.getStat('def');
		battle.field.setTerrain('coldeclipseterrain', source);
		assert.equal(source.getStat('def'), def);
		assert.equal(battle.runEvent('BasePower', source, target, Dex.getActiveMove('dragonclaw'), 100), 200);
	});
	for (const ability of ['Thick Fat', 'Pollen Bloom', 'Toxic Bloom', 'Ice Body', 'Mind Freeze', 'Full Metal Body', 'Prism Armor', 'Shadow Shield', 'Dark Aura', 'Duskilate', 'Armorize'])it(ability + ' retains its own hail immunity', () => {
		const [source] = setup('splash', ability); battle.field.setTerrain('coldeclipseterrain', source);
		battle.field.setWeather('hail', source); assert.equal(source.runStatusImmunity('hail'), false);
	});
	it('Illusion itself does not prevent hail', () => {
		const [p] = setup('splash', 'Illusion');
		battle.field.setTerrain('coldeclipseterrain', p);
		assert.equal(p.runStatusImmunity('hail'), true);
	});
	for (const rainFirst of [true, false])it('keeps rain independent of Cold Eclipse, rain first: ' + rainFirst, () => {
		const [source] = setup(); if (rainFirst)battle.field.setWeather('raindance', source);
		battle.field.setTerrain('coldeclipseterrain', source); if (!rainFirst)battle.field.setWeather('raindance', source);
		battle.makeChoices(); assert.equal(battle.field.weather, 'raindance'); assert(!battle.field.pseudoWeather.watersport);
	});
	it('preserves independently used Water Sport', () => {
		const [p] = setup();
		battle.field.setTerrain('coldeclipseterrain', p);
		battle.field.addPseudoWeather('watersport', p, Dex.moves.get('watersport'));
		battle.field.setWeather('raindance', p);
		assert.equal(battle.field.pseudoWeather.watersport.duration, 5);
	});
	for (const outcome of ['miss', 'protect', 'hit'])it('Cold Eclipse heating respects ' + outcome, () => {
		const [source] = setup('heatwave'); battle.field.setTerrain('coldeclipseterrain', source);
		if (outcome === 'miss')battle.onEvent('Accuracy', battle.format, () => 0);
		if (outcome === 'hit')battle.onEvent('Accuracy', battle.format, () => true);
		battle.makeChoices('move heatwave', outcome === 'protect' ? 'move protect' : 'move splash');
		assert.equal(battle.field.terrain, outcome === 'hit' ? 'rifteclipseterrain' : 'coldeclipseterrain');
	});
	for (const field of ['coldeclipseterrain', 'infernaleclipseterrain'])it('completed Geomancy changes ' + field + ' to permanent Starlight', () => {
		const [source] = setup('geomancy'); battle.field.setTerrain(field, source);
		battle.makeChoices(); assert.equal(battle.field.terrain, field);
		battle.makeChoices();
		assert.equal(source.boosts.spa, 2);
		assert.equal(battle.field.terrain, 'starlightarenaterrain');
		assert.equal(battle.field.terrainState.duration, undefined);
	});
	it('Power Herb Geomancy changes the field on its only turn', () => {
		const [source] = setup('geomancy'); source.setItem('Power Herb'); battle.field.setTerrain('coldeclipseterrain', source);
		battle.makeChoices(); assert.equal(source.boosts.spa, 2); assert.equal(battle.field.terrain, 'starlightarenaterrain');
	});
	it('missed Light of Ruin does not change Cold Eclipse', () => {
		const [p] = setup('lightofruin');
		battle.field.setTerrain('coldeclipseterrain', p);
		battle.onEvent('Accuracy', battle.format, () => 0);
		battle.makeChoices();
		assert.equal(battle.field.terrain, 'coldeclipseterrain');
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
