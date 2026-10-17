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
		assert.equal(p.hp, 5300);
		hit(p, t, 'sludgebomb', { damage: 9000 });
		assert.equal(p.hp, 7500);
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
it('preserves reviewed move and learnset sources outside exact recorded approved move revisions', () => {
 const fs=require('fs'),crypto=require('crypto'),baseline=require('./guard-source-baseline.json');
 for(const[file,expected]of Object.entries(baseline.files)) {
  let text=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
  if(file==='data/moves.ts')for(const {before,after}of require('./approved-move-source-deltas.json').deltas){
   assert.equal(text.split(after).length-1,1,'reviewed delta must match exactly once');text=text.replace(after,before);
  }
  if(file==='data/learnsets.ts')text=text.replace('\nLearnsets.meloettaencore={learnset:{...Learnsets.meloetta.learnset}};\n','');
  assert.equal(crypto.createHash('sha256').update(text).digest('hex'),expected,file);
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
