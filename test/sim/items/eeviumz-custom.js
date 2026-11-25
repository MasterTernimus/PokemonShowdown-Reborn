'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim/dex');
const { TeamValidator } = require('../../../dist/sim/team-validator');
const { CustomLearnsetRemovals } = require('../../../dist/data/learnsets');
describe('Eevee balance and Eevium Z', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	it('rejects every removed move on Starter, Alt and Divineon', () => {
		const validator = new TeamValidator('gen9nofieldsinglesgame@@@Obtainable Moves');
		for (const species of ['Eevee-Starter', 'Eevee-Starter-Alt', 'Divineon']) {
			for (const move of CustomLearnsetRemovals.eeveestarter) {
				const errors = validator.validateTeam([{ species, ability: 'Z Protean', moves: [move] }]);
				assert(errors?.some(error => /learn|incompatible|event/i.test(error)), species + ': ' + move);
			}
		}
	});
	for (const species of ['Eevee', 'Eevee-Starter', 'Eevee-Starter-Alt', 'Mew']) {
		it('applies both defenses only to supported Eevee holders: ' + species, () => {
			battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
				[{ species, ability: 'No Ability', item: 'Eevium Z', moves: ['splash'] }],
				[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
			]);
			battle.makeChoices('team 1', 'team 1');
			const p = battle.p1.active[0];
			for (const event of ['ModifyDef', 'ModifySpD']) assert.equal(battle.runEvent(event, p, null, null, 100), species === 'Mew' ? 100 : 150);
			p.hp -= 100; const hp = p.hp;
			battle.makeChoices('move splash', 'move splash');
			assert.equal(p.hp - hp, species === 'Mew' ? 0 : Math.floor(p.baseMaxhp / 16));
		});
	}

	for (const species of ['Eevee-Starter', 'Eevee-Starter-Alt']) {
		it(species + ' loses only the Eevium Z defense bonus when Sinister Blaze changes it into Abysseon', () => {
			battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
				[{ species, ability: 'Sinister Blaze', item: 'Eevium Z', moves: ['Last Resort'] }],
				[{ species: 'Mew', ability: 'No Ability', moves: ['Splash'] }],
			]);
			battle.makeChoices('team 1', 'team 1');
			const holder = battle.p1.active[0];
			assert.equal(holder.species.id, 'abysseon');
			for (const stat of ['def', 'spd']) {
				assert.equal(holder.getStat(stat), holder.getStat(stat, true, true), stat);
			}
			holder.hp -= 100;
			const hp = holder.hp;
			battle.singleEvent('Residual', holder.getItem(), holder.itemState, holder);
			assert.equal(holder.hp - hp, Math.floor(holder.baseMaxhp / 16));
		});
	}

	it('restores only each ability-specific exception pool', () => {
		const { StarterEeveeMoveExceptions } = require('../../../dist/data/eevee-ability-move-exceptions');
		const validator = new TeamValidator('gen9nofieldsinglesgame@@@Obtainable Moves');
		for (const species of ['Eevee-Starter', 'Eevee-Starter-Alt', 'Divineon']) {
			for (const [ability, moves] of Object.entries(StarterEeveeMoveExceptions)) {
				for (const move of moves) assert.equal(validator.validateTeam([{ species, ability, moves: [move] }]), null, species + '/' + ability + '/' + move);
				const errors = validator.validateTeam([{ species, ability, moves: ['victorydance'] }]);
				assert(errors?.some(error => /learn/i.test(error)));
			}
		}
	});
	it('preserves both Z-Move triggers', () => {
		assert.deepEqual(Dex.items.get('eeviumz').zMoveFrom, ['Last Resort', 'Veevee Volley']);
		assert.equal(Dex.items.get('eeviumz').zMove, 'Extreme Evoboost');
	});
});
