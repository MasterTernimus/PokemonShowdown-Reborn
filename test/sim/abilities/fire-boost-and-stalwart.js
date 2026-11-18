'use strict';
const assert = require('node:assert/strict');
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

describe('Fire Boost and Stalwart', () => {
	let battle;
	afterEach(() => battle?.destroy());

	function start(species, ability, item = '') {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species, ability, item, moves: ['splash', 'tackle', 'growl', 'tailwhip'] },
			{ species: 'Blissey', moves: ['splash'] },
		], [{ species: 'Mew', ability: 'No Ability', moves: ['ember', 'substitute', 'splash'] }]]);
		battle.makeChoices('team 12', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}

	it('carries absorbed Fire power through Mega Evolution until switching', () => {
		const [p, foe] = start('Houndoom', 'Agony Flame', 'Houndoominite');
		battle.makeChoices('move splash', 'move ember');
		assert(p.volatiles.flashfire);
		battle.makeChoices('move splash mega', 'move splash');
		assert.equal(p.species.id, 'houndoommega');
		assert(!p.hasAbility('flashfire'));
		assert(p.volatiles.flashfire);
		for (const [event, move] of [['ModifyAtk', 'firepunch'], ['ModifySpA', 'ember']]) {
			assert.equal(battle.runEvent(event, p, foe, Dex.getActiveMove(move), 100), 150);
		}
		assert(!battle.log.some(line => line.includes('|-end|') && line.includes('Flash Fire')));
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		assert(!p.volatiles.flashfire);
		assert.equal(battle.runEvent('ModifySpA', p, foe, Dex.getActiveMove('ember'), 100), 100);
	});

	for (const species of [
		'Ninetales', 'Arcanine', 'Arcanine-Hisui', 'Rapidash', 'Houndoom', 'Chandelure',
		'Heatmor', 'Coalossal', 'Coalossal-Gmax', 'Armarouge', 'Ceruledge',
	]) {
		it(species + ' absorbs Fire through its passive and only gains one Fire Boost', () => {
			const [holder, foe] = start(species, Dex.species.get(species).abilities[0]);
			const hp = holder.hp;
			assert(holder.hasAbilityOrPassive('flashfire'));
			battle.actions.useMove('ember', foe, { target: holder });
			battle.actions.useMove('ember', foe, { target: holder });
			assert.equal(holder.hp, hp);
			assert(holder.volatiles.flashfire);
			assert.equal(battle.runEvent('ModifySpA', holder, foe, Dex.getActiveMove('ember'), 100), 150);
			assert.equal(battle.log.filter(line => line.includes('|-start|') && line.includes('ability: Flash Fire')).length, 1);
		});
	}

	it('stacks Chandelure’s Soul Siphon with selectable Soul Pyre on a hit through Substitute', () => {
		const [holder, foe] = start('Chandelure', 'Soul Pyre');
		holder.hp = 1;
		foe.addVolatile('substitute');
		const hp = foe.hp, subHP = foe.volatiles.substitute.hp;
		battle.actions.useMove('ember', holder, { target: foe });
		assert(foe.hp < hp && holder.hp > 1);
		assert.equal(foe.volatiles.substitute.hp, subHP);
		assert(foe.volatiles.soulsiphonblock);
	});

	it('expires a field-only charge when Infernal Eclipse ends after Mega Evolution', () => {
		const [p] = start('Houndoom', 'Agony Flame', 'Houndoominite');
		battle.field.changeTerrain('infernaleclipseterrain', p);
		assert(p.volatiles.flashfire.infernalOnly);
		battle.makeChoices('move splash mega', 'move splash');
		assert.equal(p.species.id, 'houndoommega');
		assert(p.volatiles.flashfire);
		battle.field.changeTerrain('rifteclipseterrain', p);
		assert(!p.volatiles.flashfire);
	});

	for (const [species, ability] of [['Duraludon', 'Stalwart'], ['Mew', 'Siege Launcher']]) {
		it(ability + ' bypasses Substitute for damage and status moves', () => {
			const [p, foe] = start(species, ability);
			battle.makeChoices('move splash', 'move substitute');
			const hp = foe.hp, subHP = foe.volatiles.substitute.hp;
			battle.makeChoices('move tackle', 'move splash');
			assert(foe.hp < hp);
			assert.equal(foe.volatiles.substitute.hp, subHP);
			battle.makeChoices('move tailwhip', 'move splash');
			assert.equal(foe.boosts.def, -1);
			assert(!Dex.moves.get('tackle').flags.bypasssub);
			p.setAbility('No Ability');
			battle.makeChoices('move tailwhip', 'move splash');
			assert.equal(foe.boosts.def, -1);
		});
	}
});
