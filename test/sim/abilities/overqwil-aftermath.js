'use strict';
const assert = require('assert').strict, common = require('../../common'), {Dex} = require('../../../dist/sim');
let battle;
describe('Overqwil approved Aftermath passive', () => {
 afterEach(() => { battle?.destroy(); battle = null; });
 it('replaces only its passive and preserves all selected slots', () => {
  const s = Dex.species.get('overqwil');
  assert.deepEqual(s.passives, ['aftermath']);
  assert.deepEqual(s.abilities, {0: 'Sea Fiend', 1: 'Swift Venom', H: 'Intimidate'});
 });
 for (const mode of ['normal', 'mist', 'noncontact', 'damp', 'suppressed', 'copied']) it('full Aftermath behavior: ' + mode, () => {
  const set = (species, ability) => ({species, ability, moves: ['tackle', 'swift', 'splash']});
  battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[set('Overqwil', 'Swift Venom'), set('Mew', 'No Ability')], [set('Mew', mode === 'damp' ? 'Damp' : 'No Ability')]]);
  battle.makeChoices('team 12', 'team 1');
  const p = battle.p1.active[0], q = battle.p2.active[0];
  p.hp = 1; q.hp = q.maxhp = q.baseMaxhp = 400;
  if (mode === 'mist') battle.field.startTerrain('corrosivemistterrain');
  if (mode === 'suppressed') p.addVolatile('gastroacid', q);
  if (mode === 'copied') p.setAbility('aftermath');
  const move = Object.assign(Dex.getActiveMove(mode === 'noncontact' ? 'swift' : 'tackle'), {damage: 10, accuracy: true, willCrit: false});
  battle.actions.useMove(move, q, {target: p});
  assert.equal(p.hp, 0);
  assert.equal(q.hp, mode === 'mist' ? 200 : ['noncontact', 'damp'].includes(mode) ? 400 : 300);
  assert.equal(q.status, '');
 });
});
