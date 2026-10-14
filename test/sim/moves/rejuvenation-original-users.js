'use strict';
const assert = require('assert').strict;
const {Dex} = require('../../../dist/sim/dex');
const {TeamValidator} = require('../../../dist/sim/team-validator');
const {RejuvenationSignatureLearnsets} = require('../../../dist/data/rejuvenation-signature-moves');
const {baseline, additions} = require('./rejuvenation-original-users.json');

describe('Rejuvenation original users promoted to final evolutions', () => {
 const validator = new TeamValidator('gen9nofieldsinglesgame');
 for (const [move, users] of Object.entries(additions)) {
  it(move + ' preserves previous users and adds only approved final forms legally', () => {
   assert.deepEqual(RejuvenationSignatureLearnsets[move], [...new Set([...baseline[move], ...users])]);
   for (const id of users) {
    const species = Dex.species.get(id);
    assert(species.exists, id);
    assert.equal(species.evos.length, 0, id + ' must be fully evolved');
    assert.deepEqual(Dex.species.getLearnsetData(id).learnset[move], ['9L1']);
    assert.equal(validator.checkCanLearn(Dex.moves.get(move), species), null, id + '/' + move);
   }
  });
 }
 it('does not add the unevolved original users', () => {
  for (const [move, ids] of Object.entries({multipulse:['stantler'], galestrike:['scraggy','farfetchdgalar','machoke','pawmo','pignite','combusken'], spectralscream:['lampent'], venamskiss:['trubbish','croagunk','toxel','whirlipede','ivysaur'], bunrakubeatdown:['mrmimegalar']})) {
   for (const id of ids) assert(!Dex.species.getLearnsetData(id).learnset?.[move]?.length, id + '/' + move);
  }
 });
 it('keeps regional and appliance-specific grants isolated', () => {
  for (const [move, ids] of Object.entries({multipulse:['indeedee'], feverpitch:['gyarados'], heavenlywing:['volcarona'], coldtruth:['ninetales','rotom','rotomheat','rotomwash','rotomfan','rotommow','regice'], uproot:['froslass','rotom','rotomheat','rotomwash','rotomfan','rotomfrost'], galestrike:['darmanitangalar'], pyrokinesis:['slowbro'], bunrakubeatdown:['darkrai']})) {
   for (const id of ids) assert(!Dex.species.getFullLearnset(id).some(l => l.learnset[move]?.length), id + '/' + move);
  }
 });
 it('retains matching cosmetic and battle forms', () => {
  for (const [id, move] of [['toxtricitylowkey','thunderraid'],['toxtricitylowkey','venamskiss'],['sinistchamasterpiece','spectralscream'],['darmanitanzen','galestrike'],['machampgmax','galestrike'],['blazikenmega','galestrike']]) {
   assert(Dex.species.getFullLearnset(id).some(l => l.learnset[move]?.length), id + '/' + move);
  }
 });
 it('does not introduce Decimation', () => {
  for (const id of ['decimation']) assert(!Dex.moves.get(id).exists, id);
 });
});
