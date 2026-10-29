'use strict';
const assert = require('assert').strict, common = require('../../common');
const {Dex} = require('../../../dist/sim');
let battle;
function setup(field='infernaleclipseterrain', ability='noability', moves=['splash'], enemyMoves=['splash'], species='Mew') {
 battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[
  [{species,ability:'noability',moves},{species:'Mew',ability:'noability',moves:['splash']}],
  [{species:'Mew',ability:'noability',moves:enemyMoves},{species:'Mew',ability:'noability',moves:['splash']}],
 ]);
 battle.makeChoices('team 12','team 12');
 if(field)battle.field.startTerrain(field);
 const p=battle.p1.active[0],q=battle.p2.active[0];
 p.setType('Fire');q.setType('Fire');
 p.hp=p.maxhp=p.baseMaxhp=q.hp=q.maxhp=q.baseMaxhp=1600;
 battle.randomizer=n=>n;
 if(ability!=='noability')p.setAbility(ability,null,null,true);
 return[p,q];
}
function use(p,q,id,props={}) {
 const move=Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false},props);
 if(!p.getMoveData(id))p.moveSlots.push({id:move.id,move:move.name,pp:20,maxpp:20,target:move.target,disabled:false,used:false});
 const hp=q.hp;battle.actions.runMove(move,p,p.getLocOf(q));return hp-q.hp;
}
describe('Infernal Eclipse ability and move interactions',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('Perish Body gives contacting attacker perish1 and a linked trap',()=>{
  const[p,q]=setup('infernaleclipseterrain','perishbody');use(q,p,'tackle');
  assert.equal(q.volatiles.perishsong.duration,2);assert(q.volatiles.trapped);assert(!p.volatiles.perishsong);
  battle.makeChoices('move splash','move splash');assert.equal(q.volatiles.perishsong.duration,1);assert(q.hp);
  battle.makeChoices('move splash','move splash');assert.equal(q.hp,0);
 });
 for(const mode of ['noncontact','pads','longreach','suppression'])it('Perish Body respects '+mode,()=>{
  const[p,q]=setup('infernaleclipseterrain','perishbody');
  if(mode==='pads')q.setItem('protectivepads');if(mode==='longreach')q.setAbility('longreach');if(mode==='suppression')p.addVolatile('gastroacid',q);
  use(q,p,mode==='noncontact'?'watergun':'tackle');assert(!q.volatiles.perishsong);assert(!q.volatiles.trapped);
 });
 it('Perish Body keeps its ordinary noncontact behavior off the Infernal field',()=>{
  const[p,q]=setup('','perishbody');use(q,p,'watergun');assert.equal(q.volatiles.perishsong.duration,4);assert(!q.volatiles.trapped);
 });
 it('Perish Body countdown affects Ghost attackers but preserves their escape immunity',()=>{
  const[p,q]=setup('infernaleclipseterrain','perishbody');q.setType('Ghost');use(q,p,'tackle');
  assert.equal(q.volatiles.perishsong.duration,2);battle.runEvent('TrapPokemon',q);assert(!q.trapped);
 });
 it('Torment chips one eighth only while Infernal and respects Magic Guard',()=>{
  const[p,q]=setup();use(p,q,'torment');let hp=q.hp;
  battle.singleEvent('Residual',Dex.moves.get('torment').condition,q.volatiles.torment,q);assert.equal(q.hp,hp-200);
  q.setAbility('magicguard');hp=q.hp;battle.singleEvent('Residual',Dex.moves.get('torment').condition,q.volatiles.torment,q);assert.equal(q.hp,hp);
  q.setAbility('noability');battle.field.changeTerrain('rifteclipseterrain',p);battle.singleEvent('Residual',Dex.moves.get('torment').condition,q.volatiles.torment,q);assert.equal(q.hp,hp);assert(q.volatiles.torment);
 });
 for(const field of ['', 'infernaleclipseterrain'])it('Nasty Plot stage increase on '+field,()=>{const[p]=setup(field);use(p,p,'nastyplot');assert.equal(p.boosts.spa,field?3:2);});
 it('Infernal Nightmare hits awake targets and survives waking, then ends outside the field',()=>{
  const[p,q]=setup();use(p,q,'nightmare');assert(q.volatiles.nightmare);
  q.setStatus('slp',p);assert(q.volatiles.nightmare);q.cureStatus();assert(q.volatiles.nightmare);
  q.setStatus('slp',p);q.clearStatus();assert(q.volatiles.nightmare);
  let hp=q.hp;battle.singleEvent('Residual',Dex.moves.get('nightmare').condition,q.volatiles.nightmare,q);assert.equal(q.hp,hp-400);
  battle.field.changeTerrain('rifteclipseterrain',p);hp=q.hp;battle.singleEvent('Residual',Dex.moves.get('nightmare').condition,q.volatiles.nightmare,q);assert(!q.volatiles.nightmare);assert.equal(q.hp,hp);
 });
 it('Nightmare still fails against an awake target off-field and ends on ordinary waking',()=>{
  const[p,q]=setup('');use(p,q,'nightmare');assert(!q.volatiles.nightmare);q.setStatus('slp',p);use(p,q,'nightmare');assert(q.volatiles.nightmare);q.cureStatus();assert(!q.volatiles.nightmare);
 });
 for(const field of ['', 'infernaleclipseterrain'])it('Bad Dreams damage and sleeping trap on '+field,()=>{
  const[p,q]=setup(field,'baddreams');q.setStatus('slp',p);const hp=q.hp;
  battle.singleEvent('Residual',p.getAbility(),p.abilityState,p);assert.equal(q.hp,hp-(field?400:200));
  battle.runEvent('TrapPokemon',q);assert.equal(!!q.trapped,!!field);
  q.cureStatus();q.trapped=false;battle.runEvent('TrapPokemon',q);assert(!q.trapped);
 });
 it('Bad Dreams trapping keeps Ghost escape immunity',()=>{const[p,q]=setup('infernaleclipseterrain','baddreams');q.setType('Ghost');q.setStatus('slp',p);battle.runEvent('TrapPokemon',q);assert(!q.trapped);});
 it('Flash Fire powers Fire attacks immediately and loses only its field-created charge on exit',()=>{
  const[p,q]=setup('infernaleclipseterrain','flashfire');assert(p.volatiles.flashfire);
  assert.equal(battle.runEvent('ModifySpA',p,q,Dex.getActiveMove('flamethrower'),100),150);
  battle.field.changeTerrain('rifteclipseterrain',p);assert(!p.volatiles.flashfire);
  battle.field.changeTerrain('infernaleclipseterrain',p);assert(p.volatiles.flashfire);use(q,p,'flamethrower');battle.field.changeTerrain('rifteclipseterrain',p);assert(p.volatiles.flashfire);
 });
 for(const ability of ['desolateland','flamebody','magmaarmor'])it(ability+' gains both defenses on Infernal entry only',()=>{
  const[p]=setup('infernaleclipseterrain',ability);assert.equal(p.boosts.def,1);assert.equal(p.boosts.spd,1);
  battle.field.changeTerrain('rifteclipseterrain',p);battle.field.changeTerrain('infernaleclipseterrain',p);assert.equal(p.boosts.def,1);assert.equal(p.boosts.spd,1);
 });
 for(const ability of ['livinglegend','sacredbond','soulsiphon','soulcremation'])it(ability+' updates its Flash Fire component on field changes',()=>{
  const[p,q]=setup('rifteclipseterrain',ability);
  const power=()=>battle.runEvent('ModifySpA',p,q,Dex.getActiveMove('flamethrower'),100);
  assert(!p.volatiles.flashfire);assert.equal(power(),100);
  battle.field.changeTerrain('infernaleclipseterrain',p);assert(p.volatiles.flashfire);assert.equal(power(),150);
  battle.field.changeTerrain('rifteclipseterrain',p);assert(!p.volatiles.flashfire);assert.equal(power(),100);
  battle.field.changeTerrain('infernaleclipseterrain',p);use(q,p,'flamethrower');
  battle.field.changeTerrain('rifteclipseterrain',p);assert(p.volatiles.flashfire);assert.equal(power(),150);
 });
 it('Blaze passive shows its active indicator at full HP in Infernal and clears it on exit',()=>{
  const[p,q]=setup('infernaleclipseterrain','noability',['splash'],['splash'],'Charizard');
  battle.eachEvent('Update');assert(p.getPassives().includes('blaze'));assert(p.volatiles.blazeactive);
  assert.equal(battle.runEvent('ModifySpA',p,q,Dex.getActiveMove('flamethrower'),100),150);
  p.addVolatile('gastroacid',q);battle.eachEvent('Update');assert(p.volatiles.blazeactive);
  battle.field.changeTerrain('rifteclipseterrain',p);battle.eachEvent('Update');assert(!p.volatiles.blazeactive);
  assert.equal(battle.runEvent('ModifySpA',p,q,Dex.getActiveMove('flamethrower'),100),100);
 });
 it('Flame Body gets no entry defenses off-field',()=>{const[p]=setup('','flamebody');assert.equal(p.boosts.def,0);assert.equal(p.boosts.spd,0);});
 it('Magma Armor gains Fire immunity while retaining its ordinary off-field behavior',()=>{
  const[p,q]=setup('infernaleclipseterrain','magmaarmor');assert.equal(use(q,p,'flamethrower'),0);
  battle.field.changeTerrain('rifteclipseterrain',p);assert(use(q,p,'flamethrower')>0);
 });
 it('Ice Face melts when Infernal begins and does not rebuild during it',()=>{
  const[p]=setup('','noability',['splash'],['splash'],'Eiscue');p.setAbility('iceface',null,null,true);assert.equal(p.species.id,'eiscue');
  battle.field.setFieldOrAura('infernaleclipseterrain',5,p,Dex.moves.get('splash'),true);assert.equal(p.species.id,'eiscuenoice');
  battle.field.setWeather('hail',p);battle.singleEvent('WeatherChange',p.getAbility(),p.abilityState,p);assert.equal(p.species.id,'eiscuenoice');
 });
 it('Pastel Veil allows poison and makes no Poison-move stat drops in Infernal',()=>{
  const[p,q]=setup('infernaleclipseterrain','pastelveil');assert(p.setStatus('psn',q));battle.singleEvent('Update',p.getAbility(),p.abilityState,p);assert.equal(p.status,'psn');
  use(q,p,'sludge');assert.equal(q.boosts.atk,0);assert.equal(q.boosts.spa,0);
  battle.field.changeTerrain('rifteclipseterrain',p);battle.singleEvent('Update',p.getAbility(),p.abilityState,p);assert.equal(p.status,'');assert.equal(p.setStatus('psn',q),false);
 });
 it('Burn Up restores removed Fire typing at end turn while Infernal stays active',()=>{
  const[p,q]=setup();p.setType(['Fire','Ghost']);use(p,q,'burnup');assert(!p.hasType('Fire'));assert(p.volatiles.infernalburnup);
  battle.makeChoices('move splash','move splash');assert.deepEqual(p.types,['Fire','Ghost']);assert(!p.volatiles.infernalburnup);
 });
 it('Burn Up does not undo a later independent typing change or restore outside Infernal',()=>{
  const[p,q]=setup();use(p,q,'burnup');p.setType('Water');battle.makeChoices('move splash','move splash');assert.deepEqual(p.types,['Water']);
  p.setType('Fire');use(p,q,'burnup');battle.field.changeTerrain('rifteclipseterrain',p);battle.makeChoices('move splash','move splash');assert(!p.hasType('Fire'));
 });
 it('Infernal Stealth Rock uses Fire effectiveness and respects Heavy-Duty Boots',()=>{
  const[p,q]=setup();q.setType(['Grass','Steel']);q.side.addSideCondition('stealthrock',p,Dex.moves.get('stealthrock'));
  battle.singleEvent('SwitchIn',Dex.moves.get('stealthrock').condition,q.side.sideConditions.stealthrock,q);assert.equal(q.hp,800);
  q.setItem('heavydutyboots');battle.singleEvent('SwitchIn',Dex.moves.get('stealthrock').condition,q.side.sideConditions.stealthrock,q);assert.equal(q.hp,800);
 });
});
