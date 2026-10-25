'use strict';
const assert=require('assert').strict;
const common=require('../../common');
const {Dex}=require('../../../dist/sim/dex');
const {TeamValidator}=require('../../../dist/sim/team-validator');
const {officialMovesValidationFormat}=require('../../../dist/server/official-moves');
let battle;
function start(item=''){
 battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[
 {species:'Mew',ability:'No Ability',item,moves:['skullbash','splash','tackle','dig']},
 {species:'Mew',ability:'No Ability',moves:['splash']}
 ],[{species:'Blissey',ability:'No Ability',moves:['splash','protect']}]]);
 battle.makeChoices('team 12','team 1');const foe=battle.p2.active[0];foe.hp=foe.maxhp=foe.baseMaxhp=10000;return battle.p1.active[0];
}
function disabled(p){return !!p.getMoves().find(m=>m.id==='skullbash')?.disabled;}
describe('Skull Bash damaging-action unlock and official custom moves',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const item of ['', 'Power Herb'])it('release cooldown and status/damaging actions '+item,()=>{
  const p=start(item);battle.makeChoices('move skullbash','move splash');
  if(!item){assert(p.volatiles.twoturnmove);battle.makeChoices('move skullbash','move splash');}
  assert(disabled(p));battle.makeChoices('move splash','move splash');assert(disabled(p));
  battle.makeChoices('move tackle','move splash');assert(!disabled(p));
 });
 it('does not unlock when prevented before executing',()=>{
  const p=start('Power Herb');battle.makeChoices('move skullbash','move splash');p.setStatus('slp');
  battle.makeChoices('move tackle','move splash');assert(disabled(p));
 });
 it('keeps the lock through charging another attack until its release',()=>{
  const p=start('Power Herb');battle.makeChoices('move skullbash','move splash');
  battle.makeChoices('move dig','move splash');assert(p.volatiles.twoturnmove);
  assert(p.volatiles.skullbashcooldown);battle.makeChoices('move dig','move splash');assert(!disabled(p));
 });
 it('resets on switching and does not change on form-only change',()=>{
  const p=start('Power Herb');battle.makeChoices('move skullbash','move splash');
  p.formeChange('Mewtwo');assert(disabled(p));battle.makeChoices('switch 2','move splash');
  battle.makeChoices('switch 2','move splash');assert(!disabled(p));
 });
 it('adds only custom move legality to official validation',()=>{
  const base='gen9doublesrockyfield',official=officialMovesValidationFormat(base,'challengeofficial');
  assert(Dex.formats.getRuleTable(Dex.formats.get(official)).has('obtainablemoves'));
  assert(!Dex.formats.getRuleTable(Dex.formats.get(official)).has('obtainableabilities'));
  assert.equal(officialMovesValidationFormat(base,'challenge'),base);
  const invalid={species:'Feraligatr',ability:'Torrent',moves:['aquastep']};
  const filler={species:'Mew',ability:'No Ability',moves:['psychic']};
  const result=TeamValidator.get(official).validateTeam([structuredClone(invalid),structuredClone(filler)]);
  assert(result?.some(x=>/Aqua Step/.test(x)),JSON.stringify(result));
  assert.equal(TeamValidator.get(base).validateTeam([structuredClone(invalid),structuredClone(filler)]),null);
  const legal={species:'Roserade',ability:'Natural Cure',moves:['revivalblessing']};
  assert.equal(TeamValidator.get(official).validateTeam([legal,structuredClone(filler)]),null);
 });
 it('cannot negate official move legality through custom rules',()=>{
  const f=officialMovesValidationFormat('gen9doublesrockyfield@@@!Obtainable Moves','challengeofficial');
  assert(Dex.formats.getRuleTable(Dex.formats.get(f)).has('obtainablemoves'));
 });
});
