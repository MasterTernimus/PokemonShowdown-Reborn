'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const { AbilityComponents } = require('../../../dist/data/ability-components');

describe('Hot Streak and False Salvation', () => {
	let battle;
	const mon = (ability = 'No Ability', species = 'Mew') => ({ species, ability, moves: ['splash', 'swordsdance', 'shellsmash', 'sonicboom'] });
	function start(ability = 'Hot Streak', doubles = false, species = 'Mew') {
		battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [
			[mon(ability, species), mon(), mon()], [mon(), mon(), mon()],
		]);
		battle.makeChoices('team 123', 'team 123');
		return [battle.p1.active[0], battle.p2.active[0], battle.p1.active[1], battle.p2.active[1]];
	}
	function attack(source, target, extra = {}) {
		const move = Object.assign(battle.dex.getActiveMove('sonicboom'), { accuracy: true, damage: 10 }, extra);
		battle.actions.useMove(move, source, { target });
	}
	const messageCount = text => battle.log.filter(line => line.includes(text)).length;
	afterEach(() => { battle?.destroy(); battle = null; });

	it('changes only the requested ability slots and Mega Audino passive', () => {
		assert.deepEqual(Dex.species.get('Pangoro').abilities, { 0: 'Hot Streak', 1: 'Raging Beast', H: 'Scrappy' });
		assert.deepEqual(Dex.species.get('Musharna').abilities, { 0: 'Neutralization', 1: 'Dream Refuge', H: 'False Salvation', S: 'Aevian Dream' });
		assert.deepEqual(Dex.species.get('Musharna-Rejuv').abilities, { 0: 'Aevian Dream' });
		assert.deepEqual(Dex.species.get('Audino').passives, ['sweetveil']);
		assert.deepEqual(Dex.species.get('Audino-Mega').passives, ['friendguard']);
		assert.deepEqual(Dex.species.get('Audino').abilities, { 0: 'Vital Signs', 1: 'Regenerator', H: 'Triage' });
	});
	it('rolls exactly 1/5 once per turn across hits, targets, and additional moves', () => {
		const [p, foe] = start('Hot Streak', true);
		let rolls = 0;
		battle.randomChance = (n, d) => { if (n === 1 && d === 5) rolls++; return false; };
		attack(p, foe, { multihit: 3, target: 'allAdjacentFoes' });
		attack(p, foe);
		assert.equal(rolls, 1);
		assert.equal(battle.runEvent('ModifyCritRatio', p, foe, battle.dex.getActiveMove('tackle'), 1), 2);
		battle.turn++;
		attack(p, foe);
		assert.equal(rolls, 2);
	});
	it('does not spend its roll on allies, misses, Protect or Substitute-only hits', () => {
		const [p, foe, ally] = start('Hot Streak', true);
		let rolls = 0;
		battle.randomChance = (n, d) => {
			if (n === 1 && d === 5) { rolls++; return true; }
			return n >= d;
		};
		attack(p, ally);
		attack(p, foe, { accuracy: 0 });
		foe.addVolatile('protect'); attack(p, foe); foe.removeVolatile('protect');
		foe.addVolatile('substitute'); attack(p, foe); foe.removeVolatile('substitute');
		assert.equal(rolls, 0);
		attack(p, foe); assert.equal(rolls, 1); assert(p.volatiles.jackpot);
	});
	it('starts on a landed attack, cures status and cannot refresh or roll while active', () => {
		const [p, foe] = start(); p.setStatus('par');
		let rolls = 0;
		battle.randomChance = (n, d) => { if (n === 1 && d === 5) rolls++; return true; };
		attack(p, foe);
		assert.equal(p.status, ''); assert.equal(p.volatiles.jackpot.turns, 4);
		assert.equal(messageCount('The restless gambler hit the jackpot!'), 1);
		battle.turn++;
		attack(p, foe, { multihit: 3 });
		assert.equal(rolls, 1); assert.equal(p.volatiles.jackpot.turns, 4);
	});
	it('heals on activation turn and the next three turns, then expires without a fifth heal', () => {
		const [p] = start(); p.addVolatile('jackpot');
		for (let i = 0; i < 4; i++) {
			p.hp = 1;
			battle.makeChoices('move splash', 'move splash');
			assert.equal(p.hp, 1 + Math.floor(p.maxhp / 4));
			assert.equal(!!p.volatiles.jackpot, i < 3);
		}
		p.hp = 1; battle.makeChoices('move splash', 'move splash'); assert.equal(p.hp, 1);
	});
	it('cleanses harmful volatiles on activation and healing turns without removing beneficial effects', () => {
		const [p, foe] = start();
		p.addVolatile('focusenergy');
		for (const id of ['leechseed', 'curse', 'confusion', 'taunt', 'yawn', 'perishsong', 'trapped']) p.addVolatile(id, foe);
		p.addVolatile('jackpot');
		for (const id of ['leechseed', 'curse', 'confusion', 'taunt', 'yawn', 'perishsong', 'trapped']) assert(!p.volatiles[id], id);
		assert(p.volatiles.focusenergy); assert(p.hp > 0); assert.equal(p.status, '');
		p.hp = 100; p.setStatus('par');
		p.addVolatile('healblock', foe); p.addVolatile('leechseed', foe);
		battle.singleEvent('Residual', battle.dex.conditions.get('jackpot'), p.volatiles.jackpot, p);
		assert.equal(p.status, ''); assert(!p.volatiles.healblock); assert(!p.volatiles.leechseed);
		assert.equal(p.hp, 100 + Math.floor(p.maxhp / 4)); assert(p.volatiles.focusenergy);
	});
	it('reduces attack damage by 20% but allows fainting before the healing turn', () => {
		const [p, foe] = start(); p.addVolatile('jackpot');
		assert.equal(battle.runEvent('ModifyDamage', foe, p, battle.dex.getActiveMove('tackle'), 100), 80);
		p.hp = 1; p.setStatus('psn');
		battle.makeChoices('move splash', 'move splash');
		assert.equal(p.hp, 0); assert(p.fainted);
	});
	it('respects the existing strongest-ability reduction rule with Filter', () => {
		const [p, foe, ally] = start('Filter', true);
		ally.setAbility('friendguard'); p.addVolatile('jackpot');
		assert.equal(battle.runEvent('ModifyDamage', foe, p, battle.dex.getActiveMove('tackle'), 100), 75);
	});
	it('switching clears Jackpot and its noCopy flag prevents passing it', () => {
		const [p, foe] = start(); battle.randomChance = () => true;
		attack(p, foe); assert.equal(Dex.conditions.get('jackpot').noCopy, true);
		battle.makeChoices('switch 2', 'move splash');
		assert(!p.volatiles.jackpot); assert(!battle.p1.active[0].volatiles.jackpot);
	});
	it('changing abilities does not grant another Jackpot roll in the same turn', () => {
		const [p, foe] = start(); let rolls = 0;
		battle.randomChance = (n, d) => { if (n === 1 && d === 5) rolls++; return false; };
		attack(p, foe); p.setAbility('pressure');
		p.setAbility('hotstreak'); attack(p, foe);
		assert.equal(rolls, 1);
	});
	for (const move of ['bellydrum', 'filletaway']) it('preserves ' + move + ' HP cost when replacing boosts', () => {
		const [, foe] = start('False Salvation'); foe.maxhp = foe.baseMaxhp = foe.hp = 400;
		battle.actions.useMove(move, foe);
		assert.equal(foe.boosts.atk, 0); assert.equal(foe.boosts.spa, 0); assert.equal(foe.boosts.spe, 0);
		// Fillet Away boosts (and heals at full HP) before paying its cost; Belly Drum pays first.
		assert.equal(foe.hp, move === 'bellydrum' ? 300 : 200);
		assert.equal(messageCount('Its desire for power was replaced with comfort!'), 1);
	});
	it('only spends one holder allowance for a move, and ability changes do not reset it', () => {
		const [p, foe, ally] = start('False Salvation', true); ally.setAbility('falsesalvation');
		battle.actions.useMove('shellsmash', foe);
		assert.equal(messageCount('Its desire for power was replaced with comfort!'), 1);
		assert.equal((p.m.falseSalvationFoes?.length || 0) + (ally.m.falseSalvationFoes?.length || 0), 1);
		battle.actions.useMove('swordsdance', foe); assert.equal(foe.boosts.atk, 0);
		p.setAbility('pressure'); p.setAbility('falsesalvation');
		battle.actions.useMove('swordsdance', foe); assert.equal(foe.boosts.atk, 2);
	});
	for (const ability of ['False Salvation', 'Divine Intervention']) {
		it(ability + ' replaces multiple self boosts with one heal, preserves decreases and allows the next boost', () => {
			const [p, foe] = start(ability); foe.hp = 100;
			battle.actions.useMove('shellsmash', foe);
			assert.equal(foe.hp, 100 + Math.floor(foe.maxhp / 4));
			assert.deepEqual(foe.boosts, { atk: 0, def: -1, spa: 0, spd: -1, spe: 0, accuracy: 0, evasion: 0 });
			assert.equal(messageCount('Its desire for power was replaced with comfort!'), 1);
			battle.actions.useMove('swordsdance', foe); assert.equal(foe.boosts.atk, 2);
			assert(!p.hasAbility('triage')); assert(!p.hasAbility('friendguard'));
		});
		it(ability + ' preserves Telepathy including its Psychic-field Speed bonus', () => {
			const [p, , ally] = start(ability, true); const hp = p.hp;
			attack(ally, p); assert.equal(p.hp, hp);
			const speed = p.getStat('spe'); battle.field.setTerrain('psychicterrain', p);
			assert.equal(p.getStat('spe'), speed * 2);
		});
	}
	it('still replaces boosts at full HP and does not report the move as failed', () => {
		const [, foe] = start('False Salvation');
		battle.actions.useMove('swordsdance', foe);
		assert.equal(foe.hp, foe.maxhp); assert.equal(foe.boosts.atk, 0);
		assert(!battle.log.some(line => line.startsWith('|-fail|')));
	});
	it('tracks each opposing Pokemon separately and keeps eligibility spent through opponent switches', () => {
		const [p, foe, , other] = start('False Salvation', true);
		battle.actions.useMove('swordsdance', foe); battle.actions.useMove('swordsdance', other);
		assert.equal(foe.boosts.atk, 0); assert.equal(other.boosts.atk, 0);
		battle.makeChoices('move splash, move splash', 'switch 3, move splash');
		battle.makeChoices('move splash, move splash', 'switch 3, move splash');
		assert.equal(battle.p2.active[0], foe);
		battle.actions.useMove('swordsdance', foe); assert.equal(foe.boosts.atk, 2);
		battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		assert.equal(battle.p1.active[0], p);
		battle.actions.useMove('swordsdance', foe); assert.equal(foe.boosts.atk, 2);
		assert.equal(messageCount('Its desire for power was replaced with comfort!'), 3);
	});
	it('ignores damaging moves, ally boosts, items and abilities without consuming eligibility', () => {
		const [, foe, , ally] = start('False Salvation', true);
		attack(foe, battle.p1.active[1], { self: { boosts: { atk: 1 } } }); assert.equal(foe.boosts.atk, 1);
		battle.boost({ atk: 1 }, foe, foe, battle.dex.items.get('liechiberry'));
		battle.boost({ atk: 1 }, foe, foe, battle.dex.abilities.get('moxie'));
		battle.actions.useMove(Object.assign(battle.dex.getActiveMove('swordsdance'), { target: 'adjacentAlly' }), ally, { target: foe });
		assert.equal(foe.boosts.atk, 5);
		battle.actions.useMove('swordsdance', foe); assert.equal(foe.boosts.atk, 5);
	});
	it('failed, capped and suppressed status attempts do not consume eligibility', () => {
		const [p, foe] = start('False Salvation');
		battle.actions.useMove(Object.assign(battle.dex.getActiveMove('swordsdance'), { onTryHit() { return false; } }), foe);
		assert(!p.m.falseSalvationFoes?.length);
		foe.boosts.atk = 6; battle.actions.useMove('swordsdance', foe); assert(!p.m.falseSalvationFoes?.length);
		foe.boosts.atk = 0; p.addVolatile('gastroacid'); battle.actions.useMove('swordsdance', foe);
		assert.equal(foe.boosts.atk, 2); assert(!p.m.falseSalvationFoes?.length);
		p.removeVolatile('gastroacid'); battle.actions.useMove('swordsdance', foe); assert.equal(foe.boosts.atk, 2);
	});
	it('Divine Intervention composes each nested effect once and Mega Audino supplies Friend Guard separately', () => {
		const [p, foe, ally] = start('Divine Intervention', true, 'Audino-Mega');
		assert.deepEqual(AbilityComponents.divineintervention, ['vitalsigns', 'falsesalvation', 'regenerator']);
		assert.equal(battle.heal(100, (ally.hp = 1, ally), ally, battle.dex.moves.get('lifedew')), 130);
		assert.equal(battle.runEvent('ModifyDamage', foe, ally, battle.dex.getActiveMove('tackle'), 100), 75);
		assert.equal(battle.runEvent('ModifyDamage', foe, p, battle.dex.getActiveMove('tackle'), 100), 100);
		assert.equal(battle.runEvent('ModifyPriority', p, foe, battle.dex.getActiveMove('recover'), 0), 0);
		p.hp = 1; battle.singleEvent('SwitchOut', p.getAbility(), p.abilityState, p);
		assert.equal(p.hp, 1 + Math.floor(p.maxhp / 3));
	});
});
