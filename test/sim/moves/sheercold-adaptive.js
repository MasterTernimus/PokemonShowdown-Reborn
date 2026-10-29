'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

let battle;
function setup(species = 'Weavile') {
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
		{species, ability: 'No Ability', moves: ['sheercold', 'splash']},
	], [
		{species: 'Mew', ability: 'No Ability', moves: ['splash']},
	]]);
	battle.makeChoices('team 1', 'team 1');
	battle.randomizer = n => n;
	const [source, target] = [battle.p1.active[0], battle.p2.active[0]];
	source.hp = source.maxhp = source.baseMaxhp = 1000;
	target.hp = target.maxhp = target.baseMaxhp = 4000;
	return [source, target];
}
function use(source, target, properties = {}) {
	const move = Object.assign(Dex.getActiveMove('sheercold'), {accuracy: true, willCrit: false}, properties);
	battle.actions.useMove(move, source, {target});
	return battle.activeMove;
}

describe('Adaptive Sheer Cold', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('preserves the local non-OHKO finisher data and documents its adaptive category', () => {
		const move = Dex.moves.get('sheercold');
		assert.equal(move.type, 'Ice');
		assert.equal(move.basePower, 130);
		assert.equal(move.accuracy, 90);
		assert.equal(move.pp, 5);
		assert.equal(move.category, 'Special');
		assert(!move.ohko);
		assert.deepEqual(move.secondary, {chance: 30, status: 'frz'});
		assert(move.shortDesc.includes('Adaptive'));
		assert(move.desc.includes('Special on ties'));
		assert(move.desc.includes('1/4 max HP'));
	});
	it('uses Physical for Weavile and still deals normal damage with the quarter-HP cost', () => {
		const [source, target] = setup();
		const move = use(source, target);
		assert.equal(move.category, 'Physical');
		assert(target.hp > 0 && target.hp < target.maxhp);
		assert.equal(source.hp, 750);
		assert(!battle.log.some(line => line.includes('|-ohko|')));
	});
	it('uses Special for a user with higher Special Attack', () => {
		const [source, target] = setup('Cryogonal');
		assert(source.getStat('spa', false, true) > source.getStat('atk', false, true));
		assert.equal(use(source, target).category, 'Special');
	});
	it('uses Special on ties, matching the existing adaptive convention', () => {
		const [source, target] = setup('Mew');
		assert.equal(source.getStat('atk', false, true), source.getStat('spa', false, true));
		assert.equal(use(source, target).category, 'Special');
	});
	it('rechecks current stat stages for each use', () => {
		const [source, target] = setup();
		source.boosts.spa = 6;
		assert.equal(use(source, target).category, 'Special');
		source.boosts.atk = 6;
		assert.equal(use(source, target).category, 'Physical');
	});
	it('does not let Choice Specs, burn or opposing defenses choose the category', () => {
		const [source, target] = setup('Mew');
		source.storedStats.atk = 200;
		source.storedStats.spa = 190;
		source.setItem('Choice Specs');
		source.setStatus('brn', target);
		target.boosts.def = 6;
		target.boosts.spd = -6;
		assert.equal(use(source, target).category, 'Physical');
	});
	it('keeps frostbite and the direct opposing KO exemption', () => {
		const [source, target] = setup();
		use(source, target, {damage: 10, secondary: {chance: 100, status: 'frz'}});
		assert.equal(target.status, 'frz');
		source.hp = source.maxhp;
		target.hp = 5;
		use(source, target, {damage: 10});
		assert.equal(target.hp, 0);
		assert.equal(source.hp, source.maxhp);
	});
});
