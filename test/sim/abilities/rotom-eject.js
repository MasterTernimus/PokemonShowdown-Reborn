'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
describe('Rotom protected Eject',()=>{let b;afterEach(()=>b?.destroy());
 for(const pressure of [false,true])it('uses the selected duplicate Hex PP slot, Pressure='+pressure+', and keeps spent PP after switching',()=>{
  b=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Rotom-Heat',ability:'Eject',moves:['flamethrower','overheat','splash']},{species:'Mew',ability:'No Ability',moves:['splash']}],[{species:'Mew',ability:pressure?'Pressure':'No Ability',moves:['splash']}]]);b.makeChoices('team 12','team 1');
  const p=b.p1.active[0],q=b.p2.active[0];p.moveSlots[0].pp=0;p.moveSlots[1].pp=2;p.faint(q,Dex.moves.get('tackle'));b.runAction({choice:'residual'});b.makeRequest('move');
  assert.deepEqual(p.moveSlots.slice(0,2).map(s=>[s.id,s.pp]),[['hex',0],['hex',2]]);
  const hp=q.hp;b.choose('p1','move 2');assert.equal(b.p1.getChoice(),'move 2');b.choose('p2','move 1');assert(q.hp<hp);assert.equal(p.moveSlots[0].pp,0);assert.equal(p.moveSlots[1].pp,pressure?0:1);assert(!b.log.some(l=>l.includes('|cant|')&&l.includes('|nopp|')));
  b.makeChoices('switch 2','move 1');b.makeChoices('switch 2','move 1');assert.equal(p.moveSlots[1].pp,pressure?0:1);
 });
 for(const remaining of [0,8,20,24])it('preserves remaining PP capped at Hex maximum: '+remaining,()=>{
  b=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Rotom-Heat',ability:'Eject',moves:['flamethrower','splash']}],[{species:'Mew',ability:'No Ability',moves:['splash']}]]);b.makeChoices('team 1','team 1');
  const p=b.p1.active[0];p.moveSlots[0].pp=remaining;assert.equal(p.moveSlots[0].maxpp,24);p.faint(b.p2.active[0],Dex.moves.get('tackle'));b.runAction({choice:'residual'});
  assert.equal(p.moveSlots[0].id,'hex');assert.equal(p.moveSlots[0].maxpp,16);assert.equal(p.moveSlots[0].pp,Math.min(remaining,16));
 });
 function setup(ability='Eject'){b=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Rotom-Heat',ability,moves:['overheat','firepunch','willowisp','thunderbolt']},{species:'Mew',ability:'No Ability',moves:['splash']}],[{species:'Mew',ability:'No Ability',moves:['splash','doublehit']}]]);b.makeChoices('team 12','team 1');return b.p1.active[0];}
 it('protects through the rest of the attack and residuals, then returns full HP after residuals',()=>{const p=setup(),q=b.p2.active[0];p.hp=2;p.setStatus('psn');p.moveSlots[0].pp=3;p.moveSlots[1].pp=0;const original=p.moveSlots.map(s=>({...s}));const m=Object.assign(Dex.getActiveMove('doublehit'),{accuracy:true,willCrit:false,basePower:200,multihit:2});b.actions.runMove(m,q,q.getLocOf(p));assert.equal(p.hp,1);assert(p.m.ejectWaiting);assert(!p.faintQueued&&!p.fainted);assert(p.volatiles.ejecting);const moves=b.log.filter(l=>l.startsWith('|move|p1a:')).length;b.actions.runMove('thunderbolt',p,p.getLocOf(q));assert.equal(b.log.filter(l=>l.startsWith('|move|p1a:')).length,moves);b.runAction({choice:'residual'});assert.equal(p.species.id,'rotom');assert.equal(p.hp,p.maxhp);assert.equal(p.ability,'infiltrator');assert.deepEqual(p.getPassives(),['levitate']);assert(!p.m.ejectWaiting&&!p.volatiles.ejecting);assert.equal(p.status,'psn');assert.deepEqual(p.moveSlots.map(s=>s.id),['hex','astonish','willowisp','thunderbolt']);assert.equal(p.moveSlots[0].pp,3);assert.equal(p.moveSlots[1].pp,0);assert.equal(p.moveSlots[2].pp,original[2].pp);assert(!b.log.some(l=>l.startsWith('|faint|p1a:')));p.faint(q,Dex.moves.get('tackle'));assert(p.faintQueued);});
 it('can trigger during residual damage and still returns at that turn end',()=>{const p=setup();p.hp=1;p.setStatus('psn');b.runAction({choice:'residual'});assert.equal(p.species.id,'rotom');assert.equal(p.hp,p.maxhp);assert(p.m.ejectUsed);});
 it('suppression prevents activation',()=>{const p=setup();p.addVolatile('gastroacid');p.faint(b.p2.active[0],Dex.moves.get('tackle'));assert(p.faintQueued);assert(!p.m.ejectUsed);});
 it('Transform does not grant a native appliance escape',()=>{const p=setup(),q=b.p2.active[0];assert(q.transformInto(p));q.faint(p,Dex.moves.get('tackle'));assert(q.faintQueued);assert(!q.m.ejectUsed);});
 it('replacement moves retain separate depleted slot budgets and persist through switching',()=>{const p=setup(),q=b.p2.active[0];p.moveSlots[0].pp=1;p.faint(q,Dex.moves.get('tackle'));b.runAction({choice:'residual'});b.makeChoices('switch 2','move 1');b.makeChoices('switch 2','move 1');assert.equal(p.moveSlots[0].id,'hex');assert.equal(p.moveSlots[0].pp,1);assert(p.m.ejectUsed);});
});

describe('Eject duplicate-slot choice validation',()=>{
 let b;afterEach(()=>b?.destroy());
 it('rejects the empty Hex slot and allows the other slot as a Z-move',()=>{
  b=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Rotom-Heat',ability:'Eject',item:'Ghostium Z',moves:['flamethrower','overheat','splash']}],[{species:'Mew',ability:'No Ability',moves:['splash']}]]);b.makeChoices('team 1','team 1');
  const p=b.p1.active[0],q=b.p2.active[0];p.moveSlots[0].pp=0;p.moveSlots[1].pp=2;p.faint(q,Dex.moves.get('tackle'));b.runAction({choice:'residual'});b.makeRequest('move');
  assert.throws(()=>b.choose('p1','move 1'),/disabled/);const hp=q.hp;assert(b.choose('p1','move 2 zmove'));assert.equal(b.p1.getChoice(),'move 2 zmove');b.choose('p2','move 1');assert(q.hp<hp);assert.equal(p.moveSlots[0].pp,0);assert.equal(p.moveSlots[1].pp,1);assert(b.log.some(l=>l.includes('Never-Ending Nightmare')));
 });
});
