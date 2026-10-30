/* eslint-disable @stylistic/max-statements-per-line */
'use strict';
const assert = require('assert').strict, common = require('../../common'), { Dex } = require('../../../dist/sim');
let battle;
function setup(species, ability = 'No Ability', doubles = false) {
	const mon = (species = 'Mew', ability = 'No Ability') => ({ species, ability, moves: ['tackle', 'splash'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [[mon(species, ability), mon()], [mon(), mon()]]); battle.makeChoices('team 12', 'team 12'); battle.randomChance = (n, d) => n >= d; battle.randomizer = n => n;
	for (const side of battle.sides) for (const p of side.pokemon)p.hp = p.maxhp = p.baseMaxhp = 4000; return [battle.p1.active[0], battle.p2.active[0]];
}
function hit(p, q) { battle.actions.useMove(Object.assign(Dex.getActiveMove('tackle'), { accuracy: true, willCrit: false }), p, { target: q }); battle.clearActiveMove(); }
describe('Three exact Lycanroc passive replacements', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('changes only the three approved passives and the Dusk slot, preserving stats and typings', () => {
		const before = require('../../../artifacts/lycanroc-before.json'), passives = { lycanroc: ['infiltrator'], lycanrocmidnight: ['defiant'], lycanrocdusk: ['toughclaws'] }; let changes = 0;
		for (const old of before) { const s = Dex.species.get(old.id); assert.deepEqual(s.abilities, require('./passive-approval-overlays').abilities(old.id, {...old.abilities}), old.id); assert.deepEqual(s.baseStats, old.stats, old.id); assert.deepEqual(s.types, old.types, old.id); assert.deepEqual(s.passives, require('./passive-approval-overlays').current(old.id, passives[old.id] || old.passives), old.id); if (passives[old.id])changes++; }assert.equal(changes, 3);
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
	it('Midday Infiltrator bypasses Substitute and screens through selected-ability suppression', () => {
		const [p, q] = setup('Lycanroc'); p.addVolatile('gastroacid'); q.addVolatile('substitute'); q.volatiles.substitute.hp = 1000; q.side.addSideCondition('reflect', q); hit(p, q); const damage = 4000 - q.hp; assert(damage > 0); assert.equal(q.volatiles.substitute.hp, 1000);
		q.removeVolatile('substitute'); q.side.removeSideCondition('reflect'); q.hp = 4000; hit(p, q); assert.equal(4000 - q.hp, damage);
	});
	it('Midday Infiltrator bypasses Safeguard for status moves', () => {
		const [p, q] = setup('Lycanroc'); q.side.addSideCondition('safeguard', q); battle.actions.useMove(Object.assign(Dex.getActiveMove('toxic'), { accuracy: true }), p, { target: q }); assert.equal(q.status, 'tox');
	});
	for (const ability of ['No Ability', 'Defiant', 'Ultra Ego', 'Blood Challenge', 'No Guard'])it('Midnight Defiant reacts once to opponent drops with ' + ability, () => {
		const [p, q] = setup('Lycanroc-Midnight', ability); p.addVolatile('gastroacid'); battle.boost({ def: -1 }, p, q); assert.equal(p.boosts.atk, 2); assert.equal(p.boosts.def, -1);
	});
	it('Midnight Defiant ignores self and allied stat drops', () => {
		const [p] = setup('Lycanroc-Midnight', 'No Ability', true); battle.boost({ def: -1 }, p, p); battle.boost({ spd: -1 }, p, battle.p1.active[1]); assert.equal(p.boosts.atk, 0);
	});
	for (const [species, passive] of [['Lycanroc', 'infiltrator'], ['Lycanroc-Midnight', 'defiant'], ['Lycanroc-Dusk', 'toughclaws']])it('Transform uses ' + species + ' passive', () => {
		const [p, q] = setup(species); q.transformInto(p); assert.deepEqual(q.getPassives(), [passive]);
	});
});
