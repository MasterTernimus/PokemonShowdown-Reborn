'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
function start(ability = 'No Ability', moves = ['splash']) {
 battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
  {species:'Mew', ability, item:'Leftovers', moves}, {species:'Mew', ability:'No Ability', moves:['splash']},
 ], [{species:'Mew', ability:'No Ability', moves:['splash','knockoff','earthquake']}]]);
 battle.makeChoices('team 12','team 1');
 return [battle.p1.active[0],battle.p2.active[0]];
}
describe('Approved healing, PP and Atrocity components', () => {
 afterEach(() => {battle?.destroy(); battle=null;});
 for(const id of ['refresh','healbell','aromatherapy','junglehealing','lunarblessing']) for(const status of ['', 'par']) {
  it(id + ' heals the correct single total when status=' + status, () => {
   const [p] = start('No Ability',[id]);
   p.hp = 80;
   if(status) p.setStatus(status);
   const before = p.hp;
   const move = battle.dex.moves.get(id);
   battle.singleEvent('Hit',move,{},p,p,battle.dex.getActiveMove(id));
   assert.equal(p.status,'');
   assert.equal(p.hp-before, (['junglehealing','lunarblessing'].includes(id) ? battle.modify(p.maxhp,status?0.25:0.125) : Math.floor(p.maxhp/(status?4:8))));
  });
 }
 for(const status of ['', 'par']) it('Natural Cure switch heal status=' + status, () => {
  const [p]=start('Natural Cure');p.hp=80;if(status)p.setStatus(status);
  const before=p.hp;
  battle.singleEvent('SwitchOut',p.getAbility(),p.abilityState,p);
  assert.equal(p.status,'');
  assert.equal(p.hp-before,status?Math.floor(p.maxhp/8):0);
 });
 it('keeps party status cure separate from user HP heal', () => {
  const [p]=start('No Ability',['healbell']);p.hp=80;
  const benched=battle.p1.pokemon[1];benched.setStatus('par');benched.hp=80;
  battle.singleEvent('Hit',battle.dex.moves.get('healbell'),{},p,p,battle.dex.getActiveMove('healbell'));
  assert.equal(benched.status,'');assert.equal(benched.hp,80);
  assert.equal(p.hp,80+Math.floor(p.maxhp/8));
 });
 it('sets five base and eight max PP', () => {
  const [p]=start('No Ability',['moonlight','morningsun']);
  for(const slot of p.moveSlots){assert.equal(battle.dex.moves.get(slot.id).pp,5);assert.equal(slot.maxpp,8);}
 });
 for(const ability of ['Withering Shell','No Ability']) it(ability + ' item removal behavior', () => {
  const [p]=start(ability);battle.makeChoices('move splash','move knockoff');
  assert.equal(p.item,ability==='Withering Shell'?'leftovers':'');
 });
 it('Atrocity is grounded and keeps hidden move riders', () => {
  const [p]=start('Atrocity');assert.equal(p.isGrounded(),true);
  const m=battle.dex.getActiveMove('dragonrush');const initialCrit=m.critRatio;
  p.getAbility().onModifyMove.call(battle,m,p,null);
  assert.equal(m.accuracy,true);assert.equal(m.critRatio,initialCrit+1);
  assert(p.getAbility().flags.cantsuppress);
 });
 for(const field of ['', 'coldeclipseterrain','dragonsdenterrain']) it('Fire Ward defense factor on '+field,()=>{
  const [p]=start('Fire Ward');if(field)battle.field.setTerrain(field,p);
  const raw=p.getStat('def',false,true);
  assert.equal(p.getStat('def'),battle.modify(raw,field?1.5:1.3));
 });
 it('Atrocity keeps generic power equal on normal and Cold Eclipse',()=>{
  const [p,q]=start('Atrocity');
  const m=battle.dex.getActiveMove('psychic');m.type='Water';m.flags={};
  function power(){return battle.runEvent('BasePower',p,q,m,100);}
  const normal=power();battle.field.setTerrain('coldeclipseterrain',p);
  assert.equal(power(),normal);assert.equal(normal,130);
 });
 it('Mold Breaker bypasses the Sticky Hold component',()=>{
  const [p,q]=start('Withering Shell');q.setAbility('moldbreaker');
  battle.makeChoices('move splash','move knockoff');assert.equal(p.item,'');
 });
 it('Atrocity adds Tough Claws once and keeps the defense modifier single',()=>{
  const [p,q]=start('Atrocity');const m=battle.dex.getActiveMove('tackle');m.type='Water';m.flags={contact:1};
  assert.equal(battle.runEvent('BasePower',p,q,m,100),169);
  for(const terrain of ['', 'coldeclipseterrain','dragonsdenterrain']) {
   if(terrain)battle.field.setTerrain(terrain,p);
   assert.equal(p.getStat('def'),battle.modify(p.getStat('def',false,true),terrain?1.5:1.3));
  }
 });

});
