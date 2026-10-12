'use strict';
const assert=require('assert').strict,common=require('../../common');
const {Dex}=require('../../../dist/sim');
const {YangSignatureMovesB,YangSignatureLearnsetsB,YangSignatureCreditsB}=require('../../../dist/data/yang-signature-moves-b');
let battle;
function setup(gameType='singles',foeAbility='No Ability'){
 const mon=(species='Mew')=>({species,ability:'No Ability',moves:['splash','tackle','sirenswrath','nostraswish']});
 battle=common.createBattle({gameType},[[mon(),mon(),mon()],[{...mon(),ability:foeAbility},mon(),mon()]]);
 if(battle.requestState==='teampreview')battle.makeChoices();battle.field.terrain='';
 for(const side of battle.sides)for(const p of side.pokemon)p.hp=p.maxhp=p.baseMaxhp=2000;
 return[battle.p1.active[0],battle.p2.active[0]];
}
function use(id,p,q,extra={}){battle.actions.useMove(Object.assign(Dex.getActiveMove(id),{willCrit:false},extra),p,{target:q});return battle.activeMove;}
describe('Yang signature moves 15–27',()=>{

 for (const id of ['swarmsnare','wisteriamaelstrom','airstreamassault','dragonrend','sirenswrath']) {
  for (const mode of ['Physical','Special','tie']) it(id+' uses staged '+mode+' offense and matching defense, preserving its effect',()=>{
   const [p,q]=setup(); battle.randomizer=n=>n;
   p.storedStats.atk=150;p.storedStats.spa=150;
   if(mode==='Physical')p.boosts.atk=1;if(mode==='Special')p.boosts.spa=1;
   q.storedStats.def=100;q.storedStats.spd=250;
   if(id==='wisteriamaelstrom')p.setType('Grass');
   if(id==='airstreamassault')p.side.addSideCondition('spikes',q);
   const category=mode==='Physical'?'Physical':'Special';
   const expected=battle.actions.getDamage(p,q,Object.assign(Dex.getActiveMove(id),{category,willCrit:false}));
   const wrong=battle.actions.getDamage(p,q,Object.assign(Dex.getActiveMove(id),{category:category==='Physical'?'Special':'Physical',willCrit:false}));
   assert.notEqual(expected,wrong,'fixture distinguishes matching defenses');
   const hp=q.hp,move=use(id,p,q);assert.equal(move.category,category);assert.equal(hp-q.hp,expected);
   if(id==='swarmsnare')assert.equal(q.volatiles.partiallytrapped.duration,4);
   if(id==='wisteriamaelstrom')assert.equal(p.boosts[category==='Physical'?'atk':'spa'],mode==='tie'?1:2);
   if(id==='airstreamassault'){assert(!p.side.sideConditions.spikes);assert(p.side.sideConditions.tailwind);}
   if(id==='dragonrend')assert(q.side.sideConditions.dragonrend);
   if(id==='sirenswrath')assert(p.volatiles.sirenswrath);
  });
 }
 it('Airstream keeps adaptive category and perfect accuracy together in Strong Winds',()=>{
  const[p,q]=setup();battle.field.setWeather('deltastream',p);p.boosts.atk=2;
  const move=use('airstreamassault',p,q);assert.equal(move.category,'Physical');assert.equal(move.accuracy,true);
 });
 it('Nostras setup is 140 BP, 100 accuracy, +1 priority while pending PP remains 10',()=>{
  const m=Dex.moves.get('nostraswish');assert.equal(m.basePower,140);assert.equal(m.accuracy,100);assert.equal(m.priority,1);assert.equal(m.pp,10);
  const[p,q]=setup();p.storedStats.spe=1;q.storedStats.spe=400;battle.makeChoices('move nostraswish','move splash');
  const lines=battle.log.filter(x=>x.startsWith('|move|'));assert(lines[0].includes('Nostras Wish'));
 });
 for(const type of ['Steel','Steel/Dragon','Steel/Fire','Normal'])it('Nostras delayed Steel override and dual typing '+type,()=>{
  const[p,q]=setup();battle.randomizer=n=>n;q.setType(type.split('/'));use('nostraswish',p,q);
  const slot=q.side.slotConditions[q.position].futuremove,stored=slot.moveData;
  assert.equal(stored.basePower,140);assert.equal(stored.accuracy,100);assert.equal(stored.priority,0);
  assert.equal(stored.onEffectiveness.call(battle,-1,q,'Steel'),undefined);assert.equal(Dex.moves.get('nostraswish').onEffectiveness.call(battle,-1,q,'Steel'),undefined);
  const actual=battle.actions.getDamage(p,q,Object.assign(Dex.getActiveMove(stored),{willCrit:false}));
  const native=battle.actions.getDamage(p,q,Object.assign(Dex.getActiveMove(stored),{willCrit:false,onEffectiveness:undefined}));
  assert.equal(actual,native);
  const hp=q.hp;battle.turn=slot.endingTurn+1;battle.singleEvent('Residual',Dex.conditions.get('futuremove'),slot,q);assert(q.hp<hp);
 });


 it('Nostras odd-HP healing snapshots the original caster and heals its replacement position',()=>{
  const[p,q]=setup();p.hp=p.maxhp=p.baseMaxhp=2001;use('nostraswish',p,q);
  const state=p.side.slotConditions[p.position].wish;assert.equal(state.hp,1001);
  p.maxhp=4000;const recipient=p.side.pokemon[1];battle.actions.switchIn(recipient,0);recipient.hp=500;
  assert.equal(recipient.side.slotConditions[0].wish,state);recipient.side.removeSlotCondition(recipient,'wish');assert.equal(recipient.hp,1501);
 });
 it('Nostras does not overwrite an existing Wish healing snapshot',()=>{
  const[p,q]=setup();p.hp=p.maxhp=p.baseMaxhp=2001;p.side.addSlotCondition(p,'wish',p);const state=p.side.slotConditions[0].wish;
  assert.equal(state.hp,1000.5);use('nostraswish',p,q);assert.equal(state.hp,1000.5);assert(q.side.slotConditions[0].futuremove);
 });
 it('Nostras preserves native field-enhanced three-quarter healing',()=>{
  const[p,q]=setup();p.hp=p.maxhp=p.baseMaxhp=2001;battle.field.terrain='mistyterrain';use('nostraswish',p,q);
  assert.equal(p.side.slotConditions[0].wish.hp,2001*3/4);
 });
 it('Ordinary Wish retains its native unrounded half-HP snapshot',()=>{
  const[p,q]=setup();p.hp=p.maxhp=p.baseMaxhp=2001;use('wish',p,p);assert.equal(p.side.slotConditions[0].wish.hp,1000.5);
 });

 afterEach(()=>{battle?.destroy();battle=null;});
 it('has 13 unique IDs and corrected exact distribution',()=>{
  assert.equal(Object.keys(YangSignatureMovesB).length,13);
  assert.deepEqual(Object.values(YangSignatureMovesB).map(m=>m.num),Array.from({length:13},(_,i)=>10449+i));
  assert.deepEqual(YangSignatureLearnsetsB.nostraswish,['jirachi','hatterene','altaria','gardevoir','ninetalesalola']);
  assert(YangSignatureLearnsetsB.sirenswrath.includes('basculegion'));assert(YangSignatureLearnsetsB.sirenswrath.includes('basculegionf'));
  for(const[id,users]of Object.entries(YangSignatureLearnsetsB)){assert(YangSignatureCreditsB[id]);for(const user of users)assert(Dex.species.get(user).exists,user);}
 });
 it('M3G4QU4K3 damages allies but only debuffs foes',()=>{const[p,q]=setup('doubles'),ally=battle.p1.active[1];use('m3g4qu4k3',p,q,{damage:100});assert(ally.hp<2000);assert.equal(ally.boosts.def,0);assert.equal(ally.boosts.spd,0);assert.equal(q.boosts.def,-1);assert.equal(q.boosts.spd,-1);});
 it('Wind Dance sets exactly four move-attributed turns and gains priority only from existing winds',()=>{const[p,q]=setup();p.setItem('Damp Rock');const move=Dex.getActiveMove('winddance');assert.equal(battle.singleEvent('ModifyPriority',move,{},p,q,move,0),0);use('winddance',p,q);assert.equal(battle.field.weather,'deltastream');assert.equal(battle.field.weatherState.duration,4);assert.equal(battle.singleEvent('ModifyPriority',move,{},p,q,move,0),1);assert(battle.log.some(x=>x.includes('-weather')&&x.includes('[from] move: Wind Dance')));});
 it('Time Blade compares staged stats and applies two-turn eligible Encore',()=>{const[p,q]=setup();q.lastMove=Dex.getActiveMove('tackle');p.storedStats.atk=200;p.storedStats.spa=100;const move=use('timeblade',p,q);assert.equal(move.category,'Physical');assert.equal(q.volatiles.encore.duration,2);});
 it('Time Blade cannot Encore an ineligible last move or bypass Substitute',()=>{const[p,q]=setup();q.lastMove=null;use('timeblade',p,q);assert(!q.volatiles.encore);q.lastMove=Dex.getActiveMove('tackle');q.addVolatile('substitute');q.volatiles.substitute.hp=1000;use('timeblade',p,q);assert(!q.volatiles.encore);});
 it('Crest Cleave removes a removable item, drains one third and never boosts base power',()=>{const[p,q]=setup();p.hp=1000;q.setItem('Leftovers');const m=use('crestcleave',p,q,{damage:300});assert.equal(q.item,'');assert.equal(p.hp,1100);assert.equal(m.basePower,65);});
 for(const protection of ['normal','shield','unsuppressible'])it('Siren Veil suppression '+protection,()=>{const[p,q]=setup('singles',protection==='unsuppressible'?'Multitype':'Levitate');if(protection==='shield')q.setItem('Ability Shield');use('sirensveil',p,p);assert.equal(p.boosts.def,1);assert.equal(p.boosts.spd,1);assert.equal(!!q.volatiles.gastroacid,protection==='normal');});
 for(const protection of ['protect','substitute'])it('Siren Veil respects '+protection+' while keeping its self boosts',()=>{const[p,q]=setup();q.setAbility('Levitate');q.addVolatile(protection);use('sirensveil',p,p);assert.equal(p.boosts.def,1);assert(!q.volatiles.gastroacid);});
 it('Siren Wrath ignores Water Absorb and its guard survives its creating AfterMove',()=>{const[p,q]=setup();q.setAbility('Water Absorb');use('sirenswrath',p,q);assert(q.hp<2000);assert(p.volatiles.sirenswrath);battle.runEvent('AfterMove',p,q,Dex.getActiveMove('sirenswrath'));assert(p.volatiles.sirenswrath);});
 it('Siren Wrath guard reduces a whole multihit attack once, then is consumed',()=>{const[p,q]=setup();use('sirenswrath',p,q);const guardMove=Dex.getActiveMove('tackle');assert.equal(battle.runEvent('ModifyDamage',q,p,guardMove,1000),750);delete p.volatiles.sirenswrath.guardedMove;delete p.volatiles.sirenswrath.guardedSource;const values=[];battle.onEvent('ModifyDamage',battle.format,-100,(damage,source,target)=>{if(target===p)values.push(damage);});use('tackle',q,p,{basePower:80,multihit:3});assert.equal(values.length,3);assert(!p.volatiles.sirenswrath);assert(values.every(n=>n>0));});
 it('Siren Wrath expires at the next own action, not after granting it',()=>{const[p,q]=setup();use('sirenswrath',p,q);assert(p.volatiles.sirenswrath);battle.actions.runMove('splash',p);assert(!p.volatiles.sirenswrath);});
 it('Rock n Roll lowers Defense and lays Stealth Rock',()=>{const[p,q]=setup();use('rocknroll',p,q);assert.equal(q.boosts.def,-1);assert(q.side.sideConditions.stealthrock);});
 for(const[type,item,expected]of [['Normal','',250],['Grass','',500],['Water','',125],['Flying','',0],['Grass','Heavy-Duty Boots',0]])it('Dragon Rend entry '+type+'/'+item,()=>{const[p,q]=setup();use('dragonrend',p,q);assert(q.side.sideConditions.dragonrend);q.setType(type);q.setItem(item);q.hp=2000;battle.singleEvent('SwitchIn',Dex.conditions.get('dragonrend'),q.side.sideConditions.dragonrend,q);assert.equal(q.hp,2000-expected);});
 it('Airstream Assault clears own hazards and starts Tailwind',()=>{const[p,q]=setup();p.side.addSideCondition('spikes',q);p.side.addSideCondition('dragonrend',q);use('airstreamassault',p,q);assert(!p.side.sideConditions.spikes);assert(!p.side.sideConditions.dragonrend);assert(p.side.sideConditions.tailwind);});
 it('Wisteria boosts each eligible ally only once over multiple hits',()=>{const[p,q]=setup('doubles'),a=battle.p1.active[1];p.setType('Grass');a.setType('Bug');p.storedStats.atk=200;p.storedStats.spa=100;a.storedStats.atk=100;a.storedStats.spa=200;use('wisteriamaelstrom',p,q,{damage:20,multihit:3});assert.equal(p.boosts.atk,1);assert.equal(a.boosts.spa,1);});
 it('Dei Ludicium cures its user after damaging a target',()=>{const[p,q]=setup();p.setStatus('psn',q);use('deiludicium',p,q);assert.equal(p.status,'');});
 for(const occupied of ['neither','attack','wish','both'])it('Nostras Wish independent occupied slots: '+occupied,()=>{const[p,q]=setup();if(['attack','both'].includes(occupied))q.side.addSlotCondition(q,'futuremove',p);if(['wish','both'].includes(occupied))p.side.addSlotCondition(p,'wish',p);const original=q.side.slotConditions[q.position].futuremove;use('nostraswish',p,q);assert(p.side.slotConditions[p.position].wish);assert(q.side.slotConditions[q.position].futuremove);if(original)assert.equal(q.side.slotConditions[q.position].futuremove,original);else{const slot=q.side.slotConditions[q.position].futuremove;assert.equal(slot.endingTurn,(battle.turn-1)+2);assert.equal(slot.moveData.basePower,140);assert.equal(slot.moveData.type,'Fairy');}});
 it('Swarm Snare uses four-turn ordinary binding and ends when its source leaves',()=>{const[p,q]=setup();use('swarmsnare',p,q);assert.equal(q.volatiles.partiallytrapped.duration,4);battle.actions.switchIn(battle.p1.pokemon[1],0);battle.singleEvent('Residual',Dex.conditions.get('partiallytrapped'),q.volatiles.partiallytrapped,q);assert(!q.volatiles.partiallytrapped);});
});

describe('Yang B adversarial timing and native dispatch',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const suppressed of [false,true])it('Wind Dance selected/synthetic-native-passive Dancer copies, no PP or recursion; selected suppression='+suppressed,()=>{
  const mon=(species,ability)=>({species,ability,moves:['winddance','splash']});
  battle=common.createBattle({gameType:'doubles'},[[mon('Mew','No Ability'),mon('Mew','Dancer')],[mon('Oricorio','No Ability'),mon('Mew','No Ability')]]);
  if(battle.requestState==='teampreview')battle.makeChoices();battle.field.terrain='';
  const[p,selected]=battle.p1.active,[native,q]=battle.p2.active;
  for(const m of battle.getAllActive())m.hp=m.maxhp=m.baseMaxhp=2000;
  native.getPassives=()=>['dancer'];assert(native.getPassives().includes('dancer'));native.addVolatile('gastroacid',p);
  if(suppressed)selected.addVolatile('gastroacid',q);
  const pp=[p,selected,native].map(m=>m.moveSlots[0].pp);
  battle.actions.runMove('winddance',p,p.getLocOf(q));
  const moves=battle.log.filter(x=>x.startsWith('|move|')&&x.includes('|Wind Dance|'));
  assert.equal(moves.length,suppressed?2:3);assert.equal(p.moveSlots[0].pp,pp[0]-1);assert.equal(selected.moveSlots[0].pp,pp[1]);assert.equal(native.moveSlots[0].pp,pp[2]);
  assert.equal(battle.field.weather,'deltastream');assert.equal(battle.field.weatherState.duration,4);
 });
 for(const ability of ['Desolate Land','Primordial Sea'])it('Wind Dance preserves native strong-weather replacement permission: '+ability,()=>{const[p,q]=setup();q.setAbility(ability);assert(battle.field.weather);use('winddance',p,q);assert.equal(battle.field.weather,'deltastream');assert.equal(battle.field.weatherState.duration,4);});
 it('Wind Dance does not shorten existing ability-driven Delta Stream',()=>{const[p,q]=setup();q.setAbility('Delta Stream');const duration=battle.field.weatherState.duration;use('winddance',p,q);assert.equal(battle.field.weatherState.duration,duration);assert.equal(battle.field.weatherState.source,q);});
 it('Wind Dance respects a rejected SetWeather event',()=>{const[p,q]=setup();battle.onEvent('SetWeather',battle.format,()=>false);use('winddance',p,q);assert.equal(battle.field.weather,'');});
 for(const failure of ['flinch','sleep','paralysis','failed','external'])it('Siren Wrath ends at the next '+failure+' action attempt',()=>{const[p,q]=setup();use('sirenswrath',p,q);assert(p.volatiles.sirenswrath);if(failure==='flinch')p.addVolatile('flinch',q);if(failure==='sleep'){p.setStatus('slp',q);p.statusState.time=3;}if(failure==='paralysis'){p.setStatus('par',q);battle.randomChance=()=>true;}battle.actions.runMove('splash',p,0,failure==='external'?{externalMove:true}:undefined);assert(!p.volatiles.sirenswrath);});
 it('Siren Wrath reduces all three actual hits to 75%, not merely the first',()=>{const[p,q]=setup();battle.randomizer=n=>n;const original=p.hp;use('tackle',q,p,{basePower:80});const baseline=original-p.hp;p.hp=2000;use('sirenswrath',p,q);const damages=[];let hp=p.hp;use('tackle',q,p,{basePower:80,multihit:3,onAfterHit(){damages.push(hp-p.hp);hp=p.hp;}});assert.equal(damages.length,3);for(const d of damages)assert(Math.abs(d-baseline*0.75)<=1,JSON.stringify({d,baseline}));assert(!p.volatiles.sirenswrath);});
 for(const faster of [false,true])it('Siren Wrath own-action boundary respects Speed ordering, holder faster='+faster,()=>{const[p,q]=setup();battle.randomizer=n=>n;p.storedStats.spe=faster?300:30;q.storedStats.spe=100;const hp=p.hp;use('tackle',q,p);const baseline=hp-p.hp;p.hp=2000;use('sirenswrath',p,q);battle.makeChoices('move splash','move tackle');const damage=2000-p.hp;assert(Math.abs(damage-baseline*(faster?1:0.75))<=1,JSON.stringify({damage,baseline}));assert(!p.volatiles.sirenswrath);});
 for(const departure of ['switch','faint'])it('Nostras Wish attack survives caster '+departure+' and Wish follows its position',()=>{const[p,q]=setup();use('nostraswish',p,q);const future=q.side.slotConditions[q.position].futuremove,recipient=p.side.pokemon[1];if(departure==='faint'){p.faint();battle.faintMessages();}battle.actions.switchIn(recipient,0);recipient.hp=500;const wish=recipient.side.slotConditions[recipient.position].wish;assert(wish);recipient.side.removeSlotCondition(recipient,'wish');assert.equal(recipient.hp,1500);const hp=q.hp;battle.turn=future.endingTurn+1;battle.singleEvent('Residual',Dex.conditions.get('futuremove'),future,q);assert(q.hp<hp);assert(!q.side.slotConditions[q.position].futuremove);});
 it('Nostras Wish safely resolves an absent Wish recipient independently of its attack',()=>{const[p,q]=setup();use('nostraswish',p,q);const future=q.side.slotConditions[q.position].futuremove;p.faint();battle.faintMessages();assert.doesNotThrow(()=>p.side.removeSlotCondition(p,'wish'));assert.equal(p.hp,0);const hp=q.hp;battle.turn=future.endingTurn+1;battle.singleEvent('Residual',Dex.conditions.get('futuremove'),future,q);assert(q.hp<hp);});
});

describe('Nostras Wish setup is not a healing move',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('has no heal flag and Triage leaves setup priority at +1',()=>{const[p,q]=setup();const move=Dex.getActiveMove('nostraswish');assert.equal(move.flags.heal,undefined);p.setAbility('Triage');assert.equal(battle.runEvent('ModifyPriority',p,q,move,move.priority),1);});
 it('Heal Block allows setup while preventing the later Wish heal, independently of the attack',()=>{const[p,q]=setup();p.hp=500;p.addVolatile('healblock',q);battle.makeChoices('move nostraswish','move splash');const future=q.side.slotConditions[q.position].futuremove;assert(future);assert(p.side.slotConditions[p.position].wish);assert.equal(p.hp,500);p.side.removeSlotCondition(p,'wish');assert.equal(p.hp,500);const hp=q.hp;battle.turn=future.endingTurn+1;battle.singleEvent('Residual',Dex.conditions.get('futuremove'),future,q);assert(q.hp<hp);assert(!q.side.slotConditions[q.position].futuremove);});
});
