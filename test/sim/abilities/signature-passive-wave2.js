/* eslint-disable @stylistic/max-statements-per-line */
'use strict';
const assert = require('assert').strict, common = require('../../common');
const { Dex } = require('../../../dist/sim');
const grants = { vikavolt: 'rechargerelay', jellicent: 'undertow', jellicentazzy: 'undertow', pinsir: 'lockinggrip', hariyama: 'palmmastery', drednaw: 'lockjaw', mudsdale: 'stamina', seismitoad: 'mirechorus' };
let battle;
function setup(species, ability = 'No Ability', doubles = false) {
	const mon = (species = 'Mew', ability = 'No Ability') => ({ species, ability, moves: ['splash', 'voltswitch', 'uturn', 'forcepalm'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [[mon(species, ability), mon(), mon()], [mon(), mon(), mon()]]);
	battle.makeChoices('team 123', 'team 123'); battle.field.terrain = ''; battle.field.weather = '';
	for (const side of battle.sides) for (const p of side.pokemon)p.hp = p.maxhp = p.baseMaxhp = 4000;
	battle.randomChance = (n, d) => n >= d;
	return [battle.p1.active[0], battle.p2.active[0]];
}
function hit(p, q, id, extra = {}) {
	const move = Object.assign(Dex.getActiveMove(id), { accuracy: true, willCrit: false }, extra);
	battle.actions.useMove(move, p, { target: q }); battle.clearActiveMove(); return move;
}
describe('Approved custom-only signature passives', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const [species, passive] of Object.entries(grants))it(species + ' uses the exact passive through copying, suppression and form changes', () => {
		const [p, q] = setup(species); assert.deepEqual(p.getPassives(), [passive]); p.setAbility('Run Away'); p.addVolatile('gastroacid'); q.setAbility('Neutralizing Gas');
		assert.deepEqual(p.getPassives(), [passive]); assert(q.transformInto(p)); assert.deepEqual(q.getPassives(), [passive]);
		q.formeChange('Mew', null, true); assert.deepEqual(q.getPassives(), ['synchronize']);
	});
	for (const ability of ['No Ability', 'Recharge Relay', 'Battery'])it('Recharge Relay heals one incoming teammate with ' + ability, () => {
		const [p] = setup('Vikavolt', ability); const incoming = battle.p1.pokemon[1]; incoming.hp = 1000; p.addVolatile('gastroacid');
		battle.makeChoices('move 2', 'move 1'); battle.makeChoices('switch 2', ''); assert.equal(battle.p1.active[0], incoming); assert.equal(incoming.hp, 1500);
	});
	it('Recharge Relay has no Battery power and ordinary switching or U-turn gives no heal', () => {
		const [p, q] = setup('Vikavolt', 'No Ability', true), ally = battle.p1.active[1];
		for (const field of ['', 'electricterrain']) { battle.field.terrain = field; const move = Dex.getActiveMove('darkpulse'); assert.equal(battle.runEvent('BasePower', p, q, move, 100), 100); assert.equal(battle.runEvent('BasePower', ally, q, move, 100), 100); }
		battle.field.terrain = ''; const incoming = battle.p1.pokemon[2]; incoming.hp = 1000; battle.makeChoices('switch 3, move 1', 'move 1, move 1'); assert.equal(incoming.hp, 1000);
	});
	for (const species of ['Jellicent', 'Jellicent-Azzy']) for (const ability of ['No Ability', 'Undertow', 'Water Absorb'])it(species + ' Undertow grounds HP hits once with ' + ability, () => {
		const [p, q] = setup(species, ability); p.addVolatile('gastroacid'); q.setType('Flying'); hit(p, q, 'watergun', { damage: 100 }); assert(q.volatiles.smackdown); assert(!q.volatiles.trapped); assert.equal(q.isGrounded(), true);
		p.hp = 1000; hit(q, p, 'watergun', { damage: 100 }); assert.equal(p.hp, 900); battle.field.terrain = 'underwaterterrain'; battle.runEvent('Residual', p); assert.equal(p.hp, 900);
	});
	for (const kind of ['protect', 'substitute', 'immune', 'ko'])it('Undertow does not ground through ' + kind, () => {
		const [p, q] = setup('Jellicent'); q.setType('Flying'); if (kind === 'protect')q.addVolatile('protect'); if (kind === 'substitute') { q.addVolatile('substitute'); q.volatiles.substitute.hp = 1000; } if (kind === 'immune')q.setAbility('Water Absorb');
		hit(p, q, 'watergun', { damage: kind === 'ko' ? 5000 : 100 }); assert(!q.volatiles.smackdown);
	});
	for (const ability of ['No Ability', 'Locking Grip', 'Hyper Cutter'])it('Locking Grip spends one allowance across hits and ability replacement with ' + ability, () => {
		const [p, q] = setup('Pinsir', ability); p.addVolatile('gastroacid'); hit(p, q, 'pinmissile', { multihit: 3, damage: 100 }); assert(q.volatiles.torment); assert(p.volatiles.lockinggripspent);
		q.removeVolatile('torment'); p.removeVolatile('gastroacid'); p.setAbility('No Ability'); p.setAbility('Locking Grip'); hit(p, q, 'bugbite', { damage: 100 }); assert(!q.volatiles.torment);
		battle.makeChoices('switch 2', 'move 1'); battle.makeChoices('switch 2', 'move 1'); hit(p, q, 'bugbite', { damage: 100 }); assert(q.volatiles.torment);
	});
	it('Locking Grip Substitute damage spends the use before later multihits reach HP', () => {
		const [p, q] = setup('Pinsir'); q.addVolatile('substitute'); q.volatiles.substitute.hp = 100; hit(p, q, 'pinmissile', { multihit: 3, damage: 100 }); assert(p.volatiles.lockinggripspent); assert.equal(q.hp, 3800); assert(!q.volatiles.torment);
	});
	for (const kind of ['miss', 'protect'])it('Locking Grip preserves its allowance on ' + kind, () => {
		const [p, q] = setup('Pinsir'); if (kind === 'protect')q.addVolatile('protect'); hit(p, q, 'bugbite', { accuracy: kind === 'miss' ? 0 : true }); assert(!p.volatiles.lockinggripspent);
	});
	for (const ability of ['No Ability', 'Palm Mastery', 'Thick Fat'])it('Palm Mastery supplies primary paralysis without Thick Fat with ' + ability, () => {
		const [p, q] = setup('Hariyama', ability); p.addVolatile('gastroacid'); q.setAbility('Shield Dust'); q.setItem('Covert Cloak'); hit(p, q, 'forcepalm', { damage: 100 }); assert.equal(q.status, 'par');
		assert.equal(battle.runEvent('SourceModifyAtk', q, p, Dex.getActiveMove('firepunch'), 100), 100);
	});
	it('Palm Mastery respects Electric immunity and does not change unrelated secondary chances', () => {
		const [p, q] = setup('Hariyama'); q.setType('Electric'); hit(p, q, 'forcepalm', { damage: 100 }); assert.equal(q.status, ''); q.setType('Normal'); const move = Dex.getActiveMove('bodyslam'); battle.runEvent('ModifyMove', p, q, move, move); assert.equal(move.status, undefined); assert.equal(move.secondaries[0].chance, 30);
	});
	for (const ability of ['No Ability', 'Lockjaw', 'Strong Jaw'])it('Lockjaw adds two-turn Torment without bite power under ' + ability, () => {
		const [p, q] = setup('Drednaw', ability); p.addVolatile('gastroacid'); assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('crunch'), 100), 100);
		hit(p, q, 'crunch', { damage: 100 }); assert.equal(q.volatiles.torment.duration, 2); battle.turn++; hit(p, q, 'crunch', { damage: 100 }); assert.equal(q.volatiles.torment.duration, 2);
	});
	it('Lockjaw respects Substitute, fainted targets and voluntary switching', () => {
		const [p, q] = setup('Drednaw'); q.addVolatile('substitute'); q.volatiles.substitute.hp = 1000; hit(p, q, 'crunch', { damage: 100 }); assert(!q.volatiles.torment); q.removeVolatile('substitute');
		hit(p, q, 'crunch', { damage: 100 }); battle.makeChoices('move 1', 'switch 2'); assert.notEqual(battle.p2.active[0], q);
	});
	for (const ability of ['No Ability', 'Unyielding', 'Stamina']) it('Mudsdale keeps passive Stamina under suppression with ' + ability, () => {
		const [p, q] = setup('Mudsdale', ability); p.addVolatile('gastroacid'); p.hp = 2000;
		hit(q, p, 'tackle', {damage: 100}); assert.equal(p.hp, 2150); assert.equal(p.boosts.def, 1);
		assert.notEqual(battle.runEvent('DragOut', p, q, Dex.moves.get('roar')), null);
	});
	for (const ability of ['No Ability', 'Mire Chorus', 'Liquid Voice', 'Poison Touch'])it('Mire Chorus converts sound and boosts once under ' + ability, () => {
		const [p, q] = setup('Seismitoad', ability); for (const suppressed of [false, true]) { if (suppressed)p.addVolatile('gastroacid'); for (const field of ['', 'icyterrain']) { battle.field.terrain = field; const move = Dex.getActiveMove('hypervoice'); battle.runEvent('ModifyType', p, q, move, move); assert.equal(move.type, field ? 'Ice' : 'Water'); assert.equal(battle.runEvent('BasePower', p, q, move, 100), field ? 180 : 120); } }
	});
	it('Mire Chorus has independent 20% sound poison rolls per foe and no contact Poison Touch', () => {
		const [p, q] = setup('Seismitoad', 'No Ability', true); let rolls = 0; battle.randomChance = (n, d) => { if (n === 1 && d === 5) { rolls++; return true; } return false; };
		hit(p, q, 'hypervoice', { damage: 100 }); assert.equal(rolls, 2); for (const foe of battle.p2.active)assert.equal(foe.status, 'psn');
		q.cureStatus(); rolls = 0; hit(p, q, 'tackle', { damage: 100 }); assert.equal(q.status, ''); assert.equal(rolls, 0);
	});
	for (const protection of ['Shield Dust', 'Covert Cloak'])it('Mire Chorus poison respects ' + protection, () => {
		const [p, q] = setup('Seismitoad'); if (protection === 'Shield Dust')q.setAbility(protection); else q.setItem(protection); battle.randomChance = () => true; hit(p, q, 'hypervoice', { damage: 100 }); assert.equal(q.status, '');
	});
	it('nonrecipient copied signatures preserve their original primitive identities', () => {
		const [p] = setup('Mew'); for (const [ability, component] of [['Recharge Relay', 'battery'], ['Undertow', 'waterabsorb'], ['Palm Mastery', 'thickfat'], ['Lockjaw', 'strongjaw'], ['Unyielding', 'innerfocus'], ['Mire Chorus', 'poisontouch']]) { p.setAbility(ability); assert(p.hasAbility(component), ability); }
	});
	it('native Battery remains selectable and supplies one self/ally power boost', () => {
		const [p, q] = setup('Vikavolt', 'Battery', true), ally = battle.p1.active[1]; battle.field.terrain = 'electricterrain'; const move = Dex.getActiveMove('darkpulse');
		assert.equal(battle.runEvent('BasePower', p, q, move, 100), 195); assert.equal(battle.runEvent('BasePower', ally, q, move, 100), 130);
	});
	it('native selected Water Absorb retains its single absorption heal', () => {
		const [p, q] = setup('Jellicent', 'Water Absorb'); p.hp = 1000; hit(q, p, 'watergun'); assert.equal(p.hp, 2000);
	});
	it('native selected Strong Jaw retains exactly one bite multiplier', () => {
		const [p, q] = setup('Drednaw', 'Strong Jaw'); assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('crunch'), 100), 150);
	});
	it('native selected Poison Touch remains the sole contact poison source', () => {
		const [p, q] = setup('Seismitoad', 'Poison Touch'); let rolls = 0; battle.randomChance = (n, d) => { if (n === 3 && d === 10) { rolls++; return true; } return n >= d; }; hit(p, q, 'tackle', { damage: 100 }); assert.equal(rolls, 1); assert.equal(q.status, 'psn');
	});
	it('calculator applies Mire Chorus once with copied signature or Liquid Voice overlap', () => {
		const { calculateScenario } = require('../../../dist/sim/custom-calculator'); const input = { format: 'gen9nofieldsinglesgame', move: 'Hyper Voice', samples: 8, seed: 42, actors: Array.from({ length: 4 }, () => ({ species: 'Mew', ability: 'No Ability' })) };
		input.actors[0] = { species: 'Seismitoad', ability: 'No Ability' }; const expected = calculateScenario(input).results;
		for (const ability of ['Mire Chorus', 'Liquid Voice']) { input.actors[0].ability = ability; assert.deepEqual(calculateScenario(input).results, expected); }
	});
});
