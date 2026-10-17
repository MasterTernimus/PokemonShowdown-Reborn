const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
describe('Meloetta approved core',()=>{let battle;afterEach(()=>battle?.destroy());
it('has exact selected slots, passive and Encore stats',()=>{for(const[id,a]of [['meloetta','Songstress'],['meloettapirouette','Dancer'],['meloettaencore','Performer']]){const s=Dex.species.get(id);assert.deepEqual(s.abilities,{0:a});assert.deepEqual(s.passives,['serenegrace']);}const s=Dex.species.get('meloettaencore');assert.deepEqual(s.types,['Normal','Fairy']);assert.deepEqual(s.baseStats,{hp:100,atk:103,def:84,spa:103,spd:102,spe:108});assert(!s.battleOnly);});
for(const [ability,move,expected] of [['Songstress','hypervoice',1],['Songstress','quiverdance',0],['Performer','hypervoice',1],['Performer','quiverdance',1],['Dancer','hypervoice',0]])it(ability+' copies '+move+' '+expected+' times without PP cost/recursion',()=>{battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Meloetta-Encore',ability,moves:['splash','hypervoice','quiverdance']}],[{species:'Blissey',ability:'Songstress',moves:[move]}]]);battle.makeChoices('team 1','team 1');const p=battle.p1.active[0],pp=p.moveSlots.map(m=>m.pp);battle.makeChoices('move splash','move '+move);const copies=battle.log.filter(l=>l.startsWith('|move|p1a:')&&/\[from\] ability:/.test(l));assert.equal(copies.length,expected,battle.log.join('\n'));assert.equal(p.moveSlots[1].pp,pp[1]);assert.equal(p.moveSlots[2].pp,pp[2]);});
it('Encore remains fixed after Relic Song',()=>{battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Meloetta-Encore',ability:'Performer',moves:['relicsong']}],[{species:'Blissey',ability:'No Ability',moves:['splash']}]]);battle.makeChoices('team 1','team 1');battle.makeChoices('move relicsong','move splash');assert.equal(battle.p1.active[0].species.id,'meloettaencore');});
});

describe('Meloetta contextual moves',()=>{let battle;afterEach(()=>battle?.destroy());function setup(species='Meloetta-Encore',opponentAbility='No Ability'){battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species,ability:species==='Meloetta-Encore'?'Performer':'Dancer',moves:['relicsong']}],[{species:'Blissey',ability:opponentAbility,moves:['splash']}]]);battle.makeChoices('team 1','team 1');return battle.p1.active[0];}
it('shows contextual request name before use and spends the original PP',()=>{const p=setup();assert.equal(p.getMoves()[0].move,'Encore Aria');assert.equal(p.getMoves()[0].id,'relicsong');const pp=p.moveSlots[0].pp;battle.makeChoices('move 1','move splash');assert.equal(p.moveSlots[0].pp,pp-1);assert(battle.log.some(l=>l.includes('|Encore Aria|')));assert.equal(p.species.id,'meloettaencore');});
it('Pirouette preview is a Fighting special dance and original transition remains',()=>{const p=setup('Meloetta-Pirouette');assert.equal(p.getMoves()[0].move,'Pirouette Dance');const m=battle.dex.getActiveMove('relicsong');require('../../../dist/data/meloetta-encore').prepareMeloettaMove(m,p);assert.equal(m.type,'Fighting');assert.equal(m.category,'Special');assert.equal(m.flags.dance,1);assert(!m.flags.sound);battle.makeChoices('move 1','move splash');assert.equal(p.species.id,'meloetta');assert.equal(p.ability,'songstress');});
it('chooses physical against Soundproof without consuming RNG or changing battle state',()=>{const p=setup('Meloetta-Encore','Soundproof');p.storedStats.atk=1;p.storedStats.spa=999;const before=battle.prng.getSeed().slice(),hp=battle.p2.active[0].hp,log=battle.log.length,m=battle.dex.getActiveMove('relicsong');require('../../../dist/data/meloetta-encore').prepareMeloettaMove(m,p);const view=require('../../../dist/sim/encore-aria').encoreAriaView(m,p,battle.p2.active[0]);assert.equal(view.category,'Physical');assert.equal(view.flags.dance,1);assert(!view.flags.sound);assert.deepEqual(battle.prng.getSeed(),before);assert.equal(battle.log.length,log);assert.equal(battle.p2.active[0].hp,hp);});
it('chooses special when SpA/SpD is better and respects category defenses',()=>{const p=setup();p.storedStats.atk=100;p.storedStats.spa=100;const t=battle.p2.active[0];t.storedStats.def=200;t.storedStats.spd=100;let m=battle.dex.getActiveMove('relicsong');const {prepareMeloettaMove}=require('../../../dist/data/meloetta-encore');prepareMeloettaMove(m,p);m=require('../../../dist/sim/encore-aria').encoreAriaView(m,p,t);assert.equal(m.category,'Special');assert(m.flags.sound&&!m.flags.dance);t.setAbility('Ice Scales');t.storedStats.spd=150;m=battle.dex.getActiveMove('relicsong');prepareMeloettaMove(m,p);m=require('../../../dist/sim/encore-aria').encoreAriaView(m,p,t);assert.equal(m.category,'Physical');});
it('Serene Grace passive doubles sleep chance exactly once',()=>{const p=setup();const m=battle.dex.getActiveMove('relicsong');battle.runEvent('ModifyMove',p,battle.p2.active[0],m,m);assert.equal(m.secondaries[0].chance,20);p.setAbility('Serene Grace');const n=battle.dex.getActiveMove('relicsong');battle.runEvent('ModifyMove',p,battle.p2.active[0],n,n);assert.equal(n.secondaries[0].chance,20);});
});

describe('Meloetta copy boundaries',()=>{let b;afterEach(()=>b?.destroy());it('Performer copies a dual-flag move only once',()=>{b=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Meloetta-Encore',ability:'Performer',moves:['splash']}],[{species:'Blissey',ability:'No Ability',moves:['hypervoice']}]]);b.makeChoices('team 1','team 1');const m=b.dex.getActiveMove('hypervoice');m.flags.dance=1;b.actions.runMove(m,b.p2.active[0],1);assert.equal(b.log.filter(l=>l.startsWith('|move|p1a:')&&l.includes('[from] ability: Performer')).length,1);});it('copied Encore Aria retains resolved physical dance and cannot recursively copy',()=>{b=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Meloetta-Encore',ability:'Performer',moves:['relicsong']}],[{species:'Blissey',ability:'Dancer',moves:['splash']}]]);b.makeChoices('team 1','team 1');b.p2.addSideCondition('safeguard',b.p2.active[0]);b.makeChoices('move 1','move 1');assert.equal(b.log.filter(l=>l.startsWith('|move|p2a:')&&l.includes('|Encore Aria|')).length,1);assert.equal(b.log.filter(l=>l.includes('|Encore Aria|')).length,2);});});

describe('Encore Aria per-target engine comparison',()=>{
 let b;afterEach(()=>b?.destroy());
 it('retains a supported sound-immunity decision when damage callbacks need the generic fallback',()=>{
  b=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Meloetta-Encore',ability:'Performer',moves:['relicsong']}],[{species:'Mew',ability:'Soundproof',moves:['splash']}]]);b.makeChoices('team 1','team 1');
  const p=b.p1.active[0],t=b.p2.active[0],ability=p.getAbility(),original=ability.onModifyAtk;
  try {
   ability.onModifyAtk=function(){this.random();};
   const before=JSON.stringify(b.toJSON()),m=b.dex.getActiveMove('relicsong');require('../../../dist/data/meloetta-encore').prepareMeloettaMove(m,p);
   const view=require('../../../dist/sim/encore-aria').encoreAriaView(m,p,t);
   assert.equal(view.category,'Physical');assert(view.flags.dance&&!view.flags.sound);assert.equal(JSON.stringify(b.toJSON()),before);
  } finally {if(original)ability.onModifyAtk=original;else delete ability.onModifyAtk;}
 });
 function setup(){b=common.createBattle({gameType:'doubles'},[[{species:'Meloetta-Encore',ability:'Performer',moves:['relicsong']},{species:'Mew',ability:'No Ability',moves:['splash']}],[{species:'Blissey',ability:'Soundproof',moves:['splash']},{species:'Steelix',ability:'No Ability',moves:['splash']}]]);return b.p1.active[0];}
 it('damages Soundproof physically and a second foe specially in one actual spread move',()=>{
  const p=setup(),[a,z]=b.p2.active;a.storedStats.def=30;a.storedStats.spd=400;z.storedStats.def=400;z.storedStats.spd=30;
  b.p2.addSideCondition('safeguard',a);const hp=[a.hp,z.hp],m=b.dex.getActiveMove('relicsong');m.accuracy=true;m.willCrit=false;
  b.actions.runMove(m,p,1);const used=b.lastMove;
  assert(a.hp<hp[0],b.log.join('\n'));assert(z.hp<hp[1]);
  const active=b.activeMove;assert.equal(a.getMoveHitData(active).encoreCategory,'Physical');assert.equal(z.getMoveHitData(active).encoreCategory,'Special');
  const view=require('../../../dist/sim/encore-aria').encoreAriaView;
  assert(view(active,p,a).flags.dance&&!view(active,p,a).flags.sound);assert(view(active,p,z).flags.sound&&!view(active,p,z).flags.dance);
 });
 it('uses real Punk Rock sound damage and leaves live RNG, HP, log and boosts unchanged',()=>{
  const p=setup(),t=b.p2.active[1];p.setAbility('Punk Rock');p.storedStats.atk=110;p.storedStats.spa=100;t.storedStats.def=t.storedStats.spd=100;
  const m=b.dex.getActiveMove('relicsong');require('../../../dist/data/meloetta-encore').prepareMeloettaMove(m,p);
  const before=JSON.stringify({seed:b.prng.getSeed(),hp:t.hp,boosts:p.boosts,log:b.log});
  const v=require('../../../dist/sim/encore-aria').encoreAriaView(m,p,t);assert.equal(v.category,'Special');
  assert.equal(JSON.stringify({seed:b.prng.getSeed(),hp:t.hp,boosts:p.boosts,log:b.log}),before);
 });
});

describe('Encore mixed branch copying',()=>{let b;afterEach(()=>b?.destroy());
 it('Dancer and Songstress copy their branches; Performer copies the mixed move once',()=>{
  b=common.createBattle({gameType:'doubles'},[[{species:'Meloetta-Encore',ability:'Performer',moves:['relicsong']},{species:'Mew',ability:'Performer',moves:['splash']}],[{species:'Blissey',ability:'Dancer',moves:['splash']},{species:'Steelix',ability:'Songstress',moves:['splash']}]]);
  const p=b.p1.active[0],[a,z]=b.p2.active;a.storedStats.def=30;a.storedStats.spd=400;z.storedStats.def=400;z.storedStats.spd=30;
  b.p1.addSideCondition('safeguard',p);b.p2.addSideCondition('safeguard',a);
  const holders=b.getAllActive();const pp=holders.map(p=>p.moveSlots.map(m=>m.pp));
  b.actions.runMove('relicsong',p,1);
  for(const label of ['Dancer','Songstress','Performer'])assert.equal(b.log.filter(l=>l.startsWith('|move|')&&l.includes('[from] ability: '+label)).length,1,b.log.join('\n'));
  assert.deepEqual(holders.slice(1).map(p=>p.moveSlots.map(m=>m.pp)),pp.slice(1));
 });
 it('ordinary Relic Song still changes normal Meloetta into Pirouette',()=>{
  b=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Meloetta',ability:'Songstress',moves:['relicsong']}],[{species:'Blissey',ability:'No Ability',moves:['splash']}]]);b.makeChoices('team 1','team 1');b.makeChoices('move 1','move 1');assert.equal(b.p1.active[0].species.id,'meloettapirouette');assert.equal(b.p1.active[0].ability,'dancer');
 });
});
