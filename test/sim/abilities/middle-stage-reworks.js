'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim/dex');
const {abilityIncludesComponent} = require('../../../dist/data/ability-components');
const mon = (species='Mew', ability='No Ability', item='') => ({species, ability, item, moves:['splash','rest','reflect','raindance']});
describe('Dodrio and Eviolite middle-stage reworks', () => {
 let battle;
 afterEach(() => {battle?.destroy(); battle = null;});
 function start(holder=mon(), foe=mon(), format='singles') {
  const four = format === 'ffa';
  const teams = [[holder,mon(),mon()],[foe,mon(),mon()]];
  if (four) teams.push([mon(),mon(),mon()],[mon(),mon(),mon()]);
  battle=common.createBattle({formatid:four?'gen9freeforall4pmistyfieldadrienn':format==='doubles'?'gen9nofielddoublesbattle':'gen9nofieldsinglesgame'}, teams);
  battle.makeChoices(...teams.map(()=>'team 123'));
  battle.randomChance=(n,d)=>n>=d; battle.randomizer=n=>n;
  return [battle.p1.active[0],battle.p2.active[0]];
 }
 function hit(p,t,id='tackle',extra={}) {
  const move=battle.dex.getActiveMove(id);
  Object.assign(move,{accuracy:true,willCrit:false,basePower:10,secondaries:undefined},extra);
  battle.actions.useMove(move,p,{target:t}); return battle.activeMove;
 }
 for (const id of ['shelgon','metang','dragonair','pupitar','zweilous','sliggoo','sliggoohisui','gabite','hakamoo']) {
  it(id+' stays at 480–500 BST and receives both Eviolite multipliers',()=>{
   const s=Dex.species.get(id); assert(s.bst>=480&&s.bst<=500); assert(s.nfe);
   const [p]=start(mon(id,'No Ability','Eviolite'));
   assert.equal(battle.runEvent('ModifyDef',p,null,null,1000),1500);
   assert.equal(battle.runEvent('ModifySpD',p,null,null,1000),1500);
  });
 }
 it('keeps the evolved forms and Dodrio stats unchanged',()=>{
  const expected={salamence:[95,135,80,110,80,100],metagross:[80,135,130,95,90,70],dragonite:[91,134,95,100,100,80],tyranitar:[100,134,110,95,100,61],hydreigon:[92,105,90,125,90,98],goodra:[90,100,70,110,150,80],goodrahisui:[80,100,100,110,150,60],garchomp:[108,130,95,80,85,102],kommoo:[75,110,125,100,105,85],dodrio:[90,106,85,50,75,119]};
  for(const[id,stats]of Object.entries(expected)) assert.deepEqual(Object.values(Dex.species.get(id).baseStats),stats,id);
 });
 for(const format of ['singles','doubles','ffa']) it('Dodrio has native Hydra Bond with any selected ability in '+format,()=>{
  const[p,t]=start(mon('Dodrio','Triple Threat'),mon(),format);
  assert.deepEqual(p.getPassives(),['hydrabond']);
  const move=hit(p,t); if(format==='ffa') {
   assert.equal(move.target,'allAdjacentFoes'); assert(move.hydraBondSingleTargetSpread);
   assert(battle.p3.active[0].hp<battle.p3.active[0].maxhp); assert(battle.p4.active[0].hp<battle.p4.active[0].maxhp);
  } else assert.equal(move.multihit,3);
  p.setAbility('Speed Boost'); assert(p.hasAbilityOrPassive('hydrabond'));
  p.addVolatile('gastroacid',t); const second=hit(p,t); assert(format==='ffa'?second.hydraBondSingleTargetSpread:second.multihit===3);
 });
 it('does not double Hydra Bond when copied onto Dodrio, including FFA and Dragon’s Den',()=>{
  const[p,t]=start(mon('Dodrio','Hydra Bond'),mon(),'ffa');
  const move=hit(p,t); assert(move.hydraBondSingleTargetSpread); assert(!move.multihit);
  battle.field.setTerrain('dragonsdenterrain',p,p.getAbility());
  assert.equal(battle.runEvent('BasePower',p,t,battle.dex.getActiveMove('tackle'),100,true),120);
 });
 it('Triple Threat protects flinching and accuracy, ignores evasion, and halves sleep without curing confusion',()=>{
  const[p,t]=start(mon('Dodrio','Triple Threat'));
  assert(abilityIncludesComponent('triplethreat','earlybird')); assert(!abilityIncludesComponent('triplethreat','hydrabond'));
  assert(!p.addVolatile('flinch',t)); battle.boost({accuracy:-1,atk:-1},p,t); assert.equal(p.boosts.accuracy,0); assert.equal(p.boosts.atk,-1);
  const move=hit(p,t); assert(move.ignoreEvasion);
  assert(p.addVolatile('confusion',t)); assert(p.volatiles.confusion);
  p.removeVolatile('confusion'); p.setStatus('slp'); p.statusState.time=4;
  battle.makeChoices('move splash','move splash'); assert.equal(p.statusState.time,2);
 });
 it('Long Stride boosts kicks and blocks only opposing Speed drops; suppression still works',()=>{
  const[p,t]=start(mon('Mew','Long Stride'));
  assert.equal(battle.runEvent('BasePower',p,t,battle.dex.getActiveMove('lowkick'),100,true),140);
  assert.equal(battle.runEvent('BasePower',p,t,battle.dex.getActiveMove('tackle'),100,true),100);
  battle.boost({spe:-1},p,t); assert.equal(p.boosts.spe,0); battle.boost({spe:-1},p,p); assert.equal(p.boosts.spe,-1);
  p.addVolatile('gastroacid',t); battle.boost({spe:-1},p,t); assert.equal(p.boosts.spe,-2);
 });
 it('Dreaming Shell heals while asleep without reducing attack damage',()=>{
  const[p,t]=start(mon('Mew','Dreaming Shell')); const move=battle.dex.getActiveMove('tackle'); move.willCrit=false;
  const awake=battle.actions.getDamage(t,p,move); p.setStatus('slp'); assert.equal(battle.actions.getDamage(t,p,move),awake);
  p.hp=100; battle.makeChoices('move splash','move splash'); assert.equal(p.hp,100+Math.floor(p.baseMaxhp/16));
  t.setAbility('Mold Breaker'); const a=hit(t,p); const damage=p.getMoveHitData(a).damage; assert(damage>0);
  p.cureStatus(); const hp=p.hp; battle.makeChoices('move splash','move splash'); assert.equal(p.hp,hp);
 });
 it('Linked Minds sets screens before an ordinary faster attack, but grants no general status priority',()=>{
  const[p,t]=start(mon('Metang','Linked Minds'));
  assert.equal(battle.runEvent('ModifyPriority',p,t,battle.dex.getActiveMove('reflect'),0),1);
  assert.equal(battle.runEvent('ModifyPriority',p,t,battle.dex.getActiveMove('splash'),0),0);
  assert.equal(battle.runEvent('BasePower',p,t,battle.dex.getActiveMove('psychic'),100,true),120);
  battle.makeChoices('move reflect','move splash'); assert(p.side.sideConditions.reflect);
 });
 it('Weather Weave affects manual weather and Weather Ball, without setting weather on entry',()=>{
  const[p,t]=start(mon('Dragonair','Weather Weave')); assert.equal(battle.field.weather,'');
  assert.equal(battle.runEvent('ModifyPriority',p,t,battle.dex.getActiveMove('raindance'),0),1);
  assert.equal(battle.runEvent('ModifyPriority',p,t,battle.dex.getActiveMove('thunderwave'),0),0);
  assert.equal(battle.runEvent('BasePower',p,t,battle.dex.getActiveMove('weatherball'),100,true),130);
  battle.field.setWeather('sandstorm'); const hp=p.hp; battle.makeChoices('move splash','move splash'); assert.equal(p.hp,hp);
  p.addVolatile('gastroacid',t); battle.makeChoices('move splash','move splash'); assert(p.hp<hp);
 });
 for(const [ability,flag] of [['Pressure Jet','pressureJetEntry'],['Castoff Scales','castoffScalesEntry']]) it(ability+' spends once per real entry, not per hit or ability change',()=>{
  const[p,t]=start(mon('Mew',ability)); p.hp=p.maxhp=p.baseMaxhp=3000;
  hit(t,p,'tackle',{multihit:3}); assert.equal(p.boosts.spe,ability==='Pressure Jet'?2:1);
  p.setAbility('No Ability');p.setAbility(ability);hit(t,p);assert.equal(p.boosts.spe,ability==='Pressure Jet'?2:1);
  assert.equal(p.m[flag],p.m.ultraRivalryEntryCount);
  battle.makeChoices('switch 2','move splash');battle.makeChoices('switch 2','move splash');hit(t,p);assert.equal(p.boosts.spe,ability==='Pressure Jet'?2:1);
 });
 it('entry boosts ignore allies, Substitute, and special attacks for Castoff Scales',()=>{
  const[p,t]=start(mon('Mew','Castoff Scales'),mon(),'doubles');
  hit(p.side.active[1],p);hit(t,p,'watergun');assert.equal(p.boosts.spe,0);
  p.addVolatile('substitute'); hit(t,p); assert.equal(p.boosts.spe,0);
  p.removeVolatile('substitute');hit(t,p);assert.equal(p.boosts.spe,1);assert.equal(p.boosts.atk,1);assert.equal(p.boosts.def,-1);
 });
 it('Rival Appetites heals from actual biting damage, respects Heal Block and preserves stronger native drain',()=>{
  const[p,t]=start(mon('Zweilous','Rival Appetites'));p.hp=100;
  const before=t.hp;hit(p,t,'bite');assert.equal(p.hp,100+Math.round((before-t.hp)/4));
  p.addVolatile('healblock',t);const hp=p.hp;hit(p,t,'bite');assert.equal(p.hp,hp);p.removeVolatile('healblock');
  const move=hit(p,t,'bite',{drain:[1,2]});assert.deepEqual(move.drain,[1,2]);
 });
 it('Caustic Mucus triggers once per contact attack and respects Protective Pads and Substitute',()=>{
  const[p,t]=start(mon('Sliggoo','Caustic Mucus'));p.hp=p.maxhp=p.baseMaxhp=3000;
  hit(t,p,'tackle',{multihit:3});assert.equal(t.boosts.spd,-1);
  hit(t,p,'watergun');assert.equal(t.boosts.spd,-1);
  t.setItem('Protective Pads');hit(t,p);assert.equal(t.boosts.spd,-1);t.clearItem();
  p.addVolatile('substitute');hit(t,p);assert.equal(t.boosts.spd,-1);
 });
 it('Iron Solute halves Water damage and grants only one Defense stage per opposing attack',()=>{
  const[p,t]=start(mon('Mew','Iron Solute'));p.hp=p.maxhp=p.baseMaxhp=3000;
  const move=battle.dex.getActiveMove('watergun');move.willCrit=false;
  const reduced=battle.actions.getDamage(t,p,move);p.setAbility('No Ability');assert(battle.actions.getDamage(t,p,move)>reduced);p.setAbility('Iron Solute');
  hit(t,p,'watergun',{multihit:3});assert.equal(p.boosts.def,1);
  t.setAbility('Mold Breaker');hit(t,p,'watergun');assert.equal(p.boosts.def,1);
 });
 it('Medicinal Scales cures the entering holder and active allies, but not reserves or foes',()=>{
  const[p,t]=start(mon('Gabite','Medicinal Scales'),mon(),'doubles');
  battle.makeChoices('switch 3, move splash','move splash, move splash');
  p.setStatus('brn');p.side.active[1].setStatus('psn');t.setStatus('par');p.side.pokemon[0].setStatus('brn');
  battle.makeChoices('switch 3, move splash','move splash, move splash');
  assert.equal(p.status,'');assert.equal(p.side.active[1].status,'');assert.equal(t.status,'par');assert.equal(p.side.pokemon[2].status,'brn');
 });
});
