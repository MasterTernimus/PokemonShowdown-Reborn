/** Field-specific effects checked against resolved callbacks and their shared delegates. */
export const CheckedFieldReferences: { [field: string]: { [kind: string]: { [id: string]: string[] } } } = {
	icyterrain: {
		abilities: {
			perfectforesight: ['When choosing an opposing ability to copy on entry, Slush Rush counts as an active Speed ability on Icy Terrain, even without hail or snow. Active Speed abilities take preference; ties compare the foe’s higher Attack or Special Attack. Trace, Perfect Foresight and Void Voice are excluded.'],
			rimeknuckle: ['Damaging moves gain a 40% frostbite secondary here instead of 20%. This applies to damaging moves generally, not just punches or contact moves. Normal secondary-effect and status protections apply.'],
			mindfreeze: ['Retains Ice Body healing: restores 1/16 base maximum HP each turn on Icy Terrain without hail or snow; during those weathers, the weather-healing path supplies that 1/16 instead. Its separate Ice immunity heals 1/4 maximum HP when another Pokémon’s Ice attack hits it.'],
			relicarmor: ['Lapras-Aevian gains Ice typing here. Icy Terrain does not activate Relic Armor’s Rock-weakness protection or its field-entry defensive boosts. Its ordinary 10% damage reduction, 1/16 recovery, hail/sand immunity and response to opposing stat drops remain.'],
			forecast: ['The current resolved Forecast has no Icy-only form trigger. Castform follows effective weather: hail or snow gives Snowy form. Icy Terrain alone does not supply form-specific ability bonuses; copied/transformed Pokémon do not change form.'],
			icebody: ['Heals 1/16 base maximum HP each turn on this field without hail or snow. During hail or snow it heals the same amount through its weather callback instead, not both. Retains hail immunity and the usual 30% contact-attacker frostbite chance.'],
			icescales: ['Super-effective attacks against the holder’s Ice typing become neutral for that defensive type; the other defensive type still contributes. Retains half damage from special attacks and hail immunity. This does not grant blanket immunity to super-effective attacks.'],
			liquidvoice: ['Sound moves become Ice instead of Water on Icy Terrain and receive Liquid Voice’s 1.2× power modifier. The field’s Ice power bonus can then also apply.'],
			mimicry: ['Changes the holder to Ice when it activates or the field changes. An active aura overrides this type selection. Terastallized holders do not change type; this field does not grant Cold Eclipse’s extra defensive stages.'],
			refrigerate: ['Eligible Normal moves become Ice and receive a 1.5× ability multiplier here instead of 1.2×. The field’s Ice bonus is separate. Excludes Judgment, Multi-Attack, Natural Gift, Revelation Dance, Techno Blast, Terrain Pulse and Weather Ball unless the Max-move exception applies; damaging Z-Moves and Terastallized Tera Blast are also excluded.'],
			slushrush: ['Doubles Speed here even without hail or snow. It also exempts its holder from the field’s grounded Speed penalty.'],
			snowcloak: ['Multiplies eligible incoming move accuracy by approximately 0.8 here even without hail or snow. It also exempts its holder from the field’s grounded Speed penalty.'],
			sinisterblaze: ['Adds Ice typing on Icy Terrain when Sinister Blaze is the active ability, except for Abysseon and Divineon. Icy is not in its defensive-entry-boost field list. Its ordinary burn-healing, opposing chip and weather immunity remain.'],
			zenmode: ['Eligible non-transformed Galarian Darmanitan enters Galar-Zen regardless of HP on entry, field change and residual checks. Leaving an applicable forced-Zen field allows its ordinary HP/form rules to resume.'],
			amethystglow: ['Adds Ice typing here; restores 1/16 HP through Ice Body’s weather-or-field healing path, not both. Eligible Normal moves become Ice with Refrigerate’s 1.5× multiplier here. Retains its never-miss effect, hail immunity and 30% contact-attacker frostbite chance.'],
		},
		moves: {
			auroraveil: ['Can be used on Icy Terrain even without hail or snow. Protects the user’s side for five turns, or eight with Light Clay. Its usual critical-hit, screen-stacking and screen-removal rules still apply.'],
			camouflage: ['Changes the user to Ice, unless an active aura supplies its own type. Usual type-change restrictions apply.'],
			coldsnap: ['Has 100 accuracy here. A Ghost-type user instead bypasses the accuracy check. The move attempts frostbite; immunity and status protections still apply.'],
			freezeshock: ['Skips its charging turn here. Its ordinary paralysis secondary remains; this does not make the move always hit.'],
			iceburn: ['Skips its charging turn here. Its ordinary burn secondary remains; this does not make the move always hit.'],
			mountaingale: ['Has 100 accuracy here instead of its ordinary accuracy. Its 30% flinch secondary remains.'],
			naturepower: ['Calls Ice Beam here. Frozen Aura overrides it with that aura’s Nature Power move.'],
			secretpower: ['Takes Ice Shard’s type, power, accuracy and priority, with a 30% frostbite secondary. Ordinary secondary-effect and status protections apply.'],
			snipeshot: ['Adds Ice typing to its Water attack here. It retains its ordinary category choice, critical-hit bonus and redirection protection.'],
			terrainpulse: ['Becomes Ice unless an aura supplies the type. Icy Terrain does not itself trigger Terrain Pulse’s separate doubled-base-power rule; the ordinary field Ice bonus still applies.'],
			tripledive: ['If the move starts on Icy Terrain, hit one preserves Icy, hit two changes it to Water Surface, and hit three changes it to Underwater. Each hit must pass its protection, accuracy and immunity checks; Substitute hits count. Field locks still apply, and changes of existing Icy/water fields preserve duration.'],
		},
		items: {
			elementalseed: ['Consumed on activation here: raises Speed by two stages, then applies icy-spikes damage to its grounded holder unless protected by Magic Guard. Damage is 1/8 maximum HP with zero or one Spikes layer, 1/6 with two, or 1/4 with three. This icy-spikes check does not exempt Heavy-Duty Boots.'],
		},
	},
};
