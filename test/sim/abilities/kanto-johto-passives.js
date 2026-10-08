'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const { SpeciesPassives, KantoJohtoPassiveGroups } = require('../../../dist/data/species-passives');
const before = require('./kanto-johto-before.json');
let battle;
function setup(species, ability = 'No Ability', foe = 'No Ability') {
	const mon = (species, ability) => ({ species, ability, moves: ['splash', 'tackle', 'transform', 'skillswap'] });
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[mon(species, ability), mon('Chansey', 'No Ability')], [mon('Clefable', foe), mon('Chansey', 'No Ability')]]);
	battle.makeChoices('team 12', 'team 12');
	battle.field.terrain = '';
	return [battle.p1.active[0], battle.p2.active[0]];
}
function use(id, source, target, extra = {}) {
	const move = Dex.getActiveMove(id);
	Object.assign(move, { accuracy: true, willCrit: false }, extra);
	battle.actions.useMove(move, source, { target });
	battle.clearActiveMove();
}
describe('Approved Kanto and Johto passive migration', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	it('adds exactly fifty-one approved IDs while unapproved forms remain unchanged', () => {
		const expected = { ...before.passives };
		for (const [passive, ids] of Object.entries(before.groups))
			for (const id of ids)
				expected[id] = [...(expected[id] || []), passive];
		assert.deepEqual(KantoJohtoPassiveGroups, before.groups);
		for (const [passive, ids] of Object.entries(require('./regional-passives-approved.json').groups))
			for (const id of ids)
				expected[id] = [...(expected[id] || []), passive];
		for (const [p, ids] of Object.entries(require('./latest-passives-approved.json').groups)) for (const id of ids) expected[id] = [p];
		require('./passive-approval-overlays').passives(expected);
		assert.deepEqual(SpeciesPassives, expected);
		assert.equal(Object.keys(SpeciesPassives).length, 700);
	});
	for (const [passive, ids] of Object.entries(before.groups))
		for (const id of ids) {
			it(id + ' resolves the exact approved passive', () => {
				assert.deepEqual(Dex.species.get(id).passives, [id === 'granbull' ? 'rattled' : passive]);
			});
		}
	it('Gluttony consumes its half-HP berry through Gastro Acid', () => {
		const [p] = setup('Snorlax');
		p.addVolatile('gastroacid');
		p.setItem('Figy Berry');
		p.hp = Math.floor(p.maxhp * 0.4);
		battle.runEvent('Update', p);
		assert.equal(p.item, '');
	});
	it('Static runs only one chance roll with selected Static plus passive', () => {
		const [p, t] = setup('Raichu', 'Static');
		let rolls = 0;
		battle.randomChance = (n, d) => {
			if (n === 3 && d === 10)
				rolls++;
			return false;
		};
		use('tackle', t, p);
		assert.equal(rolls, 1);
	});
	it('Static survives suppression', () => {
		const [p, t] = setup('Raichu');
		p.addVolatile('gastroacid');
		battle.randomChance = () => true;
		use('tackle', t, p);
		assert.equal(t.status, 'par');
	});
	it('Harvest makes one roll with Orchard Bond and retains the shared Alolan package', () => {
		const [p] = setup('Exeggutor', 'Orchard Bond');
		p.lastItem = 'sitrusberry';
		let rolls = 0;
		battle.randomChance = (n, d) => {
			if (n === 1 && d === 2)
				rolls++;
			return false;
		};
		battle.eachEvent('Residual');
		assert.equal(rolls, 1);
		assert.deepEqual(Dex.species.get('exeggutoralola').passives, ['leafguard']);
	});
	it('Loyal Guard keeps its positive Intimidate reaction with Inner Focus', () => {
		const [p, t] = setup('Granbull', 'Loyal Guard');
		battle.singleEvent('Start', Dex.abilities.get('intimidate'), {}, t);
		assert.equal(p.boosts.atk, 1);
	});
	it('Limber protects Ditto while its selected ability is suppressed', () => {
		const [p, t] = setup('Ditto', 'Limber');
		p.addVolatile('gastroacid');
		use('thunderwave', t, p);
		assert.equal(p.status, '');
	});
	it('Transform takes the target passives and leaves the selected ability independent', () => {
		const [p, t] = setup('Ditto', 'Limber');
		t.formeChange('Venomoth');
		assert(p.transformInto(t));
		assert.deepEqual(p.getPassives(), ['shielddust']);
		assert(!p.getPassives().includes('limber'));
	});
	it('Sturdy survives suppression and still permits attack-scoped Mold Breaker', () => {
		const [p, t] = setup('Sudowoodo');
		p.addVolatile('gastroacid');
		use('watergun', t, p, { basePower: 10000 });
		assert.equal(p.hp, 1);
		p.hp = p.maxhp;
		t.setAbility('Mold Breaker');
		use('watergun', t, p, { basePower: 10000 });
		assert.equal(p.hp, 0);
	});
	it('Early Bird advances sleep twice while suppressed', () => {
		const [p, t] = setup('Dodrio');
		p.addVolatile('gastroacid');
		p.setStatus('slp', t);
		p.statusState.time = 5;
		battle.runEvent('BeforeMove', p, t, Dex.moves.get('splash'));
		assert.equal(p.statusState.time, 3);
	});
	it('calculator exports every exact recipient and deduplicates incoming Fire modifiers', () => {
		const { calculatorMetadata, calculateScenario } = require('../../../dist/sim/custom-calculator');
		const metadata = calculatorMetadata();
		for (const [passive, ids] of Object.entries(before.groups))
			for (const id of ids) {
				const row = metadata.species.find(row => Dex.species.get(row.name).id === id);
				assert.deepEqual(row.passives, [id === 'granbull' ? 'rattled' : passive], id);
			}
		for (const [species, passive] of [['Golduck', 'Damp'], ['Magcargo', 'Heatproof']]) {
			const input = { format: 'gen9nofieldsinglesgame', move: 'Flamethrower', samples: 16, seed: 42,
				actors: [{ species: 'Clefable', ability: 'No Ability' }, { species, ability: 'No Ability' }, { species: 'Chansey', ability: 'No Ability' }, { species: 'Chansey', ability: 'No Ability' }] };
			const passiveOnly = calculateScenario(input).results[1];
			input.actors[1].ability = passive;
			assert.deepEqual(calculateScenario(input).results[1], passiveOnly, species);
		}
	});
	it('real Mega Evolution retains Static and changes the selected ability independently', () => {
		const [p] = setup('Ampharos', 'Cotton Down');
		p.setItem('Ampharosite');
		p.canMegaEvo = battle.actions.canMegaEvo(p);
		assert(battle.actions.runMegaEvo(p));
		assert.equal(p.species.id, 'ampharosmega');
		assert.equal(p.ability, 'woolyconductor');
		assert.deepEqual(p.getPassives(), ['static']);
	});
	it('Illusion copies a passive-free disguise without publishing actual identity', () => {
		const [p] = setup('Raichu', 'Illusion');
		assert.deepEqual(p.getPassives(), []);
		assert(!battle.log.some(line => line.startsWith('|switch|p1') && /Raichu|Static|passive/.test(line)));
	});
	it('shared Orchard Bond still performs Harvest on unapproved Alolan Exeggutor', () => {
		const [p] = setup('Exeggutor-Alola', 'Orchard Bond');
		p.lastItem = 'sitrusberry';
		battle.randomChance = () => true;
		battle.eachEvent('Residual');
		assert.equal(p.item, 'sitrusberry');
		assert.deepEqual(p.getPassives(), ['leafguard']);
	});
});
