'use strict';

const assert = require('node:assert/strict');
const common = require('../../common');
const { Dex, TeamValidator } = require('../../../dist/sim');

describe('Kanto starter Mega signatures', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });

	for (const [species, item, branch, form, base, name] of [
		['Charizard', 'Charizardite X', 'mega', 'Charizard-Mega-X', 'flareblitz', 'Cinder Rush'],
		['Charizard', 'Charizardite X', 'megay', 'Charizard-Mega-Y', 'heatwave', 'Corona Flare'],
		['Charizard', 'Charizardite Y', 'megax', 'Charizard-Mega-X', 'flareblitz', 'Cinder Rush'],
		['Charizard', 'Charizardite Y', 'mega', 'Charizard-Mega-Y', 'heatwave', 'Corona Flare'],
		['Charizard-Alt', 'Charizardite X', 'mega', 'Charizard-Mega-X-Alt', 'flareblitz', 'Cinder Rush'],
		['Charizard-Alt', 'Charizardite Y', 'mega', 'Charizard-Mega-Y', 'heatwave', 'Corona Flare'],
		['Venusaur', 'Venusaurite', 'mega', 'Venusaur-Mega', 'sludgebomb', 'Blight Bloom'],
		['Blastoise', 'Blastoisinite', 'mega', 'Blastoise-Mega', 'waterpulse', 'Broadside'],
	]) {
		it(species + ' with ' + item + ' can use ' + name + ' as ' + form, () => {
			const set = { species, item, ability: Dex.species.get(species).abilities[0], moves: [base],
				nature: 'Serious', evs: { hp: 252, spa: 252 } };
			const format = 'gen9nofieldsinglesgame';
			assert.equal(new TeamValidator(format + '@@@Obtainable Abilities,Obtainable Moves').validateTeam([set]), null);
			battle = common.createBattle({ formatid: format }, [
				[set], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
			]);
			battle.makeChoices('team 1', 'team 1');
			const user = battle.p1.active[0], foe = battle.p2.active[0];
			user.hp = user.baseMaxhp = user.maxhp = foe.hp = foe.baseMaxhp = foe.maxhp = 8000;
			const before = user.getMoves()[0];
			assert.equal(before.move, Dex.moves.get(base).name);
			battle.makeChoices('move 1 ' + branch, 'move splash');
			assert.equal(user.species.name, form);
			assert.equal(user.lastMoveUsed.name, name);
			assert.equal(user.lastMoveUsed.id, base);
			assert.equal(user.getMoves()[0].pp, before.pp - 1);
			const move = user.lastMoveUsed;
			if (base === 'flareblitz') {
				assert.deepEqual(move.recoil, [1, 4]);
				assert(move.flags.defrost);
				assert(move.flags.contact);
			} else if (base === 'heatwave') {
				assert.equal(move.accuracy, 100);
				assert.equal(move.target, 'allAdjacentFoes');
			} else if (base === 'waterpulse') {
				assert.equal(move.basePower, 75);
				assert.equal(move.type, 'Water');
				assert.equal(move.hit, 2);
				assert(move.flags.pulse);
				assert(!move.ignorePositiveEvasion);
				assert.deepEqual(move.secondary, Dex.moves.get('waterpulse').secondary);
			} else {
				assert(!move.drain);
				foe.status = 'tox';
				const startingHP = user.hp = Math.floor(user.maxhp / 2);
				const startHP = foe.hp;
				battle.actions.useMove(base, user, { target: foe });
				const damage = startHP - foe.hp;
				assert(damage > 0);
				assert.equal(user.hp - startingHP, Math.round(damage / 4));
			}
		});
	}

	it('Broadside keeps Water Pulse’s Underwater boost, adaptive category and both Bombardment accuracy checks', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Blastoise', item: 'Blastoisinite', moves: ['waterpulse', 'flashcannon'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		const user = battle.p1.active[0], foe = battle.p2.active[0];
		const use = name => {
			battle.actions.useMove(name, user, { target: foe });
			battle.clearActiveMove();
			return user.lastMoveUsed;
		};
		foe.hp = foe.maxhp = 10000;
		battle.randomChance = (n, d) => n / d >= 0.8;
		foe.boosts.evasion = 6;
		assert.equal(use('waterpulse').name, 'Water Pulse');
		assert.equal(foe.hp, 10000);
		user.formeChange('Blastoise-Mega', user.getItem(), true);
		assert.equal(user.getMoves()[1].move, 'Flash Cannon');
		user.storedStats.atk = 300;
		user.storedStats.spa = 100;
		for (let layer = 0; layer < 3; layer++) user.side.addSideCondition('spikes', foe);
		use('waterpulse');
		assert.equal(foe.hp, 10000);
		assert.equal(user.side.sideConditions.spikes.layers, 3);
		foe.boosts.evasion = 0;
		const move = use('waterpulse');
		assert.equal(move.category, 'Physical');
		assert.equal(move.hit, 2);
		assert.equal(user.side.sideConditions.spikes.layers, 2);
		assert(foe.hp < 10000);
		foe.hp = 10000;
		user.boosts.accuracy = -2;
		use('waterpulse');
		assert.equal(foe.hp, 10000);
		assert.equal(user.side.sideConditions.spikes.layers, 2);
		foe.boosts.evasion = -2;
		assert.equal(use('waterpulse').hit, 2);
		assert(foe.hp < 10000);
		user.storedStats.spa = 400;
		battle.randomizer = damage => damage;
		foe.hp = 10000;
		use('broadside');
		const neutralDamage = 10000 - foe.hp;
		foe.hp = 10000;
		battle.field.startTerrain('underwaterterrain');
		assert.equal(use('broadside').category, 'Special');
		// Underwater boosts both Water typing and Water Pulse by 1.5× each.
		assert(10000 - foe.hp > 2 * neutralDamage);
		assert(battle.log.some(line => line.includes('Jet-streamed!')));
		assert.equal(use('flashcannon').name, 'Flash Cannon');
	});

	it('Blight Bloom checks the poison status of the foe that takes the hit after Follow Me', () => {
		const filler = { species: 'Mew', ability: 'No Ability', moves: ['splash'] };
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[{ species: 'Venusaur', item: 'Venusaurite', moves: ['sludgebomb'] }, filler],
			[filler, { ...filler, species: 'Snorlax' }],
		]);
		battle.makeChoices('team 12', 'team 12');
		const user = battle.p1.active[0], [chosen, actual] = battle.p2.active;
		user.formeChange('Venusaur-Mega', Dex.items.get('venusaurite'), true);
		const startingHP = user.hp = Math.floor(user.maxhp / 2);
		actual.addVolatile('followme', actual);
		for (const poisoned of [false, true]) {
			chosen.status = poisoned ? '' : 'psn';
			actual.status = poisoned ? 'psn' : '';
			const oldHP = actual.hp = actual.maxhp = 8000;
			const chosenHP = chosen.hp;
			battle.actions.useMove('sludgebomb', user, { target: chosen });
			battle.clearActiveMove();
			assert.equal(chosen.hp, chosenHP);
			assert(actual.hp < oldHP);
			assert.equal(user.hp - startingHP, poisoned ? Math.round((oldHP - actual.hp) / 4) : 0);
		}
	});
});
