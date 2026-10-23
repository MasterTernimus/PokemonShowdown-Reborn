'use strict';
const assert = require('assert').strict;
const { Dex } = require('../../dist/sim/dex');
const { Teams } = require('../../dist/sim/teams');
const { commands } = require('../../dist/server/chat-plugins/form-shortcuts');
describe('Form shortcuts and discovery', () => {
	for (const [alias, name] of [['Ursaluna-BM', 'Ursaluna-Bloodmoon'], ['Tauros-Blaze', 'Tauros-Paldea-Blaze'], ['Tauros-Aqua', 'Tauros-Paldea-Aqua']]) {
		it('resolves ' + alias + ' through the species and imported-team lookup', () => {
			assert.equal(Dex.species.get(alias).name, name);
			const team = Teams.import(alias + '\nAbility: No Ability\n- Tackle');
			assert.equal(Dex.species.get(team[0].species).name, name);
		});
	}
	it('preserves base species and rejects prefix collisions', () => {
		assert.equal(Dex.species.get('Tauros').name, 'Tauros');
		assert.equal(Dex.species.get('Ursaluna').name, 'Ursaluna');
		assert.equal(Dex.species.get('Tauros-Blazex').exists, false);
	});
	it('lists Mega and Gigantamax separately and retains ordinary forms in species lists', () => {
		let html = ''; const context = { runBroadcast: () => true, sendReplyBox: value => (html = value), errorReply: value => { throw Error(value); } };
		commands.formlist.call(context, '');
		assert(html.includes('Mega Evolutions'));
		assert(html.includes('Gigantamax forms'));
		assert(html.includes('Charizard-Gmax'));
		assert(html.includes('Charizard-Mega-X'));
		commands.formlist.call(context, 'Tauros-Aqua');
		assert(html.includes('Tauros-Paldea-Aqua')); assert(html.includes('Tauros-Paldea-Blaze')); assert(html.includes('Base and other forms'));
	});
});
