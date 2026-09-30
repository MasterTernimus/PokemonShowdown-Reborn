'use strict';
const assert=require('assert').strict;
const fs=require('fs');
const path=require('path');
const client=process.argv[2] || 'C:/Users/Cynao/Desktop/showdown server/PokemonShowdown-Client';
const root=path.join(client,'play.pokemonshowdown.com');
global.window=global;
global.BattleAliases={};
for(const [name,file] of [['BattlePokedex','pokedex'],['BattleAbilities','abilities'],['BattleTeambuilderTable','teambuilder-tables'],['BattleSearchIndex','search-index']]) {
 Object.assign(global,require(path.join(root,'data',file+'.js')));
}
require(path.join(root,'js/battle-dex-data.js'));
require(path.join(root,'js/battle-dex.js'));
const {BattlePokemonSearch,DexSearch}=new Function(fs.readFileSync(path.join(root,'js/battle-dex-search.js'),'utf8')+'\nreturn {BattlePokemonSearch,DexSearch};')();
for(const [species,ability,component] of [['Scizor','Pincer Crush','Tough Claws'],['Mamoswine','Snowpack','Tough Claws'],['Nidoqueen','Broodguard','Friend Guard'],['Tangrowth','Living Tangle','Stamina'],['Tatsugiri-Curly-Mega','Master Course','Contrary']]) {
 const p=Dex.species.get(species);
 assert(Object.values(p.abilities).includes(ability),`${species} assignment`);
 assert(Dex.hasAbilityEffect(p,component),`${species} component`);
 assert(BattlePokemonSearch.prototype.filter.call({dex:Dex},['pokemon',p.id],[['ability',component]]),`${species} filter`);
 assert(Dex.abilities.get(ability).desc.length>30,`${ability} description`);
}
assert(!Dex.hasAbilityEffect(Dex.species.get('Lanturn'),'Lightning Rod'));
assert(!Dex.hasAbilityEffect(Dex.species.get('Torterra-Mega-Y'),'Rocky Payload'));
const rows=DexSearch.prototype.instafilter.call({dex:Dex},'pokemon','ability','toughclaws');
for(const id of ['scizor','mamoswine','sandslash','sandslashalola'])assert(rows.some(row=>row[0]==='pokemon'&&row[1]===id),id);
const search=new DexSearch('ability','gen9customgame','scizor');search.find('toughclaws');
assert(search.results.some(row=>row[0]==='ability'&&row[1]==='pincercrush'));
assert.equal(Dex.species.get('Raticate').bst,480);
assert.equal(Dex.species.get('Kricketune').bst,500);
for (const [species, ability, component] of [
 ['Primarina', 'Tidal Voice', 'Liquid Voice'], ['Vikavolt', 'Hover Cannon', 'Levitate'],
 ['Vikavolt', 'Recharge Relay', 'Battery'], ['Steelix', 'Iron Lash', 'Whiplash'],
 ['Krookodile', 'Dread Jaw', 'Moxie'], ['Clodsire', 'Quill Reservoir', 'Water Absorb'],
 ['Houndstone', 'Mourning Coat', 'Fluffy'], ['Dondozo', 'Dozing Giant', 'Oblivious'],
]) {
 const p = Dex.species.get(species);
 assert(Object.values(p.abilities).includes(ability));
 assert(Dex.hasAbilityEffect(p, component));
 assert(BattlePokemonSearch.prototype.filter.call({dex:Dex}, ['pokemon',p.id], [['ability',component]]));
}
assert(Dex.abilities.get('Tidal Voice').desc.includes('1.3x'));
assert(Dex.abilities.get('Tidal Voice').desc.includes('Sparkling Aria'));
for (const [species, ability, component] of [
 ['Electivire', 'Galvanic Spirit', 'Vital Spirit'], ['Magmortar', 'Blast Chamber', 'Vital Spirit'],
 ['Scolipede', 'Last Brood', 'Swarm'], ['Scolipede-Mega', 'Venom Bastion', 'Stamina'],
 ['Eelektross', 'Current Coil', 'Swift Swim'], ['Eelektross-Mega', 'Storm Circuit', 'Current Coil'],
 ['Seviper', 'Black Viper', 'Whiplash'], ['Goodra', 'Toxic Serenity', 'Poison Heal'],
 ['Mudsdale', 'Mud Temper', 'Battle Armor'], ['Drednaw', 'River Shell', 'Shell Armor'],
 ['Quagsire', 'Stillwater', 'Water Absorb'], ['Ferrothorn', 'Barb Harvest', 'Iron Barbs'],
]) {
 const p = Dex.species.get(species);
 assert(Object.values(p.abilities).includes(ability),`${species} assignment`);
 assert(Dex.hasAbilityEffect(p, component),`${species} component`);
 assert(BattlePokemonSearch.prototype.filter.call({dex:Dex}, ['pokemon',p.id], [['ability',component]]));
 assert(Dex.abilities.get(ability).desc.length > 30);
}
assert(!Dex.hasAbilityEffect(Dex.species.get('Scolipede-Mega'),'Merciless'));
assert(!Dex.getAbilityEffects('territorial').has('toughclaws'));
assert.equal(Dex.species.get('Mudsdale').abilities.H,'Inner Focus');
for (const [species, ability, component] of [
 ['Seviper-Mega','Sirius','Black Viper'], ['Rhyperior','Quarry Cannon','Solid Rock'],
 ['Mamoswine','Tundra March','Oblivious'], ['Jellicent','Undertow','Water Absorb'],
 ['Incineroar','Ringmaster','Tough Claws'], ['Mudsdale','Unyielding','Stamina'],
]) {
 const p = Dex.species.get(species);
 assert(Object.values(p.abilities).includes(ability));
 assert(Dex.hasAbilityEffect(p, component));
 assert(BattlePokemonSearch.prototype.filter.call({dex:Dex}, ['pokemon',p.id], [['ability',component]]));
}
for (const [species,ability] of [['Weavile','Cold Open'],['Eelektross','Vital Circuit'],['Jellicent','Deadwater'],
 ['Rillaboom','Primal Rhythm'],['Cinderace','Set Piece'],['Inteleon','Calculated Shot'],['Meowscarada','False Bouquet']]) {
 assert(Object.values(Dex.species.get(species).abilities).includes(ability));
 assert(Dex.abilities.get(ability).desc.length > 30);
}
assert(!Dex.getAbilityEffects('hydratyrant').has('selfsufficient'));
assert(!Dex.getAbilityEffects('lunardread').has('unaware'));
assert.equal(Dex.species.get('Mienshao').abilities.H, 'Meridian Seal');
assert.equal(Dex.species.get('Baxcalibur').abilities[1], 'Rimeplate');
assert.equal(Dex.species.get('Hydreigon').abilities[0], 'Levitate');
assert.equal(Dex.species.get('Hydreigon').abilities[1], 'Dark Dominion');
assert(Dex.getAbilityEffects('darkdominion').has('darkaura'));
Object.assign(global,require(path.join(root,'data/moves.js')));
Object.assign(global,require(path.join(root,'data/items.js')));
const {BattleTooltips, ModifiableValue} = new Function(fs.readFileSync(path.join(root,'js/battle-tooltips.js'),'utf8')+
 '\nreturn {BattleTooltips, ModifiableValue};')();
const battle = {gen:9,weather:'',hasPseudoWeather:()=>false,gameType:'doubles',sides:[],rules:{}};
const pokemon = {ability:'Tidal Voice',effectiveAbility:()=> 'Tidal Voice',status:'',volatiles:{},
 hp:100,maxhp:100,boosts:{},side:{active:[],foe:{active:[]},faintCounter:0}};
const serverPokemon = {ability:'Tidal Voice',item:'',speciesForme:'Primarina',stats:{atk:100,def:100,spa:100,spd:100,spe:100}};
const tooltip = {battle,calculateModifiedStats:()=>serverPokemon.stats,
 getItemBoost:(_move,value)=>value,getAllyAbility:()=>'',getPokemonTypes:()=>['Water','Fairy']};
let value = new ModifiableValue(battle,pokemon,serverPokemon);
value = BattleTooltips.prototype.getMoveBasePower.call(tooltip,Dex.moves.get('Sparkling Aria'),'Water',value);
assert.equal(value.value,117,'90 BP Sparkling Aria receives exactly 1.3x before field/STAB modifiers');
assert(value.comment.some(text=>text.includes('Tidal Voice')));
console.log('PASS: client slots, BSTs, descriptions, component filters, instant results and ability-name search.');
console.log('PASS: Sparkling Aria tooltip shows 117 effective power and credits Tidal Voice.');
pokemon.ability = 'Primal Rhythm';
pokemon.effectiveAbility = () => 'Primal Rhythm';
pokemon.getTypeList = () => ['Grass'];
serverPokemon.ability = 'Primal Rhythm';
value = new ModifiableValue(battle,pokemon,serverPokemon);
assert.equal(BattleTooltips.prototype.getMoveType.call(tooltip,Dex.moves.get('Boomburst'),value)[1],'Physical');
console.log('PASS: Primal Rhythm shows physical Boomburst in the client tooltip.');

// Compare the complete synchronized roster against the authoritative server data.
const ServerDex = require('../dist/sim/dex').Dex;
const {RosterExpansionDescriptions} = require('../dist/data/roster-expansion-text');
const {AbilityComponents} = require('../dist/data/ability-components');
const syncSource = fs.readFileSync(path.join(__dirname, 'sync-approved-roster-client.cjs'), 'utf8');
const syncedSpecies = syncSource.match(/const ids='([^']+)'/)[1].split(' ');
const syncedAbilities = new Set([...Object.keys(RosterExpansionDescriptions),
 ...syncSource.match(/const previous='([^']+)'/)[1].split(' ')]);
for (const id of syncedSpecies) {
 const server = ServerDex.species.get(id), clientSpecies = Dex.species.get(id);
 assert.deepEqual(clientSpecies.baseStats, server.baseStats, id + ' stats sync');
 assert.deepEqual(clientSpecies.abilities, server.abilities, id + ' abilities sync');
}
for (const id of syncedAbilities) {
 assert.equal(Dex.abilities.get(id).desc, ServerDex.abilities.get(id).desc, id + ' description sync');
}
for (const [id, components] of Object.entries(AbilityComponents)) {
 const ability = ServerDex.abilities.get(id);
 if (!ability.exists || ability.id !== id) continue; // Retired IDs and aliases have no separate client definition.
 for (const component of components) assert(Dex.getAbilityEffects(id).has(component), id + ': ' + component);
}
console.log('PASS: complete sync for ' + syncedSpecies.length + ' profiles, ' + syncedAbilities.size + ' abilities and canonical component mappings.');
