'use strict';
const assert = require('assert').strict, common = require('../../common');
const { calculateScenario } = require('../../../dist/sim/custom-calculator');
describe('Adaptive move category timing', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(doubles = false) {
		battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [
			Array.from({ length: doubles ? 2 : 1 }, () => ({ species: 'Mew', ability: 'No Ability', moves: ['needlegun', 'dragondarts', 'splash'] })),
			Array.from({ length: doubles ? 2 : 1 }, () => ({ species: 'Blissey', ability: 'No Ability', moves: ['splash'] })),
		]); battle.makeChoices(doubles ? 'team 12' : 'team 1', doubles ? 'team 12' : 'team 1');
		battle.randomChance = () => false; battle.randomizer = x => x;
		const a = battle.p1.active[0], d = battle.p2.active[0]; a.storedStats.atk = a.storedStats.spa = 100;
		d.storedStats.def = d.storedStats.spd = 200; return [a, d];
	}
	function hit(a, d, id, options = {}) {
		const m = battle.dex.getActiveMove(id); Object.assign(m, { willCrit: false, accuracy: true, secondaries: undefined }, options);
		if (!a.moveSlots.some(x => x.id === id)) a.moveSlots.push({ move: m.name, id, pp: 10, maxpp: 10, target: m.target, disabled: false, used: false });
		const before = d.hp; battle.actions.runMove(m, a, a.getLocOf(d)); return before - d.hp;
	}
	for (const id of ['needlegun', 'dragondarts', 'barrage', 'radiantassault', 'roaroftime', 'spacialrend', 'shadowforce', 'veeveevolley', 'explosion', 'selfdestruct']) {
		for (const stat of ['atk', 'spa']) it(id + ' resolves ' + stat + ' before field/ability hooks', () => {
			const [a, d] = setup(); a.boosts[stat] = 1; let observed;
			battle.onEvent('ModifyMove', battle.format, move => { observed = move.category; });
			hit(a, d, id); assert.equal(observed, stat === 'atk' ? 'Physical' : 'Special');
		});
	}
	for (const id of ['needlegun', 'dragondarts', 'explosion', 'selfdestruct', 'radiantassault', 'veeveevolley']) it(id + ' keeps its tie rule', () => {
		const [a, d] = setup();
		let observed;
		battle.onEvent('ModifyMove', battle.format, m => {
			observed = m.category;
		});
		hit(a, d, id);
		assert.equal(observed, ['radiantassault', 'veeveevolley'].includes(id) ? 'Special' : 'Physical');
	});
	for (const stat of ['atk', 'spa']) it('Needle Gun Underwater and screens match ' + stat, () => {
		const [a, d] = setup(); a.boosts[stat] = 1;
		const normal = hit(a, d, 'needlegun'); d.hp = d.maxhp;
		battle.field.changeTerrain('underwaterterrain', a); const underwater = hit(a, d, 'needlegun');
		if (stat === 'spa') assert.equal(underwater, normal); else assert(Math.abs(underwater - normal / 2) <= 6);
		d.hp = d.maxhp; const irrelevant = stat === 'spa' ? 'reflect' : 'lightscreen'; d.side.addSideCondition(irrelevant, d);
		assert.equal(hit(a, d, 'needlegun'), underwater); d.hp = d.maxhp; d.side.removeSideCondition(irrelevant);
		d.side.addSideCondition(stat === 'spa' ? 'lightscreen' : 'reflect', d); assert(hit(a, d, 'needlegun') < underwater);
	});
	it('Needle Gun still hits six times and independently selects the lower defense', () => {
		const [a, d] = setup();
		a.boosts.spa = 1;
		d.storedStats.def = 100;
		d.storedStats.spd = 400;
		const physicalDefense = hit(a, d, 'needlegun'); assert(battle.log.some(x => x.includes('|-hitcount|') && x.endsWith('|6')));
		d.hp = d.maxhp;
		d.storedStats.def = 400;
		d.storedStats.spd = 100;
		assert.equal(hit(a, d, 'needlegun'), physicalDefense);
	});
	it('Dragon Darts preserves split doubles hits, Special defense and Underwater Water boosts', () => {
		const [a, d] = setup(true); a.boosts.spa = 1; battle.field.changeTerrain('underwaterterrain', a);
		const other = battle.p2.active[1]; other.storedStats.def = 200; other.storedStats.spd = 200;
		let resolved; battle.onEvent('BasePower', battle.format, (bp, source, target, move) => { resolved = move; });
		const before = other.hp;
		hit(a, d, 'dragondarts');
		assert(other.hp < before);
		assert(d.hp < d.maxhp);
		assert.equal(resolved.category, 'Special'); assert.equal(resolved.type, 'Water');
	});
	it('does not reinterpret deliberate split-stat moves or item multipliers in the comparison', () => {
		const [a, d] = setup(); a.setItem('choiceband'); a.storedStats.spa = 110;
		let resolved; battle.onEvent('ModifyMove', battle.format, move => { resolved = move; });
		hit(a, d, 'needlegun'); assert.equal(resolved.category, 'Special');
		for (const id of ['psyshock', 'bodypress', 'flowertrick', 'hexingslash']) {
			const m = battle.dex.getActiveMove(id); battle.singleEvent('ModifyMove', m, null, a, d, m, m);
			assert.equal(m.category, id === 'psyshock' ? 'Special' : 'Physical');
		}
	});
	it('calculator runs the same categories, Underwater penalty and screen branch', () => {
		const scenario = { format: 'gen9nofieldsinglesgame', move: 'Needle Gun', seed: 42, samples: 8,
			actors: [{ species: 'Mew', ability: 'No Ability', boosts: { spa: 1 } }, { species: 'Blissey', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }] };
		const normal = calculateScenario(scenario).results[1].max; scenario.field = 'underwaterterrain';
		assert.equal(calculateScenario(scenario).results[1].max, normal); scenario.screens = ['reflect'];
		assert.equal(calculateScenario(scenario).results[1].max, normal); scenario.screens = ['lightscreen'];
		assert(calculateScenario(scenario).results[1].max < normal);
		scenario.screens = []; scenario.actors[0].boosts = { atk: 1 }; assert(calculateScenario(scenario).results[1].max < normal);
	});
});
