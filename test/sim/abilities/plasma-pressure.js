'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
const {plasmaFieldMultiplier} = require('../../../dist/data/plasma-eruption');

describe('Plasma Eruption pressure cycle', () => {
	let battle;
	afterEach(() => battle?.destroy());
	const set = (ability = 'No Ability', species = 'Mew', item = '') => ({species, ability, item,
		moves: ['flamethrower', 'thunderbolt', 'splash', 'batonpass']});
	function setup(doubles = false, item = '', species = 'Mew') {
		battle = common.createBattle({gameType: doubles ? 'doubles' : 'singles'}, [
			[set('Plasma Eruption', species, item), set()], [set(), set()],
		]);
		for (const side of battle.sides) for (const p of side.pokemon) { if (p.species.id !== 'typhlosionmega') p.getPassives = () => []; p.hp = p.maxhp = p.baseMaxhp = 10000; }
		battle.randomChance = () => false;
		battle.random = (m, n) => n === undefined ? m - 1 : n - 1;
		battle.randomizer = value => value;
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	function hit(p, q, id = 'flamethrower', changes = {}) {
		const move = Object.assign(Dex.getActiveMove(id), {accuracy: true, willCrit: false}, changes);
		battle.actions.useMove(move, p, {target: q});
		return p.lastMoveUsed;
	}
	const pressure = p => p.volatiles.plasmacore?.pressure || 0;
	function ready(p, q) { for (let i = 0; i < 3; i++) hit(p, q); assert.equal(pressure(p), 3); }

	for (const provider of ['ally', 'passive', 'both', 'suppressed', 'none']) {
		it('applies Grace once to late-added effects: ' + provider, () => {
			const [p, q] = setup(true);
			const ally = battle.p1.active[1];
			if (['ally', 'both', 'suppressed'].includes(provider)) ally.setAbility('Fortunate Wing');
			if (provider === 'suppressed') ally.addVolatile('gastroacid');
			if (['passive', 'both'].includes(provider)) p.getPassives = () => ['serenegrace'];
			const move = Dex.getActiveMove('flamethrower');
			battle.runEvent('ModifyMove', p, q, move, move);
			const doubled = ['ally', 'passive', 'both'].includes(provider);
			assert.deepEqual(move.secondaries.map(effect => effect.chance), doubled ? [20, 60] : [10, 30]);
			assert.deepEqual(move.secondaries.map(effect => effect.status), ['brn', 'par']);
			assert.equal(move.sereneGraceProviders?.includes('plasmaeruption') || false, false);
		});
	}
	it('builds once per attack, grants SpA then Speed, and detonates only on the fourth attack', () => {
		const [p, q] = setup();
		hit(p, q); assert.equal(pressure(p), 1); assert.equal(p.boosts.spa, 1); assert.equal(p.boosts.spe, 0);
		hit(p, q); assert.equal(pressure(p), 2); assert.equal(p.boosts.spe, 1); assert.equal(p.boosts.spa, 1);
		const third = hit(p, q); assert.equal(pressure(p), 3); assert(!third.plasmaAttack.eruption);
		const fourth = hit(p, q); assert(fourth.plasmaAttack.eruption); assert.equal(pressure(p), 0);
		assert.equal(p.boosts.spe, 0); assert.equal(p.boosts.spa, 0); assert(p.volatiles.plasmaairborne);
		assert.equal(q.status, 'par');
	});
	it('has no regular 30% power boost and keeps Proficient as a separate passive', () => {
		let [p, q] = setup();
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('flamethrower'), 1000), 1000);
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('firepunch'), 1000), 1000);
		battle.destroy(); const [mega, foe] = setup(false, '', 'Typhlosion-Mega');
		assert.deepEqual(mega.getPassives(), ['proficient']);
		assert.equal(battle.runEvent('BasePower', mega, foe, Dex.getActiveMove('flamethrower'), 1000), 1300);
		assert.equal(battle.runEvent('BasePower', mega, foe, Dex.getActiveMove('firepunch'), 1000), 1300);
		battle.destroy(); [p, q] = setup();
		p.getPassives = () => []; ready(p, q); const move = hit(p, q);
		assert.equal(battle.runEvent('BasePower', p, q, move, 1000), 1600);
	});
	it('applies 50% conversion once to a whole multi-hit move', () => {
		const [p, q] = setup(); let rolls = 0;
		battle.randomChance = (n, d) => { if (n === 1 && d === 2) { rolls++; return true; } return false; };
		const move = hit(p, q, 'doublehit', {type: 'Fire', multihit: 3});
		assert.equal(move.type, 'Electric'); assert.equal(rolls, 1); assert.equal(pressure(p), 1);
	});
	it('builds only once across spread opponents and never from allied damage', () => {
		const [p, q] = setup(true); hit(p, q, 'heatwave'); assert.equal(pressure(p), 1);
		hit(p, battle.p1.active[1]); assert.equal(pressure(p), 1);
	});
	for (const [ability, original, expected] of [['Flash Fire', 'Fire', 'Electric'], ['Well-Baked Body', 'Fire', 'Electric'],
		['Volt Absorb', 'Electric', 'Fire'], ['Motor Drive', 'Electric', 'Fire'], ['Lightning Rod', 'Electric', 'Fire']]) {
		it(`avoids ${ability} without activating its absorption while selecting a type`, () => {
			const [p, q] = setup(); q.setAbility(ability);
			const move = hit(p, q, 'flamethrower', {type: original});
			assert.equal(move.type, expected); assert(q.hp < q.maxhp);
			assert.equal(q.boosts.spa, 0); assert.equal(q.boosts.spe, 0); assert.equal(q.boosts.def, 0);
		});
	}
	it('avoids converting into Ground immunity and uses the first opposing slot in doubles', () => {
		const [p, q] = setup(true); q.setType('Ground'); battle.randomChance = (n, d) => n === 1 && d === 2;
		const second = battle.p2.active[1]; const move = hit(p, second);
		assert.equal(move.type, 'Fire');
		q.setType('Normal'); q.setAbility('Flash Fire'); const next = hit(p, second);
		assert.equal(next.type, 'Electric');
	});
	it('uses the final type for added 30% opposite statuses and retains ordinary move effects', () => {
		const [p, q] = setup(); const fire = hit(p, q); const electric = hit(p, q, 'thunderbolt');
		assert(fire.secondaries.some(s => s.chance === 30 && s.status === 'par'));
		assert(electric.secondaries.some(s => s.chance === 30 && s.status === 'brn'));
		assert(fire.secondaries.some(s => s.chance === 10 && s.status === 'brn'));
		assert(!p.trySetStatus('brn', q)); assert(!p.trySetStatus('par', q));
	});
	it('does not build on misses, protection or immunity, but can charge from Substitute damage', () => {
		const [p, q] = setup(); hit(p, q, 'flamethrower', {accuracy: 0}); assert.equal(pressure(p), 0);
		q.addVolatile('protect'); hit(p, q); assert.equal(pressure(p), 0); q.removeVolatile('protect');
		q.setType('Ground'); q.setAbility('Flash Fire'); hit(p, q); assert.equal(pressure(p), 0);
		q.setType('Normal'); q.setAbility('No Ability'); battle.actions.useMove('substitute', q);
		hit(p, q); assert.equal(pressure(p), 1);
	});
	it('spends a ready core on a blocked attack without collateral damage or status', () => {
		const [p, q] = setup(true); ready(p, q); const other = battle.p2.active[1], before = other.hp;
		q.addVolatile('protect'); hit(p, q);
		assert.equal(pressure(p), 0); assert.equal(q.status, ''); assert.equal(other.hp, before);
		assert(p.volatiles.plasmaairborne);
	});
	it('deals 75% of actual primary HP loss to every other foe and applies guaranteed opposite status', () => {
		const [p, q] = setup(true); ready(p, q);
		const other = battle.p2.active[1], ally = battle.p1.active[1];
		const primaryBefore = q.hp, otherBefore = other.hp, allyBefore = ally.hp;
		hit(p, q); const dealt = primaryBefore - q.hp;
		assert.equal(otherBefore - other.hp, Math.floor(dealt * .75));
		assert.equal(q.status, 'par'); assert.equal(other.status, 'par'); assert.equal(ally.hp, allyBefore);
		assert.equal(pressure(p), 0);
	});
	it('caps collateral by actual overkill damage and respects Magic Guard', () => {
		const [p, q] = setup(true); ready(p, q); q.hp = 8;
		const other = battle.p2.active[1]; other.setAbility('Magic Guard'); const before = other.hp;
		hit(p, q); assert.equal(other.hp, before); assert.equal(other.status, 'par');
		assert.equal(p.lastMoveUsed.plasmaAttack.primaryDamage, 8);
	});
	it('bases splash on damage actually dealt when the primary foe has little HP left', () => {
		const [p, q] = setup(true); ready(p, q); q.hp = 8;
		const other = battle.p2.active[1], before = other.hp;
		hit(p, q);
		assert.equal(p.lastMoveUsed.plasmaAttack.primaryDamage, 8);
		assert.equal(before - other.hp, 6);
	});
	it('hits both other opponents in free-for-all with the same collateral damage', () => {
		battle = common.createBattle({gameType: 'freeforall'}, [[set('Plasma Eruption')], [set()], [set()], [set()]]);
		for (const side of battle.sides) for (const pokemon of side.pokemon) {
			pokemon.getPassives = () => [];
			pokemon.hp = pokemon.maxhp = pokemon.baseMaxhp = 10000;
		}
		battle.randomChance = () => false;
		battle.random = (m, n) => n === undefined ? m - 1 : n - 1;
		battle.randomizer = value => value;
		const p = battle.p1.active[0], q = battle.p2.active[0];
		ready(p, q);
		const before = q.hp;
		hit(p, q);
		for (const side of [battle.p3, battle.p4]) {
			const foe = side.active[0];
			assert.equal(foe.maxhp - foe.hp, Math.floor((before - q.hp) * .75));
			assert.equal(foe.status, 'par');
		}
		assert.equal(pressure(p), 0);
	});
	it('ends flight after two end-of-turn ticks, blocks Pressure in flight, and spends one landing Fire boost', () => {
		const [p, q] = setup(); ready(p, q); hit(p, q); assert.equal(p.isGrounded(), false);
		const electric = hit(p, q, 'thunderbolt'); assert.equal(pressure(p), 0);
		assert.equal(battle.runEvent('BasePower', p, q, electric, 1000), 1200);
		battle.makeChoices('move splash', 'move splash'); assert(p.volatiles.plasmaairborne);
		battle.makeChoices('move splash', 'move splash'); assert(!p.volatiles.plasmaairborne); assert(p.volatiles.plasmalanding);
		assert.equal(p.isGrounded(), true); const fire = hit(p, q);
		assert(fire.plasmaAttack.landing); assert(!p.volatiles.plasmalanding);
		assert.equal(battle.runEvent('BasePower', p, q, fire, 1000), 1300); assert.equal(pressure(p), 1);
	});
	for (const grounding of ['ironball', 'gravity', 'smackdown', 'ingrain']) {
		it(`${grounding} prevents plasma flight without granting a landing charge`, () => {
			const [p, q] = setup(false, grounding === 'ironball' ? 'Iron Ball' : '');
			if (grounding === 'gravity') battle.field.addPseudoWeather('gravity', p);
			else if (grounding !== 'ironball') { if (grounding === 'smackdown') p.addVolatile('magnetrise'); p.addVolatile(grounding); }
			ready(p, q); hit(p, q); assert(!p.volatiles.plasmaairborne); assert(!p.volatiles.plasmalanding);
		});
	}
	it('removes only outstanding Pressure stages and preserves unrelated boosts', () => {
		const [p, q] = setup(); battle.boost({spe: 2, spa: 2}, p); ready(p, q); hit(p, q);
		assert.equal(p.boosts.spe, 2); assert.equal(p.boosts.spa, 2);
	});
	it('does not subtract Pressure stages again after Haze, stat replacement, or existing debuffs', () => {
		const [p, q] = setup(); ready(p, q); p.clearBoosts(); battle.boost({spe: 2, spa: 2}, p); hit(p, q);
		assert.equal(p.boosts.spe, 2); assert.equal(p.boosts.spa, 2);
		p.removeVolatile('plasmaairborne'); ready(p, q); p.setBoost({spe: 4, spa: -2}); hit(p, q);
		assert.equal(p.boosts.spe, 4); assert.equal(p.boosts.spa, -2);
	});
	it('suppression stops ability effects and clears phases without removing Proficient', () => {
		const [p, q] = setup(); ready(p, q); p.addVolatile('gastroacid');
		assert(!p.volatiles.plasmacore); assert.equal(p.boosts.spe, 0); assert.equal(p.boosts.spa, 0);
		const move = hit(p, q); assert(!move.plasmaAttack); assert(!move.secondaries.some(s => s.status === 'par'));
		assert(p.trySetStatus('brn', q));
	});
	it('clears phases and charges on switching and cannot pass them with Baton Pass', () => {
		const [p, q] = setup(); ready(p, q); battle.makeChoices('move batonpass', 'move splash'); battle.makeChoices('switch 2');
		for (const id of ['plasmacore', 'plasmaairborne', 'plasmalanding']) assert(!battle.p1.active[0].volatiles[id]);
		battle.makeChoices('switch 2', 'move splash'); assert.equal(pressure(p), 0);
	});
	for (const [terrain, type, value] of [['volcanicterrain', 'Fire', 1.15], ['burningterrain', 'Fire', 1.15],
		['superheatedterrain', 'Fire', 1.15], ['dragonsdenterrain', 'Fire', 1.15], ['electricterrain', 'Electric', 1.15],
		['factoryterrain', 'Electric', 1.15], ['shortcircuitterrain', 'Electric', 1.15], ['mountainterrain', 'Fire', 1.1],
		['caveterrain', 'Electric', 1.1], ['crystalcavernterrain', 'Fire', 1.1], ['desertterrain', 'Electric', 1.1],
		['ashenbeachterrain', 'Fire', 1.1], ['hauntedterrain', 'Fire', 1.05], ['newworldterrain', 'Electric', 1.05],
		['inverseterrain', 'Fire', 1.05], ['bigtopterrain', 'Electric', 1.05], ['fairytaleterrain', 'Fire', 1.05]]) {
		it(`uses the requested ${terrain} bonus for ${type}`, () => {
			const [p] = setup(); battle.field.setTerrain(terrain, p); assert.equal(plasmaFieldMultiplier(battle, p, type), value);
		});
	}
 it('stacks detonation with Proficient exactly once on the actual Mega',()=>{
  const [p,q]=setup(false,'','Typhlosion-Mega');ready(p,q);const move=hit(p,q);
  assert.equal(battle.runEvent('BasePower',p,q,move,1000),2080);
 });
 it('Ground attacks fail during flight, and Gravity forces landing',()=>{
  const [p,q]=setup();ready(p,q);hit(p,q);const before=p.hp;
  hit(q,p,'earthquake');assert.equal(p.hp,before);
  battle.actions.useMove('gravity',q);battle.eachEvent('Update');
  assert(!p.volatiles.plasmaairborne);assert(p.volatiles.plasmalanding);
  hit(q,p,'earthquake');assert(p.hp<before);
 });
 it('clears pre-existing burn when acquiring the ability',()=>{
  const[p,q]=setup();p.setAbility('No Ability');assert(p.trySetStatus('brn',q));p.setAbility('Plasma Eruption');assert.equal(p.status,'');
 });
 it('uses sun as the Drought bonus and takes only the strongest overlapping field bonus',()=>{
  const[p]=setup();battle.field.setWeather('sunnyday',p);assert.equal(plasmaFieldMultiplier(battle,p,'Electric'),1.1);
  battle.field.setTerrain('volcanicterrain',p);assert.equal(plasmaFieldMultiplier(battle,p,'Fire'),1.15);
 });
});
