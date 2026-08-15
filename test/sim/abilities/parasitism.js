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
		assert.equal(parasect.baseStats.spe, 20);
		assert.deepEqual(parasite.types, ['Ghost', 'Poison']);
		assert.deepEqual(parasite.baseStats, {hp: 90, atk: 130, def: 70, spa: 30, spd: 70, spe: 110});
		assert.equal(Object.values(parasite.baseStats).reduce((sum, stat) => sum + stat, 0), 500);
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

	it('should not inflict status when struck by a damaging attack', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame', forceRandomChance: true}, [[
			{species: 'Parasect', ability: 'parasitism', moves: ['splash']},
		], [
			{species: 'Mewtwo', ability: 'pressure', moves: ['psyshock']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices();
		assert.equal(battle.p2.active[0].status, '');
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

	it('should fake-faint once, fully revive, and transform without attacking', function () {
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
		parasect.addVolatile('taunt');
		battle.boost({atk: 2, def: -1}, parasect, parasect);
		battle.makeChoices('move splash', 'move aerialace');

		assert.species(parasect, 'Parasect-Parasite');
		assert.equal(parasect.ability, 'resuscitation');
		assert.fullHP(parasect);
		assert.equal(parasect.boosts.atk, 0, 'Resuscitation should clear positive stat boosts');
		assert.equal(parasect.boosts.def, 0, 'Resuscitation should clear negative stat boosts');
		assert(battle.log.some(line => line.startsWith('|-clearboost|p1a: Parasect')),
			'Resuscitation should tell clients to clear displayed stat boosts');
		assert.equal(parasect.status, '', 'Resuscitation should cure the revived Pokemon');
		assert.false(parasect.volatiles.confusion, 'Resuscitation should clear copied volatiles');
		assert.false(parasect.volatiles.taunt, 'Resuscitation should clear move-restricting volatiles');
		assert.equal(parasect.lastMove, null, 'Resuscitation should clear the previous move state');
		assert(!battle.log.some(line => line.includes('|Giga Impact|')), 'Resuscitation should not select a move');
		assert.fullHP(battle.p2.active[0]);
		assert(parasect.hasAbility('magicguard'));
		assert(parasect.hasAbility('selfrepair'));
		assert.false(parasect.hasAbility('shadowshield'));

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

		assert(parasect.volatiles['resuscitationpending'], 'Residual damage should schedule the revival');
		battle.makeChoices('auto', 'move splash');
		assert.species(parasect, 'Parasect-Parasite');
		assert.false(parasect.volatiles['resuscitationpending'], 'Residual damage should not leave a pending revival stuck');
		assert.false(parasect.volatiles['twoturnmove'], 'Residual handling should clear the old charge state');
	});
});
