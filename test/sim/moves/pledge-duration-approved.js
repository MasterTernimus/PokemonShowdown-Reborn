'use strict';
const assert=require('assert').strict,common=require('../../common');
const pairs=[['firepledge','waterpledge','rainbowterrain'],['waterpledge','firepledge','rainbowterrain'],['firepledge','grasspledge','burningterrain'],['grasspledge','firepledge','burningterrain'],['waterpledge','grasspledge','swampterrain'],['grasspledge','waterpledge','swampterrain']];
describe('Pledge field duration uses triggering user item',()=>{
 let battle;afterEach(()=>{battle?.destroy();battle=null;});
 for(const[first,second,field]of pairs)for(const userRock of [false,true])for(const targetRock of [false,true])for(const substitute of [false,true])it(`${first}+${second}: userRock=${userRock}, targetRock=${targetRock}, substitute=${substitute}`,()=>{
 const mon={species:'Mew',ability:'No Ability',moves:['firepledge','waterpledge','grasspledge','splash']};battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[mon],[mon]]);battle.makeChoices();const p=battle.p1.active[0],q=battle.p2.active[0];p.hp=p.maxhp=q.hp=q.maxhp=10000;battle.randomChance=(n,d)=>n>=d;battle.randomizer=x=>x;
 const use=id=>battle.actions.runMove(Object.assign(battle.dex.getActiveMove(id),{accuracy:100,willCrit:false}),p,p.getLocOf(q));use(first);

 if(userRock)p.setItem('Amplifield Rock');if(targetRock)q.setItem('Amplifield Rock');if(substitute){q.addVolatile('substitute');q.volatiles.substitute.hp=9999;}
 use(second);assert.equal(battle.field.terrain,field);assert.equal(battle.field.terrainState.duration,userRock?7:4);assert.deepEqual(Object.keys(battle.field.auras||{}),[]);for(const side of battle.sides)assert.deepEqual(Object.keys(side.sideConditions),[]);
 // Refresh uses the current move user's current item, independently of initial duration.
 p.setItem(userRock?'Leftovers':'Amplifield Rock');use(second);assert.equal(battle.field.terrain,field);assert.equal(battle.field.terrainState.duration,userRock?4:7);
 });
});
