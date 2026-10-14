'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');let battle;
function setup(field='',ability='No Ability',item='',targetSpecies='Mew') {const s=(species,ability,item='')=>({species,ability,item,moves:['tripledive','shadowforce','protect','splash']});battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[s('Mew','No Ability',item)],[s(targetSpecies,ability)]]);battle.makeChoices('team 1','team 1');if(field)battle.field.startTerrain(field);const[p,q]=[battle.p1.active[0],battle.p2.active[0]];q.hp=q.maxhp=q.baseMaxhp=5000;battle.randomChance=(n,d)=>n===90||n>=d;return[p,q];}
function use(p,q,id='tripledive',extra={}) {const m=Object.assign(Dex.getActiveMove(id),{willCrit:false},extra);battle.actions.useMove(m,p,{target:q});}
describe('Triple Dive and Shadow Force fields',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const start of ['', 'icyterrain','watersurfaceterrain','underwaterterrain'])it('Triple Dive per-hit fields from '+(start||'none'),()=>{const[p,q]=setup(start);const seen=[];const original=battle.actions.getDamage;battle.actions.getDamage=function(s,t,m,...rest){if(m.id==='tripledive')seen.push([m.hit,this.battle.field.terrain,m.basePowerCallback.call(this.battle,s,t,m)]);return original.call(this,s,t,m,...rest);};use(p,q);assert.deepEqual(seen,[[1,start==='icyterrain'?'icyterrain':'watersurfaceterrain',20],[2,start==='icyterrain'?'watersurfaceterrain':'underwaterterrain',40],[3,'underwaterterrain',60]]);assert.equal(battle.field.terrain,'underwaterterrain');});
 for(const item of ['', 'amplifieldrock'])it('new field duration '+item,()=>{const[p,q]=setup('','No Ability',item);use(p,q);assert.equal(battle.field.terrainState.duration,item?8:5);});
 for(const failAt of [1,2,3])it('stops field progression when hit '+failAt+' misses',()=>{const[p,q]=setup();let accuracy=0;battle.randomChance=(n,d)=>n===90?++accuracy<failAt:n>=d;use(p,q);assert.equal(battle.field.terrain,['','', 'watersurfaceterrain','underwaterterrain'][failAt]);});
 for(const ability of ['Water Absorb','Storm Drain','Dry Skin'])it(ability+' prevents field generation',()=>{const[p,q]=setup('',ability);use(p,q);assert.equal(battle.field.terrain,'');});
 it('Protect prevents field generation',()=>{const[p,q]=setup();q.addVolatile('protect');use(p,q);assert.equal(battle.field.terrain,'');});
 it('Substitute hits count',()=>{const[p,q]=setup();q.addVolatile('substitute');use(p,q);assert.equal(battle.field.terrain,'underwaterterrain');});
 for(const field of ['chessboardterrain','glitchterrain','newworldterrain','dragonsdenterrain'])it('respects '+field+' lock',()=>{const[p,q]=setup(field);use(p,q);assert.equal(battle.field.terrain,field);});
 for(const ability of ['Neutralization','Pulse Blockade'])it('respects '+ability,()=>{const[p,q]=setup('',ability);const before=battle.field.terrain;use(p,q);assert.equal(battle.field.terrain,before);});
 for(const item of ['', 'amplifieldrock'])it('Shadow Force creates Midnight only on attack, '+item,()=>{const[p,q]=setup('','No Ability',item);use(p,q,'shadowforce');assert.equal(battle.field.terrain,'');use(p,q,'shadowforce');assert.equal(battle.field.terrain,'midnightzoneterrain');assert.equal(battle.field.terrainState.duration,item?8:5);});
 it('Shadow Force retains Protect breaking',()=>{const[p,q]=setup();use(p,q,'shadowforce');q.addVolatile('protect');use(p,q,'shadowforce');assert.equal(battle.field.terrain,'midnightzoneterrain');assert(q.hp<q.maxhp);});
 it('Shadow Force respects Normal immunity',()=>{const[p,q]=setup();q.setType('Normal');use(p,q,'shadowforce');use(p,q,'shadowforce');assert.equal(battle.field.terrain,'');});
 it('Shadow Force respects field locks',()=>{const[p,q]=setup('chessboardterrain');use(p,q,'shadowforce');use(p,q,'shadowforce');assert.equal(battle.field.terrain,'chessboardterrain');});
 it('Shadow Force creates Midnight after Substitute damage',()=>{const[p,q]=setup();q.addVolatile('substitute');use(p,q,'shadowforce');use(p,q,'shadowforce');assert.equal(battle.field.terrain,'midnightzoneterrain');});
 for(const field of ['watersurfaceterrain','underwaterterrain'])it('exact 2.25x Water and named power on '+field,()=>{const[p,q]=setup(field);assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('tripledive'),100),225);});
 it('a second-hit miss leaves the original Icy field intact',()=>{const[p,q]=setup('icyterrain');let n=0;battle.randomChance=(a,b)=>a===90?++n===1:a>=b;use(p,q);assert.equal(battle.field.terrain,'icyterrain');});
 it('Bad Seeds locks Cold Eclipse',()=>{const[p,q]=setup('coldeclipseterrain','Bad Seeds');use(p,q);assert.equal(battle.field.terrain,'coldeclipseterrain');});
 it('preserves existing temporary field duration',()=>{const[p,q]=setup('watersurfaceterrain');battle.field.setTerrainDuration(3);use(p,q);assert.equal(battle.field.terrainState.duration,3);});
 it('Shadow Force miss does not create a field',()=>{const[p,q]=setup();use(p,q,'shadowforce');use(p,q,'shadowforce',{accuracy:0});assert.equal(battle.field.terrain,'');});
 for(const [species,ability] of [['Eiscue','Ice Face'],['Mimikyu','Disguise']])it('Shadow Force blocked by '+ability+' does not create Midnight',()=>{
  const[p,q]=setup('',ability,'',species);q.hp=q.maxhp=q.baseMaxhp=2*q.species.baseStats.hp+141;const hp=q.hp;p.storedStats.atk=200;p.storedStats.spa=100;
  use(p,q,'shadowforce');use(p,q,'shadowforce');
  assert.equal(battle.field.terrain,'');assert.equal(battle.activeMove.category,'Physical');assert.equal(q.getMoveHitData(battle.activeMove).damage||0,0);
  if(ability==='Ice Face')assert.equal(q.hp,hp);else assert(q.hp<hp,'Disguise bust damage must not count as move damage');
 });
});
