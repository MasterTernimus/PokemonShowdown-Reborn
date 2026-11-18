import type { AbilityData, AbilityDataTable } from '../sim/dex-abilities';
import type { SpeciesData } from '../sim/dex-species';

export const skySlots: Record<string, SpeciesData['abilities']> = {
	kyogre: { 0: 'Rain Dish', 1: 'Water Veil', H: 'Trench Current' },
	kyogreprimal: { 0: 'Abyssal Deluge' },
	groudon: { 0: 'Battle Armor', 1: 'White Smoke', H: 'Mantle Fracture' },
	groudonprimal: { 0: 'Continental Rupture' },
	rayquaza: { 0: 'Inner Focus', 1: 'Unnerve', H: 'Jetstream' },
	rayquazamega: { 0: 'Stratospheric Force' },
	latias: { 0: 'Synchronize', 1: 'Healer', H: 'Mistwing Veil' },
	latiasmega: { 0: 'Eon Sanctuary' },
	latios: { 0: 'Inner Focus', 1: 'Competitive', H: 'Mistwing Lance' },
	latiosmega: { 0: 'Eon Onslaught' },
};

const realms = {
	sea: { type: 'Water', otherType: 'Ice', signature: 'originpulse', moveName: 'Origin Pulse',
		firstHit: 'The first Water attack each entry to damage a foe heals the user and its adjacent allies by 1/8 of their own max HP.' },
	land: { type: 'Ground', otherType: 'Fire', signature: 'precipiceblades', moveName: 'Precipice Blades',
		firstHit: 'The first Ground attack each entry to damage a foe raises Defense by 1 for the user and its adjacent allies.' },
	sky: { type: 'Flying', otherType: 'Dragon', signature: 'dragonascent', moveName: 'Dragon Ascent',
		firstHit: 'Once per entry, a Flying attack that damages a foe with raised Attack or Sp. Atk clears its positive stages in both stats.' },
};

function realmAbility(name: string, num: number, realm: keyof typeof realms, awakened = false): AbilityData {
	const { type, otherType, signature, moveName, firstHit } = realms[realm];
	const powerText = `${type} and ${otherType} attacks gain 1.2x power. ${moveName} ignores positive defensive stages.`;
	const entryKey = realm + 'BlessingEntry';
	const ability: AbilityData = {
		name, num, rating: awakened ? 5 : 3, flags: {},
		desc: awakened ? firstHit + ' ' + powerText : firstHit,
		shortDesc: {
			sea: 'First damaging Water hit each entry heals the user and adjacent allies by 1/8 HP.',
			land: 'First damaging Ground hit each entry gives the user and adjacent allies +1 Defense.',
			sky: 'Once per entry, damaging Flying hits erase a foe’s positive Atk and Sp. Atk stages.',
		}[realm],
		onSourceDamagingHit(damage, target, user, move) {
			if (!damage || !user.hp || user.isAlly(target) || !this.movehasType(move, type) ||
				user.m[entryKey] === user.previouslySwitchedIn) return;
			if (realm === 'sky' && (!target.hp || (target.boosts.atk <= 0 && target.boosts.spa <= 0))) return;
			user.m[entryKey] = user.previouslySwitchedIn;
			if (realm === 'sky') {
				for (const stat of ['atk', 'spa'] as const) {
					if (target.boosts[stat] <= 0) continue;
					target.setBoost({ [stat]: 0 });
					this.add('-setboost', target, stat, 0, '[from] ability: ' + name, `[of] ${user}`);
				}
			} else {
				for (const ally of [user, ...user.adjacentAllies()]) {
					if (!ally.hp) continue;
					if (realm === 'sea') this.heal(ally.baseMaxhp / 8, ally, user, this.effect);
					else this.boost({ def: 1 }, ally, user, this.effect);
				}
			}
		},
	};
	if (awakened) {
		const bonus = {
			sea: 'Opening Water hit heals the team.',
			land: 'First Ground hit: team +1 Def.',
			sky: 'Flying hit clears Atk/SpA boosts.',
		}[realm];
		ability.shortDesc = `${type}/${otherType}: 1.2x power. ${moveName} pierces defensive boosts. ${bonus}`;
		ability.onBasePower = function (bp, user, target, move) {
			if (this.movehasType(move, type) || this.movehasType(move, otherType)) return this.chainModify(1.2);
		};
		ability.onModifyMove = function (move) {
			if (move.id === signature) move.ignorePositiveDefensive = true;
		};
	}
	return ability;
}

const screens = ['reflect', 'lightscreen', 'auroraveil'];
function eonAbility(name: string, num: number, guardian: boolean, mega = false): AbilityData {
	const types = mega ? 'Psychic and Dragon' : 'Psychic';
	const screenEffect = guardian ?
		`Once per entry, damaging a foe with a ${mega ? 'Psychic or Dragon' : 'Psychic'} attack sets Light Screen for the user's side.` :
		`${types} attacks bypass screens. Once per entry, damaging a screened foe with one of these attacks removes Reflect, Light Screen and Aurora Veil on its side.`;
	const entryKey = guardian ? 'eonVeilEntry' : 'eonLanceEntry';
	const signature = guardian ? 'mistball' : 'lusterpurge';
	const stat = guardian ? 'spa' : 'spd';
	const signatureEffect = guardian ? " Mist Ball's chance to lower Sp. Atk becomes 100%." :
		" Luster Purge ignores positive defensive stages and its chance to lower Sp. Def becomes 100%.";
	return {
		name, num, rating: mega ? 4.5 : 3.5, flags: {},
		desc: screenEffect + (mega ? signatureEffect : ''),
		shortDesc: guardian ? (mega ?
			'Psychic/Dragon hit sets Light Screen once per entry. Mist Ball has a 100% Sp. Atk drop.' : screenEffect) :
		(mega ?
			'Psychic/Dragon pierce screens and break them once/entry. Luster Purge pierces boosts and drops SpD.' :
			'Psychic attacks bypass screens and break them once per entry.'),
		onModifyMove(move) {
			if (move.category === 'Status') return;
			if (!guardian && (this.movehasType(move, 'Psychic') || (mega && this.movehasType(move, 'Dragon')))) {
				move.ignoreScreens = true;
			}
			if (!mega || move.id !== signature) return;
			if (!guardian) move.ignorePositiveDefensive = true;
			// Preserve other secondary rolls and normal secondary-effect immunity.
			for (const effect of move.secondaries || []) {
				if (effect.boosts?.[stat] === -1) effect.chance = 100;
			}
		},
		onSourceDamagingHit(damage, target, user, move) {
			if (!damage || !user.hp || user.isAlly(target) || user.m[entryKey] === user.previouslySwitchedIn) return;
			if (!this.movehasType(move, 'Psychic') && !(mega && this.movehasType(move, 'Dragon'))) return;
			if (guardian) {
				if (!user.side.addSideCondition('lightscreen', user, this.effect)) return;
			} else {
				if (!screens.some(id => target.side.getSideCondition(id))) return;
				for (const id of screens) target.side.removeSideCondition(id);
			}
			user.m[entryKey] = user.previouslySwitchedIn;
		},
	};
}

export const skyAbilities: AbilityDataTable = {
	trenchcurrent: realmAbility('Trench Current', 32616, 'sea'),
	mantlefracture: realmAbility('Mantle Fracture', 32617, 'land'),
	jetstream: realmAbility('Jetstream', 32618, 'sky'),
	abyssaldeluge: realmAbility('Abyssal Deluge', 32619, 'sea', true),
	continentalrupture: realmAbility('Continental Rupture', 32620, 'land', true),
	stratosphericforce: realmAbility('Stratospheric Force', 32621, 'sky', true),
	mistwingveil: eonAbility('Mistwing Veil', 32612, true),
	mistwinglance: eonAbility('Mistwing Lance', 32613, false),
	eonsanctuary: eonAbility('Eon Sanctuary', 32614, true, true),
	eononslaught: eonAbility('Eon Onslaught', 32615, false, true),
};
