'use strict';
const assert = require('assert').strict, common = require('../../common');
const {Dex} = require('../../../dist/sim');
let battle;
function setup(field = 'rockyterrain', ability = 'badseeds', item = '') {
 battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
  [{species: 'Mew', ability: 'noability', item, moves: ['blizzard', 'glaciate', 'infernalparade', 'eruption']}],
  [{species: 'Mew', ability: 'noability', moves: ['splash', 'tackle', 'surf', 'protect']}],
 ]);
 battle.makeChoices('team 1','team 1');
 if (field) battle.field.startTerrain(field);
 const p = battle.p1.active[0], q = battle.p2.active[0];
 for (const mon of [p,q]) mon.hp = mon.maxhp = mon.baseMaxhp = 10000;
 battle.randomizer = n => n;
 if (ability) p.setAbility(ability);
 return [p,q];
}
function use(p,q,id,props={}) {
 const move = Object.assign(Dex.getActiveMove(id), {accuracy:true,willCrit:false}, props);
 if (!p.getMoveData(id)) p.moveSlots.push({id:move.id,move:move.name,pp:20,maxpp:20,target:move.target,disabled:false,used:false});
 const hp=q.hp; battle.actions.runMove(move,p,p.getLocOf(q)); return hp-q.hp;
}
describe('Seed holder Aura development',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for (const [ability,aura,field,moves] of [
  ['badseeds','frozenaura','coldeclipseterrain',['blizzard','glaciate','sheercold']],
  ['ashenseeds','ashenaura','infernaleclipseterrain',['infernalparade','eruption']],
 ]) {
  it(ability+' creates its Aura through Neutralization but cannot promote it',()=>{
   const[p,q]=setup('rockyterrain','');q.setAbility('neutralization');p.setAbility(ability);
   assert.equal(battle.field.auraField,aura);assert.equal(battle.field.terrain,'rockyterrain');
   use(p,q,moves[0]);assert.equal(battle.field.auraField,aura);assert.equal(battle.field.terrain,'rockyterrain');
  });
  it(ability+' still respects Pulse Blockade when creating its Aura',()=>{
   const[p,q]=setup('rockyterrain','');q.setAbility('pulseblockade');p.setAbility(ability);
   assert.equal(battle.field.auraField,'');
  });
  for (const move of moves) it(ability+' develops '+aura+' with '+move+' and preserves remaining turns',()=>{
   const[p,q]=setup('rockyterrain',ability);assert.equal(battle.field.auraField,aura);
   battle.field.auraTurns=3;use(p,q,move);assert.equal(battle.field.terrain,field);assert.equal(battle.field.auraField,'');assert.equal(battle.field.terrainState.duration,3);
  });
  for (const failure of ['protect','miss','suppressed','differentholder','wrongmove','neutralization','pulseblockade']) it(ability+' keeps Aura when '+failure,()=>{
   const[p,q]=setup('rockyterrain',ability);const state=battle.field.auraState;
   if(failure==='protect')q.addVolatile('protect');
   if(failure==='suppressed')p.addVolatile('gastroacid',q);
   if(failure==='differentholder')p.setAbility('noability');
   if(['neutralization','pulseblockade'].includes(failure))q.setAbility(failure);
   const previousField=battle.field.terrain;
   use(p,q,failure==='wrongmove'?'tackle':moves[0],failure==='miss'?{accuracy:0}:{});
   assert.equal(battle.field.terrain,previousField);assert.equal(battle.field.auraField,aura);assert.equal(battle.field.auraState,state);assert.equal(battle.field.auraTurns,5);
  });
  it(ability+' cannot develop the Aura on a locked Chessboard',()=>{const[p,q]=setup('chessboardterrain',ability);use(p,q,moves[0]);assert.equal(battle.field.terrain,'chessboardterrain');assert.equal(battle.field.auraField,aura);});
  for(const trigger of moves) it(ability+' develops its Aura over Rift with '+trigger+' without replaying the move transition',()=>{
   const[p,q]=setup('rifteclipseterrain',ability);battle.field.auraTurns=4;
   const before=battle.log.length;use(p,q,trigger);
   assert.equal(battle.field.terrain,field);assert.equal(battle.field.auraField,'');assert.equal(battle.field.terrainState.duration,4);
   const announcements=battle.log.slice(before).filter(line=>line.startsWith('|-message|')&&line.includes('developed'));
   assert.equal(announcements.length,1);assert.equal(battle.field.terrainState.terrainChanges.get('eclipseCooling'),undefined);
  });
  it(ability+' can develop an already existing Aura over no field',()=>{
   const[p,q]=setup('','');battle.field.setAura(aura,4,p,Dex.moves.get('splash'));p.setAbility(ability);assert.equal(battle.field.terrain,'');
   use(p,q,moves[0]);assert.equal(battle.field.terrain,field);assert.equal(battle.field.terrainState.duration,4);assert.equal(battle.field.auraField,'');
  });
  it(ability+' does not allow ordinary Gravity promotion',()=>{const[p]=setup('rockyterrain',ability);assert.equal(battle.field.promoteAura(p,Dex.moves.get('gravity')),false);assert.equal(battle.field.auraField,aura);});
 }
 it('Bad Seeds keeps no-field and Icy entry unchanged',()=>{
  for(const base of ['', 'icyterrain']){setup(base,'badseeds');assert.equal(battle.field.terrain,'coldeclipseterrain');assert.equal(battle.field.auraField,'');battle.destroy();battle=null;}
 });
 for(const base of ['', 'volcanicterrain']) for(const [item,turns] of [['',5],['amplifieldrock',8]]) it('Ashen Seeds full entry '+base+'/'+item,()=>{
  setup(base,'ashenseeds',item);assert.equal(battle.field.terrain,'infernaleclipseterrain');assert.equal(battle.field.terrainState.duration,turns);assert.equal(battle.field.auraField,'');assert.equal(battle.field.weather,'');
 });
 it('Ashen Seeds does not refresh either the Aura or full field',()=>{
  const[p]=setup('rockyterrain','ashenseeds');battle.field.auraTurns=2;battle.singleEvent('Start',p.getAbility(),p.abilityState,p);assert.equal(battle.field.auraTurns,2);
  battle.field.clearAura();battle.field.setFieldOrAura('infernaleclipseterrain',2,p,Dex.moves.get('splash'),true);battle.singleEvent('Start',p.getAbility(),p.abilityState,p);assert.equal(battle.field.terrainState.duration,2);
 });
 it('Nature Power actually calls Infernal Parade and its successful called attack develops Ashen Aura',()=>{
  const[p,q]=setup('rockyterrain','ashenseeds');use(p,q,'naturepower');
  assert(battle.log.some(line=>line.includes('|move|p1a: Mew|Infernal Parade|')));
  assert.equal(battle.field.terrain,'infernaleclipseterrain');assert.equal(battle.field.auraField,'');
 });
 it('Mimicry and Secret Power read Ashen Aura through their generic registry plumbing',()=>{
  const[p,q]=setup('rockyterrain','ashenseeds');q.setAbility('mimicry');assert.deepEqual(q.types,['Fire']);
  use(p,q,'secretpower');assert(battle.log.some(line=>line.includes('|-anim|')&&line.includes('|Incinerate|')));
 });
 it('Ashen Fire overlap recognizes Infernal added Fire typing and retains named bonuses',()=>{
  const[p,q]=setup('','ashenseeds');battle.field.setAura('ashenaura',5,p,Dex.moves.get('splash'));
  for(const id of ['flamethrower','rockslide','scorchingsands','bitterblade']){
   const move=Dex.getActiveMove(id);battle.singleEvent('ModifyMove',battle.field.getTerrain(),battle.field.terrainState,move,p,q);
   assert.equal(battle.runEvent('BasePower',p,q,move,100),id==='bitterblade'?225:150,id);
  }
 });
 it('Ashen Aura boosts both sides without giving full-field defenses or spreading',()=>{
  const[p,q]=setup('rockyterrain','ashenseeds');p.setType('Fire');
  for(const [a,b] of [[p,q],[q,p]]){assert.equal(battle.field.auraPowerMultiplier(a,b,Dex.getActiveMove('flamethrower')),1.3);assert.equal(battle.field.auraPowerMultiplier(a,b,Dex.getActiveMove('darkpulse')),1.5);}
  use(q,p,'tackle');assert.equal(q.ability,'noability');
  battle.runEvent('Residual',q);assert.equal(q.boosts.atk,0);
 });
 for(const base of ['dragonsdenterrain','underwaterterrain','midnightzoneterrain','newworldterrain','flowergarden1'])it('Ashen entry respects '+base,()=>{setup(base,'ashenseeds');assert.equal(battle.field.terrain,base);assert.equal(battle.field.auraField,'');});
 it('Ashen full field protects its Fire weakness unless bypassed',()=>{
  const[p,q]=setup('','ashenseeds');p.setType(['Fire','Water']);const reduced=use(q,p,'surf');p.hp=p.maxhp;p.cureStatus();q.setAbility('moldbreaker');const ordinary=use(q,p,'surf');assert(Math.abs(ordinary-reduced*2)<=2,[reduced,ordinary]);
 });
 it('Ashen contact spreads without refreshing and non-Fire holders deteriorate',()=>{
  const[p,q]=setup('','ashenseeds');p.setType('Fire');battle.field.setTerrainDuration(3);use(q,p,'tackle');assert.equal(q.ability,'ashenseeds');assert.equal(battle.field.terrainState.duration,3);
  battle.runEvent('Residual',q);assert.equal(q.boosts.atk,-1);assert.equal(q.boosts.spa,-1);
  battle.runEvent('Residual',p);assert.equal(p.boosts.atk,0);
 });
 for(const mode of ['fire','pads','shield','unreplaceable','noncontact'])it('Ashen contact respects '+mode,()=>{
  const[p,q]=setup('','ashenseeds');p.setType('Fire');if(mode==='fire')q.setType('Fire');if(mode==='pads')q.setItem('protectivepads');if(mode==='shield')q.setItem('abilityshield');if(mode==='unreplaceable')q.setAbility('comatose',null,null,true);
  use(q,p,mode==='noncontact'?'surf':'tackle');assert.notEqual(q.ability,'ashenseeds');
 });
 for(const fire of [false,true])it('Ashen development starts full-field residual effects for Fire='+fire,()=>{
  const[p,q]=setup('rockyterrain','ashenseeds');p.setType(fire?'Fire':'Normal');
  use(p,q,'infernalparade');assert.equal(battle.field.terrain,'infernaleclipseterrain');
  p.cureStatus();q.cureStatus();const hp=p.hp;use(p,q,'splash');
  battle.makeChoices('move eruption','move splash');
  assert.equal(p.boosts.atk,fire?0:-1);assert.equal(p.boosts.spa,fire?0:-1);
  if(fire)assert.equal(p.hp,hp);else assert(p.hp<hp);
 });
 it('Ashen lock blocks purification and destruction but suppression and expiry release it',()=>{
  const[p,q]=setup('','ashenseeds');assert(!battle.field.purifyEclipse(q,Dex.moves.get('purify')));assert(!battle.field.clearTerrain('high'));assert(!battle.field.changeTerrain('rifteclipseterrain',q,Dex.moves.get('glaciate')));
  p.addVolatile('gastroacid',q);assert(battle.field.changeTerrain('rifteclipseterrain',q,Dex.moves.get('glaciate')));
  battle.destroy();setup('','ashenseeds');battle.field.setTerrainDuration(1);battle.makeChoices('move eruption','move splash');assert.notEqual(battle.field.terrain,'infernaleclipseterrain');
 });
});
