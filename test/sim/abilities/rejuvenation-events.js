'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const { expectedCategory } = require('../../../dist/sim/expected-category');
let battle;
function setup(ability, species = 'Mew', doubles = false) {
	const mon = (s = 'Mew', a = 'No Ability') => ({ species: s, ability: a, moves: ['splash', 'tackle', 'hypervoice', 'sleeptalk'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [[mon(species, ability), mon(), mon()], [mon(), mon(), mon()]]);
	battle.makeChoices('team 123', 'team 123');
	battle.field.terrain = '';
	for (const side of battle.sides)
		for (const p of side.pokemon)
			p.hp = p.maxhp = p.baseMaxhp = 10000;
	battle.randomizer = n => n;
	return [battle.p1.active[0], battle.p2.active[0], battle.p1.active[1], battle.p2.active[1]];
}
function hit(p, t, id = 'tackle', extra = {}) {
	const m = Object.assign(Dex.getActiveMove(id), { accuracy: true, willCrit: false }, extra);
	battle.actions.useMove(m, p, { target: t });
	battle.clearActiveMove();
	return m;
}
function callback(p, event, ...args) {
	return battle.singleEvent(event, p.getAbility(), p.abilityState, ...args);
}
// Legacy event-ability cases are replaced by the approved move suite; retained abilities stay covered here.
describe('Rejuvenation move migration and retained abilities', () => {
afterEach(() => {
		battle?.destroy();
		battle = null;
	});
it('Deep Chill retains Oblivious and lowers Speed only after the whole Physical move', () => {
		const [p, t] = setup('Deep Chill');
		hit(t, p, 'taunt');
		assert(!p.volatiles.taunt);
		let during;
		const original = battle.runEvent.bind(battle);
		battle.runEvent = (event, ...args) => {
			if (event === 'DamagingHit')
				during = t.boosts.spe;
			return original(event, ...args);
		};
		hit(t, p, 'doublekick', { multihit: 3, damage: 20 });
		assert.equal(during, 0);
		assert.equal(t.boosts.spe, -1);
		assert(!t.volatiles.torment);
		hit(t, p, 'tackle', { damage: 20 });
		assert.equal(t.boosts.spe, -1);
	});
it('Deep Chill includes Special but ignores ally and Substitute-only damage', () => {
		const [p, t, ally] = setup('Deep Chill', 'Mew', true);
		hit(t, p, 'watergun', { damage: 20 });
		hit(ally, p, 'tackle', { damage: 20 });
		assert.equal(t.boosts.spe, -1);
		assert.equal(ally.boosts.spe, 0);
		p.addVolatile('substitute', p);
		hit(t, p, 'tackle', { damage: 20 });
		assert.equal(t.boosts.spe, -1);
	});
it('Venams Kiss hits and poisons Steel, respects other typing and caps drain', () => {
		const [p, t] = setup("Venam's Kiss");
		t.setType(['Steel', 'Grass']);
		p.hp = 5000;
		hit(p, t, 'sludgebomb', { damage: 900 });
		assert.equal(t.status, 'psn');
		assert.equal(p.hp, 5000);
		hit(p, t, 'sludgebomb', { damage: 9000 });
		assert.equal(p.hp, 6250);
		assert(t.volatiles.healblock);
		assert.equal(t.volatiles.healblock.duration, 2);
	});
it('Venams Kiss speed aura does not stack and ends on suppression', () => {
		const [p, t, ally] = setup("Venam's Kiss", 'Mew', true);
		ally.setAbility("Venam's Kiss");
		t.setStatus('psn');
		const base = t.getStat('spe', false, true);
		assert.equal(t.getStat('spe'), Math.floor(base * 0.75));
		p.addVolatile('gastroacid');
		assert.equal(t.getStat('spe'), Math.floor(base * 0.75));
		ally.addVolatile('gastroacid');
		assert.equal(t.getStat('spe'), base);
	});
it('Dredger removes one prioritized layer per turn and leaves other hazards', () => {
		const [p, t] = setup('Dredger');
		for (const id of ['spikes', 'spikes', 'toxicspikes', 'stealthrock', 'stickyweb'])
			p.side.addSideCondition(id, t);
		hit(p, t, 'mudslap', { damage: 20, multihit: 3 });
		assert.equal(p.side.sideConditions.spikes.layers, 1);
		assert(p.side.sideConditions.toxicspikes);
		assert(p.side.sideConditions.stealthrock);
		assert(p.side.sideConditions.stickyweb);
		hit(p, t, 'mudslap', { damage: 20 });
		assert(p.side.sideConditions.spikes);
		p.removeVolatile('dredgerturn');
		hit(p, t, 'mudslap', { damage: 20 });
		assert(!p.side.sideConditions.spikes);
		p.removeVolatile('dredgerturn');
		hit(p, t, 'mudslap', { damage: 20 });
		assert(!p.side.sideConditions.toxicspikes);
	});
it('old Grappling Claws spelling resolves Abyssal Claws without Speed drops, trapping or healing blocks', () => {
		const [p, t] = setup('Grappling Claws'); t.hp = 5000;
		const move = hit(p, t, 'tackle', {damage: 20, multihit: 3});
		assert.equal(t.boosts.spe, 0); battle.runEvent('AfterMove', p, t, move); assert.equal(t.boosts.spe, 0);
		assert(!t.volatiles.grapplingclawslock); assert.equal(battle.heal(100, t, t), 100);
		battle.runEvent('TrapPokemon', t); assert(!t.trapped);
	});
it('Grappling Claws ignores Special contact and Substitute-only damage', () => {
		const [p, t] = setup('Grappling Claws');
		let move = hit(p, t, 'tackle', {damage: 20, category: 'Special'});
		battle.runEvent('AfterMove', p, t, move); assert.equal(t.boosts.spe, 0);
		t.addVolatile('substitute', t); move = hit(p, t, 'tackle', {damage: 20});
		battle.runEvent('AfterMove', p, t, move); assert.equal(t.boosts.spe, 0);
	});
it('Venams Kiss treats Steel as a weakness without erasing the other type', () => {
		const [p, t] = setup("Venam's Kiss");
		t.setType(['Steel']);
		let hp = t.hp;
		hit(p, t, 'sludgebomb', { secondaries: null });
		const steel = hp - t.hp;
		t.cureStatus();
		t.setType(['Steel', 'Grass']);
		hp = t.hp;
		hit(p, t, 'sludgebomb', { secondaries: null });
		assert(t.hp < hp);
		assert(hp - t.hp >= steel * 1.95);
	});
it('Venams Kiss drain observes Liquid Ooze and Heal Block, and does not bypass poison protection globally', () => {
		const [p, t] = setup("Venam's Kiss");
		p.hp = 5000;
		t.setAbility('Liquid Ooze');
		t.setStatus('psn');
		hit(p, t, 'sludgebomb', { damage: 300 });
		assert.equal(p.hp, 4900);
		p.addVolatile('healblock', t);
		hit(p, t, 'sludgebomb', { damage: 300 });
		assert.equal(p.hp, 4900);
		t.setAbility('Immunity');
		t.cureStatus();
		hit(p, t, 'sludgebomb', { damage: 20 });
		assert.equal(t.status, '');
		t.setAbility('No Ability');
		t.setType('Steel');
		assert.equal(t.trySetStatus('psn', p, Dex.getActiveMove('toxic')), false);
	});
it('preserves committed move sources outside explicit rampage, Accumulation and Mud changes', () => {
 const fs = require('fs'), crypto = require('crypto'), baseline = require('./queued-move-source-baseline.json');
 for (const [file, expected] of Object.entries(baseline.files)) {
  let text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  text = text.replace(/\nAbilitiesText\.gulpmissile\.desc[^\n]*\n/g, '');
  text = text.replace(/\nObject\.assign\(MovesText\.(?:attackorder|defendorder|healorder),[^\n]*\n/g, '\n');
  text = text.replace("\n// Approved Order targeting; inherited healing, boosts and field callbacks remain intact.\nMoves.defendorder.target = 'adjacentAllyOrSelf';\nMoves.healorder.target = 'adjacentAllyOrSelf';\n", '');
  if (file.endsWith('/text/moves.ts')) text = text.replace("\nMovesText.drakefang = {name: 'Drake Fang', shortDesc: 'Dragon-type biting attack; 50% chance to badly poison.', desc: '85-power physical Dragon-type biting contact attack with 100% accuracy and 15 PP. Has a 50% chance to badly poison the target. Uses ordinary Dragon effectiveness: Fairy immunity and Steel resistance apply. Mega Seviper converts its Poison Fang slot into this move while preserving PP; Sirius supplies its separately described signature and Strong Jaw multipliers.'};\n", '');
  if (file.endsWith('/text/moves.ts')) text = text.replace("\nimport {FinisherMoveDescriptions} from '../finisher-moves-approved';\nfor (const [id,text] of Object.entries(FinisherMoveDescriptions)) MovesText[id as ID] = text;\n", '');
  if (file.endsWith('/moves.ts')) {
   // Only the explicitly approved adaptive Pledge callback and text differ.
   const pledgeBefore=require('../../../artifacts/adaptive-pledges/before.json');
   for(const [id,row] of Object.entries(pledgeBefore.texts)){if(file==='data/text/moves.ts'){const a=text.indexOf('\t'+id+': {'),b=text.indexOf('\n\t},',a)+5;text=text.slice(0,a)+text.slice(a,b).replace(row.desc,row.old).replace(row.short,row.oldShort)+text.slice(b);}else if(file==='data/moves.ts'){const a=text.indexOf('\t'+id+': {'),b=text.indexOf('\n\t},',a)+5;text=text.slice(0,a)+text.slice(a,b).replace("\t\tonModifyMove(move, pokemon) {\n\t\t\tuseHigherOffensiveStat(pokemon, move);\n\t\t},\n",'')+text.slice(b);}}
   if (file === 'data/moves.ts') text=text.replace("\t\t\tif (source.hasAbility('magneticbulwark') && !source.m.magneticBulwarkSpent) {\n\t\t\t\tconst targets = side.allies().filter(ally => (ally === source || source.isAdjacent(ally)) &&\n\t\t\t\t\t(!ally.volatiles.maxguard || this.runEvent('TryHit', ally, source, move)));\n\t\t\t\tfor (const target of targets) {\n\t\t\t\t\tdidSomething = this.boost({def: 1, spd: 1}, target, source, move, false, true) || didSomething;\n\t\t\t\t}\n\t\t\t\tif (didSomething) source.m.magneticBulwarkSpent = true;\n\t\t\t\treturn didSomething;\n\t\t\t}\n",'');
   if (file === 'data/text/moves.ts') text=text.replace("Raises the Defense and Special Defense of allies with Plus or Minus by 1 stage. On the local Electric Field, normally raises both stats of all allies by 2 stages. A user's unspent Magnetic Bulwark instead allows one use per genuine entry to raise both stats of itself and adjacent allies by 1 regardless of Plus or Minus. Normal boost restrictions apply; an entirely failed use does not spend this benefit.","Raises the Defense and Special Defense of Pokemon on the user's side with the Plus or Minus Abilities by 1 stage.");
   text=text.replace("import {radiantTarget} from '../sim/radiant-target';\n",'');
   text=text.replace("\t\tonEffectiveness(typeMod, target, type) {\n\t\t\tif (target && radiantTarget(target)) return type === target.getTypes()[0] ? 1 : 0;\n\t\t},\n",'');

   // Approved October 16: Poison Tail no longer has native drain.
   if (file === 'data/moves.ts') { const i=text.indexOf('\n\tpoisontail: {'),j=text.indexOf('\n\t},',i);text=text.slice(0,i)+text.slice(i,j).replace('\n\t\ttarget:', '\n\t\tdrain: [1, 2],\n\t\ttarget:')+text.slice(j); }
   if (file === 'data/text/moves.ts') text=text.replace('Has a high critical-hit ratio and a 50% chance to poison the target.','Has a high critical-hit ratio, a 50% chance to poison the target, and restores 50% of the damage dealt.').replace('High critical-hit ratio; 50% chance to poison.','High critical-hit ratio; 50% chance to poison; heals 1/2 damage dealt.');
   // Approved Pledge fix changes only the field-creation source to the triggering user.
   for (const id of ['firepledge','waterpledge','grasspledge']) {
    const start=text.indexOf('\n\t'+id+': {'),end=text.indexOf('\n\t},',start)+5;
    text=text.slice(0,start)+text.slice(start,end).replace(/setTerrain\('(rainbowterrain|burningterrain|swampterrain)', source, move\)/g, "setTerrain('$1', null, move)")+text.slice(end);
   }
   text = text.replace("attacker.hasAbilityOrPassive('gulpmissile')", "attacker.hasAbility('gulpmissile')");
   text = text.replace("\nimport {installFinisherMoves} from './finisher-moves-approved';\ninstallFinisherMoves(Moves);\n", '');
   text = text.replace("\nimport {installStarterFinishMoves} from './starter-finish-approved';\ninstallStarterFinishMoves(Moves);\n", '');
   text = text.replace("\t\t\tif (attacker.hasAbility('hydraulicarmor')) attacker.abilityState.hydraulicCharge = true;\n", '');
   text = text.replace("\nMoves.drakefang = {...Moves.poisonfang, num:11485, name:'Drake Fang', type:'Dragon', isNonstandard:'Custom'};\n", '');
   text = text.replace("import {accumulationState} from './swalot-vespiquen-approved';\n", '')
    .replace(/accumulationState\((pokemon|source)\)\.(accumulation\w+)/g, '$1.abilityState.$2')
    .replaceAll("hasAbilityOrPassive('accumulation')", "hasAbility('accumulation')");
   text = text.replace(/((?:outrage|thrash|petaldance|ragingfury): \{[\s\S]*?basePower: )140,/g, '$1120,');
   text = text.replace("\n// One canonical Mud Barrage: preserve the approved Mud-Slap mechanics and classification.\nMoves.mudbarrage = {...Moves.mudslap, name: 'Mud Barrage'};\ndelete Moves.mudslap;\n", '');
  } else {
   text=text.replace("\n// Approved: Mighty Cleave is unavailable to every Lycanroc form.\nfor (const id of ['lycanroc', 'lycanrocmidnight', 'lycanrocdusk'] as const) delete Learnsets[id].learnset!.mightycleave;\n", '');
   const marker = "\nimport {ApprovedMoveAdditions} from './move-distribution-approved';";
   assert.equal(text.split(marker).length, 2);
   text = text.slice(0, text.indexOf(marker));
  }
  // Approved Lasting Promise hooks only; keep the original source preservation hash.
  text=text.replace("\n\t\t\t\tthis.effectState.lastingPromiseSource = source.hasAbility('lastingpromise') && sourceEffect?.id === 'wish' ? source : null;",'');
  text=text.replace("\n\t\t\t\t\t\tconst wisher = this.effectState.lastingPromiseSource as Pokemon | null;\n\t\t\t\t\t\tif (wisher && target !== wisher && target.isAlly(wisher)) target.cureStatus();",'');
  text=text.replace('return 50 + (pokemon.m.rageFistBonus || 0);', 'return Math.min(350, 50 + 50 * pokemon.timesAttacked);');
  text=text.replace("\nObject.assign(MovesText.ragefist, {\"shortDesc\":\"50 BP +20 per hit taken, max 150; switching halves bonus.\",\"desc\":\"Starts at 50 power and gains 20 power per qualifying hit taken, up to 150 after five hits. Switching out halves the accumulated bonus exactly: 150 becomes 100, then 75. New hits add 20 to the remaining bonus, capped at 100 bonus power. Fractional progress is retained; the normal damage engine rounds final power. Retains existing hit eligibility, Transform copying and progress through fainting/revival. In Free-for-All, hits all adjacent foes at full spread power.\"});\n",'');
  text=text.replace("\nimport {installLoreScreenRules} from './lore-screen-rules';\ninstallLoreScreenRules(Moves);\n",'');
  assert.equal(crypto.createHash('sha256').update(text).digest('hex'), expected, file);
 }
});
 it('keeps the sixteen approved move recipient lists exact', () => {
  const actual = require('../../../dist/data/rejuvenation-signature-moves').RejuvenationSignatureLearnsets;
  assert.deepEqual(actual, require('./rejuv-move-learnsets-approved.json'));
 });
 const migrated = ['multipulse', 'aquabatics', 'feverpitch', 'thunderraid', 'desertsmark', 'superumdmove', 'galestrike', 'spectralscream', 'barbedweb', 'coldtruth', 'bunrakubeatdown', 'matrixshot', 'pyrokinesis', 'heavenlywing', 'uproot'];
 for (const id of migrated) it(id + ' exists as a move, not an ability', () => {
  assert(!Dex.abilities.get(id).exists, id); assert(Dex.moves.get(id).exists, id);
 });
 it('removes only the 21 approved event slots and preserves other choices and passives', () => {
  const before = require('./rejuv-move-migration-before.json');
  let removed = 0;
  for (const old of before) {
   const abilities = {...old.abilities};
   for (const [slot, name] of Object.entries(abilities)) if (migrated.concat('venamskiss').includes(Dex.toID(name))) {
    assert(['S', 'E'].includes(slot), old.id + ':' + slot); delete abilities[slot]; removed++;
   }
   const current = Dex.species.get(old.id);
   assert.deepEqual(current.abilities, require('./rejuv-migration-later-overrides.json')[old.id]?.abilities || abilities, old.id);
   // Later explicit Kingambit approval replaces Entrenched with Supreme Overlord.
   if (old.id === 'kingambit') assert.deepEqual(old.passives, ['entrenched']);
   const later = require('./rejuv-migration-later-overrides.json')[old.id];
   const expectedPassives = later?.passives || (old.id === 'kingambit' ? ['supremeoverlord'] : old.passives);
   assert.deepEqual(current.passives, expectedPassives, old.id);
  }
  assert.equal(removed, 21);
  assert.equal(Dex.species.get('chandelure').abilities.S, 'Soul Fire');
 });
 it('retains Venams Kiss inside Sirius after the approved Rival Malice migration', () => {
  assert.deepEqual(Dex.species.get('sevipermega').passives, ['rivalmalice']);
  assert(require('../../../dist/data/ability-components').AbilityComponents.sirius.includes('venamskiss'));
  for (const id of ['venamskiss', 'deepchill', 'vendetta', 'silksights', 'steadyaim']) assert(Dex.abilities.get(id).exists, id);
  assert(Dex.moves.get('venamskiss').exists);
 });

});
