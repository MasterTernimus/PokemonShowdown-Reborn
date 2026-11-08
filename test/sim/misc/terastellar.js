'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe("Tera Stellar", function () {
	afterEach(function () {
		battle.destroy();
	});

	function fixture(species = 'Mew', ability = 'No Ability') {
		battle = common.createBattle([[{ species, ability, moves: ['splash'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		const p = battle.p1.active[0], q = battle.p2.active[0];
		battle.randomizer = n => n;
		battle.actions.terastallize(p);
		p.hp = p.maxhp = p.baseMaxhp = q.hp = q.maxhp = q.baseMaxhp = 10000;
		return [p, q];
	}
	function attack(p, q, id) {
		const move = Object.assign(battle.dex.getActiveMove(id), { accuracy: true, willCrit: false, secondaries: null });
		const hp = q.hp;
		battle.actions.runMove(move, p, p.getLocOf(q), { externalMove: true });
		return hp - q.hp;
	}
	function unboostedDamage(p, q, id) {
		const tera = p.terastallized; p.terastallized = '';
		try { return battle.actions.getDamage(p, q, Object.assign(battle.dex.getActiveMove(id), { willCrit: false })); } finally { p.terastallized = tera; }
	}
	it('boosts non-STAB damage 1.2x only on the first successful attack of each type', () => {
		const [p, q] = fixture();
		const water = unboostedDamage(p, q, 'waterpulse');
		assert.bounded(attack(p, q, 'waterpulse'), [Math.floor(water * 1.2) - 1, Math.floor(water * 1.2) + 1]);
		assert.deepEqual(p.stellarBoostedTypes, ['Water']);
		assert.equal(attack(p, q, 'waterpulse'), water);
		assert.equal(attack(p, q, 'hydropump'), unboostedDamage(p, q, 'hydropump'));
		const psychic = unboostedDamage(p, q, 'extrasensory');
		assert.equal(attack(p, q, 'extrasensory'), psychic);
		assert.equal(attack(p, q, 'extrasensory'), psychic);
		assert.equal(attack(p, q, 'hyperspacehole'), unboostedDamage(p, q, 'hyperspacehole'));
		assert.deepEqual(p.stellarBoostedTypes, ['Water', 'Psychic']);
	});
	it('uses the same once-per-type budget for Terapagos after its real Stellar form change', () => {
		const [p, q] = fixture('Terapagos', 'Tera Shift');
		assert.equal(p.species.id, 'terapagosstellar');
		const water = unboostedDamage(p, q, 'waterpulse');
		assert.bounded(attack(p, q, 'waterpulse'), [Math.floor(water * 1.2) - 1, Math.floor(water * 1.2) + 1]);
		assert.equal(attack(p, q, 'waterpulse'), water);
		const normal = unboostedDamage(p, q, 'hypervoice');
		assert.equal(attack(p, q, 'hypervoice'), normal);
		assert.equal(attack(p, q, 'hypervoice'), normal);
	});
	it('does not spend a type bonus on Protect or status moves', () => {
		const [p, q] = fixture();
		q.addVolatile('protect'); assert.equal(attack(p, q, 'waterpulse'), 0);
		assert.deepEqual(p.stellarBoostedTypes, []);
		battle.actions.runMove('splash', p, p.getLocOf(p), { externalMove: true });
		assert.deepEqual(p.stellarBoostedTypes, []);
		q.removeVolatile('protect'); assert(attack(p, q, 'waterpulse') > 0);
		assert.deepEqual(p.stellarBoostedTypes, ['Water']);
	});

	it(`should not modify the Pokemon's base type for defensive purposes`, function () {
		battle = common.createBattle([[
			{species: 'Krookodile', moves: ['sleeptalk'], teraType: 'Stellar'},
		], [
			{species: 'Tornadus', ability: 'prankster', moves: ['psychic', 'thunderwave', 'leer']},
		]]);

		const krookodile = battle.p1.active[0];

		battle.makeChoices('move sleeptalk terastallize', 'move psychic');
		assert.fullHP(krookodile);

		battle.makeChoices('auto', 'move thunderwave');
		assert.equal(krookodile.status, '');

		battle.makeChoices('auto', 'move thunderwave');

		battle.makeChoices('auto', 'move leer');
		assert.statStage(krookodile, 'def', 0);
	});

	it(`should only be super-effective against opposing Terastallized targets`, function () {
		battle = common.createBattle([[
			{species: 'Krookodile', moves: ['terablast'], teraType: 'Stellar'},
		], [
			{species: 'Steelix', item: 'weaknesspolicy', moves: ['sleeptalk'], teraType: 'Stellar'},
		]]);

		const steelix = battle.p2.active[0];
		battle.makeChoices('move terablast terastallize', 'move sleeptalk terastallize');
		assert.statStage(steelix, 'atk', 2);
	});

	it(`should increase the user's stats with Tera Blast if the user has Contrary`, function () {
		battle = common.createBattle([[
			{species: 'inkay', ability: 'contrary', moves: ['terablast'], teraType: 'Stellar'},
		], [
			{species: 'chansey', moves: ['sleeptalk']},
		]]);

		const inkay = battle.p1.active[0];

		battle.makeChoices('move terablast terastallize', 'move sleeptalk terastallize');
		assert.statStage(inkay, 'atk', 1);
		assert.statStage(inkay, 'spa', 1);
	});

	it('ignores Adaptability for both fresh and spent Stellar move types', () => {
		const [p, q] = fixture('Mew', 'Adaptability');
		p.setAbility('No Ability');
		const psychic = unboostedDamage(p, q, 'psychic');
		const water = unboostedDamage(p, q, 'waterpulse');
		p.setAbility('Adaptability');
		assert.equal(attack(p, q, 'psychic'), psychic);
		assert.equal(attack(p, q, 'psychic'), psychic);
		assert.bounded(attack(p, q, 'waterpulse'), [Math.floor(water * 1.2) - 1, Math.floor(water * 1.2) + 1]);
		assert.equal(attack(p, q, 'waterpulse'), water);
	});
});
