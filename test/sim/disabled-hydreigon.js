'use strict';
const assert = require('assert').strict;
const common = require('../common');
const {Dex, Teams, TeamValidator} = require('../../dist/sim');

describe('Unavailable Mega Hydreigon, retained historical data', () => {
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
	it('rejects pasted and packed teams and every stone mapping', () => {
		const validator = new TeamValidator('gen9nofieldsinglesgame');
		for (const input of ['Hydreigon-Mega', 'hydreigonmega']) {
			const team = Teams.unpack(Teams.pack(Teams.import(`${input}\nAbility: Expiration\n- Dark Pulse`)));
			assert(validator.validateTeam(team).some(error => /disabled/.test(error)));
		}
		for (const item of Dex.items.all()) {
			for (const [species, target] of Object.entries(item.megaStone || {})) {
				if (Dex.toID(target) !== 'hydreigonmega') continue;
				assert(validator.validateSet(set(species, item.name), {}).some(error => /disabled/.test(error)));
			}
		}
	});
	it('blocks unchecked creation, fallback evolution, forced forms and all Mega routes', () => {
		assert.throws(() => common.createBattle({}, [[set('Hydreigon-Mega')], [set('Mew')]]), /disabled/);
		battle = common.createBattle({}, [[set('Hydreigon', 'Hydreigonite')], [set('Mew')]]);
		const p = battle.p1.active[0];
		assert.equal(battle.actions.canMegaEvo(p), null);
		assert.equal(battle.actions.canMegaEvoX(p), null);
		assert.equal(battle.actions.canMegaEvoY(p), null);
		assert(!p.getMoveRequestData().canMegaEvo);
		assert(!p.formeChange('Hydreigon-Mega'));
		for (const suffix of ['', 'X', 'Y']) {
			p['canMegaEvo' + suffix] = 'Hydreigon-Mega';
			assert.equal(battle.actions['runMegaEvo' + suffix](p), false);
		}
		assert.equal(p.species.name, 'Hydreigon');
		assert.equal(p.side.gimmickCount, 0);
	});
	it('hides public catalogs and family links while retaining the base choice', () => {
		const calculator = require('../../dist/sim/custom-calculator').calculatorMetadata();
		const rules = require('../../dist/server/rules-encyclopedia');
		for (const list of [calculator.species, rules.rulesCatalog().species]) {
			assert(list.some(s => s.name === 'Hydreigon'));
			assert(!list.some(s => s.name === 'Hydreigon-Mega'));
		}
		assert(!rules.rulesDetail('species', 'Hydreigon').forms.includes('Hydreigon-Mega'));
		assert.throws(() => rules.rulesDetail('species', 'Hydreigon-Mega'), /Unknown/);
		for (const query of ['Hydreigon-Mega', 'hydreigonmega', 'Hydreigon Meg']) {
			assert(!(Dex.dataSearch(query, ['Pokedex']) || []).some(s => s.name === 'Hydreigon-Mega'));
		}
		const {commands} = require('../../dist/server/chat-plugins/form-shortcuts');
		let html = '';
		const context = {runBroadcast: () => true, sendReplyBox: value => { html = value; }, errorReply: value => {throw Error(value);}};
		for (const query of ['', 'Hydreigon']) {
			commands.formlist.call(context, query);
			assert(!html.includes('Hydreigon-Mega'));
		}
		assert.throws(() => commands.formlist.call(context, 'Hydreigon-Mega'), /not found/);
		const {validateScenario} = require('../../dist/sim/custom-calculator');
		assert.throws(() => validateScenario({format:'gen9nofieldsinglesgame', move:'Dark Pulse',
			actors: [{species:'Hydreigon-Mega'}, {species:'Mew'}, {species:'Mew'}, {species:'Mew'}]}), /Unknown species/);
	});
});
