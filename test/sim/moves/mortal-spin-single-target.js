'use strict';
const assert = require('assert').strict;
const common = require('../../common');
describe('Single-target Mortal Spin', () => {
 let battle;
 afterEach(() => battle?.destroy());
 function setup() {
  battle = common.createBattle({formatid:'gen9nofielddoublesbattle'}, [
   [{species:'Glimmora', ability:'No Ability', moves:['mortalspin']}, {species:'Chansey', ability:'No Ability', moves:['splash']}],
   [{species:'Chansey', ability:'No Ability', moves:['splash','protect']}, {species:'Blissey', ability:'No Ability', moves:['splash']}],
  ]);
  battle.makeChoices('team 12','team 12');
  const p=battle.p1.active[0], q=battle.p2.active[0], other=battle.p2.active[1];
  for (const mon of battle.getAllActive()) mon.getPassives=()=>[];
  p.side.addSideCondition('spikes',q);
  return [p,q,other];
 }
 for (const slot of [1,2]) it('accepts target '+slot+' and affects only that opponent', () => {
  const [p,q,other]=setup(), hp=[q.hp,other.hp];
  assert.equal(battle.getRequests('move')[0].active[0].moves[0].target,'normal');
  battle.makeChoices('move 1 '+slot+', move splash','move splash, move splash');
  const chosen=slot===1?q:other, untouched=slot===1?other:q;
  assert(chosen.hp<hp[slot-1]); assert.equal(chosen.status,'psn');
  assert.equal(untouched.hp,hp[slot===1?1:0]); assert.equal(untouched.status,'');
  assert(!p.side.sideConditions.spikes);
 });
 for (const block of ['protect','immune']) it(block+' prevents poison, damage and hazard clearing', () => {
  const [p,q,other]=setup(),hp=[q.hp,other.hp];
  if(block==='immune')q.setType('Steel');
  battle.makeChoices('move 1 1, move splash',(block==='protect'?'move protect':'move splash')+', move splash');
  assert.equal(q.hp,hp[0]);assert.equal(other.hp,hp[1]);assert.equal(q.status,'');assert.equal(other.status,'');
  assert(p.side.sideConditions.spikes);
 });
});
