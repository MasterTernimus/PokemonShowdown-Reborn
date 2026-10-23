'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');let battle;
const mon=(species='Mew',ability='No Ability',moves=['splash','tackle','protect','rapidspin'])=>({species,ability,moves});
function setup(species,ability,mode='doubles',moves){battle=common.createBattle({gameType:mode},[[mon(species,ability,moves),mon(),mon()],[mon(),mon(),mon()]]);battle.field.terrain='';for(const p of battle.getAllActive())p.hp=p.maxhp=p.baseMaxhp=1000;return[battle.p1.active[0],battle.p2.active[0]];}
function hit(p,q,id,extra={}){return battle.actions.useMove(Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false},extra),p,{target:q});}
describe('Approved rival and support queue',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('exact rival slots, passives, Mega stats and approved Mega Parasect migration',()=>{
  assert.deepEqual(Dex.species.get('zangoose').abilities,{0:'Venom Armor',1:'Toxic Boost',H:'Scrappy'});
  for(const id of ['zangoose','zangoosemega'])assert.deepEqual(Dex.species.get(id).passives,['rivalresolve']);
  for(const id of ['seviper','sevipermega'])assert.deepEqual(Dex.species.get(id).passives,['rivalmalice']);
  assert.deepEqual(Dex.species.get('sevipermega').baseStats,{hp:75,atk:140,def:120,spa:90,spd:120,spe:65});
  assert.deepEqual(Dex.species.get('parasectmega').passives,['mycelialbond']);
 });
 it('Rival Resolve self-poisons and only its own recovery bypasses Heal Block and healing prevention',()=>{
  const[p,q]=setup('Zangoose','Venom Armor');assert.equal(p.status,'psn');p.hp=100;p.addVolatile('healblock',q);p.m.graveHungerHealing=0;
  battle.runEvent('Damage',p,p,Dex.conditions.get('psn'),100);assert.equal(p.hp,225);
  assert(!battle.heal(100,p,p,Dex.getActiveMove('recover')));assert.equal(p.hp,225);
  p.hp=0;battle.runEvent('Damage',p,p,Dex.conditions.get('psn'),100);assert.equal(p.hp,0);
 });
 it('Rival Resolve caps final Poison effectiveness at resisted after offensive overrides',()=>{
  const[p,q]=setup('Zangoose','No Ability');p.setType(['Grass','Fairy']);q.setAbility('Apex Venom');
  const move=Dex.getActiveMove('poisonfang');battle.actions.getDamage(q,p,move);assert.equal(p.getMoveHitData(move).typeMod,-1);
  p.setType(['Poison','Ground']);const next=Dex.getActiveMove('poisonfang');battle.actions.getDamage(q,p,next);assert.equal(p.getMoveHitData(next).typeMod,-2);
 });
 it('Rival Malice speed and HP-dependent direct damage apply once',()=>{
  const[p,q]=setup('Seviper','Rival Malice');assert.equal(battle.runEvent('ModifySpe',p,null,null,100),150);
  assert.equal(battle.runEvent('ModifyDamage',p,q,Dex.getActiveMove('tackle'),100),150);q.hp=500;assert.equal(battle.runEvent('ModifyDamage',p,q,Dex.getActiveMove('tackle'),100),125);
 });
 it('Fang attacks retain Strong Jaw without a signature multiplier',()=>{
  const[p,q]=setup('Mew','Apex Venom');assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('poisonfang'),100),150);
  p.setAbility('Sirius');assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('drakefang'),100),150);
 });
 it('Drake Fang preserves slot and PP through actual Mega form changes',()=>{
  const[p,q]=setup('Seviper','Apex Venom','singles',['poisonfang','splash']);p.moveSlots[0].pp=7;
  p.formeChange('Seviper-Mega',Dex.items.get('sevipernite'),true);assert.equal(p.moveSlots[0].id,'drakefang');assert.equal(p.moveSlots[0].pp,7);assert.equal(p.baseMoveSlots[0].id,'drakefang');
  p.formeChange('Seviper',null,true);assert.equal(p.moveSlots[0].id,'poisonfang');assert.equal(p.moveSlots[0].pp,7);
 });
 it('Toxic Armor preparation query is side-effect-free and consumes the following attack attempt',()=>{
  const[p,q]=setup('Zangoose-Mega','Toxic Armor');hit(p,q,'quickattack');assert.equal(p.m.toxicPreparation,battle.turn+1);battle.turn++;
  const move=Dex.getActiveMove('metalclaw');for(let i=0;i<2;i++)assert.equal(battle.runEvent('ModifyPriority',p,q,move,0),1);
  hit(p,q,'metalclaw');assert.equal(p.m.toxicPreparation,undefined);
  assert.equal(battle.runEvent('BasePower',p,q,Object.assign(Dex.getActiveMove('metalclaw'),{multihitType:'dualwield',hit:2}),100),60);
  assert(!p.setAbility('No Ability'));
 });
 for(const species of ['Parasect','Parasect-Rejuv','Parasect-Parasite','Parasect-Mega'])it(species+' has full Dry Skin without doubled Fire weakness',()=>{
  const[p,q]=setup(species,'Parasitism');assert.deepEqual(p.getPassives(),['mycelialbond']);
  assert.equal(battle.runEvent('BasePower',q,p,Dex.getActiveMove('flamethrower'),100),125);
 });
 it('Mycelial Bond gives self and adjacent ally one extra hit without stacking holders or native multihit',()=>{
  const[p,q]=setup('Parasect','No Ability');const ally=p.side.active[1];ally.setAbility('Mycelial Bond');
  hit(ally,q,'tackle');assert(battle.log.some(x=>x.includes('|-hitcount|')&&x.endsWith('|2')));
  battle.log.length=0;hit(p,q,'doublehit',{multihit:2});assert(battle.log.some(x=>x.includes('|-hitcount|')&&x.endsWith('|2')));
 });
 it('Aim Assist rewards successful status only, consumes next targeted attempt, and does not own manual Lock-On',()=>{
  const[p,q]=setup('Klinklang','No Ability','singles',['splash','tackle']);battle.makeChoices('move splash','move splash');assert(p.m.aimLock);assert(!p.volatiles.lockon);
  const move=Dex.getActiveMove('tackle');battle.runEvent('ModifyMove',p,q,move,move);assert.equal(move.ignorePositiveDefensive,true);
  battle.runEvent('TryMove',p,q,move);assert(!p.m.aimLock);assert.equal(battle.runEvent('Accuracy',q,p,move,1),true);
 });
 it('Silent Act arms after successful status and consumes on damaging attempt',()=>{
  const[p,q]=setup('Mr. Mime','Silent Act','singles',['splash','psychic']);battle.makeChoices('move splash','move splash');assert(p.volatiles.silentactready);
  const move=Dex.getActiveMove('psychic');battle.runEvent('TryMove',p,q,move);assert(!p.volatiles.silentactready);assert.equal(battle.runEvent('BasePower',p,q,move,100),130);
 });
 it('Stage Sweep clears every negative stage and heals once only after actual hazard removal',()=>{
  const[p,q]=setup('Mr. Rime','Stage Sweep');p.side.addSideCondition('dragonrend',q);p.hp=500;p.boosts.atk=-2;p.boosts.spa=-1;p.boosts.accuracy=-2;p.side.active[1].newlySwitched=true;
  hit(p,q,'rapidspin');assert.equal(p.hp,625);assert.equal(p.boosts.atk,0);assert.equal(p.boosts.accuracy,0);assert(p.switchFlag);assert(p.side.active[1].volatiles.helpinghand);
  p.side.addSideCondition('spikes',q);hit(p,q,'rapidspin');assert.equal(p.hp,625);
 });
 it('Stage Sweep aura does not persist after the holder leaves',()=>{
  const[p,q]=setup('Mr. Rime','Stage Sweep'),ally=p.side.active[1];let move=Dex.getActiveMove('tackle');battle.runEvent('ModifyMove',ally,q,move,move);assert(move.infiltrates);
  p.isActive=false;move=Dex.getActiveMove('tackle');battle.runEvent('ModifyMove',ally,q,move,move);assert(!move.infiltrates);
 });
 it('Tinkaton Mold Breaker is passive; Scrapbreaker keeps Steel interaction and one Attack boost',()=>{
  const[p,q]=setup('Tinkaton','Scrapbreaker');assert.deepEqual(p.getPassives(),['moldbreaker']);q.setType('Steel');hit(p,q,'ironhead');assert.equal(p.boosts.atk,1);hit(p,q,'ironhead');assert.equal(p.boosts.atk,1);
 });
 it('Apocalyptic Flame heals independently and lowers stronger attacking stat',()=>{
  const[p,q]=setup('Tinkaton','Apocalyptic Flame','singles',['tackle','splash']);p.hp=500;q.boosts.spa=2;
  battle.makeChoices('move tackle','move splash');assert.equal(p.hp,625);assert.equal(q.boosts.spa,1);
 });
});

describe('Rival/support boundary checks',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const species of ['Haxorus-Mega'])it(species+' copies unboosted Attack into SpA with independent stages',()=>{
  const[p,q]=setup(species,'No Ability');assert.deepEqual(p.getPassives(),['twinfang']);p.boosts.atk=2;p.boosts.spa=-1;
  assert.equal(p.getStat('spa',true),p.storedStats.atk);assert.equal(p.getStat('spa'),Math.floor(p.storedStats.atk/1.5));assert.equal(p.calculateStat('spa',2),p.storedStats.atk*2);
  p.addVolatile('gastroacid');assert.equal(p.getStat('spa',true),p.storedStats.atk);
 });
 it('regular Haxorus has Rivalry without Twin Fang stat copying or contact follow-up',()=>{
  const[p,q]=setup('Haxorus','No Ability');assert.deepEqual(p.getPassives(),['rivalry']);
  assert.equal(p.getStat('spa',true),p.storedStats.spa);
  const move=Dex.getActiveMove('tackle');battle.runEvent('PrepareHit',p,q,move);assert(!move.twinFang);
 });
 it('Twin Fang adds exactly one contact hit and does not stack with allied Mycelial Bond',()=>{
  const[p,q]=setup('Haxorus-Mega','No Ability');p.side.active[1].setAbility('Mycelial Bond');hit(p,q,'tackle');assert(battle.log.some(x=>x.includes('|-hitcount|')&&x.endsWith('|2')));
  const move=Dex.getActiveMove('surf');battle.runEvent('PrepareHit',p,q,move);assert(!move.twinFang);assert(!move.mycelialBond);
 });
 it('Raging Storm retains priority protection after approved Battle Armor removal',()=>{
  const[p,q]=setup('Haxorus','Raging Storm');assert.equal(battle.runEvent('ModifyDamage',q,p,Dex.getActiveMove('tackle'),100),100);
  assert.equal(battle.runEvent('ModifyDamage',q,p,Dex.getActiveMove('quickattack'),100),50);
 });
 it('Dragon Drake Fang retains normal Steel resistance while Poison Fang retains its override',()=>{
  const[p,q]=setup('Mew','Sirius');q.setType('Steel');
  let move=Dex.getActiveMove('drakefang');battle.runEvent('ModifyMove',p,q,move,move);battle.actions.getDamage(p,q,move);assert.equal(q.getMoveHitData(move).typeMod,-1);
  q.setType('Fairy');const hp=q.hp;hit(p,q,'drakefang');assert.equal(q.hp,hp);
  p.setAbility('Apex Venom');q.setType('Steel');move=Dex.getActiveMove('poisonfang');battle.runEvent('ModifyMove',p,q,move,move);battle.actions.getDamage(p,q,move);assert.equal(q.getMoveHitData(move).typeMod,1);
 });
 it('Toxic Armor no longer reduces protection-breaking Drake Fang after the approved Battle Armor removal',()=>{
  const[p,q]=setup('Mew','Sirius');q.setAbility('Toxic Armor',null,null,true);const move=Dex.getActiveMove('drakefang');battle.runEvent('ModifyMove',p,q,move,move);assert(move.breaksProtect);
  assert.equal(battle.runEvent('ModifyDamage',p,q,move,100),100);
 });
 it('Sirius contains Venam poison bypass for Steel targets',()=>{
  const[p,q]=setup('Seviper-Mega','Sirius');q.setType('Steel');hit(p,q,'sludgebomb',{secondaries:[]});assert.equal(q.status,'psn');
 });
 it('Rival Resolve retains ordinary Poison immunity where attacks do not bypass it',()=>{
  const[p,q]=setup('Zangoose','No Ability');p.setType('Steel');const hp=p.hp;hit(q,p,'sludgebomb');assert.equal(p.hp,hp);
 });
 it('Mycelial Bond excludes fixed, spread, charge, recoil self-KO and native multihit cases',()=>{
  const[p,q]=setup('Parasect','No Ability');for(const id of ['seismictoss','surf','solarbeam','hyperbeam','explosion','fling','bulletseed','doublehit']){
   const move=Dex.getActiveMove(id),before=move.multihit;battle.runEvent('PrepareHit',p,q,move);assert.equal(move.mycelialBond,undefined,id);assert.deepEqual(move.multihit,before,id);
  }
 });
 it('Mycelial Bond does not repeat a guaranteed secondary or self-stat drop',()=>{
  const[p,q]=setup('Parasect','No Ability');hit(p,q,'acid',{secondaries:[{chance:100,boosts:{spd:-1}}]});assert.equal(q.boosts.spd,-1);
  hit(p,q,'closecombat');assert.equal(p.boosts.def,-1);assert.equal(p.boosts.spd,-1);
 });
 it('Mycelial Bond does not retarget a second hit after a KO',()=>{
  const[p,q]=setup('Parasect','No Ability','doubles');q.hp=1;const other=battle.p2.active[1];const hp=other?.hp;hit(p,q,'tackle');if(other)assert.equal(other.hp,hp);
 });
 it('Aim Assist does not reward a failed status move or an attacking turn',()=>{
  const[p,q]=setup('Klinklang','No Ability','singles',['splash','tackle','recover']);p.hp=p.maxhp;battle.makeChoices('move recover','move splash');assert(!p.m.aimLock);
  battle.makeChoices('move tackle','move splash');assert(!p.m.aimLock);
 });
 it('Aim Assist lock expires and clears when its target leaves',()=>{
  const[p,q]=setup('Klinklang','No Ability','singles',['splash','tackle']);battle.makeChoices('move splash','move splash');assert(p.m.aimLock);
  battle.makeChoices('move splash','switch 2');assert.notEqual(p.m.aimLock?.target,q);
 });
 it('Stage Sweep does not Helping Hand an already-acted partner, but still pivots without hazards',()=>{
  const[p,q]=setup('Mr. Rime','Stage Sweep');const ally=p.side.active[1];ally.newlySwitched=false;hit(p,q,'rapidspin');assert(!ally.volatiles.helpinghand);assert(p.switchFlag);assert(!p.m.stageSweepReward);
 });
 it('Stage Sweep with no bench still supports an eligible partner',()=>{
  const[p,q]=setup('Mr. Rime','Stage Sweep');p.side.pokemon[2].hp=0;p.side.pokemon[2].fainted=true;const ally=p.side.active[1];ally.newlySwitched=true;hit(p,q,'rapidspin');assert(ally.volatiles.helpinghand);assert(!p.switchFlag);
 });
 it('Stage Sweep cannot pivot on immunity or protection',()=>{
  const[p,q]=setup('Mr. Rime','Stage Sweep');q.setType('Ghost');hit(p,q,'rapidspin');assert(!p.switchFlag);q.setType('Normal');q.addVolatile('protect');hit(p,q,'rapidspin');assert(!p.switchFlag);
 });
 it('Passive Mold Breaker survives selected Scrapbreaker callbacks',()=>{
  const[p,q]=setup('Tinkaton','Scrapbreaker');q.setAbility('Levitate');const before=q.hp;hit(p,q,'earthquake');assert(q.hp<before);
 });
});




describe('Drake Fang move text',()=>{it('states ordinary Dragon typing and preserved poison effect',()=>{assert.match(Dex.moves.get('drakefang').desc,/Fairy immunity and Steel resistance/);assert.match(Dex.moves.get('drakefang').shortDesc,/50%/);});});
