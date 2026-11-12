'use strict';
const assert=require('assert').strict;
const common=require('../../common');
let battle;
function setup(ffa, stage) {
 const mon=()=>({species:'Mew',ability:'No Ability',moves:['petaldance','splash']});
 battle=common.createBattle({formatid:ffa?'gen9freeforall4pmistyfieldadrienn':'gen9nofielddoublesbattle'},ffa?[[mon()],[mon()],[mon()],[mon()]]:[[mon(),mon()],[mon(),mon()]]);
 battle.makeChoices(...(ffa?['team 1','team 1','team 1','team 1']:['team 12','team 12']));
 battle.field.startTerrain('flowergarden'+stage);
 for(const p of battle.getAllActive()) {p.storedStats.spd=1000;p.storedStats.spe=p===battle.p1.active[0]?300:100;}
 battle.onEvent('Accuracy',battle.format,()=>true);
 battle.makeRequest('move');return battle.p1.active[0];
}
function turn(ffa, command) {battle.makeChoices(...(ffa?[command,'move splash','move splash','move splash']:[command+', move splash','move splash, move splash']));}
describe('Petal Dance targeting',()=>{
 afterEach(()=>battle?.destroy());
 for(const ffa of [false,true]) {
  it('Stage 5 hits every opponent, protects allies, and keeps spread targeting while locked, FFA='+ffa,()=>{
   const p=setup(ffa,5),foes=battle.getAllActive().filter(q=>!p.isAlly(q));
   assert.equal(p.getMoves().find(m=>m.id==='petaldance').target,'allAdjacentFoes');
   const pp=p.moveSlots[0].pp;turn(ffa,'move petaldance');
   assert(p.volatiles.lockedmove);assert.equal(p.moveSlots[0].pp,pp-1);
   assert.equal(p.getMoves(p.getLockedMove())[0].target,'allAdjacentFoes');
   for(const q of foes)assert(q.hp<q.maxhp);
   const hp=foes.map(q=>q.hp);turn(ffa,'move 1');
   foes.forEach((q,i)=>assert(q.hp<hp[i]));assert.equal(p.moveSlots[0].pp,pp-1);
   if(!ffa)assert.equal(battle.p1.active[1].hp,battle.p1.active[1].maxhp);
  });
  it('Stage 4 keeps the initial chosen target, FFA='+ffa,()=>{
   const p=setup(ffa,4),foes=battle.getAllActive().filter(q=>!p.isAlly(q));
   assert.equal(p.getMoves().find(m=>m.id==='petaldance').target,'adjacentFoe');
   const selected=foes[0];turn(ffa,'move petaldance '+p.getLocOf(selected));
   assert(selected.hp<selected.maxhp);for(const q of foes.slice(1))assert.equal(q.hp,q.maxhp);
   if(!ffa)assert.equal(battle.p1.active[1].hp,battle.p1.active[1].maxhp);
  });
  it('shrinking the garden restores single-target locked turns, FFA='+ffa,()=>{
   const p=setup(ffa,5);turn(ffa,'move petaldance');
   battle.field.changeTerrain('flowergarden4',p,null,true);battle.makeRequest('move');
   assert.equal(p.getMoves(p.getLockedMove())[0].target,'randomNormal');
   const foes=battle.getAllActive().filter(q=>!p.isAlly(q)),hp=foes.map(q=>q.hp);
   turn(ffa,'move 1');assert.equal(foes.filter((q,i)=>q.hp<hp[i]).length,1);
  });
 }
});
