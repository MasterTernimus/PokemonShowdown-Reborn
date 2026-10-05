'use strict';
const assert=require('assert').strict,common=require('../../common');let battle;
function start(ability='Supreme Overlord',species='Mew',mode='singles') {
 const p={species,ability,moves:['splash']},f={species:'Mew',ability:'No Ability',moves:['splash']};
 battle=common.createBattle({gameType:mode},Array.from({length:mode==='freeforall'?4:2},(_,i)=>i?[{...f},{...f}]:[p,{...f}]));
 if(battle.requestState==='teampreview')battle.makeChoices(...battle.sides.map(()=> 'team 12'));
 battle.field.terrain='';return[battle.p1.active[0],battle.p2.active[0]];
}
describe('Three explicitly approved nerfs',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const ability of ['Supreme Overlord','Royal Sun',"Conqueror's Will",'Apex Bond','Raging Overlord','Tyrant Domain'])for(const mode of ['singles','freeforall'])it(ability+' caps its shared power after doubling in '+mode,()=>{
  const[p,t]=start(ability,'Mew',mode);battle.field.weather='';
  for(const n of [0,1,2,3,4,5,6,12]){p.side.totalFainted=n;assert.equal(p.getAbility().fallen.call(battle,p),Math.min(5,n*(mode==='freeforall'?2:1)));
   assert.equal(battle.runEvent('BasePower',p,t,battle.dex.getActiveMove('tackle'),1000),1000+100*Math.min(5,n*(mode==='freeforall'?2:1)));}
 });
 it('retains the cap when a revived reserve faints repeatedly, without repeating the five-faint boost',()=>{
  const[p,t]=start(),ally=p.side.pokemon[1];p.side.totalFainted=4;
  for(let i=0;i<4;i++){ally.fainted=false;ally.faintQueued=false;ally.hp=ally.maxhp;ally.faint(t,battle.dex.moves.get('tackle'));battle.faintMessages();battle.singleEvent('Start',p.getAbility(),p.abilityState,p);assert.equal(p.abilityState.fallen,5);assert.equal(p.boosts.atk,1);assert.equal(p.boosts.spa,1);}
  assert(p.side.totalFainted>5);assert.equal(battle.runEvent('BasePower',p,t,battle.dex.getActiveMove('tackle'),1000),1500);
 });
 for(const[species,ability,divisor]of [['Scrafty','Shed Skin',8],['Scrafty-Mega','Street Tyrant',8],['Scraggy','Shed Skin',4],['Arbok','Shed Skin',4],['Mew','Street Tyrant',4],['Mew','Aevian Dream',4],['Scrafty','Aevian Dream',4]])for(const den of [false,true])it(species+' '+ability+' heals 1/'+divisor+(den?' in Dragon Den':''),()=>{
  const[p]=start(ability,species);p.maxhp=p.baseMaxhp=800;p.hp=200;p.status='par';p.boosts.spe=-2;p.boosts.accuracy=1;p.addVolatile('confusion');
  if(den)battle.field.terrain='dragonsdenterrain';let chance=0;battle.randomChance=(n,d)=>{assert.equal(n,1);assert.equal(d,2);chance++;return true;};
  battle.singleEvent('Residual',p.getAbility(),p.abilityState,p);assert.equal(p.hp,200+800/divisor);assert.equal(p.status,'');assert.equal(chance,den?0:1);assert.equal(p.boosts.accuracy,1);
  if(den){assert.equal(p.boosts.spe,-2);assert(p.volatiles.confusion);assert.equal(p.boosts.def,-1);assert.equal(p.boosts.spd,-1);assert.equal(p.boosts.atk+p.boosts.spa,1);}else{assert.equal(p.boosts.spe,0);assert(!p.volatiles.confusion);}
 });
 it('retains Scrafty activation eligibility and failed 50% rolls',()=>{
  const[p]=start('Shed Skin','Scrafty');p.maxhp=p.baseMaxhp=800;p.hp=600;battle.randomChance=()=>{throw Error('healthy holder should not roll');};battle.singleEvent('Residual',p.getAbility(),p.abilityState,p);assert.equal(p.hp,600);
  p.hp=400;battle.randomChance=()=>false;battle.singleEvent('Residual',p.getAbility(),p.abilityState,p);assert.equal(p.hp,400);
 });
});
