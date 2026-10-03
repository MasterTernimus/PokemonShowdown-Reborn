'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim/dex');
describe('Primeval Hunger', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(foeAbility = 'No Ability') {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Cradily', ability: 'Primeval Hunger', moves: ['gigadrain', 'splash'] }],
			[{ species: 'Mew', ability: foeAbility, moves: ['splash', 'recover'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 1', 'team 12'); battle.randomChance = () => false;
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	function hit(p, t, extra = {}) {
		const move = battle.dex.getActiveMove('gigadrain'); Object.assign(move, { basePower: 1, accuracy: true, willCrit: false }, extra);
		battle.actions.runMove(move, p, p.getLocOf(t));
	}
	it('gives Volcarona full existing Overcoat alongside Cinder Scales', () => {
		const abilities = Dex.species.get('volcarona').abilities;
		assert.equal(abilities['0'], 'Cinder Scales'); assert.equal(abilities['1'], 'Overcoat');
		assert.equal(abilities.H, 'Dawn Herald');
	});
	it('retains every Accumulation callback and component-aware move mechanics', () => {
		const [p] = setup(); assert(p.hasAbility('accumulation'));
		const base = Dex.abilities.get('accumulation'), hunger = Dex.abilities.get('primevalhunger');
		for (const key of Object.keys(base)) if (key.startsWith('on')) assert.equal(hunger[key], base[key], key);
		battle.makeChoices('move splash', 'move splash'); assert.equal(p.volatiles.stockpile.layers, 1);
		battle.makeChoices('move splash', 'move splash'); assert.equal(p.volatiles.stockpile.layers, 2);
		assert.equal(Dex.species.get('cradily').abilities.H, 'Primeval Hunger');
	});
	for (const [atk, spa, stat] of [[3, 2, 'atk'], [2, 3, 'spa'], [2, 2, 'spa']]) {
		it('lowers the selected positive stat once after a multihit drain: ' + atk + '/' + spa, () => {
			const [p, t] = setup();
			t.boosts.atk = atk;
			t.boosts.spa = spa;
			hit(p, t, { multihit: 3 });
			assert.equal(t.boosts.atk, atk - (stat === 'atk' ? 1 : 0));
			assert.equal(t.boosts.spa, spa - (stat === 'spa' ? 1 : 0));
			assert.equal(p.boosts.atk, 0); assert.equal(p.boosts.spa, 0);
			assert.equal(t.volatiles.healblock.duration, 2);
		});
	}
	it('does not lower neutral stages and respects Clear Body and Contrary', () => {
		for (const ability of ['No Ability', 'Clear Body', 'Contrary']) {
			const [p, t] = setup(ability); if (ability !== 'No Ability') t.boosts.atk = 2;
			hit(p, t); assert.equal(t.boosts.atk, ability === 'Contrary' ? 3 : ability === 'Clear Body' ? 2 : 0);
			assert.equal(t.boosts.spa, 0); battle.destroy(); battle = null;
		}
	});
	it('ignores Substitute-only damage and non-draining attacks', () => {
		const [p, t] = setup();
		t.boosts.spa = 2;
		t.addVolatile('substitute');
		hit(p, t);
		assert(!t.volatiles.healblock); assert.equal(t.boosts.spa, 2);
		t.removeVolatile('substitute'); hit(p, t, { drain: undefined });
		assert(!t.volatiles.healblock); assert.equal(t.boosts.spa, 2);
	});
	it('blocks healing through the following turn, then ends; switching also clears it', () => {
		const [p, t] = setup(); hit(p, t); t.hp = Math.floor(t.maxhp / 2);
		assert.equal(battle.heal(10, t, t, battle.dex.moves.get('recover')), false);
		battle.makeChoices('move splash', 'move splash'); assert(t.volatiles.healblock);
		battle.makeChoices('move splash', 'move splash'); assert(!t.volatiles.healblock);
		hit(p, t); battle.makeChoices('move splash', 'switch 2'); assert(!t.volatiles.healblock);
	});
	it('refreshes its short block without shortening an existing longer Heal Block', () => {
		const [p, t] = setup(); t.addVolatile('healblock', p, battle.dex.moves.get('healblock'));
		hit(p, t); assert.equal(t.volatiles.healblock.duration, 5);
		t.volatiles.healblock.duration = 1; hit(p, t); assert.equal(t.volatiles.healblock.duration, 2);
	});
});
