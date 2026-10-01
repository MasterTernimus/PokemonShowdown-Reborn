'use strict';
const assert=require('assert').strict,common=require('../../common');
const {Dex}=require('../../../dist/sim/dex');
const {abilityIncludesComponent}=require('../../../dist/data/ability-components');
describe('Approved server audit fixes',()=>{
 let battle;afterEach(()=>{battle?.destroy();battle=undefined;});
 function setup(ability,format='singles'){
  const p={species:'Mew',ability,moves:['splash','healbell']},f={species:'Mew',ability:'No Ability',moves:['splash']};
  const formats={singles:'gen9nofieldsinglesgame',doubles:'gen9nofielddoublesbattle',ffa:'gen9freeforall4pmistyfieldadrienn'};
  const teams=format==='ffa'?[[p,f],[f,f],[f,f],[f,f]]:format==='doubles'?[[p,f,f],[f,f,f]]:[[p,f],[f,f]];
  battle=common.createBattle({formatid:formats[format]},teams);battle.makeChoices(...teams.map(t=>t.length===3?'team 123':'team 12'));
  battle.randomChance=(n,d)=>n>=d;battle.randomizer=n=>n;
  return[battle.p1.active[0],battle.p2.active[0]];
 }
 function use(p,t,id='tackle',extra={}){
  const m=battle.dex.getActiveMove(id);Object.assign(m,{accuracy:true,willCrit:false,basePower:m.category==='Status'?0:20,secondaries:undefined},extra);
  battle.runEvent('BeforeMove',p,t,m);battle.actions.useMove(m,p,{target:t});const active=battle.activeMove;
  battle.runEvent('AfterMove',p,t,active);return active;
 }
 function residual(p){battle.singleEvent('Residual',p.getAbility(),p.abilityState,p);}
 function out(p){battle.singleEvent('SwitchOut',p.getAbility(),p.abilityState,p);}
 const {resolveForesight}=require('../../../dist/data/foresight-memory');
 function queue(p,t){use(p,t,'psychic',{basePower:1});const e=battle.field.pseudoWeather.foresightmemory.entries[0];assert(e);return e;}
 function resolve(entry){battle.turn=entry.turn;resolveForesight(battle);battle.faintMessages();}
 function swapBack(p,t){use(t,p,'skillswap');use(t,p,'skillswap');}
 const budgets={'Steel Plumage':'steelPlumageUsed','Temple Chime':'templeChimeUsed','Solar Hydra':'solarBudSpent','Storm Calling':'dissonantEchoUsed'};
 function trigger(p,t,a){
  if(a==='Steel Plumage'){use(t,p);return t.side.sideConditions.spikes?.layers||0;}
  if(a==='Temple Chime'){p.side.removeSideCondition('safeguard');p.boosts.spd=-2;p.setStatus('par');use(p,p,'healbell');return p.boosts.spd===0;}
  if(a==='Solar Hydra'){battle.field.clearTerrain();battle.field.setWeather('sunnyday',p);residual(p);const ready=!!p.abilityState.solarBudReady;use(p,t,'vinewhip',{multihit:1,basePower:1});return ready;}
  t.setType('Water');use(p,t,'hypervoice',{basePower:1});const marked=!!p.abilityState.echoTarget;use(p,t,'hypervoice',{basePower:1});return marked;
 }
 for(const[a,marker]of Object.entries(budgets)){
  it(a+' cannot refresh through two real Skill Swaps, replacements or suppression',()=>{
   const[p,t]=setup(a);trigger(p,t,a);assert(p.m[marker]);swapBack(p,t);assert(p.m[marker]);
   assert.equal(trigger(p,t,a),a==='Steel Plumage'?1:false);
   p.setAbility('No Ability');p.setAbility(a);p.addVolatile('gastroacid');p.removeVolatile('gastroacid');assert(p.m[marker]);assert.equal(trigger(p,t,a),a==='Steel Plumage'?1:false);
  });
  it(a+' refreshes after a genuine switch even if another ability was held on entry',()=>{
   const[p,t]=setup(a);trigger(p,t,a);p.setAbility('No Ability');battle.makeChoices('switch 2','move 1');battle.makeChoices('switch 2','move 1');p.setAbility(a);assert(!p.m[marker]);assert.equal(trigger(p,t,a),a==='Steel Plumage'?2:true);
  });
 }
 it('pending Echo marks and Solar Buds survive temporary suppression without refreshing their spent limits',()=>{
  const[p,t]=setup('Storm Calling');t.setType('Water');use(p,t,'hypervoice',{basePower:1});assert(p.m.dissonantEchoUsed);p.addVolatile('gastroacid');p.removeVolatile('gastroacid');const m=use(p,t,'hypervoice',{basePower:1});assert.equal(t.getMoveHitData(m).typeMod,0);assert(!p.abilityState.echoTarget);
  p.setAbility('Solar Hydra');battle.field.setWeather('sunnyday',p);residual(p);assert(p.abilityState.solarBudReady);p.addVolatile('gastroacid');p.removeVolatile('gastroacid');use(p,t,'vinewhip',{multihit:1,basePower:1});assert(p.m.solarBudSpent);assert(!p.abilityState.solarBudReady);
 });
 it('Transform does not copy a spent entry budget to another Pokemon',()=>{const[p,t]=setup('Steel Plumage');use(t,p);assert(p.m.steelPlumageUsed);assert(t.transformInto(p));assert(!t.m.steelPlumageUsed);use(p,t);assert(t.m.steelPlumageUsed);});
 it('whole-turn stored Foresight cannot award a false Destiny Bond win',()=>{
  const[p,t]=setup('Perfect Foresight');queue(p,t);battle.makeChoices('move 1','move 1');t.hp=1;t.moveSlots[0]={...t.moveSlots[0],id:'destinybond',move:'Destiny Bond',pp:5,maxpp:5};const hp=p.hp,left=p.side.pokemonLeft;
  battle.makeChoices('move 1','move 1');assert(!battle.ended);assert.equal(p.hp,hp);assert(!p.fainted);assert.equal(p.side.pokemonLeft,left);assert(t.fainted);
 });
 it('a final opposing Destiny Bond KO awards victory to the living real owner',()=>{
  battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Alakazam',ability:'Perfect Foresight',moves:['splash']}],[{species:'Mew',ability:'No Ability',moves:['splash','destinybond']}]]);
  battle.makeChoices('team 1','team 1');battle.randomChance=(n,d)=>n>=d;battle.randomizer=n=>n;
  const p=battle.p1.active[0],t=battle.p2.active[0];queue(p,t);battle.makeChoices('move 1','move 1');t.hp=1;const hp=p.hp;
  battle.makeChoices('move 1','move 2');assert(battle.ended,JSON.stringify({turn:battle.turn,hp:t.hp,log:battle.log.slice(-30)}));assert.equal(battle.winner,battle.p1.name);assert.equal(p.hp,hp);assert(!p.fainted);assert.equal(p.side.pokemonLeft,1);assert(t.fainted);
 });
 for(const state of ['active','switched','fainted'])it('Innards Out retaliation uses only the real '+state+' source',()=>{
  const[p,t]=setup('Perfect Foresight');const entry=queue(p,t);t.setAbility('Innards Out');t.hp=10;
  if(state==='switched')battle.makeChoices('switch 2','move 1');
  if(state==='fainted'){p.faint();battle.faintMessages();p.switchFlag=true;battle.makeRequest('switch');battle.makeChoices('switch 2','');}
  p.hp=state==='fainted'?0:5;const replacement=battle.p1.active[0],replacementHP=replacement.hp,left=p.side.pokemonLeft;
  resolve(entry);assert(t.fainted);
  if(state==='active'){assert(p.fainted);assert.equal(p.side.pokemonLeft,left-1);}
  else {assert.equal(p.hp,state==='fainted'?0:5);assert.equal(replacement.hp,replacementHP);assert.equal(p.side.pokemonLeft,left);}
 });
 it('stored attacks are noncontact and do not trigger Rough Skin or Aftermath',()=>{
  const[p,t]=setup('Perfect Foresight');let entry=queue(p,t);t.setAbility('Rough Skin');const hp=p.hp;resolve(entry);assert.equal(p.hp,hp);
  entry=queue(p,t);t.setAbility('Aftermath');t.hp=1;resolve(entry);assert.equal(p.hp,hp);assert(!p.fainted);
 });
 it('stored attacks do not gain owner ability or item procs when the owner changes',()=>{
  const[p,t]=setup('Perfect Foresight');const entry=queue(p,t);p.setAbility('Ultra Ego');p.setItem('shellbell');p.hp=100;resolve(entry);assert.equal(p.hp,100);
 });
 it('retaliation damage uses the real owner defenses rather than the offense snapshot',()=>{
  const[p,t]=setup('Perfect Foresight');const entry=queue(p,t);p.setAbility('Magic Guard');t.setAbility('Innards Out');t.hp=10;const hp=p.hp;resolve(entry);assert.equal(p.hp,hp);assert(!p.fainted);
 });
 it('stored damage keeps the saved offense while effects receive the real source and correct type metadata',()=>{
  const[p,t]=setup('Perfect Foresight');p.boosts.spa=2;const entry=queue(p,t);const expected=battle.actions.getDamage(p,t,{...battle.dex.getActiveMove('psychic'),basePower:90,willCrit:false});p.storedStats.spa=1;p.boosts.spa=-6;const hp=t.hp;let observed;
  battle.onEvent('AfterDamageApplied',battle.format,(d,target,source,m)=>{if(m?.foresightStored)observed={source,typeMod:target.getMoveHitData(m).typeMod};});resolve(entry);assert.equal(hp-t.hp,expected);assert.equal(observed.source,p);assert.equal(observed.typeMod,-1);assert.equal(p.storedStats.spa,1);assert.equal(p.boosts.spa,-6);
 });

});
