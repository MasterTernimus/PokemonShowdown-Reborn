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

CheckedFieldReferences.coldeclipseterrain = {
  "abilities": {
    "perfectforesight": [
      "On entry, prioritizes a foe whose active Speed-related ability matches the present conditions, then the highest current Attack or Sp. Atk. The field checks count Sand Rush on Desert/Ashen Beach; Swift Swim on Water Surface/Underwater/Murkwater/Midnight Zone; Slush Rush on Icy/Snowy Mountain/Cold Eclipse; Surge Surfer on Water Surface/Underwater/Murkwater/Short-Circuit/Electric; Quick Feet on Electric; Telepathy on Psychic Field or its aura. Speed Boost is always prioritized. Chlorophyll is checked against effective sun, not its garden exception. It copies the chosen actual ability and runs its entry behavior; Trace, Perfect Foresight and Void Voice are excluded."
    ],
    "forecast": [
      "The current Forecast implementation selects Castform forms from effective weather, not this field alone. Copied/Transformed Pokémon do not change form. Climate Reserve can select its stored weather-rock form when effective weather is absent. Older field-only Forecast references in the source index are superseded; ordinary weather and Utility Umbrella rules still apply."
    ],
    "zenmode": [
      "Standard Darmanitan is forced into Zen on Ashen Beach or Psychic Field; Galarian Darmanitan is forced into Galar-Zen on Icy, Snowy Mountain or Cold Eclipse. These checks run on entry, field change and turn end, regardless of HP. Transformed Pokémon are excluded. Outside the matching fields, the usual half-HP form condition applies."
    ],
    "blaze": [
      "Burning and Volcanic activate Blaze’s 1.5× offensive-stat multiplier for Fire attacks at any HP. Cold Eclipse disables this multiplier even at low HP. Having Blaze as both active ability and species passive does not apply it twice."
    ],
    "flareboost": [
      "Fire attacks receive 1.5× power through the first branch on every field, including Cold Eclipse. On Burning or Volcanic, non-Fire special attacks also gain 1.5× without a burn. Cold Eclipse disables this second burned/special branch. The two branches return separately and do not stack with each other."
    ],
    "sinisterblaze": [
      "Cold Eclipse retains its Ice typing interaction, but no longer grants its entry Defense or Special Defense boosts."
    ],
    "powerdrill": [
      "Drill and horn moves receive 2× power and bypass Protect-style protection on Rocky, Mountain, Snowy Mountain, Cave and Volcanic, instead of the usual 1.5×. Cold Eclipse is not one of these five enhanced fields; its shared move-flag rules are documented separately. Dual Wield/Sharpness overlap uses the existing combined multiplier path, not an extra duplicate Power Drill bonus."
    ],
    "soulfire": [
      "Cold Eclipse no longer grants Soul Fire entry defenses. Its ordinary absorption and attack rules remain."
    ],
    "exalt": [
      "Cold Eclipse disables the 1.5× Sharpness bonus for slicing moves and the separate Steel Wing bonus. Its Mold Breaker, Defiant and flinch protection remain; this does not grant protection from Intimidate."
    ],
    "battlebond": [
      "Cold Eclipse multiplies damaging move power by 1.3×. This stacks with its independent 1.3× bonus against Royal Decree, Empress or Neutralization. Its KO transformation and recovery rules remain unchanged."
    ],
    "darkaura": [
      "On Cold Eclipse, the holder is immune to hail damage. The shared Dark-move power bonus remains 4/3×, or 0.75× under Aura Break; multiple Dark Aura users do not stack."
    ],
    "sacrededge": [
      "Cold Eclipse disables its Sharpness slicing-power bonus; the eligible two-hit behavior remains. On Fairy Tale, entry or Mega Evolution heals each adjacent living ally by 1/3 base max HP instead of 1/4, printing “[Pokémon] shared its mead with [ally]!” for each recipient."
    ],
    "defragment": [
      "Cold Eclipse no longer grants Defragment extra defensive stages; its ordinary defensive comparison still applies."
    ],
    "eternalflower": [
      "Fairy Tale and Cold Eclipse multiply both offensive stats by 2; New World, Starlight Arena and Bewitched Woods use 1.5× instead. Its separate 1.5× offensive-stat bonus for Grass attacks stacks with this. On fainting, it attempts to establish Bewitched Woods for five turns; a blocked field change does not set that duration."
    ],
    "windysurge": [
      "On Mountain, Snowy Mountain or Cold Eclipse entry, also attempts to summon strong winds, unless Desolate Land or Primordial Sea is active. Its two-turn Tailwind still applies. Refreshing an existing Tailwind attempts +1 Special Attack for Wind Power/Hisuian Vanguard allies and +1 Attack for Wind Rider/Unova Vanguard/Scarecrow allies."
    ],
    "flamebody": [
      "Cold Eclipse disables contact burns without granting entry defenses. Volcanic retains its 60% contact burn chance."
    ],
    "ancientbloom": [
      "Cold Eclipse grants 1.5x move power, without its former entry Defense and Special Defense boosts."
    ],
    "fullmetalbody": [
      "Cold Eclipse additionally prevents hail damage; its ordinary protection from other Pokémon lowering its stat stages remains."
    ],
    "galewings": [
      "During unsuppressed Strong Winds on any field, Gale Wings gives +1 priority to all moves at any HP. Otherwise, only Flying moves at 75% HP or higher receive the bonus."
    ],
    "icebody": [
      "Heals 1/16 base max HP each turn on Icy, Snowy Mountain and Cold Eclipse when hail/snow is not already supplying its weather recovery. Hail on Cold Eclipse heals 1/8 instead of 1/16. Hail immunity and the ordinary 30% contact frostbite chance remain."
    ],
    "iceface": [
      "Cold Eclipse allows the intact Ice Face to absorb special as well as physical move damage before breaking. Volcanic marks the face broken on entry, so the update changes intact Eiscue into Noice Face rather than granting a shield. Ordinary restoration when hail or snow begins still follows the weather callback; resuming suppressed weather does not trigger restoration."
    ],
    "icescales": [
      "Cold Eclipse and Infernal Eclipse double Defense once through Ice Scales. Its normal halving of special damage and hail immunity remain; type-based field bonuses stack separately."
    ],
    "armorize": [
      "Eligible Normal moves become Steel. The conversion bonus is 1.5× on Factory, Short-Circuit, Fairy Tale, Dragon’s Den, Starlight Arena, New World and Holy, instead of 1.2×. Cold Eclipse grants hail immunity but does not increase that conversion bonus. Variable-type moves retain their normal conversion exclusions."
    ],
    "argentdevotion": [
      "Its Armorize conversion gives 1.5× power on Factory, Short-Circuit, Fairy Tale, Dragon’s Den, Starlight Arena, New World and Holy, instead of 1.2×. Cold Eclipse grants hail immunity. On Fairy Tale entry, Sworn Duty heals each adjacent living ally by 1/3 base max HP instead of 1/4. Its other components remain active."
    ],
    "magmaarmor": [
      "Cold Eclipse permits new frostbite and does not grant entry defensive stages. Its ordinary existing-status cure and Water/Ice attack reduction remain."
    ],
    "megalauncher": [
      "Its pulse/bullet power bonus remains 1.5× on Cold Eclipse. That field disables the separate Sharpness slicing bonus; the shared Dual Wield scaling therefore does not apply a Sharpness multiplier there."
    ],
    "mindseye": [
      "Cold Eclipse retains 1.3x damaging-move power and 1/8 healing after a damaging hit. Its normal 20% incoming-damage reduction is no longer strengthened to 30%."
    ],
    "pressure": [
      "On entry into Underwater, attempts to change the field to Midnight Zone; targeting the holder there costs two extra PP instead of one. Cold Eclipse entry attempts -2 Defense and Special Defense against each foe, blocked by Substitute and ordinary stat-drop protections. These Cold Eclipse attempts repeat on entry and do not spend the ordinary once-per-opponent-per-user battle allowance."
    ],
    "shadowshield": [
      "Cold Eclipse adds immunity to hail damage. Its ordinary 20% attack-damage reduction and further 25% reduction of super-effective attacks remain; these do not depend on full HP."
    ],
    "sharpness": [
      "Cold Eclipse disables its 1.5× slicing-move power bonus, including its contribution to Dual Wield scaling."
    ],
    "slushrush": [
      "Speed is doubled on Icy, Snowy Mountain and Cold Eclipse even without hail or snow. Having both the weather and field does not double it a second time."
    ],
    "snowwarning": [
      "On Cold Eclipse, being hit by a damaging move attempts to Disable the attacker’s move. It does not retrigger against an already Disabled attacker, Max moves, delayed attacks or Struggle. Entry summons the project’s hail weather."
    ],
    "solarpower": [
      "Cold Eclipse disables both Solar Power’s 1.5× Attack/Special Attack in effective sun and its 1/8 base max HP end-of-turn sun damage."
    ],
    "wrathshield": [
      "Cold Eclipse no longer grants its extra Special Defense stage on entry. Ordinary Stamina still applies."
    ],
    "technician": [
      "Cold Eclipse leaves the normal effective-power threshold at 60 and its 1.5× bonus intact. It disables a separate Sharpness bonus in the shared Dual Wield calculation. Factory alone raises Technician’s threshold to 80."
    ],
    "turboblaze": [
      "Cold Eclipse no longer multiplies Defense or Special Defense; incoming Ice attacks still use half the attacking stat. Its ordinary ability bypass remains."
    ],
    "unnerve": [
      "On Cold Eclipse entry, attempts to lower each foe’s Speed by one stage. Substitute blocks the attempt; ordinary stat-drop protections apply. Its berry restriction remains."
    ],
    "amethystglow": [
      "Its Ice Body component supplies field healing and hail immunity. Refrigerate gains a 1.5x conversion bonus on Cold Eclipse. Its added Ice typing and ordinary accuracy/contact effects remain."
    ],
    "battlefervor": [
      "Ashen Beach, New World, Starlight Arena and Cold Eclipse add flinch immunity and protection from externally lowered stat stages. Cold Eclipse entry also attempts -1 Speed against foes, blocked by Substitute. Bewitched Woods, Haunted and Holy disable these benefits along with its ordinary power, defensive, berry/seed and retaliation effects; Holy does not grant the listed defensive benefits."
    ],
    "ultraego": [
      "On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special HP hits after activation additionally grant +1 Defense and Special Defense respectively. A qualifying hit at half HP or less instead heals 1/4 base max HP once per activation; blocked healing does not spend that recovery. Bewitched Woods, Haunted and Holy disable its Ultra Ego effects, including its rivalry with Ultra Instinct."
    ],
    "perfectego": [
      "On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special HP hits after activation additionally grant +1 Defense and Special Defense respectively. A qualifying hit at half HP or less instead heals 1/4 base max HP once per activation; blocked healing does not spend that recovery. Bewitched Woods, Haunted and Holy disable its Ultra Ego effects, including its rivalry with Ultra Instinct. Its accuracy-bypassing moves continue even on those suppressing fields."
    ],
    "burningego": [
      "Its Flame Body and Magma Armor components no longer grant Cold Eclipse entry defenses. Contact burns remain disabled and new frostbite is permitted. Its independent Ultra Ego mechanics remain."
    ],
    "ultrainstinct": [
      "Ashen Beach, New World, Starlight Arena and Cold Eclipse increase its first opposing HP-damaging move reduction each turn from 30% to 35%, covering that move’s multiple hits, and increase its once-per-turn healing after its own completed damaging attack from 1/16 to 1/8 base max HP. Ultra Ego rivalry instead uses 40% reduction. Bewitched Woods, Haunted and Holy disable these effects. Substitute-only damage does not spend its guard."
    ],
    "duskilate": [
      "Cold Eclipse strengthens its conversion bonus to 1.5x and grants hail immunity. It does not grant extra defenses; Cold Eclipse no longer has a grounded Speed penalty."
    ],
    "execution": [
      "Eligible Normal moves become Fairy on Holy and Rainbow, otherwise Dark. Their conversion bonus is 1.5× on Dark Crystal Cavern, New World, Starlight Arena, Cold Eclipse, Short-Circuit, Haunted, Bewitched Woods, Holy and Rainbow, instead of 1.3×. Cold Eclipse additionally grants hail immunity. While any base field exists, its current stat-change handler blocks Speed drops, including self-caused drops; its Attack/Special Attack floor and KO healing remain separate."
    ],
    "flashfire": [
      "Cold Eclipse disables Fire absorption without granting entry defensive stages. Ordinary rules apply outside this exception."
    ],
    "relicarmor": [
      "Desert, Fairy Tale, Cave, Crystal Cavern, New World and Volcanic entry grant +1 Defense and Special Defense. Its Rock-typing weakness protection applies on Rocky, Fairy Tale, Water Surface, Underwater, Murkwater, Midnight Zone, Starlight Arena, New World, Holy, Mountain, Cave, Volcanic, Dragon’s Den, Crystal Cavern and Dark Crystal Cavern. Desert, Icy, Snowy Mountain and Cold Eclipse do not grant that protection by themselves. Aevian Lapras additionally gains Ice typing on Icy/Snowy Mountain/Cold Eclipse or in hail/snow. The visible Rock-protection message announces actual protection and is withheld during Illusion."
    ],
    "imperialmandate": [
      "On Fairy Tale, Chessboard, New World, Starlight Arena and Cold Eclipse, half HP or more grants one tracked Defense and Special Defense stage instead of its ordinary 2× attack power. Below half HP, those granted stages are removed and it receives 1.5× attack power plus double Speed. Leaving the favored fields removes the tracked defenses. “fortifies its defenses” announces the high-HP field mode; “quickens its command” announces low-HP mode; “empowers its attacks” announces ordinary high-HP mode."
    ],
    "illusion": [
      "Cold Eclipse gives ordinary Illusion no extra defenses or Speed exemption; the field no longer slows grounded Pokemon."
    ],
    "apexcleave": [
      "Its current Dual Wield + Moxie package has no Cold Eclipse-specific bonus or penalty. Any separate Sharpness passive follows Sharpness’s Cold Eclipse restriction independently."
    ],
    "mindfreeze": [
      "Its Ice Body component heals 1/16 without hail/snow, or 1/8 during Cold Eclipse hail. The field no longer grants extra defenses or slows grounded Pokemon."
    ],
    "burningcrown": [
      "Cold Eclipse retains its 1.5x move power and Magma Armor frostbite exception; its components no longer grant entry defensive stages here."
    ],
    "omenedge": [
      "Its Sharpness component does not grant the slicing multiplier on Cold Eclipse. Pressure lowers opposing Defense and Special Defense by two on entry there, with Substitute blocking the drops; Cold Eclipse permits repeated entry activation. Pressure changes Underwater into Midnight Zone and applies the Midnight Zone extra PP cost. Dual Wield remains independent of those field rules."
    ],
    "fortressshell": [
      "Cold Eclipse grants 1.5x move power without the former field-entry Defense and Special Defense boosts. Its ordinary components still apply."
    ],
    "atrocity": [
      "Its converted Dragon attacks gain a 1.5x conversion modifier on Dragon Den and Fairy Tale instead of 1.2x. Cold Eclipse adds a 1.3x power modifier and raises its defensive multiplier to 1.5x instead of 1.3x. Its inherited Magma Armor field behavior remains: entry defenses on Dragon Den, Volcanic Summit and Infernal Eclipse, with Dragon Den and Infernal Eclipse Fire protection and Cold Eclipse’s freeze exception. Dragon Rush additionally receives its existing 1.5x modifier. Royal Decree/Empress adds the existing authority bonus only while Neutralization is absent."
    ],
    "irondominion": [
      "Fairy Tale increases its adjacent-ally entry healing from one quarter to one third maximum HP; the shared-mead message accompanies each attempted ally heal. This healing is skipped when Sworn Duty is already the species passive. Fairy Tale also grants one Defense and Special Defense stage once per ability activation; Mirror Arena grants one evasion stage. Cold Eclipse changes its Pressure drops to two stages in both defenses, retaining the per-target attempt memory and Substitute check. Starlight Arena blocks opposing positive-priority moves aimed at its protected side, with the callback’s field-wide targeting exclusions."
    ],
    "prismarmor": [
      "Cold Eclipse and Infernal Eclipse multiply Defense and Special Defense by 4/3. Ordinary incoming damage is multiplied by 0.8, with a further 0.75 against super-effective attacks. Cold Eclipse retains its hail immunity."
    ]
  },
  "moves": {
    "moonlight": [
      "Cold Eclipse restores three quarters maximum HP regardless of weather. Dark Crystal Cavern, New World, Starlight Arena and Bewitched Woods restore three quarters except in sun (approximately two thirds) or snow (one quarter). Adaptive Cycle can neutralize the adverse snow reduction. Healing restrictions still apply."
    ],
    "morningsun": [
      "Cold Eclipse and Dark Crystal Cavern force healing to one quarter maximum HP, unless the user is protected from field effects by Adaptive Cycle. Weather-based healing rules otherwise apply."
    ],
    "synthesis": [
      "Cold Eclipse and Dark Crystal Cavern force healing to one quarter maximum HP, unless the user is protected from field effects by Adaptive Cycle. Weather-based healing rules otherwise apply."
    ],
    "dragonrage": [
      "On Cold Eclipse or Frozen Aura, fixed damage becomes 140. Type immunity still applies."
    ],
    "powertrip": [
      "On Cold Eclipse, each positive stat stage contributes 40 power instead of 20. A target protected from fields by Adaptive Cycle retains the ordinary 20-per-stage calculation."
    ],
    "shelter": [
      "On Cold Eclipse, halves incoming Ice move power while its guard is active. Its independent next-damaging-hit guard reduces damage by 20% and then removes Shelter."
    ],
    "tailwind": [
      "After use on Mountain, Snowy Mountain or Cold Eclipse, attempts to start Strong Winds unless harsh sun or heavy rain is active. Mountain and Snowy Mountain extend Tailwind to six turns; the current implementation prints a Persistent activation message for this field extension even without that ability."
    ],
    "auroraveil": [
      "Can be used without hail or snow on Rainbow, Icy, Mirror Arena, Dark Crystal Cavern, Crystal Cavern, Snowy Mountain, Starlight Arena and Cold Eclipse. Mirror Arena extends ordinary Aurora Veil to eight turns and its after-use callback grants one evasion stage if a successful move has been recorded that turn. Royal Decree can still prevent the screen. G-Max-generated veil keeps its separate four-turn duration."
    ],
    "arenitewall": [
      "Can be used without sand on Desert, Rocky Field, Ashen Beach and Cold Eclipse. Desert, Rocky Field and Ashen Beach also extend it to eight turns; Cold Eclipse alone permits use but keeps five turns. Light Clay or Sand Sovereign separately extend it to eight. It halves super-effective attack damage, except critical hits and moves that bypass screens."
    ],
    "nightshade": [
      "On Haunted, fixed damage is 1.5 times the user’s level; on Cold Eclipse it is 140. Verified with level-100 Night Shade: 150 damage on Haunted and 140 on Cold Eclipse. Type immunity still applies."
    ],
    "bleakwindstorm": [
      "Never misses on Cold Eclipse through its own move callback. The former blanket wind power bonus is removed."
    ],
    "blizzard": [
      "Never misses on Cold Eclipse. Ice power receives the field 1.2x modifier."
    ],
    "chillingwater": [
      "Lowers Attack by two stages and gains Ice subtyping. The old separate 2x named power bonus is removed."
    ],
    "coldsnap": [
      "Bypasses accuracy checks on Cold Eclipse; normal status immunities still apply."
    ],
    "darkvoid": [
      "Bypasses accuracy checks on Cold Eclipse; normal move-use and sleep protections still apply."
    ],
    "freezeshock": [
      "Skips its charging turn; the old separate 1.5x named power bonus is removed."
    ],
    "iceburn": [
      "Skips its charging turn; the old separate 1.5x named power bonus is removed."
    ],
    "icywind": [
      "Never misses on Cold Eclipse; the former blanket wind power bonus is removed."
    ],
    "snarl": [
      "Lowers Special Attack by two stages. Receives the field Dark power bonus."
    ],
    "stealthrock": [
      "Uses the existing Cold Eclipse Ice-based hazard effectiveness rules."
    ]
  },
  "items": {
    "snowball": [
      "On entry into Cold Eclipse or when the field changes to Cold Eclipse, attempts to consume itself and raise Attack by one stage. The ordinary Ice-hit trigger remains; item suppression prevents consumption."
    ]
  }
};
CheckedFieldReferences.infernaleclipseterrain = {abilities: {
 icescales: ["Cold Eclipse and Infernal Eclipse double Defense once through Ice Scales. Its normal halving of special damage and hail immunity remain; type-based field bonuses stack separately."], prismarmor: ["Cold Eclipse and Infernal Eclipse multiply Defense and Special Defense by 4/3. Ordinary incoming damage is multiplied by 0.8, with a further 0.75 against super-effective attacks. Cold Eclipse retains its hail immunity."],
 blaze: ['Fire attacks gain the normal Blaze offensive-stat boost without needing low HP.'],
 flareboost: ['Special attacks gain its usual power boost without needing a burn; its separate Fire branch does not stack with that branch.']
}, moves: {hex: ['Doubles power regardless of status; status does not double it a second time.']}};
Object.assign(CheckedFieldReferences.infernaleclipseterrain.abilities, {
 baddreams: ['Sleeping and Comatose foes lose 1/4 base maximum HP each turn, subject to indirect-damage immunity. Adjacent sleeping or Comatose foes are trapped while this ability is active; ordinary escape exceptions still apply.'],
 desolateland: ['On entry, grants +1 Defense and Special Defense in addition to its ordinary harsh sunlight. The field itself does not start sunlight.'],
 flamebody: ['On entry, grants +1 Defense and Special Defense. Its ordinary contact-burn effect remains.'],
 flashfire: ['Immediately activates its Fire power-up on entry or field change. A power-up granted only by Infernal Eclipse ends when the field is left; actually absorbing a Fire attack makes it persist under ordinary Flash Fire rules.'],
 iceface: ['Eiscue immediately changes to Noice form on entry or field change. Ice Face cannot rebuild in hail while Infernal Eclipse is active.'],
 magmaarmor: ['On entry, grants +1 Defense and Special Defense. Incoming Fire attacks are nullified; ordinary frostbite protection remains.'],
 pastelveil: ['Its status protection and status-curing callbacks are inactive on Infernal Eclipse.'],
 perishbody: ['An opposing attacker that makes actual damaging contact receives a one-turn Perish countdown and a trap linked to the holder. Only that attacker is affected; it faints at the end of the following turn if still active. An already shorter countdown is not extended. Normal Ghost, Shed Shell and other escape exceptions apply.'],
});
Object.assign(CheckedFieldReferences.infernaleclipseterrain.moves, {
 burnup: ['After removing Fire typing, restores the saved types at the end of the turn if Infernal Eclipse remains active and no other type change has intervened.'],
 nastyplot: ['Raises Special Attack by three stages instead of two.'],
 nightmare: ['Can affect awake targets and remains through sleep cures while Infernal Eclipse is active, dealing the usual 1/4 base maximum HP each turn. An awake target loses it on the next residual after leaving this field, unless another supported effect sustains it. Indirect-damage immunity applies.'],
 torment: ['In addition to preventing consecutive use of the same move, deals 1/8 base maximum HP each turn while Infernal Eclipse is active. Magic Guard prevents this extra damage.'],
 stealthrock: ['Uses Fire effectiveness instead of Rock effectiveness, based on 1/8 maximum HP. Normal entry-hazard protections apply.'],
});
CheckedFieldReferences.snowyterrain = {abilities: {
 rimeknuckle: ['Damaging moves have a 40% frostbite secondary rather than 20%.'],
 icebody: ['Restores 1/16 maximum HP at turn end; ordinary weather and field recovery do not double-stack.'],
 refrigerate: ['Normal-to-Ice conversion receives a 1.5x power modifier.'],
 slushrush: ['Doubles Speed even without hail; weather does not double it again.'],
 snowcloak: ['Reduces opposing accuracy to 0.8x even without hail.']
}, moves: {auroraveil: ['May be used without hail or snow.'], grassyterrain: ['Blizzard, Avalanche or Subzero Slammer transform Grassy Field into Snowy Field; Powder Snow requires two successful uses.'], snowscape: ['Creates or refreshes Snowy Field for five turns without starting hail or Frozen Aura.']}};

Object.assign(CheckedFieldReferences.coldeclipseterrain.abilities, {
 refrigerate: ['Normal-to-Ice conversion gains a 1.5x power modifier on Cold Eclipse.'],
 relentlesshunt: ['Cold Eclipse keeps its independent ability callbacks; the former terrain-level 2x move power and low-power priority bonus are removed.'],
 snowcloak: ['Reduces opposing move accuracy to approximately 0.8x even without hail or snow.']
});

CheckedFieldReferences.coldeclipseterrain.moves.soak = ['Soak changes its target to Ice on Cold Eclipse instead of Water. Elemental Seed no longer invokes Soak.'];
