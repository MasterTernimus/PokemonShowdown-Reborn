'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
let battle;
function setup(field='',aura='') {const mon={species:'Mew',ability:'No Ability',moves:['splash']};battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[mon],[mon]]);if(battle.requestState==='teampreview')battle.makeChoices();if(field)battle.field.startTerrain(field);if(aura){battle.field.auraField=aura;battle.field.auraTurns=5;}return [battle.p1.active[0],battle.p2.active[0]];}
function power(id,p,q,type){const m=Dex.getActiveMove(id);if(type)m.type=type;return battle.runEvent('BasePower',p,q,m,100,true);}
describe('Signature terrain and aura parity',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const mode of ['neither','terrain','aura','both']){
  const field=mode==='terrain'||mode==='both',aura=mode==='aura'||mode==='both';
  it('KABOOM recoil '+mode,()=>{const[p,q]=setup(field?'electricterrain':'',aura?'electricterrain':'');const m=Dex.getActiveMove('kaboom');battle.singleEvent('ModifyMove',m,null,p,q,m,m);assert.equal(!!m.recoil,mode==='neither');});
  it('Flutter named power '+mode,()=>{const[p,q]=setup(field?'rainbowterrain':'',aura?'rainbowterrain':'');assert.equal(power('flutterscales',p,q),mode==='neither'?100:150);});
  for(const type of ['Normal','Bug'])it('Dei named and generic '+type+' '+mode,()=>{const[p,q]=setup(field?'rainbowterrain':'',aura?'rainbowterrain':'');const expected=mode==='neither'?100:type==='Bug'?150:field?225:195;assert.equal(power('deiludicium',p,q,type),expected);});
  for(const id of ['nomoswish','nostraswish','wish'])for(const match of ['mistyterrain','rainbowterrain'])it(id+' healing snapshot '+match+' '+mode,()=>{const[p,q]=setup(field?match:'',aura?match:'');p.hp=p.maxhp=p.baseMaxhp=1000;battle.actions.useMove(id,p,{target:id==='nostraswish'?q:p});const slot=p.side.slotConditions[0].wish;const expected=field||(aura&&id!=='wish')?750:500;assert.equal(slot.hp,expected);battle.field.clearAura(false);battle.field.terrain='';p.hp=1;battle.singleEvent('End',Dex.conditions.get('wish'),slot,p);assert.equal(p.hp,1+expected);});
 }
 for(const terrain of ['', 'rockyterrain','shortcircuitterrain'])for(const origin of ['iondeluge','plasmafists'])it('airborne KABOOM preserves '+origin+' aura over '+terrain,()=>{const[p,q]=setup(terrain);p.setType('Flying');assert(battle.field.setAura('electricterrain',5,p,Dex.moves.get(origin)));const m=Dex.getActiveMove('kaboom');battle.singleEvent('ModifyMove',m,null,p,q,m,m);assert(!m.recoil);assert(battle.field.auraState.noTerrainPromotion);assert.equal(battle.field.promoteAura(p,Dex.moves.get('electricterrain')),false);assert.equal(battle.field.terrain,terrain);assert.equal(battle.field.auraTurns,5);});
 for(const[species,move]of [['noctowl','winddance'],['goodrahisui','dragonrend']])it('removes '+species+' '+move,()=>{assert(!Dex.species.getLearnsetData(species).learnset[move]);const {TeamValidator}=require('../../../dist/sim/team-validator');const v=new TeamValidator('gen9nofieldsinglesgame');assert(v.checkCanLearn(Dex.moves.get(move),Dex.species.get(species)));});
});
