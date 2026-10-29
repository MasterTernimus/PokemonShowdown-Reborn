'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
const {TeamValidator} = require('../../../dist/sim/team-validator');
const {AevianDisciplineMoves} = require('../../../dist/data/alakazam-rejuv');
let battle;
function setup(ability = 'Aevian Discipline') {
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[{species: 'Alakazam', ability, moves: ['Drain Punch']}], [{species: 'Mew', ability: 'No Ability', moves: ['Tackle']}]]);
	battle.makeChoices('team 1', 'team 1');
	return battle.p1.active[0];
}
describe('Alakazam Rejuv', () => {
	afterEach(() => {battle?.destroy(); battle = null;});
	it('transforms through its selected ability and receives Composed, not Revealing Gaze', () => {
		const p = setup();
		assert.equal(p.species.id, 'alakazamrejuv');
		assert.deepEqual(p.getTypes(), ['Fighting']);
		assert.deepEqual(p.species.baseStats, {hp:80, atk:130, def:100, spa:25, spd:95, spe:128});
		assert.equal(p.species.bst, 558);
		assert.deepEqual(p.getPassives(), ['composed']);
		assert(p.hasAbility('ironfist')); assert(p.hasAbility('owntempo'));
		assert(!p.addVolatile('confusion', battle.p2.active[0]));
	});
	it('keeps ordinary Alakazam unchanged', () => {
		const p = setup('Magic Guard'); assert.equal(p.species.id, 'alakazam');
		assert(!p.getPassives().includes('composed'));
	});
	it('Composed reduces all physical damage and no longer boosts outgoing damage', () => {
		const p = setup(), q = battle.p2.active[0];
		const tackle = Dex.getActiveMove('tackle'), earthquake = Dex.getActiveMove('earthquake'), water = Dex.getActiveMove('watergun');
		assert.equal(battle.runEvent('ModifyDamage', p, q, tackle, 100), 100);
		assert.equal(battle.runEvent('ModifyDamage', p, q, earthquake, 100), 100);
		assert.equal(battle.runEvent('ModifyDamage', p, q, water, 100), 100);
		assert.equal(battle.runEvent('ModifyDamage', q, p, tackle, 100), 80);
		assert.equal(battle.runEvent('ModifyDamage', q, p, earthquake, 100), 80);
		water.flags.contact = 1;
		assert.equal(battle.runEvent('ModifyDamage', q, p, water, 100), 100);
		q.setItem('Protective Pads');
		assert.equal(battle.runEvent('ModifyDamage', q, p, tackle, 100), 80);
	});
	for (const moveId of ['tackle', 'earthquake', 'watergun']) it('simulates incoming ' + moveId + ' against Composed', () => {
		const damage = [];
		for (const ability of ['No Ability', 'Composed']) {
			battle = common.createBattle({formatid:'gen9nofieldsinglesgame'}, [
				[{species:'Mew', ability, moves:['Splash']}],
				[{species:'Mew', ability:'No Ability', moves:[moveId]}],
			]);
			battle.makeChoices('team 1', 'team 1');
			battle.randomizer = n => n;
			const p = battle.p1.active[0], q = battle.p2.active[0], hp = p.hp;
			const move = Object.assign(Dex.getActiveMove(moveId), {accuracy:true, willCrit:false});
			battle.actions.runMove(move, q, q.getLocOf(p));
			damage.push(hp - p.hp);
			battle.destroy(); battle = null;
		}
		assert(damage[0] > 0);
		const expected = damage[0] * (moveId === 'watergun' ? 1 : 0.8);
		assert(Math.abs(damage[1] - expected) <= 1, JSON.stringify(damage));
	});
	it('Aevian Discipline keeps Iron Fist + Own Tempo without an extra Composed damage bonus', () => {
		const p = setup(), q = battle.p2.active[0];
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('drainpunch'), 100), 140);
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('earthquake'), 100), 100);
		assert.equal(battle.runEvent('ModifyDamage', p, q, Dex.getActiveMove('drainpunch'), 100), 100);
		assert(!p.addVolatile('confusion', q));
	});
	it('recognizes both passive components and prevents flinching and Intimidate', () => {
		const p = setup(), q = battle.p2.active[0];
		assert(p.hasAbilityOrPassive('innerfocus'));
		assert(p.hasAbilityOrPassive('magicguard'));
		assert(!p.addVolatile('flinch', q));
		battle.boost({atk:-1}, p, q, Dex.abilities.get('intimidate'));
		assert.equal(p.boosts.atk, 0);
		battle.boost({atk:-1}, p, q, Dex.moves.get('growl'));
		assert.equal(p.boosts.atk, -1);
	});
	for (const status of ['psn', 'brn']) it('allows ' + status + ' but prevents its residual damage', () => {
		const p = setup(), q = battle.p2.active[0];
		assert(p.trySetStatus(status, q));
		const hp = p.hp;
		battle.singleEvent('Residual', Dex.conditions.get(status), p.statusState, p);
		assert.equal(p.status, status);
		assert.equal(p.hp, hp);
	});
	it('prevents hazard, weather, recoil and Life Orb damage while still taking direct damage', () => {
		const p = setup(), q = battle.p2.active[0], hp = p.hp;
		for (const effect of ['stealthrock', 'spikes', 'sandstorm', 'hail', 'recoil', 'lifeorb']) {
			battle.damage(40, p, q, Dex.conditions.get(effect));
			assert.equal(p.hp, hp, effect);
		}
		battle.damage(40, p, q, Dex.getActiveMove('tackle'));
		assert.equal(p.hp, hp - 40);
	});
	it('inherits the local Magic Guard entry bonus when acquiring Composed', () => {
		const p = setup('No Ability');
		battle.field.startTerrain('fairytaleterrain');
		assert.equal(p.boosts.spd, 0);
		p.setAbility('Aevian Discipline');
		assert.equal(p.species.id, 'alakazamrejuv');
		assert.equal(p.boosts.spd, 1);
	});
	it('applies the Magic Guard entry bonus exactly once on the first Fairy Tale switch-in', () => {
		battle = common.createBattle({formatid:'gen9fairytalefield'}, [
			[{species:'Alakazam', ability:'Aevian Discipline', moves:['Drain Punch']}],
			[{species:'Mew', ability:'No Ability', moves:['Splash']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		const p = battle.p1.active[0];
		assert.equal(p.species.id, 'alakazamrejuv');
		assert.equal(p.boosts.spd, 1);
	});
	it('also works when Composed is a selected ability rather than a passive', () => {
		const p = setup('Composed'), q = battle.p2.active[0];
		assert(p.hasAbility('innerfocus'));
		assert(p.hasAbility('magicguard'));
		assert(!p.addVolatile('flinch', q));
		assert.equal(battle.runEvent('ModifyDamage', q, p, Dex.getActiveMove('earthquake'), 100), 80);
		const hp = p.hp;
		battle.damage(40, p, q, Dex.conditions.get('recoil'));
		assert.equal(p.hp, hp);
	});
	it('has exactly the requested 132 moves and validates every one', () => {
		assert.equal(new Set(AevianDisciplineMoves).size, 132);
		assert.deepEqual(Object.keys(Dex.species.getLearnsetData('alakazamrejuv').learnset).sort(), [...AevianDisciplineMoves].sort());
		const validator = TeamValidator.get('gen9nofieldsinglesgame');
		for (const species of ['Alakazam', 'Alakazam-Rejuv']) {
			for (let i = 0; i < AevianDisciplineMoves.length; i += 4) {
				const moves = AevianDisciplineMoves.slice(i, i + 4);
				const errors = validator.validateTeam([{species, ability: 'Aevian Discipline', moves}, {species:'Mew', moves:['Splash']}]);
				assert.equal(errors, null, JSON.stringify({species, moves, errors}));
			}
			const errors = validator.validateTeam([{species, ability:'Aevian Discipline', moves:['Protect']}, {species:'Mew', moves:['Splash']}]);
			assert(errors?.some(e => e.includes("can't use Protect with Aevian Discipline")));
		}
		assert.equal(validator.validateTeam([{species:'Alakazam', ability:'Magic Guard', moves:['Protect']}, {species:'Mew', moves:['Splash']}]), null);
	});
});
