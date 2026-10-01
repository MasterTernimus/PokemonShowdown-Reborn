'use strict';
const assert=require('assert').strict;
const common=require('../../common'),{Dex}=require('../../../dist/sim/dex');
describe('Approved Breakwater, Meowstic, Heavy Artillery and Mythic Scale',()=>{
 let battle;
 afterEach(()=>{battle?.destroy();battle=null;});
 function setup(ability='Breakwater',ffa=false,species='Barraskewda'){
  const p={species,level:50,ability,moves:['splash','waterfall','waterpulse','sleeppowder']};
  const foe={species:'Mew',ability:'No Ability',moves:['splash','protect','substitute','uturn']};
  const team=[p,{...p,ability:'No Ability'}],other=[foe,{...foe}];
  battle=common.createBattle({formatid:ffa?'gen9freeforall4pmistyfieldadrienn':'gen9nofieldsinglesgame'},ffa?[team,other,other,other]:[team,other]);
  battle.makeChoices(...Array(ffa?4:2).fill('team 12'));
  battle.randomChance=(n,d)=>n>=d;battle.randomizer=n=>n;
  return [battle.p1.active[0],battle.p2.active[0]];
 }
 function hit(p,t,id='waterfall',extra={}){const move=battle.dex.getActiveMove(id);Object.assign(move,{accuracy:true,willCrit:false,secondaries:undefined},extra);battle.actions.useMove(move,p,{target:t});battle.runEvent('AfterMove',p,t,battle.activeMove);return battle.activeMove;}
 function advance(...choices){battle.makeChoices(...battle.sides.map((s,i)=>choices[i]||'move splash'));}
 const hazards=['spikes','toxicspikes','stealthrock','stickyweb','gmaxsteelsurge'];
 function addHazards(side,p){for(const h of hazards)side.addSideCondition(h,p);}
 it('assigns Breakwater without changing Swift Swim or Arrokuda',()=>{
  assert.deepEqual(Dex.species.get('barraskewda').abilities,{0:'Swift Swim',H:'Breakwater'});
  assert.equal(Dex.species.get('arrokuda').abilities.H,'Propeller Tail');
  const[p]=setup();assert(p.hasAbility('propellertail'));
 });
 it('keeps Propeller Tail tracking and all three field Speed effects',()=>{
  const[p,t]=setup(),ability=p.getAbility(),move=battle.dex.getActiveMove('waterfall');
  ability.onModifyMove.call(battle,move,p,t);assert(move.tracksTarget);
  for(const field of ['watersurfaceterrain','underwaterterrain','midnightzoneterrain']){
   battle.field.terrain=field;assert.equal(battle.runEvent('ModifySpe',p,null,null,100),200,field);
  }
 });
 it('clears all own hazards after physical Water HP damage, without clearing opponents',()=>{
  const[p,t]=setup();addHazards(p.side,t);addHazards(t.side,p);hit(p,t);
  for(const h of hazards){assert(!p.side.getSideCondition(h),h);assert(t.side.getSideCondition(h),h);}
  assert(p.volatiles.breakwaterspent);addHazards(p.side,t);hit(p,t);assert(p.side.getSideCondition('spikes'));
 });
 it('does not spend the allowance when no hazards exist',()=>{
  const[p,t]=setup();hit(p,t);assert(!p.volatiles.breakwaterspent);addHazards(p.side,t);hit(p,t);assert(!p.side.getSideCondition('spikes'));
 });
 it('keeps allowance through misses, protection and substitute-only damage',()=>{
  const[p,t]=setup();addHazards(p.side,t);hit(p,t,'waterfall',{accuracy:0});
  t.addVolatile('protect');hit(p,t);t.removeVolatile('protect');t.addVolatile('substitute');hit(p,t,'waterfall',{basePower:1});
  assert(p.side.getSideCondition('spikes'));assert(!p.volatiles.breakwaterspent);
 });
 it('rejects Flip Turn, special Water, non-Water and called attacks',()=>{
  const[p,t]=setup();addHazards(p.side,t);
  for(const [move,extra]of [['flipturn',{}],['waterpulse',{}],['tackle',{}],['waterfall',{sourceEffect:'sleeptalk'}],['waterfall',{isExternal:true}],['waterfall',{flags:{futuremove:1}}]]){
   hit(p,t,move,{basePower:1,...extra});assert(p.side.getSideCondition('spikes'),move);assert(!p.volatiles.breakwaterspent);
  }
 });
 it('counts KO HP damage and does not require the victim to survive',()=>{
  const[p,t]=setup();addHazards(p.side,t);t.hp=1;hit(p,t);assert.equal(t.hp,0);assert(!p.side.getSideCondition('spikes'));
 });
 it('resets on re-entry but not on an ability swap',()=>{
  const[p,t]=setup();addHazards(p.side,t);hit(p,t);p.setAbility('No Ability');p.setAbility('Breakwater');addHazards(p.side,t);hit(p,t);assert(p.side.getSideCondition('spikes'));
  for(const h of hazards)p.side.removeSideCondition(h);advance('switch 2');advance('switch 2');addHazards(p.side,t);hit(p,t);assert(!p.side.getSideCondition('spikes'));
 });
 it('FFA clears only its own trainer\'s hazards',()=>{
  const[p,t]=setup('Breakwater',true);for(const side of battle.sides)addHazards(side,p);hit(p,t);
  assert(!p.side.getSideCondition('spikes'));for(const side of battle.sides.slice(1))assert(side.getSideCondition('spikes'));
 });
 it('Meowstic retains its other named components but no Neuroforce hook or identity',()=>{
  const[p]=setup('Alchemist Surge',false,'Meowstic-M-Mega');
  for(const id of ['psychicsurge','competitive','hydrabond','prankster'])assert(p.hasAbility(id));
  assert(!p.hasAbility('neuroforce'));assert(!p.getAbility().onModifyDamage);
  assert.equal(Dex.species.get('Meowstic-F-Mega').abilities[0],'Alchemist Surge');
 });
 it('Meowstic still creates full terrain when no field exists',()=>{
  setup('Alchemist Surge',false,'Meowstic-M-Mega');assert.equal(battle.field.terrain,'psychicterrain');assert.equal(battle.field.auraField,'');
 });
 it('Meowstic still overlays an Aura on a compatible existing field',()=>{
  setup('Alchemist Surge',true,'Meowstic-F-Mega');assert.equal(battle.field.terrain,'mistyterrain');assert.equal(battle.field.auraField,'psychicterrain');
 });
 it('Heavy Artillery gives the selected non-first foe full damage, others half',()=>{
  const[p]=setup('Heavy Artillery',true,'Clawitzer-Mega');const foes=battle.sides.slice(1).map(s=>s.active[0]),hp=foes.map(f=>f.hp);
  const m=hit(p,foes[1],'waterpulse',{basePower:30});const damage=foes.map((f,i)=>hp[i]-f.hp);
  assert.equal(m.heavyArtilleryPrimary,foes[1].getSlot());assert(damage[1]>0);assert.equal(damage[0],battle.modify(damage[1],0.5));assert.equal(damage[2],damage[0]);
  assert.equal(p.boosts.def,-1);assert.equal(p.boosts.spd,-1);
 });
 it('Heavy Artillery preserves an actual player-selected target through move resolution',()=>{
  const[p]=setup('Heavy Artillery',true,'Clawitzer-Mega');const foes=battle.sides.slice(1).map(s=>s.active[0]),hp=foes.map(f=>f.hp);
  advance('move waterpulse '+p.getLocOf(foes[2]));const damage=foes.map((f,i)=>hp[i]-f.hp);
  assert(damage[2]>damage[0]);assert.equal(damage[0],battle.modify(damage[2],0.5));assert.equal(damage[1],damage[0]);
 });
 it('protected primary does not promote a splash victim',()=>{
  const[p]=setup('Heavy Artillery',true,'Clawitzer-Mega');const foes=battle.sides.slice(1).map(s=>s.active[0]);foes[1].addVolatile('protect');const hp=foes.map(f=>f.hp);
  const m=hit(p,foes[1],'waterpulse',{basePower:30});assert.equal(foes[1].hp,hp[1]);assert.equal(m.heavyArtilleryPrimary,foes[1].getSlot());assert(hp[0]>foes[0].hp);
  const splash=hp[0]-foes[0].hp;foes[1].removeVolatile('protect');const hp2=foes[1].hp;hit(p,foes[1],'waterpulse',{basePower:30});assert.equal(splash,battle.modify(hp2-foes[1].hp,0.5));
 });
 it('immune primary remains primary and splash keeps its own defensive modifiers',()=>{
  const[p]=setup('Heavy Artillery',true,'Clawitzer-Mega');const foes=battle.sides.slice(1).map(s=>s.active[0]);foes[1].setAbility('Water Absorb');foes[2].setType('Water');const hp=foes.map(f=>f.hp);
  const m=hit(p,foes[1],'waterpulse',{basePower:30});assert.equal(foes[1].hp,hp[1]);assert.equal(m.heavyArtilleryPrimary,foes[1].getSlot());assert(hp[0]-foes[0].hp>hp[2]-foes[2].hp);
 });
 it('uses a deterministic fallback when the move supplies no valid primary',()=>{
  const[p]=setup('Heavy Artillery',true,'Clawitzer-Mega');const m=battle.dex.getActiveMove('waterpulse');m.target='allAdjacentFoes';p.getAbility().onModifyMove.call(battle,m,p,p);
  assert.equal(m.heavyArtilleryPrimary,battle.p2.active[0].getSlot());
 });
 it('Heavy Artillery does not change Singles targeting or its doubled power and defensive drops',()=>{
  const[p,t]=setup('Heavy Artillery',false,'Clawitzer-Mega');const m=hit(p,t,'waterpulse',{basePower:30});assert.equal(m.target,Dex.moves.get('waterpulse').target);assert.equal(m.heavyArtilleryPrimary,undefined);assert.equal(p.boosts.def,-1);assert.equal(p.boosts.spd,-1);
  assert.equal(battle.runEvent('BasePower',p,t,m,100),200);
 });
 it('Heavy Artillery does not expand non-pulse/bullet attacks',()=>{
  const[p,t]=setup('Heavy Artillery',true,'Clawitzer-Mega');const m=hit(p,t,'waterfall');assert.equal(m.target,'normal');assert.equal(m.heavyArtilleryPrimary,undefined);assert.equal(p.boosts.def,0);
 });
 it('Mythic Scale retains all four components, including field Marvel Scale',()=>{
  const[p]=setup('Mythic Scale',false,'Butterfree-Gmax');for(const a of ['marvelscale','levitate','compoundeyes','shielddust'])assert(p.hasAbility(a));
  battle.field.terrain='fairytaleterrain';assert.equal(battle.runEvent('ModifyDef',p,null,null,100),150);
 });
 it('successful powder status grants one Defense stage per entry',()=>{
  const[p,t]=setup('Mythic Scale',false,'Butterfree-Gmax');hit(p,t,'sleeppowder');assert.equal(t.status,'slp');assert.equal(p.boosts.def,1);
  t.cureStatus();hit(p,t,'poisonpowder');assert.equal(p.boosts.def,1);assert(p.volatiles.mythicscalespent);
 });
 it('powder misses, Protect, Substitute, Grass immunity and preexisting status do not pay out',()=>{
  const[p,t]=setup('Mythic Scale',false,'Butterfree-Gmax');hit(p,t,'sleeppowder',{accuracy:0});
  t.addVolatile('protect');hit(p,t,'sleeppowder');t.removeVolatile('protect');t.addVolatile('substitute');hit(p,t,'sleeppowder');t.removeVolatile('substitute');
  t.setType('Grass');hit(p,t,'sleeppowder');t.setType('Psychic');t.setStatus('psn',t);hit(p,t,'sleeppowder');assert.equal(p.boosts.def,0);assert(!p.volatiles.mythicscalespent);
 });
 it('Gmax Befuddle and called powder status cannot grant Defense',()=>{
  const[p,t]=setup('Mythic Scale',false,'Butterfree-Gmax');hit(p,t,'sleeppowder',{sourceEffect:'sleeptalk'});assert.equal(p.boosts.def,0);t.cureStatus();
  hit(p,t,'gmaxbefuddle',{basePower:1});assert(t.status);assert.equal(p.boosts.def,0);
 });
 it('FFA spread powder can reward only one Defense boost total',()=>{
  const[p]=setup('Mythic Scale',true,'Butterfree-Gmax');battle.field.terrain='';const t=battle.p2.active[0];hit(p,t,'sleeppowder',{target:'allAdjacentFoes'});
  assert.equal(p.boosts.def,1);assert.equal(battle.sides.slice(1).filter(s=>s.active[0].status==='slp').length,3);
 });
 it('Mythic Scale resets on switching, not on changing ability',()=>{
  const[p,t]=setup('Mythic Scale',false,'Butterfree-Gmax');hit(p,t,'sleeppowder');p.setAbility('No Ability');p.setAbility('Mythic Scale');t.cureStatus();hit(p,t,'sleeppowder');assert.equal(p.boosts.def,1);
  advance('switch 2');advance('switch 2');t.cureStatus();hit(p,t,'sleeppowder');assert.equal(p.boosts.def,1);assert(p.volatiles.mythicscalespent);
 });
 it('Life Guard retains all existing components',()=>{
  const[p]=setup('Life Guard',true,'Floatzel');for(const a of ['friendguard','swornduty','propellertail'])assert(p.hasAbility(a));
  assert(Dex.abilities.get('lifeguard').desc.includes('25%'));
 });
 it('using protection without blocking an attack grants nothing',()=>{
  const[p]=setup('Life Guard',true,'Floatzel');p.addVolatile('protect');advance();assert(!p.volatiles.lifeguardguard);
 });
 it('a blocked attack earns one 25% guard; further blocks cannot refresh it',()=>{
  const[p,t]=setup('Life Guard',true,'Floatzel');p.addVolatile('protect');hit(t,p,'tackle');assert(p.volatiles.lifeguardguard);assert.equal(p.volatiles.lifeguardguard.duration,2);
  p.volatiles.lifeguardguard.duration=1;hit(t,p,'tackle');assert.equal(p.volatiles.lifeguardguard.duration,1);
  p.removeVolatile('protect');const m=battle.dex.getActiveMove('tackle'),hp=p.hp;battle.damage(40,p,t,m);assert.equal(hp-p.hp,30);assert(!p.volatiles.lifeguardguard);
  const hp2=p.hp;battle.damage(40,p,t,m);assert.equal(hp2-p.hp,40);
 });
 it('Life Guard does not pay out in Singles',()=>{
  const[p,t]=setup('Life Guard',false,'Floatzel');p.addVolatile('protect');hit(t,p,'tackle');assert(!p.volatiles.lifeguardguard);
 });
 it('blocked status moves do not earn Life Guard and residual damage does not consume it',()=>{
  const[p,t]=setup('Life Guard',true,'Floatzel');p.addVolatile('protect');hit(t,p,'toxic');assert(!p.volatiles.lifeguardguard);
  hit(t,p,'tackle');assert(p.volatiles.lifeguardguard);const hp=p.hp;battle.damage(10,p,t,battle.dex.conditions.get('psn'));assert.equal(hp-p.hp,10);assert(p.volatiles.lifeguardguard);
 });
 it('guard lasts through the following turn, then expires without refresh',()=>{
  const[p,t]=setup('Life Guard',true,'Floatzel');p.addVolatile('protect');hit(t,p,'tackle');advance();assert.equal(p.volatiles.lifeguardguard.duration,1);advance();assert(!p.volatiles.lifeguardguard);
 });
 it('Life Guard guard clears on switching',()=>{
  const[p,t]=setup('Life Guard',true,'Floatzel');p.addVolatile('protect');hit(t,p,'tackle');advance('switch 2');assert(!p.volatiles.lifeguardguard);assert(!battle.p1.active[0].volatiles.lifeguardguard);
 });
 it('multihit consumes the guard only on its first damaging hit',()=>{
  const[p,t]=setup('Life Guard',true,'Floatzel');p.addVolatile('protect');hit(t,p,'tackle');p.removeVolatile('protect');
  const hits=[];battle.onEvent('AfterDamageApplied',battle.format,(damage,target,source,move)=>{if(target===p&&source===t)hits.push(damage);});
  hit(t,p,'tackle',{basePower:5,multihit:3});assert.equal(hits.length,3);assert.equal(hits[0],battle.modify(hits[1],0.75));assert.equal(hits[1],hits[2]);assert(!p.volatiles.lifeguardguard);
 });
 it('protection bypass does not earn Life Guard',()=>{
  const[p,t]=setup('Life Guard',true,'Floatzel');p.addVolatile('protect');hit(t,p,'feint',{basePower:1});assert(!p.volatiles.lifeguardguard);
 });
 it('Substitute interception does not consume an earned guard',()=>{
  const[p,t]=setup('Life Guard',true,'Floatzel');p.addVolatile('protect');hit(t,p,'tackle');p.removeVolatile('protect');p.addVolatile('substitute');hit(t,p,'tackle',{basePower:1});assert(p.volatiles.lifeguardguard);
 });
 for(const condition of ['banefulbunker','burningbulwark','kingsshield','obstruct','silktrap','spikyshield','maxguard']){
  it(`Life Guard recognizes ${condition} without changing its protection`,()=>{
   const[p,t]=setup('Life Guard',true,'Floatzel');p.addVolatile(condition);const hp=p.hp;hit(t,p,'watergun',{basePower:1});assert.equal(p.hp,hp);assert(p.volatiles.lifeguardguard);
  });
 }
 for(const [condition,move,extra]of [['wideguard','surf',{}],['quickguard','aquajet',{priority:1}],['matblock','tackle',{}]]){
  it(`Life Guard recognizes the ${condition} side condition`,()=>{
   const[p,t]=setup('Life Guard',true,'Floatzel');p.side.addSideCondition(condition,p);const hp=p.hp;hit(t,p,move,{basePower:1,...extra});assert.equal(p.hp,hp);assert(p.volatiles.lifeguardguard);
  });
 }
});
