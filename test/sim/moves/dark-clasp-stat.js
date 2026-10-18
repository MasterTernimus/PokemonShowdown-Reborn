'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
describe('Dark Clasp modified Sp.Def offense',()=>{
 let b;afterEach(()=>{b?.destroy();b=null;});
 function damage({type='Dark',field='',item='',ability='No Ability',spd=300,boost=0,id='darkclasp'}={}){
  b?.destroy();const mon={species:'Mew',ability:'No Ability',moves:['splash']};b=common.createBattle({},[[{...mon,item,ability}],[mon]]);if(b.requestState==='teampreview')b.makeChoices();b.field.terrain=field;b.field.terrainState=b.initEffectState({id:field,terrainChanges:new Map()});b.randomizer=n=>n;
  const p=b.p1.active[0],q=b.p2.active[0];p.setType(type);q.setType('Normal');p.storedStats.spd=spd;p.storedStats.spa=300;p.boosts.spd=boost;q.hp=q.maxhp=q.baseMaxhp=10000;
  const move=Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false});b.actions.runMove(move,p,p.getLocOf(q),{externalMove:true});return 10000-q.hp;
 }
 for(const type of ['Dark','Ghost','Normal'])it(type+' combines only eligible Sp.Def and direct field boosts',()=>{
  const expected=damage({type,spd:type==='Normal'?300:450});
  const base=damage({type});
  const actual=damage({type,field:'darkcrystalcavernterrain'});
  // Direct power uses the engine fixed-point 1.5x; compare against an equivalent modified-stat control.
  assert(actual>expected*1.45&&actual<expected*1.55);
  assert(actual>base*(type==='Normal'?1.45:2.15));
 });
 it('Assault Vest boosts offensive Sp.Def exactly once',()=>{assert.equal(damage({item:'Assault Vest'}),damage({spd:450}));});
 it('Eviolite boosts eligible offensive Sp.Def',()=>{const plain=damage();b.p1.active[0].species=b.p1.active[0].baseSpecies=Dex.species.get('Clefairy');b.p1.active[0].setItem('Eviolite');const q=b.p2.active[0],hp=q.hp;b.actions.runMove(Object.assign(Dex.getActiveMove('darkclasp'),{accuracy:true,willCrit:false}),b.p1.active[0],b.p1.active[0].getLocOf(q),{externalMove:true});assert(hp-q.hp>plain*1.45);});
 it('Sp.Def stages apply and Choice Specs does not replace them',()=>{assert.equal(damage({boost:1}),damage({spd:450}));assert.equal(damage({item:'Choice Specs'}),damage());});
 it('ordinary special attacks still use Choice Specs',()=>{assert(damage({id:'darkpulse',item:'Choice Specs'})>damage({id:'darkpulse'})*1.45);});
});
