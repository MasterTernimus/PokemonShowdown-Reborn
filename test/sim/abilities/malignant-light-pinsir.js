'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const { qualifiesForRelicBeam, RelicBeamMoves } = require('../../../dist/data/relic-beam');
const { commands, renderRelicBeamReference } = require('../../../dist/server/chat-plugins/relic-beam');

describe('Malignant Light and Pinsir', () => {
	let battle;
	function start(ability, species = 'Mew', doubles = false) {
		const mon = (a = 'No Ability', s = 'Mew') => ({ species: s, ability: a, moves: ['tackle', 'watergun', 'splash', 'protect'] });
		battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [
			[mon(ability, species), mon(), mon()], [mon(), mon(), mon()],
		]);
		battle.makeChoices('team 123', 'team 123');
		battle.randomizer = damage => damage;
		for (const p of battle.getAllActive()) p.hp = p.maxhp = p.baseMaxhp = 10000;
		return [battle.p1.active[0], battle.p2.active[0], battle.p1.active[1], battle.p2.active[1]];
	}
	function hit(source, target, id = 'tackle', extra = {}) {
		const move = Object.assign(Dex.getActiveMove(id), { accuracy: true, willCrit: false, secondaries: null }, extra);
		const hp = target.hp;
		battle.actions.runMove(move, source, source.getLocOf(target), { externalMove: true });
		return hp - target.hp;
	}
	function screens(p) {
		for (const id of ['reflect', 'lightscreen', 'auroraveil']) p.side.addSideCondition(id, p);
	}
	function assertScreens(p, present) {
		for (const id of ['reflect', 'lightscreen', 'auroraveil']) assert.equal(!!p.side.sideConditions[id], present, id);
	}
	afterEach(() => { battle?.destroy(); battle = null; });
	it('assigns the approved slots and leaves Mega Pinsir alone', () => {
		assert.deepEqual(Dex.species.get('pinsir').abilities, { 0: 'Siege Grip', 1: 'Iron Maiden', H: 'Violent Rush' });
		assert.deepEqual(Dex.species.get('pinsir').passives, ['hypercutter']);
		assert.deepEqual(Dex.species.get('pinsirmega').abilities, { 0: 'Unbridled Flight' });
		assert.deepEqual(Dex.species.get('pinsirmega').passives, ['aerilate']);
		assert.equal(Dex.species.get('ampharos').abilities[0], 'Malignant Light');
		assert.deepEqual(Dex.species.get('necrozma').abilities, { 0: 'Prism Armor', 1: 'Malignant Light' });
		assert.deepEqual(Dex.species.get('starmie').passives, ['malignantlight']);
		assert.deepEqual(Dex.species.get('starmiemega').passives, ['purepower']);
	});
	it('retains the original beams and pulse/bullet rule while adding the requested moves', () => {
		const expected = 'aurorabeam bubblebeam chargebeam dynamaxcannon eternabeam flashcannon fleurcannon icebeam lusterpurge meteorbeam moongeistbeam psybeam signalbeam solarbeam steelbeam hydropump thunderbolt powergem dazzlinggleam'.split(' ');
		assert.deepEqual([...RelicBeamMoves].sort(), expected.sort());
		for (const id of [...expected, 'aurasphere', 'bulletseed']) assert(qualifiesForRelicBeam(Dex.moves.get(id)), id);
		assert(!qualifiesForRelicBeam(Dex.moves.get('watergun')));
	});
	for (const [ability, species] of [['Relic Beam', 'Mew'], ['Malignant Light', 'Mew'],
		['Relic Beam', 'Starmie'], ['Malignant Light', 'Starmie'], ['Astral Core', 'Starmie'], ['Astral Core', 'Starmie-Mega']]) {
		it(`applies beam power once for ${ability} on ${species}`, () => {
			const [p, foe] = start(ability, species);
			for (const id of ['hydropump', 'icebeam', 'darkpulse', 'bulletseed']) {
				assert.equal(battle.runEvent('BasePower', p, foe, Dex.getActiveMove(id), 100), 150, id);
			}
			assert.equal(battle.runEvent('BasePower', p, foe, Dex.getActiveMove('watergun'), 100), 100);
			p.boosts.def = 2; p.boosts.spa = -3;
			assert.equal(p.getStat('spa'), p.getStat('def', false, true));
		});
	}
	for (const field of ['volcanicterrain', 'dragonsdenterrain', 'mirrorarenaterrain', 'starlightarenaterrain', 'psychicterrain']) {
		it(`matches Relic Beam damage on ${field}`, () => {
			const [p, foe] = start('Relic Beam');
			battle.field.terrain = field;
			const old = hit(p, foe, 'hydropump');
			p.setAbility('Malignant Light');
			const current = hit(p, foe, 'hydropump');
			assert.equal(current, old);
		});
	}
	it('does not repeat Illuminate field effects when selected and passive', () => {
		const [p, foe] = start('Malignant Light', 'Starmie');
		battle.field.terrain = 'mirrorarenaterrain';
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		// Selected Illuminate defers to the passive; exercise the actual passive dispatch separately.
		assert.equal(foe.boosts.accuracy, 0);
		battle.boost({ accuracy: -1 }, p, foe, Dex.moves.get('sandattack'));
		assert.equal(p.boosts.accuracy, 0);
		const move = Dex.getActiveMove('tackle');
		battle.runEvent('ModifyMove', p, foe, move, move);
		assert(move.ignoreEvasion);
	});
	for (const ability of ['Malignant Light', 'Astral Core']) it(`runs nested Illuminate exactly once on entry for ${ability}`, () => {
		const [p, foe] = start(ability, 'Starmie', true);
		battle.field.terrain = 'mirrorarenaterrain';
		battle.makeChoices('switch 3, move 3', 'move 3, move 3');
		battle.makeChoices('switch 3, move 3', 'move 3, move 3');
		assert.equal(battle.p1.active[0], p);
		assert.equal(foe.boosts.accuracy, -1);
		battle.field.terrain = 'starlightarenaterrain';
		battle.makeChoices('switch 3, move 3', 'move 3, move 3');
		battle.makeChoices('switch 3, move 3', 'move 3, move 3');
		assert.equal(p.boosts.spa, 2);
		assert.equal(battle.log.filter(line => line.includes('dazzling shine put a spotlight')).length, 1);
	});
	it('keeps Astral Core Natural Cure and Pure Power with the nested beam effect', () => {
		const [p] = start('Astral Core', 'Starmie-Mega');
		assert.equal(p.getStat('atk'), p.getStat('atk', false, true) * 2);
		battle.field.terrain = 'psychicterrain';
		assert.equal(p.getStat('spa'), p.getStat('def', false, true) * 2);
		p.setStatus('par');
		battle.singleEvent('SwitchOut', p.getAbility(), p.abilityState, p);
		assert.equal(p.status, '');
	});
	for (const hits of [1, 3, 5]) it(`retaliates once for a ${hits}-hit move, then again for the next move`, () => {
		const [p, foe] = start('Iron Maiden');
		hit(foe, p, 'tackle', { damage: 10, multihit: hits });
		assert.equal(foe.hp, 8750);
		hit(foe, p, 'tackle', { damage: 10 });
		assert.equal(foe.hp, 7500);
	});
	it('does not retaliate for non-contact moves, allies, Protective Pads or Magic Guard', () => {
		const [p, foe, ally] = start('Iron Maiden', 'Mew', true);
		hit(foe, p, 'watergun', { damage: 10 }); assert.equal(foe.hp, 10000);
		hit(ally, p, 'tackle', { damage: 10 }); assert.equal(ally.hp, 10000);
		foe.setItem('protectivepads'); hit(foe, p, 'tackle', { damage: 10 }); assert.equal(foe.hp, 10000);
		foe.clearItem(); foe.setAbility('Magic Guard');
		hit(foe, p, 'tackle', { damage: 10 }); assert.equal(foe.hp, 10000);
	});
	it('retaliates on a knockout hit without giving Moxie credit for indirect damage', () => {
		const [p, foe] = start('Iron Maiden');
		p.hp = 1; hit(foe, p, 'tackle', { damage: 10 });
		assert.equal(p.hp, 0); assert.equal(foe.hp, 8750);
	});
	it('retains Moxie for direct move KOs only', () => {
		const [p, foe] = start('Iron Maiden');
		foe.hp = 1; hit(foe, p, 'tackle', { damage: 10 });
		assert.equal(p.boosts.atk, 0);
		const next = battle.p2.pokemon.find(mon => mon.hp > 0 && mon !== foe);
		battle.actions.switchIn(next, 0); next.hp = 1;
		hit(p, next, 'tackle', { damage: 10 });
		assert.equal(p.boosts.atk, 1);
	});
	it('breaks all screens before damage, including on Substitute', () => {
		const [p, foe] = start('Siege Grip');
		const normal = hit(p, foe);
		screens(foe); assert.equal(hit(p, foe), normal); assertScreens(foe, false);
		screens(foe); foe.addVolatile('substitute');
		const subhp = foe.volatiles.substitute.hp; hit(p, foe);
		assert.equal(subhp - foe.volatiles.substitute.hp, normal); assertScreens(foe, false);
	});
	for (const failure of ['miss', 'protect', 'immune']) it(`leaves screens on ${failure}`, () => {
		const [p, foe] = start('Siege Grip'); screens(foe);
		if (failure === 'protect') foe.addVolatile('protect');
		if (failure === 'immune') foe.setType('Ghost');
		hit(p, foe, 'tackle', failure === 'miss' ? { accuracy: 0 } : {});
		assertScreens(foe, true);
	});
	it('requires both physical and contact and excludes allies', () => {
		const [p, foe, ally] = start('Siege Grip', 'Mew', true); screens(foe); screens(ally);
		hit(p, foe, 'watergun', { flags: { contact: 1 } }); assertScreens(foe, true);
		hit(p, foe, 'tackle', { flags: {} }); assertScreens(foe, true);
		hit(p, ally); assertScreens(ally, true);
	});
	it('checks spread targets and removes each screen only once', () => {
		const [p, foe, , other] = start('Siege Grip', 'Mew', true); screens(foe);
		foe.addVolatile('protect');
		hit(p, foe, 'tackle', { target: 'allAdjacentFoes' });
		assertScreens(other, false);
		assert.equal(battle.log.filter(line => line.startsWith('|-sideend|') && /Reflect|Light Screen|Aurora Veil/.test(line)).length, 3);
	});
	it('removes only the hit sides in a Free-for-All spread attack', () => {
		const mon = ability => [{ species: 'Mew', ability, moves: ['splash', 'tackle'] }];
		battle = common.createBattle({ formatid: 'gen9freeforall4pmistyfieldadrienn' },
			[mon('Siege Grip'), mon('No Ability'), mon('No Ability'), mon('No Ability')]);
		battle.makeChoices('team 1', 'team 1', 'team 1', 'team 1');
		battle.field.terrain = '';
		const [p, a, b, c] = battle.sides.map(side => side.active[0]);
		for (const foe of [a, b, c]) screens(foe);
		a.addVolatile('protect'); c.setType('Ghost');
		hit(p, b, 'tackle', { target: 'allAdjacentFoes' });
		assertScreens(a, true); assertScreens(b, false); assertScreens(c, true);
	});
	it('retains current Mold Breaker against breakable immunity', () => {
		const [p, foe] = start('Siege Grip'); foe.setAbility('Levitate'); screens(foe);
		assert(hit(p, foe, 'tackle', { type: 'Ground' }) > 0); assertScreens(foe, false);
	});
	it('lists current beams and supports eligibility lookup safely', () => {
		const html = renderRelicBeamReference();
		for (const id of RelicBeamMoves) assert(html.includes(Dex.moves.get(id).name), id);
		assert.equal(html.match(/Power Gem/g).length, 1);
		let reply;
		const context = { runBroadcast: () => true, sendReplyBox: text => { reply = text; }, errorReply: text => { reply = text; } };
		commands.relicbeam.call(context, 'Hydro Pump'); assert(reply.includes('gains 50%'));
		commands.relicbeam.call(context, 'Tackle'); assert(reply.includes('does not receive'));
		commands.relicbeam.call(context, 'Heal Pulse'); assert(reply.includes('gains no damage bonus'));
		assert(!html.includes('Heal Pulse'));
		commands.relicbeam.call(context, 'not a move'); assert(reply.includes('Unknown move'));
		context.runBroadcast = () => false; reply = null;
		commands.relicbeam.call(context, ''); assert.equal(reply, null);
	});
});
