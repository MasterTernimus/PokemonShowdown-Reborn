'use strict';
const assert = require('assert').strict;
const {Battle, Dex} = require('../../../dist/sim');
const {AbilityComponents} = require('../../../dist/data/ability-components');
const selected = {
 braviary: {0:'Contrary',1:'Unova Vanguard',H:'Defiant'},
 braviaryhisui: {0:'Hisuian Vanguard',1:'Sheer Force',H:'Tinted Lens'},
 mandibuzz: {0:'Scavenger',1:'Stamina',H:'Carrion Watch'},
 scrafty: {0:'Shed Skin',1:'Moxie',H:'Intimidate'},
};
describe('Explicit Braviary, Mandibuzz and Scrafty Rivalry passives', () => {
 for (const [id, abilities] of Object.entries(selected)) {
  it(id + ' has one Rivalry passive with unchanged selected abilities', () => {
   const s = Dex.species.get(id);
   assert.deepEqual(s.passives,['rivalry']);
   assert.deepEqual(s.abilities,abilities);
   assert(!Object.values(s.abilities).includes('Rivalry'));
  });
  it(id + ' supplies exactly one Rivalry power boost in battle', () => {
   const b = new Battle({formatid:'gen9nofieldsinglesgame',p1:{name:'A',team:[{species:id,ability:abilities[0],moves:['splash']}]},p2:{name:'B',team:[{species:'Mew',ability:'No Ability',moves:['splash']}]}});
   try {
    if (b.requestState === 'teampreview') b.makeChoices('team 1','team 1');
    const p = b.p1.active[0], q = b.p2.active[0];
    assert.deepEqual(p.getPassives(),['rivalry']);
    // Remove selected offensive effects so this check isolates the species passive.
    p.setAbility('No Ability');
    assert.equal(b.runEvent('BasePower',p,q,Dex.getActiveMove('tackle'),100),130);
   } finally {b.destroy();}
  });
 }
 it('does not distribute to pre-evolutions or Scrafty Mega', () => {
  for (const id of ['rufflet','vullaby','scraggy']) assert(!Dex.species.get(id).passives.includes('rivalry'),id);
  assert.deepEqual(Dex.species.get('scraftymega').passives,['shedskin']);
 });
 it('gives non-Mega Mightyena Rivalry while preserving selected slots and both Megas', () => {
  for (const id of ['mightyena','mightyenagrim','mightyenadeso']) {
   assert.deepEqual(Dex.species.get(id).passives,['rivalry']);
   assert.deepEqual(Dex.species.get(id).abilities,{0:'Intimidate',1:'Black Fang',H:'Stakeout'});
  }
  for (const id of ['mightyenamega','mightyenamegagrim']) {
   assert.deepEqual(Dex.species.get(id).passives,['darkaura']);
   assert.deepEqual(Dex.species.get(id).abilities,{0:'Dread Dominion'});
  }
  assert.deepEqual(AbilityComponents.dreaddominion,['hydrabond','moxie','intimidate']);
 });
});
