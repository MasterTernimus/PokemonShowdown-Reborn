'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex, TeamValidator } = require('../../../dist/sim');
const { qualifiesForStarLens } = require('../../../dist/data/relic-beam');
describe('Mega signature support moves', () => {
	it('resolves historical move names without renaming abilities that share those names', () => {
		const { FormerFormMoves } = require('../../../dist/data/form-move-aliases');
		for (const [former, current] of Object.entries(FormerFormMoves)) {
			assert(Dex.moves.get(current).exists, current);
			assert.equal(Dex.moves.get(former), Dex.moves.get(current), former);
		}
		for (const name of ['Apex Cleave', 'Pearl Current']) assert.equal(Dex.abilities.get(name).name, name);
	});
	let b;
	afterEach(() => { b?.destroy(); b = null; });
	function start(base, move, form = base + '-Mega') {
		const mon = (species, moves) => ({ species, moves, ability: 'No Ability' });
		b = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[mon(base, [move]), mon('Mew', ['splash']), mon('Chansey', ['splash'])],
			[mon('Blissey', ['tackle', 'protect']), mon('Snorlax', ['splash']), mon('Chansey', ['splash'])],
		]);
		b.makeChoices('team 123', 'team 123');
		const p = b.p1.active[0], a = b.p1.active[1], t = b.p2.active[0], q = b.p2.active[1];
		for (const m of [p, a, t, q]) m.maxhp = m.baseMaxhp = m.hp = 4000;
		p.formeChange(form, Dex.items.get(Dex.species.get(form).requiredItem), true);
		return [p, a, t, q];
	}
	function hit(p, t, id) {
		b.actions.useMove(id, p, { target: t });
		const m = p.lastMoveUsed;
		b.clearActiveMove();
		return m;
	}
	const { StoneSignatures } = require('../../../dist/data/stone-signatures');
	const { MegaSignatureExpansion } = require('../../../dist/data/mega-signature-expansion');
	const { KalosRipostes } = require('../../../dist/data/kalos-ripostes');
	for (const [species, form, base, name, originalPower, megaPower] of [
		['Ledian', 'Ledian-Mega', 'carapacejab', 'Comet Jab', 75, 80],
		['Pidgeot', 'Pidgeot-Mega', 'airslash', 'Gale Slice', 75, 80],
		['Gardevoir', 'Gardevoir-Mega-Z', 'slash', 'Veil Slash', 90, 90],
		['Houndoom', 'Houndoom-Mega', 'darkpulse', 'Dread Howl', 80, 85],
	]) {
		it(name + ' has the same upgraded power in the move list and battle, using the original slot and PP', () => {
			const [p,,foe] = start(species, base, form);
			const original = Dex.moves.get(base);
			const signature = Dex.moves.get(name);
			assert.equal(original.basePower, originalPower);
			assert.equal(signature.basePower, megaPower);
			assert.equal(signature.pp, original.pp);
			const slot = p.getMoves()[0];
			assert.equal(slot.id, base);
			assert.equal(slot.move, name);
			b.makeChoices('move 1 1, move splash', 'move protect, move splash');
			assert.equal(p.lastMoveUsed?.name, name);
			assert.equal(p.lastMoveUsed.basePower, megaPower);
			assert.equal(p.moveSlots[0].pp, slot.pp - 1);
			const direct = hit(p, foe, name);
			assert.equal(direct.basePower, megaPower);
		});
	}
	for (const [form, spec] of Object.entries({ ...MegaSignatureExpansion, ...KalosRipostes })) {
		it(spec.name + ' is available through the matching stone on a legal base set', () => {
			const mega = Dex.species.get(form);
			const base = Dex.species.get(mega.battleOnly || mega.baseSpecies);
			const item = mega.requiredItems[0];
			const set = {
				species: base.name, ability: base.abilities[0], item, moves: [spec.base],
				nature: 'Serious', evs: { hp: 252, spe: 252 },
			};
			const validator = new TeamValidator('gen9nofieldsinglesgame@@@Obtainable Abilities,Obtainable Moves');
			assert.equal(validator.validateTeam([set]), null);
			b = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
				[set], [{ species: 'Blissey', moves: ['splash'], ability: 'No Ability' }],
			]);
			b.makeChoices('team 1', 'team 1');
			const p = b.p1.active[0];
			assert.equal(p.getMoves()[0].move, Dex.moves.get(spec.base).name);
			const branch = p.canMegaEvo === mega.name ? 'mega' : p.canMegaEvoX === mega.name ? 'megax' : 'megay';
			b.makeChoices(`move 1 ${branch}`, 'move splash');
			assert.equal(p.species.id, form);
			assert.equal(p.getMoves()[0].move, spec.name);
			assert.equal(p.getMoves()[0].id, spec.base);
		});
	}
	for (const [id, spec] of Object.entries(StoneSignatures)) {
		it(spec.name + ' uses the learned move slot and converts only on its Mega', () => {
			const form = Dex.species.get(id), base = Dex.moves.get(spec.base);
			const origin = Array.isArray(form.battleOnly) ? form.battleOnly[0] : form.battleOnly || form.baseSpecies;
			const [p,,t] = start(origin, spec.base, form.name);
			assert.equal(p.getMoves()[0].move, spec.name); assert.equal(p.getMoves()[0].id, base.id);
			assert.equal(Dex.moves.get(spec.name).pp, base.pp);
			const m = hit(p, t, spec.base); assert.equal(m.name, spec.name); assert.equal(m.id, spec.base);
			p.formeChange(origin, null, true);
			assert.equal(p.getMoves()[0].move, base.name);
		});
	}
	it('Petal Spike drains actual damage and follows either defensive spread', () => {
		const [p,,t] = start('Glimmora-Aevian', 'injection', 'Glimmora-Aevian-Mega');
		p.maxhp = p.baseMaxhp = 4000; p.hp = 500;
		const damage = [];
		t.storedStats.def = 800; t.storedStats.spd = 800;
		for (const stat of [null, 'def', 'spd']) {
			t.storedStats.def = 800; t.storedStats.spd = 800; if (stat)t.storedStats[stat] = 80;
			const before = p.hp, foe = t.hp, m = hit(p, t, 'injection');
			damage.push(foe - t.hp); assert.equal(m.category, 'Special');
			assert(m.flags.contact); assert(foe > t.hp); assert(Math.abs(p.hp - before - (foe - t.hp) / 2) <= 1);
		}
		assert(damage[1] > damage[0] * 3 && damage[2] > damage[0] * 3, damage.join(', '));
	});
	it('the Z Flygon selects one opponent and the other slots take no sound damage', () => {
		const [p, a, t, q] = start('Flygon', 'boomburst', 'Flygon-Mega-Z');
		assert.equal(p.getMoves()[0].target, 'normal');
		const m = hit(p, q, 'boomburst');
		assert.equal(m.type, 'Ground');
		assert(m.flags.sound);
		assert(q.hp < 4000);
		assert.equal(a.hp, 4000);
		assert.equal(t.hp, 4000);
	});
	it('Tandem Punch heals its ally once across both hits and Soothing Tide heals its user', () => {
		const [p, a, t] = start('Kangaskhan', 'dizzypunch'); a.hp = 500;
		assert.equal(hit(p, t, 'dizzypunch').name, 'Tandem Punch');
		assert.equal(a.hp, 500 + Math.floor(a.baseMaxhp / 12));
		b.destroy();
		const [milotic,,foe] = start('Milotic', 'waterpulse'); milotic.maxhp = milotic.baseMaxhp = 4000; milotic.hp = 200;
		const before = foe.hp;
		hit(milotic, foe, 'waterpulse');
		assert(before > foe.hp);
		assert(Math.abs(milotic.hp - 200 - (before - foe.hp) / 4) <= 1);
	});
	it('Ruin Edge keeps its native high crit and does not inherit Talon Dive', () => {
		const [p,,t] = start('Tyranitar', 'stoneedge');
		b.field.setWeather('sandstorm', p); const m = hit(p, t, 'stoneedge');
		assert.equal(m.accuracy, true); assert.equal(m.critRatio, 2); assert(!m.flags.contact);
	});
	for (const [species, form, id] of [
		['Lucario', 'Lucario-Mega-Z', 'aurasphere'], ['Excadrill', 'Excadrill-Mega', 'drillrun'],
	]) it(form + ' pierces a live Substitute without damaging the doll', () => {
		const [p,,t] = start(species, id, form); t.addVolatile('substitute', t);
		const sub = t.volatiles.substitute.hp; hit(p, t, id);
		assert(t.hp < 4000); assert.equal(t.volatiles.substitute.hp, sub);
	});
	it('Wing Echo pivots on a damaging hit while Protect prevents the switch', () => {
		const [p,,t] = start('Flygon', 'bugbuzz');
		t.addVolatile('protect', t); hit(p, t, 'bugbuzz'); assert(!p.switchFlag);
		t.removeVolatile('protect');
		hit(p, t, 'bugbuzz');
		assert(p.switchFlag);
		assert(t.hp < 4000);
	});
	it('Soothing Tide receives Water Pulse and Water type boosts together Underwater', () => {
		const [p,,t] = start('Milotic', 'waterpulse'); b.field.setTerrain('underwaterterrain', p);
		const m = hit(p, t, 'waterpulse'); assert.equal(m.name, 'Soothing Tide'); assert.equal(m.id, 'waterpulse');
		assert.equal(b.runEvent('BasePower', p, t, m, 100), 225);
	});
	for (const [species, id] of [['Absol', 'nightslash']]) {
		it(species + ' keeps its ordinary move after Mega Evolution', () => {
			const [p,,t] = start(species, id); const m = hit(p, t, id), base = Dex.moves.get(id);
			assert.equal(m.name, base.name); assert.equal(p.getMoves()[0].move, base.name);
			assert.equal(m.category, base.category); assert.equal(m.overrideOffensiveStat, base.overrideOffensiveStat);
		});
	}
	for (const [species, id, name] of [
		['Kangaskhan', 'dizzypunch', 'Tandem Punch'], ['Metagross', 'meteormash', 'Meteor Ram'],
	]) {
		it(species + ' shows the new signature in its original move slot', () => {
			const [user,, foe] = start(species, id);
			assert.equal(hit(user, foe, id).name, name);
			assert.equal(user.getMoves()[0].move, name);
			assert.equal(user.moveSlots[0].id, id);
		});
	}
	it('Frost Hammer is physical Grass and recoils for one eighth of damage dealt', () => {
		const [p,,t] = start('Abomasnow', 'woodhammer'); const hp = p.hp, foeHP = t.hp;
		const m = hit(p, t, 'woodhammer');
		assert.equal(m.id, 'woodhammer');
		assert.equal(m.type, 'Grass');
		assert.equal(m.category, 'Physical');
		assert.equal(m.basePower, 105);
		assert.equal(m.accuracy, 100);
		assert(foeHP > t.hp);
		assert.equal(hp - p.hp, Math.round((foeHP - t.hp) / 8));
	});
	it('Leaf Rush frees its Grass-type user from binding and recovers only lost Speed on a damaging hit', () => {
		const [p, ally, foe] = start('Sceptile', 'leafblade');
		p.setAbility('No Ability'); // Otherwise Raging Thicket lets the hit bypass Substitute.
		hit(foe, p, 'leechseed');
		assert(!p.volatiles.leechseed);
		p.boosts.spe = -2;
		assert(p.addVolatile('partiallytrapped', foe, Dex.moves.get('wrap')));
		hit(p, ally, 'leafblade');
		assert(p.volatiles.partiallytrapped);
		foe.addVolatile('protect', foe);
		hit(p, foe, 'leafblade');
		assert(p.volatiles.partiallytrapped);
		foe.removeVolatile('protect');
		foe.addVolatile('substitute', foe);
		hit(p, foe, 'leafblade');
		assert(p.volatiles.partiallytrapped);
		assert.equal(p.boosts.spe, -2);
		foe.removeVolatile('substitute');
		hit(p, foe, 'leafblade');
		assert(!p.volatiles.partiallytrapped);
		assert.equal(p.boosts.spe, -1);
		hit(p, foe, 'leafblade');
		hit(p, foe, 'leafblade');
		assert.equal(p.boosts.spe, 0);
	});
	it('Blaze Rush deals its damage through Reflect before breaking it and preserves Light Screen', () => {
		const [p, ally, foe] = start('Blaziken', 'blazekick');
		p.setAbility('No Ability');
		b.randomizer = value => value;
		b.randomChance = (chance, outOf) => chance >= outOf;
		foe.side.addSideCondition('reflect', foe);
		foe.side.addSideCondition('lightscreen', foe);
		p.side.addSideCondition('reflect', p);
		hit(p, ally, 'blazekick');
		assert(p.side.sideConditions.reflect);
		foe.addVolatile('substitute', foe);
		hit(p, foe, 'blazekick');
		assert(foe.side.sideConditions.reflect);
		foe.removeVolatile('substitute');
		const before = foe.hp;
		const move = hit(p, foe, 'blazekick');
		assert.equal(move.critRatio, 2);
		assert.deepEqual(move.secondaries, [{ chance: 10, status: 'brn' }]);
		assert(!foe.side.sideConditions.reflect && foe.side.sideConditions.lightscreen);
		const afterScreen = foe.hp;
		hit(p, foe, 'blazekick');
		assert(before - afterScreen < afterScreen - foe.hp);
	});
	it('Tide Rush clears every hazard on its side once per volley when a foe loses HP', () => {
		const [p,,foe, other] = start('Swampert', 'muddywater');
		p.boosts.accuracy = 6;
		const hazards = ['spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge', 'dragonrend'];
		for (const id of hazards) p.side.addSideCondition(id, foe);
		p.side.addSideCondition('spikes', foe);
		foe.side.addSideCondition('stickyweb', p);
		p.side.addSideCondition('reflect', p);
		foe.addVolatile('protect', foe);
		other.addVolatile('substitute', other);
		hit(p, foe, 'muddywater');
		for (const id of hazards) assert(p.side.sideConditions[id], id);
		other.removeVolatile('substitute');
		hit(p, foe, 'muddywater');
		for (const id of hazards) assert(!p.side.sideConditions[id], id);
		foe.removeVolatile('protect');
		p.side.addSideCondition('stickyweb', foe);
		const before = b.log.length;
		hit(p, foe, 'muddywater');
		assert(!p.side.sideConditions.stickyweb);
		assert(p.side.sideConditions.reflect && foe.side.sideConditions.stickyweb);
		assert.equal(b.log.slice(before).filter(line => line.startsWith('|-sideend|') && line.includes('Sticky Web')).length, 1);
	});
	it('Tide Rush uses Attack and damages both foes while sparing its ally', () => {
		const [p, a, t, q] = start('Swampert', 'muddywater'); p.boosts.accuracy = 6;
		const m = hit(p, t, 'muddywater'); assert.equal(m.category, 'Physical'); assert(!m.secondaries?.length);
		assert(t.hp < 4000 && q.hp < 4000); assert.equal(a.hp, 4000);
	});
	it('Leaf Rush stays a slicing move for both physical and special builds', () => {
		const [p,,t] = start('Sceptile', 'leafblade');
		for (const category of ['Physical', 'Special']) {
			p.storedStats.atk = category === 'Physical' ? 300 : 100; p.storedStats.spa = 200;
			const m = hit(p, t, 'leafblade');
			assert.equal(m.category, category);
			assert(m.flags.slicing);
			assert.equal(m.critRatio, 2);
		}
	});
	it('Saber Parry guards an ally against only the struck foe’s next contact move', () => {
		const [p, a, t, q] = start('Gallade', 'psychocut');
		const m = hit(p, t, 'psychocut');
		assert.equal(m.name, 'Saber Parry'); assert.equal(m.critRatio, 2);
		assert(t.volatiles.saberparry);
		const damage = (from, id, move = Dex.getActiveMove(id)) => b.runEvent('ModifyDamage', from, a, move, 100);
		assert.equal(damage(t, 'watergun'), 100); assert.equal(damage(q, 'tackle'), 100);
		const contact = Dex.getActiveMove('tackle');
		assert.equal(damage(t, 'tackle', contact), 75); assert.equal(damage(t, 'tackle', contact), 75);
		assert.equal(damage(t, 'tackle'), 100);
	});
	it('Guard Song protects both allies from one spread sound attack', () => {
		const [p, a, t, q] = start('Gardevoir', 'hypervoice');
		const song = hit(p, t, 'hypervoice');
		assert.equal(song.type, 'Fairy'); assert.equal(song.basePower, 80); assert(t.hp < 4000 && q.hp < 4000);
		assert(p.side.sideConditions.guardsong);
		const hp = p.hp;
		b.actions.runMove('hypervoice', t, 1, { externalMove: true }); b.clearActiveMove();
		assert.equal(p.hp, hp); assert.equal(a.hp, 4000); assert(!p.side.sideConditions.guardsong);
		hit(t, p, 'hypervoice'); assert(p.hp < hp && a.hp < 4000);
	});
	it('Veil Slash checks damage to the team by the specific target that turn', () => {
		const [p, a, t, q] = start('Gardevoir', 'slash', 'Gardevoir-Mega-Z');
		hit(t, a, 'tackle');
		const m = hit(p, t, 'slash');
		assert.equal(m.name, 'Veil Slash'); assert.equal(m.type, 'Steel'); assert.equal(m.critRatio, 2);
		assert(m.ignorePositiveDefensive); assert(!hit(p, q, 'slash').ignorePositiveDefensive);
		b.turn++; assert(!hit(p, t, 'slash').ignorePositiveDefensive);
	});
	it('expires an unspent Guard Song shield at the end of the following turn', () => {
		const [p,,t] = start('Gardevoir', 'hypervoice');
		hit(p, t, 'hypervoice'); b.fieldEvent('Residual'); assert(p.side.sideConditions.guardsong);
		b.turn++; b.fieldEvent('Residual'); assert(!p.side.sideConditions.guardsong);
	});
	it('Void Volley uses one selected slot and applies two-turn Heal Block only below the threshold', () => {
		const [p,,t, q] = start('Gardevoir', 'swift', 'Gardevoir-Void-Mega');
		assert.equal(p.getMoves()[0].target, 'normal');
		const m = hit(p, t, 'swift'); assert.equal(m.name, 'Void Volley'); assert.equal(m.type, 'Dark');
		assert.equal(m.accuracy, true); assert.equal(q.hp, 4000); assert(!t.volatiles.healblock);
		q.hp = 1900; hit(p, q, 'swift'); assert.equal(q.volatiles.healblock.duration, 2);
		q.volatiles.healblock.duration = 4; hit(p, q, 'swift'); assert.equal(q.volatiles.healblock.duration, 4);
		q.volatiles.healblock.duration = 2; b.fieldEvent('Residual'); assert(q.volatiles.healblock);
		b.turn++; b.fieldEvent('Residual'); assert(!q.volatiles.healblock);
	});
	it('Beacon Beam selects a single foe and qualifies for Star Lens', () => {
		const [p, a, t, q] = start('Ampharos', 'discharge'); const m = hit(p, q, 'discharge');
		assert(qualifiesForStarLens(m));
		assert.equal(m.name, 'Beacon Beam');
		assert(q.hp < 4000);
		assert.equal(t.hp, 4000);
		assert.equal(a.hp, 4000);
	});
	it('Crater Burst damages both foes and spares the ally', () => {
		const [p, a, t, q] = start('Camerupt', 'lavaplume'); const m = hit(p, t, 'lavaplume');
		assert.equal(m.name, 'Crater Burst');
		assert(q.hp < 4000);
		assert(t.hp < 4000);
		assert.equal(a.hp, 4000);
	});
	it('Cloud Song hits through Substitute as a sound and pulse move', () => {
		const [p, a, t] = start('Altaria', 'dragonpulse'); t.addVolatile('substitute', t); t.volatiles.substitute.hp = 1000;
		a.addVolatile('confusion', t); assert(a.volatiles.confusion);
		const m = hit(p, t, 'dragonpulse');
		assert(!a.volatiles.confusion);
		assert.equal(m.basePower, 90);
		assert(m.flags.sound && m.flags.pulse);
		assert(t.hp < 4000);
		assert.equal(t.volatiles.substitute.hp, 1000);
	});
	it('Hex Stitch infiltrates a cursed foe', () => {
		const [p,,t] = start('Banette', 'shadowclaw'); assert(!hit(p, t, 'shadowclaw').infiltrates);
		t.addVolatile('curse', p); assert(hit(p, t, 'shadowclaw').infiltrates);
	});
	it('Greed Gospel recognizes the specific foe that hurt Sableye', () => {
		const [p,,t, q] = start('Sableye', 'powergem');
		t.setType('Psychic');
		q.setType('Psychic');
		assert.deepEqual(p.getSwitchRequestData().greedGospelTargets, []);
		hit(t, p, 'watergun');
		assert.deepEqual(p.getSwitchRequestData().greedGospelTargets, [t.getSlot()]);
		assert.equal(p.getSwitchRequestData(true).greedGospelTargets, undefined);
		assert.equal(hit(p, t, 'powergem').type, 'Ghost');
		assert.equal(hit(p, q, 'powergem').type, 'Rock');
		b.actions.switchIn(t.side.pokemon[2], t.position);
		assert.deepEqual(p.getSwitchRequestData().greedGospelTargets, []);
	});
	it('Greed Gospel keeps Rock against Ghost immunities, Ghost resists and Rock weaknesses', () => {
		const [p,,t] = start('Sableye', 'powergem');
		hit(t, p, 'watergun');
		for (const types of [['Normal'], ['Dark'], ['Fire'], ['Ghost', 'Flying']]) {
			t.setType(types);
			const before = t.hp;
			assert.equal(hit(p, t, 'powergem').type, 'Rock', types.join('/'));
			assert(t.hp < before);
		}
		t.setType('Water');
		assert.equal(hit(p, t, 'greedgospel').type, 'Ghost');
	});
	it('Greed Gospel grants a single STAB on either type and leaves ordinary Power Gem alone', () => {
		const [p,,t] = start('Sableye', 'powergem');
		b.randomizer = damage => damage;
		t.setType('Water');
		for (const type of ['Rock', 'Ghost']) {
			if (type === 'Ghost') hit(t, p, 'watergun');
			const move = hit(p, t, 'powergem');
			assert.equal(move.type, type);
			assert(move.forceSTAB);
			move.willCrit = false;
			const actual = b.actions.getDamage(p, t, move);
			const natural = b.actions.getDamage(p, t, { ...move, forceSTAB: false });
			if (type === 'Rock') assert(Math.abs(actual - natural * 1.5) <= 1);
			else assert.equal(actual, natural);
		}
		p.formeChange('Sableye', null, true);
		const base = hit(p, t, 'powergem');
		assert.equal(base.type, 'Rock');
		assert(!base.forceSTAB);
	});
	it('Armor Slam uses Defense and preserves weight scaling', () => {
		const [p,,t] = start('Aggron', 'heavyslam');
		const m = hit(p, t, 'heavyslam');
		assert.equal(m.overrideOffensiveStat, 'def');
		assert(m.basePowerCallback);
	});
	it('Pulse Chime grants ally recovery only on a real cure', () => {
		const [p, a] = start('Audino', 'healbell');
		a.hp = 1000;
		hit(p, p, 'healbell');
		assert.equal(a.hp, 1000);
		a.setStatus('par');
		hit(p, p, 'healbell');
		assert.equal(a.status, '');
		assert.equal(a.hp, 1650);
	});
	it('Pivot Kick pivots off Protect without crash damage', () => {
		const [p,,t] = start('Lopunny', 'jumpkick'); t.addVolatile('protect', t);
		const hp = p.hp;
		hit(p, t, 'jumpkick');
		assert.equal(p.hp, hp);
		assert(p.switchFlag);
	});

	it('Pivot Kick pivots off an accuracy miss without crash damage', () => {
		const [p,,t] = start('Lopunny', 'jumpkick'); b.onEvent('Accuracy', b.format, () => 0);
		const hp = p.hp;
		hit(p, t, 'jumpkick');
		assert.equal(p.hp, hp);
		assert(p.switchFlag);
	});
	it('Pivot Kick retains crash damage on an immunity distinct from a miss', () => {
		const [p,,t] = start('Lopunny', 'jumpkick'); t.runImmunity = () => false;
		const hp = p.hp;
		hit(p, t, 'jumpkick');
		assert.equal(hp - p.hp, Math.floor(p.baseMaxhp / 2), b.log.slice(-12).join(' '));
		assert(!p.switchFlag);
	});
	it('ordinary Jump Kick still crashes on an accuracy miss', () => {
		const [p,,t] = start('Lopunny', 'jumpkick'); p.formeChange('Lopunny', null, true); b.onEvent('Accuracy', b.format, () => 0);
		const hp = p.hp;
		hit(p, t, 'jumpkick');
		assert.equal(hp - p.hp, Math.floor(p.baseMaxhp / 2), b.log.slice(-12).join(' '));
		assert(!p.switchFlag);
	});
	it('Anchor Slam grounds a Flying target and receives Whiplash', () => {
		const [p,,t] = start('Steelix', 'irontail'); t.setType('Flying'); p.boosts.accuracy = 6;
		const m = hit(p, t, 'irontail');
		assert.equal(m.name, 'Anchor Slam');
		assert(m.flags.tail);
		assert.equal(m.basePower, 85);
		assert(t.isGrounded());
	});
	it('Triple Sting lands three drill hits and receives Power Drill', () => {
		const [p,,t] = start('Beedrill', 'twineedle'); const m = hit(p, t, 'twineedle');
		assert(m.flags.drill); assert.equal(m.hit, 3); assert.equal(m.basePower, 25);
		assert.equal(m.secondaries[0].status, 'psn'); assert.equal(m.secondaries[0].chance, 20);
		assert.equal(b.runEvent('BasePower', p, t, m, 100), 300);
	});
	it('Talon Dive grounds only its struck target', () => {
		const [p, a, t, q] = start('Aerodactyl', 'stoneedge'); q.setType('Flying'); assert(!q.isGrounded());
		const m = hit(p, q, 'stoneedge');
		assert.equal(m.critRatio, 2);
		assert(m.flags.contact);
		assert(!m.secondaries?.length);
		assert(q.volatiles.smackdown);
		assert(q.isGrounded());
		assert(q.hp < 4000);
		assert.equal(t.hp, 4000);
		assert.equal(a.hp, 4000);
	});
	it('Gale Slice ends opposing Tailwind on a hit', () => {
		const [p,,t] = start('Pidgeot', 'airslash'); t.side.addSideCondition('tailwind', t);
		const m = hit(p, t, 'airslash'); assert.equal(m.name, 'Gale Slice'); assert(!t.side.sideConditions.tailwind);
	});
	it('Bolt Dash hits through Substitute and pivots', () => {
		const [p,,t] = start('Manectric', 'voltswitch'); t.addVolatile('substitute', t); t.volatiles.substitute.hp = 1000;
		const m = hit(p, t, 'voltswitch');
		assert.equal(m.name, 'Bolt Dash');
		assert(t.hp < 4000);
		assert.equal(t.volatiles.substitute.hp, 1000);
		assert(p.switchFlag);
	});
	it('Dread Howl bypasses Substitute as a sound move and activates Agony Flame', () => {
		const [p,,t] = start('Houndoom', 'darkpulse'); t.addVolatile('substitute', t); t.volatiles.substitute.hp = 1000;
		b.actions.runMove('darkpulse', p, p.getLocOf(t));
		const m = p.lastMoveUsed;
		assert(m.flags.sound);
		assert(!m.secondaries?.some(s => s.volatileStatus === 'flinch'));
		assert.equal(t.volatiles.substitute.hp, 1000);
		assert(t.volatiles.healblock);
	});
});
