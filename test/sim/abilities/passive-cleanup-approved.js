'use strict';
const assert=require('assert').strict,common=require('../../common');
const {Dex}=require('../../../dist/sim');
let battle;
function setup(species='Gliscor',ability='Venom Pincer',foe='Mew',foeAbility='No Ability') {
 battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species,ability,moves:['poisonjab','tackle','splash']}],[{species:foe,ability:foeAbility,moves:['splash']}]]);
 battle.makeChoices('team 1','team 1'); const p=battle.p1.active[0],q=battle.p2.active[0];
 p.formeChange(species,null,true);p.setAbility(ability);q.setAbility(foeAbility);battle.field.terrain='';battle.field.weather='';
 for(const x of [p,q])x.hp=x.maxhp=x.baseMaxhp=1600;return [p,q];
}
function attack(p,q,id='tackle',props={}) {const move=Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false,secondaries:null},props);battle.actions.useMove(move,p,{target:q});}
function residual(p){battle.runEvent('Residual',p);}
describe('Approved ordinary passive cleanup',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const type of ['Ice','Water'])for(const status of ['brn','psn',''])it('Freezer Burn damage: '+type+'/'+status,()=>{const [p,q]=setup('Glalie-Mega','Freezer Burn');q.status=status;const move=Object.assign(Dex.getActiveMove('icebeam'),{type});assert.equal(battle.runEvent('ModifyDamage',p,q,move,100),type==='Ice'&&status==='brn'?120:100);p.addVolatile('gastroacid',q);assert.equal(battle.runEvent('ModifyDamage',p,q,move,100),100);});
 it('Freezer Burn recognizes Refrigerate conversion before its conditional bonus',()=>{const [p,q]=setup('Glalie-Mega','Freezer Burn');q.status='brn';const move=Dex.getActiveMove('tackle');battle.runEvent('ModifyType',p,q,move,move);assert.equal(move.type,'Ice');assert.equal(battle.runEvent('ModifyDamage',p,q,move,100),120);assert.deepEqual(p.getPassives(),['refrigerate']);});
 it('retains the approved species records with subsequent explicit revisions',()=>{
  const before=require('../../../artifacts/passive-cleanup-before.json');
  const passives={conkeldurr:['stamina'],gyarados:['intimidate'],milotic:['waterabsorb'],raichualola:['static'],wishiwashisevii:['infiltrator'],wishiwashiseviischooling:['infiltrator'],gliscor:['poisonheal'],gliscoralt:['poisonheal']};
  const slots={gyarados:'Unbridled Wrath',crobatalt:'Poison Touch',gastrodonazzy:'Rain Dish',gastrodonazzy2:'Rain Dish',gliscor:'Venom Pincer',gliscoralt:'Venom Pincer'};
  const revisions=require('./gmax-snapshot-approved-overrides.json');
  const revisedStats={staraptor:[85,120,80,50,70,100],staraptormega:[85,140,110,60,100,110],sevipermega:[75,140,120,90,120,65],kingdra:[85,105,90,105,90,95],mightyena:[90,115,80,60,80,125],mightyenadeso:[90,115,80,60,80,125],toxicroak:[83,121,70,111,70,95],toxicroakdeso:[83,121,70,111,70,95],cinccinodeso:[75,110,90,60,90,125]};
  for(const old of before){const s=Dex.species.get(old.id);assert.deepEqual(s.passives,revisions.passives[old.id]||require('./passive-approval-overlays').current(old.id,passives[old.id]||old.passives),old.id);assert.deepEqual(s.abilities,revisions.abilities[old.id]||require('./passive-approval-overlays').abilities(old.id,old.id==='silvally'?{0:'RKS System',1:'Adaptive Arsenal',H:'Memory Leak'}:old.id==='conkeldurr'?{...old.abilities,1:'Rocky Payload'}:slots[old.id]?{...old.abilities,0:slots[old.id]}:{...old.abilities}),old.id);assert.deepEqual(Object.values(s.baseStats),revisedStats[old.id]||Object.values(old.stats),old.id);assert.deepEqual(s.types,{gorebyss:['Water','Fairy'],huntail:['Water','Dark']}[old.id]||old.types);}
 });
 for(const ability of ['Venom Pincer','Toxic Boost','Wind Rider','Poison Heal'])for(const suppressed of [false,true])it('Gliscor Poison Heal heals once with '+ability+' suppressed='+suppressed,()=>{
  const [p,q]=setup('Gliscor',ability);if(suppressed)p.addVolatile('gastroacid',q);p.status='psn';p.hp=800;residual(p);assert.equal(p.hp,1000);assert.equal(p.status,'psn');
 });
 for(const ability of ['No Ability','Shield Dust'])for(const item of ['','Covert Cloak'])it('Poison Touch respects '+ability+' / '+item,()=>{
  const [p,q]=setup('Gliscor','Venom Pincer','Mew',ability);q.setItem(item);battle.randomChance=(n,d)=>n===3&&d===10;attack(p,q);assert.equal(q.status,ability==='Shield Dust'||item?'':'psn');
 });
 for(const foe of ['Steelix','Muk'])it('Poison Touch respects '+foe+' immunity',()=>{const [p,q]=setup('Gliscor','Venom Pincer',foe);battle.randomChance=()=>true;attack(p,q);assert.equal(q.status,'');});
 it('only contact attacks trigger its 30% roll; no incoming Poison Point',()=>{const [p,q]=setup();let rolls=0;battle.randomChance=(n,d)=>{if(n===3&&d===10)rolls++;return false;};attack(p,q,'watergun');assert.equal(rolls,0);attack(p,q);assert.equal(rolls,1);attack(q,p);assert.equal(rolls,1);});
 it('Venom Pincer no longer grants Hyper Cutter',()=>{const [p,q]=setup();battle.boost({atk:-1},p,q);assert.equal(p.boosts.atk,-1);});
 it('selected package has no bonus Poison STAB, healing or curing on nonrecipients',()=>{const [p,q]=setup('Mew');const m=Dex.getActiveMove('poisonjab');assert.equal(battle.runEvent('ModifySTAB',p,q,m,1),1);p.setType('Poison');assert.equal(battle.runEvent('ModifySTAB',p,q,m,1.5),1.5);p.hp=800;p.status='brn';residual(p);assert.equal(p.status,'brn');assert(p.hp<=800);assert(!p.getAbility().onResidual);assert(!p.getAbility().onDamage);assert(!p.getAbility().onDamagingHit);});
 it('Milotic retains one Marvel Scale passive through suppression',()=>{const [p,q]=setup('Milotic','Prism Scale');p.addVolatile('gastroacid',q);battle.field.terrain='fairytaleterrain';assert.equal(battle.runEvent('ModifyDef',p,null,null,100),150);});
 it('Alolan Raichu Static remains active through suppression',()=>{const [p,q]=setup('Raichu-Alola','Surge Surfer');p.addVolatile('gastroacid',q);battle.randomChance=()=>true;attack(q,p);assert.equal(q.status,'par');});
 for(const species of ['Wishiwashi-Sevii','Wishiwashi-Sevii-Schooling'])it(species+' has Infiltrator through suppression',()=>{const [p,q]=setup(species,'No Ability');p.addVolatile('gastroacid',q);q.addVolatile('substitute');q.volatiles.substitute.hp=500;attack(p,q);assert(q.hp<1600);assert.equal(q.volatiles.substitute.hp,500);});
 it('Includes are unique and custom descriptions survive contextual rendering',()=>{const {getAbilityDisplayComponents}=require('../../../dist/data/ability-display');const {SharedPassiveAbilityDescriptions}=require('../../../dist/data/passive-ability-cleanup');assert.deepEqual(getAbilityDisplayComponents('venompincer',['poisonheal'],'gliscor'),['poisontouch']);assert.deepEqual(getAbilityDisplayComponents('freezerburn',['refrigerate'],'glaliemega'),['slushrush','levitate']);assert.deepEqual(getAbilityDisplayComponents('cursedmarionette',['prankster'],'banettemega'),['frisk']);assert.match(SharedPassiveAbilityDescriptions.cursedmarionette.desc,/20%/);assert.match(SharedPassiveAbilityDescriptions.cursedmarionette.desc,/1\/4/);assert.deepEqual(getAbilityDisplayComponents('scaleshelter',['shielddust'],'masquerain'),['overcoat']);});
 for(const field of ['electricterrain','watersurfaceterrain','underwaterterrain','murkwatersurfaceterrain','shortcircuitterrain',''])it('Surge Surfer retains existing speed on '+field,()=>{const [p]=setup('Raichu-Alola','Surge Surfer');battle.field.terrain=field;assert.equal(battle.runEvent('ModifySpe',p,null,null,100),field&&field!=='underwaterterrain'?200:100);});
});
