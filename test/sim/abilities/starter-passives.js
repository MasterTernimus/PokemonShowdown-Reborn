'use strict';
const assert=require('assert').strict, common=require('../../common');
const {Dex,Teams}=require('../../../dist/sim');
const {StarterPassives,ProficientPassiveForms}=require('../../../dist/data/starter-passives');
let battle;
function start(species='Charizard',ability='No Ability',foe='No Ability') {
 battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species,ability,moves:['flamethrower','splash']},{species:'Mew',ability:'No Ability',moves:['splash']}],[{species:'Mew',ability:foe,moves:['splash']},{species:'Mew',ability:'No Ability',moves:['splash']}]]);
 battle.makeChoices('team 12','team 12');battle.field.terrain='';
 return [battle.p1.active[0],battle.p2.active[0]];
}
function event(p,t,event='ModifySpA',move='flamethrower') {return battle.runEvent(event,p,t,battle.dex.getActiveMove(move),100);}
describe('Starter species passives',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('maps all 76 final records and preserves exactly 34 Proficient gimmick records',()=>{
  const {abilityIncludesComponent}=require('../../../dist/data/ability-components');
  for(const id of ProficientPassiveForms)assert(Object.values(Dex.species.get(id).abilities).every(a=>!abilityIncludesComponent(Dex.abilities.get(a).id,'proficient')),id+' chosen abilities must not duplicate Proficient');
  assert.equal(Object.keys(StarterPassives).length,76);assert.equal(ProficientPassiveForms.size,34);
  for(const [id,passives] of Object.entries(StarterPassives)){const s=Dex.species.get(id);assert(s.exists,id);assert.equal(s.id,id);assert.deepEqual(s.passives,passives);assert(!s.evos.length,id);}
  for(const id of ['bulbasaur','ivysaur','charmander','charmeleon','pikachu'])assert.deepEqual(Dex.species.get(id).passives,[]);
 });
 for(const [species,pinch,move] of [['Charizard','Blaze','flamethrower'],['Venusaur','Overgrow','energyball'],['Blastoise','Torrent','surf']]) {
  it(species+' keeps one passive pinch effect through selected ability and suppression',()=>{const[p,t]=start(species);p.hp=1;assert.equal(event(p,t,'ModifySpA',move),150);p.setAbility(pinch);assert.equal(event(p,t,'ModifySpA',move),150);p.addVolatile('gastroacid');assert.equal(event(p,t,'ModifySpA',move),150);assert.deepEqual(p.getPassives(),[pinch.toLowerCase()]);});
 }
 it('preserves a nested active Overgrow component',()=>{const[p,t]=start('Venusaur','Rift Dancer');p.hp=1;assert.equal(event(p,t,'ModifySpA','energyball'),150);});
 for(const id of ProficientPassiveForms)it(id+' retains one Proficient after active ability replacement/suppression',()=>{
  const[p,t]=start(id);if(p.species.id!==id)p.formeChange(id,null,true);p.setType('Normal');assert.equal(event(p,t,'BasePower','tackle'),130);
  p.setAbility('Proficient');assert.equal(event(p,t,'BasePower','tackle'),130);
  p.addVolatile('gastroacid');assert.equal(event(p,t,'BasePower','tackle'),130);
  assert.equal(event(p,t,'BasePower','splash'),100);p.removeVolatile('gastroacid');p.addVolatile('meridianseal');assert.equal(event(p,t,'BasePower','tackle'),130);p.removeVolatile('meridianseal');t.setAbility('Neutralizing Gas');assert.equal(event(p,t,'BasePower','tackle'),130);t.setAbility('Mold Breaker');p.setAbility('Run Away');assert.equal(event(p,t,'BasePower','tackle'),130);
 });
 for(const [species,ability,move,expected] of [['Venusaur-Mega','Toxic Bloom','tackle',130],['Venusaur-Gmax','Ancient Bloom','tackle',130],['Feraligatr-Gmax','Tidal Jaw','tackle',130],['Feraligatr-Gmax','Tidal Jaw','bite',195],['Charizard-Mega-X','Atrocity','swift',169]])it(species+' '+ability+' preserves independent multipliers',()=>{
  const[p,t]=start(species,ability);p.setType(move==='bite'?'Dark':'Normal');assert.equal(event(p,t,'BasePower',move),expected);
 });
 it('ordinary shared-ability users retain active Proficient without a new passive',()=>{
  const[p,t]=start('Charizard','Unbound Blaze');p.setType('Normal');assert.deepEqual(p.getPassives(),['blaze']);assert.equal(event(p,t,'BasePower','tackle'),130);
  p.addVolatile('gastroacid');assert.equal(event(p,t,'BasePower','tackle'),100);
 });
 it('copying an exclusive composite does not copy the species passive',()=>{const[p,t]=start('Mew','Toxic Bloom');p.setType('Normal');assert.equal(event(p,t,'BasePower','tackle'),100);assert.deepEqual(p.getPassives(),['synchronize']);});
 it('Transform follows target form, resets on switching, and copying an ability never copies passives',()=>{
  const[p,t]=start('Charizard');t.formeChange('Venusaur-Mega',null,true);assert(p.transformInto(t));assert.deepEqual(p.getPassives(),['proficient']);
  battle.makeChoices('switch 2','move splash');battle.makeChoices('switch 2','move splash');assert.deepEqual(p.getPassives(),['blaze']);
  t.formeChange('Mew',null,true);t.setAbility('Blaze');assert.deepEqual(t.getPassives(),['synchronize']);
 });
 it('mechanical form changes add and remove Proficient; Illusion copies disguise passives without exposing the actual form',()=>{
  const[p,t]=start('Charizard');p.illusion=t;assert.deepEqual(p.getPassives(),['synchronize']);assert.deepEqual(p.getSwitchRequestData().passives,['synchronize']);
  p.illusion=null;p.formeChange('Charizard-Mega-X',null,true);p.illusion=t;assert.deepEqual(p.getPassives(),['synchronize']);assert.deepEqual(p.getSwitchRequestData().passives,['synchronize']);p.setType('Normal');const disguisedPower=event(p,t,'BasePower','tackle');p.illusion=null;assert.equal(event(p,t,'BasePower','tackle'),220);assert.equal(disguisedPower,169); // Atrocity's independent 1.3 and contact 1.3 also apply.
  p.formeChange('Charizard',null,true);assert.deepEqual(p.getPassives(),['blaze']);
  assert(!battle.log.some(line=>line.includes('|-ability|')&&line.includes('Proficient')));
 });
 it('Greninja Bond to Ash gains Proficient immediately',()=>{const[p]=start('Greninja-Bond','Battle Bond');assert.deepEqual(p.getPassives(),['proficient']);p.formeChange('Greninja-Ash',null,true);assert.deepEqual(p.getPassives(),['proficient']);});
 it('preserves custom field conditions, including broad Grassy Terrain Overgrow',()=>{
  const[p,t]=start('Venusaur','Overgrow');battle.field.setTerrain('grassyterrain',p);assert.equal(event(p,t,'ModifySpA','flamethrower'),150);
  p.formeChange('Charizard',null,true);p.setAbility('Blaze');battle.field.setTerrain('burningterrain',p);assert.equal(event(p,t),150);assert.equal(event(p,t,'ModifySpA','surf'),100);
  p.hp=1;battle.field.setTerrain('coldeclipseterrain',p);assert.equal(event(p,t),100);
  p.formeChange('Blastoise',null,true);p.setAbility('Torrent');p.hp=p.maxhp;battle.field.setTerrain('midnightzoneterrain',p);assert.equal(event(p,t,'ModifySpA','surf'),150);
 });
 it('keeps ordinary team serialization and calculator species metadata in sync',()=>{
  const team=Teams.import('Charizard\nAbility: Solar Power\n- Flamethrower');assert.equal(Teams.unpack(Teams.pack(team))[0].ability,'Solar Power');assert(!Teams.pack(team).includes('Blaze'));
  const metadata=require('../../../dist/sim/custom-calculator').calculatorMetadata();for(const [id,passives] of Object.entries(StarterPassives))assert.deepEqual(metadata.species.find(s=>Dex.species.get(s.name).id===id).passives,passives,id);
 });
 it('deduplicates Perfect Foresight copied components without replaying entry events',()=>{
  const[p,t]=start('Charizard-Mega-X','Perfect Foresight');p.m.perfectForesightAbility='proficient';p.m.perfectForesightAbilityState={id:'proficient',target:p};p.setType('Normal');assert.equal(event(p,t,'BasePower','tackle'),130);
  p.m.perfectForesightAbility='blaze';p.hp=1;assert.equal(event(p,t),150);p.addVolatile('gastroacid');assert.equal(event(p,t),100);
 });
 it('Skill Swap and Role Play change only active ability',()=>{
  const[p,t]=start('Charizard','Run Away');t.setAbility('Water Absorb');battle.actions.useMove('skillswap',p,{target:t});assert.equal(p.ability,'waterabsorb');assert.deepEqual(p.getPassives(),['blaze']);assert.deepEqual(t.getPassives(),['synchronize']);
  battle.actions.useMove('roleplay',t,{target:p});assert.deepEqual(t.getPassives(),['synchronize']);
 });
 it('preserves current-type Proficient and excludes off-type moves',()=>{
  const[p,t]=start('Charizard-Mega-X');p.setType('Water');assert.equal(event(p,t,'BasePower','surf'),130);assert.equal(event(p,t,'BasePower','flamethrower'),100);
 });
 for(const id of ProficientPassiveForms)it(id+' calculator damage matches copied active Proficient without stacking',()=>{
  const {calculateScenario}=require('../../../dist/sim/custom-calculator');const input={format:'gen9nofieldsinglesgame',move:'Tera Blast',samples:8,seed:42,actors:Array.from({length:4},()=>({species:'Mew',ability:'No Ability'}))};
  input.actors[0]={species:Dex.species.get(id).name,ability:'No Ability',teraType:'Normal',gimmick:'tera'};const result=calculateScenario(input);input.actors[0].ability='Proficient';assert.deepEqual(calculateScenario(input).results,result.results);
 });
 it('calculator runs real Mega/Gmax transitions and matches equivalent active Proficient damage once',()=>{
  const {calculateScenario,validateScenario,buildCalculatorBattle}=require('../../../dist/sim/custom-calculator');
  const input={format:'gen9nofieldsinglesgame',move:'Flamethrower',samples:8,seed:42,actors:Array.from({length:4},()=>({species:'Mew',ability:'No Ability'}))};
  input.actors[0]={species:'Charizard-Mega-X',ability:'No Ability',hpPercent:25};const plain=calculateScenario(input);
  input.actors[0].ability='Proficient';assert.deepEqual(calculateScenario(input).results,plain.results);
  input.actors[0]={species:'Charizard',ability:'No Ability',item:'Charizardite X',gimmick:'mega'};
  const {battle:calc}=buildCalculatorBattle(validateScenario(input),0);assert.deepEqual(calc.p1.active[0].getPassives(),['proficient']);calc.destroy();
  input.format='gen9factoryfield';input.actors[0]={species:'Charizard',ability:'No Ability',gimmick:'gmax'};const {battle:gmax}=buildCalculatorBattle(validateScenario(input),0);assert.equal(gmax.p1.active[0].species.id,'charizardgmax');assert.deepEqual(gmax.p1.active[0].getPassives(),['proficient']);gmax.destroy();
 });
});
