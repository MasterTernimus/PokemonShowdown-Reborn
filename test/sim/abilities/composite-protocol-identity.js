'use strict';
const assert=require('assert').strict;
const common=require('../../common');
describe('Composite protocol identity',()=>{
 let battle;afterEach(()=>battle?.destroy());
 for(const ability of ['Undertow','Reservoir','Zen'])for(const injured of [false,true])it(ability+' keeps its identity on Water absorption '+injured,()=>{
  battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Mew',ability,moves:['splash']}],[{species:'Mew',ability:'No Ability',moves:['watergun']}]]);
  battle.makeChoices('team 1','team 1');const holder=battle.p1.active[0];if(injured)holder.hp=Math.floor(holder.maxhp/2);
  const before=holder.hp;battle.makeChoices('move splash','move watergun');
  assert(holder.hp>=before);assert.equal(holder.getAbility().name,ability);
  const events=battle.log.filter(x=>/\|-(immune|heal)\|p1a:/.test(x));
  assert(events.some(x=>x.includes('ability: '+ability)),events.join('\n'));
  assert(!events.some(x=>x.includes('ability: Water Absorb')),events.join('\n'));
 });
});
