import type {AbilityDataTable} from '../sim/dex-abilities';
import {skipPassiveComponent} from './passive-ability-cleanup';
const controlledRampages = new Set(['outrage', 'thrash', 'petaldance', 'ragingfury']);
function clearControlledRampage(pokemon: Pokemon) {
 const lock = pokemon.volatiles.lockedmove;
 // This ending is voluntary, so do not invoke the rampage's confusion-producing End callback.
 if (lock && controlledRampages.has(lock.move)) delete pokemon.volatiles.lockedmove;
}
export const RagingCrownNames: {[id: string]: string} = {
 pyrousdominion: 'Grounded Instinct',
 verdantdrake: 'Raging Thicket', blazingtempo: 'Raging Flame', ancientbloom: 'Verdant Crown',
 fortressshell: 'Tidal Crown', blastchamber: 'Volcanic Spirit', toxicbloom: 'Virulence', siegelauncher: 'Bombardment',
};
export function installRagingCrowns(a: AbilityDataTable) {
	a.aquashell = { ...a.heatproof, ...a.frisk, name: a.aquashell.name, num: a.aquashell.num, rating: 3, flags: { breakable: 1 } };
 const oldMountain = a.mountainbreaker;
 a.mountainbreaker = {...a.eartheater, ...a.battlearmor, name: oldMountain.name, num: oldMountain.num, rating: 4};
 a.dreadpresence = {...a.unnerve, ...a.darkaura, name: a.dreadpresence.name, num: a.dreadpresence.num, rating: 4, onStart(pokemon) { a.unnerve.onStart?.call(this, pokemon); a.darkaura.onStart?.call(this, pokemon); }, onEnd: a.unnerve.onEnd};
 delete a.snowpack.onSourceModifyAtk;
 delete a.snowpack.onSourceModifySpA;
 a.controlledfury = {
  name: 'Controlled Fury', num: 11895, rating: 3, flags: {},
  onStart(pokemon) {
   clearControlledRampage(pokemon);
   a.angerpoint.onStart?.call(this, pokemon);
   this.effectState.angerpoint = !!pokemon.m.controlledFurySpent;
  },
  onHit(target, source, move) {
   if (skipPassiveComponent(this, target, 'angerpoint') || !target.hp) return;
   // A critical hit consumes eligibility and maximizes Attack without a separate +1.
   if (move?.effectType === 'Move' && target.getMoveHitData(move).crit) {
    target.m.controlledFurySpent = true;
    this.effectState.angerpoint = true;
    this.boost({atk: 12}, target, target);
    return;
   }
   const handler = a.angerpoint.onHit;
   // Suppression and ability transfers must not replenish this entry's first-hit bonus.
   this.effectState.angerpoint = !!target.m.controlledFurySpent;
   if (typeof handler === 'function') {
    const result = handler.call(this, target, source, move);
    if (this.effectState.angerpoint) target.m.controlledFurySpent = true;
    return result;
   }
  },
  onUpdate: clearControlledRampage,
  onTryAddVolatile(status) { if (status.id === 'lockedmove') return null; },
  onModifyMove(move) {
   if (controlledRampages.has(move.id) && move.self?.volatileStatus === 'lockedmove') {
    move.self = {...move.self};
    delete move.self.volatileStatus;
   }
  },
 };
 delete a.cursedmarionette.onAnyDamage;
 a.hellfireeclipse = {...a.darkaura, ...a.agonyflame,
  name: 'Hellfire Eclipse', num: 10100, rating: 4.5, flags: {},
  onStart(pokemon) {
   a.darkaura.onStart?.call(this, pokemon);
   a.intimidate.onStart?.call(this, pokemon);
  },
 };
 a.vendetta = {...a.innerfocus, name: 'Vendetta', num: 10160, rating: 3,
  onDamagingHit(damage, target, source) {
   if (damage <= 0 || !target.hp || !source.hp || source.isAlly(target) || target.volatiles.vendettaspent) return;
   target.addVolatile('vendettaspent', target, this.effect);
   source.addVolatile('taunt', target, this.effect);
  },
 };
 for (const id of ['venomarmor', 'toxicarmor'] as const) {
  const previous = a[id].onTryBoost;
  a[id].onTryBoost = function (boost, target, source, effect) {
   previous?.call(this, boost, target, source, effect);
   if (target.species.id !== 'zangoose' && source && !source.isAlly(target) && ['psn', 'tox'].includes(target.status) && boost.atk && boost.atk < 0) delete boost.atk;
  };
 }
 a.thorntempered = {name: 'Thorn-Tempered', num: 11894, rating: 2, flags: {}};
 delete a.scaleshelter.onSourceModifyDamage;
 a.scaleshelter.onTryBoost = function (boost, target, source) {
  if (source?.isAlly(target)) return;
  if (boost.accuracy && boost.accuracy < 0) delete boost.accuracy;
 };
 delete a.frightfulwings.onModifySTAB;
 a.frightfulwings.onUpdate = a.owntempo.onUpdate;
 a.frightfulwings.onHit = a.owntempo.onHit;
 a.frightfulwings.onTryAddVolatile = a.owntempo.onTryAddVolatile;
 a.frightfulwings.onTryBoost = a.owntempo.onTryBoost;
 delete a.venomarmor.onCriticalHit;
 delete a.venomarmor.onSourceModifyDamage;
 delete a.venomarmor.onStart;
 delete a.venomarmor.onAfterEachBoost;
 delete a.spiralevolution.onStart;
 a.spiralevolution.onModifyMove = function (move, source, target) {
  a.powerdrill.onModifyMove?.call(this, move, source, target);
  if (move.category !== 'Status') {
   move.breaksProtect = true;
   (move as ActiveMove & {spiralEvolutionBreaksProtect?: boolean}).spiralEvolutionBreaksProtect = !!move.flags.protect;
  }
 };
 const spiralBasePower = a.spiralevolution.onBasePower;
 a.spiralevolution.onBasePower = function (power, source, target, move) {
  a.powerdrill.onBasePower?.call(this, power, source, target, move);
  return spiralBasePower?.call(this, power, source, target, move);
 };
 delete a.astralwitchcraft.onTryHit;
 delete a.astralwitchcraft.onAllyTryHitSide;
 a.astralwitchcraft.onStart = function (pokemon) {
  a.voidguile.onStart?.call(this, pokemon);
  if (this.field.isTerrain(['fairytaleterrain', 'newworldterrain'])) this.boost({spa: 1, spd: 1}, pokemon, pokemon);
 };
 a.astralwitchcraft.onModifyAccuracy = a.voidguile.onModifyAccuracy;
 a.astralwitchcraft.onAfterMoveSecondarySelf = a.voidguile.onAfterMoveSecondarySelf;
 a.astralwitchcraft.onModifyMove = a.voidguile.onModifyMove;
 a.wrathshield.onDamagingHit = a.stamina.onDamagingHit;
 a.wrathshield.onAnyModifyDamage = a.friendguard.onAnyModifyDamage;
 delete a.wrathshield.onCheckShow;
 delete a.wrathshield.onSwitchOut;
 delete a.wrathshield.onImmunity;
 delete a.wrathshield.onResidual;
 a.wrathshield.onStart = function (pokemon) {
  if (this.field.isTerrain(['coldeclipseterrain', 'newworldterrain', 'starlightarenaterrain', 'fairytaleterrain'])) {
   this.boost({spd: 1}, pokemon, pokemon, this.dex.abilities.get('wrathshield'));
  }
 };
 a.lunardread.onStart = a.dishearten.onStart;
 delete a.lunardread.onDeductPP;
 a.mindseye.onSourceModifyDamage = function (damage, source, target, move) {
  if (move.category !== 'Status' && this.field.isTerrain('coldeclipseterrain')) return this.chainModify(0.7);
 };
 a.relentlesshunt.onDamagingHitOrder = a.roughskin.onDamagingHitOrder;
 a.relentlesshunt.onDamagingHit = a.roughskin.onDamagingHit;
 delete a.relentlesshunt.onImmunity;
 a.pyrousdominion = {
  ...a.eartheater, name: 'Grounded Instinct', num: 11503, rating: 3.5,
  onStart: a.keeneye.onStart,
  onTryBoost: a.keeneye.onTryBoost,
  onModifyMove: a.keeneye.onModifyMove,
 };
 const voidWrathModifyMove = a.voidwrath.onModifyMove;
 a.voidwrath.onModifyMove = function (move, pokemon, target) {
  voidWrathModifyMove?.call(this, move, pokemon, target);
  a.infiltrator.onModifyMove?.call(this, move, pokemon, target);
 };
 delete a.galvanicspirit.onSourceDamagingHit;
 delete a.blastchamber.onStart;
 delete a.blastchamber.onModifyMove;
 delete a.blastchamber.onAfterMoveSecondarySelf;
 for (const [id, type] of [['galvanicspirit', 'Electric'], ['blastchamber', 'Fire']] as const) {
  a[id].onBasePower = function (power, source, target, move) {
   if (move.category === 'Special' && move.type === type) return this.chainModify(1.3);
  };
 }
 a.soulescort = {
  name: 'Soul Escort', num: 11893, rating: 3, flags: {},
  onFaint(pokemon) {
   if (pokemon.side.pokemon.some(ally => ally.hp && !ally.isActive)) {
    pokemon.side.addSlotCondition(pokemon, 'soulescort', pokemon, this.effect);
   }
  },
 };

 delete a.crosswire.onModifyMove;
 delete a.crosswire.onSourceDamagingHit;
 delete a.crosswire.onSourceAfterSubDamage;
 a.crosswire.onTryAddVolatile = a.innerfocus.onTryAddVolatile;
 a.crosswire.onTryBoost = a.innerfocus.onTryBoost;

 for (const [id, name] of Object.entries(RagingCrownNames)) Object.assign(a[id as ID], {id, name});
 delete a.verdantdrake.onUpdate;
 delete a.verdantdrake.onSetStatus;
 delete a.verdantdrake.onTryBoost;
 a.verdantdrake.onSwitchOut = a.regenerator.onSwitchOut;
 a.verdantdrake.onModifyMove = a.infiltrator.onModifyMove;
 a.blazingtempo.onStart = function (pokemon) {this.dex.abilities.get('magmaarmor').onStart?.call(this, pokemon);};
 delete a.blazingtempo.onModifyMove;
 a.blazingtempo.onTryBoost = a.innerfocus.onTryBoost;
 a.blazingtempo.onTryAddVolatile = a.innerfocus.onTryAddVolatile;
 a.ragingcurrent.onAnyTryMove = a.damp.onAnyTryMove;
 a.ragingcurrent.onAnyDamage = a.damp.onAnyDamage;
 a.ragingcurrent.onSourceModifyAtkPriority = a.damp.onSourceModifyAtkPriority;
 a.ragingcurrent.onSourceModifyAtk = a.damp.onSourceModifyAtk;
 a.ragingcurrent.onSourceModifySpAPriority = a.damp.onSourceModifySpAPriority;
 a.ragingcurrent.onSourceModifySpA = a.damp.onSourceModifySpA;
 a.wisecounsel.onAllyBasePowerPriority = a.guardianpresence.onAllyBasePowerPriority;
 a.wisecounsel.onAllyBasePower = a.guardianpresence.onAllyBasePower;
 a.wisecounsel.onAnyModifyDamage = a.guardianpresence.onAnyModifyDamage;
}
export const RagingCrownComponents = {
 controlledfury: ['angerpoint'],
	aquashell: ['heatproof', 'frisk'],
	shieldsdown: ['crumblingshell'],
 mountainbreaker: ['eartheater', 'battlearmor'], dreadpresence: ['unnerve', 'darkaura'],
 snowpack: ['icebody'],
 hellfireeclipse: ['darkaura', 'agonyflame', 'intimidate'],
 vendetta: ['innerfocus'],
 frightfulwings: ['intimidate', 'owntempo'],
 venomarmor: ['dualwield'],
 spiralevolution: ['powerdrill', 'adaptability'],
 astralwitchcraft: ['levitate', 'magicguard', 'voidguile', 'proficient'],
 wrathshield: ['bulletproof', 'stamina', 'friendguard', 'proficient'],
 lunardread: ['dishearten', 'insomnia'],
 relentlesshunt: ['roughskin'],
 pyrousdominion: ['eartheater', 'keeneye'],
 voidwrath: ['moldbreaker', 'infiltrator'],
 galvanicspirit: ['vitalspirit'], blastchamber: ['vitalspirit'],

 crosswire: ['ironfist', 'innerfocus'],
 verdantdrake: ['lightningrod', 'regenerator', 'infiltrator'],
 blazingtempo: ['speedboost', 'magmaarmor', 'innerfocus'],
 ragingcurrent: ['swiftswim', 'dryskin', 'damp'],
 wisecounsel: ['innerfocus', 'guardianpresence'],
};
export const RagingCrownRemovals = {
	aquashell: ['waterveil', 'toughclaws', 'innerfocus', 'hypercutter'],
	shieldsdown: ['shellarmor', 'selfrepair', 'naturalcure', 'selfsufficient'],
 snowpack: ['toughclaws', 'thickfat'],
 hellfireeclipse: ['solarpower', 'flashfire'],
 venomarmor: ['battlearmor'],
 spiralevolution: ['moldbreaker', 'dualwield'],
 astralwitchcraft: ['magicbounce'],
 wrathshield: ['dauntlessshield', 'selfrepair'],
 lunardread: ['pressure'],
 relentlesshunt: ['levitate'],
 verdantdrake: ['limber', 'dualwield'], blazingtempo: ['keeneye', 'striker'],
};
export const RagingCrownDescriptions = {
	shieldsdown: { shortDesc: 'HP-based form change; Meteor blocks status. Crumbling Shell.', desc: "Minior changes to Meteor above half HP and its original core at half HP or below, on entry and at turn end. Meteor form blocks major status and Yawn. Has Crumbling Shell: physical hits place Stealth Rock on the attacker’s side (opposing side for allied hits), except on Water Surface, Underwater, Murkwater Surface or Swamp. No Shell Armor or Self Repair effects." },
	aquashell: { shortDesc: "Heatproof + Frisk.", desc: "Full local Heatproof and Frisk. Incoming Fire attacks use half the attacker’s Attack or Special Attack; burn damage is halved. On activation, reveals opposing active Illusions and held items; each opposing item holder independently has a 30% chance of five-turn Embargo." },
 mountainbreaker: {shortDesc: 'Earth Eater + Battle Armor.', desc: "Full local Earth Eater + Battle Armor: absorbs Ground moves for 1/4 HP; heals 1/16 on Cave and Desert. Prevents critical hits, has Battle Armor damage reduction, Fairy Tale entry Defense and Defense response to opposing stat drops."},
 dreadpresence: {shortDesc: 'Unnerve + Dark Aura.', desc: "Full local Unnerve + Dark Aura. Blocks opposing Berries and field Seeds; Cold Eclipse entry lowers opposing Speed. Boosts Dark moves on both sides by 4/3, reversed by Aura Break, without stacking. Immune to hail on Cold Eclipse."},
 snowpack: {shortDesc: 'Ice Body.', desc: "Full local Ice Body: immune to hail; contact attackers have a 30% frostbite chance. Heals 1/16 max HP in hail/snow, or on Icy, Snowy Mountain and Cold Eclipse without those weathers; hail on Cold Eclipse heals 1/8. Mamoswine supplies Thick Fat separately as its species passive."},
 controlledfury: {"shortDesc":"Anger Point; no rampage lock or ending confusion.","desc":"Full local Anger Point: the first damaging hit after entry raises Attack by 1 stage; surviving a critical hit raises Attack to maximum. Outrage, Thrash, Petal Dance and Raging Fury do not lock the user in or cause ending confusion, including repeated manual uses. Acquiring this effect during a rampage clears only that rampage lock without confusion. Existing confusion, Choice locks, Encore and move field effects remain unchanged."},
 cursedmarionette: {shortDesc: "Curses foes; cursed foes deal 20% less damage.", desc: "Its attacks and status moves curse opposing targets, and being hit curses the attacker. Cursed foes deal 0.8x damage to it. Its Curse deals 1/8 max HP. When it faints, opposing Pokemon become cursed and it creates Haunted Field for 5 turns, ignoring Neutralization. Ordinary Ghost Curse costs 1/3 max HP; ability-applied curses do not pay this cost."},
 hellfireeclipse: {shortDesc: 'Dark Aura + Agony Flame + Intimidate.', desc: "On entry, lowers adjacent foes Attack by 1 under normal Intimidate rules. Dark Aura boosts all damaging Dark moves by 4/3, or multiplies them by 0.75 with Aura Break; multiple users do not stack. Immune to hail damage on Cold Eclipse. After a damaging Fire move finishes, Agony Flame burns each surviving active opponent that lost HP and applies Heal Block for 2 turns including the current turn. Normal protections apply; longer Heal Block is preserved and a move burn cured by a Berry is not reapplied."},
 vendetta: {shortDesc: 'Inner Focus; once per entry, surviving an opposing hit Taunts its attacker.', desc: "Full Inner Focus prevents flinching and Intimidate Attack drops. Once per entry, surviving an opposing damaging hit that removes HP attempts to Taunt its living attacker under normal Taunt protections. The attempt spends the use even if blocked; Substitute-only damage does not trigger it. Switching resets the use; ability changes do not."},

 thorntempered: {shortDesc: 'Ignores Rocky Helmet, Rough Skin and Iron Barbs damage.', desc: 'Prevents damage from Rocky Helmet, Rough Skin and Iron Barbs, including those ability components within composites. Does not block recoil, other contact damage, status or stat effects. Brave Bird recoil still applies.'},
 scaleshelter: {shortDesc: 'Overcoat; blocks opposing accuracy drops.', desc: "Full local Overcoat prevents powder moves, Rage Powder redirection, Effect Spore, sandstorm damage and hail damage. Opposing Pokemon cannot lower its accuracy. Self and ally accuracy changes remain possible."},
 frightfulwings: {shortDesc: 'Intimidate + Own Tempo.', desc: "On entry lowers adjacent foes Attack by 1 stage under normal Intimidate rules. Full Own Tempo prevents and cures confusion and blocks Intimidate Attack drops."},
 venomarmor: {shortDesc: 'Dual Wield; poisoned holder blocks opposing Attack drops.', desc: "Full local Dual Wield: eligible moves hit twice at 60% power with independent accuracy checks; Metal Claw has its two 60%-power hits. While poisoned, opposing Pokemon cannot lower its Attack; self-inflicted drops remain. No Battle Armor critical immunity, damage reduction or Defense boosts. Rival Resolve remains separate."},
 spiralevolution: {shortDesc: 'Power Drill + Adaptability; double Twineedle power; protection piercing.', desc: "Full local Power Drill: drill and horn moves have 1.5x power, or 2x on Rocky, Mountain, Snowy Mountain, Cave and Volcanic, where they bypass protection at full power. Has Adaptability and double Twineedle power with its native hit count. Other damaging moves pierce protection at half power. Normal-priority moves act first in Trick Room without gaining priority. Ignores field Speed penalties and takes 20% less attack damage. Levitate remains separate."},
 astralwitchcraft: {shortDesc: 'Levitate + Magic Guard + Void Guile (Magician + Infiltrator).', desc: "Levitate grants Ground immunity and airborne benefits unless grounded. Magic Guard prevents indirect damage under its normal rules. Void Guile provides Magician item theft and Infiltrator screen, Substitute, Safeguard and Mist bypass. Entry grants +1 Sp. Atk on Fairy Tale, Bewitched Woods, Haunted, Misty or New World; on Psychic, incoming status moves with numeric accuracy use 50 accuracy. Its separate Fairy Tale and New World entry bonus grants another +1 Sp. Atk and +1 Sp. Def."},
 wrathshield: {shortDesc: 'Bulletproof + Stamina + Friend Guard; 20% less attack damage.', desc: "Immune to bullet, pulse and Mega Launcher-boosted moves; takes 20% less attack damage. Stamina heals 1/16 maximum HP after each opposing damaging hit and raises Defense once per turn on the first such hit. Friend Guard reduces allies attack damage by 25%, not the holder. Entry grants +1 Sp. Def on Cold Eclipse, New World, Starlight Arena or Fairy Tale. Proficient remains separate."},
 lunardread: {shortDesc: 'Dishearten + Insomnia; Dark and Ghost moves have 1.3x power.', desc: "On entry, lowers adjacent foes Sp. Atk by 1 stage, blocked by Substitute and normal stat-drop protection. Prevents and cures sleep and blocks Yawn. Dark and Ghost attacks have 1.3x power."},
 mindseye: {shortDesc: 'Self Sufficient; Normal/Fighting hit Ghost; Fairy/Dark STAB; accuracy protection; hit healing.', desc: "Has Self Sufficient. Normal and Fighting moves can hit Ghost types; gains Fairy and Dark STAB, ignores target evasion boosts, and prevents external accuracy drops. Heals 1/16 maximum HP after its damaging moves hit. No ordinary damage reduction. On Cold Eclipse, has 30% damage reduction, 1/8 hit healing and 1.3x damaging move power."},
 relentlesshunt: {shortDesc: 'Rough Skin; low-power moves gain +1 priority; field damage bonuses.', desc: "Contact attackers lose 1/8 of their maximum HP through Rough Skin. Moves with 60 or less Base Power gain +1 priority; Cold Eclipse raises the threshold to 80 without stacking another priority boost. Damaging moves deal 2x damage on Rocky, Fairy Tale, Big Top, Dragon Den, Mountain, Snowy Mountain or Cold Eclipse, applied once; 1.5x on Desert, Forest, Burning, Superheated, Ashen Beach, Water Surface, Cave, Starlight Arena or New World."},
 pyrousdominion: {shortDesc: 'Earth Eater + Keen Eye.', desc: 'Absorbs other Pokemon Ground moves and heals 1/4 maximum HP. Heals 1/16 maximum HP each turn on Cave or Desert. Prevents external accuracy drops and ignores target evasion boosts. Reveals opposing Illusions on entry; Mirror Arena entry grants +1 accuracy and Laser Focus. Does not guarantee hits or add Pressure effects. Rough Skin remains a separate species passive.'},
 voidwrath: {shortDesc: 'Mold Breaker + Infiltrator; Outrage has no rampage lock or confusion.', desc: 'Moves ignore bypassable opposing abilities and bypass Substitute, Reflect, Light Screen, Aurora Veil, Safeguard and Mist. Outrage does not cause a rampage lock or its ending confusion. Other move restrictions, including Choice locks, still apply.'},
 soulescort: {shortDesc: 'On fainting, the immediate replacement ignores hazards for that entry.', desc: 'When this Pokemon faints with an eligible replacement available, its immediate replacement in the same battle slot ignores all entry hazards for that single entry. Hazards remain on the field. Does not cure status, protect another slot, or grant lasting immunity. No protection is stored when no replacement is available.'},
 galvanicspirit: {shortDesc: 'Vital Spirit; special Electric moves have 1.3x power.', desc: "Prevents and cures sleep and blocks Yawn. Fighting attacks use 1.3x Attack or Sp. Atk through full local Vital Spirit. Moves whose actual category is Special and primary type is Electric gain 1.3x power, using ordinary Sp. Atk and Sp. Def. Static remains separate."},
 blastchamber: {shortDesc: 'Vital Spirit; special Fire moves have 1.3x power.', desc: "Prevents and cures sleep and blocks Yawn. Fighting attacks use 1.3x Attack or Sp. Atk through full local Vital Spirit. Moves whose actual category is Special and primary type is Fire gain 1.3x power, using ordinary Sp. Atk and Sp. Def. Flame Body remains separate."},

 crosswire: {shortDesc: 'Iron Fist + Inner Focus.', desc: "Punching moves have 1.4x power. Prevents flinching and Intimidate Attack drops."},
 verdantdrake: {shortDesc: 'Lightning Rod + Regenerator + Infiltrator.', desc: "Redirects single-target Electric moves and absorbs other Pokemon Electric moves for +1 Attack and Sp. Atk. Electric Terrain entry also grants both boosts. Switching heals 1/3 max HP. Moves bypass Substitute, Reflect, Light Screen, Aurora Veil, Safeguard and Mist."},
 blazingtempo: {shortDesc: 'Speed Boost + Magma Armor + Inner Focus.', desc: "Gains +1 Speed after each full active turn. Prevents flinching and Intimidate Attack drops. Prevents freezing outside Cold Eclipse and cures freeze. Incoming Water and Ice attacks use half the offensive stat. Dragon Den blocks Fire moves; Dragon Den, Volcanic and Cold Eclipse entry give +1 Defense and Sp. Def."},
 ragingcurrent: {shortDesc: 'Swift Swim + Dry Skin + Damp.', desc: "Doubles Speed in rain or on Water Surface, Murkwater Surface, Underwater and Midnight Zone. Absorbs Water for 1/4 max HP. Dry Skin gives incoming Fire moves 1.25x power; Damp independently halves their offensive stat, a combined 0.625x before rounding and other modifiers. Effective rain heals 1/8 HP; sun costs 1/8. Field healing: 1/16 on Underwater, Swamp, Misty or grounded Water Surface; 1/8 when grounded and Poison-type on Murkwater. Corrosive Mist heals Poison types by 1/8 but damages non-Steel others by 1/8; Desert costs 1/8. Damp blocks Explosion, Self-Destruct, Mind Blown, Misty Explosion and Aftermath damage. On Corrosive Mist it also blocks Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Lava Plume, Searing Shot and Inferno Overdrive."},
 wisecounsel: {shortDesc: 'Inner Focus + Guardian Presence; first successful allied Instruct cures confusion.', desc: 'Inner Focus prevents flinching and Intimidate Attack drops. Once per entry, successfully using Instruct on an active ally cures its confusion before the ordinary repeated action; failed Instruct or non-ally targets do not spend the use. Guardian Presence gives allies 1.3x move power, or 1.5x on Haunted, Bewitched Woods, Holy and Psychic fields, and reduces their attack damage by 25%. Neither support effect applies to the holder. Telepathy remains separate.'},
};
