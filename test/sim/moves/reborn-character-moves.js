'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex, TeamValidator} = require('../../../dist/sim');
const {CharacterMoveProfiles} = require('../../../dist/data/reborn-character-moves');

describe('Reborn character signature moves', () => {
	let battle;
	function setup(doubles = false) {
		const mon = {species: 'Mew', ability: 'No Ability', moves: ['splash', 'solarpledge', 'lunarpledge', 'laurellash']};
		battle = common.createBattle({formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame'}, [[mon, mon, mon], [mon, mon, mon]]);
		battle.makeChoices('team 123', 'team 123');
		for (const p of battle.getAllActive()) p.hp = p.maxhp = p.baseMaxhp = 10000;
		battle.randomizer = damage => damage;
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	function use(id, source, target, extra = {}) {
		battle.actions.useMove({...Dex.getActiveMove(id), willCrit: false, accuracy: true, ...extra}, source, {target});
	}
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const [id, profile] of Object.entries(CharacterMoveProfiles)) {
		it(id + ' is implemented and learnable by the approved users', () => {
			const move = Dex.moves.get(id); assert(move.exists);
			assert(move.shortDesc.startsWith(profile.credit + "'s move."));
			for (const species of profile.users) {
				assert(Dex.species.get(species).exists, species);
				for (const format of ['gen9doublesrockyfield', 'gen9dragonsden']) {
					assert.equal(TeamValidator.get(format).checkCanLearn(move, Dex.species.get(species)), null, species + '/' + format);
				}
			}
		});
		it(id + ' damages a foe and announces itself once', () => {
			const [p, q] = setup(); use(id, p, q);
			assert(q.hp < q.maxhp, id);
			assert.equal(battle.log.filter(line => line.includes(profile.message)).length, 1);
		});
		it(id + ' gives no hit rewards or announcement through Protect', () => {
			const [p, q] = setup(); p.hp = 5000; q.addVolatile('protect'); use(id, p, q);
			assert.equal(q.hp, q.maxhp); assert.equal(p.hp, 5000);
			assert.equal(battle.log.filter(line => line.includes(profile.message)).length, 0);
			assert(!p.volatiles.solarpledge && !p.volatiles.lunarpledge);
			assert(!q.volatiles.healblock && !q.volatiles.torment);
		});
	}
	for (const [id, condition] of [['blacktestament', 'healblock'], ['shockdoctrine', 'torment']]) {
		for (const mode of ['normal', 'field', 'sub', 'miss', 'immune']) it(id + ' condition: ' + mode, () => {
			const [p, q] = setup();
			if (mode === 'field') battle.field.terrain = CharacterMoveProfiles[id].fields[0];
			if (mode === 'sub') q.addVolatile('substitute');
			if (mode === 'immune') q.setType(id === 'blacktestament' ? 'Dark' : 'Ground');
			use(id, p, q, mode === 'miss' ? {accuracy: 0} : {});
			if (mode === 'normal' || mode === 'field') assert.equal(q.volatiles[condition]?.duration, mode === 'field' ? 3 : 2);
			else assert(!q.volatiles[condition]);
		});
	}
	it('Black Testament shares Gilded Helix typing and chooses staged offense', () => {
		const [p, q] = setup();
		for (const types of [['Grass', 'Poison'], ['Water', 'Fairy'], ['Ghost', 'Dark'], ['Flying']]) {
			p.setType(types); const a = Dex.getActiveMove('blacktestament'), b = Dex.getActiveMove('gildedhelix');
			a.onModifyType.call(battle, a, p, q); b.onModifyType.call(battle, b, p, q);
			assert.equal(a.type, b.type); p.boosts.atk = 2; a.onModifyMove.call(battle, a, p, q); assert.equal(a.category, 'Physical');
		}
	});
	for (const [field, message] of Object.entries({
		dragonsdenterrain: 'dragons answered', shortcircuitterrain: 'broken circuit',
		newworldterrain: 'through the void', starlightarenaterrain: 'stars aligned',
	})) {
		it('Black Testament gains 1.2× power and announces its actual type on ' + field, () => {
			const [p, q] = setup();
			battle.field.terrain = field;
			p.setType(['Poison', 'Dark']);
			const move = Dex.getActiveMove('blacktestament');
			assert.equal(battle.runEvent('BasePower', p, q, move, 85, true), 102);
			use('blacktestament', p, q, { multihit: 2 });
			assert(q.hp < q.maxhp);
			assert.equal(q.volatiles.healblock.duration, 2);
			const lines = battle.log.filter(line => line.includes(message));
			assert.equal(lines.length, 1);
			assert.match(lines[0], /Poison-type Black Testament/);
		});
	}
	for (const field of ['wastelandterrain', 'corrosiveterrain']) {
		it('Black Testament extends only a successful new Heal Block on ' + field, () => {
			const [p, q] = setup();
			battle.field.terrain = field;
			q.setType('Normal');
			const move = Dex.getActiveMove('blacktestament');
			assert.equal(battle.runEvent('BasePower', p, q, move, 85, true), 85);
			q.addVolatile('substitute');
			use('blacktestament', p, q);
			assert(!q.volatiles.healblock);
			assert(!battle.log.some(line => line.includes('prolonged the healing ban')));
			q.removeVolatile('substitute');
			use('blacktestament', p, q);
			assert.equal(q.volatiles.healblock.duration, 3);
			q.volatiles.healblock.duration = 5;
			use('blacktestament', p, q);
			assert.equal(q.volatiles.healblock.duration, 5);
			assert.equal(battle.log.filter(line => line.includes('prolonged the healing ban')).length, 1);
		});
	}
	it('does not announce a field boost against a foe that has fully adapted to it', () => {
		const [p, q] = setup();
		battle.field.terrain = 'dragonsdenterrain';
		q.setAbility('adaptivecycle');
		const { adaptiveMemory } = require('../../../dist/sim/adaptive-cycle');
		adaptiveMemory(q).fields.dragonsdenterrain = { stage: 3, turn: battle.turn };
		use('blacktestament', p, q);
		assert(q.hp < q.maxhp);
		assert.equal(q.volatiles.healblock.duration, 2);
		assert(!battle.log.some(line => line.includes('dragons answered')));
		assert(battle.log.some(line => line.includes('Psychic-type Black Testament')));
	});
	it('Heavenfall has Draco Meteor scale and receives its exact New World boost plus the Dark bonus', () => {
		const [p, q] = setup(); const raw = Dex.moves.get('heavenfall');
		assert.equal(raw.basePower, 130); assert.equal(raw.accuracy, 90); assert.equal(raw.pp, 5);
		use('heavenfall', p, q); assert.equal(p.boosts.spa, -2); p.boosts.spa = 0;
		battle.field.terrain = 'newworldterrain';
		const move = Dex.getActiveMove('heavenfall'); move.onModifyMove.call(battle, move, p, q);
		assert.equal(move.accuracy, true); assert.equal(move.self.boosts.spa, -1);
		assert.equal(battle.runEvent('BasePower', p, q, move, 100, true), 300);
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('dracometeor'), 100, true), 200);
		use('heavenfall', p, q); assert.equal(p.boosts.spa, -1);
		assert.equal(battle.field.terrain, 'newworldterrain');
		assert(TeamValidator.get('gen9dragonsden').checkCanLearn(raw, Dex.species.get('delphox')));
	});
	for (const block of ['protect', 'miss']) it('Heavenfall has no self-drop on ' + block, () => {
		const [p, q] = setup(); if (block === 'protect') q.addVolatile('protect');
		use('heavenfall', p, q, block === 'miss' ? {accuracy: 0} : {});
		assert.equal(p.boosts.spa, 0);
	});
	it('Null Pulse uses target Special Attack, including its stages', () => {
		const [p, q] = setup(); const move = {...Dex.getActiveMove('nullpulse'), willCrit: false};
		const base = battle.actions.getDamage(p, q, move); p.boosts.spa = 6;
		assert.equal(battle.actions.getDamage(p, q, move), base);
		q.boosts.spa = 2; assert(battle.actions.getDamage(p, q, move) > base * 1.8);
	});
	it('Logic Pulse ignores positive defensive stages but preserves negative stages', () => {
		const [p, q] = setup(); const move = {...Dex.getActiveMove('logicpulse'), willCrit: false};
		const base = battle.actions.getDamage(p, q, move); q.boosts.spd = 6;
		assert.equal(battle.actions.getDamage(p, q, move), base);
		q.boosts.spd = -2; assert(battle.actions.getDamage(p, q, move) > base * 1.8);
	});
	it('Solace Pulse heals only once for multihit and chooses the lowest HP percentage', () => {
		const [p, q] = setup(true), ally = battle.p1.active[1]; p.hp = 3000; ally.hp = 1000;
		use('solacepulse', p, q, {multihit: 3});
		assert.equal(p.hp, 3000); assert.equal(ally.hp, 2250);
	});
	it('Solace Pulse prefers the user on a tie and improves in cold fields', () => {
		const [p, q] = setup(true), ally = battle.p1.active[1]; p.hp = ally.hp = 1000;
		battle.field.terrain = 'icyterrain'; use('solacepulse', p, q);
		assert.equal(p.hp, 2666); assert.equal(ally.hp, 1000);
	});
	it('Cold Shoulder snapshots prior damage instead of triggering itself on a second hit', () => {
		const [p, q] = setup(); const powers = [], original = battle.actions.getDamage.bind(battle.actions);
		battle.actions.getDamage = (a, b, m, ...rest) => { powers.push(m.basePower); return original(a, b, m, ...rest); };
		use('coldshoulder', p, q, {multihit: 2}); assert(powers.every(power => power === 85));
		powers.length = 0; use('coldshoulder', p, q); assert(powers.every(power => power === 120));
	});
	it('Cold Shoulder preserves Defense drops in icy fields', () => {
		const [p, q] = setup(); p.boosts.atk = 1; battle.field.terrain = 'icyterrain';
		const move = Dex.getActiveMove('coldshoulder'); move.onModifyMove.call(battle, move, p, q);
		assert.equal(move.category, 'Physical'); assert(move.ignorePositiveDefensive); assert(!move.ignoreDefensive);
	});
	it('Laurel Lash rewards a direct KO once, but not an ordinary hit', () => {
		const [p, q] = setup(); use('laurellash', p, q); assert.equal(p.boosts.spa, 0);
		q.hp = 1; use('laurellash', p, q); assert.equal(p.boosts.spa, 1);
	});
	it('Solar Pledge boosts the whole next attack, is consumed on Protect, and can be renewed', () => {
		const [p, q] = setup(); use('solarpledge', p, q); assert(p.volatiles.solarpledge);
		battle.makeChoices('move solarpledge', 'move splash'); assert(p.volatiles.solarpledge);
		q.addVolatile('protect'); battle.makeChoices('move laurellash', 'move splash'); assert(!p.volatiles.solarpledge);
	});
	it('Lunar Pledge protects all hits of one attack then clears', () => {
		const [p, q] = setup(); use('lunarpledge', p, q); assert(p.volatiles.lunarpledge);
		const values = [], original = battle.actions.getDamage.bind(battle.actions);
		battle.actions.getDamage = (a, b, m, ...rest) => { const result = original(a, b, m, ...rest); values.push(result); return result; };
		use('tackle', q, p, {multihit: 3}); assert.equal(values.length, 3); assert.equal(new Set(values).size, 1);
		assert(!p.volatiles.lunarpledge); const reduced = values[0]; values.length = 0;
		use('tackle', q, p); assert(values[0] > reduced * 1.25);
	});
	it('Solar Pledge boosts every hit equally and clears after one attack', () => {
		const [p, q] = setup(); const damage = [];
		const original = battle.actions.getDamage.bind(battle.actions);
		battle.actions.getDamage = (a, b, m, ...rest) => { const result = original(a, b, m, ...rest); if (m.id === 'tackle') damage.push(result); return result; };
		use('tackle', p, q); const baseline = damage.pop();
		use('solarpledge', p, q); use('tackle', p, q, {multihit: 3});
		assert.equal(damage.length, 3); assert.equal(new Set(damage).size, 1); assert(damage[0] > baseline * 1.2);
		// runMove emits AfterMove, while direct useMove intentionally does not.
		battle.runEvent('AfterMove', p, q, battle.activeMove); assert(!p.volatiles.solarpledge);
	});
	for (const id of ['solarpledge', 'lunarpledge']) it(id + ' does not stack and clears when switching', () => {
		const [p, q] = setup(); use(id, p, q); use(id, p, q);
		assert.equal(p.volatiles[id].factor, id === 'solarpledge' ? 1.25 : 0.75);
		battle.makeChoices('switch 2', 'move splash'); assert(!p.volatiles[id]);
	});
	it('Vanishing Act frees binding only after a successful hit', () => {
		const [p, q] = setup(); p.addVolatile('partiallytrapped', q, Dex.moves.get('wrap'));
		assert(p.volatiles.partiallytrapped); q.addVolatile('protect'); use('vanishingact', p, q);
		assert(p.volatiles.partiallytrapped); assert(!p.switchFlag);
		q.removeVolatile('protect'); use('vanishingact', p, q);
		assert(!p.volatiles.partiallytrapped); assert(p.switchFlag);
	});
	it('Rebel Anthem clears the approved allied conditions, including field confusion', () => {
		const [p, q] = setup(true); const ally = battle.p1.active[1];
		for (const a of [p, ally]) for (const id of ['taunt', 'torment', 'confusion']) a.addVolatile(id, q);
		battle.field.terrain = 'rainbowterrain'; use('rebelanthem', p, q);
		for (const a of [p, ally]) for (const id of ['taunt', 'torment', 'confusion']) assert(!a.volatiles[id]);
	});
	for (const [id, profile] of Object.entries(CharacterMoveProfiles)) {
		it(id + ' has valid documented fields and its declared field bonus', () => {
			const [p, q] = setup();
			for (const field of profile.fields) {
				assert(Dex.terrains.get(field).exists || Dex.conditions.get(field).exists, field);
				battle.field.terrain = field;
				if (profile.fieldEffect === 'Power is 1.2×.') {
					const move = {...Dex.getActiveMove(id), willCrit: false};
					const boosted = battle.actions.getDamage(p, q, move);
					const normal = battle.actions.getDamage(p, q, {...move, onBasePower: undefined});
					assert(boosted > normal * 1.15, `${id}: ${boosted} vs ${normal}`);
				}
			}
		});
	}
});
