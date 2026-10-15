'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');let battle;
const forms=['Mimikyu','Mimikyu-Totem','Mimikyu-Busted','Mimikyu-Busted-Totem'];
function setup(form='Mimikyu',ability='Mold Breaker',item='',field='') {
 battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Gyarados',ability,moves:['crunch','gastroacid']}],[{species:form,ability:'Disguise',item,moves:['splash']}]]);
 battle.makeChoices('team 1','team 1');const p=battle.p1.active[0],q=battle.p2.active[0];
 if(ability==='Unleashed Ego'){p.formeChange('Gyarados-Mega',null,true);p.setAbility(ability);}
 q.formeChange(form,null,true);q.setAbility('Disguise');battle.field.terrain=field;battle.field.weather='';
 for(const m of [p,q])m.hp=m.maxhp=m.baseMaxhp=1600;
 battle.randomChance=()=>false;return [p,q];
}
function crunch(p,q){battle.actions.useMove(Object.assign(Dex.getActiveMove('crunch'),{accuracy:true,willCrit:false,secondaries:null}),p,{target:q});}
describe('Disguise attack bypass and suppression distinction',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const form of forms)for(const ability of ['Mold Breaker','Ultra Ego','Unleashed Ego','No Ability'])it(form+' versus '+ability,()=>{const[p,q]=setup(form,ability);crunch(p,q);const intact=!form.includes('Busted'),blocked=intact&&ability==='No Ability';assert.equal(!!q.abilityState.busted,blocked);assert.equal(!!p.volatiles.curse,blocked);if(!blocked){assert(q.hp<1600);assert.equal(q.species.id,Dex.toID(form));}assert(q.hp>0,'fixture checks bypass, not a guaranteed KO');});
 for(const form of ['Mimikyu','Mimikyu-Totem'])for(const ability of ['Mold Breaker','Ultra Ego','Unleashed Ego'])it('Ability Shield preserves '+form+' against '+ability,()=>{const[p,q]=setup(form,ability,'Ability Shield');crunch(p,q);assert(q.abilityState.busted);assert(p.volatiles.curse);});
 for(const form of ['Mimikyu','Mimikyu-Totem'])for(const mode of ['gastroacid','neutralizinggas'])it(form+' remains immune to ongoing '+mode+' suppression',()=>{const[p,q]=setup(form,mode==='neutralizinggas'?'Neutralizing Gas':'No Ability');if(mode==='gastroacid'){battle.actions.useMove('gastroacid',p,{target:q});assert(!q.volatiles.gastroacid);}assert.equal(q.ignoringAbility(),false);crunch(p,q);assert(q.abilityState.busted);assert(p.volatiles.curse);});
 for(const field of ['bewitchedwoodsterrain','hauntedterrain','holyterrain'])for(const ability of ['Ultra Ego','Unleashed Ego'])it(ability+' respects '+field+' component behavior',()=>{const[p,q]=setup('Mimikyu',ability,'',field);crunch(p,q);assert.equal(!!q.abilityState.busted,ability==='Ultra Ego');assert.equal(!!p.volatiles.curse,ability==='Ultra Ego');if(ability==='Unleashed Ego')assert(q.hp<1600);});
 it('preserves other cantsuppress custom protections',()=>{const[p,q]=setup();battle.setActiveMove(Object.assign(Dex.getActiveMove('crunch'),{ignoreAbility:true}),p,q);assert.equal(battle.suppressingAbility(q,{id:'othercustom',flags:{cantsuppress:1,breakable:1}}),false);assert(battle.suppressingAbility(q,Dex.abilities.get('disguise')));});
 it('retains independent Cursed Body after Disguise is bypassed',()=>{const[p,q]=setup();assert.deepEqual(q.getPassives(),['cursedbody']);battle.randomChance=()=>true;battle.actions.runMove('crunch',p,p.getLocOf(q));assert(!q.abilityState.busted);assert(!p.volatiles.curse);assert(p.volatiles.disable);});
 it('retains independent Cursed Body faint Curse after bypass',()=>{const[p,q]=setup();q.hp=1;crunch(p,q);battle.faintMessages();assert(q.fainted);assert(!q.abilityState.busted);assert(p.volatiles.curse);});
});
