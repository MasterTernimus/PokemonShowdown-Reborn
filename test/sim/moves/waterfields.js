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
});
