'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim/dex');
const hazards = ['spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge', 'dragonrend'];
const mon = (species = 'Mew', ability = 'No Ability', item = '') => ({species, ability, item, moves: ['dragonclaw', 'earthquake', 'splash', 'protect']});

describe('Mega Garchomp: Dune Carver', () => {
 let battle;
 afterEach(() => { battle?.destroy(); battle = null; });
 function start(holder = mon('Garchomp-Mega', 'Dune Carver'), opponent = mon(), format = 'singles') {
  const formats = {singles: 'gen9nofieldsinglesgame', doubles: 'gen9nofielddoublesbattle', ffa: 'gen9freeforall4pmistyfieldadrienn'};
  const teams = format === 'ffa' ? [[holder], [opponent], [mon()], [mon()]] :
   format === 'doubles' ? [[holder, mon()], [opponent, mon()]] : [[holder], [opponent]];
  battle = common.createBattle({formatid: formats[format]}, teams);
  battle.makeChoices(...teams.map(t => t.length === 2 ? 'team 12' : 'team 1'));
  battle.randomChance = (n, d) => n >= d; battle.randomizer = n => n;
  return [battle.p1.active[0], battle.p2.active[0]];
 }
 function hit(source, target, id = 'dragonclaw', extra = {}) {
  const move = battle.dex.getActiveMove(id);
  Object.assign(move, {accuracy: true, willCrit: false, basePower: 20, secondaries: undefined}, extra);
  battle.actions.useMove(move, source, {target});
  return battle.activeMove;
 }
 function seed(p, foe) {
  for (const id of hazards) assert(p.side.addSideCondition(id, foe), id);
 }
 it('installs the approved stats, ability and passive without changing the other forms', () => {
  const mega = Dex.species.get('garchompmega');
  assert.deepEqual(mega.baseStats, {hp:108, atk:145, def:120, spa:115, spd:115, spe:97});
  assert.equal(mega.bst, 700); assert.deepEqual(mega.abilities, {0:'Dune Carver'});
  assert.deepEqual(mega.passives, ['sharpness']); assert.equal(mega.requiredItem, 'Garchompite');
  assert.deepEqual(Dex.species.get('garchomp').baseStats, {hp:108, atk:130, def:95, spa:80, spd:85, spe:102});
  assert.deepEqual(Dex.species.get('garchomp').passives, ['serratedscales']);
  const z = Dex.species.get('garchompmegaz');
  assert.deepEqual(z.baseStats, {hp:108, atk:130, def:85, spa:141, spd:85, spe:151});
  assert.deepEqual(z.abilities, {0:'Relentless Hunt'}); assert.deepEqual(z.passives, ['levitate']);
  assert.equal(Dex.species.get('garchompbattlebond').baseStats.spe, 112);
 });
 it('acquires the kit through an actual Mega Evolution', () => {
  const [p, foe] = start(mon('Garchomp', 'Grounded Instinct', 'Garchompite'));
  battle.makeChoices('move dragonclaw mega', 'move splash');
  assert.equal(p.species.id, 'garchompmega'); assert.equal(p.ability, 'dunecarver');
  assert.deepEqual(p.getPassives(), ['sharpness']); assert.equal(battle.field.weather, '');
  assert.equal(battle.runEvent('BasePower', p, foe, battle.dex.getActiveMove('dragonclaw'), 100, true), 150);
 });
 it('reduces physical attack damage by 20%, while leaving special damage unchanged', () => {
  const [p, foe] = start();
  for (const [move, expected] of [['tackle',800], ['earthquake',800], ['watergun',1000]]) {
   assert.equal(battle.runEvent('ModifyDamage', foe, p, battle.dex.getActiveMove(move), 1000), expected);
  }
  const physical = battle.dex.getActiveMove('watergun'); physical.category = 'Physical';
  assert.equal(battle.runEvent('ModifyDamage', foe, p, physical, 1000), 800);
 });
 for (const format of ['singles', 'doubles', 'ffa']) it('clears only its own hazards in ' + format, () => {
  const [p, foe] = start(undefined, undefined, format);
  seed(p, foe); seed(foe, p); p.side.addSideCondition('reflect', p);
  const ally = p.side.active[1], hp = ally?.hp;
  const move = hit(p, foe);
  for (const id of hazards) { assert(!p.side.sideConditions[id], id); assert(foe.side.sideConditions[id], id); }
  assert(p.side.sideConditions.reflect); assert.equal(p.boosts.spe, 0);
  assert.equal(ally?.hp, hp); assert.equal(move.multihit, undefined);
  assert.equal(battle.log.filter(line => line.includes('|-sideend|p1:') && line.includes('Dune Carver')).length, hazards.length);
 });
 for (const breakSub of [false, true]) it('clears hazards when a slicing hit ' + (breakSub ? 'breaks' : 'hits') + ' Substitute', () => {
  const [p, foe] = start(); seed(p, foe); foe.addVolatile('substitute');
  if (breakSub) foe.volatiles.substitute.hp = 1;
  const hp = foe.hp; hit(p, foe); assert.equal(foe.hp, hp);
  assert.equal(!!foe.volatiles.substitute, !breakSub);
  for (const id of hazards) assert(!p.side.sideConditions[id]);
 });
 it('does not clear hazards on Protect, a miss, immunity, or a nonslicing hit', () => {
  const [p, foe] = start(); seed(p, foe);
  foe.addVolatile('protect'); hit(p, foe); assert(p.side.sideConditions.spikes);
  foe.removeVolatile('protect'); hit(p, foe, 'dragonclaw', {accuracy: 0}); assert(p.side.sideConditions.spikes);
  foe.setType('Fairy'); hit(p, foe); assert(p.side.sideConditions.spikes);
  hit(p, foe, 'tackle'); assert(p.side.sideConditions.spikes);
 });
 it('clears hazards on a KO and can clear newly placed hazards again', () => {
  const [p, foe] = start(); seed(p, foe); hit(p, foe);
  seed(p, foe); foe.hp = 1; hit(p, foe);
  for (const id of hazards) assert(!p.side.sideConditions[id]);
  assert.equal(p.boosts.atk, 0);
 });
 it('does not clear Leech Seed, trapping, fields or weather', () => {
  const [p, foe] = start(); seed(p, foe);
  p.addVolatile('leechseed', foe); p.addVolatile('partiallytrapped', foe, battle.dex.moves.get('wrap'));
  battle.field.setWeather('sunnyday'); battle.field.setTerrain('electricterrain', p); hit(p, foe);
  assert(p.volatiles.leechseed); assert(p.volatiles.partiallytrapped);
  assert.equal(battle.field.weather, 'sunnyday'); assert.equal(battle.field.terrain, 'electricterrain');
 });
 it('Gas suppresses Dune Carver but retains the existing Sharpness passive rules', () => {
  const [p, foe] = start(undefined, mon('Mew', 'Neutralizing Gas')); seed(p, foe);
  assert.equal(battle.runEvent('ModifyDamage', foe, p, battle.dex.getActiveMove('tackle'), 1000), 1000);
  hit(p, foe); assert(p.side.sideConditions.spikes);
  assert.equal(battle.runEvent('BasePower', p, foe, battle.dex.getActiveMove('dragonclaw'), 100, true), 150);
 });
 it('Gastro Acid suppresses both Dune Carver effects', () => {
  const [p, foe] = start(); seed(p, foe); hit(foe, p, 'gastroacid');
  assert(p.volatiles.gastroacid); hit(p, foe); assert(p.side.sideConditions.spikes);
  assert.equal(battle.runEvent('ModifyDamage', foe, p, battle.dex.getActiveMove('tackle'), 1000), 1000);
 });
 it('Mold Breaker bypasses its physical damage reduction', () => {
  const [p, foe] = start(); hit(foe, p, 'tackle'); const reduced = p.maxhp - p.hp;
  p.hp = p.maxhp; foe.setAbility('Mold Breaker'); hit(foe, p, 'tackle');
  assert(p.maxhp - p.hp > reduced);
 });
 it('does not reduce fixed damage or residual damage', () => {
  const [p, foe] = start(); let hp = p.hp;
  hit(foe, p, 'seismictoss'); assert.equal(hp - p.hp, foe.level);
  hp = p.hp; battle.damage(30, p, foe, battle.dex.conditions.get('brn')); assert.equal(hp - p.hp, 30);
 });
});
