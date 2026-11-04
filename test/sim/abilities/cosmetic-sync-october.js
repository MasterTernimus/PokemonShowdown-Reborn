'use strict';
const assert=require('assert').strict,common=require('../../common');
const {Dex}=require('../../../dist/sim/dex');
describe('Approved cosmetic counterpart synchronization',()=>{
 const {CosmeticBattleCounterparts:pairs}=require('../../../dist/data/cosmetic-counterparts');
 for(const [skin,base] of Object.entries(pairs))it(skin+' matches '+base,()=>{
  const s=Dex.species.get(skin),b=Dex.species.get(base);assert(s.exists&&b.exists);for(const k of ['types','baseStats','abilities','passives'])assert.deepEqual(s[k],b[k],k);if(b.canGigantamax)assert.equal(s.canGigantamax,b.canGigantamax);
 });
 it('inherits final passives when building an artwork-only form from its base', () => {
  for (const base of ['unown', 'florges', 'spiritomb', 'dusknoir', 'gardevoir']) {
   const species = Dex.species.get(base);
   for (const name of species.cosmeticFormes) {
    const skin = Dex.species.get(name);
    if (skin.baseSpecies === species.name && !Dex.data.Pokedex[skin.id]) {
     assert.deepEqual(skin.passives, species.passives, name);
    }
   }
  }
 });
 it('preserves deliberately different regional and custom gameplay forms',()=>{
  for(const [a,b]of [['laprasaevian','lapras'],['palossandfiery','palossand'],['florgesreborn','florges'],['toxtricityaevian','toxtricity'],['scolipedemega','scolipede']])assert.notDeepEqual(Dex.species.get(a).types,Dex.species.get(b).types);
  assert.notDeepEqual(Dex.species.get('cinccinodeso').abilities,Dex.species.get('cinccino').abilities);
 });
 it('preserves Grimmsnarl-Azzy Gmax and Scolipede-Azzy Mega routes',()=>{
  const battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Grimmsnarl-Azzy',ability:'Prankster',moves:['splash']}],[{species:'Scolipede-Azzy',ability:'Speed Boost',item:'Scolipite',moves:['splash']}]]);
  try{battle.makeChoices('team 1','team 1');const g=battle.p1.active[0],s=battle.p2.active[0];assert.equal(g.canDynamax,'grimmsnarlgmaxazzy');assert.equal(battle.actions.canMegaEvo(s),'Scolipede-Mega-Azzy');g.formeChange('Grimmsnarl-Gmax-Azzy',battle.dex.conditions.get('dynamax'),true);assert.equal(g.ability,'wickedsnare');assert(battle.actions.runMegaEvo(s));assert.equal(s.ability,'venombastion');}finally{battle.destroy();}
 });
});
