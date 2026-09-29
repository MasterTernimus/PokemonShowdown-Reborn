'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const { Battle } = require('../../../dist/sim');
const { State } = require('../../../dist/sim/state');

describe('Multiplayer and snapshot audit regressions', () => {
	let battle;
	let restored;
	afterEach(() => {
		battle?.destroy();
		restored?.destroy();
		battle = restored = null;
	});

	function startCourt(players) {
		const teams = [
			[{ species: 'Mew', moves: ['reflect', 'protect'] }],
			[{ species: 'Cinderace', moves: ['courtchange', 'protect'] }],
			[{ species: 'Mew', moves: ['lightscreen', 'protect'] }],
		];
		if (players === 4) teams.push([{ species: 'Magikarp', moves: ['splash'] }]);
		battle = common.createBattle({ formatid: `gen9freeforall${players}pwatersurface` }, teams);
		battle.makeChoices(...teams.map(() => 'team 1'));
	}

	for (const players of [3, 4]) {
		it(`rotates Court Change conditions without loss in ${players}-player FFA`, () => {
			startCourt(players);
			const fourth = players === 4 ? ['move splash'] : [];
			battle.makeChoices('move reflect', 'move protect', 'move lightscreen', ...fourth);
			const reflect = battle.p1.sideConditions.reflect;
			const lightScreen = battle.p3.sideConditions.lightscreen;
			battle.makeChoices('move protect', 'move courtchange', 'move protect', ...fourth);
			const reflectSide = players === 3 ? battle.p2 : battle.p4;
			const screenSide = battle.p1;
			assert(reflectSide.sideConditions.reflect === reflect, 'Reflect rotates to the next configured clockwise side');
			assert(screenSide.sideConditions.lightscreen === lightScreen, 'Light Screen rotates back to p1');
			assert(reflect.target === reflectSide);
			assert(lightScreen.target === screenSide);
			assert.equal(battle.sides.filter(side => side.sideConditions.reflect).length, 1);
			assert.equal(battle.sides.filter(side => side.sideConditions.lightscreen).length, 1);
			assert.equal(battle.turn, 3);
		});

		it(`fails Court Change normally when ${players}-player FFA has no transferable conditions`, () => {
			startCourt(players);
			battle.makeChoices('move protect', 'move courtchange', 'move protect', ...(players === 4 ? ['move splash'] : []));
			assert.equal(battle.turn, 2);
			assert(battle.log.some(line => line.startsWith('|-fail|p2a: Cinderace')));
		});

		it(`handles an eliminated side during Court Change in ${players}-player FFA`, () => {
			startCourt(players);
			const fourth = players === 4 ? ['move splash'] : [];
			battle.makeChoices('move reflect', 'move protect', 'move protect', ...fourth);
			battle.p3.active[0].faint();
			battle.faintMessages();
			battle.makeChoices('move protect', 'move courtchange', '', ...fourth);
			assert.equal(battle.turn, 3);
			assert.equal(battle.sides.filter(side => side.sideConditions.reflect).length, 1);
		});
	}

	function startSnapshot(formatid) {
		battle = common.createBattle({ formatid }, [
			[{ species: 'Mew', ability: 'Synchronize', moves: ['grassyterrain', 'heatwave', 'tailwind', 'recover'] }],
			[{ species: 'Blissey', ability: 'Natural Cure', moves: ['softboiled'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
	}

	function roundTrip() {
		restored = Battle.fromJSON(JSON.stringify(battle));
		restored.restart(() => {});
		assertSameState();
	}

	function assertSameState() {
		// JSON omits undefined object properties; compare the actual wire format.
		assert.deepEqual(State.normalize(JSON.parse(JSON.stringify(restored))), State.normalize(JSON.parse(JSON.stringify(battle))));
	}

	for (const formatid of ['gen9nofieldsinglesgame', 'gen9wastelandfield']) {
		it(`round-trips ${formatid} and continues the same battle`, () => {
			startSnapshot(formatid);
			roundTrip();
			if (battle.field.terrainState.terrainChanges) {
				assert(restored.field.terrainState.terrainChanges instanceof Map);
			}
			for (let i = 0; i < 3; i++) {
				battle.makeChoices('move recover', 'move softboiled');
				restored.makeChoices('move recover', 'move softboiled');
				assertSameState();
			}
		});
	}

	it('preserves stacked terrain Maps, source references, and active-state identity', () => {
		startSnapshot('gen9nofieldsinglesgame');
		battle.makeChoices('move grassyterrain', 'move softboiled');
		battle.makeChoices('move heatwave', 'move softboiled');
		assert(battle.field.terrainStack.length > 1);
		for (const [index, state] of battle.field.terrainStack.entries()) state.terrainChanges.set('audit-counter', index + 1);
		roundTrip();
		assert(restored.field.terrainState === restored.field.terrainStack[0]);
		for (const [index, state] of restored.field.terrainStack.entries()) {
			assert(state.terrainChanges instanceof Map);
			assert.equal(state.terrainChanges.get('audit-counter'), index + 1);
			assert(state.terrainChanges !== battle.field.terrainStack[index].terrainChanges);
		}
		const grassyState = restored.field.terrainStack.find(state => state.id === 'grassyterrain');
		assert(grassyState.source === restored.p1.active[0]);
		for (const move of ['tailwind', 'recover', 'recover', 'recover', 'recover']) {
			battle.makeChoices(`move ${move}`, 'move softboiled');
			restored.makeChoices(`move ${move}`, 'move softboiled');
			assertSameState();
			if (restored.field.terrain) assert(restored.field.terrainState === restored.field.terrainStack[0]);
		}
	});

	it('continues to reject unknown complex state outside supported terrain Maps', () => {
		startSnapshot('gen9nofieldsinglesgame');
		battle.unhandledMap = new Map();
		assert.throws(() => battle.toJSON(), /Unsupported type Map/);
	});
});
