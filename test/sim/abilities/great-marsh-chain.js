'use strict';
const assert = require('assert').strict, common = require('../../common');
const { calculatorMetadata } = require('../../../dist/sim/custom-calculator');
describe('Great Marsh full Toxic Chain', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(foeAbility = 'No Ability', item = '') {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Toxicroak', ability: 'Great Marsh', moves: ['tackle', 'swift', 'sludgebomb', 'splash'] }],
			[{ species: 'Mew', ability: foeAbility, item, moves: ['splash'] }],
		]); battle.makeChoices('team 1', 'team 1'); return [battle.p1.active[0], battle.p2.active[0]];
	}
	function hit(p, foe, id, extra = {}) {
		const m = battle.dex.getActiveMove(id); Object.assign(m, { accuracy: true, willCrit: false, basePower: 1, secondaries: undefined }, extra);
		battle.actions.runMove(m, p, p.getLocOf(foe));
	}
	for (const id of ['tackle', 'swift']) it('rolls exactly once for a single ' + id + ' hit', () => {
		const [p, foe] = setup(), rolls = [];
		battle.randomChance = (n, d) => {
			if (d === 10) {
				rolls.push([n, d]);
				return true;
			} return false;
		};
		hit(p, foe, id); assert.equal(foe.status, 'tox'); assert.deepEqual(rolls, [[3, 10]]);
	});
	it('retains per-hit activation and enhanced field chance without extra wrapper procs', () => {
		const [p, foe] = setup(), rolls = []; battle.field.changeTerrain('wastelandterrain', p);
		battle.randomChance = (n, d) => { if (d === 10) rolls.push([n, d]); return false; };
		hit(p, foe, 'tackle', { multihit: 3 }); assert.deepEqual(rolls, [[6, 10], [6, 10], [6, 10]]);
		const m = battle.dex.getActiveMove('sludgebomb');
		// Wasteland also boosts Sludge Bomb by 1.2x, independently of Toxic Chain.
		assert.equal(battle.runEvent('BasePower', p, foe, m, 100), 156);
		const plain = battle.dex.getActiveMove('poisontail');
		assert.equal(battle.runEvent('BasePower', p, foe, plain, 100), 130);
	});
	for (const mode of ['substitute', 'shielddust', 'covertcloak', 'poison', 'steel', 'immune', 'protect']) it('respects ' + mode, () => {
		const [p, foe] = setup(mode === 'shielddust' ? 'Shield Dust' : mode === 'immune' ? 'Immunity' : 'No Ability', mode === 'covertcloak' ? 'Covert Cloak' : '');
		battle.randomChance = () => true;
		if (mode === 'substitute' || mode === 'protect') foe.addVolatile(mode);
		if (mode === 'poison' || mode === 'steel') foe.setType(mode === 'poison' ? 'Poison' : 'Steel');
		hit(p, foe, 'tackle'); assert.equal(foe.status, ''); assert(!p.hasAbility('corrosion'));
	});
	it('retains Adaptability, Dry Skin absorption/Fire drawback and field recovery', () => {
		const [p, foe] = setup(); const m = battle.dex.getActiveMove('sludgebomb');
		assert.equal(battle.runEvent('ModifySTAB', p, foe, m, 1.5), 2);
		const fire = battle.dex.getActiveMove('flamethrower'); assert.equal(battle.runEvent('BasePower', foe, p, fire, 100), 125);
		p.hp = 1; battle.singleEvent('TryHit', p.getAbility(), p.abilityState, p, foe, battle.dex.getActiveMove('watergun'));
		assert.equal(p.hp, 1 + Math.floor(p.baseMaxhp / 4));
		battle.field.changeTerrain('watersurfaceterrain', p); const hp = p.hp;
		battle.singleEvent('Residual', p.getAbility(), p.abilityState, p); assert.equal(p.hp, hp + Math.floor(p.baseMaxhp / 16));
	});
	it('exposes the final four components once to the calculator', () => {
		assert.deepEqual(calculatorMetadata().abilityComponents.greatmarsh, ['Anticipation', 'Dry Skin', 'Adaptability', 'Toxic Chain']);
	});
});
