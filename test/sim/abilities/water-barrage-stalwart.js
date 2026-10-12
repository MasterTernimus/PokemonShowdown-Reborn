/* eslint-disable @stylistic/max-statements-per-line */
'use strict';
const assert = require('assert').strict, common = require('../../common');
const { Dex } = require('../../../dist/sim');
let battle;
function setup(species = 'Blastoise', ability = 'Water Barrage', doubles = false) {
	const mon = (species = 'Mew', ability = 'No Ability') => ({ species, ability, moves: ['splash', 'waterpulse', 'followme', 'darkpulse'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [[mon(species, ability), mon()], [mon(), mon()]]); battle.makeChoices('team 12', 'team 12');
	const p = battle.p1.active[0], q = battle.p2.active[0]; if (p.species.id !== Dex.species.get(species).id)p.formeChange(species, null, true); p.setAbility(ability);
	battle.field.terrain = ''; battle.field.weather = ''; for (const side of battle.sides) for (const m of side.pokemon)m.hp = m.maxhp = m.baseMaxhp = 1600; return [p, q];
}
describe('Water Barrage owns one full Stalwart component', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('preserves Fortress Shell as its existing partial package without a new Stalwart grant', () => {
		const [p, q] = setup('Mew', 'Fortress Shell'); battle.field.terrain = 'newworldterrain'; p.boosts.spa = 0;
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p); assert.equal(p.boosts.spa, 0);
		const move = Dex.getActiveMove('waterpulse'); battle.runEvent('ModifyMove', p, q, move, move); assert.equal(move.multihit, 2); assert(!move.tracksTarget); assert(!p.hasAbility('stalwart'));
	});
	for (const [species, ability] of [['Blastoise', 'Water Barrage'], ['Blastoise-Mega', 'Siege Launcher'], ['Mew', 'Water Barrage'], ['Mew', 'Siege Launcher']]) {
		for (const field of ['newworldterrain', 'starlightarenaterrain', 'fairytaleterrain', 'chessboardterrain'])it(species + '/' + ability + ' gains exactly one Stalwart entry boost on ' + field, () => {
			const [p] = setup(species, ability); battle.field.terrain = field; p.boosts.spa = 0; battle.singleEvent('Start', p.getAbility(), p.abilityState, p); assert.equal(p.boosts.spa, 1); assert(p.hasAbility('stalwart'));
			p.boosts.spa = 0; p.addVolatile('gastroacid'); battle.singleEvent('Start', p.getAbility(), p.abilityState, p); assert.equal(p.boosts.spa, 0);
		});
		it(species + '/' + ability + ' owns one Dual Wield pair and preserves singles/FFA modifiers', () => {
			const [p, q] = setup(species, ability); for (const game of ['singles', 'freeforall']) {
				battle.gameType = game; const m = Dex.getActiveMove('darkpulse'); battle.runEvent('ModifyMove', p, q, m, m); assert.equal(m.multihit, 2); assert.equal(m.multihitType, 'dualwield'); assert(m.tracksTarget);
				for (const hit of [1, 2]) { m.hit = hit; assert.equal(battle.runEvent('BasePower', p, q, m, 100), ability === 'Siege Launcher' ? (game === 'singles' ? 90 : 150) : (game === 'singles' ? 60 : 100)); }
			}
			for (const id of ['selfsufficient', 'proficient', 'moldbreaker', 'shellarmor'])assert(!p.hasAbility(id), id); if (species === 'Blastoise-Mega')assert(p.getPassives().includes('proficient'));
		});
		it(species + '/' + ability + ' advances Water chip once per residual and suppression stops it', () => {
			const [p, q] = setup(species, ability); p.hp = 800; for (const damage of [100, 200, 300, 100]) { const hp = q.hp; battle.singleEvent('Residual', p.getAbility(), p.abilityState, p); assert.equal(hp - q.hp, damage); assert.equal(p.hp, 800); }
			const hp = q.hp, stage = p.abilityState.waterBarrageStage; p.addVolatile('gastroacid'); battle.singleEvent('Residual', p.getAbility(), p.abilityState, p); assert.equal(q.hp, hp); assert.equal(p.abilityState.waterBarrageStage, stage);
		});
		it(species + '/' + ability + ' bypasses Follow Me without duplicating attacks', () => {
			const [p, q] = setup(species, ability, true), redirect = battle.p2.active[1]; redirect.addVolatile('followme'); battle.actions.useMove(Object.assign(Dex.getActiveMove('watergun'), { accuracy: true, damage: 100 }), p, { target: q }); assert.equal(q.hp, 1500); assert.equal(redirect.hp, 1600);
			p.addVolatile('gastroacid'); battle.actions.useMove(Object.assign(Dex.getActiveMove('watergun'), { accuracy: true, damage: 100 }), p, { target: q }); assert.equal(q.hp, 1500); assert.equal(redirect.hp, 1500);
		});
	}
	it('chip keeps Water immunity and allied exemptions', () => {
		const [p, q] = setup('Blastoise', 'Water Barrage', true), ally = battle.p1.active[1]; q.setAbility('Water Absorb'); battle.singleEvent('Residual', p.getAbility(), p.abilityState, p); assert.equal(q.hp, 1600); assert.equal(ally.hp, 1600); assert.equal(battle.p2.active[1].hp, 1500);
	});
	it('ordinary fields grant no entry boost and status/ineligible moves gain no extra pair', () => {
		const [p, q] = setup(); battle.singleEvent('Start', p.getAbility(), p.abilityState, p); assert.equal(p.boosts.spa, 0); for (const id of ['splash', 'tackle', 'bulletseed']) { const m = Dex.getActiveMove(id), old = m.multihit; battle.runEvent('ModifyMove', p, q, m, m); assert.deepEqual(m.multihit, old); }
	});
});
