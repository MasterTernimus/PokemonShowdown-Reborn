'use strict';

const assert = require('../../assert');
const common = require('../../common');

let battle;
describe('Ability description audit', () => {
	afterEach(() => { battle?.destroy(); battle = null; });

	it('has descriptions for every ability assigned to a current Pokémon', () => {
		const missing = [];
		for (const species of common.dex.species.all()) {
			for (const name of Object.values(species.abilities)) {
				if (!name) continue;
				const ability = common.dex.abilities.get(name);
				if (!ability.exists || !(ability.desc || ability.shortDesc)) missing.push(`${species.name}: ${name}`);
			}
		}
		assert.deepEqual(missing, []);
	});

	it('applies Void Veil’s described Fairy Tale entry boost', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Mismagius', ability: 'Void Veil', moves: ['splash']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.field.startTerrain('fairytaleterrain');
		battle.makeChoices('team 1', 'team 1');
		const mismagius = battle.p1.active[0];
		assert.statStage(mismagius, 'spd', 1);
		assert(!mismagius.isGrounded());
	});

	it('gives Unchecked Assault the described Striker kick bonus', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Mew', ability: 'Unchecked Assault', moves: ['highjumpkick']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		const user = battle.p1.active[0], foe = battle.p2.active[0];
		assert.equal(battle.runEvent('BasePower', user, foe, battle.dex.getActiveMove('highjumpkick'), 100), 140);
	});

	it('gives Neurotoxin Hydra Bond’s Dragon’s Den power bonus', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Mew', ability: 'Neurotoxin', moves: ['tackle']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		battle.field.startTerrain('dragonsdenterrain');
		const user = battle.p1.active[0], foe = battle.p2.active[0];
		assert.equal(battle.runEvent('BasePower', user, foe, battle.dex.getActiveMove('tackle'), 100), 120);
	});

	it('gives Alchemist Surge Prankster’s Dark-type immunity rule', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Mew', ability: 'Alchemist Surge', moves: ['taunt']}],
			[{species: 'Umbreon', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		battle.field.clearTerrain();
		battle.makeChoices('move taunt', 'move splash');
		assert(!battle.p2.active[0].volatiles['taunt']);
		assert(battle.log.some(line => line.includes('Dark is immune to Prankster moves')));
	});

	it('does not restore Venom Bastion’s removed weather immunity or Bug boost', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Mew', ability: 'Venom Bastion', moves: ['bugbuzz']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		const user = battle.p1.active[0], foe = battle.p2.active[0];
		assert.equal(battle.runEvent('Immunity', user, null, null, 'sandstorm'), 'sandstorm');
		assert.equal(battle.runEvent('BasePower', user, foe, battle.dex.getActiveMove('bugbuzz'), 100), 100);
	});
});
