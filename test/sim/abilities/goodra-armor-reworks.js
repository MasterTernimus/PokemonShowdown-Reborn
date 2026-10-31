'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim/dex');
const {abilityIncludesComponent} = require('../../../dist/data/ability-components');
const mon = (species = 'Mew', ability = 'No Ability', item = '') => ({species, ability, item, moves: ['splash']});

describe('Goodra and Soulforged Armor reworks', () => {
 it('keeps every newly allocated ability number distinct from existing abilities', () => {
  const abilities = Dex.abilities.all();
  assert.equal(Dex.abilities.get('Tidal Poise').num, 12062);
  assert.equal(Dex.abilities.get('Gentle Embrace').num, 12087);
  for (const ability of abilities.filter(entry => entry.num >= 12063 && entry.num <= 12087)) {
   assert.equal(abilities.filter(entry => entry.num === ability.num).length, 1, ability.name);
  }
 });
 let battle;
 afterEach(() => { battle?.destroy(); battle = null; });
 function start(holder, attacker = mon(), doubles = false) {
  const teams = doubles ? [[holder, mon()], [attacker, mon()]] : [[holder], [attacker]];
  battle = common.createBattle({formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame'}, teams);
  battle.makeChoices(...teams.map(t => t.length === 2 ? 'team 12' : 'team 1'));
  battle.randomChance = (n, d) => n >= d;
  battle.randomizer = n => n;
  return [battle.p1.active[0], battle.p2.active[0]];
 }
 function hit(id, source, target, extra = {}) {
  const move = battle.dex.getActiveMove(id);
  Object.assign(move, {accuracy: true, willCrit: false, basePower: 10, secondaries: undefined}, extra);
  battle.actions.useMove(move, source, {target});
 }
 for (const species of ['Goodra', 'Goodra-Hisui', 'Goodra-Hisui-Alt']) {
  it(species + ' has only Gooey as its passive, with one drop per contact hit', () => {
   const [p, foe] = start(mon(species));
   assert.deepEqual(p.getPassives(), ['gooey']);
   hit('tackle', foe, p, {multihit: 3});
   assert.equal(foe.boosts.spe, -3);
  });
 }
 it('does not duplicate selected and passive Gooey', () => {
  const [p, foe] = start(mon('Goodra', 'Gooey'));
  hit('tackle', foe, p); assert.equal(foe.boosts.spe, -1);
 });
 it('has no noncontact, Grass absorption or Hydration effect', () => {
  const [p, foe] = start(mon('Goodra'));
  hit('watergun', foe, p); hit('absorb', foe, p);
  assert.equal(foe.boosts.spe, 0); assert.equal(p.boosts.atk, 0);
  battle.field.setWeather('raindance'); p.setStatus('psn');
  battle.makeChoices('move splash', 'move splash');
  assert.equal(p.status, 'psn');
  assert(!abilityIncludesComponent('Gooey', 'Hydration'));
  assert(!abilityIncludesComponent('Gooey', 'Sap Sipper'));
 });
 for (const [ability, item] of [['Long Reach', ''], ['No Ability', 'Protective Pads']]) {
  it('respects ' + (item || ability), () => {
   const [p, foe] = start(mon('Goodra'), mon('Mew', ability, item));
   hit('tackle', foe, p); assert.equal(foe.boosts.spe, 0);
  });
 }
 it('still triggers through Mold Breaker, and respects Contrary and Clear Body', () => {
  const [p, foe] = start(mon('Goodra'), mon('Mew', 'Mold Breaker'));
  hit('tackle', foe, p); assert.equal(foe.boosts.spe, -1);
  foe.boosts.spe = 0; foe.setAbility('Contrary'); hit('tackle', foe, p); assert.equal(foe.boosts.spe, 1);
  foe.boosts.spe = 0; foe.setAbility('Clear Body'); hit('tackle', foe, p); assert.equal(foe.boosts.spe, 0);
 });
 it('applies to ally contact but not Substitute damage', () => {
  const [p, foe] = start(mon('Goodra'), mon(), true);
  const ally = p.side.active[1]; hit('tackle', ally, p); assert.equal(ally.boosts.spe, -1);
  p.addVolatile('substitute'); hit('tackle', foe, p); assert.equal(foe.boosts.spe, 0);
 });
 it('suppresses selected Gooey under Neutralizing Gas', () => {
  const [p, foe] = start(mon('Mew', 'Gooey'), mon('Mew', 'Neutralizing Gas'));
  hit('tackle', foe, p); assert.equal(foe.boosts.spe, 0);
 });
 it('keeps passive Gooey under Gas, following the existing passive rules', () => {
  const [p, foe] = start(mon('Goodra'), mon('Mew', 'Neutralizing Gas'));
  hit('tackle', foe, p); assert.equal(foe.boosts.spe, -1);
 });
 it('uses the approved selectable slots', () => {
  assert.equal(Dex.species.get('goodra').abilities[1], 'Gentle Embrace');
  assert.equal(Dex.species.get('goodrahisui').abilities.H, 'Shellbound Fury');
  assert.equal(Dex.species.get('goodrahisuialt').abilities.H, 'Shellbound Fury');
 });
 it('Gentle Embrace reduces only contact damage and cures status in rain', () => {
  const [p, foe] = start(mon('Goodra', 'Gentle Embrace'));
  assert.equal(battle.runEvent('ModifyDamage', foe, p, battle.dex.getActiveMove('tackle'), 1000), 800);
  assert.equal(battle.runEvent('ModifyDamage', foe, p, battle.dex.getActiveMove('watergun'), 1000), 1000);
  battle.field.setWeather('raindance'); p.setStatus('psn');
  battle.makeChoices('move splash', 'move splash'); assert.equal(p.status, '');
 });
 it('Shellbound Fury counts physical HP damage from foes once per turn', () => {
  const [p, foe] = start(mon('Goodra-Hisui', 'Shellbound Fury'), mon(), true);
  hit('tackle', p.side.active[1], p); hit('watergun', foe, p); assert.equal(p.boosts.spa, 0);
  p.addVolatile('substitute'); hit('tackle', foe, p); assert.equal(p.boosts.spa, 0);
  p.removeVolatile('substitute'); hit('tackle', foe, p, {multihit: 3});
  hit('tackle', foe.side.active[1], p); assert.equal(p.boosts.spa, 1);
  battle.turn++; hit('tackle', foe, p); assert.equal(p.boosts.spa, 2);
 });
 it('Shellbound Fury does not trigger on a knockout or under Gas', () => {
  const [p, foe] = start(mon('Goodra-Hisui', 'Shellbound Fury'), mon('Mew', 'Neutralizing Gas'));
  hit('tackle', foe, p); assert.equal(p.boosts.spa, 0);
  foe.setAbility('No Ability'); p.hp = 1;
  hit('tackle', foe, p); assert.equal(p.boosts.spa, 0);
 });
 for (const species of ['Armarouge', 'Ceruledge']) {
  it(species + ' reduces super-effective damage by 20%, not neutral damage', () => {
   const [p, foe] = start(mon(species));
   assert.deepEqual(p.getPassives(), ['soulforgedarmor']);
   const move = battle.dex.getActiveMove('watergun');
   p.getMoveHitData(move).typeMod = 1;
   assert.equal(battle.runEvent('ModifyDamage', foe, p, move, 1000), 800);
   p.getMoveHitData(move).typeMod = 2;
   assert.equal(battle.runEvent('ModifyDamage', foe, p, move, 1000), 800);
   p.getMoveHitData(move).typeMod = 0;
   assert.equal(battle.runEvent('ModifyDamage', foe, p, move, 1000), 1000);
  });
 }
 it('Mold Breaker bypasses Soulforged Armor on an actual attack', () => {
  const [p, foe] = start(mon('Armarouge'));
  hit('watergun', foe, p); const protectedDamage = p.maxhp - p.hp;
  p.hp = p.maxhp; foe.setAbility('Mold Breaker');
  hit('watergun', foe, p); assert(p.maxhp - p.hp > protectedDamage);
 });
});
