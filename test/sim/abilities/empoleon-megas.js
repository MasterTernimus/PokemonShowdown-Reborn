'use strict';
const assert=require('assert').strict,common=require('../../common');const {Dex}=require('../../../dist/sim');
describe('Empoleon Mega split',()=>{
 let battle;afterEach(()=>{battle?.destroy();battle=null;});
 function setup(ability='Monarch of Ice',gameType='singles',foeAbility='No Ability') {
  const mon=(species,ability)=>({species,ability,moves:['wavecrash','icebeam','surf','splash']});
  battle=common.createBattle({gameType},[[mon('Empoleon',ability),mon('Mew','No Ability')],[mon('Mew',foeAbility),mon('Mew','No Ability')]]);
  for(const side of battle.sides)for(const p of side.pokemon){p.getPassives=()=>[];p.hp=p.maxhp=p.baseMaxhp=10000;}
  battle.randomizer=x=>x;battle.randomChance=(n,d)=>n>=d;return [battle.p1.active[0],battle.p2.active[0]];
 }
 function hit(p,q,id='wavecrash'){battle.actions.useMove(Object.assign(Dex.getActiveMove(id),{accuracy:true}),p,{target:q});return p.lastMoveUsed;}
 it('exports both 635 BST Water/Steel Megas and the legacy aliases',()=>{
  assert.deepEqual(Dex.species.get('empoleonmegax').baseStats,{hp:84,atk:126,def:108,spa:116,spd:116,spe:85});
  assert.deepEqual(Dex.species.get('empoleonmegay').baseStats,{hp:84,atk:86,def:118,spa:156,spd:121,spe:70});
  for(const id of ['empoleonmegax','empoleonmegay']){assert.equal(Dex.species.get(id).bst,635);assert.deepEqual(Dex.species.get(id).types,['Water','Steel']);assert.deepEqual(Dex.species.get(id).passives,['proficient']);}
  assert.equal(Dex.species.get('Empoleon-Mega').id,'empoleonmegay');assert.equal(Dex.items.get('Empoleonite').id,'empoleonitey');
 });
 for(const [stone,form] of [['Empoleonite X','empoleonmegax'],['Empoleonite Y','empoleonmegay'],['Empoleonite','empoleonmegay']])it(stone+' evolves to the correct Mega',()=>{
  battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Empoleon',ability:'Competitive',item:stone,moves:['splash']}],[{species:'Mew',moves:['splash']}]]);
  battle.makeChoices('team 1','team 1');battle.makeChoices('move splash mega','move splash');assert.equal(battle.p1.active[0].species.id,form);
 });
 it('renames Exalt without removing its component effects',()=>{
  assert.equal(Dex.abilities.get('Imperial Edge').id,'imperialedge');assert.equal(Dex.abilities.get('Exalt').name,'Imperial Edge');
  const[p,q]=setup('Imperial Edge');battle.boost({atk:-1},p,q);assert.equal(p.boosts.atk,1);assert(!p.addVolatile('flinch'));
  assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('steelwing'),100),150);
 });
 it('Royal Collision keeps the Wave Crash slot and PP, uses dual effectiveness, 10% recoil and ability bypass',()=>{
  const[p,q]=setup('Monarch of Ice','singles','Water Absorb');q.setType('Grass');const before=q.hp,pbefore=p.hp;const move=hit(p,q);
  assert.equal(move.id,'wavecrash');assert.equal(move.name,'Royal Collision');assert.deepEqual(move.types,['Water','Ice']);assert.equal(move.type,'Water');assert(move.ignoreAbility);
  assert.equal(q.runEffectiveness(move),0);assert(q.hp<before);assert.equal(pbefore-p.hp,Math.round((before-q.hp)/10));
  assert.equal(p.getMoves()[0].move,'Royal Collision');assert.equal(p.getMoves()[0].id,'wavecrash');
  p.addVolatile('gastroacid');assert.equal(p.getMoves()[0].move,'Wave Crash');const normal=hit(p,q);assert.deepEqual(normal.recoil,[33,100]);assert(!normal.ignoreAbility);
 });
 it('grants Ice STAB and only one 30% frostbite secondary',()=>{
  const[p,q]=setup();const move=hit(p,q,'icebeam');assert(move.forceSTAB);assert.equal(move.secondaries.filter(s=>s.status==='frz').length,1);assert.equal(move.secondaries.find(s=>s.status==='frz').chance,30);
 });
 it('crits an existing frostbite and thaws after damage without refreezing',()=>{
  const[p,q]=setup();q.setStatus('frz',p);battle.randomChance=()=>true;const m=hit(p,q,'surf');assert(q.getMoveHitData(m).crit);assert.equal(q.status,'');
 });
 it('respects critical-hit prevention and keeps frostbite when the crit is blocked',()=>{
  const[p,q]=setup('Monarch of Ice','singles','Battle Armor');q.setStatus('frz',p);const m=hit(p,q,'surf');assert(!q.getMoveHitData(m).crit);assert.equal(q.status,'frz');
 });
 it('does not thaw a protected or Substitute-protected foe',()=>{
  const[p,q]=setup();q.setStatus('frz',p);q.addVolatile('protect');hit(p,q,'surf');assert.equal(q.status,'frz');q.removeVolatile('protect');q.addVolatile('substitute');hit(p,q,'surf');assert.equal(q.status,'frz');
 });
 it('checks frostbite separately for each spread target',()=>{
  const[p,q]=setup('Monarch of Ice','doubles');q.setStatus('frz',p);const other=battle.p2.active[1];const m=hit(p,q,'surf');assert(q.getMoveHitData(m).crit);assert(!other.getMoveHitData(m).crit);assert.equal(q.status,'');
 });
 it('30% frostbite respects Shield Dust and Ice immunity',()=>{
  const[p,q]=setup('Monarch of Ice','singles','Shield Dust');battle.random=()=>0;hit(p,q,'surf');assert.equal(q.status,'');q.setAbility('No Ability');q.setType('Ice');hit(p,q,'surf');assert.equal(q.status,'');q.setType('Normal');hit(p,q,'surf');assert.equal(q.status,'frz');
 });
 for(const field of ['icyterrain','snowymountainterrain','coldeclipseterrain'])it('gains Slush Rush on '+field,()=>{
  const[p]=setup();battle.field.setTerrain(field,p);assert.equal(battle.runEvent('ModifySpe',p,null,null,100),200);assert.deepEqual(p.getTypes(),['Water','Steel']);
 });
 for(const weather of ['hail','snowscape'])it('gains Ice weather Defense and Speed in '+weather,()=>{
  const[p]=setup();battle.field.setWeather(weather,p);assert.equal(battle.runEvent('ModifyDef',p,null,null,100),150);assert.equal(battle.runEvent('ModifySpe',p,null,null,100),200);
 });
 it('matches Ice Defense on Icy Field plus hail and loses affinity when suppressed',()=>{
  const[p]=setup();battle.field.setTerrain('icyterrain',p);battle.field.setWeather('hail',p);assert.equal(battle.runEvent('ModifyDef',p,null,null,100),225);p.addVolatile('gastroacid');assert.equal(battle.runEvent('ModifyDef',p,null,null,100),100);
 });
 it('gets Ice frostbite immunity on icy fields without becoming Ice elsewhere',()=>{
  const[p,q]=setup();battle.field.setTerrain('icyterrain',p);assert(!p.trySetStatus('frz',q));
  battle.field.clearTerrain();assert(p.trySetStatus('frz',q));
 });
 it('Y supplies Flying STAB, Swift Swim and Competitive without Slush Rush',()=>{
  const[p,q]=setup("Emperor's Resolve");const m=hit(p,q,'airslash');assert(m.forceSTAB);battle.boost({def:-1},p,q);assert.equal(p.boosts.spa,2);
  battle.field.setWeather('raindance',p);assert.equal(battle.runEvent('ModifySpe',p,null,null,100),200);battle.field.clearWeather();battle.field.setWeather('hail',p);assert.equal(battle.runEvent('ModifySpe',p,null,null,100),100);
 });
});
