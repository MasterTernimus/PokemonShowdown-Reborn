'use strict';
const assert=require('../../assert');
const common=require('../../common');
let battle;
describe('Mega Dusknoir and Reaper\'s Grip',function(){
 afterEach(()=>battle?.destroy());
 function setup(){
  battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Dusknoir',item:'Dusknoirite',ability:'Pressure',moves:['splash']}],[{species:'Mew',ability:'Synchronize',moves:['splash','tackle']}]]);
  battle.makeChoices('team 1','team 1');
  const mon=battle.p1.active[0];
  assert.deepEqual(mon.species.baseStats,{hp:65,atk:120,def:135,spa:70,spd:135,spe:45});
		assert.deepEqual(mon.species.abilities, { 0: 'Requiem', 1: 'Pressure', H: 'Soul Reaver' });
  assert.equal(mon.canMegaEvo,'Dusknoir-Mega');
  battle.makeChoices('move splash mega','move splash');
  return mon;
 }
	it('Mega Evolves with the approved stats, recovery and Haunted Aura', () => {
  const mon=setup(),foe=battle.p2.active[0];
  assert.equal(mon.ability,'reapersgrip');
		assert.deepEqual(mon.species.baseStats, { hp: 65, atk: 165, def: 145, spa: 90, spd: 150, spe: 55 });
		assert(mon.hasAbility('selfsufficient'));
		for (const id of ['unaware', 'darkaura', 'ironfist', 'pressure'])assert(!mon.hasAbility(id));
		assert(battle.field.isAura('hauntedaura'));
		assert.equal(battle.field.terrain, '');
		for (const [source, target] of [[mon, foe], [foe, mon]]) {
			assert.equal(battle.runEvent('BasePower', source, target, battle.dex.getActiveMove('shadowball'), 100), 120);
			assert.equal(battle.runEvent('BasePower', source, target, battle.dex.getActiveMove('darkpulse'), 100), 100);
		}
		mon.hp = 100;
		battle.singleEvent('Residual', mon.getAbility(), mon.abilityState, mon);
		assert.equal(mon.hp, 100 + Math.floor(mon.baseMaxhp / 16));
 });
	it('converts Haunted Aura after an opposing Ghost KO and does not extend an existing field', () => {
		const mon = setup(), foe = battle.p2.active[0], move = battle.dex.getActiveMove('shadowball');
		battle.singleEvent('SourceAfterFaint', mon.getAbility(), mon.abilityState, foe, mon, move, 1);
		assert.equal(battle.field.terrain, 'hauntedterrain');
		assert.equal(battle.field.terrainState.duration, 5);
		assert(!battle.field.isAura('hauntedaura'));
		battle.field.terrainState.duration = 2;
		battle.singleEvent('SourceAfterFaint', mon.getAbility(), mon.abilityState, foe, mon, move, 1);
		assert.equal(battle.field.terrainState.duration, 2);
	});
	it('does not create a field at half HP or when its holder faints', () => {
  const mon=setup(),foe=battle.p2.active[0];
  mon.hp=Math.floor(mon.maxhp/2);
  battle.singleEvent('DamagingHit',mon.getAbility(),mon.abilityState,mon,foe,battle.dex.getActiveMove('tackle'),1);
		assert.equal(battle.field.terrain, '');
  mon.faint();battle.faintMessages();
		assert.equal(battle.field.terrain, '');
 });
});
