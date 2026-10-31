'use strict';
const assert=require('assert').strict,common=require('../../common');
const {Dex}=require('../../../dist/sim');
describe('Hoenn Mastery abilities',()=>{
 let b;afterEach(()=>b?.destroy());
 function start(ability){b=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Mew',ability,moves:['splash']}],[{species:'Mew',ability:'No Ability',moves:['splash']}]]);b.makeChoices('team 1','team 1');b.randomChance=(n,d)=>n>=d;b.randomizer=n=>n;return[b.p1.active[0],b.p2.active[0]];}
 function hit(p,t,id,extra={}){b.clearActiveMove();const m=b.dex.getActiveMove(id);Object.assign(m,{accuracy:true,willCrit:false,basePower:20,secondaries:undefined},extra);b.actions.useMove(m,p,{target:t});const used=b.activeMove;b.runEvent('AfterMove',p,t,used);b.clearActiveMove();return used;}
 it('only replaces the three selected base slots and retains Mega kits/passives',()=>{
  for(const[id,slot,name,passive,mega]of [['sceptile','1','Canopy Mastery','overgrow','Raging Thicket'],['blaziken','1','Blaze Mastery','blaze','Raging Flame'],['swampert','H','Tidal Mastery','torrent','Raging Current']]){assert.equal(Dex.species.get(id).abilities[slot],name);assert.deepEqual(Dex.species.get(id).passives,[passive]);assert.equal(Dex.species.get(id+'mega').abilities[0],mega);assert.deepEqual(Dex.species.get(id+'mega').passives,['proficient']);}
 });
 it('Canopy Mastery makes Grass adaptive, retains Dual Wield and applies the overlap boost once',()=>{
  const[p,t]=start('Canopy Mastery');p.boosts.spa=2;t.hp=t.maxhp=t.baseMaxhp=2000;
  const hits=[],original=b.actions.getDamage;b.actions.getDamage=function(s,target,move,...args){const d=original.call(this,s,target,move,...args);if(s===p&&move.id==='leafblade')hits.push(d);return d;};
  const m=hit(p,t,'leafblade');assert.equal(m.category,'Special');assert.equal(m.overrideDefensiveStat,'spd');assert.equal(m.multihitType,'dualwield');assert.equal(m.multihit,2);
  assert.equal(hits.length,2);assert(hits[0]>hits[1]*5,'boosted first hit and reduced follow-up');b.actions.getDamage=original;
  const raw=b.dex.getActiveMove('leafblade');assert.equal(b.runEvent('BasePower',p,t,raw,100,true),130);
  p.boosts.atk=4;assert.equal(hit(p,t,'energyball').category,'Physical');
  p.addVolatile('gastroacid',t);const off=hit(p,t,'leafblade');assert.equal(off.category,'Physical');assert(!off.multihit);
 });
 it('Blaze Mastery stacks kick power to 1.82x, removes contact, and clears only lowered Attack/Speed',()=>{
  const[p,t]=start('Blaze Mastery');const m=b.dex.getActiveMove('blazekick');assert.equal(b.runEvent('BasePower',p,t,m,100,true),182);
  p.boosts.atk=-2;p.boosts.spe=-1;p.boosts.def=-2;t.setAbility('Rough Skin');const hp=p.hp;
  const used=hit(p,t,'blazekick');assert(!used.flags.contact);assert.equal(p.hp,hp);assert.equal(p.boosts.atk,0);assert.equal(p.boosts.spe,0);assert.equal(p.boosts.def,-2);
  p.boosts.atk=-1;hit(p,t,'blazekick');assert.equal(p.boosts.atk,-1);
  b.turn++;p.boosts.atk=2;hit(p,t,'blazekick');assert.equal(p.boosts.atk,2);
 });
 it('blocked kicks do not clear drops, crash damage remains, and Substitute damage qualifies',()=>{
  const[p,t]=start('Blaze Mastery');p.boosts.atk=-1;t.addVolatile('protect');const hp=p.hp;
  hit(p,t,'highjumpkick');assert.equal(p.boosts.atk,-1);assert(p.hp<hp);t.removeVolatile('protect');
  t.addVolatile('substitute');hit(p,t,'blazekick');assert.equal(p.boosts.atk,0);
 });
 it('Tidal Mastery keeps Damp and rewards a foe that already attempted its move',()=>{
  const[p,t]=start('Tidal Mastery');assert(p.hasAbility('damp'));const move=b.dex.getActiveMove('surf');
  assert.equal(b.runEvent('BasePower',p,t,move,100,true),100);t.moveThisTurn='splash';assert.equal(b.runEvent('BasePower',p,t,move,100,true),130);
  t.moveThisTurn='';t.moveThisTurnResult=false;assert.equal(b.runEvent('BasePower',p,t,move,100,true),130);
  t.moveThisTurnResult=true;assert.equal(b.runEvent('BasePower',p,t,move,100,true),100);
  const hp=p.hp;hit(t,p,'explosion');assert.equal(p.hp,hp);assert(t.hp);
 });
 it('Tidal Mastery ignores positive physical defenses but retains negative stages and special defenses',()=>{
  const[p,t]=start('Tidal Mastery');t.hp=t.maxhp=t.baseMaxhp=3000;
  let before=t.hp;hit(p,t,'waterfall');const ordinary=before-t.hp;t.boosts.def=6;before=t.hp;hit(p,t,'waterfall');assert.equal(before-t.hp,ordinary);
  t.boosts.def=-2;before=t.hp;hit(p,t,'waterfall');assert(before-t.hp>ordinary);
  assert(!hit(p,t,'surf').ignorePositiveDefensive);p.addVolatile('gastroacid',t);assert(!hit(p,t,'waterfall').ignorePositiveDefensive);
 });
});
