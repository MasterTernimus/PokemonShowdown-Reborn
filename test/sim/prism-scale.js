'use strict';

const assert = require('../assert');
const common = require('../common');

describe('Prism Scale', function () {
	let battle;
	afterEach(() => battle?.destroy());

	function setup(foeAbility = 'blaze', foeMoves = ['splash']) {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Milotic-Terajuma', ability: 'prismscale', moves: ['splash', 'doublehit']},
		], [
			{species: 'Arcanine', ability: foeAbility, moves: foeMoves},
		]]);
		battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}

	it('retains Marvel Scale Defense and gains Swift Swim Speed', function () {
		const [milotic, foe] = setup();
		const defense = milotic.getStat('def');
		const speed = milotic.getStat('spe');
		milotic.setStatus('par', foe);
		assert(milotic.getStat('def') >= Math.floor(defense * 1.49));
		milotic.clearStatus();
		battle.field.setWeather('raindance', milotic);
		assert.equal(milotic.getStat('spe'), speed * 2);
		battle.field.clearWeather();
		battle.field.setTerrain('watersurfaceterrain', milotic);
		assert.equal(milotic.getStat('spe'), speed * 2);
	});

	it('gains Oblivious protection from Intimidate and Taunt', function () {
		const [milotic] = setup('intimidate', ['taunt']);
		assert.equal(milotic.boosts.atk, 0);
		battle.makeChoices('move splash', 'move taunt');
		assert.false(!!milotic.volatiles.taunt);
	});

	it('no longer has Dragonize move hooks', function () {
		const ability = setup()[0].getAbility();
		assert.equal(ability.onModifyType, undefined);
		assert.equal(ability.onModifySTAB, undefined);
		assert.equal(ability.onBasePower, undefined);
	});
});
