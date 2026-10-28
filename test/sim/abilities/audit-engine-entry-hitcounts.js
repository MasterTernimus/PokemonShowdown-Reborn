'use strict';
const assert = require('assert').strict;
const {Battle, Dex} = require('../../../dist/sim');
const calculator = require('../../../dist/sim/custom-calculator');

describe('Audit A1 Controlled Fury entry state', () => {
 let battle;
 afterEach(() => { battle?.destroy(); });
 function setup(species = 'Emboar', ability = 'Controlled Fury') {
  const mon = {species:'Mew', ability:'No Ability', moves:['splash','watergun']};
  battle = new Battle({formatid:'gen9nofieldsinglesgame', p1:{team:[{...mon,species,ability},mon]}, p2:{team:[mon,{...mon,species:'Weezing',ability:'Neutralizing Gas'}]}});
  if (battle.requestState === 'teampreview') battle.makeChoices('team 12','team 12');
  for (const side of battle.sides) for (const p of side.pokemon) p.hp=p.maxhp=p.baseMaxhp=10000;
  return [battle.p1.active[0],battle.p2.active[0]];
 }
 function hit(source, target, crit = false) {
  battle.clearActiveMove();
  const move = Object.assign(Dex.getActiveMove('watergun'), {basePower:1,accuracy:true,willCrit:crit});
  battle.actions.useMove(move,source,{target});
 }
 it('does not replenish a spent bonus when opposing Neutralizing Gas naturally leaves', () => {
  const [p, q] = setup();
  hit(q, p);
  assert.equal(p.boosts.atk,1);
  battle.makeChoices('move splash','switch 2');
  assert(p.ignoringAbility());
  battle.makeChoices('move splash','switch 2');
  hit(q, p);
  assert.equal(p.boosts.atk,1);
 });
 for (const [species,ability] of [['Emboar','Controlled Fury'],['Tauros','No Ability']]) for (const initial of [-6,6]) {
  it(species+' first critical at '+initial+' uses only the maximum response and spends ordinary eligibility', () => {
   const [p,q] = setup(species,ability); p.boosts.atk=initial;
   const boosts=[], original=battle.boost;
   battle.boost=function(boost,target,...rest) { if(target===p && boost.atk) boosts.push(boost.atk); return original.call(this,boost,target,...rest); };
   hit(q,p,true); assert.equal(p.boosts.atk,6);
   assert.deepEqual(boosts,[12]);
   battle.boost=original;
   p.boosts.atk=0; hit(q,p); assert.equal(p.boosts.atk,0);
   p.boosts.atk=-6; hit(q,p,true); assert.equal(p.boosts.atk,6);
  });
 }
 it('preserves spent state across selected ability loss and reacquisition', () => {
  const [p,q] = setup(); hit(q,p);
  p.setAbility('No Ability'); p.setAbility('Controlled Fury'); hit(q,p);
  assert.equal(p.boosts.atk,1);
 });
 it('initial acquisition mid-entry grants the first available hit and a spent critical still reaches maximum', () => {
  const [p,q] = setup('Mew','No Ability'); hit(q,p);
  p.setAbility('Controlled Fury'); hit(q,p); assert.equal(p.boosts.atk,1);
  p.boosts.atk=-6; hit(q,p,true); assert.equal(p.boosts.atk,6);
 });
 for (const [species,ability] of [['Emboar','Controlled Fury'],['Tauros','Controlled Fury'],['Annihilape','Raging Heart']]) {
  it(species+' resets only on actual re-entry and selected/passive overlap does not double it', () => {
   const [p,q] = setup(species,ability); hit(q,p); hit(q,p); assert.equal(p.boosts.atk,1);
   battle.makeChoices('switch 2','move splash'); battle.makeChoices('switch 2','move splash');
   assert.equal(p.boosts.atk,0); hit(battle.p2.active[0],p); assert.equal(p.boosts.atk,1);
  });
 }
});

describe('Audit A8 per-target sequence hit counts', () => {
 let battle;
 afterEach(() => { battle?.destroy(); });
 function run(move, options = {}) {
  const format = options.ffa ? calculator.calculatorFormats().find(f=>f.gameType==='freeforall').id : 'gen9nofielddoublesbattle';
  const scenario = calculator.validateScenario({format,move,actors:[{species:'Mew',ability:options.ability||'Hydra Bond'},...Array.from({length:3},()=>({species:'Mew',ability:'No Ability'}))]});
  const state = calculator.buildCalculatorBattle(scenario,0); battle=state.battle;
  const mons = state.mons;
  for (const p of mons) p.hp=p.maxhp=p.baseMaxhp=10000;
  if (options.ko) mons[1].hp=1;
  if (options.sub) { mons[1].addVolatile('substitute'); mons[1].volatiles.substitute.hp=options.sub; }
  if (options.protect) mons[3].addVolatile('protect');
  const m = Object.assign(Dex.getActiveMove(move),{accuracy:true,willCrit:false});
  if (options.count) m.multihit=options.count;
  if (options.miss) {m.multiaccuracy=true;m.accuracy=90;let rolls=0;const chance=battle.randomChance.bind(battle);battle.randomChance=(n,d)=>d===100?++rolls===1:chance(n,d);}
  battle.actions.runMove(m,mons[0],mons[0].getLocOf(mons[1]));
  return mons;
 }
 it('credits only remaining native strikes to the partner after a first-hit KO', () => {
  const p=run('bulletseed',{ko:true});
  assert.deepEqual(p.map(m=>m.timesAttacked),[0,1,0,4]);
  assert.deepEqual(p.map(m=>m.m.rageFistBonus||0),[0,20,0,80]);
 });
 it('preserves the native two-target Dragon Darts split', () => {
  const p=run('dragondarts');
  assert.deepEqual(p.map(m=>m.timesAttacked),[0,1,0,1]);
 });
 it('keeps Substitute-only sequences at zero progress', () => {
  const p=run('bulletseed',{sub:10000});
  assert.equal(p[1].timesAttacked,0);assert.equal(p[1].m.rageFistBonus||0,0);
 });
 it('counts successful Substitute strikes when that same target also takes HP damage', () => {
  const p=run('bulletseed',{sub:1});
  assert.equal(p[1].timesAttacked,5);assert.equal(p[1].m.rageFistBonus,100);
 });
 it('does not credit a protected retarget after the initial KO', () => {
  const p=run('bulletseed',{ko:true,protect:true});
  assert.equal(p[1].timesAttacked,1);assert.equal(p[3].timesAttacked,0);
 });
 it('does not credit later accuracy failures', () => {
  const p=run('populationbomb',{miss:true});
  assert.equal(p[1].timesAttacked,1);
 });
 it('preserves intentional FFA hits for each actual target', () => {
  const p=run('doublehit',{ffa:true});
  assert.deepEqual(p.map(m=>m.timesAttacked),[0,3,3,3]);
 });
 it('retains per-target progress on switching', () => {
  const p=run('bulletseed',{ko:true});
  const before=[p[3].timesAttacked,p[3].m.rageFistBonus];
  p[3].clearVolatile();
  assert.deepEqual([p[3].timesAttacked,p[3].m.rageFistBonus],before);
 });
});
