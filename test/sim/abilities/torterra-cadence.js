'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

describe('Mega Torterra attack cadence', () => {
 let battle;
 afterEach(() => battle?.destroy());
 function start(species, ability) {
  const mon = {species:'Mew', ability:'No Ability', moves:['tackle','splash']};
  battle = common.createBattle({formatid:'gen9nofieldsinglesgame'}, [[{...mon,species,ability},mon],[mon,mon]]);
  battle.makeChoices('team 12','team 12');
  const [holder,foe] = battle.getAllActive();
  holder.maxhp = holder.baseMaxhp = 1600;
  holder.hp = 800;
  return [holder,foe];
 }
 function attack(source,target,hits) {
  battle.clearActiveMove();
  const move = Object.assign(Dex.getActiveMove('tackle'),{multihit:hits, damage:10, accuracy:true, willCrit:false});
  battle.actions.useMove(move,source,{target});
 }
 it('X boosts on the first and third incoming attacks even when it attacks between them', () => {
  const [p,q] = start('Torterra-Mega-X','Primal Ego');
  attack(q,p,5);
  assert.deepEqual([p.boosts.atk,p.boosts.spa,p.hp],[1,1,850]);
  attack(p,q,1);
  attack(q,p,2);
  assert.deepEqual([p.boosts.atk,p.boosts.spa],[1,1]);
  const before = p.hp;
  attack(q,p,3);
  assert.deepEqual([p.boosts.atk,p.boosts.spa,p.hp],[2,2,before-30+80]);
 });
 it('Y heals once per attack, gains Defense once per turn and reduces attack damage with Solid Rock', () => {
  const [p,q] = start('Torterra-Mega-Y','Terra Resolve');
  attack(q,p,5);
  assert.equal(p.hp,850);
  assert.equal(p.boosts.def,1);
  attack(q,p,1);
  assert.equal(p.hp,940);
  assert.equal(p.boosts.def,1);
  assert.equal(battle.runEvent('DragOut',p,q,Dex.getActiveMove('roar')),null);
  const move = Dex.getActiveMove('icebeam');
  assert.equal(battle.runEvent('ModifyDamage',q,p,move,100),80);
  p.getMoveHitData(move).typeMod = 1;
  assert.equal(battle.runEvent('ModifyDamage',q,p,move,100),60);
  assert(p.hasAbility('solidrock'));
  assert(p.hasAbility('suctioncups'));
 });
});
