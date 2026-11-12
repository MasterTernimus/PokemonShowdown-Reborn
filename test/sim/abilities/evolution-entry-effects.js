'use strict';

const assert = require('assert').strict;
const common = require('../../common');

describe('Ability entry effects on evolution', () => {
	let battle;
	afterEach(() => { battle?.destroy(); });
	function setup(species, ability, item = '', field = 'dragonsdenterrain', foeAbility = 'No Ability') {
		battle = common.createBattle({formatid: 'gen9dragonsden'}, [[
			{species, ability, item, gigantamax: true, moves: ['splash']},
			{species: 'Mew', ability: 'No Ability', moves: ['splash']},
		], [{species: 'Mew', ability: foeAbility, moves: ['splash'] }]]);
		battle.makeChoices('team 12', 'team 1');
		battle.field.terrain = field;
		return battle.p1.active[0];
	}
	it('Mega Hydreigon activates Berserk once on evolution, and again on a later switch-in', () => {
		const p = setup('Hydreigon', 'False Liberation', 'Hydreigonite');
		assert.equal(p.boosts.spa, 0);
		battle.makeChoices('move splash mega', 'move splash');
		assert.equal(p.species.name, 'Hydreigon-Mega');
		assert.equal(p.boosts.spa, 1);
		battle.makeChoices('move splash', 'move splash');
		assert.equal(p.boosts.spa, 1);
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(p.boosts.spa, 1);
	});
	it('does not grant Berserk entry boosts outside Dragon’s Den or on ordinary ability replacement', () => {
		const p = setup('Hydreigon', 'False Liberation', 'Hydreigonite', 'caveterrain');
		battle.makeChoices('move splash mega', 'move splash');
		assert.equal(p.boosts.spa, 0);
		battle.field.terrain = 'dragonsdenterrain';
		p.setAbility('Berserk');
		assert.equal(p.boosts.spa, 0);
	});
	it('Mega Gyarados-Aevian receives Berserk through Helios', () => {
		const p = setup('Gyarados-Aevian', 'No Ability', 'Gyaradosite');
		battle.makeChoices('move splash mega', 'move splash');
		assert.equal(p.ability, 'helios');
		assert.equal(p.boosts.spa, 1);
	});
	it('evolution activates Berserk even if the base form already used it, without triggering entry hazards', () => {
		const p = setup('Hydreigon', 'Strings of Ruin', 'Hydreigonite');
		assert.equal(p.boosts.spa, 1);
		p.side.addSideCondition('stealthrock', battle.p2.active[0]);
		const damage = battle.damage;
		let hazardHits = 0;
		battle.damage = function (amount, target, source, effect, ...args) {
			if (target === p && effect?.id === 'stealthrock') hazardHits++;
			return damage.call(this, amount, target, source, effect, ...args);
		};
		battle.makeChoices('move splash mega', 'move splash');
		assert.equal(p.boosts.spa, 2);
		assert.equal(hazardHits, 0);
		assert.equal(p.abilityState.startingFromFormeChange, undefined);
	});
	it('Transform copies Berserk without receiving an evolution entry boost', () => {
		const p = setup('Mew', 'No Ability');
		const q = battle.p2.active[0];
		q.setAbility('Berserk');
		assert(p.transformInto(q));
		assert.equal(p.ability, 'berserk');
		assert.equal(p.boosts.spa, 0);
	});
	for (const [species, item, field, stat] of [
		['Slowbro', 'Slowbronite', 'dragonsdenterrain', 'def'],
		['Sableye', 'Sablenite', 'fairytaleterrain', 'spd'],
		['Bronzong', 'Bronzongite', 'fairytaleterrain', 'def'],
	]) {
		it(`${species} starts its newly gained Mega passive once`, () => {
			const p = setup(species, 'No Ability', item, field);
			const before = p.boosts[stat];
			battle.makeChoices('move splash mega', 'move splash');
			assert(p.species.isMega);
			assert.equal(p.boosts[stat], before + 1);
			battle.makeChoices('move splash', 'move splash');
			assert.equal(p.boosts[stat], before + 1);
		});
	}
	for (const suppressed of [false, true]) {
		it(`Gmax Centiskorch gains Heat Coil defenses exactly once${suppressed ? ' after clearing Gastro Acid' : ''}`, () => {
			const p = setup('Centiskorch', 'Coil Up');
			if (suppressed) assert(p.addVolatile('gastroacid', battle.p2.active[0]));
			battle.makeChoices('move splash dynamax', 'move splash');
			assert.equal(p.species.name, 'Centiskorch-Gmax');
			assert.equal(p.ability, 'heatcoil');
			assert.equal(p.boosts.def, 1);
			assert.equal(p.boosts.spd, 1);
			assert(!p.volatiles.gastroacid);
			battle.makeChoices('move splash', 'move splash');
			assert.equal(p.boosts.def, 1);
			assert.equal(p.boosts.spd, 1);
		});
	}
	it('Gmax Heat Coil still respects Neutralizing Gas', () => {
		const p = setup('Centiskorch', 'Coil Up', '', 'dragonsdenterrain', 'Neutralizing Gas');
		battle.makeChoices('move splash dynamax', 'move splash');
		assert.equal(p.species.name, 'Centiskorch-Gmax');
		assert.equal(p.boosts.def, 0);
		assert.equal(p.boosts.spd, 0);
	});
	it('Gmax Heat Coil gains no field defenses in Cave', () => {
		const p = setup('Centiskorch', 'Coil Up', '', 'caveterrain');
		battle.makeChoices('move splash dynamax', 'move splash');
		assert.equal(p.boosts.def, 0);
		assert.equal(p.boosts.spd, 0);
	});
});
