'use strict';
const assert = require('assert').strict;
const common = require('../../common');
describe('Gilded Grace', () => {
 let battle;
 afterEach(() => battle?.destroy());
 function setup(ffa = false) {
  const p = {species: 'Persian', ability: 'Gilded Grace', moves: ['makeitrain', 'overheat', 'splash']};
  const t = {species: 'Blissey', ability: 'No Ability', moves: ['splash', 'confide', 'skillswap']};
  const teams = ffa ? [[p,p],[t,t],[t,t],[t,t]] : [[p,p],[t,t]];
  battle = common.createBattle({formatid: ffa ? 'gen9freeforall4pmistyfieldadrienn' : 'gen9nofieldsinglesgame'}, teams);
  battle.makeChoices(...teams.map(() => 'team 12'));
  battle.randomChance = (n,d) => n >= d;
  battle.randomizer = x => x;
  return [battle.p1.active[0], battle.p2.active[0]];
 }
 function attack(p,t,id) {
  const m = battle.dex.getActiveMove(id);
  Object.assign(m, {accuracy: true, basePower: 1, willCrit: false});
  battle.actions.runMove(m,p,p.getLocOf(t));
 }
 it('prevents one spread Make It Rain drop, then permits the next', () => {
  const [p,t] = setup(true);
  attack(p,t,'makeitrain'); assert.equal(p.boosts.spa,0); assert(p.m.gildedGraceUsed);
  assert.equal(battle.log.filter(l => l.includes('|-activate|') && l.includes('Gilded Grace')).length,1);
  attack(p,t,'makeitrain'); assert.equal(p.boosts.spa,-1);
 });
 it('prevents the entire two-stage Overheat drop', () => {
  const [p,t] = setup(); attack(p,t,'overheat'); assert.equal(p.boosts.spa,0);
  attack(p,t,'overheat'); assert.equal(p.boosts.spa,-2);
 });
 it('ignores opposing drops and self status-move drops', () => {
  const [p,t] = setup();
  battle.boost({spa:-1},p,t,battle.dex.getActiveMove('confide'));
  battle.boost({spa:-1},p,p,battle.dex.getActiveMove('confide'));
  assert.equal(p.boosts.spa,-2); assert(!p.m.gildedGraceUsed);
  attack(p,t,'overheat'); assert.equal(p.boosts.spa,-2); assert(p.m.gildedGraceUsed);
 });
 it('does not consume at the stat floor', () => {
  const [p,t] = setup(); p.boosts.spa=-6; attack(p,t,'overheat');
  assert(!p.m.gildedGraceUsed); p.boosts.spa=0; attack(p,t,'overheat'); assert.equal(p.boosts.spa,0);
 });
 it('does not refresh after suppression or ability replacement', () => {
  const [p,t] = setup(); attack(p,t,'overheat');
  p.addVolatile('gastroacid'); attack(p,t,'overheat'); assert.equal(p.boosts.spa,-2);
  p.removeVolatile('gastroacid'); p.setAbility('Limber'); p.setAbility('Gilded Grace');
  attack(p,t,'overheat'); assert.equal(p.boosts.spa,-4);
 });
 it('does not spend an unused charge while suppressed', () => {
  const [p,t] = setup(); p.addVolatile('gastroacid'); attack(p,t,'overheat');
  assert.equal(p.boosts.spa,-2); assert(!p.m.gildedGraceUsed);
  p.removeVolatile('gastroacid'); attack(p,t,'overheat'); assert.equal(p.boosts.spa,-2);
 });
 it('real Skill Swap does not refresh but actual switching does', () => {
  const [p,t] = setup(); attack(p,t,'overheat');
  battle.makeChoices('move splash','move skillswap');
  battle.makeChoices('move splash','move skillswap');
  assert(p.hasAbility('gildedgrace')); attack(p,t,'overheat'); assert.equal(p.boosts.spa,-2);
  battle.makeChoices('switch 2','move splash'); battle.makeChoices('switch 2','move splash');
  assert(!p.m.gildedGraceUsed); attack(p,t,'overheat'); assert.equal(p.boosts.spa,0);
 });
});
