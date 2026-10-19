'use strict';
const assert=require('assert').strict,common=require('../../common');
describe('Void Wrath full Infiltrator addition',()=>{
 let battle;afterEach(()=>battle?.destroy());
 function setup(ability='Void Wrath',opponent='No Ability') {const mon={species:'Mew',ability:'No Ability',moves:['splash']};battle=common.createBattle({formatid:'gen9nofieldsinglesgame',seed:[1,2,3,4]},[[{species:'Garchomp',ability,moves:['outrage','tackle','thunderwave','growl','earthquake','psychic']},mon],[{...mon,ability:opponent},mon]]);battle.makeChoices('team 12','team 12');for(const s of battle.sides)for(const p of s.pokemon)p.hp=p.maxhp=p.baseMaxhp=4800;return[battle.p1.active[0],battle.p2.active[0]];}
 it('bypasses Substitute while leaving it intact',()=>{const[p,q]=setup();q.addVolatile('substitute');const sub=q.volatiles.substitute.hp,hp=q.hp;battle.actions.runMove('tackle',p,p.getLocOf(q));assert(q.hp<hp);assert.equal(q.volatiles.substitute.hp,sub);});
 for(const screen of ['reflect','lightscreen','auroraveil'])it('bypasses '+screen,()=>{function hit(withScreen){const[p,q]=setup();if(withScreen)q.side.addSideCondition(screen,q);const hp=q.hp;battle.actions.runMove(screen==='lightscreen'?'psychic':'tackle',p,p.getLocOf(q));const damage=hp-q.hp;battle.destroy();battle=null;return damage;}assert.equal(hit(true),hit(false));});
 it('bypasses Safeguard',()=>{const[p,q]=setup();q.side.addSideCondition('safeguard',q);battle.actions.runMove('thunderwave',p,p.getLocOf(q));assert.equal(q.status,'par');});
 it('bypasses Mist',()=>{const[p,q]=setup();q.side.addSideCondition('mist',q);battle.actions.runMove('growl',p,p.getLocOf(q));assert.equal(q.boosts.atk,-1);});
 it('retains Mold Breaker against Levitate',()=>{const[p,q]=setup('Void Wrath','Levitate');const hp=q.hp;battle.actions.runMove('earthquake',p,p.getLocOf(q));assert(q.hp<hp);assert(p.hasAbility('moldbreaker'));assert(p.hasAbility('infiltrator'));});
 it('retains unlocked, nonconfusing Outrage',()=>{const[p,q]=setup();for(let i=0;i<4;i++){battle.makeChoices('move outrage','move splash');assert(!p.volatiles.lockedmove);assert(!p.volatiles.confusion);}battle.makeChoices('move tackle','move splash');assert.equal(p.lastMove.id,'tackle');});
});
