'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const forms = [
	['Alakazam', 'Aevian Discipline'], ['Politoed', 'Aevian King'], ['Poliwrath', 'Aevian Ascendance'],
	['Galvantula', 'Aevian Web'], ['Unfezant', 'Aevian Wing'], ['Musharna', 'Aevian Dream'],
	['Donphan', 'Aevian Frost'], ['Drapion', 'Aevian Toxin'], ['Breloom', 'Aevian Spark'],
	['Sigilyph', 'Aevian Grief'], ['Veluza', 'Aevian Rocket'], ['Turtonator', 'Aevian Glacier'],
	['Druddigon', 'Aevian Bolt'], ['Parasect', 'Parasitism'], ['Bronzong', 'Reflector'],
];
let battle;
describe('Rejuv base-form preview and entry', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const [base, ability] of forms)it(base + ' starts normal even when its Rejuv form is pasted', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species: base + '-Rejuv', ability, moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		const p = battle.p1.pokemon[0];
		assert.equal(p.species.name, base); assert.deepEqual(p.getTypes(), Dex.species.get(base).types);
		assert.equal(p.getUpdatedDetails().split(',')[0], base);
		assert(!battle.log.some(line => line.startsWith('|poke|') && line.includes('-Rejuv')));
		battle.makeChoices('team 1', 'team 1'); assert.equal(p.species.name, base + '-Rejuv');
	});
	it('losing the transformation ability restores ordinary typing immediately', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species: 'Musharna-Rejuv', ability: 'Aevian Dream', moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('team 1', 'team 1'); const p = battle.p1.active[0]; p.setAbility('Insomnia');
		assert.equal(p.species.name, 'Musharna'); assert.deepEqual(p.getTypes(), Dex.species.get('Musharna').types); assert.equal(p.ability, 'insomnia');
	});
});
