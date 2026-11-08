'use strict';
const assert=require('assert').strict,common=require('../../common');const{Dex,TeamValidator}=require('../../../dist/sim');let battle;
function setup(species,ability,foeAbility='No Ability',doubles=false){const mon=(s,a)=>({species:s,ability:a,moves:['tackle','slash','surf','rockslide']});battle=common.createBattle(doubles?{gameType:'doubles'}:{formatid:'gen9nofieldsinglesgame'},[[mon(species,ability),...(doubles?[mon('Mew','No Ability')]:[])],[mon('Mew',foeAbility),mon('Mew','No Ability')]]);if(battle.requestState==='teampreview')battle.makeChoices(doubles?'team 12':'team 1','team 12');for(const s of battle.sides)for(const p of s.active)p.hp=p.maxhp=p.baseMaxhp=5000;battle.randomizer=n=>n;return[battle.p1.active[0],battle.p2.active[0]];}
function move(p,q,id='tackle',props={}){const m=Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false},props);battle.actions.runMove(m,p,p.getLocOf(q));return battle.activeMove;}

describe('Approved Fire Emblem signatures',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('has exactly the approved slots with recorded later revisions and unchanged types and stats',()=>{const slots={tinkaton:{1:'Apocalyptic Flame'},gallade:{S:'Ruptured Heaven'},skarmory:{H:'Burning Quake'},corviknight:{1:'Skywarden',H:'Steelwing Escort',S:'Burning Quake'},dusknoir:{H:'Soul Reaver'},overqwil:{1:'Swift Venom'},talonflame:{S:'Burning Quake'}};for(let old of require('../../../artifacts/fire-emblem/before.json')){old=require('./passive-approval-overlays').snapshot(old);const s=Dex.species.get(old.id);assert.deepEqual(s.abilities,{...old.abilities,...slots[old.id]},old.id);assert.deepEqual(s.passives,({golisopod:['toughclaws'],overqwil:['aftermath'],beartic:['thickfat'],corviknight:['mirrorarmor'],dragonitemega:['multiscale']}[old.id]||old.passives),old.id);assert.deepEqual(s.baseStats,old.stats);assert.deepEqual(s.types,old.types);}});
 for(const [species,ability]of [['Tinkaton','Apocalyptic Flame'],['Gallade','Ruptured Heaven'],['Skarmory','Burning Quake'],['Corviknight','Burning Quake'],['Talonflame','Burning Quake']])it(species+' legal signature and retained passive under suppression',()=>{const v=new TeamValidator('gen9nofieldsinglesgame@@@Obtainable Abilities');assert.equal(v.validateSet({species,ability,moves:['protect'],nature:'Hardy',evs:{hp:4,atk:252,spe:252}}),null);const[p,q]=setup(species,ability);p.addVolatile('gastroacid',q);assert.deepEqual(p.getPassives(),Dex.species.get(species).passives);});
 it('Beast Fang targets Sp. Def only with physical bites and slices',()=>{
  const [p,q]=setup('Absol','Beast Fang');
  const hit = (id, extra={}) => {
   const before=q.hp;
   battle.actions.useMove(Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false},extra),p,{target:q});
   return before-q.hp;
  };
  for (const id of ['bite','nightslash']) {
   q.boosts.def=q.boosts.spd=0;
   const neutral=hit(id);
   q.boosts.def=4;assert.equal(hit(id),neutral);
   q.boosts.spd=4;assert(hit(id)<neutral);
  }
  q.setType(['Dragon','Flying']);
  const mod = id => battle.runEvent('ModifyDamage',p,q,Dex.getActiveMove(id),100);
  assert.equal(mod('nightslash'),130);assert.equal(mod('bite'),130);assert.equal(mod('tackle'),100);assert.equal(mod('airslash'),100);
  hit('bite');hit('nightslash');
  assert.equal(battle.log.filter(line=>line.includes('Crest of the Beast')).length,1);
  p.addVolatile('gastroacid',q);assert.equal(mod('bite'),100);
  assert.equal(Dex.species.get('absol').abilities[1],'Beast Fang');
  assert.deepEqual(Dex.species.get('absol').passives,['omensight']);
 });
 it('Burning Quake applies one damage bonus to physical attacks against Dragon targets',()=>{
  const [p,q]=setup('Skarmory','Burning Quake');
  const mod = id => battle.runEvent('ModifyDamage',p,q,Dex.getActiveMove(id),100);
  q.setType(['Flying','Dragon']);assert.equal(mod('rockslide'),130);assert.equal(mod('airslash'),100);
  q.setType('Flying');assert.equal(mod('rockslide'),100);
  q.setType('Dragon');p.addVolatile('gastroacid',q);assert.equal(mod('rockslide'),100);
 });
 for (const id of ['fakeout','flamethrower','gigatonhammer']) {
  it('Apocalyptic Flame: ' + id + ' weakens one physical hit', () => {
   const [p,q]=setup('Tinkaton','Apocalyptic Flame');
   battle.actions.useMove(id,p,{target:q});
   assert(q.volatiles.apocalypticflame,battle.log.join("\n"));
   const damage = name => battle.runEvent('ModifyDamage',q,p,Dex.getActiveMove(name),100);
   assert.equal(damage('rockslide'),100);
   assert.equal(damage('swift'),100);
   assert.equal(damage('tackle'),75);
   assert.equal(damage('tackle'),100);
   assert.equal(q.boosts.atk,id === 'gigatonhammer' ? -1 : 0);
  });
 }
 it('Apocalyptic Flame lowers Special Attack when higher, once for the entire hammer move',()=>{
  const [p,q]=setup('Tinkaton','Apocalyptic Flame');
  q.boosts.spa=2;
  battle.actions.useMove(Object.assign(Dex.getActiveMove('gigatonhammer'),{multihit:3}),p,{target:q});
  assert.equal(q.boosts.spa,1);
  assert.equal(q.boosts.atk,0);
  assert.equal(battle.log.filter(line=>line.includes('erupted with Apocalyptic Flame')).length,1);
 });
 it('Apocalyptic Flame excludes spread marks and checks Steel damage separately for each type',()=>{
  const [p,q]=setup('Tinkaton','Apocalyptic Flame','No Ability',true);
  move(p,q,'rockslide');assert(!q.volatiles.apocalypticflame);assert(!battle.p2.active[1].volatiles.apocalypticflame);
  for (const [type,expected] of [[['Flying'],130],[['Dragon'],130],[['Flying','Dragon'],130],[['Water'],100]]) {
   q.setType(type);assert.equal(battle.runEvent('ModifyDamage',p,q,Dex.getActiveMove('ironhead'),100),expected);
  }
  p.addVolatile('gastroacid',q);move(p,q);assert(!q.volatiles.apocalypticflame);
 });
 for(const suppressed of [false,true])it('Ruptured Heaven only removes slicing contact and applies Sharpness '+suppressed,()=>{const[p,q]=setup('Gallade','Ruptured Heaven','Iron Barbs');if(suppressed)p.addVolatile('gastroacid',q);const hp=p.hp,m=move(p,q,'slash');assert.equal(!!m.flags.contact,suppressed);assert.equal(p.hp===hp,!suppressed);assert.equal(battle.runEvent('BasePower',p,q,m,100),suppressed?100:150);const before=p.hp,n=move(p,q,'tackle');assert(n.flags.contact);assert(p.hp<before);assert(!p.hasAbility('longreach'));});
	for (const species of ['Skarmory', 'Corviknight', 'Talonflame']) for (const suppressed of [false, true])it(species + ' Burning Quake critical ratio without Speed boosts ' + suppressed, () => {
		const [p, q] = setup(species, 'Burning Quake');
		if (suppressed)p.addVolatile('gastroacid', q);
		assert.equal(battle.runEvent('ModifyCritRatio', p, q, Dex.getActiveMove('tackle'), 1), suppressed ? 1 : 2);
		move(p, q, 'tackle', { willCrit: true });
		assert.equal(p.boosts.spe, 0);
		assert.equal(p.boosts.evasion, 0);
	});
	it('Burning Quake multi-hit, spread and repeated moves never grant Speed boosts', () => {
		const [p, q] = setup('Corviknight', 'Burning Quake', 'No Ability', true);
		move(p, q, 'rockslide', { willCrit: true, multihit: 3 });
		assert.equal(p.boosts.spe, 0);
		p.setAbility('No Ability');
		p.setAbility('Burning Quake');
		move(p, q, 'tackle', { willCrit: true });
		assert.equal(p.boosts.spe, 0);
		battle.turn++;
		move(p, q, 'tackle', { willCrit: true });
		assert.equal(p.boosts.spe, 0);
	});
	for (const scenario of ['noncrit', 'substitute', 'ally', 'selfKO', 'targetKO'])it('Burning Quake handles ' + scenario, () => {
		const [p, q] = setup('Skarmory', 'Burning Quake', 'No Ability', scenario === 'ally');
		const target = scenario === 'ally' ? battle.p1.active[1] : q;
		if (scenario === 'substitute') {
			q.addVolatile('substitute');
			q.volatiles.substitute.hp = 4000;
		}
		if (scenario === 'selfKO')p.hp = 1;
		if (scenario === 'targetKO')q.hp = 1;
		move(p, target, scenario === 'selfKO' ? 'doubleedge' : 'tackle', { willCrit: scenario !== 'noncrit' });
		assert.equal(p.boosts.spe, 0);
	});
 it('Burning Quake never adds a faster-than-target damage multiplier',()=>{const[p,q]=setup('Skarmory','Burning Quake');p.boosts.spe=6;assert.equal(battle.runEvent('ModifyDamage',p,q,Dex.getActiveMove('tackle'),100),100);});
});

describe('Retained recipient passives function under signature suppression',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('Tinkaton Sticky Hold prevents item removal',()=>{const[p,q]=setup('Tinkaton','Apocalyptic Flame');p.addVolatile('gastroacid',q);p.setItem('Leftovers');move(q,p,'knockoff');assert.equal(p.item,'leftovers');});
	it('Skarmory Thorn-Tempered blocks Rough Skin under suppression but permits Defense drops', () => {
		const [p, q] = setup('Skarmory', 'Burning Quake');
		p.addVolatile('gastroacid', q);
		assert.deepEqual(p.getPassives(), ['thorntempered']);
		battle.boost({ def: -1 }, p, q, Dex.moves.get('leer'));
		assert.equal(p.boosts.def, -1);
		q.setAbility('Rough Skin');
		const hp = p.hp;
		move(p, q, 'tackle');
		assert.equal(p.hp, hp);
	});
 it('Corviknight Mirror Armor reflects opposing drops under suppression',()=>{const[p,q]=setup('Corviknight','Burning Quake');p.addVolatile('gastroacid',q);battle.boost({atk:-1},p,q,Dex.moves.get('growl'));assert.equal(p.boosts.atk,0);assert.equal(q.boosts.atk,-1);});
 it('Talonflame Gale Wings still grants Flying priority under suppression',()=>{const[p,q]=setup('Talonflame','Burning Quake');p.addVolatile('gastroacid',q);assert.deepEqual(p.getPassives(),['galewings']);assert.equal(battle.runEvent('ModifyPriority',p,q,Dex.getActiveMove('bravebird'),0),1);});
 it('Gallade Steadfast still boosts Speed on flinching',()=>{const[p,q]=setup('Gallade','Ruptured Heaven');p.addVolatile('gastroacid',q);battle.runEvent('Flinch',p);assert.equal(p.boosts.spe,1);});
});
