'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const { Dex, TeamValidator } = require('../../../dist/sim');
const { AbilityComponents } = require('../../../dist/data/ability-components');

describe('Milotic-Terajuma Tidal Poise', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = undefined; });
	function start(ability = 'Tidal Poise', foeAbility = 'No Ability') {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Milotic-Terajuma', ability, moves: ['aquatail', 'tailsmash', 'tackle'] },
		], [{ species: 'Arcanine', ability: foeAbility, moves: ['splash', 'confuseray', 'tackle'] }]]);
		battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	function power(user, target, name) {
		const move = Dex.getActiveMove(name);
		return battle.runEvent('BasePower', user, target, move, 100, true);
	}
	it('replaces only the plain Whiplash slot and preserves Marvel Scale', () => {
		assert.deepEqual(Dex.species.get('miloticterajuma').abilities,
			{ 0: 'Prism Scale', 1: 'Tidal Poise', H: 'Queenly Majesty' });
		assert.deepEqual(Dex.species.get('miloticterajuma').passives, ['marvelscale']);
		assert.deepEqual(AbilityComponents.tidalpoise, ['whiplash', 'owntempo']);
		assert.equal(Dex.abilities.get('tidalpoise').num, 12062);
		assert.equal(Dex.abilities.all().filter(ability => ability.num === 12062).length, 1);
		assert.equal(new TeamValidator('gen9nofieldsinglesgame').validateSet({
			species: 'Milotic-Terajuma', ability: 'Tidal Poise', moves: ['aquatail'],
		}, {}), null);
	});
	it('raises accuracy exactly once and boosts both tail flags without boosting other moves', () => {
		const [user, target] = start();
		assert.equal(user.boosts.accuracy, 1);
		assert(user.hasAbility('whiplash'));
		assert(user.hasAbility('owntempo'));
		assert.equal(power(user, target, 'aquatail'), 150);
		assert.equal(power(user, target, 'tailsmash'), 150);
		assert.equal(power(user, target, 'tackle'), 100);
	});
	it('blocks Intimidate and confusion without preventing unrelated stat drops', () => {
		const [user, target] = start('Tidal Poise', 'Intimidate');
		assert.equal(user.boosts.atk, 0);
		battle.actions.useMove('confuseray', target, { target: user });
		assert(!user.volatiles.confusion);
		battle.boost({ atk: -1 }, user, target, Dex.moves.get('growl'));
		assert.equal(user.boosts.atk, -1);
	});
	it('cures existing confusion when the ability is gained', () => {
		const [user, target] = start('No Ability');
		assert(user.addVolatile('confusion', target));
		user.setAbility('Tidal Poise');
		battle.eachEvent('Update');
		assert(!user.volatiles.confusion);
	});
	it('loses its active components under Gastro Acid but retains the species passive', () => {
		const [user, target] = start();
		assert(user.addVolatile('gastroacid', target));
		assert.equal(power(user, target, 'aquatail'), 100);
		assert(user.addVolatile('confusion', target));
		user.setStatus('par', target);
		assert.equal(battle.runEvent('ModifyDef', user, target, null, 100), 150);
	});
	it('does not change the standalone abilities or ordinary Milotic', () => {
		assert(!Object.values(Dex.species.get('milotic').abilities).includes('Tidal Poise'));
		const [user, target] = start('Whiplash');
		assert.equal(user.boosts.accuracy, 1);
		assert.equal(power(user, target, 'aquatail'), 150);
		assert(!user.hasAbility('owntempo'));
		assert(user.addVolatile('confusion', target));
	});
});
