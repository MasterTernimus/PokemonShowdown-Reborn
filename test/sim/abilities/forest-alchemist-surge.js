'use strict';

const assert = require('assert').strict;
const common = require('../../common');

let battle;

describe('Forest Surge and Alchemist Surge', () => {
	afterEach(() => { battle?.destroy(); battle = null; });

	it('sets Forest and a five-turn Grassy Aura together on entry', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Mew', ability: 'Forest Surge', moves: ['splash']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		assert.equal(battle.field.terrain, 'forestterrain');
		assert.equal(battle.field.auraField, 'grassyterrain');
		assert.equal(battle.field.auraTurns, 5);
		assert.equal(battle.field.auraState.sourceEffect.id, 'forestsurge');
	});

	it('gives status moves Prankster priority while keeping Alchemist Surge effects', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Shuckle', ability: 'Alchemist Surge', moves: ['taunt']}],
			[{species: 'Deoxys-Speed', ability: 'No Ability', moves: ['tackle']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		const user = battle.p1.active[0];
		assert(user.hasAbility('prankster'));
		assert.equal(battle.field.terrain, 'psychicterrain');
		battle.makeChoices('move taunt', 'move tackle');
		const tauntIndex = battle.log.findIndex(line => line.includes('|move|') && line.includes('|Taunt|'));
		const tackleIndex = battle.log.findIndex(line => line.includes('|move|') && line.includes('|Tackle|'));
		assert(tauntIndex >= 0 && tackleIndex > tauntIndex);
	});
});
