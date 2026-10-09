'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const before = require('./steady-swimmer-before.json');
let battle;
function setup(species = 'Seaking', ability = 'No Ability', foe = 'No Ability') {
	const mon = (species = 'Chansey', ability = 'No Ability') => ({ species, ability, moves: ['thrash', 'confuseray', 'splash', 'tackle'] });
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
		[mon(species, ability), mon('Seaking')], [mon('Chansey', foe), mon()],
	]);
	battle.makeChoices('team 12', 'team 12');
	battle.field.terrain = '';
	for (const side of battle.sides) for (const p of side.pokemon) p.hp = p.maxhp = p.baseMaxhp = 10000;
	return [battle.p1.active[0], battle.p2.active[0]];
}
describe('Seaking confusion-only Steady Swimmer', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('changes only ordinary Seaking passives and leaves every selected slot unchanged', () => {
		for (const [id, old] of Object.entries(before.species)) {
			const species = Dex.species.get(id);
			assert.deepEqual(species.abilities, require('./passive-approval-overlays').abilities(id, {...old.abilities}), id);
			assert.deepEqual(species.passives, require('./passive-approval-overlays').current(id, old.passives), id);
		}
		assert.deepEqual(Dex.species.get('goldeen').passives, []);
		assert.equal(Object.keys(require('../../../dist/data/species-passives').SpeciesPassives).length, 820);
	});
	for (const suppression of ['none', 'gastroacid', 'meridianseal', 'gas']) {
		it('prevents opposing confusion through ' + suppression, () => {
			const [p, t] = setup();
			if (suppression === 'gas') t.setAbility('Neutralizing Gas');
			else if (suppression !== 'none') p.addVolatile(suppression);
			battle.actions.useMove('confuseray', t, { target: p });
			assert(!p.volatiles.confusion);
			assert.deepEqual(p.getPassives(), ['steadyswimmer']);
		});
	}
	it('prevents real Thrash exhaustion self-confusion', () => {
		const [p] = setup();
		battle.random = () => 2;
		for (let turn = 0; turn < 3; turn++) battle.makeChoices('move thrash', 'move splash');
		assert(!p.volatiles.confusion);
		assert(battle.log.some(line => line.includes('Steady Swimmer')));
	});
	for (const event of ['SwitchIn', 'Update']) {
		it('cures existing confusion on passive ' + event + ' activation without double execution', () => {
			const [p, t] = setup('Chansey');
			assert(p.addVolatile('confusion', t));
			p.formeChange('Seaking');
			p.setAbility('Steady Swimmer');
			// A duplicate selected copy must not cure through its own Start; the passive owns this effect.
			assert(p.volatiles.confusion);
			const at = battle.log.length;
			battle.runEvent(event, p);
			assert(!p.volatiles.confusion);
			assert.equal(battle.log.slice(at).filter(line => line.includes('|-end|') && /confusion/i.test(line)).length, 1);
		});
	}
	it('has no Intimidate protection, stat multiplier, field bonus or Own Tempo identity', () => {
		const [p, t] = setup();
		t.setAbility('Intimidate');
		assert.equal(p.boosts.atk, -1);
		assert(!p.hasAbilityOrPassive('owntempo'));
		assert(!p.hasAbility('steadyswimmer'));
		p.boosts.atk = 0;
		const move = Dex.getActiveMove('tackle');
		for (const field of ['', 'watersurfaceterrain', 'underwaterterrain', 'mirrorarenaterrain']) {
			battle.field.terrain = field;
			for (const event of ['BasePower', 'ModifyAtk', 'ModifySpA']) assert.equal(battle.runEvent(event, p, t, move, 100), 100);
		}
		const ability = Dex.abilities.get('steadyswimmer');
		assert.deepEqual(Object.keys(ability).filter(k => k.startsWith('on')).sort(), ['onStart', 'onTryAddVolatile', 'onUpdate']);
	});
	it('allows attack-scoped Mold Breaker bypass, then cures confusion after the attack scope ends', () => {
		const [p, t] = setup('Seaking', 'No Ability', 'Mold Breaker');
		const move = Dex.getActiveMove('confuseray');
		battle.runEvent('ModifyMove', t, p, move, move);
		assert(move.ignoreAbility);
		battle.setActiveMove(move, t, p);
		assert(p.addVolatile('confusion', t, move));
		assert(p.volatiles.confusion);
		battle.clearActiveMove();
		battle.runEvent('Update', p);
		assert(!p.volatiles.confusion);
	});
	it('Ability Shield preserves confusion prevention against attack-scoped Mold Breaker', () => {
		const [p, t] = setup('Seaking', 'No Ability', 'Mold Breaker');
		p.setItem('Ability Shield');
		const move = Dex.getActiveMove('confuseray');
		battle.runEvent('ModifyMove', t, p, move, move);
		assert(move.ignoreAbility);
		battle.setActiveMove(move, t, p);
		assert(!p.addVolatile('confusion', t, move));
		assert(!p.volatiles.confusion);
		battle.clearActiveMove();
	});
	it('Transform takes the target passive and cures existing confusion on update', () => {
		const [p, t] = setup();
		assert(t.addVolatile('confusion', p));
		assert(t.transformInto(p));
		assert.deepEqual(t.getPassives(), ['steadyswimmer']);
		battle.runEvent('Update', t);
		assert(!t.volatiles.confusion);
	});
	it('Illusion copies disguise passives and removes them on reveal without revealing actual species', () => {
		const [p, t] = setup('Zoroark', 'Illusion');
		assert(p.illusion);
		assert.deepEqual(p.getPassives(), ['steadyswimmer']);
		const at = battle.log.length;
		battle.actions.useMove('confuseray', t, { target: p });
		assert(!p.volatiles.confusion);
		assert(!battle.log.slice(at).some(line => line.includes('Zoroark')));
		battle.actions.useMove('tackle', t, { target: p });
		assert(!p.illusion);
		assert(!p.getPassives().includes('steadyswimmer'));
		assert(p.addVolatile('confusion', t));
	});
	it('copying and swapping only the selected ability never transfers the species passive', () => {
		const [p, t] = setup('Seaking', 'Pressure');
		battle.actions.useMove('skillswap', p, { target: t });
		assert.deepEqual(p.getPassives(), ['steadyswimmer']);
		assert.deepEqual(t.getPassives(), []);
		assert(t.addVolatile('confusion', p));
		assert(!p.addVolatile('confusion', t));
	});
	it('duplicate selected Steady Swimmer emits one prevention event', () => {
		const [p, t] = setup('Seaking', 'Steady Swimmer');
		const at = battle.log.length;
		battle.actions.useMove('confuseray', t, { target: p });
		assert(!p.volatiles.confusion);
		assert.equal(battle.log.slice(at).filter(line => line.includes('Steady Swimmer')).length, 1);
	});
	it('exports confusion-only calculator metadata and identical damage under every selected choice', () => {
		const { calculatorMetadata, calculateScenario } = require('../../../dist/sim/custom-calculator');
		const row = calculatorMetadata().species.find(s => s.name === 'Seaking');
		assert.deepEqual(row.passives, ['steadyswimmer']);
		assert.deepEqual(row.abilities, before.species.seaking.abilities);
		const input = { format: 'gen9nofieldsinglesgame', move: 'tackle', samples: 8, seed: 42, actors: [{ species: 'Seaking', ability: 'No Ability' }, ...Array.from({ length: 3 }, () => ({ species: 'Chansey', ability: 'No Ability' }))] };
		const damage = calculateScenario(input).results;
		input.actors[0].ability = 'Steady Swimmer';
		assert.deepEqual(calculateScenario(input).results, damage);
	});
});
