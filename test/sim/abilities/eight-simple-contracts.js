'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
describe('Eight approved simple ability contracts',()=>{
 let battle;afterEach(()=>{battle?.destroy();battle=null;});
 function setup(ability,gameType='singles'){
  const mon={species:'Mew',ability:'No Ability',moves:['splash','magneticflux','helpinghand','tackle']};
  battle=common.createBattle({gameType},[[{...mon,ability},{...mon}],[{...mon},{...mon}]]);
  for(const p of battle.getAllActive())p.hp=p.maxhp=p.baseMaxhp=4000;
  return[battle.p1.active[0],battle.p2.active[0],battle.p1.active[1]];
 }
 function use(p,q,id,extra={}){battle.clearActiveMove();battle.actions.useMove(Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false},extra),p,{target:q});}
 function modify(p,q,id){const m=Dex.getActiveMove(id);battle.runEvent('ModifyMove',p,q,m,m);return m;}
 function incoming(p,q,typeMod=0,type='Normal'){const m=Dex.getActiveMove('tackle');m.type=type;p.getMoveHitData(m).typeMod=typeMod;return battle.runEvent('ModifyDamage',q,p,m,100);}
 it('Web Assassin keeps speed and conditional crit ratio, but normal crit damage and Speed drops',()=>{
  const[p,q]=setup('Web Assassin');assert.equal(battle.runEvent('ModifySpe',p,null,null,100),200);
  const m=Dex.getActiveMove('tackle');assert.equal(battle.runEvent('ModifyCritRatio',p,q,m,1),1);q.setStatus('psn');assert.equal(battle.runEvent('ModifyCritRatio',p,q,m,1),5);
  q.cureStatus();q.boosts.spe=-1;assert.equal(battle.runEvent('ModifyCritRatio',p,q,m,1),5);q.getMoveHitData(m).crit=true;assert.equal(battle.runEvent('ModifyDamage',p,q,m,100),100);
  battle.boost({spe:-1},p,q);assert.equal(p.boosts.spe,-1);
 });
 it('Pendulum Swing keeps Insomnia and only its own accuracy guarantee, without Filter',()=>{
  const[p,q]=setup('Pendulum Swing');assert(!p.trySetStatus('slp',q));assert(!p.addVolatile('yawn',q));
  assert.equal(modify(p,q,'hypnosis').accuracy,true);assert.notEqual(modify(q,p,'hypnosis').accuracy,true);
  assert.equal(incoming(p,q),100);assert.equal(incoming(p,q,1),100);assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('shadowball'),100),130);
 });
 it('unrelated Nightmare Pulse retains its prior Filter reduction',()=>{
  const[p,q]=setup('Nightmare Pulse');assert.equal(incoming(p,q),80);assert.equal(incoming(p,q,1),60);
 });
 it('Cavern Drake absorbs Ground and keeps Solid Rock but respects opposing abilities',()=>{
  const[p,q]=setup('Cavern Drake');p.hp=2000;use(q,p,'earthpower');assert.equal(p.hp,3000);assert.equal(incoming(p,q),80);assert.equal(incoming(p,q,1),60);
  q.setAbility('Water Absorb');q.hp=2000;use(p,q,'surf');assert.equal(q.hp,3000);assert(!modify(p,q,'tackle').ignoreAbility);
  p.hp=2000;battle.field.setTerrain('caveterrain',p);battle.singleEvent('Residual',p.getAbility(),p.abilityState,p);assert.equal(p.hp,2250);
 });
 it('Plush Whiplash retains entry accuracy, tail power and Technician without either Fluffy modifier',()=>{
  const[p,q]=setup('Plush Whiplash');assert.equal(p.boosts.accuracy,1);assert.equal(incoming(p,q),100);assert.equal(incoming(p,q,0,'Fire'),100);
  assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('tailslap'),25),56);assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('tackle'),40),60);
 });
 it('Resonance Force keeps side-wide sound power and allied damaging-sound immunity with normal stat selection',()=>{
  const[p,q,ally]=setup('Resonance Force','doubles');p.storedStats.atk=999;p.storedStats.spa=10;
  assert.equal(modify(p,q,'hypervoice').overrideOffensiveStat,undefined);assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('hypervoice'),100),150);assert.equal(battle.runEvent('BasePower',ally,q,Dex.getActiveMove('hypervoice'),100),150);
  use(ally,p,'boomburst');assert.equal(p.hp,4000);assert(q.hp<4000);
 });
 for(const ability of ['Riot Amp','Tremor'])it(ability+' retains its unrelated higher-offense behavior',()=>{
  const[p,q]=setup(ability);p.storedStats.atk=999;p.storedStats.spa=10;assert.equal(modify(p,q,'hypervoice').overrideOffensiveStat,'atk');
 });
 it('Probopass replaces only its hidden slot and keeps the Nose Formation passive',()=>{
  assert.deepEqual(Dex.species.get('probopass').abilities,{0:'Magnet Pull',1:'Magnetic Command',H:'Filter'});assert.deepEqual(Dex.species.get('probopass').passives,['noseformation']);
 });
 for(const ability of ['Filter','Magnetic Bulwark'])it(ability+' has ordinary Magnetic Flux rules and no special budget',()=>{
  const[p,q,ally]=setup(ability,'doubles');use(p,p,'magneticflux');assert.equal(p.boosts.def,0);assert.equal(ally.boosts.def,0);assert.equal(p.m.magneticBulwarkSpent,undefined);
  ally.setAbility('Plus');use(p,p,'magneticflux');assert.equal(ally.boosts.def,1);assert.equal(p.boosts.def,0);
  use(p,p,'magneticflux');assert.equal(ally.boosts.def,2);
  battle.field.setTerrain('electricterrain',p);use(p,p,'magneticflux');assert.equal(p.boosts.def,2);assert.equal(ally.boosts.def,4);
 });
 it('Cactus Chorus keeps its two full components and Helping Hand no longer cures confusion',()=>{
  const[p,q,ally]=setup('Cactus Chorus','doubles');ally.addVolatile('confusion');ally.newlySwitched=true;use(p,ally,'helpinghand');assert(ally.volatiles.confusion);assert(ally.volatiles.helpinghand);
  p.hp=2000;use(q,p,'watergun');assert.equal(p.hp,3000);battle.field.setTerrain('desertterrain',p);assert.equal(battle.runEvent('ModifySpe',p,null,null,100),200);
 });
 it('Noble Armor keeps defenses and cold recovery, but contact cannot inflict frostbite',()=>{
  const[p,q]=setup('Noble Armor');battle.randomChance=()=>true;use(q,p,'tackle');assert.equal(q.status,'');assert.equal(incoming(p,q),80);assert.equal(incoming(p,q,1),60);
  battle.field.setTerrain('coldeclipseterrain',p);assert.equal(battle.runEvent('ModifyDef',p,q,Dex.getActiveMove('tackle'),300),400);
  p.hp=2000;battle.singleEvent('Residual',p.getAbility(),p.abilityState,p);assert.equal(p.hp,2250);
  battle.field.setWeather('hail',p);battle.singleEvent('Weather',p.getAbility(),p.abilityState,p,p,Dex.conditions.get('hail'));assert.equal(p.hp,2750);
 });
 it('the shared Ice Body primitive still inflicts contact frostbite',()=>{
  const[p,q]=setup('Ice Body');battle.randomChance=()=>true;use(q,p,'tackle');assert.equal(q.status,'frz');
 });
});
