'use strict';
const assert = require('assert').strict, common = require('../../common'), {Dex} = require('../../../dist/sim');
describe('Accumulation alternate eligible-turn stacks', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(species = 'Mew', ability = 'Accumulation') {
		const mon = {species: 'Mew', ability: 'No Ability', moves: ['splash']};
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species, ability, moves: ['splash', 'stockpile', 'spitup', 'swallow']}, {...mon}], [mon],
		]); battle.makeChoices('team 12', 'team 1');
		// The format starts gimmick sets in their base form; exercise the actual resolved Rift form.
		if (species === 'Hippowdon-Rift') battle.p1.active[0].formeChange(species, Dex.items.get('anomalycore'), true);
		for (const side of battle.sides) for (const p of side.active) p.hp = p.maxhp = p.baseMaxhp = 10000;
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	const layers = p => p.volatiles.stockpile?.layers || 0;
	const turn = () => battle.makeChoices('move splash', 'move splash');
	const holders = [['Arbok', 'Accumulation'], ['Muk', 'Accumulation'], ['Snorlax', 'Accumulation'], ['Qwilfish', 'Accumulation'], ['Pelipper', 'Accumulation'], ['Mawile', 'Accumulation'], ['Swalot', 'Adhesive Armor'], ['Cradily', 'Primeval Hunger'], ['Walrein', 'Accumulation'], ['Hippopotas', 'Accumulation'], ['Hippowdon', 'Accumulation'], ['Hippowdon-Rift', 'Rift Eater'], ['Lickilicky', 'Accumulation'], ['Greedent', 'Accumulation']];
	for (const [species, ability] of holders) it(species + ' stacks on turns 2, 4 and 6 through ' + ability, () => {
		const [p] = setup(species, ability);
		for (const expected of [0, 1, 1, 2, 2, 3]) { turn(); assert.equal(layers(p), expected, JSON.stringify({species:p.species.id,ability:p.ability,activeTurns:p.activeTurns,turn:battle.turn,cadence:p.m.accumulationCadence,last:p.lastMove?.id,log:battle.log.slice(-8)})); }
	});
	for (const [species, ability] of [['Mew', 'Accumulation'], ['Swalot', 'Accumulation'], ['Cradily', 'Primeval Hunger'], ['Hippowdon-Rift', 'Rift Eater']]) {
		it(ability + '/' + species + ' deduplicates repeated callbacks and ability restarts', () => {
			const [p] = setup(species, ability); turn(); assert.equal(layers(p), 0);
			battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
			p.setAbility('No Ability'); p.setAbility(ability);
			turn(); assert.equal(layers(p), 1);
			battle.turn--; battle.runEvent('Residual', p); battle.runEvent('Residual', p); battle.turn++;
			assert.equal(layers(p), 1);
		});
		it(ability + '/' + species + ' resets the wait on real re-entry', () => {
			const [p] = setup(species, ability); turn(); assert.equal(layers(p), 0);
			battle.makeChoices('switch 2', 'move splash');
			battle.makeChoices('switch 2', 'move splash');
			assert.equal(layers(p), 0); turn(); assert.equal(layers(p), 0); turn(); assert.equal(layers(p), 1);
		});
	}
	for (const passive of [false, true]) it('suppression only pauses selected cadence; passive=' + passive, () => {
		const [p] = setup(passive ? 'Swalot' : 'Mew'); turn(); p.addVolatile('gastroacid');
		turn(); assert.equal(layers(p), passive ? 1 : 0); p.removeVolatile('gastroacid');
		turn(); assert.equal(layers(p), 1);
	});
	it('selected Neutralizing Gas suppression pauses, without counting skipped turns', () => {
		const [p, q] = setup(); turn(); q.setAbility('Neutralizing Gas'); turn(); turn(); assert.equal(layers(p), 0);
		q.setAbility('No Ability'); turn(); assert.equal(layers(p), 1);
	});
	it('suppressed re-entry cannot reuse the old partial wait', () => {
		const [p, q] = setup(); turn(); q.setAbility('Neutralizing Gas');
		battle.makeChoices('switch 2', 'move splash'); battle.makeChoices('switch 2', 'move splash');
		q.setAbility('No Ability'); turn(); assert.equal(layers(p), 0); turn(); assert.equal(layers(p), 1);
	});
	it('manual Stockpile still grants a layer immediately', () => {
		const [p] = setup(); battle.makeChoices('move stockpile', 'move splash'); assert.equal(layers(p), 1);
		assert.equal(p.boosts.def, 1); assert.equal(p.boosts.spd, 1);
	});
	for (const id of ['swallow', 'spitup']) it(id + ' does not advance the automatic refill wait that turn', () => {
		const [p] = setup(); p.addVolatile('stockpile');
		battle.makeChoices('move ' + id, 'move splash'); assert.equal(layers(p), 0);
		turn(); assert.equal(layers(p), 0); turn(); assert.equal(layers(p), 1);
	});
	for (const release of ['belch', 'spitup']) it('preserves the full-stack wait and automatic ' + release + ' release', () => {
		const [p] = setup(); const original = battle.sample.bind(battle);
		battle.sample = choices => choices.includes('belch') ? release : original(choices);
		for (let i = 0; i < 6; i++) turn(); assert.equal(layers(p), 3);
		const before = battle.log.length; turn();
		assert(battle.log.slice(before).some(l => l.includes('|'+Dex.moves.get(release).name+'|')));
		assert.equal(layers(p), release === 'belch' ? 2 : 0);
	});
});
