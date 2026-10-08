'use strict';
const assert = require('assert').strict, common = require('../../common'), { Dex } = require('../../../dist/sim');
const before = require('./regional-passives-approved.json');
const { SpeciesPassives, RegionalPassiveGroups } = require('../../../dist/data/species-passives');
const { calculateScenario, calculatorMetadata } = require('../../../dist/sim/custom-calculator');
let battle;
function setup(species, ability = 'No Ability', doubles = false) {
	const mon = (species = 'Chansey', ability = 'No Ability') => ({ species, ability, item: 'Leftovers', moves: ['splash', 'tackle', 'icepunch', 'confuseray'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [[mon(species, ability), mon(), mon()], [mon(), mon(), mon()]]);
	battle.makeChoices('team 123', 'team 123');
	battle.field.terrain = '';
	battle.randomChance = () => false;
	return [battle.p1.active[0], battle.p2.active[0], battle.p1.active[1]];
}
function use(id, source, target, extra = {}) {
	const m = Object.assign(Dex.getActiveMove(id), { accuracy: true, willCrit: false }, extra);
	battle.actions.useMove(m, source, { target });
	battle.clearActiveMove();
}
describe('Exact approved regional passive whitelist', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	it('adds precisely 399 records to the prior 255, with one passive each', () => {
		const expected = { ...before.previousPassives };
		for (const [p, ids] of Object.entries(before.groups))
			for (const id of ids)
				expected[id] = [p];
		assert.deepEqual(RegionalPassiveGroups, before.groups);
		for (const [p, ids] of Object.entries(require('./latest-passives-approved.json').groups)) for (const id of ids) expected[id] = [p];
		require('./passive-approval-overlays').passives(expected);
		assert.deepEqual(SpeciesPassives, expected);
		assert.equal(Object.keys(SpeciesPassives).length, 700);
	});
	for (const [p, ids] of Object.entries(before.groups))
		for (const id of ids)
			it(id + ' has only approved ' + p + ' and preserves stats/types', () => {
				const s = Dex.species.get(id);
				assert.deepEqual(s.passives, [p]);
				assert.deepEqual(s.baseStats, before.species[id].baseStats);
				assert.deepEqual(s.types, before.species[id].types);
				const expected = { ...before.species[id].abilities };
				if (id === 'froslass')
					expected[0] = 'Infiltrator';
				for (const [changed, slot, , name] of require('./latest-passives-approved.json').slots) if (changed === id) expected[slot] = name;
				assert.deepEqual(s.abilities, expected);
			});
	it('resolves the existing Corsola Reborn alias without creating a blank event-ability record', () => {
		const alias = Dex.species.get('corsolareborn');
		assert.deepEqual(alias.abilities, Dex.species.get('corsolaalt').abilities);
		assert(alias.abilities[0]);
		assert.deepEqual(alias.passives, []);
	});
	it('exports calculator metadata for all approved forms', () => {
		const metadata = calculatorMetadata();
		for (const [p, ids] of Object.entries(before.groups))
			for (const id of ids)
				assert.deepEqual(metadata.species.find(s => Dex.species.get(s.name).id === id).passives, [p], id);
	});
	it('preserves Accumulation damage mitigation without doubling Thick Fat', () => {
		const input = { format: 'gen9nofieldsinglesgame', move: 'Flamethrower', samples: 16, seed: 42, actors: [{ species: 'Chansey', ability: 'No Ability' }, { species: 'Walrein', ability: 'No Ability' }, { species: 'Chansey', ability: 'No Ability' }, { species: 'Chansey', ability: 'No Ability' }] };
		const plain = calculateScenario(input).results[1];
		input.actors[1].ability = 'Accumulation';
		assert.deepEqual(calculateScenario(input).results[1], plain);
		const [p] = setup('Walrein', 'Accumulation');
		p.activeTurns = 1;
		battle.eachEvent('Residual');
		assert.equal(p.volatiles.stockpile.layers, 1);
	});
	it('Mega Lopunny gets only confusion protection from its replacement', () => {
		const [p, t] = setup('Lopunny', 'No Ability');
		p.formeChange('Lopunny-Mega');
		p.setAbility('Unchecked Assault');
		use('confuseray', t, p);
		assert(!p.volatiles.confusion);
		assert(!p.hasAbility('owntempo'));
		battle.boost({ atk: -1 }, p, t, Dex.abilities.get('intimidate'));
		assert.equal(p.boosts.atk, -1);
	});
	it('Cinder Scales stops external accuracy drops but permits self costs', () => {
		const [p, t] = setup('Volcarona', 'Cinder Scales');
		battle.boost({ accuracy: -1 }, p, t, Dex.moves.get('sandattack'));
		assert.equal(p.boosts.accuracy, 0);
		battle.boost({ accuracy: -1 }, p, p, Dex.moves.get('splash'));
		assert.equal(p.boosts.accuracy, -1);
	});
	it('Banette Frisk rolls once per opposing item holder, including selected Cursed Doll', () => {
		const [p, t] = setup('Banette', 'Cursed Doll');
		let rolls = 0;
		battle.randomChance = (n, d) => {
			if (n === 3 && d === 10)
				rolls++;
			return false;
		};
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		battle.runEvent('SwitchIn', p);
		assert.equal(rolls, 1);
	});
	it('Corsola retains the existing single recovery amount with Withering Shell and Natural Cure', () => {
		const [p, t] = setup('Corsola', 'Withering Shell');
		p.hp = 1;
		p.setStatus('psn', t);
		const max = p.maxhp;
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(p.status, '');
		assert.equal(p.hp, 1 + Math.floor(max / 3));
	});
	it('Mega Froslass preserves guaranteed Disable without a second passive chance', () => {
		const [p, t] = setup('Froslass', 'No Ability');
		p.formeChange('Froslass-Mega');
		p.setAbility('Mourning Snow');
		let rolls = 0;
		battle.randomChance = (n, d) => {
			if (n === 3 && d === 10)
				rolls++;
			return false;
		};
		t.lastMove = Dex.getActiveMove('icepunch');
		use('icepunch', t, p);
		assert(t.volatiles.disable);
		assert.equal(rolls, 0);
	});
	it('Echo Fiend retains ally sound protection and conversion while its holder uses passive Soundproof', () => {
		const [p, t, ally] = setup('Noivern', 'Echo Fiend', true);
		const hp = p.hp;
		use('hypervoice', t, p);
		assert.equal(p.hp, hp);
		assert(p.getAbility().flags.cantsuppress);
		const m = Dex.getActiveMove('hypervoice');
		battle.runEvent('ModifyType', p, t, m, m);
		assert.equal(m.type, 'Flying');
		const allyhp = ally.hp;
		use('hypervoice', p, ally);
		assert.equal(ally.hp, allyhp);
	});
	it('field-only interactions recognize assigned Sand Force through suppression', () => {
		const [p] = setup('Sandslash');
		p.addVolatile('gastroacid');
		battle.field.setWeather('sandstorm', p);
		const hp = p.hp;
		battle.eachEvent('Weather');
		assert.equal(p.hp, hp);
	});
});
