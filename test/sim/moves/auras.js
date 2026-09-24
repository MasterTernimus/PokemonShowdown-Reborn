'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
function setup(field = 'rockyterrain', ability = 'No Ability', item = '') {
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
		[{species: 'Mew', ability, item, moves: ['splash', 'electricterrain', 'defog', 'terrainpulse']}],
		[{species: 'Mew', ability: 'No Ability', moves: ['splash', 'quickattack', 'spore']}],
	]);
	battle.makeChoices('team 1', 'team 1');
	if (field) battle.field.startTerrain(field);
	return [battle.p1.active[0], battle.p2.active[0]];
}
function power(id) {
	const [p, foe] = [battle.p1.active[0], battle.p2.active[0]];
	const move = battle.dex.getActiveMove(id);
	battle.singleEvent('ModifyType', move, null, p, foe, move, move);
	battle.singleEvent('ModifyMove', move, null, p, foe, move, move);
	battle.runEvent('ModifyMove', p, foe, move, move);
	return {move, power: battle.runEvent('BasePower', p, foe, move, 100, true)};
}
describe('Terrain Auras', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('creates an Aura from a terrain move without replacing or restarting the base field', () => {
		setup('factoryterrain');
		const baseState = battle.field.terrainState;
		battle.makeChoices('move electricterrain', 'move splash');
		assert.equal(battle.field.baseField, 'factoryterrain');
		assert.equal(battle.field.auraField, 'electricterrain');
		assert.equal(battle.field.auraTurns, 4);
		assert.equal(battle.field.terrainState, baseState);
	});
	it('refreshes and replaces a single Aura, then expires independently', () => {
		const [p] = setup();
		battle.field.setAura('electricterrain', 5, p);
		battle.field.setAura('electricterrain', 3, p);
		assert.equal(battle.field.auraTurns, 3);
		battle.field.setAura('grassyterrain', 1, p);
		battle.makeChoices('move splash', 'move splash');
		assert.equal(battle.field.auraField, '');
		assert.equal(battle.field.auraTurns, 0);
		assert.equal(battle.field.auraRoll, null);
		assert.equal(battle.field.terrain, 'rockyterrain');
	});
	for (const field of ['newworldterrain', 'underwaterterrain', 'midnightzoneterrain', 'dragonsdenterrain', 'flowergarden2']) {
		it(`preserves ${field}'s Aura restrictions`, () => {
			const [p] = setup(field);
			assert.equal(battle.field.setAura('electricterrain', 5, p), false);
		});
	}
	it('does not duplicate its base field, and supports permanent or forced full fields', () => {
		const [p] = setup('electricterrain');
		assert.equal(battle.field.setAura('electricterrain', 5, p), false);
		assert.equal(battle.field.setFieldOrAura('mistyterrain', 0, p), true);
		assert.equal(battle.field.terrain, 'mistyterrain');
		assert.equal(battle.field.auraField, '');
		assert.equal(battle.field.setFieldOrAura('grassyterrain', 5, p, null, true), true);
		assert.equal(battle.field.terrain, 'grassyterrain');
	});
	it('keeps ordinary terrain behavior when there is no base field', () => {
		const [p] = setup('');
		battle.field.setTerrain('grassyterrain', p);
		assert.equal(battle.field.terrain, 'grassyterrain');
		assert.equal(battle.field.auraField, '');
	});
	it('uses the stronger shared type boost with a 1.5 minimum', () => {
		const [p] = setup('factoryterrain');
		battle.field.setAura('electricterrain', 5, p);
		assert.equal(power('thunderbolt').power, 150);
	});
	it('does not multiply two Grass type-wide boosts', () => {
		const [p] = setup('forestterrain');
		battle.field.setAura('grassyterrain', 5, p);
		assert.equal(power('energyball').power, 150);
	});
	it('stacks move-specific boosts with the base field', () => {
		const [p] = setup('coldeclipseterrain');
		battle.field.setAura('grassyterrain', 5, p);
		assert.equal(power('icywind').power, 450);
	});
	it('preserves base-field secondary types when Electric Aura adds its type', () => {
		const [p] = setup('coldeclipseterrain');
		battle.field.setAura('electricterrain', 5, p);
		assert.deepEqual(power('surf').move.types, ['Water', 'Ice', 'Electric']);
		assert.equal(power('wildboltstorm').move.types, undefined);
	});
	it('does not boost airborne users with grounded Aura type bonuses', () => {
		const [p] = setup();
		p.setType('Flying');
		battle.field.setAura('grassyterrain', 5, p);
		assert.equal(power('energyball').power, 100);
		battle.field.setAura('mistyterrain', 5, p);
		assert.equal(power('moonblast').power, 130);
	});
	it('adds Grassy healing without seeds or Earthquake reduction', () => {
		const [p] = setup('factoryterrain', 'No Ability', 'grassyseed');
		p.hp -= 100;
		const hp = p.hp;
		battle.field.setAura('grassyterrain', 5, p);
		battle.makeChoices('move splash', 'move splash');
		assert.equal(p.hp, hp + Math.floor(p.baseMaxhp / 16));
		assert.equal(p.item, 'grassyseed');
		assert.equal(power('earthquake').power, 130);
	});
	it('does not add Electric sleep protection', () => {
		const [p] = setup();
		battle.field.setAura('electricterrain', 5, p);
		battle.makeChoices('move splash', 'move spore');
		assert.equal(p.status, 'slp');
	});
	it('refreshes Mimicry on both Aura creation and removal', () => {
		const [p] = setup('rockyterrain', 'Mimicry');
		assert.deepEqual(p.getTypes(), ['Rock']);
		battle.field.setAura('mistyterrain', 5, p);
		assert.deepEqual(p.getTypes(), ['Fairy']);
		battle.field.clearAura();
		assert.deepEqual(p.getTypes(), ['Rock']);
	});
	it('refreshes Quark Drive without running base-field entry effects', () => {
		const [p] = setup('factoryterrain', 'Quark Drive');
		battle.field.setAura('electricterrain', 5, p);
		assert(p.volatiles.quarkdrive);
		battle.field.clearAura();
		assert(!p.volatiles.quarkdrive);
	});
	it('uses Rainbow Aura for Terrain Pulse typing and doubled power', () => {
		const [p] = setup('coldeclipseterrain');
		battle.field.setAura('rainbowterrain', 5, p);
		const result = power('terrainpulse');
		assert.equal(result.move.type, 'Dragon');
		assert.equal(result.power, 400);
	});
	it('removes an Aura with Defog while preserving its base field', () => {
		const [p] = setup('factoryterrain');
		battle.field.setAura('grassyterrain', 5, p);
		battle.makeChoices('move defog', 'move splash');
		assert.equal(battle.field.auraField, '');
		assert.equal(battle.field.terrain, 'factoryterrain');
	});
	it('removes an incompatible Aura on a full field change', () => {
		const [p] = setup('factoryterrain');
		battle.field.setAura('electricterrain', 5, p);
		battle.field.changeTerrain('underwaterterrain', p);
		assert.equal(battle.field.auraField, '');
	});
});

describe('Aura follow-up fixes', () => {
 afterEach(() => { battle?.destroy(); battle = null; });
 for (const field of ['hauntedterrain', 'bewitchedwoodsterrain', 'chessboardterrain', 'glitchterrain']) {
  it('allows actual terrain moves as Auras on ' + field, () => {
   setup(field); battle.makeChoices('move electricterrain', 'move splash');
   assert.equal(battle.field.auraField, 'electricterrain'); assert.equal(battle.field.terrain, field);
  });
 }
 it('keeps an Aura indefinitely on Cold Eclipse but permits removal and resumes its timer after leaving', () => {
  const [p] = setup('coldeclipseterrain'); battle.field.setAura('grassyterrain', 2, p);
  for (let i=0;i<8;i++) battle.field.tickAura();
  assert.equal(battle.field.auraTurns, 2);
  assert(battle.log.some(line => line.includes('Grassy Aura|[aura] 0')));
  battle.field.changeTerrain('rockyterrain',p); battle.field.tickAura();
  assert.equal(battle.field.auraTurns,1); battle.field.clearAura(); assert.equal(battle.field.auraField,'');
 });
 it('preserves Booster Energy until Electric Aura ends', () => {
  const [p] = setup('factoryterrain'); battle.field.setAura('electricterrain',5,p);
  p.setAbility('quarkdrive'); p.setItem('boosterenergy');
  battle.singleEvent('Start',p.getItem(),p.itemState,p);
  assert.equal(p.item,'boosterenergy'); assert(p.volatiles.quarkdrive);
  battle.field.clearAura(); battle.singleEvent('Update',p.getItem(),p.itemState,p);
  assert.equal(p.item,''); assert(p.volatiles.quarkdrive.fromBooster);
 });
 for (const field of ['electricterrain','grassyterrain','mistyterrain','psychicterrain','rainbowterrain']) {
  it('doubles Terrain Pulse on full '+field, () => {
   setup(field); const [p,t]=[battle.p1.active[0],battle.p2.active[0]];
   const move=battle.dex.getActiveMove('terrainpulse');
   battle.singleEvent('ModifyType',move,null,p,t,move,move);
   const bp=battle.runEvent('BasePower',p,t,move,50,true);
   assert.equal(bp,field==='rainbowterrain'?100:150);
  });
 }
 for (const [field,id] of [['grassyterrain','razorwind'],['rainbowterrain','prismaticlaser']]) {
  it('boosts '+id+' on '+field,()=>{setup(field); assert.equal(power(id).power,150);});
 }
});

describe('Newly compatible Aura type overlaps',()=>{afterEach(()=>{battle?.destroy();battle=null;});for(const [field,aura,move] of [['bewitchedwoodsterrain','mistyterrain','fairywind'],['glitchterrain','psychicterrain','psychic']])it(field,()=>{const [p]=setup(field);battle.field.setAura(aura,5,p);assert.equal(power(move).power,150);});});

describe('Full-field move exceptions',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const [move,field] of [['stokedsparksurfer','electricterrain'],['bloomdoom','grassyterrain'],['genesissupernova','psychicterrain']]){
  it(move+' creates a full field',()=>{const [p,t]=setup('factoryterrain');battle.actions.runMove(move,p,1,{externalMove:true});assert.equal(battle.field.terrain,field);assert.equal(battle.field.auraField,'');});
 }
 for(const moves of [['firepledge','waterpledge'],['waterpledge','firepledge']]){
  it(moves.join(' then ')+' creates full Rainbow',()=>{const [p,t]=setup('factoryterrain');for(const move of moves)battle.actions.runMove(move,p,1,{externalMove:true});assert.equal(battle.field.terrain,'rainbowterrain');assert.equal(battle.field.auraField,'');});
 }
 for(const moves of [['raindance','sunnyday'],['sunnyday','raindance']]){
  it(moves.join(' then ')+' creates Rainbow Aura',()=>{const [p]=setup('factoryterrain');for(const move of moves)battle.actions.useMove(move,p);assert.equal(battle.field.terrain,'factoryterrain');assert.equal(battle.field.auraField,'rainbowterrain');});
 }
 it('Ion Deluge remains an Aura on an existing field',()=>{const [p]=setup('rockyterrain');battle.actions.runMove('iondeluge',p,0,{externalMove:true});assert.equal(battle.field.terrain,'rockyterrain');assert.equal(battle.field.auraField,'electricterrain');});
 for(const [ability,field] of [['electricsurge','electricterrain'],['grassysurge','grassyterrain'],['mistysurge','mistyterrain'],['psychicsurge','psychicterrain']]){
  for(const base of ['factoryterrain',''])it(ability+' on '+(base||'no field'),()=>{const [p]=setup(base);p.setAbility(ability);assert.equal(battle.field.terrain,base||field);assert.equal(battle.field.auraField,base?field:'');});
 }
});

describe('Aura healing, Speed, and promotion',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('does not heal airborne Pokemon',()=>{const [p]=setup('rockyterrain');p.setType('Flying');p.hp-=100;const hp=p.hp;battle.field.setAura('grassyterrain',5,p);battle.makeChoices('move splash','move splash');assert.equal(p.hp,hp);});
 it('doubles Telepathy Speed only while Psychic Aura is active',()=>{const [p]=setup('rockyterrain','Telepathy');const speed=p.getStat('spe');battle.field.setAura('psychicterrain',5,p);assert.equal(p.getStat('spe'),speed*2);battle.field.clearAura();assert.equal(p.getStat('spe'),speed);});
 for(const item of ['', 'amplifieldrock'])it('Gravity promotes Aura for '+(item?8:5)+' turns',()=>{const [p]=setup('rockyterrain','No Ability',item);battle.field.setAura('grassyterrain',2,p);battle.actions.runMove('gravity',p,0,{externalMove:true});assert.equal(battle.field.terrain,'grassyterrain');assert.equal(battle.field.auraField,'');assert.equal(battle.field.terrainState.duration,item?8:5);});
 it('distinct Electric moves promote while repeated Plasma Fists only refreshes',()=>{const [p]=setup('rockyterrain');battle.actions.runMove('plasmafists',p,1,{externalMove:true});battle.actions.runMove('plasmafists',p,1,{externalMove:true});assert.equal(battle.field.terrain,'rockyterrain');assert.equal(battle.field.auraState.sourceEffect.id,'plasmafists');battle.actions.runMove('electricterrain',p,0,{externalMove:true});assert.equal(battle.field.terrain,'electricterrain');assert.equal(battle.field.auraField,'');});
 it('Ion Deluge plus Electric Terrain promotes',()=>{const [p]=setup('rockyterrain');battle.actions.runMove('iondeluge',p,0,{externalMove:true});battle.actions.runMove('electricterrain',p,0,{externalMove:true});assert.equal(battle.field.terrain,'electricterrain');});
 it('repeated Psychic Surge stays an Aura',()=>{const [p]=setup('rockyterrain');p.setAbility('psychicsurge');battle.singleEvent('Start',p.getAbility(),p.abilityState,p);assert.equal(battle.field.terrain,'rockyterrain');assert.equal(battle.field.auraField,'psychicterrain');});
 for(const field of ['factoryterrain','shortcircuitterrain','chessboardterrain','glitchterrain','hauntedterrain','bewitchedwoodsterrain'])it('preserves '+field+' against promotion',()=>{const [p]=setup(field);battle.field.setAura('electricterrain',5,p,battle.dex.moves.get('iondeluge'));battle.field.setAura('electricterrain',5,p,battle.dex.moves.get('electricterrain'));assert.equal(battle.field.terrain,field);assert.equal(battle.field.auraField,'electricterrain');battle.actions.runMove('gravity',p,0,{externalMove:true});assert.equal(battle.field.terrain,field);assert.equal(battle.field.auraField,'electricterrain');});
 it('restores the underlying field when the promoted field expires',()=>{const [p]=setup('rockyterrain');battle.field.setAura('grassyterrain',2,p);battle.actions.runMove('gravity',p,0,{externalMove:true});battle.field.removePseudoWeather('gravity');for(let i=0;i<5;i++)battle.makeChoices('move splash','move splash');assert.equal(battle.field.terrain,'rockyterrain');assert.equal(battle.field.auraField,'');});
});

describe('Weather-created Aura refresh',()=>{afterEach(()=>{battle?.destroy();battle=null;});it('alternating rain and sun keeps Rainbow as an Aura',()=>{const [p]=setup('rockyterrain');for(const move of ['raindance','sunnyday','raindance'])battle.actions.runMove(move,p,0,{externalMove:true});assert.equal(battle.field.terrain,'rockyterrain');assert.equal(battle.field.auraField,'rainbowterrain');});});

describe('Gravity-source Aura conversion',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const effect of ['lunarorbit','gmaxgravitas'])for(const active of [false,true])for(const item of ['', 'amplifieldrock']) {
  it(effect+' converts with existing Gravity='+active+' and item='+item,()=>{
   const [p]=setup('rockyterrain','No Ability',item);
   if(active)battle.field.addPseudoWeather('gravity',p,battle.dex.moves.get('gravity'));
   battle.field.setAura('grassyterrain',2,p);
   if(effect==='lunarorbit')p.setAbility(effect);
   else battle.actions.runMove(effect,p,1,{externalMove:true});
   assert.equal(battle.field.terrain,'grassyterrain');assert.equal(battle.field.auraField,'');
   assert.equal(battle.field.terrainState.duration,item?8:5);
  });
 }
 for(const effect of ['lunarorbit','gmaxgravitas'])it(effect+' preserves Factory and its Electric Aura',()=>{
  const [p]=setup('factoryterrain');battle.field.setAura('electricterrain',5,p);
  if(effect==='lunarorbit')p.setAbility(effect);else battle.actions.runMove(effect,p,1,{externalMove:true});
  assert.equal(battle.field.terrain,'factoryterrain');assert.equal(battle.field.auraField,'electricterrain');
 });
});

describe('Gravity conversion requires an activation',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('leaves an Aura alone under active Gravity until the move is used again',()=>{
  const [p]=setup('rockyterrain');battle.actions.runMove('gravity',p,0,{externalMove:true});
  battle.field.setAura('grassyterrain',5,p,battle.dex.moves.get('grassyterrain'));
  battle.field.tickAura();assert.equal(battle.field.terrain,'rockyterrain');assert.equal(battle.field.auraField,'grassyterrain');
  const remaining=battle.field.pseudoWeather.gravity.duration;
  battle.actions.runMove('gravity',p,0,{externalMove:true});
  assert.equal(battle.field.terrain,'grassyterrain');assert.equal(battle.field.auraField,'');assert.equal(battle.field.terrainState.duration,5);
  assert.equal(battle.field.pseudoWeather.gravity.duration,remaining);
 });
 it('does not passively convert a new Aura while Lunar Orbit remains active',()=>{
  const [p]=setup('rockyterrain');p.setAbility('lunarorbit');battle.field.setAura('psychicterrain',5,p,battle.dex.moves.get('psychicterrain'));
  battle.actions.runMove('celebrate',p,0,{externalMove:true});battle.field.tickAura();
  assert.equal(battle.field.terrain,'rockyterrain');assert.equal(battle.field.auraField,'psychicterrain');
  battle.singleEvent('Start',p.getAbility(),p.abilityState,p);
  assert.equal(battle.field.terrain,'psychicterrain');assert.equal(battle.field.auraField,'');
 });
});

describe('Aura compatibility across field transitions',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const aura of ['electricterrain','grassyterrain','mistyterrain','psychicterrain','rainbowterrain'])it(aura+' is removed when Gravity sinks Water Surface',()=>{
  const [p]=setup('watersurfaceterrain');battle.field.setAura(aura,4,p);battle.field.auraRoll=2;
  battle.actions.runMove('gravity',p,0,{externalMove:true});
  assert.equal(battle.field.terrain,'underwaterterrain');assert.equal(battle.field.auraField,'');assert.equal(battle.field.auraTurns,0);assert.equal(battle.field.auraRoll,null);
 });
 for(const destination of ['watersurfaceterrain','forestterrain','hauntedterrain','bewitchedwoodsterrain','chessboardterrain','glitchterrain'])it('preserves Aura state on transition to '+destination,()=>{
  const [p]=setup('rockyterrain');const effect=battle.dex.moves.get('electricterrain');battle.field.setAura('electricterrain',3,p,effect);battle.field.auraRoll=2;const state=battle.field.auraState;
  assert(battle.field.changeTerrain(destination,p));assert.equal(battle.field.auraField,'electricterrain');assert.equal(battle.field.auraTurns,3);assert.equal(battle.field.auraRoll,2);assert.equal(battle.field.auraState,state);
 });
 for(const destination of ['newworldterrain','midnightzoneterrain','dragonsdenterrain','flowergarden2'])it('clears Aura on unsupported '+destination,()=>{
  const [p]=setup('rockyterrain');battle.field.setAura('grassyterrain',3,p);assert(battle.field.changeTerrain(destination,p));assert.equal(battle.field.auraField,'');
 });
 it('clears only incompatible Misty Aura on entering Corrosive Mist',()=>{
  const [p]=setup('rockyterrain');battle.field.setAura('mistyterrain',3,p);battle.field.changeTerrain('corrosivemistterrain',p);assert.equal(battle.field.auraField,'');
  battle.field.changeTerrain('rockyterrain',p);battle.field.setAura('grassyterrain',3,p);battle.field.changeTerrain('corrosivemistterrain',p);assert.equal(battle.field.auraField,'grassyterrain');
 });
 it('refreshes Mimicry after submerging removes its Aura',()=>{
  const [p]=setup('watersurfaceterrain','Mimicry');battle.field.setAura('mistyterrain',3,p);assert.deepEqual(p.getTypes(),['Fairy']);battle.actions.runMove('gravity',p,0,{externalMove:true});assert.deepEqual(p.getTypes(),['Water']);
 });
});

describe('Misty and Psychic Aura protections and direct boosts',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('Misty Aura boosts Fairy Special Defense without grounding requirements',()=>{const [p]=setup('rockyterrain');p.setType(['Fairy','Flying']);const spd=p.getStat('spd');battle.field.setAura('mistyterrain',5,p);assert.equal(p.getStat('spd'),Math.floor(spd*1.5));p.setType('Normal');assert.equal(p.getStat('spd'),spd);});
 it('Psychic Aura allows opposing priority against grounded targets',()=>{const [p]=setup('rockyterrain');battle.field.setAura('psychicterrain',5,p);const hp=p.hp;battle.makeChoices('move splash','move quickattack');assert(p.hp<hp);});
 it('full Psychic Terrain still blocks opposing priority for grounded targets',()=>{const [p]=setup('psychicterrain');const hp=p.hp;battle.makeChoices('move splash','move quickattack');assert.equal(p.hp,hp);});
 it('Psychic Aura does not block priority against airborne targets',()=>{const [p]=setup('rockyterrain');p.setType('Flying');battle.field.setAura('psychicterrain',5,p);const hp=p.hp;battle.makeChoices('move splash','move quickattack');assert(p.hp<hp);});
 it('Expanding Force gains both its own boost and Psychic Aura boost',()=>{const [p]=setup('rockyterrain');battle.field.setAura('psychicterrain',5,p);assert.equal(power('expandingforce').power,195);assert.equal(power('expandingforce').move.target,'allAdjacentFoes');p.setType('Flying');assert.equal(power('expandingforce').power,100);assert.equal(power('expandingforce').move.target,'allAdjacentFoes');});
 it('Rising Voltage gains its own doubling against grounded targets',()=>{const [p,t]=setup('rockyterrain');battle.field.setAura('electricterrain',5,p);const move=battle.dex.getActiveMove('risingvoltage');assert.equal(move.basePowerCallback.call(battle,p,t,move),140);assert.equal(power('risingvoltage').power,130);t.setType('Flying');assert.equal(move.basePowerCallback.call(battle,p,t,move),70);assert.equal(power('risingvoltage').power,130);});
});

describe('Aura audit regressions', () => {
 afterEach(() => { battle?.destroy(); battle = null; });
 for (const [attack, terrain] of [['maxlightning','electricterrain'],['maxovergrowth','grassyterrain'],['maxmindstorm','psychicterrain'],['maxstarfall','mistyterrain']]) {
  it('records the Max Move source for ' + terrain + ' promotion', () => {
   const [p] = setup(); p.addVolatile('dynamax');
   battle.actions.runMove(attack, p, 1, {externalMove: true});
   assert.equal(battle.field.auraField, terrain);
   assert(battle.field.auraState.sourceEffect.id.startsWith('max'));
   battle.actions.runMove(attack, p, 1, {externalMove: true});
   assert.equal(battle.field.terrain, 'rockyterrain');
   battle.field.setTerrain(terrain, p, battle.dex.moves.get(terrain));
   assert.equal(battle.field.terrain, terrain);
   assert.equal(battle.field.auraField, '');
  });
 }
 for (const field of ['rockyterrain', 'coldeclipseterrain']) {
  it('lets Electrify override Rainbow Aura Terrain Pulse on ' + field, () => {
   const [p, foe] = setup(field);
   battle.field.setAura('rainbowterrain', 5, p, battle.dex.moves.get('raindance'));
   assert.equal(power('terrainpulse').move.type, 'Dragon');
   p.addVolatile('electrify', foe);
   const move = battle.dex.getActiveMove('terrainpulse');
   battle.singleEvent('ModifyType', move, null, p, foe, move, move);
   battle.runEvent('ModifyType', p, foe, move, move);
   battle.singleEvent('ModifyMove', move, null, p, foe, move, move);
   battle.runEvent('ModifyMove', p, foe, move, move);
   assert.equal(move.type, 'Electric');
  });
 }
 it('preserves permanent status across transitions and temporary-field restoration', () => {
  const [p] = setup();
  battle.makeChoices('move splash', 'move splash');
  assert.equal(battle.field.terrainState.permanent, true);
  battle.field.changeTerrain('caveterrain', p);
  assert.equal(battle.field.terrainState.permanent, true);
  battle.field.setFieldOrAura('electricterrain', 5, p, battle.dex.moves.get('electricterrain'), true);
  assert.equal(battle.field.terrainState.permanent, false);
  battle.field.clearTerrain();
  assert.equal(battle.field.terrain, 'caveterrain');
  assert.equal(battle.field.terrainState.permanent, true);
 });
});
