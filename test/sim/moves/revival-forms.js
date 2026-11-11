'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

describe('Revival Blessing preserves permanent battle forms', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(species, ability, item = '') {
		battle = common.createBattle({ formatid: 'gen9mistyfieldadrienn' }, [[
			{ species, ability, item, gigantamax: true, moves: ['splash', 'ember'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['revivalblessing', 'splash'] },
		], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('team 12', 'team 1');
		return battle.p1.active[0];
	}
	function revive(p) {
		p.faint(); battle.faintMessages();
		battle.makeChoices('auto', 'auto');
		battle.makeChoices('switch 2', '');
		battle.makeChoices('move revivalblessing', 'move splash');
		battle.makeChoices('switch 2', '');
		assert(!p.fainted);
		assert.equal(p.hp, Math.floor(p.maxhp / 2));
	}
	for (const [base, ability, item, forme, transform] of [
		['Garchomp', 'Rough Skin', 'Garchompite', 'garchompmegaz', 'mega'],
		['Centiskorch', 'Coil Up', '', 'centiskorchgmax', 'gmax'],
		['Garchomp', 'Battle Bond', '', 'garchompbattlebond', 'bond'],
		['Arcanine', 'Battle Bond', '', 'arcaninebattlebond', 'bond'],
		['Greninja', 'Battle Bond', '', 'greninjaash', 'bond'],
	]) it(`revives ${forme} with its stats, ability and passives and no extra gimmick charge`, () => {
		const p = setup(base, ability, item);
		if (transform === 'mega') assert(battle.actions.runMegaEvoX(p));
		else if (transform === 'gmax') battle.runAction({ choice: 'runDynamax', pokemon: p });
		else {
			p.formeChange(forme, Dex.abilities.get('battlebond'), true);
			p.formeRegression = true; p.bondTriggered = true;
		}
		assert.equal(p.species.id, forme);
		const expected = { ability: p.baseAbility, passives: p.getPassives(), stats: { ...p.storedStats }, count: p.side.gimmickCount };
		p.boosts.atk = 3; p.setStatus('par');
		revive(p);
		assert.equal(p.species.id, forme); assert.equal(p.baseSpecies.id, forme);
		assert.equal(p.ability, expected.ability); assert.deepEqual(p.getPassives(), expected.passives);
		assert.deepEqual(p.storedStats, expected.stats); assert.equal(p.status, ''); assert.equal(p.boosts.atk, 0);
		assert.equal(p.side.gimmickCount, expected.count);
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(p.species.id, forme); assert.equal(p.ability, expected.ability);
		if (transform === 'gmax') assert(p.volatiles.dynamax);
		assert.equal(p.side.gimmickCount, expected.count);
	});
	it('does not preserve a copied Mega form from Transform', () => {
		const p = setup('Ditto', 'Limber');
		const q = battle.p2.active[0]; q.formeChange('Garchomp-Mega-Z', null, true);
		assert(p.transformInto(q)); revive(p);
		assert.equal(p.species.id, 'ditto'); assert.equal(p.ability, 'limber');
	});
	it('Gmax revival retains spent signature PP and does not repeat its transformation heal', () => {
		const p = setup('Centiskorch', 'Coil Up');
		battle.runAction({ choice: 'runDynamax', pokemon: p });
		assert.equal(p.species.id, 'centiskorchgmax');
		p.moveSlots[1].pp -= 3;
		const pp = p.moveSlots[1].pp;
		revive(p); const hp = p.hp;
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(p.moveSlots[1].pp, pp); assert.equal(p.hp, hp);
	});
});
