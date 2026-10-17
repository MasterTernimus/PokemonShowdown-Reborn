'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');let battle;
function setup(ability='No Ability',gameType='singles'){
 const mon=(species='Mew',ability='No Ability')=>({species,ability,moves:['gildedhelix','gildedarrow','splash']});
 const teams=gameType==='freeforall'?[[mon('Hydreigon',ability)],[mon()],[mon()],[mon()]]:[[mon('Hydreigon',ability),mon()],[mon(),mon()]];
 battle=common.createBattle({gameType},teams);if(battle.requestState==='teampreview')battle.makeChoices();battle.field.terrain='';battle.randomizer=n=>n;
 for(const p of battle.getAllActive())p.hp=p.maxhp=p.baseMaxhp=10000;
 return[battle.p1.active[0],battle.p2.active[0]];
}
function use(p,q,id='gildedhelix'){battle.actions.useMove(Object.assign(Dex.getActiveMove(id),{willCrit:false}),p,{target:q});return battle.activeMove;}
describe('Approved Gilded Helix Hydra Bond exception',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const mode of ['singles','doubles','freeforall'])for(const ability of ['No Ability','Hydra Bond','Hydra Heart'])it(mode+' '+ability+' full-power hits',()=>{
  const[p,q]=setup(ability,mode),single=battle.actions.getDamage(p,q,Object.assign(Dex.getActiveMove('dragonpulse'),{basePower:50,willCrit:false})),hp=q.hp;
  const m=use(p,q),hits=3;assert.equal(m.multihit,hits);assert(!m.multihitType);assert.equal(hp-q.hp,single*hits);assert.equal(m.category,'Special');assert.equal(m.type,'Dragon');
 });
 for(const ability of ['Hydra Bond','Hydra Heart'])it('suppressed '+ability+' retains native Hydra Flight third hit',()=>{const[p,q]=setup(ability);p.addVolatile('gastroacid',q);assert.equal(use(p,q).multihit,3);});
 it('Protect blocks all hits; Substitute receives all three without damaging holder',()=>{const[p,q]=setup('Hydra Bond');q.addVolatile('protect');use(p,q);assert.equal(q.hp,10000);q.removeVolatile('protect');q.addVolatile('substitute');q.volatiles.substitute.hp=9000;use(p,q);assert.equal(q.hp,10000);assert(q.volatiles.substitute.hp<9000);assert(battle.log.some(l=>l.includes('|-hitcount|')&&l.endsWith('|3')));});
 it('keeps ordinary Hydra follow-up scaling and excludes Z/Max',()=>{const[p,q]=setup('Hydra Bond');const arrow=use(p,q,'gildedarrow');assert.equal(arrow.multihit,3);assert.equal(arrow.multihitType,'hydrabond');for(const m of [battle.actions.getActiveMaxMove(Dex.moves.get('gildedhelix'),p)]){battle.runEvent('ModifyMove',p,q,m,m);assert(!m.multihit);}});
 for(const [types,type]of [[['Dark','Dragon'],'Dragon'],[['Normal','Fairy'],'Normal'],[['Ghost','Dark'],'Ghost'],[['Fairy'],'Fairy'],[['Dark'],'Dark']])it('current types '+types+' select '+type,()=>{const[p,q]=setup();p.setType(types);const m=use(p,q);assert.equal(m.type,type);assert.equal(m.category,'Special');});
});
