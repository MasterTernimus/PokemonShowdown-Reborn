'use strict';
const assert = require('assert').strict;
const common = require('../common');
const {Dex, Teams, TeamValidator} = require('../../dist/sim');

describe('Mega Hydreigon availability', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	const set = (species = 'Hydreigon', item = '') => ({species, item, ability: Dex.species.get(species).abilities[0], moves: ['darkpulse']});
	it('retains internal data and base Hydreigon availability', () => {
		assert.equal(Dex.species.get('Hydreigon-Mega-X').exists, false);
		assert.deepEqual(Dex.items.get('Hydreigonite').megaStone, {Hydreigon: 'Hydreigon-Mega'});
		assert.equal(Dex.species.get('Hydreigon').exists, true);
		assert.deepEqual(Dex.species.get('Hydreigon').otherFormes, ['Hydreigon-Mega']);
		assert.equal(Dex.species.get('Hydreigon-Mega').bst, 700);
		assert.deepEqual(new TeamValidator('gen9nofieldsinglesgame').validateSet(set(), {}) || [], []);
	});
	it('accepts pasted Mega and stone sets', () => {
		const validator = new TeamValidator('gen9nofieldsinglesgame');
		for (const species of ['Hydreigon', 'Hydreigon-Mega']) {
			const team = Teams.unpack(Teams.pack([set(species, 'Hydreigonite')]));
			assert.equal(validator.validateTeam(team), null);
		}
	});
	it('lists public catalogs and family links while retaining the base choice', () => {
		const calculator = require('../../dist/sim/custom-calculator').calculatorMetadata();
		const rules = require('../../dist/server/rules-encyclopedia');
		for (const list of [calculator.species, rules.rulesCatalog().species]) {
			assert(list.some(s => s.name === 'Hydreigon'));
			assert(list.some(s => s.name === 'Hydreigon-Mega'));
		}
		assert(rules.rulesDetail('species', 'Hydreigon').forms.includes('Hydreigon-Mega'));
		assert(rules.rulesDetail('species', 'Hydreigon-Mega'));
		for (const query of ['Hydreigon-Mega', 'hydreigonmega', 'Hydreigon Meg']) {
			assert((Dex.dataSearch(query, ['Pokedex']) || []).some(s => s.name === 'Hydreigon-Mega'));
		}
		const {commands} = require('../../dist/server/chat-plugins/form-shortcuts');
		let html = '';
		const context = {runBroadcast: () => true, sendReplyBox: value => { html = value; }, errorReply: value => {throw Error(value);}};
		for (const query of ['', 'Hydreigon']) {
			commands.formlist.call(context, query);
			assert(html.includes('Hydreigon-Mega'));
		}
		commands.formlist.call(context, 'Hydreigon-Mega');
		const {validateScenario} = require('../../dist/sim/custom-calculator');
		assert.doesNotThrow(() => validateScenario({format:'gen9nofieldsinglesgame', move:'Dark Pulse',
			actors: [{species:'Hydreigon-Mega'}, {species:'Mew'}, {species:'Mew'}, {species:'Mew'}]}));
	});
});
