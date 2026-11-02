'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

describe('Dragon’s Den field revisions', () => {
 let battle;
 const mon = (ability = 'No Ability') => ({species: 'Mew', ability, moves: ['splash', 'surf', 'scaleshot', 'ficklebeam']});
 function start(doubles = false) {
  const team = [mon(), mon(), mon()];
  battle = common.createBattle({formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame'}, [team, team]);
  battle.makeChoices('team 123', 'team 123');
  const user = battle.p1.active[0];
  battle.field.setTerrain('dragonsdenterrain', user, Dex.moves.get('splash'));
  return [user, battle.p2.active[0]];
 }
 afterEach(() => battle?.destroy());
 it('blocks new hail, forced hail and Snowscape while ordinary Rock attacks have neutral power', () => {
  const [user, foe] = start();
  assert.equal(battle.field.setWeather('hail', user), false);
  assert.equal(battle.field.changeWeather('hail', user), false);
  assert.equal(Dex.moves.get('snowscape').onHitField.call(battle, battle.field, user, Dex.getActiveMove('snowscape')), false);
  assert.equal(battle.runEvent('BasePower', user, foe, Dex.getActiveMove('rockslide'), 100), 100);
  assert.equal(battle.runEvent('BasePower', user, foe, Dex.getActiveMove('powergem'), 100), 150);
 });
 it('neutralizes only Steel-contributed weaknesses for Good as Gold', () => {
  const [,target] = start();
  target.setAbility('Good as Gold');
  target.setType(['Steel', 'Grass']);
  assert.equal(target.runEffectiveness(Dex.getActiveMove('flamethrower')), 1);
  assert.equal(target.runEffectiveness(Dex.getActiveMove('earthquake')), -1);
 });
 it('resolves one 50% roll for Fickle Beam with Worldbreaker or Expiration', () => {
  const [user, foe] = start();
  for (const ability of ['Worldbreaker','Expiration']) {
   user.setAbility(ability);
   const rolls = [];
   battle.randomChance = (n,d) => {rolls.push([n,d]);return false;};
   const move = Dex.getActiveMove('ficklebeam');
   battle.singleEvent('BasePower', move, {}, user, foe, move, 100);
   battle.runEvent('BasePower', user, foe, move, 100);
   assert.deepEqual(rolls, [[5,10]], ability);
  }
 });
 it('preserves Scale Shot Defense and gives a Dragon ally three crit stages', () => {
  const [user] = start(true), ally = battle.p1.active[1], move = Dex.getActiveMove('scaleshot');
  battle.runEvent('ModifyMove',user,battle.p2.active[0],move,move);
  assert.deepEqual(move.selfBoost.boosts,{spe:1});
  ally.setType('Dragon');
  ally.addVolatile('dragoncheer', user, Dex.moves.get('dragoncheer'));
  assert.equal(battle.runEvent('ModifyCritRatio',ally,null,Dex.getActiveMove('tackle'),0),3);
 });
 it('Berserk grants two Special Attack stages only after the threshold hit', () => {
  const [holder, foe] = start();
  holder.setAbility('Berserk');
  assert.equal(holder.boosts.atk + holder.boosts.spa,0);
  const move = Object.assign(Dex.getActiveMove('tackle'), {damage: Math.ceil(holder.maxhp * 0.6), accuracy:true});
  battle.actions.useMove(move,foe,{target:holder});
  assert.equal(holder.boosts.atk,0);
  assert.equal(holder.boosts.spa,2);
 });
 it('Tyrant Domain protects the Den and lowers each foe once per entry', () => {
  const [holder] = start(true);
  holder.setAbility('Tyrant Domain');
  battle.singleEvent('Start',holder.getAbility(),holder.abilityState,holder);
  for(const foe of battle.p2.active) assert.deepEqual([foe.boosts.def,foe.boosts.spd],[-1,-1]);
  assert.equal(battle.p1.active[1].boosts.def,0);
  assert.equal(battle.field.changeTerrain('caveterrain',holder),false);
  assert.equal(battle.field.clearTerrain(),false);
  holder.setAbility('No Ability');
  assert(battle.field.changeTerrain('caveterrain',holder));
 });
 it('announces cooling progress before the Den becomes Cave', () => {
  const [user,foe] = start(), move = Dex.getActiveMove('surf');
  for(let i=0;i<3;i++) battle.runEvent('AfterMove',user,foe,move);
  assert.equal(battle.field.terrain,'caveterrain');
  assert.equal(battle.log.filter(line=>line.includes('lava began to harden')).length,2);
 });
});
