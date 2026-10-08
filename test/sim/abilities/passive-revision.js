'use strict';
const assert = require('assert').strict, common = require('../../common'), { Dex } = require('../../../dist/sim');
let battle;
function setup(s = 'Beedrill-Mega', a = 'Spiral Evolution') {
	const mon = (s = 'Chansey', a = 'No Ability') => ({ species: s, ability: a, moves: ['tackle', 'swordsdance', 'protect', 'quickattack'] });
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[mon(s, a), mon()], [mon(), mon()]]);
	battle.makeChoices('team 12', 'team 12');
	battle.field.terrain = '';
	for (const side of battle.sides)
		for (const p of side.pokemon)
			p.hp = p.maxhp = p.baseMaxhp = 1000;
	return [battle.p1.active[0], battle.p2.active[0]];
}
function hit(p, t, id = 'tackle', extra = {}) {
	const m = Object.assign(Dex.getActiveMove(id), { accuracy: true, willCrit: false, damage: 40 }, extra);
	battle.actions.useMove(m, p, { target: t });
	battle.runEvent('AfterMove', p, t, m);
	battle.clearActiveMove();
}
describe('Final starter/insect revision and settled passive choices', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	it('uses only Proficient on exactly 34 explicit gimmick records and family traits on the remaining 42', () => {
		const { StarterPassives, ProficientPassiveForms } = require('../../../dist/data/starter-passives'), rev = require('./passive-revision-approved.json');
		assert.deepEqual([...ProficientPassiveForms].sort(), rev.proficientForms.sort());
		assert.equal(Object.keys(StarterPassives).length, 76);
		for (const [id, p] of Object.entries(StarterPassives))
			assert.deepEqual(p, rev.proficientForms.includes(id) ? ['proficient'] : [id.match(/^(charizard|typhlosion|blaziken|infernape|emboar|delphox|incineroar|cinderace|skeledirge)/) ? 'blaze' : id.match(/^(blastoise|feraligatr|swampert|empoleon|samurott|greninja|primarina|inteleon|quaquaval)/) ? 'torrent' : 'overgrow']);
		for (const [id, p] of Object.entries(rev.overrides))
			assert.deepEqual(Dex.species.get(id).passives, p, id);
	});
	it('Spiral retains Shield Dust and normal Lunge with neither Infiltrator nor Power Drill', () => {
		const [p, t] = setup();
		assert(!p.hasAbility('infiltrator'));
		assert(p.hasAbility('shielddust'));
		assert(!p.hasAbility('powerdrill'));
		assert(!Dex.moves.get('lunge').flags.drill);
		const m = Dex.getActiveMove('lunge');
		battle.runEvent('ModifyMove', p, t, m, m);
		assert(!m.infiltrates);
		assert(m.breaksProtect);
		assert(!m.multihit);
		assert.equal(m.basePower, 80);
		assert(m.flags.contact);
		assert.equal(m.secondaries[0].boosts.atk, -1);
	});
	for (const foeMove of ['tackle', 'quickattack'])
		it('Spiral Trick Room ordering against ' + foeMove, () => {
			const [p, t] = setup();
			p.storedStats.spe = 500;
			t.storedStats.spe = 5;
			battle.field.addPseudoWeather('trickroom', p);
			const at = battle.log.length;
			battle.makeChoices('move tackle', 'move ' + foeMove);
			const actions = battle.log.slice(at).filter(l => l.startsWith('|move|'));
			assert(actions[0].startsWith('|move|p1a:'), actions.join('\n'));
			assert.equal(Dex.moves.get('tackle').priority, 0);
		});
	for (const [s, a] of [['Beedrill-Mega', 'Spiral Evolution'], ['Butterfree-Mega', 'Toxic Evolution'], ['Butterfree-Gmax', 'Mythic Scale']])
		it(s + ' has selected Shield Dust that suppression removes while passive Levitate persists', () => {
			const [p, t] = setup(s, a);
			const m = Dex.getActiveMove('tackle'), secondary = [{ chance: 100, status: 'brn' }];
			assert.deepEqual(p.getPassives(), ['levitate']);
			assert.deepEqual(battle.runEvent('ModifySecondaries', p, t, m, secondary), []);
			p.addVolatile('gastroacid');
			assert.deepEqual(battle.runEvent('ModifySecondaries', p, t, m, secondary), secondary);
			assert(!p.isGrounded());
		});
	for (const [passive, ids] of Object.entries(require('./settled-passives-approved.json').groups))
		for (const id of ids)
			it(id + ' receives exactly ' + passive, () => assert.deepEqual(Dex.species.get(id).passives, [passive]));
	it('Free Flight allows airborne voluntary escape while preserving binding damage and grounding', () => {
		const [p, t] = setup('Salamence', 'No Ability');
		p.addVolatile('partiallytrapped', t, Dex.moves.get('firespin'));
		battle.runEvent('TrapPokemon', p);
		assert(!p.trapped);
		const hp = p.hp;
		battle.fieldEvent('Residual');
		assert(p.hp < hp);
		p.addVolatile('smackdown', t);
		p.trapped = false;
		battle.runEvent('TrapPokemon', p);
		assert(p.trapped);
		assert(p.isGrounded());
	});
	it('Free Flight handles opposing Shadow Tag and retains self trapping', () => {
		const [p, t] = setup('Salamence', 'No Ability');
		t.setAbility('Shadow Tag');
		p.trapped = false;
		battle.runEvent('TrapPokemon', p);
		assert(!p.trapped);
		p.addVolatile('noretreat', p);
		battle.runEvent('TrapPokemon', p);
		assert(p.trapped);
	});
	it('Entrenched blocks opposing phazing and Red Card but permits self and allied switching', () => {
		const [p, t] = setup('Kingambit', 'No Ability');
		p.addVolatile('gastroacid');
		for (const effect of [Dex.moves.get('roar'), Dex.items.get('redcard')])
			assert.equal(battle.runEvent('DragOut', p, t, effect), null);
		assert.equal(battle.runEvent('DragOut', p, p, Dex.moves.get('roar')), true);
		assert.equal(battle.runEvent('DragOut', p, battle.p1.pokemon[1], Dex.moves.get('roar')), true);
	});
	it('Quarry Cannon retains five Rock Blast hits with one Solid Rock multiplier', () => {
		const [p, t] = setup('Rhyperior', 'Quarry Cannon');
		const m = Dex.getActiveMove('watergun');
		t.setType('Water');
		const base = battle.actions.getDamage(t, p, m);
		p.setAbility('No Ability');
		assert.equal(battle.actions.getDamage(t, p, m), base);
		p.setAbility('Quarry Cannon');
		const rock = Dex.getActiveMove('rockblast');
		battle.runEvent('ModifyMove', p, t, rock, rock);
		assert.equal(rock.multihit, 5);
	});
	it('Rocky Payload preserves local Rock STAB, offensive field boost and extra type resistance', () => {
		const [p, t] = setup('Conkeldurr', 'No Ability');
		const m = Dex.getActiveMove('rockslide');
		battle.runEvent('ModifyMove', p, t, m, m);
		assert(m.forceSTAB);
		assert.equal(battle.runEvent('ModifyAtk', p, t, m, 100), 150);
		battle.field.setTerrain('rockyterrain', p);
		assert.equal(battle.runEvent('ModifyAtk', p, t, m, 100), 200);
		assert.equal(battle.runEvent('Effectiveness', p, 'Fire', Dex.getActiveMove('flamethrower'), 0), -1);
	});
	it('Nose Formation keeps Elevate, Filter and its existing mini-nose callbacks alongside passive Levitate', () => {
		const [p] = setup('Probopass', 'Nose Formation');
		assert.deepEqual(p.getPassives(), ['levitate']);
		assert(p.hasAbility('levitate'));
		assert(p.hasAbility('elevate'));
		assert(p.hasAbility('filter'));
		assert(p.getAbility().onSourceDamagingHit);
		assert(p.getAbility().onSourceAfterFaint);
	});
	it('Void Omen triggers 3-turn Safeguard on a successful secondary and retains its ward', () => {
		const [p, t] = setup('Togekiss', 'Void Omen');
		hit(p, t, 'tackle', { secondaries: [{ chance: 100, boosts: { spe: -1 } }] });
		assert.equal(p.side.sideConditions.safeguard.duration, 3);
		assert(p.abilityState.ward);
		p.side.removeSideCondition('safeguard');
		hit(p, p, 'swordsdance', { damage: undefined });
		assert(!p.side.sideConditions.safeguard);
	});
	it('Void Omen accepts a successful self status move but not failed self moves or blocked secondaries', () => {
		const [p, t] = setup('Togekiss', 'Void Omen');
		p.boosts.atk = 6;
		hit(p, p, 'swordsdance', { damage: undefined });
		assert(!p.side.sideConditions.safeguard);
		t.formeChange('Venomoth');
		t.setAbility('No Ability');
		hit(p, t, 'tackle', { secondaries: [{ chance: 100, boosts: { spe: -1 } }] });
		assert(!p.side.sideConditions.safeguard);
		p.boosts.atk = 0;
		hit(p, p, 'swordsdance', { damage: undefined });
		assert.equal(p.side.sideConditions.safeguard.duration, 3);
	});
	it('Void Omen preserves longer Safeguard and does not regain its use through ability changes', () => {
		const [p, t] = setup('Togekiss', 'Void Omen');
		p.side.addSideCondition('safeguard', p);
		p.side.sideConditions.safeguard.duration = 5;
		assert.equal(p.side.sideConditions.safeguard.duration, 5);
		hit(p, p, 'swordsdance', { damage: undefined });
		assert.equal(p.side.sideConditions.safeguard.duration, 5);
		p.side.removeSideCondition('safeguard');
		p.setAbility('Pressure');
		p.setAbility('Void Omen');
		hit(p, t, 'tackle', { secondaries: [{ chance: 100, boosts: { spe: -1 } }] });
		assert(!p.side.sideConditions.safeguard);
	});
	it('Hydroelectric grants Speed only after qualifying opposing Water HP damage, once per entry', () => {
		const [p, t] = setup('Heliolisk', 'Hydroelectric');
		p.hp = 500;
		const m = Object.assign(Dex.getActiveMove('surf'), { accuracy: true, willCrit: false, damage: 20, multihit: 3 });
		battle.actions.useMove(m, p, { target: t });
		assert.equal(p.boosts.spe, 0);
		assert.equal(p.hp, 625);
		battle.runEvent('AfterMove', p, t, m);
		battle.clearActiveMove();
		assert.equal(p.boosts.spe, 1);
		p.setAbility('Pressure');
		p.setAbility('Hydroelectric');
		hit(p, t, 'surf');
		assert.equal(p.boosts.spe, 1);
		assert.deepEqual(p.getPassives(), ['dryskin']);
	});
	for (const blocked of ['protect', 'substitute', 'Water Absorb', 'ally'])
		it('Hydroelectric does not spend Speed reward on ' + blocked, () => {
			const [p, t] = setup('Heliolisk', 'Hydroelectric');
			if (blocked === 'protect' || blocked === 'substitute')
				t.addVolatile(blocked, t);
			else if (blocked === 'Water Absorb')
				t.setAbility(blocked);
			hit(p, blocked === 'ally' ? p : t, 'watergun');
			assert.equal(p.boosts.spe, 0);
			assert(!p.volatiles.hydroelectricspent);
		});
	it('Void Omen no longer bypasses selected or passive defenses', () => {
		const [p, t] = setup('Togekiss', 'Void Omen');
		assert(!p.hasAbility('moldbreaker'));
		const m = Dex.getActiveMove('tackle');
		battle.runEvent('ModifyMove', p, t, m, m);
		assert(!m.ignoreAbility);
		t.setAbility('Water Absorb');
		const hp = t.hp;
		hit(p, t, 'watergun');
		assert.equal(t.hp, hp);
		t.setAbility('Shield Dust');
		hit(p, t, 'tackle', { secondaries: [{ chance: 100, boosts: { spe: -1 } }] });
		assert.equal(t.boosts.spe, 0);
		assert(!p.side.sideConditions.safeguard);
		t.formeChange('Venomoth');
		t.setAbility('No Ability');
		hit(p, t, 'tackle', { secondaries: [{ chance: 100, boosts: { spe: -1 } }] });
		assert.equal(t.boosts.spe, 0);
	});
	it('Spiral loses Substitute and screen bypass while retaining separate Protect piercing', () => {
		const [p, t] = setup();
		t.addVolatile('substitute', t);
		const hp = t.hp;
		hit(p, t, 'tackle');
		assert.equal(t.hp, hp);
		t.removeVolatile('substitute');
		const m = Dex.getActiveMove('tackle');
		battle.runEvent('ModifyMove', p, t, m, m);
		assert(!m.infiltrates);
		assert(m.breaksProtect);
		assert(m.spiralEvolutionBreaksProtect);
		t.addVolatile('protect', t);
		hit(p, t, 'tackle');
		assert(t.hp < hp);
	});
});
