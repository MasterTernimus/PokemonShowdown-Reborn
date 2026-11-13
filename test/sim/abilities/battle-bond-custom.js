'use strict';

const assert = require('../../assert');
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

let battle;

describe('Battle Bond custom Greninja behavior', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	for (const [species, form, ability] of [
		['Garchomp', 'garchompbattlebond', 'apexbond'],
		['Greninja', 'greninjaash', 'shadowbond'],
		['Arcanine', 'arcaninebattlebond', 'sacredbond'],
	]) {
		it(`${ability} never heals on a transformation KO or a later KO`, () => {
			battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
				{ species, ability: 'Battle Bond', moves: ['tackle'] },
			], Array.from({ length: 3 }, () => ({ species: 'Mew', ability: 'No Ability', moves: ['splash'] }))]);
			battle.makeChoices('team 1', 'team 123');
			const user = battle.p1.active[0];
			user.hp = Math.floor(user.maxhp / 2);
			const before = user.hp;
			for (let i = 0; i < 2; i++) {
				if (i) battle.actions.switchIn(battle.p2.pokemon.find(p => p.hp && !p.isActive), 0);
				const target = battle.p2.active[0];
				target.hp = 1;
				const move = Object.assign(Dex.getActiveMove('tackle'), { accuracy: true, damage: 10 });
				const logStart = battle.log.length;
				battle.actions.runMove(move, user, user.getLocOf(target), { externalMove: true });
				assert.equal(target.hp, 0);
				assert.equal(user.species.id, form);
				assert.equal(user.ability, ability);
				assert.equal(user.hp, before, battle.log.slice(logStart).join('\n'));
				assert(!battle.log.slice(logStart).some(line => line.startsWith('|-heal|')));
			}
			battle.singleEvent('Residual', user.getAbility(), user.abilityState, user);
			assert.equal(user.hp, before + Math.floor(user.baseMaxhp / 16));
		});
	}

	it('gives regular Greninja only the requested normal ability slots', () => {
		assert.deepEqual(Dex.species.get('Greninja').abilities, {
			0: 'Guardian Tide', 1: 'Protean', H: 'Shadow Screen', S: 'Battle Bond',
		});
	});

	it('transforms regular Greninja into Ash-Greninja after its own KO without stat boosts', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Greninja', ability: 'Battle Bond', moves: ['surf'] },
		], [
			{ species: 'Mew', level: 1, moves: ['splash'] },
			{ species: 'Pikachu', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		assert.equal(battle.p1.active[0].species.id, 'greninja');
		battle.makeChoices('move surf', 'move splash');

		const greninja = battle.p1.active[0];
		assert.equal(greninja.species.id, 'greninjaash');
		assert.deepEqual(greninja.boosts, {
			atk: 0, def: 0, spa: 0, spd: 0, spe: 0, accuracy: 0, evasion: 0,
		});
		assert.equal(greninja.bondTriggered, true);
		assert(battle.log.some(line => line.includes('ability: Battle Bond')));
	});
});
