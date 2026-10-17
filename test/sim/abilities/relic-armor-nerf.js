'use strict';
const assert = require('assert').strict, common = require('../../common'), {Dex} = require('../../../dist/sim');
const {RelicArmorFields} = require('../../../dist/data/relic-armor');
describe('Approved Relic Armor field restriction and reduction', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(passive = true, field = '') {
		const mon = (species, ability) => ({species, ability, moves: ['splash', 'tackle', 'frostbreath']});
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[mon(passive ? 'Omastar' : 'Mew', passive ? 'No Ability' : 'Relic Armor'), mon('Mew', 'No Ability')],
			[mon('Mew', 'No Ability'), mon('Mew', 'No Ability')],
		]);
		battle.makeChoices('team 12', 'team 12');
		const p = battle.p1.active[0], q = battle.p2.active[0];
		p.setType('Rock'); battle.field.terrain = field; battle.eachEvent('Update');
		return [p, q];
	}
	function reduction(p, q) { return battle.runEvent('ModifyDamage', q, p, Dex.getActiveMove('tackle'), 1000); }
	const allowed = ['rockyterrain', 'fairytaleterrain', 'watersurfaceterrain', 'underwaterterrain', 'murkwatersurfaceterrain', 'midnightzoneterrain', 'starlightarenaterrain', 'newworldterrain', 'holyterrain', 'mountainterrain', 'caveterrain', 'volcanicterrain', 'dragonsdenterrain', 'crystalcavernterrain', 'darkcrystalcavernterrain'];
	it('has exactly the fifteen approved fields', () => assert.deepEqual(RelicArmorFields, allowed));
	for (const passive of [true, false]) for (const field of allowed) it((passive ? 'passive' : 'selected') + ' protects Rock typing on ' + field, () => {
		const [p, q] = setup(passive, field);
		for (const id of ['brickbreak', 'earthpower', 'flashcannon', 'watergun', 'vinewhip']) assert.equal(p.runEffectiveness(Dex.getActiveMove(id)), 0, id);
		assert.equal(p.runEffectiveness(Dex.getActiveMove('tackle')), -1);
		assert.equal(p.runEffectiveness(Dex.getActiveMove('psychic')), 0);
		assert.equal(reduction(p, q), 900);
		assert(p.volatiles.relicarmorfield); assert(!p.volatiles.relicarmoractive);
	});
	for (const field of ['', ...Object.keys(Dex.data.Terrains).filter(f => !allowed.includes(f))]) it('keeps Rock weakness outside the whitelist: ' + (field || 'none'), () => {
		const [p] = setup(true, field);
		assert.equal(p.runEffectiveness(Dex.getActiveMove('watergun')), field === 'inverseterrain' ? -1 : 1);
		assert(p.volatiles.relicarmoractive); assert(!p.volatiles.relicarmorfield);
	});
	it('never substitutes an Aura for a listed field', () => {
		const [p] = setup();
		for (const aura of allowed) {
			battle.field.auraField = aura; battle.eachEvent('Update');
			assert.equal(p.runEffectiveness(Dex.getActiveMove('watergun')), 1, aura);
			assert(!p.volatiles.relicarmorfield);
		}
	});
	it('announces each relevant field transition once and keeps the ordinary indicator outside', () => {
		const [p] = setup(); const start = battle.log.length;
		battle.field.setTerrain('rockyterrain', p);
		for (let i = 0; i < 5; i++) { battle.eachEvent('Update'); battle.eachEvent('TerrainChange'); }
		assert.equal(battle.log.slice(start).filter(l => l.includes('Relic Armor neutralizes')).length, 1);
		battle.field.setTerrain('mountainterrain', p);
		assert.equal(battle.log.slice(start).filter(l => l.includes('Relic Armor neutralizes')).length, 2);
		battle.field.setTerrain('desertterrain', p); battle.eachEvent('Update');
		assert(p.volatiles.relicarmoractive); assert(!p.volatiles.relicarmorfield);
		assert.equal(p.runEffectiveness(Dex.getActiveMove('watergun')), 1);
		battle.field.setTerrain('rockyterrain', p);
		assert.equal(battle.log.slice(start).filter(l => l.includes('Relic Armor neutralizes')).length, 3);
	});
	for (const passive of [true, false]) it('indicator and mechanics respect suppression for passive=' + passive, () => {
		const [p, q] = setup(passive, 'rockyterrain'); p.addVolatile('gastroacid'); battle.eachEvent('Update');
		assert.equal(reduction(p, q), passive ? 900 : 1000);
		assert.equal(p.runEffectiveness(Dex.getActiveMove('watergun')), passive ? 0 : 1);
		assert.equal(!!p.volatiles.relicarmorfield, passive);
		p.removeVolatile('gastroacid'); battle.eachEvent('Update'); assert(p.volatiles.relicarmorfield);
		q.setAbility('Neutralizing Gas'); battle.eachEvent('Update');
		assert.equal(!!p.volatiles.relicarmorfield, passive);
		q.setAbility('No Ability'); battle.eachEvent('Update'); assert(p.volatiles.relicarmorfield);
	});
	it('deduplicates selected plus passive armor and retains independent Battle Armor crit immunity', () => {
		const [p, q] = setup(); p.setAbility('Relic Armor'); assert.equal(reduction(p, q), 900);
		for (const ability of ['Battle Armor', 'Shell Armor', 'Protective Ward']) {
			p.setAbility(ability); assert.equal(battle.runEvent('CriticalHit', p, q, Dex.getActiveMove('tackle')), false, ability);
		}
	});
	for (const passive of [true, false]) for (const id of ['tackle', 'frostbreath']) it('allows ' + id + ' critical hits, passive=' + passive, () => {
		const [p, q] = setup(passive, 'rockyterrain'); p.hp = p.maxhp = p.baseMaxhp = 10000;
		battle.randomChance = () => true; battle.clearActiveMove(); const start = battle.log.length;
		const move = Dex.getActiveMove(id); move.accuracy = true; battle.actions.useMove(move, q, {target: p});
		assert(battle.log.slice(start).some(l => l.startsWith('|-crit|')));
	});
	for (const [species, ability] of [['Aerodactyl-Mega', 'Apex Predator'], ['Tyrantrum-Mega', 'Tyrant Domain'], ['Aurorus-Mega', 'Aurora Domain'], ['Mew', 'Defeatist']]) it('does not retain inherited crit protection through ' + ability, () => {
		const [p, q] = setup(); p.formeChange(species); p.setAbility(ability);
		assert.notEqual(battle.runEvent('CriticalHit', p, q, Dex.getActiveMove('frostbreath')), false);
	});
	it('preserves other type weaknesses, resistances and immunities', () => {
		const [p] = setup(true, 'rockyterrain'); p.setType(['Rock', 'Water']);
		assert.equal(p.runEffectiveness(Dex.getActiveMove('energyball')), 1);
		assert.equal(p.runEffectiveness(Dex.getActiveMove('flamethrower')), -2);
		p.setType(['Rock', 'Flying']); assert.equal(p.runImmunity('Ground'), false);
		assert.equal(p.runEffectiveness(Dex.getActiveMove('rockslide')), 1);
	});
	it('keeps the stat-drop response uncapped within a turn and adds no entry boosts on field change', () => {
		const [p, q] = setup();
		battle.boost({atk: -1}, p, q); battle.boost({spe: -1}, p, q);
		assert.equal(p.boosts.def, 2); assert.equal(p.boosts.spd, 2);
		battle.field.setTerrain('caveterrain', p);
		assert.equal(p.boosts.def, 2); assert.equal(p.boosts.spd, 2);
	});
	it('updates Defeatist inherited protection and its indicator without crit immunity', () => {
		const [p, q] = setup(false); p.setAbility('Defeatist'); battle.eachEvent('Update');
		assert(p.volatiles.relicarmoractive); battle.field.setTerrain('rockyterrain', p);
		assert(p.volatiles.relicarmorfield); assert.equal(reduction(p, q), 900);
		assert.equal(p.runEffectiveness(Dex.getActiveMove('watergun')), 0);
		assert.notEqual(battle.runEvent('CriticalHit', p, q, Dex.getActiveMove('tackle')), false);
	});
	it('hides both indicators and announcements during Illusion, then reveals after it ends', () => {
		const [p] = setup(); p.illusion = p.side.pokemon[1]; const start = battle.log.length;
		battle.field.setTerrain('rockyterrain', p); battle.eachEvent('Update');
		assert(!p.volatiles.relicarmorfield && !p.volatiles.relicarmoractive);
		assert(!battle.log.slice(start).some(l => l.includes('Relic Armor')));
		p.illusion = null; battle.eachEvent('Update'); assert(p.volatiles.relicarmorfield);
	});
	it('removes stale indicators after form change or selected ability loss', () => {
		const [p] = setup(true, 'rockyterrain'); p.formeChange('Mew'); battle.eachEvent('Update');
		assert(!p.volatiles.relicarmorfield); p.setAbility('Relic Armor'); battle.eachEvent('Update');
		assert(p.volatiles.relicarmorfield); p.setAbility('No Ability'); battle.eachEvent('Update'); assert(!p.volatiles.relicarmorfield);
	});
});
