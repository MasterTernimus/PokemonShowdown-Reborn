import type {AbilityDataTable} from '../sim/dex-abilities';

/** Ordinary-species reductions approved after the 85351d freeze. */
export function installOrdinaryReductions(a: AbilityDataTable) {
 delete a.toxicbloom.onSourceDamagingHit;
 delete a.ancientbloom.onDamagingHit;
 a.ancientbloom.onAnyModifyDamage = a.friendguard.onAnyModifyDamage;
 a.sunsovereign.onStart = function (pokemon) {
  this.dex.abilities.get('drought').onStart?.call(this, pokemon);
  if (this.field.isWeather(['sunnyday', 'desolateland'])) this.field.weatherState.duration = 8;
  this.dex.abilities.get('unboundblaze').onStart?.call(this, pokemon);
 };
 a.guardianpresence = {
  name: 'Guardian Presence', num: 11892, rating: 4, flags: {},
  onAllyBasePowerPriority: a.powerspot.onAllyBasePowerPriority,
  onAllyBasePower: a.powerspot.onAllyBasePower,
  onAnyModifyDamage: a.friendguard.onAnyModifyDamage,
 };
 const fortressStart = a.fortressshell.onStart;
 a.fortressshell.onStart = function (pokemon) {
  fortressStart?.call(this, pokemon);
  this.dex.abilities.get('waterbarrage').onStart?.call(this, pokemon);
  this.dex.abilities.get('shellarmor').onStart?.call(this, pokemon);
 };
 a.fortressshell.onModifyMove = a.stalwart.onModifyMove;
 a.fortressshell.onBasePower = function () {
  if (this.field.isTerrain(['newworldterrain', 'coldeclipseterrain', 'starlightarenaterrain'])) return this.chainModify(1.5);
 };
 a.fortressshell.onResidual = function (pokemon) {
  this.dex.abilities.get('waterbarrage').onResidual?.call(this, pokemon);
  this.dex.abilities.get('selfsufficient').onResidual?.call(this, pokemon);
 };
 a.fortressshell.onImmunity = a.selfsufficient.onImmunity;
 a.fortressshell.onAfterEachBoost = a.shellarmor.onAfterEachBoost;
 a.fortressshell.onAllyBasePower = a.guardianpresence.onAllyBasePower;
 a.fortressshell.onAnyModifyDamage = a.guardianpresence.onAnyModifyDamage;
 delete a.burningcrown.onTryBoost;
 delete a.burningcrown.onModifyMove;
 a.burningcrown.onStart = function (pokemon) {
  this.dex.abilities.get('intimidate').onStart?.call(this, pokemon);
  this.dex.abilities.get('unboundblaze').onStart?.call(this, pokemon);
 };

 delete a.toxicevolution.onDamagingHit;
 delete a.toxicevolution.onSourceModifyDamage;
 a.toxicevolution.onAnyAfterSetStatus = function (status, target, source, effect) {
  const holder = this.effectState.target as Pokemon;
  if (!['psn', 'tox'].includes(status.id) || source !== holder || target === holder || target.isAlly(holder)) return;
  if (holder.hp && holder.isActive && !holder.volatiles.toxicevolutionhealed &&
   (effect?.effectType === 'Move' || effect?.id === 'toxicevolution')) {
   holder.addVolatile('toxicevolutionhealed', holder, this.effect);
   this.heal(holder.baseMaxhp / 8, holder, holder, this.effect);
  }
 };

 a.spiralevolution.onModifyMove = function (move, source, target) {
  this.dex.abilities.get('moldbreaker').onModifyMove?.call(this, move, source, target);
  if (move.category !== 'Status') {
   move.breaksProtect = true;
   (move as ActiveMove & {spiralEvolutionBreaksProtect?: boolean}).spiralEvolutionBreaksProtect = true;
  }
 };
 a.spiralevolution.onBasePower = function (power, source, target, move) {
  let modifier = move.id === 'twineedle' ? 2 : 1;
  if ((move as ActiveMove & {spiralEvolutionProtectedTargets?: Pokemon[]}).spiralEvolutionProtectedTargets?.includes(target)) modifier *= 0.5;
  if (modifier !== 1) return this.chainModify(modifier);
 };
 delete a.completeparasitism.onModifySecondaries;
 delete a.joyride.onTryAddVolatile;
 delete a.joyride.onUpdate;
 delete a.joyride.onSetStatus;
 // Its explicit Fighting bonus remains; Vital Spirit's sleep/Yawn protection is removed.

 delete a.toxicsink.onAnyTryHeal;
 delete a.toxicsink.onResidual;
 delete a.stillwaters.onDamage;
 a.stillwaters.onStart = function (pokemon) {
  this.dex.abilities.get('cloudnine').onStart?.call(this, pokemon);
  if (this.field.isTerrain('fairytaleterrain')) this.boost({spd: 1});
  this.dex.abilities.get('unaware').onStart?.call(this, pokemon);
 };
 delete a.shattercrust.onDamage;
 a.shattercrust.onDamagingHit = a.crumblingshell.onDamagingHit;
 delete a.gemeye.onTryHit;
 delete a.witheringtouch.onAnyAfterDamageApplied;
 delete a.snowpack.onBasePower;
 delete a.requiem.onAnyAfterSuccessfulStatusHit;
 delete a.requiem.onSourceDamagingHit;
 delete a.requiem.onAnyFaint;
 delete a.requiem.markRequiem;
 a.requiem.onDamagingHit = function (damage, target, source, move) {
  if (!source || source.fainted) return;
  this.dex.abilities.get('cursedbody').onDamagingHit?.call(this, damage, target, source, move);
 };
 // Historical imports remain compatible, but execute only the actual replacement primitive.
 for (const [id, primitive] of [['rootediron', 'stamina'], ['marshconduit', 'waterabsorb'], ['vaultkeeper', 'prankster']]) {
  const old = a[id as ID];
  a[id as ID] = {...a[primitive as ID], id: id as ID, name: old.name, num: old.num, rating: old.rating};
 }
 a.nobledance.onAfterMove = a.dancer.onAfterMove;
 delete a.rebornflower.onAnyTryHeal;
 a.rebornflower.onResidual = function (pokemon) {
  for (const ally of pokemon.adjacentAllies()) if (ally.status && this.randomChance(1, 2)) {
   this.add('-activate', pokemon, 'ability: Reborn Flower'); ally.cureStatus();
  }
 };
 // Hydra Heart retains its original Stamina callback.
 delete a.curseddoll.onSourceDamagingHit;
 a.toxicspines.onDamagingHit = a.toxicdebris.onDamagingHit;
 delete a.toxicspines.onFoeAfterSetStatus;
 delete a.seafiend.onModifyAtk;
 delete a.seafiend.onModifySpA;
 // Sea Fiend retains only these Water Veil effects, not the full primitive's field status cure.
 a.seafiend.onStart = function (pokemon) {pokemon.addVolatile('aquaring');};
 a.seafiend.onUpdate = function (pokemon) {
  if (pokemon.status === 'brn') {this.add('-activate', pokemon, 'ability: Sea Fiend'); pokemon.cureStatus();}
 };
 a.seafiend.onSetStatus = function (status, target, source, effect) {
  if (status.id !== 'brn') return;
  if (effect?.status) this.add('-immune', target, '[from] ability: Sea Fiend');
  return false;
 };
 a.seafiend.onImmunity = function (type) {if (type === 'sandstorm' || type === 'hail') return false;};
}

export const OrdinaryComponents: {[id: string]: string[]} = {
 guardianpresence: ['friendguard', 'powerspot'], fortressshell: ['waterbarrage', 'selfsufficient', 'shellarmor', 'guardianpresence'], burningcrown: ['intimidate', 'unboundblaze', 'selfsufficient', 'levitate'],
 toxicbloom: ['pollenbloom'], ancientbloom: ['pollenbloom', 'selfsufficient', 'friendguard'], atrocity: ['unboundblaze', 'toughclaws', 'fireward'], sunsovereign: ['drought', 'unboundblaze'], toxicevolution: ['corrosion', 'shielddust'],
 spiralevolution: ['moldbreaker', 'adaptability'], completeparasitism: ['selfrepair'], joyride: ['aerilate', 'violentrush'],
	toxicsink: [], stillwaters: ['cloudnine', 'unaware'], shattercrust: ['crumblingshell'],
 freshplumage: ['naturalcure'], gemeye: ['magicguard', 'keeneye'], witheringtouch: ['poisontouch', 'corrosion'],
 snowpack: ['thickfat', 'icebody'], requiem: ['cursedbody', 'filter'], rootediron: ['stamina'],
 marshconduit: ['waterabsorb'], nobledance: ['dancer', 'hospitality'], rebornflower: ['flowerveil'],
 vaultkeeper: ['prankster'], hydraheart: ['stamina', 'hydrabond'], curseddoll: ['toughclaws', 'shadowshield'],
 toxicspines: ['toxicdebris', 'merciless'], seafiend: ['toxicdebris'],
};
export const OrdinaryRemovals: {[id: string]: string[]} = {
 fortressshell: ['dualwield'], burningcrown: ['moldbreaker', 'whitesmoke', 'filter'],
 ancientbloom: ['effectspore'], sunsovereign: ['intimidate'],
 spiralevolution: ['dualwield'], completeparasitism: ['parasitism'], joyride: ['vitalspirit'],
	toxicsink: ['invigorate', 'effectspore'], stillwaters: ['magicguard'], gemeye: ['magicbounce'], snowpack: ['toughclaws'],
 rebornflower: ['invigorate'], vaultkeeper: ['stickyhold'],
 toxicspines: ['ironbarbs', 'corrosion'], seafiend: ['waterbubble', 'waterveil'],
};
export const OrdinaryDescriptions: {[id: string]: {shortDesc: string, desc: string}} = {
 guardianpresence: {shortDesc: 'Friend Guard + Power Spot.', desc: 'Allies take 25% less attack damage; this does not protect the holder. Allies moves have 1.3x power, or 1.5x on Haunted, Bewitched Woods, Holy and Psychic fields. Does not boost the holder.'},
 burningcrown: {shortDesc: 'Intimidate + Unbound Blaze + Self-Sufficient + Levitate.', desc: "On entry, lowers adjacent foes Attack by 1 under normal Intimidate rules. Unbound Blaze converts eligible Normal moves to Dragon with 1.2x power, or 1.5x on Dragon's Den and Fairy Tale, and grants Dragon STAB. Prevents freezing outside Cold Eclipse and cures freeze; incoming Water and Ice attacks use half the offensive stat. Dragon's Den blocks Fire moves. Dragon's Den, Volcanic and Cold Eclipse entry give +1 Defense and Sp. Def. At turn end, foes take Fire damage of 1/16 base max HP, doubled if burned or the holder used Fire/Dragon that turn. Fire immunities apply; effectiveness scales chip only in Free-for-All. Self-Sufficient heals 1/16 max HP each turn and prevents sandstorm/hail damage. Levitate grants normal airborne Ground and grounded-hazard protection. Has one 20% attack-damage reduction. New World, Cold Eclipse and Starlight Arena retain 1.5x move power."},

toxicbloom: {"shortDesc":"Pollen Bloom.","desc":"Incoming Fire and Ice attacks use half the attacker's offensive stat. Immune to hail damage. Ignores target Defense/Sp. Def/evasion stages when attacking, and attacker Attack/Defense/Sp. Atk/accuracy stages when defending. Reveals opposing Illusions on entry. At turn end, opposing non-Grass Pokemon take Grass-type damage equal to 1/16 max HP, blocked by Grass immunities; it heals the damage dealt by that chip. Only in Free-for-All does Grass type effectiveness scale this chip."},
ancientbloom: {shortDesc: "Pollen Bloom + Self-Sufficient + Friend Guard; field bonuses.", desc: "Pollen Bloom supplies Thick Fat and Unaware: Fire and Ice attacks use half the attacking stat; ignores opposing stat stages through local Unaware and reveals Illusions on entry. Each turn, drains 1/16 base max HP from non-Grass foes and heals the damage actually dealt; Grass immunities apply, and type effectiveness scales this only in Free-for-All. Self-Sufficient independently heals 1/16 max HP each turn and prevents sandstorm and hail damage. Friend Guard reduces attack damage to allies by 25%, without protecting the holder. Fairy Tale, New World, Cold Eclipse and Starlight Arena entry grant +1 Defense and Sp. Def; the latter three give 1.5x move power."},
atrocity: {shortDesc: "Unbound Blaze + Tough Claws + Fire Ward", desc: "Unbound Blaze + Tough Claws + Fire Ward"},
sunsovereign: {"shortDesc":"Eight-turn sun + Unbound Blaze.","desc":"Summons sun for 8 turns on entry. Eligible Normal moves become Dragon with 1.2x power, or 1.5x on Dragon's Den and Fairy Tale. Dragon moves receive STAB. Prevents freezing outside Cold Eclipse and cures freeze. Incoming Water and Ice attacks use half the attacker's offensive stat. Dragon's Den blocks Fire moves. On Dragon's Den, Volcanic or Cold Eclipse entry, gains +1 Defense and Sp. Def. Immune to hail damage. At turn end, deals Fire-type damage to foes equal to 1/16 max HP, doubled if the foe is burned or the holder used a Fire or Dragon move that turn. Fire immunities block this damage; type effectiveness scales it only in Free-for-All."},
fortressshell: {shortDesc: 'Water Barrage (without Dual Wield), Self-Sufficient, Shell Armor and Guardian Presence.', desc: "Stalwart bypasses redirection and gives +1 Sp. Atk on New World, Starlight Arena, Fairy Tale or Chessboard entry. Water chip cycles 1/16, 2/16, then 3/16 foe base max HP; Water immunities apply, and effectiveness scales chip only in Free-for-All. Self-Sufficient heals 1/16 max HP each turn and prevents sandstorm/hail damage. Shell Armor prevents critical hits and reduces attack damage by 20%; Fairy Tale and Dragon Den entry give +1 Defense, and opposing stat drops trigger +2 Sp. Def. Guardian Presence boosts allies move power by 1.3x, or 1.5x on Haunted, Bewitched Woods, Holy and Psychic fields, and reduces their attack damage by 25%; neither applies to the holder. During Electric Aura or Electric Terrain, Murkwater Surface, Water Surface, Underwater, Midnight Zone, Factory and Short-Circuit, redirects and absorbs Electric moves for +1 Attack and Sp. Atk. Existing Fairy Tale, New World, Cold Eclipse and Starlight Arena entry/terrain bonuses give +1 Defense and Sp. Def; the latter three retain 1.5x move power."},
toxicevolution: {"shortDesc":"Corrosion + Shield Dust; poison infliction/damage shares one 1/8 heal per turn.","desc":"Full local Corrosion and Shield Dust. Can poison Poison and Steel types; Poison attacks bypass Steel immunity. Newly poisoned foes lose 1 Defense and Sp. Def. Has Wasteland secondary replacement and 1.5x incoming damage on Corrosive/Corrosive Mist. Successfully poisoning a foe with its own move, or dealing attack HP damage to a foe poisoned before that hit, can heal 1/8 base max HP, sharing one activation per turn."},
 spiralevolution: {shortDesc: 'Mold Breaker + Adaptability; double Twineedle power; no extra Dual Wield hits.', desc: "Has Mold Breaker and Adaptability. Twineedle has double power and keeps its native multihit count. Damaging moves retain half-power protection piercing. Normal-priority moves act first in Trick Room without gaining priority. Ignores field Speed penalties and takes 20% less attack damage."},
 completeparasitism: {shortDesc: 'Above half HP: neutralizes weaknesses, blocks indirect damage and opposing status moves.', desc: "While above half HP, weaknesses are neutralized, indirect damage is blocked and opposing status moves fail. Has its lethal-hit fake faint and full-HP Parasect-Parasite revival, including the separate Mega revival allowance. Cannot be suppressed and remains immune to Neutralization. Heals 1/16 max HP each turn and ignores sandstorm/hail. Switching cures major status and heals 1/8 max HP only when curing status; Bewitched Woods has its end-turn cure without that extra heal."},
 joyride: {shortDesc: 'Aerilate + Violent Rush; Fighting attacks use 1.3x Attack or Sp. Atk.', desc: "Eligible Normal moves become Flying and gain 1.2x power. On its first active turn, Speed is 1.5x and Attack is 1.2x. Fighting attacks retain 1.3x Attack or Sp. Atk."},
	toxicsink: { shortDesc: 'Redirects and absorbs Poison moves; absorption raises Sp. Atk by 1.', desc: 'Redirects eligible single-target Poison moves within range. Absorbs other Pokemon’s Poison moves, including status moves and spread hits on this holder, raising Sp. Atk by 1 stage. Spread moves are not redirected. Normal suppression and ability bypass rules apply.' },
 stillwaters: {shortDesc: 'Cloud Nine + Unaware; Fairy Tale entry grants +1 Sp. Def.', desc: "Suppresses weather effects. On Rainbow Field, gains a random eligible stat stage each turn. Ignores opposing stat changes through local Unaware and reveals Illusions on entry. Fairy Tale entry has +1 Sp. Def. Indirect damage is no longer prevented."},
 shattercrust: {shortDesc: 'Physical HP hits set Stealth Rock on the attacker’s side.', desc: "Full local Crumbling Shell: physical HP hits set Stealth Rock on the attacker’s side if absent; allied attackers use the opposing side. Does not activate on Water Surface, Underwater, Murkwater Surface or Swamp."},
 freshplumage: {shortDesc: 'Natural Cure; first successful Flying attack each entry deals 1.2x damage.', desc: "Local Natural Cure cures status on switching and heals 1/8 max HP only when curing status; Bewitched Woods has its end-turn cure. First successful Flying attack each entry deals 1.2x damage across all hits, including Substitute damage. Misses, protection and immunity preserve the charge. Roost does not recharge it."},
 gemeye: {shortDesc: 'Magic Guard + Keen Eye.', desc: 'Prevents indirect damage. Prevents opposing accuracy drops, ignores evasion boosts and reveals opposing Illusions. Fairy Tale entry grants +1 Sp. Def; Mirror Arena entry grants +1 accuracy and Laser Focus. Does not reflect status moves.'},
 witheringtouch: {shortDesc: 'Poison Touch + Corrosion.', desc: "Contact hits have a 30% poison chance, blocked by Shield Dust and Covert Cloak. Can poison Poison and Steel types; Poison attacks bypass Steel immunity. Newly poisoned foes lose 1 Defense and Sp. Def. Wasteland has four separate 2.5% frostbite, burn, paralysis and poison secondary chances; incoming damage is 1.5x on Corrosive and Corrosive Mist. No additional Attack drop against already-poisoned foes."},
 snowpack: {shortDesc: 'Thick Fat + Ice Body.', desc: 'Incoming Fire and Ice attacks use half the attacker’s offensive stat. Immune to hail. Contact attackers have a 30% frostbite chance. Heals 1/16 max HP in hail/snow, or on Icy, Snowy Mountain and Cold Eclipse without those weathers; hail on Cold Eclipse heals 1/8. No contact power multiplier.'},
 requiem: {shortDesc: 'Cursed Body retaliation + Filter; creates Haunted Field on fainting.', desc: "Damaging attacks have a 30% chance to be Disabled, guaranteed on Haunted and blocked on Holy; normal Cursed Body exclusions apply. Takes 20% less attack damage, or 40% less from super-effective attacks. On fainting, creates Haunted Field for 5 turns. Existing unsuppressible behavior remains."},
 rootediron: {shortDesc: 'Stamina: each opposing HP hit heals 1/16; first hit each turn gives +1 Defense.', desc: "Compatibility name for full local Stamina. Each opposing attack hit that damages HP heals 1/16 base max HP. The first such hit each turn gives +1 Defense before later multihit strikes. No additional healing for turns without an attack. Ferrothorn selects Stamina directly and has Iron Barbs as its passive."},
 marshconduit: {shortDesc: 'Water Absorb.', desc: "Compatibility name for full local Water Absorb. Absorbs other Pokemon’s Water moves to heal 1/4 max HP. Has 1/16 field healing on Underwater, grounded Water Surface, and grounded Poison-type Murkwater. Seismitoad selects Water Absorb directly."},
 nobledance: {shortDesc: 'Dancer + Hospitality.', desc: "Full local Dancer and Hospitality: copies eligible dance moves under normal execution and recursion rules, has Dancer’s local stat rewards and Big Top behavior, and heals adjacent allies on entry."},
 rebornflower: {shortDesc: 'Reborn form; Flower Veil and a 50% adjacent-ally status cure each turn.', desc: 'Changes Florges to Florges-Reborn on entry. Each adjacent ally has a 50% chance to be cured of major status at turn end. Grass allies, including itself, are protected from opposing stat drops, major status and Yawn; Bewitched Woods extends this protection to all types. Does not amplify healing. Aromaveil remains separate.'},
	vaultkeeper: { shortDesc: 'Prankster.', desc: "Compatibility name for local Prankster: status moves gain +1 priority; opposing Dark types block them except on Bewitched Woods. Does not prevent screen removal. Klefki receives Prankster as its species passive; this compatibility name has the same priority effect." },
 hydraheart: {shortDesc: 'Stamina + Hydra Bond.', desc: "Each opposing attack hit that damages HP heals 1/16 base max HP; the first such hit each turn gives +1 Defense. Full local Hydra Bond has its multihit, Free-for-All and field effects."},
 curseddoll: {shortDesc: 'Contact power 1.3x; incoming damage 0.8x, or 0.6x if super effective.', desc: 'Tough Claws gives contact moves 1.3x power. Local Shadow Shield reduces attack damage to 0.8x at any HP, or 0.6x total for super-effective attacks; ability-ignoring moves cannot bypass it, but suppression disables it. Immune to hail on Cold Eclipse. On fainting, creates Haunted Field for 5 turns. Damaging attacks do not automatically curse foes.'},
 toxicspines: {shortDesc: 'Physical hits set Toxic Spikes; contact retaliates for 1/6 HP; poison bypass.', desc: "Physical HP hits set one Toxic Spikes layer on the attacker’s side, up to two; allied attackers use the opposing side. Contact attackers lose 1/6 base max HP, without an additional Iron Barbs hit. Can poison Poison and Steel types; Poison attacks bypass Steel immunity. Poisoning does not lower defenses. Wasteland has four separate 2.5% frostbite, burn, paralysis and poison secondary chances; incoming damage remains 1.5x on Corrosive and Corrosive Mist."},
 seafiend: {shortDesc: 'Toxic Debris; Fire resistance, burn/weather protection and Aqua Ring.', desc: "Physical HP hits set Toxic Spikes on the attacker’s side, up to two; contact attackers lose 1/6 base max HP. Incoming Fire attacks use half the attacker’s offensive stat. Prevents and cures burns, ignores sandstorm/hail damage and gains Aqua Ring on entry with its field healing. Aftermath remains separate."},
};
