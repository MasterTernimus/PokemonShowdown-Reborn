'use strict';
const assert=require('assert').strict;
const common=require('../../common');
const {Dex}=require('../../../dist/sim/dex');
const mon=(species='Mew',ability='No Ability',item='')=>({species,ability,item,moves:['splash']});
describe('Approved Shelgon, Pupitar and Zweilous passives',()=>{
 let battle;
 afterEach(()=>{battle?.destroy();battle=null;});
 function start(holder,foe=mon(),format='singles'){
  const teams=[[holder,mon()],[foe,mon()]];
  if(format==='ffa')teams.push([mon(),mon()],[mon(),mon()]);
  battle=common.createBattle({formatid:format==='ffa'?'gen9freeforall4pmistyfieldadrienn':format==='doubles'?'gen9nofielddoublesbattle':'gen9nofieldsinglesgame'},teams);
  battle.makeChoices(...teams.map(()=>'team 12'));
  battle.randomChance=(n,d)=>n>=d;battle.randomizer=n=>n;
  return[battle.p1.active[0],battle.p2.active[0]];
 }
 function hit(p,t,id='tackle',extra={}){
  const move=battle.dex.getActiveMove(id);Object.assign(move,{accuracy:true,willCrit:false,basePower:30,secondaries:undefined},extra);
  battle.actions.useMove(move,p,{target:t});return battle.activeMove;
 }
 it('assigns only the three requested passives, preserving selectable abilities',()=>{
  for(const[id,passive,ability]of [['shelgon','shellarmor','Dreaming Shell'],['pupitar','eartheater','Pressure Jet'],['zweilous','hydrabond','Rival Appetites']]){
   const s=Dex.species.get(id);assert.deepEqual(s.passives,[passive]);assert(Object.values(s.abilities).includes(ability));assert(s.nfe);
  }
  for(const id of ['dragonair','metang','gabite','sliggoo','sliggoohisui','hakamoo'])assert.deepEqual(Dex.species.get(id).passives,[]);
 });
 it('Shelgon retains Eviolite, prevents critical hits and reduces damage with full Shell Armor',()=>{
  const[p,t]=start(mon('Shelgon','Dreaming Shell','Eviolite'));
  const move=battle.dex.getActiveMove('tackle');move.willCrit=false;
  assert.equal(battle.runEvent('ModifyDef',p,t,move,1000),1500);
  assert.equal(battle.runEvent('ModifySpD',p,t,move,1000),1500);
  assert.equal(battle.runEvent('CriticalHit',p,t,move),false);
  const reduced=battle.actions.getDamage(t,p,move),get=p.getPassives;p.getPassives=()=>[];
  const ordinary=battle.actions.getDamage(t,p,move);p.getPassives=get;assert(reduced<ordinary);
  p.setStatus('slp');assert.equal(battle.actions.getDamage(t,p,move),reduced);
  p.cureStatus();battle.boost({atk:-1},p,t);assert.equal(p.boosts.spd,2);
 });
 it('Shelgon receives Shell Armor’s field entry boost only once with a copied selected Shell Armor',()=>{
  const[p]=start(mon('Shelgon','Shell Armor'));
  battle.field.setTerrain('dragonsdenterrain',p,p.getAbility());
  battle.makeChoices('switch 2','move splash');battle.makeChoices('switch 2','move splash');
  assert.equal(p.boosts.def,1);
 });
 it('Pupitar absorbs Ground damage without spending Pressure Jet, and Mold Breaker bypasses it',()=>{
  const[p,t]=start(mon('Pupitar','Pressure Jet','Eviolite'));p.hp=100;
  hit(t,p,'earthpower');assert.equal(p.hp,100+Math.round(p.baseMaxhp/4));assert.equal(p.boosts.spe,0);
  t.setAbility('Mold Breaker');const hp=p.hp;hit(t,p,'earthpower');assert(p.hp<hp);assert.equal(p.boosts.spe,2);
 });
 it('Earth Eater stays innate under Gastro Acid and does not double its healing when selected too',()=>{
  const[p,t]=start(mon('Pupitar','Earth Eater'));p.hp=50;
  hit(t,p,'earthpower');assert.equal(p.hp,50+Math.round(p.baseMaxhp/4));
  p.addVolatile('gastroacid',t);const hp=p.hp;hit(t,p,'earthpower');assert.equal(p.hp,hp+Math.round(p.baseMaxhp/4));
 });
 for(const format of ['singles','doubles','ffa'])it('Zweilous combines Rival Appetites with native Hydra Bond in '+format,()=>{
  const[p,t]=start(mon('Zweilous','Rival Appetites'),mon(),format);p.hp=10;
  const move=hit(p,t,'bite');assert(p.hp>10);assert.deepEqual(move.drain,[1,4]);
  if(format==='ffa'){
   assert(move.hydraBondSingleTargetSpread);assert(!move.multihit);
   for(const side of battle.sides.slice(1))assert(side.active[0].hp<side.active[0].maxhp);
  }else assert.equal(move.multihit,3);
  p.setAbility('Hydra Bond');const copied=hit(p,t,'tackle');assert(format==='ffa'?copied.hydraBondSingleTargetSpread:copied.multihit===3);
 });
});
