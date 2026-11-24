'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
describe('Mega signature moves and Dodrio', () => {
	let b;
	function start(species, ability, moves) {
		b = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species, ability, moves }, { species: 'Mew', moves: ['splash'] }],
			[{ species: 'Blissey', ability: 'No Ability', moves: ['splash'] }, { species: 'Mew', moves: ['splash'] }],
		]);
		b.makeChoices('team 12', 'team 12');
		const p = b.p1.active[0], t = b.p2.active[0];
		t.maxhp = t.baseMaxhp = t.hp = 4000;
		return [p, t];
	}
	afterEach(() => b?.destroy());
	function hit(p, t, move) {
		b.actions.useMove(move, p, { target: t });
		const result = p.lastMoveUsed;
		b.clearActiveMove();
		return result;
	}
	it('Snare Vine traps, reduces incoming damage, drains, expires and rewards only a trapped KO', () => {
		const [p, t] = start('Victreebel', 'Chlorophyll', ['powerwhip']);
		p.formeChange('Victreebel-Mega', b.dex.items.get('victreebelite'), true);
		p.maxhp = p.baseMaxhp = 4000; p.hp = 100;
		const m = hit(p, t, 'powerwhip'); assert.equal(m.name, 'Snare Vine'); assert.equal(m.accuracy, 100);
		assert.equal(t.volatiles.snarevine.duration, 2);
		assert.equal(b.runEvent('ModifyDamage', t, p, b.dex.getActiveMove('pound'), 100), 70);
		const before = t.hp;
		b.fieldEvent('Residual');
		assert.equal(before - t.hp, 250);
		assert(p.hp >= 350);
		b.fieldEvent('Residual'); assert(!t.volatiles.snarevine);
		hit(p, t, 'powerwhip');
		p.hp = 100;
		t.faint(p, m);
		b.faintMessages();
		assert.equal(p.hp, 2100);
	});
	it('forces super effectiveness for Fire and Steel dual types while preserving stronger matchups', () => {
		const [p, t] = start('Empoleon', 'Imperial Ascendant', ['wavecrash']);
		const m = hit(p, t, 'wavecrash');
		for (const types of [['Water', 'Steel'], ['Fire', 'Water'], ['Ground', 'Dragon']]) {
			t.setType(types); assert.equal(t.runEffectiveness(m), types[0] === 'Ground' ? 2 : 1);
		}
	});
	for (const [base, form, alt, weak] of [['Golisopod', 'Golisopod-Mega', 'Steel', 'Fairy'], ['Golisopod-Aevian', 'Golisopod-Aevian-Mega', 'Ground', 'Electric']]) {
		it(form + ' chooses its better attack type and keeps the first-turn restriction', () => {
			const [p, t] = start(base, 'No Ability', ['firstimpression']);
			p.formeChange(form, b.dex.items.get('golisopite'), true);
			t.setType(weak);
			const m = hit(p, t, 'firstimpression'); assert.equal(m.type, alt); assert.equal(m.name, 'F.M. Impression');
			t.setType('Grass'); assert.equal(hit(p, t, 'firstimpression').type, 'Bug');
			p.activeMoveActions = 2;
			const hp = t.hp;
			hit(p, t, 'firstimpression');
			assert.equal(t.hp, hp);
			assert(Dex.species.getLearnsetData(Dex.species.get(base).id).learnset.bulletpunch);
		});
	}
	it('Armored Shell grants Water STAB, Heatproof and only the Water resistances', () => {
		const [p, t] = start('Golisopod', 'No Ability', ['waterfall']);
		p.formeChange('Golisopod-Mega', b.dex.items.get('golisopite'), true);
		assert.equal(p.ability, 'armoredshell'); assert(p.hasAbility('heatproof'));
		assert(hit(p, t, 'waterfall').forceSTAB);
		assert.equal(p.runEffectiveness(b.dex.getActiveMove('waterfall')), -1);
		assert.equal(p.runEffectiveness(b.dex.getActiveMove('thunderbolt')), 0);
	});
	for (const [base, mega, move, name] of [['Scizor', 'Scizor-Mega', 'bulletpunch', 'Pincer Jab']]) {
		it(mega + ' converts its signature only after Mega Evolution', () => {
			const [p, t] = start(base, 'No Ability', [move]);
			assert.notEqual(hit(p, t, move).name, name);
			p.formeChange(mega, b.dex.items.get('scizorite'), true);
			t.boosts.def = 2;
			const active = hit(p, t, move);
			assert.equal(active.name, name);
			assert.equal(p.getMoves()[0].id, move);
			assert.equal(p.getMoves()[0].move, name);
			assert.equal(active.basePower, 50);
		});
	}
	it('False Smile spends Play Rough PP and activates Dread Maw only after Mega Evolution', () => {
		const [p, t] = start('Mawile', 'No Ability', ['playrough']);
		assert(!hit(p, t, 'playrough').flags.bite);
		p.formeChange('Mawile-Mega', b.dex.items.get('mawilite'), true);
		const oldPP = p.moveSlots[0].pp;
		b.makeChoices('move playrough', 'move splash');
		const move = p.lastMoveUsed;
		assert.equal(move.name, 'False Smile');
		assert.equal(move.basePower, 70);
		assert.equal(move.accuracy, 100);
		assert(move.flags.bite);
		assert(t.volatiles.healblock);
		assert.equal(p.moveSlots[0].pp, oldPP - 1);
	});
	for (const [species, ability, move, bonus] of [
		['Feraligatr', 'Tidal Awakening', 'riptidefang', 127],
		['Sharpedo', 'Strong Jaw', 'riptidefang', 98],
		['Ledian', 'Dazzling', 'carapacejab', 105],
		['Buzzwole', 'Iron Fist', 'carapacejab', 105],
	]) it(species + ' can learn its same-type move and receives its ability bonus', () => {
		const [p, t] = start(species, ability, [move]);
		const attack = b.dex.getActiveMove(move);
		assert.equal(require('../../../dist/sim').TeamValidator.get('gen9nofieldsinglesgame').checkCanLearn(attack, p.species), null);
		const result = b.runEvent('BasePower', p, t, attack, attack.basePower);
		assert(Math.abs(result - bonus) <= 1, String(result));
	});
	it('Dodrio combines Hydra Bond with one Sticky Web clear per entry', () => {
		const [p, t] = start('Dodrio', 'Tripwire Kick', ['doublekick', 'tackle']);
		assert.equal(p.species.abilities.H, 'Guts');
		assert.equal(hit(p, t, 'tackle').multihit, 3);
		assert.equal(b.runEvent('BasePower', p, t, b.dex.getActiveMove('doublekick'), 100), 110);
		assert.equal(b.runEvent('BasePower', p, t, b.dex.getActiveMove('tackle'), 100), 100);
		p.side.addSideCondition('stickyweb', t);
		hit(p, t, 'doublekick');
		assert(!p.side.sideConditions.stickyweb);
		assert.equal(t.boosts.spe, 0);
		p.side.addSideCondition('stickyweb', t);
		hit(p, t, 'doublekick');
		assert(p.side.sideConditions.stickyweb);
	});
});
