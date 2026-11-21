'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex, TeamValidator } = require('../../../dist/sim');
describe('November move and ability corrections', () => {
	let battle;
	function start(ability = 'No Ability', species = 'Mew') {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species, ability, moves: ['tailsmash', 'irontail', 'terrainpulse', 'tackle'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	it('gives Tail Smash the same 15 base / 24 max PP as Iron Tail', () => {
		const [p] = start();
		assert.equal(Dex.moves.get('tailsmash').pp, Dex.moves.get('irontail').pp);
		assert.equal(p.moveSlots[0].maxpp, 24);
		assert.equal(p.moveSlots[1].maxpp, 24);
		battle.makeChoices('move tailsmash', 'move splash');
		assert.equal(p.moveSlots[0].pp, 23);
	});
	for (const format of ['gen9doublesrockyfield', 'gen9dragonsden']) {
		it('removes Accelerock from Rampardos in ' + format, () => {
			const validator = TeamValidator.get(format);
			assert(validator.format.exists);
			const filler = { species: 'Mew', moves: ['Protect'] };
			const team = [{ species: 'Rampardos', moves: ['Accelerock'] }, filler];
			assert(validator.validateTeam(team)?.some(error => /Accelerock/.test(error)));
			assert.equal(
				validator.validateTeam([{ species: 'Rampardos', moves: ['Head Smash'] }, filler]),
				null
			);
		});
	}
	it('maps every garden stage and Midnight Zone, including airborne users', () => {
		const [p] = start('Levitate');
		const data = Dex.moves.get('terrainpulse');
		for (const field of [
			'flowergarden1',
			'flowergarden2',
			'flowergarden3',
			'flowergarden4',
			'flowergarden5',
			'midnightzoneterrain',
		]) {
			battle.field.terrain = field;
			const move = Dex.getActiveMove('terrainpulse');
			data.onModifyType.call(battle, move, p);
			assert.equal(move.type, field === 'midnightzoneterrain' ? 'Water' : 'Grass');
		}
	});
	it('keeps New World random across all 18 types and lets an Aura override it', () => {
		const [p] = start();
		battle.field.terrain = 'newworldterrain';
		const data = Dex.moves.get('terrainpulse');
		const types = new Set();
		for (let i = 0; i < 18; i++) {
			battle.sample = list => list[i];
			const move = Dex.getActiveMove('terrainpulse');
			data.onModifyType.call(battle, move, p);
			types.add(move.type);
		}
		assert.equal(types.size, 18);
		assert(!types.has('???'));
		assert(!types.has('Stellar'));
		battle.field.getAura = () => ({ id: 'electricaura', mimicryType: 'Electric' });
		const move = Dex.getActiveMove('terrainpulse');
		data.onModifyType.call(battle, move, p);
		assert.equal(move.type, 'Electric');
	});
	for (const id of ['gildedarrow', 'gildedhelix']) {
		it(id + ' actually rolls its increased 1/8 critical-hit chance', () => {
			const [p, foe] = start();
			foe.hp = foe.maxhp = 10000;
			const rolls = [];
			battle.randomChance = (n, d) => {
				rolls.push([n, d]);
				return false;
			};
			battle.actions.useMove({ ...Dex.getActiveMove(id), accuracy: true }, p, { target: foe });
			assert(rolls.some(([n, d]) => n === 1 && d === 8));
		});
	}
	for (const [ability, species] of [
		["Mind's Eye", 'Mew'],
		['Aura Precision', 'Mew'],
		['No Ability', 'Lucario'],
	]) {
		it('removes added Fairy/Dark STAB from ' + ability + '/' + species, () => {
			const [p, foe] = start(ability, species);
			for (const id of ['darkpulse', 'dazzlinggleam']) {
				assert.equal(battle.runEvent('ModifySTAB', p, foe, Dex.getActiveMove(id), 1), 1);
			}
			const move = Dex.getActiveMove('tackle');
			battle.runEvent('ModifyMove', p, foe, move, move);
			assert(move.ignoreEvasion);
			assert(move.ignoreImmunity.Normal);
		});
	}
});
