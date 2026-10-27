import type {AbilityDataTable} from '../sim/dex-abilities';

export const WeatherChoiceDescriptions = {
	mountainhide: {
		name: 'Mountain Hide', shortDesc: 'Full Solid Rock + Inner Focus.',
		desc: "Full local Solid Rock and Inner Focus: takes 20% less attack damage, or 40% less from super-effective attacks, and prevents flinching and Intimidate Attack drops.",
	},
	rimebark: {
		name: 'Rimebark', shortDesc: 'Full Thick Fat + Ice Body.',
		desc: "Full local Thick Fat and Ice Body: incoming Fire and Ice attacks use half the attacker's offensive stat; immune to hail damage. Contact attackers have a 30% frostbite chance. Heals 1/16 max HP in hail/snow or qualifying cold fields, and 1/8 in hail on Cold Eclipse.",
	},
};

export function installWeatherChoices(abilities: AbilityDataTable) {
	abilities.mountainhide = {...abilities.solidrock, ...abilities.innerfocus, name: 'Mountain Hide', num: 11497, rating: 4};
	// Both components share only hail immunity; Ice Body preserves that identical immunity.
	abilities.rimebark = {...abilities.thickfat, ...abilities.icebody, name: 'Rimebark', num: 11498, rating: 4};
}

export const SoulCremationBypassDescription = ' Mega Chandelure with active Soul Cremation bypasses Soul Fire\'s Fire/Ghost attack absorption only. Ordinary type effectiveness and type immunities remain; this grants neither general Mold Breaker nor a damage multiplier. Will-O-Wisp and Soul Fire redirection are unchanged.';
