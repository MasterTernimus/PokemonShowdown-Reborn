'use strict';
const assert = require('assert').strict, common = require('../../common'), { Dex, TeamValidator } = require('../../../dist/sim');
describe('Alcremie Sticky Hold selection', () => {
	let b; afterEach(() => b?.destroy());
	const forms = ['Alcremie', ...Dex.species.get('Alcremie').cosmeticFormes];
	for (const name of forms)it(name + ' keeps its base kit and Sweet Veil', () => {
		const s = Dex.species.get(name);
		assert.deepEqual(s.abilities, { 0: 'Soothing Cream', 1: 'Sticky Hold', H: 'Master Pâtissier' });
		assert.deepEqual(s.passives, ['sweetveil']);
		const errors = new TeamValidator('gen9nofieldsinglesgame').validateSet({ species: name, ability: 'Sticky Hold', moves: ['decorate'], nature: 'Serious', evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 } }) || [];
		assert(!errors.some(e => /ability/i.test(e)), errors.join('\n'));
	});
	it('leaves the separate G-Max kit unchanged', () => {
		const s = Dex.species.get('Alcremie-Gmax');
		assert.deepEqual(s.abilities, { 0: 'Sweet Sanctuary' });
		assert.deepEqual(s.passives, ['friendguard']);
	});
	function setup() {
		b = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species: 'Alcremie', ability: 'Sticky Hold', item: 'Leftovers', moves: ['decorate'] }], [{ species: 'Mew', ability: 'No Ability', item: 'Oran Berry', moves: ['trick', 'knockoff'] }]]);
		b.makeChoices('team 1', 'team 1');
		return [b.p1.active[0], b.p2.active[0]];
	}
	it('protects the held item against Trick and Knock Off', () => {
		const [p, q] = setup();
		for (const move of ['trick', 'knockoff']) {
			b.actions.runMove(move, q, q.getLocOf(p));
			assert.equal(p.item, 'leftovers');
		}assert.deepEqual(p.getPassives(), ['sweetveil']);
	});
	it('suppression disables item protection but keeps passive sleep protection', () => {
		const [p, q] = setup();
		p.addVolatile('gastroacid');
		assert(!p.trySetStatus('slp', q));
		assert(!p.addVolatile('yawn', q));
		b.actions.runMove('trick', q, q.getLocOf(p));
		assert.equal(p.item, 'oranberry');
		assert.equal(p.ability, 'stickyhold');
	});
});
