'use strict';
const assert=require('assert').strict,common=require('../../common');let battle;
describe('140 BP adaptive faint-count moves',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 function setup(){battle=common.createBattle({},[[{species:'Mew',ability:'No Ability',moves:['bunrakubeatdown','lastrespects']}],[{species:'Mew',ability:'No Ability',moves:['splash']}]]);return[battle.p1.active[0],battle.p2.active[0]];}
 for(const id of ['bunrakubeatdown','lastrespects']){
  for(const count of [0,1,3,4,5,8])it(id+' caps current faint count '+count,()=>{const[p,q]=setup();const original=p.side.pokemon;p.side.pokemon=[p,...Array.from({length:count},()=>({fainted:true}))];p.side.totalFainted=100;const m=battle.dex.getActiveMove(id);m.onModifyMove.call(battle,m,p,q);const power=m.basePowerCallback?m.basePowerCallback.call(battle,p,q,m):m.basePower;assert.equal(power,Math.min(140,(id==='lastrespects'?50:80)+(id==='lastrespects'?20:15)*count));p.side.pokemon=original;});
  for(const [atk,spa,boost,category]of [[200,100,0,'Physical'],[100,200,0,'Special'],[100,100,0,'Special'],[200,100,3,'Special']])it(id+' selects '+category+' from staged stats '+[atk,spa,boost],()=>{const[p,q]=setup();p.storedStats.atk=atk;p.storedStats.spa=spa;p.boosts.spa=boost;const m=battle.dex.getActiveMove(id);m.onModifyMove.call(battle,m,p,q);assert.equal(m.category,category);assert(!m.overrideDefensiveStat||m.overrideDefensiveStat===(category==='Physical'?'def':'spd'));});
  it(id+' revival removes power despite a high cumulative counter',()=>{const[p,q]=setup();const old=p.side.pokemon;p.side.pokemon=[p,{fainted:true},{fainted:false}];p.side.totalFainted=99;const power=()=>{const m=battle.dex.getActiveMove(id);m.onModifyMove.call(battle,m,p,q);return m.basePowerCallback?m.basePowerCallback.call(battle,p,q,m):m.basePower;};assert.equal(power(),id==='lastrespects'?70:95);p.side.pokemon[1].fainted=false;assert.equal(power(),id==='lastrespects'?50:80);p.side.pokemon=old;});
 }
 it('Bunraku still bypasses Substitute',()=>{const[p,q]=setup();q.addVolatile('substitute');const hp=q.hp;battle.actions.runMove('bunrakubeatdown',p,p.getLocOf(q));assert(q.hp<hp);assert(q.volatiles.substitute);});
});
