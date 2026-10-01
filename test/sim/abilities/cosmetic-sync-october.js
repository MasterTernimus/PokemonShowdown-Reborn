'use strict';
const assert=require('assert').strict,common=require('../../common');
const {Dex}=require('../../../dist/sim/dex');
describe('Approved cosmetic counterpart synchronization',()=>{
 const pairs={"charizardalt":"charizard","charizardmegaxalt":"charizardmegax","arcaninealt":"arcanine","alakazamalt":"alakazam","alakazammegaalt":"alakazammega","machampalt":"machamp","machampgmaxalt":"machampgmax","jynxalt":"jynx","laprasazzy":"lapras","eeveestarteralt":"eeveestarter","typhlosionalt":"typhlosion","crobatalt":"crobat","lanturnalt":"lanturn","gardevoirmegaalt":"gardevoirmega","gastrodonazzy":"gastrodon","gastrodonazzy2":"gastrodon","galladeazzy":"gallade","gallademegaazzy":"gallademega","serperiorazzy":"serperior","emboaralt":"emboar","emboarmegaalt":"emboarmega","samurottalt":"samurott","samurotthisuialt":"samurotthisui","scolipedeazzy":"scolipede","scolipedemegaazzy":"scolipedemega","jellicentazzy":"jellicent","goodrahisuialt":"goodrahisui","decidueyealt":"decidueye","decidueyehisuialt":"decidueyehisui","incineroaralt":"incineroar","primarinaalt":"primarina","tsareenaalt":"tsareena","grimmsnarlazzy":"grimmsnarl","grimmsnarlgmaxazzy":"grimmsnarlgmax","skeledirgealt":"skeledirge","gligaralt":"gligar","gliscoralt":"gliscor"};
 for(const [skin,base] of Object.entries(pairs))it(skin+' matches '+base,()=>{
  const s=Dex.species.get(skin),b=Dex.species.get(base);assert(s.exists&&b.exists);for(const k of ['types','baseStats','abilities'])assert.deepEqual(s[k],b[k],k);if(b.canGigantamax)assert.equal(s.canGigantamax,b.canGigantamax);
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
