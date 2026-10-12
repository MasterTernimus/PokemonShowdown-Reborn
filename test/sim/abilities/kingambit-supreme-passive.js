'use strict';
const assert=require('assert').strict,common=require('../../common');
const {Dex}=require('../../../dist/sim');
const {passiveEffect,passiveState}=require('../../../dist/sim/species-passives');
let battle;
function setup(ability="Conqueror's Will",species='Kingambit',doubles=false){
 const mon={species,ability,moves:['splash','tackle','kowtowcleave']},foe={species:'Mew',ability:'No Ability',moves:['splash']};
 battle=common.createBattle({gameType:doubles?'doubles':'singles'},[[mon,{...foe},{...foe}],[{...foe},{...foe}]]);
 if(battle.requestState==='teampreview')battle.makeChoices();battle.field.terrain='';return[battle.p1.active[0],battle.p2.active[0]];
}
function power(p,q){return battle.runEvent('BasePower',p,q,Dex.getActiveMove('tackle'),1000);}
function entry(p){battle.singleEvent('SwitchIn',passiveEffect(battle,'supremeoverlord'),passiveState(p,'supremeoverlord'),p);}
describe('Kingambit Supreme Overlord extraction',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('replaces only Kingambit Entrenched and preserves slots/components',()=>{
  const[p]=setup();assert.deepEqual(p.getPassives(),['supremeoverlord']);assert.deepEqual(Dex.species.get('kingambit').abilities,{0:'Defiant',1:"Conqueror's Will",H:'Royal Decree'});
  assert.deepEqual(require('../../../dist/data/ability-components').AbilityComponents.conquerorswill,['unnerve']);
  assert(!p.hasAbility('supremeoverlord'));assert(p.hasAbilityOrPassive('supremeoverlord'));
  for(const key of ['fallen','onAnyFaint','onBasePower','onTryAddVolatile','onDamage'])assert.equal(Dex.abilities.get('conquerorswill')[key],undefined,key);
  assert(Dex.abilities.get('conquerorswill').onModifyMove);
 });
 for(const ability of ['Defiant','Royal Decree',"Conqueror's Will",'Supreme Overlord','Apex Bond','Tyrant Domain','Royal Sun','Raging Overlord'])
  for(const n of [2,4,5,8])it(ability+' has exactly one passive multiplier at '+n,()=>{const[p,q]=setup(ability);p.side.totalFainted=n;assert.equal(power(p,q),1000+100*Math.min(5,n));});
 it('keeps 2/4/5 effects under active suppression',()=>{
  const[p,q]=setup();p.addVolatile('gastroacid',q);p.side.totalFainted=2;
  const move=Dex.getActiveMove('tackle');battle.runEvent('ModifyMove',p,q,move,move);assert(move.infiltrates);
  p.side.totalFainted=4;assert(!p.addVolatile('flinch',q));
  p.side.totalFainted=5;entry(p);assert.equal(p.boosts.atk,1);assert.equal(p.boosts.spa,1);assert.equal(power(p,q),1500);
  assert.equal(battle.runEvent('Damage',p,q,Dex.conditions.get('brn'),100),false);
 });
 it('updates on a real ally faint and awards threshold boost once',()=>{
  const[p,q]=setup("Conqueror's Will",'Kingambit',true),ally=battle.p1.active[1];p.side.totalFainted=4;ally.faint(q,Dex.getActiveMove('tackle'));battle.faintMessages();
  assert.equal(p.side.totalFainted,5);assert.equal(p.passiveStates.supremeoverlord.fallen,5);assert.equal(p.boosts.atk,1);entry(p);assert.equal(p.boosts.atk,1);
 });
 it('ability swaps, copied packages and restarts cannot reset the passive entry budget',()=>{
  const[p,q]=setup();p.side.totalFainted=5;entry(p);const state=p.passiveStates.supremeoverlord;
  for(const ability of ['Supreme Overlord','Tyrant Domain',"Conqueror's Will",'Defiant']){p.setAbility(ability);battle.singleEvent('Start',p.getAbility(),p.abilityState,p);entry(p);assert.equal(p.boosts.atk,1);assert.equal(power(p,q),1500);assert.equal(p.passiveStates.supremeoverlord,state);}
 });
 it('a genuine switch resets the once-entry boost budget',()=>{
  const[p]=setup();p.side.totalFainted=5;entry(p);const old=p.passiveStates.supremeoverlord;
  battle.actions.switchIn(p.side.pokemon[1],0);battle.actions.switchIn(p,0);entry(p);
  assert.notEqual(p.passiveStates.supremeoverlord,old);assert.equal(p.boosts.atk,1);assert.equal(p.boosts.spa,1);
 });
 it('Transform acquires the form passive but copied Conqueror alone does not',()=>{
  const[p,q]=setup('No Ability','Mew');q.formeChange('Kingambit');p.side.totalFainted=5;assert(p.transformInto(q));assert(p.getPassives().includes('supremeoverlord'));assert.equal(p.boosts.atk,1);assert.equal(power(p,q),1500);
 });
 it('copying Conqueror onto Mew grants no Supreme Overlord',()=>{const[p,q]=setup();q.setAbility("Conqueror's Will",p);q.side.totalFainted=5;assert(!q.getPassives().includes('supremeoverlord'));assert.equal(power(q,p),1000);assert.equal(q.boosts.atk,0);});
 for(const ability of ['Supreme Overlord','Apex Bond','Tyrant Domain','Royal Sun','Raging Overlord'])it('preserves '+ability+' on nonpassive species',()=>{const[p,q]=setup(ability,'Mew');p.side.totalFainted=5;assert.equal(power(p,q),1500);});
 it('retains FFA doubling and five-effective-faint cap',()=>{const[p,q]=setup();battle.gameType='freeforall';p.side.totalFainted=2;assert.equal(power(p,q),1400);p.side.totalFainted=3;assert.equal(power(p,q),1500);});
});
