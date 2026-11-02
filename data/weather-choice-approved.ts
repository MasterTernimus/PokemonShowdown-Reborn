import type {AbilityDataTable} from '../sim/dex-abilities';

export const WeatherChoiceDescriptions = {
	mountainhide: {
		name: 'Mountain Hide', shortDesc: 'Inner Focus; takes 25% less physical damage in sand.',
		desc: "Prevents flinching and Intimidate. In effective sand, physical attacks deal 25% less damage.",
	},
	rimebark: {
		name: 'Rimebark', shortDesc: 'Full Thick Fat + Ice Body.',
		desc: "Full local Thick Fat and Ice Body: incoming Fire and Ice attacks use half the attacker's offensive stat; immune to hail damage. Contact attackers have a 30% frostbite chance. Heals 1/16 max HP in hail/snow or qualifying cold fields, and 1/8 in hail on Cold Eclipse.",
	},
};

export function installWeatherChoices(abilities: AbilityDataTable) {
	abilities.mountainhide = {
  ...abilities.innerfocus, name: 'Mountain Hide', num: 11497, rating: 4,
  onSourceModifyDamage(damage, source, target, move) {
   if (move.category === 'Physical' && target.effectiveWeather() === 'sandstorm') return this.chainModify(0.75);
  },
 };
	// Both components share only hail immunity; Ice Body preserves that identical immunity.
	abilities.rimebark = {...abilities.thickfat, ...abilities.icebody, name: 'Rimebark', num: 11498, rating: 4};
}

export const SoulCremationBypassDescription = ' Mega Chandelure with active Soul Cremation bypasses Soul Fire\'s Fire/Ghost attack absorption only. Ordinary type effectiveness and type immunities remain; this grants neither general Mold Breaker nor a damage multiplier. Will-O-Wisp and Soul Fire redirection are unchanged.';
