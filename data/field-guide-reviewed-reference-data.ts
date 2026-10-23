// Source-reviewed field interactions. Unlisted entries remain pending.
export const ReviewedReferenceDetails = {
	"flowergarden1": {
		"abilities": {
			"swarm": [
				"On Stage 1 Flower Garden, Bug attacks use 1.5× Attack or Special Attack at any HP. On Forest and Grassy Field, the current condition instead gives that 1.5× offensive-stat multiplier to every attack, regardless of type or HP. This is not a permanent raw-stat increase.",
			],
			"riftdancer": [
				"On its first successful field claim, starts Flower Garden stage 1 for five turns. An existing Flower Garden or burning-garden stage prevents this replacement. Each actual garden stage gained adds one remaining turn to its linked garden duration; the timer follows the garden through its stage changes.",
			],
		},
	},
	"forestterrain": {
		"abilities": {
			"swarm": [
				"On Stage 1 Flower Garden, Bug attacks use 1.5× Attack or Special Attack at any HP. On Forest and Grassy Field, the current condition instead gives that 1.5× offensive-stat multiplier to every attack, regardless of type or HP. This is not a permanent raw-stat increase.",
			],
			"leafguard": [
				"Forest, Grassy Field and Stage 2 Flower Garden prevent major status and Yawn without requiring sun. This does not cure an existing status. Rest cannot inflict its required sleep while this protection applies; Utility Umbrella affects the weather alternative, not the field condition.",
			],
			"relentlesshunt": [
				"Damaging attacks receive 2× power on Rocky, Fairy Tale, Big Top, Dragon’s Den, Mountain and Snowy Mountain; 1.5× on Desert, Forest, Burning, Superheated, Ashen Beach, Water Surface, Cave, Starlight Arena and New World. Cold Eclipse’s shared handler supplies its 2× damage and raises the priority-eligible base-power threshold from 60 to 80; the ability’s own Cold Eclipse return avoids doubling those modifiers.",
			],
			"sapsipper": [
				"At turn end, Forest heals 1/8 base max HP and Grassy Field heals 1/16. A Grass attack is not required; absorption and its offensive boosts remain separate.",
			],
			"forestsurge": [
				"On entry, attempts to establish Forest Field for five turns, or eight with Amplifield Rock. If Forest is then active, establishes Grassy Aura for the same duration. The aura is distinct from replacing the field with Grassy Field.",
			],
		},
		"moves": {
			"ingrain": [
				"Forest and Grassy Field heal 1/8 maximum HP each turn. Flower Garden stage 2 heals 1/8 and stage 4 heals 1/4. Corrosive Field and Swamp damage non-Poison, non-Steel users by 1/16 instead; Poison and Steel users heal the ordinary 1/16. Its rooting and forced-switch protection remain.",
			],
			"forestscurse": [
				"After successfully changing the target to pure Grass, Fairy Tale, Forest and Bewitched Woods also apply the Curse volatile if absent. It fails against an already pure-Grass target, so that case does not add Curse. The type-change message confirms the successful conversion.",
			],
			"strengthsap": [
				"Bewitched Woods lowers Special Attack by one as well as Attack. Forest and Swamp multiply its Attack-based healing by 1.3. The current Forest handler additionally fails if the target’s Special Attack is already at -6, even though Forest does not add a Special Attack drop.",
			],
			"defendorder": [
				"On Forest, raises Defense and Special Defense by two stages each.",
			],
			"growth": [
				"On Forest, Grassy Field and Flower Garden stage 1, raises Attack and Special Attack by two stages even without sun.",
			],
			"healorder": [
				"On Forest, restores two thirds maximum HP. Its existing party-status cure still runs, including its Soundproof and Good as Gold exclusions; the Heal Bell activation message is emitted by that cure callback.",
			],
			"stabbyswarm": [
				"On Forest, gains 1.5x power and lowers the target’s Defense by one after positive damage. Adaptive Cycle field protection prevents the field power bonus. The woodwork message is printed when the move is modified on Forest, before hit success is known.",
			],
			"bloomdoom": [
				"Outside Forest, gains 1.3x power when Grassy Field can be established and attempts to create Grassy Field after use. It leaves Forest intact. Its terrain-setting Z-move path replaces the base field instead of creating an aura.",
			],
		},
	},
	"grassyterrain": {
		"abilities": {
			"swarm": [
				"On Stage 1 Flower Garden, Bug attacks use 1.5× Attack or Special Attack at any HP. On Forest and Grassy Field, the current condition instead gives that 1.5× offensive-stat multiplier to every attack, regardless of type or HP. This is not a permanent raw-stat increase.",
			],
			"harvest": [
				"At turn end with an empty item slot and a previously consumed Berry or field Seed, restoration is guaranteed on Grassy Field or Stage 2 Flower Garden. Other fields retain the ordinary 50% roll unless effective sun guarantees restoration. The holder must still be alive.",
			],
			"leafguard": [
				"Forest, Grassy Field and Stage 2 Flower Garden prevent major status and Yawn without requiring sun. This does not cure an existing status. Rest cannot inflict its required sleep while this protection applies; Utility Umbrella affects the weather alternative, not the field condition.",
			],
			"cottondown": [
				"After an attack hits the holder, every other living active Pokémon loses two Speed stages on Bewitched Woods or Grassy Field instead of one. This includes allies; the holder is excluded. Usual stat-drop protections still apply.",
			],
			"grasspelt": [
				"Grassy and Forest fields give 1.5× Defense. On Corrosive, the holder instead loses 1/8 base max HP each turn unless it is Poison- or Steel-type.",
			],
			"sapsipper": [
				"At turn end, Forest heals 1/8 base max HP and Grassy Field heals 1/16. A Grass attack is not required; absorption and its offensive boosts remain separate.",
			],
			"forestsurge": [
				"On entry, attempts to establish Forest Field for five turns, or eight with Amplifield Rock. If Forest is then active, establishes Grassy Aura for the same duration. The aura is distinct from replacing the field with Grassy Field.",
			],
			"verdantsanctuary": [
				"On entry, attempts to establish Grassy Field unless the species already supplies Grassy Surge as a passive, avoiding duplicate setup. Hospitality’s adjacent-ally healing and Friend Guard remain separate.",
			],
			"grassysurge": [
				"On entry, attempts to establish Grassy Field under the shared field/aura placement rules. The ordinary duration is five turns, extended to eight by Amplifield Rock.",
			],
			"overgrow": [
				"On Grassy Field, Grass attacks use 1.5× Attack or Special Attack at any HP. Flower Garden Stage 2 permits the bonus at two-thirds HP or less; Stages 4 and 5 grant 1.8× and 2× respectively at any HP. Low HP does not stack an additional copy.",
			],
			"seedsower": [
				"After being hit by a damaging attack, attempts to establish Grassy Field under the normal field-setting rules. It is not limited to contact moves.",
			],
		},
		"moves": {
			"floralhealing": [
				"Restores up to full maximum HP on Grassy Field, Fairy Tale or Flower Garden stage 3; otherwise restores half. On Corrosive Field or Corrosive Mist, a successful heal also attempts to poison the recipient. A failed heal does not poison.",
			],
			"ingrain": [
				"Forest and Grassy Field heal 1/8 maximum HP each turn. Flower Garden stage 2 heals 1/8 and stage 4 heals 1/4. Corrosive Field and Swamp damage non-Poison, non-Steel users by 1/16 instead; Poison and Steel users heal the ordinary 1/16. Its rooting and forced-switch protection remain.",
			],
			"grasswhistle": [
				"Base accuracy becomes 80% on Grassy Field or 85% on Bewitched Woods.",
			],
			"coil": [
				"On Grassy Field and Dragon Den, raises Attack, Defense and Accuracy by two stages each.",
			],
			"growth": [
				"On Forest, Grassy Field and Flower Garden stage 1, raises Attack and Special Attack by two stages even without sun.",
			],
			"cottonspore": [
				"On Grassy Field, lowers Speed by four stages.",
			],
			"naturesmadness": [
				"Deals three quarters of the target’s current undynamaxed HP on Grassy Field, Forest and New World, or two thirds on Holy, instead of half. Minimum one damage.",
			],
			"leechseed": [
				"On Wasteland, drains one quarter maximum HP each turn rather than one eighth. On Grassy Field, healing to the recipient is multiplied by 1.3 after actual damage is dealt. No drain occurs if the recipient slot has no living Pokémon.",
			],
			"grassyglide": [
				"Grassy Field gives +1 priority only while the user is grounded. Grassy Aura’s current branch grants the priority bonus without that grounding check.",
			],
			"worryseed": [
				"On Grassy Field, its successful-hit handler additionally lowers the target’s Attack by one stage while attempting to replace its active ability with Insomnia. Ordinary protected-ability checks remain.",
			],
			"bloomdoom": [
				"Outside Forest, gains 1.3x power when Grassy Field can be established and attempts to create Grassy Field after use. It leaves Forest intact. Its terrain-setting Z-move path replaces the base field instead of creating an aura.",
			],
			"grassyterrain": [
				"Attempts to establish Grassy Field for five turns, or eight with Amplifield Rock. When a different full field already exists and auras are enabled, the shared setter instead creates the corresponding aura. Existing field-lock and ability restrictions apply; the aura and full-field effects are distinct. Grassy Terrain on an existing Flower Garden follows the garden-growth rules rather than replacing it.",
			],
			"maxovergrowth": [
				"Its successful self callback requires the user to still be Dynamaxed, then attempts to establish Grassy Field. The shared setter can create the matching aura over an existing different full field. Normal field-lock and duration rules apply.",
			],
		},
		"items": {
			"bigroot": [
				"On Grassy Field, multiplies healing from draining attacks, Leech Seed, Ingrain, Aqua Ring and Strength Sap by 1.6 instead of 1.3. It does not amplify every healing effect.",
			],
		},
	},
	"flowergarden2": {
		"abilities": {
			"harvest": [
				"At turn end with an empty item slot and a previously consumed Berry or field Seed, restoration is guaranteed on Grassy Field or Stage 2 Flower Garden. Other fields retain the ordinary 50% roll unless effective sun guarantees restoration. The holder must still be alive.",
			],
			"leafguard": [
				"Forest, Grassy Field and Stage 2 Flower Garden prevent major status and Yawn without requiring sun. This does not cure an existing status. Rest cannot inflict its required sleep while this protection applies; Utility Umbrella affects the weather alternative, not the field condition.",
			],
		},
	},
	"flowergarden4": {
		"abilities": {
			"chlorophyll": [
				"Stage 4 Flower Garden doubles Speed without sun. The check names Stage 4 specifically; it is not a blanket bonus for every later garden stage. Effective sun can activate the ordinary weather branch.",
			],
		},
	},
	"ashenbeachterrain": {
		"abilities": {
			"costar": [
				"On Ashen Beach entry, the holder and its first ally receive Helping Hand before the ordinary copied stat stages and focus effects. The current handler accesses the ally before checking that one exists, so singles entry can error; this is not a working self-only Helping Hand bonus.",
			],
			"perfectforesight": [
				"On entry, prioritizes a foe whose active Speed-related ability matches the present conditions, then the highest current Attack or Sp. Atk. The field checks count Sand Rush on Desert/Ashen Beach; Swift Swim on Water Surface/Underwater/Murkwater/Midnight Zone; Slush Rush on Icy/Snowy Mountain/Cold Eclipse; Surge Surfer on Water Surface/Underwater/Murkwater/Short-Circuit/Electric; Quick Feet on Electric; Telepathy on Psychic Field or its aura. Speed Boost is always prioritized. Chlorophyll is checked against effective sun, not its garden exception. It copies the chosen actual ability and runs its entry behavior; Trace, Perfect Foresight and Void Voice are excluded.",
			],
			"forecast": [
				"The current Forecast implementation selects Castform forms from effective weather, not this field alone. Copied/Transformed Pokémon do not change form. Climate Reserve can select its stored weather-rock form when effective weather is absent. Older field-only Forecast references in the source index are superseded; ordinary weather and Utility Umbrella rules still apply.",
			],
			"sandforce": [
				"On Desert or Ashen Beach, Rock, Ground and Steel attacks receive 1.3× power without sandstorm. This is the same conditional bonus as sandstorm and is not multiplied a second time when both are present. Sandstorm chip immunity remains.",
			],
			"sandrush": [
				"On Desert or Ashen Beach, doubles Speed without sandstorm. The field and weather branches do not stack into a second doubling. Sandstorm chip immunity remains.",
			],
			"sandspit": [
				"After a damaging hit, attempts to start sandstorm. On Desert or Ashen Beach, the current loop also attempts −1 accuracy on Pokémon on the holder’s own side, not its opponents, and prints the Sand Spit activation for each attempt. This is an implementation discrepancy, not an opposing-accuracy debuff.",
			],
			"tremor": [
				"On Desert or Ashen Beach, Rock, Ground and Steel attacks receive the Sand Force-style 1.3× modifier without weather. Its separate 1.5× sound modifier can combine with that bonus when the attack qualifies for both. Ground immunity, Bug STAB and the ordinary allied sound protection remain.",
			],
			"watercompaction": [
				"Entry on Misty, Corrosive Mist or Murkwater grants +2 Defense. Midnight Zone entry changes its type to Water when type changes are allowed. Water-damage activation on Ashen Beach gives +2 Sp. Def in addition to its normal +2 Defense. At each turn end, Water Surface, Underwater, Murkwater and Swamp grant +2 Defense. The “sharply raised its defense” message accompanies Water hits and the listed water-field activations; stat caps and prevention still apply.",
			],
			"zenmode": [
				"Standard Darmanitan is forced into Zen on Ashen Beach or Psychic Field; Galarian Darmanitan is forced into Galar-Zen on Icy, Snowy Mountain or Cold Eclipse. These checks run on entry, field change and turn end, regardless of HP. Transformed Pokémon are excluded. Outside the matching fields, the usual half-HP form condition applies.",
			],
			"relentlesshunt": [
				"Damaging attacks receive 2× power on Rocky, Fairy Tale, Big Top, Dragon’s Den, Mountain and Snowy Mountain; 1.5× on Desert, Forest, Burning, Superheated, Ashen Beach, Water Surface, Cave, Starlight Arena and New World. Cold Eclipse’s shared handler supplies its 2× damage and raises the priority-eligible base-power threshold from 60 to 80; the ability’s own Cold Eclipse return avoids doubling those modifiers.",
			],
			"battlefervor": [
				"Ashen Beach, New World, Starlight Arena and Cold Eclipse add flinch immunity and protection from externally lowered stat stages. Cold Eclipse entry also attempts -1 Speed against foes, blocked by Substitute. Bewitched Woods, Haunted and Holy disable these benefits along with its ordinary power, defensive, berry/seed and retaliation effects; Holy does not grant the listed defensive benefits.",
			],
			"ultraego": [
				"On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special HP hits after activation additionally grant +1 Defense and Special Defense respectively. A qualifying hit at half HP or less instead heals 1/4 base max HP once per activation; blocked healing does not spend that recovery. Bewitched Woods, Haunted and Holy disable its Ultra Ego effects, including its rivalry with Ultra Instinct.",
			],
			"perfectego": [
				"On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special HP hits after activation additionally grant +1 Defense and Special Defense respectively. A qualifying hit at half HP or less instead heals 1/4 base max HP once per activation; blocked healing does not spend that recovery. Bewitched Woods, Haunted and Holy disable its Ultra Ego effects, including its rivalry with Ultra Instinct. Its accuracy-bypassing moves continue even on those suppressing fields.",
			],
			"burningego": [
				"On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special HP hits after activation additionally grant +1 Defense and Special Defense respectively. A qualifying hit at half HP or less instead heals 1/4 base max HP once per activation; blocked healing does not spend that recovery. Bewitched Woods, Haunted and Holy disable its Ultra Ego effects, including its rivalry with Ultra Instinct. Its Flame Body and Magma Armor components give a combined +2 Defense and Special Defense on Cold Eclipse entry, disable contact burns there, and allow new frostbite. Volcanic gives a 60% contact burn chance and +1 Defense/Special Defense on entry; Dragon’s Den grants those entry defenses and Fire immunity.",
			],
			"ultrainstinct": [
				"Ashen Beach, New World, Starlight Arena and Cold Eclipse increase its first opposing HP-damaging move reduction each turn from 30% to 35%, covering that move’s multiple hits, and increase its once-per-turn healing after its own completed damaging attack from 1/16 to 1/8 base max HP. Ultra Ego rivalry instead uses 40% reduction. Bewitched Woods, Haunted and Holy disable these effects. Substitute-only damage does not spend its guard.",
			],
		},
		"moves": {
			"calmmind": [
				"On Ashen Beach, Chess Board and Psychic Field, raises Special Attack and Special Defense by two stages each.",
			],
			"coaching": [
				"On Ashen Beach, raises its recipient’s Attack and Defense by two stages each.",
			],
			"kinesis": [
				"On Ashen Beach and Psychic Field, lowers target Accuracy by two stages and raises the user’s Attack and Special Attack by two.",
			],
			"psychup": [
				"After copying target stat stages and the supported critical-hit volatiles, Ashen Beach cures the user’s major status; Psychic Field additionally raises Special Attack by two stages.",
			],
			"sandattack": [
				"On Desert and Ashen Beach, lowers Accuracy by two stages.",
			],
			"shoreup": [
				"Restores full maximum HP on Desert or Ashen Beach. Otherwise keeps its usual half-HP heal, or approximately two thirds in sand. On Water Surface, Murkwater or Underwater, successful healing additionally gives a Water Compaction user two Defense stages. It becomes Water type on Water Surface and Water/Poison on Murkwater. After use Underwater, its resurfacing message announces an attempted change to Water Surface.",
			],
			"focusenergy": [
				"While on Ashen Beach, its critical-rate increase is three stages rather than two.",
			],
			"arenitewall": [
				"Can be used without sand on Desert, Rocky Field, Ashen Beach and Cold Eclipse. Desert, Rocky Field and Ashen Beach also extend it to eight turns; Cold Eclipse alone permits use but keeps five turns. Light Clay or Sand Sovereign separately extend it to eight. It halves super-effective attack damage, except critical hits and moves that bypass screens.",
			],
			"dustydrift": [
				"After positive damage, starts sand if sand is not already active. Desert or Ashen Beach extends this newly started sand to eight turns, as Smooth Rock also does; it does not refresh already active sand.",
			],
		},
		"items": {
			"shellbell": [
				"On Ashen Beach, heals one quarter of the move’s total damage rather than one eighth, after a successful damaging move. Its existing forced-switch exclusion and healing restrictions remain.",
			],
		},
	},
	"coldeclipseterrain": {
		"abilities": {
			"perfectforesight": [
				"On entry, prioritizes a foe whose active Speed-related ability matches the present conditions, then the highest current Attack or Sp. Atk. The field checks count Sand Rush on Desert/Ashen Beach; Swift Swim on Water Surface/Underwater/Murkwater/Midnight Zone; Slush Rush on Icy/Snowy Mountain/Cold Eclipse; Surge Surfer on Water Surface/Underwater/Murkwater/Short-Circuit/Electric; Quick Feet on Electric; Telepathy on Psychic Field or its aura. Speed Boost is always prioritized. Chlorophyll is checked against effective sun, not its garden exception. It copies the chosen actual ability and runs its entry behavior; Trace, Perfect Foresight and Void Voice are excluded.",
			],
			"forecast": [
				"The current Forecast implementation selects Castform forms from effective weather, not this field alone. Copied/Transformed Pokémon do not change form. Climate Reserve can select its stored weather-rock form when effective weather is absent. Older field-only Forecast references in the source index are superseded; ordinary weather and Utility Umbrella rules still apply.",
			],
			"zenmode": [
				"Standard Darmanitan is forced into Zen on Ashen Beach or Psychic Field; Galarian Darmanitan is forced into Galar-Zen on Icy, Snowy Mountain or Cold Eclipse. These checks run on entry, field change and turn end, regardless of HP. Transformed Pokémon are excluded. Outside the matching fields, the usual half-HP form condition applies.",
			],
			"blaze": [
				"Burning and Volcanic activate Blaze’s 1.5× offensive-stat multiplier for Fire attacks at any HP. Cold Eclipse disables this multiplier even at low HP. Having Blaze as both active ability and species passive does not apply it twice.",
			],
			"flareboost": [
				"Fire attacks receive 1.5× power through the first branch on every field, including Cold Eclipse. On Burning or Volcanic, non-Fire special attacks also gain 1.5× without a burn. Cold Eclipse disables this second burned/special branch. The two branches return separately and do not stack with each other.",
			],
			"sinisterblaze": [
				"Fairy Tale, Starlight Arena, New World, Burning, Volcanic, Superheated and Cold Eclipse grant +1 Defense and Sp. Def on entry. Snowy Mountain, Icy and Cold Eclipse add Ice typing while this is the active ability, except for Abysseon and Divineon; this is not a blanket passive typing grant. Its ordinary self-burn, burn recovery and opposing chip remain separate.",
			],
			"powerdrill": [
				"Drill and horn moves receive 2× power and bypass Protect-style protection on Rocky, Mountain, Snowy Mountain, Cave and Volcanic, instead of the usual 1.5×. Cold Eclipse is not one of these five enhanced fields; its shared move-flag rules are documented separately. Dual Wield/Sharpness overlap uses the existing combined multiplier path, not an extra duplicate Power Drill bonus.",
			],
			"soulfire": [
				"Haunted and Cold Eclipse grant +1 Defense and Sp. Def on entry. Haunted, Burning, Volcanic and Bewitched Woods grant +1 Attack and Sp. Atk each turn. These are additional to ordinary Fire/Ghost redirection, absorption and attack rules.",
			],
			"exalt": [
				"Cold Eclipse disables the 1.5× Sharpness bonus for slicing moves and the separate Steel Wing bonus. Its Mold Breaker, Defiant and flinch protection remain; this does not grant protection from Intimidate.",
			],
			"battlebond": [
				"Cold Eclipse multiplies damaging move power by 1.3×. This stacks with its independent 1.3× bonus against Royal Decree, Empress or Neutralization. Its KO transformation and recovery rules remain unchanged.",
			],
			"darkaura": [
				"On Cold Eclipse, the holder is immune to hail damage. The shared Dark-move power bonus remains 4/3×, or 0.75× under Aura Break; multiple Dark Aura users do not stack.",
			],
			"sacrededge": [
				"Cold Eclipse disables its Sharpness slicing-power bonus; the eligible two-hit behavior remains. On Fairy Tale, entry or Mega Evolution heals each adjacent living ally by 1/3 base max HP instead of 1/4, printing “[Pokémon] shared its mead with [ally]!” for each recipient.",
			],
			"defragment": [
				"On Cold Eclipse and Fairy Tale entry, raises both Defense and Special Defense by one stage. On Factory, Short-Circuit, Glitch, New World and Starlight Arena, compares all living foes’ combined Attack and Special Attack and raises the corresponding defense by two stages (Defense wins a tie), instead of the ordinary one-stage increase. Its attacks still cannot miss.",
			],
			"eternalflower": [
				"Fairy Tale and Cold Eclipse multiply both offensive stats by 2; New World, Starlight Arena and Bewitched Woods use 1.5× instead. Its separate 1.5× offensive-stat bonus for Grass attacks stacks with this. On fainting, it attempts to establish Bewitched Woods for five turns; a blocked field change does not set that duration.",
			],
			"windysurge": [
				"On Mountain, Snowy Mountain or Cold Eclipse entry, also attempts to summon strong winds, unless Desolate Land or Primordial Sea is active. Its two-turn Tailwind still applies. Refreshing an existing Tailwind attempts +1 Special Attack for Wind Power/Hisuian Vanguard allies and +1 Attack for Wind Rider/Unova Vanguard/Scarecrow allies.",
			],
			"flamebody": [
				"Volcanic raises the contact burn chance from 30% to 60%. Cold Eclipse instead grants +1 Defense and Special Defense on entry and disables the contact burn effect.",
			],
			"ancientbloom": [
				"On Fairy Tale, New World, Cold Eclipse or Starlight Arena entry, gains +1 Defense and Special Defense. New World, Cold Eclipse and Starlight Arena also multiply its move power by 1.5. Its Pollen Bloom, Self-Sufficient and Friend Guard components continue independently.",
			],
			"fullmetalbody": [
				"Cold Eclipse additionally prevents hail damage; its ordinary protection from other Pokémon lowering its stat stages remains.",
			],
			"galewings": [
				"During unsuppressed Strong Winds on any field, Gale Wings gives +1 priority to all moves at any HP. Otherwise, only Flying moves at 75% HP or higher receive the bonus.",
			],
			"icebody": [
				"Heals 1/16 base max HP each turn on Icy, Snowy Mountain and Cold Eclipse when hail/snow is not already supplying its weather recovery. Hail on Cold Eclipse heals 1/8 instead of 1/16. Hail immunity and the ordinary 30% contact frostbite chance remain.",
			],
			"iceface": [
				"Cold Eclipse allows the intact Ice Face to absorb special as well as physical move damage before breaking. Volcanic marks the face broken on entry, so the update changes intact Eiscue into Noice Face rather than granting a shield. Ordinary restoration when hail or snow begins still follows the weather callback; resuming suppressed weather does not trigger restoration.",
			],
			"icescales": [
				"Cold Eclipse doubles Defense. Mirror Arena entry grants +2 evasion. On Icy and Snowy Mountain, super-effective contributions from the holder’s Ice typing are neutralized; weaknesses from another type remain. Its ordinary halving of special damage and hail immunity remain.",
			],
			"armorize": [
				"Eligible Normal moves become Steel. The conversion bonus is 1.5× on Factory, Short-Circuit, Fairy Tale, Dragon’s Den, Starlight Arena, New World and Holy, instead of 1.2×. Cold Eclipse grants hail immunity but does not increase that conversion bonus. Variable-type moves retain their normal conversion exclusions.",
			],
			"argentdevotion": [
				"Its Armorize conversion gives 1.5× power on Factory, Short-Circuit, Fairy Tale, Dragon’s Den, Starlight Arena, New World and Holy, instead of 1.2×. Cold Eclipse grants hail immunity. On Fairy Tale entry, Sworn Duty heals each adjacent living ally by 1/3 base max HP instead of 1/4. Its other components remain active.",
			],
			"magmaarmor": [
				"On Dragon’s Den, Volcanic or Cold Eclipse entry, gains +1 Defense and Special Defense. Dragon’s Den also blocks incoming Fire moves from other Pokémon. Cold Eclipse removes its prevention of new frostbite, while its existing-status cure and halving of incoming Water/Ice offensive stats remain.",
			],
			"megalauncher": [
				"Its pulse/bullet power bonus remains 1.5× on Cold Eclipse. That field disables the separate Sharpness slicing bonus; the shared Dual Wield scaling therefore does not apply a Sharpness multiplier there.",
			],
			"mindseye": [
				"Cold Eclipse grants 30% incoming attack-damage reduction, increases healing after a damaging hit from 1/16 to 1/8 base max HP, and gives damaging moves 1.3× power. Self-Sufficient recovery remains independent. Normal/Fighting Ghost bypass, Fairy/Dark STAB, evasion ignoring and accuracy-drop protection continue.",
			],
			"pressure": [
				"On entry into Underwater, attempts to change the field to Midnight Zone; targeting the holder there costs two extra PP instead of one. Cold Eclipse entry attempts -2 Defense and Special Defense against each foe, blocked by Substitute and ordinary stat-drop protections. These Cold Eclipse attempts repeat on entry and do not spend the ordinary once-per-opponent-per-user battle allowance.",
			],
			"shadowshield": [
				"Cold Eclipse adds immunity to hail damage. Its ordinary 20% attack-damage reduction and further 25% reduction of super-effective attacks remain; these do not depend on full HP.",
			],
			"sharpness": [
				"Cold Eclipse disables its 1.5× slicing-move power bonus, including its contribution to Dual Wield scaling.",
			],
			"slushrush": [
				"Speed is doubled on Icy, Snowy Mountain and Cold Eclipse even without hail or snow. Having both the weather and field does not double it a second time.",
			],
			"snowwarning": [
				"On Cold Eclipse, being hit by a damaging move attempts to Disable the attacker’s move. It does not retrigger against an already Disabled attacker, Max moves, delayed attacks or Struggle. Entry summons the project’s hail weather.",
			],
			"solarpower": [
				"Cold Eclipse disables both Solar Power’s 1.5× Attack/Special Attack in effective sun and its 1/8 base max HP end-of-turn sun damage.",
			],
			"wrathshield": [
				"On Cold Eclipse, Fairy Tale, New World and Starlight Arena entry, gains +1 Special Defense. This field bonus does not raise Defense; Stamina can still grant Defense from qualifying opposing hits.",
			],
			"technician": [
				"Cold Eclipse leaves the normal effective-power threshold at 60 and its 1.5× bonus intact. It disables a separate Sharpness bonus in the shared Dual Wield calculation. Factory alone raises Technician’s threshold to 80.",
			],
			"turboblaze": [
				"On Cold Eclipse, Defense and Special Defense are each 1.5×, and incoming Ice attacks use half the attacker’s offensive stat. Its moves still ignore bypassable opposing abilities.",
			],
			"unnerve": [
				"On Cold Eclipse entry, attempts to lower each foe’s Speed by one stage. Substitute blocks the attempt; ordinary stat-drop protections apply. Its berry restriction remains.",
			],
			"amethystglow": [
				"Its Ice Body component heals 1/16 base max HP each turn on Icy, Snowy Mountain and Cold Eclipse without hail/snow; hail on Cold Eclipse heals 1/8 instead. The field also adds Ice typing if absent. Its Normal-to-Ice conversion gains 1.5× power on Icy and Snowy Mountain, but remains 1.2× on Cold Eclipse. Its no-miss and contact-frostbite effects remain.",
			],
			"battlefervor": [
				"Ashen Beach, New World, Starlight Arena and Cold Eclipse add flinch immunity and protection from externally lowered stat stages. Cold Eclipse entry also attempts -1 Speed against foes, blocked by Substitute. Bewitched Woods, Haunted and Holy disable these benefits along with its ordinary power, defensive, berry/seed and retaliation effects; Holy does not grant the listed defensive benefits.",
			],
			"ultraego": [
				"On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special HP hits after activation additionally grant +1 Defense and Special Defense respectively. A qualifying hit at half HP or less instead heals 1/4 base max HP once per activation; blocked healing does not spend that recovery. Bewitched Woods, Haunted and Holy disable its Ultra Ego effects, including its rivalry with Ultra Instinct.",
			],
			"perfectego": [
				"On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special HP hits after activation additionally grant +1 Defense and Special Defense respectively. A qualifying hit at half HP or less instead heals 1/4 base max HP once per activation; blocked healing does not spend that recovery. Bewitched Woods, Haunted and Holy disable its Ultra Ego effects, including its rivalry with Ultra Instinct. Its accuracy-bypassing moves continue even on those suppressing fields.",
			],
			"burningego": [
				"On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special HP hits after activation additionally grant +1 Defense and Special Defense respectively. A qualifying hit at half HP or less instead heals 1/4 base max HP once per activation; blocked healing does not spend that recovery. Bewitched Woods, Haunted and Holy disable its Ultra Ego effects, including its rivalry with Ultra Instinct. Its Flame Body and Magma Armor components give a combined +2 Defense and Special Defense on Cold Eclipse entry, disable contact burns there, and allow new frostbite. Volcanic gives a 60% contact burn chance and +1 Defense/Special Defense on entry; Dragon’s Den grants those entry defenses and Fire immunity.",
			],
			"ultrainstinct": [
				"Ashen Beach, New World, Starlight Arena and Cold Eclipse increase its first opposing HP-damaging move reduction each turn from 30% to 35%, covering that move’s multiple hits, and increase its once-per-turn healing after its own completed damaging attack from 1/16 to 1/8 base max HP. Ultra Ego rivalry instead uses 40% reduction. Bewitched Woods, Haunted and Holy disable these effects. Substitute-only damage does not spend its guard.",
			],
			"duskilate": [
				"Eligible Normal moves become Fairy on Holy and Rainbow, otherwise Dark. Their conversion bonus is 1.5× on Dark Crystal Cavern, New World, Starlight Arena, Cold Eclipse, Short-Circuit, Haunted, Bewitched Woods, Holy and Rainbow, instead of 1.3×. Cold Eclipse additionally grants hail immunity. Cold Eclipse also recognizes Duskilate for its 1.5× defenses and exemption from the grounded Speed penalty.",
			],
			"execution": [
				"Eligible Normal moves become Fairy on Holy and Rainbow, otherwise Dark. Their conversion bonus is 1.5× on Dark Crystal Cavern, New World, Starlight Arena, Cold Eclipse, Short-Circuit, Haunted, Bewitched Woods, Holy and Rainbow, instead of 1.3×. Cold Eclipse additionally grants hail immunity. While any base field exists, its current stat-change handler blocks Speed drops, including self-caused drops; its Attack/Special Attack floor and KO healing remain separate.",
			],
			"flashfire": [
				"Burning, or Volcanic while grounded, grants its Fire-power charge at turn end without needing an incoming Fire move. Cold Eclipse disables Fire absorption and grants +1 Defense and Special Defense on entry instead. The charge still follows its ordinary loss/switch rules.",
			],
			"relicarmor": [
				"Desert, Fairy Tale, Cave, Crystal Cavern, New World and Volcanic entry grant +1 Defense and Special Defense. Its Rock-typing weakness protection applies on Rocky, Fairy Tale, Water Surface, Underwater, Murkwater, Midnight Zone, Starlight Arena, New World, Holy, Mountain, Cave, Volcanic, Dragon’s Den, Crystal Cavern and Dark Crystal Cavern. Desert, Icy, Snowy Mountain and Cold Eclipse do not grant that protection by themselves. Aevian Lapras additionally gains Ice typing on Icy/Snowy Mountain/Cold Eclipse or in hail/snow. The visible Rock-protection message announces actual protection and is withheld during Illusion.",
			],
			"imperialmandate": [
				"On Fairy Tale, Chessboard, New World, Starlight Arena and Cold Eclipse, half HP or more grants one tracked Defense and Special Defense stage instead of its ordinary 2× attack power. Below half HP, those granted stages are removed and it receives 1.5× attack power plus double Speed. Leaving the favored fields removes the tracked defenses. “fortifies its defenses” announces the high-HP field mode; “quickens its command” announces low-HP mode; “empowers its attacks” announces ordinary high-HP mode.",
			],
			"illusion": [
				"Ordinary Illusion grants no Chessboard power or Mirror Arena evasion bonus; those belong to Perfect Illusion. Cold Eclipse’s separate field rules still recognize ordinary Illusion for 1.5× Defense/Special Defense and exemption from its grounded Speed penalty. Disguise does not copy the target’s mechanical traits.",
			],
			"apexcleave": [
				"Its current Dual Wield + Moxie package has no Cold Eclipse-specific bonus or penalty. Any separate Sharpness passive follows Sharpness’s Cold Eclipse restriction independently.",
			],
			"mindfreeze": [
				"Its Ice Body recovery heals 1/16 base max HP on Icy, Snowy Mountain and Cold Eclipse without hail/snow; hail on Cold Eclipse heals 1/8. Cold Eclipse also recognizes Mind Freeze for 1.5× Defense/Special Defense and exemption from its grounded Speed penalty. Ordinary Ice absorption and Psychic frostbite effects remain.",
			],
			"burningcrown": [
				"New World, Cold Eclipse and Starlight Arena grant 1.5× move power. Its Unbound Blaze component additionally gives +1 Defense/Special Defense on Cold Eclipse, Volcanic or Dragon’s Den entry; Dragon’s Den blocks Fire attacks, and Dragon’s Den/Fairy Tale improve the Normal-to-Dragon conversion bonus to 1.5×. Cold Eclipse allows new frostbite through the Magma Armor component.",
			],
			"omenedge": [
				"Its Sharpness component does not grant the slicing multiplier on Cold Eclipse. Pressure lowers opposing Defense and Special Defense by two on entry there, with Substitute blocking the drops; Cold Eclipse permits repeated entry activation. Pressure changes Underwater into Midnight Zone and applies the Midnight Zone extra PP cost. Dual Wield remains independent of those field rules.",
			],
			"fortressshell": [
				"Its Stalwart component raises Special Attack on entry in New World, Starlight Arena, Fairy Tale and Chess Board. Shell Armor adds entry Defense on Fairy Tale or Dragon Den. Its own field-entry effect raises Defense and Special Defense on Fairy Tale, New World, Cold Eclipse or Starlight, tracking changes between fields. New World, Cold Eclipse and Starlight give 1.5x power. Guardian Presence gives allied attacks 1.5x power on Haunted, Bewitched Woods, Holy or Psychic Field (1.3x otherwise), and reduces allied incoming damage by 25%. Electric Aura, Electric Field, Murkwater, Water Surface, Underwater, Midnight Zone, Factory or Short-Circuit activate its Electric redirection/absorption and Attack/Special Attack increases.",
			],
			"atrocity": [
				"Its converted Dragon attacks gain a 1.5x conversion modifier on Dragon Den and Fairy Tale instead of 1.2x. Cold Eclipse adds a 1.3x power modifier and raises its defensive multiplier to 1.5x instead of 1.3x. Its inherited Magma Armor field behavior remains: entry defenses on Dragon Den, Volcanic Summit and Cold Eclipse, with Dragon Den Fire protection and Cold Eclipse’s freeze exception. Dragon Rush additionally receives its existing 1.5x modifier. Royal Decree/Empress adds the existing authority bonus only while Neutralization is absent.",
			],
			"irondominion": [
				"Fairy Tale increases its adjacent-ally entry healing from one quarter to one third maximum HP; the shared-mead message accompanies each attempted ally heal. This healing is skipped when Sworn Duty is already the species passive. Fairy Tale also grants one Defense and Special Defense stage once per ability activation; Mirror Arena grants one evasion stage. Cold Eclipse changes its Pressure drops to two stages in both defenses, retaining the per-target attempt memory and Substitute check. Starlight Arena blocks opposing positive-priority moves aimed at its protected side, with the callback’s field-wide targeting exclusions.",
			],
		},
		"items": {
			"snowball": [
				"On entry into Cold Eclipse or when the field changes to Cold Eclipse, attempts to consume itself and raise Attack by one stage. The ordinary Ice-hit trigger remains; item suppression prevents consumption.",
			],
		},
		"moves": {
			"moonlight": [
				"Cold Eclipse restores three quarters maximum HP regardless of weather. Dark Crystal Cavern, New World, Starlight Arena and Bewitched Woods restore three quarters except in sun (approximately two thirds) or snow (one quarter). Adaptive Cycle can neutralize the adverse snow reduction. Healing restrictions still apply.",
			],
			"morningsun": [
				"Cold Eclipse and Dark Crystal Cavern force healing to one quarter maximum HP, unless the user is protected from field effects by Adaptive Cycle. Weather-based healing rules otherwise apply.",
			],
			"synthesis": [
				"Cold Eclipse and Dark Crystal Cavern force healing to one quarter maximum HP, unless the user is protected from field effects by Adaptive Cycle. Weather-based healing rules otherwise apply.",
			],
			"dragonrage": [
				"On Cold Eclipse or Frozen Aura, fixed damage becomes 140. Type immunity still applies.",
			],
			"powertrip": [
				"On Cold Eclipse, each positive stat stage contributes 40 power instead of 20. A target protected from fields by Adaptive Cycle retains the ordinary 20-per-stage calculation.",
			],
			"shelter": [
				"On Cold Eclipse, halves incoming Ice move power while its guard is active. Its independent next-damaging-hit guard reduces damage by 20% and then removes Shelter.",
			],
			"tailwind": [
				"After use on Mountain, Snowy Mountain or Cold Eclipse, attempts to start Strong Winds unless harsh sun or heavy rain is active. Mountain and Snowy Mountain extend Tailwind to six turns; the current implementation prints a Persistent activation message for this field extension even without that ability.",
			],
			"auroraveil": [
				"Can be used without hail or snow on Rainbow, Icy, Mirror Arena, Dark Crystal Cavern, Crystal Cavern, Snowy Mountain, Starlight Arena and Cold Eclipse. Mirror Arena extends ordinary Aurora Veil to eight turns and its after-use callback grants one evasion stage if a successful move has been recorded that turn. Royal Decree can still prevent the screen. G-Max-generated veil keeps its separate four-turn duration.",
			],
			"arenitewall": [
				"Can be used without sand on Desert, Rocky Field, Ashen Beach and Cold Eclipse. Desert, Rocky Field and Ashen Beach also extend it to eight turns; Cold Eclipse alone permits use but keeps five turns. Light Clay or Sand Sovereign separately extend it to eight. It halves super-effective attack damage, except critical hits and moves that bypass screens.",
			],
			"nightshade": [
				"On Haunted, fixed damage is 1.5 times the user’s level; on Cold Eclipse it is 140. Verified with level-100 Night Shade: 150 damage on Haunted and 140 on Cold Eclipse. Type immunity still applies.",
			],
		},
	},
	"desertterrain": {
		"abilities": {
			"perfectforesight": [
				"On entry, prioritizes a foe whose active Speed-related ability matches the present conditions, then the highest current Attack or Sp. Atk. The field checks count Sand Rush on Desert/Ashen Beach; Swift Swim on Water Surface/Underwater/Murkwater/Midnight Zone; Slush Rush on Icy/Snowy Mountain/Cold Eclipse; Surge Surfer on Water Surface/Underwater/Murkwater/Short-Circuit/Electric; Quick Feet on Electric; Telepathy on Psychic Field or its aura. Speed Boost is always prioritized. Chlorophyll is checked against effective sun, not its garden exception. It copies the chosen actual ability and runs its entry behavior; Trace, Perfect Foresight and Void Voice are excluded.",
			],
			"forecast": [
				"The current Forecast implementation selects Castform forms from effective weather, not this field alone. Copied/Transformed Pokémon do not change form. Climate Reserve can select its stored weather-rock form when effective weather is absent. Older field-only Forecast references in the source index are superseded; ordinary weather and Utility Umbrella rules still apply.",
			],
			"sandforce": [
				"On Desert or Ashen Beach, Rock, Ground and Steel attacks receive 1.3× power without sandstorm. This is the same conditional bonus as sandstorm and is not multiplied a second time when both are present. Sandstorm chip immunity remains.",
			],
			"sandrush": [
				"On Desert or Ashen Beach, doubles Speed without sandstorm. The field and weather branches do not stack into a second doubling. Sandstorm chip immunity remains.",
			],
			"sandspit": [
				"After a damaging hit, attempts to start sandstorm. On Desert or Ashen Beach, the current loop also attempts −1 accuracy on Pokémon on the holder’s own side, not its opponents, and prints the Sand Spit activation for each attempt. This is an implementation discrepancy, not an opposing-accuracy debuff.",
			],
			"tremor": [
				"On Desert or Ashen Beach, Rock, Ground and Steel attacks receive the Sand Force-style 1.3× modifier without weather. Its separate 1.5× sound modifier can combine with that bonus when the attack qualifies for both. Ground immunity, Bug STAB and the ordinary allied sound protection remain.",
			],
			"auroracurrent": [
				"Entry on Holy, Crystal Cavern, Dark Crystal Cavern, New World, Starlight Arena, Cave, Volcanic or Desert grants +1 Defense and Sp. Def. Its weather-setting call uses Hail, despite older prose calling it Snow. Effective Hail or Snow enables its ordinary never-miss Electric attacks and weather-based defenses; the field bonus itself does not require weather.",
			],
			"eartheater": [
				"At each turn end on Cave or Desert, attempts to heal 1/16 base max HP and prints that the holder swallowed the rocks. Healing prevention or full HP can prevent recovery. Ground-move absorption remains its ordinary separate 1/4-HP effect.",
			],
			"relentlesshunt": [
				"Damaging attacks receive 2× power on Rocky, Fairy Tale, Big Top, Dragon’s Den, Mountain and Snowy Mountain; 1.5× on Desert, Forest, Burning, Superheated, Ashen Beach, Water Surface, Cave, Starlight Arena and New World. Cold Eclipse’s shared handler supplies its 2× damage and raises the priority-eligible base-power threshold from 60 to 80; the ability’s own Cold Eclipse return avoids doubling those modifiers.",
			],
			"dryskin": [
				"Field recovery is independent of weather recovery: 1/16 base max HP each turn on Underwater, Swamp, Misty or grounded Water Surface; 1/8 on Murkwater for a grounded Poison type. Corrosive Mist heals Poison types by 1/8, damages non-Poison/non-Steel holders by 1/8, and leaves Steel types unaffected. Desert deals 1/8 each turn. Successful Water Surface/Underwater healing prints “absorbed some of the water!”; successful Murkwater healing prints “is healed by the poisoned water!”.",
			],
			"desertrift": [
				"Once per battle, entry attempts to create or refresh Desert Field for five turns. The successful creation/refresh prints the corresponding Desert Rift message; switching or regaining the ability does not renew the allowance. Sand Force supplies its usual 1.3× Rock/Ground/Steel power on Desert or in sandstorm, without stacking those conditions. Its fixed moves and other components remain.",
			],
			"wanderingspirit": [
				"On Desert and Haunted fields, lowers its own Speed by one stage at the end of each turn. Its contact-triggered selected-ability swapping remains; species passives are not swapped.",
			],
			"relicarmor": [
				"Desert, Fairy Tale, Cave, Crystal Cavern, New World and Volcanic entry grant +1 Defense and Special Defense. Its Rock-typing weakness protection applies on Rocky, Fairy Tale, Water Surface, Underwater, Murkwater, Midnight Zone, Starlight Arena, New World, Holy, Mountain, Cave, Volcanic, Dragon’s Den, Crystal Cavern and Dark Crystal Cavern. Desert, Icy, Snowy Mountain and Cold Eclipse do not grant that protection by themselves. Aevian Lapras additionally gains Ice typing on Icy/Snowy Mountain/Cold Eclipse or in hail/snow. The visible Rock-protection message announces actual protection and is withheld during Illusion.",
			],
			"royaldecree": [
				"On entry, resets stat stages and screens unless Neutralization blocks the effect; Safeguard protects its side from that reset. Fairy Tale, Chess Board, New World and Starlight Arena additionally raise Defense or Special Defense according to opposing offensive stats: two stages in singles, one otherwise. Chess Board also multiplies both defenses by 1.5 while Neutralization is absent. The reset preserves field-supported positive defenses for Relic Armor/Defeatist on Desert, Fairy Tale, Cave, Crystal Cavern, New World and Volcanic Summit; Magician Special Attack on Fairy Tale, Bewitched Woods, Haunted, Misty and New World; Stalwart Special Attack on New World, Starlight, Fairy Tale and Chess Board. Mirror Arena’s existing Mirror Armor/Iron Dominion evasion boosts survive the reset, but their new evasion boosts are not allowed by the current ongoing exception. The prevention message appears when a stat change is actually blocked.",
			],
			"duneterror": [
				"On fainting, establishes Desert for five turns, or refreshes an existing Desert to five turns. Its Sand Spit component runs on damaging hits; on Desert and Ashen Beach the current shared callback lowers accuracy on the holder’s own side, an existing discrepancy from the intended opponent-facing description. Sand Stream, Shed Skin and its sand-dependent Ground chip retain their independent conditions.",
			],
		},
		"moves": {
			"sandattack": [
				"On Desert and Ashen Beach, lowers Accuracy by two stages.",
			],
			"shoreup": [
				"Restores full maximum HP on Desert or Ashen Beach. Otherwise keeps its usual half-HP heal, or approximately two thirds in sand. On Water Surface, Murkwater or Underwater, successful healing additionally gives a Water Compaction user two Defense stages. It becomes Water type on Water Surface and Water/Poison on Murkwater. After use Underwater, its resurfacing message announces an attempted change to Water Surface.",
			],
			"rockclimb": [
				"On Mountain, Rocky Field, Cave or Desert, gains one critical-rate stage. Its independent Attack/Speed boost against an already confused target remains.",
			],
			"arenitewall": [
				"Can be used without sand on Desert, Rocky Field, Ashen Beach and Cold Eclipse. Desert, Rocky Field and Ashen Beach also extend it to eight turns; Cold Eclipse alone permits use but keeps five turns. Light Clay or Sand Sovereign separately extend it to eight. It halves super-effective attack damage, except critical hits and moves that bypass screens.",
			],
			"dustydrift": [
				"After positive damage, starts sand if sand is not already active. Desert or Ashen Beach extends this newly started sand to eight turns, as Smooth Rock also does; it does not refresh already active sand.",
			],
			"grassyterrain": [
				"Attempts to establish Grassy Field for five turns, or eight with Amplifield Rock. When a different full field already exists and auras are enabled, the shared setter instead creates the corresponding aura. Existing field-lock and ability restrictions apply; the aura and full-field effects are distinct. Grassy Terrain on an existing Flower Garden follows the garden-growth rules rather than replacing it.",
			],
		},
	},
	"murkwatersurfaceterrain": {
		"abilities": {
			"perfectforesight": [
				"On entry, prioritizes a foe whose active Speed-related ability matches the present conditions, then the highest current Attack or Sp. Atk. The field checks count Sand Rush on Desert/Ashen Beach; Swift Swim on Water Surface/Underwater/Murkwater/Midnight Zone; Slush Rush on Icy/Snowy Mountain/Cold Eclipse; Surge Surfer on Water Surface/Underwater/Murkwater/Short-Circuit/Electric; Quick Feet on Electric; Telepathy on Psychic Field or its aura. Speed Boost is always prioritized. Chlorophyll is checked against effective sun, not its garden exception. It copies the chosen actual ability and runs its entry behavior; Trace, Perfect Foresight and Void Voice are excluded.",
			],
			"watercompaction": [
				"Entry on Misty, Corrosive Mist or Murkwater grants +2 Defense. Midnight Zone entry changes its type to Water when type changes are allowed. Water-damage activation on Ashen Beach gives +2 Sp. Def in addition to its normal +2 Defense. At each turn end, Water Surface, Underwater, Murkwater and Swamp grant +2 Defense. The “sharply raised its defense” message accompanies Water hits and the listed water-field activations; stat caps and prevention still apply.",
			],
			"steamengine": [
				"Burning, Superheated and Volcanic grant +6 Speed on entry. Water Surface, Underwater and Volcanic grant +1 Speed each turn. The residual handler’s Murkwater message check is inside an outer condition that excludes Murkwater, so Murkwater alone does not grant that residual boost. Midnight Zone entry changes the holder to Water when allowed. Full Magma Armor is also delegated, including its entry defenses, weather/status rules and Dragon’s Den Fire immunity.",
			],
			"merciless": [
				"On Corrosive, Corrosive Mist, Murkwater Surface and Wasteland, its attacks receive the guaranteed-critical modifier even against an unpoisoned target; effects that prevent critical hits still work. On Chessboard instead, the critical ratio is set to one stage per 20% of the target’s missing base max HP, capped at three; poisoning adds the guaranteed-critical modifier.",
			],
			"dryskin": [
				"Field recovery is independent of weather recovery: 1/16 base max HP each turn on Underwater, Swamp, Misty or grounded Water Surface; 1/8 on Murkwater for a grounded Poison type. Corrosive Mist heals Poison types by 1/8, damages non-Poison/non-Steel holders by 1/8, and leaves Steel types unaffected. Desert deals 1/8 each turn. Successful Water Surface/Underwater healing prints “absorbed some of the water!”; successful Murkwater healing prints “is healed by the poisoned water!”.",
			],
			"poisonheal": [
				"Heals 1/8 base max HP each turn on Corrosive Mist and Murkwater Surface regardless of grounding, or on Corrosive/Wasteland while grounded. Poison is not required for this field recovery; healing in place of poison damage is a separate effect.",
			],
			"toxicboost": [
				"On Corrosive, Murkwater Surface and Wasteland, physical moves gain 1.5× power even if the holder is not poisoned. Poisoning and the field do not stack this bonus.",
			],
			"crosscurrent": [
				"Water Surface, Murkwater Surface, Underwater and Midnight Zone double Speed without requiring rain. Rain plus one of these fields does not stack the Speed bonus. Its alternating physical/special hit bonus remains separate.",
			],
			"crumblingshell": [
				"Water Surface, Murkwater Surface, Underwater and Swamp disable the physical-hit Stealth Rock trigger. Outside them, a physical hit places rocks on the attacker’s side; an allied attacker redirects the placement to the opposing side. Existing rocks are not duplicated.",
			],
			"gooey": [
				"On Murkwater Surface, a qualifying opposing damaging move attempts -4 Speed on its attacker instead of -2, once per move. The accompanying Gooey message describes the Speed change; Contrary can reverse it and ordinary stat-drop protection still applies.",
			],
			"liquidooze": [
				"On Murkwater Surface and Wasteland, draining moves, Leech Seed and Strength Sap damage their user for twice the HP they would have restored instead of restoring it.",
			],
			"schooling": [
				"For an untransformed Wishiwashi at level 20 or higher, Underwater and Midnight Zone force School Form regardless of HP. Water Surface and Murkwater do so only while grounded. Otherwise its normal quarter-HP threshold applies. The check runs on entry and at turn end; School Form recovery remains separate.",
			],
			"seviischooling": [
				"For an untransformed Wishiwashi at level 20 or higher, Underwater and Midnight Zone force Sevii Schooling regardless of HP. Water Surface and Murkwater do so only while grounded. Below level 20 it remains the Sevii solo form; otherwise the normal quarter-HP threshold applies when not forced.",
			],
			"stench": [
				"On Murkwater Surface and Wasteland, adds a 20% flinch chance instead of 10% to damaging moves that do not already have a flinch secondary. It does not add another flinch roll to moves already carrying one.",
			],
			"surgesurfer": [
				"Doubles Speed on Electric Field, Water Surface, Underwater, Murkwater Surface and Short-Circuit. The current list does not include Midnight Zone.",
			],
			"swiftswim": [
				"Doubles Speed on Water Surface, Murkwater Surface, Underwater and Midnight Zone without requiring rain. Effective rain remains an alternative trigger, not an additional multiplier.",
			],
			"wastingsurge": [
				"On Water Surface entry, attempts to convert it to Murkwater Surface. From Underwater, first faints every active non-Poison/non-Steel Pokémon that is not semi-invulnerable, then attempts the Murkwater conversion. Neutralization on either water field stops both effects before they occur. Elsewhere it attempts to establish Wasteland. Its Poison drain and Ground-damage reduction remain separate.",
			],
			"waterabsorb": [
				"Heals 1/16 base max HP at turn end on Underwater, on Water Surface while grounded, or on Murkwater while both grounded and Poison-type. Successful recovery prints “absorbed some of the water!” or “is healed by the poisoned water!” respectively. Water-move absorption remains an independent 1/4 recovery.",
			],
			"zerotohero": [
				"Palafin entering Water Surface, Murkwater Surface, Underwater or Midnight Zone immediately becomes Hero Form without needing to switch out first. This does not add new Hero recovery or ally protection.",
			],
			"fortressshell": [
				"Its Stalwart component raises Special Attack on entry in New World, Starlight Arena, Fairy Tale and Chess Board. Shell Armor adds entry Defense on Fairy Tale or Dragon Den. Its own field-entry effect raises Defense and Special Defense on Fairy Tale, New World, Cold Eclipse or Starlight, tracking changes between fields. New World, Cold Eclipse and Starlight give 1.5x power. Guardian Presence gives allied attacks 1.5x power on Haunted, Bewitched Woods, Holy or Psychic Field (1.3x otherwise), and reduces allied incoming damage by 25%. Electric Aura, Electric Field, Murkwater, Water Surface, Underwater, Midnight Zone, Factory or Short-Circuit activate its Electric redirection/absorption and Attack/Special Attack increases.",
			],
			"pulsewaste": [
				"Claims a three-turn Swamp for Muk-Pulse, or a three-turn Murkwater field for other holders, once per allowed anomaly-field activation. Refresh and replacement obey the shared Pulse Blockade and Neutralization checks. The ability does not add an independent damage multiplier to those fields.",
			],
		},
		"moves": {
			"shoreup": [
				"Restores full maximum HP on Desert or Ashen Beach. Otherwise keeps its usual half-HP heal, or approximately two thirds in sand. On Water Surface, Murkwater or Underwater, successful healing additionally gives a Water Compaction user two Defense stages. It becomes Water type on Water Surface and Water/Poison on Murkwater. After use Underwater, its resurfacing message announces an attempted change to Water Surface.",
			],
			"acidarmor": [
				"Raises Defense by three stages on Corrosive Field, Corrosive Mist, Fairy Tale and Murkwater.",
			],
			"aquaring": [
				"Midnight Zone heals 1/8 maximum HP per turn and returns immediately. Misty, Swamp, Water Surface, Underwater and Murkwater first heal 1/8, then also receive the ordinary 1/16 heal: 3/16 total before rounding. The Water Surface/Underwater restoration message accompanies that first heal. Corrosive Mist instead deals 1/16 damage to non-Poison, non-Steel users; Poison and Steel users receive the normal 1/16 heal.",
			],
			"barbbarrage": [
				"Doubles power on Corrosive Mist, Corrosive Field, Murkwater and Wasteland even without status. A target protected from field effects by Adaptive Cycle does not grant this field-only bonus; an existing major status or Comatose can still qualify independently.",
			],
			"venomdrench": [
				"Corrosive Mist, Corrosive Field, Murkwater and Wasteland remove the poisoned-target requirement. A successful use lowers Attack, Special Attack and Speed by one stage.",
			],
			"venoshock": [
				"Doubles power on Corrosive Mist, Corrosive Field, Murkwater and Wasteland without requiring poison. Adaptive Cycle field protection blocks the field-only bonus; actual poison or bad poison still qualifies.",
			],
			"ickyinjection": [
				"After dealing positive damage, attempts bad poison instead of ordinary poison on Corrosive Mist, Corrosive Field, Murkwater and Wasteland. Status immunity and existing-status rules still apply.",
			],
			"toxicspikes": [
				"On Water Surface or Murkwater, newly placed Toxic Spikes vanish immediately, producing the sinking message. Wasteland removes and records them for its own hazard behavior, producing the waste-swallowed message. On Corrosive Field, grounded Poison types do not absorb existing Toxic Spikes. Steel immunity, Heavy-Duty Boots, Run Away and grounding checks remain.",
			],
			"tarshot": [
				"On Murkwater, adds a guaranteed poison and additional one-stage Speed-drop secondary. On Volcanic Summit, its primary Speed drop becomes two stages. Its Fire-weakness volatile adds two effectiveness stages on Burning Field instead of one, multiplying Fire effectiveness by four rather than two.",
			],
			"lifedew": [
				"Holy and Rainbow increase healing to half maximum HP. Water Surface, Underwater and Midnight Zone instead add Aqua Ring and heal one quarter; adding the ring can succeed at full HP. Corrosive Mist and Murkwater add a guaranteed poison secondary, subject to status rules.",
			],
			"atlantiswall": [
				"Water Surface, Underwater, Midnight Zone, Misty Field and Murkwater permit use without rain and add one move-priority stage. Water Surface, Underwater and Midnight Zone extend it to eight turns; Misty and Murkwater alone keep five. Rain or Light Clay also extend it. The screen halves super-effective attack damage, except critical hits and moves that bypass screens.",
			],
			"purify": [
				"After use on Murkwater, prints the cleared-waters message and attempts to change to Water Surface. This transition is outside the successful status-cure check, so it can occur even when the cure fails.",
			],
			"stealthrock": [
				"New Stealth Rock disappears immediately on Water Surface and Murkwater. Wasteland swallows and records it, printing the pointed-stones message. Existing hazards use the shared field damage rules: Rock plus rotating Fire/Water/Grass/Psychic effectiveness on Crystal Cavern; doubled Rock effectiveness stages on Rocky Field/Cave; Fire effectiveness on Dragon Den/Volcanic with the molten-rocks message; Ice effectiveness on Cold Eclipse with the frozen-rocks message. Boots, Run Away and the existing Parasitism protection remain.",
			],
			"tidyup": [
				"On Murkwater, each execution of its hit callback advances a shared Tidy Up counter; the second attempts to change to Water Surface. The counter advances even if no hazard or Substitute was removed. Its ordinary Attack/Speed boost remains.",
			],
			"gmaxfoamburst": [
				"Its opposing Speed drops become four stages on Murkwater, three on Water Surface, and two elsewhere.",
			],
			"spikes": [
				"New Spikes vanish on Water Surface or Murkwater, printing the sinking message. On Electric Field, they also affect airborne entrants, subject to Electric immunity, Boots, Run Away and existing Parasitism protection. The current Electric damage formula uses the signed effectiveness stage directly, not a normal type multiplier: one-layer tests dealt 42 HP to Water/Flying Mew, zero to neutral Normal or immune Ground Mew, and one HP to resistant Grass Mew. This is an existing formula discrepancy, not standard Electric-type hazard damage.",
			],
		},
	},
	"shortcircuitterrain": {
		"abilities": {
			"perfectforesight": [
				"On entry, prioritizes a foe whose active Speed-related ability matches the present conditions, then the highest current Attack or Sp. Atk. The field checks count Sand Rush on Desert/Ashen Beach; Swift Swim on Water Surface/Underwater/Murkwater/Midnight Zone; Slush Rush on Icy/Snowy Mountain/Cold Eclipse; Surge Surfer on Water Surface/Underwater/Murkwater/Short-Circuit/Electric; Quick Feet on Electric; Telepathy on Psychic Field or its aura. Speed Boost is always prioritized. Chlorophyll is checked against effective sun, not its garden exception. It copies the chosen actual ability and runs its entry behavior; Trace, Perfect Foresight and Void Voice are excluded.",
			],
			"defragment": [
				"On Cold Eclipse and Fairy Tale entry, raises both Defense and Special Defense by one stage. On Factory, Short-Circuit, Glitch, New World and Starlight Arena, compares all living foes’ combined Attack and Special Attack and raises the corresponding defense by two stages (Defense wins a tie), instead of the ordinary one-stage increase. Its attacks still cannot miss.",
			],
			"armorize": [
				"Eligible Normal moves become Steel. The conversion bonus is 1.5× on Factory, Short-Circuit, Fairy Tale, Dragon’s Den, Starlight Arena, New World and Holy, instead of 1.2×. Cold Eclipse grants hail immunity but does not increase that conversion bonus. Variable-type moves retain their normal conversion exclusions.",
			],
			"argentdevotion": [
				"Its Armorize conversion gives 1.5× power on Factory, Short-Circuit, Fairy Tale, Dragon’s Den, Starlight Arena, New World and Holy, instead of 1.2×. Cold Eclipse grants hail immunity. On Fairy Tale entry, Sworn Duty heals each adjacent living ally by 1/3 base max HP instead of 1/4. Its other components remain active.",
			],
			"gulpmissile": [
				"Water Surface and Underwater force eligible Cramorant into Gulping on entry or field change. Surf loads Gorging on Electric, Factory and Short-Circuit regardless of HP; Swamp retains the ordinary HP-based result. Underwater discharge deals 1/4 of the attacker’s base max HP scaled by ordinary Water effectiveness, and Water immunity prevents that damage. Elsewhere discharge keeps its ordinary quarter-HP damage. Gulping still lowers Defense; Gorging still attempts paralysis.",
			],
			"motordrive": [
				"Absorbing another Pokémon’s Electric move grants +2 Speed on Factory or Short-Circuit instead of +1. On Electric Field, additionally gains +1 Speed at the end of each turn.",
			],
			"steelworker": [
				"On Factory, Steel attacks use 2× Attack or Special Attack instead of 1.5×. On Short-Circuit, Steel moves gain Electric as an additional type. Steel STAB and its separate defensive Steel resistances remain.",
			],
			"surgesurfer": [
				"Doubles Speed on Electric Field, Water Surface, Underwater, Murkwater Surface and Short-Circuit. The current list does not include Midnight Zone.",
			],
			"static": [
				"Electric Field and Short-Circuit raise its contact paralysis chance from 30% to 60%.",
			],
			"pulsebulwark": [
				"Once per battle per holder, entry attempts to create or refresh Short-Circuit for exactly three turns. A blocked attempt spends the allowance; Amplifield Rock does not extend it. Mr. Mime-Pulse receives its four fixed moves; screen priority and successful-screen status curing remain separate.",
			],
			"voltabsorb": [
				"At turn end on Electric Field or Short-Circuit, heals 1/16 base max HP. Absorbing another Pokémon’s Electric move remains an independent 1/4 recovery.",
			],
			"duskilate": [
				"Eligible Normal moves become Fairy on Holy and Rainbow, otherwise Dark. Their conversion bonus is 1.5× on Dark Crystal Cavern, New World, Starlight Arena, Cold Eclipse, Short-Circuit, Haunted, Bewitched Woods, Holy and Rainbow, instead of 1.3×. Cold Eclipse additionally grants hail immunity. Cold Eclipse also recognizes Duskilate for its 1.5× defenses and exemption from the grounded Speed penalty.",
			],
			"execution": [
				"Eligible Normal moves become Fairy on Holy and Rainbow, otherwise Dark. Their conversion bonus is 1.5× on Dark Crystal Cavern, New World, Starlight Arena, Cold Eclipse, Short-Circuit, Haunted, Bewitched Woods, Holy and Rainbow, instead of 1.3×. Cold Eclipse additionally grants hail immunity. While any base field exists, its current stat-change handler blocks Speed drops, including self-caused drops; its Attack/Special Attack floor and KO healing remain separate.",
			],
			"woolyconductor": [
				"The current package has no additional Electric Field or Short-Circuit paralysis effect. Its contact mitigation, Fire vulnerability, Mold Breaker and once-per-turn contact-attacker Speed drop operate normally here.",
			],
			"fortressshell": [
				"Its Stalwart component raises Special Attack on entry in New World, Starlight Arena, Fairy Tale and Chess Board. Shell Armor adds entry Defense on Fairy Tale or Dragon Den. Its own field-entry effect raises Defense and Special Defense on Fairy Tale, New World, Cold Eclipse or Starlight, tracking changes between fields. New World, Cold Eclipse and Starlight give 1.5x power. Guardian Presence gives allied attacks 1.5x power on Haunted, Bewitched Woods, Holy or Psychic Field (1.3x otherwise), and reduces allied incoming damage by 25%. Electric Aura, Electric Field, Murkwater, Water Surface, Underwater, Midnight Zone, Factory or Short-Circuit activate its Electric redirection/absorption and Attack/Special Attack increases.",
			],
		},
		"moves": {
			"magnetrise": [
				"Lasts eight turns on Electric Field, Short-Circuit and Factory instead of five. Smack Down, Ingrain and Gravity still prevent it.",
			],
			"metalsound": [
				"On Short-Circuit and Factory, lowers Special Defense by three stages.",
			],
		},
	},
	"snowymountainterrain": {
		"abilities": {
			"perfectforesight": [
				"On entry, prioritizes a foe whose active Speed-related ability matches the present conditions, then the highest current Attack or Sp. Atk. The field checks count Sand Rush on Desert/Ashen Beach; Swift Swim on Water Surface/Underwater/Murkwater/Midnight Zone; Slush Rush on Icy/Snowy Mountain/Cold Eclipse; Surge Surfer on Water Surface/Underwater/Murkwater/Short-Circuit/Electric; Quick Feet on Electric; Telepathy on Psychic Field or its aura. Speed Boost is always prioritized. Chlorophyll is checked against effective sun, not its garden exception. It copies the chosen actual ability and runs its entry behavior; Trace, Perfect Foresight and Void Voice are excluded.",
			],
			"forecast": [
				"The current Forecast implementation selects Castform forms from effective weather, not this field alone. Copied/Transformed Pokémon do not change form. Climate Reserve can select its stored weather-rock form when effective weather is absent. Older field-only Forecast references in the source index are superseded; ordinary weather and Utility Umbrella rules still apply.",
			],
			"zenmode": [
				"Standard Darmanitan is forced into Zen on Ashen Beach or Psychic Field; Galarian Darmanitan is forced into Galar-Zen on Icy, Snowy Mountain or Cold Eclipse. These checks run on entry, field change and turn end, regardless of HP. Transformed Pokémon are excluded. Outside the matching fields, the usual half-HP form condition applies.",
			],
			"sinisterblaze": [
				"Fairy Tale, Starlight Arena, New World, Burning, Volcanic, Superheated and Cold Eclipse grant +1 Defense and Sp. Def on entry. Snowy Mountain, Icy and Cold Eclipse add Ice typing while this is the active ability, except for Abysseon and Divineon; this is not a blanket passive typing grant. Its ordinary self-burn, burn recovery and opposing chip remain separate.",
			],
			"echofiend": [
				"Eligible sound attacks become Fire on Volcanic, Crystal on Crystal Cavern, and Flying otherwise. Sound attacks receive 2× power on Cave, Volcanic and Crystal Cavern; Mountain and Snowy Mountain use its ordinary 1.5× bonus. Type-changing exclusions still apply to special variable-type moves, damaging Z moves and a Terastallized Tera Blast. The sound immunity and allied sound protection remain.",
			],
			"powerdrill": [
				"Drill and horn moves receive 2× power and bypass Protect-style protection on Rocky, Mountain, Snowy Mountain, Cave and Volcanic, instead of the usual 1.5×. Cold Eclipse is not one of these five enhanced fields; its shared move-flag rules are documented separately. Dual Wield/Sharpness overlap uses the existing combined multiplier path, not an extra duplicate Power Drill bonus.",
			],
			"hyperdrill": [
				"Delegates the full Power Drill field package: drill/horn moves receive 2× power and bypass protection on Rocky, Mountain, Snowy Mountain, Cave and Volcanic. Its separate positive-defense-stage bypass remains. Native Power Drill is not applied twice.",
			],
			"relentlesshunt": [
				"Damaging attacks receive 2× power on Rocky, Fairy Tale, Big Top, Dragon’s Den, Mountain and Snowy Mountain; 1.5× on Desert, Forest, Burning, Superheated, Ashen Beach, Water Surface, Cave, Starlight Arena and New World. Cold Eclipse’s shared handler supplies its 2× damage and raises the priority-eligible base-power threshold from 60 to 80; the ability’s own Cold Eclipse return avoids doubling those modifiers.",
			],
			"windysurge": [
				"On Mountain, Snowy Mountain or Cold Eclipse entry, also attempts to summon strong winds, unless Desolate Land or Primordial Sea is active. Its two-turn Tailwind still applies. Refreshing an existing Tailwind attempts +1 Special Attack for Wind Power/Hisuian Vanguard allies and +1 Attack for Wind Rider/Unova Vanguard/Scarecrow allies.",
			],
			"galewings": [
				"During unsuppressed Strong Winds on any field, Gale Wings gives +1 priority to all moves at any HP. Otherwise, only Flying moves at 75% HP or higher receive the bonus.",
			],
			"icebody": [
				"Heals 1/16 base max HP each turn on Icy, Snowy Mountain and Cold Eclipse when hail/snow is not already supplying its weather recovery. Hail on Cold Eclipse heals 1/8 instead of 1/16. Hail immunity and the ordinary 30% contact frostbite chance remain.",
			],
			"icescales": [
				"Cold Eclipse doubles Defense. Mirror Arena entry grants +2 evasion. On Icy and Snowy Mountain, super-effective contributions from the holder’s Ice typing are neutralized; weaknesses from another type remain. Its ordinary halving of special damage and hail immunity remain.",
			],
			"slushrush": [
				"Speed is doubled on Icy, Snowy Mountain and Cold Eclipse even without hail or snow. Having both the weather and field does not double it a second time.",
			],
			"amethystglow": [
				"Its Ice Body component heals 1/16 base max HP each turn on Icy, Snowy Mountain and Cold Eclipse without hail/snow; hail on Cold Eclipse heals 1/8 instead. The field also adds Ice typing if absent. Its Normal-to-Ice conversion gains 1.5× power on Icy and Snowy Mountain, but remains 1.2× on Cold Eclipse. Its no-miss and contact-frostbite effects remain.",
			],
			"aerilate": [
				"On Mountain and Snowy Mountain, eligible Normal moves converted to Flying gain 1.5× power instead of 1.2×. The ordinary variable-type, Z-Move and Terastallized Tera Blast exclusions remain.",
			],
			"windpower": [
				"During effective Strong Winds on any field, gains +1 Attack and +1 Special Attack at turn end. Its wind-move absorption and Tailwind activation are independent triggers.",
			],
			"windrider": [
				"During effective Strong Winds on any field, gains +1 Attack and +1 Special Attack at turn end. Its wind-move absorption and Tailwind activation are independent triggers.",
			],
			"refrigerate": [
				"On Icy and Snowy Mountain, eligible Normal moves converted to Ice gain 1.5× power instead of 1.2×. Its ordinary variable-type, damaging Z-Move and Terastallized Tera Blast exclusions remain.",
			],
			"pulseblockade": [
				"Once per battle per holder, entry attempts to create or refresh Snowy Mountain for exactly three turns. A blocked attempt spends the allowance and Amplifield Rock does not extend it. While the ability remains effective, its separate field lock prevents new/replacement fields; auras, natural expiry and restoration of an underlying field still work.",
			],
			"predator": [
				"Against newly switched or still-pending-action targets, its ordinary conditional power multiplier becomes 2× on Mountain, Snowy Mountain and Rocky, or 1.5× on Fairy Tale, Dragon’s Den and Big Top. Its 2× authority/Ultra matchup bonuses replace this conditional bonus rather than stacking with it; Ultra matchups are disabled on Bewitched Woods, Haunted and Holy.",
			],
			"relicarmor": [
				"Desert, Fairy Tale, Cave, Crystal Cavern, New World and Volcanic entry grant +1 Defense and Special Defense. Its Rock-typing weakness protection applies on Rocky, Fairy Tale, Water Surface, Underwater, Murkwater, Midnight Zone, Starlight Arena, New World, Holy, Mountain, Cave, Volcanic, Dragon’s Den, Crystal Cavern and Dark Crystal Cavern. Desert, Icy, Snowy Mountain and Cold Eclipse do not grant that protection by themselves. Aevian Lapras additionally gains Ice typing on Icy/Snowy Mountain/Cold Eclipse or in hail/snow. The visible Rock-protection message announces actual protection and is withheld during Illusion.",
			],
			"mindfreeze": [
				"Its Ice Body recovery heals 1/16 base max HP on Icy, Snowy Mountain and Cold Eclipse without hail/snow; hail on Cold Eclipse heals 1/8. Cold Eclipse also recognizes Mind Freeze for 1.5× Defense/Special Defense and exemption from its grounded Speed penalty. Ordinary Ice absorption and Psychic frostbite effects remain.",
			],
		},
		"moves": {
			"tailwind": [
				"After use on Mountain, Snowy Mountain or Cold Eclipse, attempts to start Strong Winds unless harsh sun or heavy rain is active. Mountain and Snowy Mountain extend Tailwind to six turns; the current implementation prints a Persistent activation message for this field extension even without that ability.",
			],
			"auroraveil": [
				"Can be used without hail or snow on Rainbow, Icy, Mirror Arena, Dark Crystal Cavern, Crystal Cavern, Snowy Mountain, Starlight Arena and Cold Eclipse. Mirror Arena extends ordinary Aurora Veil to eight turns and its after-use callback grants one evasion stage if a successful move has been recorded that turn. Royal Decree can still prevent the screen. G-Max-generated veil keeps its separate four-turn duration.",
			],
			"mountaingale": [
				"On Icy, Mountain and Snowy Mountain, base accuracy becomes 100%; accuracy/evasion modifiers still apply.",
			],
			"thunder": [
				"Mountain and Snowy Mountain bypass accuracy checks, overriding the usual sun accuracy penalty.",
			],
		},
	},
	"midnightzoneterrain": {
		"abilities": {
			"perfectforesight": [
				"On entry, prioritizes a foe whose active Speed-related ability matches the present conditions, then the highest current Attack or Sp. Atk. The field checks count Sand Rush on Desert/Ashen Beach; Swift Swim on Water Surface/Underwater/Murkwater/Midnight Zone; Slush Rush on Icy/Snowy Mountain/Cold Eclipse; Surge Surfer on Water Surface/Underwater/Murkwater/Short-Circuit/Electric; Quick Feet on Electric; Telepathy on Psychic Field or its aura. Speed Boost is always prioritized. Chlorophyll is checked against effective sun, not its garden exception. It copies the chosen actual ability and runs its entry behavior; Trace, Perfect Foresight and Void Voice are excluded.",
			],
			"watercompaction": [
				"Entry on Misty, Corrosive Mist or Murkwater grants +2 Defense. Midnight Zone entry changes its type to Water when type changes are allowed. Water-damage activation on Ashen Beach gives +2 Sp. Def in addition to its normal +2 Defense. At each turn end, Water Surface, Underwater, Murkwater and Swamp grant +2 Defense. The “sharply raised its defense” message accompanies Water hits and the listed water-field activations; stat caps and prevention still apply.",
			],
			"steamengine": [
				"Burning, Superheated and Volcanic grant +6 Speed on entry. Water Surface, Underwater and Volcanic grant +1 Speed each turn. The residual handler’s Murkwater message check is inside an outer condition that excludes Murkwater, so Murkwater alone does not grant that residual boost. Midnight Zone entry changes the holder to Water when allowed. Full Magma Armor is also delegated, including its entry defenses, weather/status rules and Dragon’s Den Fire immunity.",
			],
			"crosscurrent": [
				"Water Surface, Murkwater Surface, Underwater and Midnight Zone double Speed without requiring rain. Rain plus one of these fields does not stack the Speed bonus. Its alternating physical/special hit bonus remains separate.",
			],
			"schooling": [
				"For an untransformed Wishiwashi at level 20 or higher, Underwater and Midnight Zone force School Form regardless of HP. Water Surface and Murkwater do so only while grounded. Otherwise its normal quarter-HP threshold applies. The check runs on entry and at turn end; School Form recovery remains separate.",
			],
			"seviischooling": [
				"For an untransformed Wishiwashi at level 20 or higher, Underwater and Midnight Zone force Sevii Schooling regardless of HP. Water Surface and Murkwater do so only while grounded. Below level 20 it remains the Sevii solo form; otherwise the normal quarter-HP threshold applies when not forced.",
			],
			"swiftswim": [
				"Doubles Speed on Water Surface, Murkwater Surface, Underwater and Midnight Zone without requiring rain. Effective rain remains an alternative trigger, not an additional multiplier.",
			],
			"zerotohero": [
				"Palafin entering Water Surface, Murkwater Surface, Underwater or Midnight Zone immediately becomes Hero Form without needing to switch out first. This does not add new Hero recovery or ally protection.",
			],
			"hydration": [
				"At turn end on Water Surface, Underwater or Midnight Zone, cures major status without requiring rain or grounding. It prints “[Pokémon]’s Hydration cured its [status] problem!” when this field-based cure occurs. Murkwater is not included.",
			],
			"propellertail": [
				"Doubles Speed on Water Surface, Underwater and Midnight Zone. Its ordinary redirection bypass remains.",
			],
			"torrent": [
				"On Water Surface, Underwater and Midnight Zone, Water attacks use 1.5× Attack or Special Attack at any HP. Low HP remains an alternative trigger elsewhere, not another multiplier.",
			],
			"fortressshell": [
				"Its Stalwart component raises Special Attack on entry in New World, Starlight Arena, Fairy Tale and Chess Board. Shell Armor adds entry Defense on Fairy Tale or Dragon Den. Its own field-entry effect raises Defense and Special Defense on Fairy Tale, New World, Cold Eclipse or Starlight, tracking changes between fields. New World, Cold Eclipse and Starlight give 1.5x power. Guardian Presence gives allied attacks 1.5x power on Haunted, Bewitched Woods, Holy or Psychic Field (1.3x otherwise), and reduces allied incoming damage by 25%. Electric Aura, Electric Field, Murkwater, Water Surface, Underwater, Midnight Zone, Factory or Short-Circuit activate its Electric redirection/absorption and Attack/Special Attack increases.",
			],
		},
		"moves": {
			"aquaring": [
				"Midnight Zone heals 1/8 maximum HP per turn and returns immediately. Misty, Swamp, Water Surface, Underwater and Murkwater first heal 1/8, then also receive the ordinary 1/16 heal: 3/16 total before rounding. The Water Surface/Underwater restoration message accompanies that first heal. Corrosive Mist instead deals 1/16 damage to non-Poison, non-Steel users; Poison and Steel users receive the normal 1/16 heal.",
			],
			"lifedew": [
				"Holy and Rainbow increase healing to half maximum HP. Water Surface, Underwater and Midnight Zone instead add Aqua Ring and heal one quarter; adding the ring can succeed at full HP. Corrosive Mist and Murkwater add a guaranteed poison secondary, subject to status rules.",
			],
			"atlantiswall": [
				"Water Surface, Underwater, Midnight Zone, Misty Field and Murkwater permit use without rain and add one move-priority stage. Water Surface, Underwater and Midnight Zone extend it to eight turns; Misty and Murkwater alone keep five. Rain or Light Clay also extend it. The screen halves super-effective attack damage, except critical hits and moves that bypass screens.",
			],
			"dive": [
				"On Water Surface, Underwater and Midnight Zone, skips the charge turn. On Water Surface/Underwater, Cramorant’s Gulp Missile selects Gulping form regardless of low HP. Its preparation/attack animation still plays.",
			],
			"phantomforce": [
				"A successful hit Underwater changes the field to Midnight Zone. Haunted independently removes its charge turn; Midnight Zone itself is the transition destination, not an extra charge-skip condition in this move.",
			],
		},
	},
	"underwaterterrain": {
		"abilities": {
			"perfectforesight": [
				"On entry, prioritizes a foe whose active Speed-related ability matches the present conditions, then the highest current Attack or Sp. Atk. The field checks count Sand Rush on Desert/Ashen Beach; Swift Swim on Water Surface/Underwater/Murkwater/Midnight Zone; Slush Rush on Icy/Snowy Mountain/Cold Eclipse; Surge Surfer on Water Surface/Underwater/Murkwater/Short-Circuit/Electric; Quick Feet on Electric; Telepathy on Psychic Field or its aura. Speed Boost is always prioritized. Chlorophyll is checked against effective sun, not its garden exception. It copies the chosen actual ability and runs its entry behavior; Trace, Perfect Foresight and Void Voice are excluded.",
			],
			"watercompaction": [
				"Entry on Misty, Corrosive Mist or Murkwater grants +2 Defense. Midnight Zone entry changes its type to Water when type changes are allowed. Water-damage activation on Ashen Beach gives +2 Sp. Def in addition to its normal +2 Defense. At each turn end, Water Surface, Underwater, Murkwater and Swamp grant +2 Defense. The “sharply raised its defense” message accompanies Water hits and the listed water-field activations; stat caps and prevention still apply.",
			],
			"steamengine": [
				"Burning, Superheated and Volcanic grant +6 Speed on entry. Water Surface, Underwater and Volcanic grant +1 Speed each turn. The residual handler’s Murkwater message check is inside an outer condition that excludes Murkwater, so Murkwater alone does not grant that residual boost. Midnight Zone entry changes the holder to Water when allowed. Full Magma Armor is also delegated, including its entry defenses, weather/status rules and Dragon’s Den Fire immunity.",
			],
			"pressure": [
				"On entry into Underwater, attempts to change the field to Midnight Zone; targeting the holder there costs two extra PP instead of one. Cold Eclipse entry attempts -2 Defense and Special Defense against each foe, blocked by Substitute and ordinary stat-drop protections. These Cold Eclipse attempts repeat on entry and do not spend the ordinary once-per-opponent-per-user battle allowance.",
			],
			"dryskin": [
				"Field recovery is independent of weather recovery: 1/16 base max HP each turn on Underwater, Swamp, Misty or grounded Water Surface; 1/8 on Murkwater for a grounded Poison type. Corrosive Mist heals Poison types by 1/8, damages non-Poison/non-Steel holders by 1/8, and leaves Steel types unaffected. Desert deals 1/8 each turn. Successful Water Surface/Underwater healing prints “absorbed some of the water!”; successful Murkwater healing prints “is healed by the poisoned water!”.",
			],
			"gulpmissile": [
				"Water Surface and Underwater force eligible Cramorant into Gulping on entry or field change. Surf loads Gorging on Electric, Factory and Short-Circuit regardless of HP; Swamp retains the ordinary HP-based result. Underwater discharge deals 1/4 of the attacker’s base max HP scaled by ordinary Water effectiveness, and Water immunity prevents that damage. Elsewhere discharge keeps its ordinary quarter-HP damage. Gulping still lowers Defense; Gorging still attempts paralysis.",
			],
			"crosscurrent": [
				"Water Surface, Murkwater Surface, Underwater and Midnight Zone double Speed without requiring rain. Rain plus one of these fields does not stack the Speed bonus. Its alternating physical/special hit bonus remains separate.",
			],
			"crumblingshell": [
				"Water Surface, Murkwater Surface, Underwater and Swamp disable the physical-hit Stealth Rock trigger. Outside them, a physical hit places rocks on the attacker’s side; an allied attacker redirects the placement to the opposing side. Existing rocks are not duplicated.",
			],
			"schooling": [
				"For an untransformed Wishiwashi at level 20 or higher, Underwater and Midnight Zone force School Form regardless of HP. Water Surface and Murkwater do so only while grounded. Otherwise its normal quarter-HP threshold applies. The check runs on entry and at turn end; School Form recovery remains separate.",
			],
			"seviischooling": [
				"For an untransformed Wishiwashi at level 20 or higher, Underwater and Midnight Zone force Sevii Schooling regardless of HP. Water Surface and Murkwater do so only while grounded. Below level 20 it remains the Sevii solo form; otherwise the normal quarter-HP threshold applies when not forced.",
			],
			"surgesurfer": [
				"Doubles Speed on Electric Field, Water Surface, Underwater, Murkwater Surface and Short-Circuit. The current list does not include Midnight Zone.",
			],
			"swiftswim": [
				"Doubles Speed on Water Surface, Murkwater Surface, Underwater and Midnight Zone without requiring rain. Effective rain remains an alternative trigger, not an additional multiplier.",
			],
			"wastingsurge": [
				"On Water Surface entry, attempts to convert it to Murkwater Surface. From Underwater, first faints every active non-Poison/non-Steel Pokémon that is not semi-invulnerable, then attempts the Murkwater conversion. Neutralization on either water field stops both effects before they occur. Elsewhere it attempts to establish Wasteland. Its Poison drain and Ground-damage reduction remain separate.",
			],
			"zerotohero": [
				"Palafin entering Water Surface, Murkwater Surface, Underwater or Midnight Zone immediately becomes Hero Form without needing to switch out first. This does not add new Hero recovery or ally protection.",
			],
			"hydration": [
				"At turn end on Water Surface, Underwater or Midnight Zone, cures major status without requiring rain or grounding. It prints “[Pokémon]’s Hydration cured its [status] problem!” when this field-based cure occurs. Murkwater is not included.",
			],
			"torrent": [
				"On Water Surface, Underwater and Midnight Zone, Water attacks use 1.5× Attack or Special Attack at any HP. Low HP remains an alternative trigger elsewhere, not another multiplier.",
			],
			"stormdrain": [
				"On Underwater, its explicit Water immunity also applies through the type-immunity check, in addition to its ordinary Water-hit absorption, redirection and +1 Attack/Special Attack.",
			],
			"waterveil": [
				"At turn end on Water Surface or Underwater, cures any major status and prints “[Pokémon]’s Water Veil cured its [status] problem!”. Its ordinary burn protection, weather immunity and entry Aqua Ring remain.",
			],
			"fortressshell": [
				"Its Stalwart component raises Special Attack on entry in New World, Starlight Arena, Fairy Tale and Chess Board. Shell Armor adds entry Defense on Fairy Tale or Dragon Den. Its own field-entry effect raises Defense and Special Defense on Fairy Tale, New World, Cold Eclipse or Starlight, tracking changes between fields. New World, Cold Eclipse and Starlight give 1.5x power. Guardian Presence gives allied attacks 1.5x power on Haunted, Bewitched Woods, Holy or Psychic Field (1.3x otherwise), and reduces allied incoming damage by 25%. Electric Aura, Electric Field, Murkwater, Water Surface, Underwater, Midnight Zone, Factory or Short-Circuit activate its Electric redirection/absorption and Attack/Special Attack increases.",
			],
		},
		"moves": {
			"shoreup": [
				"Restores full maximum HP on Desert or Ashen Beach. Otherwise keeps its usual half-HP heal, or approximately two thirds in sand. On Water Surface, Murkwater or Underwater, successful healing additionally gives a Water Compaction user two Defense stages. It becomes Water type on Water Surface and Water/Poison on Murkwater. After use Underwater, its resurfacing message announces an attempted change to Water Surface.",
			],
			"aquaring": [
				"Midnight Zone heals 1/8 maximum HP per turn and returns immediately. Misty, Swamp, Water Surface, Underwater and Murkwater first heal 1/8, then also receive the ordinary 1/16 heal: 3/16 total before rounding. The Water Surface/Underwater restoration message accompanies that first heal. Corrosive Mist instead deals 1/16 damage to non-Poison, non-Steel users; Poison and Steel users receive the normal 1/16 heal.",
			],
			"takeheart": [
				"On New World, Starlight Arena, Psychic Field, Water Surface and Underwater, raises Special Attack and Special Defense by two stages. Its major-status cure remains.",
			],
			"lifedew": [
				"Holy and Rainbow increase healing to half maximum HP. Water Surface, Underwater and Midnight Zone instead add Aqua Ring and heal one quarter; adding the ring can succeed at full HP. Corrosive Mist and Murkwater add a guaranteed poison secondary, subject to status rules.",
			],
			"atlantiswall": [
				"Water Surface, Underwater, Midnight Zone, Misty Field and Murkwater permit use without rain and add one move-priority stage. Water Surface, Underwater and Midnight Zone extend it to eight turns; Misty and Murkwater alone keep five. Rain or Light Clay also extend it. The screen halves super-effective attack damage, except critical hits and moves that bypass screens.",
			],
			"phantomforce": [
				"A successful hit Underwater changes the field to Midnight Zone. Haunted independently removes its charge turn; Midnight Zone itself is the transition destination, not an extra charge-skip condition in this move.",
			],
			"octolock": [
				"Underwater increases its recurring Defense and Special Defense drops to two stages each. Its existing one-stage Speed drop remains. The lock ends when its source leaves or faints, following its current active-turn check.",
			],
			"wavecrash": [
				"On Water Surface and Underwater, recoil becomes one quarter of damage dealt.",
			],
			"whirlpool": [
				"On Water Surface and Underwater, adds guaranteed confusion after a successful hit, subject to secondary and confusion protections. Its binding effect remains.",
			],
		},
		"items": {
			"absorbbulb": [
				"On entry while Misty Field, Water Surface or Underwater is active, attempts to consume itself for one Special Attack stage. The ordinary damaging Water-hit trigger remains. This entry callback does not itself add a field-change trigger.",
			],
		},
	},
	"watersurfaceterrain": {
		"abilities": {
			"perfectforesight": [
				"On entry, prioritizes a foe whose active Speed-related ability matches the present conditions, then the highest current Attack or Sp. Atk. The field checks count Sand Rush on Desert/Ashen Beach; Swift Swim on Water Surface/Underwater/Murkwater/Midnight Zone; Slush Rush on Icy/Snowy Mountain/Cold Eclipse; Surge Surfer on Water Surface/Underwater/Murkwater/Short-Circuit/Electric; Quick Feet on Electric; Telepathy on Psychic Field or its aura. Speed Boost is always prioritized. Chlorophyll is checked against effective sun, not its garden exception. It copies the chosen actual ability and runs its entry behavior; Trace, Perfect Foresight and Void Voice are excluded.",
			],
			"watercompaction": [
				"Entry on Misty, Corrosive Mist or Murkwater grants +2 Defense. Midnight Zone entry changes its type to Water when type changes are allowed. Water-damage activation on Ashen Beach gives +2 Sp. Def in addition to its normal +2 Defense. At each turn end, Water Surface, Underwater, Murkwater and Swamp grant +2 Defense. The “sharply raised its defense” message accompanies Water hits and the listed water-field activations; stat caps and prevention still apply.",
			],
			"steamengine": [
				"Burning, Superheated and Volcanic grant +6 Speed on entry. Water Surface, Underwater and Volcanic grant +1 Speed each turn. The residual handler’s Murkwater message check is inside an outer condition that excludes Murkwater, so Murkwater alone does not grant that residual boost. Midnight Zone entry changes the holder to Water when allowed. Full Magma Armor is also delegated, including its entry defenses, weather/status rules and Dragon’s Den Fire immunity.",
			],
			"relentlesshunt": [
				"Damaging attacks receive 2× power on Rocky, Fairy Tale, Big Top, Dragon’s Den, Mountain and Snowy Mountain; 1.5× on Desert, Forest, Burning, Superheated, Ashen Beach, Water Surface, Cave, Starlight Arena and New World. Cold Eclipse’s shared handler supplies its 2× damage and raises the priority-eligible base-power threshold from 60 to 80; the ability’s own Cold Eclipse return avoids doubling those modifiers.",
			],
			"dryskin": [
				"Field recovery is independent of weather recovery: 1/16 base max HP each turn on Underwater, Swamp, Misty or grounded Water Surface; 1/8 on Murkwater for a grounded Poison type. Corrosive Mist heals Poison types by 1/8, damages non-Poison/non-Steel holders by 1/8, and leaves Steel types unaffected. Desert deals 1/8 each turn. Successful Water Surface/Underwater healing prints “absorbed some of the water!”; successful Murkwater healing prints “is healed by the poisoned water!”.",
			],
			"gulpmissile": [
				"Water Surface and Underwater force eligible Cramorant into Gulping on entry or field change. Surf loads Gorging on Electric, Factory and Short-Circuit regardless of HP; Swamp retains the ordinary HP-based result. Underwater discharge deals 1/4 of the attacker’s base max HP scaled by ordinary Water effectiveness, and Water immunity prevents that damage. Elsewhere discharge keeps its ordinary quarter-HP damage. Gulping still lowers Defense; Gorging still attempts paralysis.",
			],
			"crosscurrent": [
				"Water Surface, Murkwater Surface, Underwater and Midnight Zone double Speed without requiring rain. Rain plus one of these fields does not stack the Speed bonus. Its alternating physical/special hit bonus remains separate.",
			],
			"crumblingshell": [
				"Water Surface, Murkwater Surface, Underwater and Swamp disable the physical-hit Stealth Rock trigger. Outside them, a physical hit places rocks on the attacker’s side; an allied attacker redirects the placement to the opposing side. Existing rocks are not duplicated.",
			],
			"schooling": [
				"For an untransformed Wishiwashi at level 20 or higher, Underwater and Midnight Zone force School Form regardless of HP. Water Surface and Murkwater do so only while grounded. Otherwise its normal quarter-HP threshold applies. The check runs on entry and at turn end; School Form recovery remains separate.",
			],
			"seviischooling": [
				"For an untransformed Wishiwashi at level 20 or higher, Underwater and Midnight Zone force Sevii Schooling regardless of HP. Water Surface and Murkwater do so only while grounded. Below level 20 it remains the Sevii solo form; otherwise the normal quarter-HP threshold applies when not forced.",
			],
			"surgesurfer": [
				"Doubles Speed on Electric Field, Water Surface, Underwater, Murkwater Surface and Short-Circuit. The current list does not include Midnight Zone.",
			],
			"swiftswim": [
				"Doubles Speed on Water Surface, Murkwater Surface, Underwater and Midnight Zone without requiring rain. Effective rain remains an alternative trigger, not an additional multiplier.",
			],
			"wastingsurge": [
				"On Water Surface entry, attempts to convert it to Murkwater Surface. From Underwater, first faints every active non-Poison/non-Steel Pokémon that is not semi-invulnerable, then attempts the Murkwater conversion. Neutralization on either water field stops both effects before they occur. Elsewhere it attempts to establish Wasteland. Its Poison drain and Ground-damage reduction remain separate.",
			],
			"waterabsorb": [
				"Heals 1/16 base max HP at turn end on Underwater, on Water Surface while grounded, or on Murkwater while both grounded and Poison-type. Successful recovery prints “absorbed some of the water!” or “is healed by the poisoned water!” respectively. Water-move absorption remains an independent 1/4 recovery.",
			],
			"zerotohero": [
				"Palafin entering Water Surface, Murkwater Surface, Underwater or Midnight Zone immediately becomes Hero Form without needing to switch out first. This does not add new Hero recovery or ally protection.",
			],
			"hydration": [
				"At turn end on Water Surface, Underwater or Midnight Zone, cures major status without requiring rain or grounding. It prints “[Pokémon]’s Hydration cured its [status] problem!” when this field-based cure occurs. Murkwater is not included.",
			],
			"torrent": [
				"On Water Surface, Underwater and Midnight Zone, Water attacks use 1.5× Attack or Special Attack at any HP. Low HP remains an alternative trigger elsewhere, not another multiplier.",
			],
			"waterveil": [
				"At turn end on Water Surface or Underwater, cures any major status and prints “[Pokémon]’s Water Veil cured its [status] problem!”. Its ordinary burn protection, weather immunity and entry Aqua Ring remain.",
			],
			"fortressshell": [
				"Its Stalwart component raises Special Attack on entry in New World, Starlight Arena, Fairy Tale and Chess Board. Shell Armor adds entry Defense on Fairy Tale or Dragon Den. Its own field-entry effect raises Defense and Special Defense on Fairy Tale, New World, Cold Eclipse or Starlight, tracking changes between fields. New World, Cold Eclipse and Starlight give 1.5x power. Guardian Presence gives allied attacks 1.5x power on Haunted, Bewitched Woods, Holy or Psychic Field (1.3x otherwise), and reduces allied incoming damage by 25%. Electric Aura, Electric Field, Murkwater, Water Surface, Underwater, Midnight Zone, Factory or Short-Circuit activate its Electric redirection/absorption and Attack/Special Attack increases.",
			],
		},
		"moves": {
			"shoreup": [
				"Restores full maximum HP on Desert or Ashen Beach. Otherwise keeps its usual half-HP heal, or approximately two thirds in sand. On Water Surface, Murkwater or Underwater, successful healing additionally gives a Water Compaction user two Defense stages. It becomes Water type on Water Surface and Water/Poison on Murkwater. After use Underwater, its resurfacing message announces an attempted change to Water Surface.",
			],
			"aquaring": [
				"Midnight Zone heals 1/8 maximum HP per turn and returns immediately. Misty, Swamp, Water Surface, Underwater and Murkwater first heal 1/8, then also receive the ordinary 1/16 heal: 3/16 total before rounding. The Water Surface/Underwater restoration message accompanies that first heal. Corrosive Mist instead deals 1/16 damage to non-Poison, non-Steel users; Poison and Steel users receive the normal 1/16 heal.",
			],
			"toxicspikes": [
				"On Water Surface or Murkwater, newly placed Toxic Spikes vanish immediately, producing the sinking message. Wasteland removes and records them for its own hazard behavior, producing the waste-swallowed message. On Corrosive Field, grounded Poison types do not absorb existing Toxic Spikes. Steel immunity, Heavy-Duty Boots, Run Away and grounding checks remain.",
			],
			"takeheart": [
				"On New World, Starlight Arena, Psychic Field, Water Surface and Underwater, raises Special Attack and Special Defense by two stages. Its major-status cure remains.",
			],
			"lifedew": [
				"Holy and Rainbow increase healing to half maximum HP. Water Surface, Underwater and Midnight Zone instead add Aqua Ring and heal one quarter; adding the ring can succeed at full HP. Corrosive Mist and Murkwater add a guaranteed poison secondary, subject to status rules.",
			],
			"atlantiswall": [
				"Water Surface, Underwater, Midnight Zone, Misty Field and Murkwater permit use without rain and add one move-priority stage. Water Surface, Underwater and Midnight Zone extend it to eight turns; Misty and Murkwater alone keep five. Rain or Light Clay also extend it. The screen halves super-effective attack damage, except critical hits and moves that bypass screens.",
			],
			"purify": [
				"After use on Murkwater, prints the cleared-waters message and attempts to change to Water Surface. This transition is outside the successful status-cure check, so it can occur even when the cure fails.",
			],
			"stealthrock": [
				"New Stealth Rock disappears immediately on Water Surface and Murkwater. Wasteland swallows and records it, printing the pointed-stones message. Existing hazards use the shared field damage rules: Rock plus rotating Fire/Water/Grass/Psychic effectiveness on Crystal Cavern; doubled Rock effectiveness stages on Rocky Field/Cave; Fire effectiveness on Dragon Den/Volcanic with the molten-rocks message; Ice effectiveness on Cold Eclipse with the frozen-rocks message. Boots, Run Away and the existing Parasitism protection remain.",
			],
			"tidyup": [
				"On Murkwater, each execution of its hit callback advances a shared Tidy Up counter; the second attempts to change to Water Surface. The counter advances even if no hazard or Substitute was removed. Its ordinary Attack/Speed boost remains.",
			],
			"gmaxfoamburst": [
				"Its opposing Speed drops become four stages on Murkwater, three on Water Surface, and two elsewhere.",
			],
			"spikes": [
				"New Spikes vanish on Water Surface or Murkwater, printing the sinking message. On Electric Field, they also affect airborne entrants, subject to Electric immunity, Boots, Run Away and existing Parasitism protection. The current Electric damage formula uses the signed effectiveness stage directly, not a normal type multiplier: one-layer tests dealt 42 HP to Water/Flying Mew, zero to neutral Normal or immune Ground Mew, and one HP to resistant Grass Mew. This is an existing formula discrepancy, not standard Electric-type hazard damage.",
			],
		},
		"items": {
			"absorbbulb": [
				"On entry while Misty Field, Water Surface or Underwater is active, attempts to consume itself for one Special Attack stage. The ordinary damaging Water-hit trigger remains. This entry callback does not itself add a field-change trigger.",
			],
		},
	},
	"electricterrain": {
		"abilities": {
			"perfectforesight": [
				"On entry, prioritizes a foe whose active Speed-related ability matches the present conditions, then the highest current Attack or Sp. Atk. The field checks count Sand Rush on Desert/Ashen Beach; Swift Swim on Water Surface/Underwater/Murkwater/Midnight Zone; Slush Rush on Icy/Snowy Mountain/Cold Eclipse; Surge Surfer on Water Surface/Underwater/Murkwater/Short-Circuit/Electric; Quick Feet on Electric; Telepathy on Psychic Field or its aura. Speed Boost is always prioritized. Chlorophyll is checked against effective sun, not its garden exception. It copies the chosen actual ability and runs its entry behavior; Trace, Perfect Foresight and Void Voice are excluded.",
			],
			"gulpmissile": [
				"Water Surface and Underwater force eligible Cramorant into Gulping on entry or field change. Surf loads Gorging on Electric, Factory and Short-Circuit regardless of HP; Swamp retains the ordinary HP-based result. Underwater discharge deals 1/4 of the attacker’s base max HP scaled by ordinary Water effectiveness, and Water immunity prevents that damage. Elsewhere discharge keeps its ordinary quarter-HP damage. Gulping still lowers Defense; Gorging still attempts paralysis.",
			],
			"motordrive": [
				"Absorbing another Pokémon’s Electric move grants +2 Speed on Factory or Short-Circuit instead of +1. On Electric Field, additionally gains +1 Speed at the end of each turn.",
			],
			"transistor": [
				"Electric attacks use 2× Attack or Special Attack on Electric and Factory fields instead of 1.3×. Electric Field additionally halves the offensive stat used by incoming Ground attacks.",
			],
			"railguncircuit": [
				"Its Transistor component makes Electric attacks use 2× the offensive stat on Factory and Electric Field. Electric Field entry also grants +1 Attack and Special Attack through Lightning Rod; its redirection and absorption remain.",
			],
			"slowstart": [
				"Holy removes its temporary Attack and Speed penalties and supplies 1.5× Defense instead of the temporary 2× defense outside Holy. Holy entry prints “Divine energy courses through [Pokémon]”. Electric Field removes one additional turn from the three-turn Slow Start countdown each turn.",
			],
			"surgesurfer": [
				"Doubles Speed on Electric Field, Water Surface, Underwater, Murkwater Surface and Short-Circuit. The current list does not include Midnight Zone.",
			],
			"static": [
				"Electric Field and Short-Circuit raise its contact paralysis chance from 30% to 60%.",
			],
			"voltabsorb": [
				"At turn end on Electric Field or Short-Circuit, heals 1/16 base max HP. Absorbing another Pokémon’s Electric move remains an independent 1/4 recovery.",
			],
			"battery": [
				"On Electric Field, the holder’s special moves gain a further 1.5× power on top of Battery’s ordinary 1.3×. Allies retain the separate 1.3× special-move bonus; they do not inherit the holder-only field multiplier.",
			],
			"electricsurge": [
				"On entry, requests Electric Field or Electric Aura for five turns, or eight with Amplifield Rock. The existing base-field/aura placement rules decide which layer receives it; this is not an unconditional replacement of a protected custom field.",
			],
			"galvanize": [
				"Eligible Normal-to-Electric conversion gains 1.5× power on Electric and Factory fields, or 2× on Short-Circuit, instead of 1.2×. Ordinary excluded variable-type moves, damaging Z-Moves and Terastallized Tera Blast remain excluded.",
			],
			"hadronengine": [
				"On entry, attempts to establish Electric Field. While Electric Field is active, Special Attack is multiplied by 5461/4096 (about 1.3333×); the callback checks the field rather than Electric Aura alone.",
			],
			"lightningrod": [
				"Electric Field entry grants +1 Attack and Special Attack. This is separate from the same boosts when it absorbs an Electric move; its ordinary redirection remains.",
			],
			"minus": [
				"Electric Field multiplies Special Attack by 1.5, regardless of move type. Its ordinary 1.3× offensive-stat bonus for Electric/Steel attacks stacks when applicable.",
			],
			"plus": [
				"Electric Field multiplies Special Attack by 1.5, regardless of move type. Its ordinary 1.3× offensive-stat bonus for Electric/Steel attacks stacks when applicable.",
			],
			"paradoxengine": [
				"Electric Field grants 1.3× Speed without requiring sun. Sun and the field are alternative conditions and do not stack that Speed bonus; the Fighting/Electric move-power bonus remains separate.",
			],
			"quarkdrive": [
				"Electric Field or Electric Aura activates its highest-stat boost without consuming Booster Energy. Speed receives 1.5×; another highest stat receives 1.3×. The field/aura-triggered boost ends when neither remains, unless the active boost came from Booster Energy.",
			],
			"quickfeet": [
				"Electric Field doubles Speed even without a status condition, replacing rather than stacking with its ordinary 1.5× status bonus. Paralysis’s ordinary Speed penalty remains ignored.",
			],
			"steadfast": [
				"Electric Field entry grants +1 Speed. Its ordinary +1 Speed after flinching remains separate; it does not prevent the flinch from consuming the action.",
			],
			"teravolt": [
				"On Electric Field, Electric moves have their base power multiplied by 1.5 and Ground-type foes lose their Electric immunity through its immunity-negation handler. Its ordinary bypass of bypassable abilities remains.",
			],
			"surgeconduit": [
				"Electric Field entry grants +1 Attack and Special Attack through Lightning Rod. Electric redirection/absorption and Rock Head remain; the species’ Electric Surge passive is separate.",
			],
			"woolyconductor": [
				"The current package has no additional Electric Field or Short-Circuit paralysis effect. Its contact mitigation, Fire vulnerability, Mold Breaker and once-per-turn contact-attacker Speed drop operate normally here.",
			],
			"fortressshell": [
				"Its Stalwart component raises Special Attack on entry in New World, Starlight Arena, Fairy Tale and Chess Board. Shell Armor adds entry Defense on Fairy Tale or Dragon Den. Its own field-entry effect raises Defense and Special Defense on Fairy Tale, New World, Cold Eclipse or Starlight, tracking changes between fields. New World, Cold Eclipse and Starlight give 1.5x power. Guardian Presence gives allied attacks 1.5x power on Haunted, Bewitched Woods, Holy or Psychic Field (1.3x otherwise), and reduces allied incoming damage by 25%. Electric Aura, Electric Field, Murkwater, Water Surface, Underwater, Midnight Zone, Factory or Short-Circuit activate its Electric redirection/absorption and Attack/Special Attack increases.",
			],
		},
		"moves": {
			"charge": [
				"On Electric Field, raises Special Defense by two stages. The existing Charge volatile doubles the next Electric attack’s power and ends after that Electric move, including an aborted use. The Charge message marks application or refresh; Elemental Seed’s version lasts two turns.",
			],
			"eerieimpulse": [
				"On Electric Field, lowers Special Attack by three stages.",
			],
			"electroshot": [
				"Electric Field and Factory remove the charge turn while retaining the Special Attack increase. Rain and heavy rain independently provide the same charge skip.",
			],
			"magnetrise": [
				"Lasts eight turns on Electric Field, Short-Circuit and Factory instead of five. Smack Down, Ingrain and Gravity still prevent it.",
			],
			"electrify": [
				"On Electric Field, additionally changes the target to pure Electric type when type changing is allowed. Its ordinary one-turn conversion of the target’s move remains; already pure-Electric targets fail the extra type-change step.",
			],
			"electroweb": [
				"On Electric Field, its guaranteed Speed drop becomes two stages.",
			],
			"focuspunch": [
				"Electric Field prevents Focus Punch outright and prints the lost-focus failure, even if the user has Focus Energy. Outside that field its existing lost-focus and protection interactions remain.",
			],
			"iondeluge": [
				"After use, attempts to create Electric Aura for three turns, or five with Amplifield Rock. Its one-turn Normal-to-Electric move conversion is separate; the field-activation message explains that conversion.",
			],
			"irontail": [
				"On Electric Field, gains 1.5x power and bypasses accuracy checks. Adaptive Cycle field protection can prevent the field power bonus.",
			],
			"magneticflux": [
				"On Electric Field, boosts Defense and Special Defense by two stages for all eligible active allies, without requiring Plus or Minus. Outside that field it retains its ability requirement.",
			],
			"mudsport": [
				"While Mud Sport is active, its terrain-attempt handler rejects attempts involving an already active Electric Field, and its residual callback adds one turn to that field’s duration, offsetting normal expiration. Electric move power is independently reduced to approximately one third.",
			],
			"paraboliccharge": [
				"On Electric Field, heals three quarters of damage dealt rather than its ordinary drain fraction.",
			],
			"plasmafists": [
				"Gains 1.3x power when Electric Field can be established. On a successful hit, if neither Electric Field nor Electric Aura is active, attempts to create a three-turn Electric Aura, or five turns with Amplifield Rock.",
			],
			"psyblade": [
				"Electric Field or Electric Aura gives 1.5x power. Adaptive Cycle blocks only a field-only contribution, not the separate aura qualification.",
			],
			"risingvoltage": [
				"Electric Field or Electric Aura doubles power against a grounded target. The doubled-power hint is printed for an opposing grounded target. Adaptive Cycle blocks only a field-only contribution.",
			],
			"stokedsparksurfer": [
				"Gains 1.3x power when Electric Field can be established. Its shared Z-move field-setting rule attempts to replace the base field with Electric Field rather than creating an aura.",
			],
			"tectonicrage": [
				"On Electric Field, gains approximately 1.3x power unless Adaptive Cycle protects the target from fields. Its after-use callback clears Electric Field; the shared Z-move field-setting rule may then establish Desert.",
			],
			"volttackle": [
				"On Electric Field, gains 1.5x power and loses recoil. Adaptive Cycle can block the field power bonus; recoil removal is applied separately.",
			],
			"wildcharge": [
				"On Electric Field, removes its recoil.",
			],
			"electricterrain": [
				"Attempts to establish Electric Field for five turns, or eight with Amplifield Rock. When a different full field already exists and auras are enabled, the shared setter instead creates the corresponding aura. Existing field-lock and ability restrictions apply; the aura and full-field effects are distinct. Grassy Terrain on an existing Flower Garden follows the garden-growth rules rather than replacing it.",
			],
			"maxlightning": [
				"Its successful self callback requires the user to still be Dynamaxed, then attempts to establish Electric Field. The shared setter can create the matching aura over an existing different full field. Normal field-lock and duration rules apply.",
			],
			"spikes": [
				"New Spikes vanish on Water Surface or Murkwater, printing the sinking message. On Electric Field, they also affect airborne entrants, subject to Electric immunity, Boots, Run Away and existing Parasitism protection. The current Electric damage formula uses the signed effectiveness stage directly, not a normal type multiplier: one-layer tests dealt 42 HP to Water/Flying Mew, zero to neutral Normal or immune Ground Mew, and one HP to resistant Grass Mew. This is an existing formula discrepancy, not standard Electric-type hazard damage.",
			],
		},
		"items": {
			"boosterenergy": [
				"An active Electric Field or Electric Aura supplies Quark Drive’s environmental activation, so Booster Energy is not consumed for Quark Drive while either applies. Outside that environment, an eligible untransformed Quark Drive holder can consume it. Protosynthesis uses its independent sun check.",
			],
			"cellbattery": [
				"On switching into Electric Field, attempts to consume itself and raise Attack by one stage. Its ordinary damaging Electric-hit trigger remains.",
			],
		},
	},
	"psychicterrain": {
		"abilities": {
			"perfectforesight": [
				"On entry, prioritizes a foe whose active Speed-related ability matches the present conditions, then the highest current Attack or Sp. Atk. The field checks count Sand Rush on Desert/Ashen Beach; Swift Swim on Water Surface/Underwater/Murkwater/Midnight Zone; Slush Rush on Icy/Snowy Mountain/Cold Eclipse; Surge Surfer on Water Surface/Underwater/Murkwater/Short-Circuit/Electric; Quick Feet on Electric; Telepathy on Psychic Field or its aura. Speed Boost is always prioritized. Chlorophyll is checked against effective sun, not its garden exception. It copies the chosen actual ability and runs its entry behavior; Trace, Perfect Foresight and Void Voice are excluded.",
			],
			"zenmode": [
				"Standard Darmanitan is forced into Zen on Ashen Beach or Psychic Field; Galarian Darmanitan is forced into Galar-Zen on Icy, Snowy Mountain or Cold Eclipse. These checks run on entry, field change and turn end, regardless of HP. Transformed Pokémon are excluded. Outside the matching fields, the usual half-HP form condition applies.",
			],
			"anticipation": [
				"On Psychic Field, grants +2 Special Attack only when entry finds no super-effective damaging move or OHKO threat. Finding a threat reveals and remembers it instead, with its ordinary protection against the warned move.",
			],
			"forewarn": [
				"On Psychic Field, a successful entry reveal of a strongest opposing move grants +2 Special Attack. No eligible reveal means no boost. Its remembered-move damage protection remains separate.",
			],
			"psychicsurge": [
				"On entry, attempts to establish Psychic Field under the shared field/aura placement rules. The ordinary duration is five turns, extended to eight by Amplifield Rock.",
			],
			"purepower": [
				"On Psychic Field, doubles Special Attack instead of Attack. Psychic Aura alone does not meet this exact base-field check.",
			],
			"telepathy": [
				"Psychic Field or Psychic Aura doubles Speed. Its ordinary immunity to allied damaging moves remains.",
			],
		},
		"moves": {
			"calmmind": [
				"On Ashen Beach, Chess Board and Psychic Field, raises Special Attack and Special Defense by two stages each.",
			],
			"kinesis": [
				"On Ashen Beach and Psychic Field, lowers target Accuracy by two stages and raises the user’s Attack and Special Attack by two.",
			],
			"psychup": [
				"After copying target stat stages and the supported critical-hit volatiles, Ashen Beach cures the user’s major status; Psychic Field additionally raises Special Attack by two stages.",
			],
			"nastyplot": [
				"On Chess Board and Psychic Field, raises Special Attack by three stages.",
			],
			"cosmicpower": [
				"On Holy, New World, Rainbow, Starlight Arena, Misty and Psychic fields, raises Defense and Special Defense by two stages each.",
			],
			"takeheart": [
				"On New World, Starlight Arena, Psychic Field, Water Surface and Underwater, raises Special Attack and Special Defense by two stages. Its major-status cure remains.",
			],
			"trickroom": [
				"Lasts eight turns on Chess Board, New World and Psychic Field, taking precedence over Persistent’s seven-turn duration. Using it while already active still ends it.",
			],
			"miracleeye": [
				"On Psychic Field, Fairy Tale and Holy Field, a successful hit additionally raises the user’s Special Attack by two. Its existing Ghost-resistance volatile, Dark-target Psychic immunity bypass and positive-evasion bypass remain.",
			],
			"magicroom": [
				"On New World and Psychic Field, lasts eight turns. Amplifield Rock independently gives eight; otherwise Persistent gives seven and the base duration is five. Reusing the move ends the room.",
			],
			"wonderroom": [
				"On New World and Psychic Field, lasts eight turns. Amplifield Rock independently gives eight; otherwise Persistent gives seven and the base duration is five. Reusing the move ends the room.",
			],
			"esperwing": [
				"On Psychic Field, its guaranteed self Speed boost becomes two stages.",
			],
			"expandingforce": [
				"Psychic Field gives grounded users 1.5x power and all-adjacent-foes targeting. Psychic Aura also grants spread targeting without requiring grounding, but its power bonus still requires a grounded user. Adaptive Cycle can block the field-only power bonus.",
			],
			"gravity": [
				"On Psychic Field, lasts eight turns; Amplifield Rock also gives eight. It promotes an eligible active aura into its matching full field when the shared terrain-transition rules allow it. Existing Water Surface/Underwater/Corrosive Mist transitions take priority. Its ordinary grounding, accuracy and move-disabling effects remain.",
			],
			"hypnosis": [
				"On Psychic Field and Haunted, base accuracy becomes 90%.",
			],
			"mindreader": [
				"On Psychic Field, after applying its lock-on effect, additionally raises the user’s Special Attack by two stages. Its activation message identifies the locked target.",
			],
			"mysticalpower": [
				"On Psychic Field, the current replacement secondary gives the TARGET two Special Attack stages, rather than a self boost. This is an existing implementation discrepancy; the guide reports the actual target.",
			],
			"psyshieldbash": [
				"On Psychic Field, the current replacement secondary gives the TARGET one Defense and Special Defense stage, rather than boosting the user. This is an existing implementation discrepancy.",
			],
			"shatteredpsyche": [
				"On Psychic Field, adds a guaranteed confusion secondary, subject to ordinary confusion protection.",
			],
			"telekinesis": [
				"On Psychic Field, additionally lowers Accuracy, Defense and Special Defense by two stages. Gravity still prevents use, and its existing species, rooting and type-immunity rules remain.",
			],
			"psychicterrain": [
				"Attempts to establish Psychic Field for five turns, or eight with Amplifield Rock. When a different full field already exists and auras are enabled, the shared setter instead creates the corresponding aura. Existing field-lock and ability restrictions apply; the aura and full-field effects are distinct. Grassy Terrain on an existing Flower Garden follows the garden-growth rules rather than replacing it.",
			],
			"maxmindstorm": [
				"Its successful self callback requires the user to still be Dynamaxed, then attempts to establish Psychic Field. The shared setter can create the matching aura over an existing different full field. Normal field-lock and duration rules apply.",
			],
			"genesissupernova": [
				"Its guaranteed self secondary attempts to establish Psychic Field, explicitly replacing the base field rather than creating an aura, subject to field-lock restrictions.",
			],
		},
	},
	"corrosivemistterrain": {
		"abilities": {
			"watercompaction": [
				"Entry on Misty, Corrosive Mist or Murkwater grants +2 Defense. Midnight Zone entry changes its type to Water when type changes are allowed. Water-damage activation on Ashen Beach gives +2 Sp. Def in addition to its normal +2 Defense. At each turn end, Water Surface, Underwater, Murkwater and Swamp grant +2 Defense. The “sharply raised its defense” message accompanies Water hits and the listed water-field activations; stat caps and prevention still apply.",
			],
			"merciless": [
				"On Corrosive, Corrosive Mist, Murkwater Surface and Wasteland, its attacks receive the guaranteed-critical modifier even against an unpoisoned target; effects that prevent critical hits still work. On Chessboard instead, the critical ratio is set to one stage per 20% of the target’s missing base max HP, capped at three; poisoning adds the guaranteed-critical modifier.",
			],
			"aftermath": [
				"On Corrosive Mist, a contact attacker that knocks out the holder loses 1/2 base max HP instead of 1/4. Damp prevents the retaliation; normal indirect-damage immunity still applies.",
			],
			"corrosion": [
				"On Corrosive and Corrosive Mist, incoming damage is multiplied by 1.5. On Wasteland, its move secondaries are replaced with four separate 2.5% chances: frostbite, burn, paralysis and poison. Its poisoning of Poison/Steel types and Poison-move bypass of Steel immunity remain.",
			],
			"damp": [
				"On Corrosive Mist, also prevents Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Lava Plume, Searing Shot and Inferno Overdrive. Such an attempt prints a “Damp stifled the move!” message and fails. Its ordinary ban on Explosion, Self-Destruct, Mind Blown and Misty Explosion, Aftermath prevention and Fire mitigation remain.",
			],
			"dryskin": [
				"Field recovery is independent of weather recovery: 1/16 base max HP each turn on Underwater, Swamp, Misty or grounded Water Surface; 1/8 on Murkwater for a grounded Poison type. Corrosive Mist heals Poison types by 1/8, damages non-Poison/non-Steel holders by 1/8, and leaves Steel types unaffected. Desert deals 1/8 each turn. Successful Water Surface/Underwater healing prints “absorbed some of the water!”; successful Murkwater healing prints “is healed by the poisoned water!”.",
			],
			"poisonheal": [
				"Heals 1/8 base max HP each turn on Corrosive Mist and Murkwater Surface regardless of grounding, or on Corrosive/Wasteland while grounded. Poison is not required for this field recovery; healing in place of poison damage is a separate effect.",
			],
			"poisonpuppeteer": [
				"On Corrosive Mist entry, gains +1 Special Defense; on Wasteland entry, gains +2 instead. Its ordinary Pecharunt poison-triggered confusion still applies.",
			],
			"toxicchain": [
				"On Corrosive Mist and Wasteland, the chance after a damaging hit to badly poison rises from 30% to 60%; Shield Dust and Covert Cloak block it. Wasteland also grants Poison attacks 1.3× power.",
			],
			"coldlogic": [
				"On Corrosive Mist, an opposing damaging move that knocks it out triggers damage equal to 1/2 the attacker’s base max HP instead of 1/4; contact is not required. It prints “[Pokémon] executed its final contingency!”. Damp prevents the retaliation, and indirect-damage protection applies.",
			],
		},
		"moves": {
			"floralhealing": [
				"Restores up to full maximum HP on Grassy Field, Fairy Tale or Flower Garden stage 3; otherwise restores half. On Corrosive Field or Corrosive Mist, a successful heal also attempts to poison the recipient. A failed heal does not poison.",
			],
			"acidarmor": [
				"Raises Defense by three stages on Corrosive Field, Corrosive Mist, Fairy Tale and Murkwater.",
			],
			"aquaring": [
				"Midnight Zone heals 1/8 maximum HP per turn and returns immediately. Misty, Swamp, Water Surface, Underwater and Murkwater first heal 1/8, then also receive the ordinary 1/16 heal: 3/16 total before rounding. The Water Surface/Underwater restoration message accompanies that first heal. Corrosive Mist instead deals 1/16 damage to non-Poison, non-Steel users; Poison and Steel users receive the normal 1/16 heal.",
			],
			"barbbarrage": [
				"Doubles power on Corrosive Mist, Corrosive Field, Murkwater and Wasteland even without status. A target protected from field effects by Adaptive Cycle does not grant this field-only bonus; an existing major status or Comatose can still qualify independently.",
			],
			"venomdrench": [
				"Corrosive Mist, Corrosive Field, Murkwater and Wasteland remove the poisoned-target requirement. A successful use lowers Attack, Special Attack and Speed by one stage.",
			],
			"venoshock": [
				"Doubles power on Corrosive Mist, Corrosive Field, Murkwater and Wasteland without requiring poison. Adaptive Cycle field protection blocks the field-only bonus; actual poison or bad poison still qualifies.",
			],
			"ickyinjection": [
				"After dealing positive damage, attempts bad poison instead of ordinary poison on Corrosive Mist, Corrosive Field, Murkwater and Wasteland. Status immunity and existing-status rules still apply.",
			],
			"toxic": [
				"Corrosive Mist sets base accuracy to 100%; other accuracy rules remain.",
			],
			"smokescreen": [
				"On Burning Field, Corrosive Mist and Volcanic Summit, lowers Accuracy by two stages.",
			],
			"lifedew": [
				"Holy and Rainbow increase healing to half maximum HP. Water Surface, Underwater and Midnight Zone instead add Aqua Ring and heal one quarter; adding the ring can succeed at full HP. Corrosive Mist and Murkwater add a guaranteed poison secondary, subject to status rules.",
			],
			"mistyexplosion": [
				"Grounded users gain 1.5x power on Misty Field, Corrosive Mist or Misty Aura. Adaptive Cycle field protection blocks the field-only contribution, but not an independent Misty Aura bonus.",
			],
			"mistyterrain": [
				"Attempts to establish Misty Field for five turns, or eight with Amplifield Rock. When a different full field already exists and auras are enabled, the shared setter instead creates the corresponding aura. Existing field-lock and ability restrictions apply; the aura and full-field effects are distinct. Grassy Terrain on an existing Flower Garden follows the garden-growth rules rather than replacing it.",
			],
		},
	},
	"swampterrain": {
		"abilities": {
			"watercompaction": [
				"Entry on Misty, Corrosive Mist or Murkwater grants +2 Defense. Midnight Zone entry changes its type to Water when type changes are allowed. Water-damage activation on Ashen Beach gives +2 Sp. Def in addition to its normal +2 Defense. At each turn end, Water Surface, Underwater, Murkwater and Swamp grant +2 Defense. The “sharply raised its defense” message accompanies Water hits and the listed water-field activations; stat caps and prevention still apply.",
			],
			"dryskin": [
				"Field recovery is independent of weather recovery: 1/16 base max HP each turn on Underwater, Swamp, Misty or grounded Water Surface; 1/8 on Murkwater for a grounded Poison type. Corrosive Mist heals Poison types by 1/8, damages non-Poison/non-Steel holders by 1/8, and leaves Steel types unaffected. Desert deals 1/8 each turn. Successful Water Surface/Underwater healing prints “absorbed some of the water!”; successful Murkwater healing prints “is healed by the poisoned water!”.",
			],
			"gulpmissile": [
				"Water Surface and Underwater force eligible Cramorant into Gulping on entry or field change. Surf loads Gorging on Electric, Factory and Short-Circuit regardless of HP; Swamp retains the ordinary HP-based result. Underwater discharge deals 1/4 of the attacker’s base max HP scaled by ordinary Water effectiveness, and Water immunity prevents that damage. Elsewhere discharge keeps its ordinary quarter-HP damage. Gulping still lowers Defense; Gorging still attempts paralysis.",
			],
			"crumblingshell": [
				"Water Surface, Murkwater Surface, Underwater and Swamp disable the physical-hit Stealth Rock trigger. Outside them, a physical hit places rocks on the attacker’s side; an allied attacker redirects the placement to the opposing side. Existing rocks are not duplicated.",
			],
			"myceliummight": [
				"At turn end on Swamp, gains +1 Defense and Special Defense. Its status-move ordering, ability bypass and recovery remain independent.",
			],
			"rattled": [
				"Swamp and Haunted entry grant +1 Speed. Its ordinary reactions to qualifying attacks and Intimidate remain separate.",
			],
			"pulsewaste": [
				"Claims a three-turn Swamp for Muk-Pulse, or a three-turn Murkwater field for other holders, once per allowed anomaly-field activation. Refresh and replacement obey the shared Pulse Blockade and Neutralization checks. The ability does not add an independent damage multiplier to those fields.",
			],
		},
		"moves": {
			"aquaring": [
				"Midnight Zone heals 1/8 maximum HP per turn and returns immediately. Misty, Swamp, Water Surface, Underwater and Murkwater first heal 1/8, then also receive the ordinary 1/16 heal: 3/16 total before rounding. The Water Surface/Underwater restoration message accompanies that first heal. Corrosive Mist instead deals 1/16 damage to non-Poison, non-Steel users; Poison and Steel users receive the normal 1/16 heal.",
			],
			"ingrain": [
				"Forest and Grassy Field heal 1/8 maximum HP each turn. Flower Garden stage 2 heals 1/8 and stage 4 heals 1/4. Corrosive Field and Swamp damage non-Poison, non-Steel users by 1/16 instead; Poison and Steel users heal the ordinary 1/16. Its rooting and forced-switch protection remain.",
			],
			"grasspledge": [
				"After a successful hit or Substitute damage, records this pledge for field combinations. Fire + Grass creates Burning Field, Fire + Water creates Rainbow, and Grass + Water creates Swamp. A recorded complementary pledge grants approximately 1.3x power unless Adaptive Cycle blocks that field-only contribution. On an already timed matching combination field, the hit resets its duration to four turns, or seven with Amplifield Rock; this is a reset, not an addition. The move chooses Physical or Special using the higher offensive stat.",
			],
			"waterpledge": [
				"After a successful hit or Substitute damage, records this pledge for field combinations. Fire + Grass creates Burning Field, Fire + Water creates Rainbow, and Grass + Water creates Swamp. A recorded complementary pledge grants approximately 1.3x power unless Adaptive Cycle blocks that field-only contribution. On an already timed matching combination field, the hit resets its duration to four turns, or seven with Amplifield Rock; this is a reset, not an addition. The move chooses Physical or Special using the higher offensive stat.",
			],
			"strugglebug": [
				"On Swamp, its guaranteed Special Attack drop becomes two stages.",
			],
			"grassyterrain": [
				"Attempts to establish Grassy Field for five turns, or eight with Amplifield Rock. When a different full field already exists and auras are enabled, the shared setter instead creates the corresponding aura. Existing field-lock and ability restrictions apply; the aura and full-field effects are distinct. Grassy Terrain on an existing Flower Garden follows the garden-growth rules rather than replacing it.",
			],
		},
	},
	"mistyterrain": {
		"abilities": {
			"watercompaction": [
				"Entry on Misty, Corrosive Mist or Murkwater grants +2 Defense. Midnight Zone entry changes its type to Water when type changes are allowed. Water-damage activation on Ashen Beach gives +2 Sp. Def in addition to its normal +2 Defense. At each turn end, Water Surface, Underwater, Murkwater and Swamp grant +2 Defense. The “sharply raised its defense” message accompanies Water hits and the listed water-field activations; stat caps and prevention still apply.",
			],
			"dryskin": [
				"Field recovery is independent of weather recovery: 1/16 base max HP each turn on Underwater, Swamp, Misty or grounded Water Surface; 1/8 on Murkwater for a grounded Poison type. Corrosive Mist heals Poison types by 1/8, damages non-Poison/non-Steel holders by 1/8, and leaves Steel types unaffected. Desert deals 1/8 each turn. Successful Water Surface/Underwater healing prints “absorbed some of the water!”; successful Murkwater healing prints “is healed by the poisoned water!”.",
			],
			"marvelscale": [
				"Defense is 1.5× on Dragon’s Den, Fairy Tale, Rainbow, Starlight Arena and Misty without requiring a status condition. Having both a status and one of these fields does not stack the bonus.",
			],
			"soulheart": [
				"On Misty or Rainbow, any Pokémon fainting grants the holder +1 Special Attack and +2 Special Defense instead of only +1 Special Attack.",
			],
			"mistysurge": [
				"On entry, attempts to establish Misty Field under the shared field/aura placement rules. The ordinary duration is five turns, extended to eight by Amplifield Rock.",
			],
			"pixilate": [
				"On Misty Field, eligible Normal moves converted to Fairy have 1.5× power instead of 1.2×. Ordinary variable-type, damaging Z-Move and Terastallized Tera Blast exclusions remain.",
			],
			"supersweetsyrup": [
				"Misty entry lowers the holder’s own accuracy by one stage, in addition to the usual adjacent-foe evasion drops. Flower Garden Stage 3 adds foe Defense/Special Defense drops; Stage 4 also adds Attack/Special Attack drops; Stage 5 also adds Speed/accuracy drops. Each is one stage, and Substitute blocks the foe attempt.",
			],
			"pastelveil": [
				"On activation, cures poison on the holder and allies. Fairy Tale also raises the holder’s Special Defense by one; this activation can repeat when another Pokémon switches in. Bewitched Woods cancels weaknesses contributed by the holder’s Fairy typing. In Misty or Rainbow Field, the current callbacks reduce outgoing Poison damage: the holder’s attack receives both half-damage callbacks (one quarter overall), and an ally’s attack receives one (one half). They do not reduce incoming Poison damage. This describes the current implementation, not the old defensive description.",
			],
			"royaldecree": [
				"On entry, resets stat stages and screens unless Neutralization blocks the effect; Safeguard protects its side from that reset. Fairy Tale, Chess Board, New World and Starlight Arena additionally raise Defense or Special Defense according to opposing offensive stats: two stages in singles, one otherwise. Chess Board also multiplies both defenses by 1.5 while Neutralization is absent. The reset preserves field-supported positive defenses for Relic Armor/Defeatist on Desert, Fairy Tale, Cave, Crystal Cavern, New World and Volcanic Summit; Magician Special Attack on Fairy Tale, Bewitched Woods, Haunted, Misty and New World; Stalwart Special Attack on New World, Starlight, Fairy Tale and Chess Board. Mirror Arena’s existing Mirror Armor/Iron Dominion evasion boosts survive the reset, but their new evasion boosts are not allowed by the current ongoing exception. The prevention message appears when a stat change is actually blocked.",
			],
		},
		"moves": {
			"sweetscent": [
				"On Flower Garden stage 3, lowers Defense, Special Defense and evasion by one stage each. On Misty Field, lowers evasion by two and both defenses by one.",
			],
			"aquaring": [
				"Midnight Zone heals 1/8 maximum HP per turn and returns immediately. Misty, Swamp, Water Surface, Underwater and Murkwater first heal 1/8, then also receive the ordinary 1/16 heal: 3/16 total before rounding. The Water Surface/Underwater restoration message accompanies that first heal. Corrosive Mist instead deals 1/16 damage to non-Poison, non-Steel users; Poison and Steel users receive the normal 1/16 heal.",
			],
			"sweetkiss": [
				"Misty Field sets base accuracy to 100%. Fairy Tale cures the target’s sleep on a successful hit, alongside its normal confusion effect.",
			],
			"cosmicpower": [
				"On Holy, New World, Rainbow, Starlight Arena, Misty and Psychic fields, raises Defense and Special Defense by two stages each.",
			],
			"aromaticmist": [
				"On Misty Field, raises the recipient’s Special Defense by two stages.",
			],
			"wish": [
				"If created on Misty, Rainbow, Fairy Tale, Holy or Starlight, stores healing equal to three quarters of the original user’s maximum HP instead of half. The amount is decided when Wish is set, not when it resolves. The Wish healing message appears only when healing succeeds.",
			],
			"atlantiswall": [
				"Water Surface, Underwater, Midnight Zone, Misty Field and Murkwater permit use without rain and add one move-priority stage. Water Surface, Underwater and Midnight Zone extend it to eight turns; Misty and Murkwater alone keep five. Rain or Light Clay also extend it. The screen halves super-effective attack damage, except critical hits and moves that bypass screens.",
			],
			"mistyterrain": [
				"Attempts to establish Misty Field for five turns, or eight with Amplifield Rock. When a different full field already exists and auras are enabled, the shared setter instead creates the corresponding aura. Existing field-lock and ability restrictions apply; the aura and full-field effects are distinct. Grassy Terrain on an existing Flower Garden follows the garden-growth rules rather than replacing it.",
			],
			"maxstarfall": [
				"Its successful self callback requires the user to still be Dynamaxed, then attempts to establish Misty Field. The shared setter can create the matching aura over an existing different full field. Normal field-lock and duration rules apply.",
			],
		},
		"items": {
			"absorbbulb": [
				"On entry while Misty Field, Water Surface or Underwater is active, attempts to consume itself for one Special Attack stage. The ordinary damaging Water-hit trigger remains. This entry callback does not itself add a field-change trigger.",
			],
		},
	},
	"bewitchedwoodsterrain": {
		"abilities": {
			"cottondown": [
				"After an attack hits the holder, every other living active Pokémon loses two Speed stages on Bewitched Woods or Grassy Field instead of one. This includes allies; the holder is excluded. Usual stat-drop protections still apply.",
			],
			"bewitchingmajesty": [
				"On entry, attempts to create Bewitched Woods and sets its duration to five turns only if creation succeeds. Field locks can block it. Its Magic Bounce and opposing-priority protection remain their ordinary shared effects.",
			],
			"soulfire": [
				"Haunted and Cold Eclipse grant +1 Defense and Sp. Def on entry. Haunted, Burning, Volcanic and Bewitched Woods grant +1 Attack and Sp. Atk each turn. These are additional to ordinary Fire/Ghost redirection, absorption and attack rules.",
			],
			"soultag": [
				"Haunted entry reveals opposing items through Shadow Tag. Haunted and Cold Eclipse grant Soul Fire’s +1 Defense/Sp. Def; Cold Eclipse also grants Flame Body’s +1 Defense/Sp. Def instead of contact burning, for +2 each in total. Haunted, Burning, Volcanic and Bewitched Woods grant +1 Attack/Sp. Atk each turn. Volcanic raises contact-burn chance to 60%.",
			],
			"duskilate": [
				"Eligible Normal moves become Fairy on Holy and Rainbow, otherwise Dark. Their conversion bonus is 1.5× on Dark Crystal Cavern, New World, Starlight Arena, Cold Eclipse, Short-Circuit, Haunted, Bewitched Woods, Holy and Rainbow, instead of 1.3×. Cold Eclipse additionally grants hail immunity. Cold Eclipse also recognizes Duskilate for its 1.5× defenses and exemption from the grounded Speed penalty.",
			],
			"execution": [
				"Eligible Normal moves become Fairy on Holy and Rainbow, otherwise Dark. Their conversion bonus is 1.5× on Dark Crystal Cavern, New World, Starlight Arena, Cold Eclipse, Short-Circuit, Haunted, Bewitched Woods, Holy and Rainbow, instead of 1.3×. Cold Eclipse additionally grants hail immunity. While any base field exists, its current stat-change handler blocks Speed drops, including self-caused drops; its Attack/Special Attack floor and KO healing remain separate.",
			],
			"pastelveil": [
				"On activation, cures poison on the holder and allies. Fairy Tale also raises the holder’s Special Defense by one; this activation can repeat when another Pokémon switches in. Bewitched Woods cancels weaknesses contributed by the holder’s Fairy typing. In Misty or Rainbow Field, the current callbacks reduce outgoing Poison damage: the holder’s attack receives both half-damage callbacks (one quarter overall), and an ally’s attack receives one (one half). They do not reduce incoming Poison damage. This describes the current implementation, not the old defensive description.",
			],
			"royaldecree": [
				"On entry, resets stat stages and screens unless Neutralization blocks the effect; Safeguard protects its side from that reset. Fairy Tale, Chess Board, New World and Starlight Arena additionally raise Defense or Special Defense according to opposing offensive stats: two stages in singles, one otherwise. Chess Board also multiplies both defenses by 1.5 while Neutralization is absent. The reset preserves field-supported positive defenses for Relic Armor/Defeatist on Desert, Fairy Tale, Cave, Crystal Cavern, New World and Volcanic Summit; Magician Special Attack on Fairy Tale, Bewitched Woods, Haunted, Misty and New World; Stalwart Special Attack on New World, Starlight, Fairy Tale and Chess Board. Mirror Arena’s existing Mirror Armor/Iron Dominion evasion boosts survive the reset, but their new evasion boosts are not allowed by the current ongoing exception. The prevention message appears when a stat change is actually blocked.",
			],
			"prankster": [
				"Prankster still gives status moves +1 priority here. Although an older description promises a Bewitched Woods exception, the current move pipeline still blocks opposing Dark targets. Verified with Prankster Growl against Umbreon on this field: it prints the Dark-immunity hint and immunity message, and does not lower Attack.",
			],
		},
		"moves": {
			"forestscurse": [
				"After successfully changing the target to pure Grass, Fairy Tale, Forest and Bewitched Woods also apply the Curse volatile if absent. It fails against an already pure-Grass target, so that case does not add Curse. The type-change message confirms the successful conversion.",
			],
			"grasswhistle": [
				"Base accuracy becomes 80% on Grassy Field or 85% on Bewitched Woods.",
			],
			"magicpowder": [
				"On Haunted and Bewitched Woods, adds a guaranteed sleep secondary, subject to ordinary immunity and successful-hit rules. Its successful Psychic type conversion also attempts to establish Bewitched Woods for five turns. Already pure-Psychic targets fail the type conversion.",
			],
			"poisonpowder": [
				"On Bewitched Woods, base accuracy becomes 85%. Powder and status immunities remain.",
			],
			"sleeppowder": [
				"On Bewitched Woods, base accuracy becomes 85%. Powder and sleep immunities remain.",
			],
			"stunspore": [
				"On Bewitched Woods, base accuracy becomes 85%. Powder and paralysis immunities remain.",
			],
			"strengthsap": [
				"Bewitched Woods lowers Special Attack by one as well as Attack. Forest and Swamp multiply its Attack-based healing by 1.3. The current Forest handler additionally fails if the target’s Special Attack is already at -6, even though Forest does not add a Special Attack drop.",
			],
			"curse": [
				"After use, attempts to turn Holy Field into Haunted or Forest into Bewitched Woods. The current transition callback does not require a Ghost user or successful Curse application. The current Ghost-user HP cost is one third maximum HP, unless Cursed Keepsake prevents the cost. Curse damage on Holy Field is applied once before that residual callback removes the curse.",
			],
			"headsmash": [
				"On Bewitched Woods, recoil becomes one quarter of damage dealt.",
			],
			"moonlight": [
				"Cold Eclipse restores three quarters maximum HP regardless of weather. Dark Crystal Cavern, New World, Starlight Arena and Bewitched Woods restore three quarters except in sun (approximately two thirds) or snow (one quarter). Adaptive Cycle can neutralize the adverse snow reduction. Healing restrictions still apply.",
			],
		},
	},
	"burningterrain": {
		"abilities": {
			"blaze": [
				"Burning and Volcanic activate Blaze’s 1.5× offensive-stat multiplier for Fire attacks at any HP. Cold Eclipse disables this multiplier even at low HP. Having Blaze as both active ability and species passive does not apply it twice.",
			],
			"flareboost": [
				"Fire attacks receive 1.5× power through the first branch on every field, including Cold Eclipse. On Burning or Volcanic, non-Fire special attacks also gain 1.5× without a burn. Cold Eclipse disables this second burned/special branch. The two branches return separately and do not stack with each other.",
			],
			"goodasgold": [
				"Burning Field disables its protection from other Pokémon’s status moves. Dragon’s Den gives its attacks a 1.2× power modifier; the ordinary status-move immunity still applies there.",
			],
			"sinisterblaze": [
				"Fairy Tale, Starlight Arena, New World, Burning, Volcanic, Superheated and Cold Eclipse grant +1 Defense and Sp. Def on entry. Snowy Mountain, Icy and Cold Eclipse add Ice typing while this is the active ability, except for Abysseon and Divineon; this is not a blanket passive typing grant. Its ordinary self-burn, burn recovery and opposing chip remain separate.",
			],
			"steamengine": [
				"Burning, Superheated and Volcanic grant +6 Speed on entry. Water Surface, Underwater and Volcanic grant +1 Speed each turn. The residual handler’s Murkwater message check is inside an outer condition that excludes Murkwater, so Murkwater alone does not grant that residual boost. Midnight Zone entry changes the holder to Water when allowed. Full Magma Armor is also delegated, including its entry defenses, weather/status rules and Dragon’s Den Fire immunity.",
			],
			"thermalexchange": [
				"Burning, Superheated, Dragon’s Den and Volcanic grant +1 Attack each turn, in addition to its ordinary Fire-hit Attack boost and burn prevention/cure. No Fire hit is required for the field boost.",
			],
			"wellbakedbody": [
				"Burning, Superheated, Dragon’s Den and Volcanic grant +1 Defense each turn. The ordinary Fire-move absorption still grants +2 Defense separately when hit.",
			],
			"relentlesshunt": [
				"Damaging attacks receive 2× power on Rocky, Fairy Tale, Big Top, Dragon’s Den, Mountain and Snowy Mountain; 1.5× on Desert, Forest, Burning, Superheated, Ashen Beach, Water Surface, Cave, Starlight Arena and New World. Cold Eclipse’s shared handler supplies its 2× damage and raises the priority-eligible base-power threshold from 60 to 80; the ability’s own Cold Eclipse return avoids doubling those modifiers.",
			],
			"soulfire": [
				"Haunted and Cold Eclipse grant +1 Defense and Sp. Def on entry. Haunted, Burning, Volcanic and Bewitched Woods grant +1 Attack and Sp. Atk each turn. These are additional to ordinary Fire/Ghost redirection, absorption and attack rules.",
			],
			"soultag": [
				"Haunted entry reveals opposing items through Shadow Tag. Haunted and Cold Eclipse grant Soul Fire’s +1 Defense/Sp. Def; Cold Eclipse also grants Flame Body’s +1 Defense/Sp. Def instead of contact burning, for +2 each in total. Haunted, Burning, Volcanic and Bewitched Woods grant +1 Attack/Sp. Atk each turn. Volcanic raises contact-burn chance to 60%.",
			],
			"flashfire": [
				"Burning, or Volcanic while grounded, grants its Fire-power charge at turn end without needing an incoming Fire move. Cold Eclipse disables Fire absorption and grants +1 Defense and Special Defense on entry instead. The charge still follows its ordinary loss/switch rules.",
			],
		},
		"moves": {
			"smokescreen": [
				"On Burning Field, Corrosive Mist and Volcanic Summit, lowers Accuracy by two stages.",
			],
			"snowscape": [
				"Fails on Burning, Superheated and Volcanic fields with the message that intense heat prevents snow settling. Fairy Tale instead prints that the tale rejected the changing season; Starlight Arena prints that starlight refused to be eclipsed. Elsewhere its successful use creates Frozen Aura for five turns, or eight with Amplifield Rock; harsh sun can also prevent the move.",
			],
			"tarshot": [
				"On Murkwater, adds a guaranteed poison and additional one-stage Speed-drop secondary. On Volcanic Summit, its primary Speed drop becomes two stages. Its Fire-weakness volatile adds two effectiveness stages on Burning Field instead of one, multiplying Fire effectiveness by four rather than two.",
			],
			"willowisp": [
				"Burning Field and Volcanic Summit set base accuracy to 100%; Haunted sets it to 90%. A Ghost user bypasses accuracy checks, and a Fire user’s existing 100% base-accuracy rule still applies.",
			],
			"firepledge": [
				"After a successful hit or Substitute damage, records this pledge for field combinations. Fire + Grass creates Burning Field, Fire + Water creates Rainbow, and Grass + Water creates Swamp. A recorded complementary pledge grants approximately 1.3x power unless Adaptive Cycle blocks that field-only contribution. On an already timed matching combination field, the hit resets its duration to four turns, or seven with Amplifield Rock; this is a reset, not an addition. The move chooses Physical or Special using the higher offensive stat.",
			],
			"grasspledge": [
				"After a successful hit or Substitute damage, records this pledge for field combinations. Fire + Grass creates Burning Field, Fire + Water creates Rainbow, and Grass + Water creates Swamp. A recorded complementary pledge grants approximately 1.3x power unless Adaptive Cycle blocks that field-only contribution. On an already timed matching combination field, the hit resets its duration to four turns, or seven with Amplifield Rock; this is a reset, not an addition. The move chooses Physical or Special using the higher offensive stat.",
			],
			"grassyterrain": [
				"Attempts to establish Grassy Field for five turns, or eight with Amplifield Rock. When a different full field already exists and auras are enabled, the shared setter instead creates the corresponding aura. Existing field-lock and ability restrictions apply; the aura and full-field effects are distinct. Grassy Terrain on an existing Flower Garden follows the garden-growth rules rather than replacing it.",
			],
		},
	},
	"volcanicterrain": {
		"abilities": {
			"blaze": [
				"Burning and Volcanic activate Blaze’s 1.5× offensive-stat multiplier for Fire attacks at any HP. Cold Eclipse disables this multiplier even at low HP. Having Blaze as both active ability and species passive does not apply it twice.",
			],
			"flareboost": [
				"Fire attacks receive 1.5× power through the first branch on every field, including Cold Eclipse. On Burning or Volcanic, non-Fire special attacks also gain 1.5× without a burn. Cold Eclipse disables this second burned/special branch. The two branches return separately and do not stack with each other.",
			],
			"sinisterblaze": [
				"Fairy Tale, Starlight Arena, New World, Burning, Volcanic, Superheated and Cold Eclipse grant +1 Defense and Sp. Def on entry. Snowy Mountain, Icy and Cold Eclipse add Ice typing while this is the active ability, except for Abysseon and Divineon; this is not a blanket passive typing grant. Its ordinary self-burn, burn recovery and opposing chip remain separate.",
			],
			"steamengine": [
				"Burning, Superheated and Volcanic grant +6 Speed on entry. Water Surface, Underwater and Volcanic grant +1 Speed each turn. The residual handler’s Murkwater message check is inside an outer condition that excludes Murkwater, so Murkwater alone does not grant that residual boost. Midnight Zone entry changes the holder to Water when allowed. Full Magma Armor is also delegated, including its entry defenses, weather/status rules and Dragon’s Den Fire immunity.",
			],
			"thermalexchange": [
				"Burning, Superheated, Dragon’s Den and Volcanic grant +1 Attack each turn, in addition to its ordinary Fire-hit Attack boost and burn prevention/cure. No Fire hit is required for the field boost.",
			],
			"wellbakedbody": [
				"Burning, Superheated, Dragon’s Den and Volcanic grant +1 Defense each turn. The ordinary Fire-move absorption still grants +2 Defense separately when hit.",
			],
			"auroracurrent": [
				"Entry on Holy, Crystal Cavern, Dark Crystal Cavern, New World, Starlight Arena, Cave, Volcanic or Desert grants +1 Defense and Sp. Def. Its weather-setting call uses Hail, despite older prose calling it Snow. Effective Hail or Snow enables its ordinary never-miss Electric attacks and weather-based defenses; the field bonus itself does not require weather.",
			],
			"echofiend": [
				"Eligible sound attacks become Fire on Volcanic, Crystal on Crystal Cavern, and Flying otherwise. Sound attacks receive 2× power on Cave, Volcanic and Crystal Cavern; Mountain and Snowy Mountain use its ordinary 1.5× bonus. Type-changing exclusions still apply to special variable-type moves, damaging Z moves and a Terastallized Tera Blast. The sound immunity and allied sound protection remain.",
			],
			"powerdrill": [
				"Drill and horn moves receive 2× power and bypass Protect-style protection on Rocky, Mountain, Snowy Mountain, Cave and Volcanic, instead of the usual 1.5×. Cold Eclipse is not one of these five enhanced fields; its shared move-flag rules are documented separately. Dual Wield/Sharpness overlap uses the existing combined multiplier path, not an extra duplicate Power Drill bonus.",
			],
			"hyperdrill": [
				"Delegates the full Power Drill field package: drill/horn moves receive 2× power and bypass protection on Rocky, Mountain, Snowy Mountain, Cave and Volcanic. Its separate positive-defense-stage bypass remains. Native Power Drill is not applied twice.",
			],
			"soulfire": [
				"Haunted and Cold Eclipse grant +1 Defense and Sp. Def on entry. Haunted, Burning, Volcanic and Bewitched Woods grant +1 Attack and Sp. Atk each turn. These are additional to ordinary Fire/Ghost redirection, absorption and attack rules.",
			],
			"soultag": [
				"Haunted entry reveals opposing items through Shadow Tag. Haunted and Cold Eclipse grant Soul Fire’s +1 Defense/Sp. Def; Cold Eclipse also grants Flame Body’s +1 Defense/Sp. Def instead of contact burning, for +2 each in total. Haunted, Burning, Volcanic and Bewitched Woods grant +1 Attack/Sp. Atk each turn. Volcanic raises contact-burn chance to 60%.",
			],
			"flamebody": [
				"Volcanic raises the contact burn chance from 30% to 60%. Cold Eclipse instead grants +1 Defense and Special Defense on entry and disables the contact burn effect.",
			],
			"iceface": [
				"Cold Eclipse allows the intact Ice Face to absorb special as well as physical move damage before breaking. Volcanic marks the face broken on entry, so the update changes intact Eiscue into Noice Face rather than granting a shield. Ordinary restoration when hail or snow begins still follows the weather callback; resuming suppressed weather does not trigger restoration.",
			],
			"magmaarmor": [
				"On Dragon’s Den, Volcanic or Cold Eclipse entry, gains +1 Defense and Special Defense. Dragon’s Den also blocks incoming Fire moves from other Pokémon. Cold Eclipse removes its prevention of new frostbite, while its existing-status cure and halving of incoming Water/Ice offensive stats remain.",
			],
			"smolderingshroud": [
				"On Volcanic entry, gains +1 Attack and Special Attack. This does not consume its separate first-prevented-stat-drop Special Attack boost.",
			],
			"whitesmoke": [
				"On Volcanic entry, gains +1 Attack and Special Attack. Shared passive/component dispatch prevents a second copy when Smoldering Shroud already supplies this effect.",
			],
			"flashfire": [
				"Burning, or Volcanic while grounded, grants its Fire-power charge at turn end without needing an incoming Fire move. Cold Eclipse disables Fire absorption and grants +1 Defense and Special Defense on entry instead. The charge still follows its ordinary loss/switch rules.",
			],
			"relicarmor": [
				"Desert, Fairy Tale, Cave, Crystal Cavern, New World and Volcanic entry grant +1 Defense and Special Defense. Its Rock-typing weakness protection applies on Rocky, Fairy Tale, Water Surface, Underwater, Murkwater, Midnight Zone, Starlight Arena, New World, Holy, Mountain, Cave, Volcanic, Dragon’s Den, Crystal Cavern and Dark Crystal Cavern. Desert, Icy, Snowy Mountain and Cold Eclipse do not grant that protection by themselves. Aevian Lapras additionally gains Ice typing on Icy/Snowy Mountain/Cold Eclipse or in hail/snow. The visible Rock-protection message announces actual protection and is withheld during Illusion.",
			],
			"royaldecree": [
				"On entry, resets stat stages and screens unless Neutralization blocks the effect; Safeguard protects its side from that reset. Fairy Tale, Chess Board, New World and Starlight Arena additionally raise Defense or Special Defense according to opposing offensive stats: two stages in singles, one otherwise. Chess Board also multiplies both defenses by 1.5 while Neutralization is absent. The reset preserves field-supported positive defenses for Relic Armor/Defeatist on Desert, Fairy Tale, Cave, Crystal Cavern, New World and Volcanic Summit; Magician Special Attack on Fairy Tale, Bewitched Woods, Haunted, Misty and New World; Stalwart Special Attack on New World, Starlight, Fairy Tale and Chess Board. Mirror Arena’s existing Mirror Armor/Iron Dominion evasion boosts survive the reset, but their new evasion boosts are not allowed by the current ongoing exception. The prevention message appears when a stat change is actually blocked.",
			],
		},
		"moves": {
			"smokescreen": [
				"On Burning Field, Corrosive Mist and Volcanic Summit, lowers Accuracy by two stages.",
			],
			"snowscape": [
				"Fails on Burning, Superheated and Volcanic fields with the message that intense heat prevents snow settling. Fairy Tale instead prints that the tale rejected the changing season; Starlight Arena prints that starlight refused to be eclipsed. Elsewhere its successful use creates Frozen Aura for five turns, or eight with Amplifield Rock; harsh sun can also prevent the move.",
			],
			"tarshot": [
				"On Murkwater, adds a guaranteed poison and additional one-stage Speed-drop secondary. On Volcanic Summit, its primary Speed drop becomes two stages. Its Fire-weakness volatile adds two effectiveness stages on Burning Field instead of one, multiplying Fire effectiveness by four rather than two.",
			],
			"willowisp": [
				"Burning Field and Volcanic Summit set base accuracy to 100%; Haunted sets it to 90%. A Ghost user bypasses accuracy checks, and a Fire user’s existing 100% base-accuracy rule still applies.",
			],
			"firespin": [
				"On Volcanic Summit, adds a guaranteed burn secondary. On Haunted, targets all adjacent foes. Its binding effect and shared field-specific binding damage remain separate.",
			],
			"flameburst": [
				"On Volcanic Summit, splash damage to the target’s adjacent allies becomes one eighth maximum HP instead of one sixteenth. This also occurs after Substitute damage.",
			],
			"inferno": [
				"On Volcanic Summit, base accuracy becomes 100%; accuracy/evasion modifiers still apply.",
			],
			"ragingfury": [
				"On Volcanic Summit, adds a one-stage Attack self boost.",
			],
			"burningjealousy": [
				"On Volcanic Summit, its burn secondary can activate regardless of whether the target raised stats that turn. Burn immunity, existing status and secondary-effect protections remain.",
			],
		},
	},
	"dragonsdenterrain": {
		"abilities": {
			"goodasgold": [
				"Burning Field disables its protection from other Pokémon’s status moves. Dragon’s Den gives its attacks a 1.2× power modifier; the ordinary status-move immunity still applies there.",
			],
			"thermalexchange": [
				"Burning, Superheated, Dragon’s Den and Volcanic grant +1 Attack each turn, in addition to its ordinary Fire-hit Attack boost and burn prevention/cure. No Fire hit is required for the field boost.",
			],
			"wellbakedbody": [
				"Burning, Superheated, Dragon’s Den and Volcanic grant +1 Defense each turn. The ordinary Fire-move absorption still grants +2 Defense separately when hit.",
			],
			"relentlesshunt": [
				"Damaging attacks receive 2× power on Rocky, Fairy Tale, Big Top, Dragon’s Den, Mountain and Snowy Mountain; 1.5× on Desert, Forest, Burning, Superheated, Ashen Beach, Water Surface, Cave, Starlight Arena and New World. Cold Eclipse’s shared handler supplies its 2× damage and raises the priority-eligible base-power threshold from 60 to 80; the ability’s own Cold Eclipse return avoids doubling those modifiers.",
			],
			"armorize": [
				"Eligible Normal moves become Steel. The conversion bonus is 1.5× on Factory, Short-Circuit, Fairy Tale, Dragon’s Den, Starlight Arena, New World and Holy, instead of 1.2×. Cold Eclipse grants hail immunity but does not increase that conversion bonus. Variable-type moves retain their normal conversion exclusions.",
			],
			"argentdevotion": [
				"Its Armorize conversion gives 1.5× power on Factory, Short-Circuit, Fairy Tale, Dragon’s Den, Starlight Arena, New World and Holy, instead of 1.2×. Cold Eclipse grants hail immunity. On Fairy Tale entry, Sworn Duty heals each adjacent living ally by 1/3 base max HP instead of 1/4. Its other components remain active.",
			],
			"magmaarmor": [
				"On Dragon’s Den, Volcanic or Cold Eclipse entry, gains +1 Defense and Special Defense. Dragon’s Den also blocks incoming Fire moves from other Pokémon. Cold Eclipse removes its prevention of new frostbite, while its existing-status cure and halving of incoming Water/Ice offensive stats remain.",
			],
			"berserk": [
				"On Dragon’s Den entry, gains +2 Attack and Special Attack. Its ordinary +1 to both after a surviving attack crosses from above half HP to half or less remains a separate trigger.",
			],
			"dragonize": [
				"On Dragon’s Den and Fairy Tale, eligible Normal moves converted to Dragon have 1.5× power instead of 1.2×. Dragon STAB remains; moves with their own excluded type-setting effects are not converted.",
			],
			"draconicforce": [
				"On Dragon’s Den and Fairy Tale, its Dragonize conversion bonus rises from 1.2× to 1.5×. Its separate Strong Jaw biting bonus and Mold Breaker remain.",
			],
			"dragonsmaw": [
				"On Dragon’s Den and Fairy Tale, Dragon attacks use 2× Attack or Special Attack instead of 1.5×. The holder’s defensive Fairy-type effectiveness contribution is set to a resistance on these fields, rather than preserving its usual Fairy-type matchup.",
			],
			"ragingfists": [
				"Dragon’s Den grants 1.2× move power through its Hydra Bond component. No additional field-based hit-count multiplier is added; the established native multi-hit exclusions remain.",
			],
			"tyrantdomain": [
				"On fainting, prints “The Tyrant will persist” and attempts to create Dragon’s Den for five turns. The duration is set only when the field change succeeds; the message itself does not guarantee a successful transition.",
			],
			"hydrabond": [
				"Dragon’s Den adds 1.2× move power. This does not change native multi-hit counts or add another follow-up sequence; its usual format-specific targeting and extra-hit exclusions still apply.",
			],
			"unboundblaze": [
				"On Dragon’s Den and Fairy Tale, eligible Normal-to-Dragon conversion gains 1.5× power instead of 1.2×. Dragon’s Den also grants +1 Defense and Special Defense on entry and blocks incoming Fire moves via Magma Armor. Volcanic and Cold Eclipse grant the entry defenses too; Cold Eclipse does not prevent new frostbite. Its Fire residual damage rules remain unchanged.",
			],
			"marvelscale": [
				"Defense is 1.5× on Dragon’s Den, Fairy Tale, Rainbow, Starlight Arena and Misty without requiring a status condition. Having both a status and one of these fields does not stack the bonus.",
			],
			"shedskin": [
				"On Dragon’s Den, a qualifying end-of-turn recovery activates without its ordinary 50% roll: cure status, heal 1/4 max HP, raise the higher attacking stat by one stage (Attack wins ties), and lower Defense and Special Defense by one stage. It does not clear negative stages or listed volatile ailments in this branch, although those can trigger it. Scrafty with Shed Skin or Street Tyrant heals 1/8 instead.",
			],
			"shellarmor": [
				"On Dragon’s Den or Fairy Tale entry, gains +1 Defense. Its ordinary critical-hit prevention, 20% attack-damage reduction and +2 Special Defense response to an opposing stat drop remain.",
			],
			"predator": [
				"Against newly switched or still-pending-action targets, its ordinary conditional power multiplier becomes 2× on Mountain, Snowy Mountain and Rocky, or 1.5× on Fairy Tale, Dragon’s Den and Big Top. Its 2× authority/Ultra matchup bonuses replace this conditional bonus rather than stacking with it; Ultra matchups are disabled on Bewitched Woods, Haunted and Holy.",
			],
			"atrocity": [
				"Its converted Dragon attacks gain a 1.5x conversion modifier on Dragon Den and Fairy Tale instead of 1.2x. Cold Eclipse adds a 1.3x power modifier and raises its defensive multiplier to 1.5x instead of 1.3x. Its inherited Magma Armor field behavior remains: entry defenses on Dragon Den, Volcanic Summit and Cold Eclipse, with Dragon Den Fire protection and Cold Eclipse’s freeze exception. Dragon Rush additionally receives its existing 1.5x modifier. Royal Decree/Empress adds the existing authority bonus only while Neutralization is absent.",
			],
		},
		"moves": {
			"dragondance": [
				"Raises Attack and Speed by two stages each on Big Top and Dragon Den.",
			],
			"coil": [
				"On Grassy Field and Dragon Den, raises Attack, Defense and Accuracy by two stages each.",
			],
			"nobleroar": [
				"On Fairy Tale and Dragon Den, lowers Attack and Special Attack by two stages each.",
			],
			"scalyscorn": [
				"After positive damage on Fairy Tale or Dragon Den, raises the user’s Special Attack by two stages rather than one.",
			],
			"bounce": [
				"On Cave or Dragon Den, attacks immediately without spending a charge turn; the preparation/animation messages still play. Tailwind or Strong Winds independently remove charging and add a critical-rate stage.",
			],
			"fly": [
				"On Cave or Dragon Den, attacks immediately without spending a charge turn; the preparation/animation messages still play. Tailwind or Strong Winds independently remove charging and add a critical-rate stage.",
			],
			"skydrop": [
				"Cave prevents the pickup. Dragon Den prevents the move in its pre-use callback unless Adaptive Cycle shields the attacker from that field effect. The separate Yearning Star version retains its Cave, weight, ally, Substitute and Flying-target restrictions.",
			],
			"dragonrush": [
				"Dragon Den sets base accuracy to 100%; accuracy/evasion modifiers still apply.",
			],
		},
		"items": {
			"amuletcoin": [
				"On Dragon Den, prevents a new major status from being applied to its holder. It does not cure an existing status.",
			],
		},
	},
	"fairytaleterrain": {
		"abilities": {
			"sinisterblaze": [
				"Fairy Tale, Starlight Arena, New World, Burning, Volcanic, Superheated and Cold Eclipse grant +1 Defense and Sp. Def on entry. Snowy Mountain, Icy and Cold Eclipse add Ice typing while this is the active ability, except for Abysseon and Divineon; this is not a blanket passive typing grant. Its ordinary self-burn, burn recovery and opposing chip remain separate.",
			],
			"relentlesshunt": [
				"Damaging attacks receive 2× power on Rocky, Fairy Tale, Big Top, Dragon’s Den, Mountain and Snowy Mountain; 1.5× on Desert, Forest, Burning, Superheated, Ashen Beach, Water Surface, Cave, Starlight Arena and New World. Cold Eclipse’s shared handler supplies its 2× damage and raises the priority-eligible base-power threshold from 60 to 80; the ability’s own Cold Eclipse return avoids doubling those modifiers.",
			],
			"queenlymajesty": [
				"Damaging attacks deal 1.5× damage on Fairy Tale. On Chessboard the same bonus applies only when the attacker does not have the Queen role. Its protection against opposing priority attacks remains.",
			],
			"stalwart": [
				"On entry, gains +1 Special Attack on Chessboard, Fairy Tale, New World and Starlight Arena. Moves still ignore redirection; the shared Cave collapse handler also recognizes Stalwart as protection from that collapse.",
			],
			"stancechange": [
				"On entry to Chessboard or Fairy Tale, gains +1 Defense and Special Defense. A qualifying Aegislash changing into Blade gains +1 Attack and Special Attack but loses one Defense and Special Defense stage; returning to Shield reverses those stage changes. Status moves other than King’s Shield do not change stance. Transformed users and Aegislash-Gmax do not perform the stance changes.",
			],
			"sacrededge": [
				"Cold Eclipse disables its Sharpness slicing-power bonus; the eligible two-hit behavior remains. On Fairy Tale, entry or Mega Evolution heals each adjacent living ally by 1/3 base max HP instead of 1/4, printing “[Pokémon] shared its mead with [ally]!” for each recipient.",
			],
			"defragment": [
				"On Cold Eclipse and Fairy Tale entry, raises both Defense and Special Defense by one stage. On Factory, Short-Circuit, Glitch, New World and Starlight Arena, compares all living foes’ combined Attack and Special Attack and raises the corresponding defense by two stages (Defense wins a tie), instead of the ordinary one-stage increase. Its attacks still cannot miss.",
			],
			"eternalflower": [
				"Fairy Tale and Cold Eclipse multiply both offensive stats by 2; New World, Starlight Arena and Bewitched Woods use 1.5× instead. Its separate 1.5× offensive-stat bonus for Grass attacks stacks with this. On fainting, it attempts to establish Bewitched Woods for five turns; a blocked field change does not set that duration.",
			],
			"ancientbloom": [
				"On Fairy Tale, New World, Cold Eclipse or Starlight Arena entry, gains +1 Defense and Special Defense. New World, Cold Eclipse and Starlight Arena also multiply its move power by 1.5. Its Pollen Bloom, Self-Sufficient and Friend Guard components continue independently.",
			],
			"armorize": [
				"Eligible Normal moves become Steel. The conversion bonus is 1.5× on Factory, Short-Circuit, Fairy Tale, Dragon’s Den, Starlight Arena, New World and Holy, instead of 1.2×. Cold Eclipse grants hail immunity but does not increase that conversion bonus. Variable-type moves retain their normal conversion exclusions.",
			],
			"argentdevotion": [
				"Its Armorize conversion gives 1.5× power on Factory, Short-Circuit, Fairy Tale, Dragon’s Den, Starlight Arena, New World and Holy, instead of 1.2×. Cold Eclipse grants hail immunity. On Fairy Tale entry, Sworn Duty heals each adjacent living ally by 1/3 base max HP instead of 1/4. Its other components remain active.",
			],
			"wrathshield": [
				"On Cold Eclipse, Fairy Tale, New World and Starlight Arena entry, gains +1 Special Defense. This field bonus does not raise Defense; Stamina can still grant Defense from qualifying opposing hits.",
			],
			"dragonize": [
				"On Dragon’s Den and Fairy Tale, eligible Normal moves converted to Dragon have 1.5× power instead of 1.2×. Dragon STAB remains; moves with their own excluded type-setting effects are not converted.",
			],
			"draconicforce": [
				"On Dragon’s Den and Fairy Tale, its Dragonize conversion bonus rises from 1.2× to 1.5×. Its separate Strong Jaw biting bonus and Mold Breaker remain.",
			],
			"dragonsmaw": [
				"On Dragon’s Den and Fairy Tale, Dragon attacks use 2× Attack or Special Attack instead of 1.5×. The holder’s defensive Fairy-type effectiveness contribution is set to a resistance on these fields, rather than preserving its usual Fairy-type matchup.",
			],
			"unboundblaze": [
				"On Dragon’s Den and Fairy Tale, eligible Normal-to-Dragon conversion gains 1.5× power instead of 1.2×. Dragon’s Den also grants +1 Defense and Special Defense on entry and blocks incoming Fire moves via Magma Armor. Volcanic and Cold Eclipse grant the entry defenses too; Cold Eclipse does not prevent new frostbite. Its Fire residual damage rules remain unchanged.",
			],
			"marvelscale": [
				"Defense is 1.5× on Dragon’s Den, Fairy Tale, Rainbow, Starlight Arena and Misty without requiring a status condition. Having both a status and one of these fields does not stack the bonus.",
			],
			"shellarmor": [
				"On Dragon’s Den or Fairy Tale entry, gains +1 Defense. Its ordinary critical-hit prevention, 20% attack-damage reduction and +2 Special Defense response to an opposing stat drop remain.",
			],
			"armortail": [
				"On Fairy Tale entry, gains +1 Defense and Special Defense in addition to its ordinary protection against opposing priority moves.",
			],
			"battlearmor": [
				"On Fairy Tale entry, gains +1 Defense. Its ordinary critical-hit prevention, 20% attack-damage reduction and +2 Defense response to an opposing stat drop remain.",
			],
			"apexarmor": [
				"Fairy Tale entry grants +1 Defense and Special Defense, plus +1 Special Attack from its Stalwart component. Stalwart also grants that Special Attack stage on New World, Starlight Arena and Chessboard.",
			],
			"dauntlessshield": [
				"Fairy Tale entry adds +1 Defense and Special Defense to its ordinary +1 Defense, for +2 Defense and +1 Special Defense in total. The current entry callback has no once-per-battle guard.",
			],
			"ange": [
				"Its full Fairy Aura component makes the holder’s moves bypass accuracy checks on Fairy Tale. The ordinary shared Fairy-power aura remains; Eternal Flower is a separate passive rather than an extra copy inside Ange.",
			],
			"fairyaura": [
				"On Fairy Tale, the holder’s moves bypass accuracy checks; this callback is not limited to Fairy moves. Its ordinary shared Fairy attack-power aura remains.",
			],
			"auroradomain": [
				"On fainting, prints “The Aurora will persist”, attempts to create Fairy Tale for five turns, and independently starts or refreshes its side’s Aurora Veil to five turns. A blocked field change does not prevent the veil attempt. This is not an entry veil.",
			],
			"swornduty": [
				"On Fairy Tale entry, heals each adjacent living ally by 1/3 base max HP instead of 1/4. For each attempted recipient it prints “[Pokémon] shared its mead with [ally]!”. It does not heal the holder.",
			],
			"intrepidsword": [
				"Its once-per-battle entry boost on Fairy Tale totals +2 Attack and +1 Special Attack instead of only +1 Attack. The extra stages do not bypass the once-per-battle guard.",
			],
			"magicbounce": [
				"Fairy Tale entry gives +1 Special Defense; Mirror Arena entry gives +1 evasion. On Mirror Arena, reflecting a directly targeted move also grants the original user +1 evasion. Side-targeted reflections do not use that additional evasion callback.",
			],
			"magicguard": [
				"Fairy Tale entry grants +1 Special Defense. Its ordinary indirect-damage prevention and HP-cost exceptions remain unchanged.",
			],
			"powerofalchemy": [
				"Fairy Tale entry grants +1 Defense and Special Defense. Its independent recovery and fainted-ally ability-copying behavior remain.",
			],
			"astralwitchcraft": [
				"On Fairy Tale and New World entry, its own bonus gives +1 Special Attack and Special Defense, while its Void Guile component separately supplies another +1 Special Attack. These are distinct bonuses; it does not receive Magic Bounce’s entry bonus or reflection.",
			],
			"steelyspirit": [
				"On Fairy Tale, its side’s Steel moves receive 2× power instead of 1.5×. The shared ally-power event includes the holder.",
			],
			"ultraego": [
				"On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special HP hits after activation additionally grant +1 Defense and Special Defense respectively. A qualifying hit at half HP or less instead heals 1/4 base max HP once per activation; blocked healing does not spend that recovery. Bewitched Woods, Haunted and Holy disable its Ultra Ego effects, including its rivalry with Ultra Instinct.",
			],
			"perfectego": [
				"On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special HP hits after activation additionally grant +1 Defense and Special Defense respectively. A qualifying hit at half HP or less instead heals 1/4 base max HP once per activation; blocked healing does not spend that recovery. Bewitched Woods, Haunted and Holy disable its Ultra Ego effects, including its rivalry with Ultra Instinct. Its accuracy-bypassing moves continue even on those suppressing fields.",
			],
			"burningego": [
				"On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special HP hits after activation additionally grant +1 Defense and Special Defense respectively. A qualifying hit at half HP or less instead heals 1/4 base max HP once per activation; blocked healing does not spend that recovery. Bewitched Woods, Haunted and Holy disable its Ultra Ego effects, including its rivalry with Ultra Instinct. Its Flame Body and Magma Armor components give a combined +2 Defense and Special Defense on Cold Eclipse entry, disable contact burns there, and allow new frostbite. Volcanic gives a 60% contact burn chance and +1 Defense/Special Defense on entry; Dragon’s Den grants those entry defenses and Fire immunity.",
			],
			"predator": [
				"Against newly switched or still-pending-action targets, its ordinary conditional power multiplier becomes 2× on Mountain, Snowy Mountain and Rocky, or 1.5× on Fairy Tale, Dragon’s Den and Big Top. Its 2× authority/Ultra matchup bonuses replace this conditional bonus rather than stacking with it; Ultra matchups are disabled on Bewitched Woods, Haunted and Holy.",
			],
			"relicarmor": [
				"Desert, Fairy Tale, Cave, Crystal Cavern, New World and Volcanic entry grant +1 Defense and Special Defense. Its Rock-typing weakness protection applies on Rocky, Fairy Tale, Water Surface, Underwater, Murkwater, Midnight Zone, Starlight Arena, New World, Holy, Mountain, Cave, Volcanic, Dragon’s Den, Crystal Cavern and Dark Crystal Cavern. Desert, Icy, Snowy Mountain and Cold Eclipse do not grant that protection by themselves. Aevian Lapras additionally gains Ice typing on Icy/Snowy Mountain/Cold Eclipse or in hail/snow. The visible Rock-protection message announces actual protection and is withheld during Illusion.",
			],
			"imperialmandate": [
				"On Fairy Tale, Chessboard, New World, Starlight Arena and Cold Eclipse, half HP or more grants one tracked Defense and Special Defense stage instead of its ordinary 2× attack power. Below half HP, those granted stages are removed and it receives 1.5× attack power plus double Speed. Leaving the favored fields removes the tracked defenses. “fortifies its defenses” announces the high-HP field mode; “quickens its command” announces low-HP mode; “empowers its attacks” announces ordinary high-HP mode.",
			],
			"pastelveil": [
				"On activation, cures poison on the holder and allies. Fairy Tale also raises the holder’s Special Defense by one; this activation can repeat when another Pokémon switches in. Bewitched Woods cancels weaknesses contributed by the holder’s Fairy typing. In Misty or Rainbow Field, the current callbacks reduce outgoing Poison damage: the holder’s attack receives both half-damage callbacks (one quarter overall), and an ally’s attack receives one (one half). They do not reduce incoming Poison damage. This describes the current implementation, not the old defensive description.",
			],
			"royaldecree": [
				"On entry, resets stat stages and screens unless Neutralization blocks the effect; Safeguard protects its side from that reset. Fairy Tale, Chess Board, New World and Starlight Arena additionally raise Defense or Special Defense according to opposing offensive stats: two stages in singles, one otherwise. Chess Board also multiplies both defenses by 1.5 while Neutralization is absent. The reset preserves field-supported positive defenses for Relic Armor/Defeatist on Desert, Fairy Tale, Cave, Crystal Cavern, New World and Volcanic Summit; Magician Special Attack on Fairy Tale, Bewitched Woods, Haunted, Misty and New World; Stalwart Special Attack on New World, Starlight, Fairy Tale and Chess Board. Mirror Arena’s existing Mirror Armor/Iron Dominion evasion boosts survive the reset, but their new evasion boosts are not allowed by the current ongoing exception. The prevention message appears when a stat change is actually blocked.",
			],
			"fortressshell": [
				"Its Stalwart component raises Special Attack on entry in New World, Starlight Arena, Fairy Tale and Chess Board. Shell Armor adds entry Defense on Fairy Tale or Dragon Den. Its own field-entry effect raises Defense and Special Defense on Fairy Tale, New World, Cold Eclipse or Starlight, tracking changes between fields. New World, Cold Eclipse and Starlight give 1.5x power. Guardian Presence gives allied attacks 1.5x power on Haunted, Bewitched Woods, Holy or Psychic Field (1.3x otherwise), and reduces allied incoming damage by 25%. Electric Aura, Electric Field, Murkwater, Water Surface, Underwater, Midnight Zone, Factory or Short-Circuit activate its Electric redirection/absorption and Attack/Special Attack increases.",
			],
			"mirrorarmor": [
				"Fairy Tale grants one Defense and Special Defense stage on entry; Mirror Arena grants one evasion stage. Royal Decree preserves existing matching field boosts during its entry reset. Starlight Arena supplies its priority-protection callback. Ordinary reflected stat drops still follow Mirror Armor’s targeting and reflection rules.",
			],
			"atrocity": [
				"Its converted Dragon attacks gain a 1.5x conversion modifier on Dragon Den and Fairy Tale instead of 1.2x. Cold Eclipse adds a 1.3x power modifier and raises its defensive multiplier to 1.5x instead of 1.3x. Its inherited Magma Armor field behavior remains: entry defenses on Dragon Den, Volcanic Summit and Cold Eclipse, with Dragon Den Fire protection and Cold Eclipse’s freeze exception. Dragon Rush additionally receives its existing 1.5x modifier. Royal Decree/Empress adds the existing authority bonus only while Neutralization is absent.",
			],
			"irondominion": [
				"Fairy Tale increases its adjacent-ally entry healing from one quarter to one third maximum HP; the shared-mead message accompanies each attempted ally heal. This healing is skipped when Sworn Duty is already the species passive. Fairy Tale also grants one Defense and Special Defense stage once per ability activation; Mirror Arena grants one evasion stage. Cold Eclipse changes its Pressure drops to two stages in both defenses, retaining the per-target attempt memory and Substitute check. Starlight Arena blocks opposing positive-priority moves aimed at its protected side, with the callback’s field-wide targeting exclusions.",
			],
		},
		"moves": {
			"swordsdance": [
				"On Big Top and Fairy Tale, raises Attack by three stages.",
			],
			"floralhealing": [
				"Restores up to full maximum HP on Grassy Field, Fairy Tale or Flower Garden stage 3; otherwise restores half. On Corrosive Field or Corrosive Mist, a successful heal also attempts to poison the recipient. A failed heal does not poison.",
			],
			"acidarmor": [
				"Raises Defense by three stages on Corrosive Field, Corrosive Mist, Fairy Tale and Murkwater.",
			],
			"forestscurse": [
				"After successfully changing the target to pure Grass, Fairy Tale, Forest and Bewitched Woods also apply the Curse volatile if absent. It fails against an already pure-Grass target, so that case does not add Curse. The type-change message confirms the successful conversion.",
			],
			"nobleroar": [
				"On Fairy Tale and Dragon Den, lowers Attack and Special Attack by two stages each.",
			],
			"scalyscorn": [
				"After positive damage on Fairy Tale or Dragon Den, raises the user’s Special Attack by two stages rather than one.",
			],
			"craftyshield": [
				"On Fairy Tale, a successful field-hit callback also raises the user’s Defense and Special Defense by one stage. Ordinary status-move protection remains.",
			],
			"flowershield": [
				"On Fairy Tale, adds one Defense and Special Defense stage to the user, then supplies the normal Defense boost to eligible Grass types. Flower Garden stages 2 and 3 instead boost both defenses of active allies by one or two stages respectively, without a Grass-type requirement.",
			],
			"sweetkiss": [
				"Misty Field sets base accuracy to 100%. Fairy Tale cures the target’s sleep on a successful hit, alongside its normal confusion effect.",
			],
			"snowscape": [
				"Fails on Burning, Superheated and Volcanic fields with the message that intense heat prevents snow settling. Fairy Tale instead prints that the tale rejected the changing season; Starlight Arena prints that starlight refused to be eclipsed. Elsewhere its successful use creates Frozen Aura for five turns, or eight with Amplifield Rock; harsh sun can also prevent the move.",
			],
			"kingsshield": [
				"On Fairy Tale and Chess Board, a blocked contact move lowers the attacker’s Special Attack by two stages as well as Attack by two. For contact damage that partially passes protection, the extra Special Attack drop is implemented on Fairy Tale only. Normal contact and protection-bypass checks remain.",
			],
			"healingwish": [
				"When its slot condition processes an incoming Pokémon on Fairy Tale or Starlight Arena, also raises Attack and Special Attack by one. This boost sits outside the healing-success check; a healthy, status-free entrant can receive it while the unused wish remains.",
			],
			"miracleeye": [
				"On Psychic Field, Fairy Tale and Holy Field, a successful hit additionally raises the user’s Special Attack by two. Its existing Ghost-resistance volatile, Dark-target Psychic immunity bypass and positive-evasion bypass remain.",
			],
			"strangesteam": [
				"On Fairy Tale and Misty Field, its confusion secondary becomes guaranteed, subject to ordinary secondary/immunity rules. Its independent super-effective-target priority rule remains.",
			],
			"wish": [
				"If created on Misty, Rainbow, Fairy Tale, Holy or Starlight, stores healing equal to three quarters of the original user’s maximum HP instead of half. The amount is decided when Wish is set, not when it resolves. The Wish healing message appears only when healing succeeds.",
			],
			"steelystrike": [
				"On Fairy Tale, gains 1.5x power unless the target has Adaptive Cycle field protection. The blade-cuts-true message is printed when that power callback applies. Its existing screen removal remains.",
			],
		},
	},
	"newworldterrain": {
		"abilities": {
			"sinisterblaze": [
				"Fairy Tale, Starlight Arena, New World, Burning, Volcanic, Superheated and Cold Eclipse grant +1 Defense and Sp. Def on entry. Snowy Mountain, Icy and Cold Eclipse add Ice typing while this is the active ability, except for Abysseon and Divineon; this is not a blanket passive typing grant. Its ordinary self-burn, burn recovery and opposing chip remain separate.",
			],
			"auroracurrent": [
				"Entry on Holy, Crystal Cavern, Dark Crystal Cavern, New World, Starlight Arena, Cave, Volcanic or Desert grants +1 Defense and Sp. Def. Its weather-setting call uses Hail, despite older prose calling it Snow. Effective Hail or Snow enables its ordinary never-miss Electric attacks and weather-based defenses; the field bonus itself does not require weather.",
			],
			"relentlesshunt": [
				"Damaging attacks receive 2× power on Rocky, Fairy Tale, Big Top, Dragon’s Den, Mountain and Snowy Mountain; 1.5× on Desert, Forest, Burning, Superheated, Ashen Beach, Water Surface, Cave, Starlight Arena and New World. Cold Eclipse’s shared handler supplies its 2× damage and raises the priority-eligible base-power threshold from 60 to 80; the ability’s own Cold Eclipse return avoids doubling those modifiers.",
			],
			"stalwart": [
				"On entry, gains +1 Special Attack on Chessboard, Fairy Tale, New World and Starlight Arena. Moves still ignore redirection; the shared Cave collapse handler also recognizes Stalwart as protection from that collapse.",
			],
			"defragment": [
				"On Cold Eclipse and Fairy Tale entry, raises both Defense and Special Defense by one stage. On Factory, Short-Circuit, Glitch, New World and Starlight Arena, compares all living foes’ combined Attack and Special Attack and raises the corresponding defense by two stages (Defense wins a tie), instead of the ordinary one-stage increase. Its attacks still cannot miss.",
			],
			"eternalflower": [
				"Fairy Tale and Cold Eclipse multiply both offensive stats by 2; New World, Starlight Arena and Bewitched Woods use 1.5× instead. Its separate 1.5× offensive-stat bonus for Grass attacks stacks with this. On fainting, it attempts to establish Bewitched Woods for five turns; a blocked field change does not set that duration.",
			],
			"ancientbloom": [
				"On Fairy Tale, New World, Cold Eclipse or Starlight Arena entry, gains +1 Defense and Special Defense. New World, Cold Eclipse and Starlight Arena also multiply its move power by 1.5. Its Pollen Bloom, Self-Sufficient and Friend Guard components continue independently.",
			],
			"armorize": [
				"Eligible Normal moves become Steel. The conversion bonus is 1.5× on Factory, Short-Circuit, Fairy Tale, Dragon’s Den, Starlight Arena, New World and Holy, instead of 1.2×. Cold Eclipse grants hail immunity but does not increase that conversion bonus. Variable-type moves retain their normal conversion exclusions.",
			],
			"argentdevotion": [
				"Its Armorize conversion gives 1.5× power on Factory, Short-Circuit, Fairy Tale, Dragon’s Den, Starlight Arena, New World and Holy, instead of 1.2×. Cold Eclipse grants hail immunity. On Fairy Tale entry, Sworn Duty heals each adjacent living ally by 1/3 base max HP instead of 1/4. Its other components remain active.",
			],
			"wrathshield": [
				"On Cold Eclipse, Fairy Tale, New World and Starlight Arena entry, gains +1 Special Defense. This field bonus does not raise Defense; Stamina can still grant Defense from qualifying opposing hits.",
			],
			"mimicry": [
				"On Crystal Cavern, changes to the current crystal cycle’s Fire, Water, Grass or Psychic type. On New World, randomly selects one of the eighteen ordinary types. A current aura with a Mimicry type overrides that field choice. Terastallized Pokémon do not change type.",
			],
			"astralwitchcraft": [
				"On Fairy Tale and New World entry, its own bonus gives +1 Special Attack and Special Defense, while its Void Guile component separately supplies another +1 Special Attack. These are distinct bonuses; it does not receive Magic Bounce’s entry bonus or reflection.",
			],
			"beadsofruin": [
				"On New World, the Special Defense multiplier for other active Pokémon without Beads of Ruin becomes 0.66× instead of 0.75×. Multiple holders do not stack the same modifier.",
			],
			"solaridol": [
				"New World and Starlight Arena entry grant +1 Defense. Its ordinary Fire-power and effective-sun Attack effects remain separate.",
			],
			"lunaridol": [
				"New World and Starlight Arena entry grant +1 Special Defense. Its ordinary Ice-power, hail immunity and effective hail/snow Special Attack effects remain separate.",
			],
			"tabletsofruin": [
				"On New World, the Attack multiplier for active Pokémon without Tablets of Ruin becomes 0.66× instead of 0.75×. Multiple holders do not stack the same modifier.",
			],
			"vesselofruin": [
				"On New World, the Special Attack multiplier for active Pokémon without Vessel of Ruin becomes 0.66× instead of 0.75×. Multiple holders do not stack the same modifier.",
			],
			"victorystar": [
				"New World and Starlight Arena multiply damage handled by its opposing-Pokémon damage callback by 1.5. That callback prints the literal message “Happened” when it runs, including outside those fields; the message is debugging-like flavor, not an extra effect. Its ordinary ally accuracy boost remains.",
			],
			"battlefervor": [
				"Ashen Beach, New World, Starlight Arena and Cold Eclipse add flinch immunity and protection from externally lowered stat stages. Cold Eclipse entry also attempts -1 Speed against foes, blocked by Substitute. Bewitched Woods, Haunted and Holy disable these benefits along with its ordinary power, defensive, berry/seed and retaliation effects; Holy does not grant the listed defensive benefits.",
			],
			"ultraego": [
				"On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special HP hits after activation additionally grant +1 Defense and Special Defense respectively. A qualifying hit at half HP or less instead heals 1/4 base max HP once per activation; blocked healing does not spend that recovery. Bewitched Woods, Haunted and Holy disable its Ultra Ego effects, including its rivalry with Ultra Instinct.",
			],
			"perfectego": [
				"On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special HP hits after activation additionally grant +1 Defense and Special Defense respectively. A qualifying hit at half HP or less instead heals 1/4 base max HP once per activation; blocked healing does not spend that recovery. Bewitched Woods, Haunted and Holy disable its Ultra Ego effects, including its rivalry with Ultra Instinct. Its accuracy-bypassing moves continue even on those suppressing fields.",
			],
			"burningego": [
				"On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special HP hits after activation additionally grant +1 Defense and Special Defense respectively. A qualifying hit at half HP or less instead heals 1/4 base max HP once per activation; blocked healing does not spend that recovery. Bewitched Woods, Haunted and Holy disable its Ultra Ego effects, including its rivalry with Ultra Instinct. Its Flame Body and Magma Armor components give a combined +2 Defense and Special Defense on Cold Eclipse entry, disable contact burns there, and allow new frostbite. Volcanic gives a 60% contact burn chance and +1 Defense/Special Defense on entry; Dragon’s Den grants those entry defenses and Fire immunity.",
			],
			"ultrainstinct": [
				"Ashen Beach, New World, Starlight Arena and Cold Eclipse increase its first opposing HP-damaging move reduction each turn from 30% to 35%, covering that move’s multiple hits, and increase its once-per-turn healing after its own completed damaging attack from 1/16 to 1/8 base max HP. Ultra Ego rivalry instead uses 40% reduction. Bewitched Woods, Haunted and Holy disable these effects. Substitute-only damage does not spend its guard.",
			],
			"duskilate": [
				"Eligible Normal moves become Fairy on Holy and Rainbow, otherwise Dark. Their conversion bonus is 1.5× on Dark Crystal Cavern, New World, Starlight Arena, Cold Eclipse, Short-Circuit, Haunted, Bewitched Woods, Holy and Rainbow, instead of 1.3×. Cold Eclipse additionally grants hail immunity. Cold Eclipse also recognizes Duskilate for its 1.5× defenses and exemption from the grounded Speed penalty.",
			],
			"execution": [
				"Eligible Normal moves become Fairy on Holy and Rainbow, otherwise Dark. Their conversion bonus is 1.5× on Dark Crystal Cavern, New World, Starlight Arena, Cold Eclipse, Short-Circuit, Haunted, Bewitched Woods, Holy and Rainbow, instead of 1.3×. Cold Eclipse additionally grants hail immunity. While any base field exists, its current stat-change handler blocks Speed drops, including self-caused drops; its Attack/Special Attack floor and KO healing remain separate.",
			],
			"relicarmor": [
				"Desert, Fairy Tale, Cave, Crystal Cavern, New World and Volcanic entry grant +1 Defense and Special Defense. Its Rock-typing weakness protection applies on Rocky, Fairy Tale, Water Surface, Underwater, Murkwater, Midnight Zone, Starlight Arena, New World, Holy, Mountain, Cave, Volcanic, Dragon’s Den, Crystal Cavern and Dark Crystal Cavern. Desert, Icy, Snowy Mountain and Cold Eclipse do not grant that protection by themselves. Aevian Lapras additionally gains Ice typing on Icy/Snowy Mountain/Cold Eclipse or in hail/snow. The visible Rock-protection message announces actual protection and is withheld during Illusion.",
			],
			"imperialmandate": [
				"On Fairy Tale, Chessboard, New World, Starlight Arena and Cold Eclipse, half HP or more grants one tracked Defense and Special Defense stage instead of its ordinary 2× attack power. Below half HP, those granted stages are removed and it receives 1.5× attack power plus double Speed. Leaving the favored fields removes the tracked defenses. “fortifies its defenses” announces the high-HP field mode; “quickens its command” announces low-HP mode; “empowers its attacks” announces ordinary high-HP mode.",
			],
			"burningcrown": [
				"New World, Cold Eclipse and Starlight Arena grant 1.5× move power. Its Unbound Blaze component additionally gives +1 Defense/Special Defense on Cold Eclipse, Volcanic or Dragon’s Den entry; Dragon’s Den blocks Fire attacks, and Dragon’s Den/Fairy Tale improve the Normal-to-Dragon conversion bonus to 1.5×. Cold Eclipse allows new frostbite through the Magma Armor component.",
			],
			"royaldecree": [
				"On entry, resets stat stages and screens unless Neutralization blocks the effect; Safeguard protects its side from that reset. Fairy Tale, Chess Board, New World and Starlight Arena additionally raise Defense or Special Defense according to opposing offensive stats: two stages in singles, one otherwise. Chess Board also multiplies both defenses by 1.5 while Neutralization is absent. The reset preserves field-supported positive defenses for Relic Armor/Defeatist on Desert, Fairy Tale, Cave, Crystal Cavern, New World and Volcanic Summit; Magician Special Attack on Fairy Tale, Bewitched Woods, Haunted, Misty and New World; Stalwart Special Attack on New World, Starlight, Fairy Tale and Chess Board. Mirror Arena’s existing Mirror Armor/Iron Dominion evasion boosts survive the reset, but their new evasion boosts are not allowed by the current ongoing exception. The prevention message appears when a stat change is actually blocked.",
			],
			"fortressshell": [
				"Its Stalwart component raises Special Attack on entry in New World, Starlight Arena, Fairy Tale and Chess Board. Shell Armor adds entry Defense on Fairy Tale or Dragon Den. Its own field-entry effect raises Defense and Special Defense on Fairy Tale, New World, Cold Eclipse or Starlight, tracking changes between fields. New World, Cold Eclipse and Starlight give 1.5x power. Guardian Presence gives allied attacks 1.5x power on Haunted, Bewitched Woods, Holy or Psychic Field (1.3x otherwise), and reduces allied incoming damage by 25%. Electric Aura, Electric Field, Murkwater, Water Surface, Underwater, Midnight Zone, Factory or Short-Circuit activate its Electric redirection/absorption and Attack/Special Attack increases.",
			],
		},
		"moves": {
			"cosmicpower": [
				"On Holy, New World, Rainbow, Starlight Arena, Misty and Psychic fields, raises Defense and Special Defense by two stages each.",
			],
			"takeheart": [
				"On New World, Starlight Arena, Psychic Field, Water Surface and Underwater, raises Special Attack and Special Defense by two stages. Its major-status cure remains.",
			],
			"moonlight": [
				"Cold Eclipse restores three quarters maximum HP regardless of weather. Dark Crystal Cavern, New World, Starlight Arena and Bewitched Woods restore three quarters except in sun (approximately two thirds) or snow (one quarter). Adaptive Cycle can neutralize the adverse snow reduction. Healing restrictions still apply.",
			],
			"trickroom": [
				"Lasts eight turns on Chess Board, New World and Psychic Field, taking precedence over Persistent’s seven-turn duration. Using it while already active still ends it.",
			],
			"darkvoid": [
				"Dark Crystal Cavern, New World and Cold Eclipse set base accuracy to 100% when a target is available to its modifier. Other hit and sleep restrictions remain.",
			],
			"naturesmadness": [
				"Deals three quarters of the target’s current undynamaxed HP on Grassy Field, Forest and New World, or two thirds on Holy, instead of half. Minimum one damage.",
			],
			"fissure": [
				"New World prevents use and prints that the unformed land diffused the attack. Adaptive Cycle field protection bypasses this field-specific failure.",
			],
			"heartswap": [
				"On New World, also averages the two Pokémon’s current HP, using the target’s undynamaxed HP and rounding down, with a minimum of one. Ordinary stat-stage swapping remains.",
			],
			"lunardance": [
				"On New World, its slot callback additionally boosts Attack, Defense, Special Attack, Special Defense and Speed by one; on Starlight, boosts Attack and Special Attack by one. These boosts occur before the actual healing/PP-restoration check, so an otherwise healthy entrant can receive them.",
			],
			"magicroom": [
				"On New World and Psychic Field, lasts eight turns. Amplifield Rock independently gives eight; otherwise Persistent gives seven and the base duration is five. Reusing the move ends the room.",
			],
			"wonderroom": [
				"On New World and Psychic Field, lasts eight turns. Amplifield Rock independently gives eight; otherwise Persistent gives seven and the base duration is five. Reusing the move ends the room.",
			],
			"camouflage": [
				"On Crystal Cavern, selects the current crystal type from Fire, Water, Grass and Psychic without advancing the crystal counter. On New World, randomly chooses one of the 18 ordinary types. An active aura overrides either choice with its own Mimicry type. Normal type-change restrictions remain.",
			],
			"naturepower": [
				"Calls Power Gem on Crystal Cavern and Spacial Rend on New World. Frozen Aura overrides the field choice with its registered Nature Power move. The called move keeps its own targeting and field interactions.",
			],
			"terrainpulse": [
				"On Crystal Cavern, becomes the current crystal type (Fire, Water, Grass or Psychic) without advancing the counter. On New World, randomly becomes one of the 18 ordinary types. An active aura overrides this type selection. Neither field alone activates Terrain Pulse’s separate doubled-power condition.",
			],
		},
	},
	"starlightarenaterrain": {
		"abilities": {
			"sinisterblaze": [
				"Fairy Tale, Starlight Arena, New World, Burning, Volcanic, Superheated and Cold Eclipse grant +1 Defense and Sp. Def on entry. Snowy Mountain, Icy and Cold Eclipse add Ice typing while this is the active ability, except for Abysseon and Divineon; this is not a blanket passive typing grant. Its ordinary self-burn, burn recovery and opposing chip remain separate.",
			],
			"auroracurrent": [
				"Entry on Holy, Crystal Cavern, Dark Crystal Cavern, New World, Starlight Arena, Cave, Volcanic or Desert grants +1 Defense and Sp. Def. Its weather-setting call uses Hail, despite older prose calling it Snow. Effective Hail or Snow enables its ordinary never-miss Electric attacks and weather-based defenses; the field bonus itself does not require weather.",
			],
			"relentlesshunt": [
				"Damaging attacks receive 2× power on Rocky, Fairy Tale, Big Top, Dragon’s Den, Mountain and Snowy Mountain; 1.5× on Desert, Forest, Burning, Superheated, Ashen Beach, Water Surface, Cave, Starlight Arena and New World. Cold Eclipse’s shared handler supplies its 2× damage and raises the priority-eligible base-power threshold from 60 to 80; the ability’s own Cold Eclipse return avoids doubling those modifiers.",
			],
			"stalwart": [
				"On entry, gains +1 Special Attack on Chessboard, Fairy Tale, New World and Starlight Arena. Moves still ignore redirection; the shared Cave collapse handler also recognizes Stalwart as protection from that collapse.",
			],
			"defragment": [
				"On Cold Eclipse and Fairy Tale entry, raises both Defense and Special Defense by one stage. On Factory, Short-Circuit, Glitch, New World and Starlight Arena, compares all living foes’ combined Attack and Special Attack and raises the corresponding defense by two stages (Defense wins a tie), instead of the ordinary one-stage increase. Its attacks still cannot miss.",
			],
			"eternalflower": [
				"Fairy Tale and Cold Eclipse multiply both offensive stats by 2; New World, Starlight Arena and Bewitched Woods use 1.5× instead. Its separate 1.5× offensive-stat bonus for Grass attacks stacks with this. On fainting, it attempts to establish Bewitched Woods for five turns; a blocked field change does not set that duration.",
			],
			"ancientbloom": [
				"On Fairy Tale, New World, Cold Eclipse or Starlight Arena entry, gains +1 Defense and Special Defense. New World, Cold Eclipse and Starlight Arena also multiply its move power by 1.5. Its Pollen Bloom, Self-Sufficient and Friend Guard components continue independently.",
			],
			"armorize": [
				"Eligible Normal moves become Steel. The conversion bonus is 1.5× on Factory, Short-Circuit, Fairy Tale, Dragon’s Den, Starlight Arena, New World and Holy, instead of 1.2×. Cold Eclipse grants hail immunity but does not increase that conversion bonus. Variable-type moves retain their normal conversion exclusions.",
			],
			"argentdevotion": [
				"Its Armorize conversion gives 1.5× power on Factory, Short-Circuit, Fairy Tale, Dragon’s Den, Starlight Arena, New World and Holy, instead of 1.2×. Cold Eclipse grants hail immunity. On Fairy Tale entry, Sworn Duty heals each adjacent living ally by 1/3 base max HP instead of 1/4. Its other components remain active.",
			],
			"wrathshield": [
				"On Cold Eclipse, Fairy Tale, New World and Starlight Arena entry, gains +1 Special Defense. This field bonus does not raise Defense; Stamina can still grant Defense from qualifying opposing hits.",
			],
			"marvelscale": [
				"Defense is 1.5× on Dragon’s Den, Fairy Tale, Rainbow, Starlight Arena and Misty without requiring a status condition. Having both a status and one of these fields does not stack the bonus.",
			],
			"solaridol": [
				"New World and Starlight Arena entry grant +1 Defense. Its ordinary Fire-power and effective-sun Attack effects remain separate.",
			],
			"lunaridol": [
				"New World and Starlight Arena entry grant +1 Special Defense. Its ordinary Ice-power, hail immunity and effective hail/snow Special Attack effects remain separate.",
			],
			"victorystar": [
				"New World and Starlight Arena multiply damage handled by its opposing-Pokémon damage callback by 1.5. That callback prints the literal message “Happened” when it runs, including outside those fields; the message is debugging-like flavor, not an extra effect. Its ordinary ally accuracy boost remains.",
			],
			"battlefervor": [
				"Ashen Beach, New World, Starlight Arena and Cold Eclipse add flinch immunity and protection from externally lowered stat stages. Cold Eclipse entry also attempts -1 Speed against foes, blocked by Substitute. Bewitched Woods, Haunted and Holy disable these benefits along with its ordinary power, defensive, berry/seed and retaliation effects; Holy does not grant the listed defensive benefits.",
			],
			"ultraego": [
				"On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special HP hits after activation additionally grant +1 Defense and Special Defense respectively. A qualifying hit at half HP or less instead heals 1/4 base max HP once per activation; blocked healing does not spend that recovery. Bewitched Woods, Haunted and Holy disable its Ultra Ego effects, including its rivalry with Ultra Instinct.",
			],
			"perfectego": [
				"On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special HP hits after activation additionally grant +1 Defense and Special Defense respectively. A qualifying hit at half HP or less instead heals 1/4 base max HP once per activation; blocked healing does not spend that recovery. Bewitched Woods, Haunted and Holy disable its Ultra Ego effects, including its rivalry with Ultra Instinct. Its accuracy-bypassing moves continue even on those suppressing fields.",
			],
			"burningego": [
				"On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special HP hits after activation additionally grant +1 Defense and Special Defense respectively. A qualifying hit at half HP or less instead heals 1/4 base max HP once per activation; blocked healing does not spend that recovery. Bewitched Woods, Haunted and Holy disable its Ultra Ego effects, including its rivalry with Ultra Instinct. Its Flame Body and Magma Armor components give a combined +2 Defense and Special Defense on Cold Eclipse entry, disable contact burns there, and allow new frostbite. Volcanic gives a 60% contact burn chance and +1 Defense/Special Defense on entry; Dragon’s Den grants those entry defenses and Fire immunity.",
			],
			"ultrainstinct": [
				"Ashen Beach, New World, Starlight Arena and Cold Eclipse increase its first opposing HP-damaging move reduction each turn from 30% to 35%, covering that move’s multiple hits, and increase its once-per-turn healing after its own completed damaging attack from 1/16 to 1/8 base max HP. Ultra Ego rivalry instead uses 40% reduction. Bewitched Woods, Haunted and Holy disable these effects. Substitute-only damage does not spend its guard.",
			],
			"duskilate": [
				"Eligible Normal moves become Fairy on Holy and Rainbow, otherwise Dark. Their conversion bonus is 1.5× on Dark Crystal Cavern, New World, Starlight Arena, Cold Eclipse, Short-Circuit, Haunted, Bewitched Woods, Holy and Rainbow, instead of 1.3×. Cold Eclipse additionally grants hail immunity. Cold Eclipse also recognizes Duskilate for its 1.5× defenses and exemption from the grounded Speed penalty.",
			],
			"execution": [
				"Eligible Normal moves become Fairy on Holy and Rainbow, otherwise Dark. Their conversion bonus is 1.5× on Dark Crystal Cavern, New World, Starlight Arena, Cold Eclipse, Short-Circuit, Haunted, Bewitched Woods, Holy and Rainbow, instead of 1.3×. Cold Eclipse additionally grants hail immunity. While any base field exists, its current stat-change handler blocks Speed drops, including self-caused drops; its Attack/Special Attack floor and KO healing remain separate.",
			],
			"imperialmandate": [
				"On Fairy Tale, Chessboard, New World, Starlight Arena and Cold Eclipse, half HP or more grants one tracked Defense and Special Defense stage instead of its ordinary 2× attack power. Below half HP, those granted stages are removed and it receives 1.5× attack power plus double Speed. Leaving the favored fields removes the tracked defenses. “fortifies its defenses” announces the high-HP field mode; “quickens its command” announces low-HP mode; “empowers its attacks” announces ordinary high-HP mode.",
			],
			"burningcrown": [
				"New World, Cold Eclipse and Starlight Arena grant 1.5× move power. Its Unbound Blaze component additionally gives +1 Defense/Special Defense on Cold Eclipse, Volcanic or Dragon’s Den entry; Dragon’s Den blocks Fire attacks, and Dragon’s Den/Fairy Tale improve the Normal-to-Dragon conversion bonus to 1.5×. Cold Eclipse allows new frostbite through the Magma Armor component.",
			],
			"royaldecree": [
				"On entry, resets stat stages and screens unless Neutralization blocks the effect; Safeguard protects its side from that reset. Fairy Tale, Chess Board, New World and Starlight Arena additionally raise Defense or Special Defense according to opposing offensive stats: two stages in singles, one otherwise. Chess Board also multiplies both defenses by 1.5 while Neutralization is absent. The reset preserves field-supported positive defenses for Relic Armor/Defeatist on Desert, Fairy Tale, Cave, Crystal Cavern, New World and Volcanic Summit; Magician Special Attack on Fairy Tale, Bewitched Woods, Haunted, Misty and New World; Stalwart Special Attack on New World, Starlight, Fairy Tale and Chess Board. Mirror Arena’s existing Mirror Armor/Iron Dominion evasion boosts survive the reset, but their new evasion boosts are not allowed by the current ongoing exception. The prevention message appears when a stat change is actually blocked.",
			],
			"fortressshell": [
				"Its Stalwart component raises Special Attack on entry in New World, Starlight Arena, Fairy Tale and Chess Board. Shell Armor adds entry Defense on Fairy Tale or Dragon Den. Its own field-entry effect raises Defense and Special Defense on Fairy Tale, New World, Cold Eclipse or Starlight, tracking changes between fields. New World, Cold Eclipse and Starlight give 1.5x power. Guardian Presence gives allied attacks 1.5x power on Haunted, Bewitched Woods, Holy or Psychic Field (1.3x otherwise), and reduces allied incoming damage by 25%. Electric Aura, Electric Field, Murkwater, Water Surface, Underwater, Midnight Zone, Factory or Short-Circuit activate its Electric redirection/absorption and Attack/Special Attack increases.",
			],
			"mirrorarmor": [
				"Fairy Tale grants one Defense and Special Defense stage on entry; Mirror Arena grants one evasion stage. Royal Decree preserves existing matching field boosts during its entry reset. Starlight Arena supplies its priority-protection callback. Ordinary reflected stat drops still follow Mirror Armor’s targeting and reflection rules.",
			],
			"irondominion": [
				"Fairy Tale increases its adjacent-ally entry healing from one quarter to one third maximum HP; the shared-mead message accompanies each attempted ally heal. This healing is skipped when Sworn Duty is already the species passive. Fairy Tale also grants one Defense and Special Defense stage once per ability activation; Mirror Arena grants one evasion stage. Cold Eclipse changes its Pressure drops to two stages in both defenses, retaining the per-target attempt memory and Substitute check. Starlight Arena blocks opposing positive-priority moves aimed at its protected side, with the callback’s field-wide targeting exclusions.",
			],
		},
		"moves": {
			"cosmicpower": [
				"On Holy, New World, Rainbow, Starlight Arena, Misty and Psychic fields, raises Defense and Special Defense by two stages each.",
			],
			"takeheart": [
				"On New World, Starlight Arena, Psychic Field, Water Surface and Underwater, raises Special Attack and Special Defense by two stages. Its major-status cure remains.",
			],
			"moonlight": [
				"Cold Eclipse restores three quarters maximum HP regardless of weather. Dark Crystal Cavern, New World, Starlight Arena and Bewitched Woods restore three quarters except in sun (approximately two thirds) or snow (one quarter). Adaptive Cycle can neutralize the adverse snow reduction. Healing restrictions still apply.",
			],
			"auroraveil": [
				"Can be used without hail or snow on Rainbow, Icy, Mirror Arena, Dark Crystal Cavern, Crystal Cavern, Snowy Mountain, Starlight Arena and Cold Eclipse. Mirror Arena extends ordinary Aurora Veil to eight turns and its after-use callback grants one evasion stage if a successful move has been recorded that turn. Royal Decree can still prevent the screen. G-Max-generated veil keeps its separate four-turn duration.",
			],
			"snowscape": [
				"Fails on Burning, Superheated and Volcanic fields with the message that intense heat prevents snow settling. Fairy Tale instead prints that the tale rejected the changing season; Starlight Arena prints that starlight refused to be eclipsed. Elsewhere its successful use creates Frozen Aura for five turns, or eight with Amplifield Rock; harsh sun can also prevent the move.",
			],
			"solarblade": [
				"Dark Crystal Cavern prevents use unless ordinary Sunny Day is active or Adaptive Cycle shields the user from fields. This check specifically tests ordinary sun, so harsh sun alone does not bypass it. Starlight changes the move to Fairy. Rainbow removes charging independently of weather.",
			],
			"healingwish": [
				"When its slot condition processes an incoming Pokémon on Fairy Tale or Starlight Arena, also raises Attack and Special Attack by one. This boost sits outside the healing-success check; a healthy, status-free entrant can receive it while the unused wish remains.",
			],
			"wish": [
				"If created on Misty, Rainbow, Fairy Tale, Holy or Starlight, stores healing equal to three quarters of the original user’s maximum HP instead of half. The amount is decided when Wish is set, not when it resolves. The Wish healing message appears only when healing succeeds.",
			],
			"lightthatburnsthesky": [
				"On Holy and Starlight Arena, gains 1.3x power unless Adaptive Cycle shields the target from fields. After use, prints “The light was consumed!” and clears that field; the clearing callback is not conditioned on hit success.",
			],
			"lunardance": [
				"On New World, its slot callback additionally boosts Attack, Defense, Special Attack, Special Defense and Speed by one; on Starlight, boosts Attack and Special Attack by one. These boosts occur before the actual healing/PP-restoration check, so an otherwise healthy entrant can receive them.",
			],
			"lunarblessing": [
				"On Starlight, restores 33% maximum HP instead of 25%, while retaining its major-status cure.",
			],
		},
	},
	"superheatedterrain": {
		"abilities": {
			"sinisterblaze": [
				"Fairy Tale, Starlight Arena, New World, Burning, Volcanic, Superheated and Cold Eclipse grant +1 Defense and Sp. Def on entry. Snowy Mountain, Icy and Cold Eclipse add Ice typing while this is the active ability, except for Abysseon and Divineon; this is not a blanket passive typing grant. Its ordinary self-burn, burn recovery and opposing chip remain separate.",
			],
			"steamengine": [
				"Burning, Superheated and Volcanic grant +6 Speed on entry. Water Surface, Underwater and Volcanic grant +1 Speed each turn. The residual handler’s Murkwater message check is inside an outer condition that excludes Murkwater, so Murkwater alone does not grant that residual boost. Midnight Zone entry changes the holder to Water when allowed. Full Magma Armor is also delegated, including its entry defenses, weather/status rules and Dragon’s Den Fire immunity.",
			],
			"thermalexchange": [
				"Burning, Superheated, Dragon’s Den and Volcanic grant +1 Attack each turn, in addition to its ordinary Fire-hit Attack boost and burn prevention/cure. No Fire hit is required for the field boost.",
			],
			"wellbakedbody": [
				"Burning, Superheated, Dragon’s Den and Volcanic grant +1 Defense each turn. The ordinary Fire-move absorption still grants +2 Defense separately when hit.",
			],
			"relentlesshunt": [
				"Damaging attacks receive 2× power on Rocky, Fairy Tale, Big Top, Dragon’s Den, Mountain and Snowy Mountain; 1.5× on Desert, Forest, Burning, Superheated, Ashen Beach, Water Surface, Cave, Starlight Arena and New World. Cold Eclipse’s shared handler supplies its 2× damage and raises the priority-eligible base-power threshold from 60 to 80; the ability’s own Cold Eclipse return avoids doubling those modifiers.",
			],
		},
		"moves": {
			"snowscape": [
				"Fails on Burning, Superheated and Volcanic fields with the message that intense heat prevents snow settling. Fairy Tale instead prints that the tale rejected the changing season; Starlight Arena prints that starlight refused to be eclipsed. Elsewhere its successful use creates Frozen Aura for five turns, or eight with Amplifield Rock; harsh sun can also prevent the move.",
			],
			"outrage": [
				"On Superheated, removes the rampage-lock volatile after each use rather than waiting for its final locked turn. The volatile’s ordinary end behavior, including any applicable confusion, still applies.",
			],
			"petaldance": [
				"On Superheated, removes the rampage-lock volatile after each use rather than waiting for its final locked turn. The volatile’s ordinary end behavior, including any applicable confusion, still applies.",
			],
			"thrash": [
				"On Superheated, removes the rampage-lock volatile after each use rather than waiting for its final locked turn. The volatile’s ordinary end behavior, including any applicable confusion, still applies.",
			],
		},
	},
	"caveterrain": {
		"abilities": {
			"auroracurrent": [
				"Entry on Holy, Crystal Cavern, Dark Crystal Cavern, New World, Starlight Arena, Cave, Volcanic or Desert grants +1 Defense and Sp. Def. Its weather-setting call uses Hail, despite older prose calling it Snow. Effective Hail or Snow enables its ordinary never-miss Electric attacks and weather-based defenses; the field bonus itself does not require weather.",
			],
			"eartheater": [
				"At each turn end on Cave or Desert, attempts to heal 1/16 base max HP and prints that the holder swallowed the rocks. Healing prevention or full HP can prevent recovery. Ground-move absorption remains its ordinary separate 1/4-HP effect.",
			],
			"echofiend": [
				"Eligible sound attacks become Fire on Volcanic, Crystal on Crystal Cavern, and Flying otherwise. Sound attacks receive 2× power on Cave, Volcanic and Crystal Cavern; Mountain and Snowy Mountain use its ordinary 1.5× bonus. Type-changing exclusions still apply to special variable-type moves, damaging Z moves and a Terastallized Tera Blast. The sound immunity and allied sound protection remain.",
			],
			"powerdrill": [
				"Drill and horn moves receive 2× power and bypass Protect-style protection on Rocky, Mountain, Snowy Mountain, Cave and Volcanic, instead of the usual 1.5×. Cold Eclipse is not one of these five enhanced fields; its shared move-flag rules are documented separately. Dual Wield/Sharpness overlap uses the existing combined multiplier path, not an extra duplicate Power Drill bonus.",
			],
			"hyperdrill": [
				"Delegates the full Power Drill field package: drill/horn moves receive 2× power and bypass protection on Rocky, Mountain, Snowy Mountain, Cave and Volcanic. Its separate positive-defense-stage bypass remains. Native Power Drill is not applied twice.",
			],
			"relentlesshunt": [
				"Damaging attacks receive 2× power on Rocky, Fairy Tale, Big Top, Dragon’s Den, Mountain and Snowy Mountain; 1.5× on Desert, Forest, Burning, Superheated, Ashen Beach, Water Surface, Cave, Starlight Arena and New World. Cold Eclipse’s shared handler supplies its 2× damage and raises the priority-eligible base-power threshold from 60 to 80; the ability’s own Cold Eclipse return avoids doubling those modifiers.",
			],
			"punkrock": [
				"Sound moves have 1.5× power here instead of the usual 1.3×; incoming sound-move damage remains halved.",
			],
			"relicarmor": [
				"Desert, Fairy Tale, Cave, Crystal Cavern, New World and Volcanic entry grant +1 Defense and Special Defense. Its Rock-typing weakness protection applies on Rocky, Fairy Tale, Water Surface, Underwater, Murkwater, Midnight Zone, Starlight Arena, New World, Holy, Mountain, Cave, Volcanic, Dragon’s Den, Crystal Cavern and Dark Crystal Cavern. Desert, Icy, Snowy Mountain and Cold Eclipse do not grant that protection by themselves. Aevian Lapras additionally gains Ice typing on Icy/Snowy Mountain/Cold Eclipse or in hail/snow. The visible Rock-protection message announces actual protection and is withheld during Illusion.",
			],
			"royaldecree": [
				"On entry, resets stat stages and screens unless Neutralization blocks the effect; Safeguard protects its side from that reset. Fairy Tale, Chess Board, New World and Starlight Arena additionally raise Defense or Special Defense according to opposing offensive stats: two stages in singles, one otherwise. Chess Board also multiplies both defenses by 1.5 while Neutralization is absent. The reset preserves field-supported positive defenses for Relic Armor/Defeatist on Desert, Fairy Tale, Cave, Crystal Cavern, New World and Volcanic Summit; Magician Special Attack on Fairy Tale, Bewitched Woods, Haunted, Misty and New World; Stalwart Special Attack on New World, Starlight, Fairy Tale and Chess Board. Mirror Arena’s existing Mirror Armor/Iron Dominion evasion boosts survive the reset, but their new evasion boosts are not allowed by the current ongoing exception. The prevention message appears when a stat change is actually blocked.",
			],
		},
		"moves": {
			"bounce": [
				"On Cave or Dragon Den, attacks immediately without spending a charge turn; the preparation/animation messages still play. Tailwind or Strong Winds independently remove charging and add a critical-rate stage.",
			],
			"fly": [
				"On Cave or Dragon Den, attacks immediately without spending a charge turn; the preparation/animation messages still play. Tailwind or Strong Winds independently remove charging and add a critical-rate stage.",
			],
			"skydrop": [
				"Cave prevents the pickup. Dragon Den prevents the move in its pre-use callback unless Adaptive Cycle shields the attacker from that field effect. The separate Yearning Star version retains its Cave, weight, ally, Substitute and Flying-target restrictions.",
			],
			"rockclimb": [
				"On Mountain, Rocky Field, Cave or Desert, gains one critical-rate stage. Its independent Attack/Speed boost against an already confused target remains.",
			],
		},
	},
	"crystalcavernterrain": {
		"abilities": {
			"auroracurrent": [
				"Entry on Holy, Crystal Cavern, Dark Crystal Cavern, New World, Starlight Arena, Cave, Volcanic or Desert grants +1 Defense and Sp. Def. Its weather-setting call uses Hail, despite older prose calling it Snow. Effective Hail or Snow enables its ordinary never-miss Electric attacks and weather-based defenses; the field bonus itself does not require weather.",
			],
			"echofiend": [
				"Eligible sound attacks become Fire on Volcanic, Crystal on Crystal Cavern, and Flying otherwise. Sound attacks receive 2× power on Cave, Volcanic and Crystal Cavern; Mountain and Snowy Mountain use its ordinary 1.5× bonus. Type-changing exclusions still apply to special variable-type moves, damaging Z moves and a Terastallized Tera Blast. The sound immunity and allied sound protection remain.",
			],
			"mimicry": [
				"On Crystal Cavern, changes to the current crystal cycle’s Fire, Water, Grass or Psychic type. On New World, randomly selects one of the eighteen ordinary types. A current aura with a Mimicry type overrides that field choice. Terastallized Pokémon do not change type.",
			],
			"prismarmor": [
				"On Crystal Cavern and Dark Crystal Cavern, all incoming attacks receive its additional 25% reduction on top of the ordinary 20% reduction, for 40% total; super effectiveness does not add another copy. Dark Crystal Cavern and Rainbow also multiply Defense and Special Defense by about 4/3. Cold Eclipse grants the same defense multipliers and hail immunity.",
			],
			"relicarmor": [
				"Desert, Fairy Tale, Cave, Crystal Cavern, New World and Volcanic entry grant +1 Defense and Special Defense. Its Rock-typing weakness protection applies on Rocky, Fairy Tale, Water Surface, Underwater, Murkwater, Midnight Zone, Starlight Arena, New World, Holy, Mountain, Cave, Volcanic, Dragon’s Den, Crystal Cavern and Dark Crystal Cavern. Desert, Icy, Snowy Mountain and Cold Eclipse do not grant that protection by themselves. Aevian Lapras additionally gains Ice typing on Icy/Snowy Mountain/Cold Eclipse or in hail/snow. The visible Rock-protection message announces actual protection and is withheld during Illusion.",
			],
			"royaldecree": [
				"On entry, resets stat stages and screens unless Neutralization blocks the effect; Safeguard protects its side from that reset. Fairy Tale, Chess Board, New World and Starlight Arena additionally raise Defense or Special Defense according to opposing offensive stats: two stages in singles, one otherwise. Chess Board also multiplies both defenses by 1.5 while Neutralization is absent. The reset preserves field-supported positive defenses for Relic Armor/Defeatist on Desert, Fairy Tale, Cave, Crystal Cavern, New World and Volcanic Summit; Magician Special Attack on Fairy Tale, Bewitched Woods, Haunted, Misty and New World; Stalwart Special Attack on New World, Starlight, Fairy Tale and Chess Board. Mirror Arena’s existing Mirror Armor/Iron Dominion evasion boosts survive the reset, but their new evasion boosts are not allowed by the current ongoing exception. The prevention message appears when a stat change is actually blocked.",
			],
		},
		"moves": {
			"rockpolish": [
				"On Crystal Cavern, raises Speed by two and Attack and Special Attack by one. On Rocky Field, raises Speed by three.",
			],
			"auroraveil": [
				"Can be used without hail or snow on Rainbow, Icy, Mirror Arena, Dark Crystal Cavern, Crystal Cavern, Snowy Mountain, Starlight Arena and Cold Eclipse. Mirror Arena extends ordinary Aurora Veil to eight turns and its after-use callback grants one evasion stage if a successful move has been recorded that turn. Royal Decree can still prevent the screen. G-Max-generated veil keeps its separate four-turn duration.",
			],
			"meteorbeam": [
				"Crystal Cavern, New World and Starlight Arena remove the charge turn while retaining the Special Attack increase. Starlight additionally adds Dark subtyping. The prepare/animation messages accompany this immediate attack; its independent post-move healing remains.",
			],
			"camouflage": [
				"On Crystal Cavern, selects the current crystal type from Fire, Water, Grass and Psychic without advancing the crystal counter. On New World, randomly chooses one of the 18 ordinary types. An active aura overrides either choice with its own Mimicry type. Normal type-change restrictions remain.",
			],
			"naturepower": [
				"Calls Power Gem on Crystal Cavern and Spacial Rend on New World. Frozen Aura overrides the field choice with its registered Nature Power move. The called move keeps its own targeting and field interactions.",
			],
			"terrainpulse": [
				"On Crystal Cavern, becomes the current crystal type (Fire, Water, Grass or Psychic) without advancing the counter. On New World, randomly becomes one of the 18 ordinary types. An active aura overrides this type selection. Neither field alone activates Terrain Pulse’s separate doubled-power condition.",
			],
		},
	},
	"darkcrystalcavernterrain": {
		"abilities": {
			"auroracurrent": [
				"Entry on Holy, Crystal Cavern, Dark Crystal Cavern, New World, Starlight Arena, Cave, Volcanic or Desert grants +1 Defense and Sp. Def. Its weather-setting call uses Hail, despite older prose calling it Snow. Effective Hail or Snow enables its ordinary never-miss Electric attacks and weather-based defenses; the field bonus itself does not require weather.",
			],
			"prismarmor": [
				"On Crystal Cavern and Dark Crystal Cavern, all incoming attacks receive its additional 25% reduction on top of the ordinary 20% reduction, for 40% total; super effectiveness does not add another copy. Dark Crystal Cavern and Rainbow also multiply Defense and Special Defense by about 4/3. Cold Eclipse grants the same defense multipliers and hail immunity.",
			],
			"duskilate": [
				"Eligible Normal moves become Fairy on Holy and Rainbow, otherwise Dark. Their conversion bonus is 1.5× on Dark Crystal Cavern, New World, Starlight Arena, Cold Eclipse, Short-Circuit, Haunted, Bewitched Woods, Holy and Rainbow, instead of 1.3×. Cold Eclipse additionally grants hail immunity. Cold Eclipse also recognizes Duskilate for its 1.5× defenses and exemption from the grounded Speed penalty.",
			],
			"execution": [
				"Eligible Normal moves become Fairy on Holy and Rainbow, otherwise Dark. Their conversion bonus is 1.5× on Dark Crystal Cavern, New World, Starlight Arena, Cold Eclipse, Short-Circuit, Haunted, Bewitched Woods, Holy and Rainbow, instead of 1.3×. Cold Eclipse additionally grants hail immunity. While any base field exists, its current stat-change handler blocks Speed drops, including self-caused drops; its Attack/Special Attack floor and KO healing remain separate.",
			],
		},
		"moves": {
			"moonlight": [
				"Cold Eclipse restores three quarters maximum HP regardless of weather. Dark Crystal Cavern, New World, Starlight Arena and Bewitched Woods restore three quarters except in sun (approximately two thirds) or snow (one quarter). Adaptive Cycle can neutralize the adverse snow reduction. Healing restrictions still apply.",
			],
			"morningsun": [
				"Cold Eclipse and Dark Crystal Cavern force healing to one quarter maximum HP, unless the user is protected from field effects by Adaptive Cycle. Weather-based healing rules otherwise apply.",
			],
			"synthesis": [
				"Cold Eclipse and Dark Crystal Cavern force healing to one quarter maximum HP, unless the user is protected from field effects by Adaptive Cycle. Weather-based healing rules otherwise apply.",
			],
			"auroraveil": [
				"Can be used without hail or snow on Rainbow, Icy, Mirror Arena, Dark Crystal Cavern, Crystal Cavern, Snowy Mountain, Starlight Arena and Cold Eclipse. Mirror Arena extends ordinary Aurora Veil to eight turns and its after-use callback grants one evasion stage if a successful move has been recorded that turn. Royal Decree can still prevent the screen. G-Max-generated veil keeps its separate four-turn duration.",
			],
			"darkvoid": [
				"Dark Crystal Cavern, New World and Cold Eclipse set base accuracy to 100% when a target is available to its modifier. Other hit and sleep restrictions remain.",
			],
			"solarbeam": [
				"Dark Crystal Cavern prevents use unless ordinary Sunny Day is active or Adaptive Cycle shields the user from fields. This check specifically tests ordinary sun, so harsh sun alone does not bypass it. Starlight changes the move to Fairy. Rainbow removes charging independently of weather.",
			],
			"solarblade": [
				"Dark Crystal Cavern prevents use unless ordinary Sunny Day is active or Adaptive Cycle shields the user from fields. This check specifically tests ordinary sun, so harsh sun alone does not bypass it. Starlight changes the move to Fairy. Rainbow removes charging independently of weather.",
			],
		},
	},
	"holyterrain": {
		"abilities": {
			"auroracurrent": [
				"Entry on Holy, Crystal Cavern, Dark Crystal Cavern, New World, Starlight Arena, Cave, Volcanic or Desert grants +1 Defense and Sp. Def. Its weather-setting call uses Hail, despite older prose calling it Snow. Effective Hail or Snow enables its ordinary never-miss Electric attacks and weather-based defenses; the field bonus itself does not require weather.",
			],
			"armorize": [
				"Eligible Normal moves become Steel. The conversion bonus is 1.5× on Factory, Short-Circuit, Fairy Tale, Dragon’s Den, Starlight Arena, New World and Holy, instead of 1.2×. Cold Eclipse grants hail immunity but does not increase that conversion bonus. Variable-type moves retain their normal conversion exclusions.",
			],
			"argentdevotion": [
				"Its Armorize conversion gives 1.5× power on Factory, Short-Circuit, Fairy Tale, Dragon’s Den, Starlight Arena, New World and Holy, instead of 1.2×. Cold Eclipse grants hail immunity. On Fairy Tale entry, Sworn Duty heals each adjacent living ally by 1/3 base max HP instead of 1/4. Its other components remain active.",
			],
			"ascendance": [
				"On Holy entry, gains +1 Attack and Special Attack and prints “Holy light empowered [Pokémon]’s Ascendance, raising its offenses!”. This is separate from its form transformation and ordinary damage/STAB effects.",
			],
			"cursedbody": [
				"Holy disables its damage-triggered Disable effect. Haunted guarantees the ordinary 30% trigger, excluding Max moves, delayed attacks, Struggle and an already Disabled attacker. Its fainting curse against living foes is a separate callback and is not blocked by Holy in this handler.",
			],
			"holycow": [
				"On its first entry in the battle, attempts to create Holy for five turns. The attempt is spent even if blocked, and it cannot refresh an already active Holy field. Its per-entry Milk Drink cure remains separate.",
			],
			"justified": [
				"Taking damage from a Dark move on Holy grants +2 Attack instead of +1.",
			],
			"perishbody": [
				"Holy completely prevents its opposing-hit Perish Song trigger. On Haunted, affected foes are trapped while adjacent to the holder. Existing countdown shortening still excludes Cursola and its forms; allied hits do not trigger it.",
			],
			"slowstart": [
				"Holy removes its temporary Attack and Speed penalties and supplies 1.5× Defense instead of the temporary 2× defense outside Holy. Holy entry prints “Divine energy courses through [Pokémon]”. Electric Field removes one additional turn from the three-turn Slow Start countdown each turn.",
			],
			"battlefervor": [
				"Ashen Beach, New World, Starlight Arena and Cold Eclipse add flinch immunity and protection from externally lowered stat stages. Cold Eclipse entry also attempts -1 Speed against foes, blocked by Substitute. Bewitched Woods, Haunted and Holy disable these benefits along with its ordinary power, defensive, berry/seed and retaliation effects; Holy does not grant the listed defensive benefits.",
			],
			"ultraego": [
				"On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special HP hits after activation additionally grant +1 Defense and Special Defense respectively. A qualifying hit at half HP or less instead heals 1/4 base max HP once per activation; blocked healing does not spend that recovery. Bewitched Woods, Haunted and Holy disable its Ultra Ego effects, including its rivalry with Ultra Instinct.",
			],
			"perfectego": [
				"On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special HP hits after activation additionally grant +1 Defense and Special Defense respectively. A qualifying hit at half HP or less instead heals 1/4 base max HP once per activation; blocked healing does not spend that recovery. Bewitched Woods, Haunted and Holy disable its Ultra Ego effects, including its rivalry with Ultra Instinct. Its accuracy-bypassing moves continue even on those suppressing fields.",
			],
			"burningego": [
				"On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special HP hits after activation additionally grant +1 Defense and Special Defense respectively. A qualifying hit at half HP or less instead heals 1/4 base max HP once per activation; blocked healing does not spend that recovery. Bewitched Woods, Haunted and Holy disable its Ultra Ego effects, including its rivalry with Ultra Instinct. Its Flame Body and Magma Armor components give a combined +2 Defense and Special Defense on Cold Eclipse entry, disable contact burns there, and allow new frostbite. Volcanic gives a 60% contact burn chance and +1 Defense/Special Defense on entry; Dragon’s Den grants those entry defenses and Fire immunity.",
			],
			"ultrainstinct": [
				"Ashen Beach, New World, Starlight Arena and Cold Eclipse increase its first opposing HP-damaging move reduction each turn from 30% to 35%, covering that move’s multiple hits, and increase its once-per-turn healing after its own completed damaging attack from 1/16 to 1/8 base max HP. Ultra Ego rivalry instead uses 40% reduction. Bewitched Woods, Haunted and Holy disable these effects. Substitute-only damage does not spend its guard.",
			],
			"duskilate": [
				"Eligible Normal moves become Fairy on Holy and Rainbow, otherwise Dark. Their conversion bonus is 1.5× on Dark Crystal Cavern, New World, Starlight Arena, Cold Eclipse, Short-Circuit, Haunted, Bewitched Woods, Holy and Rainbow, instead of 1.3×. Cold Eclipse additionally grants hail immunity. Cold Eclipse also recognizes Duskilate for its 1.5× defenses and exemption from the grounded Speed penalty.",
			],
			"execution": [
				"Eligible Normal moves become Fairy on Holy and Rainbow, otherwise Dark. Their conversion bonus is 1.5× on Dark Crystal Cavern, New World, Starlight Arena, Cold Eclipse, Short-Circuit, Haunted, Bewitched Woods, Holy and Rainbow, instead of 1.3×. Cold Eclipse additionally grants hail immunity. While any base field exists, its current stat-change handler blocks Speed drops, including self-caused drops; its Attack/Special Attack floor and KO healing remain separate.",
			],
		},
		"moves": {
			"cosmicpower": [
				"On Holy, New World, Rainbow, Starlight Arena, Misty and Psychic fields, raises Defense and Special Defense by two stages each.",
			],
			"lifedew": [
				"Holy and Rainbow increase healing to half maximum HP. Water Surface, Underwater and Midnight Zone instead add Aqua Ring and heal one quarter; adding the ring can succeed at full HP. Corrosive Mist and Murkwater add a guaranteed poison secondary, subject to status rules.",
			],
			"miracleeye": [
				"On Psychic Field, Fairy Tale and Holy Field, a successful hit additionally raises the user’s Special Attack by two. Its existing Ghost-resistance volatile, Dark-target Psychic immunity bypass and positive-evasion bypass remain.",
			],
			"wish": [
				"If created on Misty, Rainbow, Fairy Tale, Holy or Starlight, stores healing equal to three quarters of the original user’s maximum HP instead of half. The amount is decided when Wish is set, not when it resolves. The Wish healing message appears only when healing succeeds.",
			],
			"lightthatburnsthesky": [
				"On Holy and Starlight Arena, gains 1.3x power unless Adaptive Cycle shields the target from fields. After use, prints “The light was consumed!” and clears that field; the clearing callback is not conditioned on hit success.",
			],
			"naturesmadness": [
				"Deals three quarters of the target’s current undynamaxed HP on Grassy Field, Forest and New World, or two thirds on Holy, instead of half. Minimum one damage.",
			],
			"spiritbreak": [
				"On Holy and Haunted, its effectiveness against each Ghost typing becomes super effective. Other target typings still contribute normally.",
			],
		},
	},
	"mountainterrain": {
		"abilities": {
			"echofiend": [
				"Eligible sound attacks become Fire on Volcanic, Crystal on Crystal Cavern, and Flying otherwise. Sound attacks receive 2× power on Cave, Volcanic and Crystal Cavern; Mountain and Snowy Mountain use its ordinary 1.5× bonus. Type-changing exclusions still apply to special variable-type moves, damaging Z moves and a Terastallized Tera Blast. The sound immunity and allied sound protection remain.",
			],
			"powerdrill": [
				"Drill and horn moves receive 2× power and bypass Protect-style protection on Rocky, Mountain, Snowy Mountain, Cave and Volcanic, instead of the usual 1.5×. Cold Eclipse is not one of these five enhanced fields; its shared move-flag rules are documented separately. Dual Wield/Sharpness overlap uses the existing combined multiplier path, not an extra duplicate Power Drill bonus.",
			],
			"hyperdrill": [
				"Delegates the full Power Drill field package: drill/horn moves receive 2× power and bypass protection on Rocky, Mountain, Snowy Mountain, Cave and Volcanic. Its separate positive-defense-stage bypass remains. Native Power Drill is not applied twice.",
			],
			"relentlesshunt": [
				"Damaging attacks receive 2× power on Rocky, Fairy Tale, Big Top, Dragon’s Den, Mountain and Snowy Mountain; 1.5× on Desert, Forest, Burning, Superheated, Ashen Beach, Water Surface, Cave, Starlight Arena and New World. Cold Eclipse’s shared handler supplies its 2× damage and raises the priority-eligible base-power threshold from 60 to 80; the ability’s own Cold Eclipse return avoids doubling those modifiers.",
			],
			"windysurge": [
				"On Mountain, Snowy Mountain or Cold Eclipse entry, also attempts to summon strong winds, unless Desolate Land or Primordial Sea is active. Its two-turn Tailwind still applies. Refreshing an existing Tailwind attempts +1 Special Attack for Wind Power/Hisuian Vanguard allies and +1 Attack for Wind Rider/Unova Vanguard/Scarecrow allies.",
			],
			"galewings": [
				"During unsuppressed Strong Winds on any field, Gale Wings gives +1 priority to all moves at any HP. Otherwise, only Flying moves at 75% HP or higher receive the bonus.",
			],
			"aerilate": [
				"On Mountain and Snowy Mountain, eligible Normal moves converted to Flying gain 1.5× power instead of 1.2×. The ordinary variable-type, Z-Move and Terastallized Tera Blast exclusions remain.",
			],
			"windpower": [
				"During effective Strong Winds on any field, gains +1 Attack and +1 Special Attack at turn end. Its wind-move absorption and Tailwind activation are independent triggers.",
			],
			"windrider": [
				"During effective Strong Winds on any field, gains +1 Attack and +1 Special Attack at turn end. Its wind-move absorption and Tailwind activation are independent triggers.",
			],
			"predator": [
				"Against newly switched or still-pending-action targets, its ordinary conditional power multiplier becomes 2× on Mountain, Snowy Mountain and Rocky, or 1.5× on Fairy Tale, Dragon’s Den and Big Top. Its 2× authority/Ultra matchup bonuses replace this conditional bonus rather than stacking with it; Ultra matchups are disabled on Bewitched Woods, Haunted and Holy.",
			],
		},
		"moves": {
			"tailwind": [
				"After use on Mountain, Snowy Mountain or Cold Eclipse, attempts to start Strong Winds unless harsh sun or heavy rain is active. Mountain and Snowy Mountain extend Tailwind to six turns; the current implementation prints a Persistent activation message for this field extension even without that ability.",
			],
			"rockclimb": [
				"On Mountain, Rocky Field, Cave or Desert, gains one critical-rate stage. Its independent Attack/Speed boost against an already confused target remains.",
			],
			"wildboltstorm": [
				"On Mountain, Snowy Mountain or Electric Field, bypasses accuracy checks. Rain and heavy rain independently supply the same effect.",
			],
		},
	},
	"rockyterrain": {
		"abilities": {
			"hyperdrill": [
				"Delegates the full Power Drill field package: drill/horn moves receive 2× power and bypass protection on Rocky, Mountain, Snowy Mountain, Cave and Volcanic. Its separate positive-defense-stage bypass remains. Native Power Drill is not applied twice.",
			],
			"relentlesshunt": [
				"Damaging attacks receive 2× power on Rocky, Fairy Tale, Big Top, Dragon’s Den, Mountain and Snowy Mountain; 1.5× on Desert, Forest, Burning, Superheated, Ashen Beach, Water Surface, Cave, Starlight Arena and New World. Cold Eclipse’s shared handler supplies its 2× damage and raises the priority-eligible base-power threshold from 60 to 80; the ability’s own Cold Eclipse return avoids doubling those modifiers.",
			],
			"rockypayload": [
				"On Rocky Field, Rock attacks use 2× Attack or Special Attack instead of 1.5×. The ordinary Rock STAB grant remains separate.",
			],
			"predator": [
				"Against newly switched or still-pending-action targets, its ordinary conditional power multiplier becomes 2× on Mountain, Snowy Mountain and Rocky, or 1.5× on Fairy Tale, Dragon’s Den and Big Top. Its 2× authority/Ultra matchup bonuses replace this conditional bonus rather than stacking with it; Ultra matchups are disabled on Bewitched Woods, Haunted and Holy.",
			],
		},
		"moves": {
			"arenitewall": [
				"Can be used without sand on Desert, Rocky Field, Ashen Beach and Cold Eclipse. Desert, Rocky Field and Ashen Beach also extend it to eight turns; Cold Eclipse alone permits use but keeps five turns. Light Clay or Sand Sovereign separately extend it to eight. It halves super-effective attack damage, except critical hits and moves that bypass screens.",
			],
			"splinteredstormshards": [
				"Gains 1.3x power when the engine permits Rocky Field to be established. A successful hit or Substitute damage clears the active aura. Its shared Z-move field-setting rule attempts to establish Rocky Field.",
			],
		},
	},
	"bigtopterrain": {
		"abilities": {
			"relentlesshunt": [
				"Damaging attacks receive 2× power on Rocky, Fairy Tale, Big Top, Dragon’s Den, Mountain and Snowy Mountain; 1.5× on Desert, Forest, Burning, Superheated, Ashen Beach, Water Surface, Cave, Starlight Arena and New World. Cold Eclipse’s shared handler supplies its 2× damage and raises the priority-eligible base-power threshold from 60 to 80; the ability’s own Cold Eclipse return avoids doubling those modifiers.",
			],
			"dancer": [
				"On Big Top, after a copied Dancer/Performer action processes a stat change with no positive stages in that change, the handler attempts +1 Attack and Sp. Atk on its source. A copied stat change already containing a positive boost does not receive this bonus. Ordinary dance-copy targeting and restrictions remain.",
			],
			"predator": [
				"Against newly switched or still-pending-action targets, its ordinary conditional power multiplier becomes 2× on Mountain, Snowy Mountain and Rocky, or 1.5× on Fairy Tale, Dragon’s Den and Big Top. Its 2× authority/Ultra matchup bonuses replace this conditional bonus rather than stacking with it; Ultra matchups are disabled on Bewitched Woods, Haunted and Holy.",
			],
		},
		"moves": {
			"bellydrum": [
				"After its normal half-HP cost and Attack maximization succeed, Big Top also raises Defense and Special Defense by one stage.",
			],
			"clangoroussoul": [
				"On Big Top, costs half maximum HP and raises Attack, Defense, Special Attack, Special Defense and Speed by two stages each. Fails at half HP or below.",
			],
			"dragondance": [
				"Raises Attack and Speed by two stages each on Big Top and Dragon Den.",
			],
			"featherdance": [
				"On Big Top, lowers the target’s Attack by three stages.",
			],
			"quiverdance": [
				"On Big Top, raises Special Attack, Special Defense and Speed by two stages each.",
			],
			"sing": [
				"On Big Top, base accuracy becomes 100%; accuracy/evasion modifiers still apply.",
			],
			"spotlight": [
				"On Big Top, its target receives one Attack and Special Attack stage, and the move also supplies a guaranteed self boost of one Attack and Special Attack stage. Its ordinary single-active-slot failure rule remains.",
			],
			"swordsdance": [
				"On Big Top and Fairy Tale, raises Attack by three stages.",
			],
			"victorydance": [
				"On Big Top, raises Attack, Defense and Speed by two stages each.",
			],
			"encore": [
				"On Big Top, its duration starts at six turns instead of three. It still adds one turn if the target has already acted, and ends early if the encored move has no PP.",
			],
		},
	},
	"hauntedterrain": {
		"abilities": {
			"soulfire": [
				"Haunted and Cold Eclipse grant +1 Defense and Sp. Def on entry. Haunted, Burning, Volcanic and Bewitched Woods grant +1 Attack and Sp. Atk each turn. These are additional to ordinary Fire/Ghost redirection, absorption and attack rules.",
			],
			"soultag": [
				"Haunted entry reveals opposing items through Shadow Tag. Haunted and Cold Eclipse grant Soul Fire’s +1 Defense/Sp. Def; Cold Eclipse also grants Flame Body’s +1 Defense/Sp. Def instead of contact burning, for +2 each in total. Haunted, Burning, Volcanic and Bewitched Woods grant +1 Attack/Sp. Atk each turn. Volcanic raises contact-burn chance to 60%.",
			],
			"soulstrike": [
				"On fainting, creates Haunted for five turns while ignoring Neutralization’s field block. If Haunted already exists, its remaining duration is raised to at least five turns rather than shortened. Other applicable field locks still matter.",
			],
			"cursedkeepsake": [
				"On fainting, attempts to curse each living foe and creates Haunted for five turns, ignoring Neutralization’s field block. Existing Haunted duration is raised to at least five turns. Its normal damage-triggered curse, cursed-foe reduction and curse recovery remain.",
			],
			"curseddoll": [
				"On fainting, creates Haunted for five turns, or raises an existing Haunted duration to at least five. The field-setting call ignores Neutralization’s field block. It does not automatically curse attackers.",
			],
			"cursedmarionette": [
				"The first damaging hit leaving the holder at half HP or less attempts to establish Haunted for three turns, or raises its existing duration to at least three. On fainting, curses living foes and creates Haunted for five turns; if Haunted already exists, adds five turns to its remaining duration. These field calls ignore Neutralization’s field block.",
			],
			"requiem": [
				"On fainting, creates Haunted for five turns, or raises existing Haunted duration to at least five, ignoring Neutralization’s field block. Its Cursed Body Disable chance is guaranteed on Haunted, disabled on Holy, and 30% elsewhere, subject to the normal excluded-move and existing-Disable checks.",
			],
			"reapersgrip": [
				"The first damaging hit leaving it at half HP or less attempts to create Haunted for three turns or raises its current duration to at least three. On fainting, creates Haunted for five turns or adds five turns to an existing Haunted field. These calls ignore Neutralization’s field block.",
			],
			"nightmarepulse": [
				"Once per battle per holder, entry attempts to create or refresh Haunted for exactly three turns. A blocked attempt spends the allowance; Amplifield Rock does not extend it. Haunted makes its Cursed Body Disable chance guaranteed, while Holy prevents that Disable trigger.",
			],
			"duskilate": [
				"Eligible Normal moves become Fairy on Holy and Rainbow, otherwise Dark. Their conversion bonus is 1.5× on Dark Crystal Cavern, New World, Starlight Arena, Cold Eclipse, Short-Circuit, Haunted, Bewitched Woods, Holy and Rainbow, instead of 1.3×. Cold Eclipse additionally grants hail immunity. Cold Eclipse also recognizes Duskilate for its 1.5× defenses and exemption from the grounded Speed penalty.",
			],
			"execution": [
				"Eligible Normal moves become Fairy on Holy and Rainbow, otherwise Dark. Their conversion bonus is 1.5× on Dark Crystal Cavern, New World, Starlight Arena, Cold Eclipse, Short-Circuit, Haunted, Bewitched Woods, Holy and Rainbow, instead of 1.3×. Cold Eclipse additionally grants hail immunity. While any base field exists, its current stat-change handler blocks Speed drops, including self-caused drops; its Attack/Special Attack floor and KO healing remain separate.",
			],
			"royaldecree": [
				"On entry, resets stat stages and screens unless Neutralization blocks the effect; Safeguard protects its side from that reset. Fairy Tale, Chess Board, New World and Starlight Arena additionally raise Defense or Special Defense according to opposing offensive stats: two stages in singles, one otherwise. Chess Board also multiplies both defenses by 1.5 while Neutralization is absent. The reset preserves field-supported positive defenses for Relic Armor/Defeatist on Desert, Fairy Tale, Cave, Crystal Cavern, New World and Volcanic Summit; Magician Special Attack on Fairy Tale, Bewitched Woods, Haunted, Misty and New World; Stalwart Special Attack on New World, Starlight, Fairy Tale and Chess Board. Mirror Arena’s existing Mirror Armor/Iron Dominion evasion boosts survive the reset, but their new evasion boosts are not allowed by the current ongoing exception. The prevention message appears when a stat change is actually blocked.",
			],
		},
		"moves": {
			"magicpowder": [
				"On Haunted and Bewitched Woods, adds a guaranteed sleep secondary, subject to ordinary immunity and successful-hit rules. Its successful Psychic type conversion also attempts to establish Bewitched Woods for five turns. Already pure-Psychic targets fail the type conversion.",
			],
			"destinybond": [
				"On Haunted, consecutive use does not fail for the usual repeat-use reason. When a qualifying opposing move triggers Destiny Bond’s knockout, its haunting message accompanies creation of three-turn Haunted Field, or extension to at least three turns. Banette and Mega Banette get six turns when creating it, or add three after the minimum-three refresh. Z-powered use does not create/extend the field.",
			],
			"grudge": [
				"When a qualifying knockout successfully empties the attacker’s move PP, prints the haunting message and creates three-turn Haunted Field or refreshes it to at least three. Banette and Mega Banette create six turns or add three after that minimum refresh. Z-powered Grudge does not create/extend the field.",
			],
			"infernalparade": [
				"Haunted doubles power without requiring status. Adaptive Cycle field protection removes only that field-based qualification; status, Comatose, Soul Fire or Sinister Blaze can still independently double it.",
			],
			"meanlook": [
				"On Haunted, targets all adjacent foes rather than one. Each target still must be eligible for its trapping volatile.",
			],
			"nightshade": [
				"On Haunted, fixed damage is 1.5 times the user’s level; on Cold Eclipse it is 140. Verified with level-100 Night Shade: 150 damage on Haunted and 140 on Cold Eclipse. Type immunity still applies.",
			],
		},
	},
	"chessboardterrain": {
		"abilities": {
			"unovawing": [
				"Chessboard disables its +2 Special Attack response to opposing stat drops. Its ordinary extra critical-hit stage remains.",
			],
			"competitive": [
				"Chessboard replaces the response to opposing stat drops with a missing-HP power bonus: 1× at full HP, increasing linearly to 2× at 20% base max HP or less. On this field, opposing stat drops do not grant its usual +2 Special Attack.",
			],
			"fossilfrenzy": [
				"Its Klutz component prevents using Ancient Power, Barrage, Continental Crush, Psychic, Rock Throw, Secret Power, Shattered Psyche and Strength on Chessboard. The failed attempt prints “It was too much a klutz to move the pieces!”; no piece is moved. Its ordinary item suppression and damage-triggered boosts remain.",
			],
			"klutz": [
				"On Chessboard, Ancient Power, Barrage, Continental Crush, Psychic, Rock Throw, Secret Power, Shattered Psyche and Strength fail when this holder tries to use them. The failure prints “It was too much a klutz to move the pieces!”. Ordinary item suppression still applies, including its training-item exceptions.",
			],
			"tyrantstream": [
				"Chessboard adds a 1.2× power multiplier to its attacks. This stacks with its separate 1.2× recoil/crash/explosion bonus and 1.5× biting bonus when those conditions apply; the field does not change its sandstorm or recoil protection.",
			],
			"merciless": [
				"On Corrosive, Corrosive Mist, Murkwater Surface and Wasteland, its attacks receive the guaranteed-critical modifier even against an unpoisoned target; effects that prevent critical hits still work. On Chessboard instead, the critical ratio is set to one stage per 20% of the target’s missing base max HP, capped at three; poisoning adds the guaranteed-critical modifier.",
			],
			"queenlymajesty": [
				"Damaging attacks deal 1.5× damage on Fairy Tale. On Chessboard the same bonus applies only when the attacker does not have the Queen role. Its protection against opposing priority attacks remains.",
			],
			"stall": [
				"On entry into Chessboard, gains +1 Defense and prints “[Pokémon] is stalling and playing defensively!”. Its ordinary late-action ordering remains.",
			],
			"stalwart": [
				"On entry, gains +1 Special Attack on Chessboard, Fairy Tale, New World and Starlight Arena. Moves still ignore redirection; the shared Cave collapse handler also recognizes Stalwart as protection from that collapse.",
			],
			"stancechange": [
				"On entry to Chessboard or Fairy Tale, gains +1 Defense and Special Defense. A qualifying Aegislash changing into Blade gains +1 Attack and Special Attack but loses one Defense and Special Defense stage; returning to Shield reverses those stage changes. Status moves other than King’s Shield do not change stance. Transformed users and Aegislash-Gmax do not perform the stance changes.",
			],
			"imperialmandate": [
				"On Fairy Tale, Chessboard, New World, Starlight Arena and Cold Eclipse, half HP or more grants one tracked Defense and Special Defense stage instead of its ordinary 2× attack power. Below half HP, those granted stages are removed and it receives 1.5× attack power plus double Speed. Leaving the favored fields removes the tracked defenses. “fortifies its defenses” announces the high-HP field mode; “quickens its command” announces low-HP mode; “empowers its attacks” announces ordinary high-HP mode.",
			],
			"illusion": [
				"Ordinary Illusion grants no Chessboard power or Mirror Arena evasion bonus; those belong to Perfect Illusion. Cold Eclipse’s separate field rules still recognize ordinary Illusion for 1.5× Defense/Special Defense and exemption from its grounded Speed penalty. Disguise does not copy the target’s mechanical traits.",
			],
			"royaldecree": [
				"On entry, resets stat stages and screens unless Neutralization blocks the effect; Safeguard protects its side from that reset. Fairy Tale, Chess Board, New World and Starlight Arena additionally raise Defense or Special Defense according to opposing offensive stats: two stages in singles, one otherwise. Chess Board also multiplies both defenses by 1.5 while Neutralization is absent. The reset preserves field-supported positive defenses for Relic Armor/Defeatist on Desert, Fairy Tale, Cave, Crystal Cavern, New World and Volcanic Summit; Magician Special Attack on Fairy Tale, Bewitched Woods, Haunted, Misty and New World; Stalwart Special Attack on New World, Starlight, Fairy Tale and Chess Board. Mirror Arena’s existing Mirror Armor/Iron Dominion evasion boosts survive the reset, but their new evasion boosts are not allowed by the current ongoing exception. The prevention message appears when a stat change is actually blocked.",
			],
		},
		"moves": {
			"calmmind": [
				"On Ashen Beach, Chess Board and Psychic Field, raises Special Attack and Special Defense by two stages each.",
			],
			"nastyplot": [
				"On Chess Board and Psychic Field, raises Special Attack by three stages.",
			],
			"noretreat": [
				"On Chess Board, raises Attack, Special Attack and Speed by two but lowers Defense and Special Defense by one. Its ordinary trapping and repeat-use rules remain.",
			],
			"falsesurrender": [
				"On Chess Board, additionally applies Taunt when it hits.",
			],
			"trickroom": [
				"Lasts eight turns on Chess Board, New World and Psychic Field, taking precedence over Persistent’s seven-turn duration. Using it while already active still ends it.",
			],
			"kingsshield": [
				"On Fairy Tale and Chess Board, a blocked contact move lowers the attacker’s Special Attack by two stages as well as Attack by two. For contact damage that partially passes protection, the extra Special Attack drop is implemented on Fairy Tale only. Normal contact and protection-bypass checks remain.",
			],
		},
	},
	"corrosiveterrain": {
		"abilities": {
			"merciless": [
				"On Corrosive, Corrosive Mist, Murkwater Surface and Wasteland, its attacks receive the guaranteed-critical modifier even against an unpoisoned target; effects that prevent critical hits still work. On Chessboard instead, the critical ratio is set to one stage per 20% of the target’s missing base max HP, capped at three; poisoning adds the guaranteed-critical modifier.",
			],
			"corrosion": [
				"On Corrosive and Corrosive Mist, incoming damage is multiplied by 1.5. On Wasteland, its move secondaries are replaced with four separate 2.5% chances: frostbite, burn, paralysis and poison. Its poisoning of Poison/Steel types and Poison-move bypass of Steel immunity remain.",
			],
			"poisonheal": [
				"Heals 1/8 base max HP each turn on Corrosive Mist and Murkwater Surface regardless of grounding, or on Corrosive/Wasteland while grounded. Poison is not required for this field recovery; healing in place of poison damage is a separate effect.",
			],
			"grasspelt": [
				"Grassy and Forest fields give 1.5× Defense. On Corrosive, the holder instead loses 1/8 base max HP each turn unless it is Poison- or Steel-type.",
			],
			"toxicboost": [
				"On Corrosive, Murkwater Surface and Wasteland, physical moves gain 1.5× power even if the holder is not poisoned. Poisoning and the field do not stack this bonus.",
			],
			"neutralizinggas": [
				"Its current special-field bookkeeping does not prevent Corrosive Field damage or poisoning: the field-specific poisoning check is on Corrosive Mist, while the ability records its state only on Corrosive. Ordinary ability suppression still operates. This is a source discrepancy, not additional poison immunity.",
			],
		},
		"moves": {
			"floralhealing": [
				"Restores up to full maximum HP on Grassy Field, Fairy Tale or Flower Garden stage 3; otherwise restores half. On Corrosive Field or Corrosive Mist, a successful heal also attempts to poison the recipient. A failed heal does not poison.",
			],
			"acidarmor": [
				"Raises Defense by three stages on Corrosive Field, Corrosive Mist, Fairy Tale and Murkwater.",
			],
			"barbbarrage": [
				"Doubles power on Corrosive Mist, Corrosive Field, Murkwater and Wasteland even without status. A target protected from field effects by Adaptive Cycle does not grant this field-only bonus; an existing major status or Comatose can still qualify independently.",
			],
			"venomdrench": [
				"Corrosive Mist, Corrosive Field, Murkwater and Wasteland remove the poisoned-target requirement. A successful use lowers Attack, Special Attack and Speed by one stage.",
			],
			"venoshock": [
				"Doubles power on Corrosive Mist, Corrosive Field, Murkwater and Wasteland without requiring poison. Adaptive Cycle field protection blocks the field-only bonus; actual poison or bad poison still qualifies.",
			],
			"ickyinjection": [
				"After dealing positive damage, attempts bad poison instead of ordinary poison on Corrosive Mist, Corrosive Field, Murkwater and Wasteland. Status immunity and existing-status rules still apply.",
			],
			"ingrain": [
				"Forest and Grassy Field heal 1/8 maximum HP each turn. Flower Garden stage 2 heals 1/8 and stage 4 heals 1/4. Corrosive Field and Swamp damage non-Poison, non-Steel users by 1/16 instead; Poison and Steel users heal the ordinary 1/16. Its rooting and forced-switch protection remain.",
			],
			"toxicspikes": [
				"On Water Surface or Murkwater, newly placed Toxic Spikes vanish immediately, producing the sinking message. Wasteland removes and records them for its own hazard behavior, producing the waste-swallowed message. On Corrosive Field, grounded Poison types do not absorb existing Toxic Spikes. Steel immunity, Heavy-Duty Boots, Run Away and grounding checks remain.",
			],
		},
	},
	"wastelandterrain": {
		"abilities": {
			"merciless": [
				"On Corrosive, Corrosive Mist, Murkwater Surface and Wasteland, its attacks receive the guaranteed-critical modifier even against an unpoisoned target; effects that prevent critical hits still work. On Chessboard instead, the critical ratio is set to one stage per 20% of the target’s missing base max HP, capped at three; poisoning adds the guaranteed-critical modifier.",
			],
			"corrosion": [
				"On Corrosive and Corrosive Mist, incoming damage is multiplied by 1.5. On Wasteland, its move secondaries are replaced with four separate 2.5% chances: frostbite, burn, paralysis and poison. Its poisoning of Poison/Steel types and Poison-move bypass of Steel immunity remain.",
			],
			"poisonheal": [
				"Heals 1/8 base max HP each turn on Corrosive Mist and Murkwater Surface regardless of grounding, or on Corrosive/Wasteland while grounded. Poison is not required for this field recovery; healing in place of poison damage is a separate effect.",
			],
			"poisonpuppeteer": [
				"On Corrosive Mist entry, gains +1 Special Defense; on Wasteland entry, gains +2 instead. Its ordinary Pecharunt poison-triggered confusion still applies.",
			],
			"toxicchain": [
				"On Corrosive Mist and Wasteland, the chance after a damaging hit to badly poison rises from 30% to 60%; Shield Dust and Covert Cloak block it. Wasteland also grants Poison attacks 1.3× power.",
			],
			"toxicboost": [
				"On Corrosive, Murkwater Surface and Wasteland, physical moves gain 1.5× power even if the holder is not poisoned. Poisoning and the field do not stack this bonus.",
			],
			"liquidooze": [
				"On Murkwater Surface and Wasteland, draining moves, Leech Seed and Strength Sap damage their user for twice the HP they would have restored instead of restoring it.",
			],
			"stench": [
				"On Murkwater Surface and Wasteland, adds a 20% flinch chance instead of 10% to damaging moves that do not already have a flinch secondary. It does not add another flinch roll to moves already carrying one.",
			],
			"wastingsurge": [
				"On Water Surface entry, attempts to convert it to Murkwater Surface. From Underwater, first faints every active non-Poison/non-Steel Pokémon that is not semi-invulnerable, then attempts the Murkwater conversion. Neutralization on either water field stops both effects before they occur. Elsewhere it attempts to establish Wasteland. Its Poison drain and Ground-damage reduction remain separate.",
			],
			"poisonpoint": [
				"On Wasteland, contact attackers have a 60% poison chance instead of 30%.",
			],
		},
		"moves": {
			"barbbarrage": [
				"Doubles power on Corrosive Mist, Corrosive Field, Murkwater and Wasteland even without status. A target protected from field effects by Adaptive Cycle does not grant this field-only bonus; an existing major status or Comatose can still qualify independently.",
			],
			"venomdrench": [
				"Corrosive Mist, Corrosive Field, Murkwater and Wasteland remove the poisoned-target requirement. A successful use lowers Attack, Special Attack and Speed by one stage.",
			],
			"venoshock": [
				"Doubles power on Corrosive Mist, Corrosive Field, Murkwater and Wasteland without requiring poison. Adaptive Cycle field protection blocks the field-only bonus; actual poison or bad poison still qualifies.",
			],
			"ickyinjection": [
				"After dealing positive damage, attempts bad poison instead of ordinary poison on Corrosive Mist, Corrosive Field, Murkwater and Wasteland. Status immunity and existing-status rules still apply.",
			],
			"direclaw": [
				"On Wasteland, the status secondary is guaranteed to roll one of poison, paralysis or sleep with equal probability. Existing status immunities and already-statused targets can still prevent the chosen status.",
			],
			"leechseed": [
				"On Wasteland, drains one quarter maximum HP each turn rather than one eighth. On Grassy Field, healing to the recipient is multiplied by 1.3 after actual damage is dealt. No drain occurs if the recipient slot has no living Pokémon.",
			],
		},
	},
	"factoryterrain": {
		"abilities": {
			"defragment": [
				"On Cold Eclipse and Fairy Tale entry, raises both Defense and Special Defense by one stage. On Factory, Short-Circuit, Glitch, New World and Starlight Arena, compares all living foes’ combined Attack and Special Attack and raises the corresponding defense by two stages (Defense wins a tie), instead of the ordinary one-stage increase. Its attacks still cannot miss.",
			],
			"armorize": [
				"Eligible Normal moves become Steel. The conversion bonus is 1.5× on Factory, Short-Circuit, Fairy Tale, Dragon’s Den, Starlight Arena, New World and Holy, instead of 1.2×. Cold Eclipse grants hail immunity but does not increase that conversion bonus. Variable-type moves retain their normal conversion exclusions.",
			],
			"argentdevotion": [
				"Its Armorize conversion gives 1.5× power on Factory, Short-Circuit, Fairy Tale, Dragon’s Den, Starlight Arena, New World and Holy, instead of 1.2×. Cold Eclipse grants hail immunity. On Fairy Tale entry, Sworn Duty heals each adjacent living ally by 1/3 base max HP instead of 1/4. Its other components remain active.",
			],
			"doublestrike": [
				"Factory raises its Technician-style effective-power threshold from 60 to 80. Qualifying moves gain 1.5× power; Skill Link behavior is unchanged.",
			],
			"aevianspark": [
				"Factory raises its Technician effective-power threshold from 60 to 80, retaining the 1.5× bonus. Its transformation, contact paralysis and shortened sleep remain separate effects.",
			],
			"auramaster": [
				"Factory raises its weak-move threshold from 60 to 80 effective power. Qualifying moves gain 1.5× power, including each eligible Dual Wield hit under the shared scaling rules.",
			],
			"gulpmissile": [
				"Water Surface and Underwater force eligible Cramorant into Gulping on entry or field change. Surf loads Gorging on Electric, Factory and Short-Circuit regardless of HP; Swamp retains the ordinary HP-based result. Underwater discharge deals 1/4 of the attacker’s base max HP scaled by ordinary Water effectiveness, and Water immunity prevents that damage. Elsewhere discharge keeps its ordinary quarter-HP damage. Gulping still lowers Defense; Gorging still attempts paralysis.",
			],
			"motordrive": [
				"Absorbing another Pokémon’s Electric move grants +2 Speed on Factory or Short-Circuit instead of +1. On Electric Field, additionally gains +1 Speed at the end of each turn.",
			],
			"steelworker": [
				"On Factory, Steel attacks use 2× Attack or Special Attack instead of 1.5×. On Short-Circuit, Steel moves gain Electric as an additional type. Steel STAB and its separate defensive Steel resistances remain.",
			],
			"transistor": [
				"Electric attacks use 2× Attack or Special Attack on Electric and Factory fields instead of 1.3×. Electric Field additionally halves the offensive stat used by incoming Ground attacks.",
			],
			"railguncircuit": [
				"Its Transistor component makes Electric attacks use 2× the offensive stat on Factory and Electric Field. Electric Field entry also grants +1 Attack and Special Attack through Lightning Rod; its redirection and absorption remain.",
			],
			"pulsetriad": [
				"Once per battle per holder, entry attempts to create or refresh Factory for exactly three turns, including when Amplifield Rock is held. A blocked attempt still spends the allowance. Magnezone-Pulse receives Flash Cannon, Discharge, Recover and Autotomize; switching or regaining the ability does not reset the field use.",
			],
			"scarecrow": [
				"On Factory, its Steelworker component makes Steel attacks use 2× Attack/Special Attack rather than 1.5×. Steel STAB remains; its wind interactions are separate.",
			],
			"fortressshell": [
				"Its Stalwart component raises Special Attack on entry in New World, Starlight Arena, Fairy Tale and Chess Board. Shell Armor adds entry Defense on Fairy Tale or Dragon Den. Its own field-entry effect raises Defense and Special Defense on Fairy Tale, New World, Cold Eclipse or Starlight, tracking changes between fields. New World, Cold Eclipse and Starlight give 1.5x power. Guardian Presence gives allied attacks 1.5x power on Haunted, Bewitched Woods, Holy or Psychic Field (1.3x otherwise), and reduces allied incoming damage by 25%. Electric Aura, Electric Field, Murkwater, Water Surface, Underwater, Midnight Zone, Factory or Short-Circuit activate its Electric redirection/absorption and Attack/Special Attack increases.",
			],
		},
		"moves": {
			"autotomize": [
				"On Factory, raises Speed by three stages. Its ordinary 100 kg weight reduction, 0.1 kg minimum and capped-Speed failure checks remain.",
			],
			"irondefense": [
				"On Factory, raises Defense by three stages.",
			],
			"gearup": [
				"On Factory, uses two-stage Attack and Special Attack boosts. The current handler first boosts the user only if it is not among the Plus/Minus recipients, then requires both an eligible recipient and that successful user boost before processing those recipients. Consequently, a Plus/Minus user does not receive the intended field boost through this handler. This is an existing implementation discrepancy, not a new restriction.",
			],
			"electroshot": [
				"Electric Field and Factory remove the charge turn while retaining the Special Attack increase. Rain and heavy rain independently provide the same charge skip.",
			],
			"magnetrise": [
				"Lasts eight turns on Electric Field, Short-Circuit and Factory instead of five. Smack Down, Ingrain and Gravity still prevent it.",
			],
		},
	},
	"glitchterrain": {
		"abilities": {
			"defragment": [
				"On Cold Eclipse and Fairy Tale entry, raises both Defense and Special Defense by one stage. On Factory, Short-Circuit, Glitch, New World and Starlight Arena, compares all living foes’ combined Attack and Special Attack and raises the corresponding defense by two stages (Defense wins a tie), instead of the ordinary one-stage increase. Its attacks still cannot miss.",
			],
			"download": [
				"On Glitch entry, gains +1 Attack and Special Attack rather than comparing foe defenses. A base Genesect holding a Drive first gains those stages once more and changes selected ability: Douse→Water Absorb, Shock→Motor Drive, Burn→Flash Fire, Chill→Ice Absorb. Factory instead doubles the ordinary selected offensive-stage increase, while Short-Circuit grants +1 to both.",
			],
		},
		"moves": {
			"blizzard": [
				"On Glitch, base accuracy becomes 90%. Hail, snow or Cold Eclipse instead bypass accuracy checks.",
			],
			"conversion": [
				"After use, records one conversion toward Glitch Field; a later Conversion or Conversion 2 attempts to create Glitch. While already on Glitch, resets its duration to five turns, or eight with Amplifield Rock. The current after-use callback does not require a successful type change.",
			],
			"conversion2": [
				"Shares Conversion’s counter: one use records progress, a later Conversion or Conversion 2 attempts to create Glitch. While already on Glitch, resets its duration to five turns, or eight with Amplifield Rock. This after-use callback does not require a successful type change.",
			],
			"hyperbeam": [
				"On Glitch, a hit that knocks out its target removes the recharge requirement and prints the fallen-energy message. Other hits still require recharge.",
			],
			"metronome": [
				"On Glitch, chooses only eligible Metronome moves whose listed base power is at least 70. This excludes variable-power moves listed below that threshold even if their eventual power would be high.",
			],
			"rest": [
				"On Glitch, the initial check permits use while already asleep or Comatose. Its hit callback also heals even if setting sleep fails; it still writes a three-turn sleep timer. Full-HP, Insomnia and Vital Spirit checks remain. This is the current implementation, including its unusual status-failure behavior.",
			],
			"glitchygraphics": [
				"Outside Glitch, establishes Glitch for five turns. On Glitch, instead changes each eligible opposing Pokémon to a randomly chosen type it does not already have. Multitype, RKS System and protected Ogerpon/Terapagos forms are excluded. Each successful conversion prints a type-change message.",
			],
		},
	},
	"mirrorarenaterrain": {
		"abilities": {
			"icescales": [
				"Cold Eclipse doubles Defense. Mirror Arena entry grants +2 evasion. On Icy and Snowy Mountain, super-effective contributions from the holder’s Ice typing are neutralized; weaknesses from another type remain. Its ordinary halving of special damage and hail immunity remain.",
			],
			"magicbounce": [
				"Fairy Tale entry gives +1 Special Defense; Mirror Arena entry gives +1 evasion. On Mirror Arena, reflecting a directly targeted move also grants the original user +1 evasion. Side-targeted reflections do not use that additional evasion callback.",
			],
			"colorchange": [
				"Mirror Arena entry grants +1 evasion. Its ordinary type change after being hit remains.",
			],
			"illusion": [
				"Ordinary Illusion grants no Chessboard power or Mirror Arena evasion bonus; those belong to Perfect Illusion. Cold Eclipse’s separate field rules still recognize ordinary Illusion for 1.5× Defense/Special Defense and exemption from its grounded Speed penalty. Disguise does not copy the target’s mechanical traits.",
			],
			"royaldecree": [
				"On entry, resets stat stages and screens unless Neutralization blocks the effect; Safeguard protects its side from that reset. Fairy Tale, Chess Board, New World and Starlight Arena additionally raise Defense or Special Defense according to opposing offensive stats: two stages in singles, one otherwise. Chess Board also multiplies both defenses by 1.5 while Neutralization is absent. The reset preserves field-supported positive defenses for Relic Armor/Defeatist on Desert, Fairy Tale, Cave, Crystal Cavern, New World and Volcanic Summit; Magician Special Attack on Fairy Tale, Bewitched Woods, Haunted, Misty and New World; Stalwart Special Attack on New World, Starlight, Fairy Tale and Chess Board. Mirror Arena’s existing Mirror Armor/Iron Dominion evasion boosts survive the reset, but their new evasion boosts are not allowed by the current ongoing exception. The prevention message appears when a stat change is actually blocked.",
			],
			"mirrorarmor": [
				"Fairy Tale grants one Defense and Special Defense stage on entry; Mirror Arena grants one evasion stage. Royal Decree preserves existing matching field boosts during its entry reset. Starlight Arena supplies its priority-protection callback. Ordinary reflected stat drops still follow Mirror Armor’s targeting and reflection rules.",
			],
			"lunarorbit": [
				"Its Magic Guard component grants one Special Defense stage on Fairy Tale. Its entry Gravity cannot activate on New World. Gravity sinks Water Surface into Underwater, Underwater into Midnight Zone, and Corrosive Mist into Corrosive Field; otherwise an eligible active aura is promoted to its field. The sinking message is triggered by the Water Surface transition attempt. Mirror Arena alone does not supply an additional reflection effect through Lunar Orbit.",
			],
			"irondominion": [
				"Fairy Tale increases its adjacent-ally entry healing from one quarter to one third maximum HP; the shared-mead message accompanies each attempted ally heal. This healing is skipped when Sworn Duty is already the species passive. Fairy Tale also grants one Defense and Special Defense stage once per ability activation; Mirror Arena grants one evasion stage. Cold Eclipse changes its Pressure drops to two stages in both defenses, retaining the per-target attempt memory and Substitute check. Starlight Arena blocks opposing positive-priority moves aimed at its protected side, with the callback’s field-wide targeting exclusions.",
			],
		},
		"moves": {
			"auroraveil": [
				"Can be used without hail or snow on Rainbow, Icy, Mirror Arena, Dark Crystal Cavern, Crystal Cavern, Snowy Mountain, Starlight Arena and Cold Eclipse. Mirror Arena extends ordinary Aurora Veil to eight turns and its after-use callback grants one evasion stage if a successful move has been recorded that turn. Royal Decree can still prevent the screen. G-Max-generated veil keeps its separate four-turn duration.",
			],
			"baddybad": [
				"On Mirror Arena, its self effect adds one evasion stage as well as Reflect. Reflect’s own Mirror Arena activation effects remain independent.",
			],
			"doubleteam": [
				"On Mirror Arena, raises evasion by two stages.",
			],
			"glitzyglow": [
				"On Mirror Arena, its self effect adds one evasion stage as well as Light Screen. Light Screen’s own Mirror Arena activation effects remain independent.",
			],
			"lightscreen": [
				"On Mirror Arena, lasts eight turns and gives the user one evasion stage when the screen successfully starts. Royal Decree can prevent creation, in which case that entry boost does not occur.",
			],
			"mirrorcoat": [
				"On Mirror Arena, the current damage-recording callback grants Defense, Special Defense and evasion to the opposing special attacker that hit the user. Its separate after-use callback grants the same three boosts to the user if a successful move has been recorded that turn. The attacker-side boost is an existing implementation discrepancy.",
			],
			"mirrormove": [
				"On Mirror Arena, after selecting and calling an eligible copied move, raises the user’s Attack, Special Attack and evasion by one stage each.",
			],
		},
	},
	"rainbowterrain": {
		"abilities": {
			"prismarmor": [
				"On Crystal Cavern and Dark Crystal Cavern, all incoming attacks receive its additional 25% reduction on top of the ordinary 20% reduction, for 40% total; super effectiveness does not add another copy. Dark Crystal Cavern and Rainbow also multiply Defense and Special Defense by about 4/3. Cold Eclipse grants the same defense multipliers and hail immunity.",
			],
			"marvelscale": [
				"Defense is 1.5× on Dragon’s Den, Fairy Tale, Rainbow, Starlight Arena and Misty without requiring a status condition. Having both a status and one of these fields does not stack the bonus.",
			],
			"baddreams": [
				"Rainbow prevents its end-of-turn damage to sleeping foes, including Comatose users. Outside Rainbow, that damage remains 1/8 base max HP.",
			],
			"cloudnine": [
				"At the end of each turn on Rainbow, gains one stage in a randomly selected stat that is below +6, excluding evasion but including accuracy. If every eligible stat is at +6, no boost occurs. Weather suppression remains active.",
			],
			"neutralization": [
				"Entry clears Rainbow and ends existing Trick Room, Magic Room and Wonder Room. While active it blocks ordinary base-field changes, but auras can still be established. Its interaction with Royal Decree and normal field-lock exceptions remain; this does not prevent the rooms from being established again later.",
			],
			"soulheart": [
				"On Misty or Rainbow, any Pokémon fainting grants the holder +1 Special Attack and +2 Special Defense instead of only +1 Special Attack.",
			],
			"wonderskin": [
				"On Rainbow, status moves targeting the holder receive zero accuracy from its accuracy callback. Elsewhere it sets numeric status-move accuracy to 50; normal effects that bypass accuracy checks still follow their own rules.",
			],
			"duskilate": [
				"Eligible Normal moves become Fairy on Holy and Rainbow, otherwise Dark. Their conversion bonus is 1.5× on Dark Crystal Cavern, New World, Starlight Arena, Cold Eclipse, Short-Circuit, Haunted, Bewitched Woods, Holy and Rainbow, instead of 1.3×. Cold Eclipse additionally grants hail immunity. Cold Eclipse also recognizes Duskilate for its 1.5× defenses and exemption from the grounded Speed penalty.",
			],
			"execution": [
				"Eligible Normal moves become Fairy on Holy and Rainbow, otherwise Dark. Their conversion bonus is 1.5× on Dark Crystal Cavern, New World, Starlight Arena, Cold Eclipse, Short-Circuit, Haunted, Bewitched Woods, Holy and Rainbow, instead of 1.3×. Cold Eclipse additionally grants hail immunity. While any base field exists, its current stat-change handler blocks Speed drops, including self-caused drops; its Attack/Special Attack floor and KO healing remain separate.",
			],
			"pastelveil": [
				"On activation, cures poison on the holder and allies. Fairy Tale also raises the holder’s Special Defense by one; this activation can repeat when another Pokémon switches in. Bewitched Woods cancels weaknesses contributed by the holder’s Fairy typing. In Misty or Rainbow Field, the current callbacks reduce outgoing Poison damage: the holder’s attack receives both half-damage callbacks (one quarter overall), and an ally’s attack receives one (one half). They do not reduce incoming Poison damage. This describes the current implementation, not the old defensive description.",
			],
		},
		"moves": {
			"cosmicpower": [
				"On Holy, New World, Rainbow, Starlight Arena, Misty and Psychic fields, raises Defense and Special Defense by two stages each.",
			],
			"auroraveil": [
				"Can be used without hail or snow on Rainbow, Icy, Mirror Arena, Dark Crystal Cavern, Crystal Cavern, Snowy Mountain, Starlight Arena and Cold Eclipse. Mirror Arena extends ordinary Aurora Veil to eight turns and its after-use callback grants one evasion stage if a successful move has been recorded that turn. Royal Decree can still prevent the screen. G-Max-generated veil keeps its separate four-turn duration.",
			],
			"firepledge": [
				"After a successful hit or Substitute damage, records this pledge for field combinations. Fire + Grass creates Burning Field, Fire + Water creates Rainbow, and Grass + Water creates Swamp. A recorded complementary pledge grants approximately 1.3x power unless Adaptive Cycle blocks that field-only contribution. On an already timed matching combination field, the hit resets its duration to four turns, or seven with Amplifield Rock; this is a reset, not an addition. The move chooses Physical or Special using the higher offensive stat.",
			],
			"waterpledge": [
				"After a successful hit or Substitute damage, records this pledge for field combinations. Fire + Grass creates Burning Field, Fire + Water creates Rainbow, and Grass + Water creates Swamp. A recorded complementary pledge grants approximately 1.3x power unless Adaptive Cycle blocks that field-only contribution. On an already timed matching combination field, the hit resets its duration to four turns, or seven with Amplifield Rock; this is a reset, not an addition. The move chooses Physical or Special using the higher offensive stat.",
			],
			"lifedew": [
				"Holy and Rainbow increase healing to half maximum HP. Water Surface, Underwater and Midnight Zone instead add Aqua Ring and heal one quarter; adding the ring can succeed at full HP. Corrosive Mist and Murkwater add a guaranteed poison secondary, subject to status rules.",
			],
			"wish": [
				"If created on Misty, Rainbow, Fairy Tale, Holy or Starlight, stores healing equal to three quarters of the original user’s maximum HP instead of half. The amount is decided when Wish is set, not when it resolves. The Wish healing message appears only when healing succeeds.",
			],
			"sonicboom": [
				"On Rainbow, fixed damage becomes 140. Type immunity still applies.",
			],
		},
	},
	"inverseterrain": {
		"abilities": {
			"inversion": [
				"On entry, attempts to establish Inverse Field under the normal field-setting rules. Its Infiltrator and Hypnosis accuracy bypass remain separate; it does not supply a second copy of the species’ Contrary passive.",
			],
		},
		"moves": {
			"topsyturvy": [
				"After use, attempts to create Inverse Field for three turns, or six with Amplifield Rock. This field callback runs independently of whether stat inversion changed any stages.",
			],
		},
	},
	"flowergarden3": {
		"moves": {
			"floralhealing": [
				"Restores up to full maximum HP on Grassy Field, Fairy Tale or Flower Garden stage 3; otherwise restores half. On Corrosive Field or Corrosive Mist, a successful heal also attempts to poison the recipient. A failed heal does not poison.",
			],
			"sweetscent": [
				"On Flower Garden stage 3, lowers Defense, Special Defense and evasion by one stage each. On Misty Field, lowers evasion by two and both defenses by one.",
			],
		},
	},
};
