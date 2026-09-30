'use strict';
const fs = require('fs');
const path = require('path');
const {Dex} = require('../dist/sim/dex');
const {RosterExpansionDescriptions} = require('../dist/data/roster-expansion-text');
const {AbilityComponents} = require('../dist/data/ability-components');
const client = 'C:/Users/Cynao/Desktop/showdown server/PokemonShowdown-Client';
const file = path.join(client, 'play.pokemonshowdown.com/src/battle-dex.ts');
let source = fs.readFileSync(file, 'utf8');
function insert(tag, anchor, body) {
 const begin=`// BEGIN ${tag}`, end=`// END ${tag}`;
 const block=`${begin}\n${body}\n${end}\n`;
 const start=source.indexOf(begin);
 if(start>=0){const finish=source.indexOf(end,start)+end.length;source=source.slice(0,start)+block+source.slice(finish).replace(/^\r?\n/,'');}
 else { if(!source.includes(anchor))throw new Error(`Missing ${anchor}`);source=source.replace(anchor,block+anchor); }
}
const ids='mienshao baxcalibur weavile rhyperior jellicent incineroar rillaboom cinderace inteleon meowscarada sevipermega hydreigon ursalunabloodmoon tyranitar hariyama electivire magmortar scolipede zoroark galvantula ferrothorn eelektross chandelure seviper accelgor goodra mudsdale corviknight drednaw skeledirge quaquaval garganacl annihilape quagsire eelektrossmega scolipedemega ursaluna nidoking vileplume kingler kinglergmax gyarados steelix donphan krookodile beartic escavalier bouffalant talonflame primarina vikavolt lycanroc lycanrocmidnight lycanrocdusk armarouge ceruledge houndstone dondozo clodsire pidgeot raticate raticatealola sandslash sandslashalola nidoqueen ninetales venomoth scizor dustox beautifly sableye kricketune tangrowth togekiss mamoswine froslass crustle carracosta scovillain tatsugiri tatsugiridroopy tatsugiristretchy tatsugiricurlymega tatsugiridroopymega tatsugiristretchymega sinistcha archaludon poliwrath gallade yanmega mrmime cloyster conkeldurr seismitoad frosmoth cryogonal torkoal furret lokix diggersby alakazammega alakazammegaalt slowbromega metagrossmega carnivine weavilemega copperajah'.split(' ');
const species=Object.fromEntries(ids.map(id=>{const s=Dex.species.get(id);if(!s.exists)throw new Error(id);return [id,{baseStats:s.baseStats,abilities:s.abilities,replaceAbilities:true}];}));
insert('APPROVED ROSTER SPECIES','const CUSTOM_SPECIES_UPDATE_IDS',`for (const [id, update] of Object.entries(${JSON.stringify(species,null,2)})) {\n CUSTOM_SPECIES_UPDATES[id] = {...CUSTOM_SPECIES_UPDATES[id], ...update};\n}`);
const previous='knuckletide crosscurrent pearlcurrent slipstream mimecraft dreamsickness voidveil knightsguard terraresolve abysslure purifyingfrost smolderingshroud springfur varietyrush forgegrit masonsfist marshconduit silkward swarmdrive mirechorus boretunnel apexflytrap crueltag battery mythicscale freezerburn royalvoice mountainhunger treasuretitan furnaceengine duneterror argentdevotion slowclamp soultag royalsun toxicrenewal absolutezero phantomfist ultrainstinct burningego coldlogic mossarmor propellertail ultraego'.split(' ');
const abilities=Object.fromEntries([...new Set([...Object.keys(RosterExpansionDescriptions),...previous])].map(id=>{const a=Dex.abilities.get(id);if(!a.exists)throw new Error(`Ability ${id}`);return [id,{name:a.name,num:a.num,rating:a.rating,desc:a.desc,shortDesc:a.shortDesc}];}));
insert('APPROVED ROSTER ABILITIES','const CUSTOM_ABILITY_UPDATE_IDS',`Object.assign(CUSTOM_ABILITY_UPDATES, ${JSON.stringify(abilities,null,2)});`);
insert('APPROVED ROSTER COMPONENTS','const CUSTOM_MOVE_UPDATE_IDS',`Object.assign(CUSTOM_ABILITY_COMPONENT_OVERRIDES, ${JSON.stringify(AbilityComponents,null,2)});`);
source=source.replace("const REMOVED_SPECIES_IDS = ['belliboltalt'", "const REMOVED_SPECIES_IDS = ['weavilealt', 'belliboltalt'");
fs.writeFileSync(file,source);
const searchFile=path.join(client,'play.pokemonshowdown.com/src/battle-dex-search.ts');
let search=fs.readFileSync(searchFile,'utf8');
search=search.replace('// index was generated. Match their actual names, not component references.', '// index was generated. Match their names and explicitly declared ability components.');
search=search.replace(/\t\t\tconst indexedAbilities = new Set<string>\(\);\r?\n\t\t\tfor \(const entry of BattleSearchIndex\) \{\r?\n\t\t\t\tif \(entry\[1\] === 'ability'\) indexedAbilities.add\(entry\[0\]\);\r?\n\t\t\t\}\r?\n/, '');
// Indexed composite abilities must remain discoverable through their components too.
search=search.replace('\t\t\t\t\tif (indexedAbilities.has(id as ID)) continue;\n','').replace('\t\t\t\t\tif (indexedAbilities.has(id as ID)) continue;\r\n','');
fs.writeFileSync(searchFile,search);
const tooltipFile = path.join(client, 'play.pokemonshowdown.com/src/battle-tooltips.ts');
let tooltip = fs.readFileSync(tooltipFile, 'utf8');
tooltip = tooltip.replace("if (isSound && value.abilityModify(0, 'Liquid Voice')) {",
 "if (isSound && (value.abilityModify(0, 'Liquid Voice') || value.abilityModify(0, 'Tidal Voice'))) {");
if (!tooltip.includes("value.abilityModify(1.3, 'Tidal Voice')")) {
 tooltip = tooltip.replace('value.abilityModify(1.3, "Punk Rock");',
  'value.abilityModify(1.3, "Punk Rock");\n\t\t\tvalue.abilityModify(1.3, \'Tidal Voice\');');
}
if (!tooltip.includes("value.abilityModify(0, 'Primal Rhythm')")) {
 const anchor = "\t\tconst fieldPreview = (window as any).BattleFieldTooltips?.preview(this.battle, {...move, type: moveType, category}, pokemon, serverPokemon);";
 if (!tooltip.includes(anchor)) throw new Error('Missing move category preview anchor');
 tooltip = tooltip.replace(anchor,
  "\t\tif (!forMaxMove && category !== 'Status' && move.flags['sound'] && value.abilityModify(0, 'Primal Rhythm')) {\n" +
  "\t\t\tcategory = 'Physical';\n\t\t}\n" + anchor);
}
fs.writeFileSync(tooltipFile, tooltip);
const animationsFile = path.join(client, 'play.pokemonshowdown.com/src/battle-animations.ts');
let animations = fs.readFileSync(animationsFile, 'utf8');
if (!animations.includes("lunardread: ['Lunar Dread'")) {
 const anchor = "\t\tthroatchop: ['Throat Chop', 'bad'],";
 if (!animations.includes(anchor)) throw new Error('Missing volatile status table anchor');
 animations = animations.replace(anchor, anchor + "\n\t\tlunardread: ['Lunar Dread', 'bad'],");
 fs.writeFileSync(animationsFile, animations);
}
if (!animations.includes("meridianseal: ['Meridian Seal'")) {
 animations = animations.replace("throatchop: ['Throat Chop', 'bad'],", "throatchop: ['Throat Chop', 'bad'],\n\t\tmeridianseal: ['Meridian Seal', 'bad'],");
 fs.writeFileSync(animationsFile, animations);
}
console.log(`Synced ${ids.length} species, ${Object.keys(abilities).length} abilities and component search metadata.`);
