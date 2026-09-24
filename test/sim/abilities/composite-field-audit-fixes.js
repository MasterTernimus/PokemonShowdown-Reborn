'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
function setup(ability, foeAbility = 'No Ability', species = 'Mew', moves = ['splash']) {
 battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
  [{species, ability, moves}], [{species: 'Gardevoir', ability: foeAbility, moves: ['splash', 'earthquake', 'seismictoss']}],
 ]);
 battle.makeChoices('team 1', 'team 1');
 return battle.p1.active[0];
}
describe('Composite and field audit fixes', () => {
 afterEach(() => { battle?.destroy(); battle = null; });
 for (const ability of ['Perfect Foresight', 'Royal Voice']) {
  it(ability + ' inherits copied Void Veil Levitate and respects suppression', () => {
   const p = setup(ability, 'Void Veil');
   assert.equal(p.m.perfectForesightAbility, 'voidveil');
   assert(p.hasAbility('levitate')); assert(!p.isGrounded());
   const hp = p.hp;
   battle.makeChoices('move splash', 'move earthquake');
   assert.equal(p.hp, hp);
   p.addVolatile('gastroacid');
   assert(!p.hasAbility('levitate')); assert(p.isGrounded());
  });
 }
 it('resolves nested components of a copied composite', () => {
  const p = setup('Perfect Foresight', 'Toxic Armor');
  assert(p.hasAbility('poisonheal'));
  assert(p.hasAbility('dualwield'));
 });
 for (const field of ['watersurfaceterrain', 'underwaterterrain', 'midnightzoneterrain']) {
  it('Helios has Swift Swim exemption and double Speed in ' + field, () => {
   const p = setup('Helios', 'No Ability', 'Gyarados-Aevian-Mega');
   const speed = p.getStat('spe');
   assert(p.hasAbility('berserk')); assert(p.hasAbility('swiftswim')); assert(!p.hasAbility('multiscale'));
   battle.field.startTerrain(field);
   assert.equal(p.getStat('spe'), speed * 2);
  });
 }
 for (const endure of [true, false]) {
  it('Solar Trap retaliates only after a knockout; Endure=' + endure, () => {
   const p = setup('Solar Trap', 'No Ability', 'Victreebel-Mega', ['splash', 'endure']);
   const foe = battle.p2.active[0]; const hp = foe.hp; p.hp = 50;
   battle.makeChoices(endure ? 'move endure' : 'move splash', 'move seismictoss');
   assert.equal(p.hp, endure ? 1 : 0);
   assert.equal(hp - foe.hp, endure ? 0 : 50);
  });
 }
 for (const ability of ['Sirius', 'Whiplash']) {
  it(ability + ' grants one accuracy stage on entry', () => {
   const p = setup(ability);
   assert.equal(p.boosts.accuracy, 1);
   battle.makeChoices('move splash', 'move splash');
   assert.equal(p.boosts.accuracy, 1);
  });
 }
 for (let stage = 1; stage <= 5; stage++) {
  it('Mimicry is Grass on Flower Garden ' + stage, () => {
   const p = setup('Mimicry');
   battle.field.startTerrain('flowergarden' + stage);
   assert.deepEqual(p.getTypes(), ['Grass']);
  });
 }
 it('Mimicry remains Grass as Flower Garden grows', () => {
  const p = setup('Mimicry');
  battle.field.startTerrain('flowergarden1');
  for (let stage = 2; stage <= 5; stage++) {
   battle.field.growFlowerGarden(p, battle.dex.moves.get('growth'));
   assert.equal(battle.field.flowerGardenStage(), stage);
   assert.deepEqual(p.getTypes(), ['Grass']);
  }
 });
});
