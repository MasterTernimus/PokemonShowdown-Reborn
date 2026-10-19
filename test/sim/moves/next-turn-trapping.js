'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
describe('Approved next-decision trapping',()=>{
 let b;afterEach(()=>{b?.destroy();b=null;});
 function setup(ability='No Ability',species='Mew',foe='Mew',item=''){
  const m={species:'Mew',ability:'No Ability',moves:['splash','ember','desertsmark','barbedweb','firespin','swarmsnare','doublehit','uturn']};
  b=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{...m,species,ability},m],[{...m,species:foe,item},m]]);
  b.makeChoices('team 12','team 12');b.randomChance=(n,d)=>n>=d;b.random=(a,z)=>z===undefined?0:a;
  for(const s of b.sides)for(const p of s.pokemon)p.hp=p.maxhp=p.baseMaxhp=4800;
  return[b.p1.active[0],b.p2.active[0]];
 }
 function turn(move='splash'){b.makeChoices('move '+move,'move splash');}
 function trapped(){return !!b.p2.activeRequest.active[0].trapped;}
 for(const move of ['desertsmark','barbedweb','swarmsnare']){
  it(move+' blocks N+1 and allows N+2',()=>{const[p,q]=setup(move==='ember'?'Infernal Dominion':'No Ability',move==='ember'?'Charizard':'Mew');
   // Remove the only sub-100% accuracy without altering the shared move.
   b.runEvent=((orig)=>function(event,...args){if(event==='Accuracy')return true;return orig.call(this,event,...args);})(b.runEvent);
   assert(!trapped());turn(move);assert.equal(b.turn,2);assert(trapped());assert.throws(()=>b.choose('p2','switch 2'),/trapped/);
   turn();assert.equal(b.turn,3);assert(!trapped());b.makeChoices('move splash','switch 2');assert.notEqual(b.p2.active[0],q);
  });
  it(move+' does not extend an existing bind and can reapply after expiry',()=>{const[p,q]=setup(move==='ember'?'Infernal Dominion':'No Ability');
   b.runEvent=((orig)=>function(event,...args){if(event==='Accuracy')return true;return orig.call(this,event,...args);})(b.runEvent);
   turn(move);turn(move);assert(!trapped());turn(move);assert(trapped());
  });
 }
 for(const move of ['desertsmark','barbedweb','swarmsnare']) {
  it(move+' overrides Grip Claw and releases when source leaves',()=>{const[p,q]=setup();p.setItem('Grip Claw');b.actions.runMove(Object.assign(Dex.getActiveMove(move),{accuracy:true}),p,p.getLocOf(q));assert.equal(q.volatiles.partiallytrapped.duration,2);b.makeChoices('switch 2','move splash');assert(!q.volatiles.partiallytrapped);});
  it(move+' does not steal or shorten another binding',()=>{const[p,q]=setup();q.addVolatile('partiallytrapped',q,Dex.getActiveMove('firespin'));const state=q.volatiles.partiallytrapped,duration=state.duration;b.actions.runMove(Object.assign(Dex.getActiveMove(move),{accuracy:true}),p,p.getLocOf(q));assert.equal(q.volatiles.partiallytrapped,state);assert.equal(state.source,q);assert.equal(state.duration,duration);});
 }
 it('ordinary Fire Spin keeps its normal duration',()=>{const[p,q]=setup();b.actions.runMove(Object.assign(Dex.getActiveMove('firespin'),{accuracy:true}),p,p.getLocOf(q));turn();turn();assert(trapped());});
 it('Void Hex already refreshes only through the next decision',()=>{setup('Void Hex','Mismagius');turn('doublehit');assert(trapped());turn('doublehit');assert(trapped());turn();assert(!trapped());});
});
