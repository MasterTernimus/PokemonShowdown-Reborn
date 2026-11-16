'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex, TeamValidator} = require('../../../dist/sim');

describe('Wish, bone moves and Poison Tail updates', () => {
	let battle;
	function setup() {
		const mon = {species: 'Mew', ability: 'No Ability', moves: ['nostraswish', 'poisontail', 'bonerush', 'bonemerang']};
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[mon, mon], [mon, mon]]);
		battle.makeChoices('team 12', 'team 12');
		for (const p of battle.getAllActive()) p.hp = p.maxhp = 10000;
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const id of ['bonerush', 'bonemerang']) it(id + ' removes its old secondary while retaining multihit behavior', () => {
		const [p, q] = setup();
		const move = Dex.getActiveMove(id);
		assert.equal(move.basePower, id === 'bonerush' ? 25 : 50);
		assert(!move.secondaries?.length);
		battle.randomChance = () => true;
		battle.actions.useMove(Object.assign(move, {accuracy: true, willCrit: false}), p, {target: q});
		assert(q.hp < q.maxhp); assert.equal(q.boosts.def, 0); assert(!q.volatiles.flinch);
		assert(battle.log.some(l => l.startsWith('|-hitcount|')));
	});
	for (const outcome of ['hit', 'failed-roll', 'protect', 'substitute', 'immune', 'already-statused']) {
		it('Poison Tail toxic outcome: ' + outcome, () => {
			const [p, q] = setup();
			const random = battle.random.bind(battle);
			battle.random = (m, n) => m === 100 && n === undefined ? (outcome === 'failed-roll' ? 20 : 19) : random(m, n);
			if (outcome === 'protect') q.addVolatile('protect');
			if (outcome === 'substitute') q.addVolatile('substitute');
			if (outcome === 'immune') q.setType('Steel');
			if (outcome === 'already-statused') q.setStatus('brn');
			battle.actions.useMove(Object.assign(Dex.getActiveMove('poisontail'), {accuracy: true, willCrit: false}), p, {target: q});
			assert.equal(q.status, outcome === 'hit' ? 'tox' : outcome === 'already-statused' ? 'brn' : '');
		});
	}
	it('announces New World only when the delayed attack is successfully scheduled', () => {
		const [p, q] = setup(); battle.field.terrain = 'newworldterrain';
		battle.actions.useMove('nostraswish', p, {target: q});
		assert(battle.log.some(l => l.includes('Nostra\'s wish became a guiding star!')));
		assert(battle.log.some(l => l.includes('move: Nostras Wish') && l.includes('[slot] attack') && l.includes('[of] p2a:')));
		assert(battle.log.some(l => l.includes('move: Wish') && l.includes('[slot] heal')));
		battle.actions.useMove('nostraswish', p, {target: q});
		assert.equal(battle.log.filter(l => l.includes('Nostra\'s wish became a guiding star!')).length, 1);
	});
	for (const [species, move] of [['lycanroc', 'bonerush'], ['lycanrocmidnight', 'shadowbone'], ['lycanrocdusk', 'bonemerang']]) {
		it(species + ' learns ' + move + ' across field formats', () => {
			for (const format of ['gen9doublesrockyfield', 'gen9dragonsden']) {
				const v = TeamValidator.get(format);
				assert.equal(v.checkCanLearn(Dex.moves.get(move), Dex.species.get(species)), null);
				if (species !== 'lycanrocmidnight') {
					assert(v.checkCanLearn(Dex.moves.get('shadowbone'), Dex.species.get(species)));
					assert(v.validateTeam([{species, moves: ['Shadow Bone']}, {species: 'Mew', moves: ['Protect']}])?.some(e => /Shadow Bone/.test(e)));
				}
			}
		});
	}
});
