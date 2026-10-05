'use strict';
const assert=require('assert').strict,common=require('../../common');let battle;
function start(ability,species='Overqwil') {battle=common.createBattle({gameType:'singles'},[[{species,ability,moves:['splash']}],[{species:'Mew',ability:'No Ability',moves:['splash']}]]);if(battle.requestState==='teampreview')battle.makeChoices('team 1','team 1');battle.field.terrain='';battle.randomizer=x=>x;return[battle.p1.active[0],battle.p2.active[0]];}
describe('Water Bubble granted STAB removal',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const ability of ['Water Bubble','Sea Fiend'])for(const species of ['Overqwil','Araquanid'])for(const category of ['Physical','Special'])it(ability+' retains exactly doubled '+category+' Water offense on '+species,()=>{
  const[p,t]=start(ability,species),m=battle.dex.getActiveMove('watergun');Object.assign(m,{category,basePower:60,willCrit:false});battle.singleEvent('ModifyMove',p.getAbility(),p.abilityState,m,p,t);assert(!m.forceSTAB);
  const stat=category==='Physical'?'atk':'spa';assert.equal(battle.runEvent(category==='Physical'?'ModifyAtk':'ModifySpA',p,t,m,1000),2000);
  const actual=battle.actions.getDamage(p,t,m);p.setAbility('No Ability');p.storedStats[stat]*=2;assert.equal(battle.actions.getDamage(p,t,m),actual);
  if(species==='Araquanid'){p.setType('Normal');assert(battle.actions.getDamage(p,t,m)<actual);}
 });
 for(const ability of ['Water Bubble','Sea Fiend'])it(ability+' preserves independently granted forceSTAB and protective hooks',()=>{
  const[p,t]=start(ability),m=battle.dex.getActiveMove('watergun');m.forceSTAB=true;battle.singleEvent('ModifyMove',p.getAbility(),p.abilityState,m,p,t);assert.equal(m.forceSTAB,true);assert(p.volatiles.aquaring);assert(!p.trySetStatus('brn',t));assert.equal(p.runStatusImmunity('sandstorm'),false);assert.equal(p.runStatusImmunity('hail'),false);
  for(const category of ['Physical','Special']){const fire=battle.dex.getActiveMove('ember');fire.category=category;assert.equal(battle.runEvent(category==='Physical'?'ModifyAtk':'ModifySpA',t,p,fire,1000),500);}
  p.status='brn';battle.singleEvent('Update',p.getAbility(),p.abilityState,p);assert.equal(p.status,'');
 });
 it('preserves unrelated Water forceSTAB and Water Bubble residual without adding it to Sea Fiend',()=>{
  const[p,t]=start('Divine Mockery'),m=battle.dex.getActiveMove('watergun');battle.singleEvent('ModifyMove',p.getAbility(),p.abilityState,m,p,t);assert.equal(m.forceSTAB,true);
  p.setAbility('Water Bubble');p.status='par';battle.field.terrain='watersurfaceterrain';battle.singleEvent('Residual',p.getAbility(),p.abilityState,p);assert.equal(p.status,'');assert.equal(battle.dex.abilities.get('seafiend').onResidual,undefined);
 });
});
