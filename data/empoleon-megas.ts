import type {AbilityDataTable} from '../sim/dex-abilities';
import {composeSelectedAbility} from './selected-mega-simplifications';
export const EmpoleonDescriptions = {
 monarchofice: {shortDesc:'Ice STAB/field benefits + Slush Rush. 30% frostbite; crits frostbitten foes, then thaws.', desc:'Gains Ice STAB, Ice-type field and weather benefits, and Slush Rush. Damaging moves have a 30% frostbite chance, subject to normal secondary-effect modifiers. Attacks critically hit frostbitten foes unless critical hits are prevented, then thaw damaged foes after the attack. Wave Crash becomes Royal Collision: Water/Ice effectiveness, 10% recoil, and ignores target abilities. Remains Water/Steel.'},
 emperorsresolve: {shortDesc:'Swift Swim + Flying STAB + Competitive.', desc:'Includes full local Swift Swim and Competitive. Flying moves receive STAB. Proficient remains its separate species passive.'},
};
type MonarchMove = ActiveMove & {monarchWillCrit?: boolean; monarchCritSet?: boolean; monarchThaw?: Pokemon[]};
export function installEmpoleonMegas(abilities: AbilityDataTable) {
 abilities.imperialedge = {...abilities.exalt, name: 'Imperial Edge'};
 delete abilities.exalt;
 Object.assign(abilities.emperorsresolve, EmpoleonDescriptions.emperorsresolve);
 composeSelectedAbility(abilities, 'emperorsresolve', ['swiftswim','competitive'], true);
 abilities.emperorsresolve.onModifyMove = function(move) {
  if (move.category !== 'Status' && move.type === 'Flying') move.forceSTAB = true;
 };
 abilities.monarchofice = {name:'Monarch of Ice',num:12004,rating:5,flags:{},...EmpoleonDescriptions.monarchofice};
 composeSelectedAbility(abilities, 'monarchofice', ['slushrush'], true);
 abilities.monarchofice.onModifySpe = function(spe,pokemon) {
  if (this.field.isWeather('snowscape')) return this.chainModify(2);
  return this.dex.abilities.get('slushrush').onModifySpe?.call(this,spe,pokemon);
 };
 abilities.monarchofice.onImmunity = function(type) {
  if(type==='hail')return false;
  if(type==='frz' && this.field.isTerrain(['icyterrain','snowyterrain','snowymountainterrain','coldeclipseterrain']))return false;
 };
 abilities.monarchofice.onModifyMove = function(move) {
  if(move.category==='Status')return;
  if(move.type==='Ice')move.forceSTAB=true;
  if(move.id==='wavecrash') {
   (move as any).name='Royal Collision'; move.type='Water'; move.types=['Water','Ice']; move.recoil=[1,10]; move.ignoreAbility=true;
  }
  const secondaries=move.secondaries || (move.secondary?[move.secondary]:[]);
  move.secondaries=secondaries.filter(effect=>effect.status!=='frz');
  move.secondaries.push({chance:30,status:'frz'});
 };
 abilities.monarchofice.onModifyCritRatio = function(ratio,source,target,rawMove) {
  const move=rawMove as MonarchMove;
  if(!move.monarchCritSet){move.monarchWillCrit=move.willCrit;move.monarchCritSet=true;}
  move.willCrit=target?.status==='frz'?true:move.monarchWillCrit;
 };
 abilities.monarchofice.onSourceAfterDamageApplied = function(damage,target,source,rawMove) {
  const move=rawMove as MonarchMove;
  if(damage>0 && target.status==='frz' && target.getMoveHitData(move).crit) {
   const thaw=move.monarchThaw ||= []; if(!thaw.includes(target))thaw.push(target);
  }
 };
 abilities.monarchofice.onAnyAfterAttackResolved = function(source,target,rawMove) {
  if(source!==this.effectState.target)return;
  const move=rawMove as MonarchMove;
  for(const foe of move.monarchThaw || [])if(foe.hp && foe.status==='frz')foe.cureStatus();
  move.monarchThaw=[];
 };
}
