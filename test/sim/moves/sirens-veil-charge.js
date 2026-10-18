'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
describe('Approved Sirens Veil ready charge',()=>{
 let b;afterEach(()=>{b?.destroy();b=null;});
 function setup(doubles=false){const mon={species:'Mew',ability:'No Ability',moves:['sirensveil','splash','tackle','doublehit','surf']};b=common.createBattle({gameType:doubles?'doubles':'singles'},[[mon,mon],[{...mon,ability:'Levitate'},mon]]);if(b.requestState==='teampreview')b.makeChoices();b.field.terrain='';for(const p of b.getAllActive())p.hp=p.maxhp=p.baseMaxhp=5000;return[b.p1.active[0],b.p2.active[0]];}
 function use(p,q,id,extra={}){b.actions.runMove(Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false},extra),p,p.getLocOf(q),{externalMove:true});}
 it('keeps defensive boosts and suppression; repeated Veil does not stack charge',()=>{const[p,q]=setup();use(p,p,'sirensveil');use(p,p,'sirensveil');assert.equal(p.boosts.def,2);assert.equal(p.boosts.spd,2);assert.equal(p.boosts.atk,0);assert.equal(p.boosts.spa,0);assert(q.volatiles.gastroacid);assert.equal(b.runEvent('BasePower',p,q,Dex.getActiveMove('tackle'),100),130);use(p,p,'splash');assert(p.volatiles.sirensveil);});
 for(const mode of ['hit','miss','protect','immune'])it('consumes on damaging attempt '+mode,()=>{const[p,q]=setup();use(p,p,'sirensveil');if(mode==='protect')q.addVolatile('protect');if(mode==='immune')q.setType('Ghost');use(p,q,'tackle',mode==='miss'?{accuracy:0}:{});assert(!p.volatiles.sirensveil);});
 for(const id of ['doublehit','surf'])it('boosts every hit/target of '+id+' once',()=>{const[p,q]=setup(id==='surf');use(p,p,'sirensveil');const values=[],old=b.actions.getDamage;b.actions.getDamage=function(source,target,move,...rest){if(source===p)values.push(b.runEvent('BasePower',source,target,move,100));return old.call(this,source,target,move,...rest);};use(p,q,id);assert(values.length>=2);assert(values.every(v=>v===130),String(values));assert(!p.volatiles.sirensveil);});
 it('clears on switch',()=>{const[p,q]=setup();use(p,p,'sirensveil');b.makeChoices('switch 2','move splash');assert(!p.volatiles.sirensveil);});
 it('preserves Ability Shield suppression protection while granting charge',()=>{const[p,q]=setup();q.setItem('Ability Shield');use(p,p,'sirensveil');assert(!q.volatiles.gastroacid);assert(p.volatiles.sirensveil);});
});
