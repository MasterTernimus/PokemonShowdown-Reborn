'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
const {StarterPassives, ProficientPassiveForms} = require('../../../dist/data/starter-passives');
const families = {
 overgrow: ['venusaur','meganium','sceptile','torterra','serperior','chesnaught','decidueye','rillaboom','meowscarada'],
 blaze: ['charizard','typhlosion','blaziken','infernape','emboar','delphox','incineroar','cinderace','skeledirge'],
 torrent: ['blastoise','feraligatr','swampert','empoleon','samurott','greninja','primarina','inteleon','quaquaval'],
};
const moves = {overgrow:['energyball','leafblade'], blaze:['flamethrower','firepunch'], torrent:['surf','waterfall']};
let battle;
function setup(species, ability='No Ability') {
 battle = common.createBattle({formatid:'gen9nofieldsinglesgame'}, [[{species,ability,moves:['splash']},{species:'Mew',ability:'No Ability',moves:['splash']}],[{species:'Mew',ability:'No Ability',moves:['splash']},{species:'Mew',ability:'No Ability',moves:['splash']}]]);
 battle.makeChoices('team 12','team 12'); battle.field.terrain='';
 return [battle.p1.active[0],battle.p2.active[0]];
}
function boost(p,t,move,event='ModifySpA') {return battle.runEvent(event,p,t,battle.dex.getActiveMove(move),100);}
describe('Starter family passives', () => {
 afterEach(() => {battle?.destroy(); battle=null;});
 it('replaces the family boost with Proficient on gimmick changes and restores it on reversion', () => {
  for (const [base, form, move] of [['Charizard', 'Charizard-Mega-X', 'flamethrower'], ['Venusaur', 'Venusaur-Gmax', 'energyball'], ['Torterra', 'Torterra-Rift', 'energyball']]) {
   const [p,t] = setup(base); p.hp=1;
   assert.equal(boost(p,t,move),150);
   p.formeChange(form,null,true); p.setAbility('No Ability'); p.hp=1;
   assert.equal(boost(p,t,move),100);assert.deepEqual(p.getPassives(),['proficient']);
   p.formeChange(base,null,true); p.setAbility('No Ability'); p.hp=1;
   assert.equal(boost(p,t,move),150);
   battle.destroy(); battle=null;
  }
 });
 it('names Fire Mane and Sand Rush in their composite display', () => {
  const {getAbilityDisplayComponents} = require('../../../dist/data/ability-display');
  assert.deepEqual(getAbilityDisplayComponents('blazingmane'), ['firemane']);
  assert.deepEqual(getAbilityDisplayComponents('cactuschorus'), ['waterabsorb','sandrush']);
 });
 it('covers the complete current final-starter inventory by original family, with no other grants', () => {
  const expected = Dex.species.all().filter(s=>Object.values(families).flat().some(f=>s.id.startsWith(f)));
  assert.equal(expected.length,76); assert.equal(new Set(expected.map(s=>s.id)).size,76);
  assert.deepEqual(Object.keys(StarterPassives).sort(),expected.map(s=>s.id).sort());
  for(const s of expected) {
   const family = Object.keys(families).find(p=>families[p].some(f=>s.id.startsWith(f)));
   assert.deepEqual(s.passives,ProficientPassiveForms.has(s.id)?['proficient']:[family],s.id);
   assert(!s.evos.length,s.id);
  }
  assert.equal(expected.filter(s=>s.passives.includes('proficient')).length,34);
  const {SpeciesPassives}=require('../../../dist/data/species-passives');
  for(const s of Dex.species.all())if(!expected.includes(s))assert.deepEqual(s.passives,SpeciesPassives[s.id]||[],s.id);
 });
 for(const [id,passives] of Object.entries(StarterPassives).filter(([,p])=>moves[p[0]])) it(id+' uses one family callback and matches calculator damage with a duplicate active component',()=>{
  const family=passives[0], [p,t]=setup(id);p.hp=1;
  for(const [i,event] of ['ModifySpA','ModifyAtk'].entries()) {
   assert.equal(boost(p,t,moves[family][i],event),150);p.setAbility(family);
   assert.equal(boost(p,t,moves[family][i],event),150);p.setAbility('No Ability');
  }
  const {calculateScenario}=require('../../../dist/sim/custom-calculator');
  const input={format:'gen9nofieldsinglesgame',move:moves[family][0],samples:8,seed:42,actors:Array.from({length:4},()=>({species:'Mew',ability:'No Ability'}))};
  input.actors[0]={species:Dex.species.get(id).name,ability:'No Ability',hpPercent:25};
  const result=calculateScenario(input);input.actors[0].ability=family;
  assert.deepEqual(calculateScenario(input).results,result.results);
 });
 for(const [species,family] of [['Venusaur','overgrow'],['Charizard','blaze'],['Blastoise','torrent']]) {
  it(species+' survives all suppression, copied components, and ability replacement without stacking',()=>{
   const[p,t]=setup(species);p.hp=1;const check=()=>{for(const [i,event]of ['ModifySpA','ModifyAtk'].entries())assert.equal(boost(p,t,moves[family][i],event),150);};
   p.setAbility(family);check();p.addVolatile('gastroacid');check();p.removeVolatile('gastroacid');
   p.addVolatile('meridianseal');check();p.removeVolatile('meridianseal');t.setAbility('Neutralizing Gas');check();t.setAbility('No Ability');
   p.setAbility('Perfect Foresight');p.m.perfectForesightAbility=family;p.m.perfectForesightAbilityState={id:family,target:p};check();
   p.addVolatile('gastroacid');check();p.removeVolatile('gastroacid');p.setAbility('Run Away');check();
  });
  it(species+' triggers only at the low-HP threshold and preserves nonstarter active behavior',()=>{
   const[p,t]=setup(species);p.hp=Math.floor(p.maxhp/3)+1;assert.equal(boost(p,t,moves[family][0]),100);
   p.hp=Math.floor(p.maxhp/3);assert.equal(boost(p,t,moves[family][0]),150);assert.equal(boost(p,t,'psychic'),100);
   t.setAbility(family);t.hp=1;assert.equal(boost(t,p,moves[family][0]),150);t.addVolatile('gastroacid');assert.equal(boost(t,p,moves[family][0]),100);
  });
 }
 for(const [family,terrain,expected] of [
  ['blaze','burningterrain',150],['blaze','volcanicterrain',150],['blaze','coldeclipseterrain',100],
  ['torrent','watersurfaceterrain',150],['torrent','underwaterterrain',150],['torrent','midnightzoneterrain',150],
  ['overgrow','grassyterrain',150],
 ])it(family+' preserves '+terrain+' callbacks exactly',()=>{
  const[p,t]=setup(families[family][0]);battle.field.setTerrain(terrain,p);t.setAbility(family);
  if(terrain==='coldeclipseterrain'){p.hp=1;t.hp=1;}
  for(const[i,event]of ['ModifySpA','ModifyAtk'].entries()){
   assert.equal(boost(p,t,moves[family][i],event),expected);
   assert.equal(boost(p,t,moves[family][i],event),boost(t,p,moves[family][i],event));
   assert.equal(boost(p,t,'psychic',event),family==='overgrow'?150:100);
  }
 });
 for(const [stage,hp,expected] of [[2,0.6,150],[2,0.9,100],[4,1,180],[5,1,200]])it('preserves Flower Garden stage '+stage+' at HP fraction '+hp,()=>{
  const[p,t]=setup('Venusaur');battle.field.flowerGardenStage=()=>stage;p.hp=Math.floor(p.maxhp*hp);
  assert.equal(boost(p,t,'energyball'),expected);assert.equal(boost(p,t,'leafblade','ModifyAtk'),expected);assert.equal(boost(p,t,'psychic'),100);
 });
 it('nested Rift Dancer calls Overgrow once and retains its separate effects',()=>{
  const[p,t]=setup('Venusaur','Rift Dancer');p.hp=1;assert.equal(boost(p,t,'energyball'),150);
  battle.field.setTerrain('grassyterrain',p);assert.equal(boost(p,t,'flamethrower'),150);
 });
 it('Transform onto a nonstarter drops passives and switch reversion restores the actual species',()=>{
  const[p,t]=setup('Venusaur');assert(p.transformInto(t));assert.deepEqual(p.getPassives(),['synchronize']);
  battle.makeChoices('switch 2','move splash');battle.makeChoices('switch 2','move splash');assert.deepEqual(p.getPassives(),['overgrow']);
 });
 it('keeps conditional boosts out of raw request stats and renders separate lookup passives',()=>{
  const[p,t]=setup('Venusaur');const raw={...p.getSwitchRequestData().stats};
  p.hp=1;battle.field.setTerrain('grassyterrain',p);assert.equal(boost(p,t,'energyball'),150);
  assert.deepEqual(p.getSwitchRequestData().stats,raw);
  for(const [id,names]of [['charizard',['Blaze']],['charizardmegax',['Proficient']],['venusaur',['Overgrow']],['blastoise',['Torrent']]]){
   const html=Chat.getDataPokemonHTML(Dex.species.get(id));assert(html.includes('Passives:'));
   for(const name of names)assert(html.slice(html.indexOf('Passives:')).includes(name));
  }
 });
});
