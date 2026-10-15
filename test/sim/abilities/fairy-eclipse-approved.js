'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');let battle;
const mon=(species='Mew',ability='No Ability',moves=['splash','reflect','lightscreen','tackle'])=>({species,ability,moves});
function setup(species='Shiinotic',ability='Guiding Glow',mode='doubles'){battle=common.createBattle({gameType:mode},[[mon(species,ability),mon(),mon()],[mon(),mon(),mon()]]);battle.field.terrain='';for(const p of battle.getAllActive())p.hp=p.maxhp=p.baseMaxhp=1000;return[battle.p1.active[0],battle.p2.active[0]];}
function use(p,q,id){battle.actions.runMove(Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false}),p,p.getLocOf(q));}
describe('Fairy Ring approved passive',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('stops draining additional foes when Liquid Ooze knocks out its holder',()=>{
  const[p,q]=setup();p.hp=1;q.status='par';q.setAbility('Liquid Ooze');const other=q.side.active[1];other.status='par';
  battle.runEvent('Residual',p);assert.equal(p.hp,0);assert.equal(other.hp,1000);
 });
 it('exact lineup and unchanged base stats; passive SpD applies once under suppression',()=>{const[p,q]=setup('Shiinotic','Fairy Ring');assert.deepEqual(p.species.abilities,{0:'Guiding Glow',1:'Neutralization',H:'Rainlit Growth'});assert.deepEqual(p.getPassives(),['fairyring']);assert.equal(battle.runEvent('ModifySpD',p,q,Dex.getActiveMove('surf'),100),130);p.addVolatile('gastroacid',q);assert.equal(battle.runEvent('ModifySpD',p,q,Dex.getActiveMove('surf'),100),130);});
 for(const id of ['drain','strengthsap','leechseed','ingrain','aquaring'])it('boosts '+id+' recovery and Big Root exactly once',()=>{const[p,q]=setup();const effect=Dex.conditions.get(id);assert.equal(battle.runEvent('TryHeal',p,q,effect,100),130);p.setItem('Big Root');assert.equal(battle.runEvent('TryHeal',p,q,effect,100),169);});
 it('drains only major-statused foes and heals actual HP removed',()=>{const[p,q]=setup();p.hp=100;q.status='brn';q.hp=5;const ally=p.side.active[1];ally.status='par';battle.runEvent('Residual',p);assert.equal(q.hp,0);assert.equal(p.hp,100+battle.modify(5,1.3));assert.equal(ally.hp,1000);assert.equal(q.side.active[1].hp,1000);});
 it('Magic Guard prevents loss and recovery',()=>{const[p,q]=setup();p.hp=100;q.status='psn';q.setAbility('Magic Guard');battle.runEvent('Residual',p);assert.equal(q.hp,1000);assert.equal(p.hp,100);});
 it('Liquid Ooze reverses recovery; Heal Block prevents healing without blocking foe damage',()=>{const[p,q]=setup();p.hp=500;q.status='par';q.setAbility('Liquid Ooze');battle.runEvent('Residual',p);assert.equal(q.hp,938);assert(p.hp<500);q.setAbility('No Ability');p.addVolatile('healblock',q);const before=p.hp;battle.runEvent('Residual',p);assert.equal(q.hp,876);assert.equal(p.hp,before);});
 it('genuine entry Spotlights one living ally without an active-restart trigger',()=>{const[p,q]=setup();const ally=p.side.active[1];assert(ally.volatiles.spotlight);assert(!p.volatiles.spotlight);ally.removeVolatile('spotlight');p.setAbility('No Ability');p.setAbility('Fairy Ring');assert(!ally.volatiles.spotlight);});
 it('Spotlight and Illuminate Starlight entry do not duplicate their volatile',()=>{const[p,q]=setup();const ally=p.side.active[1];ally.removeVolatile('spotlight');battle.field.terrain='starlightarenaterrain';battle.log.length=0;battle.singleEvent('SwitchIn',Dex.abilities.get('fairyring'),{target:p,speciesPassive:'fairyring'},p);battle.singleEvent('Start',p.getAbility(),p.abilityState,p);assert.equal(battle.log.filter(l=>l.includes('|-singleturn|')&&l.includes('Spotlight')).length,1);});
 it('Guiding Glow protects against sleep and Rainlit Growth needs effective rain',()=>{const[p,q]=setup();assert(!p.setStatus('slp',q));assert(!p.side.active[1].addVolatile('yawn',q));p.setAbility('Rainlit Growth');battle.field.weather='raindance';assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('gigadrain'),100),130);q.setAbility('Cloud Nine');assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('gigadrain'),100),100);});
});
describe('Approved Eclipse and Shadow Tag numeric/passive changes',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('Gothitelle replaces Forewarn with Eclipse Vision and uses Astral Concord in the vacated slot',()=>{const[p,q]=setup('Gothitelle','Eclipse Vision');assert.deepEqual(p.getPassives(),['eclipsevision']);assert.equal(p.species.abilities.H,'Astral Concord');assert.equal(battle.runEvent('ModifySpA',p,q,Dex.getActiveMove('psychic'),100),130);p.addVolatile('gastroacid');assert.equal(battle.runEvent('ModifySpA',p,q,Dex.getActiveMove('psychic'),100),130);use(p,q,'darkpulse');assert(p.hasType('Dark'));use(p,q,'psychic');assert(p.hasType('Psychic'));});
 for(const ability of ['Shadow Tag','Cruel Tag','Soul Tag'])it(ability+' retains the shared 0.8 attack multiplier',()=>{const[p,q]=setup('Mew',ability);assert(p.hasAbility('shadowtag'),ability);assert.equal(battle.runEvent('ModifyDamage',q,p,Dex.getActiveMove('tackle'),100),80);});
 it('Shadow Tag trapping and unsuppressibility remain',()=>{const[p,q]=setup('Mew','Shadow Tag');use(q,p,'gastroacid');assert(!p.volatiles.gastroacid);battle.runEvent('TrapPokemon',q);assert(q.trapped);q.setType('Ghost');q.trapped=false;battle.runEvent('TrapPokemon',q);assert(!q.trapped);});
});
describe('Approved Mime family passive migration',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const id of ['mrrime','mrmimegalar'])it(id+' gets one passive screen priority/heal with duplicate selected ability',()=>{const[p,q]=setup(id,'Mimecraft');const ally=p.side.active[1];ally.hp=100;const move=Dex.getActiveMove('reflect');assert.equal(battle.runEvent('ModifyPriority',p,q,move,0),1);use(p,p,'reflect');assert.equal(ally.hp,225);p.setAbility('No Ability');p.setAbility('Mimecraft');use(p,p,'lightscreen');assert.equal(ally.hp,225);});
 it('only the exact Galar slot changes; regular/Pulse and pending Rime slot stay',()=>{assert.equal(Dex.species.get('mrmimegalar').abilities[0],'Invisible Wall');assert.deepEqual(Dex.species.get('mrrime').abilities,{0:'Tap Tempo',1:'Curtain Call',H:'Stage Sweep'});assert.deepEqual(Dex.species.get('mrmime').abilities,{0:'Invisible Wall',1:'Silent Act',H:'Trick Performer'});assert.deepEqual(Dex.species.get('mrmimepulse').passives,[]);assert.deepEqual(Dex.species.get('mrrime').passives,['mimecraft']);});
});

describe('Approved paired Concord abilities',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('Adaptive Cell replaces only base Natural Cure and remains once under suppression',()=>{
  const[p,q]=setup('Reuniclus','Adaptive Cell');
  assert.deepEqual(p.getPassives(),['adaptivecell']);
  assert.deepEqual(p.species.abilities,{0:'Cellular Concord',1:'Magic Guard',H:'Regenerator'});
  assert.deepEqual(Dex.species.get('reuniclusmega').passives,['regenerator']);
  assert.equal(battle.runEvent('ModifySpA',p,q,Dex.getActiveMove('psychic'),100),130);
  p.addVolatile('gastroacid',q);
  assert.equal(battle.runEvent('ModifySpA',p,q,Dex.getActiveMove('psychic'),100),130);
  use(p,q,'tackle');assert(p.hasType('Fighting'));
  use(p,q,'psychic');assert(p.hasType('Psychic'));
 });
 it('Cellular Concord retains Natural Cure healing and Analytic callbacks',()=>{
  const[p,q]=setup('Reuniclus','Cellular Concord');
  p.hp=100;p.status='brn';
  battle.singleEvent('SwitchOut',p.getAbility(),p.abilityState,p);
  assert.equal(p.status,'');assert.equal(p.hp,433);
  assert.equal(Dex.abilities.get('cellularconcord').onBasePower,Dex.abilities.get('analytic').onBasePower);
  assert.equal(Dex.abilities.get('cellularconcord').onResidual,Dex.abilities.get('naturalcure').onResidual);
 });
 it('Astral Concord retains all Forewarn and Competitive callbacks',()=>{
  const a=Dex.abilities.get('astralconcord');
  for(const component of ['forewarn','competitive'])for(const [key,value] of Object.entries(Dex.abilities.get(component))) {
   if(key.startsWith('on')&&typeof value==='function')assert.equal(a[key],value,key);
  }
 });
});

describe('Approved Coils, Skimmer and Mime selected abilities',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('Trick Performer gives screens only one priority and retains other Prankster status priority',()=>{
  const[p,q]=setup('Mr. Mime','Trick Performer');
  for(const id of ['reflect','lightscreen','splash'])assert.equal(battle.runEvent('ModifyPriority',p,q,Dex.getActiveMove(id),0),1);
  assert.equal(battle.runEvent('ModifyPriority',p,q,Dex.getActiveMove('tackle'),0),0);
 });
 it('Tap Tempo rolls once after a whole multi-hit attack',()=>{
  const[p,q]=setup('Mr. Rime','Tap Tempo');let rolls=0;battle.randomChance=()=>{rolls++;return true;};
  const move=Object.assign(Dex.getActiveMove('iciclespear'),{accuracy:true,willCrit:false,multihit:3});
  battle.actions.useMove(move,p,{target:q});assert.equal(q.boosts.spe,-1);assert.equal(rolls,1);
 });
 it('Skimmer applies Water benefits once under suppression and copied selected ability',()=>{
  const[p,q]=setup('Masquerain','Prism Skimmer');assert.deepEqual(p.getPassives(),['prismskimmer']);
  assert(p.volatiles.laserfocus);p.addVolatile('gastroacid');
  assert.equal(battle.runEvent('ModifyDamage',q,p,Dex.getActiveMove('surf'),100),50);
  assert.equal(battle.runEvent('ModifySTAB',p,q,Dex.getActiveMove('surf'),1),1.5);
  p.removeVolatile('laserfocus');p.setAbility('No Ability');p.setAbility('Prism Skimmer');assert(!p.volatiles.laserfocus);
  use(q,p,'tackle');assert(p.volatiles.laserfocus);
 });
 it('Skimmer does not arm from Substitute-only damage',()=>{
  const[p,q]=setup('Masquerain','No Ability');p.removeVolatile('laserfocus');p.addVolatile('substitute');
  use(q,p,'tackle');assert(!p.volatiles.laserfocus);
 });
 it('Coils binds opposing HP hits, reduces bound attacks once, and heals actual residual loss',()=>{
  const[p,q]=setup('Arbok','Constricting Coils');use(p,q,'tackle');assert(q.volatiles.partiallytrapped);
  assert.equal(battle.runEvent('ModifyDamage',q,p,Dex.getActiveMove('tackle'),100),80);
  const state=q.volatiles.partiallytrapped, duration=state.duration;use(p,q,'tackle');assert.equal(state.duration,duration);
  p.hp=100;p.activeTurns=1;q.hp=5;
  battle.singleEvent('Residual',Dex.conditions.get('partiallytrapped'),state,q);assert.equal(p.hp,105);assert.equal(q.hp,0);
 });
 it('Coils respects Magic Guard and Heal Block without inventing recovery',()=>{
  const[p,q]=setup('Arbok','No Ability');use(p,q,'tackle');p.activeTurns=1;p.hp=100;q.setAbility('Magic Guard');
  const state=q.volatiles.partiallytrapped;battle.singleEvent('Residual',Dex.conditions.get('partiallytrapped'),state,q);assert.equal(p.hp,100);
  q.setAbility('No Ability');p.addVolatile('healblock',q);const before=q.hp;
  battle.singleEvent('Residual',Dex.conditions.get('partiallytrapped'),state,q);assert(q.hp<before);assert.equal(p.hp,100);
 });
 it('Coils ignores Substitute-only and ally hits',()=>{
  const[p,q]=setup('Arbok','No Ability');q.addVolatile('substitute');use(p,q,'tackle');assert(!q.volatiles.partiallytrapped);
  const ally=p.side.active[1];use(p,ally,'tackle');assert(!ally.volatiles.partiallytrapped);
 });
});
