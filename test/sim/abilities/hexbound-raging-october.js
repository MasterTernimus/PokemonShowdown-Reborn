'use strict';
const assert=require('assert').strict;
const common=require('../../common');
const {Dex}=require('../../../dist/sim/dex');
describe('Approved Void Hex and Raging Fists',()=>{
 let battle;
 afterEach(()=>{battle?.destroy();battle=null;});
 function setup(ffa=false,ability='Void Hex'){
  const p={species:'Mismagius',level:50,ability,moves:['splash','shadowball','hex','toxic']};
  const foe={species:'Mew',ability:'No Ability',moves:['splash','protect','substitute','uturn']};
  const team=[p,{...p,ability:'No Ability'}],other=[foe,{...foe}];
  battle=common.createBattle({formatid:ffa?'gen9freeforall4pmistyfieldadrienn':'gen9nofieldsinglesgame'},ffa?[team,other,other,other]:[team,other]);
  battle.makeChoices(...Array(ffa?4:2).fill('team 12'));battle.randomChance=(numerator,denominator)=>numerator>=denominator;
  return [battle.p1.active[0],battle.p2.active[0]];
 }
 function hit(p,t,id='shadowball',extra={}){
  const m=battle.dex.getActiveMove(id);Object.assign(m,{basePower:10,accuracy:true,willCrit:false,secondaries:undefined},extra);
  battle.actions.useMove(m,p,{target:t});return battle.activeMove;
 }
 function advance(...choices){battle.makeChoices(...battle.sides.map((s,i)=>choices[i]||'move splash'));}
 function trapped(t){t.trapped=false;battle.runEvent('TrapPokemon',t);return !!t.trapped;}
 it('replaces Shadow Tag with Prankster and full Cursed Body identity',()=>{
  const[p,t]=setup();assert(p.hasAbility('prankster'));assert(p.hasAbility('cursedbody'));assert(!p.hasAbility('shadowtag'));
  assert(!trapped(t));assert(!Dex.abilities.get('voidhex').onSourceModifyDamage);assert(!Dex.abilities.get('voidhex').flags.cantsuppress);
  assert.equal(battle.runEvent('ModifyPriority',p,t,battle.dex.getActiveMove('toxic'),0),1);
 });
 it('traps after direct HP damage, refreshes through the following turn, and can retrigger',()=>{
  const[p,t]=setup();hit(p,t,'tackle');assert(trapped(t));assert.equal(t.volatiles.hexboundtrap.duration,2);
  advance();assert.equal(t.volatiles.hexboundtrap.duration,1);hit(p,t);assert.equal(t.volatiles.hexboundtrap.duration,2);
  advance();advance();assert(!t.volatiles.hexboundtrap);hit(p,t);assert(trapped(t));assert(!p.volatiles.hexboundspent);
 });
 it('clears on source switching and refreshes the allowance only on re-entry',()=>{
  const[p,t]=setup();hit(p,t);advance('switch 2');assert(!t.volatiles.hexboundtrap);assert(!p.volatiles.hexboundspent);
  advance('switch 2');assert.equal(battle.p1.active[0],p);hit(p,t);assert(trapped(t));
 });
 it('remains repeatable when the ability is lost and regained',()=>{
  const[p,t]=setup();hit(p,t);t.removeVolatile('hexboundtrap');p.setAbility('No Ability');p.setAbility('Void Hex');hit(p,t);assert(t.volatiles.hexboundtrap);
 });
 it('does not spend the allowance on Ghosts or Shed Shell',()=>{
  const[p,t]=setup();t.setType('Ghost');hit(p,t);assert(!t.volatiles.hexboundtrap);assert(!p.volatiles.hexboundspent);
  t.setType('Psychic');t.setItem('shedshell');hit(p,t);assert(!t.volatiles.hexboundtrap);assert(!p.volatiles.hexboundspent);
  t.clearItem();hit(p,t);assert(trapped(t));
 });
 it('Shed Shell gained after trapping permits escape',()=>{
  const[p,t]=setup();hit(p,t);assert(trapped(t));t.setItem('shedshell');assert(!trapped(t));
 });
 it('does not trigger through Protect, Substitute, misses or type immunity',()=>{
  const[p,t]=setup();t.addVolatile('protect');hit(p,t);assert(!p.volatiles.hexboundspent);t.removeVolatile('protect');
  t.addVolatile('substitute');hit(p,t);assert(!p.volatiles.hexboundspent);t.removeVolatile('substitute');
  hit(p,t,'shadowball',{accuracy:0});assert(!p.volatiles.hexboundspent);
  t.setType('Normal');hit(p,t);assert(!p.volatiles.hexboundspent);
 });
 it('permits called, external and spread hits but excludes future and stored damage',()=>{
  const[p,t]=setup();for(const extra of [{sourceEffect:'sleeptalk'},{isExternal:true},{target:'allAdjacentFoes'}]){hit(p,t,'shadowball',extra);assert(trapped(t));t.removeVolatile('hexboundtrap');}
  for(const extra of [{flags:{futuremove:1}},{foresightStored:true}]){hit(p,t,'shadowball',extra);assert(!t.volatiles.hexboundtrap);}
 });
 it('does not spend the allowance on a knocked-out victim',()=>{
  const[p,t]=setup();t.hp=1;hit(p,t);assert.equal(t.hp,0);assert(!p.volatiles.hexboundspent);
 });
 it('FFA targets are independently trapped by their own damaging hits',()=>{
  const[p,t]=setup(true);const other=battle.p3.active[0];hit(p,t);assert(trapped(t));assert(!trapped(other));assert(!trapped(battle.p4.active[0]));
  hit(p,other);assert(other.volatiles.hexboundtrap);
 });
 it('rejects allied HP damage in doubles',()=>{
  const p={species:'Mismagius',ability:'Void Hex',moves:['splash']},foe={species:'Mew',ability:'No Ability',moves:['splash']};
  battle=common.createBattle({formatid:'gen9nofielddoublesbattle'},[[p,foe],[foe,foe]]);battle.makeChoices('team 12','team 12');
  hit(battle.p1.active[0],battle.p1.active[1]);assert(!battle.p1.active[0].volatiles.hexboundspent);
 });
 it('allows the victim to pivot away and does not transfer the trap',()=>{
  const[p,t]=setup();hit(p,t);advance('move splash','move uturn');assert(battle.p2.activeRequest.forceSwitch?.[0],battle.log.slice(-25).join('\n'));
  battle.makeChoices('','switch 2');assert.notEqual(battle.p2.active[0],t);assert(!battle.p2.active[0].volatiles.hexboundtrap);
  assert(!p.volatiles.hexboundspent);
 });
 it('ends trapping when the source faints, and keeps full Cursed Body faint Curse',()=>{
  const[p,t]=setup(true);hit(p,t);p.faint();battle.faintMessages();assert(!trapped(t));
  for(const side of battle.sides.slice(1))assert(side.active[0].volatiles.curse);
 });
 it('forwards Cursed Body Disable, including Haunted guarantee and Holy exclusion',()=>{
  const[p,t]=setup();battle.field.setTerrain('hauntedterrain',p);t.lastMove=battle.dex.getActiveMove('uturn');
  hit(t,p,'uturn',{basePower:1});assert(t.volatiles.disable);t.removeVolatile('disable');
  battle.field.setTerrain('holyterrain',p);battle.randomChance=()=>true;hit(t,p,'uturn',{basePower:1});assert(!t.volatiles.disable);
 });
 it('uses separate links without disturbing another move trap',()=>{
  const[p,t]=setup();t.addVolatile('trapped',p,battle.dex.moves.get('meanlook'),'trapper');hit(p,t);
  t.removeVolatile('hexboundtrap');assert(t.volatiles.trapped);assert(p.volatiles.trapper);assert(!p.volatiles.hexboundanchor);
 });
 it('Raging Fists retains Hydra targeting, Ghost bypass and damaging-only accuracy',()=>{
  const[p,t]=setup(false,'Raging Fists');const a=battle.dex.abilities.get('ragingfists');
  assert(p.hasAbility('hydrabond'));assert(p.hasAbility('scrappy'));assert(!p.hasAbility('fightingfiend'));
  const m=battle.dex.getActiveMove('dynamicpunch');a.onModifyMove.call(battle,m,p);assert.equal(m.accuracy,true);assert.equal(m.multihit,3);assert(m.ignoreImmunity.Fighting);
  const status=battle.dex.getActiveMove('toxic');a.onModifyMove.call(battle,status,p);assert.equal(status.accuracy,90);
  assert(!a.onSetStatus);assert(!a.onSourceModifyDamage);assert(!a.onTryBoost);
 });
 it('Raging Fists has no extra multihit boost and retains Dragon\'s Den power',()=>{
  const[p,t]=setup(false,'Raging Fists');const a=battle.dex.abilities.get('ragingfists'),m=battle.dex.getActiveMove('dynamicpunch');a.onModifyMove.call(battle,m,p);
  let modifiers=[];const old=battle.chainModify;battle.chainModify=x=>{modifiers.push(x);return x;};
  a.onBasePower.call(battle,100,p,t,m);assert.deepEqual(modifiers,[]);
  battle.field.setTerrain('dragonsdenterrain',p);modifiers=[];a.onBasePower.call(battle,100,p,t,m);assert.deepEqual(modifiers,[1.2]);battle.chainModify=old;
 });
 it('Raging Fists preserves Hydra FFA single-target spread behavior',()=>{
  const[p]=setup(true,'Raging Fists');const a=battle.dex.abilities.get('ragingfists'),m=battle.dex.getActiveMove('dynamicpunch');a.onModifyMove.call(battle,m,p);
  assert.equal(m.target,'allAdjacentFoes');assert(m.hydraBondSingleTargetSpread);assert.equal(m.accuracy,true);assert.equal(m.multihit,undefined);
 });
});
