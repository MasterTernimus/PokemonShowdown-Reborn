'use strict';
const assert=require('assert').strict, common=require('../../common');
const {Dex,Teams,TeamValidator}=require('../../../dist/sim');
describe('Oracle’s Refrain and requested coverage',()=>{
 let battle;
 afterEach(()=>{battle?.destroy();battle=null;});
 function setup(ability='No Ability',gameType='singles') {
  const set=(species,ability)=>({species,ability,moves:['psychic','boomburst','splash']});
  const teams=[[set('Politoed',ability),set('Mew','No Ability')],[set('Mew','No Ability'),set('Mew','No Ability')]];
  if(gameType==='freeforall')teams.push([set('Mew','No Ability')],[set('Mew','No Ability')]);
  battle=common.createBattle({gameType},teams);
  for(const side of battle.sides) for(const p of side.pokemon) {
   if(p.species.id==='mew')p.getPassives=()=>[];
   p.hp=p.maxhp=p.baseMaxhp=10000;
  }
  battle.randomizer=x=>x;return [battle.p1.active[0],battle.p2.active[0]];
 }
 const move=id=>Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false});
 it('only replaces the regular Politoed passive and preserves its Water typing',()=>{
  assert.deepEqual(Dex.species.get('politoed').passives,['oraclesrefrain']);assert.deepEqual(Dex.species.get('politoed').types,['Water']);
  assert.deepEqual(Dex.species.get('politoedrejuv').passives,['royalremedy']);
 });
 it('keeps the previous name as an alias',()=>{assert.equal(Dex.abilities.get('Oracular Chorus').id,'oraclesrefrain');});
 it('blocks sound status moves as well as damage',()=>{
  const [p,q]=setup();battle.actions.useMove(move('sing'),q,{target:p});assert.equal(p.status,'');
 });
 it('allows Mold Breaker to bypass its Soundproof component',()=>{
  const [p,q]=setup();q.setAbility('moldbreaker');battle.actions.useMove(move('boomburst'),q,{target:p});assert(p.hp<p.maxhp);
 });
 it('grants Psychic STAB without multiplying existing Psychic STAB twice',()=>{
  const [p,q]=setup();const m=move('psychic');battle.actions.useMove(m,p,{target:q});assert(p.lastMoveUsed.forceSTAB);
  const withPassive=q.maxhp-q.hp;q.hp=q.maxhp;p.getPassives=()=>[];battle.actions.useMove(move('psychic'),p,{target:q});
  const without=q.maxhp-q.hp;assert(Math.abs(withPassive/without-1.5)<0.03);
  p.setType('Psychic');q.hp=q.maxhp;battle.actions.useMove(move('psychic'),p,{target:q});const natural=q.maxhp-q.hp;
  p.getPassives=()=>['oraclesrefrain'];q.hp=q.maxhp;battle.actions.useMove(move('psychic'),p,{target:q});assert.equal(q.maxhp-q.hp,natural);
 });
 it('does not grant Psychic resistances or weaknesses',()=>{
  const [p]=setup();for(const id of ['psychic','closecombat'])assert.equal(p.runEffectiveness(move(id)),0);
  for(const id of ['shadowball','darkpulse','bugbuzz'])assert.equal(p.runEffectiveness(move(id)),0);
  p.setType(['Water','Normal']);assert.equal(p.runEffectiveness(move('closecombat')),1);assert.equal(p.runEffectiveness(move('psychic')),0);
  p.setType(['Water','Psychic']);assert.equal(p.runEffectiveness(move('psychic')),-1);
 });
 for(const ability of ['No Ability','Resonance Force',"Oracle's Refrain"]) it('boosts sound once with '+ability,()=>{
  const [p,q]=setup(ability);assert.equal(battle.runEvent('BasePower',p,q,move('boomburst'),100),150);
  assert.equal(battle.runEvent('BasePower',p,q,move('psychic'),100),100);
 });
 it('keeps the passive through selected-ability suppression',()=>{
  const [p,q]=setup('Drizzle');p.addVolatile('gastroacid');assert.equal(p.runEffectiveness(move('psychic')),0);
  battle.actions.useMove(move('boomburst'),q,{target:p});assert.equal(p.hp,p.maxhp);
  assert.equal(battle.runEvent('BasePower',p,q,move('boomburst'),100),150);
 });
 it('boosts allied sound and protects allies while Soundproof blocks opposing sound',()=>{
  const [p,q]=setup('No Ability','doubles'),ally=battle.p1.active[1];
  assert.equal(battle.runEvent('BasePower',ally,q,move('boomburst'),100),150);
  battle.actions.useMove(move('boomburst'),p,{target:q});assert.equal(ally.hp,ally.maxhp);assert(q.hp<q.maxhp);
  p.hp=p.maxhp;battle.actions.useMove(move('boomburst'),ally,{target:q});assert.equal(p.hp,p.maxhp);
  battle.actions.useMove(move('boomburst'),q,{target:p});assert.equal(p.hp,p.maxhp);
 });
 it('does not grant sound power or protection to FFA opponents',()=>{
  const [p,q]=setup('No Ability','freeforall');assert.equal(battle.runEvent('BasePower',q,p,move('boomburst'),100),100);
  battle.actions.useMove(move('boomburst'),p,{target:q});assert(q.hp<q.maxhp);
 });
 for(const [species,moves] of Object.entries({Politoed:['Sparkling Aria','Boomburst','Alluring Voice'],Hitmonchan:['Meteor Mash','Shadow Punch','Surging Strikes','Sucker Punch']})) {
  for(const name of moves)it(species+' legally learns '+name,()=>{
   const team=Teams.import(species+'\nAbility: '+Dex.species.get(species).abilities[0]+'\n- '+name+'\n\nPikachu\nAbility: Static\n- Protect');
   assert.equal(TeamValidator.get('gen9doublesrockyfield@@@Obtainable Moves').validateTeam(team),null);
  });
 }
});
