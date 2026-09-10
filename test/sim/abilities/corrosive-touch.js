'use strict';
const assert = require('../../assert');
const common = require('../../common');
let battle;
describe('Corrosive Touch', function () {
 afterEach(() => battle?.destroy());
 function start(foe = 'Registeel') {
  battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
   [{species: 'Breloom', item: 'Breloomite', ability: 'Technician', moves: ['splash', 'machpunch', 'bulletseed', 'toxic']}],
   [{species: foe, ability: 'Run Away', moves: ['splash']}],
  ]);
  battle.makeChoices('team 1', 'team 1');
  assert.deepEqual(battle.p1.active[0].species.baseStats, {hp:80,atk:130,def:80,spa:60,spd:80,spe:70});
  battle.makeChoices('move splash mega', 'move splash');
  return [battle.p1.active[0], battle.p2.active[0]];
 }
 it('Mega Evolves, applies Technician, and grants Grass STAB without changing typing', function () {
  const [mon, foe] = start();
  assert.equal(mon.species.name, 'Breloom-Mega');
  assert.deepEqual(mon.species.baseStats, {hp:80,atk:160,def:90,spa:55,spd:105,spe:110});
  assert.deepEqual(mon.getTypes(), ['Poison', 'Fighting']);
  assert.equal(mon.ability, 'corrosivetouch');
  const move = battle.dex.getActiveMove('bulletseed');
  assert.equal(battle.runEvent('BasePower', mon, foe, move, 40), 60);
  assert.equal(battle.runEvent('BasePower', mon, foe, move, 80), 80);
  assert.equal(battle.runEvent('ModifySTAB', mon, foe, move, 1), 1.5);
  assert.equal(battle.runEvent('ModifySTAB', mon, foe, move, 1.5), 1.5);
 });
 for (const foeSpecies of ['Registeel', 'Muk']) {
  it('poisons ' + foeSpecies + ' through Corrosion and applies its defensive drops', function () {
   const [mon, foe] = start(foeSpecies);
   battle.makeChoices('move toxic', 'move splash');
   assert.equal(foe.status, 'tox');
   assert.statStage(foe, 'def', -1);
   assert.statStage(foe, 'spd', -1);
  });
 }
 it('uses Poison Touch contact chance while respecting Covert Cloak', function () {
  const [mon, foe] = start();
  battle.randomChance = (a, b) => { assert.equal(a, 3); assert.equal(b, 10); return true; };
  const hit = () => battle.singleEvent('SourceDamagingHit', mon.getAbility(), mon.abilityState, foe, mon, battle.dex.getActiveMove('machpunch'), 10);
  foe.setItem('covertcloak'); hit(); assert.equal(foe.status, '');
  foe.clearItem(); hit(); assert.equal(foe.status, 'psn');
 });
});
