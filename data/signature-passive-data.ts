/** Exact signature migrations approved independently of family and cosmetic propagation. */
export const SignaturePassiveSelections: { [id: string]: string } = {
	slowkinggalar: 'eldritchremedy', mrmime: 'mimecraft', raichu: 'chargedtail', fearow: 'lancepoint',
	kingler: 'titanpincer', cloyster: 'pearlcurrent', garganacl: 'saltbastion',
	vikavolt: 'rechargerelay', jellicent: 'undertow', jellicentazzy: 'undertow', pinsir: 'lockinggrip',
	hariyama: 'palmmastery', drednaw: 'lockjaw', seismitoad: 'mirechorus',
};
/** Only full primitive components actually retained by these seven signatures. */
export const SignaturePassiveComponents: { [id: string]: readonly string[] } = {
	cactuschorus: ['waterabsorb', 'sandrush'],
	naturalrecovery: ['naturalcure', 'regenerator'],
	noseformation: ['elevate'],
	unbridledwrath: ['sheerforce', 'innerfocus'],
	eldritchremedy: ['owntempo', 'curiousmedicine'], pearlcurrent: ['waterabsorb'], saltbastion: ['sturdy'],
	mirechorus: ['liquidvoice'],
};

/** Custom-only passive versions; copied selected packages elsewhere retain their original components. */
export const SignaturePassiveCallbacks: { [id: string]: readonly string[] } = {
	rechargerelay: ['onBeforeSwitchOut', 'onSwitchOut'], undertow: ['onSourceDamagingHit'],
	lockinggrip: ['onSourceDamagingHit', 'onSourceAfterSubDamage'], palmmastery: ['onModifyMove'],
	lockjaw: ['onSourceDamagingHit'],
	mirechorus: ['onModifyType', 'onBasePower', 'onSourceDamagingHit'],
};
export const SignaturePassiveRemovedComponents: { [id: string]: readonly string[] } = {
	rechargerelay: ['battery'], undertow: ['waterabsorb'], lockinggrip: ['hypercutter'],
	palmmastery: ['thickfat'], lockjaw: ['strongjaw'], mirechorus: ['poisontouch'],
};
export const SignaturePassiveDescriptions: { [id: string]: { shortDesc: string, desc: string } } = {
	rechargerelay: { shortDesc: 'Volt Switch heals the incoming teammate by 1/8 max HP.',
		desc: 'Switching with Volt Switch heals the incoming teammate by 1/8 of its base maximum HP. This passive does not include Battery.' },
	undertow: { shortDesc: 'Water attacks dealing HP damage ground surviving foes.',
		desc: 'Water attacks that deal HP damage ground surviving foes as with Smack Down. Does not trap foes or bypass protection, Substitute or Water immunity. This passive does not include Water Absorb.' },
	lockinggrip: { shortDesc: 'First damaging Bug attack per entry can Torment; Substitute spends the use.',
		desc: 'Once per entry, its first damaging Bug attack against a foe applies Torment after HP damage if the foe survives. Substitute damage spends the use without tormenting its holder, including before later hits. Misses, protection and immunity preserve the use. Ability replacement does not reset it; switching does. This passive does not include Hyper Cutter.' },
	palmmastery: { shortDesc: 'Force Palm always paralyzes when it lands, subject to immunity.',
		desc: 'Force Palm paralysis is a primary move effect rather than a secondary roll. It always paralyzes when it lands, subject to status immunity and existing status. This passive does not include Thick Fat.' },
	lockjaw: { shortDesc: 'Biting HP hits Torment surviving foes for 2 turns.',
		desc: 'Biting attacks that deal HP damage apply Torment to surviving foes for 2 turns. Does not prevent switching or bypass Substitute. This passive does not include Strong Jaw.' },
	mirechorus: { shortDesc: 'Sound becomes Water (Ice on Icy), 1.2x power; noncontact sound can poison.',
		desc: 'Sound moves become Water-type, or Ice-type on Icy Field, and have 1.2x power. Each foe damaged by a noncontact sound hit has a 20% poison chance. Shield Dust and Covert Cloak prevent this added poison. This passive does not include contact Poison Touch.' },
};

SignaturePassiveComponents.bonewarrior = ['battlearmor'];

SignaturePassiveComponents.polarrest = ['earlybird', 'icebody'];
SignaturePassiveComponents.glacierbreaker = ['moldbreaker'];

SignaturePassiveComponents.beguilingbouquet = ['aromaveil'];

SignaturePassiveComponents.guidinggallop = ['pastelveil'];

SignaturePassiveComponents.racingspirit = ['rockhead','limber'];

SignaturePassiveComponents.tirelessmuscle = ['innerfocus'];

SignaturePassiveComponents.rimeboundspirit = ['heatproof'];

SignaturePassiveComponents.hydraflight=['levitate','hydrabond'];

SignaturePassiveComponents.absolutepressure=['pressure','innerfocus','insomnia','moldbreaker'];

SignaturePassiveComponents.springpressure=['static','pressure'];
SignaturePassiveComponents.summerpressure=['flamebody','pressure'];
SignaturePassiveComponents.winterpressure=['icebody','pressure'];

import {PassiveShortDescriptionAudit} from './short-description-audit';
for(const[id,shortDesc]of Object.entries(PassiveShortDescriptionAudit))SignaturePassiveDescriptions[id]={...SignaturePassiveDescriptions[id],shortDesc};

SignaturePassiveDescriptions.tempestfury = {shortDesc: 'Once per battle: survive a foe hit to charge a Water critical hit.', desc: 'Once per battle, surviving opposing direct HP damage charges the next damaging Water move to critically hit, subject to normal critical-hit prevention. Opposing HP or Substitute damage spends the charge; misses, protection and immunity preserve it. The charge and spent acquisition persist through switching and form changes. Selected Tempest Fury, when supplied separately, remains repeatable; its charge is separate and does not transfer into this passive.'};

SignaturePassiveComponents.serratedscales = ['roughskin', 'limber'];
SignaturePassiveDescriptions.serratedscales = { "shortDesc": "Rough Skin + Limber.", "desc": "Contact attackers lose 1/8 base max HP per triggering hit; Thorn Tempered users are exempt. Prevents and cures paralysis. Other Pokemon and field effects cannot lower its Speed; self-inflicted costs and item slowdowns still apply. Trick Room and removal of Speed boosts or Tailwind still work. Limber retains its normal ability-bypass rules; Rough Skin retaliation is not bypassed." };

SignaturePassiveComponents.controlledfury = ['angerpoint'];
SignaturePassiveDescriptions.controlledfury = {"shortDesc":"Anger Point; no rampage lock or ending confusion.","desc":"Full local Anger Point: the first damaging hit after entry raises Attack by 1 stage; surviving a critical hit raises Attack to maximum. Outrage, Thrash, Petal Dance and Raging Fury do not lock the user in or cause ending confusion, including repeated manual uses. Acquiring this effect during a rampage clears only that rampage lock without confusion. Existing confusion, Choice locks, Encore and move field effects remain unchanged."};

SignaturePassiveComponents.tempestfury = ['angerpoint'];
SignaturePassiveDescriptions.tempestfury.shortDesc += ' Anger Point.';
SignaturePassiveDescriptions.tempestfury.desc += ' Includes full local Anger Point: the first damaging hit after activation raises Attack by 1, and a surviving critical hit maximizes Attack at the normal +6 cap.';
