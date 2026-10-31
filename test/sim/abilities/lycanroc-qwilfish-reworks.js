'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim/dex');
const mon = (ability='No Ability', species='Mew', item='') => ({species,ability,item,moves:['splash','counter','watergun','tackle']});
describe('Lycanroc options and Qwilfish Spiny Hide',()=>{
 let battle;
 afterEach(()=>{battle?.destroy();battle=null;});
 function start(holder=mon(),foe=mon(),doubles=false){
  const teams=[[holder,mon(),mon()],[foe,mon(),mon()]];
  battle=common.createBattle({formatid:doubles?'gen9nofielddoublesbattle':'gen9nofieldsinglesgame'},teams);
  battle.makeChoices('team 123','team 123');battle.randomChance=(n,d)=>n>=d;battle.randomizer=n=>n;
  return [battle.p1.active[0],battle.p2.active[0]];
 }
 function hit(p,t,id='tackle',extra={}){
  const move=battle.dex.getActiveMove(id);Object.assign(move,{accuracy:true,willCrit:false,basePower:10,secondaries:undefined},extra);
  battle.actions.useMove(move,p,{target:t});return battle.activeMove;
 }
 it('Keen Hunt gives 30% Rock power, increased rather than stacked to 50% against half-HP foes',()=>{
  const[p,t]=start(mon('Keen Hunt'));
  const move=battle.dex.getActiveMove('stoneedge');
  assert.equal(battle.runEvent('BasePower',p,t,move,100,true),130);
  t.hp=Math.floor(t.maxhp/2);assert.equal(battle.runEvent('BasePower',p,t,move,100,true),150);
  assert.equal(battle.runEvent('BasePower',p,t,battle.dex.getActiveMove('tackle'),100,true),100);
  battle.singleEvent('ModifyMove',p.getAbility(),p.abilityState,move,p,t);
  assert.equal(move.accuracy,80);assert(move.ignoreEvasion);
 });
 it('ignores positive Defense at full target HP but preserves negative stages and Sp. Def',()=>{
  const[p,t]=start(mon('Keen Hunt'));
  const move=battle.dex.getActiveMove('stoneedge');move.willCrit=false;
  const neutral=battle.actions.getDamage(p,t,move);
  t.boosts.def=6;assert.equal(battle.actions.getDamage(p,t,move),neutral);
  t.boosts.def=-2;assert(battle.actions.getDamage(p,t,move)>neutral);
  const special=battle.dex.getActiveMove('ancientpower');special.willCrit=false;
  const normal=battle.actions.getDamage(p,t,special);t.boosts.spd=6;
  assert(battle.actions.getDamage(p,t,special)<normal);
 });
 it('Keen Hunt retains Keen Eye, and suppression removes the added Rock power',()=>{
  const[p,t]=start(mon('Keen Hunt'));battle.boost({accuracy:-1},p,t);assert.equal(p.boosts.accuracy,0);
  p.addVolatile('gastroacid',t);
  assert.equal(battle.runEvent('BasePower',p,t,battle.dex.getActiveMove('stoneedge'),100,true),100);
 });
 it('Blood Challenge guards all hits of the first HP-damaging attack each turn',()=>{
  const[p,t]=start(mon('Blood Challenge'));p.hp=p.maxhp=p.baseMaxhp=2000;
  let hp=p.hp;hit(t,p,'seismictoss',{multihit:3});assert.equal(hp-p.hp,195);
  hp=p.hp;hit(t,p,'seismictoss');assert.equal(hp-p.hp,100);
  battle.turn++;hp=p.hp;hit(t,p,'seismictoss');assert.equal(hp-p.hp,65);
 });
 it('ally attacks, Substitute damage, and residual damage do not spend the guard',()=>{
  const[p,t]=start(mon('Blood Challenge'),mon(),true);
  const ally=p.side.active[1];let hp=p.hp;hit(ally,p,'seismictoss');assert.equal(hp-p.hp,100);
  p.addVolatile('substitute');hit(t,p);assert.equal(p.m.bloodChallengeGuardTurn,undefined);p.removeVolatile('substitute');
  battle.damage(10,p,t,battle.dex.conditions.get('brn'));assert.equal(p.m.bloodChallengeGuardTurn,undefined);
  hp=p.hp;hit(t,p,'seismictoss');assert.equal(hp-p.hp,65);
 });
 it('does not refresh the guard through ability changes or another foe in doubles',()=>{
  const[p,t]=start(mon('Blood Challenge'),mon(),true);p.hp=p.maxhp=p.baseMaxhp=2000;
  hit(t,p,'seismictoss');p.setAbility('No Ability');p.setAbility('Blood Challenge');
  const hp=p.hp;hit(t.side.active[1],p,'seismictoss');assert.equal(hp-p.hp,100);
 });
 for(const opposingMove of ['watergun','tackle'])it('Counter answers '+opposingMove+' and heals a quarter of max HP',()=>{
  const[p,t]=start(mon('Blood Challenge'));p.hp=150;
  battle.makeChoices('move counter','move '+opposingMove);
  const received=150+Math.round(p.maxhp/4)-p.hp;
  assert(received>0);assert.equal(t.maxhp-t.hp,received*2);
  assert.equal(p.hp,150-received+Math.round(p.maxhp/4));
 });
 it('Counter healing is once per turn, works on Substitute, and a blocked heal spends the allowance',()=>{
  const[p,t]=start(mon('Blood Challenge'));p.hp=100;
  const fake={damage:10,damageCallback:undefined,onTry:undefined,beforeTurnCallback:undefined};
  t.addVolatile('substitute');hit(p,t,'counter',fake);const hp=p.hp;assert.equal(hp,100+Math.round(p.maxhp/4));
  hit(p,t,'counter',fake);assert.equal(p.hp,hp);
  battle.turn++;p.addVolatile('healblock',t);hit(p,t,'counter',fake);assert.equal(p.hp,hp);
  p.removeVolatile('healblock');hit(p,t,'counter',fake);assert.equal(p.hp,hp);
  battle.turn++;hit(p,t,'counter',fake);assert(p.hp>hp);
 });
 it('Mold Breaker and Gastro Acid bypass the Blood Challenge guard',()=>{
  const[p,t]=start(mon('Blood Challenge'),mon('Mold Breaker'));p.hp=p.maxhp=p.baseMaxhp=1000;
  let hp=p.hp;hit(t,p,'seismictoss');assert.equal(hp-p.hp,100);
  t.setAbility('No Ability');p.addVolatile('gastroacid',t);hp=p.hp;hit(t,p,'seismictoss');assert.equal(hp-p.hp,100);
 });
 it('only regular Qwilfish receives Spiny Hide and both defenses increase 20%',()=>{
  const[p]=start(mon('No Ability','Qwilfish'));assert.deepEqual(p.getPassives(),['spinyhide']);
  assert.equal(battle.runEvent('ModifyDef',p,null,null,1000),1200);
  assert.equal(battle.runEvent('ModifySpD',p,null,null,1000),1200);
  assert.deepEqual(Dex.species.get('qwilfishhisui').passives,[]);
  assert.deepEqual(Dex.species.get('overqwil').passives,['aftermath']);
 });
 it('contact triggers exactly Rough Skin and Poison Point, with no Toxic Spikes',()=>{
  const[p,t]=start(mon('No Ability','Qwilfish'));const hp=t.hp;
  battle.randomChance=()=>true;hit(t,p);assert.equal(hp-t.hp,Math.floor(t.baseMaxhp/8));assert.equal(t.status,'psn');
  assert(!t.side.sideConditions.toxicspikes);
 });
 for(const[ability,item]of[['Long Reach',''],['No Ability','Protective Pads']])it('respects '+(item||ability)+' contact protection',()=>{
  const[p,t]=start(mon('No Ability','Qwilfish'),mon(ability,'Mew',item));const hp=t.hp;
  battle.randomChance=()=>true;hit(t,p);assert.equal(t.hp,hp);assert.equal(t.status,'');
 });
 it('has no contact effects on noncontact attacks',()=>{
  const[p,t]=start(mon('No Ability','Qwilfish'));const hp=t.hp;
  battle.randomChance=()=>true;hit(t,p,'watergun');assert.equal(t.hp,hp);assert.equal(t.status,'');
 });
 it('selected Rough Skin or Poison Point do not duplicate the matching passive effect',()=>{
  const[p,t]=start(mon('Rough Skin','Qwilfish'));let hp=t.hp;hit(t,p);assert.equal(hp-t.hp,Math.floor(t.baseMaxhp/8));
  p.setAbility('Poison Point');let rolls=0;
  battle.randomChance=(n,d)=>{if(n===3&&d===10)rolls++;return n>=d;};hit(t,p);assert.equal(rolls,1);
 });
 it('Mold Breaker bypasses the defensive stat boost but not contact retaliation',()=>{
  const[p,t]=start(mon('No Ability','Qwilfish'));
  hit(t,p);const normal=p.maxhp-p.hp;p.hp=p.maxhp;t.hp=t.maxhp;t.setAbility('Mold Breaker');
  hit(t,p);assert(p.maxhp-p.hp>normal);assert.equal(t.maxhp-t.hp,Math.floor(t.baseMaxhp/8));
 });
});
