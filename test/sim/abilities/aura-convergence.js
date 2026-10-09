'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const { adaptiveMoveView } = require('../../../dist/sim/adaptive-cycle');
let battle;
function setup() {
	battle = common.createBattle({ gameType: 'doubles' }, [
		[{ species: 'Lucario-Mega', ability: 'Aura Convergence', moves: ['closecombat', 'aurasphere', 'vacuumwave', 'bulletpunch'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
	]);
	const p = battle.p1.active[0], q = battle.p2.active[0], r = battle.p2.active[1];
	if (p.species.id !== 'lucariomega') p.formeChange('Lucario-Mega', null, true);
	battle.field.terrain = '';
	for (const mon of [p, q, r]) {
		Object.assign(mon.storedStats, { atk: 100, spa: 100, def: 100, spd: 100 });
		mon.hp = mon.maxhp = mon.baseMaxhp = 10000;
	}
	battle.randomizer = n => n;
	return [p, q, r];
}
describe('Approved Aura Convergence', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('ignores item and ability stat modifiers when choosing, but applies them to damage', () => {
		const [p, q] = setup();
		const attack = () => Object.assign(Dex.getActiveMove('aurasphere'), {willCrit: false});
		const normal = battle.actions.getDamage(p, q, attack());
		q.setItem('Assault Vest');
		assert.equal(adaptiveMoveView(attack(), p, q).category, 'Special');
		assert(battle.actions.getDamage(p, q, attack()) < normal);
		p.setItem('Choice Band');
		assert.equal(adaptiveMoveView(attack(), p, q).category, 'Special');
		q.setAbility('Fur Coat');
		assert.equal(adaptiveMoveView(Dex.getActiveMove('closecombat'), p, q).category, 'Physical');
	});
	it('replaces Aura Instinct and retains passive Adaptability', () => {
		const [p] = setup(); assert.equal(p.ability, 'auraconvergence'); assert.deepEqual(p.getPassives(), ['adaptability']);
		assert(!p.hasAbility('aurainstinct'));
	});
	it('selects each target separately, preserves all move properties and locks each execution', () => {
		const [p, q, r] = setup(); q.storedStats.def = 200; r.storedStats.spd = 200;
		const move = Dex.getActiveMove('closecombat');
		const special = adaptiveMoveView(move, p, q), physical = adaptiveMoveView(move, p, r);
		assert.equal(special.category, 'Special'); assert.equal(physical.category, 'Physical');
		for (const key of ['basePower', 'accuracy', 'flags', 'self', 'secondaries']) assert.deepEqual(special[key], move[key]);
		q.storedStats.spd = 1000; p.boosts.atk = 6;
		assert.equal(adaptiveMoveView(move, p, q).category, 'Special');
		assert.equal(adaptiveMoveView(Dex.getActiveMove('closecombat'), p, q).category, 'Physical');
	});
	it('includes stages, preserves ties, and leaves fixed damage and other types alone', () => {
		const [p, q] = setup(); assert.equal(adaptiveMoveView(Dex.getActiveMove('aurasphere'), p, q).category, 'Special');
		assert.equal(adaptiveMoveView(Dex.getActiveMove('closecombat'), p, q).category, 'Physical');
		p.boosts.atk = 1; assert.equal(adaptiveMoveView(Dex.getActiveMove('aurasphere'), p, q).category, 'Physical');
		q.boosts.def = 2; assert.equal(adaptiveMoveView(Dex.getActiveMove('closecombat'), p, q).category, 'Special');
		for (const id of ['seismictoss', 'tackle', 'swordsdance']) { const m = Dex.getActiveMove(id); assert.equal(adaptiveMoveView(m, p, q), m); }
	});
	it('applies burn and screens after category choice, while preserving accuracy and drawbacks', () => {
		const [p, q] = setup(); p.storedStats.atk = 200;
		const attack = () => Object.assign(Dex.getActiveMove('aurasphere'), { willCrit: false });
		const normal = battle.actions.getDamage(p, q, attack()); p.status = 'brn';
		assert.equal(adaptiveMoveView(attack(), p, q).category, 'Physical');
		const burned = battle.actions.getDamage(p, q, attack()); assert(burned >= normal * 0.49 && burned <= normal * 0.51);
		p.status = ''; q.side.addSideCondition('reflect', q, Dex.moves.get('reflect'));
		assert(battle.actions.getDamage(p, q, attack()) < normal);
		assert.equal(adaptiveMoveView(attack(), p, q).accuracy, true);
		p.storedStats.atk = 50; p.storedStats.spa = 200;
		battle.actions.useMove('closecombat', p, { target: q }); assert.equal(p.boosts.def, -1); assert.equal(p.boosts.spd, -1);
	});
	it('respects suppression and copies correctly with Transform', () => {
		const [p, q] = setup(); p.storedStats.spa = 200; p.addVolatile('gastroacid');
		assert.equal(adaptiveMoveView(Dex.getActiveMove('closecombat'), p, q).category, 'Physical');
		assert.equal(battle.runEvent('ModifySTAB', p, q, Dex.getActiveMove('closecombat'), 1.5), 2);
		p.removeVolatile('gastroacid'); assert(q.transformInto(p)); assert.equal(q.ability, 'auraconvergence');
		assert.deepEqual(q.getPassives(), ['adaptability']);
	});
	it('uses the chosen category for physical-hit reactions', () => {
		const [p, q] = setup(); q.setAbility('Weak Armor'); p.storedStats.atk = 200;
		battle.actions.useMove('aurasphere', p, { target: q });
		assert.equal(q.boosts.def, -1); assert.equal(q.boosts.spe, 2);
		q.boosts = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, accuracy: 0, evasion: 0 };
		p.storedStats.atk = 50; p.storedStats.spa = 200;
		battle.actions.useMove('closecombat', p, { target: q });
		assert.equal(q.boosts.def, 0); assert.equal(q.boosts.spe, 0);
	});
});
