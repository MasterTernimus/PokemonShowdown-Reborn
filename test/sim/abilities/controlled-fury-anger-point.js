'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex,TeamValidator}=require('../../../dist/sim');
describe('Controlled Fury Anger Point and Raging Heart Inner Focus',()=>{
 let battle;
 afterEach(()=>{battle?.destroy();battle=null;});
 function setup(species='Emboar',ability='Controlled Fury'){
  const mon={species:'Mew',ability:'No Ability',moves:['tackle','thrash','splash','protect']};
  battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{...mon,species,ability},{...mon}],[{...mon},{...mon}]]);
  battle.makeChoices('team 12','team 12');
  for(const side of battle.sides)for(const p of side.pokemon)p.hp=p.maxhp=p.baseMaxhp=60000;
  return[battle.p1.active[0],battle.p2.active[0]];
 }
 function hit(source,target,crit=false){battle.clearActiveMove();const m=Object.assign(Dex.getActiveMove('watergun'),{basePower:1,accuracy:true,willCrit:crit});battle.actions.useMove(m,source,{target});return m;}
 for(const[species,ability]of [['Mew','Anger Point'],['Emboar','Controlled Fury'],['Tauros','No Ability'],['Tauros','Anger Point'],['Krookodile','Dread Jaw'],['Annihilape','Raging Heart']]){
  it(species+'/'+ability+' gets the full local first-hit bonus only once',()=>{const[p,q]=setup(species,ability);battle.actions.useMove('splash',q);hit(q,p);assert.equal(p.boosts.atk,1);hit(q,p);assert.equal(p.boosts.atk,1);});
  it(species+'/'+ability+' reaches maximum Attack on a critical hit even from -6',()=>{const[p,q]=setup(species,ability);p.boosts.atk=-6;hit(q,p,true);assert.equal(p.boosts.atk,6);});
 }
 it('selected Controlled Fury is suppressed without spending its first-hit bonus',()=>{const[p,q]=setup();p.addVolatile('gastroacid');hit(q,p);assert.equal(p.boosts.atk,0);p.removeVolatile('gastroacid');hit(q,p);assert.equal(p.boosts.atk,1);});
 it('the species passive continues through suppression and retains full critical response',()=>{const[p,q]=setup('Annihilape','Raging Heart');p.addVolatile('gastroacid');hit(q,p);assert.equal(p.boosts.atk,1);hit(q,p,true);assert.equal(p.boosts.atk,6);});
 it('switching resets the first-hit use under normal battle entry',()=>{const[p,q]=setup();hit(q,p);battle.makeChoices('switch 2','move splash');battle.makeChoices('switch 2','move splash');assert.equal(p.boosts.atk,0);hit(q,p);assert.equal(p.boosts.atk,1);});
 it('Raging Heart blocks flinch and Intimidate while permitting ordinary Attack drops',()=>{
  const[p,q]=setup('Annihilape','Raging Heart');assert(!p.addVolatile('flinch',q,Dex.getActiveMove('fakeout')));
  battle.boost({atk:-1},p,q,Dex.abilities.get('intimidate'));assert.equal(p.boosts.atk,0);
  battle.boost({atk:-1},p,q,Dex.getActiveMove('growl'));assert.equal(p.boosts.atk,-1);
 });
 it('suppression disables selected Inner Focus but leaves the new passive separate',()=>{
  const[p,q]=setup('Annihilape','Raging Heart');p.addVolatile('gastroacid');assert(p.addVolatile('flinch',q,Dex.getActiveMove('fakeout')));
  battle.boost({atk:-1},p,q,Dex.abilities.get('intimidate'));assert.equal(p.boosts.atk,-1);
  hit(q,p,true);assert.equal(p.boosts.atk,6);
 });
 it('Mold Breaker bypasses the selected Inner Focus flinch protection',()=>{
  const[p,q]=setup('Annihilape','Raging Heart');q.setAbility('Mold Breaker');
  const m=Object.assign(Dex.getActiveMove('bite'),{basePower:1,accuracy:true,willCrit:false,secondaries:[{chance:100,volatileStatus:'flinch'}]});
  battle.actions.useMove(m,q,{target:p});assert(p.volatiles.flinch);
 });
 it('Raging Heart retains Ghost Thrash while its separate passive removes the lock',()=>{
  const[p,q]=setup('Annihilape','Raging Heart'),m=Object.assign(Dex.getActiveMove('thrash'),{accuracy:true,willCrit:false});
  battle.actions.useMove(m,p,{target:q});assert.equal(battle.activeMove.type,'Ghost');assert.equal(battle.activeMove.category,'Physical');assert.equal(battle.activeMove.basePower,140);assert(!p.volatiles.lockedmove);assert(!p.volatiles.confusion);
  battle.makeChoices('move splash','move splash');assert.equal(p.lastMove.id,'splash');
 });
 it('called Thrash stays Normal, and Raging Heart does not grant a second Anger Point',()=>{
  const[p,q]=setup('Annihilape','Raging Heart'),m=Object.assign(Dex.getActiveMove('thrash'),{sourceEffect:'metronome',accuracy:true,willCrit:false});
  battle.actions.useMove(m,p,{target:q});assert.equal(battle.activeMove.type,'Normal');hit(q,p);assert.equal(p.boosts.atk,1);
 });
 it('Annihilape replaces Beyond Fear rather than retaining its Taunt immunity',()=>{const[p,q]=setup('Annihilape','Raging Heart');assert.deepEqual(p.getPassives(),['controlledfury']);battle.actions.useMove('taunt',q,{target:p});assert(p.volatiles.taunt);});
 it('does not trigger from Substitute-only damage',()=>{const[p,q]=setup();p.addVolatile('substitute');hit(q,p,true);assert.equal(p.boosts.atk,0);assert(p.volatiles.substitute);});
 it('does not boost after a lethal critical hit',()=>{const[p,q]=setup();p.hp=1;hit(q,p,true);assert.equal(p.hp,0);assert.equal(p.boosts.atk,0);});
 it('preserves exact distribution boundaries and legal selected slots',()=>{
  assert.deepEqual(Dex.species.get('crabominable').abilities,{0:'Icebreaker',1:'Iron Fist',H:'Controlled Fury'});
  assert.deepEqual(Dex.species.get('primeape').abilities,{0:'Vital Spirit',1:'Controlled Fury',H:'Defiant'});
  assert.deepEqual(Dex.species.get('krookodile').abilities,{0:'Intimidate',1:'Dread Jaw',H:'Vendetta'});
  assert.deepEqual(Dex.species.get('krookodile').passives,['controlledfury']);
  assert.deepEqual(Dex.species.get('annihilape').abilities,{0:'Unbound Spirit',1:'Raging Heart',H:'Defiant'});
  assert.deepEqual(Dex.species.get('mankey').abilities,{0:'Vital Spirit',1:'Anger Point',H:'Defiant'});
  for(const species of ['Crabominable','Primeape'])assert.equal(TeamValidator.get('gen9nofieldsinglesgame').validateSet({species,ability:'Controlled Fury',moves:['Protect'],level:100,evs:{hp:252,atk:252,spd:4}}),null);
 });
 it('describes the actual chosen Thrash target and retained Defense-drop secondary',()=>{
  const move=Dex.moves.get('thrash'),desc=Dex.abilities.get('ragingheart').desc;
  assert.equal(move.target,'adjacentFoe');
  assert.deepEqual(move.secondary,{chance:30,boosts:{def:-1}});
  assert(desc.includes('chosen adjacent opposing target'));
  assert(!desc.includes('random opposing target'));
 });

});
