/* eslint-disable @stylistic/max-statements-per-line */
'use strict';
const assert = require('assert').strict, common = require('../../common');
const { Dex } = require('../../../dist/sim');
let battle;
function setup(species, ability, doubles = false) {
	const mon = (species = 'Mew', ability = 'No Ability') => ({ species, ability, moves: ['splash', 'airslash', 'arenitewall', 'auroraveil'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [[mon(species, ability), mon(), mon()], [mon(), mon(), mon()]]); battle.makeChoices('team 123', 'team 123');
	const p = battle.p1.active[0], q = battle.p2.active[0]; if (p.species.id !== Dex.species.get(species).id)p.formeChange(species, null, true); p.setAbility(ability);
	for (const side of battle.sides) for (const m of side.pokemon)m.hp = m.maxhp = m.baseMaxhp = 4000; battle.randomChance = (n, d) => n >= d;
	return [p, q];
}
function hit(p, q, id, extra = {}) { const move = Object.assign(Dex.getActiveMove(id), { accuracy: true, willCrit: false }, extra); battle.actions.useMove(move, p, { target: q }); battle.clearActiveMove(); return move; }
describe('Four approved Sovereign additions', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('preserves Rain Sovereign and all existing Sand/Frost weather, mitigation and chip callbacks byte-for-byte', () => {
		const before = require('../../../artifacts/sovereign-before.json');
		for (const [id, events] of Object.entries({ rainsovereign: Object.keys(before.rainsovereign), sandsovereign: ['onStart', 'onResidual', 'onSourceModifyDamage'], frostsovereign: ['onStart', 'onWeather', 'onDamagingHit', 'onImmunity', 'onResidual', 'onSourceModifyDamage'], sunsovereign: Object.keys(before.sunsovereign).filter(k => k !== 'onStart') })) for (const event of events)assert.equal(Dex.abilities.get(id)[event].toString(), before[id][event], id + '/' + event);
	});
	for (const species of ['Charizard-Mega-Y', 'Mew'])it('Sun Sovereign summons eight-turn sun without Intimidate with ' + species, () => {
		const [p, q] = setup(species, 'Sun Sovereign', true); const foe = battle.p2.active[1]; q.boosts.atk = foe.boosts.atk = 0; delete p.abilityState.intimidateActivated;
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p); assert.equal(q.boosts.atk, 0); assert.equal(foe.boosts.atk, 0); assert.equal(battle.field.weather, 'sunnyday'); assert.equal(battle.field.weatherState.duration, 8);
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p); assert.equal(q.boosts.atk, 0); hit(p, q, 'flamethrower', { damage: 100 }); assert(!q.volatiles.partiallytrapped);
	});
	for (const protection of ['Inner Focus', 'Substitute', 'Gastro Acid'])it('Sun Sovereign Intimidate respects ' + protection, () => {
		const [p, q] = setup('Charizard-Mega-Y', 'Sun Sovereign'); q.boosts.atk = 0; delete p.abilityState.intimidateActivated;
		if (protection === 'Substitute')q.addVolatile('substitute'); else if (protection === 'Gastro Acid')p.addVolatile('gastroacid'); else q.setAbility(protection);
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p); assert.equal(q.boosts.atk, 0);
	});
	it('Sun retains full Unbound Blaze conversion, field defense and separate Proficient', () => {
		const [p, q] = setup('Charizard-Mega-Y', 'Sun Sovereign'); assert.deepEqual(p.getPassives(), ['proficient']); assert(p.hasAbility('unboundblaze')); assert(!p.hasAbility('proficient')); assert(!p.hasAbility('moldbreaker'));
		const move = Dex.getActiveMove('tackle'); battle.runEvent('ModifyType', p, q, move, move); assert.equal(move.type, 'Dragon');
		battle.field.terrain = 'volcanicterrain'; p.boosts.def = p.boosts.spd = 0; battle.singleEvent('Start', p.getAbility(), p.abilityState, p); assert.equal(p.boosts.def, 1); assert.equal(p.boosts.spd, 1);
	});
	for (const [species, ability] of [['Pidgeot', 'Updraft'], ['Pidgeot-Mega', 'Storm Sovereign']])it(ability + ' uses one entry budget across hits, ability changes and switching', () => {
		const [p, q] = setup(species, ability, true), ally = battle.p1.active[1]; hit(p, q, 'airslash', { damage: 100, multihit: 3 }); assert.equal(ally.boosts.spe, 1); assert.equal(p.boosts.spe, 0);
		p.setAbility('No Ability'); p.setAbility(ability); battle.singleEvent('Start', p.getAbility(), p.abilityState, p); hit(p, q, 'airslash', { damage: 100 }); assert.equal(ally.boosts.spe, 1);
		battle.makeChoices('switch 3, move 1', 'move 1, move 1'); battle.makeChoices('switch 3, move 1', 'move 1, move 1'); hit(p, q, 'airslash', { damage: 100 }); assert.equal(ally.boosts.spe, 2);
	});
	it('Updraft budget carries from base Pidgeot into Mega Pidgeot', () => {
		const [p, q] = setup('Pidgeot', 'Updraft'); hit(p, q, 'airslash', { damage: 100 }); assert.equal(p.boosts.spe, 1); p.formeChange('Pidgeot-Mega', null, true); p.setAbility('Storm Sovereign'); hit(p, q, 'airslash', { damage: 100 }); assert.equal(p.boosts.spe, 1);
	});
	it('Storm gives the holder one Speed boost when no living adjacent ally remains', () => {
		const [p, q] = setup('Pidgeot-Mega', 'Storm Sovereign', true); battle.p1.active[1].hp = 0; hit(p, q, 'airslash', { damage: 100 }); assert.equal(p.boosts.spe, 1);
	});
	for (const block of ['protect', 'substitute', 'ally', 'suppression'])it('Storm Updraft does not spend its entry allowance on ' + block, () => {
		const [p, q] = setup('Pidgeot-Mega', 'Storm Sovereign', true); if (block === 'protect')q.addVolatile('protect'); if (block === 'substitute') { q.addVolatile('substitute'); q.volatiles.substitute.hp = 1000; } if (block === 'suppression')p.addVolatile('gastroacid');
		hit(p, block === 'ally' ? battle.p1.active[1] : q, 'airslash', { damage: 100 }); assert(!p.m.updraftUsed);
	});
	it('Storm removes Keen Eye, keeps native No Guard and no Gale Wings, and preserves eight-turn replaceable winds', () => {
		const [p, q] = setup('Pidgeot-Mega', 'Storm Sovereign'); assert.deepEqual(p.getPassives(), ['noguard']); assert(!p.hasAbility('keeneye')); assert(!p.hasAbility('galewings')); assert(p.hasAbility('updraft'));
		battle.field.terrain = 'mirrorarenaterrain'; battle.singleEvent('Start', p.getAbility(), p.abilityState, p); assert.equal(p.boosts.accuracy, 0); assert(!p.volatiles.laserfocus); assert.equal(battle.field.weather, 'deltastream'); assert.equal(battle.field.weatherState.duration, 8);
		const move = Dex.getActiveMove('airslash'); assert.equal(battle.runEvent('ModifyPriority', p, q, move, 0), 0); assert.equal(battle.runEvent('Accuracy', q, p, move, 1), true);
		battle.field.setWeather('raindance', q, Dex.abilities.get('drizzle')); assert.equal(battle.field.weather, 'raindance');
	});
	for (const types of [['Electric'], ['Fire', 'Flying'], ['Grass', 'Steel'], ['Rock'], ['Steel']])it('Sand Sovereign keeps its independent Rock/Ground chart and uses the better chart against ' + types.join('/'), () => {
		const [p, q] = setup('Tyranitar-Mega', 'Sand Sovereign'); q.setType(types); const move = Dex.getActiveMove('rockslide'); battle.runEvent('ModifyMove', p, q, move, move); assert.equal(move.type, 'Rock');
		const rock = Dex.getEffectiveness('Rock', q), ground = Dex.getEffectiveness('Ground', q); assert.equal(q.runEffectiveness(move), Dex.getImmunity('Ground', q) ? Math.max(rock, ground) : rock); assert(p.hasAbility('solidrock')); assert(!p.hasAbility('mountainbreaker')); assert(!p.hasAbility('moldbreaker')); assert.deepEqual(p.getPassives(), ['sandstream']);
	});
	it('Sand retains eight-turn manual Arenite Wall and one Rock chip tick', () => {
		const [p, q] = setup('Tyranitar-Mega', 'Sand Sovereign'); assert.equal(battle.field.weatherState.duration, 8); hit(p, p, 'arenitewall'); assert.equal(p.side.sideConditions.arenitewall.duration, 8); const hp = q.hp; battle.singleEvent('Residual', p.getAbility(), p.abilityState, p); assert.equal(hp - q.hp, 250);
	});
	for (const blocker of ['normal', 'Gastro Acid', 'Mold Breaker', 'Ability Shield'])it('Frost Soundproof retains normal bypass semantics under ' + blocker, () => {
		const [p, q] = setup('Abomasnow-Mega', 'Frost Sovereign'); if (blocker === 'Gastro Acid')p.addVolatile('gastroacid'); if (['Mold Breaker', 'Ability Shield'].includes(blocker))q.setAbility('Mold Breaker'); if (blocker === 'Ability Shield')p.setItem('Ability Shield');
		hit(q, p, 'hypervoice', { damage: 100 }); assert.equal(p.hp, ['Gastro Acid', 'Mold Breaker'].includes(blocker) ? 3900 : 4000); assert(p.getPassives().includes('snowwarning'));
	});
	it('Frost retains Ice Body, Filter, eight-turn Aurora Veil and one Ice chip tick', () => {
		const [p, q] = setup('Abomasnow-Mega', 'Frost Sovereign'); for (const id of ['icebody', 'filter', 'soundproof'])assert(p.hasAbility(id), id); assert.equal(battle.field.weatherState.duration, 8); hit(p, p, 'auroraveil'); assert.equal(p.side.sideConditions.auroraveil.duration, 8);
		const hp = q.hp; battle.singleEvent('Residual', p.getAbility(), p.abilityState, p); assert.equal(hp - q.hp, 250);
	});
	it('Rain remains without Berserk and retains its original component registry', () => {
		const [p] = setup('Drampa-Mega', 'Rain Sovereign'); assert(!p.hasAbility('berserk')); assert.deepEqual(require('../../../dist/data/ability-components').AbilityComponents.rainsovereign, ['drizzle']);
	});
});
