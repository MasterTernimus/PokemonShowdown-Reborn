'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
const expected = {
	parasectrejuv: 'mycelialbond', poliwrathrejuv: 'innerfocus', politoedrejuv: 'royalremedy',
	donphanrejuv: 'heatproof', breloomrejuv: 'owntempo', bronzongrejuv: 'clearbody',
	drapionrejuv: 'stickyhold', musharnarejuv: 'synchronize', unfezantrejuv: 'rivalry',
	sigilyphrejuv: 'frisk', galvantularejuv: 'compoundeyes', druddigonrejuv: 'raindish',
	turtonatorrejuv: 'oblivious', veluzarejuv: 'unnerve',
};
describe('Approved Rejuv passives', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(id = 'politoedrejuv', mode = 'singles', selected) {
		const species = Dex.species.get(id);
		const mon = (species = 'Mew', ability = 'No Ability') => ({species, ability, moves: ['splash', 'tackle', 'toxic', 'protect']});
		const teams = [[mon(species.baseSpecies, selected || species.requiredAbility || (id === 'bronzongrejuv' ? 'Reflector' : species.abilities[0])), mon(), mon()], [mon(), mon(), mon()]];
		if (mode === 'freeforall') teams.push([mon()], [mon()]);
		battle = common.createBattle({gameType: mode}, teams);
		const p = battle.p1.active[0], q = battle.p2.active[0];
		for (const side of battle.sides) for (const pokemon of side.pokemon) pokemon.hp = pokemon.maxhp = pokemon.baseMaxhp = 1000;
		return [p, q];
	}
	it('covers every Rejuv form and leaves ordinary forms unchanged', () => {
		assert.deepEqual(Dex.species.all().filter(s => s.id.endsWith('rejuv')).map(s => s.id).sort(), Object.keys(expected).sort());
		for (const [id, passive] of Object.entries(expected)) assert.deepEqual(Dex.species.get(id).passives, [passive], id);
		for (const [id, passive] of Object.entries({parasect: 'mycelialbond', poliwrath: 'tirelessmuscle', politoed: 'soundproof', donphan: 'battlearmor', breloom: 'effectspore', bronzong: 'clearbody', drapion: 'keeneye', musharna: 'owntempo', unfezant: 'rivalry', sigilyph: 'anticipation', galvantula: 'compoundeyes', druddigon: 'roughskin', turtonator: 'aftermath', veluza: 'keeneye'})) {
			assert.deepEqual(Dex.species.get(id).passives, [passive], id);
		}
	});
	for (const [id, passive] of Object.entries(expected)) it(`${id} gains ${passive} through its real entry transformation`, () => {
		const [p] = setup(id);
		assert.equal(p.species.id, id); assert.deepEqual(p.getPassives(), [passive]);
		assert(p.hasAbilityOrPassive(passive));
	});
	it('Royal Remedy cures and heals 1/8 on an actual statused switch, with no heal when healthy', () => {
		const [p, q] = setup(); p.hp = 500; p.setStatus('psn', q);
		assert(p.hasAbilityOrPassive('naturalcure')); assert(p.hasAbilityOrPassive('healer'));
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(p.status, ''); assert.equal(p.hp, 625);
		battle.makeChoices('switch 2', 'move splash');
		p.hp = 500;
		battle.makeChoices('switch 2', 'move splash'); assert.equal(p.hp, 500);
	});
	it('Royal Remedy heals no more than once when selected Natural Cure overlaps', () => {
		const [p, q] = setup(); p.setAbility('Natural Cure'); p.hp = 500; p.setStatus('psn', q);
		battle.runEvent('SwitchOut', p); assert.equal(p.status, ''); assert.equal(p.hp, 625);
	});
	it('Royal Remedy rolls Healer once for an adjacent ally, never for enemies', () => {
		const [p, q] = setup('politoedrejuv', 'doubles'); const ally = battle.p1.active[1];
		ally.setStatus('psn', q); q.setStatus('psn', p);
		let rolls = 0; battle.randomChance = (n, d) => { assert.equal(n, 3); assert.equal(d, 10); rolls++; return true; };
		battle.runEvent('Residual', p);
		assert.equal(rolls, 1); assert.equal(ally.status, ''); assert.equal(q.status, 'psn');
	});
	it('Royal Remedy retains the 30% chance and does not cure on a failed roll', () => {
		const [p, q] = setup('politoedrejuv', 'doubles'); const ally = battle.p1.active[1];
		ally.setStatus('psn', q); battle.randomChance = () => false;
		battle.runEvent('Residual', p); assert.equal(ally.status, 'psn');
	});
	it('Royal Remedy does not treat FFA opponents as allies', () => {
		const [p] = setup('politoedrejuv', 'freeforall');
		const foes = battle.getAllActive().filter(q => q !== p); for (const q of foes) q.setStatus('psn', p);
		let rolls = 0; battle.randomChance = () => { rolls++; return true; };
		battle.runEvent('Residual', p); assert.equal(rolls, 0); assert(foes.every(q => q.status === 'psn'));
	});
	it('Bewitched Woods cures the holder without granting the switch-out heal', () => {
		const [p, q] = setup(); p.hp = 500; p.setStatus('psn', q);
		battle.field.setTerrain('bewitchedwoodsterrain', p);
		battle.runEvent('Residual', p); assert.equal(p.status, ''); assert.equal(p.hp, 500);
	});
	it('Frisk reveals a foe item once when Sigilyph changes form', () => {
		const [p, q] = setup('sigilyphrejuv'); q.setItem('leftovers');
		battle.makeChoices('switch 2', 'move splash');
		const before = battle.log.length;
		battle.makeChoices('switch 2', 'move splash');
		const reveals = battle.log.slice(before).filter(l => l.startsWith('|-item|') && /Leftovers/.test(l));
		assert.equal(reveals.length, 1); assert.equal(p.species.id, 'sigilyphrejuv');
	});
	it('Rain Dish offsets half of Aevian Bolt’s rain cost', () => {
		const [p] = setup('druddigonrejuv'); p.hp = 500;
		battle.field.setWeather('raindance', p); battle.makeChoices('move splash', 'move splash');
		assert.equal(p.hp, 437);
	});
	it('loses the Rejuv passive on suppression and regains it on a fresh entry', () => {
		const [p, q] = setup();
		p.addVolatile('gastroacid', q); battle.runEvent('Update');
		assert.equal(p.species.id, 'politoed'); assert.deepEqual(p.getPassives(), ['soundproof']);
		assert(!p.hasAbilityOrPassive('naturalcure'));
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(p.species.id, 'politoedrejuv'); assert(p.hasAbilityOrPassive('naturalcure'));
	});
	it('Own Tempo prevents confusion on Breloom-Rejuv', () => {
		const [p, q] = setup('breloomrejuv');
		assert(!p.addVolatile('confusion', q, battle.dex.moves.get('confuseray')));
		assert(!p.volatiles.confusion);
	});
	it('Heatproof halves incoming Fire damage on Donphan-Rejuv', () => {
		const [p, q] = setup('donphanrejuv');
		const move = battle.dex.getActiveMove('flamethrower');
		assert.equal(battle.runEvent('ModifySpA', q, p, move, 100), 50);
	});
});
