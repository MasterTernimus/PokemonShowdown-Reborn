'use strict';
const assert = require('assert').strict; const { calculateScenario, calculatorMetadata } = require('../../../dist/sim/custom-calculator');
function run(move, actors, extra = {}) { return calculateScenario({ format: 'gen9nofieldsinglesgame', move, samples: 8, seed: 41, actors: [{ species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }].map((a, i) => ({ ...a, ...actors[i] })), ...extra }); }
describe('Interaction sandbox engine outcomes', () => {
	for (const ability of ['Toxic Sink', 'Virulence'])it(ability + ' reports Poison absorption and SpA boost in each executed sample', () => {
		const r = run('Sludge Bomb', [{}, { ability }]);
		for (const o of r.actionOutcomes) {
			assert.equal(o.after.actors[1].hp, o.before.actors[1].hp);
			assert.equal(o.after.actors[1].boosts.spa, o.before.actors[1].boosts.spa + 1);
			assert(o.log.some(l => l.includes('boost')));
		}
	});
	it('Bombardment keeps Overcoat powder protection', () => {
		const r = run('Spore', [{}, { species: 'Blastoise-Mega', ability: 'Bombardment' }]);
		for (const o of r.actionOutcomes)assert.equal(o.after.actors[1].status, '');
		assert(r.exampleLog.some(l => l.includes('immune')));
	});
	it('Hydra remaining native hits are reported on another living foe', () => { const r = run('Bullet Seed', [{ ability: 'Hydra Bond' }, { hpPercent: 1 }, {}, {}], { format: 'gen9nofielddoublesbattle' }); assert(r.actionOutcomes.some(o => o.after.actors[3].hp < o.before.actors[3].hp)); });
	it('Strong Winds changes actual special Flying damage', () => { const a = run('Air Slash', []), b = run('Air Slash', [], { weather: 'deltastream' }); assert(b.results[1].max > a.results[1].max); });
	it('Nature Power executes the field-selected move', () => { const r = run('Nature Power', [], { field: 'electricterrain' }); assert(r.exampleLog.some(l => l.includes('Thunderbolt'))); });
	it('Gastro Acid shows active suppression while the species passive remains', () => {
		const r = run('Gastro Acid', [{}, { species: 'Vileplume', ability: 'Storm Drain' }]);
		for (const o of r.actionOutcomes) {
			assert(o.after.actors[1].abilitySuppressed);
			assert(o.after.actors[1].passives.includes('effectspore'));
		}
	});
	it('public-state unsupported setup and arbitrary input are rejected', () => { assert.throws(() => run('Tackle', [{ ability: 'Virulence' }], { evaluationMode: 'public-state' }), /unsupported|reviewed/i); assert.throws(() => run('Tackle', [], { javascript: 'process.exit()' }), /Unsupported input/); });
	it('describes Toxic Sink as the approved Poison-only absorption', () => {
		const a = require('../../../dist/sim').Dex.abilities.get('Toxic Sink');
		assert(!a.shortDesc.includes('Effect Spore'));
		assert(!a.shortDesc.includes('Attack'));
		assert(a.shortDesc.includes('Sp. Atk'));
	});
	it('offers authoritative moves and privately opens from its command', () => {
		assert(calculatorMetadata().moves.some(m => m.id === 'scentedgeyser'));
		const { commands } = require('../../../dist/server/chat-plugins/rules-encyclopedia'), sent = [];
		commands.interactiontest.call({ runBroadcast() {
			throw Error('no broadcast');
		} }, '', null, null, { send: m => sent.push(m) });
		assert.equal(sent[0], '|queryresponse|interactiontest|{"open":true}');
	});
});
