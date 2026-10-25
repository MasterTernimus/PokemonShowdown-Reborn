import { SelectedAbilityDescriptions } from './selected-mega-simplification-data';

const updraft = "Full Updraft: Full Competitive: opposing stat drops raise Special Attack by 2 outside Chessboard; on Chessboard, instead boosts damage with missing HP up to 2x at 20% HP. Flying moves ignore evasion boosts. Once per switch-in, the first Flying attack dealing opposing HP damage raises the living adjacent ally with the lowest HP percentage by 1 Speed stage, or the holder if no such ally exists. Only one recipient is boosted; ability restarts and Mega Evolution do not reset the entry allowance.";
export const SovereignDescriptions: { [id: string]: { shortDesc: string, desc: string } } = {
	updraft: {shortDesc: "Competitive; Flying ignores evasion; one ally Speed boost per entry.", desc: updraft},
	sunsovereign: {
		shortDesc: 'Drought, eight-turn sun, Unbound Blaze and Intimidate.',
		desc: SelectedAbilityDescriptions.sunsovereign.desc +
			' Full local Intimidate lowers adjacent foes\' Attack by 1 on entry, respecting Substitute and normal Intimidate protections. No Infernal Dominion trapping effect is included. Proficient remains a separate species passive.',
	},
	stormsovereign: {
		shortDesc: 'Updraft (Competitive), eight-turn Strong Winds and opposing Flying chip.',
		desc: 'Summons replaceable Strong Winds for 8 turns on entry. Each turn, non-immune foes take Flying damage equal to 1/16 base maximum HP; type effectiveness scales this chip only in Free-for-All. Flying-type foes are immune. ' + updraft + ' Mega Pidgeot receives No Guard from its species passive and has no Gale Wings priority. Other holders retain their existing full-HP Flying priority and never-miss effect when no No Guard passive is present. Keen Eye is removed.',
	},
	sandsovereign: {
		shortDesc: 'Solid Rock; better Rock/Ground matchup; eight-turn sand and Rock chip.',
		desc: "Sets or refreshes Sandstorm to 8 turns on entry, with native Sand Stream supplied separately by the species passive. Full local Solid Rock. Its retained matchup effect keeps damaging Rock moves Rock-type with normal Rock STAB, but uses the better overall Rock or Ground type-chart matchup; Ground-immune typings do not replace the Rock matchup. Manually used Arenite Wall lasts 8 turns. Each turn, non-immune foes take Rock damage equal to 1/16 max HP; type effectiveness scales this chip only in Free-for-All.",
	},
	frostsovereign: {
		shortDesc: 'Ice Body + Filter + Soundproof; eight-turn snow and Ice chip.',
		desc: "Sets or refreshes Snow Warning weather to 8 turns on entry; native Snow Warning is supplied separately by the species passive, retaining its Cold Eclipse behavior. Full local Ice Body and Filter, and gains full Soundproof immunity to other Pokemon's sound moves. Manually used Aurora Veil lasts 8 turns. Each turn, non-immune foes take Ice damage equal to 1/16 max HP; type effectiveness scales this chip only in Free-for-All.",
	},
};
export const NativeStormDescription = {
	passive: 'noguard', shortDesc: 'Updraft (Competitive), eight-turn Strong Winds and opposing Flying chip.',
	desc: 'Summons replaceable Strong Winds for 8 turns on entry. Each turn, non-immune foes take Flying damage equal to 1/16 base maximum HP; type effectiveness scales this chip only in Free-for-All. Flying-type foes are immune. ' + updraft + ' No Guard is supplied separately by the species passive. No Keen Eye or Gale Wings.',
};
