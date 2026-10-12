'use strict';
const assert=require('assert').strict,common=require('../../common');let battle;
describe('Cursed Marionette owner-scoped healing',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const second of ['No Ability','Cursed Marionette'])it('heals only the curse owner once with ally '+second,()=>{
 const set=ability=>({species:'Mew',ability,moves:['splash']});battle=common.createBattle({formatid:'gen9nofielddoublesbattle'},[[set('Cursed Marionette'),set(second)],[set('No Ability'),set('No Ability')]]);battle.makeChoices('team 12','team 12');battle.field.terrain='';const [p,ally]=battle.p1.active,q=battle.p2.active[0];for(const x of [p,ally,q])x.hp=x.maxhp=x.baseMaxhp=1600;p.hp=ally.hp=800;q.addVolatile('curse',p,p.getAbility());const c=battle.dex.conditions.get('curse');battle.singleEvent('Residual',c,q.volatiles.curse,q);assert.equal(q.hp,1400);assert.equal(p.hp,900);assert.equal(ally.hp,800);
 });
});
