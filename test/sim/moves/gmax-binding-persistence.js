'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
let battle;
function setup(item = '') {
 const set = (species, item = '') => ({species, item, ability: 'No Ability', moves: ['splash', 'firespin']});
 battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [
  [set('Mew', item), set('Mew'), set('Mew')], [set('Mew'), set('Mew')],
 ]);
 battle.makeChoices('team 123', 'team 12');
 for (const p of battle.getAllActive()) p.hp = p.maxhp = p.baseMaxhp = 2400;
 battle.field.terrain = '';
 return [battle.p1.active[0], ...battle.p2.active];
}
function bind(source, target, move) {
 assert(target.addVolatile('partiallytrapped', source, Dex.getActiveMove(move)));
}
function residual(target) {
 battle.singleEvent('Residual', Dex.conditions.get('partiallytrapped'), target.volatiles.partiallytrapped, target);
}
describe('G-Max binding persistence and self-effect audit', () => {
 afterEach(() => { battle?.destroy(); battle = null; });
 for (const move of ['gmaxcentiferno', 'gmaxsandblast', 'firespin']) {
  for (const departure of ['switch', 'faint']) {
   it(`${move} ${departure}: only G-Max binding persists`, () => {
    const [source, target] = setup();
    source.activeTurns = 1;
    bind(source, target, move);
    if (departure === 'switch') battle.actions.switchIn(battle.p1.pokemon[2], 0);
    else { source.faint(); battle.faintMessages(); }
    const hp = target.hp;
    residual(target);
    const persists = move !== 'firespin';
    assert.equal(!!target.volatiles.partiallytrapped, persists);
    assert.equal(target.hp, hp - (persists ? 300 : 0));
    if (persists) {
     target.trapped = false;
     battle.singleEvent('TrapPokemon', Dex.conditions.get('partiallytrapped'), target.volatiles.partiallytrapped, target);
     assert(target.trapped);
    }
   });
  }
  for (const item of ['', 'Binding Band', 'Grip Claw']) {
   it(`${move} preserves ${item || 'ordinary'} divisor and duration`, () => {
    const [source, target] = setup(item);
    source.activeTurns = 1;
    bind(source, target, move);
    const state = target.volatiles.partiallytrapped;
    assert.equal(state.boundDivisor, item === 'Binding Band' ? 6 : 8);
    if (item === 'Grip Claw') assert.equal(state.duration, 8);
    else assert([5, 6].includes(state.duration));
    residual(target);
    assert.equal(target.hp, 2400 - (item === 'Binding Band' ? 400 : 300));
   });
  }
 }
 for (const protection of ['none', 'protect', 'maxguard', 'substitute', 'flashfire']) {
  it(`Centiferno targeted ${protection}: observes all-foe self effect`, () => {
   const [source, target, other] = setup();
   if (protection === 'flashfire') target.setAbility('Flash Fire');
   else if (protection !== 'none') target.addVolatile(protection);
   // Real Max-move pipeline with its original self callback; fixed damage isolates the binding effect.
   const move = Object.assign(Dex.getActiveMove('gmaxcentiferno'), {damage: 100, willCrit: false});
   battle.actions.useMove(move, source, {target});
   const succeeds = !['maxguard', 'flashfire'].includes(protection);
   assert.equal(!!target.volatiles.partiallytrapped, succeeds);
   assert.equal(!!other.volatiles.partiallytrapped, succeeds);
  });
 }
 it('Centiferno self effect includes an untargeted protected, Fire-immune foe', () => {
  const [source, target, other] = setup();
  other.setAbility('Flash Fire');
  other.addVolatile('protect');
  battle.actions.useMove(Object.assign(Dex.getActiveMove('gmaxcentiferno'), {damage: 100}), source, {target});
  assert(target.volatiles.partiallytrapped);
  assert(other.volatiles.partiallytrapped);
 });
});
