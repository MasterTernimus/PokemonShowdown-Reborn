'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
let battle;
function start(ability, species = 'Mew', reserve = false) {
	const team = [{ species, ability, moves: ['flamethrower', 'psychic', 'weatherball', 'splash'] }];
	if (reserve) team.push({ species: 'Mew', ability, moves: ['splash'] });
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [team, [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
	battle.makeChoices(reserve ? 'team 12' : 'team 1', 'team 1');
	return [battle.p1.active[0], battle.p2.active[0]];
}
function power(source, target, id, type) {
	const move = battle.dex.getActiveMove(id);
	if (type) move.type = type;
	return battle.runEvent('BasePower', source, target, move, 100);
}
describe('Fire-only Fire Mane and simplified Blazing Mane', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	for (const ability of ['Fire Mane', 'Blazing Mane']) {
		it(ability + ' boosts non-STAB Fire exactly once and not non-Fire STAB', () => {
			const [p, q] = start(ability);
			assert.equal(power(p, q, 'flamethrower'), 150);
			assert.equal(power(p, q, 'psychic'), 100);
			assert.equal(power(p, q, 'flamethrower', 'Normal'), 100);
			assert.equal(power(p, q, 'psychic', 'Fire'), 150);
		});
		it(ability + ' respects suppression and restoring it does not stack the modifier', () => {
			const [p, q] = start(ability);
			p.addVolatile('gastroacid');
			assert.equal(power(p, q, 'flamethrower'), 100);
			p.removeVolatile('gastroacid');
			assert.equal(power(p, q, 'flamethrower'), 150);
		});
	}
	it('grants Fire priority only at or below one quarter HP and not to status/non-Fire moves', () => {
		const [p, q] = start('Blazing Mane');
		p.maxhp = 400;
		const priority = id => battle.runEvent('ModifyPriority', p, q, battle.dex.getActiveMove(id), 0);
		p.hp = 101;
		assert.equal(priority('flamethrower'), 0);
		for (const hp of [100, 1]) {
			p.hp = hp;
			assert.equal(priority('flamethrower'), 1);
			assert.equal(priority('psychic'), 0);
			assert.equal(priority('sunnyday'), 0);
		}
	});
	it('does not add another damaging hit or Proficient to a real attack', () => {
		const [p, q] = start('Blazing Mane');
		battle.randomChance = (n, d) => n >= d;
		let hits = 0;
		battle.onEvent('DamagingHit', battle.format, (damage, target, source, move) => {
			if (source === p && target === q && move.id === 'flamethrower') hits++;
		});
		const before = battle.log.length;
		battle.makeChoices('move flamethrower', 'move splash');
		assert.equal(hits, 1);
		assert(!battle.log.slice(before).some(line => line.includes('|-hitcount|')));
		assert(!p.hasAbilityOrPassive('proficient'));
		assert.deepEqual(require('../../../dist/data/ability-components').AbilityComponents.blazingmane, ['firemane']);
		assert(q.hp < q.maxhp);
	});
	it('uses effective Weather Ball typing in the complete move path', () => {
		const [p] = start('Fire Mane');
		battle.field.setWeather('sunnyday', p);
		const seen = [];
		battle.onEvent('BasePower', battle.format, (base, source, target, move) => {
			if (move.id === 'weatherball') seen.push(move.type);
		});
		battle.makeChoices('move weatherball', 'move splash');
		assert.deepEqual(seen, ['Fire']);
	});
	for (const field of ['burningterrain', 'volcanicterrain']) it('has no Speed boost on ' + field + ' start or entry', () => {
		const [p] = start('Blazing Mane', 'Mew', true);
		battle.field.setTerrain(field, p);
		assert.equal(p.boosts.spe, 0);
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(battle.p1.active[0].boosts.spe, 0);
	});
	it('preserves each actual selected-ability distribution', () => {
		for (const id of ['rapidash', 'taurospaldeablaze', 'flareon', 'pyroar']) assert(Object.values(Dex.species.get(id).abilities).includes('Fire Mane'), id);
		for (const id of ['typhlosion', 'typhlosionalt', 'typhlosionhisui']) assert.equal(Dex.species.get(id).abilities[0], 'Blazing Mane');
	});
});

describe('Aqua Shell Heatproof and full local Frisk', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	function doubles(embargo) {
		battle = common.createBattle({ formatid: 'gen9doublesrockyfield' }, [[{ species: 'Golisopod-Mega', ability: 'Aqua Shell', moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }], [{ species: 'Zoroark', ability: 'Illusion', item: 'Leftovers', moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', item: 'Life Orb', moves: ['splash'] }, { species: 'Pikachu', ability: 'Static', moves: ['splash'] }]]);
		const rolls = [];
		battle.randomChance = (n, d) => {
			rolls.push([n, d]);
			return embargo;
		};
		battle.makeChoices('team 12', 'team 123');
		return { p: battle.p1.active[0], foes: battle.p2.active, rolls };
	}
	it('reveals both opposing held items/Illusion and rolls each five-turn Embargo independently', () => {
		const { p, foes, rolls } = doubles(true);
		assert.equal(p.ability, 'aquashell');
		assert.deepEqual(p.getPassives(), ['toughclaws']);
		assert.equal(foes[0].illusion, null);
		assert.equal(battle.log.filter(l => l.includes('|-item|') && l.includes('ability: Aqua Shell')).length, 2);
		assert.equal(rolls.filter(([n, d]) => n === 3 && d === 10).length, 2);
		for (const foe of foes) assert.equal(foe.volatiles.embargo.duration, 5);
	});
	it('still reveals items when both Embargo rolls fail', () => {
		const { foes } = doubles(false);
		assert.equal(battle.log.filter(l => l.includes('|-item|') && l.includes('ability: Aqua Shell')).length, 2);
		for (const foe of foes) assert(!foe.volatiles.embargo);
	});
	it('retains Heatproof/Tough Claws but no legacy burn, flinch or Attack-drop protection', () => {
		const [p, q] = start('Aqua Shell', 'Golisopod-Mega');
		assert.equal(battle.runEvent('ModifyAtk', q, p, battle.dex.getActiveMove('firepunch'), 100), 50);
		assert.equal(battle.runEvent('ModifySpA', q, p, battle.dex.getActiveMove('flamethrower'), 100), 50);
		assert.equal(battle.runEvent('ModifySpA', q, p, battle.dex.getActiveMove('icebeam'), 100), 100);
		assert.equal(battle.runEvent('Damage', p, q, battle.dex.conditions.get('brn'), 100), 50);
		assert.equal(power(p, q, 'tackle'), 130);
		assert(p.trySetStatus('brn', q));
		assert(p.addVolatile('flinch', q));
		battle.boost({ atk: -1 }, p, q);
		assert.equal(p.boosts.atk, -1);
		battle.singleEvent('Flinch', p.getAbility(), p.abilityState, p);
		assert.equal(p.boosts.spe, 0);
	});
	it('does not grant Steadfast Speed on Electric Terrain activation and preserves standalone Steadfast', () => {
		const [p] = start('Aqua Shell', 'Golisopod-Mega');
		battle.field.setTerrain('electricterrain', p);
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(p.boosts.spe, 0);
		p.setAbility('Steadfast');
		assert.equal(p.boosts.spe, 1);
	});
	it('registers only Heatproof and Frisk, leaving Aevian Mega distinct', () => {
		const components = require('../../../dist/data/ability-components').AbilityComponents;
		assert.deepEqual(components.aquashell, ['heatproof', 'frisk']);
		assert.equal(Dex.species.get('golisopodaevianmega').abilities[0], 'Desert Shell');
		assert.deepEqual(components.desertshell, ['skilllink', 'heatproof', 'sandstream']);
	});
});
