'use strict';
const assert = require('../../assert');
const common = require('../../common');
describe('Latest profile ability regressions', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	it('Absolute Zero resists Fire and only changes its own Ice attacks', () => {
		battle = common.createBattle({formatid: 'gen9doublescustomgame'}, [[
			{species: 'Ampharos-Aevian-Mega', ability: 'Absolute Zero', moves: ['icebeam']},
			{species: 'Mew', ability: 'No Ability', moves: ['icebeam']},
		], [
			{species: 'Flareon', ability: 'No Ability', moves: ['flamethrower']},
			{species: 'Mew', ability: 'No Ability', moves: ['splash']},
		]]);
		const [holder, ally] = battle.p1.active;
		const fire = battle.p2.active[0];
		assert.equal(holder.runEffectiveness(battle.dex.getActiveMove('flamethrower')), -1);
		assert.equal(holder.runEffectiveness(battle.dex.getActiveMove('earthquake')), 1);
		for (const [attacker, expected] of [[holder, 1], [ally, -1]]) {
			const move = battle.dex.getActiveMove('icebeam');
			battle.runEvent('ModifyMove', attacker, fire, move, move);
			assert.equal(fire.runEffectiveness(move), expected);
		}
	});
	it('Protective Ward absorbs Water without Storm Drain boosts or redirection', () => {
		battle = common.createBattle({formatid: 'gen9customgame'}, [[
			{species: 'Lapras-Aevian', ability: 'Protective Ward', moves: ['splash']},
		], [{species: 'Mew', ability: 'No Ability', moves: ['watergun']}]]);
		const lapras = battle.p1.active[0];
		lapras.hp = Math.floor(lapras.maxhp / 2);
		const hp = lapras.hp;
		battle.makeChoices();
		assert(lapras.hp > hp);
		assert.equal(lapras.boosts.spa, 0);
		assert(lapras.hasAbility('Water Absorb'));
		assert.false(lapras.hasAbility('Storm Drain'));
	});
	it('Crystal Resonance reflects status moves after Lapras Gmaxes', () => {
		battle = common.createBattle({formatid: 'gen9mistyfieldadrienn'}, [[
			{species: 'Lapras-Aevian', ability: 'Protective Ward', gigantamax: true, moves: ['psychic']},
		], [{species: 'Lugia', ability: 'No Ability', moves: ['toxic']}]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move psychic dynamax', 'move toxic');
		assert.equal(battle.p1.active[0].ability, 'crystalresonance');
		assert.equal(battle.p1.active[0].status, '');
		assert.equal(battle.p2.active[0].status, 'tox');
	});
	it('Wild Spirit guarantees critical hits only on its first active turn', () => {
		battle = common.createBattle({formatid: 'gen9customgame'}, [[
			{species: 'Kommo-o-Aevian', ability: 'Wild Spirit', moves: ['tackle']},
		], [{species: 'Blissey', ability: 'No Ability', moves: ['splash']}]]);
		const user = battle.p1.active[0];
		const move = battle.dex.getActiveMove('tackle');
		assert.equal(user.boosts.accuracy, 1);
		assert.equal(battle.runEvent('ModifyCritRatio', user, battle.p2.active[0], move, 1), 5);
		battle.makeChoices();
		assert.equal(battle.runEvent('ModifyCritRatio', user, battle.p2.active[0], move, 1), 1);
	});
	it('Vile Assault intercepts the departing opponent and spends one move', () => {
		battle = common.createBattle({formatid: 'gen9customgame'}, [[
			{species: 'Kommo-o-Aevian', ability: 'Inexorable', moves: ['vileassault']},
		], [
			{species: 'Shuckle', ability: 'No Ability', moves: ['splash']},
			{species: 'Mew', ability: 'No Ability', moves: ['splash']},
		]]);
		const departing = battle.p2.active[0];
		const pp = battle.p1.active[0].moveSlots[0].pp;
		battle.makeChoices('move vileassault', 'switch 2');
		assert(departing.hp < departing.maxhp);
		assert.equal(battle.p2.active[0].hp, battle.p2.active[0].maxhp);
		assert.equal(battle.p1.active[0].moveSlots[0].pp, pp - 1);
	});
});
