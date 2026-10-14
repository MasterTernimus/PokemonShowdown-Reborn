'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
function setup(field = '', item = '', ability = 'No Ability') {
 battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
  [{species: 'Mew', ability, item, moves: ['snowscape','blizzard','gravity','splash']}],
  [{species: 'Mew', ability: 'No Ability', moves: ['splash','protect','substitute','raindance']}],
 ]);
 battle.makeChoices('team 1','team 1');
 if (field) battle.field.startTerrain(field);
 const p=battle.p1.active[0], q=battle.p2.active[0];
 p.maxhp=p.hp=q.maxhp=q.hp=10000;
 return [p,q];
}
function aura(p, turns=5) { return battle.field.setAura('frozenaura',turns,p,battle.dex.moves.get('snowscape')); }
function hit(p,q,id='blizzard') { const move=battle.dex.getActiveMove(id); move.accuracy=true; return battle.actions.useMove(move,p,{target:q}); }
describe('Frozen Aura',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for (const field of ['', 'rockyterrain','watersurfaceterrain']) it('Snowscape preserves weather and base '+field,()=>{
  const [p]=setup(field); battle.field.setWeather('raindance',p); const state=battle.field.terrainState;
  battle.makeChoices('move snowscape','move splash');
  assert.equal(battle.field.auraField,'frozenaura');assert.equal(battle.field.auraTurns,4);
  assert.equal(battle.field.terrain,field);assert.equal(battle.field.terrainState,state);assert.equal(battle.field.weather,'raindance');
 });
 it('lasts eight turns with Amplifield Rock and refresh resets progress',()=>{
  const [p]=setup('','Amplifield Rock');battle.makeChoices('move snowscape','move splash');assert.equal(battle.field.auraTurns,7);
  battle.field.auraState.blizzards=1;battle.field.auraState.hailTurns=2;
  battle.makeChoices('move snowscape','move splash');assert.equal(battle.field.auraTurns,7);assert.equal(battle.field.auraState.blizzards,undefined);assert.equal(battle.field.auraState.hailTurns,0);
 });
 it('boosts Ice for either airborne side without cold defenses or Speed',()=>{
  const [p,q]=setup(); p.setType('Flying');q.setType('Flying'); const speed=p.getStat('spe'),def=p.getStat('def');aura(p);
  for(const [source,target] of [[p,q],[q,p]]) {
   const move=battle.dex.getActiveMove('icebeam');assert.equal(battle.runEvent('BasePower',source,target,move,100,true),156);
  }
  assert.equal(p.getStat('spe'),speed);assert.equal(p.getStat('def'),def);
 });
 it('gives Mimicry Ice and Nature Power Ice Beam',()=>{const [p,q]=setup('','','Mimicry');aura(p);assert.deepEqual(p.types,['Ice']);battle.actions.useMove('naturepower',p,{target:q});assert(battle.log.some(x=>x.includes('|move|p1a: Mew|Ice Beam|')));});
 it('Gravity promotes before the water-depth transition',()=>{const [p]=setup('watersurfaceterrain');aura(p);battle.actions.useMove('gravity',p);assert.equal(battle.field.terrain,'coldeclipseterrain');assert.equal(battle.field.auraField,'');});
 it('two opposing damaging Blizzard executions promote and one does not',()=>{const [p,q]=setup();aura(p);hit(p,q);assert.equal(battle.field.auraState.blizzards,1);hit(q,p);assert.equal(battle.field.terrain,'coldeclipseterrain');assert.equal(battle.field.auraField,'');});
 it('Substitute damage qualifies',()=>{const [p,q]=setup();aura(p);q.addVolatile('substitute');hit(p,q);assert.equal(battle.field.auraState.blizzards,1);});
 for(const kind of ['protect','miss','immunity']) it('does not count '+kind,()=>{const [p,q]=setup();aura(p);const move=battle.dex.getActiveMove('blizzard');if(kind==='protect')q.addVolatile('protect');if(kind==='miss')move.accuracy=0;if(kind==='immunity')q.setAbility('wonderguard');battle.actions.useMove(move,p,{target:q});assert.equal(battle.field.auraState.blizzards,undefined);});
 it('counts once for a multihit execution',()=>{const [p,q]=setup();aura(p);const move=battle.dex.getActiveMove('blizzard');move.multihit=3;move.accuracy=true;battle.actions.useMove(move,p,{target:q});assert.equal(battle.field.auraState.blizzards,1);});
 it('promotes after three consecutive Hail checks, before aura expiry',()=>{const [p]=setup();aura(p,3);battle.field.setWeather('hail',p);battle.field.tickAura();battle.field.tickAura();assert.equal(battle.field.terrain,'');battle.field.tickAura();assert.equal(battle.field.terrain,'coldeclipseterrain');assert.equal(battle.field.auraField,'');});
 it('resets interrupted Hail including interruption between end checks',()=>{const [p]=setup();aura(p,8);battle.field.setWeather('hail',p);battle.field.tickAura();battle.field.tickAura();battle.field.setWeather('raindance',p);battle.field.setWeather('hail',p);battle.field.tickAura();assert.equal(battle.field.auraState.hailTurns,1);assert.equal(battle.field.terrain,'');});
 it('suppressed Hail does not count',()=>{const [p,q]=setup();aura(p);battle.field.setWeather('hail',p);q.setAbility('cloudnine');battle.field.tickAura();assert.equal(battle.field.auraState.hailTurns,0);});
 it('expires independently',()=>{const [p]=setup('rockyterrain');aura(p,1);battle.field.tickAura();assert.equal(battle.field.auraField,'');assert.equal(battle.field.terrain,'rockyterrain');});
 for(const ability of ['Neutralization','Pulse Blockade']) it('blocks creation and promotion with '+ability,()=>{const [p,q]=setup();q.setAbility(ability);assert.equal(aura(p),false);q.setAbility('No Ability');aura(p);q.setAbility(ability);const previous=battle.field.terrain;hit(p,q);hit(p,q);assert.equal(battle.field.terrain,previous);assert.equal(battle.field.auraState.blizzards,2);q.setAbility('No Ability');hit(p,q);assert.equal(battle.field.terrain,'coldeclipseterrain');});
 for(const field of ['newworldterrain','underwaterterrain','midnightzoneterrain','dragonsdenterrain','flowergarden2']) it('preserves aura field lock '+field,()=>{const [p]=setup(field);assert.equal(aura(p),false);});
 it('retains capped progress on locked field',()=>{const [p,q]=setup('chessboardterrain');aura(p);hit(p,q);hit(p,q);assert.equal(battle.field.terrain,'chessboardterrain');assert.equal(battle.field.auraState.blizzards,2);});
 it('promotes at the third actual Hail end turn',()=>{const [p]=setup();battle.field.setWeather('hail',p);battle.makeChoices('move snowscape','move splash');assert.equal(battle.field.auraState.hailTurns,1);battle.makeChoices('move splash','move splash');assert.equal(battle.field.auraState.hailTurns,2);battle.makeChoices('move splash','move splash');assert.equal(battle.field.terrain,'coldeclipseterrain');});
 it('counts a spread Blizzard once and excludes ally-only damage',()=>{
  battle=common.createBattle({formatid:'gen9doublescustomgame'},[
   [{species:'Mew',ability:'No Ability',moves:['blizzard']},{species:'Mew',ability:'No Ability',moves:['splash']}],
   [{species:'Mew',ability:'No Ability',moves:['splash']},{species:'Mew',ability:'No Ability',moves:['splash']}],
  ]);
  if(battle.requestState==='teampreview')battle.makeChoices('team 12','team 12');
  const p=battle.p1.active[0],ally=battle.p1.active[1];aura(p);
  let move=battle.dex.getActiveMove('blizzard');move.accuracy=true;battle.actions.useMove(move,p);assert.equal(battle.field.auraState.blizzards,1);
  aura(p);move=battle.dex.getActiveMove('blizzard');battle.damage(1,ally,p,move);battle.field.frozenAuraAfterAttack(p,move);assert.equal(battle.field.auraState.blizzards,undefined);
 });
 it('Gravity can promote a fresh aura while Gravity is already active',()=>{const [p]=setup();battle.actions.useMove('gravity',p);aura(p);battle.actions.useMove('gravity',p);assert.equal(battle.field.terrain,'coldeclipseterrain');});
 it('blocked Hail promotion retains capped progress and retries after lock removal',()=>{const [p,q]=setup();aura(p,8);battle.field.setWeather('hail',p);q.setAbility('neutralization');for(let i=0;i<3;i++)battle.field.tickAura();assert.equal(battle.field.auraState.hailTurns,3);assert.equal(battle.field.terrain,'');q.setAbility('No Ability');battle.field.tickAura();assert.equal(battle.field.terrain,'coldeclipseterrain');});
 it('partial Protect damage from Ice Z qualifies',()=>{const [p,q]=setup('','Icium Z');aura(p);q.addVolatile('protect');battle.actions.runMove('blizzard',p,1,{zMove:'Subzero Slammer'});assert(q.hp<q.maxhp);assert.equal(battle.field.terrain,'coldeclipseterrain');});
 it('zero damage does not count',()=>{const [p,q]=setup();aura(p);const move=battle.dex.getActiveMove('blizzard');battle.damage(0,q,p,move);battle.field.frozenAuraAfterAttack(p,move);assert.equal(battle.field.auraState.blizzards,undefined);});
 it('Ice Z promotes instead of the old Snowy Mountain transition',()=>{const [p,q]=setup('','Icium Z');aura(p);battle.actions.runMove('blizzard',p,1,{zMove:'Subzero Slammer'});assert.equal(battle.field.terrain,'coldeclipseterrain');assert.equal(battle.field.auraField,'');});
});
