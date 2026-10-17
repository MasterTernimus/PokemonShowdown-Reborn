'use strict';
const assert = require('assert').strict;
const common = require('../../common');
describe('Primeval Hunger seed applications', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(ability = 'No Ability') {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Cradily', ability: 'Primeval Hunger', moves: ['leechseed', 'sappyseed', 'splash']}],
			[{species: 'Mew', ability, moves: ['splash']}, {species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.makeChoices('team 1', 'team 12');
		battle.randomChance = () => false;
		const p = battle.p1.active[0], q = battle.p2.active[0];
		q.hp = q.maxhp = q.baseMaxhp = 4000;
		q.boosts.atk = q.boosts.spa = 2;
		return [p, q];
	}
	function hit(p, q, id, extra = {}) {
		battle.clearActiveMove();
		const move = battle.dex.getActiveMove(id);
		Object.assign(move, {accuracy: true, willCrit: false}, extra);
		battle.actions.runMove(move, p, p.getLocOf(q));
	}
	for (const id of ['leechseed', 'sappyseed']) {
		for (const seeded of [false, true]) it(id + ' checks the actual redirected target, already seeded=' + seeded, () => {
			const ally = {species: 'Mew', ability: 'No Ability', moves: ['splash']};
			battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [
				[{species: 'Cradily', ability: 'Primeval Hunger', moves: [id]}, {...ally}], [{...ally}, {...ally}],
			]);
			battle.makeChoices('team 12', 'team 12');
			const p = battle.p1.active[0], original = battle.p2.active[0], q = battle.p2.active[1];
			original.addVolatile('leechseed', p);
			if (seeded) q.addVolatile('leechseed', p);
			q.addVolatile('followme', q); q.boosts.spa = 2;
			hit(p, original, id);
			assert.equal(!!q.volatiles.healblock, !seeded);
			assert.equal(q.boosts.spa, seeded ? 2 : 1);
		});
		it(id + ' applies the existing reward once and never on later seed ticks', () => {
			const [p, q] = setup(); hit(p, q, id);
			assert.equal(q.volatiles.leechseed.source, p);
			assert.equal(q.volatiles.healblock.duration, 2);
			assert.equal(q.boosts.atk, 2); assert.equal(q.boosts.spa, 1);
			q.removeVolatile('healblock');
			battle.fieldEvent('Residual');
			assert(!q.volatiles.healblock); assert.equal(q.boosts.spa, 1);
		});
		for (const failure of ['miss', 'protect', 'substitute', 'grass', 'existing', 'reflected', 'suppressed', 'immune']) {
			it(id + ' does not trigger for ' + failure, () => {
				const [p, q] = setup(failure === 'reflected' ? 'Magic Bounce' : failure === 'immune' ? 'Sap Sipper' : 'No Ability');
				if (['protect', 'substitute'].includes(failure)) q.addVolatile(failure);
				if (failure === 'grass') q.setType('Grass');
				if (failure === 'existing') q.addVolatile('leechseed', p);
				if (failure === 'suppressed') p.addVolatile('gastroacid');
				hit(p, q, id, failure === 'miss' ? {accuracy: 0} : {});
				assert(!q.volatiles.healblock); assert.equal(q.boosts.spa, failure === 'immune' ? 3 : 2);
			});
		}
		it(id + ' respects existing longer Heal Block and stat-drop protection', () => {
			const [p, q] = setup('Clear Body'); q.addVolatile('healblock', p);
			q.volatiles.healblock.duration = 5; hit(p, q, id);
			assert.equal(q.volatiles.healblock.duration, 5); assert.equal(q.boosts.spa, 2);
		});
	}
});
