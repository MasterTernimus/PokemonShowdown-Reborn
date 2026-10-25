'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
const {AbilityComponents} = require('../../../dist/data/ability-components');
const {SpeciesPassives} = require('../../../dist/data/species-passives');
let battle;
function start(ability, species = 'Mew', doubles = false) {
	const mon = (s = 'Mew', a = 'No Ability') => ({species: s, ability: a, moves: ['splash', 'tackle', 'dragondarts', 'swordsdance']});
	battle = common.createBattle({formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame'},
		[[mon(species, ability), mon()], [mon(), mon()]]);
	battle.makeChoices('team 12', 'team 12');
	battle.randomizer = n => n;
	battle.randomChance = (n, d) => n >= d;
	return [battle.p1.active[0], battle.p2.active[0]];
}
function power(p, q, move = 'dragondarts', bp = 60) {
	return battle.runEvent('BasePower', p, q, Dex.getActiveMove(move), bp);
}
describe('Approved Darts, Drive and Mamoswine packages', () => {
	afterEach(() => {battle?.destroy(); battle = null;});
	it('sets 60 power per dart and applies Technician exactly once', () => {
		const [p, q] = start('Dreepy Vanguard');
		assert.equal(Dex.moves.get('dragondarts').basePower, 60);
		assert.equal(power(p, q), 90);
		assert.equal(power(p, q, 'tackle', 61), 61);
		p.addVolatile('gastroacid', q);
		assert.equal(power(p, q), 60);
	});
	it('keeps the two darts split across the opposing active targets', () => {
		const [p, q] = start('Dreepy Vanguard', 'Mew', true), ally = battle.p2.active[1];
		for (const target of [q, ally]) target.hp = target.maxhp = target.baseMaxhp = 4000;
		battle.actions.useMove('dragondarts', p, {target: q});
		assert(q.hp < q.maxhp && ally.hp < ally.maxhp);
		assert.equal(q.maxhp - q.hp, ally.maxhp - ally.hp);
	});
	it('does not double Technician when the same primitive is also a passive', () => {
		const [p, q] = start('Dreepy Vanguard');
		p.getPassives = () => ['technician'];
		assert.equal(power(p, q), 90);
	});
	it('replaces the Drive packages rather than keeping removed components', () => {
		assert.deepEqual(AbilityComponents.duskdrive, ['opportunist', 'ultraego']);
		assert.deepEqual(AbilityComponents.twilightinstinct, ['ultrainstinct', 'battlefervor']);
		assert(!Dex.abilities.get('duskdrive').onModifyCritRatio);
		assert(Dex.abilities.get('duskdrive').desc.includes('Ultra Ego'));
	});
	it('Dusk Drive retains native Ultra Ego hit retaliation once', () => {
		const [p, q] = start('Dusk Drive');
		battle.actions.useMove('tackle', q, {target: p});
		assert.equal(p.boosts.atk, 1);
		assert.equal(p.boosts.spa, 1);
		p.addVolatile('gastroacid', q);
		p.boosts.atk = p.boosts.spa = 0;
		battle.actions.useMove('tackle', q, {target: p});
		assert.equal(p.boosts.atk, 0);
	});
	it('Twilight Instinct retains both timing power modifiers once', () => {
		const [p, q] = start('Twilight Instinct');
		p.storedStats.spe = 500; q.storedStats.spe = 100;
		battle.queue.insertChoice({choice: 'move', pokemon: q, moveid: 'splash'});
		assert.equal(power(p, q, 'tackle', 100), 156);
	});
	it('uses only the final Mamoswine slot layout and passive', () => {
		assert.deepEqual(Dex.species.get('mamoswine').abilities, {0: 'Forsaken Sleeper', 1: 'Old North', H: 'Glacial Prime'});
		assert.deepEqual(SpeciesPassives.mamoswine, ['coldexpertise']);
		assert.deepEqual(AbilityComponents.forsakensleeper, ['comatose', 'soundproof', 'rattled']);
		assert.deepEqual(AbilityComponents.coldexpertise, ['oblivious', 'thickfat']);
		assert.deepEqual(AbilityComponents.oldnorth, ['icebody', 'icescales', 'technician']);
		assert.deepEqual(AbilityComponents.glacialprime, ['slushrush', 'refrigerate']);
		assert(!Object.values(Dex.species.get('piloswine').abilities).includes('Old North'));
	});
	it('Forsaken Sleeper blocks status and sound while Cold Expertise blocks Taunt', () => {
		const [p, q] = start('Forsaken Sleeper', 'Mamoswine');
		assert.equal(p.trySetStatus('brn', q), false);
		const before = p.hp;
		battle.actions.useMove('boomburst', q, {target: p});
		assert.equal(p.hp, before);
		battle.actions.useMove('taunt', q, {target: p});
		assert(!p.volatiles.taunt);
	});
	it('Old North supplies Technician without adding Intimidate', () => {
		const [p, q] = start('Old North', 'Mamoswine');
		assert.equal(q.boosts.atk, 0);
		assert.equal(power(p, q), 90);
	});
	it('Glacial Prime supplies cold-field Speed and converts eligible Normal moves', () => {
		const [p, q] = start('Glacial Prime', 'Mamoswine');
		const ordinary = p.getStat('spe');
		battle.field.setTerrain('icyterrain', p);
		assert.equal(p.getStat('spe'), ordinary * 2);
		const move = Dex.getActiveMove('tackle');
		battle.runEvent('ModifyType', p, q, move, move);
		assert.equal(move.type, 'Ice');
		assert.equal(power(p, q, 'tackle', 100), 100);
	});
});
