'use strict';
const assert=require('assert').strict,common=require('../../common');
const {Dex}=require('../../../dist/sim/dex');
const {abilityIncludesComponent}=require('../../../dist/data/ability-components');
describe('Latest four approved base-form changes',()=>{
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
  if (battle.runEvent('BeforeMove',p,t,m) === false) return m;battle.actions.useMove(m,p,{target:t});const active=battle.activeMove;
  battle.runEvent('AfterMove',p,t,active);return active;
 }
 function residual(p){battle.singleEvent('Residual',p.getAbility(),p.abilityState,p);}
 function out(p){battle.singleEvent('SwitchOut',p.getAbility(),p.abilityState,p);}
 it('changes exactly the four base forms and preserves alternate/powered forms',()=>{
  assert.deepEqual(Dex.species.get('feraligatr').types,['Water','Dragon']);
  assert.deepEqual(Dex.species.get('dragonite').abilities,{0:'Inner Focus',1:'Sea Rescuer',H:'Multiscale'});
  assert.deepEqual(Dex.species.get('dragapult').abilities,{0:'Clear Body',1:'Infiltrator',H:'Dreepy Vanguard'});
  assert.deepEqual(Dex.species.get('raichu').abilities,{0:'Static',1:'Grounding Tail',H:'Lightning Rod'});
  for(const id of ['feraligatrmega','feraligatrgmax','dragonitemega','dragapultgmax','raichualola','raichumegax','raichumegay']){
   const before={"feraligatrmega":{"types":["Water","Dragon"],"abilities":{"0":"Draconic Force"}},"feraligatrgmax":{"types":["Water","Dark"],"abilities":{"0":"Tidal Jaw"}},"dragonitemega":{"types":["Dragon","Flying"],"abilities":{"0":"Celestial Heart"}},"dragapultgmax":{"types":["Dragon","Ghost"],"abilities":{"0":"Phantom Barrage"}},"raichualola":{"types":["Electric","Psychic"],"abilities":{"0":"Surge Surfer","1":"Levitate","H":"Inner Focus"}},"raichumegax":{"types":["Electric"],"abilities":{"0":"Surge Conduit"}},"raichumegay":{"types":["Electric"],"abilities":{"0":"Railgun Circuit"}}}[id],now=Dex.species.get(id);
   assert.deepEqual(now.types,before.types,id);assert.deepEqual(now.abilities,before.abilities,id);
  }
 });
 it('Sea Rescuer produces a real player-selected pivot after healing Roost',()=>{
  const[p,t]=setup('Sea Rescuer');p.moveSlots[0]={...p.moveSlots[0],move:'Roost',id:'roost',pp:10,maxpp:10};p.hp-=100;const hp=p.hp;
  battle.makeChoices('move 1','move 1');assert(p.hp>hp);assert.equal(battle.requestState,'switch');assert(p.side.activeRequest.forceSwitch[0]);
  battle.choose('p1','switch 2');assert.notEqual(battle.p1.active[0],p);
 });
 it('Sea Rescuer does not pivot on full HP, Heal Block, Taunt or another recovery move',()=>{
  const[p,t]=setup('Sea Rescuer');use(p,p,'roost');assert(!p.switchFlag);assert(!p.m.seaRescuerUsed);
  p.hp-=100;p.addVolatile('healblock');use(p,p,'roost');assert(!p.switchFlag);assert(!p.m.seaRescuerUsed);p.removeVolatile('healblock');
  p.addVolatile('taunt',t);use(p,p,'roost');assert(!p.switchFlag);p.removeVolatile('taunt');use(p,p,'recover');assert(!p.switchFlag);assert(!p.m.seaRescuerUsed);
 });
 it('Sea Rescuer cannot refresh through an ability swap',()=>{const[p]=setup('Sea Rescuer');p.hp-=100;use(p,p,'roost');assert(p.switchFlag);p.switchFlag=false;p.setAbility('No Ability');p.setAbility('Sea Rescuer');p.hp-=100;use(p,p,'roost');assert(!p.switchFlag);});
 for(const category of ['Physical','Special'])it('Dreepy Vanguard removes only the '+category+' screen after both darts',()=>{
  const[p,t]=setup('Dreepy Vanguard');p.storedStats.atk=category==='Physical'?200:100;p.storedStats.spa=category==='Special'?200:100;
  for(const name of ['reflect','lightscreen','auroraveil'])t.side.addSideCondition(name,t);
  const before=[],old=battle.actions.getDamage;battle.actions.getDamage=function(s,target,m,...args){if(m.id==='dragondarts')before.push(!!target.side.sideConditions[category==='Physical'?'reflect':'lightscreen']);return old.call(this,s,target,m,...args);};
  const move=use(p,t,'dragondarts');assert.equal(move.category,category);assert.deepEqual(before,[true,true]);assert(!t.side.sideConditions[category==='Physical'?'reflect':'lightscreen']);assert(t.side.sideConditions[category==='Physical'?'lightscreen':'reflect']);assert(t.side.sideConditions.auroraveil);
  t.side.addSideCondition(category==='Physical'?'reflect':'lightscreen',t);p.setAbility('No Ability');p.setAbility('Dreepy Vanguard');use(p,t,'dragondarts');assert(t.side.sideConditions[category==='Physical'?'reflect':'lightscreen']);
 });
 it('Dreepy Vanguard excludes other moves, allies, immunity and Substitute-only damage',()=>{
  const[p,t]=setup('Dreepy Vanguard','doubles');t.side.addSideCondition('reflect',t);use(p,t);assert(!p.m.dreepyVanguardUsed);
  t.setType('Fairy');use(p,t,'dragondarts',{smartTarget:false,multihit:1});assert(!p.m.dreepyVanguardUsed);t.setType('Normal');t.addVolatile('substitute');t.volatiles.substitute.hp=999;use(p,t,'dragondarts',{smartTarget:false});assert(!p.m.dreepyVanguardUsed);
  use(p,p.side.active[1],'dragondarts',{smartTarget:false});assert(!p.m.dreepyVanguardUsed);assert(t.side.sideConditions.reflect);
 });
 it('Dreepy Vanguard preserves Stalwart tracking and field boosts',()=>{const[p,t]=setup('Dreepy Vanguard');const m=battle.dex.getActiveMove('tackle');battle.runEvent('ModifyMove',p,t,m,m);assert(m.tracksTarget);battle.field.setTerrain('fairytaleterrain',p);const before=p.boosts.spa;battle.singleEvent('Start',p.getAbility(),p.abilityState,p);assert.equal(p.boosts.spa,before+1);});
 it('Dreepy Vanguard only clears FFA sides actually damaged',()=>{const[p,t]=setup('Dreepy Vanguard','ffa');p.storedStats.atk=200;p.storedStats.spa=100;for(const side of battle.sides.slice(1))side.addSideCondition('reflect',side.active[0]);use(p,t,'dragondarts');assert(!t.side.sideConditions.reflect);assert(battle.p3.sideConditions.reflect);assert(battle.p4.sideConditions.reflect);});
 it('Grounding Tail clears only its own web and gives no Ground immunity or Speed boost',()=>{const[p,t]=setup('Grounding Tail','ffa');for(const side of battle.sides)side.addSideCondition('stickyweb',side.active[0]);use(p,t,'thundershock');assert(!p.side.sideConditions.stickyweb);for(const side of battle.sides.slice(1))assert(side.sideConditions.stickyweb);assert.equal(p.boosts.spe,0);assert(p.runImmunity('Ground'));p.side.addSideCondition('stickyweb',p);p.setAbility('No Ability');p.setAbility('Grounding Tail');use(p,t,'thundershock');assert(p.side.sideConditions.stickyweb);});
 it('Grounding Tail excludes immune, allied, substitute and non-Electric attacks',()=>{const[p,t]=setup('Grounding Tail','doubles');p.side.addSideCondition('stickyweb',p);t.setType('Ground');use(p,t,'thundershock');assert(!p.m.groundingTailUsed);t.setType('Normal');t.addVolatile('substitute');use(p,t,'thundershock');assert(!p.m.groundingTailUsed);use(p,p.side.active[1],'thundershock');use(p,t);assert(p.side.sideConditions.stickyweb);assert(!p.m.groundingTailUsed);});
 it('new entry budgets refresh after a genuine switch, even if ability was changed before leaving',()=>{const[p,t]=setup('Grounding Tail');use(p,t,'thundershock');assert(p.m.groundingTailUsed);p.setAbility('No Ability');battle.makeChoices('switch 2','move 1');battle.makeChoices('switch 2','move 1');p.setAbility('Grounding Tail');assert(!p.m.groundingTailUsed);p.side.addSideCondition('stickyweb',p);use(p,t,'thundershock');assert(!p.side.sideConditions.stickyweb);});

});
