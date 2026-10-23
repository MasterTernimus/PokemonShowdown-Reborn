'use strict';
const assert=require('assert').strict;
const {Battle,Dex}=require('../../../dist/sim');
const {AbilityComponents}=require('../../../dist/data/ability-components');
function setup(species,item=''){
 const b=new Battle({formatid:'gen9nofieldsinglesgame',p1:{name:'A',team:[{species,ability:'Intimidate',item,moves:['splash']}]},p2:{name:'B',team:[{species:'Mew',ability:'No Ability',moves:['splash']}]}});
 if(b.requestState==='teampreview')b.makeChoices('team 1','team 1');return b;
}
describe('Confirmed non-Mega Mightyena Rivalry scope',()=>{
 for(const id of ['mightyena','mightyenagrim','mightyenadeso'])it(id+' has exactly one Rivalry passive without a selected-slot duplication',()=>{
  const s=Dex.species.get(id);assert.deepEqual(s.passives,['rivalry']);assert.deepEqual(s.abilities,{0:'Intimidate',1:'Black Fang',H:'Stakeout'});
  const b=setup(id);try{const p=b.p1.active[0],q=b.p2.active[0];assert.deepEqual(p.getPassives(),['rivalry']);assert.equal(b.runEvent('BasePower',p,q,Dex.getActiveMove('tackle'),100),130);p.addVolatile('gastroacid');assert.equal(b.runEvent('BasePower',p,q,Dex.getActiveMove('tackle'),100),130);}finally{b.destroy();}
 });
 it('preserves both Mega records, abilities and Dread Dominion components',()=>{
  for(const id of ['mightyenamega','mightyenamegagrim']){const s=Dex.species.get(id);assert.deepEqual(s.passives,['darkaura']);assert.deepEqual(s.abilities,{0:'Dread Dominion'});assert.deepEqual(s.baseStats,{hp:90,atk:140,def:105,spa:85,spd:100,spe:130});}
  assert.deepEqual(AbilityComponents.dreaddominion,['hydrabond','moxie','intimidate']);
 });
 it('Grim Mega Evolution replaces Rivalry with Dark Aura instead of inheriting it',()=>{
  const b=setup('Mightyena-Grim','Grimyinite');try{const p=b.p1.active[0],q=b.p2.active[0];assert.deepEqual(p.getPassives(),['rivalry']);assert.equal(b.actions.runMegaEvo(p),true);assert.equal(p.species.id,'mightyenamegagrim');assert.equal(p.ability,'dreaddominion');assert.deepEqual(p.getPassives(),['darkaura']);assert(!p.hasAbilityOrPassive('rivalry'));assert.equal(b.runEvent('BasePower',p,q,Dex.getActiveMove('tackle'),100),100);}finally{b.destroy();}
 });
 for(const id of ['mightyena','mightyenadeso'])it(id+' keeps the existing disabled normal-Mega gate',()=>{const b=setup(id,'Grimyinite');try{const p=b.p1.active[0];assert.equal(b.actions.runMegaEvo(p),false);assert.equal(p.species.id,id);assert.deepEqual(p.getPassives(),['rivalry']);}finally{b.destroy();}});
 it('does not distribute to Poochyena',()=>{assert.deepEqual(Dex.species.get('poochyena').passives,[]);assert(!Object.values(Dex.species.get('poochyena').abilities).includes('Rivalry'));});
});
