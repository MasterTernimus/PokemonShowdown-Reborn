'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

let battle;

describe('Verdant Sanctuary Mega Arboliva', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('has the requested Mega profile and evolves only with Arbolivite', () => {
		const mega = Dex.species.get('Arboliva-Mega');
		assert.deepEqual(mega.types, ['Grass', 'Normal']);
		assert.deepEqual(mega.baseStats, { hp: 78, atk: 69, def: 135, spa: 135, spd: 154, spe: 39 });
		assert.equal(Object.values(mega.baseStats).reduce((sum, stat) => sum + stat, 0), 610);
		assert.deepEqual(mega.abilities, { 0: 'Verdant Sanctuary' });
		assert.equal(mega.requiredItem, 'Arbolivite');
		assert.equal(Dex.items.get('Arbolivite').megaStone.Arboliva, 'Arboliva-Mega');
		for (const component of ['grassysurge', 'invigorate', 'hospitality', 'friendguard']) {
			assert(Dex.abilities.get('Verdant Sanctuary').exists, `Missing composite ability for ${component}`);
		}
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Arboliva', item: 'Arbolivite', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		assert.equal(battle.actions.canMegaEvo(battle.p1.active[0]), 'Arboliva-Mega');
		battle.makeChoices('move splash mega', 'move splash');
		const arboliva = battle.p1.active[0];
		assert.equal(arboliva.species.id, 'arbolivamega');
		assert.equal(arboliva.ability, 'verdantsanctuary');
		assert(battle.field.isTerrain('grassyterrain'));
		for (const component of ['grassysurge', 'invigorate', 'hospitality', 'friendguard']) {
			assert(arboliva.hasAbility(component), `Missing ${component} effect`);
		}
	});

	it('heals an ally on Mega Evolution and protects it with Friend Guard', () => {
		battle = common.createBattle({ formatid: 'gen9doublesflowergarden' }, [[
			{ species: 'Arboliva', item: 'Arbolivite', moves: ['splash'] },
			{ species: 'Mew', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
			{ species: 'Mew', moves: ['splash'] },
		]]);
		if (!battle.p1.active[0]) battle.makeChoices('team 1, 2', 'team 1, 2');
		const ally = battle.p1.active[1];
		ally.hp = Math.floor(ally.maxhp / 2);
		const before = ally.hp;
		battle.makeChoices('move splash mega, move splash', 'move splash, move splash');
		assert.equal(battle.p1.active[0].species.id, 'arbolivamega');
		assert(ally.hp > before, `Hospitality did not heal ally: ${before} -> ${ally.hp}`);
		const holder = battle.p1.active[0];
		const foe = battle.p2.active[0];
		const move = battle.dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('ModifyDamage', foe, ally, move, 100), 75);
		assert.equal(battle.runEvent('TryHeal', ally, holder, null, 100), 130);
		ally.setStatus('brn');
		const randomChance = battle.randomChance;
		battle.randomChance = () => true;
		battle.singleEvent('Residual', holder.getAbility(), holder.abilityState, holder);
		battle.randomChance = randomChance;
		assert.equal(ally.status, '');
	});
});
