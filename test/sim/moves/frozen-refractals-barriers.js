const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
describe('Frozen Refractals barriers', () => {
 for (const doubles of [false, true]) it(doubles ? 'doubles' : 'singles', () => {
  const mon = {species:'Mew', ability:'No Ability', moves:['frozenrefractals','splash','protect']};
  const team = [mon, mon];
  const battle = common.createBattle({formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame'}, [team, team]);
  try {
   if (battle.requestState === 'teampreview') battle.makeChoices('team 12','team 12');
   const p = battle.p1.active[0], q = battle.p2.active[0], side = p.side;
   const damage = spreadHit => battle.runEvent('ModifyDamage', q, p, Object.assign(Dex.getActiveMove('tackle'), {spreadHit}), 100);
   side.addSideCondition('mist', p);
   assert.equal(damage(false), 90);
   assert.equal(damage(true), 75);
   assert.equal(battle.runEvent('ModifyDamage', p, q, Dex.getActiveMove('tackle'), 100),100);
   side.removeSideCondition('mist');
   side.addSideCondition('safeguard', p);
   assert.equal(damage(false), 90);
   assert.equal(damage(true), 90);
   side.removeSideCondition('safeguard');
   q.addVolatile('protect', q);
   battle.actions.useMove('frozenrefractals', p, {target:q});
   for (const id of ['auroraveil', 'mist', 'safeguard']) assert(!side.getSideCondition(id), id);
   q.removeVolatile('protect');
   q.addVolatile('substitute', q);
   battle.actions.useMove('frozenrefractals', p, {target:q});
   assert(side.getSideCondition('auroraveil'));
   for (const id of ['mist', 'safeguard']) assert(!side.getSideCondition(id), id);
   side.sideConditions.auroraveil.duration = 1;
   q.removeVolatile('substitute');
   battle.actions.useMove('frozenrefractals', p, {target:q});
   for (const id of ['mist', 'safeguard']) assert(!side.getSideCondition(id), id);
   assert.equal(side.sideConditions.auroraveil.duration,1);
  } finally { battle.destroy(); }
 });
});
