'use strict';
const assert=require('assert').strict,common=require('../../common');
const {Dex}=require('../../../dist/sim/dex');
const {abilityIncludesComponent}=require('../../../dist/data/ability-components');
describe('Approved October signatures',()=>{
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
 it('assigns only the approved slots and removes replaced composite identities',()=>{
  assert.deepEqual(Dex.species.get('Skarmory').abilities,{0:'Steel Plumage',1:'Sturdy',H:'Weak Armor'});
  assert.equal(Dex.species.get('Skeledirge-Aevian').abilities.H,'Venom Canticle');assert.equal(Dex.species.get('Chimecho').abilities[0],'Temple Chime');
  for(const[a,c]of [['solarhydra','selfrepair'],['solarhydra','naturalcure'],['stormcalling','tintedlens'],['mossarmor','regenerator']])assert(!abilityIncludesComponent(a,c),a+c);
  for(const[a,c]of [['solarhydra','solarbud'],['stormcalling','liquidvoice'],['mossarmor','naturalcure'],['templechime','levitate']])assert(abilityIncludesComponent(a,c),a+c);
  assert(Dex.species.getLearnsetData('maractus').learnset.rapidspin);assert(Dex.species.getLearnsetData('lumineon').learnset.haze);
 });
 it('Steel Plumage waits for the full contact sequence and activates only once',()=>{const[p,t]=setup('Steel Plumage');let before;const old=battle.actions.getDamage;battle.actions.getDamage=function(...args){before=!!t.side.sideConditions.spikes;return old.apply(this,args)};use(t,p,'tackle',{multihit:2});assert.equal(before,false);assert.equal(t.side.sideConditions.spikes.layers,1);use(t,p);assert.equal(t.side.sideConditions.spikes.layers,1);});
 it('Steel Plumage does not activate if a later hit KOs the holder',()=>{const[p,t]=setup('Steel Plumage');use(t,p,'tackle',{damage:Math.ceil(p.maxhp/2),multihit:2});assert.equal(p.hp,0);assert(!t.side.sideConditions.spikes);});
 it('Steel Plumage excludes Substitute, noncontact and allied hits',()=>{const[p,t]=setup('Steel Plumage','doubles');p.addVolatile('substitute');use(t,p);assert(!t.side.sideConditions.spikes);p.removeVolatile('substitute');use(t,p,'swift');use(p.side.active[1],p);assert(!t.side.sideConditions.spikes);assert(!p.side.sideConditions.spikes);});
 it('Steel Plumage puts FFA Spikes only on the attacker side, respecting the layer cap',()=>{const[p]=setup('Steel Plumage','ffa'),t=battle.p3.active[0];for(let i=0;i<3;i++)t.side.addSideCondition('spikes',p);use(t,p);assert.equal(t.side.sideConditions.spikes.layers,3);assert(!battle.p2.sideConditions.spikes);assert(!battle.p4.sideConditions.spikes);});
 it('Venom Canticle converts damaging Normal sounds without a multiplier or status conversion',()=>{const[p,t]=setup('Venom Canticle');const m=use(p,t,'boomburst');assert.equal(m.type,'Poison');assert.equal(battle.runEvent('BasePower',p,t,m,100,true),100);const s=battle.dex.getActiveMove('perishsong');battle.runEvent('ModifyType',p,t,s,s);assert.equal(s.type,'Normal');const fire=use(p,t,'torchsong');assert.equal(fire.type,'Fire');});
 it('Venom Canticle preserves Steel/Soundproof immunity, Throat Chop and allied Boomburst damage',()=>{const[p,t]=setup('Venom Canticle','doubles'),ally=p.side.active[1];t.setType('Steel');battle.p2.active[1].setAbility('Soundproof');const a=ally.hp,h=t.hp,h2=battle.p2.active[1].hp;use(p,t,'boomburst');assert(ally.hp<a);assert.equal(t.hp,h);assert.equal(battle.p2.active[1].hp,h2);p.addVolatile('throatchop');const h3=ally.hp;use(p,t,'boomburst');assert.equal(ally.hp,h3);});
 it('Solar Hydra stores one sun bud, retains its cost, and spends it only on opposing Grass HP damage',()=>{const[p,t]=setup('Solar Hydra');battle.field.clearTerrain();battle.field.setWeather('sunnyday');const hp=p.hp;residual(p);assert.equal(p.hp,hp-Math.floor(p.baseMaxhp/8));assert(p.abilityState.solarBudReady);p.setStatus('par');t.addVolatile('substitute');use(p,t,'vinewhip',{multihit:1});assert(p.abilityState.solarBudReady);t.removeVolatile('substitute');const h=p.hp;use(p,t,'vinewhip',{multihit:1});assert.equal(p.status,'');assert.equal(p.hp,h+Math.floor(p.baseMaxhp/8));assert(p.m.solarBudSpent);residual(p);assert(!p.abilityState.solarBudReady);});
 it('Solar Bud ignores allied Grass damage and suppressed sunlight',()=>{const[p,t]=setup('Solar Bud','doubles');battle.field.setWeather('sunnyday');t.setAbility('Cloud Nine');residual(p);assert(!p.abilityState.solarBudReady);t.setAbility('No Ability');residual(p);assert(p.abilityState.solarBudReady);use(p,p.side.active[1],'vinewhip');assert(p.abilityState.solarBudReady);});
 it('Solar Hydra no longer cures or heals on switching, nor passively heals without sun',()=>{const[p]=setup('Solar Hydra');battle.field.clearTerrain();p.hp-=100;p.setStatus('par');const hp=p.hp;residual(p);out(p);assert.equal(p.hp,hp);assert.equal(p.status,'par');});
 it('Storm Calling marks resistance once, neutralizes the whole double resistance, and retains Liquid Voice',()=>{const[p,t]=setup('Storm Calling');t.setType(['Water','Grass']);use(p,t,'hypervoice');assert.equal(p.abilityState.echoTarget,t);assert.equal(t.getMoveHitData(battle.activeMove).typeMod,-2);const second=use(p,t,'hypervoice');assert.equal(t.getMoveHitData(second).typeMod,0);assert(!p.abilityState.echoTarget);assert.equal(battle.runEvent('BasePower',p,t,second,100,true),120);use(p,t,'hypervoice');assert.equal(t.getMoveHitData(battle.activeMove).typeMod,-2);});
 it('Dissonant Echo consumes on Protect attempts and never bypasses immunity',()=>{const[p,t]=setup('Storm Calling');t.setType('Water');use(p,t,'hypervoice');t.addVolatile('protect');use(p,t,'hypervoice');assert(!p.abilityState.echoTarget);t.removeVolatile('protect');p.abilityState.echoTarget=t;p.abilityState.echoExpires=battle.turn+1;t.setAbility('Water Absorb');const hp=t.hp;use(p,t,'hypervoice');assert(t.hp>=hp);assert(!p.abilityState.echoTarget);});
 it('Dissonant Echo expires next turn and clears on target switching',()=>{const[p,t]=setup('Storm Calling');t.setType('Water');use(p,t,'hypervoice');battle.turn++;residual(p);assert(!p.abilityState.echoTarget);p.abilityState.echoTarget=t;battle.runEvent('SwitchOut',t);assert(!p.abilityState.echoTarget);});
 it('a resisted FFA sound attack marks only one primary foe',()=>{const[p,t]=setup('Storm Calling','ffa');for(const side of battle.sides.slice(1))side.active[0].setType('Water');use(p,t,'hypervoice');assert.equal(p.abilityState.echoTarget,t);use(p,t,'hypervoice');assert.equal(t.getMoveHitData(battle.activeMove).typeMod,0);for(const side of battle.sides.slice(2))assert.equal(side.active[0].getMoveHitData(battle.activeMove).typeMod,-1);});
 it('Storm Calling preserves Icy Field sound conversion',()=>{const[p,t]=setup('Storm Calling');battle.field.setTerrain('icyterrain',p);assert.equal(use(p,t,'hypervoice').type,'Ice');});
 it('Moss Armor heals only after actual opposing Grass damage and only within the timing window',()=>{const[p,t]=setup('Moss Armor');p.hp-=150;const h=p.hp;out(p);assert.equal(p.hp,h);use(p,t,'vinewhip');battle.turn++;out(p);assert.equal(p.hp,h+Math.floor(p.baseMaxhp/8));battle.turn++;const h2=p.hp;out(p);assert.equal(p.hp,h2);});
 it('Moss Armor loses its Grass switch heal after another action and cannot farm allies or substitutes',()=>{const[p,t]=setup('Moss Armor','doubles');p.hp-=150;use(p,t,'vinewhip');use(p,t,'splash');const h=p.hp;out(p);assert.equal(p.hp,h);t.addVolatile('substitute');use(p,t,'vinewhip');out(p);assert.equal(p.hp,h);use(p,p.side.active[1],'vinewhip');out(p);assert.equal(p.hp,h);});
 it('Moss Armor preserves Levitate, Stamina and Natural Cure healing',()=>{const[p,t]=setup('Moss Armor');assert(!p.isGrounded());use(t,p);assert.equal(p.boosts.def,1);p.hp=50;p.setStatus('par');use(p,t,'vinewhip');const h=p.hp;out(p);assert.equal(p.status,'');assert.equal(p.hp,h+Math.floor(p.baseMaxhp/3)+Math.floor(p.baseMaxhp/8));});
 it('Temple Chime needs an actual Heal Bell cure and resets only negative SpD once',()=>{const[p,t]=setup('Temple Chime');assert(!p.isGrounded());p.boosts.spd=-2;p.boosts.def=-1;use(p,p,'healbell');assert.equal(p.boosts.spd,-2);assert(!p.m.templeChimeUsed);p.side.pokemon[1].setStatus('par');p.hp-=100;const h=p.hp;use(p,p,'healbell');assert.equal(p.boosts.spd,0);assert.equal(p.boosts.def,-1);assert.equal(p.hp,h+Math.floor(p.baseMaxhp/4));assert(p.side.sideConditions.safeguard);p.boosts.spd=-2;p.side.pokemon[1].setStatus('par');use(p,p,'healbell');assert.equal(p.boosts.spd,-2);});
 it('Temple Chime preserves Elevate KO boosts',()=>{const[p,t]=setup('Temple Chime');t.hp=1;use(p,t);battle.faintMessages();assert(Object.values(p.boosts).some(x=>x>0));});
 it('entry-limited effects become available again after an actual switch cycle',()=>{
  const[p,t]=setup('Steel Plumage');use(t,p);assert.equal(t.side.sideConditions.spikes.layers,1);
  battle.makeChoices('switch 2','move 1');battle.makeChoices('switch 2','move 1');assert.equal(battle.p1.active[0],p);
  use(t,p);assert.equal(t.side.sideConditions.spikes.layers,2);
 });
 it('Temple Chime does not trigger from a Soundproof teammate whose status remains',()=>{
  const[p]=setup('Temple Chime','doubles');const ally=p.side.active[1];ally.setAbility('Soundproof');ally.setStatus('par');p.boosts.spd=-2;
  use(p,p,'healbell');assert.equal(ally.status,'par');assert.equal(p.boosts.spd,-2);assert(!p.m.templeChimeUsed);
 });
 it('Moss Armor retains Natural Cure on Bewitched Woods without unconditional regeneration',()=>{
  const[p]=setup('Moss Armor');battle.field.setTerrain('bewitchedwoodsterrain',p);p.hp-=100;p.setStatus('par');const hp=p.hp;
  residual(p);assert.equal(p.status,'');assert.equal(p.hp,hp);
 });
 it('Dissonant Echo cannot be earned from immune, neutral or allied hits',()=>{
  const[p,t]=setup('Dissonant Echo','doubles');t.setType('Normal');t.addVolatile('substitute');
  use(p,t,'bugbuzz',{flags:{protect:1,sound:1},type:'Ghost'});assert(!p.m.dissonantEchoUsed);
  use(p,t,'bugbuzz',{flags:{protect:1,sound:1},type:'Bug'});assert(!p.m.dissonantEchoUsed);
  const ally=p.side.active[1];ally.setType('Fire');use(p,ally,'bugbuzz');assert(!p.m.dissonantEchoUsed);
 });
 it('Lumineon cosmetics inherit Haze and the identical effective move pool',()=>{
  const pool=id=>[...new Set(Dex.species.getFullLearnset(id).flatMap(x=>Object.keys(x.learnset||{})))].sort();
  assert(pool('lumineonalt').includes('haze'));assert.deepEqual(pool('lumineonalt'),pool('lumineon'));
 });
 it('Steel Plumage still activates when contact recoil faints its attacker',()=>{
  const[p,t]=setup('Steel Plumage');p.setItem('Rocky Helmet');t.hp=1;use(t,p);assert.equal(t.hp,0);assert.equal(t.side.sideConditions.spikes.layers,1);
 });
 it('a spread echo chooses the first eligible foe when the selected target is immune',()=>{
  const[p,t]=setup('Storm Calling','ffa');t.setAbility('Water Absorb');for(const side of battle.sides.slice(2))side.active[0].setType('Water');
  use(p,t,'hypervoice');assert.equal(p.abilityState.echoTarget,battle.p3.active[0]);
 });
 it('Dissonant Echo is spent on a miss without creating a replacement mark',()=>{
  const[p,t]=setup('Storm Calling');t.setType('Water');use(p,t,'hypervoice');const hp=t.hp;use(p,t,'hypervoice',{accuracy:0});assert.equal(t.hp,hp);assert(!p.abilityState.echoTarget);assert(p.m.dissonantEchoUsed);
 });
});
