'use strict';
const assert = require('assert').strict;
const {Battle, Dex, TeamValidator} = require('../../../dist/sim');
const additions = ['encore','disable','willowisp','partingshot','astonish'];
const abilities = {0:'Moonlit Prowl',1:'Natural Cure',H:'Wonder Skin'};
describe('Explicit Delcatty redesign', () => {
 it('has Normal/Ghost, the approved 550 BST and one Rivalry passive', () => {
  const s = Dex.species.get('delcatty');
  assert.deepEqual(s.types,['Normal','Ghost']);
  assert.deepEqual(s.baseStats,{hp:90,atk:70,def:75,spa:100,spd:100,spe:115});
  assert.equal(s.bst,550);
  assert.deepEqual(s.abilities,abilities);
  assert.deepEqual(s.passives,['rivalry']);
  assert(!Object.values(s.abilities).includes('Rivalry'));
 });
 for (const move of additions) it('adds one current-generation source for ' + move, () => {
  assert.deepEqual(Dex.species.getLearnsetData('delcatty').learnset[move], [move === 'astonish' ? '9L1' : '9M']);
 });
 for (const format of ['gen9nofieldsinglesgame','gen9nofielddoublesbattle']) for (const ability of Object.values(abilities)) for (const move of additions) {
  it(format + ' accepts ' + ability + ' with ' + move, () => {
   const set = {species:'Delcatty',ability,moves:[move],nature:'Hardy',evs:{hp:1}};
   const v = TeamValidator.get(format);
   assert.equal(v.checkCanLearn(Dex.moves.get(move),Dex.species.get('delcatty'),undefined,set),null);
   const team = [set];
   if (format === 'gen9nofielddoublesbattle') team.push({species:'Mew',ability:'Synchronize',moves:['Psychic'],nature:'Hardy',evs:{hp:1}});
   assert.equal(v.validateTeam(team),null);
  });
 }
 it('retains existing attacks and support moves', () => {
  const l = Dex.species.getLearnsetData('delcatty').learnset;
  assert.deepEqual(l.hypervoice,['9M','7T','6T','5T']);
  assert.deepEqual(l.shadowball,['9M','7M','6M','5M','4M','3M']);
  assert.deepEqual(l.batonpass,['9M']);
  assert.deepEqual(l.nastyplot,['9M']);
 });
 it('gets ordinary Normal and Ghost STAB with exactly one Rivalry boost', () => {
  const b = new Battle({formatid:'gen9nofieldsinglesgame',p1:{name:'A',team:[{species:'Delcatty',ability:'Moonlit Prowl',moves:['astonish']}]},p2:{name:'B',team:[{species:'Mew',ability:'No Ability',moves:['splash']}]}});
  try {
   if (b.requestState === 'teampreview') b.makeChoices('team 1','team 1');
   const p=b.p1.active[0],q=b.p2.active[0];q.setType('Water');b.randomizer=n=>n;
   assert.deepEqual(p.getPassives(),['rivalry']);
   assert.equal(b.runEvent('BasePower',p,q,Dex.getActiveMove('tackle'),100),130);
   const damage=type=>b.actions.getDamage(p,q,Object.assign(Dex.getActiveMove('tackle'),{type,basePower:80,willCrit:false}));
   const normal=damage('Normal'),ghost=damage('Ghost'),psychic=damage('Psychic');
   assert.equal(normal,ghost);
   assert(normal > psychic);
   assert(Math.abs(normal-psychic*1.5)<=2);
  } finally {b.destroy();}
 });
 it('preserves Skitty, Mightyena selected slots and the approved non-Mega/Mega split', () => {
  const s=Dex.species.get('skitty');
  assert.deepEqual(s.types,['Normal']);assert.deepEqual(s.baseStats,{hp:50,atk:45,def:45,spa:35,spd:35,spe:50});
  assert.deepEqual(s.abilities,{0:'Cute Charm',1:'Normalize',H:'Wonder Skin'});assert.deepEqual(s.passives,[]);
  for (const move of additions) assert.equal(Dex.species.getLearnsetData('skitty').learnset[move],undefined);
  for (const id of ['mightyena','mightyenagrim','mightyenadeso']) {assert.deepEqual(Dex.species.get(id).passives,['rivalry']);assert.deepEqual(Dex.species.get(id).abilities,{0:'Intimidate',1:'Black Fang',H:'Stakeout'});}
  for (const id of ['mightyenamega','mightyenamegagrim']) {assert.deepEqual(Dex.species.get(id).passives,['darkaura']);assert.deepEqual(Dex.species.get(id).abilities,{0:'Dread Dominion'});}
 });
});
