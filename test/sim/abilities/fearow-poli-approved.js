'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim/dex');
describe('Approved Fearow and Poliwrath refinements', () => {
 let battle;
 afterEach(() => { battle?.destroy(); });
 function setup(item = '', ability = 'No Ability') {
  battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [
   [{species: 'Fearow', ability: 'Lance Point', item, moves: ['drillpeck']}, {species: 'Mew', ability: 'No Ability', moves: ['splash']}],
   [{species: 'Blissey', ability, moves: ['splash']}, {species: 'Mew', ability: 'No Ability', moves: ['splash']}],
  ]);
  battle.makeChoices('team 1, 2', 'team 1, 2');
  return battle.p1.active[0];
 }
 function modified(id, p) {const m=battle.dex.getActiveMove(id);return battle.runEvent('ModifyMove',p,battle.p2.active[0],m,m);}
 it('loads exact approved species, independent ability alternatives, and selective moves', () => {
  const p=Dex.species.get('Poliwrath'), f=Dex.species.get('Fearow');
  assert.deepEqual(p.baseStats,{hp:100,atk:100,def:100,spa:95,spd:90,spe:75});
  assert.deepEqual(p.abilities,{0:'Reservoir',1:'Knuckle Tide',H:'Crosscurrent'});
  assert.deepEqual(f.baseStats,{hp:80,atk:125,def:80,spa:45,spd:80,spe:125});
  assert.deepEqual(f.types,['Normal','Flying']);
  assert.deepEqual(f.abilities,{0:'Lance Point',H:'Sniper'});
  for(const id of ['hyperdrill','swordsdance','taunt']) assert(Dex.species.getLearnsetData('fearow').learnset[id].length);
  const bird=setup(); assert(bird.hasAbility('Keen Eye')); assert(!bird.hasAbility('Sniper'));
 });
 it('adds one drill crit stage and removes contact only from drill attacks', () => {
  const p=setup();
  for(const id of ['drillpeck','drillrun']) {const m=modified(id,p);assert.equal(m.critRatio,3);assert(!m.flags.contact);assert(m.ignoreEvasion);}
  assert.equal(modified('hyperdrill',p).critRatio,2);
  const m=modified('bravebird',p);assert.equal(m.critRatio,1);assert(m.flags.contact);assert(m.ignoreEvasion);
 });
 it('stacks Scope Lens normally and still respects Battle Armor', () => {
  const p=setup('Scope Lens','Battle Armor'), foe=battle.p2.active[0];
  const m=modified('drillpeck',p);
  assert.equal(battle.runEvent('ModifyCritRatio',p,foe,m,m.critRatio),4);
  battle.actions.useMove('drillpeck',p,{target:foe});
  assert(!battle.log.some(line=>line.startsWith('|-crit|')));
  foe.setAbility('No Ability');
  battle.actions.useMove('drillpeck',p,{target:foe});
  assert(battle.log.some(line=>line.startsWith('|-crit|')));
 });
 it('keeps Keen Eye accuracy protection and Mirror Arena entry effects', () => {
  const p=setup();
  battle.boost({accuracy:-1},p,battle.p2.active[0],battle.dex.moves.get('sandattack'));
  assert.equal(p.boosts.accuracy,0);
  const previous=battle.field.isTerrain;
  battle.field.isTerrain=id=>id==='mirrorarenaterrain';
  battle.singleEvent('Start',p.getAbility(),p.abilityState,p);
  battle.field.isTerrain=previous;
  assert.equal(p.boosts.accuracy,1);assert(p.volatiles.laserfocus);
 });
 it('avoids contact punishment for drills but retains it on other contact moves', () => {
  const p=setup('', 'Rough Skin'), foe=battle.p2.active[0]; foe.storedStats.def=500;
  const hp=p.hp; battle.actions.useMove('drillpeck',p,{target:foe});assert.equal(p.hp,hp);
  battle.actions.useMove('peck',p,{target:foe});assert(p.hp<hp);
 });
});
