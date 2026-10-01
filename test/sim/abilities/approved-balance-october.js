'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim/dex');

describe('Approved Soul Cremation, Dread Maw and Star Boxer balance', () => {
 let battle;
 afterEach(() => { battle?.destroy(); battle = null; });
 function setup(ability = 'Soul Cremation', doubles = false, foeAbility = 'No Ability') {
  const a = {species: 'Mew', level: 50, ability, moves: ['splash', 'firepunch', 'poweruppunch', 'drainpunch']};
  const b = {species: 'Blissey', ability: foeAbility, moves: ['splash', 'recover', 'substitute', 'protect']};
  battle = common.createBattle({formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame'},
   doubles ? [[a, {...a, ability: 'No Ability'}], [b, {...b}]] : [[a], [b, {...b}]]);
  battle.makeChoices(doubles ? 'team 12' : 'team 1', doubles ? 'team 12' : 'team 1');
  return [battle.p1.active[0], battle.p2.active[0]];
 }
 function hit(source, target, id = 'flamethrower', overrides = {}) {
  const move = battle.dex.getActiveMove(id);
  Object.assign(move, {accuracy: true, willCrit: false, secondaries: undefined}, overrides);
  battle.actions.useMove(move, source, {target});
  return battle.activeMove;
 }
 it('assigns Soul Cremation and exposes only its approved components', () => {
  const [p] = setup();
  assert.equal(Dex.species.get('Chandelure-Mega').abilities[0], 'Soul Cremation');
  for (const id of ['soulsiphon', 'flamebody']) assert(p.hasAbility(id));
  for (const id of ['shadowtag', 'soulfire']) assert(!p.hasAbility(id));
 });
 it('siphons actual HP damage and aggregates rounding across multiple hits', () => {
  const [p,t] = setup(); p.hp = 1;
  const hp = t.hp;
  hit(p,t,'flamethrower',{basePower: 10, multihit: 3});
  assert.equal(p.hp - 1, Math.min(Math.floor((hp-t.hp)/3),Math.floor(p.maxhp/6)));
  assert(t.volatiles.soulsiphonblock);
 });
 it('shares the cap across spread targets, repeated attacks and healing amplifiers', () => {
  const [p,t] = setup('Soul Cremation',true); p.hp=1; p.setItem('bigroot');
  hit(p,t,'heatwave',{basePower:200,target:'allAdjacentFoes'});
  hit(p,t,'flamethrower',{basePower:200});
  assert.equal(p.hp-1,Math.floor(p.maxhp/6));
  assert(battle.p2.active.every(x=>x.volatiles.soulsiphonblock));
 });
 it('does not siphon substitutes, allies, residuals or add siphon to native drain', () => {
  const [p,t] = setup('Soul Cremation',true); p.hp=1;
  t.addVolatile('substitute');
  hit(p,t,'flamethrower',{basePower:1});
  assert.equal(p.hp,1); assert(!t.volatiles.soulsiphonblock);
  hit(p,battle.p1.active[1],'flamethrower',{basePower:1});
  assert.equal(p.hp,1);
  battle.damage(9,t,p,battle.dex.conditions.get('brn'));
  assert.equal(p.hp,1);
  t.removeVolatile('substitute'); const hp=t.hp;
  hit(p,t,'flamethrower',{basePower:10,drain:[1,2]});
  assert.equal(p.hp-1,Math.round((hp-t.hp)/2)); assert(t.volatiles.soulsiphonblock);
 });
 it('does not credit overkill and respects Liquid Ooze', () => {
  const [p,t]=setup();p.hp=1;t.hp=5;
  hit(p,t);assert.equal(p.hp,2);
  battle.destroy();battle=null;
  const [q,u]=setup('Soul Cremation',false,'Liquid Ooze');q.hp=100;
  hit(q,u);assert(q.hp<100);
 });
 it('blocks healing through the following turn, refreshes and clears on switch', () => {
  const [p,t]=setup();hit(p,t,'flamethrower',{basePower:1});
  assert.equal(battle.heal(10,t),false);
  battle.makeChoices('move splash','move splash');
  assert(t.volatiles.soulsiphonblock);assert.equal(battle.heal(10,t),false);
  hit(p,t,'flamethrower',{basePower:1});assert.equal(t.volatiles.soulsiphonblock.duration,2);
  battle.makeChoices('move splash','move splash');
  assert(t.volatiles.soulsiphonblock);
  battle.makeChoices('move splash','move splash');assert(!t.volatiles.soulsiphonblock);
  hit(p,t,'flamethrower',{basePower:1});
  battle.makeChoices('move splash','switch 2');assert(!t.volatiles.soulsiphonblock);
 });
 it('keeps full Flame Body field entry and contact behavior, without Soul Fire absorption', () => {
  const [p,t]=setup();
  battle.field.setTerrain('coldeclipseterrain',p);
  p.boosts.def=0;p.boosts.spd=0;
  battle.singleEvent('Start',p.getAbility(),p.abilityState,p);
  assert.equal(p.boosts.def,1);assert.equal(p.boosts.spd,1);
  battle.field.clearTerrain();battle.randomChance=()=>true;
  hit(t,p,'tackle',{basePower:1});assert.equal(t.status,'brn');
  const hp=p.hp;hit(t,p,'flamethrower',{basePower:1});assert(p.hp<hp);
 });
 it('Dread Maw retains Huge Power and Invigorate, gains Frisk and allows Intimidate', () => {
  const [p,t]=setup('Dread Maw');
  assert(p.hasAbility('hugepower'));assert(p.hasAbility('frisk'));assert(p.hasAbility('invigorate'));
  assert(!p.hasAbility('strongjaw'));assert(!p.hasAbility('hypercutter'));
  t.setItem('leftovers');battle.singleEvent('Start',p.getAbility(),p.abilityState,p);
  assert(battle.log.some(x=>x.includes('Frisk')&&x.includes('Leftovers')));
  t.setAbility('intimidate');assert.equal(p.boosts.atk,-1);
  const move=battle.dex.getActiveMove('crunch');
  assert.equal(battle.runEvent('BasePower',p,t,move,80),80);
 });
 it('Star Boxer keeps base power and applies self boosts only after all four hits', () => {
  const [p,t]=setup('Star Boxer');const boosts=[];const powers=[];
  battle.onEvent('Damage',battle.format,(d,target,source,move)=>{
   if(source===p&&target===t){boosts.push(source.boosts.atk);powers.push(move.basePower);}return d;
  });
  hit(p,t,'poweruppunch',{secondaries:[{chance:100,self:{boosts:{atk:1}}}]});
  assert.deepEqual(boosts,[0,0,0,0]);assert.deepEqual(powers,[40,40,40,40]);assert.equal(p.boosts.atk,1);
 });
 it('Star Boxer rolls secondary effects once and reacts to contact on every hit', () => {
  const [p,t]=setup('Star Boxer');let calls=0;let contacts=0;
  battle.onEvent('DamagingHit',battle.format,(d,target,source,move)=>{if(source===p&&target===t&&move.flags.contact)contacts++;});
  hit(p,t,'firepunch',{secondaries:[{chance:100,onHit(){calls++;}}]});
  assert.equal(calls,1);assert.equal(contacts,4);
 });
 it('Star Boxer has no extra 1.5 multiplier and deals roughly 1.6 times a normal punch', () => {
  const [p,t]=setup('Star Boxer');
  const move=battle.dex.getActiveMove('firepunch');
  assert.equal(battle.runEvent('BasePower',p,t,move,75),75);
  const damages=[];battle.onEvent('Damage',battle.format,(d,target,source)=>{if(source===p&&target===t)damages.push(d);return d;});
  hit(p,t); // non-punch control must remain single-hit
  assert.equal(damages.length,1);damages.length=0;
  hit(p,t,'firepunch');assert.equal(damages.length,4);
  const split=damages.reduce((a,b)=>a+b,0);damages.length=0;
  p.setAbility('No Ability');hit(p,t,'firepunch');
  assert(split/damages[0]>1.3&&split/damages[0]<1.9);
 });
 it('Star Boxer stops on a KO without retargeting and respects Protect', () => {
  const [p,t]=setup('Star Boxer',true);const other=battle.p2.active[1];const hp=other.hp;t.hp=1;
  hit(p,t,'firepunch');assert.equal(other.hp,hp);
  other.addVolatile('protect');hit(p,other,'firepunch');assert.equal(other.hp,hp);
 });
 it('Star Boxer uses normal per-hit Drain Punch recovery', () => {
  const [p,t]=setup('Star Boxer');p.hp=1;const damages=[];
  battle.onEvent('AfterDamageApplied',battle.format,(d,target,source)=>{if(source===p&&target===t)damages.push(d);});
  hit(p,t,'drainpunch');
  assert.equal(p.hp-1,damages.reduce((a,d)=>a+Math.round(d/2),0));
 });
});
