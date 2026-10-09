'use strict';
const assert = require('assert').strict, common = require('../../common');
const { Dex } = require('../../../dist/sim');
let battle;
function setup(doubles = false) {
	const set = (species = 'Mew', ability = 'No Ability') => ({ species, ability, moves: ['doubleedge', 'aerialace', 'protect', 'splash'] });
	battle = common.createBattle(doubles ? { gameType: 'doubles' } : { formatid: 'gen9nofieldsinglesgame' }, [
		[set('Salamence-Mega', 'Crescent Rend'), set()], [set(), set()],
	]);
	if (battle.requestState === 'teampreview')battle.makeChoices('team 12', 'team 12');
	const p = battle.p1.active[0], q = battle.p2.active[0];
	if (p.species.id !== 'salamencemega')p.formeChange('Salamence-Mega', null, true);
	battle.field.terrain = '';
	battle.randomizer = n => n;
	for (const side of battle.sides) for (const m of side.pokemon)m.hp = m.maxhp = m.baseMaxhp = 10000;
	return [p, q];
}
function sub(q, hp) {
	q.addVolatile('substitute');
	q.volatiles.substitute.hp = hp;
}
function hit(p, q, id = 'tackle', extra = {}) {
	const m = Object.assign(Dex.getActiveMove(id), { accuracy: true, willCrit: false }, extra);
	battle.actions.useMove(m, p, { target: q });
	battle.clearActiveMove();
	return m;
}
describe('Approved Crescent Rend', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	it('replaces Free Flight completely and retains Aerilate', () => {
		const [p] = setup();
		assert.equal(p.ability, 'crescentrend');
		assert.deepEqual(p.getPassives(), ['aerilate']);
		assert(!p.hasAbility('freeflight'));
		assert.equal(p.boosts.def, 0);
	});
	it('matches calculator damage without adding power, and bypasses only the approved screens', () => {
		const { calculateScenario } = require('../../../dist/sim/custom-calculator');
		const input = { format: 'gen9nofieldsinglesgame', move: 'Double-Edge', samples: 16, seed: 42,
			actors: [{ species: 'Salamence-Mega', ability: 'Crescent Rend' },
				...Array.from({ length: 3 }, () => ({ species: 'Mew', ability: 'No Ability' }))] };
		const plain = calculateScenario(input).results;
		input.screens = ['reflect', 'auroraveil'];
		assert.deepEqual(calculateScenario(input).results, plain);
		input.screens = []; input.actors[0].ability = 'No Ability';
		assert.deepEqual(calculateScenario(input).results, plain);
	});
	for (const screen of ['reflect', 'auroraveil'])it('ignores ' + screen + ' only for physical Flying attacks', () => {
		const [p, q] = setup();
		let hp = q.hp;
		hit(p, q);
		const normal = hp - q.hp;
		q.hp = q.maxhp;
		q.side.addSideCondition(screen, q, Dex.moves.get(screen));
		hp = q.hp;
		hit(p, q);
		assert.equal(hp - q.hp, normal);
		p.addVolatile('gastroacid');
		q.hp = q.maxhp;
		hit(p, q);
		assert(q.maxhp - q.hp < normal);
		p.removeVolatile('gastroacid');
		q.hp = q.maxhp;
		hit(p, q, 'airslash');
		const special = q.maxhp - q.hp;
		q.side.removeSideCondition(screen);
		q.hp = q.maxhp;
		hit(p, q, 'airslash');
		if (screen === 'auroraveil')assert(q.maxhp - q.hp > special);
		else assert.equal(q.maxhp - q.hp, special);
	});
	it('makes converted attacks noncontact without bypassing Protect or immunity', () => {
		const [p, q] = setup();
		q.setItem('rockyhelmet');
		const hp = p.hp;
		hit(p, q);
		assert.equal(p.hp, hp);
		q.addVolatile('protect');
		const targetHP = q.hp;
		hit(p, q);
		assert.equal(q.hp, targetHP);
		q.removeVolatile('protect');
		q.setAbility('Wonder Guard');
		sub(q, 10);
		hit(p, q);
		assert.equal(q.hp, targetHP);
		assert.equal(q.volatiles.substitute.hp, 10);
	});
	it('calculates once and carries only excess damage through the breaking hit', () => {
		const [p, q] = setup();
		hit(p, q);
		const expected = q.maxhp - q.hp;
		q.hp = q.maxhp;
		sub(q, 17);
		const original = battle.actions.getDamage;
		let calculations = 0;
		battle.actions.getDamage = function (...args) {
			calculations++;
			return original.apply(this, args);
		};
		hit(p, q);
		assert.equal(calculations, 1);
		assert(!q.volatiles.substitute);
		assert.equal(q.maxhp - q.hp, expected - 17);
	});
	it('does not hit the owner when the Substitute survives or exactly absorbs the attack', () => {
		const [p, q] = setup();
		hit(p, q);
		const damage = q.maxhp - q.hp;
		q.hp = q.maxhp;
		sub(q, damage + 1);
		hit(p, q);
		assert.equal(q.hp, q.maxhp);
		assert.equal(q.volatiles.substitute.hp, 1);
		q.removeVolatile('substitute');
		sub(q, damage);
		hit(p, q);
		assert.equal(q.hp, q.maxhp);
		assert(!q.volatiles.substitute);
	});
	it('runs secondary effects and damaging-hit reactions once, with no contact reactions', () => {
		const [p, q] = setup();
		q.setAbility('Weak Armor');
		q.setItem('rockyhelmet');
		sub(q, 1);
		const hp = p.hp;
		hit(p, q, 'tackle', { secondaries: [{ chance: 100, boosts: { spd: -1 } }] });
		assert.equal(q.boosts.def, -1);
		assert.equal(q.boosts.spe, 2);
		assert.equal(q.boosts.spd, -1);
		assert.equal(p.hp, hp);
	});
	it('counts substitute plus actual HP damage once for Double-Edge recoil', () => {
		const [p, q] = setup();
		let recoilEvents = 0;
		const damage = battle.damage;
		battle.damage = function (amount, target, source, effect, ...rest) {
			if (effect === 'recoil')recoilEvents++;
			return damage.call(this, amount, target, source, effect, ...rest);
		};
		const hp = p.hp;
		hit(p, q, 'doubleedge');
		const recoil = hp - p.hp, total = q.maxhp - q.hp;
		p.hp = p.maxhp;
		q.hp = q.maxhp;
		sub(q, 17);
		hit(p, q, 'doubleedge');
		assert.equal(p.maxhp - p.hp, recoil);
		assert.equal(q.maxhp - q.hp, total - 17);
		assert.equal(recoilEvents, 2);
	});
	it('combines substitute and HP damage into one drain event', () => {
		const [p, q] = setup();
		p.hp = 5000;
		hit(p, q, 'tackle', { drain: [1, 2] });
		const healing = p.hp - 5000;
		p.hp = 5000;
		q.hp = q.maxhp;
		sub(q, 17);
		let drainEvents = 0;
		const heal = battle.heal;
		battle.heal = function (amount, target, source, effect, ...rest) {
			if (effect === 'drain')drainEvents++;
			return heal.call(this, amount, target, source, effect, ...rest);
		};
		hit(p, q, 'tackle', { drain: [1, 2] });
		assert.equal(p.hp - 5000, healing);
		assert.equal(drainEvents, 1);
	});
	for (const protection of ['Focus Sash', 'Sturdy'])it('honors ' + protection + ' once on the actual HP portion', () => {
		const [p, q] = setup();
		q.hp = q.maxhp = q.baseMaxhp = 100;
		if (protection === 'Sturdy')q.setAbility(protection);
		else q.setItem(protection);
		sub(q, 1);
		hit(p, q, 'tackle', { basePower: 1000 });
		assert.equal(q.hp, 1);
		assert(!q.volatiles.substitute);
	});
	it('continues multihits after breaking Substitute and stops at the actual target faint', () => {
		const [p, q] = setup();
		sub(q, 1);
		hit(p, q, 'tackle', { multihit: 3 });
		assert(battle.log.some(l => l.endsWith('|3') && l.startsWith('|-hitcount|')));
		q.hp = 1;
		sub(q, 1);
		const start = battle.log.length;
		hit(p, q, 'tackle', { multihit: 3 });
		assert.equal(q.hp, 0);
		assert.equal(battle.log.slice(start).filter(l => l.startsWith('|faint|')).length, 1);
		assert(battle.log.slice(start).some(l => l.endsWith('|1') && l.startsWith('|-hitcount|')));
	});
	it('keeps overflow separate for each doubles target', () => {
		const [p, q] = setup(true), r = battle.p2.active[1];
		sub(q, 10);
		sub(r, 30);
		hit(p, q, 'tackle', { target: 'allAdjacentFoes' });
		assert(!q.volatiles.substitute);
		assert(!r.volatiles.substitute);
		assert.equal((q.maxhp - q.hp) + 10, (r.maxhp - r.hp) + 30);
	});
	it('retains Aerilate under suppression but disables all Crescent Rend effects', () => {
		const [p, q] = setup();
		p.addVolatile('gastroacid');
		q.setItem('rockyhelmet');
		sub(q, 1);
		const hp = p.hp;
		hit(p, q);
		assert(!q.volatiles.substitute);
		assert.equal(q.hp, q.maxhp);
		hit(p, q);
		assert(p.hp < hp);
		assert.deepEqual(p.getPassives(), ['aerilate']);
	});
	it('caps recoil at the total Substitute and actual HP removed on a KO', () => {
		const [p, q] = setup();
		q.hp = 20;
		sub(q, 10);
		hit(p, q, 'doubleedge', { basePower: 1000 });
		assert.equal(q.hp, 0);
		assert.equal(p.maxhp - p.hp, 10);
	});
	it('caps drain at actual HP removed and copies Crescent Rend with Transform', () => {
		const [p, q] = setup();
		assert(q.transformInto(p));
		assert.equal(q.ability, 'crescentrend');
		assert.deepEqual(q.getPassives(), ['aerilate']);
		q.setAbility('No Ability');
		q.hp = 20; p.hp = 5000;
		sub(q, 10); hit(p, q, 'tackle', { basePower: 1000, drain: [1, 2] });
		assert.equal(q.hp, 0); assert.equal(p.hp, 5015);
	});
	it('runs HP Damage protection once and keeps a blocked overflow a successful Substitute hit', () => {
		const [p, q] = setup();
		sub(q, 30);
		let events = 0;
		const original = battle.runEvent;
		battle.runEvent = function (id, target, source, effect, ...rest) {
			if (id === 'Damage' && target === q && source === p && effect?.effectType === 'Move') {
				events++;
				return false;
			}
			return original.call(this, id, target, source, effect, ...rest);
		};
		hit(p, q, 'doubleedge', { secondaries: [{ chance: 100, boosts: { spd: -1 } }] });
		assert.equal(events, 1);
		assert.equal(q.hp, q.maxhp);
		assert.equal(q.boosts.spd, 0);
		assert(!q.volatiles.substitute);
		assert.equal(p.maxhp - p.hp, 10);
		p.hp = 5000; sub(q, 30);
		hit(p, q, 'tackle', { drain: [1, 2] });
		assert.equal(events, 2); assert.equal(p.hp, 5015);
	});
});
