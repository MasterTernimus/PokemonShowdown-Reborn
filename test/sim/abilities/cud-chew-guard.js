'use strict';
const assert=require('assert').strict;
const {Battle,Dex}=require('../../../dist/sim');
describe('Cud Chew second-bite whole-move guard',()=>{
 let battle;
 afterEach(()=>battle?.destroy());
 function setup(ability='Cud Chew',doubles=false){
  const m={species:'Mew',ability:'No Ability',moves:['splash','watergun','gastroacid']};
  battle=new Battle({formatid:doubles?'gen9nofielddoublesbattle':'gen9nofieldsinglesgame',p1:{team:doubles?[m,m]:[m,{...m,species:'Weezing',ability:'Neutralizing Gas'}]},p2:{team:doubles?[m,{...m,ability}]:[{...m,ability},m]}});
  if(battle.requestState==='teampreview')battle.makeChoices('team 12','team 12');
  for(const s of battle.sides)for(const p of s.pokemon)p.hp=p.maxhp=p.baseMaxhp=4000;
  return[battle.p2.active[doubles?1:0],battle.p1.active[0]];
 }
 function turn(doubles=false){battle.makeChoices(doubles?'move splash, move splash':'move splash',doubles?'move splash, move splash':'move splash');}
 function arm(p,item='sitrusberry',doubles=false){p.hp=1000;p.setItem(item);assert(p.eatItem());turn(doubles);assert(p.volatiles.cudchew);}
 function hit(q,p,id='seismictoss',extra={}){battle.clearActiveMove();const hp=p.hp;const m=Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false},extra);battle.actions.useMove(m,q,{target:p});return hp-p.hp;}
 function ready(p){return !!p.volatiles.cudchew&&!p.volatiles.cudchew.spent;}
 for(const a of ['Cud Chew','Rousing Feast'])it(a+' arms only after delayed accepted Eat and protects all strikes once',()=>{
  const[p,q]=setup(a);p.hp=1000;p.setItem('sitrusberry');assert(p.eatItem());assert(!p.volatiles.cudchew);turn();assert(ready(p));
  assert.equal(hit(q,p,'doublehit',{damage:100}),150);assert(!ready(p));
  assert.equal(hit(q,p,'doublehit',{damage:100}),200);
 });
 it('reduces fixed damage and naturally removes the spent guard after runMove',()=>{
  const[p,q]=setup();arm(p);const hp=p.hp;q.moveSlots.push({...q.moveSlots[0],id:'seismictoss',move:'Seismic Toss',pp:10,maxpp:10});
  battle.actions.runMove('seismictoss',q,q.getLocOf(p));assert.equal(hp-p.hp,75);assert(!p.volatiles.cudchew);
 });
 it('reduced nonlethal damage does not trigger Endure survival capping',()=>{
  const[p,q]=setup();arm(p);p.hp=p.maxhp;p.addVolatile('endure');const start=battle.log.length;
  assert.equal(hit(q,p,'seismictoss',{damage:5000}),3750);assert.equal(p.hp,250);
  assert(!battle.log.slice(start).some(line=>line.includes('|-activate|')&&line.includes('|move: Endure')));
 });
 it('lethal reduced damage still leaves exactly one HP under Endure',()=>{
  const[p,q]=setup();arm(p);p.hp=p.maxhp;p.addVolatile('endure');
  hit(q,p,'seismictoss',{damage:8000});assert.equal(p.hp,1);assert(!ready(p));
 });
 it('Endure still leaves one HP through all hits of the protected damaging move',()=>{
  const[p,q]=setup();arm(p);p.hp=p.maxhp;p.addVolatile('endure');
  hit(q,p,'doublehit',{damage:8000});assert.equal(p.hp,1);assert(!ready(p));
 });
 it('damage reduction avoids unnecessarily using Focus Sash',()=>{
  const[p,q]=setup();arm(p);p.hp=p.maxhp;p.setItem('focussash');assert.equal(hit(q,p,'seismictoss',{damage:5000}),3750);assert.equal(p.hp,250);assert.equal(p.item,'focussash');
 });
 it('truly lethal reduced damage still leaves exactly one HP through Focus Sash',()=>{
  const[p,q]=setup();arm(p);p.hp=p.maxhp;p.setItem('focussash');hit(q,p,'seismictoss',{damage:8000});assert.equal(p.hp,1);assert.equal(p.item,'');
 });
 it('preserves guard through Protect, misses, type immunity, status and indirect damage',()=>{
  const[p,q]=setup();arm(p);p.addVolatile('protect');hit(q,p);p.removeVolatile('protect');assert(ready(p));
  hit(q,p,'watergun',{accuracy:0});assert(ready(p));p.setType('Ghost');hit(q,p,'tackle');assert(ready(p));p.setType('Psychic');
  hit(q,p,'growl');battle.damage(50,p,q,Dex.conditions.get('psn'));battle.damage(50,p,p,Dex.conditions.get('recoil'));assert(ready(p));assert.equal(hit(q,p),75);
 });
 it('Substitute-only hits do not spend or reduce guard, while later same-move HP hits do',()=>{
  const[p,q]=setup();arm(p);p.addVolatile('substitute');p.volatiles.substitute.hp=10000;const hp=p.hp;
  hit(q,p,'doublehit',{damage:100});assert.equal(p.hp,hp);assert.equal(p.volatiles.substitute.hp,9800);assert(ready(p));
  p.volatiles.substitute.hp=1;assert.equal(hit(q,p,'bulletseed',{damage:100,multihit:3}),150);assert(!ready(p));
 });
 it('retargeted remaining hits of one move share the same holder guard',()=>{
  const[p,q]=setup('Cud Chew',true);arm(p,'sitrusberry',true);const first=battle.p2.active[0];first.hp=1;const hp=p.hp;
  hit(q,first,'bulletseed',{damage:100,multihit:3});assert.equal(hp-p.hp,150);assert(!ready(p));assert.equal(hit(q,p),100);
 });
 it('repeated second bites never stack and may replenish a spent guard',()=>{
  const[p,q]=setup();arm(p);p.setItem('oranberry');assert(p.eatItem());turn();assert(ready(p));assert.equal(hit(q,p),75);
  p.setItem('oranberry');assert(p.eatItem());turn();assert(ready(p));assert.equal(hit(q,p),75);
 });
 it('natural Gastro Acid pauses a ready guard, removal restores it, and ability loss cancels it',()=>{
  const[p,q]=setup();arm(p);hit(q,p,'gastroacid');assert(p.volatiles.gastroacid);assert(p.volatiles.cudchew);assert.equal(hit(q,p),100);assert(ready(p));
  p.removeVolatile('gastroacid');assert.equal(hit(q,p),75);p.setItem('oranberry');assert(p.eatItem());turn();assert(ready(p));
  p.setAbility('No Ability');assert(!p.volatiles.cudchew);p.setAbility('Cud Chew');assert.equal(hit(q,p),100);
 });
 it('natural Neutralizing Gas pauses ready protection without rearming or cancelling it',()=>{
  const[p,q]=setup();arm(p);battle.makeChoices('switch 2','move splash');assert(p.ignoringAbility());assert(p.volatiles.cudchew);
  assert.equal(hit(battle.p1.active[0],p),100);assert(ready(p));battle.makeChoices('switch 2','move splash');assert(!p.ignoringAbility());assert.equal(hit(q,p),75);
 });
 it('switching discards the guard and it cannot transfer with Baton Pass',()=>{
  const[p]=setup();arm(p);const replacement=battle.p2.pokemon[1];replacement.copyVolatileFrom(p,'batonpass');assert(!replacement.volatiles.cudchew);
  battle.makeChoices('move splash','switch 2');battle.makeChoices('move splash','switch 2');assert(!p.volatiles.cudchew);
 });
 for(const item of ['sitrusberry','lumberry','leppaberry'])it(item+' accepted replay grants guard even if item benefit is absent',()=>{
  const[p]=setup();p.hp=1000;p.setItem(item);assert(p.eatItem());p.hp=p.maxhp;for(const slot of p.moveSlots)slot.pp=slot.maxpp;turn();assert(ready(p));
 });
 it('Heal Block prevents repeat healing but not accepted reconsumption or its guard',()=>{
  const[p,q]=setup();p.hp=1000;p.setItem('sitrusberry');assert(p.eatItem());p.addVolatile('healblock',q);const hp=p.hp;turn();assert.equal(p.hp,hp);assert(ready(p));
 });
 it('a rejected Eat event expires the timer without granting a guard',()=>{
  const[p]=setup();battle.singleEvent('EatItem',p.getAbility(),p.abilityState,p,null,null,Dex.items.get('kelpsyberry'));turn();assert(!p.abilityState.berry);assert(!p.volatiles.cudchew);
 });
 it('a fainted holder cannot arm or spend protection',()=>{
  const[p,q]=setup();p.hp=1000;p.setItem('sitrusberry');assert(p.eatItem());p.hp=1;hit(q,p);assert.equal(p.hp,0);assert(!p.volatiles.cudchew);
 });
});
