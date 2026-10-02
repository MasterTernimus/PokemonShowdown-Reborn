'use strict';
const assert = require('assert').strict;
const common = require('../../common');
describe('Backwash', function () {
 let battle;
 afterEach(() => battle?.destroy());
 function setup(format = 'gen9nofieldsinglesgame') {
  const p = {species:'Kingdra',ability:'Backwash',moves:['waterpulse','dracometeor','surf','splash']};
  const foe = {species:'Blissey',ability:'No Ability',moves:['splash']};
  const teams = format.includes('freeforall') ? [[p],[foe],[foe],[foe]] : format.includes('doubles') ? [[p,foe],[foe,foe]] : [[p],[foe]];
  battle=common.createBattle({formatid:format},teams);
  battle.makeChoices(...teams.map(t=>t.length>1?'team 12':'team 1'));
  if(format.includes('freeforall'))battle.field.changeTerrain('factoryterrain',battle.p1.active[0]);
  battle.randomChance=(n,d)=>n>=d; battle.randomizer=x=>x;
  return [battle.p1.active[0],battle.p2.active[0]];
 }
 function use(p,t,extra={},name='waterpulse') {
  const move=battle.dex.getActiveMove(name);
  Object.assign(move,{accuracy:true,willCrit:false,basePower:40,target:'normal',secondaries:undefined},extra);
  battle.actions.runMove(move,p,p.getLocOf(t));
 }
 it('keeps approved stats and alternate abilities',()=>{
  const[p]=setup();assert.deepEqual(p.species.baseStats,{hp:85,atk:120,def:90,spa:120,spd:90,spe:95});
  assert.deepEqual(p.species.abilities,{0:'Swift Swim',1:'Abyss Sniper',H:'Backwash'});
  assert.equal(battle.dex.abilities.get('backwash').num,11216);
 });
 it('resets only after the complete Water attack in a Draco Meteor cycle',()=>{
  const[p,t]=setup();use(p,t,{},'dracometeor');assert.equal(p.boosts.spa,-2);
  battle.turn++;const hp=t.hp,during=[];
  battle.onEvent('DamagingHit',battle.format,()=>during.push(p.boosts.spa));
  use(p,t,{multihit:3});assert.deepEqual(during,[-2,-2,-2]);assert.equal(p.boosts.spa,0);
  const weakened=hp-t.hp;t.hp=t.maxhp;battle.turn++;const full=t.hp;use(p,t,{multihit:3});
  assert(full-t.hp>weakened);
  battle.turn++;use(p,t,{},'dracometeor');assert.equal(p.boosts.spa,-2);
 });
 it('retains positive and unrelated stages and does not heal',()=>{
  const[p,t]=setup();Object.assign(p.boosts,{atk:-3,spa:2,def:-2,spd:3,spe:-1,accuracy:-2,evasion:1});p.hp=100;
  use(p,t);assert.deepEqual(p.boosts,{atk:0,spa:2,def:-2,spd:3,spe:-1,accuracy:-2,evasion:1});assert.equal(p.hp,100);
  battle.turn++;Object.assign(p.boosts,{atk:2,spa:-4});use(p,t);assert.equal(p.boosts.atk,2);assert.equal(p.boosts.spa,0);
 });
 it('shares one turn allowance across FFA targets and ability replacement',()=>{
  const[p,t]=setup('gen9freeforall4pmistyfieldadrienn');p.boosts.spa=-2;
  const seen=[];battle.onEvent('DamagingHit',battle.format,()=>seen.push(p.boosts.spa));
  use(p,t,{target:'allAdjacent'},'surf');assert.deepEqual(seen,[-2,-2,-2]);assert.equal(p.boosts.spa,0);
  p.boosts.spa=-2;p.setAbility('No Ability');p.setAbility('Backwash');use(p,battle.p3.active[0]);assert.equal(p.boosts.spa,-2);
  battle.turn++;use(p,battle.p4.active[0]);assert.equal(p.boosts.spa,0);
 });
 for(const mode of ['miss','protect','immune','substitute','nonwater','delayed','self','suppressed','status']) {
  it('excludes '+mode,()=>{
   const[p,t]=setup();p.boosts.spa=-2;let extra={};
   if(mode==='miss')extra.accuracy=0;
   if(mode==='protect')t.addVolatile('protect');
   if(mode==='immune')t.setAbility('Water Absorb');
   if(mode==='substitute')t.addVolatile('substitute');
   if(mode==='nonwater')extra.type='Normal';
   if(mode==='delayed')extra.flags={futuremove:1};
   if(mode==='suppressed')p.addVolatile('gastroacid');
   use(p,mode==='self'?p:t,extra,mode==='status'?'splash':'waterpulse');assert.equal(p.boosts.spa,-2);
  });
 }
 it('excludes damage to allies',()=>{
  const[p]=setup('gen9nofielddoublesbattle');p.boosts.spa=-2;use(p,battle.p1.active[1]);assert.equal(p.boosts.spa,-2);
 });
 it('does not reset after recoil faints the holder',()=>{
  const[p,t]=setup();p.boosts.spa=-2;p.hp=1;use(p,t,{damage:40,recoil:[1,1]});assert.equal(p.hp,0);assert.equal(p.m.backwashTurn,undefined);assert(!battle.log.some(line=>line.includes('-setboost')&&line.includes('Backwash')));
 });
 it('does not reset if the holder leaves before the completion hook',()=>{
  const[p,t]=setup();p.boosts.spa=-2;battle.onEvent('DamagingHit',battle.format,()=>{p.isActive=false;});
  use(p,t);assert.equal(p.boosts.spa,-2);
 });
});
