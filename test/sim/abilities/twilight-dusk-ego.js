'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const { Dex, TeamValidator, Teams } = require('../../../dist/sim');
const { AbilityComponents, abilityIncludesComponent } = require('../../../dist/data/ability-components');
const { getAbilityDisplayComponents } = require('../../../dist/data/ability-display');

describe('Twilight Instinct and Dusk Ego', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(ability = 'Twilight Instinct') {
		const mon = selected => ({ species: 'Mew', ability: selected, moves: ['splash', 'tackle'] });
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[mon(ability)], [mon('No Ability')]]);
		battle.makeChoices('team 1', 'team 1');
		for (const side of battle.sides) {
			const pokemon = side.active[0];
			pokemon.hp = pokemon.maxhp = pokemon.baseMaxhp = 4000;
		}
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	it('retains one canonical legacy ID for both ability names', () => {
		const ability = Dex.abilities.get('Dusk Ego');
		assert(ability.exists);
		assert.equal(ability, Dex.abilities.get('Dusk Drive'));
		assert.equal(ability.id, 'duskdrive');
		assert.equal(ability.name, 'Dusk Ego');
		assert.equal(Dex.abilities.all().filter(entry => entry.num === ability.num).length, 1);
		assert.equal(Dex.species.get('Lycanroc-Dusk').abilities.H, 'Dusk Ego');
		assert.deepEqual(getAbilityDisplayComponents('Dusk Ego'), ['opportunist', 'ultraego']);
		assert(abilityIncludesComponent('Dusk Ego', 'Ultra Ego'));
	});
	for (const name of ['Dusk Drive', 'Dusk Ego']) {
		it(`accepts saved teams using ${name} and displays the new name`, () => {
			const team = Teams.unpack(Teams.pack(Teams.import(`Lycanroc-Dusk\nAbility: ${name}\n- Rock Slide`)));
			assert.equal(new TeamValidator('gen9nofieldsinglesgame').validateTeam(team), null);
			assert.equal(team[0].ability, 'Dusk Ego');
		});
	}
	it('does not let the renamed ability bypass Fighting Clause', () => {
		const rule = Dex.formats.get('fightingclause');
		for (const name of ['Dusk Drive', 'Dusk Ego']) {
			const result = rule.onValidateTeam.call({ dex: Dex, toID: Dex.toID }, [
				{ species: 'Lycanroc-Dusk', ability: name }, { species: 'Mew', ability: 'Battle Fervor' },
			]);
			assert(result.some(error => error.includes('Fighting Clause')));
			assert(result[0].includes('Dusk Ego'));
		}
	});
	it('keeps Dusk Ego retaliation and Opportunist under both names', () => {
		const [holder, foe] = setup('Dusk Ego');
		assert(holder.hasAbility('Dusk Drive'));
		assert(holder.hasAbility('Dusk Ego'));
		battle.actions.useMove('tackle', foe, { target: holder });
		assert.equal(holder.boosts.atk, 1);
		assert.equal(holder.boosts.spa, 1);
		battle.boost({ def: 2 }, foe, foe);
		battle.fieldEvent('Residual');
		assert.equal(holder.boosts.def, 2);
	});
	it('uses only Ultra Instinct and Keen Eye, with no Battle Fervor effects', () => {
		assert.deepEqual(AbilityComponents.twilightinstinct, ['ultrainstinct', 'keeneye']);
		const [holder, foe] = setup();
		assert(holder.hasAbility('ultrainstinct'));
		assert(holder.hasAbility('keeneye'));
		assert(!holder.hasAbility('battlefervor'));
		foe.setItem('sitrusberry');
		foe.hp = 1000;
		assert(foe.eatItem());
		assert.equal(foe.hp, 2000);
		battle.actions.useMove('tackle', foe, { target: holder });
		assert.equal(holder.boosts.atk, 0);
		assert.equal(holder.boosts.spa, 0);
	});
	it('prevents opposing accuracy drops and ignores evasion boosts', () => {
		const [holder, foe] = setup();
		battle.boost({ accuracy: -1 }, holder, foe, Dex.moves.get('sandattack'));
		assert.equal(holder.boosts.accuracy, 0);
		const move = Dex.getActiveMove('tackle');
		battle.runEvent('ModifyMove', holder, foe, move, move);
		assert.equal(move.ignoreEvasion, true);
		battle.boost({ accuracy: -1 }, holder, holder, Dex.moves.get('sandattack'));
		assert.equal(holder.boosts.accuracy, -1);
	});
	it('respects normal suppression for the Keen Eye component', () => {
		const [holder, foe] = setup();
		holder.addVolatile('gastroacid', foe);
		battle.boost({ accuracy: -1 }, holder, foe, Dex.moves.get('sandattack'));
		assert.equal(holder.boosts.accuracy, -1);
		const move = Dex.getActiveMove('tackle');
		battle.runEvent('ModifyMove', holder, foe, move, move);
		assert(!move.ignoreEvasion);
	});
	it('includes the local Keen Eye Mirror Arena effect', () => {
		const [holder] = setup('No Ability');
		battle.field.setTerrain('mirrorarenaterrain', holder);
		holder.setAbility('Twilight Instinct');
		assert.equal(holder.boosts.accuracy, 1);
		assert(holder.volatiles.laserfocus);
	});
});
