'use strict';
const assert=require('assert').strict;
const common=require('../../common');
let battle;
function setup(species='Mew',ability='Forewarn',foeAbility='No Ability',move='shadowball') {
 battle=common.createBattle({formatid:'gen9nofieldsinglesgame'}, [[{species,ability,moves:['splash']},{species:'Mew',ability:'No Ability',moves:['splash']}],[{species:'Mew',ability:foeAbility,moves:[move,'tackle']},{species:'Mew',ability:'No Ability',moves:['splash']}]]);
 battle.makeChoices('team 12','team 12');return [battle.p1.active[0],battle.p2.active[0]];
}
function damage(p,q,id='shadowball'){return battle.runEvent('Damage',p,q,battle.dex.getActiveMove(id),1000);}
describe('Warned move protection and Cold Logic contingency',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const [species,ability] of [['Mew','Forewarn'],['Mew','Anticipation'],['Gardevoir','No Ability'],['Sigilyph','No Ability'],['Mew','Shadow Current']]) {
  it(species+' '+ability+' learns the warned move only, clears on switching',()=>{
   const[p,q]=setup(species,ability);assert.equal(damage(p,q),750);
   assert.equal(damage(p,q,'tackle'),ability==='Forewarn'||species==='Gardevoir'?800:1000);
   battle.makeChoices('switch 2','move tackle');assert(!p.volatiles.warnedmoves);
  });
 }
 it('selected protection stops under suppression; native passive protection remains',()=>{
  const[p,q]=setup();p.addVolatile('gastroacid');assert.equal(damage(p,q),1000);
  p.removeVolatile('gastroacid');assert.equal(damage(p,q),750);
 });
 it('does not grant OHKO protection',()=>{
  const[p,q]=setup('Mew','Anticipation','No Ability','fissure');assert(!p.volatiles.warnedmoves);assert.equal(damage(p,q,'fissure'),1000);
 });
 it('Cold Logic uses 25% for warned neutral hits and retains stronger Prism reduction',()=>{
  const[p,q]=setup('Metagross-Mega','Cold Logic','No Ability','surf');
  for(const [typeMod,expected] of [[0,750],[1,600]]) {
   const move=battle.dex.getActiveMove('surf');p.getMoveHitData(move).typeMod=typeMod;
   const modified=battle.runEvent('ModifyDamage',q,p,move,1000);
   assert.equal(battle.runEvent('Damage',p,q,move,modified),expected);
  }
 });
 for(const move of ['shadowball','tackle','bulletseed'])it('Cold Logic retaliates once against '+move+' KO',()=>{
  const[p,q]=setup('Metagross-Mega','Cold Logic','No Ability',move);p.hp=1;const hp=q.hp;
  battle.actions.useMove(move,q,{target:p});assert.equal(p.hp,0);assert.equal(q.hp,hp-Math.floor(q.baseMaxhp/4));
 });
 for(const ability of ['Damp','Magic Guard'])it(ability+' prevents contingency damage',()=>{
  const[p,q]=setup('Metagross-Mega','Cold Logic',ability);p.hp=1;const hp=q.hp;
  battle.actions.useMove('shadowball',q,{target:p});assert.equal(p.hp,0);assert.equal(q.hp,hp);
 });
 it('Corrosive Mist retains the half-HP retaliation',()=>{
  const[p,q]=setup('Metagross-Mega','Cold Logic');battle.field.terrain='corrosivemistterrain';p.hp=1;const hp=q.hp;
  battle.actions.useMove('shadowball',q,{target:p});assert.equal(q.hp,hp-Math.floor(q.baseMaxhp/2));
 });
 it('ordinary Aftermath still needs contact; residual damage does not trigger Cold Logic',()=>{
  const[p,q]=setup('Mew','Aftermath');p.hp=1;const hp=q.hp;battle.actions.useMove('shadowball',q,{target:p});assert.equal(q.hp,hp);
 });

 it('native Forewarn remains active under Neutralizing Gas',()=>{
  const[p,q]=setup('Gardevoir','No Ability','Neutralizing Gas');assert.equal(damage(p,q),750);
 });
 it('residual knockouts do not trigger Cold Logic',()=>{
  const[p,q]=setup('Metagross-Mega','Cold Logic');const hp=q.hp;p.hp=1;
  battle.damage(1,p,q,battle.dex.conditions.get('brn'));assert.equal(q.hp,hp);
 });
 for(const format of ['gen9nofielddoublesbattle','gen9freeforall4pmistyfieldadrienn'])it('only retaliates against the spread attacker in '+format,()=>{
  const mon=(species,ability)=>({species,ability,moves:['surf','splash']});
  let teams=[[mon('Metagross-Mega','Cold Logic'),mon('Mew','No Ability')],[mon('Mew','No Ability'),mon('Mew','No Ability')]];
  if(format.includes('freeforall'))teams.push([mon('Mew','No Ability')],[mon('Mew','No Ability')]);
  battle=common.createBattle({formatid:format},teams);battle.makeChoices(...teams.map(t=>'team '+t.map((_,i)=>i+1).join('')));
  battle.field.terrain='';const p=battle.p1.active[0],q=battle.p2.active[0];p.hp=1;const hp=q.hp;
  battle.actions.useMove('surf',q,{target:p});assert.equal(p.hp,0);assert.equal(q.hp,hp-Math.floor(q.baseMaxhp/4));
  assert.equal(battle.log.filter(l=>l.includes('executed its final contingency')).length,1);
 });
});
