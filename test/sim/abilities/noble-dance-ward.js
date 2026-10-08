'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
let battle;
function setup(id = 'Lilligant', doubles = false) {
	const mon = (species = 'Mew', ability = 'No Ability') => ({ species, ability, moves: ['splash', 'quiverdance', 'dragondance', 'petaldance'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [[mon(id, 'Noble Dance'), mon(), mon()], [mon(), mon(), mon()]]);
	battle.makeChoices('team 123', 'team 123'); battle.field.terrain = '';
	for (const side of battle.sides) for (const p of side.pokemon) p.hp = p.maxhp = p.baseMaxhp = 10000;
	return [battle.p1.active[0], battle.p2.active[0], battle.p1.active[1]];
}
function hit(source, target, extra = {}) {
	const m = Dex.getActiveMove('doublekick'); Object.assign(m, { damage: 100, multihit: 3, accuracy: true, willCrit: false }, extra);
	battle.actions.useMove(m, source, { target }); battle.clearActiveMove();
}
describe('Approved Noble Dance ward and Ludicolo Rain Dish', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('replaces only Ludicolo hidden slot with Rain Dish', () => {
		assert.deepEqual(Dex.species.get('ludicolo').abilities, { '0': 'Swift Swim', '1': 'Liquid Voice', H: 'Rain Dish' });
		assert.deepEqual(Dex.species.get('ludicolo').passives, ['owntempo']);
	});
	for (const id of ['Lilligant', 'Lilligant-Hisui'])it(id + ' earns one ward from a successful direct dance and protects the entire next opposing move', () => {
		const [p, t] = setup(id);
		battle.makeChoices('move quiverdance', 'move splash');
		assert(p.volatiles.nobledanceward);
		assert(p.volatiles.nobledancespent);
		const hp = p.hp;
		hit(t, p);
		assert.equal(hp - p.hp, 240);
		assert(!p.volatiles.nobledanceward);
		const next = p.hp;
		hit(t, p);
		assert.equal(next - p.hp, 300);
		battle.makeChoices('move quiverdance', 'move splash');
		assert(!p.volatiles.nobledanceward);
	});
	it('Dancer-called dances retain their boosts but never earn the ward', () => {
		const [p] = setup();
		battle.makeChoices('move splash', 'move dragondance');
		assert.equal(p.boosts.atk, 1);
		assert.equal(p.boosts.spe, 1);
		assert(!p.volatiles.nobledancespent);
		assert(!p.volatiles.nobledanceward);
	});
	it('failed capped dances and suppressed Noble Dance do not spend the ward', () => {
		const [p] = setup(); Object.assign(p.boosts, { spa: 6, spd: 6, spe: 6 });
		battle.makeChoices('move quiverdance', 'move splash');
		assert(!p.volatiles.nobledancespent);
		p.boosts.spa = 0;
		p.addVolatile('gastroacid');
		battle.makeChoices('move quiverdance', 'move splash');
		assert(!p.volatiles.nobledancespent);
	});
	it('ward expires at end following turn and ability replacement cannot refresh the entry budget', () => {
		const [p] = setup();
		battle.makeChoices('move quiverdance', 'move splash');
		const state = p.volatiles.nobledanceward;
		assert.equal(state.duration, 1);
		assert(!p.addVolatile('nobledanceward', p));
		assert.equal(state.duration, 1);
		p.setAbility('Pressure');
		p.setAbility('Noble Dance');
		battle.makeChoices('move quiverdance', 'move splash');
		assert(!p.volatiles.nobledanceward);
		assert(p.volatiles.nobledancespent);
	});
	it('switching clears the ward and re-entry restores the budget', () => {
		const [p] = setup();
		battle.makeChoices('move quiverdance', 'move splash');
		battle.makeChoices('switch 3', 'move splash');
		assert(!p.volatiles.nobledanceward);
		battle.makeChoices('switch 3', 'move splash');
		battle.makeChoices('move quiverdance', 'move splash');
		assert(p.volatiles.nobledanceward);
	});
	it('allied attacks and residual damage do not use the opposing-move ward', () => {
		const [p, t, ally] = setup('Lilligant', true);
		battle.makeChoices('move quiverdance, move splash', 'move splash, move splash');
		let hp = p.hp;
		hit(ally, p);
		assert.equal(hp - p.hp, 300);
		assert(p.volatiles.nobledanceward);
		battle.damage(100, p, t, Dex.conditions.get('brn'));
		assert(p.volatiles.nobledanceward);
		hp = p.hp;
		hit(t, p);
		assert.equal(hp - p.hp, 240);
	});
	for (const extra of [{ sourceEffect: 'sleeptalk' }, { hasBounced: true }, { isExternal: true }, { callsMove: true }])it('rejects indirect activation ' + JSON.stringify(extra), () => {
		const [p, t] = setup();
		p.moveThisTurnResult = true;
		const m = Object.assign(Dex.getActiveMove('quiverdance'), extra);
		battle.singleEvent('AfterMove', p.getAbility(), p.abilityState, p, t, m);
		assert(!p.volatiles.nobledancespent);
	});
	it('a missed or Protected damaging dance does not spend the ward', () => {
		const [p, t] = setup();
		t.addVolatile('protect', t);
		battle.actions.runMove('petaldance', p, 1);
		assert(!p.volatiles.nobledancespent);
	});
});
