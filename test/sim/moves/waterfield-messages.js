'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Water field messages', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	function createWaterBattle() {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Mew', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}

	function assertMessage(message) {
		assert(battle.log.includes(`|-message|${message}`), `Expected message: ${message}`);
	}

	it('announces each water field when it starts', () => {
		for (const [terrain, message] of [
			['watersurfaceterrain', "The water's surface is calm."],
			['underwaterterrain', 'Blub blub...'],
			['murkwatersurfaceterrain', 'The water is tainted...'],
		]) {
			const [source] = createWaterBattle();
			battle.field.setTerrain(terrain, source);
			assertMessage(message);
			battle.destroy();
			battle = null;
		}
	});

	it('announces water field messages during terrain transitions', () => {
		const [source] = createWaterBattle();
		battle.field.changeTerrain('watersurfaceterrain', source);
		battle.field.changeTerrain('underwaterterrain', source);
		battle.field.changeTerrain('murkwatersurfaceterrain', source);
		assertMessage("The water's surface is calm.");
		assertMessage('Blub blub...');
		assertMessage('The water is tainted...');
	});

	it('announces Water Surface move, type, and ground messages', () => {
		const [source, target] = createWaterBattle();
		battle.field.changeTerrain('watersurfaceterrain', source);
		battle.runEvent('BasePower', source, target, battle.dex.moves.get('splishysplash'), 90, true);
		assertMessage('The attack rode the current!');
		assertMessage('The water strengthened the attack!');

		const groundMove = battle.dex.moves.get('earthquake');
		assert.equal(battle.runEvent('TryMove', source, target, groundMove), false);
		assertMessage('...But there was no solid ground to attack from!');
	});

	it('announces Underwater move, type, and weather messages', () => {
		const [source, target] = createWaterBattle();
		battle.field.changeTerrain('underwaterterrain', source);
		battle.runEvent('BasePower', source, target, battle.dex.moves.get('jetpunch'), 60, true);
		battle.runEvent('BasePower', source, target, battle.dex.moves.get('thunderbolt'), 90, true);
		assertMessage('Jet-streamed!');
		assertMessage('The water super-conducted the attack!');

		const weatherMove = battle.dex.moves.get('sunnyday');
		battle.runEvent('TryMove', source, target, weatherMove);
		assertMessage("You're too deep to notice the weather!");
	});

	it('announces Murkwater move and type messages', () => {
		const [source, target] = createWaterBattle();
		battle.field.changeTerrain('murkwatersurfaceterrain', source);
		battle.runEvent('BasePower', source, target, battle.dex.moves.get('mudbomb'), 65, true);
		battle.runEvent('BasePower', source, target, battle.dex.moves.get('brine'), 65, true);
		battle.runEvent('BasePower', source, target, battle.dex.moves.get('thunderbolt'), 90, true);
		assertMessage('The toxic water strengthened the attack!');
		assertMessage('Stinging!');
		assertMessage('The toxic water conducted the attack!');

		const groundMove = battle.dex.moves.get('earthquake');
		assert.equal(battle.runEvent('TryMove', source, target, groundMove), false);
		assertMessage('...But there was no solid ground to attack from!');
	});
});
