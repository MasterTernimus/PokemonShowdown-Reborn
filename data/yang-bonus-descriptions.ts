/** Approved October 31 field/Aura additions; baseline behavior remains available off-field. */
export const YangBonusDescriptions: Record<string, string> = {
  "kaboom": "Electric Field/Aura, Factory or Short Circuit: no recoil; opposing HP damage breaks the target side’s Reflect, Light Screen and Aurora Veil.",
  "cactibash": "Desert, Ashen Beach, Forest, Grassy Field/Aura: heals 25% of actual opposing HP damage dealt, including both hits.",
  "corrosivestrike": "Corrosive Field or Mist: corrosion deals 1/12 maximum HP per tick; otherwise 1/16.",
  "toxicvial": "Corrosive Field or Mist: also lowers Speed by 1.",
  "flutterscales": "Forest, Flower Garden or Grassy Aura: lowers each damaged foe’s higher staged offense instead of choosing randomly (Sp. Atk on ties), once per foe per use.",
  "spiritmend": "Haunted also heals 66%. On Short Circuit, Factory, Haunted, Dark Crystal or Rift Aura, restoring HP cures burn/paralysis. On Holy, first changes it to Haunted if field replacement is permitted, then heals 66%; conversion can succeed at full HP.",
  "chistrike": "Ashen Beach, Holy, Big Top, Rocky or Psychic Field/Aura: ignores the user’s negative Attack stages for this attack; opposing HP damage cures its confusion.",
  "gunkrock": "Wasteland or Murkwater Surface: status chance becomes 40%, with one roll per damaged foe per whole attack. Normal secondary-effect modifiers apply.",
  "frozenrefractals": "Mirror Arena, Icy, Snowy or Frozen Aura: newly created Veil lasts 4 turns. No refresh or duration extensions.",
  "nomoswish": "Grassy Field/Aura or Forest: Wish stores at least 5/8 maximum HP; stronger existing healing is preserved. Those contexts and Starlight also let its successful Wish heal cure the recipient’s confusion.",
  "queensgambit": "Chessboard or Psychic Field/Aura: lowers only Defense when physical, or Sp. Def when special. Chess-piece effects remain Chessboard-only.",
  "darkclasp": "Dark Crystal: opposing HP damage heals the user by 1/16 maximum HP, once per attack.",
  "beatdown": "Big Top or Rocky: three native hits to the same foe’s HP grant +1 Defense, once per attack.",
  "infernalrage": "Haunted, Superheated, Burning, Volcanic, Dragon’s Den or Ashen Aura: 30% burn chance once per damaged foe per attack, with normal secondary modifiers. Preserves these five fields; still removes an active Aura first.",
  "m3g4qu4k3": "Glitch: lowers the foe’s higher staged defense by 2 and the other by 1 instead, once per damaged foe per attack (Defense on ties).",
  "winddance": "Big Top, Mountain or Snowy Mountain: newly created Strong Winds last 5 turns; no refresh. Opposing HP damage also frees the user from binding.",
  "timeblade": "Misty Field/Aura or Fairy Tale: a new Encore lasts 3 turns if the target already acted this turn. Never refreshes existing Encore.",
  "crestcleave": "Desert or Fairy Tale: drains 1/2 damage instead.",
  "sirensveil": "Water Surface, Underwater, Midnight Zone, Murkwater Surface or Icy: also grants Aqua Ring if absent and cures the user’s burn/poison.",
  "sirenswrath": "Water Surface, Underwater, Midnight Zone, Murkwater Surface or Icy: protection becomes 35%. Frozen Aura alone grants 30%; use the stronger effect without stacking. Opposing HP damage also frees the user from binding.",
  "rocknroll": "Rocky, Cave, Mountain, Crystal Cavern or Volcanic: lowers Defense by 2 instead. Newly placed rocks also lower the chosen foe’s Speed by 1.",
  "dragonrend": "Dragon’s Den, Mountain, Fairy Tale, Volcanic or New World: ignores Reflect, Light Screen and Aurora Veil for this attack without removing them.",
  "airstreamassault": "Mountain or Snowy Mountain: a damaging hit creates 3-turn Tailwind if absent, without refresh or extension. Opposing HP damage also frees the user from binding.",
  "wisteriamaelstrom": "Flower Garden: opposing HP damage also heals active allied Grass/Bug Pokémon by 1/16 maximum HP, or 1/8 if the attack began at stage 5, once per use.",
  "deiludicium": "Holy or Rainbow Aura: opposing HP damage clears the user’s negative Attack/Sp. Atk stages. Holy also heals 1/8 maximum HP, once per use.",
  "nostraswish": "When its Wish restores HP on Starlight or New World, it also cures the recipient’s major status and confusion. Checks the field when healing resolves; no extra attack multiplier.",
  "swarmsnare": "Forest or Flower Garden: new binds last 3 turns without refreshing. While the source remains active and alive, it heals half the actual residual HP damage this bind inflicts on these fields."
};
export function describeYangBonuses(text: Record<string,{desc:string;shortDesc:string}>) {
 for (const [id, rule] of Object.entries(YangBonusDescriptions)) {
  text[id].desc = text[id].desc.replace('Fails on Holy.', 'Holy must first be converted to Haunted; field locks can prevent this.').replace('exactly 3 turns', '3 turns by default').replace('for 4 turns.', 'for 4 turns by default.').replace('through the following turn using ordinary binding rules.', 'through the following turn by default, using ordinary binding rules.');
  text[id].desc += ' Additional field effects: ' + rule;
 }
 text.kaboom.shortDesc = 'Adaptive; +1 matching offense; 1/4 recoil. Electric/Factory/Short Circuit bonuses.';
 text.frozenrefractals.shortDesc = 'Damaging hits set Aurora Veil for 3–4 turns.';
 text.spiritmend.shortDesc = 'Heals 1/2 HP; 66% on certain fields. Holy becomes Haunted.';
 text.winddance.shortDesc = 'Adaptive. Hit sets Strong Winds for 4–5 turns; +1 priority in Strong Winds.';
 text.sirenswrath.shortDesc = 'Adaptive; ignores abilities; next opposing attack deals 25–35% less.';
 text.rocknroll.shortDesc = 'Lowers Defense; sets Stealth Rock. Stronger on rocky fields.';
 text.airstreamassault.shortDesc = 'Adaptive; clears own hazards. Mountains: 3-turn Tailwind if absent.';
 text.swarmsnare.shortDesc = 'Adaptive; binds for 2 turns (3 on Forest/Garden); field-based recovery.';
}
