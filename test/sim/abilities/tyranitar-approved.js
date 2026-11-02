'use strict';const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
describe('Tyranitar approved exact composites',()=>{let b;afterEach(()=>{b?.destroy();b=null});function setup(ability,species='Tyranitar'){const m={species:'Mew',ability:'No Ability',moves:['splash','earthquake','stoneedge','darkpulse']};b=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{...m,species,ability}],[m]]);b.makeChoices('team 1','team 1');return[b.p1.active[0],b.p2.active[0]];}
it('Mountain Hide reduces physical damage only in effective sand', () => {
 const [p,q]=setup('Mountain Hide');
 const damage=id=>b.runEvent('ModifyDamage',q,p,Dex.getActiveMove(id),100);
 assert.equal(damage('tackle'),75);
 assert.equal(damage('surf'),100);
 assert(p.hasAbility('innerfocus'));
 q.setAbility('Cloud Nine');
 assert.equal(damage('tackle'),100);
});
it('Mountainbreaker hits Levitate and removes walls only after direct damage', () => {
 const [p,q]=setup('Mountainbreaker');
 q.setAbility('Levitate');q.maxhp=q.baseMaxhp=q.hp=2000;
 q.side.addSideCondition('reflect',q);
 q.addVolatile('protect',q);
 b.actions.useMove('earthquake',p,{target:q});
 assert(q.side.getSideCondition('reflect'));
 q.removeVolatile('protect');
 b.actions.useMove('earthquake',p,{target:q});
 assert(q.hp<2000);
 assert(!q.side.getSideCondition('reflect'));
 q.side.addSideCondition('lightscreen',q);
 const hp=q.hp;
 b.actions.useMove('earthpower',p,{target:q});
 assert.equal(q.hp,hp);
 assert(q.side.getSideCondition('lightscreen'));
});
it('Dread Presence denies berries and boosts only its Dark attacks against weakened foes', () => {
 const [p,q]=setup('Dread Presence');q.maxhp=q.baseMaxhp=1000;q.hp=501;
 const power=(user,target,id)=>b.runEvent('BasePower',user,target,Dex.getActiveMove(id),100);
 assert.equal(power(p,q,'crunch'),100);
 q.hp=500;
 assert.equal(power(p,q,'crunch'),130);
 assert.equal(power(p,q,'stoneedge'),100);
 assert.equal(power(q,p,'crunch'),100);
 q.setItem('Sitrus Berry');assert.equal(q.eatItem(),false);
 p.addVolatile('gastroacid',q);
 assert.equal(power(p,q,'crunch'),100);
 assert(q.eatItem());
});
it('Mega retains only old matchup, not new base components',()=>{const[p,q]=setup('Sand Sovereign','Tyranitar-Mega');assert(!p.hasAbility('eartheater'));assert(!p.hasAbility('battlearmor'));const m=Dex.getActiveMove('stoneedge');b.singleEvent('ModifyMove',p.getAbility(),p.abilityState,m,p,q);assert.equal(typeof m.onEffectiveness,'function');q.setType('Steel');assert.equal(m.onEffectiveness.call(b,-1,q,'Steel',m),1);assert(!p.hasAbility('mountainbreaker'));assert.equal(p.species.abilities[0],'Sand Sovereign');});
});
