import {installRagingCrowns, RagingCrownComponents, RagingCrownRemovals, RagingCrownDescriptions} from './raging-crowns-approved';
import {installOrdinaryReductions, OrdinaryComponents, OrdinaryDescriptions, OrdinaryRemovals} from './ordinary-approved-reductions';
import type {AbilityDataTable} from '../sim/dex-abilities';
import {installRepeatableAbilities, RepeatableComponents, RepeatableDescriptions, RepeatableRemovals} from './simple-repeatable-abilities';

/** Local, individually approved reductions. Shared primitives and field rules stay intact. */
export function installAuditCleanup(abilities: AbilityDataTable) {
 // Native Cactus Chorus owns its callbacks, including selected/copied shared primitives.
 for (const id of ['cactuschorus', 'waterabsorb', 'sandrush'] as const) {
  const ability = abilities[id];
  for (const [event, callback] of Object.entries(ability)) {
   if (!event.startsWith('on') || typeof callback !== 'function') continue;
   (ability as any)[event] = function (this: Battle, ...args: any[]) {
    if (this.effectState.speciesPassive !== 'cactuschorus' &&
     this.effectState.target?.getPassives().includes('cactuschorus')) return;
    return callback.apply(this, args);
   };
  }
 }

 delete abilities.witheringshell.onTryHit;
 delete abilities.witheringshell.onDamage;
 delete abilities.witheringshell.onCheckShow;
 delete abilities.witheringshell.onSwitchOut;
 delete abilities.witheringshell.onResidual;
 abilities.witheringshell.onDamagingHit = function (damage, target, source, move) {
  this.dex.abilities.get('crumblingshell').onDamagingHit?.call(this, damage, target, source, move);
 };
 delete abilities.witheringshell.onFaint;
 abilities.witheringshell.onWeather = abilities.raindish.onWeather;
 abilities.witheringshell.onTakeItem = function (item, pokemon, source) {
  const component = this.dex.abilities.get('stickyhold');
  if (this.suppressingAbility(pokemon, component)) return;
  if (typeof component.onTakeItem === 'function') return component.onTakeItem.call(this, item, pokemon, source);
 };

 delete abilities.relicinstinct.onUpdate;
 delete abilities.relicinstinct.onAnyAfterAttackResolved;
 delete abilities.relicinstinct.onAfterDamageApplied;
 abilities.relicinstinct.onResidual = function (pokemon) {
  if (pokemon.hp <= pokemon.maxhp / 2) this.heal(pokemon.baseMaxhp / 16, pokemon, pokemon);
 };
 delete abilities.primevalhunt.onModifyCritRatio;
	for (const key of ['onUpdate', 'onTryAddVolatile', 'onHit', 'onTryBoost'] as const) delete abilities.primevalhunt[key];
	Object.assign(abilities.primevalhunt, { flags: {} });
	abilities.primevalhunt.onStart = function (pokemon) {
		return this.dex.abilities.get('steadfast').onStart?.call(this, pokemon);
	};
	abilities.primevalhunt.onFlinch = function (pokemon) {
		const callback = this.dex.abilities.get('steadfast').onFlinch;
		if (typeof callback === 'function') return callback.call(this, pokemon);
	};
 abilities.doublestrike.onBasePower = function (power, source, target, move) {
  const minimum = this.field.isTerrain('factoryterrain') ? 80 : 60;
  if (this.modify(power, this.event.modifier) <= minimum) return this.chainModify(1.5);
 };
	// Preserve the existing delegates of composites outside this approved recipient list.
	abilities.nightmarepulse.onSourceModifyDamage = abilities.pendulumswing.onSourceModifyDamage;
	abilities.riotamp.onModifyMove = abilities.resonanceforce.onModifyMove;
	abilities.tremor.onModifyMove = abilities.resonanceforce.onModifyMove;
	delete abilities.webassassin.onModifyDamage;
	delete abilities.webassassin.onTryBoost;
	delete abilities.pendulumswing.onSourceModifyDamage;
	delete abilities.caverndrake.onModifyMove;
	delete abilities.plushwhiplash.onSourceModifyDamage;
	delete abilities.resonanceforce.onModifyMove;
	abilities.resonanceforce.onAllyBasePower = function (power, source, target, move) {
		if (this.effect.id === 'resonanceforce' && source === this.effectState.target) return;
		if (move.flags.sound) return this.chainModify(1.5);
	};
	delete abilities.cactuschorus.onAfterMoveSecondarySelf;
	delete abilities.noblearmor.onDamagingHit;
	// Ice Body is now only a partial effect here, so retain its recovery explicitly.
	abilities.noblearmor.onWeather = function (pokemon, source, effect) {
		if (effect.id === 'hail' || effect.id === 'snow') {
			this.heal(pokemon.baseMaxhp / (effect.id === 'hail' && this.field.isTerrain('coldeclipseterrain') ? 8 : 16));
		}
	};
	abilities.noblearmor.onResidual = function (pokemon) {
		if (this.field.isTerrain(['icyterrain', 'snowymountainterrain', 'coldeclipseterrain']) && !this.field.isWeather(['hail', 'snow'])) this.heal(pokemon.baseMaxhp / 16);
	};
	abilities.noblearmor.onImmunity = function (type) {if (type === 'hail') return false;};
	for (const key of ['onTryHitPriority', 'onTryHit', 'onAllyTryHitSide', 'onResidualOrder', 'onResidualSubOrder', 'onResidual'] as const) delete abilities.gooey[key];
	for (const key of ['onModifyCritRatio', 'onModifyAccuracyPriority', 'onModifyAccuracy', 'onUpdate', 'onSetStatus'] as const) delete abilities.triplethreat[key];
	abilities.triplethreat.onStart = function (pokemon) {
		return this.dex.abilities.get('keeneye').onStart?.call(this, pokemon);
	};
	abilities.triplethreat.onTryBoost = function (boost, target, source, effect) {
		this.dex.abilities.get('keeneye').onTryBoost?.call(this, boost, target, source, effect);
		this.dex.abilities.get('innerfocus').onTryBoost?.call(this, boost, target, source, effect);
	};
 abilities.triplethreat.onTryAddVolatile = function (status, target, source, effect) {
  const result = this.dex.abilities.get('innerfocus').onTryAddVolatile?.call(this, status, target, source, effect);
  if (result === null || result === false) return result;
  return this.dex.abilities.get('owntempo').onTryAddVolatile?.call(this, status, target, source, effect);
 };
 abilities.triplethreat.onUpdate = abilities.owntempo.onUpdate;
 abilities.triplethreat.onHit = abilities.owntempo.onHit;
 abilities.marshhide = {...abilities.waterabsorb, name: 'Marsh Hide', num: 11891, onDamagingHit: abilities.poisonpoint.onDamagingHit};
 delete abilities.ragingcurrent.onDamagingHit;
	delete abilities.stormbell.onSourceAfterFaint;
	delete abilities.astralengine.onSourceAfterFaint;
	for (const key of ['onModifySpe', 'onModifyAtk', 'onAfterMove'] as const) delete abilities.kickfiend[key];
	for (const key of ['onDamage', 'onTryEatItem', 'onAfterMoveSecondary'] as const) delete abilities.cruelshell[key];
	delete abilities.sweetresonance.onTakeItem;
	delete abilities.sweetresonance.onDamagingHit;
	abilities.sweetresonance.onStart = function (pokemon) {
		// Keep the entry drop and its existing field extensions, without the other Syrup hooks.
		return this.dex.abilities.get('supersweetsyrup').onStart?.call(this, pokemon);
	};
	// Replace the old healing package with the actual local primitives, once each.
	abilities.falsedevotion = {
		...abilities.prankster, ...abilities.serenegrace,
		id: 'falsedevotion' as ID, name: 'False Devotion', num: 10185, rating: 4,
	};
	abilities.truedevotion = {
		...abilities.falsedevotion, ...abilities.technician,
		id: 'truedevotion' as ID, name: 'True Devotion', num: 10379, rating: 5,
	};
	installRepeatableAbilities(abilities);
 installOrdinaryReductions(abilities);
 installRagingCrowns(abilities);
}

export const AuditCleanupComponents: {[id: string]: string[]} = {
	...RepeatableComponents,
 ...OrdinaryComponents,
	witheringshell: ['crumblingshell', 'raindish', 'stickyhold'], primevalhunt: ['skilllink', 'steadfast'], doublestrike: ['skilllink', 'technician'],
	webassassin: [], pendulumswing: ['insomnia'], caverndrake: ['eartheater', 'solidrock'],
	plushwhiplash: ['whiplash', 'technician'], resonanceforce: [], magneticbulwark: ['filter'],
	cactuschorus: ['waterabsorb', 'sandrush'], noblearmor: ['prismarmor'],
	nightmarepulse: ['pendulumswing', 'filter', 'cursedbody', 'baddreams'],
	gooey: [], marshhide: ['waterabsorb', 'poisonpoint'], triplethreat: ['hydrabond', 'keeneye', 'innerfocus', 'owntempo'], ragingcurrent: ['swiftswim', 'dryskin'],
	stormbell: ['mirrorarmor', 'drizzle', 'levitate'], astralengine: ['powerspot'], scarecrow: ['windrider', 'steelworker'],
	kickfiend: ['striker', 'limber'], cruelshell: ['shellarmor'], sweetresonance: ['hydrabond', 'selfsufficient'],
	falsedevotion: ['prankster', 'serenegrace'], truedevotion: ['prankster', 'serenegrace', 'technician'],
};

export const AuditCleanupDescriptions: {[id: string]: {shortDesc: string, desc: string}} = {
 marshhide: {shortDesc: 'Water Absorb + Poison Point.', desc: "Absorbs other Pokemon Water moves to heal 1/4 max HP. Has Water Absorb field healing: 1/16 on Underwater, grounded Water Surface and grounded Poison-type Murkwater. Contact attackers have a 30% poison chance, or 60% on Wasteland."},
	...RepeatableDescriptions,
 ...OrdinaryDescriptions,
 witheringshell: {shortDesc: 'Crumbling Shell + Rain Dish + Sticky Hold.', desc: "Physical HP hits set opposing Stealth Rock except on water fields. Heals 1/16 max HP in effective rain. Sticky Hold prevents other Pokemon from removing its item under the normal local rules."},
 relicinstinct: {shortDesc: 'Above half HP: ignores abilities. At half HP or less: defensive mode.', desc: "Above half HP, attacks ignore target abilities. At half HP or less, takes 25% less attack damage, cannot be critically hit, heals 1/16 maximum HP each turn, and halves Attack and Sp. Atk."},
	primevalhunt: { shortDesc: 'Skill Link + Steadfast.', desc: "Multi-hit moves use their maximum hit count, gain 1.5x power and check accuracy once. Flinching raises Speed by one stage but still prevents acting. Electric Terrain entry raises Speed by one stage. Ashen Beach accuracy checks succeed unless the target has Unnerve; Rocky Terrain adds no flinch damage." },
 doublestrike: {shortDesc: 'Skill Link; moves at 60 effective BP or less gain 1.5x power.', desc: "Local Skill Link multihit and accuracy handling. Moves at 60 effective base power or less gain 1.5x power; the threshold is 80 on Factory Field."},
	webassassin: {
		shortDesc: 'Double Speed; maximum critical-hit ratio against poisoned or slowed foes.',
		desc: 'Doubles Speed. Attacks have maximum critical-hit ratio against poisoned foes or foes with lowered Speed. Critical-hit damage uses the normal multiplier.',
	},
	pendulumswing: {
		shortDesc: 'Insomnia; its own moves cannot miss.',
		desc: 'Prevents and cures sleep, blocks Yawn, and gives Dark and Ghost attacks 1.3x power. Its own moves cannot miss.',
	},
	caverndrake: {
		shortDesc: 'Earth Eater + Solid Rock.',
		desc: 'Absorbs other Pokemon\'s Ground moves, healing 1/4 max HP instead of being hit. Heals 1/16 max HP each turn on Cave and Desert. Takes 20% less attack damage, or 40% less from super-effective attacks.',
	},
	plushwhiplash: {
		shortDesc: 'Whiplash + Technician.',
		desc: 'Entry raises accuracy by 1. Tail attacks gain 1.5x power. Technician checks effective power before the tail boost: moves with 60 or less power (80 on Factory) gain 1.5x power.',
	},
	resonanceforce: {
		shortDesc: 'Side sound moves gain 1.5x power; allies avoid allied damaging sound moves.',
		desc: 'Sound-based moves used by its side gain 1.5x power. Its side is protected from allied damaging sound-based moves. Each move uses its normal offensive stat.',
	},
	magneticbulwark: {
		shortDesc: 'Takes 20% less attack damage, or 40% less if super effective.',
		desc: 'Full local Filter: takes 20% less attack damage, or 40% less from super-effective attacks.',
	},
	cactuschorus: {
		shortDesc: 'Water Absorb + Sand Rush.',
		desc: "Absorbs Water moves for 1/4 max HP and has Water Absorb's field healing. Doubles Speed in sandstorm, Desert and Ashen Beach; prevents sandstorm damage.",
	},
	noblearmor: {
		shortDesc: 'Reduces damage; boosts defenses on certain fields; recovers in cold conditions.',
		desc: 'Takes 20% less attack damage, or 40% less against super-effective attacks or on Crystal Cavern and Dark Crystal Cavern. Defense and Sp. Def are 4/3x on Cold Eclipse, Dark Crystal Cavern and Rainbow. Heals 1/16 max HP each turn in hail or snow, or on Icy, Snowy Mountain and Cold Eclipse without those weathers; hail on Cold Eclipse heals 1/8 instead. Immune to hail damage.',
	},
	falsedevotion: {
		shortDesc: 'Prankster + Serene Grace: priority status; capped secondary boosts; skips charge turns.',
		desc: "Full local Prankster and Serene Grace. Status moves gain +1 priority with Prankster targeting rules and its Bewitched Woods exception. Doubles move secondary-effect chances up to 100%. Repeated Serene Grace applications do not multiply the same effect again.",
	},
	truedevotion: {
		shortDesc: 'Prankster + Serene Grace + Technician.',
		desc: "Full local Prankster, Serene Grace and Technician. Status moves gain +1 priority with Prankster targeting rules and its Bewitched Woods exception. Doubles move secondary-effect chances up to 100%. Repeated Serene Grace applications do not multiply the same effect again. Moves with 60 or less effective base power (80 on Factory) gain Technician's 1.5x power boost, retaining its multi-hit interactions.",
	},
	gooey: {
		shortDesc: 'After an opposing damaging move hits, lowers its user\'s Speed by 2.',
		desc: "After an opposing damaging move hits, lowers the attacker's Speed by 2 stages, once per move. On Murkwater Surface the drop is 4 stages.",
	},
	triplethreat: {
		shortDesc: 'Hydra Bond; Keen Eye, Inner Focus and Own Tempo.',
		desc: "Prevents flinching, confusion and Intimidate Attack drops; cures confusion. Full local Hydra Bond and Keen Eye: eligible attacks gain Hydra Bond's extra hits and format/field behavior. Prevents opposing accuracy drops, ignores evasion boosts, reveals opposing Illusions on activation, and gains accuracy and Laser Focus on Mirror Arena entry.",
	},
	ragingcurrent: {
		shortDesc: 'Swift Swim and Dry Skin.',
		desc: 'Doubles Speed in rain or on Water Surface, Murkwater Surface, Underwater and Midnight Zone. Absorbs Water moves for 1/4 max HP; incoming Fire moves have 1.25x power. Effective rain heals 1/8 HP per turn; sun costs 1/8. Field healing per turn: 1/16 on Underwater, Swamp, Misty or grounded Water Surface; 1/8 when grounded and Poison-type on Murkwater. Corrosive Mist heals Poison types by 1/8 but damages non-Steel others by 1/8. Desert costs 1/8 HP per turn. Proficient is Mega Swampert\'s separate species passive.',
	},
	stormbell: {
		shortDesc: 'Drizzle and Levitate.',
		desc: "Sets rain with full local Drizzle and grants Levitate's Ground immunity.",
	},
	astralengine: {
		shortDesc: "Power Spot.",
		desc: "Allies' moves have 1.3x power, or 1.5x on Haunted, Bewitched Woods, Holy and Psychic fields.",
	},
	scarecrow: {
		shortDesc: 'Wind Rider and Steelworker.',
		desc: 'Absorbs wind moves for +1 Attack. Gains +1 Attack when Tailwind starts on its side or it enters during Tailwind. Strong Winds gives +1 Attack and Sp. Atk each turn. Steel moves receive STAB and use 1.5x Attack or Sp. Atk (2x on Factory). On Short-Circuit, Steel moves also gain Electric typing. Adds Steel resistances and Poison immunity without Steel weaknesses.',
	},
	kickfiend: {
		shortDesc: 'Striker and Limber.',
		desc: "Full local Striker and Limber, including field behavior.",
	},
	cruelshell: {
		shortDesc: 'Prevents critical hits; takes 20% less attack damage. Field effects vary.',
		desc: "Full local Shell Armor: prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale or Dragon's Den entry and +2 Sp. Def when a foe lowers its stats.",
	},
	sweetresonance: {
		shortDesc: 'Hydra Bond; lowers adjacent foes\' evasion on entry. Field effects vary.',
		desc: "Full local Hydra Bond. On entry, lowers adjacent foes' evasion by 1 unless protected by Substitute. The entry effect has its Flower Garden and Misty field extensions.",
	},
	coldopen: {
		shortDesc: 'First successful damaging move each entry ignores boosted defenses and screens.',
		desc: 'Its first successful damaging move each genuine entry ignores positive defensive stat stages and screens. All hits of that move benefit. Misses and Protect preserve the effect; it does not bypass Substitute. Ability changes or restarts do not refresh the spent entry budget.',
	},
	purifyingfrost: {
		shortDesc: 'Cures the active team on entry; first successful Ice move sets Safeguard.',
		desc: 'On activation, cures status conditions from it and its active allies. Once per genuine switch-in, after its first Ice-type move successfully affects a target, it sets Safeguard on its side for 5 turns. Misses, protection, immunity and failed moves do not trigger or spend it. Ability changes or restarts do not refresh the spent entry budget.',
	},
};

AuditCleanupDescriptions.primevalhunger = {"shortDesc":"Accumulation; draining hits and new seeds lower one positive offensive stage.","desc":"Incoming Fire and Ice attacks use half the attacker's offensive stat. Immune to sandstorm and hail damage. It can use Belch without eating a Berry and automatically gains one Stockpile every second eligible active turn, first gaining one after two eligible turns. Genuine switching resets this wait; ability restarts do not. Suppressed or otherwise ineligible turns do not advance the counter. Manual Stockpile is unchanged. After reaching 3 Stockpiles, it waits one full turn before randomly choosing Belch or Spit Up with equal odds, then can release every other turn. Its established Spit Up and Swallow combinations still apply. Draining attacks that damage a foe's HP and successful new Leech Seed applications by Leech Seed or Sappy Seed mark affected foes. Failed, or reflected seeds and residual seed ticks do not trigger this effect. After the whole move, lower one positive Attack or Sp. Atk stage of each affected foe, choosing the more boosted stat and Sp. Atk on ties. Never lowers an unboosted stat or grants the user a boost. Substitute-only damage does not trigger these effects; normal stat-drop protections apply."};

export const AuditCleanupRemovals: {[id: string]: string[]} = {
	primevalhunt: ['owntempo'],
	...RepeatableRemovals,
 ...OrdinaryRemovals,
 witheringshell: ['sturdy', 'naturalrecovery', 'naturalcure', 'regenerator'], doublestrike: ['ironfist'],
 webassassin: ['sniper'], pendulumswing: ['filter', 'noguard'], caverndrake: ['moldbreaker'],
 plushwhiplash: ['fluffy'], noblearmor: ['icebody'],
 falsedevotion: ['naturalrecovery', 'naturalcure', 'regenerator'], truedevotion: ['falsedevotion', 'naturalrecovery', 'naturalcure', 'regenerator'],
 gooey: ['hydration', 'sapsipper'], triplethreat: ['tangledfeet', 'bigpecks', 'limber'], ragingcurrent: ['stamina'],
 stormbell: ['elevate'], astralengine: ['elevate', 'analytic', 'levitate'], scarecrow: ['stakeout'],
 kickfiend: ['violentrush'], cruelshell: ['angershell'], sweetresonance: ['supersweetsyrup', 'stickyhold'],
};

Object.assign(AuditCleanupComponents, RagingCrownComponents);
Object.assign(AuditCleanupRemovals, RagingCrownRemovals);
Object.assign(AuditCleanupDescriptions, RagingCrownDescriptions);
