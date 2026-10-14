import type {AbilityDataTable} from '../sim/dex-abilities';
import {skipPassiveComponent} from './passive-ability-cleanup';

export function installApprovedSupportReworks(abilities: AbilityDataTable) {
 const compose = (id: ID, parts: ID[]) => {
  const result: any = Object.fromEntries(Object.entries(abilities[id]).filter(([key]) => !key.startsWith('on')));
  for (const part of parts) {
   for (const [key, callback] of Object.entries(abilities[part])) {
    if (!key.startsWith('on')) continue;
    if (typeof callback !== 'function') { result[key] = callback; continue; }
    const previous = result[key];
    result[key] = function (this: Battle, ...args: any[]) {
     const first = previous?.apply(this, args);
     if (first === false || first === null || first === 0) return first;
     if (skipPassiveComponent(this, this.effectState.target, part)) return first;
     const second = callback.apply(this, args);
     return second === undefined ? first : second;
    };
   }
  }
  abilities[id] = result;
 };
 compose('bloomingsun' as ID, ['megasol', 'flowerveil'] as ID[]);
 compose('skywarden' as ID, ['windrider'] as ID[]);
 abilities.swiftvenom = {name: 'Swift Venom', rating: 4, flags: {}};
 compose('swiftvenom' as ID, ['swiftswim', 'merciless'] as ID[]);
 compose('wickedsnare' as ID, ['intimidate'] as ID[]);
 abilities.wickedsnare.onModifyMove = function () { this.effectState.snareTargets = []; };
 abilities.wickedsnare.onSourceAfterDamageApplied = function (damage, target, source, move) {
  if (damage <= 0 || source.isAlly(target) || move.category === 'Status' || move.type !== 'Dark') return;
  this.effectState.snareTargets ||= [];
  if (!this.effectState.snareTargets.includes(target)) this.effectState.snareTargets.push(target);
 };
 abilities.wickedsnare.onAfterMove = function (source) {
  const targets: Pokemon[] = this.effectState.snareTargets || [];
  delete this.effectState.snareTargets;
  for (const target of targets) if (target.hp && target.isActive) this.boost({def: -1}, target, source, this.effect);
 };
 compose('sweetsanctuary' as ID, ['ripen'] as ID[]);
 abilities.sweetsanctuary.onModifyMove = function () { this.effectState.decorateTargets = []; };
 abilities.sweetsanctuary.onAnyAfterEachBoost = function (boost, target, source, effect) {
  if (source !== this.effectState.target || effect?.id !== 'decorate' || !Object.values(boost).some(value => value! > 0)) return;
  this.effectState.decorateTargets ||= [];
  if (!this.effectState.decorateTargets.includes(target)) this.effectState.decorateTargets.push(target);
 };
 abilities.sweetsanctuary.onAfterMove = function (source, target, move) {
  const targets: Pokemon[] = this.effectState.decorateTargets || [];
  delete this.effectState.decorateTargets;
  if (move.id !== 'decorate') return;
  for (const recipient of targets) if (recipient.hp && recipient.isActive) this.heal(recipient.maxhp / 4, recipient, source, this.effect);
 };
 abilities.soulreaver = {name: 'Soul Reaver', rating: 4, flags: {}};
 compose('soulreaver' as ID, ['infiltrator'] as ID[]);
 const infiltrator = abilities.soulreaver.onModifyMove!;
 abilities.soulreaver.onModifyMove = function (move, pokemon, target) {
  infiltrator.call(this, move, pokemon, target);
  if (move.category !== 'Status' && move.type === 'Ghost' && (!move.drain || move.drain[0] / move.drain[1] < 0.25)) move.drain = [1, 4];
 };
 compose('glacialheart' as ID, ['icebody'] as ID[]);
 abilities.glacialheart.onModifyMove = function (move, pokemon) {
  (move as any).glacialHeartOpposingDamage = false;
  if (move.category !== 'Status' && pokemon.volatiles[move.type === 'Ice' ? 'glacialheartice' : move.type === 'Dragon' ? 'glacialheartdragon' : '']) move.ignorePositiveDefensive = true;
 };
 abilities.glacialheart.onSourceDamagingHit = function (damage, target, source, move) {
  if (damage > 0 && !target.isAlly(source) && ['Ice', 'Dragon'].includes(move.type)) (move as any).glacialHeartOpposingDamage = true;
 };
 abilities.glacialheart.onAfterMove = function (source, target, move) {
  if (!(move as any).glacialHeartOpposingDamage || !source.hp) return;
  const next = move.type === 'Ice' ? 'glacialheartdragon' : 'glacialheartice';
  const previous = move.type === 'Ice' ? 'glacialheartice' : 'glacialheartdragon';
  source.removeVolatile(previous);
  source.addVolatile(next, source, this.effect);
 };
 abilities.steelwingescort = {...abilities.swornduty, name: 'Steelwing Escort', num: 11459, rating: 4};
 abilities.steelwingescort.onAfterSwitchOut = function (pokemon, replacement, effect) {
  if (effect?.id === 'uturn' && pokemon.hasAbility('steelwingescort')) replacement.m.steelwingEscortEntry = true;
 };
}

/** Runs only after Defog has actually removed an effect or lowered evasion. */
export function skywardenDefog(battle: Battle, source: Pokemon) {
 if (!source.hasAbility('skywarden')) return;
 const previous = source.side.sideConditions.mist?.duration || 0;
 source.side.addSideCondition('mist', source, battle.dex.abilities.get('skywarden'));
 const mist = source.side.sideConditions.mist;
 if (mist) mist.duration = Math.max(previous, 5);
 if (!source.m.skywardenDefogUsed) {
  source.m.skywardenDefogUsed = true;
  battle.heal(source.baseMaxhp / 8, source, source, battle.dex.abilities.get('skywarden'));
 }
}
