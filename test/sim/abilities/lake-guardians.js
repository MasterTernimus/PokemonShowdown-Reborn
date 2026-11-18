'use strict';

const assert = require('node:assert/strict');
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

describe('Sinnoh lake guardians', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function mon(species, ability, moves = ['splash']) {
		return { species, ability, moves };
	}
	function start(species, ability, gameType = 'singles', foeAbility = 'No Ability') {
		const reserve = () => mon('Mew', 'No Ability');
		battle = common.createBattle({ gameType }, [
			[mon(species, ability, ['psychic', 'splash']), reserve(), reserve()],
			[mon('Blissey', foeAbility, ['tackle', 'earthquake', 'smackdown', 'splash']), reserve(), reserve()],
		]);
		return [battle.p1.active[0], battle.p2.active[0]];
	}

	for (const [name, gift] of [['Uxie', 'Gift of Knowledge'], ['Mesprit', 'Gift of Emotion'], ['Azelf', 'Gift of Will']]) {
		it(name + ' stays airborne over terrain and Spikes and can be grounded by Smack Down', () => {
			const [holder, foe] = start(name, 'No Ability');
			assert.deepEqual(holder.getPassives(), [Dex.abilities.get(gift).id]);
			assert(holder.hasAbilityOrPassive('levitate'));
			assert.equal(holder.isGrounded(), null);
			assert.equal(holder.canBenefitFromTerrain(), false);
			const hp = holder.hp;
			battle.actions.runMove('earthquake', foe, foe.getLocOf(holder));
			assert.equal(holder.hp, hp);
			assert(battle.log.some(line => line.includes('[from] passive: ' + gift)));
			battle.p1.addSideCondition('spikes', foe);
			battle.makeChoices('switch 2', 'move splash');
			battle.makeChoices('switch 2', 'move splash');
			assert.equal(holder.hp, hp);
			battle.actions.runMove('smackdown', foe, foe.getLocOf(holder));
			assert.equal(holder.isGrounded(), true);
		});
	}
	it('Mold Breaker bypasses Gift Levitate on a Ground attack', () => {
		const [holder, foe] = start('Uxie', 'No Ability', 'singles', 'Mold Breaker');
		const hp = holder.hp;
		battle.actions.runMove('earthquake', foe, foe.getLocOf(holder));
		assert(holder.hp < hp);
	});
	it('Uxie pierces defensive boosts and evasion only on damaging Psychic moves', () => {
		const [holder, foe] = start('Uxie', 'Acuity Seal');
		for (const [id, applies] of [['psychic', true], ['swift', false], ['hypnosis', false]]) {
			const move = Dex.getActiveMove(id);
			battle.runEvent('ModifyMove', holder, foe, move, move);
			assert.equal(!!move.ignorePositiveDefensive, applies);
			if (applies) assert(move.ignoreEvasion);
		}
	});
	it('Acuity Seal forgets one attacking move for exactly the following turn per entry', () => {
		const [holder, foe] = start('Uxie', 'Acuity Seal');
		battle.makeChoices('move splash', 'move earthquake');
		assert(!foe.volatiles.disable);
		battle.makeChoices('move splash', 'move tackle');
		assert.equal(foe.volatiles.disable?.move, 'tackle');
		battle.makeChoices('move splash', 'move splash');
		assert(!foe.volatiles.disable);
		battle.makeChoices('move splash', 'move tackle');
		assert(!foe.volatiles.disable);
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move tackle');
		assert.equal(battle.p1.active[0], holder);
		assert.equal(foe.volatiles.disable?.move, 'tackle');
	});
	it('Gift of Emotion heals each living active teammate once per turn, including its user', () => {
		const [holder, foe] = start('Mesprit', 'Verity Seal', 'doubles');
		const ally = battle.p1.active[1];
		const bench = battle.p1.pokemon[2];
		for (const p of [holder, ally, bench]) p.hp = 1;
		for (let i = 0; i < 2; i++) battle.actions.useMove('psychic', holder, { target: foe });
		for (const p of [holder, ally]) assert.equal(p.hp, 1 + Math.floor(p.baseMaxhp / 8));
		assert.equal(bench.hp, 1);
	});
	it('Verity Seal wards allies from confusion and Taunt, and permits other conditions', () => {
		const [holder, foe] = start('Mesprit', 'Verity Seal', 'doubles');
		for (const p of [holder, battle.p1.active[1]]) {
			assert(!p.addVolatile('confusion', foe, Dex.moves.get('confuseray')));
			assert(!p.addVolatile('taunt', foe, Dex.moves.get('taunt')));
			assert(p.addVolatile('torment', foe, Dex.moves.get('torment')));
		}
		assert(foe.addVolatile('confusion', holder, Dex.moves.get('confuseray')));
	});
	it('Gift of Will protects both offenses and preserves self-inflicted stat changes', () => {
		const [holder, foe] = start('Azelf', 'Valor Seal');
		battle.boost({ atk: -1, spa: -1, spe: -1 }, holder, foe);
		assert.equal(holder.boosts.atk, 0);
		assert.equal(holder.boosts.spa, 0);
		assert.equal(holder.boosts.spe, -1);
		battle.boost({ spa: -1 }, holder, holder);
		assert.equal(holder.boosts.spa, -1);
	});
	it('Valor Seal activates at half HP and combines once with physical Psychic power', () => {
		const [holder, foe] = start('Azelf', 'Valor Seal');
		const power = id => battle.runEvent('BasePower', holder, foe, Dex.getActiveMove(id), 100);
		assert.equal(power('zenheadbutt'), 130);
		assert.equal(power('psychic'), 100);
		holder.hp = Math.floor(holder.maxhp / 2);
		assert.equal(power('zenheadbutt'), 156);
		assert.equal(power('psychic'), 120);
	});
});
