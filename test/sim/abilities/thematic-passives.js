'use strict';
const assert=require('assert').strict,fs=require('fs');
const common=require('../../common');
const {Dex}=require('../../../dist/sim');
const {SpeciesPassives,ThematicPassiveGroups,PassiveCosmeticForms}=require('../../../dist/data/species-passives');
const {StarterPassives}=require('../../../dist/data/starter-passives');
let battle;const protocol=[];
function setup(species,ability='Pressure',doubles=false,foeAbility='No Ability') {
 const mon=(species,ability='No Ability')=>({species,ability,moves:['splash','rest','tackle','yawn']});
 battle=common.createBattle({formatid:doubles?'gen9nofielddoublesbattle':'gen9nofieldsinglesgame'},[[mon(species,ability),mon('Mew','Pressure'),mon('Chansey')],[mon('Mew',foeAbility),mon('Blissey'),mon('Chansey')]]);
 battle.makeChoices('team 123','team 123');battle.field.terrain='';battle.debugMode=false;
 return [battle.p1.active[0],battle.p2.active[0],battle.p1.active[1]];
}
function suppression(p,t,fn){fn();p.addVolatile('gastroacid');fn();p.removeVolatile('gastroacid');p.addVolatile('meridianseal');fn();p.removeVolatile('meridianseal');t.setAbility('Neutralizing Gas');fn();t.setAbility('Mold Breaker');fn();}
describe('Approved thematic species passives',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 after(()=>{const {extractChannelMessages}=require('../../../dist/sim/battle');fs.writeFileSync('artifacts/thematic-protocol-fixtures.json',JSON.stringify(protocol.map(f=>({...f,log:extractChannelMessages(f.log.join('\n'),[0])[0]})),null,2)+'\n');});
 it('grants exactly 61 named species and 27 cosmetic equivalents, preserving 76 starter records',()=>{
  const ids=Object.values(ThematicPassiveGroups).flat();assert.equal(ids.length,61);
  const cosmetics=Object.entries(PassiveCosmeticForms).flatMap(([base,forms])=>forms.map(form=>base+form));assert.equal(cosmetics.length,27);
  assert.equal(Object.keys(SpeciesPassives).length, 820);
  for(const[passive,group]of Object.entries(ThematicPassiveGroups))for(const id of group)assert.deepEqual(Dex.species.get(id).passives,id === 'butterfree' ? ['shielddust'] : ['grimer','muk'].includes(id) ? ['liquidooze'] : [passive],id);
  for(const id of cosmetics){const s=Dex.species.get(id);assert(s.exists,id);assert.deepEqual(s.passives,SpeciesPassives[id]);const base=Dex.species.get(s.baseSpecies);assert.deepEqual(s.baseStats,base.baseStats);assert.deepEqual(s.types,base.types);assert.deepEqual(s.abilities,base.abilities);}
  for(const[id,passives]of Object.entries(StarterPassives))assert.deepEqual(Dex.species.get(id).passives,passives,id);
  for(const s of Dex.species.all())assert.deepEqual(s.passives,SpeciesPassives[s.id]||[],s.id);
  for(const id of ['krabby','gligar','corphish','caterpie','metapod','wurmple','surskit','hoothoot','spearow','sentret','patrat','eeveestarter','eeveegmax','pinsirmega','kinglergmax','alcremiegmax','swalotpulse','mukpulse'])assert.deepEqual(Dex.species.get(id).passives,require('./passive-approval-overlays').current(id,[]),id);
 });
 for(const[passive,ids]of Object.entries(ThematicPassiveGroups))for(const id of ids)it(id+' keeps '+passive+' through suppression, selected-ability replacement and swaps',()=>{
  const[p,t]=setup(id);assert.deepEqual(p.getPassives(),id === 'butterfree' ? ['shielddust'] : ['grimer','muk'].includes(id) ? ['liquidooze'] : [passive]);
  suppression(p,t,()=>assert(p.hasAbilityOrPassive(passive)));
  p.setAbility('Water Absorb');t.setAbility('Pressure');battle.actions.useMove('skillswap',p,{target:t});assert.deepEqual(p.getPassives(),id === 'butterfree' ? ['shielddust'] : ['grimer','muk'].includes(id) ? ['liquidooze'] : [passive]);assert.deepEqual(t.getPassives(),['synchronize']);assert(!p.hasAbility(passive));
 });
 it('Hyper Cutter blocks only external Attack drops with a duplicate composite once',()=>{
  const[p,t]=setup('Kingler','Icebreaker');suppression(p,t,()=>{battle.boost({atk:-1,def:-1},p,t,Dex.moves.get('growl'));assert.equal(p.boosts.atk,0);});
  battle.boost({atk:-1},p,p,Dex.moves.get('superpower'));assert.equal(p.boosts.atk,-1);
  const failures=battle.log.filter(l=>l.includes('passive: Hyper Cutter'));assert.equal(failures.length,5);
  assert(!battle.log.some(l=>l.includes('[from] ability: Hyper Cutter')));protocol.push({name:'hyper-cutter',log:battle.log});
 });
 it('Shield Dust blocks secondaries for contact, noncontact and spread attacks but permits self boosts and primary status',()=>{
  const[p,t]=setup('Butterfree','Scale Shelter');
  for(const move of ['bodylam','thunderbolt','discharge']){
   const m=battle.dex.getActiveMove(move==='bodylam'?'bodyslam':move);const secondaries=[{chance:100,status:'par'},{chance:100,self:{boosts:{atk:1}}}];
   suppression(p,t,()=>assert.deepEqual(battle.runEvent('ModifySecondaries',p,t,m,secondaries),[secondaries[1]]));
  }
  assert(p.trySetStatus('par',t,Dex.moves.get('thunderwave')));assert.equal(p.status,'par');
 });
 it('Overcoat preserves weather and powder immunities under Mold Breaker without blocking primary nonpowder status',()=>{
  const[p,t]=setup('Cacnea','Overcoat');p.setType('Normal');
  suppression(p,t,()=>{for(const type of ['sandstorm','hail','powder'])assert.equal(battle.runEvent('Immunity',p,null,null,type),false);assert.equal(battle.runEvent('TryHit',p,t,battle.dex.getActiveMove('spore')),null);});
  assert(p.trySetStatus('par',t,Dex.moves.get('thunderwave')));
 });
 for(const field of ['', 'murkwatersurfaceterrain','wastelandterrain'])for(const effect of ['drain','leechseed','strengthsap'])it('Liquid Ooze attributes '+effect+' once on '+(field||'no field'),()=>{
  const[p,t]=setup('Swalot','Pulse Filtration');battle.field.terrain=field;t.hp=200;p.hp=200;
  const healed=battle.heal(20,t,p,{id:effect,name:effect,effectType:'Move'});assert(!healed);assert.equal(t.hp,field?160:180);
  const lines=battle.log.filter(l=>l.includes('|-damage|')&&l.includes('passive: Liquid Ooze'));assert.equal(lines.length,2);assert(lines[0].includes('[of] p1a:'));
  protocol.push({name:'ooze-'+effect+'-'+field,log:battle.log});
 });
 it('Liquid Ooze does not invert ordinary healing and remains active while suppressed',()=>{
  const[p,t]=setup('Muk','Liquid Ooze');t.hp=100;p.hp=100;p.addVolatile('gastroacid');
  battle.heal(20,t,p,{id:'drain',name:'drain',effectType:'Move'});assert.equal(t.hp,80);
  battle.heal(20,t,p,Dex.moves.get('recover'));assert.equal(t.hp,100);
 });
 it('actual draining damage and residual Leech Seed damage produce one ooze punishment',()=>{
  const[p,t]=setup('Tentacruel');t.hp=Math.floor(t.maxhp/2);let before=t.hp;
  battle.actions.useMove('gigadrain',t,{target:p});assert(t.hp<before);
  assert(p.addVolatile('leechseed',t,Dex.moves.get('leechseed')));before=t.hp;battle.fieldEvent('Residual');assert(t.hp<before);
  assert.equal(battle.log.filter(l=>l.includes('|-damage|')&&l.includes('passive: Liquid Ooze')).length,4);
 });
 it('Keen Eye entry uses its own state, runs once with overlap, and does not replay on ability changes',()=>{
  const[p,t]=setup('Noctowl','Keen Eye');battle.field.setTerrain('mirrorarenaterrain',p);p.boosts.accuracy=0;
  battle.makeChoices('switch 3','move splash');battle.makeChoices('switch 3','move splash');
  assert.equal(p.boosts.accuracy,1);assert(p.volatiles.laserfocus);
  p.setAbility('Keen Eye');assert.equal(p.boosts.accuracy,1);
  p.setAbility('Pressure');p.setAbility('Keen Eye');assert.equal(p.boosts.accuracy,1);
  const move=battle.dex.getActiveMove('tackle');battle.runEvent('ModifyMove',p,t,move,move);assert(move.ignoreEvasion);
  suppression(p,t,()=>{battle.boost({accuracy:-1},p,t,Dex.moves.get('sandattack'));assert.equal(p.boosts.accuracy,1);});
  protocol.push({name:'keen-eye',log:battle.log});
 });
 it('Keen Eye reveals an opposing Illusion on entry even with a suppressed different ability',()=>{
  const[p,t]=setup('Fearow','Pressure');t.illusion=battle.p2.pokemon[2];t.setAbility('Illusion');p.addVolatile('gastroacid');
  battle.fieldEvent('SwitchIn',[p]);assert.equal(t.illusion,null);assert.equal(p.ability,'pressure');
  protocol.push({name:'keen-eye-illusion',log:battle.log});
 });
 it('Sweet Veil protects holder and allies from enemy, friendly, self sleep, Rest and Yawn exactly once',()=>{
  const[p,t,ally]=setup('Alcremie','Pressure',true);p.addVolatile('gastroacid');t.setAbility('Mold Breaker');
  for(const target of [p,ally])for(const source of [p,t,ally]){assert(!target.trySetStatus('slp',source,Dex.moves.get('spore')));assert(!target.addVolatile('yawn',source,Dex.moves.get('yawn')));}
  ally.hp=Math.floor(ally.maxhp/2);battle.actions.useMove('rest',ally,{target:ally});assert.equal(ally.status,'');
  assert(ally.trySetStatus('par',t,Dex.moves.get('thunderwave')));
  assert(battle.log.some(l=>l.includes('passive: Sweet Veil')&&l.includes('[of] p1a: Alcremie')));
  assert(!battle.log.some(l=>l.includes('ability: Sweet Veil')));protocol.push({name:'sweet-veil-ally',log:battle.log});
 });
 it('Sweet Veil does not reveal a disguised holder in public attribution',()=>{
  const[p,t,ally]=setup('Alcremie','Illusion',true);battle.p1.pokemon[2].formeChange('Slurpuff');p.illusion=battle.p1.pokemon[2];const start=battle.log.length;
  assert(!ally.trySetStatus('slp',t,Dex.moves.get('spore')));assert(!battle.log.slice(start).join('\n').includes('Sweet Veil'));assert(!battle.log.slice(start).join('\n').includes('Alcremie'));
  protocol.push({name:'sweet-veil-hidden',log:battle.log});
 });
 for(const hazard of ['spikes','toxicspikes','stealthrock','stickyweb','gmaxsteelsurge'])it('Run Away bypasses '+hazard+' through suppression',()=>{
  const[p,t]=setup('Eevee','Pressure');p.side.addSideCondition(hazard,t,Dex.moves.get(hazard));p.addVolatile('gastroacid');const hp=p.hp;
  const condition=battle.dex.conditions.get(hazard);battle.singleEvent('SwitchIn',condition,p.side.sideConditions[hazard],p);
  assert.equal(p.hp,hp);assert.equal(p.status,'');assert.equal(p.boosts.spe,0);assert.equal(p.ability,'pressure');
 });
 it('Transform copies current passives, then restores original passives on switching; combat formes remove them',()=>{
  const[p,t]=setup('Eevee');t.formeChange('Cacturne',null,true);assert(p.transformInto(t));assert.deepEqual(p.getPassives(),['overcoat']);
  battle.makeChoices('switch 3','move splash');battle.makeChoices('switch 3','move splash');assert.deepEqual(p.getPassives(),['runaway']);
  p.formeChange('Eevee-Gmax',null,true);assert.deepEqual(p.getPassives(),['overcoat']);
 });
 it('calculator and species metadata include every ordinary and cosmetic passive without selectable grants',()=>{
  const metadata=require('../../../dist/sim/custom-calculator').calculatorMetadata();for(const id of Object.keys(SpeciesPassives))assert.deepEqual(metadata.species.find(s=>Dex.species.get(s.name).id===id)?.passives,SpeciesPassives[id],id);
  const {calculateScenario}=require('../../../dist/sim/custom-calculator');const input={format:'gen9nofieldsinglesgame',move:'Giga Drain',samples:8,seed:42,actors:Array.from({length:4},()=>({species:'Mew',ability:'No Ability'}))};input.actors[1]={species:'Tentacruel',ability:'No Ability'};const a=calculateScenario(input);input.actors[1].ability='Liquid Ooze';assert.deepEqual(calculateScenario(input).results,a.results);assert(a.exampleLog.some(l=>l.includes('passive: Liquid Ooze')));
 });
 for(const id of ThematicPassiveGroups.levitate)it(id+' floats through ordinary suppression and returns to ground under Gravity',()=>{
  const[p,t]=setup(id);suppression(p,t,()=>assert(!p.isGrounded()));
  battle.field.addPseudoWeather('gravity',t);assert.equal(p.isGrounded(),true);battle.field.removePseudoWeather('gravity');assert(!p.isGrounded());
 });
 for(const ability of ['No Ability','Mold Breaker','Teravolt','Turboblaze'])it(ability+' has normal attack-scoped behavior against innate Levitate and Shield Dust',()=>{
  const[p,t]=setup('Claydol','Levitate',false,ability);p.addVolatile('gastroacid');const hp=p.hp;
  const attack=battle.dex.getActiveMove('earthquake');attack.basePower=1;attack.accuracy=true;battle.actions.useMove(attack,t,{target:p});
  assert.equal(p.hp<hp,ability!=='No Ability');battle.clearActiveMove();assert.equal(p.isGrounded(),null);
  p.formeChange('Butterfree',null,true);p.setAbility('Shield Dust');p.addVolatile('gastroacid');
  const shock=battle.dex.getActiveMove('thunderbolt');shock.basePower=1;shock.accuracy=true;shock.secondaries=[{chance:100,status:'par'}];
  battle.actions.useMove(shock,t,{target:p});assert.equal(p.status,ability==='No Ability'?'':'par');
  protocol.push({name:'bypass-'+ability,log:battle.log});
 });
 it('all explicit grounding mechanics override innate Levitate, and removal restores it',()=>{
  const[p,t]=setup('Rotom','Pressure');p.addVolatile('gastroacid');
  p.setItem('Iron Ball');assert.equal(p.isGrounded(),true);p.clearItem();assert.equal(p.isGrounded(),null);
  p.addVolatile('ingrain',p);assert.equal(p.isGrounded(),true);p.removeVolatile('ingrain');assert.equal(p.isGrounded(),null);
  for(const name of ['smackdown','thousandarrows']){const move=battle.dex.getActiveMove(name);move.basePower=1;move.accuracy=true;const hp=p.hp;battle.actions.useMove(move,t,{target:p});assert(p.hp<hp,name);assert(p.volatiles.smackdown,name);assert.equal(p.isGrounded(),true);p.removeVolatile('smackdown');battle.clearActiveMove();assert.equal(p.isGrounded(),null);}
 });
 for(const bypass of [false,true])it('Sweet Veil ally sleep protection obeys attack-scoped bypass = '+bypass,()=>{
  const[p,t,ally]=setup('Alcremie','Pressure',true,bypass?'Mold Breaker':'No Ability');p.addVolatile('gastroacid');
  const sleep=battle.dex.getActiveMove('spore');sleep.accuracy=true;battle.actions.useMove(sleep,t,{target:ally});assert.equal(ally.status,bypass?'slp':'');
  ally.cureStatus();battle.clearActiveMove();assert(!ally.trySetStatus('slp',ally,Dex.moves.get('rest')));
 });
 it('Mold Breaker bypasses Hyper Cutter and Overcoat on attacks but leaves Run Away and offensive starter passives intact',()=>{
  const[p,t]=setup('Kingler','Hyper Cutter',false,'Mold Breaker');battle.actions.useMove('growl',t,{target:p});assert.equal(p.boosts.atk,-1);
  p.formeChange('Cacturne',null,true);p.setAbility('Overcoat');p.setType('Normal');const sleep=battle.dex.getActiveMove('spore');sleep.accuracy=true;battle.actions.useMove(sleep,t,{target:p});assert.equal(p.status,'slp');
  p.cureStatus();p.formeChange('Charizard-Mega-X',null,true);p.setAbility('Pressure');battle.field.terrain='';p.hp=1;t.setAbility('Mold Breaker');const move=battle.dex.getActiveMove('flamethrower');move.ignoreAbility=true;battle.setActiveMove(move,p,t);
  assert.equal(battle.runEvent('ModifySpA',p,t,move,100),100);const power=battle.runEvent('BasePower',p,t,move,100);assert(power>=130);move.ignoreAbility=false;assert.equal(battle.runEvent('BasePower',p,t,move,100),power);
  p.formeChange('Eevee',null,true);assert(p.hasAbilityOrPassive('runaway'));
 });
 it('Levitate attribution preserves a different selected ability and conceals a disguised species',()=>{
  const[p,t]=setup('Mismagius','Pressure');assert(!p.runImmunity('Ground',true));assert(battle.log.some(l=>l.includes('[from] passive: Levitate')));protocol.push({name:'levitate-selected-ability',log:battle.log.slice()});
  battle.p1.pokemon[2].formeChange('Rotom');p.illusion=battle.p1.pokemon[2];const start=battle.log.length;assert(!p.runImmunity('Ground',true));assert(!battle.log.slice(start).join('\n').includes('Levitate'));
 });
 for(const [species,ability,type,weather,stat]of [['Solrock','Solar Idol','Fire','sunnyday','ModifyAtk'],['Lunatone','Lunar Idol','Ice','hail','ModifySpA'],['Flygon','Elevate','Dragon','','ModifyAtk']])it(ability+' keeps extras while its redundant immunity respects all grounding',()=>{
  const[p,t]=setup(species,ability);assert(!p.isGrounded());
  for(const ground of ['gravity','smackdown','ironball','ingrain']){
   if(ground==='gravity')battle.field.addPseudoWeather('gravity',t);else if(ground==='ironball')p.setItem('Iron Ball');else p.addVolatile(ground,t);
   assert.equal(p.isGrounded(),true,ground);assert.notEqual(battle.runEvent('Immunity',p,null,null,'Ground'),false,ground);
   const move=battle.dex.getActiveMove('earthquake');move.basePower=1;const hp=p.hp;battle.actions.useMove(move,t,{target:p});assert(p.hp<hp,ground);battle.clearActiveMove();
   if(ground==='gravity')battle.field.removePseudoWeather('gravity');else if(ground==='ironball')p.clearItem();else p.removeVolatile(ground);
   assert(!p.isGrounded(),ground);
  }
  const arrows=battle.dex.getActiveMove('thousandarrows');arrows.basePower=1;const hp=p.hp;battle.actions.useMove(arrows,t,{target:p});assert(p.hp<hp);assert(p.volatiles.smackdown);p.removeVolatile('smackdown');battle.clearActiveMove();
  if(weather){battle.field.setWeather(weather,p);const move=battle.dex.getActiveMove(type==='Fire'?'flamethrower':'icebeam');assert.equal(battle.runEvent('BasePower',p,t,move,100),150);assert.equal(battle.runEvent(stat,p,t,move,100),150);}
  else {const before={...p.boosts};battle.runEvent('AfterFaint',t,p,Dex.moves.get('tackle'),1);assert(Object.keys(p.boosts).some(k=>p.boosts[k]>before[k]));}
 });
 for(const [ability,name]of [['Poison Touch','tackle'],['Toxic Chain','swift'],['Mire Chorus','hypervoice']])for(const bypass of [false,true])it('Shield Dust helper covers '+ability+' with attack bypass '+bypass,()=>{
  const[p,t]=setup('Butterfree','Shield Dust',false,ability);p.addVolatile('gastroacid');battle.randomChance=()=>true;
  const move=battle.dex.getActiveMove(name);move.basePower=1;move.accuracy=true;move.ignoreAbility=bypass;
  battle.actions.useMove(move,t,{target:p});assert.equal(!!p.status,bypass);
 });
});
