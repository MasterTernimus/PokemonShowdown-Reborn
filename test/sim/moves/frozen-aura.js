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
describe('Frozen Aura remains separate from Snowscape and Eclipse fields',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const base of ['', 'rockyterrain', 'watersurfaceterrain'])it('Snowscape creates Snowy Field over '+base,()=>{
  setup(base);battle.makeChoices('move snowscape','move splash');
  assert.equal(battle.field.terrain,'snowyterrain');assert.equal(battle.field.terrainState.duration,4);
  assert.equal(battle.field.auraField,'');assert.equal(battle.field.weather,'');
 });
 it('Amplifield Rock does not extend Snowscape beyond five turns',()=>{
  setup('','Amplifield Rock');battle.makeChoices('move snowscape','move splash');assert.equal(battle.field.terrainState.duration,4);
 });
 it('boosts Ice for both airborne sides without field defenses or Speed changes',()=>{
  const[p,q]=setup();p.setType('Flying');q.setType('Flying');const speed=p.getStat('spe'),def=p.getStat('def');aura(p);
  for(const[source,target]of [[p,q],[q,p]])assert.equal(battle.runEvent('BasePower',source,target,battle.dex.getActiveMove('icebeam'),100,true),156);
  assert.equal(p.getStat('spe'),speed);assert.equal(p.getStat('def'),def);
 });
 it('gives Mimicry Ice and Nature Power Ice Beam',()=>{const[p,q]=setup('','','Mimicry');aura(p);assert.deepEqual(p.types,['Ice']);battle.actions.useMove('naturepower',p,{target:q});assert(battle.log.some(x=>x.includes('|move|p1a: Mew|Ice Beam|')));});
 for(const id of ['blizzard','freezeshock','iceburn','subzeroslammer'])it(id+' cannot promote Frozen Aura',()=>{
  const[p,q]=setup();aura(p);hit(p,q,id);hit(q,p,id);assert.equal(battle.field.terrain,'');assert.equal(battle.field.auraField,'frozenaura');
 });
 it('Gravity keeps its normal water-depth transition without promoting Frozen Aura',()=>{
  const[p]=setup('watersurfaceterrain');aura(p);battle.actions.useMove('gravity',p);assert.equal(battle.field.terrain,'underwaterterrain');assert.equal(battle.field.auraField,'');
 });
 it('Gravity on an empty field does not promote Frozen Aura',()=>{const[p]=setup();aura(p);battle.actions.useMove('gravity',p);assert.equal(battle.field.terrain,'');assert.equal(battle.field.auraField,'frozenaura');});
 it('hail never promotes the aura and its timer expires normally',()=>{const[p]=setup();aura(p,3);battle.field.setWeather('hail',p);for(let i=0;i<3;i++)battle.field.tickAura();assert.equal(battle.field.terrain,'');assert.equal(battle.field.auraField,'');});
 it('expires independently of the underlying field',()=>{const[p]=setup('rockyterrain');aura(p,1);battle.field.tickAura();assert.equal(battle.field.auraField,'');assert.equal(battle.field.terrain,'rockyterrain');});
 it('Neutralization allows Frozen Aura without changing the base field',()=>{const[p,q]=setup('rockyterrain');q.setAbility('Neutralization');assert.equal(aura(p),true);assert.equal(battle.field.auraField,'frozenaura');assert.equal(battle.field.terrain,'rockyterrain');});
 it('Pulse Blockade blocks Frozen Aura creation',()=>{const[p,q]=setup();q.setAbility('Pulse Blockade');assert.equal(aura(p),false);assert.equal(battle.field.auraField,'');});
 for(const base of ['newworldterrain','underwaterterrain','midnightzoneterrain','dragonsdenterrain','flowergarden2'])it('respects aura restriction on '+base,()=>{const[p]=setup(base);assert.equal(aura(p),false);});
 it('Snowscape preserves an independently created Frozen Aura',()=>{const[p]=setup('rockyterrain');aura(p,4);battle.makeChoices('move snowscape','move splash');assert.equal(battle.field.terrain,'snowyterrain');assert.equal(battle.field.auraField,'frozenaura');assert.equal(battle.field.auraTurns,3);});
});
