'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');let battle;
const mon=(species='Mew',ability='No Ability')=>({species,ability,moves:['tackle','splash','protect']});
function setup(){battle=common.createBattle({gameType:'doubles'},[[mon('Nidoqueen',"Matriarch's Vigil"),mon(),mon()],[mon(),mon()]]);if(battle.requestState==='teampreview')battle.makeChoices();battle.field.terrain='';const p=battle.p1.active[0],a=battle.p1.active[1],q=battle.p2.active[0];for(const x of [p,a,q])x.hp=x.maxhp=x.baseMaxhp=1000;return[p,a,q];}
function hit(source,target,extra={}){battle.actions.runMove(Object.assign(Dex.getActiveMove('tackle'),{accuracy:true,willCrit:false,secondaries:null,damage:100},extra),source,source.getLocOf(target));}
describe('Approved Nido pair and defensive passive swaps',()=>{afterEach(()=>{battle?.destroy();battle=null;});
 for(const self of [false,true])it('whole multihit emergency boosts injured '+(self?'self':'ally')+' once',()=>{const[p,a,q]=setup(),target=self?p:a;target.hp=650;const during=[];hit(q,target,{multihit:3,onAfterHit(){during.push(target.boosts.def);}});assert.deepEqual(during,[0,0,0]);assert.equal(target.boosts.def,1);assert.equal(target.boosts.spd,1);assert(p.m.matriarchVigilUsed);p.setAbility('No Ability');p.setAbility("Matriarch's Vigil");const other=self?a:p;other.hp=550;hit(q,other);assert.equal(other.boosts.def,0);});
 for(const kind of ['friendly','residual','substitute','faint','alreadyLow','suppressed'])it('excludes '+kind,()=>{const[p,a,q]=setup();a.hp=kind==='alreadyLow'?400:550;if(kind==='substitute'){a.addVolatile('substitute');a.volatiles.substitute.hp=999;}if(kind==='suppressed')p.addVolatile('gastroacid',q);if(kind==='residual')battle.damage(100,a,q,Dex.conditions.get('psn'));else hit(kind==='friendly'?p:q,a,{damage:kind==='faint'?600:100});assert.equal(a.boosts.def,0);assert(!p.m.matriarchVigilUsed);});
 it('full components remain separate from Rivalry',()=>{const[p,a,q]=setup();assert(p.hasAbility('thickfat'));assert(p.hasAbility('aromaveil'));assert(!p.hasAbility('friendguard'));assert.deepEqual(p.getPassives(),['rivalry']);assert.equal(battle.runEvent('ModifyDamage',q,a,Dex.getActiveMove('tackle'),100),75);assert.equal(battle.runEvent('ModifyAtk',q,p,Dex.getActiveMove('firepunch'),100),50);battle.actions.useMove('taunt',q,{target:a});assert(!a.volatiles.taunt);});
 it('Patriarch has full components, category adaptation and crit without blanket boost',()=>{const[p,a,q]=setup();p.setAbility("Patriarch's Wrath");assert.equal(p.boosts.accuracy,1);q.gender='M';p.gender='F';for(const[id,power]of [['tackle',100],['hornattack',150],['drillrun',150],['irontail',150]])assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove(id),100),power,id);p.storedStats.atk=400;p.storedStats.spa=50;let move=Dex.getActiveMove('sludgebomb');battle.runEvent('ModifyMove',p,q,move,move);assert.equal(move.category,'Physical');p.storedStats.atk=40;p.storedStats.spa=500;move=Dex.getActiveMove('earthquake');battle.runEvent('ModifyMove',p,q,move,move);assert.equal(move.category,'Special');assert.equal(battle.runEvent('ModifyCritRatio',p,q,Dex.getActiveMove('irontail'),1),2);battle.field.terrain='rockyterrain';assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('hornattack'),100),300);move=Dex.getActiveMove('hornattack');battle.runEvent('ModifyMove',p,q,move,move);assert(!move.flags.protect);});
 it('exact distribution and excluded Dodrio/Floatzel preserved',()=>{const before=require('../../../artifacts/nido-dragonite-before.json');
  // Later explicit approvals override only these expectations; retain the historical fixture.
  const approvedStats={staraptor:{hp:85,atk:120,def:80,spa:50,spd:70,spe:100},staraptormega:{hp:85,atk:140,def:110,spa:60,spd:100,spe:110},
   sevipermega:{hp:75,atk:140,def:120,spa:90,spd:120,spe:65},
   mightyena:{hp:90,atk:115,def:80,spa:60,spd:80,spe:125},
   mightyenadeso:{hp:90,atk:115,def:80,spa:60,spd:80,spe:125},
   toxicroak:{hp:83,atk:121,def:70,spa:111,spd:70,spe:95},
   toxicroakdeso:{hp:83,atk:121,def:70,spa:111,spd:70,spe:95},
   cinccinodeso:{hp:75,atk:110,def:90,spa:60,spd:90,spe:125},
  };
  const approvedPassives={
   clefable:['magicguard'],rapidashgalar:['pastelveil'],
   hitmonlee:['bruteforce'],hitmonchan:['ironfist'],hitmontop:['scrappy'],
   mightyena:['rattled'],mightyenadeso:['rattled'],
   milotic:['marvelscale'],miloticterajuma:['marvelscale'],miloticmega:['marvelscale'],miloticaevian:['marvelscale'],
   kecleon:['protean'],drifblim:['flareboost'],cinccino:['shielddust'],cinccinodeso:['shielddust'],
  };
  const approvedSlots={
   clefable:{1:'Friend Guard'},rapidashgalar:{0:'Psychic Surge'},
   kecleon:{1:'Pickpocket'},drifblim:{H:'Aftermath'},nidoqueen:{H:'Royal Aegis'},
  };
  for(const old of before){const s=Dex.species.get(old.id);assert.deepEqual(s.types,{gorebyss:['Water','Fairy'],huntail:['Water','Dark']}[old.id]||old.types);assert.deepEqual(s.baseStats,approvedStats[old.id]||(old.id==='kingdra'?{...old.stats,atk:105,spa:105}:old.stats),old.id);assert.deepEqual(s.abilities,{...require('./passive-approval-overlays').abilities(old.id,{...old.abilities}),...approvedSlots[old.id]},old.id);assert.deepEqual(s.passives,approvedPassives[old.id]||require('./passive-approval-overlays').current(old.id,old.passives),old.id);}assert.deepEqual(Dex.species.get('duraludon').passives,['keeneye']);assert.deepEqual(Dex.species.get('murkrow').passives,['infiltrator']);assert.deepEqual(Dex.species.get('porygon2').passives,['download']);assert.deepEqual(Dex.species.get('dusclops').passives,['unnerve']);assert.deepEqual(Dex.species.get('gligar').passives,['poisontouch']);assert.deepEqual(Dex.species.get('corsolagalar').passives,['infiltrator']);assert.deepEqual(Dex.species.get('mightyena').passives,['rattled']);assert.deepEqual(Dex.species.get('mightyenadeso').passives,['rattled']);assert.deepEqual(Dex.species.get('toxicroakdeso').passives,['limber']);assert.deepEqual(Dex.species.get('cinccinodeso').passives,['shielddust']);assert.equal(Dex.species.get('nidoking').abilities.H,"Patriarch's Wrath");assert.equal(Dex.species.get('nidoqueen').abilities.H,'Royal Aegis');for(const[id,passive]of [['arcaninehisui','sturdy'],['dragonite','championscommand'],['dragonitemega','multiscale']])assert.deepEqual(Dex.species.get(id).passives,[passive]);});
});
