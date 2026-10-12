/* eslint-disable @stylistic/max-statements-per-line */
'use strict';
const assert = require('assert').strict, common = require('../../common');
const { Dex } = require('../../../dist/sim');
const { passiveEffect, passiveState } = require('../../../dist/sim/species-passives');
const grants = { slowkinggalar: 'eldritchremedy', mrmime: 'mimecraft', raichu: 'chargedtail', fearow: 'lancepoint', kingler: 'titanpincer', cloyster: 'pearlcurrent', garganacl: 'saltbastion' };
let battle;
function setup(species, ability = 'No Ability', doubles = false) {
	const set = (species = 'Mew', ability = 'No Ability') => ({ species, ability, moves: ['splash', 'reflect', 'tackle', 'eeriespell'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [[set(species, ability), set(), set()], [set(), set(), set()]]);
	battle.makeChoices('team 123', 'team 123'); battle.field.terrain = ''; battle.field.weather = '';
	for (const side of battle.sides) for (const p of side.pokemon) p.hp = p.maxhp = p.baseMaxhp = 4000;
	return [battle.p1.active[0], battle.p2.active[0]];
}
function hit(p, q, id = 'tackle', props = {}) {
	const move = Object.assign(Dex.getActiveMove(id), { accuracy: true, willCrit: false }, props);
	battle.actions.useMove(move, p, { target: q }); battle.runEvent('AfterMove', p, q, move); return move;
}
function enter(p, id) { battle.singleEvent('SwitchIn', passiveEffect(battle, id), passiveState(p, id), p); }
describe('Approved native signature passive migrations', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const [species, passive] of Object.entries(grants)) it(species + ' carries its signature through replacement, suppression and Transform', () => {
		const [p, q] = setup(species); assert.deepEqual(p.getPassives(), [passive]);
		p.setAbility('Run Away'); p.addVolatile('gastroacid'); q.setAbility('Neutralizing Gas'); assert.deepEqual(p.getPassives(), [passive]);
		q.transformInto(p); assert.deepEqual(q.getPassives(), [passive]);
		q.formeChange('Mew', null, true); assert.deepEqual(q.getPassives(), Dex.species.get('Mew').passives);
	});
	for (const ability of ['Telepathy', 'Eldritch Remedy', 'Own Tempo', 'Curious Medicine']) it('Eldritch Remedy cleanses negative stages once with selected ' + ability, () => {
		const [p] = setup('Slowking-Galar', ability, true), ally = battle.p1.active[1];
		p.hp = ally.hp = 1000; p.boosts.spa = -2; p.boosts.spd = 2; ally.boosts.atk = -2; ally.boosts.spe = 2;
		enter(p, 'eldritchremedy'); assert.equal(p.hp, 1500); assert.equal(ally.hp, 1500);
		assert.equal(p.boosts.spa, 0); assert.equal(p.boosts.spd, 2); assert.equal(ally.boosts.atk, 0); assert.equal(ally.boosts.spe, 2);
		ally.boosts.atk = -1; battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(ally.hp, 1500); assert.equal(ally.boosts.atk, -1);
		assert(p.hasAbilityOrPassive('owntempo')); assert(p.hasAbilityOrPassive('curiousmedicine'));
	});
	it('Eldritch Remedy executes on genuine switch-in and new-form acquisition, even with Gastro Acid', () => {
		const [p, q] = setup('Slowking-Galar', 'Telepathy', true); const ally = battle.p1.active[1];
		battle.makeChoices('switch 3, move 1', 'move 1, move 1'); ally.hp = 1000; ally.boosts.atk = -1;
		battle.makeChoices('switch 3, move 1', 'move 1, move 1'); assert.equal(ally.hp, 1500); assert.equal(ally.boosts.atk, 0);
		q.boosts.spa = -1; q.hp = 100; q.addVolatile('gastroacid'); q.formeChange('Slowking-Galar', null, true);
		assert.equal(q.boosts.spa, 0); assert.equal(q.hp, 1 + Math.floor(q.baseMaxhp / 8));
		p.addVolatile('gastroacid'); assert.equal(p.addVolatile('confusion', q), null);
	});
	it('Eerie Spell cures self first, then lowest-HP active ally once per turn, and never the bench', () => {
		const [p, q] = setup('Slowking-Galar', 'Telepathy', true), ally = battle.p1.active[1], bench = battle.p1.pokemon[2];
		p.setStatus('brn', q); ally.setStatus('par', q); bench.setStatus('psn', q); p.addVolatile('gastroacid');
		hit(p, q, 'eeriespell', { damage: 100 }); assert.equal(p.status, ''); assert.equal(ally.status, 'par');
		hit(p, q, 'eeriespell', { damage: 100 }); assert.equal(ally.status, 'par'); battle.turn++;
		hit(p, q, 'eeriespell', { damage: 100 }); assert.equal(ally.status, ''); assert.equal(bench.status, 'psn');
	});
	for (const kind of ['miss', 'protect', 'substitute']) it('Eerie Spell does not cure on ' + kind, () => {
		const [p, q] = setup('Slowking-Galar'); p.setStatus('brn', q);
		if (kind === 'protect') q.addVolatile('protect');
		if (kind === 'substitute') { q.addVolatile('substitute'); q.volatiles.substitute.hp = 2000; }
		hit(p, q, 'eeriespell', { accuracy: kind === 'miss' ? 0 : true, flags: { protect: 1 } }); assert.equal(p.status, 'brn');
	});
	it('selected Telepathy keeps its Psychic field speed and ally immunity, but remains suppressible', () => {
		const [p] = setup('Slowking-Galar', 'Telepathy', true), ally = battle.p1.active[1];
		battle.field.terrain = 'psychicterrain'; assert.equal(battle.runEvent('ModifySpe', p, null, null, 100), 200);
		const hp = p.hp; hit(ally, p); assert.equal(p.hp, hp);
		p.addVolatile('gastroacid'); assert.equal(battle.runEvent('ModifySpe', p, null, null, 100), 100); hit(ally, p); assert(p.hp < hp);
	});
	for (const ability of ['Soundproof', 'Mimecraft']) it('passive Mimecraft grants one priority stage and one entry heal with ' + ability, () => {
		const [p] = setup('Mr. Mime', ability, true), ally = battle.p1.active[1]; ally.hp = 1000;
		assert.equal(battle.runEvent('ModifyPriority', p, p, Dex.getActiveMove('reflect'), 0), 1); p.addVolatile('gastroacid');
		battle.makeChoices('move 2, move 1', 'move 1, move 1'); assert.equal(ally.hp, 1500);
		p.side.removeSideCondition('reflect'); p.removeVolatile('gastroacid'); p.setAbility('No Ability'); p.setAbility('Mimecraft');
		battle.makeChoices('move 2, move 1', 'move 1, move 1'); assert.equal(ally.hp, 1500);
		battle.makeChoices('switch 3, move 1', 'move 1, move 1'); p.side.removeSideCondition('reflect');
		battle.makeChoices('switch 3, move 1', 'move 1, move 1'); battle.makeChoices('move 2, move 1', 'move 1, move 1'); assert.equal(ally.hp, 2000);
	});
	for (const ability of ['Static', 'Charged Tail']) it('passive Charged Tail grants normal Charge only after a successful Nuzzle with ' + ability, () => {
		const [p, q] = setup('Raichu', ability); p.addVolatile('gastroacid');
		hit(p, q, 'nuzzle', { damage: 100 }); assert.equal(q.status, 'par'); assert(p.volatiles.charge);
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('thunderbolt'), 100), 200);
		hit(p, q, 'thunderbolt'); assert(!p.volatiles.charge); hit(p, q, 'nuzzle'); assert(!p.volatiles.charge);
	});
	for (const ability of ['No Ability', 'Lance Point', 'Keen Eye']) it('Lance Point modifies drill flags once and never restores removed Keen Eye under ' + ability, () => {
		const [p, q] = setup('Fearow', ability), move = Dex.getActiveMove('drillpeck');
		battle.runEvent('ModifyMove', p, q, move, move); assert.equal(move.critRatio, 3); assert(!move.flags.contact);
		assert.equal(!!move.ignoreEvasion, ability === 'Keen Eye');
	});
	for (const ability of ['No Ability', 'Titan Pincer', 'Hyper Cutter']) it('Titan Pincer changes only the supported offensive stat with ' + ability, () => {
		const [p, q] = setup('Kingler', ability); p.storedStats.def = 300; p.storedStats.atk = 100;
		for (const id of ['crabhammer', 'ironhead', 'flashcannon', 'tackle']) {
			const move = Dex.getActiveMove(id); battle.runEvent('ModifyMove', p, q, move, move);
			assert.equal(move.overrideOffensiveStat, ['crabhammer', 'ironhead'].includes(id) ? 'def' : undefined);
		}
		battle.boost({ atk: -1 }, p, q, Dex.moves.get('growl')); assert.equal(p.boosts.atk, ability === 'Hyper Cutter' ? 0 : -1);
	});
	for (const ability of ['Shell Armor', 'Pearl Current', 'Water Absorb']) it('Pearl Current absorbs once, retains its ally budget and underwater recovery with ' + ability, () => {
		const [p, q] = setup('Cloyster', ability, true), ally = battle.p1.active[1]; p.hp = ally.hp = 1000; p.addVolatile('gastroacid');
		hit(q, p, 'watergun'); assert.equal(p.hp, 2000); assert.equal(ally.hp, 1500);
		p.removeVolatile('gastroacid'); p.setAbility('No Ability'); p.setAbility(ability); p.hp = 1000;
		hit(q, p, 'watergun'); assert.equal(p.hp, 2000); assert.equal(ally.hp, 1500);
		battle.field.terrain = 'underwaterterrain'; battle.runEvent('Residual', p); assert.equal(p.hp, 2250);
		assert(p.hasAbilityOrPassive('waterabsorb'));
	});
	for (const ability of ['Inner Focus', 'Salt Bastion', 'Sturdy']) it('Salt Bastion supplies one actual Sturdy save and Safeguard with ' + ability, () => {
		const [p, q] = setup('Garganacl', ability); p.addVolatile('gastroacid'); hit(q, p, 'tackle', { damage: 5000 });
		assert.equal(p.hp, 1); assert.equal(p.side.sideConditions.safeguard.duration, 5);
		assert.equal(battle.log.filter(line => line.includes('|-activate|') && line.includes('passive: Salt Bastion')).length, 1);
		assert(p.hasAbilityOrPassive('sturdy'));
	});
	it('Salt Bastion does not reward ordinary damage or blocked OHKO, and Mold Breaker bypasses it', () => {
		const [p, q] = setup('Garganacl', 'Inner Focus'); hit(q, p, 'tackle', { damage: 100 }); assert(!p.side.sideConditions.safeguard);
		p.hp = p.maxhp; hit(q, p, 'fissure'); assert.equal(p.hp, 4000); assert(!p.side.sideConditions.safeguard);
		q.setAbility('Mold Breaker'); hit(q, p, 'tackle', { damage: 5000 }); assert.equal(p.hp, 0); assert(!p.side.sideConditions.safeguard);
	});
	it('a nonrecipient still uses a copied signature normally', () => {
		const [p, q] = setup('Mew', 'Lance Point'); const move = Dex.getActiveMove('drillpeck');
		battle.runEvent('ModifyMove', p, q, move, move); assert.equal(move.critRatio, 3); assert(!move.flags.contact); assert.deepEqual(p.getPassives(), Dex.species.get('Mew').passives);
	});
	it('calculator damage agrees with the same signature supplied once, including copied overlap', () => {
		const { calculateScenario } = require('../../../dist/sim/custom-calculator');
		for (const [species, ability, move] of [['Fearow', 'Lance Point', 'Drill Peck'], ['Kingler', 'Titan Pincer', 'Crabhammer']]) {
			const input = { format: 'gen9nofieldsinglesgame', move, samples: 16, seed: 42,
				actors: Array.from({ length: 4 }, () => ({ species: 'Mew', ability: 'No Ability' })) };
			input.actors[0] = { species, ability: 'No Ability' };
			const single = calculateScenario(input);
			input.actors[0].ability = ability;
			assert.deepEqual(calculateScenario(input).results, single.results, species);
		}
	});
});
