'use strict';
const assert=require('assert').strict;
const common=require('../../common');
const {Dex}=require('../../../dist/sim');
const {AbilityComponents}=require('../../../dist/data/ability-components');
let battle;
function setup(ability='Gale Bloom',doubles=false) {
 const mon=(ability='No Ability',item='')=>({species:'Mew',ability,item,moves:['splash','airslash','sludgebomb','tackle']});
 battle=common.createBattle({gameType:doubles?'doubles':'singles'},[[mon(ability),mon(),mon()],[mon(),mon(),mon()]]);
 battle.field.terrain='';battle.randomizer=n=>n;
 for(const side of battle.sides)for(const p of side.pokemon){p.hp=p.maxhp=p.baseMaxhp=1000;p.getPassives=()=>[];}
 return [battle.p1.active[0],battle.p2.active[0],battle.p1.active[1],battle.p2.active[1]];
}
function hit(source,target,id='airslash',extra={}) {
 battle.actions.useMove(Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false,noDamageVariance:true,secondaries:null},extra),source,{target});
}
function restart(p) {battle.singleEvent('Start',p.getAbility(),p.abilityState,p);}
function reenter(p) {const pos=p.position,other=p.side.pokemon.find(x=>!x.isActive);battle.actions.switchIn(other,pos);battle.actions.runSwitch(other);battle.actions.switchIn(p,pos);battle.actions.runSwitch(p);}
afterEach(()=>{battle?.destroy();battle=null;});
describe('Beautifly Pastel Sanctuary actual entry',()=>{
 it('changes only Beautifly slot1 and retains all local Pastel Veil hooks',()=>{
  const species=Dex.species.get('beautifly');assert.equal(species.abilities[1],'Pastel Sanctuary');assert.equal(species.abilities[0],'Windy Surge');assert.equal(species.abilities.H,'Gale Bloom');
  for(const id of ['clefairy','ponytagalar','furfroudebutante']) assert(Object.values(Dex.species.get(id).abilities).includes('Pastel Veil'),id);

  assert.deepEqual(AbilityComponents.pastelsanctuary,['pastelveil']);
  const base=Dex.abilities.get('pastelveil'),kit=Dex.abilities.get('pastelsanctuary');
  assert.equal(base.num,257);assert.equal(kit.num,11970);assert(!base.onSwitchIn);
  for(const key of ['onStart','onAnySwitchIn','onSetStatus','onAllySetStatus','onUpdate','onAnyTryMove','onModifyDamage','onAllyModifyDamage','onEffectiveness']) assert.equal(kit[key],base[key],key);
 });
 it('heals self and adjacent allies using each current maximum HP only on actual entry',()=>{
  const[p,,ally]=setup('Pastel Sanctuary',true);p.maxhp=1003;p.baseMaxhp=2000;p.hp=500;ally.hp=300;ally.maxhp=800;
  const pos=p.position,other=p.side.pokemon[2];battle.actions.switchIn(other,pos);battle.actions.runSwitch(other);
  battle.actions.switchIn(p,pos);battle.actions.runSwitch(p);
  assert.equal(p.hp,625);assert.equal(ally.hp,400);
  restart(p);assert.equal(p.hp,625);assert.equal(ally.hp,400);
 });
 for(const kind of ['full HP','Heal Block'])it('spends the entry attempt even at '+kind,()=>{
  const[p,q]=setup('Pastel Sanctuary');if(kind==='Heal Block')p.addVolatile('healblock',q);
  p.hp=500;restart(p);assert.equal(p.hp,500);p.removeVolatile('healblock');restart(p);assert.equal(p.hp,500);
 });
 it('does not heal on another Pokemon entry or ability acquisition',()=>{
  const[p,q,ally]=setup('Pastel Sanctuary',true);p.hp=500;ally.hp=500;
  const other=q.side.pokemon[2];battle.actions.switchIn(other,q.position);battle.actions.runSwitch(other);
  assert.equal(p.hp,500);assert.equal(ally.hp,500);
  ally.setAbility('Pastel Sanctuary');assert.equal(p.hp,500);assert.equal(ally.hp,500);
 });
 it('retains poison prevention, cures and local Fairytale entry defense boost',()=>{
  const[p,q]=setup('Pastel Sanctuary');assert.equal(p.trySetStatus('psn',q),false);
  p.status='tox';restart(p);assert.equal(p.status,'');battle.field.terrain='fairytaleterrain';const before=p.boosts.spd;restart(p);assert.equal(p.boosts.spd,before+1);
 });
 it('does not postpone entry healing when Neutralizing Gas ends',()=>{
  const[p,q]=setup('No Ability');q.setAbility('Neutralizing Gas');p.setAbility('Pastel Sanctuary');p.baseAbility='pastelsanctuary';p.hp=500;
  reenter(p);assert.equal(p.hp,500);q.setAbility('No Ability');assert.equal(p.hp,500);restart(p);assert.equal(p.hp,500);
 });
 it('heals again after a later actual entry',()=>{const[p]=setup('Pastel Sanctuary');p.hp=500;reenter(p);assert.equal(p.hp,625);reenter(p);assert.equal(p.hp,750);});
});
describe('Gale Bloom independent entry Speed and ally support',()=>{
 it('raises holder Speed without an ally once per entry',()=>{const[p,q]=setup();hit(p,q,'airslash',{damage:20});assert.equal(p.boosts.spe,1);hit(p,q,'airslash',{damage:20});assert.equal(p.boosts.spe,1);});
 for(const mode of ['multihit','spread'])it('does not multiply either boost on '+mode,()=>{
  const[p,q,ally]=setup('Gale Bloom',true);hit(p,q,'airslash',{damage:20,...(mode==='spread'?{target:'allAdjacentFoes'}:{multihit:3})});assert.equal(p.boosts.spe,1);assert.equal(ally.boosts.spa,1);
 });
 for(const mode of ['miss','protect','immunity','substitute','ally','status','residual','other-type'])it('does not spend charges on '+mode,()=>{
  const[p,q,ally]=setup('Gale Bloom',mode==='ally');
  if(mode==='protect')q.addVolatile('protect');if(mode==='substitute'){q.addVolatile('substitute');q.volatiles.substitute.hp=500;}
  if(mode==='immunity')q.setAbility('Wonder Guard');
  if(mode==='residual')battle.damage(20,q,p,Dex.conditions.get('psn'));
  else hit(p,mode==='ally'?ally:q,mode==='status'?'splash':mode==='other-type'?'tackle':'airslash',{...(mode==='status'?{}:{damage:20}),...(mode==='miss'?{accuracy:0}:{})});
  assert.equal(p.boosts.spe,0);assert(!p.m.galeBloom.speedUsed);
 });
 it('retains lowest percentage ally selection independently of holder boost',()=>{
  const[p,q,ally]=setup('Gale Bloom',true);ally.hp=100;hit(p,q,'airslash',{damage:20});assert.equal(ally.boosts.spa,1);assert.equal(p.boosts.spe,1);
  restart(p);p.setAbility('No Ability');p.setAbility('Gale Bloom');hit(p,q,'airslash',{damage:20});assert.equal(ally.boosts.spa,1);assert.equal(p.boosts.spe,1);
 });
 it('suppression pauses effects, does not refresh spent charges, and actual reentry resets them',()=>{
  const[p,q]=setup();p.addVolatile('gastroacid',q);hit(p,q,'airslash',{damage:20});assert.equal(p.boosts.spe,0);p.removeVolatile('gastroacid');hit(p,q,'airslash',{damage:20});assert.equal(p.boosts.spe,1);
  q.setAbility('Neutralizing Gas');q.setAbility('No Ability');hit(p,q,'airslash',{damage:20});assert.equal(p.boosts.spe,1);reenter(p);hit(p,q,'airslash',{damage:20});assert.equal(p.boosts.spe,1);
 });
 it('retains Shield Dust and primitive bypass',()=>{
  const[p,q]=setup();hit(q,p,'sludgebomb',{damage:20,secondaries:[{chance:100,status:'psn'}]});assert.equal(p.status,'');
  q.setAbility('Mold Breaker');hit(q,p,'sludgebomb',{damage:20,secondaries:[{chance:100,status:'psn'}]});assert.equal(p.status,'psn');
 });
});
describe('Carrion Watch full local Overcoat replacing Unnerve',()=>{
 it('keeps final canonical text aligned with the approved Overcoat components',()=>{
  const {AbilitiesText}=require('../../../dist/data/text/abilities');
  const {AbilityDescriptionOverrides}=require('../../../dist/data/ability-descriptions');
  assert.equal(AbilitiesText.carrionwatch.name,'Carrion Watch');
  assert.equal(AbilitiesText.carrionwatch.shortDesc,AbilityDescriptionOverrides.carrionwatch.shortDesc);
  assert.equal(AbilitiesText.carrionwatch.desc,AbilityDescriptionOverrides.carrionwatch.desc);
  assert(AbilitiesText.carrionwatch.shortDesc.startsWith('Frisk + Overcoat'));
  assert(!AbilitiesText.carrionwatch.shortDesc.includes('Unnerve'));
 });

 it('advertises Frisk+Overcoat and removes every Unnerve hook',()=>{
  setup('Carrion Watch');assert.deepEqual(AbilityComponents.carrionwatch,['frisk','overcoat']);const kit=Dex.abilities.get('carrionwatch'),unnerve=Dex.abilities.get('unnerve');
  for(const key of Object.keys(unnerve))if(key.startsWith('on')&&key!=='onStart')assert(!kit[key],key);
 });
 it('retains local Frisk item reveal and Embargo roll',()=>{
  const[p,q]=setup('Carrion Watch');q.setItem('Leftovers');battle.randomChance=()=>true;restart(p);
  assert(q.volatiles.embargo);assert.equal(q.volatiles.embargo.duration,5);assert(battle.log.some(x=>x.includes('Leftovers')&&x.includes('|-item|')));
 });
 it('permits opposing Berry consumption and field seeds without a separate blocker',()=>{
  const[p,q]=setup('Carrion Watch');q.setItem('Oran Berry');q.hp=500;assert(q.eatItem());assert.equal(q.item,'');
  q.setItem('Synthetic Seed');assert(q.useItem());assert.equal(q.item,'');
  p.setAbility('Unnerve');q.setItem('Oran Berry');assert.equal(q.eatItem(),false);
 });
 it('prevents powder and weather damage and yields to suppression',()=>{
  const[p,q]=setup('Carrion Watch');hit(q,p,'sleeppowder',{accuracy:true});assert.equal(p.status,'');assert.equal(p.runStatusImmunity('sandstorm'),false);assert.equal(p.runStatusImmunity('hail'),false);
  p.addVolatile('gastroacid',q);hit(q,p,'sleeppowder',{accuracy:true});assert.equal(p.status,'slp');assert.equal(p.runStatusImmunity('sandstorm'),true);
 });
 it('uses primitive Overcoat bypass and deduplicates native overlap',()=>{
  const[p,q]=setup('Carrion Watch');q.setAbility('Mold Breaker');hit(q,p,'sleeppowder',{accuracy:true});assert.equal(p.status,'slp');
  p.cureStatus();q.setAbility('No Ability');p.getPassives=()=>['overcoat'];hit(q,p,'sleeppowder',{accuracy:true});assert.equal(p.status,'');
 });
 it('does not apply former Unnerve Cold Eclipse entry Speed drops',()=>{
  const[p,q]=setup('Carrion Watch');battle.field.terrain='coldeclipseterrain';restart(p);assert.equal(q.boosts.spe,0);
 });
});
