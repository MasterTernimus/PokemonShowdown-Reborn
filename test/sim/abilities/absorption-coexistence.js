'use strict';
const assert = require('assert').strict;
const {Battle} = require('../../../dist/sim');
const {ThematicPassiveIds} = require('../../../dist/data/species-passives');
function setup(selected, passives, options = {}) {
	const battle = new Battle({formatid: options.format || 'gen9nofieldsinglesgame', seed: [1, 2, 3, 4], p1: {team: [
		{species: 'Mew', ability: options.sourceAbility || 'No Ability', moves: ['waterpulse', 'thunderbolt', 'watershuriken', 'surf', 'discharge']},
		{species: 'Mew', ability: 'No Ability', moves: ['splash']},
	]}, p2: {team: [
		{species: options.species || 'Mew', ability: selected, moves: ['splash']},
		{species: 'Mew', ability: 'No Ability', moves: ['splash']},
	]}});
	if (battle.requestState === 'teampreview') battle.makeChoices('team 12', 'team 12');
	const target = battle.p2.active[0], source = battle.p1.active[0];
	const added = (passives || []).filter(id => !ThematicPassiveIds.has(id));
	for (const id of added) ThematicPassiveIds.add(id);
	if (passives) target.getPassives = () => passives;
	target.sethp(Math.floor(target.maxhp / 2));
	return {battle, target, source, cleanup() {battle.destroy(); for (const id of added) ThematicPassiveIds.delete(id);}};
}
const pairs = [
	['Storm Drain', ['waterabsorb'], 'waterpulse'], ['Water Absorb', ['stormdrain'], 'waterpulse'],
	['Lightning Rod', ['voltabsorb'], 'thunderbolt'], ['Volt Absorb', ['lightningrod'], 'thunderbolt'],
	['Storm Drain', ['cactuschorus'], 'waterpulse'], ['Reservoir', ['stormdrain'], 'waterpulse'],
	['Storm Fright', ['voltabsorb'], 'thunderbolt'], ['Abyss Lure', ['lightningrod'], 'thunderbolt'],
	['No Ability', ['voltabsorb', 'lightningrod'], 'thunderbolt'],
	['Lightning Rod', ['abysslure'], 'thunderbolt'], ['Storm Drain', ['abysslure'], 'waterpulse'],
];
describe('Coexisting absorption effects', () => {
	for (const [selected, move, heal, boost] of [['Water Absorb', 'waterpulse', true, false], ['Storm Drain', 'waterpulse', false, true], ['Volt Absorb', 'thunderbolt', true, false], ['Lightning Rod', 'thunderbolt', false, true], ['Abyss Lure', 'waterpulse', true, true], ['Abyss Lure', 'thunderbolt', true, true]]) it(`preserves standalone ${selected}/${move}`, () => {
		const {battle, target, source, cleanup} = setup(selected, []);
		try {const hp = target.hp; battle.actions.runMove(move, source, source.getLocOf(target)); assert.equal(target.hp, hp + (heal ? Math.floor(target.baseMaxhp / 4) : 0)); assert.equal(target.boosts.spa, boost ? 1 : 0);} finally {cleanup();}
	});
	for (const [species, selected, move] of [['Vaporeon', 'Storm Drain', 'waterpulse'], ['Jolteon', 'Lightning Rod', 'thunderbolt'], ['Maractus', 'Storm Drain', 'waterpulse']]) it(`uses ${species}'s actual registered passive`, () => {
		const {battle, target, source, cleanup} = setup(selected, null, {species});
		try {
			const hp = target.hp;
			battle.actions.runMove(move, source, source.getLocOf(target));
			assert.equal(target.hp, hp + Math.floor(target.baseMaxhp / 4)); assert.equal(target.boosts.spa, 1);
		} finally {cleanup();}
	});
	for (const [selected, passives, move] of pairs) it(`${selected}/${passives} heals and boosts once`, () => {
		const {battle, target, source, cleanup} = setup(selected, passives);
		try {
			const hp = target.hp;
			let heals = 0;
			const originalHeal = target.heal;
			target.heal = function (...args) {heals++; return originalHeal.apply(this, args);};
			battle.actions.runMove(move, source, source.getLocOf(target));
			assert.equal(target.hp, hp + Math.floor(target.baseMaxhp / 4));
			assert.equal(target.boosts.spa, 1); assert.equal(target.boosts.atk, 1);
			assert.equal(heals, 1);
		} finally { cleanup(); }
	});
	for (const [selected, passives, move] of pairs.slice(0, 4)) {
		for (const [fullHP, maxStages] of [[true, false], [false, true], [true, true]]) it(`${selected} absorbs at fullHP=${fullHP}/maxStages=${maxStages}`, () => {
			const {battle, target, source, cleanup} = setup(selected, passives);
			try {
				if (fullHP) target.sethp(target.maxhp);
				if (maxStages) target.boosts.atk = target.boosts.spa = 6;
				const hp = target.hp;
				battle.actions.runMove(move, source, source.getLocOf(target));
				assert.equal(target.hp, Math.min(target.maxhp, hp + Math.floor(target.baseMaxhp / 4)));
				assert.equal(target.boosts.spa, maxStages ? 6 : 1);
			} finally { cleanup(); }
		});
		it(`${selected} respects Mold Breaker`, () => {
			const {battle, target, source, cleanup} = setup(selected, passives, {sourceAbility: 'Mold Breaker'});
			try {const hp = target.hp; battle.actions.runMove(move, source, source.getLocOf(target)); assert(target.hp < hp); assert.equal(target.boosts.spa, 0);} finally {cleanup();}
		});
		it(`${selected} suppression disables only the selected effect`, () => {
			const {battle, target, source, cleanup} = setup(selected, passives);
			try {
				target.addVolatile('gastroacid'); const hp = target.hp;
				battle.actions.runMove(move, source, source.getLocOf(target));
				const healPassive = passives.some(id => ['waterabsorb', 'voltabsorb'].includes(id));
				assert.equal(target.hp, hp + (healPassive ? Math.floor(target.baseMaxhp / 4) : 0));
				assert.equal(target.boosts.spa, healPassive ? 0 : 1);
			} finally {cleanup();}
		});
	}
	it('absorbs native multihit only once', () => {
		const {battle, target, source, cleanup} = setup('Storm Drain', ['waterabsorb']);
		try {const hp = target.hp; battle.actions.runMove('watershuriken', source, source.getLocOf(target)); assert.equal(target.hp, hp + Math.floor(target.baseMaxhp / 4)); assert.equal(target.boosts.spa, 1);} finally {cleanup();}
	});
	for (const [selected, passive, move] of [['Storm Drain', 'waterabsorb', 'surf'], ['Lightning Rod', 'voltabsorb', 'discharge']]) it(`spread ${move} only rewards the actual absorber`, () => {
		const {battle, target, source, cleanup} = setup(selected, [passive], {format: 'gen9nofielddoublesbattle'});
		try {
			const other = battle.p2.active[1], hp = target.hp, otherHP = other.hp;
			battle.actions.runMove(move, source, source.getLocOf(target));
			assert.equal(target.hp, hp + Math.floor(target.baseMaxhp / 4)); assert.equal(target.boosts.spa, 1);
			assert(other.hp < otherHP); assert.equal(other.boosts.spa, 0);
		} finally {cleanup();}
	});
	it('redirection retains target ownership', () => {
		const {battle, target, source, cleanup} = setup('Storm Drain', ['waterabsorb'], {format: 'gen9nofielddoublesbattle'});
		try {
			const other = battle.p2.active[1], hp = target.hp;
			battle.actions.runMove('waterpulse', source, source.getLocOf(other));
			assert.equal(other.hp, other.maxhp); assert.equal(target.hp, hp + Math.floor(target.baseMaxhp / 4)); assert.equal(target.boosts.spa, 1);
		} finally {cleanup();}
	});
	it('duplicate heal providers do not double healing', () => {
		const {battle, target, source, cleanup} = setup('Water Absorb', ['waterabsorb', 'stormdrain']);
		try {const hp = target.hp; battle.actions.runMove('waterpulse', source, source.getLocOf(target)); assert.equal(target.hp, hp + Math.floor(target.baseMaxhp / 4)); assert.equal(target.boosts.spa, 1);} finally {cleanup();}
	});
	it('duplicate boost providers do not double the boost', () => {
		const {battle, target, source, cleanup} = setup('Lightning Rod', ['voltabsorb', 'lightningrod']);
		try {battle.actions.runMove('thunderbolt', source, source.getLocOf(target)); assert.equal(target.boosts.spa, 1); assert.equal(target.boosts.atk, 1);} finally {cleanup();}
	});
	it('a separate action can trigger again without stale deduplication', () => {
		const {battle, target, source, cleanup} = setup('Storm Drain', ['waterabsorb']);
		try {
			battle.actions.runMove('waterpulse', source, source.getLocOf(target));
			battle.actions.runMove('waterpulse', source, source.getLocOf(target));
			assert.equal(target.boosts.spa, 2);
		} finally {cleanup();}
	});
});
