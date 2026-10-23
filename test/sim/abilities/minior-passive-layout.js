'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
describe('Minior approved selectable abilities and Shields Down passive', () => {
	let b;
	afterEach(() => { b?.destroy(); b = null; });
	function setup(species = 'Minior-Blue', ability = 'Light Metal') {
		const m = { species: 'Mew', ability: 'No Ability', moves: ['splash', 'headsmash', 'tackle', 'explosion'] };
		b = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ ...m, species, ability }, m], [m, m],
		]);
		b.makeChoices('team 12', 'team 12');
		return [b.p1.active[0], b.p2.active[0]];
	}
	for (const species of ['Minior', 'Minior-Orange', 'Minior-Yellow', 'Minior-Green', 'Minior-Blue', 'Minior-Indigo', 'Minior-Violet']) {
		for (const ability of ['Light Metal', 'Self Repair', 'Brute Force']) {
			it(`${species} preserves ${ability} through core, Meteor and switching`, () => {
				const [p, q] = setup(species, ability);
				assert.deepEqual(p.species.abilities, { 0: 'Light Metal', 1: 'Self Repair', H: 'Brute Force' });
				assert.deepEqual(p.getPassives(), ['shieldsdown']);
				assert(!p.hasAbilityOrPassive('clearbody'));
				assert.equal(p.species.id, 'miniormeteor');
				p.hp = Math.floor(p.maxhp / 4);
				b.makeChoices('move splash', 'move splash');
				assert.equal(p.species.id, Dex.species.get(species).id);
				assert.equal(p.ability, Dex.abilities.get(ability).id);
				p.hp = p.maxhp;
				b.makeChoices('move splash', 'move splash');
				assert.equal(p.species.id, 'miniormeteor');
				assert.equal(p.ability, Dex.abilities.get(ability).id);
				b.makeChoices('switch 2', 'move splash');
				b.makeChoices('switch 2', 'move splash');
				assert.equal(p.ability, Dex.abilities.get(ability).id);
				b.boost({ atk: -1 }, p, q);
				assert.equal(p.boosts.atk, -1);
			});
		}
	}
	it('Self Repair heals above half before the passive restores Meteor', () => {
		const [p] = setup('Minior-Violet', 'Self Repair');
		p.hp = Math.floor(p.maxhp / 4);
		b.makeChoices('move splash', 'move splash');
		assert.equal(p.species.id, 'miniorviolet');
		p.hp = Math.floor(p.maxhp / 2);
		b.makeChoices('move splash', 'move splash');
		assert(p.hp > p.maxhp / 2);
		assert.equal(p.species.id, 'miniormeteor');
		assert.equal(p.ability, 'selfrepair');
		p.addVolatile('gastroacid');
		p.hp = Math.floor(p.maxhp / 4);
		const hp = p.hp;
		b.makeChoices('move splash', 'move splash');
		assert.equal(p.hp, hp);
		assert.equal(p.species.id, 'miniorviolet');
		p.hp = p.maxhp;
		b.makeChoices('move splash', 'move splash');
		assert.equal(p.species.id, 'miniormeteor');
		assert(!p.trySetStatus('par'));
	});
	it('Light Metal halves weight, boosts status-free Speed, and suppresses independently', () => {
		const [p] = setup();
		assert.equal(p.getWeight(), 200);
		assert.equal(b.runEvent('ModifySpe', p, null, null, 100), 125);
		b.field.setTerrain('factoryterrain', p);
		p.boosts.spe = 0;
		b.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(p.boosts.spe, 1);
		b.field.clearTerrain();
		p.addVolatile('gastroacid');
		assert.equal(p.getWeight(), 400);
		assert.equal(b.runEvent('ModifySpe', p, null, null, 100), 100);
		p.hp = Math.floor(p.maxhp / 4);
		b.makeChoices('move splash', 'move splash');
		assert.equal(p.species.id, 'miniorblue');
		p.removeVolatile('gastroacid');
		assert.equal(p.getWeight(), 1);
		p.setStatus('brn');
		assert.equal(b.runEvent('ModifySpe', p, null, null, 100), 100);
	});
	it('Brute Force boosts its supported moves, prevents recoil and retains Chessboard behavior', () => {
		const [p, q] = setup('Minior', 'Brute Force');
		for (const move of ['headsmash', 'doubleedge', 'takedown', 'explosion']) {
			assert.equal(b.runEvent('BasePower', p, q, Dex.getActiveMove(move), 100), 120);
		}
		assert.equal(b.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 100), 100);
		b.field.setTerrain('chessboardterrain', p);
		assert.equal(b.runEvent('BasePower', p, q, Dex.getActiveMove('headsmash'), 100), 144);
		assert.equal(b.runEvent('ModifyCritRatio', q, p, Dex.getActiveMove('tackle'), 1), 1);
		b.field.clearTerrain();
		p.hp = p.maxhp;
		q.hp = q.maxhp = q.baseMaxhp = 10000;
		b.randomChance = () => true;
		const hp = p.hp;
		b.actions.useMove('headsmash', p, { target: q });
		assert.equal(p.hp, hp);
		p.addVolatile('gastroacid');
		assert.equal(b.runEvent('BasePower', p, q, Dex.getActiveMove('headsmash'), 100), 100);
		b.actions.useMove('headsmash', p, { target: q });
		assert(p.hp < hp);
	});
	it('Crumbling Shell triggers once even with a legacy selected Shields Down', () => {
		const [p, q] = setup('Minior', 'Shields Down');
		b.actions.useMove('tackle', q, { target: p });
		assert.equal(b.log.filter(l => l.includes('ability: Crumbling Shell')).length, 1);
		assert(b.p2.sideConditions.stealthrock);
	});
});
