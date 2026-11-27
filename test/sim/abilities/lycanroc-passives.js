/* eslint-disable @stylistic/max-statements-per-line */
'use strict';
const assert = require('assert').strict, common = require('../../common'), { Dex } = require('../../../dist/sim');
let battle;
function setup(species, ability = 'No Ability', doubles = false) {
	const mon = (species = 'Mew', ability = 'No Ability') => ({ species, ability, moves: ['tackle', 'splash'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [[mon(species, ability), mon()], [mon(), mon()]]); battle.makeChoices('team 12', 'team 12'); battle.randomChance = (n, d) => n >= d; battle.randomizer = n => n;
	for (const side of battle.sides) for (const p of side.pokemon)p.hp = p.maxhp = p.baseMaxhp = 4000; return [battle.p1.active[0], battle.p2.active[0]];
}
function hit(p, q) { battle.actions.useMove(Object.assign(Dex.getActiveMove('watergun'), { accuracy: true, willCrit: false }), p, { target: q }); battle.clearActiveMove(); }
describe('Three exact Lycanroc passive replacements', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('retains the three Lycanroc passives alongside subsequent approved roster changes', () => {
		const before = require('../../../artifacts/lycanroc-before.json'), passives = { lycanroc: ['ultrainstinct'], lycanrocmidnight: ['ultraego'], lycanrocdusk: ['toughclaws'] }; let changes = 0;
		for (const old of before) { const s = Dex.species.get(old.id); assert.deepEqual(s.abilities, require('./passive-approval-overlays').abilities(old.id, { ...old.abilities }), old.id); assert.deepEqual(s.baseStats, require('./passive-approval-overlays').stats(old.id, old.stats), old.id); assert.deepEqual(s.types, require('./passive-approval-overlays').types(old.id, old.types), old.id); assert.deepEqual(s.passives, require('./passive-approval-overlays').current(old.id, passives[old.id] || old.passives), old.id); if (passives[old.id])changes++; }assert.equal(changes, 3);
		assert.deepEqual(Dex.species.get('lycanrocdusk').abilities, { 0: 'Scrappy', 1: 'Twilight Instinct', H: 'Dusk Ego' });
	});
	for (const suppressed of [false, true]) it('Dusk selected Scrappy respects suppression independently of Tough Claws ' + suppressed, () => {
		const [p, q] = setup('Lycanroc-Dusk', 'Scrappy'); if (suppressed) p.addVolatile('gastroacid'); q.setType('Ghost');
		for (const id of ['tackle', 'closecombat']) {
			q.hp = 4000; battle.actions.useMove(Object.assign(Dex.getActiveMove(id), { accuracy: true, willCrit: false }), p, { target: q }); battle.clearActiveMove();
			assert.equal(q.hp < 4000, !suppressed, id);
		}
		p.boosts.atk = 0; q.setAbility('Intimidate'); assert.equal(p.boosts.atk, suppressed ? -1 : 0);
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 100), 130);
	});
	for (const ability of ['No Ability', 'Scrappy', 'Tough Claws', 'Twilight Instinct', 'Dusk Ego']) for (const suppressed of [false, true])it('Dusk Tough Claws boosts contact exactly once with ' + ability + (suppressed ? ' suppressed' : ''), () => {
		const [p, q] = setup('Lycanroc-Dusk', ability); if (suppressed)p.addVolatile('gastroacid'); const contact = Dex.getActiveMove('tackle'), ranged = Dex.getActiveMove('rockslide');
		assert.equal(battle.runEvent('BasePower', p, q, contact, 100), 130); assert.equal(battle.runEvent('BasePower', p, q, ranged, 100), 100);
	});
	it('Midday keeps the Ultra Instinct guard when its selected ability is suppressed', () => {
		const [p, q] = setup('Lycanroc', 'Daybreak Rush');
		p.addVolatile('gastroacid');
		const move = Dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('Damage', p, q, move, 100), 70);
		assert.equal(p.getAbility().name, 'Daybreak Rush');
	});
	it('Daybreak Rush clears hazards after a Rock hit once per entry', () => {
		const [p, q] = setup('Lycanroc', 'Daybreak Rush');
		const attack = () => {
			battle.actions.useMove(Object.assign(Dex.getActiveMove('accelerock'), { accuracy: true }), p, { target: q });
			battle.clearActiveMove();
		};
		attack();
		p.side.addSideCondition('stealthrock', q);
		q.addVolatile('protect');
		attack();
		assert(p.side.sideConditions.stealthrock);
		q.removeVolatile('protect');
		q.addVolatile('substitute');
		attack();
		assert(!p.side.sideConditions.stealthrock);
		p.side.addSideCondition('stealthrock', q);
		attack();
		assert(p.side.sideConditions.stealthrock);
	});
	it('Midnight earns Ultra Ego stages on combat turns with a different selected ability', () => {
		const [p] = setup('Lycanroc-Midnight', 'No Guard');
		battle.makeChoices('move tackle', 'move splash');
		assert.equal(p.boosts.atk, 1);
		assert.equal(p.boosts.spa, 1);
		assert.equal(p.getAbility().name, 'No Guard');
	});
	it('Moonlit Reprisal rewards a Rock counterhit against the attacker once per turn', () => {
		const [p, q] = setup('Lycanroc-Midnight', 'Moonlit Reprisal', true);
		const other = battle.p2.active[1];
		const rock = Dex.getActiveMove('accelerock');
		const power = foe => battle.runEvent('BasePower', p, foe, rock, 100);
		const before = power(q);
		p.hp = 1000;
		hit(q, p);
		assert.equal(power(q), Math.round(before * 1.3));
		assert.equal(power(other), before);
		const returnsHealth = line => line.includes('|-heal|') && line.includes('Moonlit Reprisal');
		battle.actions.useMove(rock, p, { target: q });
		battle.clearActiveMove();
		assert(battle.log.some(returnsHealth));
		const next = battle.log.length;
		battle.actions.useMove(rock, p, { target: q });
		battle.clearActiveMove();
		assert(!battle.log.slice(next).some(returnsHealth));
	});
	for (const [species, passive] of [['Lycanroc', 'ultrainstinct'], ['Lycanroc-Midnight', 'ultraego'], ['Lycanroc-Dusk', 'toughclaws']])it('Transform uses ' + species + ' passive', () => {
		const [p, q] = setup(species); q.transformInto(p); assert.deepEqual(q.getPassives(), [passive]);
	});
});
