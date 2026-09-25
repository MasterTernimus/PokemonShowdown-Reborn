'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
function singles(species, item = '', ability = 'No Ability', moves = ['splash']) {
 battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[{species, item, ability, moves}], [{species: 'Mew', ability: 'No Ability', moves: ['splash', 'flamethrower']}]]);
 battle.makeChoices('team 1', 'team 1'); return battle.p1.active[0];
}
describe('Aura, Mega Stone and Sacred Bond audit fixes', () => {
 afterEach(() => { battle?.destroy(); battle = null; });
 for (const [species, item] of [['Venusaur', 'Charizardite X'], ['Gardevoir', 'Banettite'], ['Ampharos-Aevian', 'Venusaurite']]) {
  it(species + ' rejects unrelated ' + item, () => {
   const p = singles(species, item);
   assert(!p.canMegaEvo); assert(!p.canMegaEvoX); assert(!p.canMegaEvoY);
  });
 }
 for (const [base, item] of [['Gyarados', 'Gyaradosite'], ['Ampharos', 'Ampharosite'], ['Glalie', 'Glalitite'], ['Froslass', 'Froslassite'], ['Golisopod', 'Golisopite'], ['Glimmora', 'Glimmoranite']]) {
  for (const species of [base, base + '-Aevian']) it(species + ' uses its matching Mega with ' + item, () => {
   const p = singles(species, item);
   assert.equal(p.canMegaEvo, species + '-Mega');
   battle.makeChoices('move splash mega', 'move splash');
   assert.equal(p.species.name, species + '-Mega');
  });
 }
 for (const ability of ['Perfect Foresight', 'Royal Voice']) for (const aura of [true, false]) {
  it(ability + ' prefers active Telepathy with Psychic Aura=' + aura, () => {
   battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[{species:'Alakazam',ability:'No Ability',moves:['splash']},{species:'Mew',ability:'No Ability',moves:['splash']}],[{species:'Gardevoir',ability:'Telepathy',moves:['splash']},{species:'Mewtwo',ability:'Pressure',moves:['splash']}]]);
   battle.makeChoices('team 12','team 12'); const p=battle.p1.active[0];
   battle.field.startTerrain(aura ? 'rockyterrain' : 'psychicterrain');
   if(aura) battle.field.setAura('psychicterrain',5,p,battle.dex.moves.get('psychicterrain'));
   p.setAbility(ability); assert.equal(p.m.perfectForesightAbility,'telepathy');
  });
 }
 it('prefers active Swift Swim in Midnight Zone', () => {
  battle = common.createBattle({formatid:'gen9nofielddoublesbattle'}, [[{species:'Alakazam',ability:'No Ability',moves:['splash']},{species:'Mew',ability:'No Ability',moves:['splash']}],[{species:'Magikarp',ability:'Swift Swim',moves:['splash']},{species:'Mewtwo',ability:'Pressure',moves:['splash']}]]);
  battle.makeChoices('team 12','team 12'); battle.field.startTerrain('midnightzoneterrain');
  const p=battle.p1.active[0]; p.setAbility('Perfect Foresight'); assert.equal(p.m.perfectForesightAbility,'swiftswim');
 });
 it('Sacred Bond absorbs Fire and boosts Fire attacks without Brute Force or extra STAB', () => {
  const p=singles('Arcanine-Battle-Bond','','Sacred Bond'); const foe=battle.p2.active[0];
  assert(p.hasAbility('flashfire')); assert(!p.hasAbility('bruteforce'));
  const fire=battle.dex.getActiveMove('flamethrower'), water=battle.dex.getActiveMove('surf');
  assert.equal(battle.runEvent('BasePower',p,foe,fire,100),100);
  assert.equal(battle.runEvent('ModifySTAB',p,foe,fire,1.5),1.5);
  assert.equal(battle.runEvent('ModifySTAB',p,foe,water,1),1);
  const hp=p.hp; battle.makeChoices('move splash','move flamethrower');
  assert.equal(p.hp,hp); assert(p.volatiles.flashfire);
  assert.equal(battle.runEvent('ModifySpA',p,foe,fire,100),150);
  assert.equal(battle.runEvent('ModifySpA',p,foe,water,100),100);
  p.setAbility('No Ability',null,null,true); assert(!p.volatiles.flashfire);
 });
 it('Sacred Bond activates Flash Fire on Burning Field', () => {
  const p=singles('Arcanine-Battle-Bond','','Sacred Bond'); battle.field.startTerrain('burningterrain');
  battle.makeChoices('move splash','move splash'); assert(p.volatiles.flashfire);
 });
});
