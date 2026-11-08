'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

const moves = ['Ice Ball', 'Rollout'];

for (const move of moves) {
	describe(move, function () {
		const id = move.toLowerCase().replace(/\W+/g, '');

		afterEach(function () {
			battle.destroy();
		});

		it('should double its Base Power every turn for five turns, then resets to 30 BP', function () {
			battle = common.createBattle([
				[{species: 'Shuckle', ability: 'gluttony', moves: [id]}],
				[{species: 'Steelix', ability: 'noguard', moves: ['recover']}],
			]);

			let ebp = 30;
			let count = 0;
			battle.onEvent('BasePower', battle.format, function (basePower) {
				count++;
				assert.equal(basePower, ebp);
				if (count % 5 === 0) {
					ebp = 30;
				} else {
					ebp *= 2;
				}
			});

			for (let i = 0; i < 8; i++) {
				battle.makeChoices('move ' + id, 'move recover');
			}
			assert.equal(count, 8);
		});

		it('should reset its Base Power if the move misses', function () {
			battle = common.createBattle([
				[{species: 'Shuckle', ability: 'gluttony', moves: [id]}],
				[{species: 'Steelix', ability: 'furcoat', moves: ['recover']}],
			]);

			let ebp = 30;
			let count = 0;
			battle.onEvent('Accuracy', battle.format, function (accuracy, target, pokemon, move) {
				if (move.id === 'recover') return;

				count++;
				if (count === 3) {
					ebp = 30;
					return false; // Imitate a miss
				} else {
					return true;
				}
			});
			battle.onEvent('BasePower', battle.format, function (basePower) {
				assert.equal(basePower, ebp);
				ebp *= 2;
			});

			for (let i = 0; i < 5; i++) {
				battle.makeChoices('move ' + id, 'move recover');
			}
			assert.equal(count, 5);
		});

		it('should reset its Base Power if the Pokemon is immobilized', function () {
			battle = common.createBattle([
				[{species: 'Shuckle', ability: 'gluttony', moves: [id]}],
				[{species: 'Steelix', ability: 'noguard', moves: ['recover']}],
			]);

			let ebp = 30;
			let count = 0;
			battle.onEvent('BeforeMove', battle.format, function (attacker, defender, move) {
				if (move.id === 'recover') return;

				count++;
				if (count === 3) {
					ebp = 30;
					return false; // Imitate immobilization from Paralysis, etc.
				}
			});
			battle.onEvent('BasePower', battle.format, function (basePower) {
				assert.equal(basePower, ebp);
				ebp *= 2;
			});

			for (let i = 0; i < 5; i++) {
				battle.makeChoices('move ' + id, 'move recover');
			}
			assert.equal(count, 5);
		});

		it('should have double Base Power if the Pokemon used Defense Curl earlier', function () {
			battle = common.createBattle([
				[{species: 'Shuckle', ability: 'gluttony', moves: [id, 'defensecurl']}],
				[{species: 'Steelix', ability: 'noguard', moves: ['recover']}],
			]);

			let runCount = 0;
			battle.onEvent('BasePower', battle.format, function (basePower) {
				assert.equal(basePower, 60);
				runCount++;
			});

			battle.makeChoices('move defensecurl', 'move recover');
			battle.makeChoices('move ' + id, 'move recover');
			assert.equal(runCount, 1);
		});

		it('should not be affected by Parental Bond', function () {
			battle = common.createBattle([
				[{species: 'Shuckle', ability: 'parentalbond', moves: [id]}],
				[{species: 'Steelix', ability: 'noguard', moves: ['recover']}],
			]);

			let hitCount = 0;
			battle.onEvent('BasePower', battle.format, function (basePower) {
				assert.equal(basePower, 30);
				hitCount++;
			});

			battle.makeChoices('move ' + id, 'move recover');
			assert.equal(hitCount, 1);
		});

		// Inspect power directly: this fork's stats and Battle Armor change HP damage.
		function observePower(moveid) {
			const powers = [];
			battle.onEvent('BasePower', battle.format, -100, (bp, source, target, move) => {
				if (move.id === moveid) powers.push({ target: target.species.id, bp });
			});
			return powers;
		}

		describe(`Rollout Storage glitch (Gen 7 / Gen 8DLC1)`, function () {
			it(`should delay the Rollout multiplier when hitting Disguise or Ice Face`, function () {
				battle = common.gen(7).createBattle([[
					{species: 'wynaut', ability: 'compoundeyes', ivs: {atk: '0'}, nature: 'bold', moves: [id, 'watergun']},
				], [
					{species: 'mimikyu', ability: 'disguise', evs: {hp: '252', def: '252'}, nature: 'bold', moves: ['gravity']},
					{species: 'snorlax', ability: 'battlearmor', moves: ['sleeptalk']},
					{species: 'wigglytuff', ability: 'battlearmor', moves: ['rest']},
				]]);

				const powers = observePower('watergun');
				for (let i = 0; i < 5; i++) { battle.makeChoices(); }
				battle.makeChoices('move watergun', 'switch 2');
				const snorlax = battle.p2.active[0];
				let damage = snorlax.maxhp - snorlax.hp;
				assert(damage > 0);
				assert.deepEqual(powers, [{ target: 'snorlax', bp: 40 * 2 ** 4 }]);
				battle.makeChoices("move watergun", "switch 3");
				const wigglytuff = battle.p2.active[0];
				damage = wigglytuff.maxhp - wigglytuff.hp;
				assert(damage > 0);
				assert.deepEqual(powers[1], { target: 'wigglytuff', bp: 40 });
			});

			it(`should delay the Rollout multiplier when hitting multiple Disguise or Ice Face`, function () {
				battle = common.gen(7).createBattle([[
					{species: 'wynaut', ability: 'compoundeyes', ivs: {atk: '0'}, nature: 'bold', moves: [id, 'watergun']},
				], [
					{species: 'mimikyu', ability: 'disguise', evs: {hp: '252', def: '252'}, nature: 'bold', moves: ['gravity']},
					{species: 'mimikyu', ability: 'disguise', evs: {hp: '252', def: '252'}, nature: 'bold', moves: ['gravity']},
					{species: 'snorlax', ability: 'battlearmor', moves: ['sleeptalk']},
				]]);

				const powers = observePower('watergun');
				battle.makeChoices();
				battle.makeChoices('auto', 'switch 2');
				for (let i = 0; i < 3; i++) { battle.makeChoices(); }
				battle.makeChoices('move watergun', 'switch 3');
				const snorlax = battle.p2.active[0];
				const damage = snorlax.maxhp - snorlax.hp;
				assert(damage > 0);
				assert.deepEqual(powers, [{ target: 'snorlax', bp: 40 * 2 ** 3 }]);
			});

			it(`should use the move's default BP when applying the modifier`, function () {
				battle = common.gen(7).createBattle([[
					{species: 'wynaut', ability: 'compoundeyes', ivs: {atk: '0'}, nature: 'bold', moves: [id, 'grassknot']},
				], [
					{species: 'mimikyu', ability: 'disguise', evs: {hp: '252', def: '252'}, nature: 'bold', moves: ['gravity']},
					{species: 'snorlax', ability: 'battlearmor', moves: ['sleeptalk']},
				]]);

				const powers = observePower('grassknot');
				for (let i = 0; i < 5; i++) { battle.makeChoices(); }
				battle.makeChoices('move grassknot', 'switch 2');
				const snorlax = battle.p2.active[0];
				const damage = snorlax.maxhp - snorlax.hp;
				assert(damage > 0);
				assert.deepEqual(powers, [{ target: 'snorlax', bp: 1 * 2 ** 4 }]);
			});

			it(`should only apply the Rollout Storage boost to the first target of a spread move`, function () {
				battle = common.gen(7).createBattle({gameType: 'doubles'}, [[
					{species: 'mimikyu', ability: 'disguise', evs: {hp: '252', def: '252'}, nature: 'bold', moves: ['gravity']},
					{species: 'wynaut', ability: 'compoundeyes', ivs: {atk: '0'}, nature: 'bold', moves: [id, 'snarl']},
				], [
					{species: 'snorlax', ability: 'battlearmor', moves: ['sleeptalk']},
					{species: 'hydreigon', ability: 'battlearmor', moves: ['sleeptalk']},
				]]);

				const powers = observePower('snarl');
				battle.makeChoices('move gravity, move ' + id + ' -1', 'auto');
				for (let i = 0; i < 4; i++) { battle.makeChoices(); }
				battle.makeChoices('move gravity, move snarl', 'auto');
				const snorlax = battle.p2.active[0];
				const snorlaxDamage = snorlax.maxhp - snorlax.hp;
				assert(snorlaxDamage > 0);

				const hydreigon = battle.p2.active[1];
				const hydreigonDamage = hydreigon.maxhp - hydreigon.hp;
				assert(hydreigonDamage > 0);
				assert.deepEqual(powers, [{ target: 'snorlax', bp: 55 * 2 ** 4 }, { target: 'hydreigon', bp: 55 }]);
			});
		});
	});
}
