'use strict';
const assert = require('node:assert/strict');
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const { legendarySlots, legendaryPassiveGroups } = require('../../../dist/data/legendary-roster');
const mon = (species, ability, ...moves) => ({ species, ability, moves });
const spare = () => mon('Magikarp', 'No Ability', 'splash', 'watergun', 'tackle');
describe('Legendary and mythical roster', () => {
	let b;
	afterEach(() => b?.destroy());
	function start(holder, partner, others) {
		const doubles = !!partner;
		const team = partner ? [holder, partner] : [holder];
		const foes = others || (partner ? [spare(), spare()] : [spare()]);
		b = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [
			team,
			foes,
		]);
		b.makeChoices(...[team, foes].map(s => 'team ' + s.map((_, i) => i + 1).join('')));
		b.randomizer = n => n;
		b.randomChance = (n, d) => n >= d;
		return [b.p1.active[0], b.p2.active[0], b.p1.active[1]];
	}
	const use = (move, source, target) => b.actions.useMove(move, source, { target });
	it('loads all reviewed forms, slots, usable abilities and required items', () => {
		for (const [id, forms] of Object.entries(legendaryPassiveGroups)) {
			assert(Dex.abilities.get(id).exists, id);
			for (const f of forms) assert.deepEqual(Dex.species.get(f).passives, [id], f);
		}
		for (const [f, slots] of Object.entries(legendarySlots)) {
			assert.deepEqual(Dex.species.get(f).abilities, slots, f);
			for (const ability of Object.values(slots)) assert(Dex.abilities.get(ability).exists, ability);
		}
		assert.equal(Dex.species.get('dianciemega').abilities[0], 'Magic Bounce');
		assert.deepEqual(Dex.species.get('silvallywater').passives, []);
	});
	for (const move of ['transform', 'reflecttype'])
		it('First Draft heals on a successful ' + move, () => {
			const [p, q] = start(mon('Mew', 'First Draft', move));
			p.hp = 1;
			use(move, p, q);
			assert.equal(p.hp, 1 + Math.floor(p.baseMaxhp / 8));
			const after = p.hp;
			use(move, p, q);
			assert.equal(p.hp, after);
		});
	it('Lunar Wake rewards a cure once even when Lunar Blessing cures the pair', () => {
		const [p, , ally] = start(mon('Cresselia', 'Lunar Wake', 'lunarblessing'), spare());
		p.hp = 1;
		p.status = ally.status = 'psn';
		use('lunarblessing', p, p);
		assert.equal(ally.status, '');
		assert.equal(p.status, '');
		assert.equal(p.hp, 1 + b.modify(p.maxhp, 0.25) + Math.floor(p.baseMaxhp / 16));
	});
	it('Vine Relay needs another ally to be cured by Jungle Healing', () => {
		const [p, , ally] = start(mon('Zarude', 'Vine Relay', 'junglehealing'), spare());
		p.status = 'psn';
		use('junglehealing', p, p);
		assert.equal(p.boosts.def, 0);
		for (let i = 0; i < 2; i++) {
			ally.status = 'psn';
			use('junglehealing', p, p);
			assert.equal(p.boosts.def, 1);
		}
	});
	it('Crown Tending requires an actual Pollen Puff heal and pays once per turn', () => {
		const [p, , ally] = start(mon('Calyrex', 'Crown Tending', 'pollenpuff'), spare());
		p.hp = 1;
		use('pollenpuff', p, ally);
		assert.equal(p.hp, 1);
		for (let i = 0; i < 2; i++) {
			ally.hp = 1;
			use('pollenpuff', p, ally);
			assert.equal(p.hp, 1 + Math.floor(p.baseMaxhp / 16));
		}
	});
	it('Island Watch only pays for other teammates, once per entry', () => {
		const [p, q, ally] = start(mon('Tapu Fini', 'Telepathy', 'splash'), spare());
		p.hp = 1;
		for (const mon of [q, p]) {
			mon.status = 'psn';
			mon.cureStatus();
		}
		assert.equal(p.hp, 1);
		for (let i = 0; i < 2; i++) {
			ally.status = 'par';
			ally.clearStatus();
			assert.equal(p.hp, 1 + Math.floor(p.baseMaxhp / 16));
		}
	});
	it('Seed Courier cures an active ally after damaging a foe', () => {
		const [p, q, ally] = start(mon('Shaymin', 'Seed Courier', 'seedflare'), spare());
		q.hp = q.maxhp = 5000;
		ally.status = 'brn';
		b.randomChance = () => true;
		use('seedflare', p, q);
		assert.equal(ally.status, '');
		ally.status = 'par';
		use('seedflare', p, q);
		assert.equal(ally.status, 'par');
	});
	it('Dream Stalker only recovers against a sleeping foe', () => {
		const [p, q] = start(mon('Darkrai', 'Dream Stalker', 'watergun'));
		q.hp = q.maxhp = 5000;
		p.hp = 1;
		use('watergun', p, q);
		assert.equal(p.hp, 1);
		q.status = 'slp';
		use('watergun', p, q);
		use('watergun', p, q);
		assert.equal(p.hp, 1 + Math.floor(p.baseMaxhp / 8));
	});
	it('Snow Passage cures paralysis once in snow', () => {
		const [p] = start(mon('Chien-Pao', 'Sword of Ruin', 'splash'));
		p.status = 'par';
		b.fieldEvent('Residual');
		assert.equal(p.status, 'par');
		b.field.setWeather('snow', p);
		b.fieldEvent('Residual');
		assert.equal(p.status, '');
		p.status = 'par';
		b.fieldEvent('Residual');
		assert.equal(p.status, 'par');
	});
	it('Signature Drive boosts only the matching active Drive and keeps passive Download', () => {
		const [p, q] = start({ ...mon('Genesect', 'Signature Drive', 'technoblast'), item: 'Douse Drive' });
		const damage = (id, type) =>
			b.runEvent('ModifyDamage', p, q, Object.assign(Dex.getActiveMove(id), { type }), 100);
		assert.equal(damage('technoblast', 'Water'), 115);
		assert.equal(damage('technoblast', 'Fire'), 100);
		assert.equal(damage('surf', 'Water'), 100);
		assert.deepEqual(p.getPassives(), ['download']);
		p.setItem('');
		assert.equal(damage('technoblast', 'Water'), 100);
	});
	it('Download grants Genesect its critical-hit window only on the first entry', () => {
		const set = { ...mon('Genesect-Douse', 'Signature Drive', 'watergun', 'splash'), item: 'Douse Drive' };
		b = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[set, spare()], [spare()]]);
		b.makeChoices('team 12', 'team 1');
		const p = b.p1.active[0];
		assert(p.volatiles.laserfocus);
		assert.equal(p.boosts.atk + p.boosts.spa, 1);
		b.makeChoices('switch 2', 'move splash');
		b.makeChoices('switch 2', 'move splash');
		assert(!p.volatiles.laserfocus);
		assert.equal(p.boosts.atk + p.boosts.spa, 1);
		assert.equal(p.ability, 'signaturedrive');
	});
	it('Diancie shares Crystal Facet across Mega Evolution and regains it after switching', () => {
		b = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ ...mon('Diancie', 'Clear Body', 'splash'), item: 'Diancite' }, spare()],
			[spare()],
		]);
		b.makeChoices('team 12', 'team 1');
		const p = b.p1.active[0],
			q = b.p2.active[0];
		const hit = () => {
			p.boosts.def = -1;
			use(Object.assign(Dex.getActiveMove('rockthrow'), { accuracy: true }), q, p);
		};
		hit();
		assert.equal(p.boosts.def, 0);
		b.makeChoices('move splash mega', 'move splash');
		assert.equal(p.species.id, 'dianciemega');
		hit();
		assert.equal(p.boosts.def, -1);
		b.makeChoices('switch 2', 'move splash');
		b.makeChoices('switch 2', 'move splash');
		hit();
		assert.equal(p.boosts.def, 0);
	});
	it('Crystal Facet and Boiler Vent clear only the relevant negative stages', () => {
		const [p, q] = start(mon('Diancie', 'Clear Body', 'rockthrow'), null, [
			mon('Volcanion', 'Boiler Vent', 'steameruption'),
		]);
		b.randomChance = () => true;
		p.hp = p.maxhp = q.hp = q.maxhp = 5000;
		p.boosts.def = -2;
		p.boosts.spd = -1;
		q.boosts.spe = -2;
		use('rockthrow', q, p);
		assert.equal(p.boosts.def, 0);
		assert.equal(p.boosts.spd, -1);
		use('steameruption', q, p);
		assert.equal(q.boosts.spe, 0);
		p.boosts.def = q.boosts.spe = -1;
		use('rockthrow', q, p);
		use('steameruption', q, p);
		assert.equal(p.boosts.def, -1);
		assert.equal(q.boosts.spe, -1);
	});
	it('Cold Reserve heals once after a complete super-effective multi-hit attack', () => {
		const [p, q] = start(mon('Kyurem', 'Pressure', 'splash'));
		p.hp = 200;
		const afterHit = [];
		const original = p.damage.bind(p);
		p.damage = (...args) => {
			const n = original(...args);
			afterHit.push(p.hp);
			return n;
		};
		use(
			Object.assign(Dex.getActiveMove('rockblast'), {
				accuracy: true,
				multihit: 3,
				basePower: 10,
				willCrit: false,
			}),
			q,
			p
		);
		assert.equal(afterHit.length, 3);
		assert.equal(p.hp, afterHit[2] + Math.floor(p.baseMaxhp / 16));
		use('rockthrow', q, p);
		assert.equal(p.hp, afterHit.at(-1));
	});
	for (const [species, ability, move] of [
		['Hoopa', 'Ring Trick', 'hyperspacehole'],
		['Necrozma', 'Prism Armor', 'photongeyser'],
	]) {
		it(species + ' refunds one signature PP on a direct KO', () => {
			const [p, q] = start(mon(species, ability, move), null, [spare(), spare()]);
			q.hp = 1;
			const slot = p.getMoveData(move),
				before = slot.pp;
			b.makeChoices('move ' + move, 'move splash');
			assert.equal(q.hp, 0);
			assert.equal(slot.pp, before);
			b.makeChoices('', 'switch 2');
			b.p2.active[0].hp = 1;
			b.makeChoices('move ' + move, 'move splash');
			assert.equal(slot.pp, before - 1);
		});
	}
	it('Bulwark Relay heals only after the holder’s Wide Guard blocks an enemy spread attack', () => {
		const [p, q, ally] = start(mon('Zamazenta', 'Dauntless Shield', 'wideguard'), spare());
		ally.hp = 1;
		p.side.addSideCondition('wideguard', p);
		use('surf', q, p);
		assert.equal(ally.hp, 1 + Math.floor(ally.baseMaxhp / 8));
		use('surf', q, p);
		assert.equal(ally.hp, 1 + Math.floor(ally.baseMaxhp / 8));
	});
	it('Mask Mender heals once only below half HP', () => {
		const [p, q] = start(mon('Ogerpon', 'Defiant', 'ivycudgel'));
		q.hp = q.maxhp = 5000;
		p.hp = Math.ceil(p.maxhp / 2);
		use('ivycudgel', p, q);
		assert.equal(p.hp, Math.ceil(p.maxhp / 2));
		p.hp = 1;
		use('ivycudgel', p, q);
		use('ivycudgel', p, q);
		assert.equal(p.hp, 1 + Math.floor(p.baseMaxhp / 16));
	});
	it('Shadow Step requires a damaging Spectral Thief that stole boosts', () => {
		const [p, q] = start(mon('Marshadow', 'Shadow Step', 'spectralthief'));
		q.hp = q.maxhp = 5000;
		p.status = 'brn';
		use('spectralthief', p, q);
		assert.equal(p.status, 'brn');
		q.boosts.spe = 1;
		use('spectralthief', p, q);
		assert.equal(p.status, '');
	});
	it('Binding Chain uses the last successful move and recognizes poison from this attack', () => {
		const [p, q] = start(mon('Pecharunt', 'Binding Chain', 'malignantchain'), null, [
			mon('Magikarp', 'No Ability', 'tackle', 'rest'),
		]);
		q.hp = q.maxhp = 5000;
		use('tackle', q, p); // Ghost immunity means this failed.
		assert(!q.m.lastSuccessfulMove);
		p.setType('Normal');
		use('tackle', q, p);
		assert.equal(q.m.lastSuccessfulMove, 'tackle');
		use('rest', q, q);
		assert.equal(q.m.lastSuccessfulMove, 'tackle');
		b.randomChance = () => true;
		use('malignantchain', p, q);
		assert.equal(q.status, 'tox');
		assert.equal(q.volatiles.disable.move, 'tackle');
		assert.equal(q.volatiles.disable.duration, 3);
	});
});
