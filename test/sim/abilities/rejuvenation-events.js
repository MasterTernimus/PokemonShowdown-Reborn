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
describe('Approved Rejuvenation event alternatives', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	const slots = { bewear: ['S', 'Multipulse'], primarina: ['S', 'Aquabatics'], toxtricityaevian: ['S', 'Fever Pitch'], electivire: ['S', 'Thunder Raid'], torterra: ['S', "Desert's Mark"], metagross: ['S', 'Super U.M.D. Move'], duraludon: ['S', 'Super U.M.D. Move'], lucario: ['S', 'Gale Strike'], dusclops: ['S', 'Spectral Scream'], chandelure: ['E', 'Spectral Scream'], mismagius: ['S', 'Spectral Scream'], araquanid: ['S', 'Barbed Web'], walrein: ['S', 'Cold Truth'], medicham: ['S', 'Bunraku Beatdown'], meowsticf: ['S', 'Bunraku Beatdown'], aerodactyl: ['S', 'Matrix Shot'], alakazam: ['S', 'Pyrokinesis'], delphox: ['S', 'Pyrokinesis'], seviper: ['S', "Venam's Kiss"], pidgeot: ['S', 'Heavenly Wing'] };
	for (const [id, [slot, ability]] of Object.entries(slots))
		it(id + ' has the exact event slot and description', () => {
			assert.equal(Dex.species.get(id).abilities[slot], ability);
			assert(Dex.abilities.get(ability).desc.length > 40);
			if (id === 'chandelure')
				assert.equal(Dex.species.get(id).abilities.S, 'Soul Fire');
		});
	it('does not grant event choices to Mega or other unapproved forms', () => {
		const before = require('./rejuvenation-events-before.json').abilities;
		const relic = require('./relic-armor-before.json');
		const changed = new Set([...Object.keys(slots), 'froslass', 'laprasaevian', 'omastar', 'kabutops', 'aerodactyl', 'cradily', 'armaldo', 'relicanth', 'rampardos', 'bastiodon', 'carracosta', 'tyrantrum', 'aurorus']);
		for (const [id] of require('./latest-passives-approved.json').slots) changed.add(id);
		changed.add('venusaur');
		const current = new Map(Dex.species.all().map(p => [p.id, p]));
		for (const [id, abilities] of Object.entries(before))
			if (!changed.has(id))
				assert.deepEqual(current.get(id).abilities, require('./passive-approval-overlays').abilities(id, {...abilities}), id);
		assert.deepEqual(Dex.species.get('chandelure').abilities.S, relic.abilities.chandelure.S);
	});
	it('Multipulse needs an effective Plate and adds no ability power multiplier', () => {
		const [p, t] = setup('Multipulse');
		p.setItem('Flame Plate');
		let m = Dex.getActiveMove('tackle');
		callback(p, 'ModifyType', m, p, t);
		assert.equal(m.type, 'Fire');
		assert.equal(m.basePower, 40);
		assert.equal(m.category, 'Physical');
		p.addVolatile('embargo');
		m = Dex.getActiveMove('tackle');
		callback(p, 'ModifyType', m, p, t);
		assert.equal(m.type, 'Normal');
		p.removeVolatile('embargo');
		p.setItem('Firium Z');
		m = Dex.getActiveMove('tackle');
		callback(p, 'ModifyType', m, p, t);
		assert.equal(m.type, 'Normal');
		p.setItem('Flame Plate');
		m = Dex.getActiveMove('weatherball');
		callback(p, 'ModifyType', m, p, t);
		assert.equal(m.type, 'Normal');
	});
	it('Aquabatics triggers once across hits and survives ability replacement', () => {
		const [p, t] = setup('Aquabatics');
		hit(p, t, 'watergun', { multihit: 3, damage: 20 });
		assert.equal(p.boosts.spa, 1);
		assert.equal(p.boosts.spe, 1);
		p.setAbility('Pressure');
		p.setAbility('Aquabatics');
		hit(p, t, 'watergun', { damage: 20 });
		assert.equal(p.boosts.spa, 1);
	});
	for (const ability of ['Aquabatics', "Desert's Mark", 'Barbed Web'])
		it(ability + ' does not spend its entry effect on Substitute-only damage', () => {
			const [p, t] = setup(ability);
			t.addVolatile('substitute', t);
			hit(p, t, ability === 'Aquabatics' ? 'watergun' : ability === 'Barbed Web' ? 'bugbite' : 'mudslap', { damage: 20 });
			assert(!p.volatiles.aquabaticsspent);
			assert(!p.volatiles.desertsmarkspent);
			assert(!p.volatiles.barbedwebspent);
		});
	it('Deserts Mark makes pure Ground and binds four turns once per entry', () => {
		const [p, t] = setup("Desert's Mark");
		hit(p, t, 'mudslap', { damage: 20 });
		assert.deepEqual(t.getTypes(), ['Ground']);
		assert.equal(t.volatiles.partiallytrapped.duration, 4);
		t.removeVolatile('partiallytrapped');
		hit(p, t, 'mudslap', { damage: 20 });
		assert(!t.volatiles.partiallytrapped);
	});
	it('Fever Pitch directly wakes for selected damaging sound but not indirect moves', () => {
		const [p, t] = setup('Fever Pitch');
		p.setStatus('slp');
		p.statusState.time = 5;
		battle.actions.runMove('hypervoice', p, 1);
		assert.equal(p.status, '');
		assert(t.hp < t.maxhp);
		p.setStatus('slp');
		const m = Dex.getActiveMove('hypervoice');
		m.sourceEffect = 'sleeptalk';
		callback(p, 'TryMove', p, t, m);
		assert.equal(p.status, 'slp');
	});
	it('Fever Pitch samples once for the entire multihit execution', () => {
		const [p, t] = setup('Fever Pitch');
		let rolls = 0;
		const sample = battle.sample.bind(battle);
		battle.sample = xs => {
			if (xs.length === 3 && xs[0] === 0.75) {
				rolls++;
				return 1.25;
			}
			return sample(xs);
		};
		hit(p, t, 'hypervoice', { multihit: 3 });
		assert.equal(rolls, 1);
	});
	it('Fever Pitch remains asleep when flinched or suppressed', () => {
		const [p] = setup('Fever Pitch');
		p.setStatus('slp');
		p.statusState.time = 5;
		p.addVolatile('flinch');
		battle.actions.runMove('hypervoice', p, 1);
		assert.equal(p.status, 'slp');
		p.removeVolatile('flinch');
		p.addVolatile('gastroacid');
		battle.actions.runMove('hypervoice', p, 1);
		assert.equal(p.status, 'slp');
	});
	it('Thunder Raid escalates power and preserves contact', () => {
		const [p, t] = setup('Thunder Raid');
		const m = Dex.getActiveMove('thunderpunch');
		callback(p, 'ModifyMove', m, p, t);
		assert.equal(m.multihit, 3);
		assert(m.multiaccuracy);
		assert(m.flags.contact);
		const powers = [];
		for (let i = 1; i <= 3; i++) {
			m.hit = i;
			powers.push(battle.runEvent('BasePower', p, t, m, 100));
		}
		assert.deepEqual(powers, [20, 40, 60]);
	});
	for (const extra of [{ multihit: 2 }, { priority: 1 }, { recoil: [1, 3] }, { damage: 40 }, { isZ: true }, { isMax: true }, { selfdestruct: 'always' }, { flags: { charge: 1 } }])
		it('Thunder Raid excludes ' + JSON.stringify(extra), () => {
			const [p, t] = setup('Thunder Raid');
			const m = Object.assign(Dex.getActiveMove('thunderpunch'), extra);
			callback(p, 'ModifyMove', m, p, t);
			assert(!m.thunderRaid);
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
	it('Super UMD compares defenses, burn and screens without live state or RNG changes', () => {
		const [p, t] = setup('Super U.M.D. Move');
		p.storedStats.atk = 200;
		p.storedStats.spa = 100;
		t.storedStats.def = 400;
		t.storedStats.spd = 50;
		const m = Dex.getActiveMove('ironhead');
		const before = JSON.stringify(battle.toJSON());
		assert.equal(expectedCategory(battle, p, t, m), 'Special');
		assert.equal(JSON.stringify(battle.toJSON()), before);
		t.storedStats.def = 100;
		t.storedStats.spd = 100;
		p.storedStats.spa = 150;
		assert.equal(expectedCategory(battle, p, t, m), 'Physical');
		p.setStatus('brn');
		assert.equal(expectedCategory(battle, p, t, m), 'Special');
		p.cureStatus();
		t.side.addSideCondition('reflect', t);
		assert.equal(expectedCategory(battle, p, t, m), 'Special');
	});
	it('Super UMD changes the actual category and rolls its drop once across multihit', () => {
		const [p, t] = setup('Super U.M.D. Move');
		p.storedStats.atk = 50;
		p.storedStats.spa = 400;
		const m = Dex.getActiveMove('geargrind');
		callback(p, 'PrepareHit', p, t, m);
		assert.equal(m.category, 'Special');
		assert.equal(m.umdDefense, 'spd');
		let count = 0;
		const random = battle.randomChance.bind(battle);
		battle.randomChance = (a, b) => {
			if (a === 1 && b === 5) {
				count++;
				return true;
			}
			return random(a, b);
		};
		hit(p, t, 'geargrind', { accuracy: true });
		assert.equal(count, 1);
		assert.equal(t.boosts.spd, -1);
	});
	it('Super UMD rejects unsupported variable-power and fixed damage moves', () => {
		const [p, t] = setup('Super U.M.D. Move');
		for (const id of ['heavyslam', 'nightshade'])
			assert.equal(expectedCategory(battle, p, t, Dex.getActiveMove(id)), undefined);
	});
	it('Gale Strike has HP-sensitive crit stages and one Speed reward per turn', () => {
		const [p, t] = setup('Gale Strike');
		const m = Dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('ModifyCritRatio', p, t, m, 0), 1);
		p.hp = 5000;
		assert.equal(battle.runEvent('ModifyCritRatio', p, t, m, 0), 2);
		p.hp = 2500;
		assert.equal(battle.runEvent('ModifyCritRatio', p, t, m, 0), 3);
		p.boosts.spe = -3;
		hit(p, t, 'tackle', { willCrit: true });
		assert.equal(p.boosts.spe, 1);
		hit(p, t, 'tackle', { willCrit: true });
		assert.equal(p.boosts.spe, 1);
	});
	it('Spectral Scream bypasses Substitute with Night Shade but Soundproof blocks it', () => {
		const [p, t] = setup('Spectral Scream');
		p.hp = 5000;
		t.addVolatile('substitute', t);
		hit(p, t, 'nightshade');
		assert.equal(t.hp, 9900);
		assert.equal(p.hp, 6250);
		assert(t.volatiles.substitute);
		t.setAbility('Soundproof');
		hit(p, t, 'nightshade');
		assert.equal(t.hp, 9900);
		assert.equal(p.hp, 6250);
	});
	it('Barbed Web poisons/binds each foe once without refreshing or duplicating an existing bind', () => {
		const [p, t] = setup('Barbed Web');
		hit(p, t, 'bugbite', { damage: 20 });
		assert.equal(t.status, 'psn');
		assert.equal(t.volatiles.partiallytrapped.duration, 4);
		t.volatiles.partiallytrapped.duration = 2;
		hit(p, t, 'bugbite', { damage: 20 });
		assert.equal(t.volatiles.partiallytrapped.duration, 2);
		const m = Dex.getActiveMove('tackle');
		callback(p, 'ModifyMove', m, p, t);
		assert(m.tracksTarget);
		t.removeVolatile('partiallytrapped');
		hit(p, t, 'bugbite', { damage: 20 });
		assert(!t.volatiles.partiallytrapped);
	});
	it('Cold Truth does not boost the first Torment-inflicting move and preserves negative offenses', () => {
		const [p, t] = setup('Cold Truth');
		t.boosts.atk = 3;
		t.boosts.spa = -2;
		const before = t.hp;
		hit(p, t, 'icebeam');
		const first = before - t.hp;
		assert(t.volatiles.torment);
		assert.equal(t.boosts.atk, 0);
		assert.equal(t.boosts.spa, -2);
		t.boosts.spd = 6;
		const next = t.hp;
		hit(p, t, 'icebeam');
		assert(next - t.hp > first * 1.2);
	});
	it('Bunraku counts current faints and bypasses only Substitute', () => {
		const [p, t] = setup('Bunraku Beatdown');
		const m = Dex.getActiveMove('psychic');
		callback(p, 'ModifyMove', m, p, t);
		assert(m.flags.bypasssub);
		assert(!m.infiltrates);
		assert.equal(battle.runEvent('BasePower', p, t, m, 100), 125);
		p.side.pokemon[1].fainted = true;
		assert.equal(battle.runEvent('BasePower', p, t, m, 100), 150);
		p.side.pokemon[1].fainted = false;
		assert.equal(battle.runEvent('BasePower', p, t, m, 100), 125);
	});
	it('Matrix Shot retains Physical category, targets SpD and removes only opposing Reflect/Light Screen', () => {
		const [p, t] = setup('Matrix Shot');
		for (const side of battle.sides)
			for (const id of ['reflect', 'lightscreen', 'auroraveil'])
				side.addSideCondition(id, side.active[0]);
		const m = Dex.getActiveMove('rockslide');
		callback(p, 'ModifyMove', m, p, t);
		assert.equal(m.category, 'Physical');
		assert.equal(m.overrideDefensiveStat, 'spd');
		assert(m.ignoreScreens);
		hit(p, t, 'rockslide', { damage: 20 });
		assert(!t.side.sideConditions.reflect);
		assert(!t.side.sideConditions.lightscreen);
		assert(t.side.sideConditions.auroraveil);
		assert(p.side.sideConditions.reflect);
	});
	it('Pyrokinesis adds one burn secondary and powers up only pre-burned targets', () => {
		const [p, t] = setup('Pyrokinesis');
		p.hp = 5000;
		const m = Dex.getActiveMove('psychic');
		callback(p, 'ModifyMove', m, p, t);
		callback(p, 'ModifyMove', m, p, t);
		assert.equal(m.secondaries.filter(s => s.status === 'brn').length, 1);
		t.setStatus('brn');
		t.boosts.spd = 6;
		hit(p, t, 'psychic');
		assert.equal(p.hp, 6250);
		hit(p, t, 'psychic');
		assert.equal(p.hp, 6250);
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
	it('Heavenly Wing gives only anti-boost priority and a once-turn successful purge reward', () => {
		const [p, t] = setup('Heavenly Wing');
		p.hp = 5000;
		p.boosts.def = -2;
		const m = Dex.getActiveMove('wingattack');
		assert.equal(battle.runEvent('ModifyPriority', p, t, m, 0), 0);
		t.boosts.atk = 2;
		t.boosts.spd = -2;
		assert.equal(battle.runEvent('ModifyPriority', p, t, m, 0), 1);
		hit(p, t, 'wingattack', { damage: 20 });
		assert.equal(t.boosts.atk, 0);
		assert.equal(t.boosts.spd, -2);
		assert.equal(p.hp, 6250);
		assert.equal(p.boosts.def, 0);
		t.boosts.atk = 2;
		hit(p, t, 'wingattack', { damage: 20 });
		assert.equal(t.boosts.atk, 2);
		assert.equal(p.hp, 6250);
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
	it('Grappling Claws links trapping and Heal Block to the holder without chip or refresh', () => {
		const [p, t] = setup('Grappling Claws');
		t.hp = 5000;
		hit(p, t, 'tackle', { damage: 20, multihit: 3 });
		assert(t.volatiles.grapplingclawslock);
		assert.equal(t.volatiles.grapplingclawslock.duration, 2);
		assert.equal(battle.heal(100, t, t), false);
		battle.runEvent('TrapPokemon', t);
		assert(t.trapped);
		t.volatiles.grapplingclawslock.duration = 1;
		hit(p, t, 'tackle', { damage: 20 });
		assert.equal(t.volatiles.grapplingclawslock.duration, 1);
		p.clearVolatile();
		assert(!t.volatiles.grapplingclawslock);
		assert.equal(battle.heal(100, t, t), 100);
	});
	it('Grappling Claws ignores Special contact and Substitute and allows Ghost trapping exemption', () => {
		const [p, t] = setup('Grappling Claws');
		hit(p, t, 'tackle', { damage: 20, category: 'Special' });
		assert(!t.volatiles.grapplingclawslock);
		t.addVolatile('substitute', t);
		hit(p, t, 'tackle', { damage: 20 });
		assert(!t.volatiles.grapplingclawslock);
		t.removeVolatile('substitute');
		t.setType('Ghost');
		hit(p, t, 'bite', { damage: 20 });
		assert(t.volatiles.grapplingclawslock);
		battle.runEvent('TrapPokemon', t);
		assert(!t.trapped);
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
	it('Super UMD respects Shield Dust and excludes duplicate identical defense drops', () => {
		const [p, t] = setup('Super U.M.D. Move');
		p.storedStats.atk = 400;
		p.storedStats.spa = 50;
		t.setAbility('Shield Dust');
		battle.randomChance = (a, b) => a === 1 && b === 5;
		hit(p, t, 'ironhead');
		assert.equal(t.boosts.def, 0);
		const m = Dex.getActiveMove('ironhead');
		m.secondaries = [{ chance: 20, boosts: { def: -1 } }];
		callback(p, 'PrepareHit', p, t, m);
		assert(!m.umdDefense);
	});
	it('preserves moves and learnsets apart from approved passive-aware ability checks', () => {
		const fs = require('fs'), crypto = require('crypto'), before = require('./rejuvenation-events-before.json');
		for (const [file, key] of [['data/moves.ts', 'movesHash'], ['data/learnsets.ts', 'learnsetsHash']]) {
			let contents = fs.readFileSync(file, 'utf8');
			if (key === 'movesHash') {
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
			assert.equal(crypto.createHash('sha256').update(contents).digest('hex'), before[key], key);
		}
	});
	it('calculator Super UMD Steel category matches the equivalent Special Steel damage under burn', () => {
		const { calculateScenario } = require('../../../dist/sim/custom-calculator');
		const input = { format: 'gen9nofieldsinglesgame', move: 'ironhead', samples: 8, seed: 22, actors: [{ species: 'Metagross', ability: 'Super U.M.D. Move', status: 'brn', boosts: { spa: 4 } }, { species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }] };
		const converted = calculateScenario(input).results[1];
		input.move = 'flashcannon';
		input.actors[0].ability = 'No Ability';
		const special = calculateScenario(input).results[1];
		assert.equal(converted.min, special.min);
		assert.equal(converted.max, special.max);
	});
	it('Super UMD accounts for Ice Face without consuming or mutating the real shield', () => {
		const [p, t] = setup('Super U.M.D. Move');
		p.storedStats.atk = 500;
		p.storedStats.spa = 100;
		t.formeChange('Eiscue');
		t.setAbility('Ice Face', null, null, true);
		assert.equal(t.ability, 'iceface');
		const before = JSON.stringify(battle.toJSON());
		assert.equal(expectedCategory(battle, p, t, Dex.getActiveMove('ironhead')), 'Special');
		assert.equal(JSON.stringify(battle.toJSON()), before);
		assert(!t.abilityState.busted);
	});
});
