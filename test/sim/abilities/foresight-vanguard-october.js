'use strict';
const assert=require('assert').strict;
const common=require('../../common');

describe('Approved Foresight memory and Vanguard',()=>{
 let battle;
 afterEach(()=>{battle?.destroy();battle=null;});
 function setup(ability='Perfect Foresight',ffa=false,species='Alakazam'){
  const p={species,ability,level:50,item:species==='Alakazam'?'Alakazite':'',moves:['splash','psychic','futuresight','tackle']};
  const foe={species:'Blissey',ability:'No Ability',moves:['splash','protect','substitute','shadowball']};
  battle=common.createBattle({formatid:ffa?'gen9freeforall4pmistyfieldadrienn':'gen9nofieldsinglesgame'},
   ffa?[[p,{...p,ability:'No Ability'}],[foe,{...foe}],[{...foe}],[{...foe}]]:[[p,{...p,ability:'No Ability'}],[foe,{...foe,species:'Umbreon'}]]);
  battle.makeChoices(...Array(ffa?4:2).fill('team 12'));
  return [battle.p1.active[0],battle.p2.active[0]];
 }
 function hit(p,t,id='tackle',extra={}){
  const m=battle.dex.getActiveMove(id);Object.assign(m,{accuracy:true,willCrit:false,secondaries:undefined},extra);
  battle.actions.useMove(m,p,{target:t});return battle.activeMove;
 }
 function entries(){return battle.field.pseudoWeather.foresightmemory?.entries||[];}
 function advance(...choices){battle.makeChoices(...battle.sides.map((s,i)=>choices[i]||'move splash'));}
 function storedHits(){const hits=[];battle.onEvent('AfterDamageApplied',battle.format,(d,t,s,m)=>{
  if(m?.foresightStored)hits.push({turn:battle.turn,target:t,damage:d,source:s,type:m.type});
 });return hits;}
 for(const [ability,delay]of [['Grandmaster',2],['Perfect Foresight',1]]){
  it(`${ability} shares its singles cap between proactive and reactive attacks`,()=>{
   const [p,t]=setup(ability);const hits=storedHits();hit(p,t,'psychic');hit(t,p,'shadowball',{basePower:1,multihit:3});
   assert.equal(entries().length,1);assert.equal(entries()[0].turn,1+delay);assert.equal(entries()[0].type,'Psychic');
   for(let n=0;n<=delay;n++)advance();assert.equal(hits.length,1);assert.equal(entries().length,0);
   advance();assert.equal(hits.length,1);
  });
 }
 it('stores reactive special attacks of any type without reducing incoming damage',()=>{
  const [p,t]=setup();const hp=p.hp;hit(t,p,'surf',{basePower:10});
  assert(p.hp<hp);assert.equal(entries().length,1);assert.equal(entries()[0].type,'Water');
 });
 it('does not enqueue physical retaliation, missed/protected/substitute hits, status or called attacks',()=>{
  const [p,t]=setup();hit(t,p,'tackle',{basePower:1});assert.equal(entries().length,0);
  t.addVolatile('protect');hit(p,t,'psychic');assert.equal(entries().length,0);t.removeVolatile('protect');
  t.addVolatile('substitute');hit(p,t,'psychic',{basePower:1});assert.equal(entries().length,0);t.removeVolatile('substitute');
  hit(p,t,'psychic',{accuracy:0});assert.equal(entries().length,0);
  hit(p,t,'psychic',{sourceEffect:'sleeptalk'});assert.equal(entries().length,0);
  hit(p,t,'toxic');assert.equal(entries().length,0);
 });
 it('FFA accepts all three opponents with one shared slot each and staggered release',()=>{
  const [p]=setup('Perfect Foresight',true);const foes=battle.sides.slice(1).map(s=>s.active[0]);const hits=storedHits();
  for(const t of foes)hit(t,p,'shadowball',{basePower:1,multihit:2});
  for(const t of foes)hit(p,t,'tackle',{basePower:1});
  assert.deepEqual(entries().map(e=>e.turn),[2,3,4]);assert.equal(entries().length,3);
  for(let n=0;n<4;n++)advance();assert.deepEqual(hits.map(x=>x.turn),[2,3,4]);assert.equal(entries().length,0);
 });
 it('Grandmaster retains one pending total even in FFA',()=>{
  const [p]=setup('Grandmaster',true);for(const side of battle.sides.slice(1))hit(side.active[0],p,'shadowball',{basePower:10});
  assert.equal(entries().length,1);assert.equal(entries()[0].turn,3);
 });
 it('stored attacks coexist with ordinary 120 BP Future Sight on the same slot and turn',()=>{
  const [p,t]=setup();const hits=[];battle.onEvent('AfterDamageApplied',battle.format,(d,target,source,m)=>{
   if(m?.foresightStored||m?.flags?.futuremove)hits.push({id:m.id,turn:battle.turn});
  });
  hit(p,t,'futuresight');const ordinary=t.side.slotConditions[t.position].futuremove;
  assert.equal(ordinary.moveData.basePower,120);assert(!ordinary.moveData.perfectForesight);
  advance();hit(p,t,'tackle',{basePower:1});assert.equal(entries().length,1);assert.equal(ordinary.endingTurn,2);
  advance();advance();assert.equal(hits.length,2);assert(hits.every(x=>x.turn===3));
  assert(!t.side.slotConditions[t.position].futuremove);assert.equal(entries().length,0);
 });
 it('keeps queues after source switching and snapshots offense',()=>{
  const [p,t]=setup();p.boosts.spa=2;hit(p,t,'tackle',{basePower:1});const hits=storedHits();
  battle.randomChance=(n,d)=>n>=d;battle.randomizer=n=>n;const expected=battle.actions.getDamage(p,t,{...battle.dex.getActiveMove('psychic'),basePower:90,willCrit:false,secondaries:undefined});p.boosts.spa=-6;p.storedStats.spa=1;
  advance('switch 2');advance();assert.equal(hits.length,1);
  assert.equal(hits[0].source,p);assert.equal(hits[0].damage,expected);assert.equal(p.boosts.spa,0);
 });
 it('keeps queued attacks after the source faints without reviving or healing it',()=>{
  const [p,t]=setup();hit(p,t,'tackle',{basePower:1});const hits=storedHits();
  p.faint();battle.faintMessages();p.switchFlag=true;battle.makeRequest('switch');battle.makeChoices('switch 2','');advance();advance();
  assert.equal(hits.length,1);assert.equal(p.hp,0);assert(p.fainted);assert.equal(entries().length,0);
 });
 it('automatic Miracle Eye applies only to the direct target, not its replacement',()=>{
  const [p,t]=setup();t.setType('Dark');hit(p,t,'psychic',{basePower:1});assert(t.volatiles.miracleeye);
  const hits=storedHits();advance('move splash','switch 2');advance();
  assert.equal(hits.length,0);assert(!battle.p2.active[0].volatiles.miracleeye);assert.equal(entries().length,0);
 });
 it('stored attacks respect Protect, Substitute, live special defense and target abilities',()=>{
  const [p,t]=setup();hit(p,t,'tackle',{basePower:1});advance();const hp=t.hp;
  advance('move splash','move protect');assert.equal(t.hp,hp);assert.equal(entries().length,0);
  hit(p,t,'tackle',{basePower:1});t.addVolatile('substitute');const hp2=t.hp;advance();advance();
  assert.equal(t.hp,hp2);assert.equal(entries().length,0);
 });
 it('Mega creates real five-turn screens once, does not shorten longer screens or duplicate reductions',()=>{
  const [p,t]=setup('Grandmaster');battle.p1.addSideCondition('lightscreen',p);battle.p1.sideConditions.lightscreen.duration=8;
  assert(battle.actions.runMegaEvo(p));assert.equal(p.getAbility().id,'perfectforesight');
  assert.equal(battle.p1.sideConditions.reflect.duration,5);assert.equal(battle.p1.sideConditions.lightscreen.duration,8);
  const m=battle.dex.getActiveMove('psychic');assert.equal(battle.runEvent('ModifyDamage',t,p,m,100),50);
  battle.p1.removeSideCondition('reflect');battle.runEvent('AfterMega',p);assert(!battle.p1.sideConditions.reflect);
 });
 it('FFA real screens reduce damage to two thirds and cover only their own trainer',()=>{
  const [p,t]=setup('Grandmaster',true);assert(battle.actions.runMegaEvo(p));const m=battle.dex.getActiveMove('psychic');
  assert.equal(battle.runEvent('ModifyDamage',t,p,m,100),67);
  assert.equal(battle.runEvent('ModifyDamage',t,battle.p3.active[0],m,100),100);
 });
 it('Vanguard earns one opponent-specific guard, not a blanket FFA reduction',()=>{
  const [p,t]=setup('Vanguard',true,'Arcanine');hit(p,t,'tackle',{basePower:10,multihit:3});
  const m=battle.dex.getActiveMove('tackle');
  assert.equal(battle.runEvent('ModifyDamage',battle.p3.active[0],p,m,100),100);
  assert.equal(battle.runEvent('ModifyDamage',t,p,m,100),50);
  assert.equal(battle.runEvent('ModifyDamage',t,p,m,100),100);
 });
 it('Vanguard needs opposing HP damage, allows Attack drops, and adapts Extreme Speed against Ghost immunity',()=>{
  const [p,t]=setup('Vanguard',false,'Arcanine');t.addVolatile('substitute');hit(p,t,'tackle',{basePower:1});
  assert(!p.m.vanguardGuardAvailable);t.removeVolatile('substitute');
  battle.boost({atk:-1},p,t);assert.equal(p.boosts.atk,-1);
  t.setType('Ghost');const hp=t.hp;hit(p,t,'extremespeed',{basePower:1});assert(t.hp<hp);
  assert.equal(battle.activeMove.type,'Fire');assert.equal(battle.activeMove.critRatio,1);
 });
 it('Vanguard final stand protects direct and residual damage for this turn only and cannot reset',()=>{
  const [p,t]=setup('Vanguard',false,'Arcanine');hit(p,t,'tackle',{basePower:1});
  battle.damage(p.hp+10,p,t,battle.dex.getActiveMove('tackle'));assert.equal(p.hp,1);assert(p.m.vanguardFinalStandUsed);
  for(const id of ['brn','psn','hail','sandstorm','recoil'])battle.damage(100,p,t,battle.dex.conditions.get(id));
  assert.equal(p.hp,1);p.setAbility('No Ability');battle.damage(100,p,t,battle.dex.getActiveMove('tackle'));assert.equal(p.hp,1);
  p.setAbility('Vanguard');assert(p.m.vanguardFinalStandUsed);advance();
  battle.damage(100,p,t,battle.dex.conditions.get('brn'));assert.equal(p.hp,0);
 });
 it('Vanguard does not grant permanent indirect-damage immunity before a successful attack',()=>{
  const [p,t]=setup('Vanguard',false,'Arcanine');const hp=p.hp;
  battle.damage(10,p,t,battle.dex.conditions.get('brn'));assert.equal(p.hp,hp-10);
 });
 it('stores a lethal special hit before fainting when capacity remains',()=>{
  const [p,t]=setup();p.hp=1;hit(t,p,'flamethrower',{basePower:10});
  assert.equal(p.hp,0);assert.equal(entries().length,1);assert.equal(entries()[0].type,'Fire');
 });
 it('keeps normal Future Sight even when the copied ability is Doom Warning',()=>{
  const [p,t]=setup('No Ability');t.setAbility('Doom Warning');p.setAbility('Perfect Foresight');
  assert(p.hasAbility('doomwarning'));hit(p,t,'futuresight');
  assert.equal(t.side.slotConditions[0].futuremove.moveData.basePower,120);
  assert(!t.side.slotConditions[0].futuremove.moveData.perfectForesight);
 });
 it('stored attacks honor Endure and live absorbing abilities',()=>{
  const [p,t]=setup();hit(p,t,'tackle',{basePower:1});advance();t.hp=1;t.addVolatile('endure');
  advance();assert.equal(t.hp,1);assert.equal(entries().length,0);
  t.hp=t.maxhp;hit(t,p,'flamethrower',{basePower:1});assert.equal(entries().length,1);
  t.setAbility('Flash Fire');const hp=t.hp;advance();advance();
  assert.equal(t.hp,hp);assert.equal(entries().length,0);
 });
 it('does not block later FFA releases when an opposing trainer is eliminated',()=>{
  const [p]=setup('Perfect Foresight',true);for(const side of battle.sides.slice(1))hit(side.active[0],p,'surf',{basePower:1});
  assert.equal(entries().length,3);const lost=entries()[0].opponent;
  battle.sides[lost].pokemonLeft=0;const state=battle.field.pseudoWeather.foresightmemory;
  battle.turn=2;battle.singleEvent('FieldResidual',battle.dex.conditions.get('foresightmemory'),state,battle.field);
  assert.equal(entries().length,2);assert(entries().every(e=>e.opponent!==lost));
 });

});
