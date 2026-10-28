'use strict';
const assert = require('assert').strict;
const { rulesCatalog, rulesDetail, teamClinic } = require('../../../dist/server/rules-encyclopedia');
const { Dex } = require('../../../dist/sim');
describe('Public custom rules and read-only team clinic', () => {
	it('covers current species, abilities and registered fields', () => {
		const c = rulesCatalog();
		assert(c.species.length > 1600);
		assert(c.abilities.length > 1000);
		assert.equal(c.fields.length, 48);
		assert(c.formats.some(f => f.id === 'gen9nofieldsinglesgame'));
	});
	it('shows Politoed regular slots, passive, forms and event distinctions', () => {
		const d = rulesDetail('species', 'Politoed');
		assert.deepEqual(d.abilities.filter(a => a.slot !== 'S').map(a => a.name), ['Zen', 'Royal Decree', 'Storm Song']);
		assert.equal(d.passives[0].name, "Oracle's Refrain");
		assert(d.forms.includes('Politoed-Rejuv'));
		assert(d.event.moves.find(m => m.id === 'dragoncheer').exclusive);
		assert(!d.event.moves.find(m => m.id === 'round').exclusive);
	});
	it('keeps both Curious Medicine identities and effects distinct', () => {
		const d = rulesDetail('species', 'Slowking-Galar');
		assert.equal(d.passives[0].id, 'eldritchremedy');
		assert.equal(d.passives[0].name, 'Curious Medicine');
		assert.notEqual(rulesDetail('ability', 'eldritchremedy').description, rulesDetail('ability', 'curiousmedicine').description);
		assert.equal(Dex.abilities.get('Eldritch Remedy').id, 'eldritchremedy');
		assert.equal(Dex.abilities.get('Curious Medicine').id, 'curiousmedicine');
	});
	it('rejects an exclusive move without the event ability and never edits input', () => {
		const input = { team: 'Politoed\nAbility: Zen\n- Dragon Cheer', format: 'gen9nofieldsinglesgame', field: 'hauntedterrain' };
		const before = JSON.stringify(input), r = teamClinic(input);
		assert(r.checked);
		assert(r.errors.some(e => e.includes('Aevian King')));
		assert(r.proposals.some(e => e.includes('Dragon Cheer')));
		assert.equal(JSON.stringify(input), before);
	});
	it('accepts the approved event move and gives no unnecessary correction', () => {
		const r = teamClinic({ team: 'Politoed\nAbility: Aevian King\n- Dragon Cheer', format: 'gen9nofieldsinglesgame' });
		assert(r.checked);
		assert.deepEqual(r.errors, []);
		assert.deepEqual(r.proposals, []);
	});
	it('uses authoritative Nature Power field and Frozen Aura precedence', () => {
		const base = { team: 'Mew\nAbility: Synchronize\n- Nature Power', format: 'gen9nofieldsinglesgame', field: 'hauntedterrain' };
		assert.equal(teamClinic(base).sets[0].naturePower, 'Phantom Force');
		const { Auras } = require('../../../dist/data/auras');
		const a = Object.values(Auras).find(a => a.id.includes('frozen'));
		assert(a);
		assert.equal(teamClinic({ ...base, aura: a.id }).sets[0].naturePower, Dex.moves.get(a.naturePowerMove).name);
	});
	it('retains real format-specific invalid move errors', () => { const r = teamClinic({ team: 'Ribombee\nAbility: Aroma Veil\n- Fake Out', format: 'gen9nofieldsinglesgame@@@Obtainable Moves' }); assert(r.errors.length); });
	it('rejects malformed, empty, unknown field and unknown format inputs', () => { for (const input of [{ team: '', format: 'gen9nofieldsinglesgame' }, { team: 'Mew\n- Psychic', format: 'fakeformat' }, { team: 'Mew\n- Psychic', format: 'gen9nofieldsinglesgame', field: 'notafield' }])assert.throws(() => teamClinic(input)); assert.throws(() => rulesDetail('species', 'notapokemon')); });
});

describe('Clinic integration boundaries', () => {
	it('preserves every imported set parameter for explicit calculator copying', () => {
		const text = 'Ursaluna-BM @ Leftovers\nAbility: Mind\'s Eye\nLevel: 74\nEVs: 100 HP / 156 SpA / 252 Spe\nIVs: 0 Atk / 22 Spe\nModest Nature\n- Blood Moon\n- Moonlight';
		const r = teamClinic({ team: text, format: 'gen9nofieldsinglesgame' });
		const a = r.sets[0].calculatorSet;
		assert.equal(a.species, 'Ursaluna-Bloodmoon');
		assert.equal(a.level, 74);
		assert.equal(a.ivs.atk, 0);
		assert.equal(a.ivs.spe, 22);
		assert.equal(a.evs.spa, 156);
		assert.equal(a.item, 'Leftovers');
		assert.equal(a.nature, 'Modest');
		assert.equal(a.moves.length, 2);
	});
	it('labels role-check limits and never calls a team optimal', () => {
		const r = teamClinic({ team: 'Mew\nAbility: Synchronize\n- Recover\n- U-turn\n- Psychic', format: 'gen9nofieldsinglesgame' });
		assert(r.checks.every(c => c.scope));
		assert(r.checks.find(c => c.role === 'Direct recovery').evidence.includes('Recover'));
		assert(r.checks.find(c => c.role === 'Pivoting').evidence.includes('U-turn'));
	});
	it('uses reviewed transition conditions verbatim, without assuming counters', () => {
		const r = teamClinic({ team: 'Mew\n- Surf', format: 'gen9nofieldsinglesgame', field: 'caveterrain' });
		const guide = require('../../../dist/server/field-guide').publicFieldGuide();
		assert.deepEqual(r.forecast.rules, guide.entries.find(e => e.id === 'caveterrain').sections.Transitions || []);
		assert(r.forecast.notice.includes('unknown'));
		assert.equal(teamClinic({ team: 'Mew\n- Surf', format: 'gen9nofieldsinglesgame' }).forecast.supported, false);
	});
	for (const [species, ability, move] of [['Politoed', 'Aevian King', 'Dragon Cheer'], ['Poliwrath', 'Aevian Ascendance', 'Scented Geyser'], ['Galvantula', 'Aevian Web', 'Splintered Web']])it('keeps ' + species + ' event state explicit in handoff', () => {
		const r = teamClinic({ team: species + '\nAbility: ' + ability + '\n- ' + move, format: 'gen9nofieldsinglesgame' });
		assert.equal(r.sets[0].calculatorSet.ability, ability);
		assert.deepEqual(r.errors, []);
	});
});

describe('Command-only custom rules access', () => {
	it('opens privately without touching the room or broadcasting', () => {
		const { commands } = require('../../../dist/server/chat-plugins/rules-encyclopedia');
		const sent = [];
		const context = { runBroadcast() {
			throw Error('must not broadcast');
		}, sendReply() {
			throw Error('must use private connection');
		} };
		commands.customrules.call(context, '', new Proxy({}, { get() {
			throw Error('must not write room');
		} }), {}, { send: m => sent.push(m) });
		assert.deepEqual(sent, ['|queryresponse|customrules|{"open":true}']);
		assert(commands.customruleshelp[0].includes('/customrules'));
	});
});
