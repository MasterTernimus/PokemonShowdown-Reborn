'use strict';
const assert = require('assert').strict;
const common = require('../../common');
describe('Fortress Shell in Electric Aura', () => {
 let battle;
 afterEach(() => battle?.destroy());
 function setup(aura = true) {
  const mon = ability => ({species: 'Mew', ability, moves: ['thunderbolt', 'discharge', 'splash']});
  battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [
   [mon('Fortress Shell'), mon('No Ability')], [mon('No Ability'), mon('No Ability')],
  ]);
  battle.makeChoices('team 12', 'team 12');
  battle.field.startTerrain('rockyterrain');
  if (aura) assert(battle.field.setAura('electricterrain', 5, battle.p1.active[0]));
  return [battle.p1.active[0], battle.p1.active[1], battle.p2.active[0]];
 }
 it('redirects from an ally, absorbs the move and boosts both offenses', () => {
  const [holder, ally, source] = setup();
  const before = [holder.hp, ally.hp];
  battle.actions.useMove('thunderbolt', source, {target: ally});
  assert.deepEqual([holder.hp, ally.hp], before);
  assert.equal(holder.boosts.atk, 1);
  assert.equal(holder.boosts.spa, 1);
  assert(battle.log.some(l => l.includes('|-activate|') && l.includes('ability: Fortress Shell')));
  assert.equal(holder.ability, 'fortressshell');
 });
 it('does not redirect without the aura on Rocky Terrain', () => {
  const [holder, ally, source] = setup(false);
  const before = ally.hp;
  battle.actions.useMove('thunderbolt', source, {target: ally});
  assert(ally.hp < before);
  assert.equal(holder.boosts.spa, 0);
 });
 it('loses the aura benefit immediately when it ends', () => {
  const [holder, , source] = setup();
  battle.field.clearAura();
  const before = holder.hp;
  battle.actions.useMove('thunderbolt', source, {target: holder});
  assert(holder.hp < before);
  assert.equal(holder.boosts.spa, 0);
 });
 it('absorbs its own spread-move hit without shielding its ally', () => {
  const [holder, ally, source] = setup();
  const before = [holder.hp, ally.hp];
  battle.actions.useMove('discharge', source);
  assert.equal(holder.hp, before[0]);
  assert(ally.hp < before[1]);
  assert.equal(holder.boosts.spa, 1);
 });
 it('respects ability suppression', () => {
  const [holder, ally, source] = setup();
  holder.addVolatile('gastroacid');
  const before = ally.hp;
  battle.actions.useMove('thunderbolt', source, {target: ally});
  assert(ally.hp < before);
  assert.equal(holder.boosts.spa, 0);
 });
 it('retains the existing Water Surface absorption without an aura', () => {
  const [holder, ally, source] = setup(false);
  battle.field.startTerrain('watersurfaceterrain');
  const before = ally.hp;
  battle.actions.useMove('thunderbolt', source, {target: ally});
  assert.equal(ally.hp, before);
  assert.equal(holder.boosts.spa, 1);
 });
});
