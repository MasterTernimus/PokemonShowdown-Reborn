'use strict';
const assert = require('assert').strict, common = require('../../common');
const {Dex} = require('../../../dist/sim');
const {getAbilityDisplayComponents} = require('../../../dist/data/ability-display');
describe('Approved audit cleanup', () => {
 let battle;
 afterEach(() => {battle?.destroy(); battle = null;});
 function setup(ability, species = 'Mew') {
  const idle = {species:'Mew', ability:'No Ability', moves:['splash']};
  battle = common.createBattle({formatid:'gen9nofieldsinglesgame'}, [[{species, ability, moves:['tackle','icebeam','splash','protect']}, {...idle}], [{...idle}]]);
  battle.makeChoices('team 12','team 1');
  const p=battle.p1.active[0],q=battle.p2.active[0];
  p.hp=p.maxhp=p.baseMaxhp=q.hp=q.maxhp=q.baseMaxhp=10000;
  return [p,q];
 }
 function move(p,q,id) {const m=Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false});if(!p.moveSlots.some(s=>s.id===id))p.moveSlots.push({move:m.name,id,pp:100,maxpp:100,target:m.target,disabled:false,used:false});battle.actions.runMove(m,p,p.getLocOf(q));}
 function power(p,q,id) {const m=Dex.getActiveMove(id);battle.runEvent('ModifyType',p,q,m,m);return battle.runEvent('BasePower',p,q,m,100);}
 for (const species of ['Mew','Pinsir-Mega','Salamence-Mega']) it('Aerilate boosts only converted moves, '+species,()=>{
  const [p,q]=setup('Aerilate',species);if(species!=='Mew')p.formeChange(species,null,true);
  assert.equal(power(p,q,'earthpower'),100);assert.equal(power(p,q,'tackle'),120);
  battle.field.setTerrain('mountainterrain',p);assert.equal(power(p,q,'earthpower'),100);assert.equal(power(p,q,'tackle'),225); // Aerilate 1.5x and the field's Flying boost 1.5x.
 });
 for (const [ability,species,id] of [['Purifying Frost','Cryogonal','icebeam'],['Cold Open','Weavile','tackle']]) it(ability+' spends once per entry, survives replacement and resets on switching',()=>{
  const [p,q]=setup(ability,species);move(p,q,id);
  if(ability==='Purifying Frost') {assert(battle.p1.sideConditions.safeguard);battle.p1.removeSideCondition('safeguard');}
  p.setAbility('No Ability');p.setAbility(ability);
  const m=Dex.getActiveMove(id);battle.runEvent('ModifyMove',p,q,m,m);
  if(ability==='Cold Open')assert(!m.ignoreScreens);
  move(p,q,id);if(ability==='Purifying Frost')assert(!battle.p1.sideConditions.safeguard);
  battle.makeChoices('switch 2','move splash');battle.makeChoices('switch 2','move splash');
  const fresh=Dex.getActiveMove(id);battle.runEvent('ModifyMove',p,q,fresh,fresh);
  if(ability==='Cold Open')assert(fresh.ignoreScreens);
  move(p,q,id);if(ability==='Purifying Frost')assert(battle.p1.sideConditions.safeguard);
 });
 it('Gooey keeps once-per-move retaliation and Murkwater enhancement, without Grass absorption or rain cure',()=>{
  const [p,q]=setup('Gooey');p.setStatus('brn');battle.field.setWeather('raindance',p);
  move(q,p,'gigadrain');assert(p.hp<10000);assert.equal(q.boosts.spe,-2);assert.equal(p.status,'brn');assert.equal(p.boosts.atk,0);
  q.boosts.spe=0;battle.field.setTerrain('murkwatersurfaceterrain',p);move(q,p,'doublehit');assert.equal(q.boosts.spe,-4);
  assert.deepEqual(getAbilityDisplayComponents('gooey'),[]);
 });
 it('Triple Threat keeps Hydra Bond and accuracy protection but permits paralysis and Defense drops',()=>{
  const[p,q]=setup('Triple Threat');assert(p.trySetStatus('par',q));battle.boost({def:-1,accuracy:-1},p,q);assert.equal(p.boosts.def,-1);assert.equal(p.boosts.accuracy,0);
  const m=Dex.getActiveMove('tackle');battle.runEvent('ModifyMove',p,q,m,m);assert.equal(m.multihit,3);
  assert.deepEqual(getAbilityDisplayComponents('triplethreat'),['hydrabond','keeneye','innerfocus','owntempo']);
 });
 it('Primeval Hunger retains drain and stage reduction without adding or refreshing Heal Block',()=>{
  const[p,q]=setup('Primeval Hunger','Cradily');q.boosts.spa=2;p.hp=8000;move(p,q,'gigadrain');assert(!q.volatiles.healblock);assert.equal(q.boosts.spa,1);assert(p.hp>8000);
  q.addVolatile('healblock',p);q.volatiles.healblock.duration=1;move(p,q,'gigadrain');assert.equal(q.volatiles.healblock.duration,1);assert.equal(q.boosts.spa,0);
 });
 it('Airstream Assault deals damage and clears hazards without creating Tailwind',()=>{
  const[p,q]=setup('No Ability');battle.p1.addSideCondition('stealthrock',q);move(p,q,'airstreamassault');assert(q.hp<10000);assert(!battle.p1.sideConditions.stealthrock);assert(!battle.p1.sideConditions.tailwind);
 });
 it('Crest Cleave drains adaptive damage and keeps the target item',()=>{
  const[p,q]=setup('No Ability');p.hp=8000;q.setItem('Leftovers');move(p,q,'crestcleave');assert(q.hp<10000);assert(p.hp>8000);assert.equal(q.item,'leftovers');
 });
 it('Spirit Mend heals without SpD boosts and preserves Factory conversion',()=>{
  const[p,q]=setup('No Ability');p.hp=1000;move(p,q,'spiritmend');assert.equal(p.hp,6000);assert.equal(p.boosts.spd,0);
  battle.field.setTerrain('factoryterrain',p);move(p,q,'spiritmend');assert.equal(battle.field.terrain,'shortcircuitterrain');
 });
 it('Raging Current loses all Stamina reactions and retains Dry Skin absorption',()=>{
  const[p,q]=setup('Raging Current');p.hp=8000;move(q,p,'tackle');assert.equal(p.boosts.def,0);assert(!battle.log.some(l=>l.includes('Stamina')));const hp=p.hp;move(q,p,'watergun');assert(p.hp>hp);
  assert.deepEqual(getAbilityDisplayComponents('ragingcurrent'),['swiftswim','dryskin','damp']);
  p.setType('Normal');assert.equal(power(p,q,'tackle'),100); // The legacy active Proficient hook is excluded.
 });
 for(const[ability,airborne]of [['Storm Bell',true],['Astral Engine',false]]) it(ability+' removes Elevate KO boosts and has correct airborne ownership',()=>{
  const[p,q]=setup(ability);assert.equal(p.isGrounded(),airborne?null:true);q.hp=1;move(p,q,'tackle');assert(Object.values(p.boosts).every(v=>v===0));
  p.addVolatile('gastroacid');assert.equal(p.isGrounded(),true);
 });
 it('Mega Claydol retains its independent Levitate passive',()=>{
  const[p]=setup('Astral Engine','Claydol-Mega');p.formeChange('Claydol-Mega',null,true);assert(p.getPassives().includes('levitate'));assert.equal(p.isGrounded(),null);
 });
 for(const species of ['Mew','Cacturne','Cacturne-Alt']) it('Scarecrow no longer doubles offenses against entrants, '+species,()=>{
  const[p,q]=setup('Scarecrow',species);q.activeTurns=0;const m=Dex.getActiveMove('tackle');assert.equal(battle.runEvent('ModifyAtk',p,q,m,100),100);assert.equal(battle.runEvent('ModifySpA',p,q,m,100),100);
  const steel=Dex.getActiveMove('ironhead');assert.equal(battle.runEvent('ModifyAtk',p,q,steel,100),150);
 });
 it('Kick Fiend retains kicks and Limber without the opening burst',()=>{
  const[p,q]=setup('Kick Fiend');assert.equal(battle.runEvent('ModifyAtk',p,q,Dex.getActiveMove('tackle'),100),100);assert.equal(battle.runEvent('ModifySpe',p,null,null,100),100);assert(!p.trySetStatus('par',q));assert(power(p,q,'lowkick')>100);
 });
 it('Cruel Shell keeps local Shell Armor and never triggers Anger Shell',()=>{
  const[p,q]=setup('Cruel Shell');p.hp=5001;move(q,p,'tackle');assert.equal(p.boosts.atk,0);assert.equal(p.boosts.spe,0);assert.equal(battle.runEvent('CriticalHit',p,q,Dex.getActiveMove('tackle')),false);
  assert.deepEqual(getAbilityDisplayComponents('cruelshell'),['shellarmor']);
 });
 it('Sweet Resonance retains entry evasion and Hydra Bond without item protection or Embargo',()=>{
  const[p,q]=setup('Sweet Resonance');assert.equal(q.boosts.evasion,-1);p.setItem('Leftovers');assert(p.takeItem(q));move(q,p,'tackle');assert(!q.volatiles.embargo);
  const m=Dex.getActiveMove('tackle');battle.runEvent('ModifyMove',p,q,m,m);assert.equal(m.multihit,3);assert.deepEqual(getAbilityDisplayComponents('sweetresonance',['selfsufficient'],'dipplingmax'),['hydrabond']);
 });
 it('Sweet Resonance no longer grants an adjacent ally Dragon Cheer',()=>{
  const mon={species:'Mew',ability:'No Ability',moves:['splash']};
  battle=common.createBattle({gameType:'doubles'},[[{...mon,ability:'Sweet Resonance'},{...mon}],[{...mon},{...mon}]]);
  assert(!battle.p1.active[1].volatiles.dragoncheer);
  for(const q of battle.p2.active)assert.equal(q.boosts.evasion,-1);
 });
});
