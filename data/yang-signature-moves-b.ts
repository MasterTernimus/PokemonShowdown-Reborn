import {adaptiveFieldMultiplier} from '../sim/adaptive-cycle';
import {signatureMoveText} from './signature-move-summaries';
function adaptiveCategory(move: ActiveMove, source: Pokemon) {
 move.category = source.getStat('atk', false, true) > source.getStat('spa', false, true) ? 'Physical' : 'Special';
}
function nostrasEffectiveness(this: Battle, typeMod: number, target: Pokemon | null, type: string) {
 if (type === 'Steel' && this.field.isTerrain(['newworldterrain', 'starlightarenaterrain'])) return 1;
}
import type {MoveDataTable} from '../sim/dex-moves';

function dragonField(this: Battle, target: Pokemon, source: Pokemon, move: ActiveMove) {
 if (this.field.isTerrain(['volcanicterrain', 'caveterrain'])) this.field.changeTerrain('dragonsdenterrain', source, move);
}
const hitFlags = {protect: 1, mirror: 1} as const;
const hasHPDamage = (target: Pokemon, move: ActiveMove) => (target.getMoveHitData(move) as {damage?: number}).damage! > 0;
function timeBladeSplash(this: Battle, target: Pokemon, source: Pokemon, move: ActiveMove) {
 const state = move as ActiveMove & {timeBladeSplashed?: boolean};
 if (state.timeBladeSplashed) return;
 state.timeBladeSplashed = true;
 const divisor = this.field.isTerrain('fairytaleterrain') ? 8 : 16;
 for (const ally of target.adjacentAllies()) {
  if (ally.hp) this.damage(ally.baseMaxhp / divisor, ally, source, this.dex.conditions.get('Time Blade'));
 }
}
function winds(this: Battle, target: Pokemon, source: Pokemon, move: ActiveMove) {
 clearMoveAura.call(this, source, move);
 if (this.field.setWeather('deltastream', source, move)) this.field.weatherState.duration = 4;
}
function wrathGuard(this: Battle, target: Pokemon, source: Pokemon, move: ActiveMove) {
 if (!source.isAlly(target) && source.hp) source.addVolatile('sirenswrath', source, move);
 const underlying = this.field.terrainState.underlyingTerrain || this.field.terrainStack[1]?.id || this.field.terrainState.prevTerrain;
 if (this.field.isTerrain('icyterrain') && underlying === 'watersurfaceterrain') this.field.changeTerrain('watersurfaceterrain', source, move);
}
const hazards = ['spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge', 'dragonrend'];
function airstream(this: Battle, target: Pokemon, source: Pokemon, move: ActiveMove) {
 clearMoveAura.call(this, source, move);
 if (!source.hp) return;
 for (const hazard of hazards) {
  if (source.side.removeSideCondition(hazard)) this.add('-sideend', source.side, this.dex.conditions.get(hazard).name, '[from] move: Airstream Assault');
 }
}
function wisteria(this: Battle, target: Pokemon, source: Pokemon, move: ActiveMove) {
 const state = move as ActiveMove & {wisteriaBoosted?: Pokemon[]};
 state.wisteriaBoosted ||= [];
 if (!(move as ActiveMove & {wisteriaGarden?: boolean}).wisteriaGarden) {
  (move as ActiveMove & {wisteriaGarden?: boolean}).wisteriaGarden = true;
  const stage = this.field.flowerGardenStage();
  if (stage && stage < 5) this.field.changeTerrain(`flowergarden${stage + 1}`, source, move, true);
 }
 for (const ally of source.alliesAndSelf()) {
  if (!ally.hp || !ally.hasType(['Grass', 'Bug']) || state.wisteriaBoosted.includes(ally)) continue;
  state.wisteriaBoosted.push(ally);
  this.boost(ally.getStat('atk', false, true) > ally.getStat('spa', false, true) ? {atk: 1} : {spa: 1}, ally, source, move);
 }
}

export const YangSignatureMovesB: MoveDataTable = {
 m3g4qu4k3: {
  num: 10449, name: 'M3G4 QU4K3', type: 'Ground', category: 'Physical', basePower: 75, accuracy: 100,
  pp: 10, priority: 0, target: 'allAdjacent', flags: hitFlags,
  onBasePower(basePower, source, target) { if (this.field.isTerrain('glitchterrain')) return this.chainModify(adaptiveFieldMultiplier(this, source, target, 1.3)); },
  onHit(target, source, move) {
   if (!target.isAlly(source) && hasHPDamage(target, move)) this.boost({def: -1, spd: -1}, target, source, move);
  },
 },
 winddance: {
  num: 10450, name: 'Wind Dance', type: 'Flying', category: 'Special', basePower: 70, accuracy: 100,
  pp: 10, priority: 0, target: 'normal', flags: {...hitFlags, dance: 1},
  onModifyPriority(priority) { if (this.field.isWeather('deltastream')) return priority + 1; },
  onHit(target, source, move) { if (hasHPDamage(target, move)) winds.call(this, target, source, move); },
  onAfterSubDamage(damage, target, source, move) { if (damage > 0) winds.call(this, target, source, move); },
 },
 timeblade: {
  num: 10451, name: 'Time Blade', type: 'Fairy', category: 'Special', basePower: 70, accuracy: 100,
  pp: 10, priority: 0, target: 'normal', flags: hitFlags,
  onModifyMove: adaptiveCategory,
  onHit(target, source, move) {
   if (target.hp && hasHPDamage(target, move) && target.addVolatile('encore', source, move)) target.volatiles.encore.duration = 2;
   if (hasHPDamage(target, move)) timeBladeSplash.call(this, target, source, move);
  },
  onAfterSubDamage(damage, target, source, move) { if (damage > 0) timeBladeSplash.call(this, target, source, move); },
 },
 crestcleave: {
  num: 10452, name: 'Crest Cleave', type: 'Steel', category: 'Physical', basePower: 65, accuracy: 100,
  pp: 10, priority: 0, target: 'normal', flags: hitFlags, drain: [1, 3],
  onModifyMove: adaptiveCategory,
 },
 sirensveil: {
  num: 10453, name: "Siren's Veil", type: 'Water', category: 'Status', basePower: 0, accuracy: 100,
  pp: 10, priority: 0, target: 'self', flags: {snatch: 1}, boosts: {def: 1, spd: 1},
  volatileStatus: 'sirensveil',
  condition: {
   noCopy: true,
   onStart(pokemon) { this.add('-start', pokemon, 'Siren\'s Veil'); },
   onBasePowerPriority: 9,
   onBasePower(basePower, source, target, move) { if (move.category !== 'Status') return this.chainModify(1.3); },
   onMoveAborted(pokemon, target, move) { if (move.category !== 'Status') pokemon.removeVolatile('sirensveil'); },
   onAfterMove(pokemon, target, move) { if (move.category !== 'Status') pokemon.removeVolatile('sirensveil'); },
   onEnd(pokemon) { this.add('-end', pokemon, 'Siren\'s Veil'); },
  },
  onHit(source, user, move) {
   for (const foe of source.foes()) {
    if (!foe.hp || foe.getAbility().flags.cantsuppress || foe.hasItem('abilityshield') ||
     (this.field.isTerrain('shortcircuitterrain') && foe.hasItem('covertcloak'))) continue;
    const suppression = this.dex.getActiveMove('gastroacid');
    suppression.infiltrates = move.infiltrates;
    this.setActiveMove(suppression, source, foe);
    this.actions.trySpreadMoveHit([foe], source, suppression);
    this.setActiveMove(move, source, source);
   }
  },
 },
 sirenswrath: {
  num: 10454, name: "Siren's Wrath", type: 'Water', category: 'Special', basePower: 90, accuracy: 100,
  pp: 10, priority: 0, target: 'normal', flags: hitFlags, ignoreAbility: true,
  onModifyMove: adaptiveCategory,
  onHit(target, source, move) { if (hasHPDamage(target, move)) wrathGuard.call(this, target, source, move); },
  onAfterSubDamage(damage, target, source, move) { if (damage > 0) wrathGuard.call(this, target, source, move); },
  condition: {
   noCopy: true,
   onStart(pokemon) { this.add('-start', pokemon, 'move: Siren\'s Wrath'); },
   onBeforeMovePriority: 100,
   onBeforeMove(pokemon) { pokemon.removeVolatile('sirenswrath'); },
   onSourceModifyDamage(damage, source, target, move) {
    if (source.isAlly(target) || move.category === 'Status') return;
    if (this.effectState.guardedMove && this.effectState.guardedMove !== move) return;
    this.effectState.guardedMove = move;
    this.effectState.guardedSource = source;
    return this.chainModify(0.75);
   },
   onAnyAfterAttackResolved(source, target, move) {
    if (this.effectState.guardedMove === move && this.effectState.guardedSource === source) this.effectState.target.removeVolatile('sirenswrath');
   },
   onEnd(pokemon) { this.add('-end', pokemon, 'move: Siren\'s Wrath'); },
  },
 },
 rocknroll: {
  num: 10455, name: "Rockn'Roll", type: 'Rock', category: 'Status', basePower: 0, accuracy: 100,
  pp: 15, priority: 0, target: 'normal', flags: {...hitFlags, reflectable: 1}, boosts: {def: -1},
  onHit(target, source, move) { if (!this.field.isTerrain('midnightzoneterrain')) target.side.addSideCondition('stealthrock', source, move); },
 },
 dragonrend: {
  num: 10456, name: 'Dragon Rend', type: 'Dragon', category: 'Special', basePower: 75, accuracy: 100,
  pp: 10, priority: 0, target: 'normal', flags: hitFlags,
  ignoreImmunity: {Dragon: true},
  onEffectiveness(typeMod, target, type) { if (type === 'Fairy') return 0; },
  onModifyMove: adaptiveCategory,
  onHit(target, source, move) { if (!target.isAlly(source) && hasHPDamage(target, move)) dragonField.call(this, target, source, move); },
  onAfterSubDamage(damage, target, source, move) { if (damage > 0 && !target.isAlly(source)) dragonField.call(this, target, source, move); },
 },
 airstreamassault: {
  num: 10457, name: 'Airstream Assault', type: 'Flying', category: 'Special', basePower: 75, accuracy: 100,
  pp: 10, priority: 0, target: 'normal', flags: hitFlags,
  onModifyMove(move, source) { adaptiveCategory(move, source); if (this.field.isWeather('deltastream')) move.accuracy = true; },
  onHit(target, source, move) { if (hasHPDamage(target, move)) airstream.call(this, target, source, move); },
  onAfterSubDamage(damage, target, source, move) { if (damage > 0) airstream.call(this, target, source, move); },
 },
 wisteriamaelstrom: {
  num: 10458, name: 'Wisteria Maelstrom', type: 'Grass', category: 'Special', basePower: 70, accuracy: 100,
  pp: 10, priority: 0, target: 'normal', flags: hitFlags,
  onModifyMove: adaptiveCategory,
  onHit(target, source, move) { if (hasHPDamage(target, move)) wisteria.call(this, target, source, move); },
  onAfterSubDamage(damage, target, source, move) { if (damage > 0) wisteria.call(this, target, source, move); },
 },
 deiludicium: {
  num: 10459, name: 'Dei Ludicium', type: 'Normal', category: 'Special', basePower: 80, accuracy: 100,
  pp: 10, priority: 0, target: 'normal', flags: hitFlags,
  onHit(target, source, move) { if (hasHPDamage(target, move)) source.cureStatus(); },
  onAfterSubDamage(damage, target, source) { if (damage > 0) source.cureStatus(); },
 },
 nostraswish: {
  num: 10460, name: "Nostras Wish", type: 'Fairy', category: 'Special', basePower: 140, accuracy: 100,
  pp: 10, priority: 1, target: 'normal', flags: {futuremove: 1},
  onEffectiveness: nostrasEffectiveness,
  onTry(source, target) {
   const attack = target.side.addSlotCondition(target, 'futuremove', source, this.effect);
   if (attack) {
    Object.assign(target.side.slotConditions[target.position].futuremove, {
     move: 'nostraswish', source, endingTurn: (this.turn - 1) + 2,
     moveData: {id: 'nostraswish', name: "Nostras Wish", type: 'Fairy', category: 'Special', basePower: 140,
      accuracy: 100, priority: 0, flags: {futuremove: 1}, effectType: 'Move', onEffectiveness: nostrasEffectiveness},
    });
    this.add('-start', source, "move: Nostras Wish");
   }
   const wish = source.side.addSlotCondition(source, 'wish', source, this.effect);
   if (wish) {
    const state = source.side.slotConditions[source.position].wish;
    // Preserve native field-enhanced Wish healing; round only this move's ordinary half-HP snapshot.
    if (state.hp === source.maxhp / 2) state.hp = Math.ceil(source.maxhp / 2);
   }
   return attack || wish ? this.NOT_FAIL : false;
  },
 },
 swarmsnare: {
  num: 10461, name: 'Swarm Snare', type: 'Bug', category: 'Special', basePower: 70, accuracy: 100,
  pp: 15, priority: 0, target: 'normal', flags: hitFlags,
  onModifyMove: adaptiveCategory,
  onHit(target, source, move) {
   if (hasHPDamage(target, move) && target.addVolatile('partiallytrapped', source, move)) target.volatiles.partiallytrapped.duration = 2;
  },
 },
};

export const YangSignatureCreditsB: {[id: string]: string} = {
 m3g4qu4k3: 'Terra', winddance: 'Ciel', timeblade: 'Adrienn', crestcleave: 'Titania', sirensveil: 'Amaria (Zekrom)',
 sirenswrath: 'Amaria (Reshiram)', rocknroll: 'Hardy', dragonrend: 'Saphira', airstreamassault: 'Heather',
 wisteriamaelstrom: 'Laura', deiludicium: 'Elias', nostraswish: 'Anna', swarmsnare: 'Bennett',
};
export const YangSignatureLearnsetsB: {[id: string]: string[]} = {
 m3g4qu4k3: ['garchomp', 'hippowdon', 'quagsire'],
 winddance: ['oricorio', 'oricoriopompom', 'oricoriopau', 'oricoriosensu', 'altaria', 'togekiss', 'kilowattrel', 'braviaryhisui', 'noivern', 'honchkrow'],
 timeblade: ['mawile', 'tinkaton', 'rapidashgalar', 'granbull', 'togekiss', 'whimsicott', 'florges', 'sylveon'],
 crestcleave: ['aegislash', 'escavalier', 'empoleon', 'kingambit', 'corviknight', 'scizor'],
 sirensveil: ['primarina', 'palafin', 'dondozo', 'basculegion', 'basculegionf', 'lapras', 'tatsugiri', 'seismitoad', 'drednaw'],
 sirenswrath: ['primarina', 'palafin', 'swampert', 'lapras', 'blastoise', 'seismitoad', 'kingler', 'basculegion', 'basculegionf', 'crawdaunt'],
 rocknroll: ['lycanroc', 'lycanrocmidnight', 'lycanrocdusk', 'gigalith', 'aerodactyl'],
 dragonrend: ['cyclizar', 'dragonite', 'garchomp', 'charizard', 'goodrahisui', 'hydreigon'],
 airstreamassault: ['crobat', 'talonflame', 'salamence', 'sneasler', 'nidoking'],
 wisteriamaelstrom: ['kleavor', 'cherrim', 'lilliganthisui', 'lilligant', 'venusaur'],
 deiludicium: ['cyclizar', 'kommoo', 'goodrahisui', 'drampa', 'noivern'],
 nostraswish: ['jirachi', 'hatterene', 'altaria', 'gardevoir', 'ninetalesalola'],
 swarmsnare: ['butterfree', 'volcarona', 'galvantula', 'forretress', 'escavalier', 'kleavor'],
};
const summaries: {[id: string]: string} = {
 m3g4qu4k3: 'Hits all adjacent Pokemon; damaged opposing targets lose 1 Defense and Sp. Def. Glitch boosts power 1.3x; Big Top applies its Striker roll.',
 winddance: 'Dance move. After a hit, sets Strong Winds for 4 turns. +1 priority if Strong Winds are already active. Big Top boosts power 1.5x; Mountain and Snowy Mountain retain their normal Flying boost. Clears fields that existing blowing moves clear.',
 timeblade: 'Uses higher staged Attack or Sp. Atk (Special on ties). After damage, applies Encore for 2 turns if eligible. After HP or Substitute damage, splashes adjacent allies of the target for 1/16 of their maximum HP, or 1/8 on Fairy Tale, once per whole move. Splash is indirect damage like Flame Burst: it bypasses partner Protect and Substitute, but respects Magic Guard; it does not apply Encore or trigger another splash.',
 crestcleave: 'Uses higher staged Attack or Sp. Atk with the corresponding defense (Special on ties). Drains 1/3 of damage dealt.',
 sirensveil: 'Raises Defense and Sp. Def by 1; suppresses active opposing abilities until they switch. Also readies 1.3x power for the user\'s next damaging move, including all hits and targets. This charge does not stack, survives status moves, clears on switching, and is spent on a damaging move attempt even if it misses or is blocked. Respects Ability Shield and unsuppressible abilities. On Short Circuit, a working Covert Cloak also prevents suppression.',
 sirenswrath: 'Uses higher staged Attack or Sp. Atk with matching defense (Special on ties). Ignores defensive abilities for this attack. After damaging a foe, reduces the next opposing whole attack by 25% before the user next acts. Does not stack. Breaks Icy Field back into Water Surface only when that water is recorded underneath.',
 rocknroll: 'Lowers the target Defense by 1 and sets Stealth Rock on its side. Cannot place Stealth Rock in Midnight Zone.',
 dragonrend: 'Uses higher staged Attack or Sp. Atk with matching defense (Special on ties). Treats Fairy as neutral while preserving the other defensive type: Fairy/Steel resists and Fairy/Dragon is weak. This exception does not carry to generic Z or Max moves. Turns Volcanic Field or Cave into Dragon\'s Den after a hit. Does not place an entry hazard.',
 airstreamassault: 'Uses higher staged Attack or Sp. Atk with matching defense (Special on ties). After a hit, clears own-side entry hazards. Bypasses accuracy checks in Strong Winds. Clears fields that existing blowing moves clear.',
 wisteriamaelstrom: 'Uses higher staged Attack or Sp. Atk with matching defense (Special on ties). After a hit, each active allied Grass or Bug Pokemon raises its higher staged offense by 1, once per use (Sp. Atk on ties). Grows Flower Garden by one stage per damaging use, up to stage 5.',
 deiludicium: 'After a hit, cures the user of its status condition. Uses Judgment\'s existing named field boosts without its held-item typing. Rainbow Aura also grants its named 1.5x boost; matching Rainbow Terrain and Aura do not duplicate it.',
 nostraswish: 'At +1 setup priority, schedules a 140-power Fairy attack on the opposing position 2 turns later, and a Wish on the user position at the end of the following turn. Ordinary healing stores half the original caster maximum HP rounded up; native field-enhanced healing is preserved. Misty Aura or Rainbow Aura stores 75% healing at setup. The two slots succeed independently. Setup does not count as a healing move. At impact, it is super effective against Steel only in Starlight Arena or New World. Its attack receives a total 2x field boost in weatherless Starlight Arena and 4x in New World.',
 swarmsnare: 'Uses higher staged Attack or Sp. Atk with matching defense (Special on ties). After damage, binds the target through the following turn using ordinary binding rules.',
};
export const YangSignatureDescriptionsB: {[id: string]: {shortDesc: string, desc: string}} = {};
for (const [id, summary] of Object.entries(summaries)) {
 YangSignatureDescriptionsB[id] = signatureMoveText(id, YangSignatureCreditsB[id], summary);
}

import {clearMoveAura} from './yang-aura-clear';

for (const id of ["winddance","airstreamassault"]) YangSignatureDescriptionsB[id].desc += ' After successful HP or Substitute damage while the user survives, removes the active Aura once per whole move, preserving the underlying field. With no Aura, retains its normal field eligibility and transformations. Misses, protection and immunity do not clear it. Does not prevent later Auras.';
