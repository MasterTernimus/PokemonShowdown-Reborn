'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim/dex');
const mon = (species = 'Mew', ability = 'No Ability', item = '') => ({species, ability, item, moves: ['splash', 'watergun', 'bulletseed', 'gastroacid']});
describe('Approved field setter reductions', () => {
 let battle;
 afterEach(() => { battle?.destroy(); battle = null; });
 function start(holder = mon(), doubles = false, foes) {
  const teams = [[holder, mon(), mon(), mon()], foes || [mon(), mon(), mon()]];
  battle = common.createBattle({formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame'}, teams);
  battle.makeChoices(...teams.map(t => 'team ' + t.map((_,i) => i + 1).join('')));
  battle.randomChance = (n,d) => n >= d; battle.randomizer = n => n;
  return [battle.p1.active[0], battle.p2.active[0]];
 }
 function hit(source, target, extra = {}) {
  const move = battle.dex.getActiveMove('watergun');
  Object.assign(move, {basePower: 5, accuracy: true, willCrit: false, secondaries: undefined}, extra);
  battle.actions.useMove(move, source, {target});
  battle.runEvent('AfterMove', source, target, battle.activeMove);
 }
 function faint(p) { p.faint(); battle.faintMessages(); }
 function enter(reserve, position = 0) { battle.actions.switchIn(reserve, position); battle.actions.runSwitch(reserve); }
 it('gives only base Banette the new full Cursed Body + Frisk passive', () => {
  const [p, foe] = start(mon('Banette', 'Cursed Doll'), false, [mon('Mew', 'No Ability', 'Leftovers'), mon()]);
  assert.deepEqual(p.getPassives(), ['tatteredmemory']);
  assert(p.hasAbilityOrPassive('cursedbody')); assert(p.hasAbilityOrPassive('frisk'));
  assert.equal(battle.log.filter(x => x.startsWith('|-item|') && x.includes('Leftovers')).length, 1);
  battle.randomChance = () => true;
  battle.makeChoices('move splash', 'move watergun'); assert(foe.volatiles.disable);
  faint(p); assert(foe.volatiles.curse); assert.equal(battle.field.terrain, '');
  assert.deepEqual(Dex.species.get('banettemega').passives, ['prankster']);
  assert.deepEqual(Dex.species.get('banettemegaz').passives, ['frisk']);
 });
 it('does not double Frisk or Cursed Body when selected with the passive', () => {
  const [p, foe] = start(mon('Banette', 'Frisk'), false, [mon('Mew', 'No Ability', 'Leftovers'), mon()]);
  assert.equal(battle.log.filter(x => x.startsWith('|-item|') && x.includes('Leftovers')).length, 1);
  p.setAbility('Cursed Body'); let rolls = 0;
  battle.randomChance = (n,d) => { if(n===3 && d===10) rolls++; return n>=d; };
  battle.makeChoices('move splash', 'move watergun'); assert.equal(rolls, 1, battle.log.join('\n'));
 });
 it('Cursed Doll boosts once after surviving an opposing attack at half HP, with no field', () => {
  const [p, foe] = start(mon('Banette', 'Cursed Doll'));
  p.hp = Math.floor(p.maxhp / 2); hit(foe, p, {multihit:3}); assert.equal(p.boosts.atk, 1);
  hit(foe, p); assert.equal(p.boosts.atk, 1); assert.equal(battle.field.terrain, '');
  p.setAbility('No Ability'); p.setAbility('Cursed Doll'); hit(foe, p); assert.equal(p.boosts.atk, 1);
  const reserve = p.side.pokemon.find(x => !x.isActive); enter(reserve); enter(p);
  p.hp = Math.floor(p.maxhp / 2); hit(foe, p); assert.equal(p.boosts.atk, 0);
 });
 it('Cursed Doll does not reward an ally hit, Substitute, a multihit KO, or suppression', () => {
  const [p, foe] = start(mon('Banette', 'Cursed Doll'), true);
  p.hp = Math.floor(p.maxhp / 2); hit(p.side.active[1], p); assert.equal(p.boosts.atk, 0);
  p.addVolatile('substitute'); hit(foe,p); assert.equal(p.boosts.atk, 0); p.removeVolatile('substitute');
  p.addVolatile('gastroacid', foe); hit(foe,p); assert.equal(p.boosts.atk, 0); p.removeVolatile('gastroacid');
  p.hp = 15; hit(foe,p,{multihit:5}); assert.equal(p.hp,0); assert.equal(p.boosts.atk,0);
 });
 it('Cursed Doll retains its contact boost and local Shadow Shield', () => {
  const [p, foe] = start(mon('Banette', 'Cursed Doll'));
  assert.equal(battle.runEvent('BasePower',p,foe,battle.dex.getActiveMove('tackle'),100,true),130);
  const move = battle.dex.getActiveMove('watergun');
  p.getMoveHitData(move).typeMod = 0;
  assert.equal(battle.runEvent('ModifyDamage',foe,p,move,1000),800);
  p.getMoveHitData(move).typeMod = 1;
  assert.equal(battle.runEvent('ModifyDamage',foe,p,move,1000),600);
 });
 it('Requiem no longer creates Haunted and Pressure grants no hazard protection', () => {
  const [p, foe] = start(mon('Dusknoir', 'Requiem'));
  p.side.addSideCondition('stealthrock', foe); faint(p); assert.equal(battle.field.terrain,'');
  const reserve = p.side.pokemon.find(x=>!x.isActive && x.hp), hp=reserve.hp; enter(reserve);
  assert(reserve.hp<hp); assert(p.side.sideConditions.stealthrock);
 });
 for(const species of ['Floette-Eternal','Floette-Mega']) it(species + ' heals only its immediate replacement after hazards', () => {
  const [p,foe]=start(mon(species));
  const reserve=p.side.pokemon.find(x=>!x.isActive); reserve.hp-=150; const hp=reserve.hp;
  p.side.addSideCondition('stealthrock',foe); faint(p); assert.equal(battle.field.terrain,''); enter(reserve);
  assert.equal(reserve.hp,hp-Math.floor(reserve.maxhp/8)+Math.round(reserve.maxhp/4));
  assert(!p.side.slotConditions[0].lastbloom);
 });
 it('Last Bloom is consumed on an entry KO and cannot heal the following replacement', () => {
  const [p,foe]=start(mon('Floette-Eternal')); const reserves=p.side.pokemon.filter(x=>!x.isActive);
  reserves[0].hp=1; reserves[1].hp-=150; const hp=reserves[1].hp;
  p.side.addSideCondition('stealthrock',foe); faint(p); enter(reserves[0]); assert.equal(reserves[0].hp,0);
  battle.faintMessages(); enter(reserves[1]); assert.equal(reserves[1].hp,hp-Math.floor(reserves[1].maxhp/8));
 });
 it('Last Bloom is consumed at full HP and is not reset by revival', () => {
  const [p]=start(mon('Floette-Eternal')); const reserve=p.side.pokemon.find(x=>!x.isActive); faint(p); enter(reserve);
  assert.equal(reserve.hp,reserve.maxhp); assert(!p.side.slotConditions[0].lastbloom);
  p.hp=p.maxhp; p.fainted=false; enter(p); faint(p); assert(!p.side.slotConditions[0].lastbloom);
 });
 it('faint gifts do not activate on a manual switch or when no reserve exists', () => {
  const [p]=start(mon('Floette-Eternal')); const reserve=p.side.pokemon.find(x=>!x.isActive); reserve.hp-=150;
  const hp=reserve.hp; enter(reserve); assert.equal(reserve.hp,hp);
  enter(p); for(const ally of p.side.pokemon) if(ally!==p){ally.hp=0;ally.fainted=true;}
  faint(p); assert(!p.side.slotConditions[0].lastbloom);
 });
 it('Tyrant Domain grants +1 Attack to the same-slot replacement only, once per battle', () => {
  const [p]=start(mon('Tyrantrum-Mega','Tyrant Domain'),true); const ally=p.side.active[1]; faint(p);
  assert.equal(battle.field.terrain,''); assert.equal(ally.boosts.atk,0);
  const reserve=p.side.pokemon.find(x=>!x.isActive&&x.hp); enter(reserve); assert.equal(reserve.boosts.atk,1);
  p.hp=p.maxhp;p.fainted=false;enter(p);faint(p);assert(!p.side.slotConditions[0].tyrantlegacy);
 });
 it('Aurora Domain retains five-turn Aurora Veil without changing the field', () => {
  const [p]=start(mon('Aurorus-Mega','Aurora Domain')); battle.field.setTerrain('electricterrain',p); faint(p);
  assert.equal(battle.field.terrain,'electricterrain'); assert.equal(p.side.sideConditions.auroraveil.duration,5);
 });
 it('Dune Terror retains sand but does not create Desert on fainting', () => {
  const [p]=start(mon('Sandaconda-Gmax','Dune Terror')); assert.equal(battle.field.weather,'sandstorm'); faint(p);
  assert.equal(battle.field.terrain,'');
 });
 it('Inversion sets five turns once and cannot refresh through switching or ability changes', () => {
  const [p]=start(mon('Malamar-Mega','Inversion')); assert.equal(battle.field.terrain,'inverseterrain');
  assert.equal(battle.field.terrainState.duration,5); battle.field.setTerrainDuration(2);
  p.setAbility('No Ability');p.setAbility('Inversion');assert.equal(battle.field.terrainState.duration,2);
  const reserve=p.side.pokemon.find(x=>!x.isActive);enter(reserve);enter(p);assert.equal(battle.field.terrainState.duration,2);
 });
 it('retains the later approved curse and Aura reworks without restoring faint-triggered fields', () => {
  for(const id of ['cursedkeepsake','cursedmarionette','reapersgrip']) assert.equal(Dex.abilities.get(id).onFaint, undefined);
  assert(Dex.abilities.get('reapersgrip').onSourceAfterFaint);
  assert(Dex.abilities.get('bewitchingmajesty').onAfterMove);
 });
});
