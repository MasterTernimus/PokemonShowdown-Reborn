'use strict';
const assert = require('assert').strict, fs = require('fs'), common = require('../../common'), { Dex } = require('../../../dist/sim');
let battle;
const protocol = [];
function start(doubles = false, ability = 'Void Crossing') {
	const p = { species: 'Mismagius', ability, moves: ['shadowball', 'powergem', 'splash', 'darkpulse'] };
	const t = { species: 'Mew', ability: 'No Ability', moves: ['tackle', 'splash', 'earthpower', 'surf'] };
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [[p, { ...t }, { ...t }], [{ ...t }, { ...t }, { ...t }]]);
	battle.makeChoices('team 123', 'team 123');
	battle.field.terrain = '';
	battle.randomizer = x => x;
	battle.randomChance = (n, d) => n >= d;
	for (const side of battle.sides)
		for (const mon of side.pokemon)
			mon.hp = mon.maxhp = mon.baseMaxhp = 4000;
	return [battle.p1.active[0], battle.p2.active[0]];
}
function use(p, t, id, extra = {}) {
	battle.clearActiveMove();
	const m = battle.dex.getActiveMove(id);
	Object.assign(m, { accuracy: true, willCrit: false, secondaries: null }, extra);
	const hp = t.hp;
	battle.actions.useMove(m, p, { target: t });
	const active = battle.activeMove;
	battle.runEvent('AfterMove', p, t, active);
	battle.clearActiveMove();
	return hp - t.hp;
}
function curse(p, t) { use(p, t, 'shadowball'); assert(t.volatiles.voidcrossingcurse); }
describe('Void Crossing Infiltrator and refreshing curse', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	after(() => fs.writeFileSync('artifacts/void-crossing-protocol.json', JSON.stringify(protocol, null, 2)));
	it('has exactly the approved components, one holder, passive Levitate and no obsolete use counter', () => {
		const a = Dex.abilities.get('voidcrossing'), parts = require('../../../dist/data/ability-components').AbilityComponents;
		assert.deepEqual(parts.voidcrossing, ['magicguard', 'infiltrator']);
		assert.equal(a.onModifyMove.toString(), Dex.abilities.get('infiltrator').onModifyMove.toString());
		assert.deepEqual(Dex.species.all().filter(s => Object.values(s.abilities).includes('Void Crossing')).map(s => s.id), ['mismagius']);
		assert.deepEqual(Dex.species.get('mismagius').passives, ['levitate']);
		assert(!a.onTryMove);
		assert(!/first executed|first Ghost|New World|accuracy|Sp\. Atk/.test(a.desc));
	});
	for (const screen of ['reflect', 'lightscreen', 'auroraveil', 'arenitewall', 'atlantiswall'])
		it('repeatedly bypasses ' + screen + ' without removing it', () => {
			const [p, t] = start();
			t.setType('Grass');
			const move = screen === 'reflect' ? 'firepunch' : 'flamethrower';
			const base = use(p, t, move);
			t.side.addSideCondition(screen, t);
			assert(t.side.sideConditions[screen]);
			assert.equal(use(p, t, move), base);
			assert.equal(use(p, t, move), base);
			assert(t.side.sideConditions[screen]);
			p.addVolatile('gastroacid', t);
			assert(use(p, t, move) < base);
		});
	it('bypasses Substitute repeatedly with Ghost, Power Gem, other attacks and status moves', () => {
		const [p, t] = start();
		t.addVolatile('substitute');
		const sub = t.volatiles.substitute.hp;
		for (const id of ['shadowball', 'shadowball', 'powergem', 'powergem', 'darkpulse', 'flamethrower'])
			assert(use(p, t, id) > 0, id);
		use(p, t, 'willowisp');
		assert.equal(t.status, 'brn');
		assert.equal(t.volatiles.substitute.hp, sub);
		assert(!p.volatiles.spectralcrossingspent);
	});
	it('bypasses Mist and Safeguard without removing them', () => {
		const [p, t] = start();
		t.side.addSideCondition('mist', t);
		t.side.addSideCondition('safeguard', t);
		use(p, t, 'growl');
		assert.equal(t.boosts.atk, -1);
		use(p, t, 'willowisp');
		assert.equal(t.status, 'brn');
		assert(t.side.sideConditions.mist);
		assert(t.side.sideConditions.safeguard);
	});
	for (const fail of ['miss', 'protect', 'immune', 'suppressed', 'ally'])
		it('does not curse after ' + fail, () => {
			const [p, t] = start(true);
			if (fail === 'protect')
				t.addVolatile('protect');
			if (fail === 'immune')
				t.setType('Normal');
			if (fail === 'suppressed')
				p.addVolatile('gastroacid', t);
			const target = fail === 'ally' ? battle.p1.active[1] : t;
			use(p, target, 'shadowball', fail === 'miss' ? { accuracy: 0 } : {});
			assert(!target.volatiles.voidcrossingcurse);
		});
	it('uses ordinary volatile immunity and does not bypass an explicit TryAddVolatile block', () => {
		const [p, t] = start();
		battle.onEvent('TryAddVolatile', battle.format, status => status.id === 'voidcrossingcurse' ? false : undefined);
		use(p, t, 'shadowball');
		assert(!t.volatiles.voidcrossingcurse);
	});
	it('applies once after all hits, preserves selected abilities and does not clear stages', () => {
		const [p, t] = start();
		p.boosts.spa = -2;
		p.boosts.accuracy = -2;
		const before = battle.log.length;
		use(p, t, 'shadowball', { multihit: 3 });
		assert(t.volatiles.voidcrossingcurse);
		assert.equal(t.ability, 'noability');
		const log = battle.log.slice(before);
		assert.equal(log.filter(l => l.startsWith('|-start|') && l.includes('Void Crossing curse')).length, 1);
		assert(log.findIndex(l => l.includes('Void Crossing curse')) > log.map(l => l.startsWith('|-damage|')).lastIndexOf(true));
		assert.equal(p.boosts.spa, -2);
		assert.equal(p.boosts.accuracy, -2);
		protocol.push({ name: 'applied', log: battle.log.slice() });
	});
	for (const multihit of [1, 3])
		it('reduces all ' + multihit + ' hits of the next attack once, then permits full damage', () => {
			const [p, t] = start();
			const base = use(t, p, 'watergun', { multihit });
			curse(p, t);
			const damage = use(t, p, 'watergun', { multihit });
			assert(damage < base);
			assert(Math.abs(damage - base * 0.8) <= multihit * 2);
			assert(!t.volatiles.voidcrossingcurse);
			assert.equal(use(t, p, 'watergun', { multihit }), base);
			protocol.push({ name: 'consumed', log: battle.log.slice() });
		});
	it('reduces every spread target in doubles and curses every actually hit opponent', () => {
		const [p, t] = start(true), ally = battle.p1.active[1];
		const hp = [p.hp, ally.hp];
		use(t, p, 'surf');
		const base = [hp[0] - p.hp, hp[1] - ally.hp];
		curse(p, t);
		const before = [p.hp, ally.hp];
		use(t, p, 'surf');
		const reduced = [before[0] - p.hp, before[1] - ally.hp];
		for (let i = 0; i < 2; i++) {
			assert(reduced[i] < base[i]);
			assert(Math.abs(reduced[i] - 0.8 * base[i]) <= 2);
		}
		assert(!t.volatiles.voidcrossingcurse);
		use(p, t, 'shadowball', { target: 'allAdjacentFoes' });
		assert(battle.p2.active.every(mon => mon.volatiles.voidcrossingcurse));
		assert(!ally.volatiles.voidcrossingcurse);
	});
	it('status moves preserve the mark; misses and protected damaging attacks consume it', () => {
		const [p, t] = start();
		curse(p, t);
		use(t, t, 'splash');
		assert(t.volatiles.voidcrossingcurse);
		use(t, p, 'watergun', { accuracy: 0 });
		assert(!t.volatiles.voidcrossingcurse);
		curse(p, t);
		p.addVolatile('protect');
		use(t, p, 'watergun');
		assert(!t.volatiles.voidcrossingcurse);
	});
	it('does not spend the mark when flinching prevents the action', () => {
		const [p, t] = start();
		curse(p, t);
		t.addVolatile('flinch', p);
		battle.actions.runMove('surf', t, 1);
		assert(t.volatiles.voidcrossingcurse);
	});
	it('a later application remains available on the following turn after a faster foe has acted', () => {
		const [p, t] = start();
		p.boosts.spe = -6;
		const base = use(t, p, 'surf'), hp = p.hp;
		battle.makeChoices('move shadowball', 'move surf');
		assert.equal(hp - p.hp, base);
		assert.equal(t.volatiles.voidcrossingcurse.duration, 1);
		const before = p.hp;
		battle.makeChoices('move splash', 'move surf');
		assert(before - p.hp < base);
		assert(!t.volatiles.voidcrossingcurse);
	});
	it('fixed damage keeps the engine normal fixed-damage rules and still consumes the next damaging move', () => {
		const [p, t] = start();
		p.setType('Normal');
		const base = use(t, p, 'seismictoss');
		curse(p, t);
		assert.equal(use(t, p, 'seismictoss'), base);
		assert(!t.volatiles.voidcrossingcurse);
	});
	it('refreshes without stacking or repeated messages and expires after the following turn', () => {
		const [p, t] = start();
		curse(p, t);
		battle.fieldEvent('Residual');
		assert.equal(t.volatiles.voidcrossingcurse.duration, 1);
		const before = battle.log.length;
		curse(p, t);
		assert.equal(t.volatiles.voidcrossingcurse.duration, 2);
		assert(!battle.log.slice(before).some(l => l.startsWith('|-start|') && l.includes('Void Crossing curse')));
		battle.fieldEvent('Residual');
		assert(t.volatiles.voidcrossingcurse);
		battle.fieldEvent('Residual');
		assert(!t.volatiles.voidcrossingcurse);
	});
	it('clears on real switch-out and works within a normal turn before the marked foe acts', () => {
		const [p, t] = start();
		const base = use(t, p, 'surf'), hp = p.hp;
		battle.makeChoices('move shadowball', 'move surf');
		assert(p.hp < hp);
		assert(hp - p.hp < base);
		assert(!t.volatiles.voidcrossingcurse);
		curse(p, t);
		battle.makeChoices('move splash', 'switch 2');
		assert(!t.volatiles.voidcrossingcurse);
	});
	for (const grounding of ['gravity', 'ironball', 'smackdown', 'ingrain', 'moldbreaker', 'thousandarrows'])
		it('retains passive Levitate while respecting ' + grounding, () => {
			const [p, t] = start();
			assert.equal(use(t, p, 'earthpower'), 0);
			p.addVolatile('gastroacid', t);
			assert.equal(use(t, p, 'earthpower'), 0);
			p.removeVolatile('gastroacid');
			if (grounding === 'gravity')
				battle.field.addPseudoWeather('gravity', t);
			else if (grounding === 'ironball')
				p.setItem('ironball');
			else if (grounding === 'moldbreaker')
				t.setAbility('Mold Breaker');
			else if (grounding !== 'thousandarrows')
				p.addVolatile(grounding, t);
			assert(use(t, p, grounding === 'thousandarrows' ? 'thousandarrows' : 'earthpower') > 0);
			if (grounding === 'gravity')
				battle.field.removePseudoWeather('gravity');
			else if (grounding === 'ironball')
				p.clearItem();
			else if (grounding === 'moldbreaker')
				t.setAbility('No Ability');
			else {
				p.removeVolatile('smackdown');
				p.removeVolatile('ingrain');
			}
			assert.equal(use(t, p, 'earthpower'), 0);
		});
	it('retains Magic Guard and the hidden New World defense exemption', () => {
		const [p, t] = start();
		battle.damage(100, p, t, Dex.conditions.get('brn'));
		assert.equal(p.hp, 4000);
		battle.field.setTerrain('newworldterrain', p);
		for (const event of ['ModifyDef', 'ModifySpD'])
			assert.equal(battle.runEvent(event, p, t, null, 1000), 1000);
		p.addVolatile('gastroacid', t);
		assert.equal(battle.runEvent('ModifyDef', p, t, null, 1000), 900);
		assert(!/New World/.test(Dex.abilities.get('voidcrossing').desc));
	});
	it('calculator uses current components, bypasses screens, exposes curse logs and models a marked attacker', () => {
		const { calculateScenario, calculatorMetadata } = require('../../../dist/sim/custom-calculator');
		assert.deepEqual(calculatorMetadata().abilityComponents.voidcrossing, ['Magic Guard', 'Infiltrator']);
		const input = { format: 'gen9nofieldsinglesgame', move: 'Shadow Ball', samples: 8, seed: 42, actors: Array.from({ length: 4 }, () => ({ species: 'Mew', ability: 'No Ability' })) };
		input.actors[0] = { species: 'Mismagius', ability: 'Void Crossing' };
		const base = calculateScenario(input);
		input.screens = ['lightscreen'];
		assert.deepEqual(calculateScenario(input).results, base.results);
		assert(base.exampleLog.some(l => l.includes('Void Crossing curse')));
		input.actors[0].voidCrossingCurse = true;
		const cursed = calculateScenario(input);
		assert.notDeepEqual(cursed.results, base.results);
	});
});
