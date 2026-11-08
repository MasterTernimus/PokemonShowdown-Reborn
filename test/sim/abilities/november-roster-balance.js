'use strict';
const assert = require('assert').strict, common = require('../../common');
const { Dex } = require('../../../dist/sim');
const { AbilityComponents } = require('../../../dist/data/ability-components');
describe('November roster balance', () => {
	let battle;
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	function setup(ability, species = 'Mew', foeAbility = 'No Ability') {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species, ability, moves: ['tackle', 'splash', 'thunderbolt'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }], [{ species: 'Mew', ability: foeAbility, moves: ['splash', 'tackle'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('team 12', 'team 12'); return [battle.p1.active[0], battle.p2.active[0]];
	}
	it('keeps the approved slots and one passive per species', () => {
		const expected = { magneton: [['Magnet Pull', 'Elevate', 'Analytic'], 'hydrabond'], kingdra: [['Damp', 'Abyss Sniper', 'Storm Drain'], 'swiftswim'], honchkrow: [['Pressure', 'Void Command', 'Supreme Overlord'], 'moxie'], drapion: [['Battle Armor', 'Sniper', 'Crushing Venom', 'Aevian Toxin'], 'poisontouch'], toxicroak: [['Battle Fervor', 'Corrosion', 'Great Marsh'], 'anticipation'], conkeldurr: [['Guts', 'Stamina', 'Wrecking Crew'], 'rockypayload'], maushold: [['Technician', 'Cheek Pouch', 'Hospitality'], 'friendguard'], mausholdfour: [['Technician', 'Cheek Pouch', 'Hospitality'], 'friendguard'], dachsbun: [['Sweet Veil', 'Aroma Veil', 'Friend Guard'], 'wellbakedbody'], revavroom: [['Filter', 'Motor Drive', 'Reckless'], 'overcoat'] };
		for (const [id, [abilities, passive]] of Object.entries(expected)) {
			const p = Dex.species.get(id);
			assert.deepEqual(Object.values(p.abilities), abilities, id);
			assert.deepEqual(p.passives, [passive], id);
		}
		for (const id of ['vaporeon', 'jolteon', 'flareon'])assert.equal(Dex.species.get(id).abilities.H, 'Adaptability');
		for (const id of ['leafeon', 'glaceon'])assert.equal(Dex.species.get(id).abilities.H, 'Technician');
		assert.equal(Dex.species.get('flareon').abilities[1], 'Flame Body');
	});
	it('has exact stat totals and respects Rhydon mainline floors', () => {
		const rhydon = Dex.species.get('rhydon').baseStats;
		for (const [id, n] of Object.entries({ hp: 105, atk: 130, def: 120, spa: 45, spd: 45, spe: 40 }))assert(rhydon[id] >= n, id);
		assert.equal(Object.values(rhydon).reduce((a, b) => a + b), 520);
		assert.equal(Object.values(Dex.species.get('lanturn').baseStats).reduce((a, b) => a + b), 540);
	});
	for (const ability of ['Royal Scales', 'Verdant Crown', 'Tidal Crown', 'Burning Crown', 'Fallen Star', 'Atrocity', 'Raging Storm'])it(ability + ' no longer grants Self-Sufficient', () => {
		const [p, q] = setup(ability, 'Mew', 'Water Absorb');
		q.setType('Grass');
		p.hp = Math.floor(p.maxhp / 2);
		const hp = p.hp;
		assert(!p.hasAbility('selfsufficient'));
		assert(!AbilityComponents[p.ability].includes('selfsufficient'));
		battle.singleEvent('Residual', p.getAbility(), p.abilityState, p);
		assert.equal(p.hp, hp);
		assert(p.runStatusImmunity('sandstorm'));
		assert(!/Self.?Sufficient/i.test(p.getAbility().desc));
	});
	it('Fresh Plumage blocks only opposing accuracy drops and retains Natural Cure', () => {
		const [p, q] = setup('Fresh Plumage'); battle.boost({ accuracy: -1 }, p, q); assert.equal(p.boosts.accuracy, 0);
		battle.boost({ accuracy: -1 }, p, p); assert.equal(p.boosts.accuracy, -1);
		assert.equal(battle.runEvent('ModifyDamage', p, q, Dex.getActiveMove('gust'), 100), 100);
		p.setStatus('par');
		p.hp = 1;
		battle.singleEvent('SwitchOut', p.getAbility(), p.abilityState, p);
		assert.equal(p.status, '');
		assert(p.hp > 1);
		p.addVolatile('gastroacid', q); battle.boost({ accuracy: -1 }, p, q); assert.equal(p.boosts.accuracy, -2);
	});
	it('Void Command has no damage reduction or ordinary KO boost', () => {
		const [p, q] = setup('Void Command'); assert.equal(battle.runEvent('ModifyDamage', q, p, Dex.getActiveMove('tackle'), 100), 100);
		q.hp = 1;
		battle.makeChoices('move tackle', 'move splash');
		assert.equal(p.boosts.atk, 0);
		assert.equal(p.boosts.spa, 0);
	});
	it('Honchkrow gets exactly one Moxie boost on an ordinary KO', () => {
		const [p, q] = setup('Void Command', 'Honchkrow');
		q.hp = 1;
		battle.makeChoices('move tackle', 'move splash');
		assert.equal(p.boosts.atk, 1);
		assert.equal(p.boosts.spa, 0);
	});
	it('Magneton Hydra Bond passive supplies three hits', () => {
		const [p, q] = setup('Magnet Pull', 'Magneton'); q.hp = q.maxhp = 5000;
		const move = Object.assign(Dex.getActiveMove('thunderbolt'), { willCrit: false, accuracy: true }); battle.actions.useMove(move, p, { target: q });
		assert(battle.log.some(line => line.startsWith('|-hitcount|') && line.endsWith('|3')), battle.log.join('\n'));
	});
	it('Great Marsh no longer includes Anticipation', () => {
		const [p] = setup('Great Marsh'); assert(!p.hasAbility('anticipation')); assert(!AbilityComponents.greatmarsh.includes('anticipation'));
	});
	it('Conkeldurr has Rocky Payload power and selectable Stamina', () => {
		const [p, q] = setup('Stamina', 'Conkeldurr'); assert(p.hasAbilityOrPassive('rockypayload'));
		const move = Object.assign(Dex.getActiveMove('tackle'), { willCrit: false, accuracy: true }); battle.actions.useMove(move, q, { target: p }); assert.equal(p.boosts.def, 1);
	});

	it('Dachsbun absorbs Fire with its passive while its selected ability is suppressed', () => {
		const [p, q] = setup('Aroma Veil', 'Dachsbun'); p.addVolatile('gastroacid', q); const hp = p.hp;
		battle.actions.useMove(Object.assign(Dex.getActiveMove('ember'), { accuracy: true, willCrit: false }), q, { target: p });
		assert.equal(p.hp, hp); assert.equal(p.boosts.def, 2);
	});
	it('Revavroom Motor Drive absorbs Electric independently of its powder passive', () => {
		const [p, q] = setup('Motor Drive', 'Revavroom'); const hp = p.hp;
		battle.actions.useMove(Object.assign(Dex.getActiveMove('thunderbolt'), { accuracy: true, willCrit: false }), q, { target: p });
		assert.equal(p.hp, hp); assert.equal(p.boosts.spe, 1); assert(p.hasAbilityOrPassive('overcoat'));
	});
});
