'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
describe('Adaptive Pledge categories',()=>{
 let battle;afterEach(()=>{battle?.destroy();battle=null;});
 for(const id of ['firepledge','waterpledge','grasspledge'])for(const[atk,spa,boosts,category]of [[200,100,{},'Physical'],[100,200,{},'Special'],[100,100,{},'Special'],[100,200,{atk:3},'Physical'],[200,100,{atk:-3},'Special'],[100,200,{},'Special']])it(id+' '+atk+'/'+spa+' '+JSON.stringify(boosts)+' -> '+category,()=>{
 const set={species:'Mew',ability:'No Ability',moves:[id,'splash']};battle=common.createBattle({gameType:'singles'},[[set],[set]]);const p=battle.p1.active[0],q=battle.p2.active[0];p.storedStats.atk=atk;p.storedStats.spa=spa;Object.assign(p.boosts,boosts);p.setItem('Choice Band');p.status='brn';q.storedStats.def=600;q.storedStats.spd=60;q.hp=q.maxhp=10000;battle.randomizer=x=>x;battle.randomChance=()=>false;
 const m=Dex.getActiveMove(id);battle.singleEvent('ModifyMove',m,{},p,q,m,m);assert.equal(m.category,category);assert.equal(m.overrideOffensiveStat,category==='Physical'?'atk':'spa');assert.equal(m.overrideDefensiveStat,category==='Physical'?'def':'spd');const expected=battle.actions.getDamage(p,q,Object.assign(Dex.getActiveMove(id),{category,willCrit:false}));const actual=battle.actions.getDamage(p,q,Object.assign(m,{willCrit:false}));assert.equal(actual,expected);assert.equal(Dex.moves.get(id).category,'Special');
 const seen=[];battle.onEvent('ModifyMove',battle.format,-100,function(move){if(move.id===id)seen.push(move.category);});battle.actions.useMove(Object.assign(Dex.getActiveMove(id),{willCrit:false}),p,{target:q});assert(seen.includes(category));
 });
 it('preserves every existing Pledge callback outside category selection',()=>{const fs=require('fs'),before=require('../../../artifacts/adaptive-pledges/before.json'),s=fs.readFileSync('data/moves.ts','utf8');for(const[id,old]of Object.entries(before.blocks)){const a=s.indexOf('\t'+id+': {'),b=s.indexOf('\n\t},',a)+5;assert.equal(s.slice(a,b).replace('\t\tonModifyMove(move, pokemon) {\n\t\t\tuseHigherOffensiveStat(pokemon, move);\n\t\t},\n',''),old);}});
});
