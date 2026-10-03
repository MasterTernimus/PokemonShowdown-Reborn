'use strict';
const assert = require('assert').strict;
const common = require('../../common');
describe('Aevian Toxin full Merciless', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(foeAbility = 'No Ability') {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Drapion', ability: 'Aevian Toxin', moves: ['crunch', 'splash'] }],
			[{ species: 'Mew', ability: foeAbility, moves: ['splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	it('is scoped to the intended form ability and does not alter Layered Coat', () => {
		const [p, foe] = setup();
		const a = p.getAbility();
		assert.equal(a.onModifyCritRatio, battle.dex.abilities.get('merciless').onModifyCritRatio);
		assert(!battle.dex.abilities.get('layeredcoat').onModifyCritRatio);
		const users = battle.dex.species.all().filter(s => Object.values(s.abilities).includes('Aevian Toxin')).map(s => s.id);
		assert.deepEqual(users.sort(), ['drapion', 'drapionrejuv']);
		const move = battle.dex.getActiveMove('crunch');
		assert.equal(battle.runEvent('ModifyCritRatio', p, foe, move, 0), 0);
		foe.setStatus('psn');
		assert.equal(battle.runEvent('ModifyCritRatio', p, foe, move, 0), 5);
		p.addVolatile('gastroacid');
		assert.equal(battle.runEvent('ModifyCritRatio', p, foe, move, 0), 0);
	});
	for (const field of ['corrosiveterrain', 'corrosivemistterrain', 'murkwatersurfaceterrain', 'wastelandterrain', 'chessboardterrain']) {
		it('preserves local Merciless on ' + field, () => {
			const [p, foe] = setup();
			battle.field.changeTerrain(field, p);
			foe.hp = Math.floor(foe.maxhp / 2);
			const move = battle.dex.getActiveMove('crunch');
			const actual = battle.runEvent('ModifyCritRatio', p, foe, move, 0);
			const expected = battle.dex.abilities.get('merciless').onModifyCritRatio.call(battle, 0, p, foe, move);
			assert.equal(actual, expected);
			assert(actual > 0);
		});
	}
	it('respects critical-hit immunity', () => {
		const [p, foe] = setup('Battle Armor');
		foe.setStatus('psn');
		battle.makeChoices('move crunch', 'move splash');
		assert(!battle.log.some(line => line.startsWith('|-crit|')));
	});
});
