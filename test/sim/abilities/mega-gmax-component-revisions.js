'use strict';

const assert = require('assert').strict;
const common = require('../../common');

let battle;
function start(species, ability, foe = 'Blissey') {
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
		{species, ability, moves: ['splash', 'tackle']},
	], [{species: foe, ability: 'No Ability', moves: ['splash', 'tackle']}]]);
	battle.makeChoices('team 1', 'team 1');
	return [battle.p1.active[0], battle.p2.active[0]];
}

describe('Mega and G-Max component revisions', () => {
	afterEach(() => { battle?.destroy(); battle = null; });

	it('exposes the revised component lists and names on the roster', () => {
		const [holder] = start('Mew', 'No Ability');
		const expected = [
			['Emboar-Mega', 'Burning Ego', ['proficient', 'ultraego', 'flamebody', 'thickfat']],
			['Machamp-Gmax', 'Raging Fists', ['hydrabond', 'scrappy']],
			['Snorlax-Gmax', 'Mountain Hunger', ['sapsipper', 'thickfat', 'earlybird']],
			['Pyroar-Mega', 'Royal Sun', ['drought', 'supremeoverlord']],
			['Ampharos-Aevian-Mega', 'Absolute Zero', ['snowwarning', 'moldbreaker', 'filter']],
			['Chandelure-Mega', 'Soul Cremation', ['soulsiphon', 'flamebody']],
			['Dragalge-Mega', 'Toxic Renewal', ['adaptability', 'regenerator', 'poisontouch']],
			['Gardevoir-Mega-Z', 'Argent Devotion', ['armorize', 'swornduty', 'serenegrace']],
			['Gengar-Mega', 'Cruel Tag', ['shadowtag', 'infiltrator', 'baddreams']],
			['Glalie-Aevian-Mega', 'Moss Armor', ['stamina', 'naturalcure', 'levitate']],
			['Glalie-Mega', 'Freezer Burn', ['slushrush', 'refrigerate', 'strongjaw', 'levitate']],
			['Golurk-Mega', 'Phantom Fist', ['unseenfist', 'selfrepair', 'shadowshield', 'aftermath']],
			['Metagross-Mega', 'Cold Logic', ['toughclaws', 'prismarmor', 'aftermath', 'forewarn']],
			['Slowbro-Mega', 'Slow Clamp', ['shellarmor', 'owntempo', 'analytic', 'sweetveil']],
			['Copperajah-Gmax', 'Treasure Titan', ['filter', 'eartheater', 'heavymetal', 'intimidate']],
		];
		for (const [species, name, components] of expected) {
			assert.equal(battle.dex.species.get(species).abilities[0], name, species);
			holder.setAbility(name, holder, holder.getAbility(), true);
			for (const component of components) assert(holder.hasAbility(component), `${name} should expose ${component}`);
		}
		assert.equal(battle.dex.species.get('Copperajah').abilities[1], 'Water Absorb');
	});

	it('Absolute Zero starts Snow and no longer changes Fire/Ice type effectiveness', () => {
		const [holder] = start('Ampharos-Aevian-Mega', 'Absolute Zero');
		assert.equal(holder.ability, 'absolutezero');
		assert.equal(battle.field.weather, 'hail');
		assert.equal(holder.getAbility().onEffectiveness, undefined);
	});

	it('Royal Sun starts sun and gains Supreme Overlord power from fallen allies', () => {
		const [holder, foe] = start('Pyroar-Mega', 'Royal Sun');
		assert.equal(battle.field.weather, 'sunnyday');
		holder.side.totalFainted = 2;
		assert.equal(battle.runEvent('BasePower', holder, foe, battle.dex.getActiveMove('tackle'), 100), 120);
	});

	it('G-Max Sandaconda starts sand, triggers Sand Spit, and leaves Desert Field on faint', () => {
		const [holder, foe] = start('Sandaconda-Gmax', 'Dune Terror');
		assert.equal(battle.field.weather, 'sandstorm');
		battle.field.clearWeather();
		battle.singleEvent('DamagingHit', holder.getAbility(), holder.abilityState, holder, foe, battle.dex.getActiveMove('tackle'), 10);
		assert.equal(battle.field.weather, 'sandstorm');
		holder.faint();
		battle.faintMessages();
		assert.equal(battle.field.terrain, 'desertterrain');
		assert.equal(battle.field.terrainState.duration, 5);
	});

	it('Mega Slowbro blocks sleep through Sweet Veil and confusion through Own Tempo', () => {
		const [holder, foe] = start('Slowbro-Mega', 'Slow Clamp');
		assert(!holder.trySetStatus('slp', foe));
		assert(!holder.addVolatile('confusion', foe));
	});

	it('Mega Metagross reveals a foe move with Forewarn and uses Aftermath on contact knockout', () => {
		const [holder] = start('Metagross-Mega', 'Cold Logic');
		assert(battle.log.some(line => line.includes('ability: Forewarn')));
		assert(holder.getAbility().onDamagingHit);
	});

	it('Treasure Titan lowers an opposing Attack on entry', () => {
		const [, foe] = start('Copperajah-Gmax', 'Treasure Titan');
		assert.equal(foe.boosts.atk, -1);
	});

	it('Phantom Fist applies Shadow Shield at full HP and makes its attacks accurate', () => {
		const [holder, foe] = start('Golurk-Mega', 'Phantom Fist');
		assert.equal(battle.runEvent('SourceModifyDamage', holder, foe, battle.dex.getActiveMove('tackle'), 100), 50);
		const move = battle.dex.getActiveMove('dynamicpunch');
		battle.singleEvent('ModifyMove', holder.getAbility(), holder.abilityState, move, holder, foe);
		assert.equal(move.accuracy, true);
	});
});
