'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
function setup(species, ability = 'No Ability') {
 const mon = (species, ability) => ({species, ability, moves:['splash']});
 battle = common.createBattle({formatid:'gen9nofieldsinglesgame'}, [[mon(species,ability),mon('Mew','No Ability')],[mon('Mew','No Ability'),mon('Mew','No Ability')]]);
 battle.makeChoices('team 12','team 12');
 return battle.p1.active[0];
}
const update = () => battle.eachEvent('Update');
describe('Starter boost indicators', () => {
 afterEach(() => battle?.destroy());
 for (const [species,id] of [['Charizard','blaze'],['Blastoise','torrent'],['Venusaur','overgrow']]) {
  it(id+' tracks HP, healing, switching and passive suppression without changing the selected ability', () => {
   const p=setup(species); const ability=p.ability;
   assert(!p.volatiles[id+'active']); p.hp=Math.floor(p.maxhp/3);update();
   assert(p.volatiles[id+'active']); const messages=()=>battle.log.filter(x=>x.includes(' is active!')).length;
   const count=messages();update();update();assert.equal(messages(),count);assert.equal(p.ability,ability);
   p.addVolatile('gastroacid');update();assert(p.volatiles[id+'active']);
   p.hp=p.maxhp;update();assert(!p.volatiles[id+'active']);
   p.hp=1;update();assert.equal(messages(),count+1);
   battle.makeChoices('switch 2','move splash');assert(!p.volatiles[id+'active']);
   battle.makeChoices('switch 2','move splash');assert(p.volatiles[id+'active']);
  });
 }
 it('tracks field activation, Cold Eclipse exclusion and lost passive on Mega evolution', () => {
  const p=setup('Charizard');battle.field.setTerrain('burningterrain',p);update();assert(p.volatiles.blazeactive);
  p.hp=1;battle.field.setTerrain('coldeclipseterrain',p);update();assert(!p.volatiles.blazeactive);
  battle.field.clearTerrain();update();assert(p.volatiles.blazeactive);
  p.formeChange('Charizard-Mega-X',null,true);p.setAbility('No Ability');update();assert(!p.volatiles.blazeactive);
 });
 it('tracks Torrent water fields and removal at full HP', () => {
  const p=setup('Blastoise');battle.field.setTerrain('watersurfaceterrain',p);update();assert(p.volatiles.torrentactive);
  battle.field.clearTerrain();update();assert(!p.volatiles.torrentactive);
 });
 it('tracks Flower Garden thresholds', () => {
  const p=setup('Venusaur');battle.field.flowerGardenStage=()=>2;update();assert(!p.volatiles.overgrowactive);
  p.hp=Math.floor(p.maxhp*2/3);update();assert(p.volatiles.overgrowactive);
  p.hp=p.maxhp;battle.field.flowerGardenStage=()=>4;update();assert(p.volatiles.overgrowactive);
  battle.field.flowerGardenStage=()=>0;update();assert(!p.volatiles.overgrowactive);
 });
 it('respects suppression for selected abilities without native passives', () => {
  const p=setup('Mew','Blaze');p.hp=1;update();assert(p.volatiles.blazeactive);
  p.addVolatile('gastroacid');update();assert(!p.volatiles.blazeactive);
  p.removeVolatile('gastroacid');update();assert(p.volatiles.blazeactive);
 });
});
