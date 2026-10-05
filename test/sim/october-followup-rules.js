'use strict';
const assert = require('assert').strict;
const common = require('../common');
const { Dex, TeamValidator, Teams } = require('../../dist/sim');
const { attributeZeroEVProblems } = require('../../dist/sim/team-validator');

describe('October follow-up rules', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function start(ability = 'No Ability', species = 'Mew') {
		battle = common.createBattle([[{ species, ability, moves: ['splash', 'boneclub', 'bonerush', 'bonemerang'] }],
			[{ species: 'Blissey', ability: 'No Ability', moves: ['splash', 'ember', 'protect'] }]]);
		const source = battle.p1.active[0], original = battle.actions.getDamage;
		battle.actions.getDamage = function (attacker, defender, move, ...args) {
			if (attacker === source && typeof move === 'object' && move.type) source.m.testMove = move;
			return original.call(this, attacker, defender, move, ...args);
		};
		return [source, battle.p2.active[0]];
	}
	for (const gameType of ['doubles', 'freeforall']) {
		it(`Pulse form restrictions and injured Camerupt faint are side-local in ${gameType}`, () => {
			const count = gameType === 'doubles' ? 2 : 4;
			const teams = Array.from({ length: count }, () => Array.from({ length: count === 2 ? 2 : 1 }, () =>
				({ species: 'Camerupt', ability: 'Sturdy', item: 'Anomaly Core', moves: ['splash', 'substitute'] })));
			battle = common.createBattle({ gameType }, teams);
			for (const [index, side] of battle.sides.entries()) {
				const p = side.active[0]; p.addVolatile('substitute');
				if (index % 2) p.hp--;
				const result = p.formeChange('Camerupt-Pulse', Dex.items.get('anomalycore'), true);
				assert.equal(result, index % 2 === 0);
				if (result) {
					assert.equal(p.hp, 1);
					assert(!p.volatiles.substitute);
				} else {
					assert.equal(p.hp, 0);
					assert(p.faintQueued);
				}
			}
			battle.faintMessages();
			for (const [index, side] of battle.sides.entries()) assert.equal(side.totalFainted, index % 2);
		});
	}
	it('Swalot entry preserves an existing aura', () => {
		const [p] = start('No Ability', 'Swalot');
		battle.field.aurasEnabled = true;
		battle.field.setTerrain('forestterrain', p);
		battle.field.setAura('electricterrain', 4, p, Dex.moves.get('electricterrain'));
		p.formeChange('Swalot-Pulse', Dex.items.get('anomalycore'), true);
		assert.equal(battle.field.terrain, 'murkwatersurfaceterrain');
		assert.equal(battle.field.auraField, 'electricterrain');
		assert.equal(battle.field.auraTurns, 4);
	});
	it('Swalot respects an active Pulse Blockade on Underwater', () => {
		const [p, foe] = start('No Ability', 'Swalot');
		battle.field.setTerrain('underwaterterrain', p);
		foe.setAbility('Pulse Blockade', null, null, true);
		p.formeChange('Swalot-Pulse', Dex.items.get('anomalycore'), true);
		assert.equal(battle.field.terrain, 'underwaterterrain');
		assert(battle.log.some(l => l.includes('ability: Pulse Blockade')));
	});
	it('Chandelure has three regular component abilities and Soul Fire only in its event slot', () => {
		const species = Dex.species.get('chandelure');
		assert.deepEqual(species.abilities, { 0: 'Soul Siphon', 1: 'Soul Pyre', H: 'Malice Well', S: 'Soul Fire' });
		for (const ability of Object.values(species.abilities)) {
			const result = new TeamValidator('gen9nofieldsinglesgame').validateTeam([
				{ species: 'Chandelure', ability, moves: ['shadowball'], evs: { spa: 252 }, nature: 'Modest' },
			]);
			assert.equal(result, null, ability + ': ' + result);
		}
	});
	for (const ability of ['Soul Siphon', 'Soul Cremation']) {
		it(`${ability} absorbs Fire once, grants exactly 1.5x boost, and clears it on ability loss`, () => {
			const [p, foe] = start(ability, 'Chandelure');
			const hp = p.hp;
			battle.actions.runMove('ember', foe, foe.getLocOf(p), { externalMove: true });
			assert.equal(p.hp, hp); assert(p.volatiles.flashfire); assert(p.hasAbility('flashfire'));
			const m = Dex.getActiveMove('ember');
			assert.equal(battle.runEvent('ModifySpA', p, foe, m, 100), 150);
			assert.equal(battle.log.filter(l => l.includes('|-start|') && l.includes('ability: Flash Fire')).length, 1);
			p.setAbility('No Ability'); assert(!p.volatiles.flashfire);
		});
		it(`${ability} Cold Eclipse entry stages and Fire absorption exception`, () => {
			const [p, foe] = start('No Ability', 'Chandelure');
			battle.field.setTerrain('coldeclipseterrain', p);
			const before = { ...p.boosts }; p.setAbility(ability);
			const stages = ability === 'Soul Cremation' ? 2 : 1;
			assert.equal(p.boosts.def - before.def, stages); assert.equal(p.boosts.spd - before.spd, stages);
			const hp = p.hp;
			battle.actions.runMove('ember', foe, foe.getLocOf(p), { externalMove: true });
			assert(p.hp < hp); assert(!p.volatiles.flashfire);
		});
		for (const field of ['burningterrain', 'volcanicterrain']) {
			it(`${ability} receives Flash Fire's ${field} residual activation once`, () => {
				const [p] = start(ability, 'Chandelure'); battle.field.setTerrain(field, p);
				battle.singleEvent('Residual', p.getAbility(), p.abilityState, p);
				assert(p.volatiles.flashfire);
				assert.equal(battle.log.filter(l => l.includes('|-start|') && l.includes('ability: Flash Fire')).length, 1);
			});
		}
	}
	for (const field of ['', 'watersurfaceterrain', 'murkwatersurfaceterrain', 'underwaterterrain', 'midnightzoneterrain', 'coldeclipseterrain']) {
		for (const id of ['boneclub', 'bonerush', 'bonemerang']) {
			it(`${id} remains Ground and damages grounded targets on ${field || 'no field'}`, () => {
				const [p, foe] = start(); if (field) battle.field.setTerrain(field, p);
				const m = Dex.getActiveMove(id); m.accuracy = true;
				const hp = foe.hp; battle.actions.runMove(m, p, p.getLocOf(foe), { externalMove: true });
				assert(foe.hp < hp, battle.log.join('\n'));
				assert.equal(p.m.testMove.type, 'Ground'); assert(!p.m.testMove.types || p.m.testMove.types.every(t => t === 'Ground'));
				if (id === 'bonemerang') assert(battle.log.some(l => l.includes('|-hitcount|') && l.endsWith('|2')));
			});
		}
	}
	for (const field of ['watersurfaceterrain', 'murkwatersurfaceterrain']) {
		it(`ordinary Earthquake still fails on ${field}`, () => {
			const [p, foe] = start(); battle.field.setTerrain(field, p); const hp = foe.hp;
			battle.actions.runMove('earthquake', p, p.getLocOf(foe), { externalMove: true }); assert.equal(foe.hp, hp);
		});
	}
	for (const field of ['', 'watersurfaceterrain']) {
		for (const protection of ['Flying', 'Levitate', 'Protect', 'Substitute']) {
			for (const id of ['boneclub', 'bonerush', 'bonemerang']) {
				it(`${id} preserves existing ${protection} interaction on ${field || 'no field'}`, () => {
					const [p, foe] = start();
					if (field) battle.field.setTerrain(field, p);
					if (protection === 'Flying') foe.setType('Flying');
					if (protection === 'Levitate') foe.setAbility('Levitate');
					if (protection === 'Protect') foe.addVolatile('protect');
					if (protection === 'Substitute') {
						foe.addVolatile('substitute');
						foe.volatiles.substitute.hp = 9999;
					}
					const hp = foe.hp;
					const move = Dex.getActiveMove(id); move.accuracy = true;
					battle.actions.runMove(move, p, p.getLocOf(foe), {externalMove: true});
					if (protection === 'Flying' || protection === 'Levitate') assert(foe.hp < hp);
					else assert.equal(foe.hp, hp);
				});
			}
		}
	}
	it('ability-driven non-Ground bone conversion remains intact', () => {
		const [p, foe] = start('Normalize'); battle.field.setTerrain('midnightzoneterrain', p);
		battle.actions.runMove('boneclub', p, p.getLocOf(foe), { externalMove: true });
		assert.equal(p.m.testMove.type, 'Normal');
	});
	it('Soul Fire does not acquire a new interaction with Ground bone moves', () => {
		const [p, foe] = start('Soul Fire'); foe.setAbility('Soul Fire'); battle.field.setTerrain('underwaterterrain', p);
		const hp = foe.hp; battle.actions.runMove('boneclub', p, p.getLocOf(foe), { externalMove: true });
		assert(foe.hp < hp); assert.equal(foe.status, ''); assert.equal(p.m.testMove.type, 'Ground');
	});
	it('zero-EV diagnostics retain the existing criteria and identify owner, team slot and Pokemon privately', () => {
		const validator = new TeamValidator('gen9nofieldsinglesgame@@@Obtainable');
		const set = { species: 'Mew', name: '<img src=x>', ability: 'Synchronize', moves: ['psychic'], evs: { hp: 0 }, nature: 'Serious' };
		const problems = validator.validateTeam([structuredClone(set)]);
		assert(problems.some(p => p.includes('Team slot 1 (Mew):') && p.includes('Mew') && p.includes('has exactly 0 EVs')));
		const attributed = attributeZeroEVProblems(problems, 'Alice');
		assert(attributed.some(p => p.startsWith('Player Alice: Team slot 1 (Mew):')));
		assert(!attributeZeroEVProblems(problems, 'Bob').some(p => p.includes('Player Alice:')));
		set.evs.hp = 1; assert.equal(validator.validateTeam([structuredClone(set)]), null);
		set.evs.hp = 0; set.level = 1;
		assert(!(validator.validateTeam([structuredClone(set)]) || []).some(p => p.includes('has exactly 0 EVs')));
		delete set.level;
		assert(!(new TeamValidator('gen9nofieldsinglesgame').validateTeam([structuredClone(set)]) || []).some(p => p.includes('has exactly 0 EVs')));
	});
	for (const gameType of ['doubles', 'freeforall']) {
		it(`mixed-limit battle warning identifies the correct player and team slot in ${gameType}`, () => {
			const count = gameType === 'doubles' ? 2 : 4;
			const teams = Array.from({ length: count }, (_, i) => Array.from({ length: count === 2 ? 2 : 1 }, () => ({ species: 'Mew', moves: ['splash'], evs: i % 2 ? { hp: 252, atk: 252, def: 252 } : { hp: 252 } })));
			battle = common.createBattle({ gameType }, teams);
			for (const [i, side] of battle.sides.entries()) side.name = 'Player' + i;
			const before = battle.log.length; battle.checkEVBalance(); const log = battle.log.slice(before).join('\n');
			assert(log.includes('Player1 (p2), team slot'));
			assert(!log.includes('Player0 (p1)')); assert(!log.includes('Mew')); assert(!log.includes('252'));
			if (count === 4) assert(log.includes('Player3 (p4), team slot 1'));
		});
	}
	it('async validation and batch tools attribute zero-EV errors to the submitting account', async () => {
		const { TeamValidatorAsync } = require('../../dist/server/team-validator-async');
		const { validateSavedTeams } = require('../../dist/server/chat-plugins/team-tools');
		const team = Teams.pack([{ species: 'Mew', ability: 'Synchronize', moves: ['psychic'], evs: { hp: 0 }, nature: 'Serious' }]);
		const result = await TeamValidatorAsync.get('gen9nofieldsinglesgame@@@Obtainable').validateTeam(team, { user: 'alice' });
		assert(result.includes('Player alice: Team slot 1 (Mew):'));
		const batch = validateSavedTeams([{ name: 'Example', format: 'gen9nofieldsinglesgame@@@Obtainable', team }], 'Bob');
		assert(batch[0].problems.some(p => p.startsWith('Player Bob: Team slot 1 (Mew):')));
	});
});
