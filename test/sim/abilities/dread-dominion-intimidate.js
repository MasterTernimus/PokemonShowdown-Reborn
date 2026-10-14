'use strict';const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');let battle;
describe('Dread Dominion replaces Fairy overrides with Intimidate',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const species of ['Mightyena','Mightyena-Grim','Mightyena-Deso'])it(species+' Mega entry triggers once and preserves its passive',()=>{
  battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species,ability:'Quick Feet',item:'Grimyinite',moves:['crunch']}],[{species:'Mew',ability:'No Ability',moves:['splash']},{species:'Mew',ability:'No Ability',moves:['splash']}]]);battle.makeChoices('team 1','team 12');const p=battle.p1.active[0],q=battle.p2.active[0];q.boosts.atk=0;assert(battle.actions.runMegaEvo(p));assert.equal(q.boosts.atk,-1);battle.singleEvent('Start',p.getAbility(),p.abilityState,p);assert.equal(q.boosts.atk,-1);assert.deepEqual(p.getPassives(),['darkaura']);assert.deepEqual(p.types,['Dark','Ghost']);
  q.setType('Fairy');assert.equal(q.runEffectiveness(Dex.getActiveMove('crunch')),-1);p.setType('Dark');assert.equal(p.runEffectiveness(Dex.getActiveMove('moonblast')),1);const m=Dex.getActiveMove('tackle');battle.runEvent('ModifyMove',p,q,m,m);assert.equal(m.multihit,3);q.hp=1;battle.actions.useMove(Object.assign(Dex.getActiveMove('tackle'),{accuracy:true,damage:10}),p,{target:q});battle.faintMessages();assert.equal(p.boosts.atk,1);
 });
 for(const block of ['gastroacid','substitute','innerfocus'])it('Intimidate respects '+block,()=>{
  battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Mew',ability:'Dread Dominion',moves:['tackle']}],[{species:'Mew',ability:'No Ability',moves:['splash']},{species:'Mew',ability:'No Ability',moves:['splash']}]]);battle.makeChoices('team 1','team 12');const p=battle.p1.active[0],q=battle.p2.active[0];q.boosts.atk=0;delete p.abilityState.intimidateActivated;if(block==='gastroacid')p.addVolatile(block);else if(block==='substitute')q.addVolatile(block);else q.setAbility(block);battle.singleEvent('Start',p.getAbility(),p.abilityState,p);assert.equal(q.boosts.atk,0);
 });
});
