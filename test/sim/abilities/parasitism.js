'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Parasitism and Resuscitation', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('should expose the intended base and Parasite stats', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const parasect = battle.dex.species.get('Parasect');
		const parasite = battle.dex.species.get('Parasect-Parasite');
		assert.equal(parasect.baseStats.spe, 40);
		assert.deepEqual(parasite.types, ['Ghost', 'Poison']);
		assert.deepEqual(parasite.baseStats, {hp: 90, atk: 150, def: 65, spa: 50, spd: 65, spe: 130});
		assert.equal(Object.values(parasite.baseStats).reduce((sum, stat) => sum + stat, 0), 550);
	});

	it('should use the Parasitism battle appearance and Dry Skin rain recovery', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Parasect', ability: 'parasitism', moves: ['splash']},
		], [
			{species: 'Pelipper', ability: 'drizzle', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const parasect = battle.p1.active[0];
		assert.species(parasect, 'Parasect-Parasitism');
		parasect.sethp(parasect.maxhp - 100);
		const before = parasect.hp;
		battle.makeChoices();
		assert.equal(parasect.hp - before, Math.floor(parasect.maxhp / 8));
	});

	it('should not grant powder immunity and should not heal from Black Sludge', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Parasect', ability: 'parasitism', item: 'blacksludge', moves: ['splash']},
		], [
			{species: 'Breloom', ability: 'technician', moves: ['spore']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const parasect = battle.p1.active[0];
		parasect.sethp(Math.floor(parasect.maxhp / 2));
		const before = parasect.hp;
		battle.makeChoices();
		assert.equal(parasect.status, 'slp');
		assert.equal(before - parasect.hp, Math.floor(parasect.maxhp / 8));
	});

	it('should apply its 30% Effect Spore behavior to non-contact damaging attacks', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame', forceRandomChance: true}, [[
			{species: 'Parasect', ability: 'parasitism', moves: ['splash']},
		], [
			{species: 'Mewtwo', ability: 'pressure', moves: ['psyshock']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices();
		assert(battle.p2.active[0].status, 'A non-contact damaging move should trigger Parasitism\'s Effect Spore');
	});

	it('should only provide Magic Guard while above half HP', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Parasect', ability: 'parasitism', moves: ['splash']},
		], [
			{species: 'Tyranitar', ability: 'sandstream', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const parasect = battle.p1.active[0];
		parasect.sethp(parasect.maxhp - 1);
		const protectedHp = parasect.hp;
		battle.makeChoices();
		assert.equal(parasect.hp, protectedHp);

		parasect.sethp(Math.floor(parasect.maxhp / 2));
		const unprotectedHp = parasect.hp;
		battle.makeChoices();
		assert.equal(unprotectedHp - parasect.hp, Math.floor(parasect.maxhp / 16));
	});

	it('should not bypass Royal Decree boost prevention', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Parasect', ability: 'parasitism', moves: ['swordsdance']},
		], [
			{species: 'Serperior', ability: 'royaldecree', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices();
		assert.statStage(battle.p1.active[0], 'atk', 0);
	});

	it('should fake-faint once, fully revive, transform, and immediately use its strongest move', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Parasect', ability: 'parasitism', moves: ['gigaimpact', 'tackle', 'splash']},
		], [
			{species: 'Garganacl', ability: 'purifyingsalt', moves: ['aerialace']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const parasect = battle.p1.active[0];
		parasect.sethp(1);
		parasect.setStatus('brn');
		parasect.addVolatile('confusion');
		parasect.boost({atk: 2, def: -1});
		battle.makeChoices('move splash', 'move aerialace');

		assert.species(parasect, 'Parasect-Parasite');
		assert.equal(parasect.ability, 'resuscitation');
		assert.fullHP(parasect);
		assert.equal(parasect.boosts.atk, 0, 'Resuscitation should clear positive stat boosts');
		assert.equal(parasect.boosts.def, 0, 'Resuscitation should clear negative stat boosts');
		assert.equal(parasect.status, '', 'Resuscitation should cure the revived Pokemon');
		assert.false(parasect.volatiles.confusion, 'Resuscitation should clear copied volatiles');
		assert(battle.log.some(line => line.includes('|Giga Impact|')), 'Resuscitation should select Giga Impact');
		assert.false.fullHP(battle.p2.active[0]);
		assert(parasect.hasAbility('magicguard'));
		assert(parasect.hasAbility('selfrepair'));
		assert(parasect.hasAbility('shadowshield'));

		parasect.sethp(1);
		battle.makeChoices('auto', 'move aerialace');
		assert.fainted(parasect, 'Resuscitation should only revive Parasect once');
	});

	it('should protect a pending revival from later hits in doubles', function () {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species: 'Parasect', ability: 'parasitism', moves: ['tackle']},
			{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
		], [
			{species: 'Mewtwo', ability: 'pressure', moves: ['aerialace']},
			{species: 'Deoxys-Attack', ability: 'pressure', moves: ['aerialace']},
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');
		const parasect = battle.p1.active[0];
		parasect.sethp(1);
		battle.makeChoices('move tackle 1, move splash', 'move aerialace 1, move aerialace 1');
		assert.species(parasect, 'Parasect-Parasite');
		assert.fullHP(parasect);
		assert.false.fainted(parasect);
	});

	it('should clear Shadow Force state when residual damage triggers resuscitation', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Parasect', ability: 'parasitism', moves: ['shadowforce', 'tackle']},
		], [
			{species: 'Tyranitar', ability: 'sandstream', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const parasect = battle.p1.active[0];
		parasect.sethp(1);

		battle.makeChoices('move shadowforce', 'move splash');

		assert.species(parasect, 'Parasect-Parasite');
		assert.fullHP(parasect);
		assert(parasect.volatiles['twoturnmove'], 'The revival auto-move may create a fresh two-turn charge');
		assert(!battle.log.some(line => line.includes('|move|p1a: Parasect|Shadow Force||[still]')),
			'Revival should not inherit Shadow Force\'s old charge');

		battle.makeChoices('auto', 'move splash');
		assert(battle.log.some(line => line.includes('|move|p1a: Parasect|Shadow Force|')),
			'Revived Parasect should complete a fresh Shadow Force charge');
	});
});
