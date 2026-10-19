'use strict';
const assert=require('assert').strict,common=require('../../common');
const {Dex}=require('../../../dist/sim');
describe('Approved Roserade status control',()=>{
 let battle;afterEach(()=>{battle?.destroy();battle=null;});
 function setup(ability,species='Mew') {
  const idle={species:'Mew',ability:'No Ability',moves:['splash']};
  battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species,ability,moves:['solarbeam','splash','toxic','tackle']},{...idle}],[{...idle}]]);
  battle.makeChoices('team 12','team 1');return [battle.p1.active[0],battle.p2.active[0]];
 }
 function modify(p,q,id,extra={}){const m=Object.assign(Dex.getActiveMove(id),extra);battle.runEvent('ModifyMove',p,q,m,m);return m;}
 for(const ability of ['False Devotion','True Devotion']) {
  it(ability+' installs exactly the local primitives, without recovery hooks',()=>{
   const a=Dex.abilities.get(ability),sg=Dex.abilities.get('serenegrace'),prank=Dex.abilities.get('prankster');
   assert.equal(a.onModifyMove,sg.onModifyMove);assert.equal(a.onModifyPriority,prank.onModifyPriority);assert.equal(a.onNegateImmunity,prank.onNegateImmunity);
   for(const key of ['onSwitchOut','onResidual','onCheckShow'])assert.equal(a[key],undefined,key);
   if(ability==='True Devotion')assert.equal(a.onBasePower,Dex.abilities.get('technician').onBasePower);
  });
  it(ability+' caps secondaries, preserves guarantees, and does not multiply repeated calls',()=>{
   const[p,q]=setup(ability),m=modify(p,q,'tackle',{secondaries:[{chance:10,status:'brn'},{chance:40,status:'par'},{chance:100,boosts:{def:-1}}],self:{chance:30,boosts:{atk:1}}});
   assert.deepEqual(m.secondaries.map(s=>s.chance),[20,60,100]);assert.equal(m.self.chance,60);
   battle.runEvent('ModifyMove',p,q,m,m);assert.deepEqual(m.secondaries.map(s=>s.chance),[20,60,100]);assert.equal(m.self.chance,60);
  });
  it(ability+' gives actual Prankster priority and marks its targeting rules',()=>{
   const[p,q]=setup(ability),m=Dex.getActiveMove('toxic');assert.equal(battle.runEvent('ModifyPriority',p,q,m,0),1);assert(m.pranksterBoosted);
   const attack=Dex.getActiveMove('tackle');assert.equal(battle.runEvent('ModifyPriority',p,q,attack,0),0);assert(!attack.pranksterBoosted);
  });
  it(ability+' respects opposing Dark immunity to Prankster status moves',()=>{
   const[p,q]=setup(ability);p.setType('Poison');q.setType('Dark');
   battle.makeChoices('move toxic','move splash');assert.equal(q.status,'');
   p.addVolatile('gastroacid');battle.makeChoices('move toxic','move splash');assert.equal(q.status,'tox');
  });
  it(ability+' skips Solar Beam charge, while suppression restores it',()=>{
   const[p,q]=setup(ability);q.hp=q.maxhp=q.baseMaxhp=10000;
   assert(!modify(p,q,'solarbeam').flags.charge);battle.makeChoices('move solarbeam','move splash');assert(q.hp<10000);assert(!p.volatiles.twoturnmove);
   p.addVolatile('gastroacid');assert(modify(p,q,'solarbeam').flags.charge);
  });
  it(ability+' neither cures nor heals on switching and has no residual recovery',()=>{
   const[p,q]=setup(ability);p.hp=100;p.setStatus('brn');const before=p.hp;
   battle.singleEvent('Residual',p.getAbility(),p.abilityState,p);assert.equal(p.hp,before);
   battle.makeChoices('switch 2','move splash');assert.equal(p.status,'brn');assert.equal(p.hp,before);
  });
  it(ability+' deduplicates overlapping passive Serene Grace',()=>{
   const[p,q]=setup(ability,'Jirachi');assert(p.getPassives().includes('serenegrace'));const m=modify(p,q,'ember');assert.equal(m.secondaries[0].chance,20);
  });
 }
 it('True Devotion applies Technician once, including its existing Factory threshold',()=>{
  const[p,q]=setup('True Devotion');assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('tackle'),40),60);
  assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('energyball'),80),80);
  battle.field.setTerrain('factoryterrain',p);assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('energyball'),80),120);
 });
 it('retains Roserade, Aevian, Mega and pending Amoonguss assignments',()=>{
  for(const[id,abilities,passives]of [
   ['roserade',{0:'False Devotion',1:'Invigorate',H:'Technician'},['beguilingbouquet']],
   ['roserademega',{0:'True Devotion'},['beguilingbouquet']],
   ['roseradeaevian',{0:'Dry Skin',1:'Technician',H:'False Devotion'},[]],
   ['amoonguss',{0:'Effect Spore',1:'Spore Shroud',H:'Regenerator'},['dryskin']],
  ]) {assert.deepEqual(Dex.species.get(id).abilities,abilities);assert.deepEqual(Dex.species.get(id).passives,passives);}
 });
});
