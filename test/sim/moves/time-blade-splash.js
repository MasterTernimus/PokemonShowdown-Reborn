'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
describe('Approved Time Blade splash',()=>{
 let b;afterEach(()=>{b?.destroy();b=null;});
 function setup(doubles=true,field=''){const mon={species:'Mew',ability:'No Ability',moves:['splash']};b=common.createBattle({gameType:doubles?'doubles':'singles'},[[mon,mon],[mon,mon]]);if(b.requestState==='teampreview')b.makeChoices();b.field.terrain=field;b.field.terrainState=b.initEffectState({id:field,terrainChanges:new Map()});for(const p of b.getAllActive())p.hp=p.maxhp=p.baseMaxhp=1600;const p=b.p1.active[0],q=b.p2.active[0],partner=b.p2.active[1];q.lastMove= Dex.getActiveMove('splash');return[p,q,partner];}
 function use(p,q,extra={}){b.actions.runMove(Object.assign(Dex.getActiveMove('timeblade'),{accuracy:true,willCrit:false,damage:10},extra),p,p.getLocOf(q),{externalMove:true});}
 for(const field of ['', 'fairytaleterrain'])it('splashes once on '+field,()=>{const[p,q,r]=setup(true,field);use(p,q,{multihit:3});assert.equal(r.hp,field?1400:1500);assert.equal(q.hp,1570);assert.equal(q.volatiles.encore.duration,2);assert.equal(b.p1.active[1].hp,1600);assert(!r.volatiles.encore);});
 it('has no splash in singles',()=>{const[p,q]=setup(false);use(p,q);assert.equal(q.hp,1590);assert.equal(b.p2.pokemon[1].hp,b.p2.pokemon[1].maxhp);});
 for(const failure of ['miss','protect','immunity'])it('no splash on main '+failure,()=>{const[p,q,r]=setup();if(failure==='protect')q.addVolatile('protect');if(failure==='immunity')q.setAbility('Wonder Guard');use(p,q,failure==='miss'?{accuracy:0}:{});assert.equal(r.hp,1600);});
 for(const guard of ['protect','substitute','magicguard'])it('native indirect splash vs partner '+guard,()=>{const[p,q,r]=setup();if(guard==='magicguard')r.setAbility('Magic Guard');else r.addVolatile(guard);const hp=r.hp;use(p,q);assert.equal(r.hp,hp-(guard==='magicguard'?0:100));if(guard==='substitute')assert(r.volatiles.substitute);});
 it('main Substitute permits splash without Encore',()=>{const[p,q,r]=setup();q.addVolatile('substitute');use(p,q);assert.equal(r.hp,1500);assert(!q.volatiles.encore);});
 it('main KO still splashes a living partner',()=>{const[p,q,r]=setup();q.hp=1;use(p,q);assert.equal(q.hp,0);assert.equal(r.hp,1500);});
 it('Parental Bond does not duplicate partner splash',()=>{const[p,q,r]=setup();p.setAbility('Parental Bond',null,null,true);assert(p.hasAbility('parentalbond'));use(p,q,{damage:undefined,basePower:20});assert(b.log.some(line=>line.includes('|-hitcount|')&&line.endsWith('|2')));assert.equal(r.hp,1500);});
 it('retains adaptive category and no recursive splash',()=>{const[p,q,r]=setup();p.storedStats.atk=200;p.storedStats.spa=100;use(p,q);assert.equal(b.activeMove.category,'Physical');assert.equal(q.hp,1590);assert.equal(r.hp,1500);});
});
