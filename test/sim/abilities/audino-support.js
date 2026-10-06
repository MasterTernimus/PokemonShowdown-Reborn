'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex, TeamValidator} = require('../../../dist/sim');
let battle;
const mon = (species, ability, moves = ['splash', 'sonicboom', 'wish', 'followme']) => ({species, ability, moves});
function setup(ability = 'Vital Signs', doubles = false, second = 'No Ability') {
	battle = common.createBattle({formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame'}, [
		[mon('Audino', ability), mon('Mew', second), mon('Audino', 'Vital Signs')],
		[mon('Mew', 'No Ability'), mon('Mew', 'No Ability'), mon('Mew', 'No Ability')],
	]);
	battle.makeChoices('team 123', 'team 123');
	battle.field.terrain = '';
	return [battle.p1.active[0], battle.p2.active[0], battle.p1.active[1]];
}
function hit(target, source, overrides = {}) {
	const move = battle.dex.getActiveMove('sonicboom');
	Object.assign(move, {accuracy: true, damage: 20}, overrides);
	battle.actions.runMove(move, source, source.getLocOf(target));
}
function rescueCount() { return battle.log.filter(s => s.includes('|-activate|') && s.includes('ability: Vital Signs')).length; }
describe('Approved Audino support rework', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('preserves stats, types and alternate slots, and adds only the two support moves', () => {
		assert.deepEqual(Dex.species.get('Audino').abilities, {0: 'Vital Signs', 1: 'Regenerator', H: 'Triage'});
		assert.deepEqual(Dex.species.get('Audino').baseStats, {hp: 103, atk: 60, def: 96, spa: 80, spd: 96, spe: 50});
		assert.deepEqual(Dex.species.get('Audino-Mega').baseStats, {hp: 103, atk: 60, def: 136, spa: 100, spd: 136, spe: 50});
		const validator = new TeamValidator('gen9nofieldsinglesgame');
		for (const species of ['Audino', 'Audino-Mega']) {
			assert.deepEqual(Dex.species.get(species).types, ['Normal', 'Fairy']);
			for (const move of ['Heal Bell', 'Follow Me']) assert.equal(validator.checkCanLearn(Dex.moves.get(move), Dex.species.get(species)), null);
			assert(validator.checkCanLearn(Dex.moves.get('Recover'), Dex.species.get(species)));
		}
	});
	for (const ability of ['Vital Signs', 'Divine Intervention']) {
		it(ability + ' treats the holder once after opposing HP damage, including already-low HP', () => {
			const [p, foe] = setup(ability); p.hp = 90; p.setStatus('par');
			hit(p, foe);
			assert.equal(p.hp, 70 + battle.modify(Math.floor(p.maxhp / 4), 1.3));
			assert.equal(p.status, ''); assert.equal(p.m.vitalSignsRescued, true); assert.equal(rescueCount(), 1);
			p.hp = 90; p.setStatus('par'); hit(p, foe); assert.equal(p.hp, 70); assert.equal(p.status, 'par');
		});
		it(ability + ' provides full Invigorate healing and Safeguard identity', () => {
			const [p] = setup(ability); p.hp = 1;
			assert.equal(battle.heal(100, p, p, battle.dex.moves.get('lifedew')), 130);
			assert(p.hasAbility('invigorate'));
			battle.actions.useMove('safeguard', p); assert.equal(p.side.sideConditions.safeguard.duration, 5);
		});
		it(ability + ' preserves Invigorate ally cure without curing the holder at residual', () => {
			const [p, , ally] = setup(ability, true); p.setStatus('par'); ally.setStatus('par');
			battle.randomChance = () => true;
			battle.singleEvent('Residual', p.getAbility(), p.abilityState, p);
			assert.equal(p.status, 'par'); assert.equal(ally.status, ''); assert(!ally.m.vitalSignsRescued);
		});
	}
	it('treats an ally and holder independently after one spread attack', () => {
		const [p, foe, ally] = setup('Vital Signs', true); p.hp = ally.hp = 100;
		hit(p, foe, {target: 'allAdjacentFoes'});
		assert(p.m.vitalSignsRescued); assert(ally.m.vitalSignsRescued); assert.equal(rescueCount(), 2);
	});
	it('resolves only after all multihits, not when the first hit reaches half HP', () => {
		const [p, foe] = setup(); p.hp = 110;
		hit(p, foe, {multihit: 3});
		assert.equal(p.hp, 50 + battle.modify(Math.floor(p.maxhp / 4), 1.3));
		assert.equal(rescueCount(), 1);
		const count = battle.log.findIndex(s => s.includes('|-hitcount|'));
		assert(count >= 0); assert(battle.log.findIndex(s => s.includes('|-heal|')) > count);
	});
	it('does not save a target knocked out by the final multihit', () => {
		const [p, foe] = setup(); p.hp = 50; hit(p, foe, {multihit: 3});
		assert.equal(p.hp, 0); assert(!p.m.vitalSignsRescued); assert.equal(rescueCount(), 0);
	});
	it('does not react to Substitute-only damage or retain it for another move', () => {
		const [p, foe] = setup(); p.hp = 120; p.addVolatile('substitute');
		hit(p, foe); assert.equal(p.hp, 120); assert.equal(rescueCount(), 0);
		p.removeVolatile('substitute'); hit(p, foe); assert(p.m.vitalSignsRescued);
	});
	it('requires actual damage and half HP or less at resolution', () => {
		const [p, foe] = setup(); const hp = p.hp; hit(p, foe); assert.equal(p.hp, hp - 20); assert(!p.m.vitalSignsRescued);
		p.hp = 100; p.addVolatile('protect'); hit(p, foe, {flags: {protect: 1}}); assert.equal(p.hp, 100); assert(!p.m.vitalSignsRescued);
	});
	it('excludes allied hits, recoil and residual damage', () => {
		const [p, foe, ally] = setup('Vital Signs', true); p.hp = 140;
		hit(p, ally); assert.equal(p.hp, 120); assert(!p.m.vitalSignsRescued);
		battle.damage(20, p, foe, battle.dex.conditions.get('brn'));
		battle.damage(20, p, p, battle.dex.conditions.get('recoil'));
		battle.actions.runMove('splash', foe, 1); assert.equal(p.hp, 80); assert.equal(rescueCount(), 0);
	});
	it('multiple holders cannot duplicate rescue but retain ordinary Invigorate stacking', () => {
		const [p, foe, ally] = setup('Vital Signs', true, 'Divine Intervention'); p.hp = 100;
		hit(p, foe); const healing = battle.modify(battle.modify(Math.floor(p.maxhp / 4), 1.3), 1.3);
		assert.equal(p.hp, 80 + healing); assert.equal(rescueCount(), 1); assert(!ally.m.vitalSignsRescued);
	});
	it('switching and ability changes do not reset the recipient allowance', () => {
		const [p, foe] = setup(); p.hp = 100; hit(p, foe);
		p.setAbility('Regenerator'); p.setAbility('Divine Intervention');
		battle.makeChoices('switch 2', 'move splash'); battle.makeChoices('switch 2', 'move splash');
		assert.equal(battle.p1.active[0], p); assert(p.m.vitalSignsRescued);
		p.hp = 100; hit(p, battle.p2.active[0]); assert.equal(p.hp, 80); assert.equal(rescueCount(), 1);
	});
	it('Mega Evolution preserves a used recipient allowance and installs all four components', () => {
		const [p, foe] = setup(); p.hp = 100; hit(p, foe); p.setItem('Audinite'); p.canMegaEvo = 'Audino-Mega';
		assert(battle.actions.runMegaEvo(p)); assert.equal(p.ability, 'divineintervention');
		for (const id of ['vitalsigns', 'invigorate', 'triage', 'regenerator', 'friendguard']) assert(p.hasAbility(id));
		assert(!p.hasAbility('fluffy')); assert(!p.hasAbility('swornduty'));
		p.hp = 100; hit(p, foe); assert.equal(p.hp, 80); assert.equal(rescueCount(), 1);
	});
	for (const suppression of ['gastroacid', 'meridianseal', 'neutralizinggas', 'moldbreaker']) {
		it('obeys ' + suppression + ' and does not spend the charge while suppressed', () => {
			const [p, foe] = setup(); p.hp = 100;
			if (suppression === 'gastroacid' || suppression === 'meridianseal') p.addVolatile(suppression);
			else foe.setAbility(suppression);
			hit(p, foe); assert.equal(p.hp, 80); assert(!p.m.vitalSignsRescued);
			p.removeVolatile(suppression); foe.setAbility('Run Away'); hit(p, foe); assert(p.m.vitalSignsRescued);
		});
	}
	it('Heal Block preserves charge when no treatment succeeds, then permits a later rescue', () => {
		const [p, foe] = setup(); p.hp = 100; p.addVolatile('healblock', foe);
		hit(p, foe); assert.equal(p.hp, 80); assert(!p.m.vitalSignsRescued);
		p.removeVolatile('healblock'); hit(p, foe); assert(p.m.vitalSignsRescued);
	});
	it('a status cure can spend the charge even when HP healing is blocked', () => {
		const [p, foe] = setup(); p.hp = 100; p.setStatus('par'); p.addVolatile('healblock', foe);
		hit(p, foe); assert.equal(p.hp, 80); assert.equal(p.status, ''); assert(p.m.vitalSignsRescued);
	});
	it('Divine Intervention no longer heals allies on entry or applies Fluffy to the holder', () => {
		const [p, foe, ally] = setup('Run Away', true); ally.hp = 100; p.setAbility('Divine Intervention');
		assert.equal(ally.hp, 100);
		for (const move of ['tackle', 'flamethrower', 'firepunch']) assert.equal(battle.runEvent('ModifyDamage', foe, p, battle.dex.getActiveMove(move), 100), 100);
		assert.equal(battle.runEvent('ModifyDamage', foe, ally, battle.dex.getActiveMove('tackle'), 100), 75);
		p.hp = 1; battle.singleEvent('SwitchOut', p.getAbility(), p.abilityState, p); assert.equal(p.hp, 1 + Math.floor(p.maxhp / 3));
	});
	it('Divine Intervention provides full Triage including cleansing and draining attacks', () => {
		const [p, foe] = setup('Divine Intervention');
		for (const id of ['wish', 'healpulse', 'lifedew', 'healingwish', 'rest', 'healbell', 'aromatherapy', 'junglehealing', 'purify', 'refresh', 'drainingkiss', 'drainpunch']) {
			const move = battle.dex.getActiveMove(id); assert.equal(battle.runEvent('ModifyPriority', p, foe, move, move.priority), move.priority + 3, id);
		}
		for (const id of ['followme', 'helpinghand', 'trickroom', 'safeguard']) {
			const move = battle.dex.getActiveMove(id); assert.equal(battle.runEvent('ModifyPriority', p, foe, move, move.priority), move.priority, id);
		}
	});
	it('Wish remains delayed with Divine Intervention', () => {
		const [p] = setup('Divine Intervention'); p.hp = 100;
		battle.actions.runMove('wish', p, 0); assert.equal(p.hp, 100); assert(p.side.slotConditions[0].wish);
		battle.makeChoices('move splash', 'move splash'); assert.equal(p.hp, 100);
		battle.makeChoices('move splash', 'move splash'); assert(p.hp > 100);
	});
	it('Follow Me redirects opposing attacks to Audino in doubles', () => {
		const [p, foe, ally] = setup('Vital Signs', true); const hp = p.hp; const allyHP = ally.hp;
		battle.actions.runMove('followme', p, 0); hit(ally, foe); assert.equal(p.hp, hp - 20); assert.equal(ally.hp, allyHP);
	});
	it('descriptions, pruned Includes and calculator metadata match the new package', () => {
		const {getAbilityDisplayComponents} = require('../../../dist/data/ability-display');
		assert.deepEqual(getAbilityDisplayComponents('vitalsigns'), ['invigorate']);
		assert.deepEqual(getAbilityDisplayComponents('divineintervention'), ['vitalsigns', 'triage', 'regenerator', 'friendguard']);
		assert.equal(Dex.abilities.get('vitalsigns').shortDesc, 'Heals and cures each teammate once when an attack leaves it at half HP or less.');
		const metadata = require('../../../dist/sim/custom-calculator').calculatorMetadata();
		assert.equal(metadata.species.find(s => s.name === 'Audino').abilities[0], 'Vital Signs');
		assert.deepEqual(metadata.abilityComponents.divineintervention, ['Vital Signs', 'Triage', 'Regenerator', 'Friend Guard']);
	});
	for (const alreadyUsed of [false, true]) {
		it('Revival Blessing preserves the recipient allowance: previously used=' + alreadyUsed, () => {
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
				[mon('Audino', 'Vital Signs', ['memento', 'splash']), mon('Mew', 'Run Away', ['revivalblessing', 'splash']), mon('Audino', 'Vital Signs')],
				[mon('Mew', 'Run Away')],
			]);
			battle.makeChoices('team 123', 'team 1'); battle.field.terrain = '';
			const p = battle.p1.active[0], foe = battle.p2.active[0];
			if (alreadyUsed) { p.hp = 100; hit(p, foe); assert(p.m.vitalSignsRescued); }
			battle.makeChoices('move memento', 'move splash'); battle.makeChoices('switch 2', '');
			battle.makeChoices('move revivalblessing', 'move splash'); battle.makeChoices('switch 2', '');
			assert.equal(p.fainted, false); assert.equal(!!p.m.vitalSignsRescued, alreadyUsed);
			battle.makeChoices('switch 2', 'move splash'); p.hp = 100; hit(p, foe);
			assert(p.m.vitalSignsRescued); assert.equal(rescueCount(), 1);
			assert.equal(p.hp > 80, !alreadyUsed);
		});
	}
	it('six holders across the team cannot refresh already-treated recipients', () => {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [
			Array.from({length: 6}, () => mon('Audino', 'Vital Signs')),
			[mon('Mew', 'Run Away'), mon('Mew', 'Run Away')],
		]);
		battle.makeChoices('team 123456', 'team 12'); battle.field.terrain = '';
		const recipients = [...battle.p1.pokemon], foe = battle.p2.active[0];
		for (let i = 0; i < recipients.length; i++) {
			const recipient = recipients[i];
			if (!recipient.isActive) battle.makeChoices('move splash, switch ' + (battle.p1.pokemon.indexOf(recipient) + 1), 'move splash, move splash');
			recipient.hp = 100; hit(recipient, foe); assert(recipient.m.vitalSignsRescued);
		}
		assert.equal(rescueCount(), 6);
		const recipient = recipients[1];
		battle.makeChoices('move splash, switch ' + (battle.p1.pokemon.indexOf(recipient) + 1), 'move splash, move splash');
		recipient.hp = 100; hit(recipient, foe); assert.equal(recipient.hp, 80); assert.equal(rescueCount(), 6);
	});
	it('Skill Swap cannot reset a previously treated holder', () => {
		const [p, foe] = setup(); p.hp = 100; hit(p, foe);
		battle.actions.useMove('skillswap', p, {target: foe}); assert.equal(foe.ability, 'vitalsigns');
		battle.actions.useMove('skillswap', p, {target: foe}); assert.equal(p.ability, 'vitalsigns');
		p.hp = 100; hit(p, foe); assert.equal(p.hp, 80); assert.equal(rescueCount(), 1);
	});
	it('a KOed support holder cannot rescue its surviving ally after the spread move', () => {
		const [p, foe, ally] = setup('Vital Signs', true); p.hp = 10; ally.hp = 100;
		hit(p, foe, {target: 'allAdjacentFoes'});
		assert.equal(p.hp, 0); assert.equal(ally.hp, 80); assert.equal(rescueCount(), 0);
	});
	it('ordinary Invigorate remains unchanged and gains no emergency treatment', () => {
		const [p, foe] = setup('Invigorate'); p.hp = 100; hit(p, foe); assert.equal(p.hp, 80);
		assert(!p.m.vitalSignsRescued); assert.equal(battle.heal(100, p, p, battle.dex.moves.get('lifedew')), 130);
	});
	it('keeps confusion separate from major-status treatment', () => {
		const [p, foe] = setup(); p.hp = 100; p.addVolatile('confusion'); hit(p, foe);
		assert(p.volatiles.confusion); assert(p.m.vitalSignsRescued);
	});
	it('delayed Future Sight damage can rescue only when the attack lands', () => {
		const [p, foe] = setup(); p.hp = 160;
		const future = battle.dex.getActiveMove('futuresight');
		battle.actions.runMove(future, foe, 1, {externalMove: true});
		assert(!p.m.vitalSignsRescued);
		const pending = p.side.slotConditions[0].futuremove; pending.moveData.basePower = 1;
		for (let i = 0; i < 3 && !p.m.vitalSignsRescued; i++) battle.makeChoices('move splash', 'move splash');
		assert(p.m.vitalSignsRescued); assert.equal(rescueCount(), 1);
	});
	it('calculator separates actual damage from net loss after emergency healing', () => {
		const {calculateScenario, buildCalculatorBattle, validateScenario} = require('../../../dist/sim/custom-calculator');
		const input = {format: 'gen9nofieldsinglesgame', move: 'Sonic Boom', samples: 8, seed: 42,
			actors: Array.from({length: 4}, () => ({species: 'Mew', ability: 'No Ability'}))};
		input.actors[1] = {species: 'Audino', ability: 'Vital Signs', hpPercent: 30};
		const result = calculateScenario(input); assert.equal(result.results[1].max, 20);
		assert(result.results[1].minNetLoss < 0); assert(result.exampleLog.some(line => line.includes('ability: Vital Signs')));
		const {battle: calc, mons} = buildCalculatorBattle(validateScenario(input), 0);
		try {
			const hp = mons[1].hp; calc.actions.runMove('sonicboom', mons[0], mons[0].getLocOf(mons[1]));
			assert.equal(result.results[1].minNetLoss, hp - mons[1].hp);
		} finally { calc.destroy(); }
	});
});
