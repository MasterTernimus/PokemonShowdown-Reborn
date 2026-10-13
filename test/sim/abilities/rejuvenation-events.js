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
it('Deep Chill ignores Special, ally and Substitute-only damage', () => {
		const [p, t, ally] = setup('Deep Chill', 'Mew', true);
		hit(t, p, 'watergun', { damage: 20 });
		hit(ally, p, 'tackle', { damage: 20 });
		assert.equal(t.boosts.spe, 0);
		assert.equal(ally.boosts.spe, 0);
		p.addVolatile('substitute', p);
		hit(t, p, 'tackle', { damage: 20 });
		assert.equal(t.boosts.spe, 0);
	});
it('Venams Kiss hits and poisons Steel, respects other typing and caps drain', () => {
		const [p, t] = setup("Venam's Kiss");
		t.setType(['Steel', 'Grass']);
		p.hp = 5000;
		hit(p, t, 'sludgebomb', { damage: 900 });
		assert.equal(t.status, 'psn');
		assert.equal(p.hp, 5000);
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
it('Grappling Claws lowers Speed after the whole move without trapping or blocking healing', () => {
		const [p, t] = setup('Grappling Claws'); t.hp = 5000;
		const move = hit(p, t, 'tackle', {damage: 20, multihit: 3});
		assert.equal(t.boosts.spe, 0); battle.runEvent('AfterMove', p, t, move); assert.equal(t.boosts.spe, -1);
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
it('preserves moves and learnsets apart from approved passive-aware ability checks', () => {
		const fs = require('fs'), crypto = require('crypto'), before = require('./rejuvenation-events-before.json');
		for (const [file, key] of [['data/moves.ts', 'movesHash'], ['data/learnsets.ts', 'learnsetsHash']]) {
			let contents = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
			const yangIntegration = key === 'movesHash' ? "\nimport {YangSignatureMoves} from './yang-signature-moves';\nObject.assign(Moves, YangSignatureMoves);\n" : "\nimport {YangSignatureLearnsets} from './yang-signature-moves';\nfor (const [move, species] of Object.entries(YangSignatureLearnsets)) {\n for (const id of species) {\n  Learnsets[id as ID] ||= {learnset: {}};\n  Learnsets[id as ID].learnset![move as ID] = ['9L1'];\n }\n}\n";
			assert.equal(contents.split(yangIntegration).length, 2, key + ' has exactly one approved Yang integration');
			contents = contents.replace(yangIntegration, '');
			if (key === 'movesHash') {
				const hazardList = "['spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge', 'dragonrend']";
				assert.equal(contents.split(hazardList).length - 1, 8);
				contents = contents.replaceAll(hazardList, "['spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge']");
				assert.equal(contents.split("'gmaxsteelsurge', 'dragonrend', 'gmaxcannonade'").length, 2);
				contents = contents.replace("'gmaxsteelsurge', 'dragonrend', 'gmaxcannonade'", "'gmaxsteelsurge', 'gmaxcannonade'");
			}
			// Remove only the approved additive signature-move integration, not existing move/learnset data.
			const signatureIntegration = key === 'movesHash' ? "\nimport {RejuvenationSignatureMoves} from './rejuvenation-signature-moves';\nObject.assign(Moves, RejuvenationSignatureMoves);\n" : "\nimport {RejuvenationSignatureLearnsets} from './rejuvenation-signature-moves';\nfor (const [move, species] of Object.entries(RejuvenationSignatureLearnsets)) {\n for (const id of species) {\n  Learnsets[id as ID] ||= {learnset: {}};\n  Learnsets[id as ID].learnset![move as ID] = ['9L1'];\n }\n}\n";
			assert.equal(contents.split(signatureIntegration).length, 2, key + ' has exactly one approved signature integration');
			contents = contents.replace(signatureIntegration, '');
			if (key === 'movesHash') {
				// Reverse exactly the approved Frozen Aura move changes; retain the original hash.
				const frozenSnowscape = "\tsnowscape: {\n  num: 883, accuracy: true, basePower: 0, category: \"Status\", name: \"Snowscape\", pp: 10,\n  priority: 0, flags: {}, target: \"all\", type: \"Ice\",\n  onTryMove() {\n   if (this.field.isTerrain(['volcanicterrain', 'superheatedterrain', 'burningterrain', 'fairytaleterrain', 'starlightarenaterrain'])) {\n    const message = this.field.isTerrain('fairytaleterrain') ? 'The fairy tale rejected the changing season!' :\n     this.field.isTerrain('starlightarenaterrain') ? 'The starlight refused to be eclipsed!' : 'The intense heat prevented the snow from settling!';\n    this.add('-message', message);\n    return false;\n   }\n   if (this.field.isWeather('desolateland')) return null;\n  },\n  onHitField(target, source, move) {\n   return this.field.setAura('frozenaura', source.hasItem('amplifieldrock') ? 8 : 5, source, move);\n  },\n },\n";
				assert(contents.includes(frozenSnowscape), 'Frozen Aura Snowscape changed outside the approved block');
				contents = contents.replace(frozenSnowscape, "\tsnowscape: {\n\t\tnum: 883,\n\t\taccuracy: true,\n\t\tbasePower: 0,\n\t\tcategory: \"Status\",\n\t\tname: \"Snowscape\",\n\t\tpp: 10,\n\t\tpriority: 0,\n\t\tflags: {},\n\t\tonTryMove(attacker, defender, move) {\n\t\t\tconst blockedFields = [\n\t\t\t\t'volcanicterrain', 'superheatedterrain', 'burningterrain', 'fairytaleterrain', 'starlightarenaterrain',\n\t\t\t];\n\t\t\tif (this.field.isTerrain(blockedFields)) {\n\t\t\t\tlet message = 'The intense heat prevented the snow from settling!';\n\t\t\t\tif (this.field.isTerrain('fairytaleterrain')) message = 'The fairy tale rejected the changing season!';\n\t\t\t\tif (this.field.isTerrain('starlightarenaterrain')) message = 'The starlight refused to be eclipsed!';\n\t\t\t\tthis.add('-message', message);\n\t\t\t\treturn false;\n\t\t\t}\n\t\t\tconst icyFieldTerrain = [\n\t\t\t\t'watersurfaceterrain', 'murkwatersurfaceterrain', 'icyterrain', 'caveterrain',\n\t\t\t\t'crystalcavernterrain', 'darkcrystalcavernterrain', 'mistyterrain',\n\t\t\t];\n\t\t\tif (this.field.isTerrain(icyFieldTerrain)) {\n\t\t\t\tmove.terrain = 'icyterrain';\n\t\t\t\treturn;\n\t\t\t}\n\t\t\tif (this.field.isWeather('desolateland')) return null;\n\t\t},\n\t\tterrain: \"coldeclipseterrain\",\n\t\ttarget: \"all\",\n\t\ttype: \"Ice\",\n\t},\n");
				contents = contents.replace("   if (this.field.isAura('frozenaura')) move = this.field.getAura().naturePowerMove;\n", '');
				contents = contents.replace(/(skullbash: \{[\s\S]*?basePower: )80,/, '$1130,');
				contents = contents.replace(/(skullbash: \{[\s\S]*?if \(move.totalDamage\) this.heal\()source.baseMaxhp \* 3 \/ 20/, '$1source.baseMaxhp / 10');
				contents = contents.replace("pokemon.getPassives().some(id => id === 'levitate' || id === 'elevate') ||\n\t\t\t\t\tpokemon.hasAbility(['levitate', 'elevate'])", "pokemon.getPassives().includes('levitate') || pokemon.hasAbility('levitate')");
				contents = contents.replaceAll("hasAbilityOrPassive('sapsipper')", "hasAbility('sapsipper')")
					.replaceAll("hasAbilityOrPassive('insomnia')", "hasAbility('insomnia')")
					.replaceAll("hasAbilityOrPassive(['plus', 'minus'])", "hasAbility(['plus', 'minus'])")
					.replaceAll("hasAbilityOrPassive('invigorate')", "hasAbility('invigorate')");
				contents = contents.replace("import {crescentRendApplies, prepareCrescentRend} from '../sim/crescent-rend';\n", '')
					.replaceAll('\t\t\t\t\t\tif (crescentRendApplies(source, move)) return;\n', '')
					.replace('\t\t\t\t// Crescent Rend continues this original hit with its already calculated overflow.\n' +
						'\t\t\t\tif (prepareCrescentRend(source, target, move, damage)) return;\n', '');
			}
			// Reverse only the two newly approved move changes before comparing the original fingerprint.
			if (key === 'movesHash') contents = contents.replace("if (!source.hasAbility('cursedkeepsake'))", "if (!source.hasAbility(['cursedkeepsake', 'cursedmarionette']))").replace("\t\t\tmove.ignoreAbility = true;\n\t\t\tconst isAshGreninja", "\t\t\tconst isAshGreninja");
			if (key === 'movesHash') contents = contents.replace("move: {...this.dex.getActiveMove(target.lastMove.id), sourceEffect: 'instruct'},", "moveid: target.lastMove.id,");
			if (key === 'movesHash') contents = contents.replace("\nMoves.outrage.secondary = {chance: 30, boosts: {def: -1}};\nMoves.thrash.secondary = {chance: 30, boosts: {def: -1}};\nMoves.petaldance.secondary = {chance: 30, boosts: {spd: -1}};\nMoves.ragingfury.secondary = {chance: 30, status: 'brn'};\n", '');
			// Reverse only the approved signature-Wish aura support, preserving the old fingerprint.
			if (key === 'movesHash') {
				contents = contents.replace(/(slotCondition: 'Wish',[\s\S]*?onStart\(pokemon, source), sourceEffect\)/, '$1)');
				contents = contents.replace("'holyterrain', 'starlightarenaterrain']) ||\n\t\t\t\t\t(['nomoswish', 'nostraswish'].includes(sourceEffect?.id) &&\n\t\t\t\t\t(this.field.isAura('mistyterrain') || this.field.isAura('rainbowterrain'))))", "'holyterrain', 'starlightarenaterrain']))");
			}
			// Preserve the original fingerprint after the approved Psycho Boost removals.
			if (key === 'learnsetsHash') {
				for (const [species, nextMove] of [['gothitelle', 'psychup']]) {
					const pattern = new RegExp('(\\t' + species + ': \{[\\s\\S]*?)(\\t\\t\\t' + nextMove + ':)');
					assert(pattern.test(contents), species + ' learnset anchor');
					contents = contents.replace(pattern, '$1\t\t\tpsychoboost: ["9M"],\n$2');
				}
			}
			if (key === 'movesHash') contents = contents.replace("\t\t\tif (this.field.isTerrainOrAura('electricterrain')) return;\n", '');
			assert.equal(crypto.createHash('sha256').update(contents).digest('hex'), before[key], key);
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
   assert.deepEqual(current.abilities, abilities, old.id);
   // Later explicit Kingambit approval replaces Entrenched with Supreme Overlord.
   if (old.id === 'kingambit') assert.deepEqual(old.passives, ['entrenched']);
   const expectedPassives = old.id === 'kingambit' ? ['supremeoverlord'] : old.passives;
   assert.deepEqual(current.passives, expectedPassives, old.id);
  }
  assert.equal(removed, 21);
  assert.equal(Dex.species.get('chandelure').abilities.S, 'Soul Fire');
 });
 it('retains Mega Seviper Venams Kiss and unrelated local ability definitions', () => {
  assert.deepEqual(Dex.species.get('sevipermega').passives, ['venamskiss']);
  for (const id of ['venamskiss', 'deepchill', 'vendetta', 'silksights', 'steadyaim']) assert(Dex.abilities.get(id).exists, id);
  assert(Dex.moves.get('venamskiss').exists);
 });

});
