'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const { NovemberRosterPassives, NovemberAbilityNames } = require('../../../dist/data/november-roster');
const { UltraBeastSlots } = require('../../../dist/data/ultra-beast-lineups');
let battle;
function start(ability, species = 'Mew', doubles = false) {
	const unit = { species: 'Mew', ability: 'No Ability', moves: ['splash', 'tackle', 'protect'] };
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [[
		{ species, ability, moves: ['splash', 'protect', 'spikyshield', 'tackle'] }, { ...unit }, { ...unit },
	], [{ ...unit }, { ...unit }, { ...unit }]]);
	battle.makeChoices('team 123', 'team 123');
	battle.field.terrain = ''; battle.randomizer = n => n; battle.randomChance = (n, d) => n >= d;
	for (const p of battle.getAllActive()) p.hp = p.maxhp = p.baseMaxhp = 4096;
	return [battle.p1.active[0], battle.p2.active[0]];
}
function hit(p, q, name, extra = {}) {
	battle.clearActiveMove(); const move = Object.assign(Dex.getActiveMove(name), { accuracy: true, willCrit: false }, extra);
	const before = q.hp; battle.actions.useMove(move, p, { target: q }); const used = battle.activeMove;
	battle.clearActiveMove(); return { damage: before - q.hp, move: used };
}
describe('November roster and starter families', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('publishes every requested passive as one entry', () => {
		for (const [id, passives] of Object.entries(NovemberRosterPassives)) assert.deepEqual(Dex.species.get(id).passives, id === 'froslassaevianmega' ? ['hydration'] : passives, id);
		assert.equal(Dex.species.get('eeveestarter').baseStats.hp, 100);
		assert.equal(Dex.species.get('eeveestarteralt').baseStats.hp, 100);
		assert.equal(Dex.species.get('eeveegmax').baseStats.hp, 150);
	});
	it('keeps stable IDs for all renamed abilities and exposes three UB slots', () => {
		for (const [id, name] of Object.entries(NovemberAbilityNames)) { assert.equal(Dex.abilities.get(name).id, id); assert.equal(Dex.abilities.get(id).name, name); }
		for (const [id, slots] of Object.entries(UltraBeastSlots)) { assert.deepEqual(Dex.species.get(id).abilities, slots); assert.equal(Object.keys(slots).length, 3); }
	});
	it('Inferno Legacy respects Flash Fire and has no Proficient component', () => {
		const [p, q] = start('Inferno Legacy'); q.setAbility('Flash Fire');
		assert(!p.hasAbility('moldbreaker')); assert(!p.hasAbility('proficient'));
		assert.equal(hit(p, q, 'flamethrower').damage, 0);
		assert.equal(battle.runEvent('BasePower', p, q, Object.assign(Dex.getActiveMove('psychic'), {type: p.getTypes()[0]}), 100), 100);
	});
	it('Legacy healing ignores Protect and Substitute, then refreshes next turn', () => {
		const [p, q] = start('Inferno Legacy'); p.hp = 2000;
		q.addVolatile('protect'); hit(p, q, 'flamethrower'); assert.equal(p.hp, 2000); q.removeVolatile('protect');
		q.addVolatile('substitute'); hit(p, q, 'flamethrower'); assert.equal(p.hp, 2000); q.removeVolatile('substitute');
		hit(p, q, 'flamethrower'); assert.equal(p.hp, 2256);
		battle.turn++; hit(p, q, 'flamethrower'); assert.equal(p.hp, 2512);
	});
	it('keeps Sworn Duty available outside Delphox', () => {
		assert.equal(Dex.species.get('stoutland').abilities[1], 'Sworn Duty');
		assert.equal(Dex.species.get('delphox').abilities[0], 'Guardian Flame');
		assert.equal(Dex.abilities.get('Sworn Duty').name, 'Sworn Duty');
	});
	it('removes duplicate Unnerve and Magic Bounce components', () => {
		const { AbilityComponents } = require('../../../dist/data/ability-components');
		assert(!AbilityComponents.territorial.includes('unnerve'));
		assert(!AbilityComponents.bewitchingmajesty.includes('magicbounce'));
		assert.deepEqual(AbilityComponents.healingmirror, ['magicbounce', 'healer']);
	});
	for (const [ability, signature] of [['Masquerade Bloom', 'flowertrick'], ['Masquerade Choir', 'torchsong'], ['Masquerade Step', 'aquastep']]) {
		it(ability + ' heals once after signature HP damage, including a KO', () => {
			const [p, q] = start(ability);
			p.hp = 1000;
			q.hp = 1;
			hit(p, q, signature);
			assert.equal(p.hp, 1256);
			q.hp = 4096; hit(p, q, signature); assert.equal(p.hp, 1256);
		});
	}
	it('Masquerade Choir takes the larger recovery instead of stacking', () => {
		const [p, q] = start('Masquerade Choir');
		p.side.pokemon[1].fainted = true;
		p.side.pokemon[2].fainted = true;
		p.hp = 1000;
		hit(p, q, 'torchsong'); assert.equal(p.hp, 1256);
	});
	for (const [ability, type] of [['Terra Legacy', 'Ground'], ['Inferno Legacy', 'Fire'], ['Imperial Legacy', 'Steel']]) {
		it(ability + ' heals once per turn after matching HP damage', () => {
			const [p, q] = start(ability); p.hp = 2000;
			hit(p, q, 'tackle', {type: 'Normal'}); assert.equal(p.hp, 2000);
			hit(p, q, 'tackle', {type}); assert.equal(p.hp, 2256);
			hit(p, q, 'tackle', {type}); assert.equal(p.hp, 2256);
			assert.equal(battle.runEvent('ModifyAccuracy', q, p, Object.assign(Dex.getActiveMove('tackle'), {type}), 50), 50);
		});
	}
	for (const [ability, signature] of [['Canopy Performer', 'spiritshackle'], ['Ring Performer', 'darkestlariat'], ['Tidal Performer', 'sparklingaria']]) {
		it(ability + ' raises its matching stat only once per entry', () => {
			const [p, q] = start(ability);
			hit(p, q, signature);
			hit(p, q, signature);
			assert.equal(p.boosts[signature === 'spiritshackle' ? 'spe' : signature === 'darkestlariat' ? 'def' : 'accuracy'], 1);
		});
	}
	for (const [ability, attack] of [['Guardian Shield', 'seedbomb'], ['Guardian Flame', 'flamethrower'], ['Guardian Tide', 'surf'], ['Aegis Shield', 'seedbomb'], ['Aegis Flame', 'flamethrower'], ['Aegis Tide', 'surf']]) {
		it(ability + ' stores and consumes one matching counterattack', () => {
			const [p, q] = start(ability); const baseline = hit(p, q, attack).damage; q.hp = 4096;
			p.addVolatile('protect');
			hit(q, p, 'tackle');
			assert(p.volatiles.guardiancounter);
			p.removeVolatile('protect');
			const boosted = hit(p, q, attack).damage; assert(boosted > baseline * 1.15); assert(!p.volatiles.guardiancounter);
			q.hp = 4096; assert.equal(hit(p, q, attack).damage, baseline);
		});
	}
	for (const ability of ['Rain Rhythm', 'Live Circuit']) it(ability + ' heals once and ignores Protect', () => {
		const [p, q] = start(ability); p.hp = 1000; const move = ability === 'Rain Rhythm' ? 'hypervoice' : 'thunderbolt';
		q.addVolatile('protect');
		hit(p, q, move);
		assert.equal(p.hp, 1000);
		q.removeVolatile('protect');
		hit(p, q, move); hit(p, q, move); assert.equal(p.hp, 1256);
	});
	for (const [ability, move] of [['Gale Fan', 'gust'], ['Toxic Canvas', 'sludgebomb']]) it(ability + ' lowers accuracy once per entry', () => {
		const [p, q] = start(ability);
		hit(p, q, move);
		hit(p, q, move);
		assert.equal(q.boosts.accuracy, -1);
	});
	it('Paper Aegis reduces a whole first multihit special move, then expires', () => {
		const [p, q] = start('Paper Aegis'); const first = hit(q, p, 'waterpulse', { multihit: 2, basePower: 30, secondaries: [] }).damage;
		const second = hit(q, p, 'waterpulse', { multihit: 2, basePower: 30, secondaries: [] }).damage; assert(first < second * 0.85);
	});
});
