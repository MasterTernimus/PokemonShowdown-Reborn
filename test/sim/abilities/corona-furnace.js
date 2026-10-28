'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
let battle;
function setup(species = 'Mew') {
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species, ability: 'Corona Furnace', moves: ['flamethrower', 'firepunch', 'psychic', 'splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
	battle.makeChoices('team 1', 'team 1');
	battle.randomizer = value => value;
	return [battle.p1.active[0], battle.p2.active[0]];
}
function damage(p, q, id, type) {
	const move = Dex.getActiveMove(id);
	move.willCrit = false;
	if (type) move.type = type;
	return battle.actions.getDamage(p, q, move);
}
describe('Mega Typhlosion Corona Furnace', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	it('keeps stats and Proficient while changing only Mega typing and selected ability', () => {
		const s = Dex.species.get('typhlosionmega');
		assert.deepEqual(s.types, ['Fire', 'Electric']);
		assert.deepEqual(s.abilities, { 0: 'Plasma Eruption' });
		assert.deepEqual(s.baseStats, { hp: 83, atk: 138, def: 85, spa: 139, spd: 70, spe: 130 });
		assert.deepEqual(s.passives, ['proficient']);
		for (const id of ['typhlosion', 'typhlosionalt', 'typhlosionhisui']) {
			const mon = Dex.species.get(id);
			assert.equal(mon.abilities[0], 'Blazing Mane');
			assert.deepEqual(mon.passives, ['blaze']);
		}
	});
	for (const [move, stat] of [['firepunch', 'def'], ['flamethrower', 'spd']]) it(move + ' ignores positive defensive stages and retains negative ones', () => {
		const [p, q] = setup();
		const neutral = damage(p, q, move);
		q.boosts[stat] = 4;
		assert.equal(damage(p, q, move), neutral);
		q.boosts[stat] = -2;
		const reduced = damage(p, q, move);
		assert(reduced > neutral);
		p.setAbility('No Ability');
		assert.equal(damage(p, q, move), reduced);
	});
	it('does not bypass for Psychic/non-Fire moves and uses effective converted typing', () => {
		const [p, q] = setup();
		const psychic = damage(p, q, 'psychic');
		q.boosts.spd = 4;
		assert(damage(p, q, 'psychic') < psychic);
		q.boosts.spd = 0;
		const converted = damage(p, q, 'psychic', 'Fire');
		q.boosts.spd = 4;
		assert.equal(damage(p, q, 'psychic', 'Fire'), converted);
		q.boosts.spd = 0;
		const water = damage(p, q, 'flamethrower', 'Water');
		q.boosts.spd = 4;
		assert(damage(p, q, 'flamethrower', 'Water') < water);
	});
	it('honors the defensive stat used by converted Psyshock', () => {
		const [p, q] = setup();
		const neutral = damage(p, q, 'psyshock', 'Fire');
		q.boosts.def = 4;
		assert.equal(damage(p, q, 'psyshock', 'Fire'), neutral);
		q.boosts.def = -2;
		assert(damage(p, q, 'psyshock', 'Fire') > neutral);
	});
	it('retains screens and defensive abilities without Mold Breaker', () => {
		const [p, q] = setup();
		const fire = damage(p, q, 'flamethrower');
		q.side.addSideCondition('lightscreen', q);
		assert(damage(p, q, 'flamethrower') < fire);
		q.side.removeSideCondition('lightscreen');
		const physical = damage(p, q, 'firepunch');
		q.side.addSideCondition('reflect', q);
		assert(damage(p, q, 'firepunch') < physical);
		q.side.removeSideCondition('reflect');
		q.setAbility('Heatproof');
		assert(damage(p, q, 'flamethrower') < fire);
		q.setAbility('Flash Fire');
		const hp = q.hp;
		battle.makeChoices('move flamethrower', 'move splash');
		assert.equal(q.hp, hp);
	});
	it('loses defensive-stage bypass and contact burn while suppressed', () => {
		const [p, q] = setup();
		const neutral = damage(p, q, 'flamethrower');
		q.boosts.spd = 4;
		p.addVolatile('gastroacid');
		assert(damage(p, q, 'flamethrower') < neutral);
		battle.randomChance = () => true;
		battle.runEvent('DamagingHit', p, q, Dex.getActiveMove('tackle'), 10);
		assert.equal(q.status, '');
	});
	it('uses full local Flame Body 30/60 percent contact chances and Cold Eclipse entry effects', () => {
		const [p, q] = setup();
		const rolls = [];
		battle.randomChance = (n, d) => {
			rolls.push([n, d]);
			return true;
		};
		function contact() {
			battle.runEvent('DamagingHit', p, q, Dex.getActiveMove('tackle'), 10);
		}
		contact();
		assert.equal(q.status, 'brn');
		assert(rolls.some(([n, d]) => n === 3 && d === 10));
		q.cureStatus();
		rolls.length = 0;
		battle.field.setTerrain('volcanicterrain', p);
		contact();
		assert.equal(q.status, 'brn');
		assert(rolls.some(([n, d]) => n === 6 && d === 10));
		q.cureStatus();
		rolls.length = 0;
		battle.field.setTerrain('coldeclipseterrain', p);
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(p.boosts.def, 1);
		assert.equal(p.boosts.spd, 1);
		contact();
		assert.equal(q.status, '');
		assert.equal(rolls.length, 0);
	});
	it('adds no extra power, hits or priority beyond the separate Proficient passive', () => {
		const [p, q] = setup('Typhlosion-Mega');
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('flamethrower'), 100), 130);
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('psychic'), 100), 100);
		p.hp = 1;
		assert.equal(battle.runEvent('ModifyPriority', p, q, Dex.getActiveMove('flamethrower'), 0), 0);
		assert(!Dex.abilities.get('coronafurnace').onPrepareHit);
		assert.deepEqual(require('../../../dist/data/ability-components').AbilityComponents.coronafurnace, ['flamebody']);
	});
	for (const species of ['Typhlosion', 'Typhlosion-Alt', 'Typhlosion-Hisui']) it(species + ' Mega route reaches the same Plasma Eruption form', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species, ability: 'Blazing Mane', item: 'Typhlosionite', moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		const p = battle.p1.active[0];
		assert.equal(p.species.id, 'typhlosionmega');
		assert.equal(p.ability, 'plasmaeruption');
		assert.deepEqual(p.getTypes(), ['Fire', 'Electric']);
		assert.deepEqual(p.getPassives(), ['proficient']);
	});
});
