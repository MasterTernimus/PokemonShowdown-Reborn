import type {AbilityDataTable} from '../sim/dex-abilities';
import {applySereneGrace} from './ally-serene-grace';

function selectedHit(move: ActiveMove) {
 return move.category !== 'Status' && !move.sourceEffect && !(move as any).isExternal &&
  !move.callsMove && !move.hasBounced && !move.flags.futuremove;
}
function markEntryStrike(this: Battle, damage: number, target: Pokemon, source: Pokemon, move: ActiveMove) {
 const id = this.effect.id;
 if (damage <= 0 || target.isAlly(source) || !selectedHit(move) || source.m[id + 'Spent']) return;
 if (id === 'blademastery' && !move.flags.slicing) return;
 if (id === 'desertvigil' && move.type !== 'Dark') return;
 if (id === 'imperialprincess') {
  if (!move.flags.kick) return;
  const native = this.dex.moves.get(move.id);
  if ((native.boosts?.def || 0) < 0 || [native.secondary, ...(native.secondaries || [])]
   .some(effect => effect && (effect.boosts?.def || 0) < 0)) return;
 }
 source.m[id + 'Spent'] = true;
 (move as any)[id + 'Target'] = target;
}
function finishEntryStrike(this: Battle, source: Pokemon, target: Pokemon, move: ActiveMove) {
 const id = this.effect.id;
 if (this.effectState.target !== source) return;
 const foe = (move as any)[id + 'Target'] as Pokemon | undefined;
 delete (move as any)[id + 'Target'];
 if (!source.hp || !source.isActive || !foe?.hp || !foe.isActive) return;
 if (id === 'blademastery') this.boost({atk: -1}, foe, source, this.effect);
 else if (id === 'imperialprincess') this.boost({def: -1}, foe, source, this.effect);
 else foe.addVolatile('torment', source, this.effect);
}
export function installLoreEntryAbilities(abilities: AbilityDataTable) {
 abilities.voidomen.onModifyMovePriority = -2;
 abilities.lunarorbit.onModifyMovePriority = -2;
 abilities.lunarorbit.onModifyMove = function (move) { applySereneGrace(move, false, 'lunarorbit'); };
 Object.assign(abilities.lunarorbit, {onAllyModifyMovePriority: -2, onAllyChargeMovePriority: -100});
 abilities.lunarorbit.onAllyModifyMove = function (move, source) {
  const holder = this.effectState.target as Pokemon;
  if (source === holder || !holder.hp || !holder.isActive || !source.isAlly(holder)) return;
  applySereneGrace(move, false, 'lunarorbit');
 };

 abilities.lunarorbit.onAllyChargeMove = function (source) {
  const holder = this.effectState.target as Pokemon;
  if (!holder.hp || !holder.isActive || !source.isAlly(holder) || source.volatiles.voidomenchargespent) return;
  source.addVolatile('voidomenchargespent', source, this.effect);
  this.add('-activate', source, 'ability: Lunar Orbit');
  return false;
 };

 abilities.beyondfear = {name:'Beyond Fear', num:abilities.beyondfear.num, rating:3, flags:{breakable:1},
  onFlinch() { return false; },
  onTryAddVolatile(status, target, source) { if (status.id === 'taunt' && source && !source.isAlly(target)) return false; },
 };
 abilities.unboundspirit = {...abilities.vitalspirit, name:'Unbound Spirit', num:11693, rating:4};
 abilities.ragingheart = {name:'Raging Heart', num:11694, rating:4, flags:{},
  onModifyType(move) { if (move.id === 'thrash' && selectedHit(move)) { move.type = 'Ghost'; (move as any).ragingHeartThrash = true; } },
 };

 // Explicit Tsareena/Lopunny package exceptions, independent of Vital Spirit.
 for (const id of ['imperialprincess', 'uncheckedassault'] as const) abilities[id].onSourceModifyDamage = function (damage, source, target, move) {
  if (move.category !== 'Status') return this.chainModify(0.8);
 };
 delete abilities.imperialprincess.onSourceAfterFaint;
 Object.assign(abilities.imperialprincess, {onSourceDamagingHit: markEntryStrike, onAnyAfterAttackResolved: finishEntryStrike});
 abilities.ragingcurrent.onDamagingHit = function (damage, target, source, move) {
  if (damage > 0 && target.hp) return this.dex.abilities.get('stamina').onDamagingHit?.call(this, damage, target, source, move);
 };
 abilities.empress.onDamagingHit = function (damage, target, source, move) {
  if (damage <= 0 || !source || target.isAlly(source) || move.category === 'Status' || target.m.empressRallySpent) return;
  const starts: Map<Pokemon, number> = (move as any).empressRallyStarts ||= new Map();
  if (!starts.has(target)) starts.set(target, target.hp + damage);
 };
 abilities.empress.onAnyAfterAttackResolved = function (source, target, move) {
  const holder = this.effectState.target as Pokemon;
  const starts: Map<Pokemon, number> | undefined = (move as any).empressRallyStarts;
  const hp = starts?.get(holder);
  starts?.delete(holder);
  if (!hp || !holder.hp || !holder.isActive || holder.m.empressRallySpent ||
   hp * 2 <= holder.maxhp || holder.hp * 2 > holder.maxhp) return;
  holder.m.empressRallySpent = true;
  this.add('-message', 'Tsareena rallies its allies to stand firm!');
  for (const ally of holder.alliesAndSelf()) {
   if (!ally.hp || !ally.isActive || (ally !== holder && !holder.isAdjacent(ally))) continue;
   ally.cureStatus();
   ally.removeVolatile('confusion');
  }
  const guard = holder.side.sideConditions.safeguard;
  if (guard) guard.duration = Math.max(guard.duration || 0, 5);
  else if (holder.side.addSideCondition('safeguard', holder, this.effect)) holder.side.sideConditions.safeguard.duration = 5;
 };
 delete abilities.blademastery.onModifyCritRatio;
 Object.assign(abilities.blademastery, {onSourceDamagingHit: markEntryStrike, onAnyAfterAttackResolved: finishEntryStrike});
 abilities.desertvigil = {...abilities.overcoat, name: 'Desert Vigil', num: 11692, rating: 4,
  onSourceDamagingHit: markEntryStrike, onAnyAfterAttackResolved: finishEntryStrike};
 abilities.lastingpromise = {...abilities.friendguard, name: 'Lasting Promise', num: 11691, rating: 4};
 abilities.ange = {...abilities.fairyaura, name: 'Ange', num: abilities.ange.num, rating: abilities.ange.rating};
 abilities.firemane.onBasePower = function (power, source, target, move) {
  if (move.type === '???' || move.category === 'Status') return;
  // Match the engine's ordinary STAB eligibility after move/type conversion.
  const native = move.forceSTAB || source.hasType(move.type) || source.getTypes(false, true).includes(move.type) ||
   (move.types !== undefined && source.hasType(move.types));
  // Current STAB handlers are pure modifiers. Include explicitly granted STAB,
  // but not Stellar's one-use non-STAB 1.2x bonus.
  const stab = source.terastallized === 'Stellar' ? (native ? 1.5 : 1) :
   this.runEvent('ModifySTAB', source, target, move, native ? 1.5 : 1);
  if (stab > 1) return this.chainModify(1.5);
 };
}
export const LoreEntryDescriptions = {
 blademastery: {shortDesc:'Sharpness; slicing +1 priority at <=1/4 HP; first selected slicing HP hit per entry lowers foe Attack.',desc:'Full local Sharpness. At 1/4 max HP or less, slicing moves gain +1 priority. Once per genuine entry, the first directly selected damaging slicing attack that damages opposing HP attempts to lower that first damaged foe\'s Attack by 1 after the whole move if it survives. Ordinary stat-drop protections and reflections apply. Substitute-only, ally and generated attacks do not spend the use. The use is spent by a qualifying HP hit even if the target later faints or blocks the drop. Ability restarts do not reset it. Does not include Super Luck.'},
 desertvigil: {shortDesc:'Overcoat; first selected Dark HP hit per entry Torments its surviving foe after the move.',desc:'Full local Overcoat. Once per genuine entry, the first directly selected damaging Dark attack that damages opposing HP attempts Torment on that first damaged foe after the whole move if it survives. Normal volatile immunities apply. Substitute-only, ally and generated attacks do not spend the use. A qualifying HP hit spends the use even if the target later faints or blocks Torment. Ability restarts do not reset it. No additional damage multiplier.'},
 lastingpromise: {shortDesc:'Friend Guard; its Wish cures a different ally\'s major status only after successfully healing it.',desc:'Full local Friend Guard. When a Wish cast by this Pokemon while this ability is active successfully restores HP to a different ally, it also cures that recipient\'s major status. Tracks the original wisher across switching. Does not add HP, cure itself, or cure on failed, blocked or full-HP healing. No once-battle restriction.'},
 ange: {shortDesc:'Full local Fairy Aura.',desc:'Full local Fairy Aura. Eternal Flower is supplied separately by Floette-Mega\'s species passive, including its own existing ability-bypass effect.'},
 firemane: {shortDesc:'Moves receiving STAB have 1.5x power, once.',desc:'Damaging moves receiving same-type attack bonus have 1.5x power once, including changed move types, retained original types after Terastallization and explicitly granted STAB. Does not boost non-STAB Fire moves, typeless moves, or Stellar\'s one-use non-STAB bonus. Separate from Blazing Mane.'},
};

Object.assign(LoreEntryDescriptions, {
 imperialprincess: {shortDesc:'Striker + Vital Spirit; kicks ignore raised Defense; first qualifying kick per entry lowers Defense.',desc:'Full local Striker and Vital Spirit, Fighting STAB and protection against Poison/Steel targeting its Fairy type. Kicks ignore positive Defense stages only when the attack actually uses Defense; negative stages, screens and defensive abilities remain. Once per genuine entry, the first directly selected kick damaging opposing HP lowers that first surviving foe\'s Defense by 1 after the whole move. Kicks with their own native Defense drop neither trigger nor spend this use. Normal stat-drop protections and reflections apply; a blocked attempt spends the use. Substitute-only, allied and generated attacks do not qualify. No Moxie or extra attacks.'},
 empress: {shortDesc:'Queenly Majesty + Royal Decree; once-battle half-HP rally cures nearby allies and sets 5-turn Safeguard.',desc:'Retains full local Queenly Majesty and Royal Decree, Fighting STAB and protection against Poison/Steel targeting its Fairy type. Once per battle, after surviving a whole opposing damaging move that starts it above half HP and ends at or below half, cures its own and adjacent active allies\' major status and confusion, and sets 5-turn Safeguard without shortening a longer existing Safeguard. Switching or restarting the ability does not reset the use. Ally attacks, Substitute-only hits, recoil, residual damage and HP costs do not qualify. No healing or stat changes.'},
 ragingcurrent: {shortDesc:'Swift Swim + Dry Skin + Stamina.',desc:'Full local Swift Swim, Dry Skin and Stamina. Each surviving opposing HP-damaging hit heals 1/16 base max HP; the first qualifying hit each turn also raises Defense by 1. Absorbed Water triggers Dry Skin only. Rain and field healing retain their separate normal effects.'},
});

Object.assign(LoreEntryDescriptions, {
  "vitalspirit": {
    "desc": "Prevents and cures sleep and blocks Yawn. Fighting attacks use 1.3x Attack or Sp. Atk.",
    "shortDesc": "No sleep/Yawn; 1.3x Fighting attacking stats."
  },
  "joyride": {
    "desc": "Its Normal-type moves become Flying-type moves and have their power multiplied by 1.2. This effect comes after other effects that change a move's type, but before Ion Deluge and Electrify's effects. On its first active turn, its Speed is 1.5x and its Attack is 1.2x. Prevents and cures sleep and blocks Yawn. Fighting attacks use 1.3x Attack or Sp. Atk.",
    "shortDesc": "Combines the listed abilities."
  },
  "galvanicspirit": {
    "desc": "Vital Spirit, including this server's sleep immunity, 1.3x Fighting attack-stat boost. Contact Electric hits lower the foe's Sp. Def by 1 stage once per turn.",
    "shortDesc": "Electric contact hits lower Sp. Def once per turn."
  },
  "blastchamber": {
    "desc": "Vital Spirit, including sleep immunity, 1.3x Fighting attack-stat boost. A landed Fire attack makes its next Fighting attack unable to miss, and a landed Fighting attack does the same for its next Fire attack. Charges end on switching.",
    "shortDesc": "Fire and Fighting hits make the other type's next attack never miss."
  }
});

Object.assign(LoreEntryDescriptions, {
 beyondfear:{shortDesc:'Immune to flinching and opposing Taunt.',desc:'Immune to flinching and opposing Taunt. Does not prevent Intimidate or other stat drops and does not raise defenses in response. As Annihilape\'s species passive, remains active through selected-ability suppression.'},
 unboundspirit:{shortDesc:'Vital Spirit; Ghost attacks ignore Reflect and Light Screen.',desc:'Full revised Vital Spirit prevents and cures sleep, blocks Yawn, and gives Fighting attacks 1.3x Attack or Sp. Atk. Ghost attacks ignore Reflect and Light Screen only. Does not bypass Aurora Veil, Substitute, type immunities or abilities.'},
 ragingheart:{shortDesc:'Selected Thrash becomes Ghost and causes no ending confusion.',desc:'Directly selected Thrash becomes Ghost type, retaining its physical category, 140 power, random opposing target, 2–3-turn lock and 30% Defense-drop chance. While this ability is active, that Thrash does not cause its own ending confusion. External confusion and confusion from other moves remain. Normal types remain immune; no extra power multiplier.'},
});

Object.assign(LoreEntryDescriptions, {
  "lunarorbit": {
    "shortDesc": "Magic Guard; entry Gravity; shares secondary boosts and one charge skip per recipient entry.",
    "desc": "Reflects eligible status moves and hazards once. On Mirror Arena, reflecting a directly targeted move gives its original user +1 evasion. Prevents indirect damage; HP costs, Pain Split, confusion and Struggle recoil still apply. Fairy Tale entry gives +1 Sp. Def. On entry or Mega Evolution, sets Gravity for 5 turns. Water Surface sinks to Underwater, Underwater to Midnight Zone, and Corrosive Mist to Corrosive, except on New World. While active, doubles secondary-effect chances for itself and actual allies. Lunar Orbit and Void Omen stack with each other only, for 4x chances capped at 60%, preserving higher native chances and guaranteed effects; duplicate providers and natural Serene Grace add no further multiplier. Shares one charge-turn skip per receiving Pokemon per stay with Void Omen. Only the recipient switching resets it; provider switching, Transform and ability restarts do not. Field skips, Power Herb and independent Serene Grace do not consume it. Suppression disables the grant."
  },
  "voidomen": {
    "shortDesc": "Friend Guard; shares secondary boosts and one charge skip; Safeguard and secondary ward.",
    "desc": "Friend Guard reduces attack damage to other allies by 25%. While active, doubles secondary-effect chances for its holder and actual allies. Stacks once with Lunar Orbit for 4x chances capped at 60%, preserving higher native chances and guaranteed effects; duplicate providers and natural Serene Grace add no further multiplier. Void Omen and Lunar Orbit share one required charge-turn skip per receiving Pokemon per stay on the field, including its holder. Only that recipient switching resets its allowance; provider switches, ability changes, Transform and multiple providers do not refill it. Field skips, Power Herb and independent Serene Grace do not consume the allowance. Suppression disables the grant. Once per entry, the first successful damaging-move secondary or successful self-targeted status move sets or refreshes Safeguard to at least 3 turns. Separately, after activation, the first successfully applied secondary effect creates a ward against the next opposing stat-drop event targeting the holder or an adjacent active ally. Positive changes and self-inflicted drops remain. The ward ends when spent or the holder leaves."
  }
});

Object.assign(LoreEntryDescriptions, {serenegrace:{shortDesc:"Doubles secondary chances up to 60%; removes charge turns.",desc:"Doubles probabilistic move secondary-effect chances up to 60%, preserving native chances already above 60% and guaranteed effects. Removes charging turns. Does not add another chance multiplier to Lunar Orbit or Void Omen."}});

Object.assign(LoreEntryDescriptions, {
 lunarorbit:{shortDesc:'Magic Guard; entry Gravity; shares secondary boosts and one charge skip per recipient entry.',desc:'Full local Magic Guard prevents indirect damage, retaining its normal exceptions and Fairy Tale entry boost. On entry or Mega Evolution, sets Gravity for 5 turns with its existing field transformations. Magic Bounce remains the species passive. While active, increases move secondary-effect chances for itself and actual allies, capped at 60% while preserving higher native chances and guaranteed effects. Grants one required charge-turn skip per receiving Pokemon per stay, sharing the same allowance as Void Omen. Only that recipient switching resets it; provider switches, ability restarts and Transform do not refill it. Independent field, Power Herb and natural Serene Grace skips do not spend the allowance. Suppression disables the grant.'},
 voidomen:{shortDesc:'Friend Guard; shared secondary boosts, limited charge skip, Safeguard and ward.',desc:'Friend Guard reduces attack damage to other allies by 25%. While active, increases move secondary-effect chances for its holder and actual allies, capped at 60% while preserving higher native chances and guaranteed effects. Grants one required charge-turn skip per receiving Pokemon per stay, sharing the same allowance as Lunar Orbit. Only that recipient switching resets it; provider switches, ability changes, Transform and multiple providers do not refill it. Field skips, Power Herb and independent Serene Grace do not consume it. Suppression disables the grant. Once per entry, the first successful damaging-move secondary or successful self-targeted status move sets or refreshes Safeguard to at least 3 turns. Separately, after activation, the first successfully applied secondary effect creates a ward against the next opposing stat-drop event targeting the holder or an adjacent active ally. Positive changes and self-inflicted drops remain. The ward ends when spent or the holder leaves.'},
});

Object.assign(LoreEntryDescriptions, {"mountainrift":{"shortDesc":"5-turn Mountain; half HP: Gravity + Mountain reset; first faint: full reset into Shatter.","desc":"Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale or Dragon's Den entry and +2 Sp. Def when a foe lowers its stats. Heals 1/16 max HP each turn. Immune to sandstorm and hail damage. It cannot be critically hit, takes 0.8x damage, gains 2 Sp. Def when a foe lowers its stats, heals 1/16 max HP each turn, and ignores sandstorm and hail damage. On entry, it creates Mountain Field for 5 turns. Once at half HP or less, it starts Gravity and resets Mountain Field to 5 turns. Its four moves are always Earthquake, Desert's Mark, Mountain Gale, and Stone Edge. The first time it would faint, it instead revives at full HP as Torterra-Rift-Shatter, clearing its status, boosts, and volatile conditions."}});
