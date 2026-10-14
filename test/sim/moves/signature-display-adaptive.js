'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim/dex');
const {SignatureMoveSummaries} = require('../../../dist/data/signature-move-summaries');

describe('Signature move descriptions and adaptive Spectral Scream', () => {
 let battle;
 afterEach(() => battle?.destroy());
 it('keeps all 47 rows compact with plain credits and full field details', () => {
  assert.equal(Object.keys(SignatureMoveSummaries).length, 47);
  for (const id of Object.keys(SignatureMoveSummaries)) {
   const move = Dex.moves.get(id);
   assert(move.shortDesc.length <= 90, id);
   assert(move.desc.includes("'s move."), id);
   assert(!/inspired by|custom implementation|undefined/i.test(move.desc + move.shortDesc), id);
  }
  assert(Dex.moves.get('airstreamassault').desc.includes('6 turns'));
  assert(Dex.moves.get('corrosivestrike').desc.startsWith("Corey's move."));
 });
 for (const [atk, spa, boost, expected] of [[200,100,0,'Physical'],[100,200,0,'Special'],[100,100,0,'Special'],[200,100,3,'Special']]) {
  it(`Spectral Scream selects ${expected} with ${atk}/${spa}, +${boost} SpA and retains drain`, () => {
   battle=common.createBattle({}, [[{species:'Mew',ability:'No Ability',moves:['spectralscream']}], [{species:'Mew',ability:'No Ability',moves:['splash']}]]);
   const p=battle.p1.active[0], q=battle.p2.active[0];
   p.storedStats.atk=atk; p.storedStats.spa=spa; p.boosts.spa=boost;
   p.hp=100; p.maxhp=1000; q.hp=q.maxhp=2000;
   const move=battle.dex.getActiveMove('spectralscream'); move.willCrit=false;
   battle.actions.useMove(move,p,{target:q});
   assert.equal(battle.activeMove.category,expected);
   assert.equal(p.hp-100,Math.round((2000-q.hp)/4));
   assert.equal(battle.activeMove.flags.sound,1);
  });
 }
});
