'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');let b;
function setup(second=false){const mon=(species='Mew',ability='No Ability')=>({species,ability,moves:['splash','shadowball','pollenpuff','rockblast']});b=common.createBattle({gameType:'doubles'},[[mon('Ninetales-Alola'),mon(second?'Ninetales-Alola':'Mew')],[mon(),mon()]]);b.field.terrain='';for(const p of b.getAllActive())p.hp=p.maxhp=p.baseMaxhp=1000;return[b.p1.active[0],b.p1.active[1],b.p2.active[0]];}
function hit(p,t,id,extra={}){b.actions.useMove(Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false,damage:100,secondaries:null},extra),p,{target:t});}
describe('Alolan Ninetales Crystal Ward',()=>{
 afterEach(()=>{b?.destroy();b=null;});
 for(const self of [true,false])for(const move of ['shadowball','energyball','rockblast','pollenpuff'])it('blocks '+move+' for '+(self?'self':'ally'),()=>{const[p,a,q]=setup(),t=self?p:a;hit(q,t,move);assert.equal(t.hp,1000);assert.equal(b.log.filter(x=>x.includes('ice crystals shielded')).length,1);});
 it('multiple holders emit one block message per target',()=>{const[p,a,q]=setup(true);hit(q,a,'shadowball');assert.equal(a.hp,1000);assert.equal(b.log.filter(x=>x.includes('ice crystals shielded')).length,1);});
 it('blocks a classified spread move once per damaged target',()=>{const[p,a,q]=setup(true);hit(q,p,'shadowball',{target:'allAdjacentFoes'});assert.equal(p.hp,1000);assert.equal(a.hp,1000);assert.equal(b.log.filter(x=>x.includes('ice crystals shielded')).length,2);});
 for(const move of ['darkpulse','surf','tackle'])it('does not grant custom Bulletproof extras against '+move,()=>{const[p,a,q]=setup();hit(q,a,move);assert.equal(a.hp,900);});
 it('allied Pollen Puff heals normally',()=>{const[p,a]=setup();a.hp=400;b.actions.useMove('pollenpuff',p,{target:a});assert.equal(a.hp,900);assert(!b.log.some(x=>x.includes('ice crystals shielded')));});
 for(const kind of ['gastroacid','neutralizinggas','moldbreaker','inactive','fainted'])it('ends ally protection for '+kind,()=>{const[p,a,q]=setup();if(kind==='gastroacid')p.addVolatile('gastroacid');if(kind==='neutralizinggas')q.setAbility('Neutralizing Gas');if(kind==='moldbreaker')q.setAbility('Mold Breaker');if(kind==='inactive')p.isActive=false;if(kind==='fainted')p.hp=0;hit(q,a,'shadowball');assert.equal(a.hp,900);});
 it('Ability Shield retains local Mold Breaker protection',()=>{const[p,a,q]=setup();p.setItem('abilityshield');q.setAbility('Mold Breaker');hit(q,a,'shadowball');assert.equal(a.hp,1000);});
 it('regular Ninetales and selected Alolan slots are unchanged',()=>{assert.deepEqual(Dex.species.get('ninetalesalola').passives,['crystalward']);assert.deepEqual(Dex.species.get('ninetales').passives,['cursedbody']);assert.deepEqual(Dex.species.get('ninetalesalola').abilities,{0:'Magic Bounce',1:'Serene Grace',H:'Void Sanctum'});});
});
