'use strict';
const assert = require('../../assert');
const common = require('../../common');
describe('Mega Proficient and Illusion audit', function () {
 let battle;
 afterEach(() => battle?.destroy());
 for (const ability of ['proficient', 'wrathshield', 'astralwitchcraft', 'ragingcurrent', 'shadowcurrent']) {
  it(`${ability} boosts STAB once and preserves Technician`, function () {
   battle = common.createBattle({formatid: 'gen9nofieldsinglesgame', preview: false}, [[{species:'Mew', ability, moves:['psychic']}],[{species:'Blissey', ability:'noability', moves:['splash']}]]);
   if (battle.requestState === 'teampreview') battle.makeChoices();
   const user=battle.p1.active[0], foe=battle.p2.active[0];
   assert(user.hasAbility('proficient'));
   const calc=(power,type)=>{const move=battle.dex.getActiveMove('psychic'); move.basePower=power; move.type=type; return battle.runEvent('BasePower',user,foe,move,power,true);};
   assert.equal(calc(100,'Psychic'),130);
   assert.equal(calc(100,'Dragon'),100);
   assert.equal(calc(60,'Psychic'),ability==='shadowcurrent'?117:78);
   assert.equal(calc(60,'Dragon'),ability==='shadowcurrent'?90:60);
  });
 }
 it('copies a Mega composite, grants its Proficient component, and restores Illusion after damage', function () {
  battle=common.createBattle({formatid:'gen9nofieldsinglesgame', preview:false},[[
   {species:'Zoroark',ability:'illusion',moves:['splash']},
   {species:'Swampert-Mega',ability:'ragingcurrent',moves:['earthquake']},
  ],[{species:'Mew',ability:'noability',moves:['tackle']}]]);
  if (battle.requestState === 'teampreview') battle.makeChoices();
   const user=battle.p1.active[0],ally=battle.p1.pokemon[1];
  assert.equal(user.illusion,ally);
  assert.equal(user.ability,'ragingcurrent');
  assert(user.hasAbility('proficient'));
  const hp=user.hp, allyHp=ally.hp;
  battle.makeChoices('move splash','move tackle');
  assert(user.hp<hp);
  assert.equal(ally.hp,allyHp);
  assert.equal(user.illusion,null);
  assert.equal(user.ability,'illusion');
  assert(!user.volatiles.illusioncopy);
  assert(!user.hasAbility('proficient'));
 });
 it('keeps an Illusion user selectable after its former disguise faints', function () {
  battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[
   {species:'Zoroark',ability:'illusion',moves:['splash']},
   {species:'Shedinja',ability:'wonderguard',moves:['splash']},
  ],[{species:'Mew',ability:'noability',moves:['splash','flamethrower']}]]);
  if (battle.requestState === 'teampreview') battle.makeChoices();
  const user=battle.p1.active[0];
  assert(user.illusion);
  battle.makeChoices('switch 2','move flamethrower');
  assert(battle.p1.active[0].fainted);
  assert(user.hp>0);
  assert(!user.getSwitchRequestData().condition.includes('fnt'));
  battle.makeChoices('switch 2','');
  assert.equal(battle.p1.active[0],user);
 });
});



