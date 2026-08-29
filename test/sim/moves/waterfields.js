'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Water field move interactions', () => {
	afterEach(() => {
		battle?.destroy();
	});

	function assertDoubledBasePower(moveID) {
		const source = battle.p1.active[0];
		const target = battle.p2.active[0];
		const move = battle.dex.moves.get(moveID);
		const basePower = battle.runEvent('BasePower', source, target, move, move.basePower, true);
		assert.equal(basePower, battle.modify(move.basePower, 2), `${move.name} should be boosted by 2x`);
	}

	it('should boost Anchor Shot and Dragon Darts by 2x on Water Surface', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Mew', ability: 'steelworker', moves: ['anchorshot', 'dragondarts', 'splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash', 'move splash');
		battle.field.changeTerrain('watersurfaceterrain', battle.p1.active[0]);

		assertDoubledBasePower('anchorshot');
		assertDoubledBasePower('dragondarts');
		assert.equal(battle.log.filter(line => line === '|-message|From the depths!!').length, 2);
	});

	it('should boost Anchor Shot and Dragon Darts by 2x Underwater', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Mew', ability: 'steelworker', moves: ['anchorshot', 'dragondarts', 'splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash', 'move splash');
		battle.field.changeTerrain('underwaterterrain', battle.p1.active[0]);

		assertDoubledBasePower('anchorshot');
		assertDoubledBasePower('dragondarts');
		assert.equal(battle.log.filter(line => line === '|-message|From the depths!!').length, 2);
	});

	it('should stack the new Water Surface move boosts with existing boosts', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Mew', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		const source = battle.p1.active[0];
		const target = battle.p2.active[0];
		battle.field.changeTerrain('watersurfaceterrain', source);

		for (const [moveID, expected] of [
			['surf', 243], // Water x1.5, current x1.5, individual x1.2
			['octazooka', 117], // current x1.2 plus the move's Water-type field interaction
			['sludgewave', 114],
			['tripledive', 54],
		]) {
			const move = battle.dex.getActiveMove(moveID);
			assert.equal(
				battle.runEvent('BasePower', source, target, move, move.basePower, true),
				expected,
				`${move.name} should retain its existing boost and receive the new individual boost`
			);
		}
	});

	it('should make Underwater Dragon Darts and Grav Apple pure Water and boost them', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Mew', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		const source = battle.p1.active[0];
		const target = battle.p2.active[0];
		battle.field.changeTerrain('underwaterterrain', source);
		const terrain = battle.dex.conditions.get('underwaterterrain');

		for (const [moveID, expected] of [['dragondarts', 150], ['gravapple', 135]]) {
			const move = battle.dex.getActiveMove(moveID);
			battle.singleEvent('ModifyMove', terrain, battle.field.terrainState, move, source, target);
			assert.equal(move.type, 'Water');
			assert.equal(move.types, undefined);
			assert.equal(
				battle.runEvent('BasePower', source, target, move, move.basePower, true),
				expected,
				`${move.name} should receive its Underwater boost as a Water move`
			);
		}
	});

	it('should fail Tar Shot and Spicy Extract Underwater', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Mew', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		const source = battle.p1.active[0];
		const target = battle.p2.active[0];
		battle.field.changeTerrain('underwaterterrain', source);

		assert.equal(battle.runEvent('TryMove', source, target, battle.dex.moves.get('tarshot')), false);
		assert.equal(battle.runEvent('TryMove', source, target, battle.dex.moves.get('spicyextract')), false);
		assert(battle.log.includes('|-message|The tar washed off instantly!'));
		assert(battle.log.includes('|-message|The extract washed away!'));
	});

	it('should keep Cramorant Gulping through water-field changes', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Cramorant-Gorging', ability: 'gulpmissile', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		const cramorant = battle.p1.active[0];
		battle.field.changeTerrain('watersurfaceterrain', cramorant);
		assert.species(cramorant, 'Cramorant-Gulping');
		battle.field.changeTerrain('murkwatersurfaceterrain', cramorant);
		assert.species(cramorant, 'Cramorant-Gulping');
	});

	it('should make a Cramorant entering an active water field Gulping', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Cramorant-Gorging', ability: 'gulpmissile', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.field.changeTerrain('watersurfaceterrain', 'debug');
		battle.makeChoices('team 1', 'team 1');
		assert.species(battle.p1.active[0], 'Cramorant-Gulping');
	});

	it('should remove Spikes and Toxic Spikes when water fields begin', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Mew', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		const source = battle.p1.active[0];
		battle.p1.addSideCondition('spikes', source);
		battle.p2.addSideCondition('toxicspikes', source);
		battle.field.changeTerrain('watersurfaceterrain', source);
		assert.equal(battle.p1.sideConditions.spikes, undefined);
		assert.equal(battle.p2.sideConditions.toxicspikes, undefined);
		assert.equal(
			battle.log.filter(line => line === '|-message|...The spikes sank into the water and vanished!').length,
			2
		);
	});

	it('should return to Water Surface from Underwater with Shore Up', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Mew', moves: ['shoreup'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		const source = battle.p1.active[0];
		battle.field.changeTerrain('underwaterterrain', source);
		const move = battle.dex.getActiveMove('shoreup');
		move.onModifyType?.call(battle, move, source);
		assert.equal(move.type, 'Ground');
		move.onAfterMove?.call(battle, source);
		assert(battle.field.isTerrain('watersurfaceterrain'));
	});

	it('should clear Murkwater with Purify and Tidy Up', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Mew', moves: ['purify', 'tidyup'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		const source = battle.p1.active[0];
		battle.field.changeTerrain('murkwatersurfaceterrain', source);
		const purify = battle.dex.getActiveMove('purify');
		purify.onAfterMove?.call(battle, source);
		assert(battle.field.isTerrain('watersurfaceterrain'));

		battle.field.changeTerrain('murkwatersurfaceterrain', source);
		const tidyUp = battle.dex.getActiveMove('tidyup');
		tidyUp.onHit?.call(battle, source);
		tidyUp.onHit?.call(battle, source);
		assert(battle.field.isTerrain('watersurfaceterrain'));
	});

	it('should apply Water Surface and Murkwater G-Max Foam Burst stages', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Mew', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		const source = battle.p1.active[0];
		const target = battle.p2.active[0];
		const move = battle.dex.moves.get('gmaxfoamburst');
		battle.field.changeTerrain('watersurfaceterrain', source);
		move.self?.onHit?.call(battle, source);
		assert.statStage(target, 'spe', -3);
		battle.field.changeTerrain('murkwatersurfaceterrain', source);
		move.self?.onHit?.call(battle, source);
		assert.statStage(target, 'spe', -6);
	});

	it('should pull Water Surface into Underwater after Anchor Shot', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Mew', moves: ['anchorshot', 'splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash', 'move splash');
		battle.field.changeTerrain('watersurfaceterrain', battle.p1.active[0]);
		battle.makeChoices('move anchorshot', 'move splash');

		assert(battle.field.isTerrain('underwaterterrain'));
	});

	it('should preserve the native Icy Field transition after Subzero Slammer on Water Surface', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Mew', item: 'iciumz', moves: ['icebeam', 'splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash', 'move splash');
		battle.field.changeTerrain('watersurfaceterrain', battle.p1.active[0]);
		battle.makeChoices('move icebeam zmove', 'move splash');

		assert(battle.field.isTerrain('icyterrain'));
	});

	it('should apply Underwater Speed rules and activate Swift Swim', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Mew', ability: 'pressure', moves: ['splash'] },
		], [
			{ species: 'Mew', ability: 'swiftswim', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash', 'move splash');
		const pressuredMew = battle.p1.active[0];
		const swiftSwimMew = battle.p2.active[0];
		const baseSpeed = pressuredMew.getStat('spe');
		battle.field.changeTerrain('underwaterterrain', pressuredMew);

		assert.equal(pressuredMew.getStat('spe'), battle.modify(baseSpeed, 0.5));
		assert.equal(swiftSwimMew.getStat('spe'), battle.modify(baseSpeed, 2));
		pressuredMew.setAbility('steelworker');
		assert.equal(pressuredMew.getStat('spe'), baseSpeed);
	});

	it('should activate Swift Swim without a Water Surface Speed penalty', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Mew', ability: 'pressure', moves: ['splash'] },
		], [
			{ species: 'Mew', ability: 'swiftswim', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash', 'move splash');
		const pressuredMew = battle.p1.active[0];
		const swiftSwimMew = battle.p2.active[0];
		const baseSpeed = pressuredMew.getStat('spe');
		battle.field.changeTerrain('watersurfaceterrain', pressuredMew);

		assert.equal(pressuredMew.getStat('spe'), battle.modify(baseSpeed, 0.75));
		assert.equal(swiftSwimMew.getStat('spe'), battle.modify(baseSpeed, 2));
	});

	it('should activate Swift Swim without a Murkwater Speed penalty', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Mew', ability: 'pressure', moves: ['splash'] },
		], [
			{ species: 'Mew', ability: 'swiftswim', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash', 'move splash');
		const pressuredMew = battle.p1.active[0];
		const swiftSwimMew = battle.p2.active[0];
		const baseSpeed = pressuredMew.getStat('spe');
		battle.field.changeTerrain('murkwatersurfaceterrain', pressuredMew);

		assert.equal(pressuredMew.getStat('spe'), battle.modify(baseSpeed, 0.75));
		assert.equal(swiftSwimMew.getStat('spe'), battle.modify(baseSpeed, 2));
	});

	it('should emit valid Murkwater messages for Wave Crash', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Basculegion', ability: 'swiftswim', moves: ['wavecrash', 'splash'] },
		], [
			{ species: 'Cryogonal', ability: 'levitate', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash', 'move splash');
		battle.field.changeTerrain('murkwatersurfaceterrain', battle.p1.active[0]);
		battle.makeChoices('move wavecrash', 'move splash');
		const log = battle.log.join('\n');
		assert(log.includes('|-message|A toxic wave crashes down!'));
		assert(!log.includes('|-mesage|'));
	});

	it('should make Mud-Slap Water and Poison in Murkwater', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Mew', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		const source = battle.p1.active[0];
		const target = battle.p2.active[0];
		battle.field.changeTerrain('murkwatersurfaceterrain', source);
		const move = battle.dex.getActiveMove('mudslap');
		const terrain = battle.dex.conditions.get('murkwatersurfaceterrain');
		battle.singleEvent('ModifyMove', terrain, battle.field.terrainState, move, source, target);

		assert.equal(move.type, 'Water');
		assert.deepEqual(move.types, ['Water', 'Poison']);
		assert.equal(
			battle.runEvent('BasePower', source, target, move, move.basePower, true),
			battle.modify(move.basePower, 2.25)
		);
	});
});
