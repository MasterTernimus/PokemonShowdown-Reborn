import { SelectedAbilityDescriptions } from './selected-mega-simplification-data';

const updraft = "Full Updraft: Full Competitive: opposing stat drops raise Special Attack by 2 outside Chessboard; on Chessboard, instead boosts damage with missing HP up to 2x at 20% HP. Flying moves ignore evasion boosts. Once per switch-in, the first Flying attack dealing opposing HP damage raises the living adjacent ally with the lowest HP percentage by 1 Speed stage, or the holder if no such ally exists. Only one recipient is boosted; ability restarts and Mega Evolution do not reset the entry allowance.";
export const SovereignDescriptions: { [id: string]: { shortDesc: string, desc: string } } = {
	updraft: {shortDesc: "Competitive; Flying ignores evasion; one ally Speed boost per entry.", desc: updraft},
	sunsovereign: {
		shortDesc: "Eight-turn sun + Blazing Monarch; all moves have 1.1x accuracy.",
		desc: SelectedAbilityDescriptions.sunsovereign.desc +
			"Full local Intimidate lowers adjacent foes' Attack by 1 on entry, respecting Substitute and normal Intimidate protections.",
	},
	stormsovereign: {
		shortDesc: 'Updraft (Competitive); eight-turn Strong Winds; Flying attacks bypass Substitute.',
		desc: 'Summons replaceable Strong Winds for 8 turns on entry. Damaging Flying moves bypass Substitute. ' + updraft + "Mega Pidgeot receives No Guard from its species passive and has no Gale Wings priority. Other holders retain their existing full-HP Flying priority and never-miss effect when no No Guard passive is present.",
	},
	sandsovereign: {
		shortDesc: "Solid Rock; eight-turn sand; Rock/Ground matchup; Rock/Dark hits break screens.",
		desc: "Sets or refreshes Sandstorm for 8 turns. Includes Solid Rock. Damaging Rock moves use the better Rock or Ground type-chart matchup while remaining Rock-type; Ground-immune typings do not replace the Rock matchup. Manually used Arenite Wall lasts 8 turns. After a Rock or Dark attack damages opposing HP, removes Reflect and Light Screen from that side.",
	},
	frostsovereign: {
		shortDesc: "Ice Body + Filter + Soundproof; eight-turn hail; first Ice attack lowers foe Speed.",
		desc: "Sets Hail for 8 turns on entry. Includes Ice Body, Filter and Soundproof. Manually used Aurora Veil lasts 8 turns. Once per switch-in, its first Ice attack to damage opposing HP lowers each damaged foe's Speed by 1 stage, once per target. Normal stat-drop protections apply.",
	},
};
export const NativeStormDescription = {
	passive: 'noguard', shortDesc: 'Updraft (Competitive); eight-turn Strong Winds; Flying attacks bypass Substitute.',
	desc: 'Summons replaceable Strong Winds for 8 turns on entry. Damaging Flying moves bypass Substitute. ' + updraft + "",
};
