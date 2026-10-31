'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
let battle;

function setup(field = 'rockyterrain', item = '') {
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
		[{species: 'Mew', ability: 'noability', item, moves: ['riftopening', 'splash', 'trickroom', 'magicroom']}],
		[{species: 'Mew', ability: 'noability', moves: ['riftopening', 'splash', 'taunt']}],
	]);
	battle.makeChoices('team 1', 'team 1');
	if (field) battle.field.startTerrain(field);
	const p = battle.p1.active[0], q = battle.p2.active[0];
	for (const pokemon of [p, q]) pokemon.hp = pokemon.maxhp = pokemon.baseMaxhp = 10000;
	return [p, q];
}
function use(pokemon, id = 'riftopening') {
	battle.actions.runMove(Dex.getActiveMove(id), pokemon);
}

describe('Rift Opening Aura creation and development', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const [item, turns] of [['', 5], ['amplifieldrock', 8]]) {
		it(`creates the full field on an empty battlefield for ${turns} turns`, () => {
			const [p] = setup('', item);
			use(p);
			assert.equal(battle.field.terrain, 'rifteclipseterrain');
			assert.equal(battle.field.terrainState.duration, turns);
			assert.equal(battle.field.auraField, '');
		});
		it(`uses two ordinary turns to develop an Aura without restarting its ${turns}-turn clock`, () => {
			const [p] = setup('rockyterrain', item);
			const pp = p.getMoveData('riftopening').pp;
			battle.makeChoices('move riftopening', 'move splash');
			assert.equal(battle.field.terrain, 'rockyterrain');
			assert.equal(battle.field.auraField, 'riftaura');
			assert.equal(battle.field.auraTurns, turns - 1);
			assert.equal(p.getMoveData('riftopening').pp, pp - 1);
			battle.makeChoices('move riftopening', 'move splash');
			assert.equal(battle.field.terrain, 'rifteclipseterrain');
			assert.equal(battle.field.auraField, '');
			assert.equal(battle.field.terrainState.duration, turns - 2);
			assert.equal(p.getMoveData('riftopening').pp, pp - 2);
			for (let i = 0; i < turns - 2; i++) battle.makeChoices('move splash', 'move splash');
			assert.equal(battle.field.terrain, 'rockyterrain');
			assert.equal(battle.field.auraField, '');
		});
	}
	for (const field of ['coldeclipseterrain', 'infernaleclipseterrain']) {
		it(`creates an Aura first over ${field}, then develops with the Aura timer`, () => {
			const [p] = setup(field);
			battle.field.setTerrainDuration(7);
			use(p);
			assert.equal(battle.field.terrain, field);
			assert.equal(battle.field.terrainState.duration, 7);
			assert.equal(battle.field.auraField, 'riftaura');
			assert.equal(battle.field.auraTurns, 5);
			battle.field.auraTurns = 3;
			use(p);
			assert.equal(battle.field.terrain, 'rifteclipseterrain');
			assert.equal(battle.field.terrainState.duration, 3);
			assert.equal(battle.field.auraField, '');
		});
	}
	it('allows the opposing nonholder to develop an ability-created Aura', () => {
		const [p, q] = setup();
		q.setAbility('riftherald');
		assert.equal(battle.field.auraState.source, q);
		battle.field.auraTurns = 3;
		use(p);
		assert.equal(p.ability, 'noability');
		assert.equal(battle.field.terrain, 'rifteclipseterrain');
		assert.equal(battle.field.terrainState.duration, 3);
		assert.equal(battle.field.auraField, '');
	});
	it('allows a suppressed Rift Herald holder to develop an already-created Aura using the move', () => {
		const [p, q] = setup();
		p.setAbility('riftherald');
		p.addVolatile('gastroacid', q);
		battle.field.auraTurns = 2;
		use(p);
		assert(p.ignoringAbility());
		assert.equal(battle.field.terrain, 'rifteclipseterrain');
		assert.equal(battle.field.terrainState.duration, 2);
		assert.equal(battle.field.auraField, '');
	});
	it('develops an existing Aura on no field instead of creating a fresh full-field clock', () => {
		const [p] = setup('', 'amplifieldrock');
		battle.field.setAura('riftaura', 2, p, Dex.moves.get('riftopening'));
		use(p);
		assert.equal(battle.field.terrain, 'rifteclipseterrain');
		assert.equal(battle.field.terrainState.duration, 2);
		assert.equal(battle.field.auraField, '');
	});
	for (const field of ['dragonsdenterrain', 'newworldterrain', 'underwaterterrain', 'midnightzoneterrain', 'flowergarden1']) {
		it(`cannot create an Aura on ${field}`, () => {
			const [p] = setup(field);
			use(p);
			assert.equal(battle.field.terrain, field);
			assert.equal(battle.field.auraField, '');
		});
	}
	for (const field of ['chessboardterrain', 'hauntedterrain', 'bewitchedwoodsterrain', 'glitchterrain']) {
		it(`preserves the Aura when ${field} blocks development`, () => {
			const [p] = setup(field);
			use(p);
			assert.equal(battle.field.auraField, 'riftaura');
			battle.field.auraTurns = 3;
			const state = battle.field.auraState;
			use(p);
			assert.equal(battle.field.terrain, field);
			assert.equal(battle.field.auraField, 'riftaura');
			assert.equal(battle.field.auraState, state);
			assert.equal(battle.field.auraTurns, 3);
		});
	}
	for (const lock of ['neutralization', 'pulseblockade', 'badseeds', 'ashenseeds']) {
		it(`preserves the Aura and timer when ${lock} blocks development by a nonholder`, () => {
			const field = lock === 'badseeds' ? 'coldeclipseterrain' : lock === 'ashenseeds' ? 'infernaleclipseterrain' : 'rockyterrain';
			const [p, q] = setup(field);
			use(p);
			q.setAbility(lock);
			const previousField = battle.field.terrain;
			const state = battle.field.auraState;
			battle.field.auraTurns = 2;
			use(p);
			assert.equal(battle.field.terrain, previousField);
			assert.equal(battle.field.auraField, 'riftaura');
			assert.equal(battle.field.auraState, state);
			assert.equal(battle.field.auraTurns, 2);
		});
	}
	it('allows Aura creation through Neutralization but blocks development', () => {
		const [p, q] = setup();
		q.setAbility('neutralization');
		use(p);
		assert.equal(battle.field.terrain, 'rockyterrain');
		assert.equal(battle.field.auraField, 'riftaura');
		use(p);
		assert.equal(battle.field.terrain, 'rockyterrain');
		assert.equal(battle.field.auraField, 'riftaura');
	});
	it('does not create an Aura through Pulse Blockade', () => {
		const [p, q] = setup();
		q.setAbility('pulseblockade');
		const field = battle.field.terrain;
		use(p);
		assert.equal(battle.field.terrain, field);
		assert.equal(battle.field.auraField, '');
	});
	for (const aura of [false, true]) {
		it(`cannot ${aura ? 'develop' : 'create'} an Aura while Taunted`, () => {
			const [p, q] = setup();
			if (aura) {
				use(p);
				battle.field.auraTurns = 3;
			}
			const state = battle.field.auraState;
			p.addVolatile('taunt', q);
			use(p);
			assert.equal(battle.field.terrain, 'rockyterrain');
			assert.equal(battle.field.auraField, aura ? 'riftaura' : '');
			assert.equal(battle.field.auraState, state);
			assert.equal(battle.field.auraTurns, aura ? 3 : 0);
		});
	}
	it('does not refresh an existing full Rift Eclipse or create an Aura over it', () => {
		const [p] = setup('rifteclipseterrain', 'amplifieldrock');
		battle.field.setTerrainDuration(2);
		use(p);
		assert.equal(battle.field.terrain, 'rifteclipseterrain');
		assert.equal(battle.field.terrainState.duration, 2);
		assert.equal(battle.field.auraField, '');
		assert.equal(p.moveThisTurnResult, false);
	});
	it('keeps the combined Room trigger as a direct full-field route', () => {
		const [p] = setup();
		use(p, 'trickroom');
		use(p, 'magicroom');
		assert.equal(battle.field.terrain, 'rifteclipseterrain');
		assert.equal(battle.field.auraField, '');
	});
});
