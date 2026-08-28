'use strict';

const assert = require('./../assert');
const common = require('./../common');

let battle;

describe('Custom alts and Haunted field rules', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('should expose the renamed Deso cosmetics with their base battle identity', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		for (const [baseName, altName] of [
			['Mightyena', 'Mightyena-Deso'],
			['Toxicroak', 'Toxicroak-Deso'],
			['Cinccino', 'Cinccino-Deso'],
		]) {
			const base = battle.dex.species.get(baseName);
			const alt = battle.dex.species.get(altName);
			assert(base.otherFormes.includes(altName));
			assert.equal(alt.baseSpecies, baseName);
			assert.equal(alt.forme, 'Deso');
			assert.deepEqual(alt.types, base.types);
			assert.deepEqual(alt.abilities, base.abilities);
		}
		assert.equal(battle.dex.species.get('Mightyena-Alt').name, 'Mightyena-Deso');
		assert.equal(battle.dex.species.get('Toxicroak-Alt').name, 'Toxicroak-Deso');
		assert.equal(battle.dex.species.get('Cinccino-Alt').name, 'Cinccino-Deso');
	});

	it('should replace Regenerator on Blastoise with Bulletproof', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const abilities = battle.dex.species.get('Blastoise').abilities;
		assert.equal(abilities[1], 'Bulletproof');
		assert.false(Object.values(abilities).includes('Regenerator'));
	});

	it('should apply the requested ability and learnset updates', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		assert.equal(battle.dex.species.get('Obstagoon').abilities[0], 'Violent Rush');
		assert.deepEqual(battle.dex.species.get('Manectric').baseStats, {
			hp: 70, atk: 110, def: 65, spa: 125, spd: 65, spe: 105,
		});
		assert.deepEqual(battle.dex.species.get('Manectric-Mega').baseStats, {
			hp: 70, atk: 120, def: 80, spa: 135, spd: 80, spe: 155,
		});
		assert(battle.dex.species.getLearnsetData('tyranitar').learnset.knockoff);
		assert(battle.dex.species.getLearnsetData('drifblim').learnset.flamethrower);
		const hitmonlee = battle.dex.species.getLearnsetData('hitmonlee').learnset;
		assert(hitmonlee.accelerock);
		assert.equal(hitmonlee.accelrock, undefined);
	});

	it('should prevent core terrains and Cold Eclipse from forming in Haunted Terrain', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Mew', ability: 'synchronize', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'synchronize', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const source = battle.p1.active[0];
		assert(battle.field.setTerrain('hauntedterrain', source));
		for (const terrain of [
			'electricterrain', 'grassyterrain', 'mistyterrain', 'psychicterrain', 'coldeclipseterrain',
		]) {
			assert.false(battle.field.canSetTerrain(terrain, source));
			assert.false(battle.field.setTerrain(terrain, source));
			assert.false(battle.field.changeTerrain(terrain, source));
			assert(battle.field.isTerrain('hauntedterrain'));
		}
	});

	it('should disable Battle Fervor, Ultra Ego, and Ultra Instinct in Haunted Terrain', function () {
		battle = common.createBattle({formatid: 'gen9hauntedfield'}, [[
			{species: 'Toxicroak', ability: 'battlefervor', moves: ['splash']},
			{species: 'Dracovish', ability: 'ultraego', moves: ['splash']},
			{species: 'Gallade', ability: 'ultrainstinct', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'noguard', moves: ['pound', 'fakeout', 'splash']},
			{species: 'Mew', ability: 'noguard', moves: ['fakeout', 'splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const toxicroak = battle.p1.active[0];
		battle.makeChoices('move splash', 'move pound');
		assert.statStage(toxicroak, 'atk', 0);
		assert.statStage(toxicroak, 'spa', 0);

		battle.makeChoices('switch 2', 'move splash');
		const dracovish = battle.p1.active[0];
		battle.directDamage(100, dracovish);
		const hp = dracovish.hp;
		battle.makeChoices('move splash', 'move splash');
		assert.equal(dracovish.hp, hp);

		battle.makeChoices('switch 3', 'switch 2');
		battle.makeChoices('move splash', 'move fakeout');
		assert(battle.log.some(line => line.includes('|cant|p1a: Gallade|flinch')));
	});

	it('should retain both Mega Absol on-faint Doom Desire casts', function () {
		for (const [ability, category] of [['doomwarning', 'Special'], ['omenedge', 'Physical']]) {
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
				{species: 'Absol-Mega', ability, moves: ['splash']},
				{species: 'Mew', ability: 'synchronize', moves: ['splash']},
			], [
				{species: 'Mew', ability: 'synchronize', moves: ['splash']},
			]]);
			battle.makeChoices('team 1', 'team 1');
			const absol = battle.p1.active[0];
			const target = battle.p2.active[0];
			absol.faint(target, battle.dex.moves.get('pound'));
			battle.faintMessages();
			const futureMove = target.side.slotConditions[target.position].futuremove;
			assert(futureMove);
			assert.equal(futureMove.move, 'doomdesire');
			assert.equal(futureMove.moveData.category, category);
			battle.destroy();
			battle = null;
		}
	});
});
