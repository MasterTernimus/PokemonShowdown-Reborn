'use strict';
const assert=require('assert').strict,common=require('../../common');
describe('Hydra Heart and Ange approved scope; disputed abilities verification',()=>{
 let battle;afterEach(()=>battle?.destroy());
 function setup(ability,species='Mew'){battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species,ability,moves:['splash']}],[{species:'Mew',ability:'No Ability',moves:['splash']}]]);battle.makeChoices('team 1','team 1');return[battle.p1.active[0],battle.p2.active[0]];}
 it('Hydra Heart retains Hydra Bond and Stamina without passive healing or weather immunity',()=>{
  const[p,t]=setup('Hydra Heart','Hydrapple');assert(p.hasAbility('hydrabond'));assert(p.hasAbility('stamina'));assert(!p.hasAbility('selfsufficient'));p.hp-=100;const hp=p.hp;battle.singleEvent('Residual',p.getAbility(),p.abilityState,p);assert.equal(p.hp,hp);assert(p.runStatusImmunity('hail'));assert(p.runStatusImmunity('sandstorm'));
  const m=battle.dex.getActiveMove('dragonpulse');battle.singleEvent('ModifyMove',p.getAbility(),p.abilityState,m,p,t);assert.equal(m.multihit,3);
  battle.singleEvent('DamagingHit',p.getAbility(),p.abilityState,p,t,battle.dex.getActiveMove('tackle'),1);assert.equal(p.boosts.def,1);assert(p.hp>hp);
 });
 it('Ange excludes every current Rift/Pulse form even when Terastallized',()=>{
  const[p,t]=setup('Ange','Floette-Mega');const forms=battle.dex.species.all().filter(s=>/^(Rift|Pulse)(?:-|$)/i.test(s.forme));assert(forms.length >= 12, 'Expected the current Rift/Pulse roster, including new forms');
  for(const species of forms){t.species=species;for(const tera of ['', 'Fire']){t.terastallized=tera;for(const stat of ['Atk','Def','SpA','SpD','Spe'])assert.equal(battle.runEvent('Modify'+stat,t,p,null,100),100,species.name+' '+tera+' '+stat);}}
 });
 it('Ange retains 0.7 suppression on all five stats for eligible Mega and Gmax targets',()=>{
  const[p,t]=setup('Ange','Floette-Mega');for(const [species,gmax]of [['Gardevoir-Mega',false],['Drednaw-Gmax',true]]){t.species=battle.dex.species.get(species);t.gigantamax=gmax;for(const stat of ['Atk','Def','SpA','SpD','Spe'])assert.equal(battle.runEvent('Modify'+stat,t,p,null,100),70,species+' '+stat);}
 });
 it('Ange preserves Eternal Flower field and Grass amplification',()=>{
  const[p,t]=setup('Ange','Floette-Mega');const m=battle.dex.getActiveMove('gigadrain');assert.equal(battle.runEvent('ModifySpA',p,t,m,100),150);battle.field.terrain='fairytaleterrain';assert.equal(battle.runEvent('ModifySpA',p,t,m,100),300);assert.equal(battle.runEvent('Damage',p,t,battle.dex.conditions.get('brn'),10),false);
 });
 for(const field of ['', 'mistyterrain','rainbowterrain'])it('verifies corrected Celestial Heart faint rewards on '+(field||'no field'),()=>{
  const[p]=setup('Celestial Heart','Dragonite-Mega');battle.field.terrain=field;battle.singleEvent('AnyFaint',p.getAbility(),p.abilityState,p);assert.equal(p.boosts.spa,1);assert.equal(p.boosts.spd,field?2:0);
 });
 it('Mourning Snow now adds an attack secondary without passive weather frostbite',()=>{
  const[p,t]=setup('Mourning Snow','Froslass-Mega');const m=battle.dex.getActiveMove('shadowball');m.secondaries=[];battle.singleEvent('ModifyMove',p.getAbility(),p.abilityState,m,p,t);assert.equal(m.secondaries.length,1);assert.equal(m.secondaries[0].status,'frz');assert.equal(m.secondaries[0].chance,30);battle.randomChance=()=>true;battle.field.weather='';battle.singleEvent('Residual',p.getAbility(),p.abilityState,p);assert.equal(t.status,'');battle.field.weather='hail';battle.singleEvent('Residual',p.getAbility(),p.abilityState,p);assert.equal(t.status,'');
 });
});
