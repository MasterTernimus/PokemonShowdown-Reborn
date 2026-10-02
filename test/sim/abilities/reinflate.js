'use strict';
const assert = require('assert').strict;
const common = require('../../common');
describe('Reinflate', function () {
 let battle;
 afterEach(() => battle?.destroy());
 function setup(format = 'gen9nofieldsinglesgame') {
  const p = {species: 'Wigglytuff', ability: 'Reinflate', moves: ['boomburst', 'torchsong', 'splash']};
  const foe = {species: 'Mew', ability: 'No Ability', moves: ['splash']};
  const teams = format.includes('freeforall') ? [[p], [foe], [foe], [foe]] : format.includes('doubles') ? [[p, foe], [foe, foe]] : [[p], [foe]];
  battle = common.createBattle({formatid: format}, teams);
  battle.makeChoices(...teams.map(t => t.length > 1 ? 'team 12' : 'team 1'));
  battle.randomChance = (n, d) => n >= d;
  battle.randomizer = x => x;
  const user = battle.p1.active[0], target = battle.p2.active[0];
  user.hp = Math.floor(user.maxhp / 2);
  return [user, target];
 }
 function use(user, target, extra = {}, name = 'boomburst') {
  const move = battle.dex.getActiveMove(name);
  Object.assign(move, {accuracy: true, willCrit: false, basePower: 5, target: 'normal'}, extra);
  battle.actions.runMove(move, user, user.getLocOf(target));
 }
 it('applies the approved stats, alternate abilities and Roar', () => {
  const [p] = setup();
  assert.deepEqual(p.species.baseStats, {hp:150, atk:50, def:70, spa:110, spd:80, spe:45});
  assert.equal(p.species.bst, 505);
  assert.deepEqual(p.species.abilities, {0:'Fluffy',1:'Reinflate',H:'Punk Rock'});
  assert(battle.dex.species.getLearnsetData('wigglytuff').learnset.roar.length);
 });
 it('heals after the complete multihit move and only once per turn', () => {
  const [p,t] = setup(), hp = p.hp, during = [];
  battle.onEvent('DamagingHit', battle.format, () => during.push(p.hp));
  use(p,t,{multihit:3});
  assert.deepEqual(during,[hp,hp,hp]);
  assert.equal(p.hp,hp+Math.floor(p.maxhp/8));
  use(p,t); assert.equal(p.hp,hp+Math.floor(p.maxhp/8));
  battle.turn++; use(p,t); assert.equal(p.hp,hp+2*Math.floor(p.maxhp/8));
 });
 it('retains Torch Song boost and heals once', () => {
  const [p,t]=setup(),hp=p.hp; use(p,t,{},'torchsong');
  assert.equal(p.boosts.spa,1); assert.equal(p.hp,hp+Math.floor(p.maxhp/8));
 });
 it('heals once for Boomburst damaging all three FFA foes', () => {
  const [p,t]=setup('gen9freeforall4pmistyfieldadrienn'), hp=p.hp;
  const foes=[battle.p2.active[0],battle.p3.active[0],battle.p4.active[0]], before=foes.map(f=>f.hp);
  use(p,t,{target:'allAdjacent'});
  assert(foes.every((f,i)=>f.hp<before[i])); assert.equal(p.hp,hp+Math.floor(p.maxhp/8));
 });
 for(const mode of ['miss','protect','immune','soundproof','substitute','nonsound','delayed','self','suppressed','healblock']) {
  it('does not heal from '+mode,()=>{
   const [p,t]=setup(), hp=p.hp; let extra={};
   if(mode==='miss') extra.accuracy=0;
   if(mode==='protect') t.addVolatile('protect');
   if(mode==='immune') t.setType('Ghost');
   if(mode==='soundproof') t.setAbility('Soundproof');
   if(mode==='substitute'){t.addVolatile('substitute');extra.flags={sound:1,protect:1};}
   if(mode==='nonsound') extra.flags={};
   if(mode==='delayed') extra.flags={sound:1,futuremove:1};
   if(mode==='suppressed') p.addVolatile('gastroacid');
   if(mode==='healblock') p.addVolatile('healblock');
   if(mode==='self') use(p,p,extra); else use(p,t,extra);
   assert(p.hp<=hp);
   if(mode!=='self')assert.equal(p.hp,hp);
  });
 }
 it('does not heal from damaging an ally',()=>{
  const [p]=setup('gen9nofielddoublesbattle'),hp=p.hp; use(p,battle.p1.active[1]); assert.equal(p.hp,hp);
 });
 it('does not heal after recoil faints the user',()=>{
  const [p,t]=setup();p.hp=1;use(p,t,{damage:40,recoil:[1,1]});assert.equal(p.hp,0);
 });
 it('does not refresh its turn allowance through ability replacement',()=>{
  const [p,t]=setup();use(p,t);const hp=p.hp;p.setAbility('No Ability');p.setAbility('Reinflate');use(p,t);assert.equal(p.hp,hp);
 });
 it('does not heal for a status sound move',()=>{
  const [p,t]=setup(),hp=p.hp;use(p,t,{},'sing');assert.equal(p.hp,hp);
 });
});
